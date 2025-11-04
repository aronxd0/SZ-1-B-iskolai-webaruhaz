const util    = require('util');
const mysql   = require('mysql2/promise');
const express = require('express');
const session = require('express-session');
const { stringify } = require('querystring');
const { BADHINTS } = require('dns'); 
const { type } = require('os');
const app     = express();
const port    = 9012;
const header1 = 'Content-Type';
const header2 = 'application/json; charset=UTF-8';

app.use(express.static('public'));       // public/index.html a def.
app.use(session({ key:'user_sid', secret:'nagyontitkos', resave:true, saveUninitialized:true }));   /* https://www.js-tutorials.com/nodejs-tutorial/nodejs-session-example-using-express-session */

const mysql_connection =  {
  host: 'sexard3-214.tolna.net',     /* 10.2.0.11:3306 - fsw */
  user: 'szaloky.adam',         /* CREATE USER 'itbolt_user'@'%' IDENTIFIED BY '123456'; GRANT all privileges ON ITBOLT.* TO 'itbolt_user'@'%' */ 
  port: "9406",
  password: 'Csany7922',
  database: '2021SZ_szaloky_adam',          /* gdrive/public/tananyag/adatbázis/mysql_dumps/create_it_termekek.sql */
  multipleStatements: true // tranzakcióhoz kell, több lekérdezés futtatása egyszerre 
};

// 1. trim(): levágja az elejéről és végéről a szóközöket
// 2. replaceAll("'", ""): eltávolítja az összes aposztrófot (')
// 3. replaceAll("\"", ""): eltávolítja az összes idézőjelet (")
// 4. replaceAll("\t", ""): eltávolítja az összes tabulátort
// 5. replaceAll("\\", ""): eltávolítja az összes backslash-t (\)
// 6. replaceAll("`", ""): eltávolítja az összes backtick-et (`)
function strE(s) { 
  return s.trim().replaceAll("'","").replaceAll("\"","").replaceAll("\t","").replaceAll("\\","").replaceAll("`","");}

//#region kereses

