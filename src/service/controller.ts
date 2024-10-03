import { CONST } from "../common/const.js";
import discordService from "../service/discord.js";
import dynamoService from "../service/dynamo.js";
import memberModel from "../model/members.js";

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
  discordList,
  dynamoList,
  dynamoUpdate,
};

export default controller;
