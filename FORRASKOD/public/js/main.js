// globalis valtozok, betolto/frissito/modosito fuggvenyek

const alerts = ["success", "info", "warning", "danger"];
let bepipaltID = "";
let webbolt_admin = false;
let admin = false;
let elfogyott = false;
let Nemaktivak = false;
let maxarr = 0;
let minarr = 0;
let sqleddig = ""; // változik a lekérdezés akkor olad újra az 1. oldal
let oldalszam = 0; // összes oldal darabszáma
let Joldal = 1; // jelenlegi oldal

const szuromegnyitas = document.getElementById('szuro_megnyitas');
const szurobezaras = document.getElementById('szuro_bezaras');
const mobilszuro = document.getElementById('mobil_szuro');
const overlay = document.getElementById('overlay');

const egeszoldal = $("html");

const SPAState = { currentView: 'home', currentData: {} };

const kezdesek = ["Szerintem", "Őszintén szólva", "Én úgy látom", "Nekem az a véleményem", "Nyilvánvalóan", "Hát megmondom őszintén, hogy"];
const cselekvesek = ["ez a termék", "ez a szolgáltatás", "a funkció", "ez az app", "ez a funkció", "semmiképpen sem"];
const jelzok = ["nagyon jó", "elég hasznos", "egészen érdekes", "meglepően hatékony", "egészen korrekt", "használhatatlan"];
const kozospontok = ["és", "de", "ráadásul", "viszont", "ugyanakkor"];
const zaro = [".", "!", " 😊", " 😎", "."]

let kosarmenupont = `
    <label class="group bg-transparent me-3 text-gray-500 dark:bg-slate-900 dark:text-zinc-400 hover:text-slate-700 dark:hover:text-zinc-200 !border-b !border-transparent d-flex align-items-center justify-content-center p-2  cursor-pointer transition-all duration-200 has-[:checked]:!border-b has-[:checked]:!border-slate-900 dark:has-[:checked]:!border-b dark:has-[:checked]:!border-zinc-200">
        <div class="flex items-center group-has-[:checked]:text-slate-700 dark:group-has-[:checked]:text-zinc-200 gap-2 text-lg">
        <input type="radio" name="cart" class="form-check-input hidden " id="kosar" onchange="Kosar_Mutat()" data-bs-dismiss="offcanvas">
        <i class="bi bi-bag"></i> 
        <span class="group-has-[:checked]:font-semibold transition-all duration-200 ">Kosár <span class="badge bg-slate-900 text-zinc-200 dark:bg-sky-950 dark:border border-sky-700 dark:text-zinc-200 align-self-center ms-1" style="top: -50%" id="kosar_content_count">0</span></span>
        </div>
    </label>`;

let rendelesmenupont = `
    <button id="rend_button" type="button" class="px-3 py-1 !border !border-transparent bg-slate-900 text-zinc-200 dark:bg-gray-800 dark:text-zinc-200 hover:text-slate-900 hover:bg-zinc-100 hover:!border-slate-900 dark:hover:bg-gray-700/70 dark:!border-zinc-200/10 dark:hover:!border-zinc-200/20 dark:hover:text-zinc-200 transition-all duration-150 ease-in-out tracking-wider mt-2 w-full rounded-2xl bezarmind" onclick="rendelesekmegtolt(true)"> 
        <i class="bi bi-bag-check"></i>
        <span> Rendeléseim</span>
    </button>`;

function randomElem(tomb) { return tomb[Math.floor(Math.random() * tomb.length)]; }

function RandomVelemeny() {
  const templateek = [
    "{kezdes} {cselekves} {jelzo}{zaro}",
    "{kezdes}, {cselekves} {kozospont} {jelzo}{zaro}",
    "{kezdes} {cselekves} szerint {jelzo}{zaro}"
  ];
  const template = randomElem(templateek);
  
  return template.replace("{kezdes}", randomElem(kezdesek)).replace("{cselekves}", randomElem(cselekvesek)).replace("{jelzo}", randomElem(jelzok)).replace("{kozospont}", randomElem(kozospontok)).replace("{zaro}", randomElem(zaro));
}

async function AR_SUM(osztaly, hova, vegossszeg) {
    let sum = 0;
    $(`.${osztaly}`).each(function () {
        // 1 500 Ft -> 1500
        let osszeg = parseInt($(this).html().replaceAll("&nbsp;", "").replaceAll(" ", "").replaceAll(",", ""));
        sum += osszeg;
    });

    if (vegossszeg) {
        sum = Math.round(sum * (1 + (await ajax_call(`afa`, "GET", null, true)).rows[0].AFA / 100));
        $(`#${hova}`).html(`${sum.toLocaleString()} Ft`);
    }
    else { $(`#${hova}`).html(`${sum.toLocaleString()} Ft`); }
}

