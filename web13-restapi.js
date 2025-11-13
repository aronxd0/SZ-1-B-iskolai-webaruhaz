const util      = require('util');
const mysql     = require('mysql2/promise');
const express   = require('express');
const session   = require('express-session');
const { stringify } = require('querystring');

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') }); // <- hozzáadva

const app       = express();
const port      = 9012;

// Változók a válasz headerhez
const header1 = 'Content-Type';
const header2 = 'application/json; charset=UTF-8';

app.use(express.static('public')); // statikus fájlok kiszolgálása (public/index.html a belépő)
app.use(session({ key:'user_sid', secret:'nagyontitkos', resave:true, saveUninitialized:true }));   /* session beállítások */

// Adatbázis kapcsolat pool
// Megjegyzés: itt a host/user/password/database a DB kapcsolódáshoz szükséges hitelesítési adatok.
const pool = mysql.createPool({
    host: 'sexard3-214.tolna.net',
    user: 'szaloky.adam',
    port: "9406",
    password: 'Csany7922',
    database: '2021SZ_szaloky_adam',
    multipleStatements: true, // komplex tranzakciókhoz szükséges (START TRANSACTION + több utasítás)
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});


//#region kereses

// POST /kategoria
// Leírás: kategória lista lekérése szűrők alapján.
// várható req.query paraméterek:
//  - elfogyott: (int) ha 1 akkor csak elfogyott termékek alapján listáz (MENNYISEG = 0)
//  - inaktiv: (int) ha 1 akkor inaktív termékek alapján listáz (AKTIV = 'N')
//  - nev: (string) névre/leírásra szűrés (LIKE)
// A függvény felépíti a WHERE feltételeket és meghívja sendJson_toFrontend-et a lekérdezéssel.
app.post('/kategoria',(req, res) => {
    
    var elfogyott = (req.query.elfogyott? parseInt(req.query.elfogyott)   :   -1);
    var inaktiv = (req.query.inaktiv? parseInt(req.query.inaktiv)     :   -1);
    var nev = (req.query.nev? req.query.nev              :   "");
    
    // Feltételek és értékek elkülönítve
    let whereFeltetelek = [];
    let ertekek = [];

    if (nev !== "") {
        // Keresés név vagy leírás mezőben, paraméterezve
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

    // sendJson_toFrontend lefuttatja a runQueries-t, amely először COUNT-olja majd ha >0 akkor lekérdezi az adatokat
    sendJson_toFrontend (res, sql, ertekek);
});


// POST /keres
// Leírás: termék keresés összetett paraméterekkel. A gen_SQL_kereses() építi az SQL-t és a values tömböt.
// req.query paraméterek (fontosabbak):
//  - order: (int) rendezés típusa (1: ár, 2: név, 3: mennyiség), negatív előjel DESC
//  - offset: (int) lapozáshoz offset
//  - elfogyott, inaktiv: (int) szűrők
//  - kategoria: (string) ID-k kötőjellel elválasztva, pl "1-3-5"
//  - nev: (string) névre/leírásra szűrés
//  - maxar, minar: (int) ár szűrés
//  - maxmin_arkell: (int) ha != -1 akkor csak MAX/MIN ár lekérése
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
        kategoriaAzonositok = kategoriaSzoveg.split("-").map(id => parseInt(id));
        
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


    // MAXAR/MINAR lekérdezés (ha maxmin_arkell != -1)
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

// POST /velemenyek
// Leírás: vélemények lekérése. Több módon hívható:
//  - ID_TERMEK: (int) csak adott termék véleményei
//  - SAJATVELEMENY: (int) ha 1 akkor a saját (sessiones) véleményeket is lehet kérni
//  - szelektalas: (int) 0 alapértelmezett, 1: "Jóváhagyásra vár"
// A függvény felépíti a WHERE feltételeket a fenti paraméterek alapján. sessionből olvas ID_USER-t, ha szükséges.
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
        // ha kéri a saját véleményeket és be van lépve, csak az ő user-ére szűrünk
        whereFeltetelek.push(`webbolt_velemenyek.ID_USER = ?`);
        ertekek.push(session_data.ID_USER);
    }

    if (whereFeltetelek.length > 0) {
        sql += `WHERE ${whereFeltetelek.join(' AND ')} `;
    }

    sql += `ORDER BY DATUM DESC`;

    sendJson_toFrontend (res, sql, ertekek);
});

