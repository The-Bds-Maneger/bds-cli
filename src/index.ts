import yargs from "yargs";
import express from "express";
import v1 from "./v1";
const daemon_options = yargs(process.argv.slice(2)).help().version(false).alias("h", "help").wrap(yargs.terminalWidth()).option("listen", {
  alias: "H",
  type: "array",
  default: ["3000"]
}).parseSync();

const app = express();
daemon_options.listen.forEach(listenOn => app.listen(listenOn, () => console.log("Listen on %s", listenOn)));
app.use(express.urlencoded({extended: true}));
app.use(express.json());
app.use((req, res, next) => {
  res.json = (body: any) => res.send(JSON.stringify(body, null, 2));
  next();
});

// v1
app.use("/v1", v1);

// All 404
app.all("*", ({res}) => res.status(404).json({error: "No endpoint"}));