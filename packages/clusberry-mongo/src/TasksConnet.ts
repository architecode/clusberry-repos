import { Db, Collection } from "mongodb";
import {
  ITask,
  ITasksRepository,
} from "clusberry-core";
import * as UUID from "uuid";

export const TasksConnect = {
  connect: (configs: {
    DB: Db;
  }): ITasksRepository => {
    const { DB } = configs;
    let _Collection: Collection;

    const resolveCollection = async () => {
      if (!_Collection) {
        _Collection = DB.collection("Clustasks");
        await _Collection.createIndexes([{
          name: "__skillname_",
          key: { skillname: 1 },
        }, {
          name: "__status_",
          key: { status: 1 },
        }]);
      }

      return _Collection;
    };

    const Repository: ITasksRepository = {
      defineTask: async (task) => {
        const taskID = UUID.v4();
        const Task: ITask = {
          _id: taskID,
          taskID,
          skillname: task.skillname,
          berriesLimit: task.berriesLimit,
          status: task.status || "ready",
          looptime: 0,
          berries: {
            sessionIDs: {},
            queue: [],
          },
          data: task.data || {},
        };

        const collection = await resolveCollection();
        await collection.insertOne(Task);
      },
      getTaskByID: async ({ taskID }) => {
        const collection = await resolveCollection();
        const item = await collection.findOne({ _id: taskID });
        if (item) {
          return item;
        } else {
          return undefined;
        }
      },
      getTasksBySkillnames: async ({ skillnames }) => {
        const collection = await resolveCollection();
        const tasks = await collection.find({
          skillname: { $in: skillnames },
          status: { $in: ["ready", "processing"] },
        }).toArray();

        return tasks;
      },
      getData: async (taskID) => {
        const item = await Repository.getTaskByID({ taskID });

        if (item) {
          return item.data;
        } else {
          return {};
        }
      },
      setData: async (taskID, data) => {
        const collection = await resolveCollection();
        await collection.findOneAndUpdate({
          _id: taskID,
        }, {
          $set: {
            data,
          },
        });
      },
      activateLoop: async (taskID, sessionID, putInQueue) => {
        const collection = await resolveCollection();
        const activatedAt = `berries.sessionIDs.${sessionID}.activatedAt`;
        const update: any = {
          $set: {
            status: "processing",
            [activatedAt]: Date.now(),
          },
        };

        if (putInQueue) {
          update.$push = {
            "berries.queue": sessionID,
          };
        }

        await collection.findOneAndUpdate({
          _id: taskID,
        }, update);
      },
      nextLoop: async (taskID, sessionID, looptime) => {
        const collection = await resolveCollection();

        const update = {
          $set: {
            looptime,
          },
          $pop: {
            "berries.queue": -1,
          },
        };

        await collection.findOneAndUpdate({
          _id: taskID,
        }, update);
      },
      waitLoop: async (taskID, sessionID, overcome) => {
        if (overcome) {
          const collection = await resolveCollection();

          const update = {
            $pop: {
              "berries.queue": -1,
            },
          };

          await collection.findOneAndUpdate({
            _id: taskID,
          }, update);
        }
      },
      completeTask: async (taskID) => {
        const collection = await resolveCollection();

        const update = {
          $set: {
            status: "completed",
            "berries.queue": [],
          },
        };

        await collection.findOneAndUpdate({
          _id: taskID,
        }, update);
      },
    };

    return Repository;
  },
};
