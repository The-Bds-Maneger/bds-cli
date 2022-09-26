const readline = require("node:readline");
const cliColors = require("cli-color");
const yargs = require("yargs");
const bdsCore = require("@the-bds-maneger/core");

const Yargs = yargs(process.argv.slice(2)).help().version(false).alias("h", "help").wrap(yargs.terminalWidth());
function addPlatform(Yargs = yargs) {
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
    }).parseSync();

    let server;
    if (options.platform === "Bedrock") server = await bdsCore.Bedrock.startServer();
    else if (options.platform === "Java") server = await bdsCore.Java.startServer({maxMemory: options.javaMaxMemory});
    else if (options.platform === "Spigot") server = await bdsCore.Spigot.startServer({maxMemory: options.javaMaxMemory, maxFreeMemory: options.javaAllFreeMem});
    else if (options.platform === "Paper") server = await bdsCore.PaperMC.startServer({maxMemory: options.javaMaxMemory, maxFreeMemory: options.javaAllFreeMem});
    else if (options.platform === "PocketmineMP") server = await bdsCore.PocketmineMP.startServer();
    else if (options.platform === "Powernukkit") server = await bdsCore.Powernukkit.startServer({maxMemory: options.javaMaxMemory});
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
  })
}).command("bds", "Bds core Manegers", Yargs => {
  return Yargs.command("import", "import from another computer", async yargs => {
    const options = yargs.options("host", {
      type: "string"
    }).options("port", {
      type: "number"
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
}).command("plugin", "Plugin maneger", yargs => {
  return yargs.command("install", "Install plugin to server (alpha)", async yargs => {
    const options = addPlatform(yargs).option("plugin", {alias: "p", type: "array", string: true}).parseSync();
    let plugin;
    if (options.platform === "Paper") plugin = new bdsCore.pluginManeger("paper");
    else if (options.platform === "Spigot") plugin = new bdsCore.pluginManeger("spigot");
    else if (options.platform === "PocketmineMP") plugin = new bdsCore.pluginManeger("pocketmine");
    else if (options.platform === "Powernukkit") plugin = new bdsCore.pluginManeger("powernukkit");
    else throw new Error("Platform not support");
    await plugin.loadPlugins();
    for (const pluginName of options.plugin) await plugin.installPlugin(String(pluginName));
  }).command({command: "*", handler: () => {yargs.showHelp();}});
}).command({command: "*", handler: () => {Yargs.showHelp();}});
Yargs.parseAsync();
