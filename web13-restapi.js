const util    = require('util');
const mysql   = require('mysql2/promise');
const express = require('express');
const session = require('express-session');
const { stringify } = require('querystring');
const app     = express();
const port    = 3000;
const header1 = 'Content-Type';
const header2 = 'application/json; charset=UTF-8';

app.use(express.static('public'));       // public/index.html a def.
app.use(session({ key:'user_sid', secret:'nagyontitkos', resave:true, saveUninitialized:true }));   /* https://www.js-tutorials.com/nodejs-tutorial/nodejs-session-example-using-express-session */
var session_data;

// masik edit

const mysql_connection =  {
  host: '193.227.198.214',     /* 10.2.0.11:3306 - fsw */
  user: 'itbolt_user',         /* CREATE USER 'itbolt_user'@'%' IDENTIFIED BY '123456'; GRANT all privileges ON ITBOLT.* TO 'itbolt_user'@'%' */ 
  port: "9406",
  password: '123456',
  database: 'ITBOLT'           /* gdrive/public/tananyag/adatbázis/mysql_dumps/create_it_termekek.sql */
}; // meleg vagyok

function strE(s) { 
  return s.trim().replaceAll("'","").replaceAll("\"","").replaceAll("\t","").replaceAll("\\","").replaceAll("`","");}

function gen_SQL(req) {
  const mezők = [ "ID_TERMEK", "NEV", "AR", "MENNYISEG", "MEEGYS"];
  // ---------------- sql tokenizer ... ---------------
  var where = "";
  var order  = (req.query.order? parseInt(req.query.order)         :   1);
  var limit  = (req.query.limit? parseInt(req.query.limit)         : 100);
  var offset = (req.query.offset? parseInt(req.query.offset)       :   0);
  var id_kat = (req.query.kategoria? parseInt(req.query.kategoria) :  -1);
  var név    = (req.query.nev? req.query.nev :  "");
  var desc   = order < 0? "desc" : "";
  if (order < 0) { order *= -1; }

  if (id_kat > 0)      { where += `k.ID_KATEGORIA=${id_kat} and `;   }
  if (név.length > 0)  { where += `NEV like "${név}%" and `;   }
  if (where.length >0) { where = " where "+where.substring(0, where.length-4);; }

  var sql = 
    `SELECT ID_TERMEK, NEV, k.KATEGORIA AS KATEGORIA, AR, MENNYISEG, MEEGYS
     FROM IT_termekek t INNER JOIN IT_kategoriak k 
     ON t.ID_KATEGORIA = k.ID_KATEGORIA ${where} ORDER BY ${mezők[order-1]} ${desc}
     limit ${limit} offset ${limit*offset} `;
  return (sql);
}

app.post('/kategoria',(req, res) => {
  var sql = "SELECT ID_KATEGORIA, KATEGORIA from IT_kategoriak order by KATEGORIA";
  sendJson_toFrontend (res, sql);           // async await ... 
});

app.post('/tabla', (req, res) => {  
  var sql = gen_SQL(req);                   // sql select generátor (tokenizer)
  sendJson_toFrontend (res, sql); 
});

app.post('/rekord/:id',(req, res) => {
  var sql = `SELECT * from IT_termekek where ID_TERMEK=${req.params.id} limit 1`;
  sendJson_toFrontend (res, sql);         
});

app.post('/delete/:id',(req, res) => { delete_toFrontend (req, res) });

async function delete_toFrontend (req, res) {
  var sql  = `DELETE from IT_termekek where ID_TERMEK=${req.params.id} limit 1`;
  var data = JSON.stringify({ "message":"Login required ám!", "rows":-1 });  // rest-api
  session_data = req.session; 
  if (session_data.ID_USER) { data = await runExecute(sql, req); } 
  res.set(header1, header2);
  res.send(data);
  res.end();
}

app.post('/save/:id',(req, res) => { update_toFrontend (req, res) });