// Session ellenőrzése
async function SESSION() {
    if (!JSON.parse(localStorage.getItem("user"))?.loggedIn) { return; }
        try {
            const js = await ajax_call('/check_session', "GET", null, false);

            const localBoot = JSON.parse(localStorage.getItem('user'))?.serverBoot || '';
            if (!js.active || (localBoot && String(js.serverBoot) !== String(localBoot))) {
                localStorage.removeItem("user");
                console.log(js);
                alert('A munkamenet lejárt vagy a szerver újraindult. Kérlek jelentkezz be újra.');
                location.reload();
            }
        } catch (err) { console.error(err); }
}

async function Admin_ellenorzes() { 
    let adminell = await ajax_call("admin_check", "GET", null, true); 
    return adminell; 
}

function SzuroMegnyitas() {
    mobilszuro.classList.add('active');
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
}

function SzuroBezaras() {
    mobilszuro.classList.remove('active');
    overlay.classList.remove('active');
    document.body.style.overflow = '';
    document.documentElement.style.overflow = '';
}

async function F5() {
    if (JSON.parse(localStorage.getItem("user") || "{}")?.loggedIn) { 
        bejelentkezett_usernev = JSON.parse(localStorage.getItem("user") || "{}")?.name || "";
        bejelentkezett_useremail = JSON.parse(localStorage.getItem("user") || "{}")?.email || "";
        csoport = JSON.parse(localStorage.getItem("user") || "{}")?.group || "";

        const ae = await Admin_ellenorzes();        
        if (ae.admin) { admin = true; }
        if (ae.webadmin) { webbolt_admin = true; }

        const tema = localStorage.getItem("theme") || "system";
        Megjelenes(tema);
        Frissites();
    } else { 
        Frissites();
    }
}

function Megjelenes(mod) {
  if (mod === "dark") {
    egeszoldal.addClass("dark");
    $("#dark").prop("checked", true);
  } 
  else if (mod === "light") {
    egeszoldal.removeClass("dark");
    $("#light").prop("checked", true);
  } 
  else if (mod === "system") {
    const sotete = window.matchMedia("(prefers-color-scheme: dark)").matches;
    egeszoldal.toggleClass("dark", sotete);
    $("#system").prop("checked", true);
  }
}

function Temavalto(id) {
    localStorage.setItem("theme", id.id);
    Megjelenes(id.id);
}

function KeresoModal() {
    $("#keresomodal").modal("show");
    setTimeout(() => {
        $("#nev1").focus();
      }, 1000);
}

function UjTermek() {
    $("#home_button").closest(".gombdiv").removeClass("aktiv");
    $("#cart_button").closest(".gombdiv").removeClass("aktiv");
    TermekSzerkesztoAblak(event,0,"bevitel");
    $("#save_button").html(`<i class="bi bi-plus-lg"></i>&nbsp;Új termék létrehozása`);
}

function RangokHTML(rang) {
    let ranghtml = "";
    switch (rang) {
        case "Students": ranghtml = `<span class="inline-flex items-center rounded-md bg-blue-400/10 px-2 py-1 text-sm font-medium text-blue-400 !border !border-blue-400/30">● ${rang}</span>`; break;
        case "Teachers": ranghtml = `<span class="inline-flex items-center rounded-md bg-yellow-400/10 px-2 py-1 text-sm font-medium text-yellow-600 !border !border-yellow-600/40">● ${rang}</span>`; break;
        case "Bosses": ranghtml = `<span class="inline-flex items-center rounded-md bg-indigo-400/10 px-2 py-1 text-sm font-medium text-indigo-400 !border !border-indigo-400/30">● ${rang}</span>`; break;
        case "Admin": ranghtml = `<span class="inline-flex items-center rounded-md bg-red-400/10 px-2 py-1 text-sm font-medium text-red-400 !border !border-red-400/20">● ${rang}</span>`; break;
        case "Webbolt Admin": ranghtml = `<span class="inline-flex items-center rounded-md bg-purple-400/10 px-2 py-1 text-sm font-medium text-purple-400 !border !border-purple-400/30">● ${rang}</span>`; break;
    }
    return ranghtml;
}

