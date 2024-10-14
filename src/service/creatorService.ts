import { CONST } from "../common/const.js";
import util from "../common/util.js";
import memberModel from "../model/memberModel.js";
import roleModel from "../model/roleModel.js";
import discordService from "../service/discordService.js";
import donateService from "../service/donateService.js";

const getCreatorInfo = async (eoa) => {
  console.log;
};
const getShopInfo = async (eoa) => {
  console.log;
};

const getKey = async (message) => {
  const hashInfo = await util.getShortHash(message.data.options[0].value);
  const eoa = await memberModel.discordId2eoa(message.member.user.id);
  if (hashInfo.owner == eoa) {
    return (
      "### getkey secret 通知 ###\n" +
      "secretkey : " +
      hashInfo.shortHash +
      "\nCreator : " +
      hashInfo.gallaryName +
      "\nNFT contract : " +
      hashInfo.contractInfo +
      " #" +
      hashInfo.pathInfo +
      "\nNFT path : " +
      hashInfo.pathInfo +
      message.data.options[0].value +
      "\nNFT name : " +
      hashInfo.name +
      "\n" +
      hashInfo.image +
      "\n" +
      message.data.options[0].value
    );
  } else {
    return "NFT:" + hashInfo.name + "のsecretKeyを取得する権限がありません。";
  }
};

const memberService = {
  getKey,
  getCreatorInfo,
  getShopInfo,
};

export default memberService;
