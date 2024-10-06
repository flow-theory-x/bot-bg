import { CONST } from "../common/const.js";
import { CRUD } from "../crud/crud.js";
import util from "../common/util.js";
import discordService from "../service/discordService.js";
import memberService from "../service/memberService.js";

const connect = async (req) => {
  const sendMes = await memberService.setTmpMember(req);
  await discordService.sendDiscordResponse(sendMes, req.token, req.channel_id);
};

const creatorController = {
  connect,
};

export default creatorController;
