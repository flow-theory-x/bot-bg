import { CONST } from "./common/const.js";
import controller from "./service/controller.js";
import discordService from "./service/discord.js";

export const handler = async (event) => {
  for (let key in event.Records) {
    const message = JSON.parse(event.Records[key].body);
    switch (message.function) {
      case "dynamo-sync":
        await controller.dynamoList();
        console.log(
          "dynamoList updated processing | VER." +
            CONST.API_ENV +
            "-" +
            CONST.VERSION +
            "[" +
            CONST.DEPLOY_DATETIME +
            "]"
        );
        await controller.dynamoUpdate();
        break;
      case "discord-response":
        console.log(
          "discord-response" +
            CONST.API_ENV +
            "-" +
            CONST.VERSION +
            "[" +
            CONST.DEPLOY_DATETIME +
            "]"
        );
        console.dir(message);
        await discordService.sendDiscordResponse(
          message.params.message,
          message.params.mesToken
        );
        break;
      case "discord-message":
        console.log(
          "discord-message" +
            CONST.API_ENV +
            "-" +
            CONST.VERSION +
            "[" +
            CONST.DEPLOY_DATETIME +
            "]"
        );
        console.dir(message);
        await discordService.sendDiscordMessage(
          message.params.message,
          message.params.channelId
        );
        break;
      case "discord-direct-message":
        console.log(
          "discord-Direct-message" +
            CONST.API_ENV +
            "-" +
            CONST.VERSION +
            "[" +
            CONST.DEPLOY_DATETIME +
            "]"
        );
        console.dir(message);
        await discordService.sendDiscordDm(
          message.params.message,
          message.params.userId
        );
        break;
      case "nft-getkey":
        console.log(
          "NFT| GETKEY." +
            CONST.API_ENV +
            "-" +
            CONST.VERSION +
            "[" +
            CONST.DEPLOY_DATETIME +
            "]"
        );
        console.dir(message);
        const response = await fetch(
          "https://ehfm6q914a.execute-api.ap-northeast-1.amazonaws.com/getkey/" +
            message.params.uid +
            "/" +
            message.params.contract +
            "/" +
            message.params.id
        );
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();

        await discordService.sendDiscordMessage(
          message.params.uid + "\n" + data.content,
          CONST.DISCORD_ADMIN_USER_ID
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
