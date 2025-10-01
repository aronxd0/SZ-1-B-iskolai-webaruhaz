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
  host: 'sexard3-214.tolna.net',     /* 10.2.0.11:3306 - fsw */
  user: 'szaloky.adam',         /* CREATE USER 'itbolt_user'@'%' IDENTIFIED BY '123456'; GRANT all privileges ON ITBOLT.* TO 'itbolt_user'@'%' */ 
  port: "9406",
  password: 'Csany7922',
  database: 'studio13_csany_zeg'           /* gdrive/public/tananyag/adatbázis/mysql_dumps/create_it_termekek.sql */
};

function strE(s) { 
  return s.trim().replaceAll("'","").replaceAll("\"","").replaceAll("\t","").replaceAll("\\","").replaceAll("`","");}

function gen_SQL(req) {
  const mezők = [ "ID_TERMEK", "NEV", "AR"];
  // ---------------- sql tokenizer ... ---------------

  var order  = (req.query.order? parseInt(req.query.order)                :   1);
  var limit  = (req.query.limit? parseInt(req.query.limit)                : 100);
  var offset = (req.query.offset? parseInt(req.query.offset)              :   0);
  var elfogyott = (req.query.elfogyott? parseInt(req.query.offset)        :   -1);
  var inaktiv = (req.query.inaktiv? parseInt(req.query.inaktiv)           :   -1);
  var id_kat = (req.query.kategoria ?  strE(req.query.kategoria).length   : -1);
  var név    = (req.query.nev? req.query.nev :  "");
  var desc   = order < 0? "desc" : "";

  var where = `(t.AKTIV = "Y" AND t.MENNYISEG >= 0) AND `;   // mindig legyen aktív és készleten
  
  if(session_data != undefined  && (session_data.ADMIN == "Y" || session_data.WEBBOLT_ADMIN == "Y")) {
    where = "";
  }

  if(elfogyott != -1){
    where = `(t.MENNYISEG = 0) AND `;   // adminnak mutassa csak az elfogyott termékeket
  }
  if(inaktiv != -1){
    where = `(t.AKTIV = "N") AND `;   // adminnak mutassa csak az inaktív termékeket
  }
  if(elfogyott != -1 && inaktiv != -1){
    where = `(t.AKTIV = "N" OR t.MENNYISEG = 0) AND `;   // adminnak mutassa csak az inaktív és elfogyott termékeket
  }


  if (order < 0) { order *= -1; }

  if (id_kat != -1)      
    {
      where += "(";
      for (var i=0; i < strE(req.query.kategoria).split("-").length - 1; ++i) 
        {
          where += `k.ID_KATEGORIA=${strE(req.query.kategoria).split("-")[i]} or`;
        }
      where = `${where.substring(0, where.length - 3)}) and `; 
    }
  
  if (név.length > 0)  { where += `(NEV like "%${név}%" or LEIRAS like "%${név}%") and `;   }
  if (where.length >0) { where = " where "+where.substring(0, where.length-4); }

  var sql = 
    `SELECT ID_TERMEK, NEV, k.KATEGORIA AS KATEGORIA, AR, MENNYISEG, MEEGYS, FOTOLINK, AKTIV, LEIRAS
     FROM webbolt_termekek t INNER JOIN webbolt_kategoriak k 
     ON t.ID_KATEGORIA = k.ID_KATEGORIA ${where} ORDER BY ${mezők[order-1]} ${desc}
     limit ${limit} offset ${limit*offset} `;
  return (sql);
}

app.post('/kategoria',(req, res) => {
  var where = `${req.query.nev != "" ? `where (NEV like "%${req.query.nev}%" or LEIRAS like "%${req.query.nev}%") ` : ""}`;
  var sql = `
    SELECT DISTINCT k.ID_KATEGORIA, k.KATEGORIA
    FROM webbolt_kategoriak k 
    inner JOIN webbolt_termekek t ON t.ID_KATEGORIA = k.ID_KATEGORIA
    ${where}
    ORDER BY k.KATEGORIA
  `;
  sendJson_toFrontend (res, sql);           // async await ... 
});

app.post('/keres', (req, res) => {  
  var sql = gen_SQL(req);                   // sql select generátor (tokenizer)
  sendJson_toFrontend (res, sql); 
});


app.post('/login', (req, res) => { login_toFrontend (req, res); });

async function login_toFrontend (req, res) {
  var user= (req.query.login_nev? req.query.login_nev: "");
  var psw = (req.query.login_passwd? req.query.login_passwd  : "");
  var sql = `select ID_USER, NEV, EMAIL, ADMIN, WEBBOLT_ADMIN, CSOPORT from users where EMAIL="${user}" and PASSWORD=md5("${psw}") limit 1`;
  var data = await runQueries(sql);
  var json_data = JSON.parse(data);
  if (json_data.message == "ok" && json_data.maxcount == 1)  {    /* rövidzár kiértékelés : sikeres bejelentkezés, megvan a juzer... */                    
    session_data                  = req.session;
    session_data.ID_USER          = json_data.rows[0].ID_USER;
    session_data.EMAIL            = json_data.rows[0].EMAIL;
    session_data.NEV              = json_data.rows[0].NEV;
    session_data.ADMIN            = json_data.rows[0].ADMIN;
    session_data.WEBBOLT_ADMIN    = json_data.rows[0].WEBBOLT_ADMIN;
    session_data.CSOPORT          = json_data.rows[0].CSOPORT;
    console.log("Session data:username=%s id_user=%s admin=%s webbolt_admin=%s csoport=%s", session_data.NEV, session_data.ID_USER, session_data.ADMIN, session_data.WEBBOLT_ADMIN, session_data.CSOPORT);
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
    if (err) {
      console.error('Session destroy failed', err);
      res.status(500).json({ message: 'Session destroy failed' });
      return;
    }
    
    // Send successful response after session is destroyed
    res.set(header1, header2);
    res.json('Session destroyed successfully');
    res.end();
  });
  console.log(session_data)
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
