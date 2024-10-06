import { CONST } from "../common/const.js";
import util from "../common/util.js";
import memberModel from "../model/memberModel.js";
import roleModel from "../model/roleModel.js";
import discordService from "../service/discordService.js";

const getMemberInfo = async (discordId) => {
  console.log(`getMemberInfo: ${discordId}`);
  try {
    const rolesData = await roleModel.getAllList();
    const roleMap = rolesData.reduce((map, role) => {
      map[role.Id.N] = role.Name.S;
      return map;
    }, {} as { [key: string]: string });
    const dynamoData = await memberModel.getMember(discordId);
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
      "id: ${discordId} Member not exist\n",
      CONST.DISCORD_DEFAULT_CHANNEL_ID
    );
  }
};

const memberService = {
  getMemberInfo,
};

export default memberService;
