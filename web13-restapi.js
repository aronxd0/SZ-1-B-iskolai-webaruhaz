const util      = require('util');
const mysql     = require('mysql2/promise');
const express   = require('express');
const session   = require('express-session');
const { stringify } = require('querystring');
const app       = express();
const port      = 9012;
const header1 = 'Content-Type';
const header2 = 'application/json; charset=UTF-8';

app.use(express.static('public')); // public/index.html a def.
app.use(session({ key:'user_sid', secret:'nagyontitkos', resave:true, saveUninitialized:true }));   /* https://www.js-tutorials.com/nodejs-tutorial/nodejs-session-example-using-express-session */

const pool = mysql.createPool({
    host: 'sexard3-214.tolna.net',
    user: 'szaloky.adam',
    port: "9406",
    password: 'Csany7922',
    database: '2021SZ_szaloky_adam',
    multipleStatements: true, // Szükséges a komplex tranzakciókhoz
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});


//#region kereses

app.post('/kategoria',(req, res) => {
    
    var elfogyott = (req.query.elfogyott? parseInt(req.query.elfogyott)   :   -1);
    var inaktiv = (req.query.inaktiv? parseInt(req.query.inaktiv)     :   -1);
    var nev = (req.query.nev? req.query.nev              :   "");
    
    // Feltételek és értékek elkülönítve
    let whereFeltetelek = [];
    let ertekek = [];

    if (nev !== "") {
        whereFeltetelek.push(`(t.NEV LIKE ? OR t.LEIRAS LIKE ?)`);
        ertekek.push(`%${nev}%`);
        ertekek.push(`%${nev}%`);
    }

    if (elfogyott != -1 && inaktiv == -1) {
        whereFeltetelek.push(`t.MENNYISEG = 0`);
    } else if (inaktiv != -1 && elfogyott == -1) {
        whereFeltetelek.push(`t.AKTIV = 'N'`);
    } else if (elfogyott != -1 && inaktiv != -1) {
        whereFeltetelek.push(`(t.AKTIV = 'N' OR t.MENNYISEG = 0)`);
    } else {
        whereFeltetelek.push(`(t.AKTIV = 'Y' AND t.MENNYISEG > 0)`);
    }
    
    const where = whereFeltetelek.length > 0 ? `WHERE ${whereFeltetelek.join(' AND ')}` : '';

    var sql = `
        SELECT DISTINCT k.ID_KATEGORIA, k.KATEGORIA
        FROM webbolt_kategoriak k 
        INNER JOIN webbolt_termekek t ON t.ID_KATEGORIA = k.ID_KATEGORIA
        ${where}
        ORDER BY k.KATEGORIA
    `;

    sendJson_toFrontend (res, sql, ertekek);
});

app.post('/keres', (req, res) => {  
    var { sql, values } = gen_SQL_kereses(req); 
    sendJson_toFrontend (res, sql, values); // A visszatérési objektumban meghagyjuk a 'values' nevet
});

