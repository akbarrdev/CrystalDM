import { Utils } from "../library/utils.js";
import cfg from "../../config.json" assert { type: "json" };
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const blockedUserAgent = [
  "python-requests",
  "python",
  "Python-urllib",
  "node-fetch",
  "axios",
  "Go-http-client",
  "Mozilla",
  "Chrome",
  "Safari",
  "Firefox",
  "Edge",
  "Opera",
  "Thunder Client",
  "Postman",
  "insomnia",
  "curl",
  "Wget",
  "HttpClient",
  "okhttp",
];

export default async function (fastify, options) {
  fastify.addHook("onRequest", (request, reply, done) => {
    console.log(
      `[${new Date().toLocaleString("id-ID", {
        timeZone: "Asia/Jakarta",
      })}] ${request.method} ${request.url}`
    );
    done();
  });
  // fastify.post("/growtopia/server_data.php", async (request, reply) => {
  //   try {
  //     console.log("hit")
  //     const fullURL = request.protocol + "://" + request.hostname + request.url;
  //     console.log(fullURL);
  //     const userAgent = request.headers["user-agent"] || "";

  // if (
  //   blockedUserAgent.some((agent) =>
  //     userAgent.toLowerCase().includes(agent.toLowerCase())
  //   )
  // ) {
  //   Utils.logs(
  //     "warn",
  //     request.ip,
  //     "Blocked User Agent: " + userAgent,
  //     fullURL,
  //     0
  //   );
  //   return reply.code(403).send("ngapain?");
  // }
  // if (
  //   (request.headers["accept"] == "*/*" &&
  //     request.headers["connection"] == "close") ||
  //   (request.headers["accept"] == "*/*" && request.httpVersion == "1.0")
  // ) {
  //   Utils.logs(
  //     "growtopia",
  //     request.ip +
  //       ` (${
  //         request.headers["accept"] == "*/*" && request.httpVersion == "1.0"
  //           ? "Android player"
  //           : "PC player"
  //       })`,
  //     fullURL,
  //     reply.elapsedTime.toFixed(4)
  //   );
  //   const gtpsdata = gtpsData(cfg.server.host, cfg.server.udpPort);
  // console.log(gtpsdata);
  // return reply.code(200).send(gtpsdata);
  // }
  //   } catch (err) {
  //     Utils.logs("error", err, "growtopia.js", 0);
  //   }
  // });
}

function gtpsData(IP, udpPort, maintText = "") {
  return `server|${IP}
port|${udpPort}
type|1
${maintText == "" ? `#maint|${maintText}` : `maint|${maintText}`}
beta_server|127.0.0.1
beta_port|${udpPort}
beta_type|1
meta|akk.bar
RTENDMARKERBS1001`;
}
