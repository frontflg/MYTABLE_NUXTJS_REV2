const express = require('express'); // expressを利用することを定義
const app = express();              // expressをappと定義
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

const mysql = require('mysql');     // MySQLを利用する
const connection = mysql.createConnection({ // 以下、各自のMySQLへの接続情報を書く
  host     : 'localhost',
  user     : '(ユーザＩＤ)',
  password : '(パスワード)',
  database : '(データベース名)'
});

app.get('/', function (req, res) { // app.get...(expressの構文)、req=request。 res=response
  const sql = req.query.sql;
  res.set({ 'Access-Control-Allow-Origin': '*' }); // この記載により、※1：CORSを許可する
  connection.query(sql, function (error, results) {
    if (error) throw error; // エラー処理
    res.send(results);
  });
});

const sub = require('./sub');

app.post('/update', sub.update);

app.post('/delete', sub.delete);

export default app;
