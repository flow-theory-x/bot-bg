import { CONST } from "../common/const.js";
const TableName = CONST.DYNAMO_TABLE_PREFIX + "_shop";
const PartitionName = "Shops";

export const SHOP = {
  tableName: TableName,
  partitionName: PartitionName,
  create: {
    TableName: TableName,
    AttributeDefinitions: [
      { AttributeName: "PartitionName", AttributeType: "S" },
      { AttributeName: "Id", AttributeType: "N" },
    ],
    KeySchema: [
      { AttributeName: "PartitionName", KeyType: "HASH" },
      { AttributeName: "Id", KeyType: "RANGE" },
    ],
    ProvisionedThroughput: {
      ReadCapacityUnits: 5,
      WriteCapacityUnits: 5,
    },
  },
  write: {
    TableName: TableName,
    Item: {
      PartitionName: { S: PartitionName },
      Id: { N: "0" },
      Eoa: { S: "" },
      Name: { S: "" },
      Imgurl: { S: "" },
      Type: { S: "" },
      Seed: { S: "" },
      ChannelId: { S: "" },
      Status: { N: "0" },
      Json: {
        S: '{"en":{"name":""},"ja":{"name":""}}',
      },
      DeleteFlag: { BOOL: "false" },
      Created: { S: new Date() },
      Updated: { S: new Date() },
    },
  },
  read: {
    TableName: TableName,
    Key: {
      PartitionName: { S: PartitionName },
      Id: { N: "0" },
    },
  },
  update: {
    TableName: TableName,
    Key: {
      PartitionName: { S: PartitionName },
      Id: { N: "0" },
    },
    UpdateExpression: "SET Name = :newVal",
    ExpressionAttributeNames: {},
    ExpressionAttributeValues: {},
  },
  delete: {
    TableName: TableName,
    Key: {
      PartitionName: { S: PartitionName },
      Id: { N: "0" },
    },
  },
  query: {
    TableName: TableName,
    KeyConditionExpression: "#PartitionName = :PartitionName",
    FilterExpression: "#DeleteFlag = :DeleteFlag",
    ExpressionAttributeNames: {
      "#PartitionName": "PartitionName",
      "#DeleteFlag": "DeleteFlag",
    } as object,
    ExpressionAttributeValues: {
      ":PartitionName": { S: PartitionName },
      ":DeleteFlag": { BOOL: false },
    } as object,
  },
  scan: { TableName: TableName, Limit: 1000 },
};
