import { Reader } from "@maxmind/geoip2-node";
import cfg from "../../config.json" assert { type: "json" };
import { Utils } from "../library/utils.js";
import fastifyPlugin from "fastify-plugin";

const geoipDbPath = "GeoLite2-Country.mmdb";
const geoipReader = await Reader.open(geoipDbPath);

export default fastifyPlugin(async function (fastify, options) {
  if (cfg.security.geo.enabled) {
    let listCountry =
      cfg.security.geo[
        cfg.security.geo.mode == "whitelist"
          ? "whitelistCountry"
          : "blacklistCountry"
      ];
    fastify.addHook("onRequest", async (request, reply) => {
      const clientIp = request.ip;

      try {
        const geoResponse = clientIp === '127.0.0.1' || clientIp === '::1' ? null : geoipReader.country(clientIp);
        if (!geoResponse) return;
        const country = geoResponse.country.isoCode;
        if (
          cfg.security.geo.mode == "blacklist" &&
          cfg.security.geo.blacklistCountry.includes(country) &&
          clientIp != "127.0.0.1" ||
          cfg.security.geo.mode == "whitelist" &&
          !cfg.security.geo.whitelistCountry.includes(country) &&
          clientIp != "127.0.0.1"
        ) {
          Utils.logs(
            "warn",
            `Blocked access from ${country} (IP: ${clientIp})`,
            "Geo Ban Plugin"
          );
          reply.code(403).send({
            code: 403,
            message: "Access denied based on your geographic location",
            ip: clientIp,
            country: country,
            countryName: geoResponse.country.names.en,
          });
          return;
        }
      } catch (error) {
        Utils.logs(
          "warn",
          `Unable to resolve country for IP: ${clientIp}.\nError: ${error}`,
          "Geo Ban Plugin"
        );
      }

    });
    Utils.logs(
      "info",
      `${
        cfg.security.geo.mode === "whitelist" ? "Whitelist" : "Blacklist"
      } country loaded (${listCountry.join(", ")})`,
      "Geo Plugin",
      0
    );
  } else {
    Utils.logs("info", "Geo Ban is disabled.", "Geo Ban Plugin");
  }
});