function gen_SQL_kereses(req) {
    let ertekek = [];
    let whereFeltetelek = []; 

    // ---------------- sql tokenizer ... ---------------
    var order     = (req.query.order? parseInt(req.query.order)            :   0);
    var offset = (req.query.offset? parseInt(req.query.offset)           :   0);
    var elfogyott = (req.query.elfogyott? parseInt(req.query.elfogyott)       :   -1);
    var inaktiv = (req.query.inaktiv? parseInt(req.query.inaktiv)         :   -1);
    var kategoriaSzoveg = (req.query.kategoria ? req.query.kategoria : "");
    var nev       = (req.query.nev? req.query.nev :   "");
    var maxarkeres = (req.query.maxar? parseInt(req.query.maxar) : 0);
    var minarkeres = (req.query.minar? parseInt(req.query.minar) : 0);
    var maxmin_arkell = (req.query.maxmin_arkell? parseInt(req.query.maxmin_arkell) : -1);

    // Eredeti logikát követő szűrési feltételek
    if (elfogyott != -1 && inaktiv != -1) {
        whereFeltetelek = [`(t.AKTIV = 'N' OR t.MENNYISEG = 0)`];
    } else if (elfogyott != -1) {
        whereFeltetelek = [`t.MENNYISEG = 0`];
    } else if (inaktiv != -1) {
        whereFeltetelek = [`t.AKTIV = 'N'`];
    } else {
        whereFeltetelek = [`(t.AKTIV = 'Y' AND t.MENNYISEG > 0)`];
    }

    // Név vagy leírás szűrés
    if (nev.length > 0) {
        whereFeltetelek.push(`(t.NEV LIKE ? OR t.LEIRAS LIKE ?)`);
        ertekek.push(`%${nev}%`);
        ertekek.push(`%${nev}%`);
    }

    // Kategória szűrés (A kategória ID-kat '-' karakterrel elválasztva kapjuk)
    let kategoriaAzonositok = [];
    if (kategoriaSzoveg.length > 0) {
        kategoriaAzonositok = kategoriaSzoveg.split("-").map(id => parseInt(id)).filter(id => !isNaN(id));
        
        if (kategoriaAzonositok.length > 0) {
            // A WHERE IN feltételt helyőrzőkkel (placeholders)
            const helyorzok = kategoriaAzonositok.map(() => '?').join(', ');
            whereFeltetelek.push(`k.ID_KATEGORIA IN (${helyorzok})`);
            ertekek.push(...kategoriaAzonositok); // ... mivel több érték van
        }
    }

    // Ár szűrés
    if (maxarkeres !== 0) {
        whereFeltetelek.push(`t.AR <= ?`);
        ertekek.push(maxarkeres);
    }
    if (minarkeres !== 0) {
        whereFeltetelek.push(`t.AR >= ?`);
        ertekek.push(minarkeres);
    }
    
    const where = whereFeltetelek.length > 0 ? `WHERE ${whereFeltetelek.join(' AND ')}` : '';


    // MAXAR/MINAR lekérdezés
    if(maxmin_arkell != -1){
        var sql = 
        `
        SELECT MAX(t.AR) AS MAXAR, MIN(t.AR) AS MINAR
        FROM webbolt_termekek as t INNER JOIN webbolt_kategoriak as k ON t.ID_KATEGORIA = k.ID_KATEGORIA
        ${where}
        `;
        return { sql, values: ertekek };
    }
    else {
        // Rendezési feltétel beállítása
        var order_van = "";
        switch (Math.abs(order)) {
            case 1: order_van = "ORDER BY AR";      break;
            case 2: order_van = "ORDER BY NEV";     break;
            case 3: order_van = "ORDER BY MENNYISEG"; break;
            default: order_van = "" ; break;
        }

        // Az SQL lekérdezés összeállítása
        var sql = 
        `
        SELECT 
            t.ID_TERMEK, t.ID_KATEGORIA, t.NEV, t.AZON, t.AR, t.MENNYISEG, t.MEEGYS, t.AKTIV, t.TERMEKLINK, t.FOTOLINK, t.LEIRAS, 
            k.KATEGORIA AS KATEGORIA
            FROM webbolt_termekek as t INNER JOIN webbolt_kategoriak as k 
            ON t.ID_KATEGORIA = k.ID_KATEGORIA
            ${where}
            ${order_van} ${order<0? "DESC": ""}
            limit 51 offset ?
        `;
        // Az offset a LIMIT-hez tartozó paraméterként kerül a végére
        ertekek.push(offset); 
        
        return { sql, values: ertekek };
    }
}

//#endregion

//#region vélemények

