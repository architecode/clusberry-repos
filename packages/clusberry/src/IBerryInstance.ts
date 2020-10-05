import { ICluster, ISkill } from "clusberry-core";

export interface IBerryInstance {
  sessionID: string;
  describe: () => {
    sessionID: string;
    name: string;
    instance: string;
    timespace: number;
    skillnames: string[];
    status: "initial" | "active" | "idle";
    idleLevel: number;
  };
  skill: (skill: ISkill) => void;
  join: (cluster: ICluster) => void;
}
