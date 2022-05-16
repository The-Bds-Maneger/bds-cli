#!/usr/bin/env node
const nexe = require("nexe");
const path = require("path");

let Platform = process.platform, Arch = process.arch;
const Target = (() => {let a = process.argv.find(arg => arg.includes("--target="));if (!!a) return a.replace("--target=", ""); return undefined;})();
const Configure = (() => {
  const confArgs = process.argv.find(arg => arg.includes("--config_args="));
  if (!!confArgs) {
    if (/".*"/.test(confArgs)) return confArgs.replace("--config_args=", "").match(/"(.*)"/)[1].split(/,/).map(a => a.trim());
    else return confArgs.replace("--config_args=", "").split(/,/).map(a => a.trim());
  }
  return undefined;
})();
if (/android/.test(Target)) Platform = "android";
else if (/linux/.test(Target)) Platform = "linux";
if (/aarch64|arm64/.test(Target)) Arch = "arm64";

const FileName = `BdsManegerCLI_${Platform}_${Arch}${process.platform === "win32" ? ".exe" : ""}`;
const options = {
  input: path.resolve(__dirname, "./dist/index.js"),
  targets: Target,
  resources: [
    path.resolve(__dirname, "package*.json"),
    path.resolve(__dirname, "./dist")
  ],
  output: path.resolve(process.cwd(), FileName),
  configure: Configure
};

if (process.argv.includes("--verbose")) console.log("Base config:\n", options);
nexe.compile(options).catch(err => {
  if (String(err).includes("--build")) {
    console.log("Attempting to build for current platform...");
    return nexe.compile({
      ...options,
      build: true,
      verbose: process.argv.includes("--verbose"),
      python: process.platform === "win32" ? "python.exe" : "python3"
    });
  }
  throw err;
}).then(() => {
  console.log("Build success");
  console.log("Build path:", path.resolve(process.cwd(), FileName));
});
