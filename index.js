//モジュールのインポート
const http = require('http');
const express = require('express');

const mysql = require('mysql');

//expressオブジェクトの生成
const app = express();

//mysql接続情報
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    // database: 'kirumo'
    database: 'kirumo_try'
  });

  //mysql 接続失敗時エラー
  connection.connect((err) => {
    if (err) {
      console.log('error connecting: ' + err.stack);
      return;
    }
    console.log('success');
  });

//getでリクエスト時に処理するコールバック関数指定
app.get("/", function(req, res){
  res.render('card_reader.ejs');
  // return res.send("<a href='#'>Hello World!!</a>");
});


app.get("/mysql", function(req, res){
  //GET?~~~
  //GETで取得したカードIDが、データベース上に存在するかを返す
  //存在する場合  　→1を返す ＋ ユーザの詳細情報を返す
  //存在しないばあい→0を返す
  const idmStr = req.query["idmStr"];
  var sql = "SELECT * FROM card WHERE card_id = ? LIMIT 1"
  // SELECT id, CASE WHEN id = 1 THEN 1 ELSE 0 END FROM users WHERE id = ? LIMIT 1
  connection.query(
      // 'SELECT * FROM users',
      sql, [idmStr],
      (error, results) => {
        if (error) throw error;
        console.log(results);
        // return res.send("<a href='#'>Hello World!!</a>"+results);
        if(results == "") {
          var sql_new = "INSERT INTO card (card_id) VALUES (?)"
          connection.query(
            sql_new, [idmStr],
            (error, results) => {
              if (error) throw error;
              console.log(results);
            }
          )
            res.render('0.ejs',{usersCard: idmStr, results: results});
          }
          else if (results){
              res.render('1.ejs',{usersCard: idmStr, results: results})
          }
      //   res.render('hello.ejs');
      }
    );
  
});

app.post("/trying", function(req, res){
    
    return res.send("カード読み取り成功 IDm:");
});

app.post("/signup", function(req, res){
    
    return res.send("新規登録 IDm:");
});

//サーバの設定
const server = http.createServer(app);
server.listen(3000);