import { CONST } from "../common/const.js";
import { CRUD } from "../crud/crud.js";
import util from "../common/util.js";
import discordService from "../service/discordService.js";
import creatorService from "../service/creatorService.js";

const connect = async (req) => {
  const sendMes = await creatorService.getKey(req);
  await discordService.sendDiscordResponse(sendMes, req.token, "nosend");
};

const creatorController = {
  connect,
};

export default creatorController;