app.post('/velemenyek',(req, res) => {
    session_data = req.session;
    
    var termekid = (req.query.ID_TERMEK ? parseInt(req.query.ID_TERMEK) : 0);
    var sajatvelemeny = (req.query.SAJATVELEMENY ? parseInt(req.query.SAJATVELEMENY) : 0);
    var szelektalas = (req.query.szelektalas? parseInt(req.query.szelektalas) : 0); 
    
    // Feltételek és értékek elkülönítve
    let whereFeltetelek = []; 
    let ertekek = [];
    
    var sql = `
    SELECT users.NEV, webbolt_velemenyek.SZOVEG, webbolt_velemenyek.ID_VELEMENY, webbolt_velemenyek.ID_TERMEK, CONVERT_TZ(webbolt_velemenyek.datum, '+00:00','${idozona()}') AS DATUM 
    ${sajatvelemeny == 1 ? ", webbolt_velemenyek.ALLAPOT" : ""}
    FROM webbolt_velemenyek INNER JOIN users on users.ID_USER = webbolt_velemenyek.ID_USER
    `;
    
    if (szelektalas == 0) {
        if (termekid > 0) {
            whereFeltetelek.push(`webbolt_velemenyek.ID_TERMEK = ?`);
            ertekek.push(termekid);
        }
        if (sajatvelemeny == 0) {
            whereFeltetelek.push(`webbolt_velemenyek.ALLAPOT = 'Jóváhagyva'`);
        }
    } 
    else if (szelektalas == 1) {
        whereFeltetelek.push(`webbolt_velemenyek.ALLAPOT = 'Jóváhagyásra vár'`);
    }
    
    if (sajatvelemeny == 1 && session_data.ID_USER) {
        whereFeltetelek.push(`webbolt_velemenyek.ID_USER = ?`);
        ertekek.push(session_data.ID_USER);
    }

    if (whereFeltetelek.length > 0) {
        sql += `WHERE ${whereFeltetelek.join(' AND ')} `;
    }

    sql += `ORDER BY DATUM DESC`;

    sendJson_toFrontend (res, sql, ertekek);
});

// Paraméterezett lekérdezés (execute)
app.post('/velemeny_add', async (req, res) => {
    try {
        var termekid = parseInt(req.query.ID_TERMEK);
        var szoveg = req.query.SZOVEG;
        var allapot = (req.session.WEBBOLT_ADMIN == "Y" || req.session.ADMIN == "Y") ? "Jóváhagyva" : "Jóváhagyásra vár";
        
        var sql = `
        INSERT INTO webbolt_velemenyek (ID_TERMEK, ID_USER, SZOVEG, ALLAPOT)
        VALUES (?, ?, ?, ?);
        `;
        let ertekek = [termekid, req.session.ID_USER, szoveg, allapot];

        const eredmeny = await runExecute(sql, req, ertekek);
        res.send(eredmeny);
        res.end();

    } catch (err) { console.log(err) }      
});

// Paraméterezett lekérdezés (execute)
app.post('/velemeny_del', async (req, res) => {
    try {
        var velemenyid = parseInt(req.query.ID_VELEMENY);
        
        var sql = `
        DELETE FROM webbolt_velemenyek
        WHERE ID_VELEMENY = ?
        `;
        let ertekek = [velemenyid];

        const eredmeny = await runExecute(sql, req, ertekek);
        res.send(eredmeny);
        res.end();

    } catch (err) { console.log(err) }      
});

//#endregion

//#region login/logoff

// Paraméterezett lekérdezés
app.post('/login', (req, res) => { login_toFrontend (req, res); });

async function login_toFrontend (req, res) {
    var user= (req.query.login_nev? req.query.login_nev: "");
    var psw = (req.query.login_passwd? req.query.login_passwd  : "");
    
    var sql = `SELECT ID_USER, NEV, EMAIL, ADMIN, WEBBOLT_ADMIN, CSOPORT FROM users WHERE EMAIL=? AND PASSWORD=md5(?)`;
    let ertekek = [user, psw]; 
    
    let conn;
    let data;
    try {
        conn = await pool.getConnection();
        // Közvetlen execute a runQueries nélkül!
        const [rows] = await conn.execute(sql, ertekek); 
        
        let msg = "ok";
        let maxcount = rows.length;

        if (maxcount == 1) {                          
            session_data              = req.session;
            session_data.ID_USER        = rows[0].ID_USER;
            session_data.EMAIL          = rows[0].EMAIL;
            session_data.NEV            = rows[0].NEV;
            session_data.ADMIN          = rows[0].ADMIN;
            session_data.WEBBOLT_ADMIN  = rows[0].WEBBOLT_ADMIN;
            session_data.CSOPORT        = rows[0].CSOPORT;
            console.log("Session data:username=%s id_user=%s admin=%s webbolt_admin=%s csoport=%s", session_data.NEV, session_data.ID_USER, session_data.ADMIN, session_data.WEBBOLT_ADMIN, session_data.CSOPORT);
        } else if (maxcount === 0) {
            msg = "Hibás felhasználónév vagy jelszó.";
        }
        
        data = JSON.stringify({ "message": msg, "maxcount": maxcount, "rows": rows });
        
    } catch (err) {
        console.error('Login hiba:', err);
        data = JSON.stringify({ "message": err.sqlMessage || "Adatbázis hiba", "maxcount": -1, "rows": [] });
    } finally {
        if (conn) conn.release();
    }
    
    res.set(header1, header2);
    res.send(data);
    res.end();
}

