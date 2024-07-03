import { Reader } from "@maxmind/geoip2-node"
import cfg from "../../config.json" assert { type: "json" };
import { Utils } from "../library/utils.js";

const geoipDbPath = "GeoLite2-Country.mmdb"
const geoipReader = await Reader.open(geoipDbPath);

export default async function (fastify, options) {
  fastify.addHook("onRequest", async (request, reply) => {
    const clientIp = request.ip;
    const userAgent = request.headers["user-agent"];

    if (request.method === "HEAD") {
      reply.code(405).send("ngapain?");
      return;
    }

    if (!userAgent) {
      reply.code(403).send("ngapain?");
      return;
    }

    try {
      const geoResponse = geoipReader.country(clientIp);
      const country = geoResponse.country.isoCode;
      if (cfg.security.blockedCountry.includes(country)) {
        Utils.logs("warn", `Blocked access from ${country} (IP: ${clientIp})`);
        reply.code(403).send("Access denied based on your geographic location");
        return;
      }
    } catch (error) {
      Utils.logs("warn", `Unable to resolve country for IP: ${clientIp}. Error: ${error.message}`);
    }

    fastify.get("/check-location", async (request, reply) => {
      const ip = request.ip;
      try {
        const response = geoipReader.country(ip);
        return {
          ip: ip,
          country: response.country.isoCode,
          countryName: response.country.names.en,
        };
      } catch (error) {
        reply.code(500).send(`Unable to resolve location: ${error.message}`);
      }
    });
  })
}