// === KÖNYVTÁRAK ===
const util      = require('util');
const mysql     = require('mysql2/promise');  // MySQL aszinkron műveletek kezelésére (promise-alapú)
const express   = require('express');         // Express webszerver keretrendszer REST API-hoz
const session   = require('express-session'); // Felhasználói munkamenet (session) kezelése
const { stringify } = require('querystring');
const crypto    = require('crypto');          // Kriptográfiai műveletek (pl. véletlenszerű fájlnév generáláshoz)
const fs        = require('fs');              // Fájlrendszer műveletek (pl. képek törlése)


// === KONFIGURÁCIÓS FÁJLOK ===
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') }); // .env fájlból környezeti változók betöltése (DB hitelesítési adatok)

// === EXPRESS SZERVER ===
const app       = express();
const port      = 9012; // A szerver ezen a porton hallgat

// === MIDDLEWARE BEÁLLÍTÁSOK ===
// JSON és URL-enkódolt adatok feldolgozásához szükséges middleware-ek
// FONTOS: Mindkét middleware aktív, mert különböző formátumú adatokat kezelünk:
// - JSON formátumú adatokat (AJAX hívások)
// - URL-enkódolt form adatokat (email küldés, bizonyos form submitok)
app.use(express.json());                                           // JSON adatok parse-olása
app.use(express.urlencoded({ extended: true }));                   // URL-enkódolt adatok (form) feldolgozása

// === HTTP HEADER KONSTANSOK ===
// Minden JSON válasz ezen header-ekkel fog visszatérni
const header1 = 'Content-Type';
const header2 = 'application/json; charset=UTF-8'; // UTF-8 karakterkódolás magyar karakterekhez

// === STATIKUS FÁJLOK KISZOLGÁLÁSA ===
// A 'public' mappában lévő fájlok elérhetőek közvetlenül a böngészőből
app.use(express.static('public'));

// === FELHASZNÁLÓI MUNKAMENET (SESSION) BEÁLLÍTÁSA ===
// Session kezelés bejelentkezés után az ID_USER és egyéb adat tárolásához
// A session-ben tároljuk:
// - ID_USER: felhasználó azonosító
// - EMAIL: felhasználó email címe
// - NEV: felhasználó neve
// - ADMIN: általános admin jogosultság (Y/N)
// - WEBBOLT_ADMIN: webshop admin jogosultság (Y/N)
// - CSOPORT: felhasználó csoportja (Students/Teachers/Bosses)

const serverBoot = Date.now(); // Szerver indítási időpont (session érvényesség ellenőrzéséhez)

app.use(session({
    key: 'user_sid',                        // Session cookie neve
    secret: Date.now().toString(),          // Session azonosító (minden indításkor más - biztonság)
    resave: false,                          // Ne mentse újra a session-t minden kérésnél, ha nem változott
    saveUninitialized: false,               // Csak akkor hoz létre sessiont, ha tényleg rakunk bele valamit
    cookie: {
        maxAge: 2700000,                    // Session lejárati idő (45 perc milliszekundumban)
    }
}));

// === SESSION ELLENŐRZŐ ENDPOINT ===
// GET: /check_session
// Cél: Frontend-ről ellenőrizhető, hogy él-e még a session
// Visszaadja:
//  - active: boolean - van-e aktív session (ID_USER létezik-e)
//  - serverBoot: number - szerver indítási időbélyeg
//  - id_user: number|null - bejelentkezett felhasználó ID-ja
app.get('/check_session', (req, res) => {
  const active = !!req.session.ID_USER;  // Kétszeres negálás: boolean értékké konvertálás
  
  res.json({
    active,
    serverBoot,         
    id_user: req.session.ID_USER || null
  });
});

// === ADATBÁZIS KAPCSOLAT POOL ===
// Connection pool: több konkurens kapcsolatot kezel egyidejűleg a MySQL szerverrel
// A pool újrahasznosítja a kapcsolatokat a teljesítmény javítása érdekében
// FONTOS: multipleStatements engedélyezve tranzakciókhoz (START TRANSACTION + több INSERT/UPDATE)
const pool = mysql.createPool({
    host: process.env.DB_HOST,              // Az adatbázis szerverének IP/hostname (.env-ből)
    user: process.env.DB_USER,              // Az adatbázis felhasználóneve
    port: process.env.DB_PORT,              // Az adatbázis portja
    password: process.env.DB_PASSWORD,      // Az adatbázis jelszava
    database: process.env.DB_DATABASE,      // Az adatbázis neve
    multipleStatements: true,               // Több SQL utasítás egymás után (tranzakciókhoz szükséges)
    waitForConnections: true,               // Várakozzon szabad kapcsolatra, ne dobjon hibát azonnal
    connectionLimit: 10,                    // Maximum 10 egyidejű kapcsolat
    queueLimit: 0,                          // Végtelen várakozási sor (ha nincs szabad kapcsolat)
});


// === KÉPFELTÖLTÉS KEZELÉSE (MULTER) ===
// A multer middleware kezeli a multipart/form-data típusú file uploadokat
const multer = require("multer");

// Storage konfiguráció: hová és milyen néven mentse a fájlokat
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/img/uploads/'); // Fizikai mentési hely (ezzel a mappa nyilvános!)
    },
    filename: function (req, file, cb) {
        // Egyedi fájlnév generálás ütközések elkerülésére
        // Formátum: [timestamp]-[random_hex].[eredeti_kiterjesztés]
        // Példa: 1704556789123-a3f7c9e2b1d4.jpg
        const uniqueSuffix = Date.now() + '-' + crypto.randomBytes(6).toString('hex');
        const fileExtension = path.extname(file.originalname);
        cb(null, uniqueSuffix + fileExtension); 
    }
});

// Multer konfiguráció korlátokkal és szűréssel
const upload = multer({
  storage,                                      // Fenti storage config használata
  limits: { fileSize: 25 * 1024 * 1024 },       // Maximum 25MB fájlméret
  fileFilter: fileFilter                        // MIME típus ellenőrzés (lásd lentebb)
});

// === MIME TÍPUS ELLENŐRZÉS ===
// Csak bizonyos képformátumok engedélyezése (biztonsági okokból)
// FONTOS: Ez csak a MIME type-ot ellenőrzi, amit a kliens adott meg
// Komolyabb biztonsági ellenőrzéshez a fájl tartalmát is vizsgálni kellene
function fileFilter(req, file, cb) {
  const allowed = ["image/jpeg", "image/png", "image/webp"];  // Megengedett MIME típusok
  if (allowed.includes(file.mimetype)) {
    cb(null, true);                                             // OK, a fájl átmehet
  } else {
    cb(new Error("Csak képfájl tölthető fel!"), false);         // Hiba: nem megengedett típus
  }
}

module.exports = upload;

//#region konstans lekérdezés

// === ÁFA LEKÉRDEZÉSE ===
// GET: /afa
// Paraméterek: nincsenek
// Működés: Visszaadja a rendszerben beállított ÁFA százalékot a webbolt_konstansok táblából
// Használat: Rendelés véglegesítésénél bruttó összeg számításához
app.get('/afa',(req, res) => {
        var sql = `
        SELECT AFA from webbolt_konstansok
    `;
    sendJson_toFrontend(res, sql, []); 
});


//#endregion

//#region keresés