function gen_SQL_kereses(req) {
  session_data = req.session;

  // ---------------- sql tokenizer ... ---------------
  var order  = (req.query.order? parseInt(req.query.order)                :   0); // Rendezés típusa (pl. ár, név, mennyiség)
  var offset = (req.query.offset? parseInt(req.query.offset)              :   0); // Oldal eltolás (paginációhoz)
  var elfogyott = (req.query.elfogyott? parseInt(req.query.elfogyott)        :   -1); // Csak elfogyott termékek (admin funkció)
  var inaktiv = (req.query.inaktiv? parseInt(req.query.inaktiv)           :   -1); // Csak inaktív termékek (admin funkció)
  var id_kat = (req.query.kategoria ?  strE(req.query.kategoria).length   : -1); // Kategória szűrés (ha van)
  var név    = (req.query.nev? req.query.nev :  ""); // Terméknév vagy leírás szűrés
  var maxarkeres = (req.query.maxar? parseInt(req.query.maxar) : 0); // Ár felső határ szűréshez
  var minarkeres = (req.query.minar? parseInt(req.query.minar) : 0); // Ár alsó határ szűréshez
  var where = `(t.AKTIV = "Y") AND `;   // Alapértelmezett szűrés: csak aktív termékek
  var maxmin_arkell = (req.query.maxmin_arkell? parseInt(req.query.maxmin_arkell) : -1);

  // Ha csak elfogyott termékeket kérünk (admin funkció)
  if(elfogyott != -1){
    where = `(t.MENNYISEG = 0) AND `;   // Csak azok, amikből nincs készlet
  }

  // Ha csak inaktív termékeket kérünk (admin funkció)
  if(inaktiv != -1){
    where = `(t.AKTIV = "N") AND `;   // Csak azok, amik inaktívak
  }

  // Ha mindkettő szűrés aktív (elfogyott és/vagy inaktív)
  if(elfogyott != -1 && inaktiv != -1){
    where = `(t.AKTIV = "N" OR t.MENNYISEG = 0) AND `;   // Bármelyik feltétel teljesül
  }

  // Név vagy leírás szűrés, ha van keresési kifejezés
  if (név.length > 0)  { where += `(NEV like "%${név}%" or LEIRAS like "%${név}%") and `;   }

  if(maxmin_arkell != -1){
    var where = where.substring(0, where.length-4); // Ár szűréshez szükséges where feltétel tárolása
    var sql = 
    `
    SELECT MAX(t.AR) AS MAXAR, MIN(t.AR) AS MINAR
    from webbolt_termekek t
    where ${where}
    `;
    return (sql);
  }
  else {
  // Rendezési feltétel beállítása a lekérdezéshez
    var order_van = "";
    switch (Math.abs(order)) {
      case 1: order_van = "ORDER BY AR";  break;   // Ár szerint rendezés
      case 2: order_van = "ORDER BY NEV"; break;   // Név szerint rendezés
      case 3: order_van = "ORDER BY MENNYISEG"; break;   // Mennyiség szerint rendezés
      default: order_van = "" ; break;  // Nincs rendezés
    }

    // Kategória szűrés, ha van megadva kategória lista
    if (id_kat != -1)
    {
      where += "(";
      // A kategória ID-kat '-' karakterrel elválasztva kapjuk, mindegyikre külön OR feltétel
      for (var i=0; i < strE(req.query.kategoria).split("-").length - 1; ++i) 
        {
          where += `k.ID_KATEGORIA=${strE(req.query.kategoria).split("-")[i]} or `;
        }
      where = `${where.substring(0, where.length - 3)}) and `; // Az utolsó ' or ' törlése
    }

    // Ha van szűrés, akkor a végéről levágjuk az utolsó ' and '-et, és where kulcsszóval kezdjük
    if (where.length >0) { where = " where "+where.substring(0, where.length-4); }

    // Ár szűrés (min/max)
    var arkeres = "";
    if (maxarkeres != 0) { 
      arkeres += `${where.length > 0 ? ` and` : ` where`} (t.AR <= ${parseInt(req.query.maxar)})${minarkeres != 0 ? ` and` : ``} `;  // dupla where elkerülése miatt (ar/where switch) ezért ez azutolsó
    }
    if (minarkeres != 0) { 
      arkeres += `(t.AR >= ${parseInt(req.query.minar)}) `;  
    }

    // Az SQL lekérdezés összeállítása
    var sql = 
      `
    SELECT 
        t.ID_TERMEK, t.ID_KATEGORIA, t.NEV, t.AZON, t.AR, t.MENNYISEG, t.MEEGYS, t.AKTIV, t.TERMEKLINK, t.FOTOLINK, t.LEIRAS, t.DATUMIDO, 
        k.KATEGORIA AS KATEGORIA
        FROM webbolt_termekek as t INNER JOIN webbolt_kategoriak as k 
        ON t.ID_KATEGORIA = k.ID_KATEGORIA
        ${where}
        ${arkeres}
        ${order_van} ${order<0? "DESC": ""}
        limit 51 offset ${offset}
      `;
    return (sql);
  }
}

app.post('/kategoria',(req, res) => {
  session_data = req.session;

  var elfogyott = (req.query.elfogyott? parseInt(req.query.elfogyott)        :   -1); // Csak elfogyott termékek (admin funkció)
  var inaktiv = (req.query.inaktiv? parseInt(req.query.inaktiv)           :   -1); // Csak inaktív termékek (admin funkció)
  var nev = (req.query.nev? strE(req.query.nev)           :   ""); // Csak inaktív termékek (admin funkció)
  var armin = (req.query.minar? parseInt(req.query.minar) : -1); // Ár alsó határ szűréshez
  var armax = (req.query.maxar? parseInt(req.query.maxar) : -1); // Ár felső határ szűréshez

  var where = `${nev != "" ? `where (t.NEV like "%${nev}%" or t.LEIRAS like "%${nev}%") ` : ``}`;

  // Elfogyott/inaktív szűrés helyes kezelése (switch nem megfelelő volt)
  if (elfogyott != -1 && inaktiv == -1) {
    where += `${where.length == 0 ? `where` : `and`} (t.MENNYISEG = 0)`;   // Csak azok, amikből nincs készlet
  } else if (inaktiv != -1 && elfogyott == -1) {
    where += `${where.length == 0 ? `where` : `and`} (t.AKTIV = "N")`;   // Csak azok, amik inaktívak
  } else if (elfogyott != -1 && inaktiv != -1) {
    where += `${where.length == 0 ? `where` : `and`} (t.AKTIV = "N" OR t.MENNYISEG = 0)`;   // Bármelyik feltétel teljesül
  } else {
    where += `${where.length == 0 ? `where` : `and`} (t.AKTIV = "Y" AND t.MENNYISEG > 0)`;   // Alapértelmezett szűrés: csak aktív és készleten lévő termékek
  }

  if (armin != -1) {
    where += `and (t.AR >= ${armin})`;
  }
  if (armax != -1) {
    where += `and (t.AR <= ${armax})`;
  }

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
  var sql = gen_SQL_kereses(req);                   // sql select generátor (tokenizer)
  sendJson_toFrontend (res, sql); 
});

