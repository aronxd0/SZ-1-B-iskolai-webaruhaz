// ====== KÖNYVTÁRAK ======
const express = require('express');
const session = require('express-session');
const mysql = require('mysql2/promise');
const multer = require('multer');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const app = express();
const port = 9012;

// ====== MIDDLEWARE ======
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// ====== SESSION ======
const serverBoot = Date.now();
app.use(session({
    key: 'user_sid',
    secret: Date.now().toString(),
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 2700000 } // 45 perc
}));

// ====== DATABASE POOL ======
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    port: process.env.DB_PORT,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    multipleStatements: true,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// ====== MULTER SETUP (Képfeltöltés) ======
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'public/img/uploads/'),
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + crypto.randomBytes(6).toString('hex');
        const fileExtension = path.extname(file.originalname);
        cb(null, uniqueSuffix + fileExtension);
    }
});

const fileFilter = (req, file, cb) => {
    const allowed = ["image/jpeg", "image/png", "image/webp"];
    allowed.includes(file.mimetype) 
        ? cb(null, true) 
        : cb(new Error("Csak képfájl tölthető fel!"), false);
};

const upload = multer({
    storage,
    limits: { fileSize: 25 * 1024 * 1024 },
    fileFilter
});

// ====== MIDDLEWARE: AUTENTIKÁCIÓ ELLENŐRZÉS ======
const requireAuth = (req, res, next) => {
    if (!req.session.ID_USER) {
        return res.status(401).json({ 
            message: "Unauthorized", 
            error: "Bejelentkezés szükséges" 
        });
    }
    next();
};

// ====== MIDDLEWARE: ADMIN JOGOSULTSÁG ======
const requireAdmin = (req, res, next) => {
    if (!req.session.ID_USER) {
        return res.status(401).json({ message: "Unauthorized" });
    }
    if (req.session.ADMIN !== "Y" && req.session.WEBBOLT_ADMIN !== "Y") {
        return res.status(403).json({ message: "Forbidden", error: "Admin jogosultság szükséges" });
    }
    next();
};

// ====== HELPER FUNCTIONS ======
const runQuery = async (sql, params = []) => {
    let conn;
    try {
        conn = await pool.getConnection();
        const [rows] = await conn.execute(sql, params);
        return { success: true, data: rows };
    } catch (error) {
        console.error("Query error:", error);
        return { success: false, error: error.message };
    } finally {
        if (conn) conn.release();
    }
};

const runTransaction = async (queries) => {
    let conn;
    try {
        conn = await pool.getConnection();
        await conn.beginTransaction();
        
        for (const { sql, params } of queries) {
            await conn.execute(sql, params);
        }
        
        await conn.commit();
        return { success: true };
    } catch (error) {
        if (conn) await conn.rollback();
        console.error("Transaction error:", error);
        return { success: false, error: error.message };
    } finally {
        if (conn) conn.release();
    }
};

// ====== ROUTES: AUTH ======
// POST /api/auth/login - Bejelentkezés
app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;
    
    const sql = `SELECT ID_USER, NEV, EMAIL, ADMIN, WEBBOLT_ADMIN, CSOPORT 
                 FROM users WHERE EMAIL=? AND PASSWORD=md5(?)`;
    const result = await runQuery(sql, [email, password]);
    
    if (!result.success) {
        return res.status(500).json({ message: "Adatbázis hiba" });
    }
    
    if (result.data.length === 1) {
        const user = result.data[0];
        req.session.ID_USER = user.ID_USER;
        req.session.EMAIL = user.EMAIL;
        req.session.NEV = user.NEV;
        req.session.ADMIN = user.ADMIN;
        req.session.WEBBOLT_ADMIN = user.WEBBOLT_ADMIN;
        req.session.CSOPORT = user.CSOPORT;
        
        return res.json({ 
            message: "ok", 
            user: {
                id: user.ID_USER,
                name: user.NEV,
                email: user.EMAIL,
                admin: user.ADMIN === "Y",
                webAdmin: user.WEBBOLT_ADMIN === "Y",
                group: user.CSOPORT
            }
        });
    }
    
    res.status(401).json({ message: "Hibás felhasználónév vagy jelszó" });
});

// POST /api/auth/logout - Kijelentkezés
app.post('/api/auth/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({ message: 'Session destroy failed' });
        }
        res.json({ message: 'ok' });
    });
});

// GET /api/auth/session - Session ellenőrzés
app.get('/api/auth/session', (req, res) => {
    res.json({
        active: !!req.session.ID_USER,
        serverBoot,
        user: req.session.ID_USER ? {
            id: req.session.ID_USER,
            name: req.session.NEV,
            email: req.session.EMAIL
        } : null
    });
});

// GET /api/auth/admin-check - Admin jogosultság ellenőrzés
app.get('/api/auth/admin-check', (req, res) => {
    res.json({
        admin: req.session.ADMIN === "Y",
        webadmin: req.session.WEBBOLT_ADMIN === "Y"
    });
});

