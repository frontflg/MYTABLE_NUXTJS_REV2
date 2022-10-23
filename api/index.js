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
  const isbn10    = req.body.ISBN10;
  const bookName  = req.body.BookName;
  const author    = req.body.Author;
  const publisher = req.body.Publisher;
  const genre     = req.body.Genre;
  let issueDate = '0000/00/00';
  if (req.body.IssueDate !== '') {
    issueDate = req.body.IssueDate;
  }
  let getDate = '0000/00/00';
  if (req.body.GetDate !== '') {
    getDate = req.body.GetDate;
  }
  let readDate = '0000/00/00';
  if (req.body.ReadDate !== '') {
    readDate = req.body.ReadDate;
  }
  const ownership = req.body.Ownership;
  const purchase  = req.body.Purchase;
  const library   = req.body.Library;
  const overview  = req.body.Overview;
  const impress   = req.body.Impressions;
  const state     = req.body.State;
  const coverImg  = req.body.CoverImg;
  const sql = 'UPDATE booklog SET ISBN10 = ?, BookName = ?, Author = ?, Publisher = ?, Genre = ?,' +
              ' IssueDate = ?,GetDate = ?, ReadDate = ?, Ownership = ?, Purchase = ?, Library = ?,' +
              ' Overview  = ?, Impressions = ?, State = ?, CoverImg = ? where ISBN13 = ?';
  res.set({ 'Access-Control-Allow-Origin': '*' }); // この記載により、※1：CORSを許可する
  connection.query(sql,[isbn10, bookName, author, publisher, genre, issueDate, getDate, readDate,
                ownership, purchase, library, overview, impress, state, coverImg, isbn13],
                function (error, results) {
    if (error) {
      throw error; // エラー処理
    } else {
      res.status(200).send();
    }
  });
});

export default app;
