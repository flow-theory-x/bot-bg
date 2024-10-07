import { CRUD } from "../crud/crud.js";
import { CONST } from "../common/const.js";
import util from "../common/util.js";
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
  params.Key.DiscordId.S = discordId;
  const result = await dynamoService.getItem(params);
  return util.dynamoDbToJson(result);
};

const getMemberRaw = async (discordId) => {
  let params = crud.read;
  params.Key.DiscordId.S = discordId;
  const result = await dynamoService.getItem(params);
  return result;
};

const memberCreate = async (member) => {
  console.log("dynamo メンバー登録");
  let params = crud.write;
  params.Item.DiscordId.S = String(member.id);
  params.Item.Name.S = member.name;
  params.Item.Username.S = member.username;
  params.Item.Icon.S = member.icon;
  params.Item.Join.S = member.join;
  params.Item.Nick.S = member.nick;
  if (member.nick == null) {
    params.Item.Nick.S = "";
  }
  if (member.roles.length == 0) {
    params.Item.Roles.NS = ["0"];
  } else {
    params.Item.Roles.NS = member.roles;
  }
  await dynamoService.putItem(params);
};

const memberUpdateForMes = async (message) => {
  let member = {
    id: message.member.user.id,
    name: message.member.user.global_name,
    nick: message.member.nick,
    username: message.member.user.username,
    roles: message.member.roles,
    icon: "https://discord.com/assets/f9bb9c4af2b9c32a2c5ee0014661546d.png",
  };

  if (member.nick == null) {
    member.nick = "";
  }
  if (message.member.roles.length == 0) {
    member.roles = ["0"];
  }
  if (message.member.avatar) {
    member.icon = `https://cdn.discordapp.com/guilds/${CONST.DISCORD_GUILD_ID}/users/${message.member.user.id}/avatars/${message.member.avatar}.png`;
  } else if (message.member.user.avatar) {
    member.icon = `https://cdn.discordapp.com/avatars/${message.member.user.id}/${message.member.user.avatar}.png`;
  }
  memberUpdate(member);
};

const memberUpdate = async (member) => {
  if (member.roles.length == 0) {
    member.roles.push("0");
  }
  if (member.nick == null) {
    member.nick = "";
  }

  let params = crud.update;
  params.Key.DiscordId.S = String(member.id);
  params.UpdateExpression =
    "SET #Name = :Name, #Nick = :Nick, #Username = :Username, #Icon = :Icon, #Roles= :roles, #Updated = :updated";
  params.ExpressionAttributeNames = {
    "#Name": "Name",
    "#Nick": "Nick",
    "#Username": "Username",
    "#Icon": "Icon",
    "#Roles": "Roles",
    "#Updated": "Updated",
  } as object;
  params.ExpressionAttributeValues = {
    ":Name": { S: member.name } as object,
    ":Nick": { S: member.nick } as object,
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
    "dynamo メンバー削除 " + member.DiscordId.S + " name:" + member.Name.S
  );
  let params = crud.delete;
  params.Key.DiscordId.S = member.DiscordId.S;
  await dynamoService.deleteItem(params);
};