app.post('/logout', (req, res) => {  
    session_data = req.session;
    const uid = session_data.ID_USER; // annak a usernek az ID-ja aki kijelentkezett
    console.log("kilogolt felhasznalo: " + uid);
    session_data.destroy(function(err) {
        if (err) {
            console.error('Session destroy failed', err);
            res.status(500).json({ message: 'Session destroy failed' });
            return;
        }
        
        res.set(header1, header2);
        res.json('Session destroyed successfully');
        res.end();
    });
});

//#endregion

//#region kosar

// Paraméterezett lekérdezés a komplex tranzakcióban
app.post('/kosar_add', async (req, res) => {
    try {
        session_data = req.session;

        var termekid = parseInt(req.query.ID_TERMEK);
        var mennyit  = (req.query.MENNYIT? parseInt(req.query.MENNYIT)  :   1);
        var mennyire = (req.query.ERTEK ? parseInt(req.query.ERTEK) : 0);
        
        let ertekek = [];
        
        let mennyisegSzuro; // Új magyar változó (was megszuro)
        if (mennyire != 0) {
            // SET k.MENNYISEG = CASE WHEN ? < t.MENNYISEG THEN ? ELSE t.MENNYISEG END
            mennyisegSzuro = `WHEN ? < t.MENNYISEG then ? ELSE t.MENNYISEG `; 
            ertekek.push(mennyire, mennyire);
        } else {
            // A mennyitElőjel (pl. "+ 1" vagy "- 1") használatával kiszámoljuk az új értéket.
            let mennyitElőjel = mennyit > 0 ? `+ ${mennyit}` : `${mennyit}`;
            const ujMennyisegSzamitva = `k.MENNYISEG ${mennyitElőjel}`;

            // Egyetlen, robusztus feltétel, ami ellenőrzi a készlet max és min határát is.
            const feltetel = `
                @elsoadd = FALSE 
                AND ${ujMennyisegSzamitva} <= t.MENNYISEG 
                AND ${ujMennyisegSzamitva} >= 1
            `;
            mennyisegSzuro = `WHEN ${feltetel} THEN ${ujMennyisegSzamitva} ELSE k.MENNYISEG`;
        }
        
        let tranzakcioMag; // was belseje
        if (mennyire != 0) {
            tranzakcioMag = 
            `SET @kosarid = (SELECT webbolt_kosar.ID_KOSAR FROM webbolt_kosar WHERE webbolt_kosar.ID_USER = ${session_data.ID_USER});`;
        } else {
            tranzakcioMag = 
            `INSERT INTO webbolt_kosar (ID_USER)
            SELECT ?
            WHERE NOT EXISTS (SELECT 1 FROM webbolt_kosar WHERE ID_USER = ?);
    
            SET @kosarid = (SELECT webbolt_kosar.ID_KOSAR FROM webbolt_kosar WHERE webbolt_kosar.ID_USER = ?);
    
            SET @elsoadd = (
            SELECT CASE
                    WHEN EXISTS (SELECT 1 FROM webbolt_kosar_tetelei WHERE webbolt_kosar_tetelei.ID_KOSAR = @kosarid AND webbolt_kosar_tetelei.ID_TERMEK = ?)
                    THEN
                    FALSE
                    ELSE TRUE
                    END
            );
    
            INSERT INTO webbolt_kosar_tetelei (ID_KOSAR, ID_TERMEK, MENNYISEG)
            SELECT @kosarid, ?, 1
            WHERE @elsoadd = TRUE;`;
            ertekek.push(session_data.ID_USER, session_data.ID_USER, session_data.ID_USER, termekid, termekid);
        }

        var sql = 
        `
        START TRANSACTION;
          ${tranzakcioMag}
            
          UPDATE webbolt_kosar_tetelei k
            INNER JOIN webbolt_termekek t ON k.ID_TERMEK = t.ID_TERMEK
            SET k.MENNYISEG = CASE ${mennyisegSzuro} END               
            WHERE k.ID_KOSAR = @kosarid AND k.ID_TERMEK = ?;

        COMMIT;
        `
        ertekek.push(termekid);

        const eredmeny = await runExecute(sql, req, ertekek);
        res.send(eredmeny);
        res.end();

    } catch (err) { console.log(err) }      
});

