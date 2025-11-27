// === KÖNYVTÁRAK ===
const util      = require('util');
const mysql     = require('mysql2/promise');  // MySQL szinkron/aszinkron kérdezésekhez
const express   = require('express');         // Express webszerver keretrendszer
const session   = require('express-session'); // Felhasználói munkamenet kezeléshez
const { stringify } = require('querystring');
const serverBoot = Date.now();

// === KONFIGURÁCIÓS FÁJLOK ===
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') }); // .env fájlból környezeti változók (DB hitelesítési adatok)

// === EXPRESS SZERVER ===
const app       = express();
const port      = 9012; // A szerver ezen a porton hallgat

// === MIDDLEWARE BEÁLLÍTÁSOK ===
// JSON és URL-enkódolt adatok feldolgozásához szükséges middleware-ek
app.use(express.json());                                           // JSON body feldolgozása
app.use(express.urlencoded({ extended: true }));                  // URL-enkódolt adatok (form) feldolgozása - email küldéshez szükséges

// === HTTP HEADER KONSTANSOK ===
// Minden JSON válasz ezen header-ekkel fog visszatérni
const header1 = 'Content-Type';
const header2 = 'application/json; charset=UTF-8'; // UTF-8 karakterkódolás magyar karakterekhez

// === STATIKUS FÁJLOK KISZOLGÁLÁSA ===
app.use(express.static('public')); // A public/ mappa tartalmát direktben kiszolgálja (index.html, CSS, JS)

// === FELHASZNÁLÓI MUNKAMENET (SESSION) BEÁLLÍTÁSA ===
// Session kezelés bejelentkezés után az ID_USER és egyéb adat tárolásához
app.use(session({
    key: 'user_sid',
    secret: Date.now().toString(),
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 300000, // 5 perc
        
    }
}));

app.post('/check_session', (req, res) => {
  const active = !!req.session.ID_USER;
  let iduzer = "";
  if (req.session.ID_USER == undefined) { iduzer = "NULL"; }
  else { iduzer = req.session.ID_USER; }
  console.log(active + ", " + serverBoot + ", " + iduzer + " anyád");
  
  res.json({
    active,
    serverBoot,         
    id_user: iduzer
  });
  
  
});

// === ADATBÁZIS KAPCSOLAT POOL ===
// Connection pool: több konkurens kapcsolatot kezel egyidejűleg a MySQL szerverrel
// A pool újrahasznosítja a kapcsolatokat a teljesítmény javítása érdekében
const pool = mysql.createPool({
    host: process.env.DB_HOST,              // Az adatbázis szerverének IP/hostname (.env-ből)
    user: process.env.DB_USER,              // Az adatbázis felhasználóneve
    port: process.env.DB_PORT,              // Az adatbázis portja
    password: process.env.DB_PASSWORD,      // Az adatbázis jelszava
    database: process.env.DB_DATABASE,      // Az adatbázis neve
    multipleStatements: true,               // Több SQL utasítás egymás után (tranzakciókhoz szükséges: START TRANSACTION + több INSERT/UPDATE)
    waitForConnections: true,               // Várakozzon szabad kapcsolatra, ne dobjon hibát azonnal
    connectionLimit: 10,                    // Max 10 egyidejű kapcsolat
    queueLimit: 0                           // Végtelen várakozási sor (ha nincs szabad kapcsolat)
});

// === KÉPFELTÖLTÉS KEZELÉSE (MULTER) ===
// Multer: Express middleware a fájlfeltöltéshez, képek feldolgozásához

const multer = require("multer");

// Memory storage: a feltöltött fájl a memóriában marad (szérveroldali feldolgozáshoz)
// Alternatíva lenne a disk storage (merevlemezre írás), de itt a base64-ként mentjük az adatbázisba
const storage = multer.memoryStorage();

const upload = multer({
  storage,                                    // A fájlok memóriában vannak tárolva
  limits: { fileSize: 12 * 1024 * 1024 },    // Max 12 MB méret
  fileFilter: fileFilter                      // Egyéni szűrő: csak bizonyos típusok engedélyezése
});

// === MIME TÍPUS ELLENŐRZÉS ===
// Csak a megadott képformátumok engedélyezése (biztonsági okokból)
function fileFilter(req, file, cb) {
  const allowed = ["image/jpeg", "image/png", "image/webp"];  // Megengedett MIME típusok
  if (allowed.includes(file.mimetype)) {
    cb(null, true);                          // OK, a fájl átmehet
  } else {
    cb(new Error("Csak képfájl tölthető fel!"), false);  // Hiba: nem megengedett típus
  }
}

module.exports = upload;

// === AFA lekérdezése ===
// GET: /afa

app.post('/afa',(req, res) => {
    var sql = `
        SELECT AFA from webbolt_konstansok
    `;
    sendJson_toFrontend(res, sql, []);
});



//#region kereses

// === KATEGÓRIA LISTA ENDPOINT ===
// GET: /kategoria
// Paraméterek (req.query):
//  - elfogyott: (int) 1 = csak elfogyott termékek (MENNYISEG = 0)
//  - inaktiv: (int) 1 = csak inaktív termékek (AKTIV = 'N')
//  - nev: (string) szűrés kategória nevére vagy leírásra (LIKE operátor)
// Működés: dinamikus WHERE feltételeket épít, majd visszaadja a kategóriákat
app.post('/kategoria',(req, res) => {
    
    var elfogyott = (req.query.elfogyott? parseInt(req.query.elfogyott)   :   -1);  // -1 = nem szűrünk
    var inaktiv = (req.query.inaktiv? parseInt(req.query.inaktiv)     :   -1);
    var nev = (req.query.nev? req.query.nev              :   "");
    
    // Feltételek és értékek elkülönítve (biztonságos paraméterezett lekérdezéshez)
    let whereFeltetelek = [];
    let ertekek = [];

    // Ha van keresési szöveg, keressük a kategória nevén vagy leírásán
    if (nev !== "") {
        whereFeltetelek.push(`(t.NEV LIKE ? OR t.LEIRAS LIKE ?)`);
        ertekek.push(`%${nev}%`);  // % = tetszőleges karakterek (wildcard)
        ertekek.push(`%${nev}%`);
    }

    // Szűrési logika: elfogyott és/vagy inaktív termékek alapján
    if (elfogyott != -1 && inaktiv == -1) {
        whereFeltetelek.push(`t.MENNYISEG = 0`);  // Csak elfogyott
    } else if (inaktiv != -1 && elfogyott == -1) {
        whereFeltetelek.push(`t.AKTIV = 'N'`);  // Csak inaktív
    } else if (elfogyott != -1 && inaktiv != -1) {
        whereFeltetelek.push(`(t.AKTIV = 'N' OR t.MENNYISEG = 0)`);  // Mindkettő: inaktív VAGY elfogyott
    } else {
        whereFeltetelek.push(`(t.AKTIV = 'Y' AND t.MENNYISEG > 0)`);  // Alapértelmezett: csak aktív és raktáron lévő
    }
    
    // WHERE zaradék összeállítása (ha vannak feltételek)
    const where = whereFeltetelek.length > 0 ? `WHERE ${whereFeltetelek.join(' AND ')}` : '';

    var sql = `
        SELECT DISTINCT k.ID_KATEGORIA, k.KATEGORIA
        FROM webbolt_kategoriak k 
        INNER JOIN webbolt_termekek t ON t.ID_KATEGORIA = k.ID_KATEGORIA
        ${where}
        ORDER BY k.KATEGORIA
    `;

    // sendJson_toFrontend: biztonságosan futtatja a lekérdezést és JSON-ként küldi vissza
    sendJson_toFrontend (res, sql, ertekek);
});


