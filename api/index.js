const express = require('express'); // expressを利用することを定義
const app = express();              // expressをappと定義
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

const mysql = require('mysql');              // 今回はMySQLを利用する
const connection = mysql.createConnection({  // 以下、各自のMySQLへの接続情報を書く
  host     : 'localhost',
  user     : '(ユーザＩＤ)',
  password : '(パスワード)',
  database : '(データベース名)'
});

app.get('/', function (req, res) { // app.get...(expressの構文)、req=request。 res=response
  res.set({ 'Access-Control-Allow-Origin': '*' }); // この記載により、※1：CORSを許可する
  connection.query('SELECT TABLE_NAME,TABLE_COMMENT,TABLE_ROWS,CREATE_TIME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = "(スキーマ名)"', function (error, results) {
    if (error) throw error; // エラー処理
    res.send(results);
  });
});

app.get('/recList', function (req, res) { // app.get...(expressの構文)、req=request。 res=response
  const tbl = req.query.tbl;
  console.log('TABLE ID' + tbl);
  const sql = 'SELECT C.COLUMN_COMMENT AS text,C.COLUMN_NAME AS value,' +
    ' CASE WHEN C.CHARACTER_MAXIMUM_LENGTH IS NULL THEN 100' +
    ' WHEN C.CHARACTER_MAXIMUM_LENGTH > 100 THEN 500' +
    ' WHEN C.CHARACTER_MAXIMUM_LENGTH < 13 THEN 100' +
    ' ELSE C.CHARACTER_MAXIMUM_LENGTH * 8 END AS width' +
    ' FROM information_schema.COLUMNS C' +
    ' WHERE C.TABLE_SCHEMA = "(スキーマ名)" AND C.TABLE_NAME = ?';
  res.set({ 'Access-Control-Allow-Origin': '*' }); // この記載により、※1：CORSを許可する
  connection.query(sql, tbl, function (error, results) { // テーブルカラムを取得する
    if (error) throw error; // エラー処理
    res.send(results);
  });
});

app.get('/search', function (req, res) { // app.get...(expressの構文)、req=request。 res=response
  const tbl = req.query.tbl;
  console.log('TABLE ID' + tbl);
  const sql = 'SELECT * FROM ' + tbl;
  res.set({ 'Access-Control-Allow-Origin': '*' }); // この記載により、※1：CORSを許可する
  connection.query(sql, function (error, results) { // テーブルデータを取得する
    if (error) throw error; // エラー処理
    res.send(results);
  });
});

app.listen(5000, function () { // port 5000をlistenする
  console.log('Example app listening on port 5000!'); // console.logによりファイル実行時にコンソールに文字表示させる
});
