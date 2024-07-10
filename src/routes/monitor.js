import { Utils } from "../library/utils.js";
import fastifyStatic from "@fastify/static";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import os from "os";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

let lastCpuInfo = os.cpus();
let lastCpuTimes = lastCpuInfo.reduce(
  (acc, cpu) =>
    acc + Object.values(cpu.times).reduce((sum, time) => sum + time, 0),
  0
);

// async function getActiveProcesses() {
// jangan dipake, makan memory
//   try {
//     const { stdout } = await execPromise("tasklist /FO CSV /NH");
//     return stdout.trim().split("\n").length;
//   } catch (error) {
//     console.error("Error getting active processes:", error);
//     return 0;
//   }
// }

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

export default async function (fastify, options) {
  let openConnections = 0;
  try {
    fastify.addHook("onRequest", (request, reply, done) => {
      openConnections++;
      done();
    });

    fastify.addHook("onResponse", (request, reply, done) => {
      openConnections--;
      done();
    });
    await fastify.register(fastifyStatic, {
      root: join(__dirname, "../public"),
      prefix: "/monitor",
    });

    fastify.get("/monitor", async (request, reply) => {
      const requesterIP = request.ip;
      const fullURL = request.protocol + "://" + request.hostname + request.url;
      Utils.logs("GET", requesterIP, fullURL, reply.elapsedTime.toFixed(4));
      return reply.sendFile("monitor.html");
    });

    fastify.get("/api/server-stats", async (request, reply) => {
      const cpuUsage = getCpuUsage();
      const memoryUsage = process.memoryUsage().rss;
      const uptime = os.uptime();
      const activeProcesses = 5;

      return {
        cpuUsage,
        memoryUsage,
        openConnections,
        uptime,
        activeProcesses,
      };
    });
  } catch (err) {
    Utils.logs("error", err, "monitor.js", 0);
    console.log(err);
  }
}
