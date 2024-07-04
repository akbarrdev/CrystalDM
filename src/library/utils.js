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
      const noHeader = ["GET", "system"];
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
          icon = figures.home;
          color = chalk.blue;
          title = "SYSTEM";
          options.textAlignment = "center";
          options.fullscreen = (width) => [width];
          break;
        case "info":
          icon = figures.info;
          color = chalk.blue;
          title = "INFO";
          break;
        case "warn":
          icon = figures.warning;
          color = chalk.yellow;
          title = "WARN";
          break;
        case "error":
          icon = figures.cross;
          color = chalk.red;
          title = "ERROR";
          break;
        case "GET":
          icon = figures.arrowRight;
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
        default:
          icon = figures.bullet;
          color = chalk.white;
          title = "LOG";
      }

      const header = rawHeader || color(`${icon} ${title}`);
      const finalMessage =
        rawFinalMessage ||
        `${noHeader.includes(type) ? "" : `${header} ${timeInfo}\n\n`} ${color(
          formattedMessage
        )}${fileInfo}`;

      console.log(boxen(finalMessage, { ...options }));
    } catch (err) {
      console.log(err);
    }
  }
}
