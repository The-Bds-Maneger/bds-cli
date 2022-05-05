#!/usr/bin/env node
const nexe = require("nexe");
const path = require("path");
const fs = require("fs");

const options = {
  input: path.resolve(__dirname, "./dist/index.js"),
  resources: fs.readdirSync(path.resolve(__dirname, "./dist/")).map(file => path.resolve(__dirname, "./dist/", file)),
  output: path.resolve(process.cwd(), `bin_${process.platform}_${process.arch}${process.platform === "win32" ? ".exe" : ""}`),
};

nexe.compile(options).catch(err => {
  if (String(err).includes("--build")) {
    console.log("Attempting to build for current platform...");
    return nexe.compile({
      ...options,
      build: true,
      verbose: process.argv.includes("--verbose"),
      python: process.platform === "win32" ? "python.exe" : "python3",
    });
  }
  throw err;
}).then(() => {
  console.log("Build success");
  console.log("Build path:", path.resolve(process.cwd(), `bin_${process.platform}_${process.arch}${process.platform === "win32" ? ".exe" : ""}`));
});