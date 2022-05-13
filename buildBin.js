#!/usr/bin/env node
const nexe = require("nexe");
const path = require("path");
const fs = require("fs");

const options = {
  input: path.resolve(__dirname, "./dist/index.js"),
  resources: [
    path.resolve(__dirname, "package*.json"),
    path.resolve(__dirname, "./dist")
  ],
  output: path.resolve(process.cwd(), `bin_${process.platform}_${process.arch}${process.platform === "win32" ? ".exe" : ""}`),
  targets: (() => {let a = process.argv.find(arg => arg.includes("--target="));if (!!a) return a.replace("--target=", ""); return undefined;})(),
  configure: (() => {
    const confArgs = process.argv.find(arg => arg.includes("--config_args="));
    if (!!confArgs) {
      if (/".*"/.test(confArgs)) return confArgs.replace("--config_args=", "").match(/"(.*)"/)[1].split(/,/).map(a => a.trim());
      else return confArgs.replace("--config_args=", "").split(/,/).map(a => a.trim());
    }
    return undefined;
  })()
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
  console.log("Build path:", path.resolve(process.cwd(), `bin_${process.platform}_${process.arch}${process.platform === "win32" ? ".exe" : ""}`));
});
