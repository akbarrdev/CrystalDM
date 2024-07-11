import { Utils } from "../library/utils.js";
import cfg from "../../config.json" assert { type: "json" };
import fastifyPlugin from "fastify-plugin";
import { resolve } from "path";
import fs from "fs";

const clientStats = new Map();

function updateClientStats(clientIp, requestTime) {
  if (!clientStats.has(clientIp)) {
    clientStats.set(clientIp, {
      count: 1,
      lastRequest: requestTime,
      avgInterval: 0,
    });
  } else {
    const stats = clientStats.get(clientIp);
    const interval = requestTime - stats.lastRequest;
    stats.avgInterval =
      (stats.avgInterval * stats.count + interval) / (stats.count + 1);
    stats.count++;
    stats.lastRequest = requestTime;
  }
}

function getAdaptiveLimit(clientIp) {
  const stats = clientStats.get(clientIp);
  if (!stats) return cfg.security.adaptiveRateLimit.defaultLimit;

  const baseLimit = cfg.security.adaptiveRateLimit.defaultLimit;
  const minInterval = cfg.security.adaptiveRateLimit.minInterval;

  if (stats.avgInterval < minInterval) {
    return Math.max(
      1,
      baseLimit - Math.floor((minInterval - stats.avgInterval) / 100)
    );
  }
  return baseLimit;
}

export default fastifyPlugin(async function (fastify, options) {
  if (cfg.security.adaptiveRateLimit.enabled) {
    fastify.addHook("onRequest", async (request, reply) => {
      const clientIp = request.ip;
      if (cfg.security.whitelist.includes(clientIp)) {
        return;
      }
      const requestTime = Date.now();
      const blacklistPath = resolve(cfg.security.autoBlacklist.blacklistPath);
      const blacklistData = fs.readFileSync(blacklistPath, "utf-8");
      const blacklist = JSON.parse(blacklistData);

      updateClientStats(clientIp, requestTime);
      const limit = getAdaptiveLimit(clientIp);

      if (clientStats.get(clientIp).count > limit) {
        if (!blacklist.includes(clientIp)) {
          Utils.logs(
            "warn",
            `Adaptive rate limit exceeded for IP: ${clientIp}, auto blacklist...`,
            "Adaptive Rate Limiter Plugin"
          );
          await Utils.sendDiscord("underAttack", { attackerIP: clientIp });
          blacklist.push(clientIp);
          try {
            fs.writeFileSync(blacklistPath, JSON.stringify(blacklist, null, 2));
          } catch (err) {
            Utils.logs("error", err, "Auto Blacklist Plugins", 0);
          }
        }
        reply.code(429).send("Too Many Requests");
      }
    });

    setInterval(() => {
      const now = Date.now();
      for (const [ip, stats] of clientStats.entries()) {
        if (
          now - stats.lastRequest >
          cfg.security.adaptiveRateLimit.cleanupInterval
        ) {
          clientStats.delete(ip);
        }
      }
    }, cfg.security.adaptiveRateLimit.cleanupInterval);
    Utils.logs(
      "info",
      "Adaptive Rate Limiter is active",
      "Adaptive Rate Limiter Plugin"
    );
  } else {
    Utils.logs(
      "info",
      "Adaptive Rate Limiter is disabled.",
      "Adaptive Rate Limiter Plugin"
    );
  }
});
