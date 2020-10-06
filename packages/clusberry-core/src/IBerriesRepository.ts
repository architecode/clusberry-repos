export interface IBerriesRepository {
  register: (berry: {
    sessionID: string;
    name: string;
    instance: string;
    skillnames: string[];
  }) => Promise<any>;
  activateTask: (props: {
    sessionID: string;
    taskID: string;
  }) => Promise<void>;
  extendTTL: (props: {
    sessionID: string;
    ttl?: number;
  }) => Promise<number>;
}