function update_gombok (x) {
    // vendeg
    if (x == 0) { 
        $("#kosar-menupont").html(kosarmenupont);
        $("#admin-menupont").html("");
        $("#rendeles-menupont").html("");
        
    }
    // sima user
    if (x == 1) { 
        $("#kosar-menupont").html(kosarmenupont);
        $("#rendeles-menupont").html(rendelesmenupont);
        $("#admin-menupont").html("");
        
    }
    // admin/webadmin
    if (x == 2) {
        $("#kosar-menupont").html(kosarmenupont);
        $("#rendeles-menupont").html(rendelesmenupont);
        $("#admin-menupont").html(`
            <div class="dropdown">
                <button id="admin_button" type="button" class="dropdown-toggle py-2 px-1 mx-1 text-lg bg-transparent text-gray-500 hover:bg-transparent hover:text-slate-700 dark:bg-slate-900 dark:text-zinc-400 dark:hover:bg-slate-900 dark:hover:text-zinc-200 transition-hover duration-300 ease-in-out rounded-3 d-flex" data-bs-toggle="dropdown">
                    <div class="gear-wrap d-flex justify-content-center align-items-center align-self-center w-5 h-5"> <i class="bi bi-gear admin-gear"></i></div>
                    <span>&nbsp;Admin&nbsp;</span>
                    <i class="bi bi-caret-down-fill text-sm align-self-center"></i>
                </button>
                <ul class="dropdown-menu !border !border-0 shadow-xl bg-zinc-300 dark:bg-slate-950">
                    <li>
                        <button id="vlm_button" type="button" class="py-2 px-4 bg-zinc-300 text-gray-500 hover:bg-slate-900 hover:text-zinc-200 dark:bg-slate-950 dark:text-zinc-400 dark:hover:bg-gray-700 dark:hover:text-zinc-200 transition-hover duration-100 ease-in-out rounded-none w-full d-flex" onclick="Admin_Velemenykezeles(true)" data-bs-dismiss="offcanvas"> 
                            <i class="bi bi-chat-dots"></i>
                            <span>&nbsp;Vélemények</span>
                        </button>
                    </li>
                    <li>
                        <button id="admin_uj_termek" type="button" class="py-2 px-4 bg-zinc-300 text-gray-500 hover:bg-slate-900 hover:text-zinc-200 dark:bg-slate-950 dark:text-zinc-400 dark:hover:bg-gray-700 dark:hover:text-zinc-200 transition-hover duration-100 ease-in-out rounded-none w-full d-flex" type="button"  onclick="UjTermek()" data-bs-dismiss="offcanvas">
                            <i class="bi bi-plus"></i>
                            <span>&nbsp;Új termék</span>
                        </button>
                    </li>
                    <li>
                        <button id="admin_stats" type="button" class="py-2 px-4 bg-zinc-300 text-gray-500 hover:bg-slate-900 hover:text-zinc-200 dark:bg-slate-950 dark:text-zinc-400 dark:hover:bg-gray-700 dark:hover:text-zinc-200 transition-hover duration-100 ease-in-out rounded-none w-full d-flex" type="button"  onclick="Statisztikak()" data-bs-dismiss="offcanvas">
                        <i class="bi bi-bar-chart"></i>
                        <span>&nbsp;Statisztikák</span> 
                        </button>
                    </li>
                    <li>
                        <button id="admin_rendelesek" type="button" class="py-2 px-4 bg-zinc-300 text-gray-500 hover:bg-slate-900 hover:text-zinc-200 dark:bg-slate-950 dark:text-zinc-400 dark:hover:bg-gray-700 dark:hover:text-zinc-200 transition-hover duration-100 ease-in-out rounded-none w-full d-flex" type="button"  onclick="RendelesekKezelese()" data-bs-dismiss="offcanvas">
                        <i class="bi bi-truck"></i>
                        <span>&nbsp;Rendelések</span> 
                        </button>
                    </li>
                    <li><hr class="dropdown-divider bg-gray-300 dark:bg-zinc-200/30"></hr></li>
                    <li>
                        <button id="admin_sql" type="button" class="py-2 px-4 bg-zinc-300 text-gray-500 hover:bg-slate-900 hover:text-zinc-200 dark:bg-slate-950 dark:text-zinc-400 dark:hover:bg-gray-700 dark:hover:text-zinc-200 transition-hover duration-100 ease-in-out rounded-none w-full d-flex" type="button"  onclick="SQLinput()" data-bs-dismiss="offcanvas">
                        <i class="bi bi-database"></i>
                        <span>&nbsp;SQL</span>
                        </button>
                    </li>
                </ul>
            </div>`);
            
    }
}

