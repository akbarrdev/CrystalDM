import fastifyPlugin from "fastify-plugin";
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

export default fastifyPlugin(async function (fastify, options) {
  if (cfg.security.payloadChecker.enabled) {
    try {
      fastify.addHook("onRequest", async (request, reply) => {
        const clientIp = request.ip;

        if (checkPayload(request.url)) {
          Utils.logs(
            "warn",
            `Suspicious query detected from ${clientIp}`,
            "Payload Checker Plugin"
          );
          return reply.code(403).send("Forbidden");
        }

        if (request.method === "HEAD") {
          reply.code(405).send("ngapain?");
          return;
        }

        if (request.body && checkPayload(JSON.stringify(request.body))) {
          Utils.logs(
            "warn",
            `Suspicious payload detected from ${clientIp}`,
            "Payload Checker Plugin"
          );
          return reply.code(403).send("Forbidden");
        }

        for (let header in request.headers) {
          if (checkPayload(request.headers[header])) {
            Utils.logs(
              "warn",
              `Suspicious header detected from ${clientIp}`,
              "Payload Checker Plugin"
            );
            return reply.code(403).send("Forbidden");
          }
        }

        const userAgent = request.headers["user-agent"];

        if (!userAgent) {
          reply.code(403).send("ngapain?");
          return;
        }
      });

      Utils.logs(
        "info",
        "Payload checker is watching",
        "Payload Checker Plugin"
      );
    } catch (err) {
      Utils.logs("error", err, "payload_checker.js", 0);
    }
  } else {
    Utils.logs(
      "info",
      "Payload checker is disabled.",
      "Payload Checker Plugin"
    );
  }
})
