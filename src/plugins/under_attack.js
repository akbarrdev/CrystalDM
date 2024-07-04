import { Utils } from "../library/utils.js";
import cfg from "../../config.json" assert { type: "json" };

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
  }
  } catch (err) {
    Utils.logs("error", err, "Under Attack Plugins", 0);
  }
}