// ====== ROUTES: PRODUCTS ======
// GET /api/products - Termékek listázása (szűrés, rendezés, lapozás)
app.get('/api/products', async (req, res) => {
    const { 
        search, 
        category, 
        minPrice, 
        maxPrice, 
        inStock, 
        active,
        sortBy = 'id',
        sortOrder = 'asc',
        page = 1,
        limit = 52
    } = req.query;
    
    let whereClauses = [];
    let params = [];
    
    // Szűrések
    if (search) {
        whereClauses.push('(t.NEV LIKE ? OR t.LEIRAS LIKE ? OR t.AZON LIKE ?)');
        params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }
    
    if (category) {
        const categories = category.split(',').map(id => parseInt(id));
        whereClauses.push(`t.ID_KATEGORIA IN (${categories.map(() => '?').join(',')})`);
        params.push(...categories);
    }
    
    if (minPrice) {
        whereClauses.push('t.AR >= ?');
        params.push(parseInt(minPrice));
    }
    
    if (maxPrice) {
        whereClauses.push('t.AR <= ?');
        params.push(parseInt(maxPrice));
    }
    
    if (inStock === 'true') {
        whereClauses.push('t.MENNYISEG > 0');
    }
    
    if (active === 'true') {
        whereClauses.push("t.AKTIV = 'Y'");
    }
    
    const whereClause = whereClauses.length > 0 
        ? `WHERE ${whereClauses.join(' AND ')}` 
        : '';
    
    // Rendezés
    const orderMap = {
        'id': 't.ID_TERMEK',
        'name': 't.NEV',
        'price': 't.AR',
        'stock': 't.MENNYISEG'
    };
    const orderColumn = orderMap[sortBy] || 't.ID_TERMEK';
    const order = sortOrder.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
    
    // Lapozás
    const offset = (parseInt(page) - 1) * parseInt(limit);
    
    const sql = `
        SELECT 
            t.ID_TERMEK, t.ID_KATEGORIA, t.NEV, t.AZON, t.AR, 
            t.MENNYISEG, t.MEEGYS, t.AKTIV, t.TERMEKLINK,
            CASE WHEN t.FOTOLINK IS NOT NULL THEN t.FOTOLINK ELSE f.IMG END AS FOTOLINK,
            t.LEIRAS, k.KATEGORIA
        FROM webbolt_termekek t
        INNER JOIN webbolt_kategoriak k ON t.ID_KATEGORIA = k.ID_KATEGORIA
        LEFT JOIN webbolt_fotok f ON t.ID_TERMEK = f.ID_TERMEK
        ${whereClause}
        ORDER BY ${orderColumn} ${order}
        LIMIT ? OFFSET ?
    `;
    
    params.push(parseInt(limit), offset);
    const result = await runQuery(sql, params);
    
    if (!result.success) {
        return res.status(500).json({ message: "Hiba a lekérdezés során" });
    }
    
    // Összesített termékszám lekérdezése
    const countSql = `
        SELECT COUNT(*) as total
        FROM webbolt_termekek t
        ${whereClause}
    `;
    const countResult = await runQuery(countSql, params.slice(0, -2));
    const total = countResult.success ? countResult.data[0].total : 0;
    
    res.json({
        message: "ok",
        data: result.data,
        pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            pages: Math.ceil(total / parseInt(limit))
        }
    });
});

// GET /api/products/:id - Egy termék részletei
app.get('/api/products/:id', async (req, res) => {
    const { id } = req.params;
    
    const sql = `
        SELECT 
            t.ID_KATEGORIA, t.NEV, t.AZON, t.DATUMIDO, t.AR, t.MENNYISEG,
            CASE WHEN t.FOTOLINK IS NOT NULL THEN t.FOTOLINK ELSE f.IMG END AS FOTOLINK,
            CASE WHEN t.FOTOLINK IS NOT NULL THEN t.FOTOLINK ELSE f.FILENAME END AS FOTONEV,
            t.MEEGYS, t.LEIRAS, t.AKTIV, k.KATEGORIA
        FROM webbolt_termekek t
        INNER JOIN webbolt_kategoriak k ON t.ID_KATEGORIA = k.ID_KATEGORIA
        LEFT JOIN webbolt_fotok f ON t.ID_TERMEK = f.ID_TERMEK
        WHERE t.ID_TERMEK = ?
    `;
    
    const result = await runQuery(sql, [parseInt(id)]);
    
    if (!result.success) {
        return res.status(500).json({ message: "Hiba a lekérdezés során" });
    }
    
    if (result.data.length === 0) {
        return res.status(404).json({ message: "Termék nem található" });
    }
    
    res.json({ message: "ok", data: result.data[0] });
});

