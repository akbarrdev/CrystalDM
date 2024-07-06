import { Utils } from "../library/utils.js";
import cfg from "../../config.json" assert { type: "json" };

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

export default async function (fastify, options) {
  fastify.addHook("onRequest", async (request, reply) => {
    const clientIp = request.ip;
    const requestTime = Date.now();

    updateClientStats(clientIp, requestTime);
    const limit = getAdaptiveLimit(clientIp);

    if (clientStats.get(clientIp).count > limit) {
      Utils.logs(
        "warn",
        `Adaptive rate limit exceeded for IP: ${clientIp}`,
        "Adaptive Rate Limiter Plugin"
      );
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
    "Adaptive Rate Limiter plugin is active",
    "Adaptive Rate Limiter Plugin"
  );
}
