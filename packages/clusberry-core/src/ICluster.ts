import { IContext } from "./IContext";
import { ITask } from "./ITask";

export interface ICluster {
  resolveContext: (props: {
    taskID: string;
    sessionID: string;
  }) => IContext;
  register: (berry: {
    sessionID: string;
    name: string;
    instance: string;
    skillnames: string[];
  }) => Promise<any>;
  activateTask: (props: {
    taskID: string;
    sessionID: string;
  }) => Promise<void>;
  extendTTL: (props: {
    sessionID: string;
    ttl?: number;
  }) => Promise<number>;
  defineTask: (task: {
    skillname: string;
    berriesLimit?: number;
    status?: "ready" | "hold";
    data?: { [key: string]: any; };
  }) => Promise<void>;
  getTaskByID: (props: {
    taskID: string;
  }) => Promise<ITask | undefined>;
  getTasksBySkillnames: (props: {
    skillnames: string[];
  }) => Promise<ITask[]>;
  activateLoop: (taskID: string, sessionID: string, putInQueue: boolean) => Promise<void>;
  nextLoop: (taskID: string, sessionID: string, looptime: number) => Promise<void>;
  waitLoop: (taskID: string, sessionID: string, overcome: boolean) => Promise<void>;
  completeTask: (taskID: string) => Promise<void>;
}
