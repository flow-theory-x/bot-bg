import { testMessage } from "./event/testEvent.js";
import applyController from "../controller/applyController.js";

// ----
export const test = async () => {
  const mainCommand = "apply";
  testMessage.data.name = mainCommand;
  console.log("APPLY実行開始");
  await applyController.connect(testMessage);
  console.log("APPLY実行完了");
};