// === TERMÉK KERESÉS ENDPOINT ===
// POST: /keres
// Paraméterek (req.query):
//  - order: (int) 1=ár, 2=név, 3=mennyiség; negatív = DESC
//  - offset: (int) lapozáshoz (0, 51, 102...)
//  - elfogyott, inaktiv: (int) szűrők
//  - kategoria: (string) ID-k kötőjellel: "1-3-5"
//  - nev: (string) szűrés
//  - maxar, minar: (int) ár tartomány
//  - maxmin_arkell: (int) ha != -1, csak MAX/MIN ár lekérés
// Működés: gen_SQL_kereses() összeállítja az SQL-t és paramétereket
app.post('/keres', (req, res) => {  
    var { sql, values } = gen_SQL_kereses(req); 
    sendJson_toFrontend (res, sql, values);
});

// === SQL KERESÉSI LEKÉRDEZÉS ÖSSZEÁLLÍTÁSA ===
// Segéd függvény az /keres endpointhoz
// Megépíti a dinamikus SQL WHERE feltételeket a paraméterekből
function gen_SQL_kereses(req) {
    let ertekek = [];
    let whereFeltetelek = []; 

    // === QUERY PARAMÉTEREK KIOLVASÁSA ===
    var order     = (req.query.order? parseInt(req.query.order)            :   0);  // Rendezés típusa
    var offset = (req.query.offset? parseInt(req.query.offset)           :   0);  // Lapozás kezdőpontja
    var elfogyott = (req.query.elfogyott? parseInt(req.query.elfogyott)       :   -1);
    var inaktiv = (req.query.inaktiv? parseInt(req.query.inaktiv)         :   -1);
    var kategoriaSzoveg = (req.query.kategoria ? req.query.kategoria : "");      // "1-3-5" formátum
    var nev       = (req.query.nev? req.query.nev :   "");
    var maxarkeres = (req.query.maxar? parseInt(req.query.maxar) : 0);
    var minarkeres = (req.query.minar? parseInt(req.query.minar) : 0);
    var maxmin_arkell = (req.query.maxmin_arkell? parseInt(req.query.maxmin_arkell) : -1);

    // === ALAPÉRTELMEZETT SZŰRÉSI FELTÉTELEK ===
    // Aktív termékek, melyek raktáron vannak (vagy a megadott szűrők)
    if (elfogyott != -1 && inaktiv != -1) {
        whereFeltetelek = [`(t.AKTIV = 'N' OR t.MENNYISEG = 0)`];
    } else if (elfogyott != -1) {
        whereFeltetelek = [`t.MENNYISEG = 0`];
    } else if (inaktiv != -1) {
        whereFeltetelek = [`t.AKTIV = 'N'`];
    } else {
        whereFeltetelek = [`(t.AKTIV = 'Y' AND t.MENNYISEG > 0)`];
    }

    // === SZÖVEG SZŰRÉS (NÉV/LEÍRÁS) ===
    if (nev.length > 0) {
        whereFeltetelek.push(`(t.NEV LIKE ? OR t.LEIRAS LIKE ?)`);
        ertekek.push(`%${nev}%`);
        ertekek.push(`%${nev}%`);
    }

    // === KATEGÓRIA SZŰRÉS ===
    // Paraméter: "1-3-5" -> szétválasztunk, majd IN feltételbe tesszük
    let kategoriaAzonositok = [];
    if (kategoriaSzoveg.length > 0) {
        kategoriaAzonositok = kategoriaSzoveg.split("-").map(id => parseInt(id));
        
        if (kategoriaAzonositok.length > 0) {
            // Helyőrzőkkel (?) parancsolt: k.ID_KATEGORIA IN (?, ?, ?)
            const helyorzok = kategoriaAzonositok.map(() => '?').join(', ');
            whereFeltetelek.push(`k.ID_KATEGORIA IN (${helyorzok})`);
            ertekek.push(...kategoriaAzonositok);  // ... = spread operátor (tömb elemeit szórja szét)(nem [1,[2,2,3]] hanem [1,2,2,3])
        }
    }

    // === ÁR SZŰRÉS ===
    if (maxarkeres !== 0) {
        whereFeltetelek.push(`t.AR <= ?`);
        ertekek.push(maxarkeres);
    }
    if (minarkeres !== 0) {
        whereFeltetelek.push(`t.AR >= ?`);
        ertekek.push(minarkeres);
    }
    
    const where = whereFeltetelek.length > 0 ? `WHERE ${whereFeltetelek.join(' AND ')}` : '';

    // === MAXIMÁLIS/MINIMÁLIS ÁR LEKÉRDEZÉS ===
    // Ha csak a Min/Max árat akarjuk (pl. szűrő csúszka feltöltéséhez), ezt a ágat követjük
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
        // === TELJES TERMÉK LISTA LEKÉRDEZÉS ===
        // Rendezés beállítása (1=ár, 2=név, 3=mennyiség)
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
            t.ID_TERMEK, t.ID_KATEGORIA, t.NEV, t.AZON, t.AR, t.MENNYISEG, t.MEEGYS, t.AKTIV, t.TERMEKLINK, 
            CASE WHEN t.FOTOLINK IS NOT NULL THEN t.FOTOLINK ELSE webbolt_fotok.IMG END AS FOTOLINK, 
            t.LEIRAS, 
            k.KATEGORIA AS KATEGORIA
            FROM webbolt_termekek as t 
            INNER JOIN webbolt_kategoriak as k ON t.ID_KATEGORIA = k.ID_KATEGORIA
            left join webbolt_fotok ON t.ID_TERMEK = webbolt_fotok.ID_TERMEK
            ${where}
            ${order_van} ${order<0? "DESC": ""}
            limit 51 offset ?
        `;
        // Az offset paraméter a végére kerül (lapozáshoz)
        ertekek.push(offset); 
        
        return { sql, values: ertekek };
    }
}

//#endregion

//#region vélemények

// === VÉLEMÉNYEK LEKÉRÉSE ENDPOINT ===
// POST: /velemenyek
// Paraméterek (req.query):
//  - ID_TERMEK: (int) konkrét termék véleményei
//  - SAJATVELEMENY: (int) 1 = saját véleményt is mutasd (bejelentkezett user)
//  - szelektalas: (int) 0=jóváhagyva, 1=jóváhagyásra vár, 2=elutasítva
// Működés: a sessionből olvassa az ID_USER-t, azt használja a bejelentkezetthez
app.post('/velemenyek',(req, res) => {
    session_data = req.session;

    
    
    var termekid = (req.query.ID_TERMEK ? parseInt(req.query.ID_TERMEK) : 0);
    var sajatvelemeny = (req.query.SAJATVELEMENY ? parseInt(req.query.SAJATVELEMENY) : 0);
    var szelektalas = (req.query.szelektalas? parseInt(req.query.szelektalas) : 0); 
    
    let whereFeltetelek = []; 
    let ertekek = [];
    
    // SQL lekérdezés: a vélemény szövege, szerző neve, és az időpontja (helyi időzóna konvertálva)
    var sql = `
    SELECT users.NEV, webbolt_velemenyek.SZOVEG, webbolt_velemenyek.ID_VELEMENY, webbolt_velemenyek.ID_TERMEK, 
           CONVERT_TZ(webbolt_velemenyek.datum, '+00:00','${idozona()}') AS DATUM 
    ${sajatvelemeny == 1 ? ", webbolt_velemenyek.ALLAPOT" : ""}
    FROM webbolt_velemenyek 
    INNER JOIN users on users.ID_USER = webbolt_velemenyek.ID_USER
    `;
    
    // === SZŰRÉSI LOGIKA ===
    if (szelektalas == 0) {
        // Alapértelmezett: jóváhagyott vélemények
        if (termekid > 0) {
            whereFeltetelek.push(`webbolt_velemenyek.ID_TERMEK = ?`);
            ertekek.push(termekid);
        }
        if (sajatvelemeny == 0) {
            // Ha nem a saját véleményt kérjük, csak a jóváhagyottakat mutassuk
            whereFeltetelek.push(`webbolt_velemenyek.ALLAPOT = 'Jóváhagyva'`);
        }
    } 
    else if (szelektalas == 1) {
        // Jóváhagyásra váró vélemények (admin felület)
        whereFeltetelek.push(`webbolt_velemenyek.ALLAPOT = 'Jóváhagyásra vár'`);
    }
    else if (szelektalas == 2) {
        // Elutasított vélemények
        whereFeltetelek.push(`webbolt_velemenyek.ALLAPOT = 'Elutasítva'`);
    }
    
    // Ha a bejelentkezetthez saját véleményt kérjük, szűrj csak erre az userre
    if (sajatvelemeny == 1 && session_data.ID_USER) {
        whereFeltetelek.push(`webbolt_velemenyek.ID_USER = ?`);
        ertekek.push(session_data.ID_USER);
    }

    if (whereFeltetelek.length > 0) {
        sql += `WHERE ${whereFeltetelek.join(' AND ')} `;
    }

    sql += `ORDER BY DATUM DESC`;  // Legújabbtól a legrégebbiig

    sendJson_toFrontend (res, sql, ertekek);
});

// === VÉLEMÉNY HOZZÁADÁSA ===
// POST: /velemeny_add
// Paraméterek (req.query):
//  - ID_TERMEK: (int) melyik termékhez
//  - SZOVEG: (string) a vélemény szövege
// Működés: sessionből veszi az ID_USER-t, admin véleményt azonnal jóváhagyva, felhasználóé várakozásra kerül
app.post('/velemeny_add', async (req, res) => {
    
    try {
        var termekid = parseInt(req.query.ID_TERMEK);
        var szoveg = req.query.SZOVEG;
        // Ha admin a bejelentkezett user, azonnal jóváhagyva lesz, különben várakozásra
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

// === VÉLEMÉNY TÖRLÉSE ===
// POST: /velemeny_del
// Paraméter: ID_VELEMENY (int)
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

// === VÉLEMÉNY JÓVÁHAGYÁSA ===
// POST: /velemeny_elfogad
// Paraméter: ID_VELEMENY (int)
// Működés: az allapot 'Jóváhagyva'-ra változik, megjelenik az oldalon
app.post('/velemeny_elfogad', async (req, res) => {
    
    try {
        var velemenyid = parseInt(req.query.ID_VELEMENY);
        
        var sql = `
        UPDATE webbolt_velemenyek 
        SET ALLAPOT = "Jóváhagyva"
        WHERE ID_VELEMENY = ?
        `;
        let ertekek = [velemenyid];

        const eredmeny = await runExecute(sql, req, ertekek, false);
        res.send(eredmeny);
        res.end();

    } catch (err) { console.log(err) }      
});

// === VÉLEMÉNY ELUTASÍTÁSA ===
// POST: /velemeny_elutasit
// Paraméter: ID_VELEMENY (int)
// Működés: az allapot 'Elutasítva'-ra változik
app.post('/velemeny_elutasit', async (req, res) => {
    
    try {
        var velemenyid = parseInt(req.query.ID_VELEMENY);
        
        var sql = `
        UPDATE webbolt_velemenyek 
        SET ALLAPOT = "Elutasítva"
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

// === BEJELENTKEZÉS ===
// POST: /login
// Paraméterek (req.query):
//  - login_nev: (string) email vagy felhasználónév
//  - login_passwd: (string) jelszó (MD5 hashelve ellenőrizve)
// Működés: az adatbázisból ellenőrzi az adatokat, majd session-be mentette a user adatait
// Visszatér: {message, maxcount, rows} - maxcount=1 ha sikeres bejelentkezés
app.post('/login', (req, res) => { login_toFrontend (req, res); });

async function login_toFrontend (req, res) {
    var user = (req.query.login_nev? req.query.login_nev: "");
    var psw = (req.query.login_passwd? req.query.login_passwd : "");
    
    // Az MD5 hash az adatbázisban van tárolva biztonság miatt (bár MD5 elavult, jobb lenne bcrypt)
    var sql = `SELECT ID_USER, NEV, EMAIL, ADMIN, WEBBOLT_ADMIN, CSOPORT FROM users WHERE EMAIL=? AND PASSWORD=md5(?)`;
    let ertekek = [user, psw]; 
    
    let conn;
    let data;
    try {
        conn = await pool.getConnection();
        const [rows] = await conn.execute(sql, ertekek); 
        
        let msg = "ok";
        let maxcount = rows.length;

        // Ha pontosan 1 felhasználót talál, az bejelentkezés sikeres
        if (maxcount == 1) {                          
            // Felhasználó adatainak tárolása a session-ben
            session_data              = req.session;
            session_data.ID_USER        = rows[0].ID_USER;
            session_data.EMAIL          = rows[0].EMAIL;
            session_data.NEV            = rows[0].NEV;
            session_data.ADMIN          = rows[0].ADMIN;
            session_data.WEBBOLT_ADMIN  = rows[0].WEBBOLT_ADMIN;
            session_data.CSOPORT        = rows[0].CSOPORT;
            console.log("Session data:username=%s id_user=%s admin=%s webbolt_admin=%s csoport=%s", 
                        session_data.NEV, session_data.ID_USER, session_data.ADMIN, session_data.WEBBOLT_ADMIN, session_data.CSOPORT);
        } else if (maxcount === 0) {
            msg = "Hibás felhasználónév vagy jelszó.";
        }
        
        data = JSON.stringify({ "message": msg, "maxcount": maxcount, "rows": rows });
        
    } catch (err) {
        console.error('Login hiba:', err);
        data = JSON.stringify({ "message": err.sqlMessage || "Adatbázis hiba", "maxcount": -1, "rows": [], "serverBoot": serverBoot });
    } finally {
        if (conn) conn.release();
    }
    
    res.set(header1, header2);
    res.send(data);
    res.end();
}

// === KIJELENTKEZÉS ===
// POST: /logout
// Működés: a session adatai törlődnek, így az user nem lesz bejelentkezve
app.post('/logout', (req, res) => {  
    session_data = req.session;
    const uid = session_data.ID_USER; // ki a kijelentkezettnek az ID-ja (logging-hoz)
    console.log("kilogolt felhasznalo: " + uid);
    
    // A session megsemmisítése
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

// === KOSÁR TÉTEL HOZZÁADÁSA / MÓDOSÍTÁSA ===
// POST: /kosar_add
// Paraméterek (req.query):
//  - ID_TERMEK: (int) melyik termék
//  - MENNYIT: (int) mennyit adjunk hozzá/vonjon le (alap: 1)
//  - ERTEK: (int) ha != 0, akkor erre az értékre állítsd a mennyiséget (nem additív)
// Működés: komplex SQL tranzakció (START TRANSACTION...COMMIT):
//   1. Ha nincs kosár az userhez, létrehozza
//   2. Ha nincs tétel, beszúrja
//   3. Frissíti a mennyiséget (raktárkészlettel konzisztensen)
app.post('/kosar_add', async (req, res) => {
    try {
        session_data = req.session;

        

        var termekid = parseInt(req.query.ID_TERMEK);
        var mennyit  = (req.query.MENNYIT? parseInt(req.query.MENNYIT)  :   1);  // Mennyit adjunk hozzá/vonjunk le
        var mennyire = (req.query.ERTEK ? parseInt(req.query.ERTEK) : 0);       // Pontos érték beállítás (ha != 0)
        
        let ertekek = [];
        
        // === MENNYISÉG SZŰRŐ LOGIKA ===
        let mennyisegSzuro;
        if (mennyire != 0) {
            // Ha pontos érték beállítás: MAX(?, raktár_mennyiség) logika
            // (nem tudjuk meghaladni a raktárkészletet)
            mennyisegSzuro = `WHEN ? < t.MENNYISEG then ? ELSE t.MENNYISEG `; 
            ertekek.push(mennyire, mennyire);
        } else {
            // Additív: kosár_mennyiség + mennyit
            let mennyitElőjel = mennyit > 0 ? `+ ${mennyit}` : `${mennyit}`;
            const ujMennyisegSzamitva = `k.MENNYISEG ${mennyitElőjel}`;

            // Feltételek: az új mennyiség nem haladja meg a raktárt ÉS >= 1
            const feltetel = `
                @elsoadd = FALSE 
                AND ${ujMennyisegSzamitva} <= t.MENNYISEG 
                AND ${ujMennyisegSzamitva} >= 1
            `;
            mennyisegSzuro = `WHEN ${feltetel} THEN ${ujMennyisegSzamitva} ELSE k.MENNYISEG`;
        }
        
        // === TRANZAKCIÓ MAGJA ===
        let tranzakcioMag;
        if (mennyire != 0) {
            // Szimpla módosítás: már létezik a kosár és a tétel
            tranzakcioMag = 
            `SET @kosarid = (SELECT webbolt_kosar.ID_KOSAR FROM webbolt_kosar WHERE webbolt_kosar.ID_USER = ${session_data.ID_USER});`;
        } else {
            // Komplex: kosár létrehozás, @elsoadd jelző, insert ha szükséges
            tranzakcioMag = 
            `INSERT INTO webbolt_kosar (ID_USER)
            SELECT ?
            WHERE NOT EXISTS (SELECT 1 FROM webbolt_kosar WHERE ID_USER = ?);
    
            SET @kosarid = (SELECT webbolt_kosar.ID_KOSAR FROM webbolt_kosar WHERE ID_USER = ?);
    
            SET @elsoadd = (
            SELECT CASE
                    WHEN EXISTS (SELECT 1 FROM webbolt_kosar_tetelei WHERE webbolt_kosar_tetelei.ID_KOSAR = @kosarid AND webbolt_kosar_tetelei.ID_TERMEK = ?)
                    THEN FALSE
                    ELSE TRUE
                    END
            );
    
            INSERT INTO webbolt_kosar_tetelei (ID_KOSAR, ID_TERMEK, MENNYISEG)
            SELECT @kosarid, ?, 1
            WHERE @elsoadd = TRUE;`;
            ertekek.push(session_data.ID_USER, session_data.ID_USER, session_data.ID_USER, termekid, termekid);
        }

        // === TELJES TRANZAKCIÓ ===
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

    } catch (err) {
        console.error("kosar_add HIBA:", err);
        res.status(500).json({
            message: "Hiba a kosár tétel hozzáadásakor.",
            error: err.message
        });
    }    
});

// === KOSÁR TÉTEL TÖRLÉSE ===
// POST: /kosar_del
// Paraméter: ID_TERMEK (int)
// Működés: kitöröl egy tételt a kosárból (SQL tranzakcióban)
app.post('/kosar_del',async (req, res) => {
    try{
        session_data = req.session;
        
        var termekid  = parseInt(req.query.ID_TERMEK);
        
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
    }
    catch (err) {
        console.error("kosar_del HIBA:", err);
        res.status(500).json({
            message: "Hiba a kosár tétel törlésekor.",
            error: err.message
        });
    }
});

// === KOSÁR TÉTEL DARABSZÁM ===
// POST: /kosarteteldb
// Működés: az összes tétel mennyiségét összeadja (SUM)
// Visszatér: {kdb: szám}
app.post('/kosarteteldb',(req, res) => {    

    session_data = req.session;

    if (!session_data.ID_USER) {
        res.set(header1, header2);
        // Visszaadhat egy üres kosarat, vagy egy jelzést, hogy nincs session
        return res.json({ message: "session expired", maxcount: 0, rows: [] });
    }

    try {
        
        
        
        var sql = `
            SELECT SUM(webbolt_kosar_tetelei.MENNYISEG) as kdb
            FROM webbolt_kosar_tetelei
            INNER JOIN webbolt_kosar ON webbolt_kosar_tetelei.ID_KOSAR = webbolt_kosar.ID_KOSAR
            INNER JOIN users ON webbolt_kosar.ID_USER = users.ID_USER
            WHERE users.ID_USER = ?
        `;
        let ertekek = [session_data.ID_USER];

        sendJson_toFrontend(res, sql, ertekek);

    }
    catch (err) {
        console.error("/kosarteteldb HIBA:", err);
        res.status(500).json({
            message: "Hiba a kosár tétel darabszám lekérésekor.",
            error: err.message
        });
    }
    
    
});

// === KOSÁR TÉTELEK LEKÉRÉSE ===
// POST: /tetelek
// Paraméter: ID_TERMEK (opcionális) - ha megadva, csak annak 1 terméknek az árát és mennyiségét
// Működés: attól függően, hogy szeretnénk egy tételről részleteket vagy az egész kosárat
app.post('/tetelek',(req, res) => {

    session_data = req.session;

    if (!session_data.ID_USER) {
        res.set(header1, header2);
        // Visszaadhat egy üres kosarat, vagy egy jelzést, hogy nincs session
        return res.json({ message: "session expired", maxcount: 0, rows: [] });
    }
    try{
        


        
        var termekid  = (req.query.ID_TERMEK? parseInt(req.query.ID_TERMEK)  :   -1)

        // Feltételes SELECT: ha van konkrét termék ID, kevesebb oszlop
        let selectFields = termekid > (-1) 
            ? "webbolt_kosar_tetelei.MENNYISEG, webbolt_termekek.AR" 
            : "webbolt_termekek.NEV, webbolt_termekek.AR, CASE WHEN webbolt_termekek.FOTOLINK IS NOT NULL THEN webbolt_termekek.FOTOLINK ELSE webbolt_fotok.IMG END AS FOTOLINK, webbolt_termekek.ID_TERMEK, webbolt_kosar_tetelei.MENNYISEG";

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
            left join webbolt_fotok ON webbolt_termekek.ID_TERMEK = webbolt_fotok.ID_TERMEK
            ${whereClause}
        `;
        sendJson_toFrontend(res, sql, ertekek);
    }
    catch (err) {
        console.error("/tetelek HIBA:", err);
        res.status(500).json({
            message: "Szerver hiba a kosár tételek lekérésekor.",
            error: err.message
        });
    }
});


//#endregion

//#region rendeles

// === RENDELÉS LÉTREHOZÁSA ===
// POST: /rendeles
// Paraméterek (req.query):
//  - FIZMOD: (string) fizetési mód
//  - SZALLMOD: (string) szállítási mód
//  - MEGJEGYZES: (string) speciális kívánságok
//  - SZALLCIM: (string) szállítási cím
//  - NEV: (string) vevő neve
//  - EMAIL: (string) vevő email
// Működés (komplex):
//   1. Lekérdezi a kosár tételeit
//   2. Ellenőrzi, hogy van-e mit rendelni
//   3. Tranzakcióban: beszúrja a rendelést, majd az összes tételt, végül kitörli a kosár tételeit
app.post('/rendeles',async (req, res) => {
    try{
    session_data = req.session;

    

    var fizmod = req.query.FIZMOD;
    var szallmod = req.query.SZALLMOD;
    var megjegyzes = req.query.MEGJEGYZES;
    var szallcim = req.query.SZALLCIM;
    var nev = req.query.NEV;
    var email = req.query.EMAIL;
    var afa = req.query.AFA;

    // 1. === KOSÁR TÉTELEK LEKÉRÉSE ===
    var termemekek_sql = 
    `
    SELECT ct.ID_KOSAR, ct.ID_TERMEK, ct.MENNYISEG, t.NEV, t.AR, 
           CASE WHEN t.FOTOLINK IS NOT NULL THEN t.FOTOLINK ELSE webbolt_fotok.IMG END AS FOTOLINK
    FROM webbolt_kosar_tetelei ct
    INNER JOIN webbolt_kosar k ON ct.ID_KOSAR = k.ID_KOSAR
    INNER JOIN webbolt_termekek t ON ct.ID_TERMEK = t.ID_TERMEK
    left join webbolt_fotok ON t.ID_TERMEK = webbolt_fotok.ID_TERMEK
    WHERE k.ID_USER = ?
    `;
    var termekek_ertekek = [session_data.ID_USER];
    
    var json_termekek = JSON.parse(await runQueries(termemekek_sql, termekek_ertekek));
    
    // Hiba: nincs tétel vagy nem volt meg a lekérdezés
    if (json_termekek.message != "ok" || json_termekek.maxcount == 0) {
        res.status(500).json({
            message: "Szörnyű hiba történt a rendelés során: nincs mit rendelni.",
            error: null
        });
        return;
    } 

    // 2. === RENDELÉS SQL ÖSSZEÁLLÍTÁSA (TRANZAKCIÓ) ===
    let sqlParancsok = [];  // SQL utasítások sorszámozottva
    let sqlErtekek = [];    // Hozzájuk tartozó paraméterek

    // Lépés 1: kosár ID lekérése
    sqlParancsok.push(`SET @kosarid = (SELECT ID_KOSAR FROM webbolt_kosar WHERE ID_USER = ?);`);
    sqlErtekek.push(session_data.ID_USER);

    // Lépés 2: fő rendelés rekordjának beszúrása
    sqlParancsok.push(`
        INSERT INTO webbolt_rendeles (ID_USER, FIZMOD, SZALLMOD, MEGJEGYZES, SZALLCIM, NEV, EMAIL, AFA)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?);
    `);
    sqlErtekek.push(session_data.ID_USER, fizmod, szallmod, megjegyzes, szallcim, nev, email, afa);

    // Lépés 3: az új rendelés ID-jét mentjük el
    sqlParancsok.push(`SET @rendeles_id = LAST_INSERT_ID();`);

    // Lépés 4: minden tételhez INSERT a rendelés_tételei táblába
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

    // Lépés 5: a kosár tételeinek törlése (új rendeléstől kezdve új kosár lesz)
    sqlParancsok.push(`DELETE FROM webbolt_kosar_tetelei WHERE ID_KOSAR = @kosarid;`);

    // === TELJES TRANZAKCIÓ ÖSSZEÁLLÍTÁSA ===
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
        console.error("/rendeles HIBA:", err);
        res.status(500).json({
            message: "Hiba a rendelés létrehozásakor.",
            error: err.message
        });
    }
});

// === RENDELÉS ELLENŐRZÉS ===
// POST: /rendeles_ellenorzes
// Paraméterek:
//  - ID_TERMEK: (int) termék ID
//  - MENNYISEG: (int) kívánt mennyiség
// Működés: ellenőrzi, hogy van-e elég raktárkészlet és aktív-e a termék
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
        console.error("/rendeles_ellenorzes HIBA:", err);
        res.status(500).json({
            message: "Hiba a rendelés ellenőrzésekor.",
            error: err.message
        });
    }
});

// === FELHASZNÁLÓ RENDELÉSEINEK LISTÁZÁSA ===
// POST: /rendelesek
// Működés: az összes bejelentkezetthez tartozó rendelést összesítéssel visszaadja
app.post('/rendelesek',async (req, res) => {
    try{
    session_data = req.session;

    

    var sql = 
    `
    SELECT r.ID_RENDELES, CONVERT_TZ(r.datum, '+00:00','${idozona()}') AS DATUM, r.AFA,
    round(SUM(rt.AR * rt.MENNYISEG)*(1+(r.AFA/100))) AS RENDELES_VEGOSSZEGE
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
        console.error("/rendelesek HIBA:", err);
        res.status(500).json({
            message: "Hiba a rendelések lekérésekor.",
            error: err.message
        });
    }
});

// === KONKRÉT RENDELÉS TÉTELEI ===
// POST: /rendelesek_tetelei
// Paraméter: ID_RENDELES (int)
// Működés: egy rendelés összes tételét visszaadja
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
        console.error("/rendelesek_tetelei HIBA:", err);
        res.status(500).json({
            message: "Hiba a rendelések lekérésekor.",
            error: err.message
        });
    }
});


