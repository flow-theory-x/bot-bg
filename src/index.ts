import { CONST } from "./common/const.js";
import discordService from "./service/discord.js";
import controller from "./service/controller.js";

export const handler = async (event) => {
  for (let key in event.Records) {
    const message = JSON.parse(event.Records[key].body);
    switch (message.function) {
      case "system-connect":
        const req = JSON.parse(message.params.message);
        req.apivar = message.params.apivar;
        await controller.connect(req);
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
    body: JSON.stringify("It Works."),
  };
  return response;
};
