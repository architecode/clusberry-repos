import {
  IClusberry,
  ICluster,
  ISkill,
} from "clusberry-core";
import { BerryProcess } from "./BerryProcess";
import { IBerryInstance } from "./IBerryInstance";

export const Clusberry = {
  create: (configs: {
    name?: string;
    timespace?: number;
  } = {}): IClusberry => {
    const Instance: IBerryInstance = BerryProcess.createInstance(configs);

    const clusberry: IClusberry = {
      skill: (skill: ISkill,) => {
        Instance.skill(skill);

        return clusberry;
      },
      cluster: (cluster: ICluster) => {
        Instance.join(cluster);
      },
    };

    return clusberry;
  },
};