// Paraméterezett lekérdezés
app.post('/kosar_del',async (req, res) => {
    session_data = req.session;
    var termekid  = parseInt(req.query.ID_TERMEK)
    
    var sql = `
        START TRANSACTION;
          SET @kosarid = (SELECT webbolt_kosar.ID_KOSAR FROM webbolt_kosar WHERE webbolt_kosar.ID_USER = ?);
                
          DELETE FROM webbolt_kosar_tetelei
          WHERE webbolt_kosar_tetelei.ID_KOSAR = @kosarid AND webbolt_kosar_tetelei.ID_TERMEK = ?;
        COMMIT;
    `;
    let ertekek = [session_data.ID_USER, termekid];

    const eredmeny = await runExecute(sql, req, ertekek);
    res.send(eredmeny);
    res.end();
});

// Paraméterezett lekérdezés
app.post('/kosarteteldb',(req, res) => {
    session_data = req.session;
    
    var sql = `
        SELECT SUM(webbolt_kosar_tetelei.MENNYISEG) as kdb
        FROM webbolt_kosar_tetelei
        INNER JOIN webbolt_kosar ON webbolt_kosar_tetelei.ID_KOSAR = webbolt_kosar.ID_KOSAR
        INNER JOIN users ON webbolt_kosar.ID_USER = users.ID_USER
        WHERE users.ID_USER = ?
    `;
    let ertekek = [session_data.ID_USER];

    sendJson_toFrontend(res, sql, ertekek);
});


// Paraméterezett lekérdezés
app.post('/tetelek',(req, res) => {
    session_data = req.session;
    var termekid  = (req.query.ID_TERMEK? parseInt(req.query.ID_TERMEK)  :   -1)

    let selectFields = termekid > (-1) 
        ? "webbolt_kosar_tetelei.MENNYISEG, webbolt_termekek.AR" 
        : "webbolt_termekek.NEV, webbolt_termekek.AR, webbolt_termekek.FOTOLINK, webbolt_termekek.ID_TERMEK, webbolt_kosar_tetelei.MENNYISEG";

    let whereClause = `WHERE webbolt_kosar.ID_USER = ?`;
    let ertekek = [session_data.ID_USER];

    if (termekid > (-1)) {
        whereClause += ` AND webbolt_kosar_tetelei.ID_TERMEK = ?`;
        ertekek.push(termekid);
    }

    var sql = `
        SELECT ${selectFields} 
        FROM webbolt_kosar_tetelei
        INNER JOIN webbolt_kosar ON webbolt_kosar_tetelei.ID_KOSAR = webbolt_kosar.ID_KOSAR
        INNER JOIN webbolt_termekek ON webbolt_kosar_tetelei.ID_TERMEK = webbolt_termekek.ID_TERMEK
        ${whereClause}
    `;
    sendJson_toFrontend(res, sql, ertekek);
});


//#endregion

//#region rendeles

