import { CRUD } from "../crud/crud.js";
import { CONST } from "../common/const.js";
import dynamoService from "../service/dynamoService.js";
import discordService from "../service/discordService.js";
const crud = CRUD.member;

const getMemberList = async () => {
  let params = crud.query;
  const result = await dynamoService.query(params);
  return result;
};

const getAllList = async () => {
  return await dynamoService.getAllItems(crud.tableName);
};

const getMember = async (discordId) => {
  let params = crud.read;
  params.Key.DiscordId.N = discordId;
  return await dynamoService.getItem(params);
};

const memberCreate = async (member) => {
  console.log("dynamo メンバー登録");
  let params = crud.write;
  params.Item.DiscordId.N = String(member.id);
  params.Item.Name.S = member.name;
  params.Item.Username.S = member.username;
  params.Item.Icon.S = member.icon;
  params.Item.Join.S = member.join;
  if (member.roles.length == 0) {
    params.Item.Roles.NS = [""];
  } else {
    params.Item.Roles.NS = member.roles;
  }
  await dynamoService.putItem(params);
};

const memberUpdate = async (member) => {
  console.log("dynamo メンバー更新");
  console.dir(member);
  if (member.roles.length == 0) {
    member.roles.push("");
  }
  let params = crud.update;
  params.Key.DiscordId.N = String(member.id);
  params.UpdateExpression =
    "SET #Name = :Name, #Username = :Username, #Icon = :Icon, #Roles= :roles, #Updated = :updated";
  params.ExpressionAttributeNames = {
    "#Name": "Name",
    "#Username": "Username",
    "#Icon": "Icon",
    "#Roles": "Roles",
    "#Updated": "Updated",
  } as object;
  params.ExpressionAttributeValues = {
    ":Name": { S: member.name } as object,
    ":Username": { S: member.username } as object,
    ":Icon": { S: member.icon } as object,
    ":roles": { SS: member.roles } as object,
    ":updated": { S: new Date(new Date().getTime()) } as object,
  };

  discordService.sendDiscordMessage(
    "<@" + member.id + ">の情報が更新されました\n information has been updated",
    CONST.DISCORD_DEFAULT_CHANNEL_ID
  );

  await dynamoService.updateItem(params);
};

const memberDelete = async (member) => {
  console.log(
    "dynamo メンバー削除 " + member.DiscordId.N + " name:" + member.Name.S
  );
  let params = crud.delete;
  params.Key.DiscordId.N = member.DiscordId.N;
  await dynamoService.deleteItem(params);
};

const memberSoftDelete = async (member) => {
  console.log(
    "dynamo メンバー退会 " + member.DiscordId.N + " name:" + member.Name.S
  );
  let params = crud.update;
  params.Key.DiscordId.N = member.DiscordId.N;
  params.UpdateExpression = "SET DeleteFlag = :newVal";
  params.ExpressionAttributeValues = {
    ":newVal": { BOOL: true } as object,
  };
  await dynamoService.updateItem(params);
};

const memberListUpdate = async (discordList, dynamoList) => {
  let addCnt = 0;
  let updateCnt = 0;
  let delCnt = 0;
  for (let key in discordList) {
    const member = discordList[key];
    const filteredItems = dynamoList.filter(
      (item) => String(item.DiscordId.N) === String(member.id)
    );
    if (filteredItems.length == 0) {
      addCnt++;
      await memberModel.memberCreate(member);
    } else {
      const dcRoles = JSON.stringify(
        member.roles.filter((role) => role !== "").sort()
      );
      const dyRoles = JSON.stringify(
        filteredItems[0].Roles.SS.filter((role) => role !== "").sort()
      );
      if (
        member.name !== filteredItems[0].Name.S ||
        member.username !== filteredItems[0].Username.S ||
        member.icon !== filteredItems[0].Icon.S ||
        dcRoles !== dyRoles
      ) {
        updateCnt++;
        await memberModel.memberUpdate(member);
      }
    }
  }

  for (let key in dynamoList) {
    const member = dynamoList[key];
    if (member) {
      const filteredItems = discordList.filter(
        (item) => String(item.id) === String(member.DiscordId.N)
      );
      if (filteredItems.length == 0) {
        delCnt++;
        if (CONST.DYNAMO_SOFT_DELETE == "true") {
          await memberModel.memberSoftDelete(member);
        } else {
          await memberModel.memberDelete(member);
        }
      }
    }
  }
  console.log("dis:" + discordList.length + " dyn:" + dynamoList.length);
  console.log("add:" + addCnt + " update:" + updateCnt + " del:" + delCnt);
};

const memberModel = {
  getAllList,
  getMemberList,
  getMember,
  memberCreate,
  memberUpdate,
  memberDelete,
  memberSoftDelete,
  memberListUpdate,
};
export default memberModel;
