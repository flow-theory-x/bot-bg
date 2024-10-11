import memberService from "../../service/memberService.js";

// ----
export const test = async () => {
  console.log("MEMBER Info");
  const info = await memberService.getMemberInfo("1285946299593523271");
  console.log(`getMemberInfo ${JSON.stringify(info)}`);
};
