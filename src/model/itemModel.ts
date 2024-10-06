import { CRUD } from "../crud/crud.js";
import { CONST } from "../common/const.js";
import dynamoService from "../service/dynamoService.js";

const crud = CRUD.item;

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
  const result = await dynamoService.query(params);
  return result;
};

const getAllList = async () => {
  return await dynamoService.getAllItems(crud.tableName);
};

const createItem = async (entity) => {
  let params = crud.write;
  params.Item.Id.N = entity.id;
  params.Item.Name.S = entity.name;
  params.Item.Contract.S = entity.contract;
  params.Item.TokenId.S = entity.tokenid;
  params.Item.Price.N = entity.price;
  params.Item.Status.N = entity.status;
  params.Item.Json.S = entity.json;
  params.Item.Creator.S = entity.creator;
  params.Item.Link.S = entity.link;
  console.dir("CreateItem BODY" + JSON.stringify(params));
  await dynamoService.putItem(params);
};

const updateItem = async (item) => {
  console.dir(item);
  if (item.roles.length == 0) {
    item.roles.push("");
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

  /*
  discordService.sendDiscordMessage(
    "<@" + item.id + ">の情報が更新されました\n information has been updated",
    CONST.DISCORD_DEFAULT_CHANNEL_ID
  );
  */
  await dynamoService.updateItem(params);
};

const deleteItem = async (item) => {
  console.log(
    "HARD DELETE " +
      crud.tableName +
      " ID:" +
      item.Id.N +
      " name:" +
      item.Name.S
  );
  let params = crud.delete;
  params.Key.Id.N = item.Id.N;
  await dynamoService.deleteItem(params);
};

const softDelete = async (item) => {
  console.log(
    "SOFT DELETE " +
      crud.tableName +
      " ID:" +
      item.Id.N +
      " name:" +
      item.Name.S
  );
  let params = crud.update;
  params.Key.Id.N = item.Id.N;
  params.UpdateExpression = "SET DeleteFlag = :newVal";
  params.ExpressionAttributeValues = {
    ":newVal": { BOOL: true } as object,
  };
  await dynamoService.updateItem(params);
};

const listUpdate = async (discordList, dynamoList) => {
  let addCnt = 0;
  let updateCnt = 0;
  let delCnt = 0;
  for (let key in discordList) {
    const discordItem = discordList[key];
    const filteredItems = dynamoList.filter(
      (item) => String(item.Id.N) === String(discordItem.id)
    );
    if (filteredItems.length == 0) {
      addCnt++;
      await createItem(discordItem);
    } else {
      if (discordItem.name !== filteredItems[0].Name.S) {
        updateCnt++;
        await updateItem(discordItem);
      }
    }
  }

  for (let key in dynamoList) {
    const dynamoItem = dynamoList[key];
    if (dynamoItem) {
      const filteredItems = discordList.filter(
        (item) => String(item.id) === String(dynamoItem.Id.N)
      );
      if (filteredItems.length == 0) {
        delCnt++;
        if (CONST.DYNAMO_SOFT_DELETE == "true") {
          await softDelete(dynamoItem);
        } else {
          await deleteItem(dynamoItem);
        }
      }
    }
  }
  console.log("dis:" + discordList.length + " dyn:" + dynamoList.length);
  console.log("add:" + addCnt + " update:" + updateCnt + " del:" + delCnt);
};

const getItemByEoa = async (eoa) => {
  let params = crud.query;
  params.TableName = crud.tableName;
  params.KeyConditionExpression = "#PartitionName = :PartitionName";
  params.FilterExpression = "#DeleteFlag = :DeleteFlag and #Creator = :Creator";
  params.ExpressionAttributeNames = {
    "#PartitionName": "PartitionName",
    "#DeleteFlag": "DeleteFlag",
    "#Creator": "Creator",
  } as object;
  params.ExpressionAttributeValues = {
    ":PartitionName": { S: crud.partitionName },
    ":DeleteFlag": { BOOL: false },
    ":Creator": { S: eoa },
  } as object;
  const result = await dynamoService.query(params);
  return result.Items;
};

const roleModel = {
  getNewId,
  getList,
  getItem,
  getAllList,
  createItem,
  updateItem,
  deleteItem,
  softDelete,
  listUpdate,
  getItemByEoa,
};
export default roleModel;
