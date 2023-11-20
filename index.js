const http = require('http');
require('dotenv').config();

//EXPRESS
const express = require('express');
const app = express();

//BODYPARSER
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended:false}));

//POSTGRESQL
const { Pool } = require("pg");
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
  ssl: {
    rejectUnauthorized: false,
  },
});

app.get("/", function(req, res){
  res.render('card_reader.ejs');
});

//【POSTGRESQL接続サンプル】
app.get("/pg", (req, res) => {
  pool.query('SELECT * FROM sampletable', (error, results) => {
    if (error) {
      //エラーのときのメッセージ
      console.error('Error executing query', error);
      res.status(500).json({ error: 'An error occurred', details: error.message });
    } else {
      // クエリ結果をJSON形式でクライアントに返す
      res.json(results.rows);
    }
  });
});

//----FORD-------------------------------------------------------------
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



//----NARUMI-------------------------------------------------------------
// 顧客情報登録
app.post("/signup", function(req, res){

  // データ受け取り
  const gender = req.body.gender;
  const color = req.body.color;
  const c_size = req.body.c_size;
  const s_size = req.body.s_size;
  
  //！！記述ルール変更
  pool.query(
    // データベースに登録
    'INSERT INTO user_info (gender,color,clothes_size,shoes_size) VALUES (\''+ gender +'\',\''+ color +'\',\''+ c_size +'\',\''+ s_size +'\');',
    (error, results) => {
      if (error) {
        //エラーのときのメッセージ
        console.error('Error executing query', error);
        res.status(500).json({ error: 'An error occurred', details: error.message });
      } else {
        // クエリ結果をJSON形式でクライアントに返す
        res.json(results.rows);
      }
    }
  );
});

// タスク登録
app.post("/task", function(req, res){

  // データ受け取り
  const store_id = req.body.store_id;
  const room_id = req.body.room_id;
  const task = req.body.task;

  console.log(store_id)
  console.log(room_id)
  console.log(task)
  
  //！！記述ルール変更
  pool.query(
    // データベースに登録
    'INSERT INTO store_tasks (store_id,room_id,task_description) VALUES (\''+ store_id +'\',\''+ room_id +'\',\''+ task +'\');',
    (error, results) => {
      console.log(results);
      return res.send("<a href='#'>Hello World!!</a>"+results);
    //   res.render('hello.ejs');
    }
  );
});

app.get("/form", function(req, res){
      res.render('form.ejs');
});

app.get("/task", function(req, res){
  res.render('task.ejs');
});

//サーバの設定
const server = http.createServer(app);
server.listen(3000);
console.log("http://localhost:3000");