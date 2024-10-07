import { CONST } from "./common/const.js";
import { configure } from "@vendia/serverless-express";
import express from "express";
import systemController from "./controller/systemController.js";
import creatorController from "./controller/creatorController.js";
import memberController from "./controller/memberController.js";
import registController from "./controller/registController.js";
import editorController from "./controller/editorController.js";
import getkeyController from "./controller/getkeyController.js";
import applyController from "./controller/applyController.js";
import discordService from "./service/discordService.js";
import expressRouter from "./router/expressRouter.js"; // ルートのインポート

if (CONST.API_ENV == undefined) {
  process.exit(1);
}

const app = express();
app.use("/", expressRouter);

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});

app.use(express.json());

app.get("/", async (_, res) => {
  const result = "<h1>" + CONST.SERVER_INFO + " ver." + CONST.VERSION + "</h1>";
  res.send(result);
});

const server = configure({ app });

export const handler = async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false;

  if (event.pathParameters) {
    return server(event, context);
  }

  if (event.Records && event.Records[0].eventSource === "aws:sqs") {
    for (const record of event.Records) {
      const message = JSON.parse(record.body);
      switch (message.function) {
        case "system-connect":
          const req = JSON.parse(message.params.message);
          req.apivar = message.params.apivar;
          switch (req.data.name) {
            case "system":
              await systemController.connect(req);
              break;
            case "creator":
              await creatorController.connect(req);
              break;
            case "member":
              await memberController.connect(req);
              break;
            case "regist":
              await registController.connect(req);
              break;
            case "editor":
              await editorController.connect(req);
              break;
            case "getkey":
              await getkeyController.connect(req);
              break;
            case "apply":
              await applyController.connect(req);
              break;
          }
          break;
        case "discord-response":
          await discordService.sendDiscordResponse(
            message.params.message,
            message.params.mesToken
          );
          break;
        case "discord-message":
          await discordService.sendDiscordMessage(
            message.params.message,
            message.params.channelId
          );
          break;
        case "discord-direct-message":
          await discordService.sendDiscordDm(
            message.params.message,
            message.params.userId
          );
          break;
        default:
          console.log(
            "function not found | VER." + CONST.API_ENV + "-" + CONST.VERSION
          );
      }
    }

    return {
      statusCode: 200,
      body: `${CONST.SERVER_INFO} ver.${CONST.VERSION} SQS message processed`,
    };
  }

  return {
    statusCode: 400,
    body: "Unsupported event source",
  };
};
