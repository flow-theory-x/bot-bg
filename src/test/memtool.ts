import { testMessage } from "./event/testEvent.js";
import memberModel from "../model/memberModel.js";
import memberUtil from "../common/memberUtli.js";
export const test = async () => {
  const dyndata = await memberModel.getMemberRaw(testMessage.member.user.id);
  console.log(`dynamo data : ${JSON.stringify(dyndata, null, 2)}`);
  const dyn2sys = memberUtil.dynToSys(dyndata);
  console.log(`dyn2sys result : ${JSON.stringify(dyn2sys, null, 2)}`);
  const dis2sys = memberUtil.disToSys(testMessage.member);
  console.log(`dis2sys result : ${JSON.stringify(dis2sys, null, 2)}`);
  const eoaMember = await memberModel.getMemberByEoa(
    "0xCf20a6EcBBedB403DB466D669229d9Ee379C433f"
  );
  console.log(`EoaMember : ${JSON.stringify(eoaMember, null, 2)}`);
};
