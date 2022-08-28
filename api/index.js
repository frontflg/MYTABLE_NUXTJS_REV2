const express = require('express'); // expressを利用することを定義
const app = express();              // expressをappと定義
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

const mysql = require('mysql'); // MySQLを利用する
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
  console.log('TABLE ' + tbl);
  const sql = 'SELECT C.COLUMN_COMMENT AS text,C.COLUMN_NAME AS value,' +
              ' CASE WHEN C.DATA_TYPE = "date" THEN 110 ' +
              ' WHEN C.DATA_TYPE LIKE "%int%" THEN C.NUMERIC_PRECISION * 4 + 50' +
              ' WHEN C.CHARACTER_MAXIMUM_LENGTH IS NULL THEN 100' +
              ' WHEN C.CHARACTER_MAXIMUM_LENGTH > 100 THEN 500' +
              ' WHEN C.CHARACTER_MAXIMUM_LENGTH < 13 THEN 100' +
              ' ELSE C.CHARACTER_MAXIMUM_LENGTH * 5 + 40 END AS width' +
              ' FROM information_schema.COLUMNS C' +
              ' WHERE C.TABLE_NAME = ? ORDER BY C.ORDINAL_POSITION';
  res.set({ 'Access-Control-Allow-Origin': '*' }); // この記載により、※1：CORSを許可する
  connection.query(sql, tbl, function (error, results) { // テーブルカラムを取得する
    if (error) throw error; // エラー処理
    res.send(results);
  });
});

app.get('/search', function (req, res) { // app.get...(expressの構文)、req=request。 res=response
  const tbl = req.query.tbl;
  console.log('TABLE ' + tbl);
  const sql = 'SELECT * FROM ' + tbl;
  res.set({ 'Access-Control-Allow-Origin': '*' }); // この記載により、※1：CORSを許可する
  connection.query(sql, function (error, results) { // テーブルカラムを取得する
    if (error) throw error; // エラー処理
    res.send(results);
  });
});

app.get('/booklog', function (req, res) { // app.get...(expressの構文)、req=request。 res=response
  res.set({ 'Access-Control-Allow-Origin': '*' }); // この記載により、※1：CORSを許可する
  connection.query('select *,DATE_FORMAT(IssueDate,"%Y-%m-%d") AS IDATE,ROW_NUMBER() OVER (ORDER BY ISBN13) AS line from booklog order by GetDate desc', function (error, results) { // booklogテーブルから全てのカラムを取得する
    if (error) throw error; // エラー処理
    res.send(results);
  });
});

app.get('/booksearch', function (req, res) { // app.get...(expressの構文)、req=request。 res=response
  const id = req.query.id;
  console.log('SEARCH ' + id);
  res.set({ 'Access-Control-Allow-Origin': '*' }); // この記載により、※1：CORSを許可する
  connection.query('select *,DATE_FORMAT(IssueDate,"%Y-%m-%d") AS IDATE,DATE_FORMAT(GetDate,"%Y-%m-%d") AS GDATE,DATE_FORMAT(ReadDate,"%Y-%m-%d") AS RDATE from booklog where ISBN13 = ?', id, function (error, results) { // booklogテーブルから指定のカラムを取得する
    if (error) throw error; // エラー処理
    res.send(results);
  });
});

app.get('/bookinsert', function (req, res) { // app.get...(expressの構文)、req=request。 res=response
  const id = req.query.id;
  console.log('INSERT ' + id);
  res.set({ 'Access-Control-Allow-Origin': '*' }); // この記載により、※1：CORSを許可する
  connection.query('insert into booklog (ISBN13,BookName) values (?,"書名")', id, function (error, results) { // booklogテーブルに行を追加する
    if (error) {
      throw error; // エラー処理
    } else {
      res.status(200).send();
    }
  });
});

app.get('/bookdelete', function (req, res) { // app.get...(expressの構文)、req=request。 res=response
  const id = req.query.id;
  console.log('DELETE ' + id);
  res.set({ 'Access-Control-Allow-Origin': '*' }); // この記載により、※1：CORSを許可する
  connection.query('delete from booklog where ISBN13 = ?', id, function (error, results) { // booklogテーブルから指定の行を削除取得する
    if (error) {
      throw error; // エラー処理
    } else {
      res.status(200).send();
    }
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

// serverMiddleware導入で変更
// app.listen(5000, function () { // port 5000をlistenする
//   console.log('Example app listening on port 5000!'); // console.logによりファイル実行時にコンソールに文字表示させる
// });
export default app;
