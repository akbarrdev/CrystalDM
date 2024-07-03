import chalk from "chalk";
import boxen from "boxen";
import figures from "figures";
import moment from "moment";

export class Utils {
  static logs(type, message, pathORFilename, latency) {
    const timestamp = moment().locale("id").format("HH:mm:ss");
    const latencyStr = latency ? chalk.gray(` ${latency}ms`) : "";
    const fileInfo = pathORFilename
      ? chalk.dim(` ${figures.pointerSmall} ${pathORFilename}`)
      : "";

    let icon, color, title;
    switch (type) {
      case "system":
        icon = figures.home;
        color = chalk.blue;
        title = "SYSTEM";
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
        break;
      default:
        icon = figures.bullet;
        color = chalk.white;
        title = "LOG";
    }

    const header = color(`${icon} ${title}`);
    const timeInfo = chalk.gray(`[${timestamp}]${latencyStr}`);
    const formattedMessage =
      typeof message === "object" ? JSON.stringify(message, null, 2) : message;

    console.log(
      boxen(`${header} ${timeInfo}\n\n${color(formattedMessage)}${fileInfo}`, {
        padding: 1,
        margin: 1,
        borderStyle: "round",
      })
    );
  }
}