// Paraméterezett lekérdezés (komplex tranzakció) (execute)
app.post('/rendeles',async (req, res) => {
    try{
    session_data = req.session;
    var fizmod = req.query.FIZMOD;
    var szallmod = req.query.SZALLMOD;
    var megjegyzes = req.query.MEGJEGYZES;
    var szallcim = req.query.SZALLCIM;
    var nev = req.query.NEV;
    var email = req.query.EMAIL;

    // 1. Kosár tételek lekérdezése (Termékek listája)
    var termemekek_sql = 
    `
    SELECT ct.ID_KOSAR, ct.ID_TERMEK, ct.MENNYISEG, t.NEV, t.AR, t.FOTOLINK
    FROM webbolt_kosar_tetelei ct
    INNER JOIN webbolt_kosar k ON ct.ID_KOSAR = k.ID_KOSAR
    INNER JOIN webbolt_termekek t ON ct.ID_TERMEK = t.ID_TERMEK
    WHERE k.ID_USER = ?
    `;
    var termekek_ertekek = [session_data.ID_USER];
    
    var json_termekek =JSON.parse(await runQueries(termemekek_sql, termekek_ertekek));
    if (json_termekek.message != "ok" || json_termekek.maxcount == 0) {
        res.set(header1, header2);
        res.send(JSON.stringify({ message: "nagy baj történt" }));
        res.end();
        return;
    } 

    // 2. Rendelés rögzítése (Tranzakciós blokk) - Paraméterezve
    let sqlParancsok = []; // utasítások sorban
    let sqlErtekek = [];    // hozzájuk tartozó paraméterek

    // SET @kosarid
    sqlParancsok.push(`SET @kosarid = (SELECT ID_KOSAR FROM webbolt_kosar WHERE ID_USER = ?);`);
    sqlErtekek.push(session_data.ID_USER);

    // INSERT INTO webbolt_rendeles
    sqlParancsok.push(`
        INSERT INTO webbolt_rendeles (ID_USER, FIZMOD, SZALLMOD, MEGJEGYZES, SZALLCIM, NEV, EMAIL)
        VALUES (?, ?, ?, ?, ?, ?, ?);
    `);
    sqlErtekek.push(session_data.ID_USER, fizmod, szallmod, megjegyzes, szallcim, nev, email);

    // SET @rendeles_id
    sqlParancsok.push(`SET @rendeles_id = LAST_INSERT_ID();`);

    // INSERT INTO webbolt_rendeles_tetelei (loopban)
    for (var termek of json_termekek.rows) {
        sqlParancsok.push(`
            INSERT INTO webbolt_rendeles_tetelei (ID_RENDELES, MENNYISEG, NEV, AR, FOTOLINK, ID_TERMEK)
            VALUES (@rendeles_id, ?, ?, ?, ?, ?);
        `);
        sqlErtekek.push(
            parseInt(termek.MENNYISEG), 
            termek.NEV, 
            parseInt(termek.AR), 
            termek.FOTOLINK, 
            parseInt(termek.ID_TERMEK)
        );
    }

    // DELETE FROM webbolt_kosar_tetelei
    sqlParancsok.push(`DELETE FROM webbolt_kosar_tetelei WHERE ID_KOSAR = @kosarid;`);

    // A teljes tranzakció string összeállítása
    var sql = 
    `
    START TRANSACTION;
    ${sqlParancsok.join('\n')}
    COMMIT;
    `;

    var eredmeny = await runExecute(sql, req, sqlErtekek); 
    res.set(header1, header2);
    res.send(eredmeny);
    res.end();
    } catch (err) {
        console.error(err);
        res.set(header1, header2).send(JSON.stringify({ message: "nagyon nagy baj történt", error: err.message }));
    }
});

// Paraméterezett lekérdezés
app.post('/rendeles_ellenorzes',async (req, res) => {
    try{
    var termekid = parseInt(req.query.ID_TERMEK);
    var mennyiseg = parseInt(req.query.MENNYISEG);

    var sql = 
    `
    SELECT IF(webbolt_termekek.MENNYISEG < ? or webbolt_termekek.AKTIV = 'N', 'karramba', '') AS allapot
    FROM webbolt_termekek
    WHERE ID_TERMEK = ?
    `;
    let ertekek = [mennyiseg, termekid];

    var eredmeny = await runQueries(sql, ertekek);
    res.set(header1, header2);
    res.send(eredmeny);
    res.end();
    } catch (err) {
        console.error(err);
        res.set(header1, header2).send(JSON.stringify({ message: "nagyon nagy baj történt", error: err.message }));
    }
});

