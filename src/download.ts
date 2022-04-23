import { Argv as yargsArgv } from "yargs";
import * as BdsCore from "@the-bds-maneger/core";
import * as serverVersions from "@the-bds-maneger/server_versions";
import cli_color from "cli-color";

export default async function downloadManeger(yargs: yargsArgv): Promise<void> {
  const options = yargs.option("platform", {
    alias: "p",
    describe: "Bds Core Platform",
    demandOption: true,
    type: "string",
    choices: BdsCore.bdsTypes.PlatformArray,
    default: "bedrock"
  }).option("version", {
    alias: "v",
    describe: "Server Version",
    demandOption: false,
    type: "string",
    default: "latest"
  }).option("listVersions", {
    alias: "l",
    describe: "List all available versions to selected platform",
    type: "boolean",
    default: false
  }).parseSync();
  const Platform = options.platform as BdsCore.bdsTypes.Platform;
  if (options.listVersions) {
    console.log("Loading available versions...");
    const versions = await serverVersions.getAllVersions(Platform);
    let toOut = "";
    for (const {version, datePublish, isLatest} of versions) {
      toOut += "\n";
      if (isLatest) toOut += cli_color.blueBright("Latest - ");
      toOut += `${cli_color.redBright(version)}: Release date: ${datePublish.getDate()}/${datePublish.getMonth()+1}/${datePublish.getFullYear()}`;
    }
    console.log(toOut);
  } else {
    console.log("Starting Download...");
    return BdsCore.downloadServer.DownloadServer(Platform, options.version === "latest"?true:options.version).then(res => {
      console.log("Sucess to download server");
      console.info("Release date: %s", `${res.Date.getDate()}/${res.Date.getMonth()+1}/${res.Date.getFullYear()}`);
    });
  }
}