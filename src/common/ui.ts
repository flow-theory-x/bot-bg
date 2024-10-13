import dotenv from "dotenv";
dotenv.config();
import { CONST } from "./const.js";

export const UI = {
  MEMBER_RESTORE: `<h2>${CONST.SERVER_INFO} MemberRestore ${CONST.DYNAMO_TABLE_PREFIX}_member</h2>
    <form method ="post" action="${CONST.API_URL}/member/restore">
    <textarea name="restoredata"></textarea><br />
    <input type="submit">
    </form>`,
  MEMBER_LIST: `URL: ${CONST.API_URL}/member`,
};
