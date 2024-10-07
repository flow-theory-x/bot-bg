import { CONST } from "../common/const.js";
import getkeyController from "../controller/getkeyController.js";
import util from "../common/util.js";
import { testMessage } from "./event/testEvent.js";

// ----
export const test = async () => {
  const mainCommand = "editor";
  const mode = [""];
  const target = [""];

  const waitSec = 3000;
  const longwaitSec = 10000;

  await util.sleep(waitSec);
  for (let key in mode) {
    if (target.length > 0 && !target.includes(mode[key])) {
      console.log("skip this target" + mode[key]);
      continue;
    }
    console.log("実行：" + mode[key]);
    testMessage.data.name = mainCommand;
    testMessage.data.options[0].value = mode[key];
    const testInfo =
      testMessage.data.name +
      " : " +
      testMessage.data.options[0].value +
      "を受け付けました\n";
    await getkeyController.connect(testMessage);
  }
};
