import { CONST } from "../common/const.js";
import { CRUD } from "../crud/crud.js";
import util from "../common/util.js";
import discordService from "../service/discordService.js";
import memberService from "../service/memberService.js";

const connect = async (req) => {
  let sendMes = req.data.name + "を受け付けました\n";
  await discordService.sendDiscordResponse(sendMes, req.token, req.channel_id);
  await memberService.apply(req);
};

const applyController = {
  connect,
};

export default applyController;
