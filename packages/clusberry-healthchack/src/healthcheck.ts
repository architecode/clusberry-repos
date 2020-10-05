import { Clusberry, Cluster } from "clusberry";
import { BerriesConnect, TasksConnect } from "clusberry-mongo";
import { MongoClient } from "mongodb";

const client = new MongoClient("mongodb://localhost:27017");

(async () => {
  await client.connect();
  const DB = client.db("Clustberry");
  const cluster = Cluster.create({
    Berries: BerriesConnect.connect({ DB }),
    Tasks: TasksConnect.connect({ DB }),
  });

  cluster.defineTask({
    skillname: "Healthcheck",
  })

  Clusberry.create()
    .skill({
      name: "Healthcheck",
      task: async () => {
        return new Promise((resolve) => {
          setTimeout(() => resolve(), 4000);
        });
      },
      isCompleted: async () => {
        return false;
      },
    })
    .cluster(cluster);
})();