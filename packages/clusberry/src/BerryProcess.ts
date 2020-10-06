import * as UUID from "uuid";
import * as OS from "os";
import {
  ISkill,
  ITask,
} from "clusberry-core";
import { IBerryInstance } from "./IBerryInstance";

const Status = {
  Initial: "initial",
  Active: "active",
  Idle: "idle",
};

const LOOP_ROUND = 5;

export const BerryProcess = {
  createInstance: (configs: {
    name?: string;
    timespace?: number;
  }): IBerryInstance => {
    const hostname = OS.hostname();

    const Instance = {
      sessionID: UUID.v4(),
      name: configs.name || hostname,
      instance: hostname,
      timespace: configs.timespace || -1,
      status: Status.Initial as "initial" | "active" | "idle",
      idleLevel: 0,
      skillsmap: {} as {
        [skill: string]: ISkill;
      },
      activatedTaskID: undefined as string | undefined,
      millisecond: () => {
        if (Instance.status === "idle") {
          switch (Instance.idleLevel) {
            case 1:
              return 3 * 1000;

            case 2:
              return 5 * 1000;

            case 3:
              return 60 * 1000;

            case 4:
              return 3 * 60 * 1000;

            case 5:
            default:
              return 5 * 60 * 1000;
          }
        } else {
          return Instance.timespace > 0 ? Instance.timespace : 1000;
        }
      },
      activate: (taskID: string) => {
        Instance.status = "active";
        Instance.activatedTaskID = taskID;
        Instance.idleLevel = 0;
        // tslint:disable-next-line: no-console
        console.log(`${new Date()} [CLUSBERRY: ${Instance.sessionID}] - state: activate - Task ID: ${Instance.activatedTaskID}`);
      },
      // tslint:disable-next-line: no-empty
      wait: () => {
        // tslint:disable-next-line: no-console
        console.log(`${new Date()} [CLUSBERRY: ${Instance.sessionID}] - state: await - Task ID: ${Instance.activatedTaskID}`);
      },
      idle: () => {
        Instance.status = "idle";

        if (Instance.idleLevel !== 5) {
          Instance.idleLevel++;
        }

        // tslint:disable-next-line: no-console
        console.log(`${new Date()} [CLUSBERRY: ${Instance.sessionID}] - state: idle - level: ${Instance.idleLevel}`);
      },
    };

    return {
      sessionID: Instance.sessionID,
      describe: () => ({
        sessionID: Instance.sessionID,
        name: Instance.name,
        instance: Instance.instance,
        timespace: Instance.timespace,
        skillnames: Object.keys(Instance.skillsmap),
        status: Instance.status,
        idleLevel: Instance.idleLevel,
        activatedTaskID: Instance.activatedTaskID,
        millisecond: Instance.millisecond(),
      }),
      skill: (skill) => {
        Instance.skillsmap[skill.name] = skill;
      },
      join: (Cluster) => {
        (async () => {
          await Cluster.register({
            sessionID: Instance.sessionID,
            instance: Instance.instance,
            name: Instance.name,
            skillnames: Object.keys(Instance.skillsmap),
          });

          const createProcess = () => async () => {
            try {
              let task: ITask | undefined;

              if (Instance.activatedTaskID) {
                task = await Cluster.getTaskByID({
                  taskID: Instance.activatedTaskID,
                });

                if (task && task.status === "completed") {
                  task = undefined;
                  Instance.activatedTaskID = undefined;
                }
              }

              if (task === undefined) {
                const tasks = await Cluster.getTasksBySkillnames({
                  skillnames: Object.keys(Instance.skillsmap),
                });

                // SELECT TASKS
                if (tasks.length > 0) {
                  task = tasks[0];

                  await Cluster.activateTask({
                    sessionID: Instance.sessionID,
                    taskID: task.taskID,
                  });

                  Instance.activate(task.taskID);
                }
              }

              if (task) {
                const isPrimary = (task.berries.queue.length === 0) || (task.berries.queue[0] === Instance.sessionID);

                if (isPrimary) {
                  Cluster.extendTTL({ sessionID: Instance.sessionID });
                  const initial = Date.now();
                  const putInQueue = task.berries.queue.indexOf(Instance.sessionID) === -1;
                  await Cluster.activateLoop(task.taskID, Instance.sessionID, putInQueue);
                  const Skill = Instance.skillsmap[task.skillname];
                  const context = Cluster.resolveContext({ sessionID: Instance.sessionID, taskID: task.taskID });
                  const result = await Skill.task(task.data, context);
                  const usage = Date.now() - initial;
                  const looptime = usage > task.looptime ? usage : task.looptime;
                  const isCompleted = await Skill.isCompleted(context);

                  if (isCompleted) {
                    await Cluster.completeTask(task.taskID);
                  } else {
                    await Cluster.nextLoop(task.taskID, Instance.sessionID, looptime);
                  }

                  if (Skill.asyncEffect) {
                    await Skill.asyncEffect(result, context);
                  }
                } else {
                  const primaryID = task.berries.queue.length > 0 ? task.berries.queue[0] : undefined;

                  if (primaryID) {
                    const now = Date.now();
                    const range = now - task.berries.sessionIDs[primaryID].activatedAt;
                    const remaining = (task.looptime * LOOP_ROUND) - range;

                    if (remaining < 0) {
                      await Cluster.waitLoop(task.taskID, Instance.sessionID, true);
                    }
                  }

                  Instance.wait();
                }
              } else {
                Instance.idle();
              }

              const nextProcess = createProcess();
              const ms = Instance.millisecond();

              setTimeout(nextProcess, ms);
            } catch (error) {
              // tslint:disable-next-line: no-console
              console.log("CLUSBERRY ERROR: ", error);
            }
          };

          const process = createProcess();

          process();
        })();
      },
    };
  },
};
