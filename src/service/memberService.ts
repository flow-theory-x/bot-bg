import { CONST } from "../common/const.js";
import util from "../common/util.js";
import memberModel from "../model/memberModel.js";
import roleModel from "../model/roleModel.js";
import discordService from "../service/discordService.js";
import donateService from "../service/donateService.js";
import ownerService from "../service/ownerService.js";

const getMemberInfo = async (discordId) => {
  console.log(`getMemberInfo: ${discordId}`);
  try {
    const rolesData = await roleModel.getAllList();
    const roleMap = rolesData.reduce((map, role) => {
      map[role.Id.N] = role.Name.S;
      return map;
    }, {} as { [key: string]: string });
    const dynamoData: any = await memberModel.getMember(discordId);
    const roleIds = dynamoData.Roles.NS;
    const roleNames = roleIds.map((id) => roleMap[id]);

    if (!dynamoData.DeleteFlag.BOOL) {
      return {
        discordId: dynamoData.DiscordId.S,
        eoa: dynamoData.Eoa.S,
        name: dynamoData.Name.S,
        nick: dynamoData.Nick.S,
        userName: dynamoData.Username.S,
        icon: dynamoData.Icon.S,
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

const memberService = {
  apply,
  setTmpMember,
  getMemberInfo,
  getEditor,
};

export default memberService;
