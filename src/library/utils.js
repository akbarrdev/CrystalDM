import chalk from "chalk";
import boxen from "boxen";
import figures from "figures";
import moment from "moment";
import os from "os";
import fetch from "node-fetch";
import cfg from "../../config.json" assert { type: "json" };

export class Utils {
  static logs(type, message, pathORFilename, latency) {
    try {
      const timestamp = moment().locale("id").format("HH:mm:ss");
      const latencyStr = latency ? chalk.gray(`${latency}ms`) : "";
      const timeInfo = chalk.gray(`[${timestamp}]${latencyStr}`);
      const noHeader = ["GET", "system", "info"];
      const fileInfo = pathORFilename
        ? chalk.dim(` ${figures.pointerSmall} ${pathORFilename}`)
        : "";
      const formattedMessage =
        typeof message === "object"
          ? JSON.stringify(message, null, 2)
          : message;

      let icon, color, title, rawHeader, rawFinalMessage;
      let options = {
        padding: 1,
        margin: 1,
        borderStyle: "round",
        float: "center",
      };
      switch (type) {
        case "system":
          color = chalk.blue;
          title = "SYSTEM";
          options.textAlignment = "center";
          options.fullscreen = (width) => [width];
          break;
        case "info":
          color = chalk.greenBright;
          title = `INFO`;
          options.title = `INFO`;
          options.fullscreen = (width) => [width];
          options.titleAlignment = "center";
          options.textAlignment = "center";
          options.float = "left";
          options.padding = 0;
          options.margin = 0;
          break;
        case "warn":
          color = chalk.yellow;
          title = "WARN";
          break;
        case "error":
          color = chalk.red;
          title = "ERROR";
          break;
        case "GET":
          color = chalk.green;
          title = "GET";
          options.textAlignment = "left";
          options.float = "left";
          options.borderStyle = "single";
          options.padding = 0;
          options.margin = 0;
          options.title = "GET";
          options.titleAlignments = "left";
          options.borderColor = "green";
          rawFinalMessage = chalk.green(
            chalk.white("[") +
              chalk.blueBright(latencyStr) +
              chalk.white("]") +
              chalk.green(" ") +
              chalk.green(`${formattedMessage}${fileInfo}`)
          );
          break;
        case "growtopia":
          color = chalk.green;
          title = "GROWTOPIA";
          options.textAlignment = "left";
          options.float = "left";
          options.borderStyle = "single";
          options.padding = 0;
          options.margin = 0;
          options.title = "GROWTOPIA";
          options.titleAlignments = "left";
          options.borderColor = "blue";
          rawFinalMessage = chalk.blueBright(
            chalk.white("[") +
              chalk.blueBright(latencyStr) +
              chalk.white("]") +
              chalk.green(" ") +
              chalk.blueBright(`${formattedMessage}${fileInfo}`)
          );
          break;
        default:
          color = chalk.white;
          title = "LOG";
      }

      const header = rawHeader || color(`${title}`);
      const finalMessage =
        rawFinalMessage ||
        `${noHeader.includes(type) ? "" : `${timeInfo} ${header}\n\n`} ${color(
          formattedMessage
        )}${fileInfo}`;

      console.log(boxen(finalMessage, { ...options }));
    } catch (err) {
      console.log(err);
    }
  }

  static async getPublicIP() {
    try {
      const response = await fetch("https://api.ipify.org?format=json");
      const data = await response.json();
      return data.ip;
    } catch (error) {
      console.error("Gagal mendapatkan IP publik:", error);
      return "IP not found";
    }
  }
  static async sendDiscord(type, data) {
    let payload;
    if (type === "underAttack") {
      const publicIP = await this.getPublicIP();
      payload = embed(
        "SERVER IS UNDER ATTACK",
        `Your server (${cfg.server.information.name}) is under attack by:
        - **${data.attackerIP}**\n\n\nThe attacker IP has been **auto-blacklisted** and your server is safe under CrystalDM Protection.`,
        [
          {
            name: "Check server monitor",
            value: `[Click here](https://${publicIP}/monitor)`,
            inline: true,
          },
        ]
      );
    } else if (type === "overload") {
      const publicIP = await this.getPublicIP();
      payload = embed(
        "SERVER IS OVERLOADED",
        `Your server (${cfg.server.information.name}) is overloaded\nLatest client is:
        - **${data.client}**
        
        Overloaded type: ${data.type} (${data.value})\n\n\nThis is probably just an oversight and coincidence, the client will not be blacklisted.`,
        [
          {
            name: "Check server monitor",
            value: `[Click here](https://${publicIP}/monitor)`,
            inline: true,
          },
        ]
      );
    }
    const payloads = {
      content: "",
      embeds: [payload],
    };
    try {
      await fetch(cfg.system["discord-webhook-report-channel"], {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payloads),
      });
    } catch (err) {
      if (err.message == "Invalid URL") {
        console.log("Invalid webhook URL, please check your discord webhook url in config.json");
      } else {
        console.log(err);
      }
    }
  }
}

const embed = (title, description, fields = []) => {
  return {
    author: {
      name: "CrystalDM Notification",
      url: "https://github.com/akbarrdev/CrystalDM",
    },
    title: title,
    url: "https://github.com/akbarrdev/CrystalDM",
    description: description,
    fields: fields,
    color: 447744,
    footer: {
      text: "CrystalDM by Akbarrdev",
      icon_url: "https://slate.dan.onl/slate.png",
    },
    timestamp: new Date().toISOString(),
  };
};