function LekerdezesFeltetelek() {

    // lekárdezis limit+ offset nélkül
    // az arfeltolt függvény nél is ezt hasznalom
    const inputok = kategoria_section.getElementsByTagName("input");
    bepipaltID = ""; //reset bepipalt kategória
    for (var elem of inputok){
        if (elem.checked) {
            bepipaltID += `${elem.id.replace("katcheck","")}-`;
        }
    }
    var nemaktiv = "";
    var elfogy = "";

    if (Nemaktivak) { nemaktiv = "&inaktiv=1"; }
    if (elfogyott){ elfogy = "&elfogyott=1"; }

    return "keres?nev="+ nev1.value+"&kategoria="+bepipaltID+ elfogy + nemaktiv;
}

async function KERESOBAR(updateHistory = true) {
    var min = document.getElementById("min_ar_input").value == 0? "" : document.getElementById("min_ar_input").value; 
    var max = document.getElementById("max_ar_input").value == 0? "" : document.getElementById("max_ar_input").value; 
    var elküld = LekerdezesFeltetelek();

    //elküldöm az sql-t offset, limit nélkül és az eddig beállított min max árakkal, AZ ármezők feltöltéséhez
    await ArFeltolt(elküld, min , max);

    var order = "";
    switch($("#rend").val()){
        case("ar_nov"): order = "&order=1"; break;
        case("ar_csok"): order = "&order=-1"; break;
        case("abc"): order = "&order=2"; break;
        case("abc_desc"): order = "&order=-2"; break;
        case("db_nov"): order = "&order=3"; break;
        case("db_csok"): order = "&order=-3"; break;
        default: order = "";
    }

    // újra lekérem az árakat a beállított min max árakkal
    min = document.getElementById("min_ar_input").value == 0? "" : document.getElementById("min_ar_input").value; 
    max = document.getElementById("max_ar_input").value == 0? "" : document.getElementById("max_ar_input").value; 
    
    var elküld2 = LekerdezesFeltetelek()+order+"&minar="+ min +"&maxar="+ max;
    // ha változik a lekérdezés akkor az oldal újra 1-re állitása
    if (sqleddig != elküld2){ Joldal = 1; }
    sqleddig = elküld2;

    // hozzáadom az offsetet is ==> limit automatikusan 52 backenden
    elküld2 += `&offset=${(Joldal-1)}`
    
    try {
        var adatok = await ajax_call(elküld2 , "GET", null, true);
        if (adatok.rows.length == 0){// ha nincs találat akkor az árakat újra lekérdezem limit nélkül
            ArFeltolt(elküld,-1,Number.MAX_SAFE_INTEGER);
            Joldal = 1;
        } 
        $("#kezdolap").prop("checked",false);
        $("#kosar").prop("checked",false);
        $("#nezetkicsi").removeClass("eltunt");
        $("#nezetnagy").removeClass("eltunt");
        await CARD_BETOLT(adatok);// termékek betöltése kártyákba az új lekérdezett adatokkal
        OLDALFELTOLT(adatok.maxcount); // lapválasztó feltöltése
        KategoriaFeltolt("kategoria_section", "check", "",true);// kategória szűrő frissítése    
    } catch (err) { console.error(err); }
    
    if (updateHistory) {
        const keresesErtek = $("#nev1").val();
        const minInput = $("#min_ar_input").val();
        const maxInput = $("#max_ar_input").val();
        const arSzuresVan = (minInput != "" && minInput != minarr) || (maxInput != "" && maxInput != maxarr);
        const vanSzures = keresesErtek != "" || bepipaltID != "" || arSzuresVan || elfogyott || Nemaktivak;

        if (vanSzures) {
            SPAState.currentView = 'search';
            SPAState.currentData = {
                kifejezes: keresesErtek,
                kategoriak: bepipaltID,
                minar: min,
                maxar: max,
                order: $("#rend").val(),
                elfogyott: elfogyott,
                nemaktivak: Nemaktivak
            };
            history.pushState(
                { view: 'search',data: SPAState.currentData },
                keresesErtek ? `Keresés: ${keresesErtek}` : 'Szűrés',
                keresesErtek ? `#search?q=${encodeURIComponent(keresesErtek)}` : '#search'
            );
        } else {
            SPAState.currentView = 'home';
            SPAState.currentData = {};
            history.pushState({ view: 'home' }, 'Kezdőlap', '#home');
        }
    }
}
//endregion

