import { CRUD } from "../crud/crud.js";
import { CONST } from "../common/const.js";
import dynamoService from "../service/dynamoService.js";

const crud = CRUD.content;

const getItem = async (req) => {
  let params = crud.read;
  params.Key.Id.N = req.params.id;
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

const createItem = async (item) => {
  let params = crud.write;
  params.Item.Id.N = item.id;
  params.Item.Name.S = item.name;
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

const contentModel = {
  getList,
  getItem,
  getAllList,
  createItem,
  updateItem,
  deleteItem,
  softDelete,
  listUpdate,
};
export default contentModel;