//#endregion

//#region termek

// === TERMÉK SZERKESZTÉS / BESZÚRÁS (ADMIN) ===
// POST: /termek_edit
// Multipart form-data (feltöltés) vagy URL-enkódolt adat
// Paraméterek:
//  - insert: (int) 0=UPDATE, 1=INSERT új termékhez
//  - mod_kat: (int) kategória ID (ha nem új kategóriát szeretnénk)
//  - uj_kat: (string) új kategória neve (ha kell)
//  - mod_nev, mod_azon, mod_ar, mod_db, mod_meegys, mod_leiras: termék adatai
//  - mod_aktiv: 'NO' = inaktív ('N'), egyéb = aktív ('Y')
//  - mod_fotolink: (string) ha kép linkként van (feltöltött fájl prioritást élvez)
//  - ID_TERMEK: (int) UPDATE esetén kötelező
//  - mod_foto: (file) a feltöltendő képfájl
// Működés:
//   1. Kategória kezelés: ha új, létrehozza; ha meglévő, ID-t vesz
//   2. UPDATE ág: meglévő terméket módosít, képet is lehet cserélni
//   3. INSERT ág: új terméket hoz létre
app.post('/termek_edit', upload.single("mod_foto"), async (req, res) => {
    conn = await pool.getConnection();
    try {
        await conn.query("START TRANSACTION;");

        var insert = parseInt(req.query.insert) || 0;

        var kategoria = req.body.mod_kat;
        var uj_kategoria = (req.body.uj_kat || '').trim();

        // Termék adatok
        var nev       = req.body.mod_nev;
        var azon      = req.body.mod_azon;
        var ar        = parseInt(req.body.mod_ar) || 0;
        var mennyiseg = parseInt(req.body.mod_db) || 0;
        var meegys    = req.body.mod_meegys;
        var leiras    = req.body.mod_leiras;
        var termekid  = parseInt(req.body.ID_TERMEK);
        var aktiv     = (req.body.mod_aktiv == "NO" ? "N" : "Y");

        var fotolink = req.body.mod_fotolink || null;
        var fajl = req.file || null;  

        // ----------- KATEGÓRIA KEZELÉS (TRANZAKCIÓBAN!) -------------
        var ID_KATEGORIA = null;

        if (uj_kategoria !== "") {
            // Megnézzük, létezik-e már
            var q1 = JSON.parse(
                await runQueries(
                    "SELECT ID_KATEGORIA FROM webbolt_kategoriak WHERE KATEGORIA = ?",
                    [uj_kategoria]
                )
            );

            if (q1.maxcount > 0) {
                ID_KATEGORIA = q1.rows[0].ID_KATEGORIA;
            } else {
                // Új kategória
                var ins = await runExecute(
                    "INSERT INTO webbolt_kategoriak (KATEGORIA) VALUES (?)",
                    req,
                    [uj_kategoria],
                    true
                );
                var obj = JSON.parse(ins);
                ID_KATEGORIA = obj.rows.insertId;
            }
        } else {
            ID_KATEGORIA = parseInt(kategoria);
        }

        if (!ID_KATEGORIA) {
            throw new Error("Kategória ID nem állapítható meg.");
        }

        // ---------------------------- UPDATE ÁG ---------------------------
        if (insert == 0) {

            if (!termekid) {
                throw new Error("Hiányzó ID_TERMEK az update művelethez.");
            }

            // --------- KÉPFELDOLGOZÁS TRANZAKCIÓBAN ---------
            if (fajl) {
                var base64img = `data:${fajl.mimetype};base64,${fajl.buffer.toString('base64')}`;

                var qsel = JSON.parse(
                    await runQueries(
                        "SELECT ID_TERMEK FROM webbolt_fotok WHERE ID_TERMEK = ?",
                        [termekid]
                    )
                );

                if (qsel.maxcount > 0) {
                    await runExecute(
                        "UPDATE webbolt_fotok SET FILENAME = ?, IMG = ? WHERE ID_TERMEK = ?",
                        req,
                        [fajl.originalname, base64img, termekid],
                        true
                    );
                } else {
                    await runExecute(
                        "INSERT INTO webbolt_fotok (ID_TERMEK, FILENAME, IMG) VALUES (?, ?, ?)",
                        req,
                        [termekid, fajl.originalname, base64img],
                        true
                    );
                }
                fotolink = null;
            }
            else {
                // Ha nincs új fájl, akkor esetleg töröljük a fotolinket ha egyezik
                var qkep = JSON.parse(
                    await runQueries(
                        "SELECT FILENAME FROM webbolt_fotok WHERE ID_TERMEK = ?",
                        [termekid]
                    )
                );

                if (qkep.maxcount > 0 && fotolink == qkep.rows[0].FILENAME) {
                    fotolink = null;
                }
            }

            // --------- TERMÉK UPDATE TRANZAKCIÓBAN ---------
            var sql = `
                UPDATE webbolt_termekek SET
                    ID_KATEGORIA = ?, 
                    NEV = ?, 
                    AZON = ?, 
                    AR = ?, 
                    MENNYISEG = ?, 
                    MEEGYS = ?, 
                    LEIRAS = ?, 
                    AKTIV = ?, 
                    FOTOLINK = ?
                WHERE ID_TERMEK = ?
            `;

            var vals = [
                ID_KATEGORIA, nev, azon, ar, mennyiseg,
                meegys, leiras, aktiv, fotolink,
                termekid
            ];

            await runExecute(sql, req, vals, true);

            await conn.query("COMMIT;");
            return res.json({ message: "ok" });
        }

        // ---------------------------- INSERT ÁG ---------------------------
        if (insert == 1) {

            if (fotolink === "") fotolink = null;

            // Termék létrehozása
            var sql = `
                INSERT INTO webbolt_termekek 
                (ID_KATEGORIA, NEV, AZON, AR, MENNYISEG, MEEGYS, LEIRAS, AKTIV, FOTOLINK)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;

            var vals = [
                ID_KATEGORIA, nev, azon, ar,
                mennyiseg, meegys, leiras, aktiv, fotolink
            ];

            var raw = await runExecute(sql, req, vals, true);
            var obj = JSON.parse(raw);
            termekid = obj.rows.insertId;

            // Ha van új fotó, azt is beszúrjuk
            if (fajl) {
                var base64img = `data:${fajl.mimetype};base64,${fajl.buffer.toString('base64')}`;

                await runExecute(
                    "INSERT INTO webbolt_fotok (ID_TERMEK, FILENAME, IMG) VALUES (?, ?, ?)",
                    req,
                    [termekid, fajl.originalname, base64img],
                    true
                );
            }

            await conn.query("COMMIT;");
            return res.json({ message: "ok", insertId: termekid });
        }

        throw new Error("Érvénytelen 'insert' paraméter.");

    } catch (err) {
        console.error("termek_edit TRANZAKCIÓ HIBA:", err);

        try {
            await conn.query("ROLLBACK;");
        } catch (e2) {
            console.error("ROLLBACK hiba:", e2);
        }

        res.status(500).json({
            message: "Hiba a termék művelet során.",
            error: err.message
        });
    }
    finally {
    if (conn) conn.release();
    }
});


// === TERMÉK ADATAINAK LEKÉRÉSE ===
// POST: /termek_adatok
// Paraméter: ID_TERMEK (int)
// Működés: egy konkrét termék összes adatát visszaadja (beleértve a kategóriát és képet)
app.post('/termek_adatok',async (req, res) => {
    try{
        let termekid = parseInt(req.query.ID_TERMEK);

        let sql = `
            SELECT webbolt_termekek.ID_KATEGORIA, webbolt_termekek.NEV, webbolt_termekek.AZON, 
                webbolt_termekek.AR, webbolt_termekek.MENNYISEG, 
                CASE WHEN webbolt_termekek.FOTOLINK IS NOT NULL THEN webbolt_termekek.FOTOLINK ELSE webbolt_fotok.IMG END AS FOTOLINK,
                CASE WHEN webbolt_termekek.FOTOLINK IS NOT NULL THEN webbolt_termekek.FOTOLINK ELSE webbolt_fotok.FILENAME END AS FOTONEV, 
                webbolt_termekek.MEEGYS, webbolt_termekek.LEIRAS, webbolt_termekek.AKTIV, webbolt_kategoriak.KATEGORIA
            FROM webbolt_termekek 
            INNER JOIN webbolt_kategoriak ON webbolt_termekek.ID_KATEGORIA = webbolt_kategoriak.ID_KATEGORIA
            left join webbolt_fotok ON webbolt_termekek.ID_TERMEK = webbolt_fotok.ID_TERMEK
            WHERE webbolt_termekek.ID_TERMEK = ?
        `;
        let ertekek = [termekid];

        sendJson_toFrontend(res, sql, ertekek);

    }
    catch (err) {
        console.error("/termek_adatok HIBA:", err);
        res.status(500).json({
            message: "Hiba a termék adatainak lekérésekor.",
            error: err.message
        });
    }
});

// === TERMÉK TÖRLÉSE (ADMIN) ===
// POST: /termek_del
// Paraméter: ID_TERMEK (int)
app.post('/termek_del',async (req, res) => {
    try{
        console.log("törlendő termék ID: " + req.query.ID_TERMEK);  // Log: mi törlődik
        var termekid = parseInt(req.query.ID_TERMEK);

        var sql = `DELETE FROM webbolt_termekek WHERE ID_TERMEK = ?`;
        let ertekek = [termekid];

        const eredmeny = await runExecute(sql, req, ertekek, true);
        res.send(eredmeny);
        res.end();

    }
    catch (err) {
        console.error("/termek_del HIBA:", err);
        res.status(500).json({
            message: "Hiba a termék törlésekor.",
            error: err.message
        });
    }
});


//#endregion

//#region sql lekerdezesek html

// === HTML-BÓL SQL LEKÉRDEZÉSEK (ADMIN PANELHEZ) ===
// POST: /html_sql
// Paraméter: SQL (string) - az admin által begépelt SQL parancs
// Működés:
//   - SELECT: biztonságosan futtatható
//   - Tiltott parancsok: INSERT, UPDATE, DELETE, DROP, ALTER, CREATE stb. (biztonsági okokból)
//   - Base64 képadatok maszkálásra kerülnek (-- BINARY DATA --)
app.post('/html_sql', async (req, res) => {
try {
        // Query normalizálása
        if (!req.query || typeof req.query.SQL === 'undefined' || req.query.SQL === null) {
            return;
        }
        const sql = req.query.SQL.toString().trim();

        // === TILTOTT PARANCSOK LISTÁJA ===
        const nem_select_parancsok = [
            "insert", "update", "delete", "drop", "alter", "create", 
            "truncate", "grant", "revoke", "commit", "rollback", "exec", 
            "execute", "union", "transaction"  // UNION is veszélyes (SQL Injection)
        ];

        // Ellenőrzés: tartalmaz-e tiltott parancsot
        const nem_select = nem_select_parancsok.some(parancs => sql.toLowerCase().includes(parancs));

        // === SELECT LEKÉRDEZÉSEK ===
        if (!nem_select) {
            var asd = await runQueries(sql, []);
            let parsed;
            try { parsed = JSON.parse(asd); } catch (e) { parsed = asd; }

            if(parsed.message != "ok"){
                throw new Error(parsed.message);
            }

            // === BINÁRIS ADATOK MASZKÁLÁSA ===
            // Rekurzív függvény: minden 'data:' prefixel kezdődő stringet '-- BINARY DATA --'-ra cserél
            // (képek base64 adatainak elrejtése)
            function maskBinaryValues(value) {
                if (value === null || typeof value === 'undefined') return value;

                if (typeof value === 'string') {
                    return value.startsWith('data:') ? '-- BINARY DATA --' : value;
                }

                if (Array.isArray(value)) return value.map(maskBinaryValues);

                if (typeof value === 'object') {
                    for (const k of Object.keys(value)) value[k] = maskBinaryValues(value[k]);
                    return value;
                }

                return value;  // Szám, boolean stb. változatlan
            }

            parsed = maskBinaryValues(parsed);

            res.set(header1, header2);
            res.json({ adat: parsed, select: true });
            res.end();
        }
        // === MÓDOSÍTÓ PARANCSOK (INSERT/UPDATE/DELETE) ===
        else {
            var asd = await runExecute(sql, req, [], true);
            let parsed;
            try { parsed = JSON.parse(asd); } catch (e) { parsed = asd; }
            
            if(parsed.message != "ok"){
                throw new Error(parsed.message);
            }

            res.set(header1, header2);
            res.json({ adat: parsed, select: false });
            res.end();
        }

    } 
    catch (err) {
        console.error("/html_sql HIBA:", err);
        res.status(500).json({
            message: "Szörnyű hiba az sql parancs végrehajtásakor.",
            error: err.message
        });
    }   
});



//#endregion

//#region függvények

// === SZERVER FÜGGVÉNYEK ===

// === runExecute() - MODIFY PARANCSOKHOZ (INSERT/UPDATE/DELETE) ===
// Paraméterek:
//  - sql: (string) SQL parancs (lehet több is ha multipleStatements: true)
//  - req: Express request (session-hez)
//  - ertekek: (array) paraméterek (biztonságos helyőrzőkkel)
//  - naplozas: (bool) ha true, akkor naplózza az SQL-t a napló táblába
// Visszatérés: JSON string {message, rows} vagy hibaszöveg
// Működés:
//   1. Kapcsolatot kér a pool-ból
//   2. Futtatja a paraméterezett SQL-t
//   3. Ha naplozas=true és volt affect, beírja a napló táblába
//   4. JSON-ként visszaadja az eredményt
async function runExecute(sql, req, ertekek = [], naplozas) {
    session_data = req.session;
     if (!req.session || !req.session.ID_USER) {
        return JSON.stringify({ 
            message: "session expired",
            rows: []
        });
    }
    var msg = "ok";
    var json_data, res1, jrn;
    
    let conn;  // Kapcsolat deklarációja
    try {
        conn = await pool.getConnection(); 
        [res1] = await conn.query(sql, ertekek);  // Paraméterezett lekérdezés

        // === NAPLÓZÁS ===
        // Ha módosítás történt (INSERT/UPDATE/DELETE), naplózza azt
        if (naplozas) {
            const affected = res1.affectedRows || res1.changedRows || 0;
            if (affected > 0) {
                // Az SQL-t olvasható formátumba konvertálja (paraméterek behelyettesítésével)
                var naplozasraKeszSql = osszeallitottSqlNaplozasra(sql, ertekek);
                jrn = `insert into naplo (ID_USER, COMMENT, URL, SQLX) values (${session_data.ID_USER},"SZ1-B-Iskolai-Webáruház, (vegrehajto neve: ${session_data.NEV})","${req.socket.remoteAddress}","${naplozasraKeszSql.replaceAll("\"","'")}");`;
                await conn.execute(jrn);
            }
        }
        
    } catch (err) {
        msg = err.sqlMessage;  // MySQL hibaszöveg
        console.error('Hiba:', err); 
    } finally {
        if (conn) conn.release();  // Kapcsolat felszabadítása
        json_data = JSON.stringify({"message": msg, "rows": res1});  // REST API formátum
    }
    return json_data;
}