//#region OLdelkezelés
function OLDALFELTOLT(darab) {
    oldalszam = Math.ceil( darab / 52); // oldalszám kiszámolása
    if (oldalszam == 0) oldalszam = 1; // ha 0 akkor 1-re állitom

    var pp = `
        <ul class="pagination justify-content-center gap-2 select-none">
            <li class="page-item" >
                <a id="Vissza2" onclick="Kovi(this)" class="page-link px-3 py-2 rounded-xl !border !border-transparent bg-zinc-50 text-slate-900 dark:bg-zinc-950 dark:text-zinc-200 hover:bg-slate-900 hover:text-white dark:hover:bg-gray-800 dark:!border-zinc-200/10 dark:hover:!border-zinc-200/20 transition-all duration-200 shadow-sm cursor-pointer" >
                    «
                </a>
            </li>
            <li class="page-item">
                <a id="vissza1" onclick="Kovi(this)" class="page-link px-3 py-2 rounded-xl !border !border-transparent bg-zinc-50 text-slate-900 dark:bg-zinc-950 dark:text-zinc-200 hover:bg-slate-900 hover:text-white dark:hover:bg-gray-800 dark:!border-zinc-200/10 dark:hover:!border-zinc-200/20 transition-all duration-200 shadow-sm cursor-pointer">                    
                    <i class="bi bi-caret-left-fill"></i>
                    <span class="d-none d-lg-inline">Előző</span>
                </a>
            </li>
            <li class="page-item">
                <span class="page-link px-4 py-2 rounded-xl !border !border-transparent bg-slate-900 text-white font-semibold hover:bg-slate-900 hover:text-white dark:!border-zinc-200/10 dark:bg-gray-800 shadow-md cursor-default">
                    <b id="Mostoldal">${Joldal}</b>
                    <span class="opacity-70 mx-1">/</span>
                    <span id="DBoldal">${oldalszam}</span>
                </span>
            </li>
            <li class="page-item">
                <a id="Kovi1" onclick="Kovi(this)" class="page-link px-3 py-2 rounded-xl !border !border-transparent bg-zinc-50 text-slate-900 dark:bg-zinc-950 dark:text-zinc-200 hover:bg-slate-900 hover:text-white dark:hover:bg-gray-800 dark:!border-zinc-200/10 dark:hover:!border-zinc-200/20 transition-all duration-200 shadow-sm cursor-pointer">
                    <span class="d-none d-lg-inline">Következő</span>
                    <i class="bi bi-caret-right-fill"></i>
                </a>
            </li>
            <li class="page-item">
                <a id="Kovi2" onclick="Kovi(this)" class="page-link px-3 py-2 rounded-xl !border !border-transparent bg-zinc-50 text-slate-900 dark:bg-zinc-950 dark:text-zinc-200 hover:bg-slate-900 hover:text-white dark:hover:bg-gray-800 dark:!border-zinc-200/10 dark:hover:!border-zinc-200/20 transition-all duration-200 shadow-sm cursor-pointer">
                    »
                </a>
            </li>
        </ul>`;
    // alul a lapválastó feltöltése
    
    $("#pagi").html(pp);

    if(Joldal == 1) { // ha az 1. oldalon van akkor a vissza gombok inaktívak
        document.querySelector(".page-item:nth-child(2)").classList.add("disabled", "hover:cursor-not-allowed");
        document.querySelector(".page-item:nth-child(1)").classList.add("disabled", "hover:cursor-not-allowed");
    }

    if(Joldal == oldalszam){ // ha az utolsó oldalon van akkor a következő gombok inaktívak
        document.querySelector(".page-item:nth-child(4)").classList.add("disabled", "hover:cursor-not-allowed");
        document.querySelector(".page-item:nth-child(5)").classList.add("disabled", "hover:cursor-not-allowed");
    }
}

function Kovi(keri){
    FelaTetore("main_kontener");
    switch (keri.id){
        case("Kovi1"): // következő oldal
            if(Joldal < oldalszam){
                Joldal++;
                KERESOBAR(false);
                return;
            }
        case("Kovi2"): // utolsó oldal
                console.log("oldalszam: "+ oldalszam);
                Joldal = oldalszam;
                console.log("Joldal: "+ Joldal + " old szam: "+ oldalszam);
                KERESOBAR(false);
                return;
        
        case("vissza1"):// előző oldal
            if(Joldal > 1){
                Joldal--;
                KERESOBAR(false);
                return;
            }
        case("Vissza2"):// első oldal
            Joldal = 1;
            KERESOBAR(false);
            return;
    }
}
//endregion

