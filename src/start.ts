import readline from "readline"
import { isValidCron } from "cron-validator";
import cli_color from "cli-color";
import * as BdsCore from "@the-bds-maneger/core";
import { Argv as yargsArgv } from "yargs";

export default async function startServer(yargs: yargsArgv): Promise<void> {
  const options = await yargs.option("platform", {
    alias: "p",
    describe: "Bds Core Platform",
    demandOption: true,
    type: "string",
    choices: BdsCore.bdsTypes.PlatformArray,
    default: "bedrock"
  }).option("cronBackup", {
    alias: "c",
    describe: "cron job to backup server maps",
    type: "string",
    default: ""
  }).option("gitBackup", {
    alias: "g",
    describe: "git config to backup, equal 'backup -g \"<user>,<pass>,<Url>\" or backup -g \"local\"', required if cronBackup is set",
    type: "string",
    default: ""
  }).parseAsync();
  const Platform = options.platform as BdsCore.bdsTypes.Platform;
  if (!!options.cronBackup) {
    if (!(isValidCron(options.cronBackup, {seconds: options.cronBackup.split(/\s+/g).length >= 6}))) {
      console.error("Invalid cron job");
      process.exit(1);
    }
    if (!!options.gitBackup) {
      if (options.gitBackup !== "local") {
        const [user, pass, url] = options.gitBackup.split(",");
        if (!(user && pass && url)) {
          console.error("Invalid git config, disable git backup");
          options.gitBackup = "";
        }
      }
    }
  }
  const Server = await BdsCore.Server.Start(Platform);
  console.log("Session ID: %s", Server.id);
  Server.logRegister("all", data => console.log(cli_color.blueBright(data.replace("true", cli_color.greenBright("true"))).replace("false", cli_color.redBright("false"))));
  const Input = readline.createInterface({input: process.stdin,output: process.stdout})
  Input.on("line", line => Server.commands.execCommand(line));
  if (!!options.cronBackup) {
    console.log("Backup Maps enabled");
    const backupCron = Server.creteBackup(options.cronBackup);
    Server.onExit(() => backupCron.stop());
  }
  return new Promise(resolve => {
    let closed = false;
    Input.on("close", () => {
      if (closed) return;
      Server.stop();
      closed = true;
      resolve();
    });
    Server.onExit(code => {
      console.log("Server exit with code: %s", code);
      if (closed) return;
      Input.close();
      closed = true;
      resolve();
    });
  });
}