// === KATEGÓRIA LISTA ENDPOINT ===
// GET: /kategoria
// Paraméterek (req.query):
//  - elfogyott: (int) 1 = csak olyan kategóriák, amikben van elfogyott termék (MENNYISEG = 0)
//  - inaktiv: (int) 1 = csak olyan kategóriák, amikben van inaktív termék (AKTIV = 'N')
//  - nev: (string) szűrés kategória nevére, leírására vagy azonosítójára (LIKE operátor)
// Működés: 
//  - Dinamikus WHERE feltételeket épít a paraméterek alapján
//  - Csak olyan kategóriákat ad vissza, amikben van legalább egy termék (INNER JOIN miatt)
//  - DISTINCT használatával biztosítja, hogy egy kategória csak egyszer szerepeljen
// Visszaadja: Kategóriák listáját (ID_KATEGORIA, KATEGORIA)
app.get('/kategoria',(req, res) => {
    
    var elfogyott = (req.query.elfogyott? parseInt(req.query.elfogyott)   :   -1);  // -1 = nem szűrünk erre
    var inaktiv = (req.query.inaktiv? parseInt(req.query.inaktiv)     :   -1);     // -1 = nem szűrünk erre
    var nev = (req.query.nev? req.query.nev              :   "");
    
    // Feltételek és értékek elkülönítve (biztonságos paraméterezett lekérdezéshez)
    let whereFeltetelek = [];
    let ertekek = [];

    // Szöveges keresés: név, leírás vagy azonosító alapján
    if (nev !== "") {
        whereFeltetelek.push(`(t.NEV LIKE ? OR t.LEIRAS LIKE ? OR t.AZON LIKE ? OR k.KATEGORIA LIKE ?)`);
        ertekek.push(`%${nev}%`);  // % wildcard mindkét oldalon: bárhol megjelenhet a keresett szöveg
        ertekek.push(`%${nev}%`);
        ertekek.push(`%${nev}%`);
        ertekek.push(`%${nev}%`);
    }

    // Szűrési logika: elfogyott és/vagy inaktív termékek alapján
    // FONTOS: Az adminok láthatják az elfogyott/inaktív termékeket, ezért ide kerül a szűrés
    if (elfogyott != -1 && inaktiv == -1) {
        whereFeltetelek.push(`t.MENNYISEG = 0`);  // Csak elfogyott termékek kategóriái
    } else if (inaktiv != -1 && elfogyott == -1) {
        whereFeltetelek.push(`t.AKTIV = 'N'`);    // Csak inaktív termékek kategóriái
    } else if (elfogyott != -1 && inaktiv != -1) {
        whereFeltetelek.push(`(t.AKTIV = 'N' OR t.MENNYISEG = 0)`);  // Mindkettő: inaktív VAGY elfogyott
    } else {
        whereFeltetelek.push(`(t.AKTIV = 'Y' AND t.MENNYISEG > 0)`);  // Alapértelmezett: csak aktív és raktáron lévő
    }
    
    // WHERE záradék összeállítása (ha vannak feltételek)
    const where = whereFeltetelek.length > 0 ? `WHERE ${whereFeltetelek.join(' AND ')}` : '';

    // SQL lekérdezés: DISTINCT biztosítja, hogy egy kategória csak egyszer szerepeljen
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
// GET: /keres
// Paraméterek (req.query):
//  - order: (int) Rendezés típusa
//    - 1: ár szerint növekvő, -1: ár szerint csökkenő
//    - 2: név szerint ABC, -2: név szerint ABC fordított
//    - 3: mennyiség szerint növekvő, -3: mennyiség szerint csökkenő
//  - offset: (int) Lapozáshoz - melyik rekordtól kezdje (0, 52, 104...)
//  - elfogyott: (int) 1 = csak elfogyott termékek szűrése
//  - inaktiv: (int) 1 = csak inaktív termékek szűrése
//  - kategoria: (string) Kategória ID-k kötőjellel elválasztva: "1-3-5"
//  - nev: (string) Keresett szöveg (név/leírás/azonosító alapján)
//  - maxar, minar: (int) Ár tartomány szűrés (Ft-ban)
//  - maxmin_arkell: (int) Ha != -1, csak MAX/MIN ár lekérdezés (árcsúszka feltöltéséhez)
// Működés: 
//  - gen_SQL_kereses() összeállítja a dinamikus SQL-t és paramétereket
//  - Alapértelmezetten 52 terméket ad vissza lapozással
// Visszaadja: Termékek listáját vagy MIN/MAX árat (maxmin_arkell paramétertől függően)
app.get('/keres', (req, res) => {  
    var { sql, values } = gen_SQL_kereses(req); 
    sendJson_toFrontend (res, sql, values);
});

// === SQL KERESÉSI LEKÉRDEZÉS ÖSSZEÁLLÍTÁSA ===
// Segéd függvény az /keres endpointhoz
// Megépíti a dinamikus SQL WHERE feltételeket a paraméterekből
// FONTOS: Ez a függvény kezeli a komplex szűrési logikát (kategória, ár, aktív/inaktív stb.)
function gen_SQL_kereses(req) {
    let ertekek = [];
    let whereFeltetelek = []; 

    // === QUERY PARAMÉTEREK KIOLVASÁSA ===
    var order     = (req.query.order? parseInt(req.query.order)            :   0);     // Rendezés típusa (0 = nincs)
    var offset    = (req.query.offset? parseInt(req.query.offset)          :   0);     // Lapozás kezdőpontja
    var elfogyott = (req.query.elfogyott? parseInt(req.query.elfogyott)    :   -1);   // Elfogyott szűrő (-1 = nem szűrünk)
    var inaktiv   = (req.query.inaktiv? parseInt(req.query.inaktiv)        :   -1);   // Inaktív szűrő (-1 = nem szűrünk)
    var kategoriaSzoveg = (req.query.kategoria ? req.query.kategoria : "");            // Kategória ID-k: "1-3-5" formátum
    var nev       = (req.query.nev? req.query.nev :   "");                             // Keresett szöveg
    var maxarkeres = (req.query.maxar? parseInt(req.query.maxar) : 0);                // Maximum ár szűrő (0 = nincs)
    var minarkeres = (req.query.minar? parseInt(req.query.minar) : 0);                // Minimum ár szűrő (0 = nincs)
    var maxmin_arkell = (req.query.maxmin_arkell? parseInt(req.query.maxmin_arkell) : -1); // Csak MIN/MAX ár? (-1 = nem)

    // === ALAPÉRTELMEZETT SZŰRÉSI FELTÉTELEK ===
    // Adminok láthatják az elfogyott/inaktív termékeket, ezért dinamikus szűrés
    if (elfogyott != -1 && inaktiv != -1) {
        // Mindkét kapcsoló be: inaktív VAGY elfogyott termékek
        whereFeltetelek = [`(t.AKTIV = 'N' OR t.MENNYISEG = 0)`];
    } else if (elfogyott != -1) {
        // Csak elfogyott
        whereFeltetelek = [`t.MENNYISEG = 0`];
    } else if (inaktiv != -1) {
        // Csak inaktív
        whereFeltetelek = [`t.AKTIV = 'N'`];
    } else {
        // Alapértelmezett: csak aktív és raktáron lévő termékek
        whereFeltetelek = [`(t.AKTIV = 'Y' AND t.MENNYISEG > 0)`];
    }

    // === SZÖVEG SZŰRÉS (NÉV/LEÍRÁS/AZONOSÍTÓ) ===
    if (nev.length > 0) {
        whereFeltetelek.push(`(t.NEV LIKE ? OR t.LEIRAS LIKE ? OR t.AZON LIKE ? OR k.KATEGORIA LIKE ?)`);
        ertekek.push(`%${nev}%`);  // % wildcard: bárhol megjelenhet a szöveg
        ertekek.push(`%${nev}%`);
        ertekek.push(`%${nev}%`);
        ertekek.push(`%${nev}%`);
    }

    // === KATEGÓRIA SZŰRÉS ===
    // Paraméter formátum: "1-3-5" -> szétválasztjuk és IN feltételbe tesszük
    // FONTOS: A kötőjeles formátumot használjuk, hogy a frontend könnyen módosíthassa
    let kategoriaAzonositok = [];
    if (kategoriaSzoveg.length > 0) {
        kategoriaAzonositok = kategoriaSzoveg.split("-").map(id => parseInt(id));
        
        if (kategoriaAzonositok.length > 0) {
            // Helyőrzőkkel (?) paraméteres: k.ID_KATEGORIA IN (?, ?, ?)
            const helyorzok = kategoriaAzonositok.map(() => '?').join(', ');
            whereFeltetelek.push(`k.ID_KATEGORIA IN (${helyorzok})`);
            ertekek.push(...kategoriaAzonositok);  // ... = spread operátor: tömb elemeit szórja szét
        }
    }

    // === ÁR SZŰRÉS ===
    // FONTOS: 0 érték = nincs szűrés (nem ugyanaz, mint a 0 Ft ár!)
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
    // Ha csak a Min/Max árat akarjuk (pl. árcsúszka feltöltéséhez), ezt az ágat követjük
    // FONTOS: Ez egy külön lekérdezés, nem termékeket ad vissza!
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
        // Negatív érték esetén DESC (csökkenő) rendezés
        var order_van = "";
        switch (Math.abs(order)) {
            case 1: order_van = "ORDER BY AR";        break;  // Ár szerint
            case 2: order_van = "ORDER BY NEV";       break;  // Név szerint (ABC)
            case 3: order_van = "ORDER BY MENNYISEG"; break;  // Mennyiség szerint
            default: order_van = "" ; break;                  // Nincs rendezés
        }

        // Az SQL lekérdezés összeállítása
        // FONTOS: LEFT JOIN a fotókhoz, mert nem minden termékhez van feltöltött kép
        // CASE WHEN: ha van FOTOLINK, azt használja, egyébként a webbolt_fotok.IMG-t
        var sql = 
        `
        SELECT 
            t.ID_TERMEK, t.ID_KATEGORIA, t.NEV, t.AZON, t.AR, t.MENNYISEG, t.MEEGYS, t.AKTIV, 
            CASE WHEN t.FOTOLINK IS NOT NULL THEN t.FOTOLINK ELSE webbolt_fotok.IMG END AS FOTOLINK, 
            t.LEIRAS, 
            k.KATEGORIA AS KATEGORIA
            FROM webbolt_termekek as t 
            INNER JOIN webbolt_kategoriak as k ON t.ID_KATEGORIA = k.ID_KATEGORIA
            left join webbolt_fotok ON t.ID_TERMEK = webbolt_fotok.ID_TERMEK
            ${where}
            ${order_van} ${order<0? "DESC": ""}
            limit 52 offset ?
        `;
        
        // Az offset paraméter a végére kerül (lapozáshoz)
        // offset * 52: hányadik rekordtól kezdje (0, 52, 104...)
        ertekek.push(offset * 52); 
        
        return { sql, values: ertekek };
    }
}

//#endregion

//#region vélemények

// === VÉLEMÉNYEK LEKÉRÉSE ENDPOINT ===
// GET: /velemenyek
// Paraméterek (req.query):
//  - ID_TERMEK: (int) konkrét termék véleményei
//  - SAJATVELEMENY: (int) 1 = saját véleményt is mutasd (bejelentkezett user)
//  - szelektalas: (int) 0=jóváhagyva, 1=jóváhagyásra vár, 2=elutasítva
// Működés: a sessionből olvassa az ID_USER-t, azt használja a bejelentkezetthez
app.get('/velemenyek',(req, res) => {
    session_data = req.session;
    
    var termekid = (req.query.ID_TERMEK ? parseInt(req.query.ID_TERMEK) : 0);
    var sajatvelemeny = (req.query.SAJATVELEMENY ? parseInt(req.query.SAJATVELEMENY) : 0);
    var szelektalas = (req.query.szelektalas? parseInt(req.query.szelektalas) : 0); 

    var offset = parseInt(req.query.OFFSET)
    
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

    
    sql += `ORDER BY DATUM DESC `;  // Legújabbtól a legrégebbiig
    
    
    
    if(szelektalas == 1){
            sql += `limit 10 offset ?`
            ertekek.push(offset*10)
    }
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

        const eredmeny = await runExecute(sql, req, ertekek, true);
        if(eredmeny.message != "ok"){
            throw new Error(eredmeny.message || "Az adatbázis művelet sikertelen.");
        }
        res.json(eredmeny);
        res.end();

    } catch (err) {
        console.error("/velemeny_add HIBA : " + (err && err.message ? err.message : err));
        return res.json({
            message: "Nem sikerült hozzáadni a véleményt."
        });
    }      
});

// === VÉLEMÉNY TÖRLÉSE ===
// DELETE: /velemeny_del
// Paraméter: ID_VELEMENY (int)
app.delete('/velemeny_del', async (req, res) => {
    
    try {
        var velemenyid = parseInt(req.query.ID_VELEMENY);
        
        var sql = `
        DELETE FROM webbolt_velemenyek
        WHERE ID_VELEMENY = ?
        `;
        let ertekek = [velemenyid];

        const eredmeny = await runExecute(sql, req, ertekek, true);
        if(eredmeny.message != "ok"){
            throw new Error(eredmeny.message || "Az adatbázis művelet sikertelen.");
        }
        res.json(eredmeny);
        res.end();

    } catch (err) {
        console.error("/velemeny_del HIBA : " + (err && err.message ? err.message : err));
        return res.json({
            message: "Nem sikerült törölni a véleményt."
        });
    }   
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

        const eredmeny = await runExecute(sql, req, ertekek, true);
        if(eredmeny.message != "ok"){
            throw new Error(eredmeny.message || "Az adatbázis művelet sikertelen.");
        }
        res.json(eredmeny);
        res.end();

    } catch (err) {
        console.error("/velemeny_elfogad HIBA : " + (err && err.message ? err.message : err));
        return res.json({
            message: "Nem sikerült jóváhagyni a véleményt." 
        });
    }       
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

        const eredmeny = await runExecute(sql, req, ertekek, true);
        if(eredmeny.message != "ok"){
            throw new Error(eredmeny.message || "Az adatbázis művelet sikertelen.");
        }
        res.json(eredmeny);
        res.end();

    } catch (err) {
        console.error("/velemeny_elutasit HIBA : " + (err && err.message ? err.message : err));
        return res.json({
            message: "Nem sikerült elutasítani a véleményt." 
        });
    }       
});

