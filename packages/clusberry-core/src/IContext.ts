export interface IContext {
  sessionID: string;
  taskID: string;
  setData: (data: { [key: string]: any; }) => Promise<void>;
  getData: () => Promise<{ [key: string]: any; }>;
};
