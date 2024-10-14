import { CONST } from "../common/const.js";
import util from "../common/util.js";
import { sendApi } from "../common/sendApi.js";
import { setTimeout } from "timers/promises";
import memberUtil from "../common/memberUtli.js";
import { Client, GatewayIntentBits } from "discord.js";
import { InteractionResponseType } from "discord-interactions";

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers],
});

client.login(CONST.DISCORD_BOT_KEY);

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
    if (data.user.bot) {
      continue;
    }
    let member: any = memberUtil.disToSys(data);
    member.join = data.joined_at;
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
    message = `バックグラウンドからの再送\nResent due to API delay over 3 sec.\n\n${message}`;
    if (resendCh != undefined) {
      sendDiscordMessage(message, resendCh);
    } else if (resendCh == "notResend") {
      console.log("notResendが指定されている場合送信しない");
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
      `### ロールを取得完了 ${JSON.stringify(result, null, 2)} eid:${eid} ###`
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

const setRoleId = async (memberId, roleId) => {
  const guild = await client.guilds.fetch(CONST.DISCORD_GUILD_ID);
  const member = await guild.members.fetch(memberId);
  member.roles.add(roleId);
};

const interResponse = async (responseMessage, message) => {
  console.log(`message id&token:  ${JSON.stringify(message)}`);
  try {
    // インタラクションに対するメッセージの編集
    await client.rest.patch(
      `/webhooks/${CONST.DISCORD_API_ID}/${message.token}/messages/@original`,
      {
        body: {
          content: responseMessage,
          flags: 64, // Ephemeral (本人にしか見えない) メッセージ
        },
      }
    );
  } catch (error) {
    console.error("Error sending interaction response:", error);
  }
};

const discordService = {
  sendDiscordResponse,
  sendDiscordMessage,
  sendDiscordDm,
  getMemberList,
  getDisplayData,
  getGuildRoles,
  setRoleId,
  interResponse,
};

export default discordService;