// Paraméterezett lekérdezés
app.post('/rendelesek',async (req, res) => {
    try{
    session_data = req.session;

    var sql = 
    `
    SELECT r.ID_RENDELES, CONVERT_TZ(r.datum, '+00:00','${idozona()}') AS DATUM, round(SUM(rt.AR * rt.MENNYISEG)*1.27) AS RENDELES_VEGOSSZEGE
    FROM webbolt_rendeles AS r
    JOIN webbolt_rendeles_tetelei AS rt ON r.ID_RENDELES = rt.ID_RENDELES
    WHERE r.ID_USER = ?
    GROUP BY r.ID_RENDELES
    ORDER BY r.ID_RENDELES DESC;
    `;
    let ertekek = [session_data.ID_USER];

    var eredmeny = await runQueries(sql, ertekek);
    res.set(header1, header2);
    res.send(eredmeny);
    res.end();
    } catch (err) {
        console.error(err);
        res.set(header1, header2).send(JSON.stringify({ message: "nagyon nagy baj történt", error: err.message }));
    }
});

// Paraméterezett lekérdezés
app.post('/rendelesek_tetelei',async (req, res) => {
    try{
    var rendelesid = parseInt(req.query.ID_RENDELES);

    var sql =
    `
    SELECT rt.NEV, rt.MENNYISEG, rt.AR, rt.FOTOLINK
    from webbolt_rendeles_tetelei AS rt
    WHERE rt.ID_RENDELES = ?
    `;
    let ertekek = [rendelesid];

    var eredmeny = await runQueries(sql, ertekek);
    res.set(header1, header2);
    res.send(eredmeny);
    res.end();
    } catch (err) {
        console.error(err);
        res.set(header1, header2).send(JSON.stringify({ message: "nagyon nagy baj történt", error: err.message }));
    }
});


//#endregion

//#region termek

// Paraméterezett lekérdezés (execute)
app.post('/termek_edit',async (req, res) => {
    
    var kategoria = req.query.mod_kat;
    var nev       = req.query.mod_nev;
    var azon      = req.query.mod_azon;
    var ar        = parseInt(req.query.mod_ar);
    var mennyiseg = parseInt(req.query.mod_db);
    var meegys    = req.query.mod_meegys;
    var leiras    = req.query.mod_leiras;
    var termekid  = parseInt(req.query.ID_TERMEK);
    var aktiv    = (req.query.mod_aktiv == "NO" ? "N" : "Y")

    var sql = `
        UPDATE webbolt_termekek
        SET
          ID_KATEGORIA = ?,
          NEV = ?,
          AZON = ?,
          AR = ?,
          MENNYISEG = ?,
          MEEGYS = ?,
          LEIRAS = ?,
          AKTIV = ?
        WHERE ID_TERMEK = ?;
    `;
    let ertekek = [kategoria, nev, azon, ar, mennyiseg, meegys, leiras, aktiv, termekid];

    const eredmeny = await runExecute(sql, req, ertekek);
    res.send(eredmeny);
    res.end();
});


// Paraméterezett lekérdezés
app.post('/termek_adatok',async (req, res) => {
    
    let termekid  = parseInt(req.query.ID_TERMEK);

    let sql = `
        SELECT webbolt_termekek.ID_KATEGORIA, webbolt_termekek.NEV, webbolt_termekek.AZON, webbolt_termekek.AR, webbolt_termekek.MENNYISEG, webbolt_termekek.MEEGYS, webbolt_termekek.FOTOLINK, webbolt_termekek.LEIRAS, webbolt_termekek.AKTIV, webbolt_kategoriak.KATEGORIA
        FROM webbolt_termekek 
        INNER JOIN webbolt_kategoriak ON webbolt_termekek.ID_KATEGORIA = webbolt_kategoriak.ID_KATEGORIA
        WHERE webbolt_termekek.ID_TERMEK = ?
    `;
    let ertekek = [termekid];

    sendJson_toFrontend(res, sql, ertekek);
});


// Paraméterezett lekérdezés (execute)
app.post('/termek_del',async (req, res) => {
    
    var termekid  = parseInt(req.query.ID_TERMEK);

    var sql = `
        DELETE FROM webbolt_termekek
        WHERE ID_TERMEK = ?;
    `;
    let ertekek = [termekid];

    const eredmeny = await runExecute(sql, req, ertekek);
    res.send(eredmeny);
    res.end();
});


