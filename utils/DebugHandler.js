import util from "util";
import fs from "fs-extra";

let debugLog;

switch (process.env.DEBUG) {
  case "true": {
    const log_file = fs.createWriteStream(process.cwd() + "/logs/debug.log", {
      flags: "a",
    });
    const log_stdout = process.stdout;
    debugLog = (str) => {
        let msg = "[DEBUG] " + str;
      log_file.write(
        new Date().toLocaleString() + " --- " + util.format(msg) + "\n",
      );
      log_stdout.write(util.format(msg) + "\n");
    };
    break;
  }
  case "false":
  default: {
    debugLog = (str) => {
      return false;
    };
    break;
  }
}

export default debugLog;