//region Szürés
async function ArFeltolt(sql, min ,max){
    try {
        var arak = await ajax_call(sql+"&maxmin_arkell=1", "GET", null, true);//arak lekérdezése limit offset nélkül
        
        if (minarr === 0) minarr = arak.rows[0].MINAR;
        if (maxarr === 0) maxarr = arak.rows[0].MAXAR;

        // ha még nem volt minar akkor a minar = legkisebb ár
        if (min == ""){ min = arak.rows[0].MINAR; }

        // ha még nem volt maxar akkor a maxar = legnagyobb ár
        if (max == ""){ max = arak.rows[0].MAXAR; }
        
        // ha nincs találat akkor a max és min ár 0 legyen
        if(arak.rows[0].MINAR == null){
            
            document.getElementById("min_ar").min = 0;
            document.getElementById("min_ar").max = 0;
            document.getElementById("max_ar").max = 0;
            document.getElementById("max_ar").min = 0;
            document.getElementById("max_ar").value = 0;
            document.getElementById("min_ar").value = 0;
            
            document.getElementById("min_ar_input").value = 0;
            document.getElementById("max_ar_input").value = 0;
            return;
        }

        
        var elozomin = parseInt( document.getElementById("min_ar").min)// lekérdezes a csuszak minimum értékét mielött megváltoztatom
        var elozomax = parseInt( document.getElementById("max_ar").max)// lekérdezes a csuszak maximum értékét mielött megváltoztatom
        

        // ha az előző minimum érték = a mostani minimum érték 
        // vagy a mostani minimum nagyobb mint a lekérdezett utáni maximum ár 
        // akkor az új minimum legyen a lekérdezett minimuma
        if (elozomin == min || min > arak.rows[0].MAXAR){ min = arak.rows[0].MINAR; }

        // ha az előző maximum érték = a mostani maximum érték 
        // akkor a maximum legyen a lekérdezett maximuma
        if(elozomax == max){ max = arak.rows[0].MAXAR; }

        
        document.getElementById("min_ar").min = arak.rows[0].MINAR;
        document.getElementById("min_ar").max = arak.rows[0].MAXAR;

        document.getElementById("max_ar").max = arak.rows[0].MAXAR;
        document.getElementById("max_ar").min = arak.rows[0].MINAR; 
        

        
        // ha a mostani minimum kisebb mint a lekérdezett minimum 
        // akkor a minimum legyen a lekérdezett minimuma
        if (parseInt(min) < parseInt( arak.rows[0].MINAR )) {
           //document.getElementById("min_ar").value = arak.rows[0].MINAR;
           min = arak.rows[0].MINAR
        }
        // ha a mostani minimum nagyobb mint a lekérdezett minimum
        //  akkor a minimum legyen a mostani minimum
        else { document.getElementById("min_ar").value = min; }

        // ha a mostani maximum nagyobb mint a lekérdezett maximum 
        // akkor a maximum legyen a lekérdezett maximuma
        if (parseInt(max) > parseInt( arak.rows[0].MAXAR )) {
           //document.getElementById("max_ar").value = arak.rows[0].MAXAR;
           max = arak.rows[0].MAXAR
        }
        // ha a mostani maximum kisebb mint a lekérdezett maximum 
        // akkor a maximum legyen a mostani maximum
        else { document.getElementById("max_ar").value = max; }  
        

        document.getElementById("min_ar_input").value = min;
        document.getElementById("max_ar_input").value =max;

    } catch (err) { console.error(err); }
}

function Sliderninput( item ){
    // ha az Ár slider változik akkor az input mezőt is frissítem
    if (item.id == "min_ar_input") {
        document.getElementById("min_ar").value = item.value;
        SliderELL("min");
    }
    else{
        document.getElementById("max_ar").value = item.value;
        SliderELL("max");       
    }
}

