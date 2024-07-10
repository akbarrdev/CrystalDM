import fs from "fs";
import cfg from "../../config.json" assert { type: "json" };
import { Utils } from "../library/utils.js";
import { resolve } from "path";
import fastifyPlugin from "fastify-plugin";

export default fastifyPlugin(async function (fastify, options) {
  if (cfg.security.autoBlacklist.enabled) {
    let blacklist = [];
    try {
      const blacklistPath = resolve(cfg.security.autoBlacklist.blacklistPath);
      const blacklistData = fs.readFileSync(blacklistPath, "utf-8");
      blacklist = JSON.parse(blacklistData);
      if (cfg.security.autoBlacklist.enabled) {
        fastify.addHook("onRequest", async (req, rep) => {
          const clientIp = req.ip;
          if (blacklist.includes(clientIp)) {
            rep.code(403).send("Forbidden");
          }
          if (isSuspiciousRequest(req)) {
            console.log(`Suspicious request detected from ${clientIp}`);
            if (!blacklist.includes(clientIp)) {
              blacklist.push(clientIp);
              try {
                fs.writeFileSync(
                  blacklistPath,
                  JSON.stringify(blacklist, null, 2)
                );
              } catch (err) {
                Utils.logs("error", err, "Auto Blacklist Plugins", 0);
              }
            }
            rep.code(403).send("ngapain?");
            return;
          }
        });
        Utils.logs(
          "info",
          `Blacklisted IP loaded (${blacklist.length})`,
          "Auto Blacklist Plugins",
          0
        );
      }
    } catch (err) {
      Utils.logs("error", err, "Auto Blacklist Plugins", 0);
    }
  } else {
    Utils.logs("info", "Auto Blacklist is disabled.", "Auto Blacklist Plugin");
  }
});

function isSuspiciousRequest(req) {
  // if (req.raw.method == "POST" && req.url == "/admin") return false;
  const suspiciousPatterns = cfg.security.protectedPath;
  return suspiciousPatterns.some((pattern) => req.url.includes(pattern));
}