// POST /api/products - Új termék létrehozása (ADMIN)
app.post('/api/products', requireAdmin, upload.single("photo"), async (req, res) => {
    const { 
        categoryId, 
        newCategory, 
        name, 
        code, 
        price, 
        stock, 
        unit, 
        description, 
        active,
        photoLink 
    } = req.body;
    
    let finalCategoryId = categoryId;
    
    // Új kategória létrehozása, ha kell
    if (newCategory && newCategory.trim() !== "") {
        const checkCat = await runQuery(
            "SELECT ID_KATEGORIA FROM webbolt_kategoriak WHERE KATEGORIA = ?", 
            [newCategory]
        );
        
        if (checkCat.data.length > 0) {
            finalCategoryId = checkCat.data[0].ID_KATEGORIA;
        } else {
            const insertCat = await runQuery(
                "INSERT INTO webbolt_kategoriak (KATEGORIA) VALUES (?)", 
                [newCategory]
            );
            finalCategoryId = insertCat.data.insertId;
        }
    }
    
    const aktivValue = active === "YES" ? "Y" : "N";
    let fotoPath = photoLink || null;
    
    // Termék beszúrása
    const insertProduct = await runQuery(
        `INSERT INTO webbolt_termekek 
         (ID_KATEGORIA, NEV, AZON, AR, MENNYISEG, MEEGYS, LEIRAS, AKTIV, FOTOLINK) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [finalCategoryId, name, code, price, stock, unit, description, aktivValue, fotoPath]
    );
    
    if (!insertProduct.success) {
        return res.status(500).json({ message: "Hiba a termék létrehozásakor" });
    }
    
    const productId = insertProduct.data.insertId;
    
    // Kép feltöltése (ha van)
    if (req.file) {
        const webPath = `/img/uploads/${req.file.filename}`;
        await runQuery(
            "INSERT INTO webbolt_fotok (ID_TERMEK, FILENAME, IMG) VALUES (?, ?, ?)",
            [productId, req.file.originalname, webPath]
        );
    }
    
    res.status(201).json({ 
        message: "ok", 
        productId 
    });
});

// PUT /api/products/:id - Termék módosítása (ADMIN)
app.put('/api/products/:id', requireAdmin, upload.single("photo"), async (req, res) => {
    const { id } = req.params;
    const { 
        categoryId, 
        newCategory, 
        name, 
        code, 
        price, 
        stock, 
        unit, 
        description, 
        active,
        photoLink 
    } = req.body;
    
    let finalCategoryId = categoryId;
    
    // Kategória kezelés
    if (newCategory && newCategory.trim() !== "") {
        const checkCat = await runQuery(
            "SELECT ID_KATEGORIA FROM webbolt_kategoriak WHERE KATEGORIA = ?", 
            [newCategory]
        );
        
        if (checkCat.data.length > 0) {
            finalCategoryId = checkCat.data[0].ID_KATEGORIA;
        } else {
            const insertCat = await runQuery(
                "INSERT INTO webbolt_kategoriak (KATEGORIA) VALUES (?)", 
                [newCategory]
            );
            finalCategoryId = insertCat.data.insertId;
        }
    }
    
    const aktivValue = active === "YES" ? "Y" : "N";
    let fotoPath = photoLink || null;
    
    // Kép frissítése (ha van új)
    if (req.file) {
        const webPath = `/img/uploads/${req.file.filename}`;
        
        // Régi kép lekérése
        const oldPhoto = await runQuery(
            "SELECT IMG FROM webbolt_fotok WHERE ID_TERMEK = ?", 
            [id]
        );
        
        if (oldPhoto.data.length > 0) {
            await runQuery(
                "UPDATE webbolt_fotok SET FILENAME = ?, IMG = ? WHERE ID_TERMEK = ?",
                [req.file.originalname, webPath, id]
            );
            
            // Régi kép törlése (ha biztonságos)
            if (oldPhoto.data[0].IMG) {
                await deletePhotoIfSafe(oldPhoto.data[0].IMG);
            }
        } else {
            await runQuery(
                "INSERT INTO webbolt_fotok (ID_TERMEK, FILENAME, IMG) VALUES (?, ?, ?)",
                [id, req.file.originalname, webPath]
            );
        }
        
        fotoPath = null; // Ha feltöltött fájlt használunk
    }
    
    // Termék frissítése
    const updateResult = await runQuery(
        `UPDATE webbolt_termekek 
         SET ID_KATEGORIA=?, NEV=?, AZON=?, AR=?, MENNYISEG=?, 
             MEEGYS=?, LEIRAS=?, AKTIV=?, FOTOLINK=? 
         WHERE ID_TERMEK=?`,
        [finalCategoryId, name, code, price, stock, unit, description, aktivValue, fotoPath, id]
    );
    
    if (!updateResult.success) {
        return res.status(500).json({ message: "Hiba a termék módosításakor" });
    }
    
    res.json({ message: "ok" });
});

// DELETE /api/products/:id - Termék törlése (ADMIN)
app.delete('/api/products/:id', requireAdmin, async (req, res) => {
    const { id } = req.params;
    
    // Kép lekérése törlés előtt
    const photoQuery = await runQuery(
        "SELECT IMG FROM webbolt_fotok WHERE ID_TERMEK = ?", 
        [id]
    );
    
    const photoPath = photoQuery.data.length > 0 ? photoQuery.data[0].IMG : null;
    
    // Termék törlése
    const deleteResult = await runQuery(
        "DELETE FROM webbolt_termekek WHERE ID_TERMEK = ?", 
        [id]
    );
    
    if (!deleteResult.success) {
        return res.status(500).json({ message: "Hiba a termék törlésekor" });
    }
    
    // Kép törlése (ha biztonságos)
    if (photoPath) {
        await deletePhotoIfSafe(photoPath);
    }
    
    res.json({ message: "ok" });
});

// Biztonságos képtörlés helper
const deletePhotoIfSafe = async (imagePath) => {
    try {
        const checkOrder = await runQuery(
            "SELECT COUNT(*) as count FROM webbolt_rendeles_tetelei WHERE FOTOLINK = ?",
            [imagePath]
        );
        
        if (checkOrder.data[0].count === 0) {
            const filename = path.basename(imagePath);
            const fullPath = path.join(__dirname, 'public', 'img', 'uploads', filename);
            
            if (fs.existsSync(fullPath)) {
                fs.unlinkSync(fullPath);
                console.log(`Kép törölve: ${filename}`);
            }
        }
    } catch (error) {
        console.error("Képtörlési hiba:", error);
    }
};

// ====== ROUTES: CATEGORIES ======
// GET /api/categories - Kategóriák listázása
app.get('/api/categories', async (req, res) => {
    const { search, inStock, active } = req.query;
    
    let whereClauses = [];
    let params = [];
    
    if (search) {
        whereClauses.push('(k.KATEGORIA LIKE ? OR t.NEV LIKE ?)');
        params.push(`%${search}%`, `%${search}%`);
    }
    
    if (inStock === 'true') {
        whereClauses.push('t.MENNYISEG > 0');
    }
    
    if (active === 'true') {
        whereClauses.push("t.AKTIV = 'Y'");
    }
    
    const whereClause = whereClauses.length > 0 
        ? `WHERE ${whereClauses.join(' AND ')}` 
        : '';
    
    const sql = `
        SELECT DISTINCT k.ID_KATEGORIA, k.KATEGORIA
        FROM webbolt_kategoriak k
        INNER JOIN webbolt_termekek t ON t.ID_KATEGORIA = k.ID_KATEGORIA
        ${whereClause}
        ORDER BY k.KATEGORIA
    `;
    
    const result = await runQuery(sql, params);
    
    if (!result.success) {
        return res.status(500).json({ message: "Hiba a kategóriák lekérdezésekor" });
    }
    
    res.json({ message: "ok", data: result.data });
});

// ====== ROUTES: CART ======
// GET /api/cart - Kosár tartalmának lekérése
app.get('/api/cart', requireAuth, async (req, res) => {
    const sql = `
        SELECT 
            t.NEV, t.AR, 
            CASE WHEN t.FOTOLINK IS NOT NULL THEN t.FOTOLINK ELSE f.IMG END AS FOTOLINK,
            t.ID_TERMEK, ct.MENNYISEG
        FROM webbolt_kosar_tetelei ct
        INNER JOIN webbolt_kosar k ON ct.ID_KOSAR = k.ID_KOSAR
        INNER JOIN webbolt_termekek t ON ct.ID_TERMEK = t.ID_TERMEK
        LEFT JOIN webbolt_fotok f ON t.ID_TERMEK = f.ID_TERMEK
        WHERE k.ID_USER = ?
    `;
    
    const result = await runQuery(sql, [req.session.ID_USER]);
    
    if (!result.success) {
        return res.status(500).json({ message: "Hiba a kosár lekérdezésekor" });
    }
    
    res.json({ message: "ok", data: result.data });
});

// GET /api/cart/count - Kosárban lévő tételek száma
app.get('/api/cart/count', requireAuth, async (req, res) => {
    const sql = `
        SELECT SUM(ct.MENNYISEG) as count
        FROM webbolt_kosar_tetelei ct
        INNER JOIN webbolt_kosar k ON ct.ID_KOSAR = k.ID_KOSAR
        WHERE k.ID_USER = ?
    `;
    
    const result = await runQuery(sql, [req.session.ID_USER]);
    
    if (!result.success) {
        return res.status(500).json({ message: "Hiba" });
    }
    
    const count = result.data[0]?.count || 0;
    res.json({ message: "ok", count });
});

// POST /api/cart/items - Termék hozzáadása a kosárhoz
app.post('/api/cart/items', requireAuth, async (req, res) => {
    const { productId, quantity = 1 } = req.body;
    
    const queries = [
        {
            sql: `INSERT INTO webbolt_kosar (ID_USER) 
                  SELECT ? WHERE NOT EXISTS 
                  (SELECT 1 FROM webbolt_kosar WHERE ID_USER = ?)`,
            params: [req.session.ID_USER, req.session.ID_USER]
        },
        {
            sql: `SET @kosarid = (SELECT ID_KOSAR FROM webbolt_kosar WHERE ID_USER = ?)`,
            params: [req.session.ID_USER]
        },
        {
            sql: `INSERT INTO webbolt_kosar_tetelei (ID_KOSAR, ID_TERMEK, MENNYISEG) 
                  VALUES (@kosarid, ?, ?)
                  ON DUPLICATE KEY UPDATE MENNYISEG = MENNYISEG + ?`,
            params: [productId, quantity, quantity]
        }
    ];
    
    const result = await runTransaction(queries);
    
    if (!result.success) {
        return res.status(500).json({ message: "Hiba a kosárba helyezéskor" });
    }
    
    res.json({ message: "ok" });
});

// PATCH /api/cart/items/:productId - Mennyiség módosítása
app.patch('/api/cart/items/:productId', requireAuth, async (req, res) => {
    const { productId } = req.params;
    const { quantity } = req.body;
    
    const sql = `
        UPDATE webbolt_kosar_tetelei ct
        INNER JOIN webbolt_kosar k ON ct.ID_KOSAR = k.ID_KOSAR
        SET ct.MENNYISEG = ?
        WHERE k.ID_USER = ? AND ct.ID_TERMEK = ?
    `;
    
    const result = await runQuery(sql, [quantity, req.session.ID_USER, productId]);
    
    if (!result.success) {
        return res.status(500).json({ message: "Hiba a módosításkor" });
    }
    
    res.json({ message: "ok" });
});

// DELETE /api/cart/items/:productId - Tétel törlése a kosárból
app.delete('/api/cart/items/:productId', requireAuth, async (req, res) => {
    const { productId } = req.params;
    
    const sql = `
        DELETE ct FROM webbolt_kosar_tetelei ct
        INNER JOIN webbolt_kosar k ON ct.ID_KOSAR = k.ID_KOSAR
        WHERE k.ID_USER = ? AND ct.ID_TERMEK = ?
    `;
    
    const result = await runQuery(sql, [req.session.ID_USER, productId]);
    
    if (!result.success) {
        return res.status(500).json({ message: "Hiba a törléskor" });
    }
    
    res.json({ message: "ok" });
});

// ====== ROUTES: ORDERS ======
// GET /api/orders - Felhasználó rendelései
app.get('/api/orders', requireAuth, async (req, res) => {
    const { page = 1, limit = 10 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    
    const sql = `
        SELECT 
            r.ID_RENDELES, 
            r.DATUM, 
            r.AFA,
            ROUND(SUM(rt.AR * rt.MENNYISEG) * (1 + (r.AFA / 100))) AS RENDELES_VEGOSSZEGE
        FROM webbolt_rendeles r
        JOIN webbolt_rendeles_tetelei rt ON r.ID_RENDELES = rt.ID_RENDELES
        WHERE r.ID_USER = ?
        GROUP BY r.ID_RENDELES
        ORDER BY r.ID_RENDELES DESC
        LIMIT ? OFFSET ?
    `;
    
    const result = await runQuery(sql, [req.session.ID_USER, parseInt(limit), offset]);
    
    if (!result.success) {
        return res.status(500).json({ message: "Hiba" });
    }
    
    res.json({ message: "ok", data: result.data });
});

// GET /api/orders/:id - Egy rendelés részletei
app.get('/api/orders/:id', requireAuth, async (req, res) => {
    const { id } = req.params;
    
    const sql = `
        SELECT rt.NEV, rt.MENNYISEG, rt.AR, rt.FOTOLINK
        FROM webbolt_rendeles_tetelei rt
        INNER JOIN webbolt_rendeles r ON rt.ID_RENDELES = r.ID_RENDELES
        WHERE r.ID_RENDELES = ? AND r.ID_USER = ?
    `;
    
    const result = await runQuery(sql, [id, req.session.ID_USER]);
    
    if (!result.success) {
        return res.status(500).json({ message: "Hiba" });
    }
    
    if (result.data.length === 0) {
        return res.status(404).json({ message: "Rendelés nem található" });
    }
    
    res.json({ message: "ok", data: result.data });
});

// POST /api/orders - Új rendelés létrehozása
app.post('/api/orders', requireAuth, async (req, res) => {
    const { paymentMethod, shippingMethod, note, shippingAddress, name, email, vat } = req.body;
    
    let conn;
    try {
        conn = await pool.getConnection();
        await conn.beginTransaction();
        
        // 1. Kosár tételek lekérése
        const [cartItems] = await conn.execute(`
            SELECT ct.ID_TERMEK, ct.MENNYISEG, t.NEV, t.AR, t.KATEGORIA,
                   CASE WHEN t.FOTOLINK IS NOT NULL THEN t.FOTOLINK ELSE f.IMG END AS FOTOLINK
            FROM webbolt_kosar_tetelei ct
            INNER JOIN webbolt_kosar k ON ct.ID_KOSAR = k.ID_KOSAR
            INNER JOIN webbolt_termekek t ON ct.ID_TERMEK = t.ID_TERMEK
            LEFT JOIN webbolt_fotok f ON t.ID_TERMEK = f.ID_TERMEK
            WHERE k.ID_USER = ?
        `, [req.session.ID_USER]);
        
        if (cartItems.length === 0) {
            await conn.rollback();
            return res.status(400).json({ message: "Üres kosár" });
        }
        
        // 2. Készlet ellenőrzés
        for (const item of cartItems) {
            const [stock] = await conn.execute(
                'SELECT MENNYISEG, AKTIV FROM webbolt_termekek WHERE ID_TERMEK = ?',
                [item.ID_TERMEK]
            );
            
            if (stock[0].MENNYISEG < item.MENNYISEG || stock[0].AKTIV === 'N') {
                await conn.rollback();
                return res.status(400).json({ 
                    message: "Készlethiba", 
                    product: item.NEV 
                });
            }
        }
        
        // 3. Rendelés létrehozása
        const [orderResult] = await conn.execute(`
            INSERT INTO webbolt_rendeles 
            (ID_USER, FIZMOD, SZALLMOD, MEGJEGYZES, SZALLCIM, NEV, EMAIL, AFA)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `, [req.session.ID_USER, paymentMethod, shippingMethod, note, shippingAddress, name, email, vat]);
        
        const orderId = orderResult.insertId;
        
        // 4. Tételek átmásolása
        for (const item of cartItems) {
            await conn.execute(`
                INSERT INTO webbolt_rendeles_tetelei 
                (ID_RENDELES, MENNYISEG, NEV, AR, FOTOLINK, ID_TERMEK, KATEGORIA)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            `, [orderId, item.MENNYISEG, item.NEV, item.AR, item.FOTOLINK, item.ID_TERMEK, item.KATEGORIA]);
        }
        
        // 5. Kosár ürítése
        await conn.execute(`
            DELETE FROM webbolt_kosar_tetelei 
            WHERE ID_KOSAR = (SELECT ID_KOSAR FROM webbolt_kosar WHERE ID_USER = ?)
        `, [req.session.ID_USER]);
        
        await conn.commit();
        
        res.status(201).json({ 
            message: "ok", 
            orderId 
        });
        
    } catch (error) {
        if (conn) await conn.rollback();
        console.error("Order error:", error);
        res.status(500).json({ message: "Hiba a rendelés során" });
    } finally {
        if (conn) conn.release();
    }
});

// ====== ROUTES: REVIEWS ======
// GET /api/reviews - Vélemények lekérése
app.get('/api/reviews', async (req, res) => {
    const { productId, status = 'approved', page = 1, limit = 10 } = req.query;
    
    let whereClauses = ['1=1'];
    let params = [];
    
    if (productId) {
        whereClauses.push('v.ID_TERMEK = ?');
        params.push(parseInt(productId));
    }
    
    // Status szűrés
    const statusMap = {
        'approved': 'Jóváhagyva',
        'pending': 'Jóváhagyásra vár',
        'rejected': 'Elutasítva'
    };
    
    if (statusMap[status]) {
        whereClauses.push('v.ALLAPOT = ?');
        params.push(statusMap[status]);
    }
    
    const offset = (parseInt(page) - 1) * parseInt(limit);
    
    const sql = `
        SELECT u.NEV, v.SZOVEG, v.ID_VELEMENY, v.ID_TERMEK, v.DATUM
        FROM webbolt_velemenyek v
        INNER JOIN users u ON u.ID_USER = v.ID_USER
        WHERE ${whereClauses.join(' AND ')}
        ORDER BY v.DATUM DESC
        LIMIT ? OFFSET ?
    `;
    
    params.push(parseInt(limit), offset);
    const result = await runQuery(sql, params);
    
    if (!result.success) {
        return res.status(500).json({ message: "Hiba" });
    }
    
    res.json({ message: "ok", data: result.data });
});

// GET /api/reviews/my - Saját vélemények
app.get('/api/reviews/my', requireAuth, async (req, res) => {
    const { productId } = req.query;
    
    let whereClauses = ['v.ID_USER = ?'];
    let params = [req.session.ID_USER];
    
    if (productId) {
        whereClauses.push('v.ID_TERMEK = ?');
        params.push(parseInt(productId));
    }
    
    const sql = `
        SELECT u.NEV, v.SZOVEG, v.ID_VELEMENY, v.ID_TERMEK, v.DATUM, v.ALLAPOT
        FROM webbolt_velemenyek v
        INNER JOIN users u ON u.ID_USER = v.ID_USER
        WHERE ${whereClauses.join(' AND ')}
        ORDER BY v.DATUM DESC
    `;
    
    const result = await runQuery(sql, params);
    
    if (!result.success) {
        return res.status(500).json({ message: "Hiba" });
    }
    
    res.json({ message: "ok", data: result.data });
});

// POST /api/reviews - Vélemény írása
app.post('/api/reviews', requireAuth, async (req, res) => {
    const { productId, text } = req.body;
    
    if (!text || text.trim() === '') {
        return res.status(400).json({ message: "Üres vélemény" });
    }
    
    const isAdmin = req.session.ADMIN === "Y" || req.session.WEBBOLT_ADMIN === "Y";
    const status = isAdmin ? "Jóváhagyva" : "Jóváhagyásra vár";
    
    const sql = `
        INSERT INTO webbolt_velemenyek (ID_TERMEK, ID_USER, SZOVEG, ALLAPOT)
        VALUES (?, ?, ?, ?)
    `;
    
    const result = await runQuery(sql, [productId, req.session.ID_USER, text, status]);
    
    if (!result.success) {
        return res.status(500).json({ message: "Hiba a vélemény hozzáadásakor" });
    }
    
    res.status(201).json({ 
        message: "ok",
        reviewId: result.data.insertId
    });
});

// DELETE /api/reviews/:id - Vélemény törlése
app.delete('/api/reviews/:id', requireAuth, async (req, res) => {
    const { id } = req.params;
    
    // Ellenőrizzük, hogy saját vélemény-e vagy admin
    const checkSql = `
        SELECT ID_USER FROM webbolt_velemenyek WHERE ID_VELEMENY = ?
    `;
    const checkResult = await runQuery(checkSql, [id]);
    
    if (!checkResult.success || checkResult.data.length === 0) {
        return res.status(404).json({ message: "Vélemény nem található" });
    }
    
    const isOwner = checkResult.data[0].ID_USER === req.session.ID_USER;
    const isAdmin = req.session.ADMIN === "Y" || req.session.WEBBOLT_ADMIN === "Y";
    
    if (!isOwner && !isAdmin) {
        return res.status(403).json({ message: "Nincs jogosultság" });
    }
    
    const deleteSql = `DELETE FROM webbolt_velemenyek WHERE ID_VELEMENY = ?`;
    const result = await runQuery(deleteSql, [id]);
    
    if (!result.success) {
        return res.status(500).json({ message: "Hiba a törléskor" });
    }
    
    res.json({ message: "ok" });
});

// PATCH /api/reviews/:id/approve - Vélemény jóváhagyása (ADMIN)
app.patch('/api/reviews/:id/approve', requireAdmin, async (req, res) => {
    const { id } = req.params;
    
    const sql = `
        UPDATE webbolt_velemenyek 
        SET ALLAPOT = "Jóváhagyva"
        WHERE ID_VELEMENY = ?
    `;
    
    const result = await runQuery(sql, [id]);
    
    if (!result.success) {
        return res.status(500).json({ message: "Hiba" });
    }
    
    res.json({ message: "ok" });
});

// PATCH /api/reviews/:id/reject - Vélemény elutasítása (ADMIN)
app.patch('/api/reviews/:id/reject', requireAdmin, async (req, res) => {
    const { id } = req.params;
    
    const sql = `
        UPDATE webbolt_velemenyek 
        SET ALLAPOT = "Elutasítva"
        WHERE ID_VELEMENY = ?
    `;
    
    const result = await runQuery(sql, [id]);
    
    if (!result.success) {
        return res.status(500).json({ message: "Hiba" });
    }
    
    res.json({ message: "ok" });
});

// ====== ROUTES: ADMIN STATISTICS ======
// GET /api/admin/stats/top-products - Top 5 termék
app.get('/api/admin/stats/top-products', requireAdmin, async (req, res) => {
    const { months = 1 } = req.query;
    
    let dateFilter = '';
    if (months !== 'all') {
        dateFilter = `AND r.DATUM > (NOW() - INTERVAL ${parseInt(months)} MONTH)`;
    }
    
    const sql = `
        SELECT 
            SUM(t.MENNYISEG) AS DB,
            SUM(t.MENNYISEG * p.AR) AS BEVETEL,
            CASE WHEN p.FOTOLINK IS NOT NULL THEN p.FOTOLINK ELSE f.IMG END AS FOTOLINK,
            p.NEV
        FROM webbolt_rendeles_tetelei t
        INNER JOIN webbolt_rendeles r ON r.ID_RENDELES = t.ID_RENDELES
        INNER JOIN webbolt_termekek p ON t.ID_TERMEK = p.ID_TERMEK
        LEFT JOIN webbolt_fotok f ON p.ID_TERMEK = f.ID_TERMEK
        WHERE t.ID_TERMEK IS NOT NULL ${dateFilter}
        GROUP BY t.ID_TERMEK
        ORDER BY DB DESC, BEVETEL DESC
        LIMIT 5
    `;
    
    const result = await runQuery(sql);
    
    if (!result.success) {
        return res.status(500).json({ message: "Hiba" });
    }
    
    res.json({ message: "ok", data: result.data });
});

// GET /api/admin/stats/revenue - Bevételi statisztika
app.get('/api/admin/stats/revenue', requireAdmin, async (req, res) => {
    const { months = 12 } = req.query;
    
    const sql = `
        WITH RECURSIVE months_list AS (
            SELECT DATE_FORMAT(DATE_SUB(CURDATE(), INTERVAL ? MONTH), '%Y-%m-01') AS IDO
            UNION ALL
            SELECT DATE_FORMAT(DATE_ADD(IDO, INTERVAL 1 MONTH), '%Y-%m-01')
            FROM months_list
            WHERE IDO < DATE_FORMAT(CURDATE(), '%Y-%m-01')
        )
        SELECT 
            m.IDO,
            COALESCE(SUM(t.AR * t.MENNYISEG), 0) AS BEVETEL
        FROM months_list m
        LEFT JOIN webbolt_rendeles r 
            ON DATE_FORMAT(r.DATUM, '%Y-%m') = DATE_FORMAT(m.IDO, '%Y-%m')
        LEFT JOIN webbolt_rendeles_tetelei t 
            ON t.ID_RENDELES = r.ID_RENDELES
        GROUP BY m.IDO
        ORDER BY m.IDO
    `;
    
    const result = await runQuery(sql, [parseInt(months) - 1]);
    
    if (!result.success) {
        return res.status(500).json({ message: "Hiba" });
    }
    
    res.json({ message: "ok", data: result.data });
});

// GET /api/admin/stats/orders - Rendelések statisztika
app.get('/api/admin/stats/orders', requireAdmin, async (req, res) => {
    const { months = 12 } = req.query;
    
    const sql = `
        WITH RECURSIVE months_list AS (
            SELECT DATE_FORMAT(DATE_SUB(CURDATE(), INTERVAL ? MONTH), '%Y-%m-01') AS IDO
            UNION ALL
            SELECT DATE_FORMAT(DATE_ADD(IDO, INTERVAL 1 MONTH), '%Y-%m-01')
            FROM months_list
            WHERE IDO < DATE_FORMAT(CURDATE(), '%Y-%m-01')
        )
        SELECT 
            m.IDO,
            COUNT(r.ID_RENDELES) AS DARAB
        FROM months_list m
        LEFT JOIN webbolt_rendeles r
            ON DATE_FORMAT(r.DATUM, '%Y-%m') = DATE_FORMAT(m.IDO, '%Y-%m')
        GROUP BY m.IDO
        ORDER BY m.IDO
    `;
    
    const result = await runQuery(sql, [parseInt(months) - 1]);
    
    if (!result.success) {
        return res.status(500).json({ message: "Hiba" });
    }
    
    res.json({ message: "ok", data: result.data });
});

// GET /api/admin/stats/categories - Kategória statisztika
app.get('/api/admin/stats/categories', requireAdmin, async (req, res) => {
    const { months = 12 } = req.query;
    
    const sql = `
        WITH base AS (
            SELECT 
                KATEGORIA,
                SUM(MENNYISEG) AS DARAB,
                SUM(MENNYISEG * AR) AS BEVETEL
            FROM webbolt_rendeles_tetelei t
            JOIN webbolt_rendeles r ON r.ID_RENDELES = t.ID_RENDELES
            WHERE r.DATUM >= NOW() - INTERVAL ${parseInt(months)} MONTH
            GROUP BY KATEGORIA
        ),
        top5 AS (
            SELECT * FROM base
            ORDER BY DARAB DESC, BEVETEL DESC
            LIMIT 5
        ),
        others AS (
            SELECT 
                SUM(DARAB) AS DARAB,
                COUNT(*) AS KAT_DB
            FROM base
            WHERE KATEGORIA NOT IN (SELECT KATEGORIA FROM top5)
        )
        SELECT KATEGORIA, DARAB FROM top5
        UNION ALL
        SELECT CONCAT('Egyéb (', KAT_DB, ' kategória)'), DARAB
        FROM others
        WHERE KAT_DB > 0
        ORDER BY DARAB DESC
    `;
    
    const result = await runQuery(sql);
    
    if (!result.success) {
        return res.status(500).json({ message: "Hiba" });
    }
    
    res.json({ message: "ok", data: result.data });
});

// GET /api/admin/stats/reviews - Vélemények statisztika
app.get('/api/admin/stats/reviews', requireAdmin, async (req, res) => {
    const { months = 12 } = req.query;
    
    let dateFilter = '';
    if (months !== 'all') {
        dateFilter = `WHERE v.DATUM >= NOW() - INTERVAL ${parseInt(months)} MONTH`;
    }
    
    const sql = `
        SELECT v.ALLAPOT, COUNT(*) AS DARAB
        FROM webbolt_velemenyek v
        ${dateFilter}
        GROUP BY v.ALLAPOT
        ORDER BY DARAB DESC
    `;
    
    const result = await runQuery(sql);
    
    if (!result.success) {
        return res.status(500).json({ message: "Hiba" });
    }
    
    res.json({ message: "ok", data: result.data });
});

// ====== ROUTES: CONSTANTS ======
// GET /api/constants/vat - ÁFA lekérése
app.get('/api/constants/vat', async (req, res) => {
    const sql = 'SELECT AFA FROM webbolt_konstansok';
    const result = await runQuery(sql);
    
    if (!result.success) {
        return res.status(500).json({ message: "Hiba" });
    }
    
    res.json({ 
        message: "ok", 
        vat: result.data[0]?.AFA || 0 
    });
});

// ====== ROUTES: EMAIL ======
const { sendEmail } = require('./email-sender');

// POST /api/email/send - Email küldés
app.post('/api/email/send', async (req, res) => {
    try {
        const { email, subject, html } = req.body;
        
        await sendEmail(email, subject, html);
        
        res.json({ message: 'Email sikeresen elküldve' });
    } catch (error) {
        console.error('Email hiba:', error);
        res.status(500).json({ message: 'Email hiba' });
    }
});

// ====== ERROR HANDLING ======
// 404 handler
app.use((req, res) => {
    res.status(404).json({ 
        message: "Endpoint not found",
        path: req.path 
    });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    
    if (err instanceof multer.MulterError) {
        return res.status(400).json({ 
            message: "Fájlfeltöltési hiba",
            error: err.message 
        });
    }
    
    res.status(500).json({ 
        message: "Szerverhiba",
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// ====== SERVER START ======
app.listen(port, () => {
    console.log(`🚀 RESTful API running on http://localhost:${port}`);
    console.log(`📚 API Documentation:`);
    console.log(`   Auth:       POST /api/auth/login, /logout`);
    console.log(`   Products:   GET/POST/PUT/DELETE /api/products`);
    console.log(`   Cart:       GET/POST/PATCH/DELETE /api/cart`);
    console.log(`   Orders:     GET/POST /api/orders`);
    console.log(`   Reviews:    GET/POST/DELETE /api/reviews`);
    console.log(`   Admin:      GET /api/admin/stats/*`);
});