#!/usr/bin/env node
const path = require("node:path");
const yargs = require("yargs");
const pkg = require("pkg");

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

const FileName = `BdsManegerCLI_${Yargs.Platform}_${Yargs.Arch}${Yargs.Platform === "win32" ? ".exe" : ""}`;
pkg.exec([
  path.resolve(__dirname, "./dist/index.js"),
  "--output", path.join(process.cwd(), FileName),
  "--target", `${Yargs.Platform}-${Yargs.Arch}`,
]);