function SliderELL(item){
    switch(item){
        case("min"): {
            // ha a minimum ár nagyobb mint a maximum ár akkor a maximum ár legyen a minimum ár +1
            if(parseInt ($("#min_ar").val()) > parseInt( $("#max_ar").val())){
                $("#max_ar").val(parseInt( $("#min_ar").val()) +1 );  
                $("#max_ar_input").val($("#max_ar").val());
            }  
            // ha a minimum ár eléri a slider minimum értékét akkor az input mező is a minimum értékre állítása
            if($("#min_ar").val() == document.getElementById("min_ar").min){
                $("#min_ar_input").val($("#min_ar").attr("min"));
            }
            // ha a minimum ár eléri a slider maximum értékét akkor az input mező is a maximum értékre állítása
            if($("#min_ar").val() == document.getElementById("min_ar").max){
                $("#min_ar_input").val($("#min_ar").attr("max"));
            }          
            break;
        }
        case("max"): {
            // ha a maximum ár kisebb mint a minimum ár akkor a minimum ár legyen a maximum ár -1
            if(parseInt ($("#max_ar").val()) < parseInt( $("#min_ar").val())){
                $("#min_ar").val(parseInt( $("#max_ar").val())-1 );  
                $("#min_ar_input").val($("#min_ar").val());
            }
            // ha a maximum ár eléri a slider minimum értékét akkor az input mező is a minimum értékre állítása
            if($("#max_ar").val() == document.getElementById("max_ar").min){
                $("#max_ar_input").val($("#max_ar").attr("min"));
            }
            // ha a maximum ár eléri a slider maximum értékét akkor az input mező is a maximum értékre állítása
            if($("#max_ar").val() == document.getElementById("max_ar").max){
                $("#max_ar_input").val($("#max_ar").attr("max"));
            }      

        }   
    }   
}



async function KategoriaFeltolt(hova, type, kivalasztott,mindenkipipal) {
// hova =  id ahova be akarom tenni a kategóriákat
//type = check vagy select
// kivalasztott = selectnél a kiválasztott kategória id-je
// mindenkipipal = ha true akkor a bepipalt kategoriak a fügyvény lefutása után is bepipálva lesznek.

    const inputok = kategoria_section.getElementsByTagName("input")//lekérdezes a chechboksot
    bepipaltID = ""; //reset bepipalt kategória
    if (mindenkipipal) { // ha mindenkipipal == false  ==> akkor ne frissítse a bepipált kategóriákat, mindenlegyen kikattintva, üres
        for (var elem of inputok) {
            if (elem.checked) { bepipaltID += `${elem.id.replace("katcheck","")}-`; }
        }
    }
   
    $(`#${hova}`).empty("");

    var nemaktivt = "";//reset
    if (Nemaktivak) { nemaktivt = "&inaktiv=1"; }

    var elfogyt = ""
    if (elfogyott) { elfogyt = "&elfogyott=1"; 

    }
    try {
        let listItems  = "";

        if (type == "check") {
             let k_json = await ajax_call(`kategoria?nev=${$("#nev1").val()}${elfogyt}${nemaktivt}`, "GET", null, true);
            for (let i = 0; i < k_json.rows.length; ++i) {
                var pipa = "";
                if (k_json.rows[i].ID_KATEGORIA == bepipaltID.split("-").find(e => e == k_json.rows[i].ID_KATEGORIA)) { pipa = "checked"; }
                listItems += `
                    <p class="p-2 !border-b !border-b-zinc-800/10 dark:!border-b dark:!border-b-zinc-200/10 dark:!border-t-0 dark:!border-r-0 dark:!border-l-0 mb-3 has-[:checked]:!border-b-sky-600 dark:has-[:checked]:!border-b-sky-600 transition-all duration-300 ease-in-out"> 
                        <input onchange="KatbolAR()" class=" form-check-input !border !border-zinc-800/20 bg-zinc-200 hover:cursor-pointer dark:!border dark:!border-zinc-200/30 dark:checked:!border-sky-600 dark:bg-slate-800 focus:outline-none focus:ring-0 focus:ring-offset-0 focus:shadow-none" type="checkbox" id="katcheck${k_json.rows[i].ID_KATEGORIA}" ${pipa} name="${k_json.rows[i].KATEGORIA}">  
                        <label class="form-check-label hover:cursor-pointer text-sm" for="katcheck${k_json.rows[i].ID_KATEGORIA}"> ${k_json.rows[i].KATEGORIA} </label> 
                    </p>`;
            }
        }
        else {
            listItems += `<option value="" disabled>-</option>`;
            let k_json = await ajax_call(`kategoria`, "GET", null, true);
            for (let index = 0; index < k_json.rows.length; index++) {
                listItems += `<option value="${k_json.rows[index].ID_KATEGORIA}" ${k_json.rows[index].ID_KATEGORIA == kivalasztott ? "selected" : ""}>${k_json.rows[index].KATEGORIA}</option>`;
                
            }
        }
        $(`#${hova}`).append(listItems);
        
    } catch (err) { console.error(err); }                     
}

function KatbolAR(){
    var min = document.getElementById("min_ar_input").value == 0? "" : document.getElementById("min_ar_input").value; 
    var max = document.getElementById("max_ar_input").value == 0? "" : document.getElementById("max_ar_input").value; 
    ArFeltolt(LekerdezesFeltetelek(), min,max );// árak újra feltöltése limit nélkül
}


