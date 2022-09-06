#!/usr/bin/env node
import * as path from "node:path";
import * as nexe from "nexe";
import yargs from "yargs";

const Yargs = yargs(process.argv.slice(2)).help().version(false).alias("h", "help").wrap(yargs.terminalWidth()).option("Arch", {
  alias: "a",
  type: "string",
  default: process.arch,
  description: "Target arch"
}).option("Platform", {
  alias: "p",
  type: "string",
  default: process.platform,
  description: "Target OS/Platform"
}).option("conf", {
  alias: "c",
  type: "array",
  default: [],
  description: "Extra config to nexe"
}).option("verbose", {
  type: "boolean",
  alias: "VV",
  default: false
}).option("build", {
  alias: "b"
}).parseSync();

const { Arch, Platform, conf } = Yargs;

const FileName = `BdsManegerCLI_${Platform}_${Arch}${Platform === "win32" ? ".exe" : ""}`;
const options: Partial<nexe.NexeOptions> = {
  input: path.resolve(__dirname, "./dist/index.js"),
  targets: [`${Platform}_${Arch}`],
  resources: [
    path.resolve(__dirname, "package*.json"),
    path.resolve(__dirname, "./dist")
  ],
  output: path.resolve(process.cwd(), FileName),
  configure: !conf?[]:conf
};

if (Yargs.verbose) console.log("Base config:\n", options);
nexe.compile(options).catch(err => {
  if (String(err).includes("--build")) {
    console.log("Attempting to build for current platform...");
    return nexe.compile({
      ...options,
      build: true,
      verbose: Yargs.verbose,
      python: process.platform === "win32" ? "python.exe" : "python3"
    });
  }
  throw err;
}).then(() => {
  console.log("Build success");
  console.log("Build path:", path.resolve(process.cwd(), FileName));
});