const memberSoftDelete = async (member) => {
  console.log(
    "dynamo メンバー退会 " + member.DiscordId.S + " name:" + member.Name.S
  );
  let params = crud.update;
  params.Key.DiscordId.S = member.DiscordId.S;
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
      (item) => String(item.DiscordId.S) === String(member.id)
    );
    if (filteredItems.length == 0) {
      addCnt++;
      await memberModel.memberCreate(member);
    } else {
      let dcRoles = '["0"]';
      let dyRoles = '["0"]';
      if (Array.isArray(member.roles) && member.roles.length > 0) {
        dcRoles = JSON.stringify(member.roles.sort());
      }
      if (
        Array.isArray(filteredItems[0].Roles.SS) &&
        filteredItems[0].Roles.SS.length > 0
      ) {
        dyRoles = JSON.stringify(filteredItems[0].Roles.SS.sort());
      }
      if (
        member.name !== filteredItems[0].Name.S ||
        member.username !== filteredItems[0].Username.S ||
        member.nick !== filteredItems[0].Nick.S ||
        member.icon !== filteredItems[0].Icon.S ||
        dcRoles !== dyRoles
      ) {
        console.log(`discord: ${JSON.stringify(member.name)}`);
        console.log(`dynamo : ${JSON.stringify(filteredItems[0].Name.S)}`);
        console.log(`discord: ${JSON.stringify(member.username)}`);
        console.log(`dynamo : ${JSON.stringify(filteredItems[0].Username.S)}`);
        console.log(`discord: ${JSON.stringify(member.nick)}`);
        console.log(`dynamo : ${JSON.stringify(filteredItems[0].Nick.S)}`);
        console.log(`discord: ${JSON.stringify(member.icon)}`);
        console.log(`dynamo : ${JSON.stringify(filteredItems[0].Icon.S)}`);
        console.log(`discord: ${JSON.stringify(dcRoles)}`);
        console.log(`dynamo : ${JSON.stringify(dyRoles)}`);
        updateCnt++;
        await memberModel.memberUpdate(member);
      }
    }
  }

  for (let key in dynamoList) {
    const member = dynamoList[key];
    if (member) {
      const filteredItems = discordList.filter(
        (item) => String(item.id) === String(member.DiscordId.S)
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

const getMemberByEoa = async (eoa) => {
  let params = crud.query;
  params.KeyConditionExpression = "#PartitionName = :PartitionName";
  params.FilterExpression = "#DeleteFlag = :DeleteFlag and #Eoa = :Eoa";
  params.ExpressionAttributeNames = {
    "#PartitionName": "PartitionName",
    "#DeleteFlag": "DeleteFlag",
    "#Eoa": "Eoa",
  } as object;
  params.ExpressionAttributeValues = {
    ":PartitionName": { S: "Users" },
    ":DeleteFlag": { BOOL: false },
    ":Eoa": { S: eoa },
  } as object;
  const result = await dynamoService.query(params);
  console.log("MemberByEoa");
  console.dir(result);
  if (result.Count == 1) {
    let user = result.Items[0];
    delete user.TmpEoa;
    delete user.Secret;
    return util.dynamoDbToJson(user);
  } else if (result.Count == 0) {
    return { message: "member not found" };
  } else {
    return { message: "many member" };
  }
};

const memberSetSecret = async (
  id: String,
  tmpEoa: String,
  secret: String,
  roles
) => {
  if (roles.length == 0) {
    roles.push("0");
  }
  const member: any = await getMember(id);
  let params = crud.update;
  params.TableName = crud.tableName;
  params.Key.DiscordId.S = String(member.DiscordId);
  params.UpdateExpression =
    "SET #Secret = :secret, #Roles = :roles,#Expired = :expired, #TmpEoa = :tmpEoa, #Updated = :updated";
  params.ExpressionAttributeValues = {
    ":secret": { S: secret } as object,
    ":tmpEoa": { S: tmpEoa } as object,
    ":roles": { NS: roles } as object,
    ":updated": { S: new Date(new Date().getTime()) } as object,
    ":expired": {
      S: new Date(new Date().getTime() + 10 * 60 * 1000),
    } as object,
  };
  params.ExpressionAttributeNames = {
    "#Secret": "Secret",
    "#Expired": "Expired",
    "#Roles": "Roles",
    "#TmpEoa": "TmpEoa",
    "#Updated": "Updated",
  } as object;
  await dynamoService.updateItem(params);

  const detail =
    "dynamo あいことば登録 " +
    id +
    // member.DiscordId.S +
    " name:" +
    //member.Name.S +
    " あいことば：" +
    secret;
  return detail;
};

const memberSetEoa = async (id: String, eoa: String, secret: String) => {
  try {
    const member: any = await getMember(id);
    const expired = util.str2unixtime(member.Expired);
    const now = util.str2unixtime(new Date().getTime());
    let message = "取得後結果確認";
    let result = false;
    if (
      util.isAddressesEqual(String(member.TmpEoa), String(eoa)) &&
      String(member.Secret) == secret &&
      now < expired
    ) {
      let params = crud.update;
      params.TableName = crud.tableName;
      params.Key.DiscordId.S = String(member.DiscordId);
      params.UpdateExpression = "SET #Eoa = :newVal, #Updated = :updated";
      params.ExpressionAttributeValues = {
        ":newVal": { S: eoa } as object,
        ":updated": { S: new Date(new Date().getTime()) } as object,
      };
      params.ExpressionAttributeNames = {
        "#Eoa": "Eoa",
        "#Updated": "Updated",
      } as object;

      await dynamoService.updateItem(params);
      message += " 承認OK";
      result = true;
    } else {
      message += " 承認NG";
    }

    return { message: message, result: result };
  } catch (error) {
    return { message: "エラーが発生しました", result: false };
  }
};

const memberModel = {
  getMemberRaw,
  getAllList,
  getMemberList,
  getMember,
  getMemberByEoa,
  memberCreate,
  memberUpdate,
  memberUpdateForMes,
  memberDelete,
  memberSoftDelete,
  memberListUpdate,
  memberSetSecret,
  memberSetEoa,
};
export default memberModel;