//#endregion


//#region vélemények

app.post('/velemenyek',(req, res) => {
  session_data = req.session;
  // sima felhasználói
  var termekid = (req.query.ID_TERMEK ? parseInt(req.query.ID_TERMEK) : 0);
  var sajatvelemeny = (req.query.SAJATVELEMENY ? parseInt(req.query.SAJATVELEMENY) : 0); // 1 ha csak a saját véleményem kell

  //adminonak az elfogadás érdekében
  var szelektalas = (req.query.szelektalas? parseInt(req.query.szelektalas) : 0); // 1 ha igen akarom látni az elfogadásra várókat is (admin felület)

  var sql = `
  SELECT users.NEV, webbolt_velemenyek.SZOVEG, webbolt_velemenyek.ID_VELEMENY, webbolt_velemenyek.ID_TERMEK, webbolt_velemenyek.DATUM ${sajatvelemeny == 1 ? ", webbolt_velemenyek.ALLAPOT" : ""}
  FROM webbolt_velemenyek INNER JOIN users on users.ID_USER = webbolt_velemenyek.ID_USER
  ${szelektalas == 1 ? "" : `WHERE webbolt_velemenyek.ID_TERMEK = ${termekid} `}
  ${szelektalas == 1 ? "AND webbolt_velemenyek.ALLAPOT = 'Jóváhagyásra vár'" : `${sajatvelemeny == 1 ? "" : `and webbolt_velemenyek.ALLAPOT = 'Jóváhagyva'`}`}
  ${sajatvelemeny == 1 ? `${szelektalas == 0 ? "AND" : "WHERE"} webbolt_velemenyek.ID_USER = ${session_data.ID_USER}` : ``}
  ORDER BY webbolt_velemenyek.DATUM DESC
  `;
  sendJson_toFrontend (res, sql);           // async await ...
});

app.post('/velemeny_add', async (req, res) => {
  try {
    var termekid = parseInt(req.query.ID_TERMEK);
    var szoveg = strE(req.query.SZOVEG);
    
    var sql = `
    insert into webbolt_velemenyek (ID_TERMEK, ID_USER, SZOVEG, ALLAPOT)
    values (${termekid}, ${session_data.ID_USER}, "${szoveg}", ${(req.session.WEBBOLT_ADMIN == "Y" || req.session.ADMIN == "Y") ? '"Jóváhagyva"' : '"Jóváhagyásra vár"'});
    `;

    const eredmeny = await runExecute(sql, req);
    res.send(eredmeny);
    res.end();

  } catch (err) { console.log(err) }        
});

app.post('/velemeny_del', async (req, res) => {
  try {
    var velemenyid = parseInt(req.query.ID_VELEMENY);
    
    var sql = `
    delete from webbolt_velemenyek
    where ID_VELEMENY = ${velemenyid}
    `;

    const eredmeny = await runExecute(sql, req);
    res.send(eredmeny);
    res.end();

  } catch (err) { console.log(err) }        
});

//#endregion


//#region login/logoff


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
  console.log("kilogolt felhasznalo: " + uid);
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
});

//#endregion


//#region kosar / rendeles

