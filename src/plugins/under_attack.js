import { Utils } from "../library/utils.js";
import cfg from "../../config.json" assert { type: "json" };
import underPressure from "@fastify/under-pressure";

export default async function (fastify, options) {
  try {
    if (cfg.security.underAttack.enabled) {
      await fastify.register(underPressure, {
        ...cfg.security.underAttack.settings,
        pressureHandler: (req, rep, type, value) => {
          console.log(`Server under pressure: ${type} ${value}`);
          rep.send(cfg.security.underAttack.settings.message);
        },
      });
      Utils.logs("info", `Under attack mode is active.`, "Under Attack Plugins", 0);
    }
  } catch (err) {
    Utils.logs("error", err, "Under Attack Plugin", 0);
  }
}