// POST /velemeny_add
// Leírás: vélemény létrehozása. Paraméterek:
//  - ID_TERMEK: (int) termék azonosító
//  - SZOVEG: (string) vélemény szövege
// A függvény session alapján állítja az ALLAPOT mezőt (adminoknál "Jóváhagyva")
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

        const eredmeny = await runExecute(sql, req, ertekek, false);
        res.send(eredmeny);
        res.end();

    } catch (err) { console.log(err) }      
});

// POST /velemeny_del
// Leírás: vélemény törlése. Paraméter:
//  - ID_VELEMENY: (int) törlendő vélemény azonosító
app.post('/velemeny_del', async (req, res) => {
    try {
        var velemenyid = parseInt(req.query.ID_VELEMENY);
        
        var sql = `
        DELETE FROM webbolt_velemenyek
        WHERE ID_VELEMENY = ?
        `;
        let ertekek = [velemenyid];

        const eredmeny = await runExecute(sql, req, ertekek, false);
        res.send(eredmeny);
        res.end();

    } catch (err) { console.log(err) }      
});

//#endregion

//#region login/logoff

// POST /login
// Leírás: bejelentkezés. Paraméterek:
//  - login_nev: (string) email / felhasználónév
//  - login_passwd: (string) jelszó (itt md5-el hashelve ellenőrzésre kerül)
// VISSZATÉRÉS: JSON string, tartalmazza message, maxcount, rows (users adatai ha sikeres)
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
            // session feltöltése a belépett user adataival
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

// POST /logout
// Leírás: session megszüntetése. Kinyeri az ID_USER-t a sessionből a loghoz, majd destroy.
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

