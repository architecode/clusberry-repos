import { IBerryDescription, ICluster, ISkill } from "clusberry-core";

export interface IBerryInstance {
  sessionID: string;
  describe: () => IBerryDescription;
  skill: (skill: ISkill) => void;
  join: (cluster: ICluster) => void;
}
