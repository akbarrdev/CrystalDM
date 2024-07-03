import cfg from "../../config.json" assert { type: "json" };
import rateLimit  from "@fastify/rate-limit"

export default async function (fastify, options) {
  try {
    await fastify.register(rateLimit, {
      max: cfg.security.rateLimiter.limit,
      timeWindow: cfg.security.rateLimiter.per,
      cache: cfg.security.rateLimiter.cache,
      whitelist: cfg.security.whitelist,
      skipOnError: false,
      addHeaders: cfg.security.rateLimiter.headers,
    });
  } catch (err) {
    Utils.logs("error", `Error: ${err.message}`);
  }
}
