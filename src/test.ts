import controller from "./service/controller.js";
import { testMessage } from "./test/testEvent.js";

testMessage.data.name = "system";
testMessage.data.options[0].value = "ver";

const testInfo =
  testMessage.data.name +
  " : " +
  testMessage.data.options[0].value +
  "を受け付けました\n";
console.log(testInfo);

await controller.connect(testMessage);
