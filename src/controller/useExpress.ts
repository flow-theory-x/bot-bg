import express from "express"; // Expressをインポート
import { createServer } from "http"; // Lambda上でのサーバーは不要

const connect = (event) => {
  const app = express();
  app.use(express.json()); // JSONボディを解析

  // CORS設定
  app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    next();
  });

  // APIエンドポイント
  app.get("/api", (req, res) => {
    res.status(200).send({ message: "API is working" });
  });

  app.post("/api", (req, res) => {
    const data = req.body; // リクエストボディの取得
    res.status(200).send({ message: "Data received", data });
  });

  // リクエストを処理
  return new Promise((resolve, reject) => {
    const server = createServer(app);
    server.emit("request", event, {
      status: (code) => ({
        send: (data) =>
          resolve({ statusCode: code, body: JSON.stringify(data) }),
      }),
    });
  });
};

const useExpress = {
  connect,
};

export default useExpress;
