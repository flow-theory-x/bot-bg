import express from "express";
import { CONST } from "../common/const.js";
import { UI } from "../common/ui.js";
import memberModel from "../model/memberModel.js";
import shopModel from "../model/shopModel.js";
import itemModel from "../model/itemModel.js";
import util from "../common/util.js";
import memberUtil from "../common/memberUtli.js";
import discordService from "../service/discordService.js";
import memberService from "../service/memberService.js";
import donateService from "../service/donateService.js";
import dynamoService from "../service/dynamoService.js";
import shopService from "../service/shopService.js";
import systemController from "../controller/systemController.js";

const expressRouter = express.Router();
expressRouter.use(express.json());
expressRouter.use(express.urlencoded({ extended: true }));

expressRouter.get("/", async (_, res) => {
  const result = `<h1>${CONST.SERVER_INFO} ver. ${CONST.VERSION}</h1>
  <p>DEPLOY:${CONST.DEPLOY_DATETIME}</p>
  <p>TABLES:${CONST.DYNAMO_TABLE_PREFIX}</p>`;
  res.send(result);
});

expressRouter.post("/regist", async (req, res) => {
  const body = req.body;
  const result = await memberModel.memberSetEoa(
    body.discordId,
    body.eoa,
    body.secret
  );
  res.send(result);
});

expressRouter.get("/createtables", async (_, res) => {
  await dynamoService.dynamoCreateTable("role");
  await dynamoService.dynamoCreateTable("member");
  await dynamoService.dynamoCreateTable("item");
  await dynamoService.dynamoCreateTable("shop");
  res.send("createTables");
});

expressRouter.post("/disconnect", async (req, res) => {
  const body = req.body;
  const result = await memberModel.memberDisconnect(body.discordId, body.eoa);
  res.send(result);
});

expressRouter.get("/member", async (req, res) => {
  const response = await memberModel.getAllList();
  res.send(memberUtil.dynToSys(response));
});

expressRouter.get("/member/sync", async (req, res) => {
  const body = `member sync ${CONST.DYNAMO_TABLE_PREFIX}`;
  await systemController.dynamoMemberUpdate(CONST.DISCORD_DEVELOP_CHANNEL_ID);
  res.send(body);
});

expressRouter.get("/member/restore", async (req, res) => {
  const body = UI.MEMBER_RESTORE;
  res.send(body);
});

expressRouter.post("/member/restore", async (req, res) => {
  const memberJson = JSON.parse(req.body.restoredata);
  const result = await memberService.memberRestore(memberJson);
  res.send({ mode: "member_restore", member_list: result });
});

expressRouter.get("/member/:eoa", async (req, res) => {
  const response = await memberModel.getMemberByEoa(req.params.eoa);
  res.send(response);
});

expressRouter.get("/shop", async (_, res) => {
  const response = await shopModel.getAllList();
  res.send(memberUtil.dynToSys(response));
});

expressRouter.get("/shop/restore", async (req, res) => {
  const body = UI.SHOP_RESTORE;
  res.send(body);
});

expressRouter.post("/shop/restore", async (req, res) => {
  const json = JSON.parse(req.body.restoredata);
  const result = await shopService.shopRestore(json);
  res.send({ mode: "shop_restore", shop_list: result });
});

expressRouter.get("/shop/id/:id", async (req, res) => {
  const response = await shopModel.getItem(req.params.id);
  res.send(memberUtil.dynToSys(response));
});

expressRouter.get("/shop/eoa/:eoa", async (req, res) => {
  const response = await shopModel.getItemByEoa(req.params.eoa);
  res.send(response);
});

expressRouter.post("/shop/add", async (req, res) => {
  let body = req.body;
  body.id = await shopModel.getNewId();
  await shopModel.createItem(body);
  res.send(body);
});

expressRouter.post("/shop/delete", async (req, res) => {
  const body = req.body;
  if (CONST.DYNAMO_SOFT_DELETE == "true") {
    await shopModel.softDelete(body.id);
  } else {
    await shopModel.deleteItem(body.id);
  }
  res.send(body);
});

