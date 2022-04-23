import path from "path";
import fs from "fs";
import { homedir } from "os";
const conextPath = path.join(homedir(), ".BdsCli");
export type configType = {};
let config: configType = {};
if (!(fs.existsSync(conextPath))) {
  fs.writeFileSync(conextPath, JSON.stringify(config, null, 2));
}
export async function updateContext(config: any): Promise<configType> {
  return config;
}
export async function getContext(): Promise<configType> {
  return config;
}