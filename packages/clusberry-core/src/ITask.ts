export interface ITask {
  _id: string;
  taskID: string;
  skillname: string;
  berriesLimit: number;
  status: "ready" | "processing" | "hold" | "completed";
  looptime: number;
  berries: {
    sessionIDs: {
      [sessionID: string]: {
        activatedAt: number;
      };
    };
    queue: string[];
  };
  data: { [key: string]: any; };
}
