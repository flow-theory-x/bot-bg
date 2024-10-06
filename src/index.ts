import { CONST } from "./common/const.js";
import discordService from "./service/discordService.js";
import systemController from "./controller/systemController.js";
import creatorController from "./controller/creatorController.js";
import memberController from "./controller/memberController.js";

export const handler = async (event) => {
  for (let key in event.Records) {
    const message = JSON.parse(event.Records[key].body);
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

  const response = {
    statusCode: 200,
    body: `${CONST.SERVER_INFO} ver.${CONST.VERSION}`,
  };
  return response;
};
