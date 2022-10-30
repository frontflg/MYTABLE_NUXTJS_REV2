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

app.post('/bookupdate', function (req, res) { // app.post...(expressの構文)、req=request。 res=response
  const isbn13 = req.body.ISBN13;
  if (isbn13.trim().length > 13) {
    console.log('UPDATE ID FAILER:' + isbn13);
    throw error; // エラー処理
  }
  console.log('UPDATE ' + isbn13);
  let sql = 'UPDATE booklog SET ISBN10 = "' + req.body.ISBN10;
  sql += '", BookName = "'  + req.body.BookName;
  sql += '", Author = "'    + req.body.Author;
  sql += '", Publisher = "' + req.body.Publisher;
  sql += '", Genre = "'     + req.body.Genre;
  if (req.body.IssueDate !== '') {
    sql += '", IssueDate = "0000/00/00';
  } else {
    sql += '", IssueDate = "'  + req.body.IssueDate;
  }
  if (req.body.GetDate !== '') {
    sql += '", GetDate = "0000/00/00';
  } else {
    sql += '", GetDate = "'    + req.body.GetDate;
  }
  if (req.body.ReadDate !== '') {
    sql += '", ReadDate = "0000/00/00';
  } else {
    sql += '", ReadDate = "'    + req.body.ReadDate;
  }
  sql += '", Ownership = '     + req.body.Ownership;
  if (req.body.Purchase === '') {
    sql += ', Purchase = null';
  } else {
    sql += ', Purchase = '     + req.body.Purchase;
  }
  sql +=  ', Library = "'      + req.body.Library;
  sql += '", Overview = "'     + req.body.Overview;
  sql += '", Impressions = "'  + req.body.Impressions;
  sql += '", State = "'        + req.body.State;
  sql += '", CoverImg = "'     + req.body.CoverImg;
  sql += '" where ISBN13 = "'  + isbn13 + '"';
  res.set({ 'Access-Control-Allow-Origin': '*' }); // この記載により、※1：CORSを許可する
  connection.query(sql, function (error, results) {
    if (error) {
      console.log(sql);
      throw error; // エラー処理
    } else {
      res.status(200).send();
    }
  });
});

export default app;
