import { CONST } from "../../common/const.js";
import systemController from "../../controller/systemController.js";
import creatorController from "../../controller/creatorController.js";
import memberController from "../../controller/memberController.js";
import registController from "../../controller/registController.js";
import util from "../../common/util.js";
import { testMessage } from "../event/testEvent.js";

// ----
export const test = async () => {
  const mainCommand = "system";
  const mode = [
    "ver",
    "info",
    "roleUpdate",
    "memberUpdate",
    "getDiscord",
    "getDynamo",
  ];
  const target = [];
  const waitSec = 3000;

  await util.sleep(waitSec);
  for (let key in mode) {
    if (target.length > 0 && !target.includes(mode[key])) {
      console.log("skip this target" + mode[key]);
      continue;
    }
    console.log(`################ テスト開始 ${mode[key]} ################`);
    testMessage.data.name = mainCommand;
    testMessage.data.options[0].value = mode[key];
    const testInfo =
      testMessage.data.name +
      " : " +
      testMessage.data.options[0].value +
      "を受け付けました\n";
    console.log(testInfo);
    switch (testMessage.data.name) {
      case "system":
        await systemController.connect(testMessage);
        break;
      case "creator":
        await creatorController.connect(testMessage);
        break;
      case "member":
        await memberController.connect(testMessage);
        break;
      case "regist":
        await registController.connect(testMessage);
        break;
    }
    console.log(`################ テスト完了 ${mode[key]} ################`);
  }
};
