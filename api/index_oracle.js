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
  res.set({ 'Access-Control-Allow-Origin': '*' }); // この記載により、※1：CORSを許可する
  connection.query('SELECT T.TABLE_NAME,C.COMMENTS,T.NUM_ROWS,LAST_ANALYZED FROM ALL_TABLES T LEFT JOIN USER_TAB_COMMENTS C ON T.TABLE_NAME = C.TABLE_NAME WHERE T.OWNER = "TESTUSER" ORDER BY T.OWNER,T.TABLE_NAME', function (error, results) {
    if (error) throw error; // エラー処理
    res.send(results);
  });
});

app.get('/recList', function (req, res) { // app.get...(expressの構文)、req=request。 res=response
  const tbl = req.query.tbl;
  console.log('TABLE ' + tbl);
  const sql = 'SELECT C.COMMENTS AS text,T.COLUMN_NAME AS value,' +
              ' CASE WHEN T.DATA_TYPE = "DATE" THEN 110' +
              ' WHEN T.DATA_TYPE = "NUMBER" THEN T.DATA_PRECISION * 4 + 50' +
              ' WHEN T.DATA_LENGTH IS NULL THEN 100' +
              ' WHEN T.DATA_LENGTH > 90 THEN 500' +
              ' WHEN T.DATA_LENGTH < 13 THEN 100' +
              ' ELSE T.DATA_LENGTH * 5 + 40 END AS width' +
              ' ,T.DATA_TYPE as datatype,T.DATA_LENGTH as dataleng' +
              ' FROM ALL_TAB_COLUMNS T' +
              ' LEFT JOIN USER_COL_COMMENTS C' +
              '   ON T.TABLE_NAME = C.TABLE_NAME' +
              '  AND T.COLUMN_NAME = C.COLUMN_NAME' +
              ' WHERE T.TABLE_NAME = ? ORDER BY T.COLUMN_ID';
  res.set({ 'Access-Control-Allow-Origin': '*' }); // この記載により、※1：CORSを許可する
  connection.query(sql, tbl, function (error, results) { // テーブルカラムを取得する
    if (error) throw error; // エラー処理
    res.send(results);
  });
});

app.get('/search', function (req, res) { // app.get...(expressの構文)、req=request。 res=response
  const tbl = req.query.tbl;
  console.log('TABLE ' + tbl);
  const sql = 'SELECT *,ROWID FROM ' + tbl;
  res.set({ 'Access-Control-Allow-Origin': '*' }); // この記載により、※1：CORSを許可する
  connection.query(sql, function (error, results) { // テーブルカラムを取得する
    if (error) throw error; // エラー処理
    res.send(results);
  });
});

// serverMiddleware導入で変更
// app.listen(5000, function () { // port 5000をlistenする
//   console.log('Example app listening on port 5000!'); // console.logによりファイル実行時にコンソールに文字表示させる
// });
export default app;
