import {
  DynamoDBClient,
  CreateTableCommand,
  PutItemCommand,
  GetItemCommand,
  UpdateItemCommand,
  DeleteItemCommand,
  QueryCommand,
  ScanCommand,
} from "@aws-sdk/client-dynamodb";
import { unmarshall } from "@aws-sdk/util-dynamodb";
import { CONST } from "../common/const.js";
import { CRUD } from "../crud/crud.js";

const client = new DynamoDBClient({ region: CONST.DYNAMO_REGION });

const dynamoCreateTable = async (tableName) => {
  let params = CRUD[tableName].create;
  dynamoService.createTable(params);
};

const createTable = async (params) => {
  const command = new CreateTableCommand(params);
  try {
    await client.send(command);
  } catch (err) {
    console.log(err);
  }
};

const putItem = async (params) => {
  try {
    await client.send(new PutItemCommand(params));
  } catch (err) {
    console.log(err);
  }
};

const getItem = async (params) => {
  try {
    const result = await client.send(new GetItemCommand(params));
    return result.Item;
  } catch (err) {
    console.log(err);
  }
};

const updateItem = async (params) => {
  try {
    await client.send(new UpdateItemCommand(params));
  } catch (err) {
    console.log(err);
  }
};

const deleteItem = async (params) => {
  try {
    await client.send(new DeleteItemCommand(params));
  } catch (err) {
    console.log(err);
  }
};

const query = async (params) => {
  try {
    const result = await client.send(new QueryCommand(params));
    return result;
  } catch (err) {
    console.log(err);
  }
};

const scan = async (params) => {
  try {
    const result = await client.send(new ScanCommand(params));
    return result;
  } catch (err) {
    console.log(err);
  }
};

const getAllItems = async (tableName) => {
  let lastEvaluatedKey = undefined;
  let list = [];
  do {
    const params: any = {
      TableName: tableName,
    };
    if (lastEvaluatedKey) {
      params.ExclusiveStartKey = lastEvaluatedKey;
    }
    try {
      const response = await client.send(new ScanCommand(params));
      for (let i = 0; i < response.Items.length; i++) {
        const member = response.Items[i];
        list.push(member);
      }
      lastEvaluatedKey = response.LastEvaluatedKey;
    } catch (error) {
      console.error("Unable to scan the table:", error);
      throw new Error(`Unable to scan the table : ${error}`);
    }
  } while (lastEvaluatedKey);
  return list;
};

const getDisplayData = async (tableName) => {
  const list = await getAllItems(tableName);
  let result = "\n";
  for (let key in list) {
    const data = list[key];
    result =
      result +
      key +
      " | name:" +
      data.Name.S +
      " discordId:" +
      data.DiscordId.S +
      //" roles:" + data.Roles.NS +
      //" join:" + data.Join.S +
      "\n";
  }
  return result;
};

const getMaxId = async (tableName, idName) => {
  const params: any = {
    TableName: tableName,
    ProjectionExpression: idName, // IDフィールドのみ取得
  };

  let maxId = null;
  let items = [];
  let lastEvaluatedKey = null;

  do {
    const response = await client.send(new ScanCommand(params));
    items = items.concat(
      response.Items.map((item) => unmarshall(item)[idName])
    );
    lastEvaluatedKey = response.LastEvaluatedKey;
    params.ExclusiveStartKey = lastEvaluatedKey;
  } while (lastEvaluatedKey);

  if (items.length > 0) {
    maxId = Math.max(...items);
  }

  return maxId;
};

const dynamoService = {
  createTable,
  putItem,
  getItem,
  updateItem,
  deleteItem,
  scan,
  query,
  getAllItems,
  getDisplayData,
  getMaxId,
  dynamoCreateTable,
};

export default dynamoService;
