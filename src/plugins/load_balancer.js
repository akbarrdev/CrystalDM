import cluster from "cluster";
import os from "os";
import fastifyPlugin from "fastify-plugin";
import { Utils } from "../library/utils.js";
import cfg from "../../config.json" assert { type: "json" };

const numCPUs = os.cpus().length;

export default fastifyPlugin(async function (fastify, options) {
  if (cfg.system.loadBalancer.enabled) {
    if (cluster.isPrimary) {
      Utils.logs(
        "info",
        `Primary ${process.pid} is running`,
        "Load Balancer Plugin"
      );

      for (let i = 0; i < numCPUs; i++) {
        cluster.fork();
      }

      cluster.on("exit", (worker, code, signal) => {
        Utils.logs(
          "warn",
          `Worker ${worker.process.pid} died`,
          "Load Balancer Plugin"
        );
        cluster.fork();
      });

      fastify.addHook("onClose", (instance, done) => {
        for (const id in cluster.workers) {
          cluster.workers[id].kill();
        }
        done();
      });
    } else {
      Utils.logs(
        "info",
        `Worker ${process.pid} started`,
        "Load Balancer Plugin"
      );

      fastify.addHook("onRequest", (request, reply, done) => {
        if (reply.server.app.closing) {
          reply.code(503).send("Server is shutting down");
        } else {
          done();
        }
      });

      process.on("message", (msg) => {
        if (msg === "shutdown") {
          Utils.logs(
            "info",
            `Worker ${process.pid} shutting down`,
            "Load Balancer Plugin"
          );
          fastify.server.app.closing = true;
          fastify.close(() => {
            process.exit(0);
          });
        }
      });
    }

    fastify.addHook("onClose", (instance, done) => {
      if (cluster.isPrimary) {
        for (const id in cluster.workers) {
          cluster.workers[id].send("shutdown");
        }
      }
      done();
    });

    Utils.logs("info", "Load Balancer is active", "Load Balancer Plugin");
  } else {
    Utils.logs("info", "Load Balancer is disabled", "Load Balancer Plugin");
  }
});
