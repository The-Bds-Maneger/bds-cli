#!/usr/bin/env node
import yargs from "yargs";
import startServer from "./start";
import backup from "./backup";
import download from "./download";
import config from "./config";

const Yargs = yargs(process.argv.slice(2)).help().version(false).alias("h", "help").wrap(yargs.terminalWidth())
.command("download", "Download and Install server", yargs => download(yargs))
.command("config", "Config server", yargs => config(yargs))
.command("start", "Start Server", yargs => startServer(yargs))
.command("backup", "Create Backups", yargs => backup(yargs))
.command({command: "*", handler: () => {Yargs.showHelp();}});
Yargs.parseAsync().then(() => process.exit(0));
