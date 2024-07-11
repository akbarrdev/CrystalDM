import { Utils } from "../library/utils.js";
import fastifyStatic from "@fastify/static";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default async function (fastify, options) {
  try {
    const startTime = process.hrtime();
    await fastify.register(fastifyStatic, {
      root: join(__dirname, "../public"),
      prefix: "/features",
    });

    fastify.get("/features", async (request, reply) => {
      const requesterIP = request.ip;
      const fullURL = request.protocol + "://" + request.hostname + request.url;
      const [seconds, nanoseconds] = process.hrtime(startTime);
      const elapsedTime = seconds + nanoseconds / 1e9;
      Utils.logs("GET", requesterIP, fullURL, elapsedTime.toFixed(4));
      return reply.sendFile("features.html");
    });
  } catch (err) {
    Utils.logs("error", err, "features.js", 0);
    console.log(err);
  }
}
