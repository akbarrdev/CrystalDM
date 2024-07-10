import { Utils } from "../library/utils.js";
import cfg from "../../config.json" assert { type: "json" };
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import { promisify } from "util";
import dns from "dns";

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
const lookupAsync = promisify(dns.lookup);

async function isCloudflareIP(ip) {
  try {
    const result = await lookupAsync(ip);
    return result.includes("cloudflare");
  } catch (err) {
    return false;
  }
}

function isValidRequest(request) {
  const userAgent = request.headers["user-agent"] || "";
  const accept = request.headers["accept"] || "";
  const connection = request.headers["connection"] || "";
  const httpVersion = request.httpVersion;

  if (
    blockedUserAgent.some((agent) =>
      userAgent.toLowerCase().includes(agent.toLowerCase())
    )
  ) {
    return false;
  }

  if (
    (accept === "*/*" && connection === "close") ||
    (accept === "*/*" && httpVersion === "1.0")
  ) {
    return true;
  }

  return false;
}

async function validateRequest(request, reply) {
  const clientIp = request.ip;
  const isCloudflare = await isCloudflareIP(clientIp);

  if (isCloudflare) {
    Utils.logs(
      "info",
      `Request from Cloudflare IP: ${clientIp}`,
      "Growtopia Route"
    );
    return true;
  }

  if (!isValidRequest(request)) {
    Utils.logs(
      "warn",
      `Invalid request from IP: ${clientIp}`,
      "Growtopia Route"
    );
    reply.code(403).send("Forbidden");
    return false;
  }

  return true;
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

export default async function (fastify, options) {
  fastify.post("/growtopia/server_data.php", async (request, reply) => {
    try {
      const fullURL = request.protocol + "://" + request.hostname + request.url;
      const isValid = await validateRequest(request, reply);

      if (!isValid) {
        return;
      }

      const clientIp = request.ip;
      const playerType =
        request.headers["accept"] == "*/*" && request.httpVersion == "1.0"
          ? "Android player"
          : "PC player";

      Utils.logs(
        "growtopia",
        `${clientIp} (${playerType})`,
        fullURL,
        reply.elapsedTime.toFixed(4)
      );

      const gtpsdata = gtpsData(cfg.server.host, cfg.server.udpPort);
      reply.code(200).send(gtpsdata);
    } catch (err) {
      Utils.logs("error", err, "growtopia.js", 0);
      reply.code(500).send("Internal Server Error");
    }
  });
}
