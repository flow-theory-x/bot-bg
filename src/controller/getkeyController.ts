import { CONST } from "../common/const.js";
import { CRUD } from "../crud/crud.js";
import util from "../common/util.js";
import discordService from "../service/discordService.js";
import creatorService from "../service/creatorService.js";

const connect = async (req) => {
  const message = await creatorService.getKey(req);
  await discordService.interResponse(message, req);
  await discordService.sendDiscordDm(message, req.member.user.id);

  //let sendMes = `getkey ${req.data.options[0].value} を受け付けました\nセキュリティのためDMにてsecretをお送りします。`;
  //await discordService.sendDiscordResponse(sendMes, req.token, "notResend");
  //const message = await creatorService.getKey(req);
  //await discordService.sendDiscordDm(message, req.member.user.id);
};

const creatorController = {
  connect,
};

export default creatorController;
