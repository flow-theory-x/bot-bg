import { CONST } from "../common/const.js";
import { CRUD } from "../crud/crud.js";
import util from "../common/util.js";
import messages from "../common/messages.js";
import discordService from "../service/discordService.js";
import dynamoService from "../service/dynamoService.js";
import memberModel from "../model/memberModel.js";
import roleModel from "../model/roleModel.js";

const connect = async (req) => {
  let sendMes = req.data.options[0].value + "を受け付けました\n";
  switch (req.data.options[0].value) {
    case "ver":
      sendMes = messages.getVer(req);
      break;
    case "info":
      sendMes = messages.getInfo(req);
      break;
    case "update":
      sendMes = messages.getInfo(req);
      break;
    case "check":
      sendMes = messages.getInfo(req);
      break;
    case "help":
    default:
      sendMes =
        "/creator [option]\n" +
        "ver\n" +
        "info\n" +
        "check\n" +
        "update\n" +
        "help";
  }
  //await discordService.sendDiscordResponse(sendMes, req.token, req.channel_id);
  await discordService.interResponse(sendMes, req);
};

const creatorController = {
  connect,
};

export default creatorController;
