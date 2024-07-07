import cfg from "../../config.json" assert { type: "json" };
import { Utils } from "../library/utils.js";
import fs from "fs";
import path from "path";
import mime from "mime-types";

export default async function fileHandler(fastify, options) {
  fastify.get("/cache/*", async (request, reply) => {
    try {
      const requestedPath = request.params["*"];
      // const fullPath = path.join(__dirname, "..", "..", "cache", requestedPath);
      const fullPath = path.join(
        "D:",
        "Project Pemrograman",
        "GTPS",
        "CentrumG3.5",
        "TNL Advanced Protect",
        "cache",
        requestedPath
      );
      console.log("Requested Path: ", requestedPath);
      console.log("Full Path: ", fullPath);
      
      if (!fs.existsSync(fullPath)) {
        Utils.logs("error", "404: File tidak ditemukan!", fullPath);
        return reply.code(404).send(`File tidak ditemukan: ${requestedPath}`);
      }

      const fileContent = fs.readFileSync(fullPath);
      const mimeType = mime.lookup(fullPath) || "application/octet-stream";
      reply.header("Content-Type", mimeType);
      reply.header(
        "Content-Disposition",
        `attachment; filename="${requestedPath.split("/").pop()}"`
      );
      Utils.logs(
        "growtopia",
        `Berhasil menyajikan file!`,
        requestedPath,
        reply.elapsedTime
      );
      return reply.send(fileContent);
    } catch (err) {
      Utils.logs("error", err, "file_handler.js");
      return reply.code(500).send("internal server error");
    }
  });
}
