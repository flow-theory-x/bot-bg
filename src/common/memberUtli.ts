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

const disToSys = (disMember) => {
  let member = {
    id: disMember.user.id,
    name: disMember.user.global_name,
    nick: disMember.nick,
    username: disMember.user.username,
    roles: disMember.roles,
    icon: "https://discord.com/assets/f9bb9c4af2b9c32a2c5ee0014661546d.png",
  };

  if (member.nick == null) {
    member.nick = "";
  }
  if (member.roles.length == 0) {
    member.roles = ["0"];
  }
  if (disMember.avatar) {
    member.icon = `https://cdn.discordapp.com/guilds/${CONST.DISCORD_GUILD_ID}/users/${disMember.user.id}/avatars/${disMember.avatar}.png`;
  } else if (disMember.user.avatar) {
    member.icon = `https://cdn.discordapp.com/avatars/${disMember.user.id}/${disMember.user.avatar}.png`;
  }
  return member;
};

const memberUtil = {
  dynToSys,
  disToSys,
};

export default memberUtil;
