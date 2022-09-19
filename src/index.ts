#!/usr/bin/env node
import readline from "node:readline";
import yargs from "yargs";
import * as BdsCore from "@the-bds-maneger/core";
import cliColors from "cli-color";
import { actions } from "@the-bds-maneger/core/dist/globalPlatfroms";

// type currentPlatform = "Bedrock"|"Java"|"Spigot"|"PocketmineMP"|"Powernukkit";
const Yargs = yargs(process.argv.slice(2)).help().version(false).alias("h", "help").wrap(yargs.terminalWidth()).option("platform", {
  alias: "P",
  description: "Select Bds Maneger core platform",
  demandOption: true,
  type: "string",
  choices: [
    "Bedrock",
    "Java",
    "Spigot",
    "PocketmineMP",
    "Powernukkit"
  ]
});

// Install Server
Yargs.command("download", "Download and Install server", yargs => {
  const options = yargs.option("version", {alias: "v", description: "Server version", default: "latest"}).parseSync();
  if (options.platform === "Bedrock") return BdsCore.Bedrock.installServer(options.version);
  else if (options.platform === "Java") return BdsCore.Java.installServer(options.version);
  else if (options.platform === "Spigot") return BdsCore.Spigot.installServer(options.version);
  else if (options.platform === "PocketmineMP") return BdsCore.PocketmineMP.installServer(options.version);
  else if (options.platform === "Powernukkit") return BdsCore.Powernukkit.installServer(options.version);
  throw new Error("Invalid platform");
});
Yargs.command("install", "Download and Install server", yargs => {
  const options = yargs.option("version", {alias: "v", description: "Server version", default: "latest"}).parseSync();
  if (options.platform === "Bedrock") return BdsCore.Bedrock.installServer(options.version);
  else if (options.platform === "Java") return BdsCore.Java.installServer(options.version);
  else if (options.platform === "Spigot") return BdsCore.Spigot.installServer(options.version);
  else if (options.platform === "PocketmineMP") return BdsCore.PocketmineMP.installServer(options.version);
  else if (options.platform === "Powernukkit") return BdsCore.Powernukkit.installServer(options.version);
  throw new Error("Invalid platform");
});

// Start Server
Yargs.command("run", "Start server", async yargs => {
  const options = yargs.option("javaMaxMemory", {alias: "M", type: "number"}).option("installGeyser", {alias: "g", type: "boolean", description: "Install geyser plugin to Spigot"}).parseSync();
  let server: actions;
  if (options.platform === "Bedrock") server = await BdsCore.Bedrock.startServer();
  else if (options.platform === "Java") server = await BdsCore.Java.startServer({maxMemory: options.javaMaxMemory});
  else if (options.platform === "Spigot") server = await BdsCore.Spigot.startServer({maxMemory: options.javaMaxMemory, configureGeyser: options.installGeyser});
  else if (options.platform === "PocketmineMP") server = await BdsCore.PocketmineMP.startServer();
  else if (options.platform === "Powernukkit") server = await BdsCore.Powernukkit.startServer({maxMemory: options.javaMaxMemory});
  else throw new Error("Invalid platform");
  server.on("log_stderr", data => console.log(cliColors.redBright(data)));
  server.on("log_stdout", data => console.log(cliColors.green(data)));
  server.once("serverStarted", () => {
    let log = "";
    server.portListening.forEach(port => {
      log += `Port listen: ${port.port}\n${"\tTo: "+(port.plugin === "geyser"?"Bedrock":(port.plugin||options.platform)+"\n")}`;
    });
    console.log(log.trim());
    console.log(cliColors.yellowBright("Commands inputs now avaible"))
    const line = readline.createInterface({input: process.stdin, output: process.stdout});
    line.on("line", line => server.runCommand(line));
    line.once("SIGINT", () => server.stopServer());
    line.once("SIGCONT", () => server.stopServer());
    line.once("SIGTSTP", () => server.stopServer());
    server.once("exit", () => line.close());
  });
  return server.waitExit();
});

// Update settings (Alpha)
// Yargs.command("config", "Platform config", yargs=>yargs.command("set", "Set platform config", yargs => yargs, () => {}).command({command: "*", handler: () => {Yargs.showHelp();}}), ()=>{});

Yargs.command({command: "*", handler: () => {Yargs.showHelp();}}).parseAsync();
