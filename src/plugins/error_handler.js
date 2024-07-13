import cfg from "../../config.json" assert { type: "json" };
import rateLimit from "@fastify/rate-limit";
import { Utils } from "../library/utils.js";
import fastifyPlugin from "fastify-plugin";
import fs from "fs";
import { resolve } from "path";

const blacklistPath = resolve(cfg.security.autoBlacklist.blacklistPath);
const blacklistData = fs.readFileSync(blacklistPath, "utf-8");
const blacklist = JSON.parse(blacklistData);

export default fastifyPlugin(async function (fastify, options) {
  try {
    fastify.addContentTypeParser(
      "application/x-www-form-urlencoded",
      (request, payload, done) => {
        let body = "";
        payload.on("data", (chunk) => {
          body += chunk.toString();
        });
        payload.on("end", () => {
          let parsed = {};
          body.split("&").forEach((pair) => {
            let [key, value] = pair.split("=");
            parsed[decodeURIComponent(key)] = decodeURIComponent(value);
          });
          done(null, parsed);
        });
      }
    );

    fastify.addHook("onError", async (request, reply, error) => {
      if (error.statusCode === 429) {
        if (!blacklist.includes(request.ip)) {
          Utils.logs(
            "warn",
            `Rate limit exceeded for IP: ${request.ip}, auto blacklist...`,
            "Rate Limiter Plugin"
          );
          await Utils.sendDiscord("underAttack", { attackerIP: request.ip });
          blacklist.push(request.ip);
          try {
            fs.writeFileSync(blacklistPath, JSON.stringify(blacklist, null, 2));
          } catch (err) {
            Utils.logs("error", err, "Auto Blacklist Plugins", 0);
          }
        }
        reply.code(429).send("Too Many Requests");
      } else {
        Utils.logs("error", `${error}`, "Error Handler Plugin");
        console.log(error);
      }
    });

    fastify.addHook("onTimeout", (request, reply, done) => {
      Utils.logs(
        "warn",
        `Request timed out: ${request.url}`,
        "Error Handler Plugin"
      );
      done();
    });

    fastify.addHook("onRequestAbort", (request, done) => {
      Utils.logs(
        "warn",
        `Request aborted: ${request.url}`,
        "Error Handler Plugin"
      );
      done();
    });

    fastify.addHook("onClose", (instance, done) => {
      Utils.logs("info", "Server is shutting down", "Error Handler Plugin");
      console.log(instance);
      done();
    });
  } catch (err) {
    Utils.logs("error", `Error: ${err}`);
  }
});
