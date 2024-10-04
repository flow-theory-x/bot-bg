import { CONST } from "../common/const.js";
import { CRUD } from "../types/crud.js";
import util from "../common/util.js";
import messages from "../common/messages.js";
import discordService from "../service/discord.js";
import dynamoService from "../service/dynamo.js";
import memberModel from "../model/members.js";

const connect = async (req) => {
  let sendMes = req.data.options[0].value + "を受け付けました\n";
  switch (req.data.options[0].value) {
    case "roles":
      if (req.content === "!roles") {
        const member = req.member;
        const roles = member.roles.cache;
        const roleNames = roles.map((role) => role.name).join(", ");
        sendMes = `あなたのロール: ${roleNames}`;
      } else {
        sendMes = `あなたには役割はない`;
      }
    case "ver":
      sendMes = messages.getVer(req);
      break;
    case "getDiscord":
      sendDiscordList(req.channel_id);
      sendMes = "getDiscordを受け付けました。";
      break;
    case "getDynamo":
      sendMes = await dynamoList(req.channel_id);
      console.log("getDynamo:" + sendMes);
      break;
    case "updateDb":
      dynamoUpdate(req.channel_id);
      sendMes = "Sync Discord to Dynamo";
      break;
    case "info":
      sendMes = messages.getInfo(req);
      break;
    case "totalinfo":
      sendMes += "\ntotal info: " + JSON.stringify(req, null, 2);
    default:
      sendMes = messages.getVer(req);
  }
  await discordService.sendDiscordResponse(sendMes, req.token, req.channel_id);
};

const sendDiscordList = async (channelId) => {
  const result = await discordList();
  await discordService.sendDiscordMessage(
    "DISCORD MEMBER LIST \n" + result,
    channelId
  );
  return result;
};

const discordList = async () => {
  const result = await discordService.getDisplayData();
  console.log("discord list : " + result);
  return result;
};

const dynamoList = async (channelId) => {
  console.log("DYNAMO SETTING : " + CONST.DYNAMO_TABLE_PREFIX);
  try {
    const result = await dynamoService.getDisplayData(
      CONST.DYNAMO_TABLE_PREFIX + "_member"
    );
    return result;
  } catch (e) {
    await dynamoCreateTable();
    return "CREATE TABLE : " + CONST.DYNAMO_TABLE_PREFIX + "_member";
  }
};

const dynamoUpdate = async (channelId) => {
  const discordList = await discordService.getMemberList();
  let dynamoList = [];
  try {
    dynamoList = await memberModel.getAllList();
    await memberModel.memberListUpdate(discordList, dynamoList);
    await discordService.sendDiscordMessage("update Member Table\n", channelId);
  } catch (e) {
    await dynamoCreateTable();
    await discordService.sendDiscordMessage("Create Member Table\n", channelId);
  }
};

const dynamoCreateTable = async () => {
  let params = CRUD.create;
  params.TableName = CONST.DYNAMO_TABLE_PREFIX + "_member";
  dynamoService.createTable(params);
};

const controller = {
  connect,
  discordList,
  dynamoList,
  dynamoUpdate,
};

export default controller;
