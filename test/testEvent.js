export const testEvent = {
  Records: [
    {
      body: JSON.stringify({
        function: "discord-message",
        params: {
          message: "チャンネルに送信",
          channelId: "1289728309751578696",
        },
      }),
    },
  ],
};
