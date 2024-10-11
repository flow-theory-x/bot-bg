import dotenv from "dotenv";
dotenv.config();

export const TEST_VALUE = {
  UNIXTIME: String(new Date().getTime()),
  NAME: "NAME_" + process.env.API_ENV + "_" + new Date().toLocaleTimeString(),
  NICK: "NICK" + process.env.API_ENV,
  USERNAME: "NICK" + process.env.API_ENV,
};
