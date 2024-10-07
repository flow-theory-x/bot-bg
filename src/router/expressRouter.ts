import express from "express";
import { CONST } from "../common/const.js";
import memberModel from "../model/memberModel.js";
import shopModel from "../model/shopModel.js";
import itemModel from "../model/itemModel.js";
import util from "../common/util.js";
import discordService from "../service/discordService.js";

const expressRouter = express.Router();
expressRouter.use(express.json());

expressRouter.get("/", async (_, res) => {
  const result = "<h1>" + CONST.SERVER_INFO + " ver." + CONST.VERSION + "</h1>";
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

expressRouter.get("/member/:eoa", async (req, res) => {
  const response = await memberModel.getMemberByEoa(req.params.eoa);
  res.send(response);
});

expressRouter.get("/shop", async (_, res) => {
  const response = await shopModel.getAllList();
  res.send(util.dynamoDbToJson(response));
});

expressRouter.get("/shop/id/:id", async (req, res) => {
  const response = await shopModel.getItem(req.params.id);
  res.send(util.dynamoDbToJson(response));
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
  res.send(util.dynamoDbToJson(response));
});

expressRouter.get("/item/id/:id", async (req, res) => {
  const response = await itemModel.getItem(req.params.id);
  res.send(util.dynamoDbToJson(response));
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
  res.send(util.dynamoDbToJson(response));
});

expressRouter.post("/transrequest", async (req, res) => {
  let body = req.body;
  const hashInfo = await util.getShortHash(body.ca + "/" + body.id);
  if (hashInfo.shortHash == body.secret) {
    const ownerDiscord: any = await memberModel.getMemberByEoa(body.eoa);
    const creatorDiscord: any = await memberModel.getMemberByEoa(
      hashInfo.creator
    );
    let OwnerID = body.eoa;
    let CreatorID = hashInfo.creator;
    let ChannelId = CONST.DISCORD_DEFAULT_CHANNEL_ID;

    if (ownerDiscord.DiscordId) {
      OwnerID = "<@" + ownerDiscord.DiscordId + ">";
    }
    if (creatorDiscord.DiscordId) {
      CreatorID = "<@" + creatorDiscord.DiscordId + ">";
    }
    if (hashInfo.channelId) {
      ChannelId = hashInfo.channelId;
    }

    const message =
      CreatorID +
      " さん。\n" +
      OwnerID +
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

    res.send({
      message: "Your request has been approved.",
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
  res.send({
    message: `${body.eoa} から不正なsecretが送信されました。${
      body.ca + "/" + body.id
    } ${hashInfo.shortHash} ${body.secret}`,
  });
});

export default expressRouter;
