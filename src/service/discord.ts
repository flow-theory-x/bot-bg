import { CONST } from "../common/const.js";
import { setTimeout } from "timers/promises";
const guild_id = CONST.DISCORD_GUILD_ID;
const bot_key = CONST.DISCORD_BOT_KEY;
let json = [];
let mode = "get";
let roles = [];

async function loadAllRoles() {
  console.dir("all role id 取得");
  if (roles.length == 0) {
    try {
      roles = await discordService.getGuildRoles(guild_id);
      if (roles.length == 0) {
        roles.push({
          id: "0000000000000000000",
          name: "notiong",
        });
      }
    } catch (error) {
      console.log("getError" + error);
    }
  }
}

const sendApi = async (endpoint: string, method: string, body: any = null) => {
  try {
    console.log(`${method} : ${endpoint}  botkey : ${bot_key}`);

    const fetchOptions: RequestInit = {
      method,
      headers: {
        accept: "*/*",
        "User-Agent": "bonsoleilDiscordBot (https://github.com/goodsun/bizbot)",
        "accept-language": "ja,en-US;q=0.9,en;q=0.8",
        authorization: `Bot ${bot_key}`,
        "Content-Type": "application/json",
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-origin",
        "sec-gpc": "1",
        "x-discord-locale": "ja",
      },
      mode: "cors",
      credentials: "include" as RequestCredentials, // 型に適合するように変更
      referrerPolicy: "strict-origin-when-cross-origin",
    };

    if (method !== "GET" && body) {
      fetchOptions.body = JSON.stringify(body);
    }

    const response = await fetch(endpoint, fetchOptions);

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Error ${response.status}: ${errorData.message}`);
    }

    console.log("response.OK: メッセージが正常に送信されました");
    return await response.json();
  } catch (error) {
    console.error("メッセージの送信に失敗しました:", error.message);
    throw new Error(`SEND ERROR: ${error.message}`);
  }
};

const getMemberList = async (nextid = null) => {
  await loadAllRoles();
  let endpoint = `https://discord.com/api/v10/guilds/${guild_id}/members?limit=1000`;
  if (nextid) {
    endpoint = `https://discord.com/api/v10/guilds/${guild_id}/members?limit=1000&after=${nextid}`;
  } else {
    json = [];
  }
  console.log("getMember connect discord:" + endpoint);
  const response = await fetch(endpoint, {
    headers: {
      accept: "*/*",
      "User-Agent": "bonsoleilDiscordBot (https://github.com/goodsun/bizbot)",
      "accept-language": "ja,en-US;q=0.9,en;q=0.8",
      authorization: `Bot ${bot_key}`,
      "sec-fetch-dest": "empty",
      "sec-fetch-mode": "cors",
      "sec-fetch-site": "same-origin",
      "sec-gpc": "1",
      "x-discord-locale": "ja",
    },
    referrerPolicy: "strict-origin-when-cross-origin",
    body: null,
    method: "GET",
    mode: "cors",
    credentials: "include",
  })
    .then((response) => {
      console.log("GET RESPONSE DATA : " + JSON.stringify(response));
      return response;
    })
    .catch((error) => {
      console.error("メンバーリストの取得に失敗しました:", error.message);
      throw new Error(`Error SEND ERROR : ${error.message}`);
    });

  const result = await response.json();
  for (let i = 0; i < result.length; i++) {
    const data = result[i];
    if (data.user.bot) {
      continue;
    }

    const member: any = {};

    member.id = data.user.id;

    if (data.nick) {
      member.name = data.nick;
    } else {
      member.name = data.user.global_name;
    }
    member.username = data.user.username;

    member.roles = [];
    for (let i = 0; i < data.roles.length; i++) {
      member.roles.push(String(data.roles[i]));
    }

    member.roles = data.roles
      .map((roleId) => {
        const role = roles.find((r) => r.id === roleId);
        return role ? role.name : null;
      })
      .filter(Boolean);

    if (data.avatar) {
      member.icon = `https://cdn.discordapp.com/guilds/${CONST.DISCORD_GUILD_ID}/users/${data.user.id}/avatars/${data.avatar}.png`;
    } else if (data.user.avatar) {
      member.icon = `https://cdn.discordapp.com/avatars/${data.user.id}/${data.user.avatar}.png`;
    } else {
      member.icon =
        "https://discord.com/assets/f9bb9c4af2b9c32a2c5ee0014661546d.png";
    }

    member.join = data.joined_at;
    json.push(member);
  }

  if (result.length === 1000) {
    const headers = await response.headers;
    // x-ratelimit-remaining残りが3を切ったら1秒待つ
    if (Number(headers.get("x-ratelimit-remaining")) <= 3) {
      console.log("set timeout", headers.get("x-ratelimit-reset-after"));
      await setTimeout(1000);
    }
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
  json = [];
  return await getMemberList();
};

const getDisplayData = async () => {
  const list = await getList();
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
  const url = `https://discord.com/api/webhooks/${CONST.DISCORD_API_ID}/${mesToken}`;
  const body = {
    content: message,
  };
  try {
    const result = await sendApi(url, "post", body);
    return result;
  } catch (err) {
    console.error("返信に失敗しました。" + err);
    message = "再送 :\n" + message;
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
  const result = await sendApi(url, "post", body);
  return result;
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

const getGuildRoles = async (guildId) => {
  const url = "https://discord.com/api/v10/guilds/" + guildId + "/roles";
  const result = await sendApi(url, "get");
  return result;
};

const discordService = {
  sendApi,
  sendDiscordResponse,
  sendDiscordMessage,
  sendDiscordDm,
  getList,
  getMemberList,
  getDisplayData,
  getGuildRoles,
};

export default discordService;