async function update_toFrontend (req, res) {
  var NEV       = (req.query.mod_nev? strE(req.query.mod_nev) : "");    //  escape seq! 
  var AZON      = (req.query.mod_azon? strE(req.query.mod_azon) : "");     
  var MENNYISEG = (req.query.mod_db? parseInt(req.query.mod_db) : 0); 
  var AR        = (req.query.mod_ar? parseInt(req.query.mod_ar) : 0);
  var ID_KAT    = (req.query.mod_kat? parseInt(req.query.mod_kat) : 0);
  var MEEGYS    = (req.query.mod_meegys? strE(req.query.mod_meegys): "");
  var LEIRAS    = (req.query.mod_leiras? strE(req.query.mod_leiras) : "");
  var sql = "", msg = "", data = "";
  
  /*  login teszt! */
  session_data = req.session; 
  if (!session_data.ID_USER) {  msg = "Login required ám!"; }
  if (msg == "")                      // nincs hiba  
  {
    /*  mezőellenőrzések! */
    if (NEV == "")  msg += "A NÉV mezőt kötelező kitölteni!<br>";

    // ide jön a többi ellenőrzés ... !!!
  }

  if (msg == "")                      // nincs hiba  
  {
    if (req.params.id > 0) {          // módosítás
        sql = `UPDATE IT_termekek 
                set NEV="${NEV}", ID_KATEGORIA=${ID_KAT}, AZON="${AZON}", MEEGYS="${MEEGYS}", 
                LEIRAS="${LEIRAS}", MENNYISEG=${MENNYISEG}, AR=${AR} 
                where ID_TERMEK=${req.params.id} limit 1`;
    } else {                         // bevitel
        sql = `INSERT into IT_termekek (NEV, ID_KATEGORIA, AZON, MEEGYS, LEIRAS, MENNYISEG, AR) 
                values ("${NEV}",${ID_KAT},"${AZON}","${MEEGYS}","${LEIRAS}",${MENNYISEG},${AR})`;
    }
    data = await runExecute(sql, req); 
    
  }  else {                        // ... van hiba ...                    
     data = JSON.stringify({ "message":msg, "rows":"-1" });  
  }
  res.set(header1, header2);
  res.send(data);
  res.end();

}

app.post('/login', (req, res) => { login_toFrontend (req, res); });

async function login_toFrontend (req, res) {
  var user= (req.query.login_nev? req.query.login_nev: "");
  var psw = (req.query.login_passwd? req.query.login_passwd  : "");
  var sql = `select ID_USER, NEV, EMAIL from userek where EMAIL="${user}" and PASSWORD=md5("${psw}") limit 1`;
  var data = await runQueries(sql);
  var json_data = JSON.parse(data);
  if (json_data.message == "ok" && json_data.maxcount == 1)  {    /* rövidzár kiértékelés : sikeres bejelentkezés, megvan a juzer... */                    
    session_data         = req.session;
    session_data.ID_USER = json_data.rows[0].ID_USER;
    session_data.EMAIL   = json_data.rows[0].EMAIL;
    session_data.NEV     = json_data.rows[0].NEV;
    session_data.MOST    = Date.now();
    console.log("Session data:username=%s id_user=%s", session_data.NEV, session_data.ID_USER);
  }
  res.set(header1, header2);
  res.send(data);
  res.end();
}

app.post('/logout', (req, res) => {  
  session_data = req.session;
  const uid = session_data.ID_USER; // annak a usernek az ID-ja aki kijelentkezett -> kosár törléshez
  console.log(uid);
  session_data.destroy(function(err) {
    res.set(header1, header2);
    res.json('Session destroy successfully');
    res.end();
  }); 
});

async function runExecute(sql, req) {                     // insert, update, delete sql
  var msg = "ok";
  var json_data, conn, res1, jrn1, jrn;
  var userx = "- no login -";
  session_data = req.session;
  if (session_data.ID_USER) {  userx = session_data.EMAIL; } 

  try {
      jrn  = `insert into naplo (USER, URL, SQLX) values ("${userx}","${req.socket.remoteAddress}","${sql.replaceAll("\"","'")}");`;      
      conn = await mysql.createConnection(mysql_connection); 
      res1 = await conn.execute(sql);  
      jrn1 = await conn.execute(jrn); 

      console.log(res1);
      console.log("execute: "+res1.affectedRows);
  } catch (err) {
      msg = err.sqlMessage; console.error('Hiba:', err); 
  } finally {
      await conn.end();                                    
      json_data = JSON.stringify({"message":msg, "rows":res1 });  // rest-api
  }
  return json_data;
}

async function runQueries(sql) {                         // SELECT sql (+ count)
  var maxcount = 0;                                      // rekordszám
  var msg = "ok";
  var poz = sql.toUpperCase().lastIndexOf("ORDER BY ");  // rekord count-hoz nem kell az order by (ha van)
  poz == -1? poz = sql.length : poz;                     // nincs "order by"
  var json_data, conn, res1, res2=[];

  try {
      conn = await mysql.createConnection(mysql_connection);
      [res1] = await conn.execute(`select count(*) as db from (${sql.substring(0, poz)}) as tabla;`);  // tömb 0. eleme
      maxcount = res1[0].db | 0;                         // :-) 
      if (maxcount > 0) {  
        [res2] = await conn.execute(sql);   
      }
  } catch (err) {
      msg = err.sqlMessage; maxcount = -1; console.error('Hiba:', err); 
  } finally {
      await conn.end();                                     // !!! conn error esetet nem kezeli 
      json_data = JSON.stringify({ "message":msg, "maxcount":maxcount, "rows":res2 });  // rest-api
  }
  return json_data;
}

async function sendJson_toFrontend (res, sql) {
  var json_data = await runQueries(sql);
  res.set(header1, header2);
  res.send(json_data);
  res.end();
}

app.listen(port, function () { console.log(`progi app listening at http://localhost:${port}`); });