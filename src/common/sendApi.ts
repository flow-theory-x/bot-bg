import { CONST } from "../common/const.js";

export const sendApi = async (
  endpoint: string,
  method: string,
  body: any = null
) => {
  console.log(
    `TRY SEND : ${method} : ${endpoint} body : ${JSON.stringify(body)}`
  );
  const fetchOptions: RequestInit = {
    method,
    headers: {
      accept: "*/*",
      "User-Agent": "bonsoleilDiscordBot (https://github.com/goodsun/bizbot)",
      "accept-language": "ja,en-US;q=0.9,en;q=0.8",
      authorization: `Bot ${CONST.DISCORD_BOT_KEY}`,
      "Content-Type": "application/json",
      "sec-fetch-dest": "empty",
      "sec-fetch-mode": "cors",
      "sec-fetch-site": "same-origin",
      "sec-gpc": "1",
      "x-discord-locale": "ja",
    },
    mode: "cors",
    credentials: "include" as RequestCredentials,
    referrerPolicy: "strict-origin-when-cross-origin",
  };

  if (method !== "GET" && body) {
    fetchOptions.body = JSON.stringify(body);
  }

  const response = await fetch(endpoint, fetchOptions);
  const headers = await response.headers;
  if (Number(headers.get("x-ratelimit-remaining")) <= 10) {
    console.log(
      `### x-ratelimit-reset-after ${headers.get("x-ratelimit-reset-after")}`
    );
  }

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(`Error ${response.status}: ${errorData.message}`);
  }

  console.log(`response.OK: sendApi実行が成功しました。`);
  return await response.json();
};
