import { CONST } from "../common/const.js";
import { CRUD } from "../crud/crud.js";
import util from "../common/util.js";
import messages from "../common/messages.js";
import discordService from "../service/discordService.js";
import memberService from "../service/memberService.js";

const connect = async (req) => {
  let sendMes = req.data.options[0].value + "を受け付けました\n";
  switch (req.data.options[0].value) {
    case "ver":
      sendMes = messages.getVer(req);
      break;
    case "info":
      const member_info = await getMemberInfo(req.member.user.id);
      sendMes =
        req.member.user.id +
        " のメンバー情報を受け付けました\n" +
        JSON.stringify(member_info, null, 2);
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
        "/member [option]\n" +
        "ver\n" +
        "info\n" +
        "check\n" +
        "update\n" +
        "help";
  }
  await discordService.sendDiscordResponse(sendMes, req.token, req.channel_id);
};

const getMemberInfo = async (discordId) => {
  const member = await memberService.getMemberInfo(discordId);
  return member;
};

const memberController = {
  connect,
};

export default memberController;
