import { CONST } from "../common/const.js";
const getVer = (req) => {
  const sendMes =
    "getVer: " +
    req.data.name +
    " : " +
    req.data.options[0].value +
    "リクエストを受信\n送信者：" +
    req.member.user.global_name +
    "\napi.ver: " +
    req.apivar +
    "\nbg.ver : " +
    CONST.VERSION;
  return sendMes;
};

const getInfo = (req) => {
  let sendMes = "get Info: ver." + CONST.VERSION;
  sendMes += "\nchannelId: " + req.channel_id;
  sendMes += "\nguild_id: " + req.guild_id;
  sendMes += "\napplication_id: " + req.application_id;
  sendMes += "\nmember info: " + JSON.stringify(req.member, null, 2);
  return sendMes;
};

const messages = {
  getVer,
  getInfo,
};

export default messages;
