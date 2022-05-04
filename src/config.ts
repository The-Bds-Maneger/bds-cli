import inquirer from "inquirer";
import { Argv as yargsArgv } from "yargs";
import bdscore from "@the-bds-maneger/core";
import { Platform } from "@the-bds-maneger/core/dist/dts/globalType";
// import * as BdsCore from "@the-bds-maneger/core";

export default async function createServerConfig(yargs: yargsArgv): Promise<any> {
  const ya = yargs.option("platform", {
    alias: "p",
    describe: "Bds Core Platform",
    demandOption: true,
    type: "string",
    choices: bdscore.bdsTypes.PlatformArray,
    default: "bedrock"
  }).command("get", "Get Platform config", async yargs => {
    if (!yargs.parseSync().platform) return yargs.showHelp();
    const platform = yargs.parseSync().platform as Platform;
    if (platform === "bedrock") {
      const bedrockConfig = await bdscore.platform.bedrock.config.getConfig();
      let showBedrock = "Bedrock Config:\n\n";
      showBedrock+="World name: "+bedrockConfig.worldName+"\n";
      showBedrock+="World seed: "+(bedrockConfig.worldSeed !== "null"?bedrockConfig.worldSeed:"No seed detected")+"\n";
      showBedrock+="Difficulty: "+bedrockConfig.difficulty+"\n";
      showBedrock+="Gamemode: "+bedrockConfig.gamemode+"\n";
      showBedrock+="Max players: "+bedrockConfig.maxPlayers;
      return console.log(showBedrock);
    }
    throw new Error(`Platform ${platform} not supported`);
  }).command("set", "Set platform config", async yargs => {
    if (!yargs.parseSync().platform) return yargs.showHelp();
    const platform = yargs.parseSync().platform as Platform;
    if (platform === "bedrock") {
      const currentConfig = await bdscore.platform.bedrock.config.getConfig();
      const answers = await inquirer.prompt([
        {
          type: "input",
          name: "worldName",
          message: "World name",
          default: currentConfig.worldName
        },
        {
          type: "input",
          name: "worldSeed",
          message: "World seed",
          default: currentConfig.worldSeed
        },
        {
          type: "input",
          name: "difficulty",
          message: "Difficulty",
          default: currentConfig.difficulty
        },
        {
          type: "input",
          name: "gamemode",
          message: "Gamemode",
          default: currentConfig.gamemode
        },
        {
          type: "input",
          name: "maxPlayers",
          message: "Max players",
          default: currentConfig.maxPlayers
        }
      ]);
      await bdscore.platform.bedrock.config.CreateServerConfig({
        worldName: answers.worldName,
        serverName: answers.worldName,
        worldSeed: answers.worldSeed,
        difficulty: answers.difficulty,
        gamemode: answers.gamemode,
        maxPlayers: answers.maxPlayers
      });
      return console.log("Sucess to set config");
    }
    throw new Error(`Platform ${platform} not supported`);
  });
  return ya.parseAsync();
}