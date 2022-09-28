import readline from "node:readline";
import cliColors from "cli-color";
import yargs from "yargs";
import * as bdsCore from "@the-bds-maneger/core";

const Yargs = yargs(process.argv.slice(2)).help().version(false).alias("h", "help").wrap(yargs.terminalWidth());
function addPlatform(Yargs: yargs.Argv) {
  return Yargs.option("platform", {
    alias: "P",
    description: "Select Bds Maneger core platform",
    demandOption: true,
    type: "string",
    choices: [
      "Bedrock",
      "Java",
      "Spigot",
      "PocketmineMP",
      "Powernukkit",
      "Paper"
    ]
  });
}

Yargs.command("server", "Server maneger", Yargs => {
  return Yargs.command("install", "Download and Install server", yargs => {
    const options = addPlatform(yargs).option("version", {alias: "v", description: "Server version", default: "latest"}).parseSync();
    if (options.platform === "Bedrock") return bdsCore.Bedrock.installServer(options.version);
    else if (options.platform === "Java") return bdsCore.Java.installServer(options.version);
    else if (options.platform === "Spigot") return bdsCore.Spigot.installServer(options.version);
    else if (options.platform === "Paper") return bdsCore.PaperMC.installServer(options.version);
    else if (options.platform === "PocketmineMP") return bdsCore.PocketmineMP.installServer(options.version);
    else if (options.platform === "Powernukkit") return bdsCore.Powernukkit.installServer(options.version);
    throw new Error("Invalid platform");
  }).command("run", "Start server", async yargs => {
    const options = addPlatform(yargs).option("javaMaxMemory", {
      alias: "m",
      type: "number",
      description: "Set max memory to use, is ignored if set javaAllFreeMem"
    }).option("javaAllFreeMem", {
      alias: "a",
      type: "boolean",
      description: "Use all free ram memory to run Java server"
    }).option("serverId", {
      type: "string",
      alias: "i",
      default: "default"
    }).parseSync();

    const platformOptions: bdsCore.platformPathManeger.bdsPlatformOptions = {
      id: options.serverId||"default"
    };
    let server: bdsCore.globalPlatfroms.actions;
    if (options.platform === "Bedrock") server = await bdsCore.Bedrock.startServer(platformOptions);
    else if (options.platform === "PocketmineMP") server = await bdsCore.PocketmineMP.startServer(platformOptions);
    else if (options.platform === "Java") server = await bdsCore.Java.startServer({maxMemory: options.javaMaxMemory, platformOptions});
    else if (options.platform === "Spigot") server = await bdsCore.Spigot.startServer({maxMemory: options.javaMaxMemory, maxFreeMemory: options.javaAllFreeMem, platformOptions});
    else if (options.platform === "Paper") server = await bdsCore.PaperMC.startServer({maxMemory: options.javaMaxMemory, maxFreeMemory: options.javaAllFreeMem, platformOptions});
    else if (options.platform === "Powernukkit") server = await bdsCore.Powernukkit.startServer({maxMemory: options.javaMaxMemory, platformOptions});
    else throw new Error("Invalid platform");

    server.on("log_stderr", data => console.log(cliColors.redBright(data)));
    server.on("log_stdout", data => console.log(cliColors.greenBright(data)));
    server.on("exit", data => console.info("Server exit with %s, signal: %s", data.code, data.signal));

    const line = readline.createInterface({input: process.stdin, output: process.stdout});
    line.on("line", line => server.runCommand(line));
    line.once("SIGINT", () => server.stopServer());
    line.once("SIGCONT", () => server.stopServer());
    line.once("SIGTSTP", () => server.stopServer());
    server.once("exit", () => line.close());
    return server.waitExit();
  }).command({command: "*", handler: () => {Yargs.showHelp();}});
}).command("bds", "Bds core Manegers", Yargs => {
  return Yargs.command("import", "import from another computer", async yargs => {
    const options = yargs.options("host", {
      type: "string",
      demandOption: true
    }).options("port", {
      type: "number",
      demandOption: true
    }).option("authToken", {
      type: "string",
      demandOption: true,
      required: true
    }).parseSync();
    return bdsCore.importBds({host: options.host, port: options.port, authToken: options.authToken});
  }).command("export", "Export bds root folder", async yargs => {
    const opts = yargs.option("port", {
      type: "number",
      description: "listen port server, default is random"
    }).parseSync();
    const server = new bdsCore.exportBds();
    await server.listen(opts.port);
    return server.waitClose();
  });
}).command({command: "*", handler: () => {Yargs.showHelp();}});
Yargs.parseAsync();
