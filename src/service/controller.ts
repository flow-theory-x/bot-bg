import { CONST } from "../common/const.js";
import discordService from "../service/discord.js";
import dynamoService from "../service/dynamo.js";
import memberModel from "../model/members.js";

const connect = async (req) => {
  const sendMes =
    "システムコマンド" +
    req.data.name +
    " : " +
    req.data.options[0].value +
    "リクエストを受信\n送信者：" +
    req.member.user.global_name +
    "\napi.ver: " +
    req.apivar +
    "\nbg.ver : " +
    CONST.VERSION;
  await discordService.sendDiscordResponse(sendMes, req.token);
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
