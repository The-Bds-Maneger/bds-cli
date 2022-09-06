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
    choices: BdsCore.globalType.PlatformArray,
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
  const Platform = options.platform as BdsCore.globalType.Platform;
  if (options.listVersions) {
    console.log("Loading available versions...");
    const versions = await serverVersions.findVersion(Platform) as any[];
    let toOut = "";
    for (const {version, datePublish} of versions) {
      const dat = new Date(datePublish);
      toOut += `\n${cli_color.redBright(version)}: Release date: ${dat.getDate()}/${dat.getMonth()+1}/${dat.getFullYear()}`;
    }
    console.log(toOut);
  } else {
    console.log("Starting Download...");
    return BdsCore[Platform].DownloadServer(options.version === "latest"?true:options.version).then(res => {
      console.log("Sucess to download server");
      console.info("Release date: %s", `${res.publishDate.getDate()}/${res.publishDate.getMonth()+1}/${res.publishDate.getFullYear()}`);
    });
  }
}
