/**
 * @description Advanced DDoS Mitigation System for GTPS using Node.js developed by Akbarrdev.
 * @description Featuring comprehensive logging, multiple security plugins, and server monitoring capabilities
 * @description This system is designed to be highly customizable and easy to integrate with existing GTPS setups.
 * @description It is also built with performance in mind, ensuring minimal impact on server resources.
 * @description For more information, please refer to the documentation and source code available on GitHub.
 *
 * @author Akbarrdev
 * @see https://github.com/akbarrdev/CrystalDM
 * @tutorial https://github.com/akbarrdev/CrystalDM/wiki
 * @license MIT
 * @version 1.4.7
 * 
 * @todo edit ../config.json
 */

import { App } from "./app.js";
import cfg from "../config.json" assert { type: "json" };

const app = new App(cfg.server.tcpPort, cfg.server.udpPort);
app.fastify.decorate("app", app);
app.start();