// === runQueries() - SELECT LEKÉRDEZÉSEKHEZ ===
// Paraméterek:
//  - sql: (string) SELECT lekérdezés (lehet LIMIT/OFFSET)
//  - ertekek: (array) paraméterek (biztonságos)
// Visszatérés: JSON string {message, maxcount, rows}
// Működés:
//   1. Előbb COUNT-olja a lekérdezés eredményeit (biztonságos lapozáshoz)
//   2. Ha maxcount > 0, futtatja a fő lekérdezést
//   3. Visszaadja: {message: ok/hiba, maxcount: rekordszám, rows: tömb}
async function runQueries(sql, ertekek = []) {
    var maxcount = 0;
    var msg = "ok";
    
    // Az ORDER BY pozíciót megkeresi (ha van), mert azzal nem tudjuk COUNT-olni
    var poz = sql.toUpperCase().lastIndexOf("ORDER BY ");  
    poz == -1 ? poz = sql.length : poz;  // Ha nincs ORDER BY, az egész SQL-t számolja
    
    var json_data, res1, res2 = [];

    let conn;
    try {
        conn = await pool.getConnection();
        
        // === PARAMÉTERKEZELÉS A COUNT-hoz ===
        // Ha van LIMIT/OFFSET, azokat nem akarjuk a COUNT-ba, csak az előző paramétereket
        let szamlaloErtekek = sql.toUpperCase().includes('LIMIT') && ertekek.length > 0 ? ertekek.slice(0, -1) : ertekek;

        // === LÉPÉS 1: SOROK SZÁMA ===
        // Al-lekérdezésként számolja a sorok számát (ORDER BY nélkül)
        [res1] = await conn.execute(`select count(*) as db from (${sql.substring(0, poz)}) as tabla;`, szamlaloErtekek); 
        maxcount = res1[0].db | 0;  // Bitwise OR 0 = int konverálás
        
        

        // === LÉPÉS 2: ADATOK LEKÉRÉSE (HA VAN) ===
        if (maxcount > 0) {
            [res2] = await conn.execute(sql, ertekek);  // A teljes SQL az ORDER BY-val
        }
    } catch (err) {
        msg = err.sqlMessage;
        maxcount = -1;  // Hiba: -1
        console.error('Hiba:', err); 
    } finally {
        if (conn) conn.release();   
        json_data = JSON.stringify({ "message": msg, "maxcount": maxcount, "rows": res2 });  // REST API
        //console.log(json_data);
    }
    
    return json_data;
}

