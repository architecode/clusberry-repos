import { IBerryDescription } from "./IBerryDescription";
import { ICluster } from "./ICluster";
import { ISkill } from "./ISkill";

export interface IClusberry {
  skill: (skill: ISkill) => IClusberry;
  cluster: (cluster: ICluster) => () => IBerryDescription;
}