//#endregion

//#region függvények

// runExecute() - paraméterezve
async function runExecute(sql, req, ertekek = []) {
    session_data = req.session;
    var msg = "ok";
    var json_data, res1, jrn;
    session_data = req.session;
    
    let conn; // Kapcsolat változó deklarálása a try-on kívül
    try {
        // Naplózás (az SQL-t stringként naplózzuk)
        jrn  = `insert into naplo (ID_USER, COMMENT, URL, SQLX) values (${session_data.ID_USER},"SZ1-B-Iskolai-Webáruház","${req.socket.remoteAddress}","${sql.replaceAll("\"","'")}");`;
        conn = await pool.getConnection(); 
        [res1] = await conn.query(sql, ertekek); // Az értékekkel paraméterezve
        
        // Napló bejegyzés
        await conn.execute(jrn); 

    } catch (err) {
        msg = err.sqlMessage; console.error('Hiba:', err); 
    } finally {
        if (conn) conn.release(); 
        json_data = JSON.stringify({"message":msg, "rows":res1 });   // rest-api
    }
    return json_data;
}

// runQueries() - Támogatja a paraméterezve
async function runQueries(sql, ertekek = []) {
    var maxcount = 0;                                 // rekordszám
    var msg = "ok";
    var poz = sql.toUpperCase().lastIndexOf("ORDER BY ");  
    poz == -1? poz = sql.length : poz;                 // nincs "order by"
    var json_data, res1, res2=[];

    let conn; // Kapcsolat változó deklarálása a try-on kívül
    try {
        conn = await pool.getConnection();
        
        // A COUNT al-lekérdezéshez nem kellenek a LIMIT/OFFSET paraméterek
        let szamlaloErtekek = sql.toUpperCase().includes('LIMIT') && ertekek.length > 0 ? ertekek.slice(0, -1) : ertekek;

        // BIZTONSÁGOS VÉGREHAJTÁS (COUNT)
        [res1] = await conn.execute(`select count(*) as db from (${sql.substring(0, poz)}) as tabla;`, szamlaloErtekek); 
        maxcount = res1[0].db | 0;                    
        if (maxcount > 0) {  
            // BIZTONSÁGOS VÉGREHAJTÁS (Fő lekérdezés)
            [res2] = await conn.execute(sql, ertekek); 
        }
    } catch (err) {
        msg = err.sqlMessage; maxcount = -1; console.error('Hiba:', err); 
    } finally {
        if (conn) conn.release();
        
        json_data = JSON.stringify({ "message":msg, "maxcount":maxcount, "rows":res2 });    // rest-api
    }
    return json_data;
}

// sendJson_toFrontend() - paraméterezve
async function sendJson_toFrontend (res, sql, ertekek = []) {
    var json_data = await runQueries(sql, ertekek);
    res.set(header1, header2);
    res.send(json_data);
    res.end(); 
}

function idozona() {
    const date = new Date();
    
    // 1. A .getTimezoneOffset() percekben adja vissza az eltolást,
    //    de FORDÍTOTT előjellel.
    //    Például a magyar UTC+2 időzónára -120 értéket ad.
    const offsetInMinutes = date.getTimezoneOffset();

    // 2. Megfordítjuk az előjelet, hogy helyes legyen
    const offsetHours = Math.floor(Math.abs(offsetInMinutes) / 60);
    const offsetMinutes = Math.abs(offsetInMinutes) % 60;

    // 3. Meghatározzuk az előjelet (a + vagy -)
    // Ha az eredeti offset negatív (-120), akkor az + eltolás (UTC+2)
    const sign = offsetInMinutes < 0 ? "+" : "-";

    // 4. Összerakjuk a stringet, 2 számjegyűre formázva
    //    a 'padStart'-tal (pl. "2" -> "02")
    const hoursString = String(offsetHours).padStart(2, '0');
    const minutesString = String(offsetMinutes).padStart(2, '0');

    return `${sign}${hoursString}:${minutesString}`;
}


//#endregion


app.listen(port, function () { console.log(`megy a szero http://localhost:${port}`); });