import cfg from "../../config.json" assert { type: "json" };
import rateLimit from "@fastify/rate-limit";
import { Utils } from "../library/utils.js";

export default async function (fastify, options) {
  if (cfg.security.rateLimiter.enabled) {
    try {
      await fastify.register(rateLimit, {
        max: cfg.security.rateLimiter.limit,
        timeWindow: cfg.security.rateLimiter.per,
        cache: cfg.security.rateLimiter.cache,
        whitelist: cfg.security.whitelist,
        skipOnError: false,
        addHeaders: cfg.security.rateLimiter.headers,
      });
      Utils.logs(
        "info",
        `Rate limiter is active (limit: ${cfg.security.rateLimiter.limit}, per: ${cfg.security.rateLimiter.per})`,
        "Rate Limiter Plugin",
        0
      );
    } catch (err) {
      Utils.logs("error", `Error: ${err.message}`);
    }
  } else {
    Utils.logs("info", "Rate Limiter is disabled.", "Rate Limiter Plugin");
  }
}
