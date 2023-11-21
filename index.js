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
  res.render('card_reader.ejs'); //本来のやつ
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
app.post("/exist", function(req, res){
  const idmStr = req.body.idmStr; //本来のやつ
  console.log("---------------idmStr-----------------\n"+idmStr);
  var sql = "SELECT EXISTS (SELECT * FROM user_cards WHERE card_number = $1)"
  pool.query(
      sql, [idmStr], //本来のやつ
      (error, results) => {
        if (error) throw error;
        console.log("---------------SELECT EXIST-----------------\n"+JSON.stringify(results));
        if(results.rows[0].exists == false) {
          res.render('0.ejs',{card_number: idmStr});
        }
        else if (results.rows[0].exists == true){
          var sql_1 = "SELECT * FROM user_cards WHERE card_number = $1"
          pool.query(
            sql_1, [idmStr], //本来のやつ
            (error, results_1) => {
              if (error) throw error;
              console.log("---------------card_info-----------------\n"+JSON.stringify(results_1));
              console.log("---------------card_number-----------------\n"+JSON.stringify(results_1.rows[0].card_number));
              res.render('1.ejs',{
                card_id: results_1.rows[0].card_id,
                user_id: results_1.rows[0].user_id,
                card_number: results_1.rows[0].card_number,
                expiration_date: results_1.rows[0].expiration_date,
                update_date: results_1.rows[0].update_date
              })
            }
          )
        }
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
  connection.query(
    // データベースに登録
    'INSERT INTO user_info (gender,color,clothes_size,shoes_size) VALUE ("'+ gender +'","'+ color +'","'+ c_size +'","'+ s_size +'");',
    (error, results) => {
      console.log(results);
      return res.send("<a href='#'>Hello World!!</a>"+results);
    //   res.render('hello.ejs');
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
  connection.query(
    // データベースに登録
    'INSERT INTO store_tasks (store_id,room_id,task_description) VALUE ("'+ store_id +'","'+ room_id +'",\''+ task +'\');',
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