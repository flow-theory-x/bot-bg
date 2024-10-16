import { CRUD } from "../crud/crud.js";
import { CONST } from "../common/const.js";
import dynamoService from "../service/dynamoService.js";
import memberUtil from "../common/memberUtli.js";

const crud = CRUD.shop;

const getNewId = async () => {
  let params = crud.read;
  const maxid = await dynamoService.getMaxId(params.TableName, "Id");
  return maxid + 1;
};

const getItem = async (id) => {
  let params = crud.read;
  params.Key.Id.N = id;
  return await dynamoService.getItem(params);
};

const getList = async () => {
  let params = crud.query;
  params.FilterExpression = "#DeleteFlag = :DeleteFlag";
  params.ExpressionAttributeNames = {
    "#PartitionName": "PartitionName",
    "#DeleteFlag": "DeleteFlag",
  } as object;
  params.ExpressionAttributeValues = {
    ":PartitionName": { S: crud.partitionName },
    ":DeleteFlag": { BOOL: false },
  } as object;
  const result = await dynamoService.query(params);
  return result;
};

const getAllList = async () => {
  return await dynamoService.getAllItems(crud.tableName);
};

const createItem = async (entity) => {
  console.log("shop create shop");
  console.dir(entity);
  let params = crud.write;
  params.Item.Id.N = String(entity.id);
  params.Item.Eoa.S = entity.eoa;
  params.Item.Name.S = entity.name;
  params.Item.Seed.S = entity.seed;
  params.Item.ChannelId.S = entity.channelId;
  params.Item.Imgurl.S = entity.imgurl;
  params.Item.Type.S = entity.type;
  params.Item.Status.N = String(entity.status);
  params.Item.Json.S = entity.json;
  console.dir("CreateItem BODY" + JSON.stringify(params));
  await dynamoService.putItem(params);
};

const updateItem = async (item) => {
  console.dir(item);
  if (item.roles.length == 0) {
    item.roles.push("0");
  }
  let params = crud.update;
  params.Key.Id.N = String(item.id);
  params.UpdateExpression = "SET #Name = :Name, #Updated = :updated";
  params.ExpressionAttributeNames = {
    "#Name": "Name",
    "#Updated": "Updated",
  } as object;
  params.ExpressionAttributeValues = {
    ":Name": { S: item.name } as object,
    ":updated": { S: new Date(new Date().getTime()) } as object,
  };

  await dynamoService.updateItem(params);
};

const deleteItem = async (id) => {
  let params = crud.delete;
  params.Key.Id.N = String(id);
  await dynamoService.deleteItem(params);
};

const softDelete = async (id) => {
  let params = crud.update;
  params.Key.Id.N = String(id);
  params.UpdateExpression = "SET #DeleteFlag = :newVal";
  params.ExpressionAttributeNames = {
    "#DeleteFlag": "DeleteFlag",
  } as object;
  params.ExpressionAttributeValues = {
    ":newVal": { BOOL: true } as object,
  };
  await dynamoService.updateItem(params);
};

const getItemByEoa = async (eoa) => {
  let params = crud.query;
  params.KeyConditionExpression = "#PartitionName = :PartitionName";
  params.FilterExpression = "#DeleteFlag = :DeleteFlag and #Eoa = :Eoa";
  params.ExpressionAttributeNames = {
    "#PartitionName": "PartitionName",
    "#DeleteFlag": "DeleteFlag",
    "#Eoa": "Eoa",
  } as object;
  params.ExpressionAttributeValues = {
    ":PartitionName": { S: crud.partitionName },
    ":DeleteFlag": { BOOL: false },
    ":Eoa": { S: eoa },
  } as object;
  const result = await dynamoService.query(params);
  if (result.Count == 1) {
    let item = result.Items[0];
    return memberUtil.dynToSys(item);
  } else if (result.Count == 0) {
    return { message: "Item not found" };
  } else {
    return { message: "many Item" };
  }
};

const shopModel = {
  getNewId,
  getList,
  getItem,
  getAllList,
  createItem,
  updateItem,
  deleteItem,
  softDelete,
  getItemByEoa,
};
export default shopModel;
