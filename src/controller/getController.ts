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
  const getParams = event.pathParameters;
  let result = "";
  console.log(JSON.stringify(getParams));

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

const getController = {
  connect,
};

export default getController;
