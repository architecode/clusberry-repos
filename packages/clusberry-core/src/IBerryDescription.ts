export interface IBerryDescription {
  sessionID: string;
  name: string;
  instance: string;
  timespace: number;
  skillnames: string[];
  status: string;
  idleLevel: number;
  activatedTaskID: string | undefined;
  millisecond: number;
}
