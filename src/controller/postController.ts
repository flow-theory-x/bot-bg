import { CONST } from "../common/const.js";
import { CRUD } from "../crud/crud.js";
import util from "../common/util.js";
import messages from "../common/messages.js";
import discordService from "../service/discordService.js";
import dynamoService from "../service/dynamoService.js";
import memberModel from "../model/memberModel.js";
import roleModel from "../model/roleModel.js";

const connect = async (event) => {
  const path = event.pathParameters.proxy;
  const body = event.body;
  const requestBody = JSON.parse(body);
  const params = new URLSearchParams(body);
  console.log("requestBody: " + JSON.stringify(requestBody));
  console.log("postParams: " + JSON.stringify(params));

  let result = "";
  switch (path) {
    case "ver":
    case "info":
    default:
      result =
        "/creator [option]\n" +
        "ver\n" +
        "info\n" +
        "check\n" +
        "update\n" +
        "help";
  }
  return result;
};

const postController = {
  connect,
};

export default postController;
