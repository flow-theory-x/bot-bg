import { CONST } from "../common/const.js";
import util from "../common/util.js";
import { sendApi } from "../common/sendApi.js";
import { setTimeout } from "timers/promises";

let json = [];
let roles = [];
let exec_id = 0;

const getMemberList = async (nextid = null) => {
  let endpoint = `https://discord.com/api/v10/guilds/${CONST.DISCORD_GUILD_ID}/members?limit=1000`;
  if (nextid) {
    endpoint = `https://discord.com/api/v10/guilds/${CONST.DISCORD_GUILD_ID}/members?limit=1000&after=${nextid}`;
  } else {
    json = [];
  }

  const result = await sendApi(endpoint, "get");

  for (let i = 0; i < result.length; i++) {
    const data = result[i];
    console.log(`MEMBER DATA ${JSON.stringify(result, null, 2)}`);
    if (data.user.bot) {
      continue;
    }

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

    member.join = data.joined_at;

    console.log(`sanitized DATA ${JSON.stringify(member, null, 2)}`);
    json.push(member);
  }

  if (result.length === 1000) {
    await setTimeout(1000);
    console.log(
      new Date().toLocaleTimeString("ja-JP") +
        " Get Discord Members:" +
        result[1000 - 1].user.id
    );
    await getMemberList(result[1000 - 1].user.id);
  }

  return json;
};

const getList = async () => {
  try {
    return await getMemberList();
  } catch (error) {
    return {
      result: "err",
      error: error,
    };
  }
};

const getDisplayData = async () => {
  const list = await getList();
  if (list["result"] == "working") {
    return "List is Updateing[" + list["exec"] + "]\n please wait...";
  }
  if (list["result"] == "err") {
    return "connectError[" + list["error"] + "]\n please retry...";
  }
  let result = "\n";
  for (let key in list) {
    const data = list[key];
    result =
      result +
      key +
      " | name:" +
      data.name +
      " discordId:" +
      data.id +
      " roles:" +
      data.roles +
      " join:" +
      data.join +
      "\n";
  }
  return result;
};

const sendDiscordResponse = async (message, mesToken, resendCh?) => {
  console.log("mesToken : " + mesToken);
  if (mesToken == CONST.LOCAL_TEST_EVENT) {
    console.log("send to noticeChannel due to LocalTest");
    sendDiscordMessage(
      "▽▽▽▽▽▽▽▽▽▽▽▽▽▽▽▽▽▽▽▽▽▽▽▽▽▽▽▽▽▽▽▽▽▽▽\n\n" +
        "send to noticeChannel due to LocalTest \n" +
        message +
        "\n\n△△△△△△△△△△△△△△△△△△△△△△△△△△△△△△△△△△△",
      CONST.DISCORD_DEVELOP_CHANNEL_ID
    );
    return;
  }

  const url = `https://discord.com/api/webhooks/${CONST.DISCORD_API_ID}/${mesToken}`;
  const body = {
    content: message,
  };
  try {
    const result = await sendApi(url, "post", body);
    return result;
  } catch (err) {
    console.error("Resent due to API delay over 3 seconds:" + err);
    message = "Resent due to API delay over 3 sec.\n" + message;
    if (resendCh != undefined) {
      sendDiscordMessage(message, resendCh);
    } else {
      sendDiscordMessage(message, CONST.DISCORD_DEFAULT_CHANNEL_ID);
    }
  }
};

const sendDiscordMessage = async (message, channelId) => {
  const url = "https://discord.com/api/v10/channels/" + channelId + "/messages";
  const body = {
    content: message,
  };

  try {
    const result = await sendApi(url, "post", body);
    return result;
  } catch (error) {
    console.error(
      "failed to sendDiscordMessage:" +
        error +
        " url" +
        url +
        " message:" +
        message
    );
  }
};

const sendDiscordDm = async (message, userId) => {
  if (CONST.API_ENV != "PRD") {
    message = message + "\nver." + CONST.VERSION;
  }
  const url = "https://discord.com/api/v10/users/@me/channels";
  const body = {
    recipient_id: userId,
  };
  const channelId = await sendApi(url, "post", body);
  const sendUrl =
    "https://discord.com/api/v10/channels/" + channelId.id + "/messages";
  const sendBody = {
    content: message,
  };
  const result = await sendApi(sendUrl, "post", sendBody);
  return result;
};

const getGuildRoles = async (guildId, retry = 0) => {
  const eid = exec_id;
  console.error(`### ロールを取得 eid:${eid} ###`);
  const url = "https://discord.com/api/v10/guilds/" + guildId + "/roles";
  try {
    const result = await sendApi(url, "get");
    console.error(
      `### ロールを取得完了 ${JSON.stringify(result)} eid:${eid} ###`
    );
    return result;
  } catch {
    retry++;
    console.error(`### ロールを取得失敗 eid:${eid} retry:${retry} ###`);
    if (retry < 5) {
      util.sleep(5000 * retry);
      getGuildRoles(guildId, retry);
    }
    return roles;
  }
};

const discordService = {
  sendDiscordResponse,
  sendDiscordMessage,
  sendDiscordDm,
  getMemberList,
  getDisplayData,
  getGuildRoles,
};

export default discordService;