//#endregion

//#region login/logoff

// === BEJELENTKEZÉS ===
// GET: /login
// Paraméterek (req.query):
//  - login_nev: (string) email vagy felhasználónév
//  - login_passwd: (string) jelszó (MD5 hashelve ellenőrizve)
// Működés:
//   1. Az adatbázisból lekérdezi az adatokat email és MD5 jelszó alapján
//   2. Ha pontosan 1 felhasználót talál, bejelentkezés sikeres
//   3. Session-be menti az ID_USER, EMAIL, NEV, ADMIN, WEBBOLT_ADMIN, CSOPORT értékeket
//   4. Konzolra naplózza a bejelentkezést debug célra
// Visszatér: {message, maxcount, rows} - maxcount=1 ha sikeres bejelentkezés
app.get('/login', (req, res) => { login_toFrontend (req, res); });

// === BEJELENTKEZÉSI LOGIKA ===
async function login_toFrontend (req, res) {
    try {
        // Paraméterek olvasása (email/felhasználónév és jelszó)
        var user = (req.query.login_nev? req.query.login_nev: "");
        var psw = (req.query.login_passwd? req.query.login_passwd : "");
        
        // SQL lekérdezés: MD5 hashelve hasonlítjuk a jelszót az adatbázissal
        // FIGYELEM: MD5 elavult, bcrypt-re kellene migrálni biztonsági okokból
        var sql = `SELECT ID_USER, NEV, EMAIL, ADMIN, WEBBOLT_ADMIN, CSOPORT FROM users WHERE EMAIL=? AND PASSWORD=md5(?)`;
        let ertekek = [user, psw]; 
        
        var conn;
        var data;
        conn = await pool.getConnection();
        const [rows] = await conn.execute(sql, ertekek); 
        
        let msg = "ok";
        let maxcount = rows.length;

        // === BEJELENTKEZÉS SIKERESSÉGÉNEK ELLENŐRZÉSE ===
        // Pontosan 1 soros találat = sikeres bejelentkezés
        if (maxcount == 1) {                          
            // Session adatok feltöltése az összes szükséges felhasználó adattal
            session_data              = req.session;
            session_data.ID_USER        = rows[0].ID_USER;  // Felhasználó egyedi azonosítója
            session_data.EMAIL          = rows[0].EMAIL;    // Email cím (felhasználó azonosítás)
            session_data.NEV            = rows[0].NEV;      // Teljes név (UI megjelenítéshez)
            session_data.ADMIN          = rows[0].ADMIN;    // Admin (Y/N) - főoldal adminisztrációhoz
            session_data.WEBBOLT_ADMIN  = rows[0].WEBBOLT_ADMIN;  // Webáruház admin (Y/N) - termékkezeléshez
            session_data.CSOPORT        = rows[0].CSOPORT;  // Felhasználó csoportja (szervezeti jellegű)
        } else if (maxcount === 0) {
            // Hibás bejelentkezési adat
            msg = "Hibás felhasználónév vagy jelszó.";
        }

        data = JSON.parse(JSON.stringify({ "message": msg, "maxcount": maxcount, "rows": rows }));

    } catch (err) {
        console.error("/login HIBA : " + (err && err.message ? err.message : err));
        data = JSON.parse(JSON.stringify({ "message": "Adatbázis hiba", "maxcount": -1, "rows": []}));
    } finally {
        if (conn) conn.release();  // Adatbázis kapcsolat felszabadítása
    }
    
    res.set(header1, header2);
    res.json(data);
    res.end();
}

// === ADMIN JOGOSULTSÁGOK ELLENŐRZÉSE ===
// GET: /admin_check
// Működés: a session-ből olvassa az admin jogosultságokat és boolean formátumban visszaküldi
// ADMIN (Y/N) = fő admin (főoldal kezelés)
// WEBBOLT_ADMIN (Y/N) = webáruház admin (termékek kezelés)
app.get('/admin_check', (req, res) => {
    session_data = req.session;
    // Boolean konverálás: 'Y' -> true, egyéb -> false
    const admine = session_data.ADMIN === "Y";
    const webadmine = session_data.WEBBOLT_ADMIN === "Y";
    
    res.set(header1, header2);
    res.json({ admin: admine, webadmin: webadmine });
    res.end();
});

// === KIJELENTKEZÉS ===
// GET: /logout
// Működés: a session megsemmisítésével az user már nem lesz bejelentkezve
app.get('/logout', (req, res) => {  
    session_data = req.session;
    
    // === SESSION MEGSEMMISÍTÉSE ===
    // A destroy() függvény végleg törli a session adatokat a szerverről
    session_data.destroy(function(err) {
        if (err) {
            console.error('Session destroy failed: ' + (err && err.message ? err.message : err));
            res.json({ message: 'Session destroy failed', error: err && err.message ? err.message : err });
            return;
        }
        
        res.set(header1, header2);
        res.json({ message: 'Sikeres logout' });
        res.end();
    });
});

//#endregion

//#region kosar

