import cfg from "../../config.json" assert { type: "json" };
import fp from "fastify-plugin";
import rateLimit from "@fastify/rate-limit";
import { Utils } from "../library/utils.js";

export default fp(async function rateLimiter(fastify, options) {
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
      fastify.register(rateLimit, {
        max: 60, 
        timeWindow: '1 minute',
        cache: 10000,
        skipOnError: false,
        addHeaders: cfg.security.rateLimiter.headers,
      }, (instance) => {
        instance.route({
          url: '/api/server-stats',
          method: 'GET'
        });
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
});
