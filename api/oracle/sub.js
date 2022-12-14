const oracledb = require('oracledb');        // 今回はoracleを利用する
const connection = oracledb.getConnection({  // 以下、各自のOracleへの接続情報を書く
  user : 'myuser',
  password : 'mypassword',
  connectString: 'localhost:1521/XEPDB1'
});

exports.update = function(req, res){
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
  const sql = 'SELECT C.COLUMN_NAME FROM USER_CONS_COLUMNS C' +
              ' INNER JOIN USER_CONSTRAINTS N ON C.CONSTRAINT_NAME = N.CONSTRAINT_NAME' +
              ' WHERE N.TABLE_NAME = "' + id + '"' + 'AND N.CONSTRAINT_TYPE = "P"'
              ' ORDER BY C.POSITION';
  res.set({ 'Access-Control-Allow-Origin': '*' }); // この記載により、※1：CORSを許可する
  connection.query(sql, function (error, results) {
    if (error) {
      throw error; // エラー処理
    } else {
      strKeys = Object.values(JSON.parse(JSON.stringify(results)));
      // 数字項目情報を取得
      const sql2 = 'SELECT COLUMN_NAME FROM USER_TAB_COLUMNS' +
                  ' WHERE TABLE_NAME = "' + id + '"' +
                  ' AND DATA_TYPE LIKE "NUMBER" ORDER BY COLUMN_ID';
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

exports.delete = function(req, res){
  const id = req.query.id;
  const name = req.body[0].name;
  const val  = req.body[0].value;
  console.log('DELETE ' + id + ' ' + name + ' ' + val);
  let strKeys = '';
  let strNums = '';
  let sqlWhere = '';
  let isNum = 0;
  // プライマリーキー情報を取得
  const sql = 'SELECT C.COLUMN_NAME FROM USER_CONS_COLUMNS C' +
              ' INNER JOIN USER_CONSTRAINTS N ON C.CONSTRAINT_NAME = N.CONSTRAINT_NAME' +
              ' WHERE N.TABLE_NAME = "' + id + '"' + 'AND N.CONSTRAINT_TYPE = "P"'
              ' ORDER BY C.POSITION';
  res.set({ 'Access-Control-Allow-Origin': '*' }); // この記載により、※1：CORSを許可する
  connection.query(sql, function (error, results) {
    if (error) {
      throw error; // エラー処理
    } else {
      strKeys = Object.values(JSON.parse(JSON.stringify(results)));
      // 数字項目情報を取得
      const sql2 = 'SELECT COLUMN_NAME FROM USER_TAB_COLUMNS' +
                  ' WHERE TABLE_NAME = "' + id + '"' +
                  ' AND DATA_TYPE LIKE "NUMBER" ORDER BY COLUMN_ID';
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