// === KOSÁR TÉTEL HOZZÁADÁSA / MÓDOSÍTÁSA ===
// POST: /kosar_add
// Paraméterek (req.query):
//  - ID_TERMEK: (int) melyik termék
//  - MENNYIT: (int) mennyit adjunk hozzá/vonjunk le (alap: 1, additív módszer)
//  - ERTEK: (int) ha != 0, akkor erre az értékre állítsd a mennyiséget (nem additív, pontos érték)
// Működés (SQL tranzakció - START TRANSACTION...COMMIT):
//   1. Ha nincs kosár az userhez, létrehozza
//   2. Ha nincs tétel a kosárban, beszúrja az adott terméket
//   3. Frissíti a mennyiséget (raktárkészlettel összehangolt, max límit figyelembe vesz)
//   4. MySQL CASE utasítással ellenőrzi, hogy nem haladja-e meg a raktárkészletet
// Logika:
//   - Additív (+/- mennyit): kosár_mennyiség + mennyit (max raktárkészlet)
//   - Pontos érték (@elsoadd = FALSE, majd MAX(érték, raktárkészlet))
app.post('/kosar_add', async (req, res) => {
    try {
        session_data = req.session;

        // Paraméterek kiolvasása
        var termekid = parseInt(req.query.ID_TERMEK);
        var mennyit  = (req.query.MENNYIT? parseInt(req.query.MENNYIT)  :   1);  // Mennyit adjunk hozzá/vonjunk le
        var mennyire = (req.query.ERTEK ? parseInt(req.query.ERTEK) : 0);       // Pontos érték beállítás (ha != 0)
        
        let ertekek = [];
        
        // === MENNYISÉG SZŰRŐ LOGIKA - RAKTÁRKÉSZLET LÍMIT ===
        // Az UPDATE CASE utasítás határozza meg, hogy az új mennyiség nem haladhatja meg a raktárkészletet
        let mennyisegSzuro;
        if (mennyire != 0) {
            // PONTOS ÉRTÉK MÓD: beállítjuk az adott mennyiségre (max raktárkészlet)
            // Ha az érték kisebb a raktárkészletnél, az értéket vesszük, ellenkező esetben a raktárkészlet maximális
            mennyisegSzuro = `WHEN ? < t.MENNYISEG then ? ELSE t.MENNYISEG `; 
            ertekek.push(mennyire, mennyire);
        } else {
            // ADDITÍV MÓD: hozzáadunk/kivonunk az aktuális mennyiségből
            let mennyitElőjel = mennyit > 0 ? `+ ${mennyit}` : `${mennyit}`;
            const ujMennyisegSzamitva = `k.MENNYISEG ${mennyitElőjel}`;

            // Feltételek az UPDATE-hez:
            // - @elsoadd = FALSE (már létezik a tétel)
            // - Az új mennyiség <= raktárkészlet
            // - Az új mennyiség >= 1 (minimális 1 darab)
            const feltetel = `
                @elsoadd = FALSE 
                AND ${ujMennyisegSzamitva} <= t.MENNYISEG 
                AND ${ujMennyisegSzamitva} >= 1
            `;
            mennyisegSzuro = `WHEN ${feltetel} THEN ${ujMennyisegSzamitva} ELSE k.MENNYISEG`;
        }
        
        // === TRANZAKCIÓ MAGJA - KOSÁR ÉS TÉTEL LÉTREHOZÁS ===
        let tranzakcioMag;
        if (mennyire != 0) {
            // PONTOS ÉRTÉK MÓD: egyszerűbb, már feltételezzük, hogy a kosár és tétel létezik
            tranzakcioMag = 
            `SET @kosarid = (SELECT webbolt_kosar.ID_KOSAR FROM webbolt_kosar WHERE webbolt_kosar.ID_USER = ${session_data.ID_USER});`;
        } else {
            // ADDITÍV MÓD: teljes flow (kosár létrehozás, @elsoadd jelző, insert ha szükséges)
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

        // === TELJES TRANZAKCIÓ ÖSSZEÁLLÍTÁSA ===
        // INNER JOIN: biztosítja, hogy csak olyan tételek frissülnek, amiknek van a raktárban mennyiségük
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
        if(eredmeny.message != "ok"){
            throw new Error(eredmeny.message || "Az adatbázis művelet sikertelen.");
        }
        res.json(eredmeny);
        res.end();

    } catch (err) {
        console.error("kosar_add HIBA : " + (err && err.message ? err.message : err));
        res.json({
            message: "Hiba a kosár tétel hozzáadásakor." 
        });
    }    
});

// === KOSÁR TÉTEL TÖRLÉSE ===
// DELETE: /kosar_del
// Paraméter: ID_TERMEK (int) - törlendő termék ID
// Működés (SQL tranzakció):
//   1. Lekérdezi a user kosárának ID-jét a session-ből
//   2. Kitöröl egy tételt a kosárból az adott termék alapján
app.delete('/kosar_del',async (req, res) => {
    try{
        session_data = req.session;
        
        // Paraméter kiolvasása
        var termekid  = parseInt(req.query.ID_TERMEK);
        
        // SQL tranzakció: kosár ID lekérése és a tétel törlése
        var sql = `
            START TRANSACTION;
            SET @kosarid = (SELECT webbolt_kosar.ID_KOSAR FROM webbolt_kosar WHERE webbolt_kosar.ID_USER = ?);
                    
            DELETE FROM webbolt_kosar_tetelei
            WHERE webbolt_kosar_tetelei.ID_KOSAR = @kosarid AND webbolt_kosar_tetelei.ID_TERMEK = ?;
            COMMIT;
        `;
        let ertekek = [session_data.ID_USER, termekid];

        const eredmeny = await runExecute(sql, req, ertekek, false);
        if(eredmeny.message != "ok"){
            throw new Error(eredmeny.message || "Az adatbázis művelet sikertelen.");
        }
        res.json(eredmeny);
        res.end();
    }
    catch (err) {
        console.error("kosar_del HIBA : " + (err && err.message ? err.message : err));
        res.json({
            message: "Hiba a kosár tétel törlésekor." 
        });
    }
});

// === KOSÁR TÉTEL DARABSZÁM ===
// GET: /kosarteteldb
// Működés: az összes kosár tételnek az összes mennyiségét összeadja (SUM)
// Visszatér: összes darab száma a kosárban
app.get('/kosarteteldb',(req, res) => {    

    session_data = req.session;

    // Session ellenőrzés: nincs bejelentkezve
    if (!session_data.ID_USER) {
        res.set(header1, header2);
        // Üres kosár jelzés session nélkül
        return res.json({ message: "session expired", maxcount: 0, rows: [] });
    }

    // SQL: SUM() az összes tétel mennyiségét összeadja
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

// === KOSÁR TÉTELEK LEKÉRÉSE ===
// GET: /tetelek
// Paraméter: ID_TERMEK (opcionális) - ha megadva, csak annak az egy terméknek az adatait kérjük
// Működés: feltétel alapján eltérő SQL-t készít:
//   - Ha ID_TERMEK adott: csak az ár és mennyiség (1 sor)
//   - Ha ID_TERMEK nincs: az összes kosár tétel teljes adataival (nulla vagy több sor)
app.get('/tetelek',(req, res) => {

    session_data = req.session;

    // Session ellenőrzés
    if (!session_data.ID_USER) {
        res.set(header1, header2);
        return res.json({ message: "session expired", maxcount: 0, rows: [] });
    }        
 
    // Paraméter kiolvasása (-1 = nincs megadva)
    var termekid  = (req.query.ID_TERMEK? parseInt(req.query.ID_TERMEK)  :   -1)

    // === FELTÉTELES SELECT ===
    // Ha van konkrét termék ID: kevesebb oszlop (ár, mennyiség)
    // Ha nincs: teljes termék info (név, ár, kép, ID, mennyiség)
    let selectFields = termekid > (-1) 
        ? "webbolt_kosar_tetelei.MENNYISEG, webbolt_termekek.AR" 
        : "webbolt_termekek.NEV, webbolt_termekek.AR, CASE WHEN webbolt_termekek.FOTOLINK IS NOT NULL THEN webbolt_termekek.FOTOLINK ELSE webbolt_fotok.IMG END AS FOTOLINK, webbolt_termekek.ID_TERMEK, webbolt_kosar_tetelei.MENNYISEG, webbolt_kategoriak.KATEGORIA";

    // WHERE zaradék dinamikus: alapból az aktuális user kosára, opcionálisan egy konkrét termék
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
        INNER JOIN webbolt_kategoriak ON webbolt_termekek.ID_KATEGORIA = webbolt_kategoriak.ID_KATEGORIA 
        left join webbolt_fotok ON webbolt_termekek.ID_TERMEK = webbolt_fotok.ID_TERMEK
        ${whereClause}
    `;
    sendJson_toFrontend(res, sql, ertekek);
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
//  - AFA: (int) ÁFA %
// Működés (SQL tranzakció - START TRANSACTION...COMMIT):
//   1. Lekérdezi a kosár tételeit az aktuális user-hez
//   2. Ellenőrzi, hogy van-e mit rendelni (maxcount > 0)
//   3. Beszúrja a fő rendelés rekordjot (webbolt_rendeles)
//   4. Végigmegy minden tételen és beszúrja a rendelés_tételei táblába
//   5. Kitörli a kosár tételeit (új rendeléstől kezdve új kosár lesz)
app.post('/rendeles',async (req, res) => {
    try{
        session_data = req.session;

        // Paraméterek kiolvasása a rendelés adataihoz
        var fizmod = req.query.FIZMOD;
        var szallmod = req.query.SZALLMOD;
        var megjegyzes = req.query.MEGJEGYZES;
        var szallcim = req.query.SZALLCIM;
        var nev = req.query.NEV;
        var email = req.query.EMAIL;
        var afa = req.query.AFA;

        // === 1. LÉPÉS: KOSÁR TÉTELEK LEKÉRÉSE ===
        // Lekérdezzük az aktuális user kosárának összes tételét a termék adatokkal
        var termemekek_sql = 
        `
        SELECT ct.ID_KOSAR, ct.ID_TERMEK, ct.MENNYISEG, t.NEV, t.AR, kat.KATEGORIA,
               CASE WHEN t.FOTOLINK IS NOT NULL THEN t.FOTOLINK ELSE webbolt_fotok.IMG END AS FOTOLINK
        FROM webbolt_kosar_tetelei ct
        INNER JOIN webbolt_kosar k ON ct.ID_KOSAR = k.ID_KOSAR
        INNER JOIN webbolt_termekek t ON ct.ID_TERMEK = t.ID_TERMEK
        INNER JOIN webbolt_kategoriak kat on t.ID_KATEGORIA = kat.ID_KATEGORIA
        left join webbolt_fotok ON t.ID_TERMEK = webbolt_fotok.ID_TERMEK
        WHERE k.ID_USER = ?
        `;
        var termekek_ertekek = [session_data.ID_USER];
        
        var json_termekek = await runQueries(termemekek_sql, termekek_ertekek);
        
        // === HIBA ELLENŐRZÉS: VAN-E MIT RENDELNI? ===
        if (json_termekek.message != "ok" || json_termekek.maxcount == 0) {
            res.json({
                message: "Szörnyű hiba történt a rendelés során: nincs mit rendelni.",
                error: json_termekek.message || "Nincs termék a kosárban"
            });
            return;
        } 

        // === 2. LÉPÉS: RENDELÉS SQL TRANZAKCIÓ ÖSSZEÁLLÍTÁSA ===
        let sqlParancsok = [];  // SQL utasítások sorszámozottva
        let sqlErtekek = [];    // Hozzájuk tartozó paraméterek

        // 2.1: Kosár ID lekérése (felhasználó kosára)
        sqlParancsok.push(`SET @kosarid = (SELECT ID_KOSAR FROM webbolt_kosar WHERE ID_USER = ?);`);
        sqlErtekek.push(session_data.ID_USER);

        // 2.2: Fő rendelés rekordjának beszúrása (webbolt_rendeles tábla)
        sqlParancsok.push(`
            INSERT INTO webbolt_rendeles (ID_USER, FIZMOD, SZALLMOD, MEGJEGYZES, SZALLCIM, NEV, EMAIL, AFA)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?);
        `);
        sqlErtekek.push(session_data.ID_USER, fizmod, szallmod, megjegyzes, szallcim, nev, email, afa);

        // 2.3: Az új rendelés ID-jét LAST_INSERT_ID()-ből mentjük el
        sqlParancsok.push(`SET @rendeles_id = LAST_INSERT_ID();`);

        // 2.4: Minden kosár tételhez INSERT a rendelés_tételei táblába
        // (a rendelés tételeit a kosár tételeiből készítjük el)
        for (var termek of json_termekek.rows) {
            sqlParancsok.push(`
                INSERT INTO webbolt_rendeles_tetelei (ID_RENDELES, MENNYISEG, NEV, AR, FOTOLINK, ID_TERMEK, KATEGORIA)
                VALUES (@rendeles_id, ?, ?, ?, ?, ?, ?);
            `);
            sqlErtekek.push(
                parseInt(termek.MENNYISEG), 
                termek.NEV, 
                parseInt(termek.AR), 
                termek.FOTOLINK, 
                parseInt(termek.ID_TERMEK),
                termek.KATEGORIA
            );
        }

        // 2.5: A kosár tételeinek törlése (új rendeléstől kezdve új kosár lesz)
        sqlParancsok.push(`DELETE FROM webbolt_kosar_tetelei WHERE ID_KOSAR = @kosarid;`);

        // === 3. LÉPÉS: TELJES TRANZAKCIÓ ÖSSZEÁLLÍTÁSA ===
        var sql = 
        `
        START TRANSACTION;
        ${sqlParancsok.join('\n')}
        COMMIT;
        `;

        var eredmeny = await runExecute(sql, req, sqlErtekek, false);
        if (eredmeny.message != "ok") {
            throw new Error(eredmeny.message || "Az adatbázis művelet sikertelen.");
        }
        res.set(header1, header2);
        res.json(eredmeny);
        res.end();
    } catch (err) {
        console.error("/rendeles HIBA : " + (err && err.message ? err.message : err));
        res.json({
            message: "Hiba a rendelés létrehozásakor." 
        });
    }
});

// === RENDELÉS ELLENŐRZÉS ===
// GET: /rendeles_ellenorzes
// Paraméterek (req.query):
//  - ID_TERMEK: (int) termék ID
//  - MENNYISEG: (int) kívánt mennyiség
// Működés: ellenőrzi, hogy van-e elég raktárkészlet és aktív-e a termék
// Visszatér: allapot oszlop = 'karramba' ha nincs elég készlet, '' ha OK
app.get('/rendeles_ellenorzes',async (req, res) => {
    try{
        // Paraméterek
        var termekid = parseInt(req.query.ID_TERMEK);
        var mennyiseg = parseInt(req.query.MENNYISEG);

        // SQL ellenőrzés: IF() függvénnyel
        // Ha a raktár mennyisége < kívánt mennyiség VAGY inaktív -> 'karramba'
        var sql = 
        `
        SELECT IF(webbolt_termekek.MENNYISEG < ? or webbolt_termekek.AKTIV = 'N', 'karramba', '') AS allapot
        FROM webbolt_termekek
        WHERE ID_TERMEK = ?
        `;
        let ertekek = [mennyiseg, termekid];

        var eredmeny = await runQueries(sql, ertekek);
        if(eredmeny.message != "ok"){
            throw new Error(eredmeny.message || "Az adatbázis művelet sikertelen.");
        }
        res.set(header1, header2);
        res.json(eredmeny);
        res.end();
    } catch (err) {
        console.error("/rendeles_ellenorzes HIBA : " + (err && err.message ? err.message : err));
        res.json({
            message: "Hiba a rendelés ellenőrzésekor." 
        });
    }
});

// === FELHASZNÁLÓ RENDELÉSEINEK LISTÁZÁSA ===
// GET: /rendelesek
// Paraméter: OFFSET (int) - lapozáshoz (0, 1, 2... -> 0, 10, 20... rekord)
// Működés: az aktuális bejelentkezetthez tartozó rendeléseket összesítéssel visszaadja
// Csoportosítás: ID_RENDELES (egy rendelés egy sor)
// Összesítés: rendeles végösszege = SUM(tételek_ára * mennyisége) * (1 + AFA/100)
app.get('/rendelesek',async (req, res) => {
    try{
        session_data = req.session;
        // Paraméter: lapozás kezdőpontja (10 rekord/oldal)
        var off = req.query.OFFSET

        // SQL: rendelések lekérése összesítéssel (végösszeg számítás)
        var sql = 
        `
        SELECT r.ID_RENDELES, CONVERT_TZ(r.datum, '+00:00','${idozona()}') AS DATUM, r.AFA,
        round(SUM(rt.AR * rt.MENNYISEG)*(1+(r.AFA/100))) AS RENDELES_VEGOSSZEGE
        FROM webbolt_rendeles AS r
        JOIN webbolt_rendeles_tetelei AS rt ON r.ID_RENDELES = rt.ID_RENDELES
        WHERE r.ID_USER = ?
        GROUP BY r.ID_RENDELES
        ORDER BY r.ID_RENDELES DESC
        limit 10 offset ?
        `;
        let ertekek = [session_data.ID_USER, off*10];

        var eredmeny = await runQueries(sql, ertekek);
        if(eredmeny.message != "ok"){
            throw new Error(eredmeny.message || "Az adatbázis művelet sikertelen.");
        }
        
        res.set(header1, header2);
        res.json(eredmeny);
        res.end();
    } catch (err) {
        console.error("/rendelesek HIBA : " + (err && err.message ? err.message : err));
        res.json({
            message: "Hiba a rendelések lekérésekor." 
        });
    }
});

// === KONKRÉT RENDELÉS TÉTELEI ===
// GET: /rendelesek_tetelei
// Paraméter: ID_RENDELES (int) - melyik rendelés tételeit kérjük
// Működés: egy rendelés összes tételét visszaadja (név, mennyiség, ár, képek)
app.get('/rendelesek_tetelei',async (req, res) => {
    try{
        // Paraméter
        var rendelesid = parseInt(req.query.ID_RENDELES);

        // SQL: a rendeléshez tartozó összes tétel
        var sql =
        `
        SELECT rt.NEV, rt.MENNYISEG, rt.AR, rt.FOTOLINK
        from webbolt_rendeles_tetelei AS rt
        WHERE rt.ID_RENDELES = ?
        `;
        let ertekek = [rendelesid];

        var eredmeny = await runQueries(sql, ertekek);
        if(eredmeny.message != "ok"){
            throw new Error(eredmeny.message || "Az adatbázis művelet sikertelen.");
        }
        res.set(header1, header2);
        res.json(eredmeny);
        res.end();
    } catch (err) {
        console.error("/rendelesek_tetelei HIBA : " + (err && err.message ? err.message : err));
        res.json({
            message: "Hiba a rendelések lekérésekor." 
        });
    }
});

// === LEGUTOLSÓ RENDELÉS AZONOSÍTÓJA ===
// GET: /rendeles_azon
// Működés: az aktuális user legutolsó rendelésének ID-jét adja vissza
// Felhasználás: rendelés után az oldalon az azonosító megjelenítéséhez
app.get('/rendeles_azon', async (req, res) => {
    let conn; // Külön kapcsolat (NEM runQueries-t használunk)

    try {
        session_data = req.session;

        // SQL parancs: legutolsó rendelés ID-je (DATUM szerint csökkenő sorrendben)
        var sql = `
            SELECT webbolt_rendeles.ID_RENDELES AS RENDELES_AZONOSITO
            FROM webbolt_rendeles
            WHERE webbolt_rendeles.ID_USER = ?
            ORDER BY webbolt_rendeles.DATUM DESC
            LIMIT 1
        `;
        
        let ertekek = [session_data.ID_USER];

        // 1. Direkten kapcsolat igénylése a pool-ból (runQueries megkerülése)
        conn = await pool.getConnection();

        // 2. SQL futtatása paraméterezett módon
        const [rows] = await conn.execute(sql, ertekek);

        // 3. Kapcsolat felszabadítása (FONTOS!)
        conn.release();

        // 4. Eredmény feldolgozása
        let veglegesAzonosito = "";
        
        // Ha van találat
        if (rows.length > 0) {
            veglegesAzonosito = rows[0].RENDELES_AZONOSITO;
        } else {
            // Ha nincs találat (pl. még nem rendelt)
            throw new Error("Nincs rendelés");
        }

        // 5. Sikeres válasz küldése
        res.set(header1, header2);
        res.json({
            message: "ok",
            maxcount: rows.length,
            rows: rows
        });

    } catch (err) {
        // Hiba esetén is felszabadítjuk a kapcsolatot, ha létezik
        if (conn) conn.release();
        
        // Debug
        console.error("/rendeles_azon hiba:", err.message);

        // "Kamu" válasz küldése hiba esetén (hogy ne haljon meg a frontend)
        res.set(header1, header2);
        res.json({
            message: "ok",
            maxcount: 1,
            rows: [
                { RENDELES_AZONOSITO: "Feldolgozás alatt" } // Vagy "Nincs rendelés"
            ]
        });
    }
});


//#endregion

//#region termek

// === TERMÉK SZERKESZTÉS / BESZÚRÁS (ADMIN) ===
// POST: /termek_edit
// Multipart form-data (fájlfeltöltés) vagy URL-enkódolt adat
// Paraméterek:
//  - insert: (int) 0=UPDATE, 1=INSERT új termékhez
//  - mod_kat: (int) meglévő kategória ID
//  - uj_kat: (string) új kategória neve (ha nem meglévőt szeretnénk)
//  - mod_nev, mod_azon, mod_ar, mod_db, mod_meegys, mod_leiras: termék adatai
//  - mod_aktiv: (string) 'NO' = inaktív ('N'), egyéb = aktív ('Y')
//  - mod_fotolink: (string) kép link URL-ként (feltöltött fájl prioritást élvez)
//  - ID_TERMEK: (int) UPDATE esetén kötelező
//  - mod_foto: (file) feltöltendő képfájl (Multer kezeli)
// Működés:
//   1. Kategória kezelés: ha új kategória név adott, létrehozza vagy keresésüt a meglévőt
//   2. UPDATE ág: meglévő terméket módosít, képet is lehet cserélni (régi törölhető)
//   3. INSERT ág: új terméket hoz létre az összes adattal
//   4. Tranzakció: START TRANSACTION...COMMIT biztonság
app.post('/termek_edit', upload.single("mod_foto"), async (req, res) => {
    let conn;
    try {
        // Tranzakció kezdése
        conn = await pool.getConnection();
        await conn.query("START TRANSACTION;");

        // Paraméter: 0=UPDATE, 1=INSERT
        var insert = parseInt(req.query.insert) || 0;

        // === ADATOK BEOLVASÁSA ===
        // req.body: URL-enkódolt adatok (form)
        // req.file: Multer által felöltött fájl (mod_foto)
        var kategoria = req.body.mod_kat;
        var uj_kategoria = (req.body.uj_kat || '').trim();
        var nev       = req.body.mod_nev;
        var azon      = req.body.mod_azon;
        var ar        = parseInt(req.body.mod_ar) || 0;
        var mennyiseg = parseInt(req.body.mod_db) || 0;
        var meegys    = req.body.mod_meegys;
        var leiras    = req.body.mod_leiras;
        var termekid  = parseInt(req.body.ID_TERMEK);
        var aktiv     = (req.body.mod_aktiv == "NO" ? "N" : "Y");
        var fotolink  = req.body.mod_fotolink || null;
        var fajl      = req.file || null;  // Multer fájl objektum

        // ----------- === KATEGÓRIA KEZELÉS === -----------
        // Ha új kategória nevet adtak meg, létrehozza vagy keresésüt
        var ID_KATEGORIA = null;
        if (uj_kategoria !== "") {
            // Ellenőrzés: már létezik-e ilyen kategória
            var q1 = await runQueries("SELECT ID_KATEGORIA FROM webbolt_kategoriak WHERE KATEGORIA = ?", [uj_kategoria], conn);
            if(q1.message != "ok"){
                throw new Error(q1.message || "Kategória lekérése sikertelen.");
            }
            if (q1.maxcount > 0) {
                // Meglévő kategória ID
                ID_KATEGORIA = q1.rows[0].ID_KATEGORIA;
            } else {
                // Új kategória beszúrása
                var ins = await runExecute("INSERT INTO webbolt_kategoriak (KATEGORIA) VALUES (?)", req, [uj_kategoria], true, conn);
                if(ins.message != "ok"){
                    throw new Error(ins.message || "Új kategória beszúrása sikertelen.");
                }
                ID_KATEGORIA = ins.rows.insertId;
            }
        } else {
            // Meglévő kategória ID-ját vesszük
            ID_KATEGORIA = parseInt(kategoria);
        }

        if (!ID_KATEGORIA) throw new Error("Kategória ID nem állapítható meg.");

        // === UPDATE ÁG (insert=0) ===
        if (insert == 0) {
            if (!termekid) throw new Error("Hiányzó ID_TERMEK az update művelethez.");

            // HA VAN ÚJ KÉP FELTÖLTVE
            if (fajl) {
                // Webes elérési út (NEM tartalmazhatja a 'public' szót)
                const webPath = `/img/uploads/${fajl.filename}`; // Multer-től kapott filename

                // 1. Lekérjük a régi képet, hogy törölni tudjuk (ha már nincs rá szükség)
                var qsel = await runQueries("SELECT IMG FROM webbolt_fotok WHERE ID_TERMEK = ?", [termekid], conn);
                if(qsel.message != "ok"){
                    throw new Error(qsel.message || "Fotó lekérése sikertelen.");
                }

                if (qsel.maxcount > 0) {
                    var regiKepUtvonal = qsel.rows[0].IMG;

                    // Képrekord frissítése az új fájllal
                    let frissites = await runExecute(
                        "UPDATE webbolt_fotok SET FILENAME = ?, IMG = ? WHERE ID_TERMEK = ?",
                        req, [fajl.originalname, webPath, termekid], true, conn
                    );
                    if(frissites.message != "ok"){
                        throw new Error(frissites.message || "Fotó frissítése sikertelen.");
                    }

                    // 2. A RÉGI képfájlt megpróbáljuk törölni (csak ha nem használ másik rendelés)
                    if (regiKepUtvonal) {
                        await kepTorlesHaNincsRendelesben(regiKepUtvonal); // Biztonságos törlés
                    }

                } else {
                    // Ha nincs régi rekord, új sort beszúrunk
                    var beszuras = await runExecute(
                        "INSERT INTO webbolt_fotok (ID_TERMEK, FILENAME, IMG) VALUES (?, ?, ?)",
                        req, [termekid, fajl.originalname, webPath], true, conn
                    );
                    if(beszuras.message != "ok"){
                        throw new Error(beszuras.message || "Fotó beszúrása sikertelen.");
                    }
                }
                fotolink = null; // Töröljük a FOTOLINK-et, ha feltöltöttünk fájlt
            }
            else {
                // Ha nincs új fájl, de a user esetleg módosította a link-et
                var qkep = await runQueries("SELECT FILENAME FROM webbolt_fotok WHERE ID_TERMEK = ?", [termekid], conn);
                if(qkep.message != "ok"){
                    throw new Error(qkep.message || "Fotó lekérése sikertelen.");
                }
                if (qkep.maxcount > 0 && fotolink == qkep.rows[0].FILENAME) {
                    fotolink = null;
                }
            }

            // === TERMÉK ADATAINAK FRISSÍTÉSE ===
            var sql = `UPDATE webbolt_termekek SET ID_KATEGORIA=?, NEV=?, AZON=?, AR=?, MENNYISEG=?, MEEGYS=?, LEIRAS=?, AKTIV=?, FOTOLINK=? WHERE ID_TERMEK=?`;
            let frissites = await runExecute(sql, req, [ID_KATEGORIA, nev, azon, ar, mennyiseg, meegys, leiras, aktiv, fotolink, termekid], true, conn);
            if(frissites.message != "ok"){
                throw new Error(frissites.message || "Termék frissítése sikertelen.");
            }

            await conn.query("COMMIT;");
            return res.json({ message: "ok" });
        }

        // === INSERT ÁG (insert=1) - ÚJ TERMÉK LÉTREHOZÁSA ===
        if (insert == 1) {
            if (fotolink === "") fotolink = null;

            // === ÚJ TERMÉK BESZÚRÁSA ===
            var sql = `INSERT INTO webbolt_termekek (ID_KATEGORIA, NEV, AZON, AR, MENNYISEG, MEEGYS, LEIRAS, AKTIV, FOTOLINK) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;
            var raw = await runExecute(sql, req, [ID_KATEGORIA, nev, azon, ar, mennyiseg, meegys, leiras, aktiv, fotolink], true, conn);
            if(raw.message != "ok"){
                throw new Error(raw.message || "Termék beszúrása sikertelen.");
            }
            // Az új termék ID-je az INSERT utáni LAST_INSERT_ID()
            termekid = raw.rows.insertId;

            // HA VAN KÉP FELTÖLTVE
            if (fajl) { 
                // Webes elérési út előállítása (NEM TARTALMAZHATJA A 'public' szót)
                const webPath = `/img/uploads/${fajl.filename}`; // Multer filename
                
                // Képrekord beszúrása
                let beszuras = await runExecute( 
                    "INSERT INTO webbolt_fotok (ID_TERMEK, FILENAME, IMG) VALUES (?, ?, ?)", 
                    req, [termekid, fajl.originalname, webPath], true, conn
                );
                if(beszuras.message != "ok"){
                    throw new Error(beszuras.message || "Fotó beszúrása sikertelen.");
                }
            }
            await conn.query("COMMIT;");
            return res.json({ message: "ok"});
        }

        throw new Error("Érvénytelen 'insert' paraméter.");

    } catch (err) {
        console.error("/termek_edit HIBA : " + (err && err.message ? err.message : err));
        if (conn) await conn.query("ROLLBACK;");  // Tranzakció visszavonása hiba esetén
        res.json({ 
            message: "Hiba a művelet során." 
        });
    } finally {
        if (conn) conn.release();  // Kapcsolat felszabadítása
    }
});


