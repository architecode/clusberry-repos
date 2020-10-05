import { ITask } from "./ITask";

export interface ITasksRepository {
  defineTask: (task: {
    skillname: string;
    berriesLimit: number;
    status?: "ready" | "hold";
    data?: { [key: string]: any; };
  }) => Promise<void>;
  getTaskByID: (props: {
    taskID: string;
  }) => Promise<ITask | undefined>;
  getTasksBySkillnames: (props: {
    skillnames: string[];
  }) => Promise<ITask[]>;
  getData: (taskID: string) => Promise<{ [key: string]: any; }>
  setData: (taskID: string, data: { [key: string]: any; }) => Promise<void>;
  activateLoop: (taskID: string, sessionID: string, putInQueue: boolean) => Promise<void>;
  nextLoop: (taskID: string, sessionID: string, looptime: number) => Promise<void>;
  waitLoop: (taskID: string, sessionID: string, overcome: boolean) => Promise<void>;
  completeTask: (taskID: string) => Promise<void>;
}
