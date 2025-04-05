import fs from "fs-extra";
import crypto from "crypto";

export const getHash = (path) =>
  new Promise((resolve, reject) => {
    const hash = crypto.createHash("md5");
    const rs = fs.createReadStream(path);
    rs.on("error", reject);
    rs.on("data", (chunk) => hash.update(chunk));
    rs.on("end", () => resolve(hash.digest("hex")));
  });
