import memberService from "../service/memberService.js";

// ----
export const test = async () => {
  const memberJson = [
    {
      DeleteFlag: false,
      DiscordId: "123456787937505310",
      Icon: "https://discord.com/assets/f9bb9c4af2b9c32a2c5ee0014661546d.png",
      Roles: ["1291701078286667796", "1291702146873692251"],
      TmpEoa: "0xf78088f6Fb15d17b8336655af40352C839543A7f",
      Expired: "2024-10-07T05:04:24.512Z",
      Eoa: "0xf78088f6Fb15d17b8336655af40352C839543A7f",
      Nick: "テストマン",
      PartitionName: "Users",
      Secret: "5pkLUkk1SJyu",
      Join: "2024-10-06T12:40:52.342000+00:00",
      Updated: "2024-10-10T10:10:48.215Z",
      Name: "BizenSBS",
      Username: "bizensbs",
    },
  ];
  console.log("MEMBER RESTORE");
  const count = await memberService.memberRestore(memberJson);
  console.log(`MEMBER RESTORE count:${count}`);
};
