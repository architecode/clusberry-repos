import { IContext } from "./IContext";

export interface ISkill {
  name: string;
  task: (data: { [key: string]: any; }, context: IContext) => Promise<any>;
  asyncEffect?: (result: any, context: IContext) => Promise<void>;
  isCompleted: (context: IContext) => Promise<boolean>;
}
