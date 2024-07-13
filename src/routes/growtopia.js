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

  if (!userAgent.includes("UbiServices_SDK")) {
    return false;
  }

  if (accept === "*/*") {
    return true;
  }

  return false;
}

async function validateRequest(request, reply) {
  const clientIp = request.ip;
  const isCloudflare = await isCloudflareIP(clientIp);
  if (isCloudflare) {
    Utils.logs(
      "growtopia",
      `Request from Cloudflare IP: ${clientIp}`,
      request.url
    );
    return true;
  }

  if (!isValidRequest(request)) {
    Utils.logs("warn", `Invalid request from IP: ${clientIp}`, request.url);
    reply.code(403).send("ngapain?");
    return false;
  }

  return true;
}

function gtpsData(IP, udpPort, loginURL, maintText = "") {
  return `server|${IP}
port|${udpPort}
type|1
loginurl|${loginURL}
${maintText == "" ? `#maint|${maintText}` : `maint|${maintText}`}
beta_server|127.0.0.1
beta_port|${udpPort}
beta_type|1
meta|akk.bar
RTENDMARKERBS1001`;
}

export default async function (fastify, options) {
  const startTime = process.hrtime();
  fastify.post("/growtopia/server_data.php", async (request, reply) => {
    try {
      const isValid = await validateRequest(request, reply);

      if (!isValid) {
        return;
      }

      const clientIp = request.ip;
      const deviceType =
        request.headers["accept"] == "*/*" && request.httpVersion == "1.0"
          ? "Mobile player"
          : "PC player";

      const [seconds, nanoseconds] = process.hrtime(startTime);
      const elapsedTime = seconds + nanoseconds / 1e9;
      Utils.logs(
        "growtopia",
        `${clientIp} (${deviceType})`,
        request.url,
        elapsedTime.toFixed(4)
      );

      const gtpsdata = gtpsData(cfg.server.host, cfg.server.udpPort, cfg.server.loginURL);
      reply.code(200).send(gtpsdata);
    } catch (err) {
      Utils.logs("error", err, "growtopia.js", 0);
      reply.code(500).send("Internal Server Error");
    }
  });
}
