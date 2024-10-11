import memberService from "../../service/memberService.js";
import { TEST_VALUE } from "../value/testvalue.js";

// ----
export const test = async () => {
  const memberJson = [
    {
      DeleteFlag: false,
      DiscordId: TEST_VALUE.UNIXTIME,
      Icon: "https://discord.com/assets/f9bb9c4af2b9c32a2c5ee0014661546d.png",
      Roles: ["1291701078286667796", "1291702146873692251"],
      TmpEoa: "0xf78088f6Fb15d17b8336655af40352C839543A7f",
      Expired: new Date().toISOString(),
      Eoa: "0xf78088f6Fb15d17b8336655af40352C839543A7f",
      Nick: TEST_VALUE.NICK,
      PartitionName: "Users",
      Secret: "1234567890ab",
      Join: new Date().toISOString(),
      Updated: new Date().toISOString(),
      Name: TEST_VALUE.NAME,
      Username: TEST_VALUE.USERNAME,
    },
  ];
  console.log("MEMBER RESTORE");
  const count = await memberService.memberRestore(memberJson);
  console.log(`MEMBER RESTORE count:${count}`);
};