// === sendJson_toFrontend() - EGYSZERŰ WRAPPER ===
// Rövidítés a runQueries + response header + send-hez
async function sendJson_toFrontend (res, sql, ertekek = []) {
    var json_data = await runQueries(sql, ertekek);
    res.set(header1, header2);  // Content-Type: application/json; charset=UTF-8
    res.send(json_data);
    res.end(); 
}

// === IDŐZÓNA KONVERZIÓ ===
// Segéd függvény a CONVERT_TZ MySQL függvényhez
// Kiolvassa az aktuális gép időzónáját és "+HH:MM" vagy "-HH:MM" formátumban adja vissza
// Például: ha UTC+2, akkor "+02:00" lesz
// Működés:
//   1. getTimezoneOffset() percekben adja meg az eltolást, de FORDÍTOTT előjellel
//      (pl. UTC+2 = -120 perc)
//   2. Abszolút értéket vesz, majd osztva 60 = órák, maradék = percek
//   3. Az előjelet fordítja (negatív offset = pozitív UTC eltolás)
//   4. Formázás padStart-tal (2 számjegyűre)
function idozona() {
    const datum = new Date();
    
    // 1. Az eltolás percekben, de fordított előjellel
    const eltolasPercben = datum.getTimezoneOffset();

    // 2. Órákra és percekre konvertálás
    const eltolasOra = Math.floor(Math.abs(eltolasPercben) / 60);
    const eltolasPerc = Math.abs(eltolasPercben) % 60;

    // 3. Az előjel meghatározása (ha negatív az eredeti offset, akkor + UTC)
    const elojel = eltolasPercben < 0 ? "+" : "-";

    // 4. Formázás: "02" helyett "2"
    const oraString = String(eltolasOra).padStart(2, '0');
    const percString = String(eltolasPerc).padStart(2, '0');

    return `${elojel}${oraString}:${percString}`;
}

