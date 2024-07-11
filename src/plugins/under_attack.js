import { Utils } from "../library/utils.js";
import cfg from "../../config.json" assert { type: "json" };
import underPressure from "@fastify/under-pressure";
import fastifyPlugin from "fastify-plugin";

export default fastifyPlugin(async function (fastify, options) {
  if (cfg.security.underAttack.enabled) {
    try {
      await fastify.register(underPressure, {
        ...cfg.security.underAttack.settings,
        pressureHandler: (req, rep, type, value) => {
          Utils.logs("warn", `Server under pressure: ${type} (${value})`, "Under Attack Plugin")
          Utils.sendDiscord("overload", {client: req.ip, type: type, value: value});
          rep.send(cfg.security.underAttack.settings.message);
        },
      });
      Utils.logs(
        "info",
        `Under attack mode is active.`,
        "Under Attack Plugins",
        0
      );
    } catch (err) {
      Utils.logs("error", err, "Under Attack Plugin", 0);
    }
  } else {
    Utils.logs(
      "info",
      "Under attack mode is disabled.",
      "Under Attack Plugins",
      0
    );
  }
});
