import { Argv as yargsArgv } from "yargs";
import * as bdscore from "@the-bds-maneger/core";
// import * as BdsCore from "@the-bds-maneger/core";

export default async function createServerConfig(yargs: yargsArgv): Promise<any> {
  const ya = yargs.option("platform", {
    alias: "p",
    describe: "Bds Core Platform",
    demandOption: true,
    type: "string",
    choices: bdscore.globalType.PlatformArray,
    default: "bedrock"
  }).command("get", "Get Platform config", async yargs => {
    if (!yargs.parseSync().platform) return yargs.showHelp();
    const platform = yargs.parseSync().platform as bdscore.globalType.Platform;
    if (platform === "bedrock") {
      const bedrockConfig = await bdscore.bedrock.config.getConfig();
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
    const platform = yargs.parseSync().platform as bdscore.globalType.Platform;
    if (platform === "bedrock") {
      const currentConfig = await bdscore.bedrock.config.getConfig();
      const answers = await (await import("inquirer")).default.prompt([
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
      await bdscore.bedrock.config.CreateServerConfig({
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