import { Reader } from "@maxmind/geoip2-node";
const geoipDbPath = "GeoLite2-Country.mmdb";
const geoipReader = await Reader.open(geoipDbPath);

export default async function (fastify, options) {
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
}
