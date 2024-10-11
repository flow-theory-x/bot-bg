import dotenv from "dotenv";
dotenv.config();

export const UI = {
  MEMBER_RESTORE: `<form method ="post" action="${process.env.API_URL}/member/restore">
    <textarea name="restoredata"></textarea><br />
    <input type="submit">
    </form>`,
  MEMBER_LIST: `URL: ${process.env.API_URL}/member`,
};
