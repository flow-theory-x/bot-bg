import { CONST } from "../common/const.js";
import { CRUD } from "../crud/crud.js";
import util from "../common/util.js";
import messages from "../common/messages.js";
import discordService from "../service/discordService.js";
import dynamoService from "../service/dynamoService.js";
import memberModel from "../model/memberModel.js";
import roleModel from "../model/roleModel.js";

const connect = async (req) => {
  let sendMes = req.data.options[0].value + "を受け付けました\n";
  switch (req.data.options[0].value) {
    case "ver":
      sendMes = messages.getVer(req);
      break;
    case "info":
      sendMes = messages.getInfo(req);
      break;
    case "roleUpdate":
      dynamoRoleUpdate(req.channel_id);
      sendMes = "Sync Role Discord to Dynamo";
      break;
    case "memberUpdate":
      dynamoMemberUpdate(req.channel_id);
      sendMes = "Sync Member Discord to Dynamo";
      break;
    case "getDynamo":
      sendMes = await dynamoList(req.channel_id);
      console.log("getDynamo:" + sendMes);
      break;
    case "getDiscord":
      sendDiscordList(req.channel_id);
      sendMes = "getDiscordを受け付けました。";
      break;
    case "totalinfo":
      sendMes += "\ntotal info: " + JSON.stringify(req, null, 2);
      break;
    case "createTables":
      await dynamoCreateTable("role");
      await dynamoCreateTable("member");
      await dynamoCreateTable("item");
      await dynamoCreateTable("shop");
      await dynamoCreateTable("content");
      sendMes = "CreateTablesを受け付けました。";
      break;
    case "help":
    default:
      sendMes =
        "/system [option]\n" +
        "ver\n" +
        "info\n" +
        "roleUpdate\n" +
        "memberUpdate\n" +
        "getDynamo\n" +
        "getDiscord\n" +
        "totalInfo\n" +
        "createTable\n" +
        "ver\n" +
        "help";
  }
  await discordService.sendDiscordResponse(sendMes, req.token, req.channel_id);
};

const discordList = async () => {
  const result = await discordService.getDisplayData();
  return result;
};

const sendDiscordList = async (channelId) => {
  const result = await discordList();
  await discordService.sendDiscordMessage(
    "DISCORD MEMBER LIST \n" + result,
    channelId
  );
  return result;
};

const dynamoList = async (channelId) => {
  try {
    const result = await dynamoService.getDisplayData(CRUD.member.tableName);
    return result;
  } catch (e) {
    await discordService.sendDiscordMessage(
      "Member table not exist\n",
      channelId
    );
  }
};

const dynamoRoleUpdate = async (channelId) => {
  let dynamoList = [];
  let discordList = [];
  try {
    discordList = await discordService.getGuildRoles(CONST.DISCORD_GUILD_ID);
  } catch (e) {
    await discordService.sendDiscordMessage(
      "couldn't get discord role list. prease retry",
      channelId
    );
    return;
  }
  try {
    dynamoList = await roleModel.getAllList();
    await roleModel.listUpdate(discordList, dynamoList);
    await discordService.sendDiscordMessage("update Role Table\n", channelId);
  } catch (e) {
    await discordService.sendDiscordMessage(
      "Member Table not exist\n",
      channelId
    );
  }
};

const dynamoMemberUpdate = async (channelId) => {
  let dynamoList = [];
  let discordList = [];
  try {
    discordList = await discordService.getMemberList();
  } catch (e) {
    await discordService.sendDiscordMessage(
      "couldn't get discord member list. prease retry",
      channelId
    );
    return;
  }

  try {
    dynamoList = await memberModel.getAllList();
    await memberModel.memberListUpdate(discordList, dynamoList);
    await discordService.sendDiscordMessage("update Member Table\n", channelId);
  } catch (e) {
    await discordService.sendDiscordMessage(
      "Member Table not exist\n",
      channelId
    );
  }
};

const dynamoCreateTable = async (tableName) => {
  let params = CRUD[tableName].create;
  dynamoService.createTable(params);
};

const systemController = {
  connect,
  discordList,
  dynamoList,
};

export default systemController;
