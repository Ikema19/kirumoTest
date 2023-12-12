const http = require('http');
require('dotenv').config();

//EXPRESS
const express = require('express');
const app = express();

// CORS middleware
const cors = require('cors');
app.use(cors());
const PORT = process.env.PORT || 3001;

//BODYPARSER
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended:false}));

//Link(css img)
app.use(express.static('link'))

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


//----MASA-------------------------------------------------------------
app.get("/list", (req, res) => {
  //get tags=の値で変化
  const tagsStr = req.query["tags"];
  switch(tagsStr){
    case 'recommend':
      SQL = "SELECT * FROM clothes_data";
      break;
    case 'outer':
      SQL = "SELECT * FROM clothes_data WHERE cloth_type = 'ショートコート' ||";
      break;
    case 'tops':
      SQL = "SELECT * FROM clothes_data WHERE cloth_type = 'トップス'";
      break;
    case 'bottoms':
      SQL = "SELECT * FROM clothes_data WHERE cloth_type = 'ズボン'";
      break;
    case 'shoes':
      SQL = "SELECT * FROM clothes_data WHERE cloth_type = '靴'";
      break;
    default:
      SQL = "SELECT * FROM clothes_data";
      break;
  }
  
  const searchStr = req.query["search"];
  const price1Str = req.query["price1"];//下限
  const price2Str = req.query["price2"];//上限
  const sizeStr = req.query["size"];
  const genreStr = req.query["genre"];
  let dataChecker = 0; 
  if(typeof (searchStr) ||typeof (price1Str) ||typeof (sizeStr) ||typeof (genreStr) ){
    if(searchStr != undefined){
      SQL = SQL+" cloth_name ~ '"+searchStr+"'";
      dataChecker = dataChecker + 1; 
    }

    if(price1Str != undefined){
      if(dataChecker != 0){
        SQL = SQL+" AND "
      }else{
        SQL = SQL+" WHERE";
      }
      SQL = SQL+" price >= "+price1Str+" AND price <= "+price2Str+"";
      dataChecker = dataChecker + 1; 
    }

    if(sizeStr != undefined){
      if(dataChecker != 0){
        SQL = SQL+" AND "
      }else{
        SQL = SQL+" WHERE";
      }
      SQL = SQL+" cloth_size ~ '"+sizeStr+"'";
      dataChecker = dataChecker + 1; 
    }
    
    if(genreStr != undefined){
      if(dataChecker != 0){
        SQL = SQL+" AND "
      }else{
        SQL = SQL+" WHERE";
      }
      SQL = SQL+" cloth_genre ~ '"+genreStr+"'";
      dataChecker = dataChecker + 1; 
    }
    
    console.log(SQL);
  }

  pool.query(SQL, (error, results) => {
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
  const sign_card_id = req.body.testid;
  
  //！！記述ルール変更
  pool.query(
    // データベースに登録
    'INSERT INTO user_info (gender,color,clothes_size,shoes_size,card_id) VALUES (\''+ gender +'\',\''+ color +'\',\''+ c_size +'\',\''+ s_size +'\',\''+ sign_card_id +'\');',
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

// タスク取得
app.get("/storetask", function(req, res){

  pool.query(
    // データベースから取得
    'SELECT * FROM public.store_tasks;',
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

app.get("/form", function(req, res){
      res.render('form.ejs');
});

app.get("/task", function(req, res){
  res.render('task.ejs');
});

//----RYU----------------------------------------------------------------


// app.get("/detail", function(req, res){
//   pool.query('SELECT * FROM datas', (error, results) => {
//     if (error) {
//       //エラーのときのメッセージ
//       console.error('Error executing query', error);
//       res.status(500).json({ error: 'An error occurred', details: error.message });
//     } else {
//       // クエリ結果をJSON形式でクライアントに返す
//       res.json(results.rows);
//     }
//   });
// });




app.get("/detail", (req, res) => {
  const id = req.query["id"];

  if (id) {
    // もしIDが提供されている場合、そのIDに対応するデータを取得します
    const SQL = "SELECT * FROM clothes_data WHERE id = $1";
    const values = [id];

    pool.query(SQL, values, (error, results) => {
      if (error) {
        console.error('クエリの実行エラー', error);
        res.status(500).json({ error: 'エラーが発生しました', details: error.message });
      } else {
        if (results.rows.length === 0) {
          // 提供されたIDに対応するデータが見つからない場合
          res.status(404).json({ error: '見つかりません', details: '指定されたIDに対応するデータが見つかりませんでした' });
        } else {
          // 指定されたIDのデータをJSON形式で返します
          res.json(results.rows[0]);
        }
      }
    });
  } else {
    // もしIDが提供されていない場合、すべてのデータを取得します
    const SQL = "SELECT * FROM clothes_data";

    pool.query(SQL, (error, results) => {
      if (error) {
        console.error('クエリの実行エラー', error);
        res.status(500).json({ error: 'エラーが発生しました', details: error.message });
      } else {
        // すべてのデータをJSON形式で返します
        res.json(results.rows);
      }
    });
  }
});







//------------------------------------------------------------------

//サーバの設定
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});