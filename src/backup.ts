import path from "path";
import { promises as fsPromise } from "fs";
import { Argv as yargsArgv } from "yargs";
import BdsCore from "@the-bds-maneger/core";

export default async function createBackup(yargs: yargsArgv): Promise<void> {
  const options = yargs.option("zip", {
    alias: "z",
    describe: "Create zip backup and sava in current directory",
    demandOption: false,
    type: "boolean",
    default: false
  }).option("git", {
    alias: "g",
    describe: "Git Repository, example to remote: -g \"<user>,<pass>,<Url>\", or local: -g \"local\"",
    demandOption: false,
    type: "string"
  });
  const ops = await options.parseAsync()
  if (!!ops.git) {
    if (ops.git.toLocaleLowerCase() === "local") return BdsCore.Backup.gitBackup();
    else {
      const [user, pass, url] = ops.git.split(",");
      return BdsCore.Backup.gitBackup({
        repoUrl: url,
        Auth: {
          Username: user,
          PasswordToken: pass
        }
      });
    }
  } else if (!!ops.zip) {
    const storageZip = path.join(process.cwd(), "Bdsbackup_"+new Date().toString().replace(/[-\(\)\:\s+]/gi, "_"))+".zip"
    console.log("Creating zip backup...");
    const zipBuffer = await BdsCore.Backup.CreateBackup(false);
    console.log("Saving zip backup in "+storageZip);
    return fsPromise.writeFile(storageZip, zipBuffer);
  } else {
    yargs.showHelp();
  };
}