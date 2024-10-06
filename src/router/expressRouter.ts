import express from "express";
import { CONST } from "../common/const.js";
import shopModel from "../model/shopModel.js";
import itemModel from "../model/itemModel.js";
import util from "../common/util.js";

const expressRouter = express.Router();
expressRouter.use(express.json());

expressRouter.get("/", async (_, res) => {
  const result = "<h1>" + CONST.SERVER_INFO + " ver." + CONST.VERSION + "</h1>";
  res.send(result);
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

export default expressRouter;
