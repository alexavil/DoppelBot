import util from "util";
import fs from "fs-extra";
import path from "path";
import url from "url";

const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let debugLog;

switch (process.env.DEBUG) {
  case "true": {
    const log_file = fs.createWriteStream(process.cwd() + "/logs/debug.log", {
      flags: "a",
    });
    const log_stdout = process.stdout;
    debugLog = (msg) => {
      log_file.write(
        new Date().toLocaleString() + " --- " + util.format(msg) + "\n",
      );
      log_stdout.write(util.format(msg) + "\n");
    };
    break;
  }
  case "false":
  default: {
    debugLog = (msg) => {
      return false;
    };
    break;
  }
}

export default debugLog;
