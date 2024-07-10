import cfg from "../../config.json" assert { type: "json" };
import rateLimit from "@fastify/rate-limit";
import { Utils } from "../library/utils.js";
import fastifyPlugin from "fastify-plugin";


export default fastifyPlugin(async function (fastify, options) {
  try {
    fastify.addHook("onError", (request, reply, error, done) => {
      Utils.logs(
        "error",
        `An error occurred: ${error.message}`,
        "Error Handler Plugin"
      );
      console.log(error)
      done();
    });

    fastify.addHook("onTimeout", (request, reply, done) => {
      Utils.logs("warn", `Request timed out: ${request.url}`, "Error Handler Plugin");
      done();
    });

    fastify.addHook("onRequestAbort", (request, done) => {
      Utils.logs("warn", `Request aborted: ${request.url}`, "Error Handler Plugin");
      done();
    });

    fastify.addHook("onClose", (instance, done) => {
      Utils.logs("info", "Server is shutting down", "Error Handler Plugin");
      console.log(instance)
      done();
    });
  } catch (err) {
    Utils.logs("error", `Error: ${err}`);
  }
})
