import Discord from "discord.js";
import fs from "fs-extra";
import os from "os";

import { convertToString } from "./TimeConverter.js"

import { dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

let BotError = {
  err: undefined,
  sysinfo: {
    commit: undefined,
    os: `${os.type()} ${os.release} ${os.arch()}`,
    node_ver: process.version,
    djs_ver: Discord.version,
    ram: Math.round(os.totalmem() / 1024 / 1024),
    cpu: os.cpus()[0].model,
  },
};

export default BotError;
