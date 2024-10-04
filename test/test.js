import dotenv from 'dotenv';
dotenv.config();

// 環境変数が正しく読み込まれたか確認
console.log("DISCORD_BOT_KEY:", process.env.DISCORD_BOT_KEY);

import { testEvent } from '../test/testEvent.js';

// Lambda関数のインポート
import { handler } from "./index.js";

// Lambda関数を実行して結果を表示
handler(testEvent)
  .then(response => console.log(response))
  .catch(error => console.error(error));
