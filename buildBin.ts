#!/usr/bin/env node
import * as path from "node:path";
import * as nexe from "nexe";
let Platform = process.platform, Arch = process.arch;

const Target = ((): undefined|string => {let a = process.argv.find(arg => arg.includes("--target="));if (!!a) return a.replace("--target=", ""); return undefined;})();
const Configure = ((): undefined|string[] => {
  let confArgs = process.argv.find(arg => arg.includes("--config_args="));
  if (!!confArgs) {
    confArgs = confArgs.replace("--config_args=", "");
    if (/".*"/.test(confArgs)) {
      let testArgs = confArgs.match(/"(.*)"/);
      if (!!testArgs) confArgs = testArgs[1];
    }
    return confArgs.split(/\s+?,\s+/).map(a => a.trim());
  }
  return undefined;
})();

if (!!Target) {
  if (/android/.test(Target)) Platform = "android";
  else if (/linux/.test(Target)) Platform = "linux";
  if (/aarch64|arm64/.test(Target)) Arch = "arm64";
}

const FileName = `BdsManegerCLI_${Platform}_${Arch}${process.platform === "win32" ? ".exe" : ""}`;
const options: Partial<nexe.NexeOptions> = {
  input: path.resolve(__dirname, "./dist/index.js"),
  targets: !!Target? [Target]:undefined,
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
