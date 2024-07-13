import { Utils } from "../library/utils.js";
import fastifyStatic from "@fastify/static";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import os from "os";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

let cachedStats = null;
let lastUpdateTime = 0;
const CACHE_TTL = 1000;
let lastCpuInfo = os.cpus();
let lastCpuTimes = lastCpuInfo.reduce(
  (acc, cpu) =>
    acc + Object.values(cpu.times).reduce((sum, time) => sum + time, 0),
  0
);


function getCpuUsage() {
  const cpuInfo = os.cpus();
  const currentCpuTimes = cpuInfo.reduce(
    (acc, cpu) =>
      acc + Object.values(cpu.times).reduce((sum, time) => sum + time, 0),
    0
  );
  const cpuTimeDiff = currentCpuTimes - lastCpuTimes;

  const idleDiff = cpuInfo.reduce(
    (acc, cpu, index) => acc + (cpu.times.idle - lastCpuInfo[index].times.idle),
    0
  );
  const cpuUsage = 100 - (idleDiff / cpuTimeDiff) * 100;

  lastCpuInfo = cpuInfo;
  lastCpuTimes = currentCpuTimes;

  return cpuUsage;
}

async function getServerStats() {
  const now = Date.now();
  if (cachedStats && now - lastUpdateTime < CACHE_TTL) {
    return cachedStats;
  }

  const cpuUsage = getCpuUsage();
  const memoryUsage = process.memoryUsage().rss;
  const uptime = os.uptime();

  cachedStats = {
    cpuUsage,
    memoryUsage,
    uptime,
  };
  lastUpdateTime = now;
  return cachedStats;
}

export default async function (fastify, options) {
  const startTime = process.hrtime();
  try {
    await fastify.register(fastifyStatic, {
      root: join(__dirname, "../public"),
      prefix: "/monitor",
    });

    const [seconds, nanoseconds] = process.hrtime(startTime);
    const elapsedTime = seconds + nanoseconds / 1e9;

    fastify.get("/monitor", async (request, reply) => {
      const requesterIP = request.ip;
      const fullURL = request.protocol + "://" + request.hostname + request.url;
      Utils.logs("GET", requesterIP, fullURL, elapsedTime.toFixed(4));
      return reply.sendFile("monitor.html");
    });

    fastify.get("/api/server-stats", async (request, reply) => {
      return await getServerStats();
    });
  } catch (err) {
    Utils.logs("error", err, "monitor.js", 0);
    console.log(err);
  }
}
