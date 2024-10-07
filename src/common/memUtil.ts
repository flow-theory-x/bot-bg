import { CONST } from "./const.js";

const dynToSys = (dynamoData) => {
  const isArray = Array.isArray(dynamoData);
  const dataArray = Array.isArray(dynamoData) ? dynamoData : [dynamoData];
  console.dir(dataArray);
  const result = dataArray.map((item) => {
    let result = {};
    for (const key in item) {
      const valueObj = item[key];
      if (valueObj.S !== undefined) {
        result[key] = valueObj.S;
      } else if (valueObj.N !== undefined) {
        result[key] = Number(valueObj.N);
      } else if (valueObj.BOOL !== undefined) {
        result[key] = valueObj.BOOL;
      } else if (valueObj.SS !== undefined) {
        result[key] = valueObj.SS;
        if (valueObj.SS.length == 0) {
          result[key] = [""];
        }
      } else if (valueObj.NS !== undefined) {
        result[key] = valueObj.NS;
        if (valueObj.NS.length == 0) {
          result[key] = ["0"];
        }
      }
    }
    return result;
  });
  if (isArray) {
    return result;
  } else {
    return result[0];
  }
};

const disToSys = (data) => {
  const member: any = {};
  member.id = data.user.id;
  member.nick = data.nick;
  member.name = data.user.global_name;
  member.username = data.user.username;
  member.roles = data.roles;
  if (member.nick == null) {
    member.nick = "";
  }
  if (member.roles.length == 0) {
    member.roles = ["0"];
  }
  if (data.avatar) {
    member.icon = `https://cdn.discordapp.com/guilds/${CONST.DISCORD_GUILD_ID}/users/${data.user.id}/avatars/${data.avatar}.png`;
  } else if (data.user.avatar) {
    member.icon = `https://cdn.discordapp.com/avatars/${data.user.id}/${data.user.avatar}.png`;
  } else {
    member.icon =
      "https://discord.com/assets/f9bb9c4af2b9c32a2c5ee0014661546d.png";
  }
  return member;
};

const memUtil = {
  dynToSys,
  disToSys,
};

export default memUtil;
