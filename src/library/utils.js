import chalk from "chalk";
import boxen from "boxen";
import figures from "figures";
import moment from "moment";

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
}