app.post('/kosar_add', async (req, res) => {
  try {
    session_data = req.session;

    var termekid = parseInt(req.query.ID_TERMEK);
    var mennyit  = (req.query.MENNYIT? parseInt(req.query.MENNYIT)  :   1);
    var mennyire = (req.query.ERTEK ? parseInt(req.query.ERTEK) : 0);

    var megszuro = `${mennyire != 0 ? 
    `WHEN ${mennyire} < t.MENNYISEG then ${mennyire} ELSE t.MENNYISEG ` 
    : 
    `WHEN k.MENNYISEG <= t.MENNYISEG AND @elsoadd = FALSE and k.MENNYISEG ${mennyit > 0 ? `+ ${mennyit} <= t.MENNYISEG` : `- 1`} then k.MENNYISEG ${mennyit > 0 ? `+ ${mennyit}` : `- 1`} ELSE k.MENNYISEG`}`;


    var belseje = `${mennyire != 0 ? 
      `SET @kosarid = (SELECT webbolt_kosar.ID_KOSAR FROM webbolt_kosar WHERE webbolt_kosar.ID_USER = ${session_data.ID_USER});` 
      : 
      `INSERT INTO webbolt_kosar (ID_USER)
          SELECT ${session_data.ID_USER}
          WHERE NOT EXISTS (SELECT 1 FROM webbolt_kosar WHERE ID_USER = ${session_data.ID_USER});

        SET @kosarid = (SELECT webbolt_kosar.ID_KOSAR FROM webbolt_kosar WHERE webbolt_kosar.ID_USER = ${session_data.ID_USER});

        SET @elsoadd = (
        SELECT CASE
                WHEN EXISTS (SELECT 1 FROM webbolt_kosar_tetelei WHERE webbolt_kosar_tetelei.ID_KOSAR = @kosarid AND webbolt_kosar_tetelei.ID_TERMEK = ${termekid})
                THEN
                FALSE
                ELSE TRUE
              END
      );

        INSERT INTO webbolt_kosar_tetelei (ID_KOSAR, ID_TERMEK, MENNYISEG)
          SELECT @kosarid, ${termekid}, 1
          WHERE @elsoadd = TRUE;`}`;


    var sql = 
    `
    START TRANSACTION;
      ${belseje}
        
      UPDATE webbolt_kosar_tetelei k
        INNER JOIN webbolt_termekek t ON k.ID_TERMEK = t.ID_TERMEK
        SET k.MENNYISEG = CASE ${megszuro} END                  
        WHERE k.ID_KOSAR = @kosarid AND k.ID_TERMEK = ${termekid};

    COMMIT;
    `

    console.log(sql);
    const eredmeny = await runExecute(sql, req);
    res.send(eredmeny);
    res.end();

  } catch (err) { console.log(err) }        
});

app.post('/kosar_del',async (req, res) => {
  session_data = req.session;
  var termekid  = parseInt(req.query.ID_TERMEK)

  var sql = `
    start TRANSACTION;
      SET @kosarid = (SELECT webbolt_kosar.ID_KOSAR FROM webbolt_kosar WHERE webbolt_kosar.ID_USER = ${session_data.ID_USER});
              
      DELETE FROM webbolt_kosar_tetelei
      WHERE webbolt_kosar_tetelei.ID_KOSAR = @kosarid AND webbolt_kosar_tetelei.ID_TERMEK = ${termekid};
    COMMIT;
  `;
  //trigger miatt kell a tranzakció illetve a set @kosarid hogy ne keressen a kitorolt webbolt_kosarban

  const eredmeny = await runExecute(sql, req);
  res.send(eredmeny);
  res.end();
});

app.post('/kosarteteldb',(req, res) => {
  session_data = req.session;
  
  var sql = `
    SELECT SUM(webbolt_kosar_tetelei.MENNYISEG) as kdb
    FROM webbolt_kosar_tetelei
    INNER JOIN webbolt_kosar ON webbolt_kosar_tetelei.ID_KOSAR = webbolt_kosar.ID_KOSAR
    INNER JOIN users ON webbolt_kosar.ID_USER = users.ID_USER
    WHERE users.ID_USER = ${session_data.ID_USER}
  `;
  sendJson_toFrontend(res, sql);
});


app.post('/tetelek',(req, res) => {
  session_data = req.session;
  var termekid  = (req.query.ID_TERMEK? parseInt(req.query.ID_TERMEK)  :   -1)

  var sql = `
    SELECT ${termekid > (-1) ? "webbolt_kosar_tetelei.MENNYISEG, webbolt_termekek.AR" : "webbolt_termekek.NEV, webbolt_termekek.AR, webbolt_termekek.FOTOLINK, webbolt_termekek.ID_TERMEK, webbolt_kosar_tetelei.MENNYISEG"} 
    FROM webbolt_kosar_tetelei
    INNER JOIN webbolt_kosar ON webbolt_kosar_tetelei.ID_KOSAR = webbolt_kosar.ID_KOSAR
    INNER JOIN webbolt_termekek ON webbolt_kosar_tetelei.ID_TERMEK = webbolt_termekek.ID_TERMEK
    WHERE webbolt_kosar.ID_USER = ${session_data.ID_USER} ${termekid > (-1) ? `and webbolt_kosar_tetelei.ID_TERMEK = ${termekid}` : ""}
  `;
  sendJson_toFrontend(res, sql);
});

