export const sleep = (waitTime) => {
  console.log("wait to " + waitTime);
  if (waitTime < 1) {
    return;
  }
  const startTime = Date.now();
  while (Date.now() - startTime < waitTime);
};

export const log = (title, message) => {
  console.log(title + ":" + message);
};

const dynamoDbToJson = (dynamoData) => {
  // dynamoDataが配列でない場合、配列に変換して処理
  const isArray = Array.isArray(dynamoData);
  const dataArray = Array.isArray(dynamoData) ? dynamoData : [dynamoData];

  const result = dataArray.map((item) => {
    let result = {};
    for (const key in item) {
      const valueObj = item[key];
      // S, N, BOOLのいずれかのキーに応じて値を取り出す
      if (valueObj.S !== undefined) {
        result[key] = valueObj.S; // String
      } else if (valueObj.N !== undefined) {
        result[key] = Number(valueObj.N); // Number
      } else if (valueObj.BOOL !== undefined) {
        result[key] = valueObj.BOOL; // Boolean
      } else if (valueObj.M !== undefined) {
        result[key] = dynamoDbToJson([valueObj.M])[0]; // Map
      }
      // 必要に応じて他の型もここに追加可能
    }
    return result;
  });

  if (isArray) {
    return result;
  } else {
    return result[0];
  }
};

const urils = {
  dynamoDbToJson,
  sleep,
  log,
};

export default urils;
