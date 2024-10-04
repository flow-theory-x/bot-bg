import { CONST } from "../common/const.js";
import discordService from "../service/discord.js";
import dynamoService from "../service/dynamo.js";
import memberModel from "../model/members.js";

const connect = async (req) => {
  let sendMes = req.data.options[0].value + "を受け付けました\n";
  switch (req.data.options[0].value) {
    case "ver":
      sendMes =
        "バージョン情報: " +
        req.data.name +
        " : " +
        req.data.options[0].value +
        "リクエストを受信\n送信者：" +
        req.member.user.global_name +
        "\napi.ver: " +
        req.apivar +
        "\nbg.ver : " +
        CONST.VERSION;
      break;
    case "info":
      sendMes += "\nchannelId: " + req.channel_id;
      sendMes += "\nguild_id: " + req.guild_id;
      sendMes += "\napplication_id: " + req.application_id;
      sendMes += "\nmember info: " + JSON.stringify(req.member, null, 2);
      break;
    case "totalinfo":
      sendMes += "\ntotal info: " + JSON.stringify(req, null, 2);
    default:
      sendMes =
        "システムコマンド " +
        req.data.name +
        " : " +
        req.data.options[0].value +
        "リクエストを受信\n送信者：" +
        req.member.user.global_name +
        "\napi.ver: " +
        req.apivar +
        "\nbg.ver : " +
        CONST.VERSION;
  }
  await discordService.sendDiscordResponse(sendMes, req.token, req.channel_id);
};

const discordList = async () => {
  const result = await discordService.getDisplayData();
  console.log("Discord test:" + result);
  return result;
};

const dynamoList = async () => {
  console.log("DYNAMO SETTING : " + CONST.DYNAMO_TABLE_PREFIX);
  const result = await dynamoService.getDisplayData(
    CONST.DYNAMO_TABLE_PREFIX + "_member"
  );
  console.log("Dynamo test:" + result);
  return result;
};

const dynamoUpdate = async () => {
  const discordList = await discordService.getMemberList();
  const dynamoList = await memberModel.getAllList();
  await memberModel.memberListUpdate(discordList, dynamoList);
};

const controller = {
  connect,
  discordList,
  dynamoList,
  dynamoUpdate,
};

export default controller;
