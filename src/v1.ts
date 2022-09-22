import crypto from "node:crypto";
import fs from "node:fs";
import express from "express";
import * as bdsCore from "@the-bds-maneger/core";
import { actions } from "@the-bds-maneger/core/dist/globalPlatfroms";
const app = express.Router();
export default app;
const sessions: {[sessionId: string]: actions} = {};

type installRequestBody = {
  platform: "bedrock"|"java"|"spigot"|"paper"|"powernukkit"|"pocketmine",
  version: string,
};

app.get("/list", ({res}) => res.json(Object.keys(sessions)));
app.post<any, any, any, any, installRequestBody>("/install", async (req, res) => {
  const body = req.query;
  if (!body) return res.sendStatus(500);
  if (body.platform === "bedrock") {
    return res.status(200).json({
      installRes: await bdsCore.Bedrock.installServer(body?.version||"latest"),
      platform: "Bedrock"
    });
  } else if (body.platform === "java") {
    return res.status(200).json({
      installRes: await bdsCore.Java.installServer(body?.version||"latest"),
      platform: "Java"
    });
  } else if (body.platform === "spigot") {
    return res.status(200).json({
      installRes: await bdsCore.Spigot.installServer(body?.version||"latest"),
      platform: "Spigot"
    });
  } else if (body.platform === "paper") {
    return res.status(200).json({
      installRes: await bdsCore.PaperMC.installServer(body?.version||"latest"),
      platform: "PaperMC"
    });
  } else if (body.platform === "powernukkit") {
    return res.status(200).json({
      installRes: await bdsCore.Powernukkit.installServer(body?.version||"latest"),
      platform: "Powernukkit"
    });
  } else if (body.platform === "pocketmine") {
    return res.status(200).json({
      installRes: await bdsCore.PocketmineMP.installServer(body?.version||"latest"),
      platform: "PocketmineMP"
    });
  }
  return res.status(400).json({
    error: "Invalid platform"
  });
});

type startQuery = {
  platform: "bedrock"|"java"|"spigot"|"paper"|"powernukkit"|"pocketmine",
  pluginList?: string
};
app.post<any, any, any, any, startQuery>("/start", async (req, res) => {
  const platform = req.query?.platform;
  if (!platform) return res.json({error: "Platform not specified"});
  const sesssionId = crypto.randomBytes(16).toString("hex");
  if (platform === "bedrock") {
    const session = await bdsCore.Bedrock.startServer();
    sessions[sesssionId] = session;
    return res.json({
      id: sesssionId,
    });
  } else if (platform === "java") {
    const session = await bdsCore.Java.startServer();
    sessions[sesssionId] = session;
    return res.json({
      id: sesssionId,
    });
  } else if (platform === "paper") {
    const session = await bdsCore.PaperMC.startServer({
      maxFreeMemory: true,
      pluginList: req.query?.pluginList?.split(",").map(plu => plu.trim())
    });
    sessions[sesssionId] = session;
    return res.json({
      id: sesssionId,
    });
  } else if (platform === "spigot") {
    const session = await bdsCore.Spigot.startServer({
      maxFreeMemory: true,
      pluginList: req.query?.pluginList?.split(",").map(plu => plu.trim())
    });
    sessions[sesssionId] = session;
    return res.json({
      id: sesssionId,
    });
  } else if (platform === "powernukkit") {
    const session = await bdsCore.Powernukkit.startServer({maxFreeMemory: true});
    sessions[sesssionId] = session;
    return res.json({
      id: sesssionId,
    });
  } else if (platform === "pocketmine") {
    const session = await bdsCore.PocketmineMP.startServer();
    sessions[sesssionId] = session;
    return res.json({
      id: sesssionId,
    });
  }

  return res.status(400).json({
    error: "Invalid platform"
  });
});

app.get("/:sessionId/log", async (req, res) => {
  const session = sessions[req.params.sessionId];
  if (!session) return res.status(404).json({error: "Session id not exists"});
  if (session.processConfig.options?.logPath?.stdout && fs.existsSync(session.processConfig.options?.logPath?.stdout)) return fs.createReadStream(session.processConfig.options.logPath.stdout).pipe(res);
  else return res.status(400).json({
    error: "no Log files"
  });
});