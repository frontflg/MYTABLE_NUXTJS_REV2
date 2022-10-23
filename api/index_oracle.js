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

// 汎用テーブル更新処理
app.post('/update', function(req, res) {
  const id = req.query.id;
  const name = req.body[0].name;
  const val  = req.body[0].value;
  console.log('UPDATE ' + id + ' ' + name + ' ' + val);
  let strKeys = '';
  let strNums = '';
  let sqlWhere = '';
  let sqlInsCol = '';
  let sqlInsVal = '';
  let sqlUpdate = '';
  let isNum = 0;
  // プライマリーキー情報を取得
  const sql = 'SELECT col.column_name FROM USER_CONS_COLUMNS col' +
              ' INNER JOIN USER_CONSTRAINTS con ON col.constraint_name = con.constraint_name' +
              ' WHERE con.table_name = "' + id + '"' + ' AND con.constraint_type = "P" ORDER BY col.position';
  res.set({ 'Access-Control-Allow-Origin': '*' }); // この記載により、※1：CORSを許可する
  connection.query(sql, function (error, results) {
    if (error) {
      throw error; // エラー処理
    } else {
      strKeys = Object.values(JSON.parse(JSON.stringify(results)));
      // 数字項目情報を取得
      const sql2 = 'SELECT COLUMN_NAME FROM ALL_TAB_COLUMNS' +
                  ' WHERE TABLE_NAME = "' + id + '"' +
                  ' AND DATA_TYPE = "NUMBER" ORDER BY POSITION';
      res.set({ 'Access-Control-Allow-Origin': '*' }); // この記載により、※1：CORSを許可する
      connection.query(sql2, function (error, results) {
        if (error) {
          throw error; // エラー処理
        } else {
          strNums = JSON.stringify(results);
          for (let i = 0; i < req.body.length; i++) {
          // SQL WHERE句を編集
            const itemName = req.body[i].name;
            const itemValue = req.body[i].value;
            // 登録／更新用SQLを編集
            if (sqlUpdate === '') {
              sqlInsCol = ' (';
              sqlInsVal = ' VALUE(';
              sqlUpdate = ' SET ';
            } else {
              sqlInsCol = sqlInsCol + ',';
              sqlInsVal = sqlInsVal + ',';
              sqlUpdate = sqlUpdate + ',';
            }
            sqlInsCol = sqlInsCol + itemName;
            sqlUpdate = sqlUpdate + itemName + ' = ';
            isNum = 0;
            for( var k = 0; k < strNums.length; k++ ){
              if (strNums[k].COLUMN_NAME === itemName) {
                isNum = 1;
              }
            }
            if (isNum === 0 && itemValue !== null) {
              sqlInsVal = sqlInsVal + '"' + itemValue + '"';
              sqlUpdate = sqlUpdate + '"' + itemValue + '"';
            } else {
              sqlInsVal = sqlInsVal + itemValue;
              sqlUpdate = sqlUpdate + itemValue;
            }
            for( var j = 0; j < strKeys.length; j++ ){
              if (strKeys[j].COLUMN_NAME === itemName) {
                if (sqlWhere === '') {
                  sqlWhere = ' WHERE ' + itemName + ' = ';
                } else {
                  sqlWhere = sqlWhere + ' AND ' + itemName + ' = ';
                }
                if (isNum === 0) {
                  sqlWhere = sqlWhere + '"' + itemValue + '"';
                } else {
                  sqlWhere = sqlWhere + itemValue;
                }
              }
            }
          };
          sqlInsCol = sqlInsCol + ')';
          sqlInsVal = sqlInsVal + ')';
          if (sqlWhere) {
            // 存在チェック
            const sql3 = 'SELECT COUNT(*) AS CNT FROM ' + id + sqlWhere;
            res.set({ 'Access-Control-Allow-Origin': '*' }); // この記載により、※1：CORSを許可する
            console.log(sql3);
            connection.query(sql3, function (error, results) {
              if (error) {
                throw error; // エラー処理
              } else {
                const cnt = results;
                // NOT FOUND なら INSERT を実行
                if (cnt[0].CNT === 0) {
                  console.log('NOT FOUNDです INSERTします！');
                  const sql4 = 'INSERT INTO ' + id + sqlInsCol + sqlInsVal;
                  res.set({ 'Access-Control-Allow-Origin': '*' }); // この記載により、※1：CORSを許可する
                  connection.query(sql4, function (error, results) {
                    if (error) {
                      console.log(sql4);
                      throw error; // エラー処理
                    } else {
                      res.status(200).send();
                    }
                  })
                }
                // 既存なら、UPDATE を実行
                if (cnt[0].CNT === 1) {
                  console.log('該当１件あり UPDATEします！');
                  const sql5 = 'UPDATE ' + id + sqlUpdate + sqlWhere;
                  res.set({ 'Access-Control-Allow-Origin': '*' }); // この記載により、※1：CORSを許可する
                  connection.query(sql5, function (error, results) {
                    if (error) {
                      console.log(sql5);
                      throw error; // エラー処理
                    } else {
                      res.status(200).send();
                    }
                  })
                }
                // 複数なら、更新なし
                if (cnt[0].CNT > 1) {
                  console.log(cnt[0].CNT + '件あり 更新しません！');
                }
              }
            });
          } else {
            console.log('更新対象絞り込み不能！');
          }
        }
      });
    }
  });
};

// 汎用テーブル更新処理
app.post('/delete', function(req, res) {
  const id = req.query.id;
  const name = req.body[0].name;
  const val  = req.body[0].value;
  console.log('DELETE ' + id + ' ' + name + ' ' + val);
  let strKeys = '';
  let strNums = '';
  let sqlWhere = '';
  let isNum = 0;
  // プライマリーキー情報を取得
  const sql = 'SELECT col.column_name FROM USER_CONS_COLUMNS col' +
              ' INNER JOIN USER_CONSTRAINTS con ON col.constraint_name = con.constraint_name' +
              ' WHERE con.table_name = "' + id + '"' + ' AND con.constraint_type = "P" ORDER BY col.position';
  res.set({ 'Access-Control-Allow-Origin': '*' }); // この記載により、※1：CORSを許可する
  connection.query(sql, function (error, results) {
    if (error) {
      throw error; // エラー処理
    } else {
      strKeys = Object.values(JSON.parse(JSON.stringify(results)));
      // 数字項目情報を取得
      const sql2 = 'SELECT COLUMN_NAME FROM ALL_TAB_COLUMNS' +
                  ' WHERE TABLE_NAME = "' + id + '"' +
                  ' AND DATA_TYPE = "NUMBER" ORDER BY POSITION';
      res.set({ 'Access-Control-Allow-Origin': '*' }); // この記載により、※1：CORSを許可する
      connection.query(sql2, function (error, results) {
        if (error) {
          throw error; // エラー処理
        } else {
          strNums = JSON.stringify(results);
          for (let i = 0; i < req.body.length; i++) {
            // SQL WHERE句を編集
            const itemName = req.body[i].name;
            const itemValue = req.body[i].value;
            isNum = 0;
            for( var k = 0; k < strNums.length; k++ ){
              if (strNums[k].COLUMN_NAME === itemName) {
                isNum = 1;
              }
            }
            for( var j = 0; j < strKeys.length; j++ ){
              if (strKeys[j].COLUMN_NAME === itemName) {
                if (sqlWhere === '') {
                  sqlWhere = ' WHERE ' + itemName + ' = ';
                } else {
                  sqlWhere = sqlWhere + ' AND ' + itemName + ' = ';
                }
                if (isNum === 0) {
                  sqlWhere = sqlWhere + '"' + itemValue + '"';
                } else {
                  sqlWhere = sqlWhere + itemValue;
                }
              }
            }
          };
          if (sqlWhere) {
            // 存在チェック
            const sql3 = 'SELECT COUNT(*) AS CNT FROM ' + id + sqlWhere;
            res.set({ 'Access-Control-Allow-Origin': '*' }); // この記載により、※1：CORSを許可する
            console.log(sql3);
            connection.query(sql3, function (error, results) {
              if (error) {
                throw error; // エラー処理
              } else {
                const cnt = results;
                if (cnt[0].CNT === 0) {
                  console.log('NOT FOUNDです 削除できません！');
                }
                // 既存なら、DELETE を実行
                if (cnt[0].CNT === 1) {
                  console.log('該当１件あり DELETEします！');
                  const sql6 = 'DELETE FROM ' + id + sqlWhere;
                  res.set({ 'Access-Control-Allow-Origin': '*' }); // この記載により、※1：CORSを許可する
                  connection.query(sql6, function (error, results) {
                    if (error) {
                      console.log(sql6);
                      throw error; // エラー処理
                    } else {
                      res.status(200).send();
                    }
                  })
                }
                // 複数なら、削除なし
                if (cnt[0].CNT > 1) {
                  console.log(cnt[0].CNT + '件あり 削除しません！');
                }
              }
            });
          } else {
            console.log('削除対象絞り込み不能！');
          }
        }
      });
    }
  });
};

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
