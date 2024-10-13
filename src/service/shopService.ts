import shopModel from "../model/shopModel.js";

const json2entity = (json) => {
  const entity = {
    id: String(json.Id),
    eoa: json.Eoa,
    name: json.Name,
    seed: json.Seed,
    channelId: json.ChannelId,
    imgurl: json.Imgurl,
    type: json.Type,
    status: String(json.Status),
    json: json.Json,
  };
  return entity;
};

const shopRestore = async (json) => {
  let count = 0;
  for (let key in json) {
    await shopModel.createItem(json2entity(json[key]));
    count++;
  }
  return count;
};

const shopService = {
  shopRestore,
};

export default shopService;
