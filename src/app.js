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
  }

  async registerPlugins() {
    try {
      await this.fastify.register(httpsRedirect);
      await this.fastify.register(autoload, {
        dir: join(__dirname, "plugins"),
        options: { prefix: "middleware" },
        timeout: 30000,
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
        timeout: 30000,
      });
    } catch (err) {
      Utils.logs("error", `Error: ${err}`);
    }
  }

  async start() {
    try {
      await this.registerPlugins();
      await this.registerRoutes();
      this.fastify.listen({ port: this.tcpPort, host: "0.0.0.0" }, (err, address) => {
        if (err) {
          Utils.logs("error", `Error: ${err}`, "app.js");
          process.exit(1);
        }
        console.log("\n")
        Utils.logs(
          "system",
          `Crystal DDoS Mitigation\nBy Akbarrdev\n\nRuning on ${address}`
        );
      });
    } catch (err) {
      Utils.logs("error", err, "app.js");
      process.exit(1);
    }
  }
}
