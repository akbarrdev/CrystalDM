import fastify from "fastify";
import fastifyStatic from '@fastify/static';
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
      logger: cfg.system.logger,
      trustProxy: true,
      http2: true,
      https: cfg.server.https
        ? {
            allowHTTP1: true,
            key: fs.readFileSync(cfg.server.https.key),
            cert: fs.readFileSync(cfg.server.https.cert),
          }
        : null,
    });
  }

  async registerPlugins() {
    try {
      await this.fastify.register(httpsRedirect);
      await this.fastify.register(fastifyStatic, {
  root: join(__dirname, "public"),
  prefix: '/', 
});
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
        options: { prefix: "api" },
      });
    } catch (err) {
      Utils.logs("error", `Error: ${err}`);
    }
  }

  async start() {
    try {
      await this.registerRoutes();
      await this.registerPlugins();
      await this.fastify.listen({ port: this.tcpPort, host: cfg.server.host });
      Utils.logs(
        "system",
        `Crystal DDoS Mitigation\nBy Akbarrdev\n\nRuning on port ${this.tcpPort}`
      );
    } catch (err) {
      Utils.logs("error", err, "app.js");
      process.exit(1);
    }
  }
}
