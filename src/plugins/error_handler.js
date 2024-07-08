import cfg from "../../config.json" assert { type: "json" };
import rateLimit from "@fastify/rate-limit";
import { Utils } from "../library/utils.js";

export default async function (fastify, options) {
  //   if (cfg.security.rateLimiter.enabled) {
  try {
    fastify.addHook("onError", (request, reply, error, done) => {
      Utils.logs(
        "error",
        `An error occurred: ${error.message}`,
        "Error Handler"
      );
      console.log(error)
      done();
    });

    fastify.addHook("onTimeout", (request, reply, done) => {
      Utils.logs("warn", `Request timed out: ${request.url}`, "Error Handler");
      done();
    });

    fastify.addHook("onRequestAbort", (request, done) => {
      Utils.logs("warn", `Request aborted: ${request.url}`, "Error Handler");
      done();
    });

    fastify.addHook("onClose", (instance, done) => {
      Utils.logs("info", "Server is shutting down", "Error Handler");
      console.log(instance)
      done();
    });
  } catch (err) {
    Utils.logs("error", `Error: ${err}`);
  }
  //   } else {
  //     Utils.logs("info", "Rate Limiter is disabled.", "Rate Limiter Plugin");
  //   }
}