// === SQL NAPLÓZÁSRA ELŐKÉSZÍTÉS ===
// Segéd függvény: a paraméterezve futtatott SQL-t olvasható formátumúra konvertálja
// FIGYELEM: ez csak naplózáshoz, NEM futtatásra! Az alkalmazás SQL-je paraméterezhető marad.
// Működés:
//   1. Végigmegy a "?" helyőrzőkön
//   2. Minden helyőrző helyére behelyettesíti az ertekek[] tömb elemeit
//   3. Stringeket idézőjelbe rakja, szám/null/boolean marad egyszerűen
//   4. Base64 képadatok maszkálódnak ('-- BINARY DATA --')
function osszeallitottSqlNaplozasra(sql, ertekek) {
    let i = 0;
    
    // Helyőrzők (?) cseréje valós értékekre
    const finalSql = sql.replace(/\?/g, () => {
        // Hiba: elfogyott a paraméter
        if (i >= ertekek.length) {
            return '<<HIÁNYZÓ ÉRTÉK>>';
        }
        
        let ertek = ertekek[i++];

        // Base64 képadatok maszkálása
        if(typeof ertek === "string" && ertek.substring(0,5) === "data:") {
            return "'-- BINARY DATA --'";
        }
        
        // NULL értékek (idézőjel nélkül)
        if (ertek === null || typeof ertek === 'undefined') {
            return 'NULL';
        }

        // Számok, boolean értékek (idézőjel nélkül)
        if (typeof ertek === 'number' || typeof ertek === 'boolean' || typeof ertek === 'bigint') {
            return ertek.toString();
        }

        // Stringek: idézőjelbe rakva, belső idézőjelek escapelve
        // MySQL mód: ' -> '' (duplicate aposztróf)
        ertek = ertek.toString().replace(/'/g, "''");
        return `'${ertek}'`;
    });

    return finalSql;
}


//#endregion

//#region email_kuldes

// === EMAIL KÜLDÉS ===
// Az email-sender.js modul importálása
const { sendEmail } = require('./email-sender');

// POST: /send-email
// Paraméterek (req.body - JSON):
//  - email: (string) a fogadó email cím
//  - subject: (string) az email tárgya
//  - html: (string) az email HTML tartalma
// Működés: az email-sender modulon keresztül küldi az e-mail-t (SMTP)
app.post('/send-email', async (req, res) => {
    try {
        const { email, subject, html } = req.body;

        console.log("email küldése: ", email);
        await sendEmail(email, subject, html); 

        res.json({ message: 'Email sikeresen elküldve' });
    } catch (err) {
        console.error('/send-email hiba:', err);
        res.json({ message: 'Email hiba: ' + err.message });
    }
});

//#endregion


// === SZERVER INDÍTÁSA ===
// Az Express szerver elkezd hallgatni a megadott porton
app.listen(port, function () { 
    console.log(`megy a szero http://localhost:${port}`); 
});