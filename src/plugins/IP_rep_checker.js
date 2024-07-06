import axios from "axios";
import { Utils } from "../library/utils.js";
import cfg from "../../config.json" assert { type: "json" };

const API_KEY = "YOUR_ABUSEIPDB_API_KEY";

async function checkIPReputation(ip) {
  try {
    const response = await axios.get(`https://api.abuseipdb.com/api/v2/check`, {
      params: {
        ipAddress: ip,
        maxAgeInDays: 30,
      },
      headers: {
        Key: API_KEY,
        Accept: "application/json",
      },
    });

    return response.data.data.abuseConfidenceScore;
  } catch (error) {
    Utils.logs(
      "error",
      `Error checking IP reputation: ${error.message}`,
      "IP Reputation Plugin"
    );
    return 0;
  }
}

export default async function (fastify, options) {
  fastify.addHook("onRequest", async (request, reply) => {
    const clientIp = request.ip;
    const reputationScore = await checkIPReputation(clientIp);

    if (reputationScore > cfg.security.ipReputation.threshold) {
      Utils.logs(
        "warn",
        `Blocked request from suspicious IP: ${clientIp} (Score: ${reputationScore})`,
        "IP Reputation Plugin"
      );
      reply.code(403).send("Access denied due to suspicious IP reputation");
    }
  });

  Utils.logs("info", "IP Reputation plugin is active", "IP Reputation Plugin");
}
