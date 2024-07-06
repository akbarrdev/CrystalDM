import cfg from "../../config.json" assert { type: "json" };
import { Utils } from "../library/utils.js";

const suspiciousPatterns = [
  /union\s+select/i,
  /<script>/i,
  /\.\.\/\.\./i,
  /etc\/passwd/i,
  /\/bin\/bash/i,
];

const checkPayload = (payload) => {
  if (typeof payload !== "string") return false;
  return suspiciousPatterns.some((pattern) => pattern.test(payload));
};

export default async function (fastify, options) {
  try {
    fastify.addHook("preHandler", async (request, reply) => {
      const clientIp = request.ip;

      // Periksa query string
      if (checkPayload(request.url)) {
        Utils.logs(
          "warn",
          `Suspicious query detected from ${clientIp}`,
          "WAF Plugin"
        );
        return reply.code(403).send("Forbidden");
      }

      // Periksa body jika ada
      if (request.body && checkPayload(JSON.stringify(request.body))) {
        Utils.logs(
          "warn",
          `Suspicious payload detected from ${clientIp}`,
          "WAF Plugin"
        );
        return reply.code(403).send("Forbidden");
      }

      // Periksa headers
      for (let header in request.headers) {
        if (checkPayload(request.headers[header])) {
          Utils.logs(
            "warn",
            `Suspicious header detected from ${clientIp}`,
            "WAF Plugin"
          );
          return reply.code(403).send("Forbidden");
        }
      }
    });

    Utils.logs("info", "WAF plugin is active", "WAF Plugin");
  } catch (err) {
    Utils.logs("error", err, "WAF.js", 0);
  }
}