expressRouter.post("/shop/update/:id", async (req, res) => {
  const body = req.body;
  body.id = req.params.id;
  console.log("ADD SHOP " + body.id);
  console.dir(body);
  const result = await shopModel.createItem(body);
  res.send(result);
});

expressRouter.get("/item", async (_, res) => {
  const response = await itemModel.getAllList();
  res.send(memberUtil.dynToSys(response));
});

expressRouter.get("/item/id/:id", async (req, res) => {
  const response = await itemModel.getItem(req.params.id);
  res.send(memberUtil.dynToSys(response));
});

expressRouter.get("/item/eoa/:eoa", async (req, res) => {
  const response = await itemModel.getItemByEoa(req.params.eoa);
  res.send(response);
});

expressRouter.post("/item/add", async (req, res) => {
  let body = req.body;
  body.id = await itemModel.getNewId();
  const result = await itemModel.createItem(body);
  res.send(result);
});

expressRouter.post("/item/delete", async (req, res) => {
  const body = req.body;
  if (CONST.DYNAMO_SOFT_DELETE == "true") {
    await itemModel.softDelete(body.id);
  } else {
    await itemModel.deleteItem(body.id);
  }
  res.send(body);
});

expressRouter.post("/item/update/:id", async (req, res) => {
  const body = req.body;
  body.id = req.params.id;
  const response = await itemModel.createItem(body);
  res.send(memberUtil.dynToSys(response));
});

expressRouter.get("/metadata/member/:id", async (req, res) => {
  const member: any = await memberModel.getMember(req.params.id);
  const donateBalance = await donateService.getDonate("balance", member.Eoa);
  const totalDonate = await donateService.getDonate(
    "totaldonations",
    member.Eoa
  );
  const result = {
    id: req.params.id,
    name: member.Name,
    eoa: member.Eoa,
    roles: Array.from(member.Roles),
    icon: member.Icon,
    donate: donateBalance,
    totaldonate: totalDonate,
  };
  res.send(result);
});

expressRouter.post("/transrequest", async (req, res) => {
  let body = req.body;
  const hashInfo = await util.getShortHash(body.ca + "/" + body.id);
  if (hashInfo.shortHash == body.secret) {
    const buyerDiscord: any = await memberModel.getMemberByEoa(body.eoa);
    const ownerDiscord: any = await memberModel.getMemberByEoa(hashInfo.owner);
    let BuyerID = body.eoa;
    let OwnerID = hashInfo.owner;
    let ChannelId = CONST.DISCORD_DEFAULT_CHANNEL_ID;
    let messageSend = false;

    if (buyerDiscord.DiscordId) {
      BuyerID = "<@" + buyerDiscord.DiscordId + ">";
      messageSend = true;
    }
    if (ownerDiscord.DiscordId) {
      OwnerID = "<@" + ownerDiscord.DiscordId + ">";
    }
    if (hashInfo.channelId) {
      ChannelId = hashInfo.channelId;
    }

    const message =
      OwnerID +
      " さん。\n" +
      BuyerID +
      " さんのNFT購入[ " +
      hashInfo.name +
      " ]が認証されました。\n以下のURLよりこちらのNFTを\n" +
      body.eoa +
      "\nにお送りください。\n" +
      CONST.PROVIDER_URL +
      "/donate/" +
      body.eoa +
      "/" +
      body.ca +
      "/" +
      body.id;

    await discordService.sendDiscordMessage(message, ChannelId);
    if (messageSend) {
      await discordService.sendDiscordDm(message, buyerDiscord.DiscordId);
    } else {
      await discordService.sendDiscordMessage(
        message,
        CONST.DISCORD_DEFAULT_CHANNEL_ID
      );
    }

    res.send({
      message: "APPROVED",
      requestInfo: {
        ca: body.ca,
        id: body.id,
        name: hashInfo.name,
        image: hashInfo.image,
        owner: body.eoa,
        creator: hashInfo.creator,
      },
    });
  }
  res.send({ message: "NOT_APPROVED" });
});

export default expressRouter;
