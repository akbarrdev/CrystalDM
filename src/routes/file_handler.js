import cfg from "../../config.json" assert { type: "json" };
import { Utils } from "../library/utils.js";
import fs from "fs";
import path from "path";
import mime from "mime-types";
import process from "process";

export default async function fileHandler(fastify, options) {
  const startTime = process.hrtime();
  fastify.get("/cache/*", async (request, reply) => {
    try {
      const requestedPath = request.params["*"];
      const fullPath = path.resolve(cfg.server.cachePath, requestedPath);

      if (!fs.existsSync(fullPath)) {
        Utils.logs("error", "404: File not found!", fullPath);
        return reply.code(404).send(`File not found: ${requestedPath}`);
      }

      const fileContent = fs.readFileSync(fullPath);
      const mimeType = mime.lookup(fullPath) || "application/octet-stream";
      reply.header("Content-Type", mimeType);
      reply.header(
        "Content-Disposition",
        `attachment; filename="${requestedPath.split("/").pop()}"`
      );
      const [seconds, nanoseconds] = process.hrtime(startTime);
      const elapsedTime = seconds + nanoseconds / 1e9;
      Utils.logs(
        "growtopia",
        `Success serving file`,
        requestedPath,
        elapsedTime.toFixed(4)
      );
      return reply.send(fileContent);
    } catch (err) {
      Utils.logs("error", err, "file_handler.js");
      return reply.code(500).send("internal server error");
    }
  });
}
