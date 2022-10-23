const express = require('express'); // expressを利用することを定義
const app = express();              // expressをappと定義
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

const oracledb = require('oracledb');          // 今回はoracleを利用する
const connection = oracledb.createConnection({ // 以下、各自のoracledbへの接続情報を書く
  user     : '(OracleのユーザーID)',
  password : '(ユーザーのパスワード)',
  connectString: 'localhost:1521/orcl'
});

// ステータス500になります。原因究明の能力なしです。
app.get('/', function (req, res) { // app.get...(expressの構文)、req=request。 res=response
  const sql = req.query.sql;
  res.set({ 'Access-Control-Allow-Origin': '*' }); // この記載により、※1：CORSを許可する
  connection.query(sql, function (error, results) {
  if (error) throw error; // エラー処理
    res.send(results);
  });
});

// serverMiddleware導入で変更
// app.listen(5000, function () { // port 5000をlistenする
//   console.log('Example app listening on port 5000!'); // console.logによりファイル実行時にコンソールに文字表示させる
// });
export default app;