function Elfogyott(alma) {
    if (alma.value == "Csakelfogyott"){// csakelfogyotttakat szeretné látni
        elfogyott = !elfogyott; 
        if (elfogyott) {
            document.getElementById("darable").disabled = true; // ne lehessen darabra szűrni
            document.getElementById("darabfel").disabled = true;
            if (document.getElementById("darable").selected == true || document.getElementById("darabfel").selected == true) {// ha darabra volt szűrve akkor állítsa vissza a rendezettséget
                document.getElementById("rendalap").selected = true;
            }  
        }
        else {// már nem csak elfogyottakat szeretné látni akkor újra engedélyezem a darabra szűrést
            document.getElementById("darable").disabled = false;
            document.getElementById("darabfel").disabled = false;
        }
    }
    else {//  inaktivak vannak bepipálva 
        Nemaktivak = !Nemaktivak;
    }
    KategoriaFeltolt("kategoria_section", "check", "",true);
}

function KezdolapElemekViszlat() {
    $("#welcome_section").fadeOut(300);
    $("#kateogoria-carousel").fadeOut(300);
    $("#tutorial").fadeOut(300);
}

function KezdolapElemekMegjelenit() {
    $("#welcome_section").fadeIn(300);
    $("#kateogoria-carousel").fadeIn(300);
    $("#tutorial").fadeIn(300);
}

async function Kezdolap(pushHistory = true) {
    

    nev1.value = "";
    bepipaltID = "";
    
    let kategoriacuccos = await ajax_call(`kategoria`, "GET", null, true);
    let k = "";
    if (kategoriacuccos.rows.length > 0) {
        for (const element of kategoriacuccos.rows) {
            k += `<a id="${element.ID_KATEGORIA}" class="px-4 py-2 bg-zinc-300 dark:bg-slate-800 rounded-lg whitespace-nowrap hover:cursor-pointer" onclick="KategoriaKezdolap(${element.ID_KATEGORIA}, '${element.KATEGORIA}')">${element.KATEGORIA}</a>`;
        }
        $("#carousel-track").html(k);
    }
    else { return; }


    if (!JSON.parse(localStorage.getItem("user"))?.loggedIn) { update_gombok(0); }
    KosarTetelDB();
    await Szurok_Torlese();
    await KERESOBAR(false);

    $("#kosar").prop("checked", false);
    $("#kezdolap").prop("checked", true);
    FelaTetore();
    $("#szurok_menu").addClass("eltunt");
    
    $("#keresett_kifejezes").html("");
    KezdolapElemekMegjelenit();

    if (pushHistory) {
        SPAState.currentView = 'home';
        SPAState.currentData = {};
        history.pushState(
            { view: 'home' },
            'Kezdőlap',
            '#home'
        );
    }
}

async function Szurok_Torlese() {
    $("#nev1").val("");
    bepipaltID = "";
    minarr = 0;
    maxarr = 0;
    KategoriaFeltolt("kategoria_section", "check", "",false);
    $("#elf").prop("checked", false);
    $("#innaktiv").prop("checked", false);
    Nemaktivak = false;
    elfogyott = false;
    $("#min_ar").val(0);
    $("#max_ar").val(0);
    $("#min_ar_input").val(0); 
    $("#max_ar_input").val(0);
    await KERESOBAR();
    KezdolapElemekMegjelenit();
}

async function KategoriaKezdolap(id_kategoria, kategoria_nev) {
    $("#nev1").val(kategoria_nev);
    bepipaltID = "";
    await KategoriaFeltolt("kategoria_section", "check", "",false); // minden bepipalt kategoriat kiveszünk
    $(`#katcheck${id_kategoria}`).prop("checked", true);
    await KERESOBAR();
    $("#szurok_menu").removeClass("eltunt");
    KezdolapElemekViszlat();
    $("#kezdolap").prop("checked", false);
    $("#kosar").prop("checked", false);
}

function FelaTetore(target = "top") {
    if (target === "top") {
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
    }
    const el = document.getElementById(target);
    if (!el) return;

    const plusz = 100;
    // elem pozíciója a viewporthoz képest + jelenlegi scroll pozíció - plusz érték 
    const y = el.getBoundingClientRect().top + window.pageYOffset - plusz; 

    window.scrollTo({ top: y, behavior: "smooth" });
}

function Alvas(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function PAUSE() {
    await Alvas(2000);
    Kezdolap();
}