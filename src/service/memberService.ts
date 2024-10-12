import { CONST } from "../common/const.js";
import util from "../common/util.js";
import memberModel from "../model/memberModel.js";
import roleModel from "../model/roleModel.js";
import discordService from "../service/discordService.js";
import donateService from "../service/donateService.js";
import ownerService from "../service/ownerService.js";
import memberUtil from "../common/memberUtli.js";

const getMemberInfo = async (discordId) => {
  try {
    const rolesData = await roleModel.getAllList();
    const roleMap = rolesData.reduce((map, role) => {
      map[role.Id.N] = role.Name.S;
      return map;
    }, {} as { [key: string]: string });
    const dynamoData: any = await memberModel.getMember(discordId);
    const roleIds = dynamoData.Roles;
    const roleNames = roleIds.map((id) => roleMap[id]);

    if (!dynamoData.DeleteFlag) {
      return {
        discordId: dynamoData.DiscordId,
        eoa: dynamoData.Eoa,
        name: dynamoData.Name,
        nick: dynamoData.Nick,
        userName: dynamoData.Username,
        icon: dynamoData.Icon,
        roleIds: roleIds,
        roleNames: roleNames,
      };
    } else {
      return {};
    }
  } catch (e) {
    await discordService.sendDiscordMessage(
      `id: ${discordId} Member not exist\n`,
      CONST.DISCORD_DEFAULT_CHANNEL_ID
    );
  }
};

const apply = async (message) => {
  const eoa = await memberModel.discordId2eoa(message.member.user.id);
  const ownlist = await ownerService.getOwnByEoa(eoa);
  let responseMes = "";
  let tokenCount = 0;

  if (ownlist.nftList.length > 0) {
    responseMes = responseMes + "NFT LIST\n";
    for (let key in ownlist.nftList) {
      tokenCount++;
      responseMes =
        responseMes +
        ownlist.nftList[key][0] +
        ":" +
        ownlist.nftList[key][1] +
        " tokens\n";
    }
  }

  if (ownlist.sbtList.length > 0) {
    responseMes = responseMes + "SBT LIST\n";
    for (let key in ownlist.sbtList) {
      tokenCount++;
      responseMes =
        responseMes +
        ownlist.sbtList[key][0] +
        ":" +
        ownlist.sbtList[key][1] +
        " tokens\n";
    }
  }

  if (tokenCount > 0) {
    await discordService.setRoleId(
      message.member.user.id,
      CONST.DISCORD_HOLDER_ROLL_ID
    );
    responseMes =
      "あなたは有効なNFTの所有者です。\n" +
      `${CONST.DISCORD_HOLDER_ROLL_NAME} ロールが付与されました。\n` +
      "あなたの持っているNFT\n" +
      responseMes;
  } else {
    responseMes = "あなたは有効なNFTを持っていません";
  }

  memberModel.memberUpdateForMes(message);
  return responseMes;
};

const setTmpMember = async (message) => {
  let sendMessage = "";
  const member: any = await memberModel.getMember(message.member.user.id);
  const eoa = message.data.options[0].value;
  const exist: any = await memberModel.getMemberByEoa(eoa);
  const isEOA = await donateService.isEOA(eoa);
  console.log("新" + JSON.stringify(member));
  console.log("旧" + JSON.stringify(exist));
  if (!isEOA) {
    console.log("EOA check " + eoa);
    sendMessage = "こちらのアドレスはEOAではありません。 \n EOA:" + eoa;
  } else if (
    exist.DiscordId != undefined &&
    exist.DiscordId != message.member.user.id
  ) {
    console.log("EXIST" + JSON.stringify(exist));
    sendMessage =
      "こちらのEOAは " + exist.Name + " に利用されています \n EOA:" + eoa;
  } else if (
    exist.message == "member not found" &&
    (member == undefined || member.Eoa == undefined || member.Eoa == "")
  ) {
    console.log("REGIST : " + JSON.stringify(member));
    memberModel.memberUpdateForMes(message);
    const secret = util.generateRandomString(12);
    await memberModel.memberSetSecret(
      message.member.user.id,
      message.data.options[0].value,
      secret,
      message.member.roles
    );
    sendMessage =
      message.member.user.global_name +
      "のアカウントを以下のウォレットアドレスに紐づけます \n EOA:" +
      eoa +
      "\n" +
      "\n<ご注意>:" +
      "\n登録されたウォレットアドレスに入っているトークンによりロールが付与されます。" +
      "\nウォレットアドレスを変更すると別の人とみなされますのでご注意ください" +
      "\n" +
      "\n以下のURLにメタマスクをインストールしたブラウザでアクセスし、ウォレットを接続して登録を完了してください。" +
      "\nURL : " +
      CONST.PROVIDER_URL +
      "/regist/" +
      message.member.user.id +
      "/" +
      secret +
      "\n SECRET : " +
      secret;
  } else {
    console.log("EXIST" + JSON.stringify(member, null, 2));
    sendMessage = `あなたのDiscordには既に ${eoa} が紐づいています\n解除するには以下のURLにメタマスクをインストールしたブラウザでアクセスしてください\n${CONST.PROVIDER_URL}/disconnect/`;
  }
  return sendMessage;
};

const getEditor = async (message) => {
  const eoa = await memberModel.discordId2eoa(message.member.user.id);
  const secret = util.generateRandomString(12);
  await memberModel.memberSetSecret(
    message.member.user.id,
    eoa,
    secret,
    message.member.roles
  );

  return (
    "記事の執筆はこちらから \n EOA : " +
    eoa +
    "\n\n以下のURLにメタマスクをインストールしたブラウザでアクセスしウォレットを接続してログインしてください。" +
    "\nURL: " +
    CONST.PROVIDER_URL +
    "/editor/" +
    message.member.user.id +
    "/" +
    secret
  );
};

const memberRestore = async (memberJson) => {
  let count = 0;
  for (let key in memberJson) {
    const member = memberUtil.restoreToSys(memberJson[key]);
    await memberModel.memberCreate(member);
    count++;
  }
  return count;
};
const memberSbtRequest = async (message) => {
  if (!message.member.roles.includes(CONST.DISCORD_HOLDER_ROLL_ID)) {
    return "会員証の発行にはHolder ＆FAN ロールが必要です。";
  }
  const eoa = await memberModel.discordId2eoa(message.member.user.id);
  const secret = util.generateRandomString(12);
  await memberModel.memberSetSecret(
    message.member.user.id,
    eoa,
    secret,
    message.member.roles
  );

  const sendMes =
    "会員証SBT発行はこちらから \n EOA : " +
    eoa +
    "\n\n以下のURLにメタマスクをインストールしたブラウザでアクセスし、ウォレットを接続して会員証を発行してください。" +
    "\nURL: " +
    CONST.PROVIDER_URL +
    "/membersbt/" +
    message.member.user.id +
    "/" +
    secret;

  return sendMes;
};

const memberService = {
  apply,
  setTmpMember,
  getMemberInfo,
  getEditor,
  memberRestore,
  memberSbtRequest,
};

export default memberService;