// POST /kosar_add
// Leírás: kosár tételeinek hozzáadása vagy mennyiség módosítása. Komplex tranzakciót használ.
// Várható query paraméterek:
//  - ID_TERMEK: (int) termék azonosító (kötelező)
//  - MENNYIT: (int) változtatás mértéke (alap: 1) -- mennyiség hozzáadás/levonás
//  - ERTEK: (int) ha != 0 akkor explicit értékre állít (pl. pontos szám), más esetben mennyit-szerű művelet
// Működés röviden:
//  - ha ERTEK != 0 -> SET logika: ha az új érték kisebb mint a raktárban lévő akkor alkalmazzuk
//  - különben beszúrja a kosarat ha nincs, beállít @elsoadd jelzőt, inserteket végez, majd UPDATE a kosár tételein
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
            // Ha explicit értéket adunk, akkor azt paraméterezve illesztjük be
            mennyisegSzuro = `WHEN ? < t.MENNYISEG then ? ELSE t.MENNYISEG `; 
            ertekek.push(mennyire, mennyire);
        } else {
            // A mennyitElőjel (pl. "+ 1" vagy "- 1") használatával kiszámoljuk az új értéket.
            let mennyitElőjel = mennyit > 0 ? `+ ${mennyit}` : `${mennyit}`;
            const ujMennyisegSzamitva = `k.MENNYISEG ${mennyitElőjel}`;

            // Feltétel: új mennyiség nem haladja meg a raktárban lévő mennyiséget és legalább 1
            const feltetel = `
                @elsoadd = FALSE 
                AND ${ujMennyisegSzamitva} <= t.MENNYISEG 
                AND ${ujMennyisegSzamitva} >= 1
            `;
            mennyisegSzuro = `WHEN ${feltetel} THEN ${ujMennyisegSzamitva} ELSE k.MENNYISEG`;
        }
        
        let tranzakcioMag; // tranzakció belső vezérlő stringje
        if (mennyire != 0) {
            // ha csak módosítunk meglévő kosár tételt, nem hozunk létre új kosarat
            tranzakcioMag = 
            `SET @kosarid = (SELECT webbolt_kosar.ID_KOSAR FROM webbolt_kosar WHERE webbolt_kosar.ID_USER = ${session_data.ID_USER});`;
        } else {
            // beszúrási logika: ha nincs kosár user-nek, létrehozzuk, majd beállítjuk @elsoadd-et,
            // és ha első hozzáadás, akkor INSERT a kosár tételei közé.
            tranzakcioMag = 
            `INSERT INTO webbolt_kosar (ID_USER)
            SELECT ?
            WHERE NOT EXISTS (SELECT 1 FROM webbolt_kosar WHERE ID_USER = ?);
    
            SET @kosarid = (SELECT webbolt_kosar.ID_KOSAR FROM webbolt_kosar WHERE ID_USER = ?);
    
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
            // Az ertekek sorrendje: session_id háromszor, majd termekid kétszer (a fenti utasítások paraméterei)
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

        const eredmeny = await runExecute(sql, req, ertekek, false);
        res.send(eredmeny);
        res.end();

    } catch (err) { console.log(err) }      
});

// POST /kosar_del
// Leírás: egy kosár tétel törlése. Paraméterek:
//  - ID_TERMEK: (int) törlendő termék azonosító
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

    const eredmeny = await runExecute(sql, req, ertekek, false);
    res.send(eredmeny);
    res.end();
});

// POST /kosarteteldb
// Leírás: a kosár tételeinek összesített darabszáma (összes mennyiség)
// Nem vár extra paramétert, a sessionből veszi az ID_USER-t
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


// POST /tetelek
// Leírás: kosár tételeinek lekérése. Paraméter:
//  - ID_TERMEK (opcionális): ha megadva, csak annak a terméknek lekérdezése (menny és ár)
// Visszatérő mezők: MENNYISEG, AR, NEV, FOTOLINK, ID_TERMEK stb.
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

// POST /rendeles
// Leírás: a felhasználó kosarának alapján rendelést hoz létre.
// Paraméterek (req.query):
//  - FIZMOD: (string) fizetési mód
//  - SZALLMOD: (string) szállítási mód
//  - MEGJEGYZES: (string) rendelés megjegyzés
//  - SZALLCIM: (string) szállítási cím
//  - NEV: (string) vevő neve
//  - EMAIL: (string) vevő email
// Működés lépései:
// 1) lekéri a kosár tételeit (termekek listája) runQueries segítségével
// 2) összeállít egy tranzakciós SQL blokkot: beszúrja a rendelést, a tételeket, majd kitörli a kosár tételeit
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
        // minden tételhez paraméterezett INSERT
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

    var eredmeny = await runExecute(sql, req, sqlErtekek, false); 
    res.set(header1, header2);
    res.send(eredmeny);
    res.end();
    } catch (err) {
        console.error(err);
        res.set(header1, header2).send(JSON.stringify({ message: "nagyon nagy baj történt", error: err.message }));
    }
});

// POST /rendeles_ellenorzes
// Leírás: rendelés előtti ellenőrzés, hogy a kívánt mennyiség rendelkezésre áll-e.
// Paraméterek:
//  - ID_TERMEK: (int) termék azonosító
//  - MENNYISEG: (int) kívánt mennyiség
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

// POST /rendelesek
// Leírás: felhasználó korábbi rendeléseinek listázása (összeggel).
// session-ből veszi az ID_USER-t
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

// POST /rendelesek_tetelei
// Leírás: egy rendelés tételeinek lekérdezése.
// Paraméter:
//  - ID_RENDELES: (int) rendelés azonosító
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

// POST /termek_edit
// Leírás: termék szerkesztése (admin funkció). Paraméterezett update.
// Várható req.query paraméterek (mind a mod_* prefix-szel):
//  - mod_kat: kategória ID (string/number)
//  - mod_nev: (string) termék neve
//  - mod_azon: (string) azonosító/cikkszám
//  - mod_ar: (int) ár
//  - mod_db: (int) mennyiség
//  - mod_meegys: (string) mértékegység
//  - mod_leiras: (string) leírás
//  - mod_aktiv: ("NO" vagy más) -> "N" vagy "Y"
//  - ID_TERMEK: (int) melyik terméket módosítjuk
app.post('/termek_edit',async (req, res) => {
    
    var kategoria = req.query.mod_kat; // ha uj kateogira erkezik akkor ez nem letezik xd
    let uj_kategoria = req.query.uj_kat; // az uj kategoria neve ha van, lehet ures is

    var nev       = req.query.mod_nev;
    var azon      = req.query.mod_azon;
    var ar        = parseInt(req.query.mod_ar);
    var mennyiseg = parseInt(req.query.mod_db);
    var meegys    = req.query.mod_meegys;
    var leiras    = req.query.mod_leiras;
    var termekid  = parseInt(req.query.ID_TERMEK);
    var aktiv    = (req.query.mod_aktiv == "NO" ? "N" : "Y")

    var sql = 
`UPDATE webbolt_termekek
SET
ID_KATEGORIA =  (SELECT webbolt_kategoriak.ID_KATEGORIA FROM webbolt_kategoriak WHERE webbolt_kategoriak.KATEGORIA = "Alaplap"),
NEV = ?,
AZON = ?,
AR = ?,
MENNYISEG = ?,
MEEGYS = ?,
LEIRAS = ?,
AKTIV = ?
WHERE ID_TERMEK = ?`;
    let ertekek = [kategoria, nev, azon, ar, mennyiseg, meegys, leiras, aktiv, termekid];

    const eredmeny = await runExecute(sql, req, ertekek, true);
    res.send(eredmeny);
    res.end();
});


// POST /termek_adatok
// Leírás: egy termék részletes adatainak lekérése.
// Paraméter:
//  - ID_TERMEK: (int) lekérdezendő termék azonosító
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

// POST /termek_del
// Leírás: termék törlése (admin). Paraméter:
//  - ID_TERMEK: (int) törlendő termék
app.post('/termek_del',async (req, res) => {

    var termekid  = parseInt(req.query.ID_TERMEK);

    var sql = `DELETE FROM webbolt_termekek WHERE ID_TERMEK = ?`;
    let ertekek = [termekid];

    const eredmeny = await runExecute(sql, req, ertekek, true);
    res.send(eredmeny);
    res.end();
});


//#endregion

//#region függvények

// runExecute() - paraméterezve
// - sql: (string) SQL parancs (több utasítás is lehet, ha multipleStatements: true)
// - req: express request (session-hez szükség lehet)
// - ertekek: (array) az SQL paraméterei, sorrendben
// - naplozas: (bool) ha true, akkor naplózza az SQL-t egy napló táblába
// Visszatérési érték: JSON string { message:..., rows: ... } vagy hibaüzenet
async function runExecute(sql, req, ertekek = [], naplozas) {
    session_data = req.session;
    var msg = "ok";
    var json_data, res1, jrn;
    session_data = req.session;
    
    let conn; // Kapcsolat változó deklarálása a try-on kívül
    try {
        conn = await pool.getConnection(); 
        [res1] = await conn.query(sql, ertekek); // execute a paraméterezett SQL-lel

        // Napló bejegyzés (csak ha naplozas = true)
        if(naplozas)
        {
          var naplozasraKeszSql = osszeallitottSqlNaplozasra(sql, ertekek);
          // Naplózás: insert a naplo táblába (ID_USER session-ből)
          jrn  = `insert into naplo (ID_USER, COMMENT, URL, SQLX) values (${session_data.ID_USER},"SZ1-B-Iskolai-Webáruház","${req.socket.remoteAddress}","${naplozasraKeszSql.replaceAll("\"","'")}");`;
          await conn.execute(jrn);
        }
        
    } catch (err) {
        msg = err.sqlMessage; console.error('Hiba:', err); 
    } finally {
        if (conn) conn.release(); 
        json_data = JSON.stringify({"message":msg, "rows":res1 });   // rest-api formátum
    }
    return json_data;
}

