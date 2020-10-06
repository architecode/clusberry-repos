import { Db, Collection } from "mongodb";
import { IBerriesRepository } from "clusberry-core";

export const BerriesConnect = {
  connect: (configs: {
    DB: Db;
  }): IBerriesRepository => {
    const TTL = 60 * 60 * 1000;
    const { DB } = configs;

    const getTTL = (ttl?: number) => new Date(Date.now() + (ttl || TTL));

    let _Collection: Collection;

    const resolveCollection = async () => {
      if (!_Collection) {
        _Collection = DB.collection("Clusberries");
        await _Collection.createIndexes([{
          name: "__expires_at_",
          key: { "expiresAt": 1 },
          expireAfterSeconds: 0,
        }]);
      }

      return _Collection;
    }

    return {
      register: async (berry) => {
        const expiresAt = getTTL();
        const collection = await resolveCollection();
        const item = {
          _id: berry.sessionID,
          instance: berry.instance,
          name: berry.name,
          sessionID: berry.sessionID,
          skillnames: berry.skillnames,
          activatedTaskID: null,
          expiresAt,
        };

        await collection.insertOne(item);

        return item;
      },
      activateTask: async (props) => {
        const collection = await resolveCollection();
        const update = {
          $set: {
            activatedTaskID: props.taskID,
          },
        };

        await collection.findOneAndUpdate({
          _id: props.sessionID,
        }, update);
      },
      extendTTL: async (props) => {
        const collection = await resolveCollection();
        const expiresAt = getTTL(props.ttl);
        const update = {
          $set: {
            expiresAt,
          },
        };

        await collection.findOneAndUpdate({
          _id: props.sessionID,
        }, update);

        return expiresAt.getTime();
      },
    };
  },
};
