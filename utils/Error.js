import Discord from "discord.js";
import os from "os";

Error.stackTraceLimit = 20;

class BotError {
  constructor() {
    this.err = undefined;
    this.sysinfo = {
      commit: undefined,
      os: `${os.type()} ${os.release()} ${os.arch()}`,
      node_ver: process.version,
      djs_ver: Discord.version,
      ram: Math.round(os.totalmem() / 1024 / 1024),
      cpu: os.cpus()[0].model,
    };
  }
  
  setError(error) {
    this.err = error;
  }

  getError() {
    return this.err;
  }

  getSystemInfo() {
    return this.sysinfo;
  }
}

export default BotError;
