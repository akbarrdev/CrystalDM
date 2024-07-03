import { App } from "./app.js";
import cfg from "../config.json" assert { type: "json" };

const app = new App(cfg.server.tcpPort, cfg.server.udpPort);
app.fastify.decorate("app", app);
app.start();