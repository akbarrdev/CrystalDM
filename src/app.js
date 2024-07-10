import fastify from "fastify";
import autoload from "@fastify/autoload";
import httpsRedirect from "fastify-https-redirect";
import fs from "fs";
import path from "path";
import cfg from "../config.json" assert { type: "json" };
import { Utils } from "./library/utils.js";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import rateLimit from "@fastify/rate-limit";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export class App {
  constructor(tcpPort, udpPort) {
    this.tcpPort = tcpPort;
    this.udpPort = udpPort;
    this.fastify = fastify({
      logger: cfg.system.fastifyLogger,
      trustProxy: true,
      http2: true,
      https: cfg.server.https.enabled
        ? {
            allowHTTP1: true,
            key: fs.readFileSync(cfg.server.https.key),
            cert: fs.readFileSync(cfg.server.https.cert),
          }
        : null,
      connectionTimeout: 30000,
      keepAliveTimeout: 5000,
      forceCloseConnections: true,
      bodyLimit: 1048576, // 1MB
      maxParamLength: 100,
      ignoreTrailingSlash: true,
      ignoreDuplicateSlashes: true,
      disableRequestLogging: cfg.system.fastifyLogger ? false : true,
    });
    // if (cfg.system.debug) {
    //   this.fastify.addHook("preHandler", (request, reply, done) => {
    //     console.log("Hit preHandler");
    //     console.log(
    //       `[${new Date().toLocaleString("id-ID", {
    //         timeZone: "Asia/Jakarta",
    //       })}] ${request.method} ${request.url}`
    //     );
    //     done();
    //   });
    // }
  }

  async registerPlugins() {
    try {
      await this.fastify.register(httpsRedirect);
      await this.fastify.register(autoload, {
        dir: join(__dirname, "plugins"),
        options: { prefix: "middleware" },
      });
    } catch (err) {
      Utils.logs("error", `Error: ${err}`, "app.js");
    }
  }

  async registerRoutes() {
    try {
      await this.fastify.register(autoload, {
        dir: join(__dirname, "routes"),
        options: { prefix: "" },
      });
    } catch (err) {
      Utils.logs("error", `Error: ${err}`);
    }
  }

  async start() {
    try {
      Utils.logs(
        "system",
        `Crystal DDoS Mitigation\nBy Akbarrdev\n\nRuning on port ${this.tcpPort}`
      );
      await this.registerPlugins();
      await this.registerRoutes();
      await this.fastify.listen({ port: this.tcpPort });
    } catch (err) {
      Utils.logs("error", err, "app.js");
      process.exit(1);
    }
  }
}