app.post('/rendeles',async (req, res) => {
  try{
  session_data = req.session;
  var fizmod = strE(req.query.FIZMOD);
  var szallmod = strE(req.query.SZALLMOD);
  var megjegyzes = strE(req.query.MEGJEGYZES ? req.query.MEGJEGYZES : '');
  var szallcim = strE(req.query.SZALLCIM ? req.query.SZALLCIM : '');

  var termemekek_sql = 
  `
  SELECT ct.ID_KOSAR, ct.ID_TERMEK, ct.MENNYISEG
  FROM webbolt_kosar_tetelei ct
  JOIN webbolt_kosar k ON ct.ID_KOSAR = k.ID_KOSAR
  WHERE k.ID_USER = ${session_data.ID_USER};
  `;
  
  var json_termekek =JSON.parse(await runQueries(termemekek_sql));
  if (json_termekek.message != "ok" || json_termekek.maxcount == 0) {
      res.set(header1, header2);
      res.send(JSON.stringify({ message: "nagy baj történt" }));
      res.end();
      return;
  } 

  var sql = `
      START TRANSACTION;

      SET @kosarid = (SELECT ID_KOSAR FROM webbolt_kosar WHERE ID_USER = ${session_data.ID_USER});

      INSERT INTO webbolt_rendeles (ID_USER, FIZMOD, SZALLMOD, MEGJEGYZES, SZALLCIM)
      VALUES (${session_data.ID_USER}, "${fizmod}", "${szallmod}", "${megjegyzes}", "${szallcim}");

      SET @rendeles_id = LAST_INSERT_ID();
    `;

    for (var termek of json_termekek.rows) {
      var termek_id = parseInt(termek.ID_TERMEK);
      var termek_mennyiseg = parseInt(termek.MENNYISEG);
      sql += `INSERT INTO webbolt_rendeles_tetelei (ID_RENDELES, ID_TERMEK, MENNYISEG)
      VALUES (@rendeles_id, ${termek_id}, ${termek_mennyiseg});`;
    }

  sql += 
  `
  DELETE FROM webbolt_kosar WHERE ID_KOSAR = @kosarid;
  COMMIT;
  `;

  var eredmeny = await runExecute(sql, req);
  res.set(header1, header2);
  res.send(eredmeny);
  res.end();
  } catch (err) {
    console.error(err);
    res.status(500).set(header1, header2).send(JSON.stringify({ message: "error", error: err.message }));
  }
});


//#endregion


//#region termek


app.post('/termek_edit',async (req, res) => {
  
  var kategoria = strE(req.query.mod_kat);
  var nev       = strE(req.query.mod_nev);
  var azon      = strE(req.query.mod_azon);
  var ar        = parseInt(req.query.mod_ar);
  var mennyiseg = parseInt(req.query.mod_db);
  var meegys    = strE(req.query.mod_meegys);
  var leiras    = strE(req.query.mod_leiras);
  var termekid  = parseInt(req.query.ID_TERMEK);
  var aktiv  = ((req.query.mod_aktiv == undefined ? "NO" : "YES") == "YES" ? "Y" : "N") == "Y" && mennyiseg > 0 ? "Y" : "N";
  // aktiv = [Admin szándéka = 'Y'] && [Készlet > 0] ? 'Y' : 'N';

  var sql = `
    UPDATE webbolt_termekek
    SET
      ID_KATEGORIA = '${kategoria}',
      NEV = '${nev}',
      AZON = '${azon}',
      AR = ${ar},
      MENNYISEG = ${mennyiseg},
      MEEGYS = '${meegys}',
      LEIRAS = '${leiras}',
      AKTIV = '${aktiv}'
    WHERE ID_TERMEK = ${termekid};
  `;

  const eredmeny = await runExecute(sql, req);
  res.send(eredmeny);
  res.end();
});



//#endregion


//#region függvények

async function runExecute(sql, req) {                     // insert, update, delete sql
  session_data = req.session;
  var msg = "ok";
  var json_data, conn, res1, jrn1, jrn;
  session_data = req.session;
  try {
      jrn  = `insert into naplo (ID_USER, COMMENT, URL, SQLX) values (${session_data.ID_USER},"SZ1-B-Iskolai-Webáruház","${req.socket.remoteAddress}","${sql.replaceAll("\"","'")}");`;      
      conn = await mysql.createConnection(mysql_connection); 
      res1 = await conn.query(sql);  
      jrn1 = await conn.execute(jrn); 

      //console.log(res1);
      //console.log("execute: "+res1.affectedRows);
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

//#endregion

app.listen(port, function () { console.log(`megy a szero http://localhost:${port}`); });