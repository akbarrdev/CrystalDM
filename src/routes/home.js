import { Utils } from "../library/utils.js";
import fastifyStatic from "@fastify/static";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default async function (fastify, options) {
  await fastify.register(fastifyStatic, {
    root: join(__dirname, "../public"),
    prefix: "/",
  });

  fastify.get("/", async (request, reply) => {
    const requesterIP = request.ip;
    const fullURL = request.protocol + '://' + request.hostname + request.url;
    Utils.logs("GET", requesterIP, fullURL, (reply.elapsedTime).toFixed(4));
    return reply.sendFile("index.html");
  });
}