// runQueries() - Támogatja a paraméterezve
// - sql: (string) SELECT lekérdezés (limit/offest lehet)
// - ertekek: (array) paraméterek
// Viselkedés: először COUNT-olja a lekérdezést (biztonságos oldalazás), majd ha van találat,
// akkor lefuttatja a fő lekérdezést és visszaadja {message, maxcount, rows}
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
// egyszerű wrapper, amely lefuttatja a runQueries-t, majd beállítja a header-t és visszaküldi a JSON-t.
async function sendJson_toFrontend (res, sql, ertekek = []) {
    var json_data = await runQueries(sql, ertekek);
    res.set(header1, header2);
    res.send(json_data);
    res.end(); 
}

// idozona()
// Segít a CONVERT_TZ paraméterhez szükséges időzóna string előállításában (pl "+02:00")
// Visszatér egy "+HH:MM" vagy "-HH:MM" formátummal.
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

// osszeallitottSqlNaplozasra()
// Segéd a naplózáshoz: a paramétereket behelyettesíti a SQL stringbe olvasható formában.
// FIGYELEM: ez csak napló célra, NEM futtatásra. A futtatás paraméterezve történik a runExecute/runQueries segítségével.
function osszeallitottSqlNaplozasra(sql, ertekek) {
    let i = 0;
    
    // String (szöveg) literálok biztonságos beszúrása
    const finalSql = sql.replace(/\?/g, () => {
        if (i >= ertekek.length) {
            return '<<HIÁNYZÓ ÉRTÉK>>';
        }
        
        let ertek = ertekek[i++];
        
        // Ha null vagy undefined, térjen vissza 'NULL' értékkel (idezőjelek nélkül)
        if (ertek === null || typeof ertek === 'undefined') {
            return 'NULL';
        }

        // Ha szám, boolean vagy bigint, ne használjunk idézőjelet.
        if (typeof ertek === 'number' || typeof ertek === 'boolean' || typeof ertek === 'bigint') {
            return ertek.toString();
        }

        // Minden más (string, dátum, stb.) esetén tegyünk idézőjelet.
        // CSERÉLJÜK a beágyazott idézőjeleket escapelt idézőjelekre (pl. ' -> '' a MySQL szabvány szerint)
        ertek = ertek.toString().replace(/'/g, "''");
        return `'${ertek}'`;
    });

    return finalSql;
}


//#endregion

const { sendEmail } = require('./email-sender'); 


app.post('/send-email', async (req, res) => {
    try {
        const name = req.query.name || 'Felhasználó';
        const email = req.query.email;
        const html = req.query.html || `<p>Üdv, ${name}</p>`;
        const subject = req.query.subject || 'Értesítés';

        if (!email) {
            res.set(header1, header2);
            res.send(JSON.stringify({ message: 'Hiányzó paraméter: email' }));
            return;
        }

        console.log('Sending email to:', email);
        await sendEmail(email, subject, html);

        res.set(header1, header2);
        res.send(JSON.stringify({ message: 'Email sikeresen elküldve' }));
    } catch (err) {
        console.error('Email hiba:', err);
        res.set(header1, header2);
        res.send(JSON.stringify({ message: 'Email hiba: ' + err.message }));
    }
});


app.listen(port, function () { console.log(`megy a szero http://localhost:${port}`); });