// === TERMÉK ADATAINAK LEKÉRÉSE ===
// GET: /termek_adatok
// Paraméter: ID_TERMEK (int) - melyik termék adatait kérjük
// Működés: egy konkrét termék összes adatát visszaadja 
// (beleértve: kategória, kép, leírás, stb.)
app.get('/termek_adatok',async (req, res) => {

    // Paraméter
    let termekid = parseInt(req.query.ID_TERMEK);

    // === TERMÉK ADATOK SQL ===
    // CASE: ha van FOTOLINK, azt veszi, ha nincs -> a webbolt_fotok.IMG-et
    // LEFT JOIN: mivel lehet, hogy nincs kép
    let sql = `
        SELECT webbolt_termekek.ID_KATEGORIA, webbolt_termekek.NEV, webbolt_termekek.AZON, webbolt_termekek.DATUMIDO, 
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
});

// === TERMÉK TÖRLÉSE (ADMIN) ===
// DELETE: /termek_del
// Paraméter: ID_TERMEK (int) - törlendő termék
// Működés:
//   1. Lekérdezi a terméket, hogy van-e képe
//   2. Kitörli a terméket az adatbázisból
//   3. Ha volt kép, megpróbálja fizikailag is törölni (csak ha nem használ másik rendelés)
app.delete('/termek_del',async (req, res) => {
    try{
        var termekid = parseInt(req.query.ID_TERMEK);

        // 1. ELŐSZÖR lekérjük a kép elérési útját, mielőtt kitörölnénk a terméket
        var qFoto = await runQueries("SELECT IMG FROM webbolt_fotok WHERE ID_TERMEK = ?", [termekid]);
        if(qFoto.message != "ok"){
            throw new Error(qFoto.message || "Fotó lekérése sikertelen.");
        }
        
        var torlendoKep = null;
        if (qFoto.maxcount > 0 && qFoto.rows[0].IMG) {
            torlendoKep = qFoto.rows[0].IMG;
        }

        // 2. Termék törlése (a kép rekordjait CASCADE törli)
        var sql = `DELETE FROM webbolt_termekek WHERE ID_TERMEK = ?`;
        let ertekek = [termekid];
        const eredmeny = await runExecute(sql, req, ertekek, true);
        if(eredmeny.message != "ok"){
            throw new Error(eredmeny.message || "Termék törlése sikertelen.");
        }

        // 3. Ha volt kép, megpróbáljuk fizikailag is törölni (biztonságos törlés)
        if (torlendoKep) {
            await kepTorlesHaNincsRendelesben(torlendoKep);  // Csak ha nem használ rendelés
        }

        res.json(eredmeny);
        res.end();

    }
    catch (err) {
        console.error("/termek_del HIBA : " + (err && err.message ? err.message : err));
        res.json({
            message: "Hiba a termék törlésekor." 
        });
    }
});


//#endregion

//#region sql lekerdezesek html

// === HTML-BÓL SQL LEKÉRDEZÉSEK (ADMIN PANELHEZ) ===
// GET: /html_sql
// Paraméter: SQL (string) - az admin által begépelt SQL parancs
// Működés:
//   - SELECT: nem kell naplózni, runQueries-t használ
//   - NEM SELECT parancsok: naplózva van, runExecute-t használ
// Biztonsági ellenőrzések:
//   1. DROP TABLE * parancs automatikusan blokkolva
//   2. Nem SELECT SQL parancsok listázása 
//   3. Ha SELECT: runQueries-t futtat (biztonságos olvasás)
//   4. Ha módosító parancs: runExecute-t futtat (naplózva)
app.get('/html_sql', async (req, res) => {
try {
        // Query normalizálása
        if (!req.query || typeof req.query.SQL === 'undefined' || req.query.SQL === null) {
            return;
        }
        const sql = req.query.SQL.toString().trim();

       if (/drop\s+table\s+\*/.test(sql.toLowerCase())) {
        return res.status(500).json({
            message: "Ne nézzük egymást hülyének!",
            error: "A 'DROP TABLE *' parancs nem engedélyezett."
        });
}

        // === NEM SELECT PARANCSOK LISTÁJA ===
        const nem_select_parancsok = [
            "insert", "update", "delete", "drop", "alter", "create", 
            "truncate", "grant", "revoke", "commit", "rollback", "exec", 
            "execute", "union", "transaction"
        ];

        // Ellenőrzés: tartalmaz-e NEM SELECT parancsot
        const nem_select = nem_select_parancsok.some(parancs => sql.toLowerCase().includes(parancs));

        // === SELECT LEKÉRDEZÉSEK ===
        if (!nem_select) {
            let parsed = await runQueries(sql, []);
            if(parsed.message != "ok"){
                throw new Error(parsed.message);
            }

            res.set(header1, header2);
            res.json({ adat: parsed, select: true });
            res.end();
        }
        // === NEM SELECT PARANCSOK ===
        else {
            let parsed = await runExecute(sql, req, [], true);
            if(parsed.message != "ok"){
                throw new Error(parsed.message);
            }

            res.set(header1, header2);
            res.json({ adat: parsed, select: false });
            res.end();
        }

    } 
    catch (err) {
        console.error(`/html_sql: ${session_data.NEV} elrontotta az admin lekérdezést. (${new Date().toISOString()})`);
        res.status(400).json({
            message: "Szörnyű hiba az sql parancs végrehajtásakor.",
            error: err.message
        });
    }   
});



//#endregion

//#region statisztika

// === TOP 5 MEGTETT TERMÉK (STATISZTIKA) ===
// GET: /top5
// Paraméter: INTERVALLUM (string) - időtartam szűrése: '1'=1 hó, '3'=3 hó, egyéb=teljes
// Működés: az adott időszakban a legjobban fogyó termékek (darab és bevétel szerint)
// Visszatér: TOP 5 termék (kép, név, darabszám, bevétel)
app.get('/top5', (req, res) => {

    const ido = (req.query.INTERVALLUM || '').toString();
    let idofeltetel = '';
    
    switch (ido) {
        case "1":
            idofeltetel = 'AND r.DATUM > NOW() - INTERVAL 1 MONTH';
            break;
        case "3":
            idofeltetel = 'AND r.DATUM > NOW() - INTERVAL 3 MONTH';
            break;
        default:
            idofeltetel = '';
            break;
    }

    const sql = `
        SELECT 
            SUM(t.MENNYISEG) AS DB,
            SUM(t.MENNYISEG * wt.AR) AS BEVETEL,
            wt.NEV,
            COALESCE(wt.FOTOLINK, wf.IMG) AS FOTOLINK
        FROM webbolt_rendeles_tetelei t
        INNER JOIN webbolt_rendeles r 
            ON r.ID_RENDELES = t.ID_RENDELES
        INNER JOIN webbolt_termekek wt 
            ON wt.ID_TERMEK = t.ID_TERMEK
        LEFT JOIN (
            SELECT ID_TERMEK, MIN(IMG) AS IMG
            FROM webbolt_fotok
            GROUP BY ID_TERMEK
        ) wf ON wf.ID_TERMEK = wt.ID_TERMEK
        WHERE t.ID_TERMEK IS NOT NULL
        ${idofeltetel}
        GROUP BY wt.ID_TERMEK, wt.NEV, wt.FOTOLINK, wf.IMG
        ORDER BY DB DESC, BEVETEL DESC
        LIMIT 5;
    `;

    sendJson_toFrontend(res, sql, []);
});

// === BEVÉTEL STATISZTIKA ===
// GET: /bevetel_stat
// Paraméter: INTERVALLUM (int) - 1=1 hó (napi felbontás), 6=6 hó (havi), 12=12 hó (havi), alapértelmezett=12 hó
// Működés:
//   - 1 hó: napok szerinti felbontás (WITH RECURSIVE napok)
//   - egyéb: hónapok szerinti felbontás (WITH RECURSIVE honapok)
// Visszatér: időpontok és a hozzájuk tartozó bevételek
app.get('/bevetel_stat',(req, res) => {

    var ido = req.query.INTERVALLUM ? parseInt(req.query.INTERVALLUM) : 12; // alapértelmezett 12 hó
    var sql = "";

    // Időtartam szerinti SQL logic
    switch(ido){
        case 1: 
            // === 1 HÓNAP NAPI FELBONTÁSBAN ===
            // WITH RECURSIVE napok: generálja az összes napot az utolsó hónapban
            // LEFT JOIN: az olyan napok is megjelennek, ahol nincs rendelés (COALESCE -> 0)
            sql = `
                WITH RECURSIVE napok AS (
                    SELECT DATE(CONVERT_TZ(NOW() - INTERVAL ? MONTH, '+00:00','${idozona()}')) AS IDO
                    UNION ALL
                    SELECT DATE(IDO + INTERVAL 1 DAY)
                    FROM napok
                    WHERE IDO + INTERVAL 1 DAY <= DATE(CONVERT_TZ(NOW(), '+00:00','${idozona()}'))
                )
                SELECT 
                    n.IDO,
                    COALESCE(SUM(t.AR * t.MENNYISEG), 0) AS BEVETEL
                FROM napok n
                LEFT JOIN webbolt_rendeles r 
                    ON DATE(CONVERT_TZ(r.DATUM, '+00:00','${idozona()}')) = n.IDO
                LEFT JOIN webbolt_rendeles_tetelei t 
                    ON t.ID_RENDELES = r.ID_RENDELES
                GROUP BY n.IDO
                ORDER BY n.IDO;
            `;
            break;

        default : 
            // === TÖBB HÓNAP HAVI FELBONTÁSBAN ===
            // WITH RECURSIVE honapok: generálja az összes hónapot az utolsó X hónapban
            sql = `
                WITH RECURSIVE honapok AS (
                    SELECT DATE_FORMAT(CONVERT_TZ(DATE_SUB(CURDATE(), INTERVAL ? MONTH), '+00:00','${idozona()}'), '%Y-%m-01') AS IDO
                    UNION ALL
                    SELECT DATE_FORMAT(DATE_ADD(IDO, INTERVAL 1 MONTH), '%Y-%m-01')
                    FROM honapok
                    WHERE IDO < DATE_FORMAT(CONVERT_TZ(CURDATE(), '+00:00','${idozona()}'), '%Y-%m-01')
                )
                SELECT 
                    h.IDO,
                    COALESCE(SUM(t.AR * t.MENNYISEG), 0) AS BEVETEL
                FROM honapok h
                LEFT JOIN webbolt_rendeles r 
                    ON DATE_FORMAT(CONVERT_TZ(r.DATUM, '+00:00','${idozona()}'), '%Y-%m') = DATE_FORMAT(h.IDO, '%Y-%m')
                LEFT JOIN webbolt_rendeles_tetelei t 
                    ON t.ID_RENDELES = r.ID_RENDELES
                GROUP BY h.IDO
                ORDER BY h.IDO;
            `;
            break;
    };

    sendJson_toFrontend(res, sql, [ido == 1 ? 1 : ido-1]);
});

// === RENDELÉSEK DARABSZÁMA STATISZTIKA ===
// GET: /rendelesek_stat
// Paraméter: INTERVALLUM (int) - 1=1 hó (napi), 6=6 hó (havi), 12=12 hó (havi), alapértelmezett=12 hó
// Működés: az adott időszakban a rendelések számát mutatja (napok vagy hónapok szerinti felbontás)
// Visszatér: időpontok és hozzájuk tartozó rendelésszám
app.get('/rendelesek_stat', (req, res) => {

    const ido = req.query.INTERVALLUM ? parseInt(req.query.INTERVALLUM) : 12;
    let sql = null;

    switch(ido){

        case 1:
            // === 1 HÓNAP NAPI FELBONTÁSBAN ===
            sql = `
                WITH RECURSIVE napok AS (
                    SELECT DATE(CONVERT_TZ(NOW() - INTERVAL ? MONTH, '+00:00','${idozona()}')) AS IDO
                    UNION ALL
                    SELECT DATE(IDO + INTERVAL 1 DAY)
                    FROM napok
                    WHERE IDO + INTERVAL 1 DAY <= DATE(CONVERT_TZ(NOW(), '+00:00','${idozona()}'))
                )
                SELECT 
                    n.IDO,
                    COUNT(r.ID_RENDELES) AS DARAB
                FROM napok n
                LEFT JOIN webbolt_rendeles r
                    ON DATE(CONVERT_TZ(r.DATUM, '+00:00','${idozona()}')) = n.IDO
                GROUP BY n.IDO
                ORDER BY n.IDO;
            `;
            break;

        default:
            // === TÖBB HÓNAP HAVI FELBONTÁSBAN ===
            sql = `
                WITH RECURSIVE honapok AS (
                    SELECT DATE_FORMAT(CONVERT_TZ(DATE_SUB(CURDATE(), INTERVAL ? MONTH), '+00:00','${idozona()}'), '%Y-%m-01') AS IDO
                    UNION ALL
                    SELECT DATE_FORMAT(DATE_ADD(IDO, INTERVAL 1 MONTH), '%Y-%m-01')
                    FROM honapok
                    WHERE IDO < DATE_FORMAT(CONVERT_TZ(CURDATE(), '+00:00','${idozona()}'), '%Y-%m-01')
                )
                SELECT 
                    h.IDO,
                    COUNT(r.ID_RENDELES) AS DARAB
                FROM honapok h
                LEFT JOIN webbolt_rendeles r
                    ON DATE_FORMAT(CONVERT_TZ(r.DATUM, '+00:00','${idozona()}'), '%Y-%m') = DATE_FORMAT(h.IDO, '%Y-%m')
                GROUP BY h.IDO
                ORDER BY h.IDO;
            `;
            break;
    };

    sendJson_toFrontend(res, sql, [ido == 1 ? 1 : ido-1]);
});

// === KATEGÓRIA STATISZTIKA (TOP 5) ===
// GET: /kategoriak_stat
// Paraméter: INTERVALLUM (int) - utolsó X hónap (alapértelmezett: 12)
// Működés:
//   1. TOP 5 kategória keresése darabszám és bevétel alapján
//   2. Az ötödik után összesítés "Egyéb" kategóriába
// Visszatér: kategória nevek és darabszámok
app.get('/kategoriak_stat', (req, res) => {

    const ido = req.query.INTERVALLUM ? parseInt(req.query.INTERVALLUM) : 12;

    // === SQL: TOP 5 KATEGÓRIA VAGY EGYÉB ===
    // WITH RECURSIVE-ot használ az összes kategória generálásához
    // UNION: TOP 5 + egyéb kategóriák összesítése
    const sql = `
        WITH alap AS (
        SELECT 
            KATEGORIA,
            SUM(MENNYISEG) AS DARAB,
            SUM(MENNYISEG * AR) AS BEVETEL
        FROM webbolt_rendeles_tetelei t
        JOIN webbolt_rendeles r ON r.ID_RENDELES = t.ID_RENDELES
        WHERE CONVERT_TZ(r.DATUM, '+00:00','${idozona()}')
            >= CONVERT_TZ(NOW() - INTERVAL ${ido} MONTH, '+00:00','${idozona()}')
        GROUP BY KATEGORIA
        ),

        top5 AS (
            SELECT *
            FROM alap
            ORDER BY DARAB DESC, BEVETEL DESC
            LIMIT 5
        ),

        egyeb AS (
            SELECT 
                SUM(DARAB) AS DARAB,
                COUNT(*) AS KAT_DB
            FROM alap
            WHERE KATEGORIA NOT IN (SELECT KATEGORIA FROM top5)
        )

        SELECT KATEGORIA, DARAB
        FROM top5

        UNION ALL

        SELECT CONCAT('Egyéb (', KAT_DB, ' kategória)'), DARAB
        FROM egyeb
        WHERE KAT_DB > 0

        ORDER BY DARAB DESC;

    `;

    sendJson_toFrontend(res, sql, []);
});

// === VÉLEMÉNYEK STATISZTIKA ===
// GET: /velemeny_stat
// Paraméter: INTERVALLUM (int) - 1=1 hó, 6=6 hó, 12=12 hó, egyéb=teljes idősáv
// Működés: vélemények szűrése allapot szerint (Jóváhagyva, Jóváhagyásra vár, Elutasítva)
// Visszatér: allapot és darabszám
app.get('/velemeny_stat', (req, res) => {

    const ido = req.query.INTERVALLUM ? parseInt(req.query.INTERVALLUM) : 12;

    // === IDŐSZAK SZŰRÉSE ===
    var idocucc = "";
    switch(ido){
        case 1: idocucc = `WHERE CONVERT_TZ(webbolt_velemenyek.DATUM, '+00:00','${idozona()}')
            >= CONVERT_TZ(NOW() - INTERVAL 1 MONTH, '+00:00','${idozona()}')`; break;
        case 6: idocucc = `WHERE CONVERT_TZ(webbolt_velemenyek.DATUM, '+00:00','${idozona()}')
            >= CONVERT_TZ(NOW() - INTERVAL 6 MONTH, '+00:00','${idozona()}')`; break;
        default: idocucc = ``; break; // teljes idősáv
    }

    // === SQL: VÉLEMÉNYEK ALLAPOT SZERINTI CSOPORTOSÍTÁSA ===
    const sql = `
        SELECT webbolt_velemenyek.ALLAPOT, COUNT(*) AS DARAB
        FROM webbolt_velemenyek
        ${idocucc}
        GROUP BY webbolt_velemenyek.ALLAPOT
        ORDER BY DARAB DESC
    `;

    sendJson_toFrontend(res, sql, []);
});

//#endregion

//#region függvények

// === SZERVER FÜGGVÉNYEK ===

// === runExecute() - MODIFY PARANCSOKHOZ (INSERT/UPDATE/DELETE) ===
// Paraméterek:
//  - sql: (string) SQL parancs (lehet több is ha multipleStatements: true)
//  - req: Express request (session-hez, naplózáshoz)
//  - ertekek: (array) paraméterek (biztonságos helyőrzőkkel "?")
//  - naplozas: (bool) ha true, akkor naplózza az SQL-t a napló táblába
//  - connection: (optional) meglévő DB kapcsolat (tranzakció esetén)
// Visszatérés: JSON {message: "ok" vagy SQL hiba, rows: eredmény vagy changedRows}
// Működés:
//   1. Meglévő vagy új kapcsolatot kér a pool-ból
//   2. Futtatja a paraméterezett SQL-t (biztonságos)
//   3. Ha naplozas=true és volt hatás (affectedRows > 0), beírja a napló táblába
//   4. Tranzakciós módban NEM szabadítja fel a kapcsolatot
//   5. JSON-ként visszaadja az eredményt
async function runExecute(sql, req, ertekek = [], naplozas, connection) {
    session_data = req.session;
    
    // Session ellenőrzés
    if (!req.session || !req.session.ID_USER) {
        return res.json({ 
            message: "session expired",
            rows: []
        });
    }
    
    var msg = "ok";
    var json_data, res1, jrn;
    
    let conn;  // Kapcsolat deklarációja
    try {
        // Meglévő kapcsolatot vagy új összet használunk
        conn = connection ? connection : await pool.getConnection(); 
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
        // Csak nem tranzakciós módban szabadítjuk fel
        if (!connection && conn) conn.release();  // Adatbázis kapcsolat felszabadítása
        json_data = JSON.parse(JSON.stringify({"message": msg, "rows": res1}));
    }
    return json_data;
}


// === runQueries() - SELECT LEKÉRDEZÉSEKHEZ ===
// Paraméterek:
//  - sql: (string) SELECT lekérdezés (lehet LIMIT/OFFSET)
//  - ertekek: (array) paraméterek (biztonságos helyőrzőkkel)
//  - connection: (optional) meglévő DB kapcsolat (tranzakció esetén)
// Visszatérés: JSON {message: "ok" vagy hiba, maxcount: rekordszám, rows: tömb}
// Működés:
//   1. Előbb COUNT-olja a lekérdezés eredményeit (lapozás és UI validáláshoz)
//   2. Ha maxcount > 0, futtatja a fő lekérdezést (ORDER BY-val)
//   3. Visszaadja: {message: ok/hiba, maxcount: sor db, rows: adatok}
// Biztonsági megjegyzés:
//   - Ha van LIMIT az SQL-ban, az utolsó paraméter az offset
//   - COUNT lekérdezéshez az offset paramétert el kell hagyni (slice -1)
async function runQueries(sql, ertekek = [], connection) {
    var maxcount = 0;
    var msg = "ok";
    
    // Az ORDER BY pozíciót megkeresi (ha van), mert azzal nem tudjuk COUNT-olni
    // ORDER BY után nem lehetnek WHERE-típusú feltételek
    var poz = sql.toUpperCase().lastIndexOf("ORDER BY ");  
    poz == -1 ? poz = sql.length : poz;  // Ha nincs ORDER BY, az egész SQL-t számolja
    
    var json_data, res1, res2 = [];

    let conn;
    try {
        conn = connection ? connection : await pool.getConnection(); 
        
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
        if (!connection && conn) conn.release();  // Csak nem tranzakciós módban
        json_data = JSON.parse(JSON.stringify({ "message": msg, "maxcount": maxcount, "rows": res2 }));
    }
    
    return json_data;
}

// === sendJson_toFrontend() - WRAPPER FÜGGVÉNY LEKÉRDEZÉSEKHEZ ===
// Paraméterek:
//  - res: (Express response) HTTP válaszobjektum
//  - sql: (string) SELECT lekérdezés
//  - ertekek: (array) SQL paraméterek (biztonságos helyőrzőkkel)
// Működés:
//   1. runQueries() meghívása a lekérdezés futtatásához
//   2. HTTP Response header beállítása (Content-Type: application/json; charset=UTF-8)
//   3. JSON formátumban küldés a frontendre
// Visszatérés: nincs (res.json() küldi az adatokat közvetlenül)
async function sendJson_toFrontend (res, sql, ertekek = []) {
    var json_data = await runQueries(sql, ertekek);  // Lekérdezés futtatása
    res.set(header1, header2);  // Content-Type header beállítása
    res.json(json_data);  // JSON küldés: {message, maxcount, rows}
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
// Paraméterek:
//  - sql: (string) paraméteres SQL query (? helyőrzőkkel)
//  - ertekek: (array) helyőrzők helyére behelyettesítendő értékek
// Működés:
//   1. Az összes "?" helyőrzőt végigmegy regex replace-vel
//   2. Minden helyőrző helyére az ertekek[i] elemeket behelyettesíti
//   3. NULL, szám, boolean = idézőjel nélkül (pl. NULL, 123, true)
//   4. String = idézőjelbe rakva, belső ' karakterek escapelve (MySQL: ' -> '')
//   5. Ha kevés paraméter: <<HIÁNYZÓ ÉRTÉK>> (debug segítség)
// Biztonsági megjegyzés:
//   - Ez CSAK naplózásra! Az aktív SQL futtatás mindig paraméteres marad
// Visszatér: olvasható SQL string (naplózáshoz)
// Példa: osszeallitottSqlNaplozasra("SELECT * FROM User WHERE id=? AND name=?", [1, "John"])
//        -> "SELECT * FROM User WHERE id=1 AND name='John'"
function osszeallitottSqlNaplozasra(sql, ertekek) {
    let i = 0;
    
    // Helyőrzők (?) cseréje valós értékekre
    const finalSql = sql.replace(/\?/g, () => {
        // Hiba: elfogyott a paraméter
        if (i >= ertekek.length) {
            return '<<HIÁNYZÓ ÉRTÉK>>';
        }
        
        let ertek = ertekek[i++];
        
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

// === KÉPFÁJL TÖRLÉS - BIZTONSÁGOS, HA NINCS RENDELÉSBEN ===
// Paraméterek:
//  - img: (string) képfájl webPath-ja (pl. "/img/uploads/abc123.jpg")
// Működés:
//   1. Lekérdezi: szerepel-e a webbolt_rendeles_tetelei.FOTOLINK-ben?
//   2. Ha NINCS rendelésben: fizikai fájl törlése fs.unlink-val
//   3. Ha VAN rendelésben: fájl NEM törlődik
// Biztonsági megjegyzések:
//   - Megakadályozza az árva fájlok képződését (orphaned files)
//   - Megvéd az olyan helyzettől, hogy egy aktív rendelés elveszítse a képét
//   - fs.existsSync ellenőrzi a fájl létezését (nem hibázhat a delete)
//   - Async fs.unlink nem blokkolja a futást
// Megjegyzés: csak /img/uploads/ mappában működik
async function kepTorlesHaNincsRendelesben(img) {
    if (!img || img === "") return;  // Üres vagy null kép, nincs mit törölni

    try {
        // === LÉPÉS 1: ELLENŐRZÉS - SZEREPEL-E RENDELÉSBEN? ===
        // A webbolt_rendeles_tetelei tábla tárolta minden megrendelés képét
        var sql = `SELECT COUNT(*) as db FROM webbolt_rendeles_tetelei WHERE FOTOLINK = ?`;
        var result = await runQueries(sql, [img]);
        
        // Hiba esetén kilépünk
        if(result.message != "ok"){
            throw new Error("Adatbázis hiba a képellenőrzéskor");
        }
        
        var benneVanRendelesben = false;
        if (result.maxcount > 0 && result.rows[0].db > 0) {
            benneVanRendelesben = true;
        }

        // === LÉPÉS 2: TÖRLÉS - HA NINCS RENDELÉSBEN ===
        if (!benneVanRendelesben) {
            // webPath pl: "/img/uploads/123.jpg" -> filename: "123.jpg"
            const filename = path.basename(img);  // path.basename elválasztja a fájlnevet az útvonalon
            // Fizikai útvonal: '.../public/img/uploads/123.jpg'
            const fullPath = path.join(__dirname, 'public', 'img', 'uploads', filename); 

            // === BIZTONSÁGI LÉPÉS: FILE LÉTEZIK-E? ===
            if (fs.existsSync(fullPath)) {
                // Async unlink: nem blokkolja a szerver futását
                fs.unlink(fullPath, (err) => {
                    if (err) console.error("Hiba a fájl törlésekor:", err);
                });
            }
        }

    } catch (err) {
        console.error("Hiba a kepTorlesHaNincsRendelesben függvényben:", err);
    }
}


//#endregion

//#region email_kuldes

// === EMAIL KÜLDÉS ===
// Az email-sender.js modul: SMTP e-mail küldés hitelesítéssel
// Felhasználat: const { sendEmail } = require('./email-sender');
const { sendEmail } = require('./email-sender');

// === EMAIL KÜLDÉS ENDPOINT ===
// HTTP METHOD: POST /send-email
// Paraméterek (req.body - JSON):
//  - email: (string) fogadó email cím (pl. "user@example.com")
//  - subject: (string) email tárgya (pl. "Rendelés megerősítés")
//  - html: (string) email HTML tartalma (formázott szöveg, táblázatok stb.)
// Működés:
//   1. Paraméterek kinyerése req.body-ból
//   2. sendEmail() hívása az email-sender modulból (SMTP kapcsolat)
//   3. Sikeres: {message: "sikeresen elküldve"} JSON
//   4. Hiba: {message: "Email hiba"} JSON
// Megjegyzés: SMTP konfigurációt az email-sender.js tartalmazza (felhasználónév, jelszó, SMTP szerver)
app.post('/send-email', async (req, res) => {
    try {
        const { email, subject, html } = req.body;  // JSON paraméterek kinyerése
        console.log(`Email elküldése: ${email}, tárgy: ${subject}`);
        await sendEmail(email, subject, html);  // Email küldés SMTP-n keresztül
        console.log(`Email elküldve: ${email}, tárgy: ${subject}`);

        res.json({ message: 'Email sikeresen elküldve' });
    } catch (err) {
        console.error('/send-email hiba:', err);
        res.json({ message: 'Email hiba'});
    }
});

//#endregion

// === SZERVER INDÍTÁSA ===
// Az Express szerver elkezd hallgatni a megadott porton
app.listen(port, function () { 
    console.log(`megy a szero http://localhost:${port}`); 
});