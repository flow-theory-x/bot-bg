import { CONST } from "../common/const.js";
import { CRUD } from "../crud/crud.js";
import util from "../common/util.js";
import discordService from "../service/discordService.js";
import memberService from "../service/memberService.js";

const connect = async (req) => {
  const sendMes = await memberService.getEditor(req);
  await discordService.sendDiscordResponse(sendMes, req.token, "nosend");
};

const creatorController = {
  connect,
};

export default creatorController;
