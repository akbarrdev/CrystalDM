import fastify from "fastify";
import autoload from "@fastify/autoload";
import httpsRedirect from "fastify-https-redirect";
import fs from "fs";
import path from "path";
import cfg from "../config.json" assert { type: "json" };
import { Utils } from "./library/utils.js";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

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
    });
    if (cfg.system.debug) {
      this.fastify.addHook("onRequest", (request, reply, done) => {
        console.log(
          `[${new Date().toISOString()}] ${request.method} ${request.url}`
        );
        done();
      });
    }
  }

  async registerPlugins() {
    try {
      await this.fastify.register(httpsRedirect);
      await this.fastify.register(autoload, {
        dir: join(__dirname, "plugins"),
        options: { prefix: "plugins" },
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
      await this.registerRoutes();
      await this.registerPlugins();
      await this.fastify.listen({ port: this.tcpPort });
    } catch (err) {
      Utils.logs("error", err, "app.js");
      process.exit(1);
    }
  }
}
