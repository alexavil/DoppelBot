import child from "child_process";

let commit = child.execSync("git rev-parse --short HEAD").toString().trim();

export default commit;