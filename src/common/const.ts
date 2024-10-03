import dotenv from "dotenv";
dotenv.config();

export const CONST = {
  API_ENV: process.env.API_ENV,
  API_URL: process.env.API_URL,
  VERSION: process.env.VERSION,
  DEPLOY_DATETIME: process.env.DEPLOY_DATETIME,
  SERVER_INFO: process.env.SERVER_INFO,
  PROVIDER_URL: process.env.PROVIDER_URL,
  SQS_QUEUE_URL: process.env.SQS_QUEUE_URL,
  DISCORD_GUILD_ID: process.env.DISCORD_GUILD_ID,
  DISCORD_BOT_KEY: process.env.DISCORD_BOT_KEY,
  DISCORD_PUB_KEY: process.env.DISCORD_PUB_KEY,
  DISCORD_ADMIN_USER_ID: process.env.DISCORD_ADMIN_USER_ID,
  DISCORD_DUMMY_ICON: "https://example.com",
  DISCORD_SYNC_ROLE: process.env.DISCORD_SYNC_ROLE,
  NOTION_API_KEY: process.env.NOTION_API_KEY,
  NOTION_DATABASE_ID: process.env.NOTION_DATABASE_ID,
  DYNAMO_REGION: process.env.DYNAMO_REGION,
  DYNAMO_TABLE_PREFIX: process.env.DYNAMO_TABLE_PREFIX,
  DYNAMO_SOFT_DELETE: process.env.DYNAMO_SOFT_DELETE,
  DYNAMO_WRITE_WAIT_TIME: 200,
  roles: {},

  RETRY_WAIT: 500,
  RETRY_LIMIT: 2,
};
