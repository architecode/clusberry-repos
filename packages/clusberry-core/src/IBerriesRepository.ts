export interface IBerriesRepository {
  register: (berry: {
    sessionID: string;
    name: string;
    instance: string;
    skillnames: string[];
  }) => Promise<void>;
  activateTask: (props: {
    sessionID: string;
    taskID: string;
  }) => Promise<void>;
}
