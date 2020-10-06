import {
  IBerriesRepository,
  ITasksRepository,
  ICluster,
} from "clusberry-core";

export const Cluster = {
  create: (Repositories: {
    Berries: IBerriesRepository;
    Tasks: ITasksRepository;
  }): ICluster => ({
    register: async (berry) => {
      // tslint:disable-next-line: no-console
      console.log("CLUSBERRY REGISTER: ", berry.sessionID);
      await Repositories.Berries.register({
        sessionID: berry.sessionID,
        name: berry.name,
        instance: berry.instance,
        skillnames: berry.skillnames,
      });
    },
    activateTask: async (props) =>
      await Repositories.Berries.activateTask(props),
    extendTTL: async (props) =>
      await Repositories.Berries.extendTTL(props),
    defineTask: async (task) =>
      await Repositories.Tasks.defineTask({
        skillname: task.skillname,
        berriesLimit: task.berriesLimit || -1,
        status: task.status,
        data: task.data,
      }),
    getTaskByID: async (props) =>
      await Repositories.Tasks.getTaskByID(props),
    getTasksBySkillnames: async (props) =>
      await Repositories.Tasks.getTasksBySkillnames(props),
    activateLoop: async (taskID, sessionID, isInQueue) =>
      await Repositories.Tasks.activateLoop(taskID, sessionID, isInQueue),
    nextLoop: async (taskID, sessionID, looptime) =>
      await Repositories.Tasks.nextLoop(taskID, sessionID, looptime),
    waitLoop: async (taskID, sessionID, overcome) =>
      await Repositories.Tasks.waitLoop(taskID, sessionID, overcome),
    completeTask: async (taskID) =>
      await Repositories.Tasks.completeTask(taskID),
    resolveContext: ({ sessionID, taskID }) => ({
      getData: async () => await Repositories.Tasks.getData(taskID),
      setData: async (data) => await Repositories.Tasks.setData(taskID, data),
      sessionID,
      taskID,
    }),
  }),
};
