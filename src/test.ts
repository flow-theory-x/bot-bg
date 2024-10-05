import { CONST } from "./common/const.js";
import systemController from "./controller/systemController.js";
import util from "./common/util.js";
import discordService from "./service/discordService.js";
import { testMessage } from "./test/testEvent.js";

const mode = [
  "ver",
  "info",
  "roleUpdate",
  "memberUpdate",
  "getDiscord",
  "getDynamo",
  "createTables",
];
const target = ["roleUpdate", "memberUpdate"];
//const target = [];
const waitSec = 3000;
const longwaitSec = 10000;

await discordService.sendDiscordMessage(
  "########################################################" +
    "\nLOCAL TEST START\n" +
    "########################################################",
  CONST.DISCORD_DEVELOP_CHANNEL_ID
);
await util.sleep(waitSec);

for (let key in mode) {
  if (target.length > 0 && !target.includes(mode[key])) {
    console.log("skip this target" + mode[key]);
    continue;
  }
  console.log("実行：" + mode[key]);
  testMessage.data.name = "system";
  testMessage.data.options[0].value = mode[key];
  const testInfo =
    testMessage.data.name +
    " : " +
    testMessage.data.options[0].value +
    "を受け付けました\n";
  console.log(testInfo);
  await systemController.connect(testMessage);
  await util.sleep(longwaitSec);
}

await discordService.sendDiscordMessage(
  "########################################################" +
    "\nLOCAL TEST COMPLETE\n" +
    "########################################################",
  CONST.DISCORD_DEVELOP_CHANNEL_ID
);
