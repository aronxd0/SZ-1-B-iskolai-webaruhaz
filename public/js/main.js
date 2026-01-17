// globalis valtozok, betolto/frissito/modosito fuggvenyek

const alerts = ["success", "info", "warning", "danger"];
let bepipaltID = "";
let webbolt_admin = false;
let admin = false;
let elfogyott = false;
let Nemaktivak = false;
let maxarr = 0;
let minarr = 0;

const SPAState = {
    currentView: 'home',
    currentData: {}
};

// endregion
let sqleddig = ""; // változik a lekérdezés akkor olad újra az 1. oldal
let oldalszam = 0; // összes oldal darabszáma
let Joldal = 1; // jelenlegi oldal

const kezdesek = [
  "Szerintem", "Őszintén szólva", "Én úgy látom", 
  "Nekem az a véleményem", "Nyilvánvalóan", "Hát megmondom őszintén, hogy"
];
const cselekvesek = [
  "ez a termék", "ez a szolgáltatás", "a funkció", 
  "ez az app", "ez a funkció", "semmiképpen sem"
];
const jelzok = [
  "nagyon jó", "elég hasznos", "egészen érdekes", 
  "meglepően hatékony", "egészen korrekt", "használhatatlan"
];
const kozospontok = [
  "és", "de", "ráadásul", "viszont", "ugyanakkor"
];
const zaro = [".", "!", " 😊", " 😎", "."]


function randomElem(tomb) {
  return tomb[Math.floor(Math.random() * tomb.length)];
}


function RandomVelemeny() {
  const templateek = [
    "{kezdes} {cselekves} {jelzo}{zaro}",
    "{kezdes}, {cselekves} {kozospont} {jelzo}{zaro}",
    "{kezdes} {cselekves} szerint {jelzo}{zaro}"
  ];
  
  const template = randomElem(templateek);
  
  return template
    .replace("{kezdes}", randomElem(kezdesek))
    .replace("{cselekves}", randomElem(cselekvesek))
    .replace("{jelzo}", randomElem(jelzok))
    .replace("{kozospont}", randomElem(kozospontok))
    .replace("{zaro}", randomElem(zaro));
}


async function AR_SUM(osztaly, hova, vegossszeg) {
    let sum = 0;
    
    $(`.${osztaly}`).each(function () {
        let osszeg = parseInt($(this).html().replaceAll("&nbsp;", "").replaceAll(" ", "").replaceAll(",", ""));
        
        sum += osszeg;
        
    });
    
    if (vegossszeg) {
        sum = Math.round(sum * (1 + (await ajax_call(`afa`, "GET", null, true)).rows[0].AFA / 100));
        $(`#${hova}`).html(`${sum.toLocaleString()} Ft`);
    }
    else {
        $(`#${hova}`).html(`${sum.toLocaleString()} Ft`);
    }
    
}




async function SESSION() {
    if (!JSON.parse(localStorage.getItem("user"))?.loggedIn) { return; }

        try {

            const js = await ajax_call('/check_session', "GET", null, true);
            //const js = await session_check.json();

            const localBoot = JSON.parse(localStorage.getItem('user'))?.serverBoot || '';
            if (!js.active || (localBoot && String(js.serverBoot) !== String(localBoot))) {
                // Biztonságos logout: törölj minden user-infót
                localStorage.removeItem("user");
                console.log(js);

                alert('A munkamenet lejárt vagy a szerver újraindult. Kérlek jelentkezz be újra.');
                location.reload(); // frissít, így a UI vendég módra vált
            }

        } catch (err) {
            console.error('Session check hiba', err);
            // Ha a szerver teljesen down, nem muszáj azonnal logoutolni; várj a következő tickre
         }
}

async function Admin_ellenorzes() { 
    let adminell = await ajax_call("admin_check", "GET", null, true); 
    return adminell; 
}

async function F5() {

    if (JSON.parse(localStorage.getItem("user") || "{}")?.loggedIn) { 
        
        bejelentkezett_usernev = JSON.parse(localStorage.getItem("user") || "{}")?.name || "";
        bejelentkezett_useremail = JSON.parse(localStorage.getItem("user") || "{}")?.email || "";
        csoport = JSON.parse(localStorage.getItem("user") || "{}")?.group || "";

        
        const ae = await Admin_ellenorzes();
        
        if (ae.admin) { admin = true; }
        if (ae.webadmin) { webbolt_admin = true; }

        console.log(ae);

        

        if ((JSON.parse(localStorage.getItem("user") || "{}")?.ui.theme) == "dark") { 
            $("html").addClass("dark");
            $("#switch").html(`<i class="bi bi-sun-fill"></i> Téma`); 
            user.ui = { ...user.ui, theme: "dark" };
        }
        else {
            $("html").removeClass("dark");
            $("#switch").html(`<i class="bi bi-moon-fill"></i> Téma`);
            user.ui = { ...user.ui, theme: "light" };
        }

        console.log(admin);
        console.log(webbolt_admin);

        BevaneJelentkezve();
        Kezdolap();
    }
    else {
        $('#login_modal').modal('show');
    };
}


function RangokHTML(rang, szovegmeret) {
    let ranghtml = "";
    switch (rang) {
        case "Students": ranghtml = `<span class="inline-flex items-center rounded-md bg-blue-400/10 px-2 py-1 text-${szovegmeret} font-medium text-blue-400 !border !border-blue-400/30">● ${rang}</span>`; break;
        case "Teachers": ranghtml = `<span class="inline-flex items-center rounded-md bg-yellow-400/10 px-2 py-1 text-${szovegmeret} font-medium text-yellow-600 !border !border-yellow-600/40">● ${rang}</span>`; break;
        case "Bosses": ranghtml = `<span class="inline-flex items-center rounded-md bg-indigo-400/10 px-2 py-1 text-${szovegmeret} font-medium text-indigo-400 !border !border-indigo-400/30">● ${rang}</span>`; break;
        case "Admin": ranghtml = `<span class="inline-flex items-center rounded-md bg-red-400/10 px-2 py-1 text-${szovegmeret} font-medium text-red-400 !border !border-red-400/20">● Admin</span>`; break;
        case "Webbolt Admin": ranghtml = `<span class="inline-flex items-center rounded-md bg-purple-400/10 px-2 py-1 text-${szovegmeret} font-medium text-purple-400 !border !border-purple-400/30">● ${szovegmeret == "xs" ? "<span class='sm:hidden'>W. Admin</span> <span class='hidden sm:inline'>Webbolt Admin</span>" : "Webbolt Admin"}</span>`; break;
    }
    return ranghtml;
}




function update_gombok (x) {

    // a "d-inline-block" class-t ha leveszem akkor eltunik ha hozzaadom akkor megjelenik

    if (x == 0) { // vendeg
       
        
        $("#kosar-gombdiv").removeClass("d-inline-block").addClass("eltunt");

        $("#sql-gombdiv").removeClass("d-inline-block").addClass("eltunt");
        $("#stat-gombdiv").removeClass("d-inline-block").addClass("eltunt");
        $("#ujtermek-gombdiv").removeClass("d-inline-block").addClass("eltunt");
        $("#velemeny-gombdiv").removeClass("d-inline-block").addClass("eltunt");

        
        $("#admin-gombdiv").removeClass("d-inline-block").addClass("eltunt");
        $("#rendeles-gombdiv").removeClass("d-inline-block").addClass("eltunt");
        
    }
    if (x == 1) { // sima user
        
        $("#kosar-gombdiv").addClass("d-inline-block").removeClass("eltunt");
        $("#rendeles-gombdiv").addClass("d-inline-block").removeClass("eltunt");
        $("#sql-gombdiv").removeClass("d-inline-block").addClass("eltunt");
        $("#stat-gombdiv").removeClass("d-inline-block").addClass("eltunt");
        $("#ujtermek-gombdiv").removeClass("d-inline-block").addClass("eltunt");
        $("#velemeny-gombdiv").removeClass("d-inline-block").addClass("eltunt");
       
        $("#admin-gombdiv").removeClass("d-inline-block").addClass("eltunt"); 
    }
    if (x == 2) { // admin
        
        $("#kosar-gombdiv").addClass("d-inline-block").removeClass("eltunt");
        $("#rendeles-gombdiv").addClass("d-inline-block").removeClass("eltunt");
        
        $("#admin-gombdiv").addClass("d-inline-block").removeClass("eltunt");
        $("#sql-gombdiv").addClass("d-inline-block").removeClass("eltunt");
        $("#stat-gombdiv").addClass("d-inline-block").removeClass("eltunt");
        $("#ujtermek-gombdiv").addClass("d-inline-block").removeClass("eltunt");
        $("#velemeny-gombdiv").addClass("d-inline-block").removeClass("eltunt");
    }
    
}


function KeresonekSQLCraft(){

    // ez van használva a KERESOBAR fuggvényben is
    //                      Árfeltölt fügyvényben is 




    const inputok = kategoria_section.getElementsByTagName("input")//lekérdezes a chechboksot
    bepipaltID = ""; //reset bepipalt kategória
    for(var elem of inputok){
        if(elem.checked) {
            bepipaltID += `${elem.id.replace("katcheck","")}-`;// amit be vannak checkelve azt beleteszem a bepipát kategóriákba
        }
    }
    var nemaktiv = "";//reset
    if (Nemaktivak) {
     nemaktiv = "&inaktiv=1";
    }
    var elfogy = ""
    if (elfogyott){
        elfogy = "&elfogyott=1";
    }
    // elfogyot + nemaktive chechbox bepipálásának megnézése

    
  
    //console.log (document.getElementById("min_ar").value +  "amire szor ")
   

    
    return "keres?nev="+ nev1.value+"&kategoria="+bepipaltID+ elfogy + nemaktiv;


}


async function KERESOBAR(updateHistory = true) {
    console.log("KERESOBAR lefutott");
    $("#cart_button").closest(".gombdiv").removeClass("aktiv");
    $("#admin_button").closest(".gombdiv").removeClass("aktiv");
    $("#home_button").closest(".gombdiv").addClass("aktiv");
  
    $("#nezetkicsi").removeClass("eltunt");
    $("#nezetnagy").removeClass("eltunt");

    

    var min = document.getElementById("min_ar_input").value == 0? "" : document.getElementById("min_ar_input").value; 
    var max = document.getElementById("max_ar_input").value == 0? "" : document.getElementById("max_ar_input").value; 
    var elküld = KeresonekSQLCraft();

    //elküldöm az sql-t offset, limit nélkül és az eddig beállított min max árakat
    await ArFeltolt(elküld, min , max);



    var order = "";
    //console.log(document.getElementById("rend").value);
    switch($("#rend").val()){
        case("ar_nov"): order = "&order=1"; break;
        case("ar_csok"): order = "&order=-1"; break;
        case("abc"): order = "&order=2"; break;
        case("abc_desc"): order = "&order=-2"; break;
        case("db_nov"): order = "&order=3"; break;
        case("db_csok"): order = "&order=-3"; break;
        default: order = "";
    }


     min = document.getElementById("min_ar_input").value == 0? "" : document.getElementById("min_ar_input").value; 
     max = document.getElementById("max_ar_input").value == 0? "" : document.getElementById("max_ar_input").value; 
    //lekérdezes az új max és min árat
    
    var elküld2 = KeresonekSQLCraft()+order+"&minar="+ min +"&maxar="+ max;
    if(sqleddig != elküld2){ // ha változik a lekérdezés akkor az oldal újra 1-re állitása
        Joldal = 1;
    }
    sqleddig = elküld2;
    // ha megváltozott a lekérdezés akkor az oldal újra 1-re állitása

    elküld2 += `&offset=${(Joldal-1)}`
    console.log("elküld2: "+ elküld2);
    try {
        var adatok = await ajax_call(elküld2 , "GET", null, true);
        if(adatok.rows.length == 0){// ha nincs találat akkor az árakat újra lekérdezem limit nélkül
            ArFeltolt(elküld,-1,Number.MAX_SAFE_INTEGER);
            Joldal = 1;
        } 
        await CARD_BETOLT(adatok);
        OLDALFELTOTL(adatok.maxcount);
        KategoriaFeltolt("kategoria_section", "check", "",true);    
    } catch (err) { console.log("hiba:", err); }
    
    

    /*
    ajax_post(elküld , 1, function(adatok){ 
        CARD_BETOLT(adatok);
    } ); 
     */

    if (!updateHistory) return;

    const keresesErtek = $("#nev1").val();
    const minInput = $("#min_ar_input").val();
    const maxInput = $("#max_ar_input").val();
    const arSzuresVan = (minInput != "" && minInput != minarr) || (maxInput != "" && maxInput != maxarr);
    
    const vanSzures = keresesErtek != "" || bepipaltID != "" || 
                  arSzuresVan || 
                  elfogyott || 
                  Nemaktivak || 
                  ($("#rend").val() != "" && $("#rend").val() != null);
    
    if (vanSzures) {
        SPAState.currentView = 'search';
        SPAState.currentData = {
            searchTerm: keresesErtek,
            categories: bepipaltID,
            minPrice: min,
            maxPrice: max,
            order: $("#rend").val(),
            elfogyott: elfogyott,
            nemaktivak: Nemaktivak
        };
        
        history.pushState(
            { 
                view: 'search',
                data: SPAState.currentData
            },
            keresesErtek ? `Keresés: ${keresesErtek}` : 'Szűrés',
            keresesErtek ? `#search?q=${encodeURIComponent(keresesErtek)}` : '#search'
        );
    } else {
        SPAState.currentView = 'home';
        SPAState.currentData = {};
        history.pushState(
            { view: 'home' },
            'Kezdőlap',
            '#home'
        );
    }
    
    
    console.log("elküldve: "+ elküld);
}
//endregion

/*
async function KERESOBAR_WithHistory() {
    await KERESOBAR(); // Eredeti függvény
    
    // Ha van keresési feltétel, push to history
    if ($("#nev1").val() || bepipaltID) {
        SPAState.currentView = 'search';
        SPAState.currentData = {
            searchTerm: $("#nev1").val(),
            categories: bepipaltID,
            minPrice: $("#min_ar_input").val(),
            maxPrice: $("#max_ar_input").val(),
            order: $("#rend").val()
        };
        
        history.pushState(
            { 
                view: 'search',
                data: SPAState.currentData
            },
            'Keresés',
            `#search?q=${encodeURIComponent($("#nev1").val() || '')}`
        );
    }
}
*/


//#region OLdelkezelés

function OLDALFELTOTL(darab){


     oldalszam = Math.ceil( darab /52); // oldalszám kiszámolása
      if(oldalszam == 0) oldalszam = 1; // ha 0 akkor 1-re állitom

     var pp = 


    
    `


        <ul class="pagination justify-content-center gap-2 select-none">

        <!-- Elejére -->
        <li class="page-item" >
            <a id="Vissza2" onclick="Kovi(this)"
            class="page-link px-3 py-2 rounded-xl !border !border-transparent 
            bg-zinc-50 text-slate-900
            dark:bg-zinc-950 dark:text-zinc-200
            hover:bg-slate-900 hover:text-white
            dark:hover:bg-gray-800 dark:!border-zinc-200/10 dark:hover:!border-zinc-200/20 
            transition-all duration-200 shadow-sm cursor-pointer" >
                «
            </a>
        </li>

        <!-- Előző -->
        <li class="page-item">
            <a id="vissza1" onclick="Kovi(this)"
            class="page-link px-3 py-2 rounded-xl !border !border-transparent 
            bg-zinc-50 text-slate-900
            dark:bg-zinc-950 dark:text-zinc-200
            hover:bg-slate-900 hover:text-white
            dark:hover:bg-gray-800 dark:!border-zinc-200/10 dark:hover:!border-zinc-200/20 
            transition-all duration-200 shadow-sm cursor-pointer">
                
                <i class="bi bi-caret-left-fill"></i>
                <span class="d-none d-lg-inline">Előző</span>
            </a>
        </li>

        <!-- Aktuális oldal -->
        <li class="page-item">
            <span
                class="page-link px-4 py-2 rounded-xl !border !border-transparent 
                bg-slate-900 text-white font-semibold 
                hover:bg-slate-900 hover:text-white dark:!border-zinc-200/10 dark:bg-gray-800 
                shadow-md cursor-default">
                <b id="Mostoldal">${Joldal}</b>
                <span class="opacity-70 mx-1">/</span>
                <span id="DBoldal">${oldalszam}</span>
            </span>
        </li>

        <!-- Következő -->
        <li class="page-item">
            <a id="Kovi1" onclick="Kovi(this)"
            class="page-link px-3 py-2 rounded-xl !border !border-transparent 
            bg-zinc-50 text-slate-900
            dark:bg-zinc-950 dark:text-zinc-200
            hover:bg-slate-900 hover:text-white
            dark:hover:bg-gray-800 dark:!border-zinc-200/10 dark:hover:!border-zinc-200/20 
            transition-all duration-200 shadow-sm cursor-pointer">
                <span class="d-none d-lg-inline">Következő</span>
                <i class="bi bi-caret-right-fill"></i>
                
            </a>
        </li>

        <!-- Végére -->
        <li class="page-item">
            <a id="Kovi2" onclick="Kovi(this)"
            class="page-link px-3 py-2 rounded-xl !border !border-transparent 
            bg-zinc-50 text-slate-900
            dark:bg-zinc-950 dark:text-zinc-200
            hover:bg-slate-900 hover:text-white
            dark:hover:bg-gray-800 dark:!border-zinc-200/10 dark:hover:!border-zinc-200/20 
            transition-all duration-200 shadow-sm cursor-pointer">
                »
            </a>
        </li>

    </ul>

            `;
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
    FelaTetore("felsosor");
    switch(keri.id){
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
            return
        
   
    }
}
//endregion
//region Szürés



async function ArFeltolt(sql, min ,max){
    try {
        var arak = await ajax_call(sql+"&maxmin_arkell=1", "GET", null, true);//arak lekérdezése limit offset nélkül
        
        if (minarr === 0) minarr = arak.rows[0].MINAR;
        if (maxarr === 0) maxarr = arak.rows[0].MAXAR;

        if(min == ""){// ha még nem volt minar akkor a minar = legkisebb ár
            min = arak.rows[0].MINAR;
        }
        if(max == ""){// ha még nem volt maxar akkor a maxar = legnagyobb ár
            max = arak.rows[0].MAXAR;
        }
        
        console.log(arak.rows[0].MINAR + " - " + "minar");


        if(arak.rows[0].MINAR == null){// ha nincs találat akkor a max és min ár 0 legyen
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

        //console.log("elküldve: "+ sql+"&maxmin_arkell=1");

        var elozomin = parseInt( document.getElementById("min_ar").min)// lekérdezes a csuszak minimum értékét mielött megváltoztatom
        if(elozomin == min || min > arak.rows[0].MAXAR){// ha az előző minimum érték = a mostani minimum érték vagy a mostani minimum nagyobb mint a lekérdezett utáni maximum akkor a minimum legyen a lekérdezett minimuma
            min = arak.rows[0].MINAR
        }
        var elozomax = parseInt( document.getElementById("max_ar").max)// lekérdezes a csuszak maximum értékét mielött megváltoztatom
        if(elozomax == max){// ha az előző maximum érték = a mostani maximum érték akkor a maximum legyen a lekérdezett maximuma
            max = arak.rows[0].MAXAR
        }


        document.getElementById("min_ar").min = arak.rows[0].MINAR;
        document.getElementById("min_ar").max = arak.rows[0].MAXAR;

        document.getElementById("max_ar").max = arak.rows[0].MAXAR;
        document.getElementById("max_ar").min = arak.rows[0].MINAR; 


        if(parseInt(min) < parseInt( arak.rows[0].MINAR )){// ha a mostani minimum kisebb mint a lekérdezett minimum akkor a minimum legyen a lekérdezett minimuma
           document.getElementById("min_ar").value = arak.rows[0].MINAR;
           min = arak.rows[0].MINAR
        }
        else{// ha a aktiv/mostani minimum nagyobb mint a lekérdezett minimum akkor a minimum legyen a mostani minimum
            
            document.getElementById("min_ar").value = min;
        }
        if(parseInt(max) > parseInt( arak.rows[0].MAXAR )){// ha a mostani maximum nagyobb mint a lekérdezett maximum akkor a maximum legyen a lekérdezett maximuma
           document.getElementById("max_ar").value = arak.rows[0].MAXAR;
           max = arak.rows[0].MAXAR
        }
        else{// ha a aktiv/mostani maximum kisebb mint a lekérdezett maximum akkor a maximum legyen a mostani maximum
            
            document.getElementById("max_ar").value = max;
        }     
        document.getElementById("min_ar_input").value = min;
        document.getElementById("max_ar_input").value =max;


    } catch (err) { console.log("hiba:", err); }
}

function Sliderninput( item ){
    if(item.id == "min_ar_input"){
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
            if(parseInt ($("#min_ar").val()) > parseInt( $("#max_ar").val())){
                $("#max_ar").val(parseInt( $("#min_ar").val()) +1 );  
                $("#max_ar_input").val($("#max_ar").val());
            }  

            if($("#min_ar").val() == document.getElementById("min_ar").min){
                $("#min_ar_input").val($("#min_ar").attr("min"));
            }
            if($("#min_ar").val() == document.getElementById("min_ar").max){
                $("#min_ar_input").val($("#min_ar").attr("max"));
            }          
            break;
        }
        case("max"): {
            if(parseInt ($("#max_ar").val()) < parseInt( $("#min_ar").val())){
                $("#min_ar").val(parseInt( $("#max_ar").val())-1 );  
                $("#min_ar_input").val($("#min_ar").val());
            }

            if($("#max_ar").val() == document.getElementById("max_ar").min){
                $("#max_ar_input").val($("#max_ar").attr("min"));
            }
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
    if(mindenkipipal){// ha mindenkipipal == false  ==> akkor ne frissítse a bepipált kategóriákat, mindenlegyen kikattintva, üres
        for(var elem of inputok){
            if(elem.checked) {
                bepipaltID += `${elem.id.replace("katcheck","")}-`;// amit be vannak checkelve azt beleteszem a bepipát kategóriákba
            }
        }
    }
   
   
    $(`#${hova}`).empty("");
    var nemaktivt = "";//reset
    if (Nemaktivak) {
     nemaktivt = "&inaktiv=1";
    }

   
    var elfogyt = ""
    if (elfogyott){
        elfogyt = "&elfogyott=1";
    }
    try {

        console.log(`&minar=${document.getElementById("min_ar").value}`)
       
        let listItems  = "";

        if (type == "check") {
             let k_json = await ajax_call(`kategoria?nev=${$("#nev1").val()}${elfogyt}${nemaktivt}`, "GET", null, true);
            for (let i = 0; i < k_json.rows.length; ++i) {
                var pipa = ""
              
                if(k_json.rows[i].ID_KATEGORIA == bepipaltID.split("-").find(e => e == k_json.rows[i].ID_KATEGORIA)){
                    pipa = "checked";
                }

                listItems += `<p class="p-2 !border-b !border-b-zinc-800/10 dark:!border-b dark:!border-b-zinc-200/10 dark:!border-t-0 dark:!border-r-0 dark:!border-l-0 mb-3 has-[:checked]:!border-b-sky-600 dark:has-[:checked]:!border-b-sky-600 transition-all duration-300 ease-in-out"> 
                <input onchange="KatbolAR()"
                class="
                form-check-input 
                !border  
                !border-zinc-800/20 
                bg-zinc-200 
                hover:cursor-pointer 
                dark:!border  
                dark:!border-zinc-200/30 
                dark:checked:!border-sky-600      
                dark:bg-slate-800 
                focus:outline-none 
                focus:ring-0
                focus:ring-offset-0
                focus:shadow-none
                " type="checkbox" id="katcheck${k_json.rows[i].ID_KATEGORIA}" ${pipa} name="${k_json.rows[i].KATEGORIA}">  <label class="form-check-label hover:cursor-pointer " for="katcheck${k_json.rows[i].ID_KATEGORIA}"> ${k_json.rows[i].KATEGORIA} </label> </p>`;
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
        
    } catch (err) { console.log("hiba:", err); }                     
      
}

function KatbolAR(){

    var min = document.getElementById("min_ar_input").value == 0? "" : document.getElementById("min_ar_input").value; 
    var max = document.getElementById("max_ar_input").value == 0? "" : document.getElementById("max_ar_input").value; 
    ArFeltolt(KeresonekSQLCraft(), min,max );// árak újra feltöltése limit nélkül
}


function Elfogyott(alma){
    if(alma.value == "Csakelfogyott"){// csakelfogyotttakat szeretné látni
        elfogyott = !elfogyott; 
        if(elfogyott){
            document.getElementById("darable").disabled = true; // ne lehessen darabra szűrni
            document.getElementById("darabfel").disabled = true;
            if(document.getElementById("darable").selected == true || document.getElementById("darabfel").selected == true){// ha darabra volt szűrve akkor állítsa vissza a rendezettséget
                document.getElementById("rendalap").selected = true;
            }
           
        }
        else{// már nem csak elfogyottakat szeretné látni akkor újra engedélyezem a darabra szűrést
            document.getElementById("darable").disabled = false;
            document.getElementById("darabfel").disabled = false;
        }
    }
    else{//  inaktivak vannak bepipálva 

        Nemaktivak = !Nemaktivak;
        
       
    }
    KategoriaFeltolt("kategoria_section", "check", "",true);
}

async function Kezdolap(pushHistory = true) {
    console.log("Kezdolap lefutott");
    $("#keresett_kifejezes").html();
    $("#welcome_section").fadeIn(300);
    $("#kateogoria-carousel").fadeIn(300);
    $("#felsosor").removeClass("mt-[100px]");
    nev1.value = "";
    bepipaltID = "";
    
    // Itt hívjuk meg a keresőbárt, de jelezzük neki, hogy most ne piszkálja a history-t,
    // mert mi fogjuk manuálisan beállítani a #home-ot.
    await KERESOBAR(false);
    

    let kategoriacuccos = await ajax_call(`kategoria`, "GET", null, true);
    let k = "";
    if (kategoriacuccos.rows.length > 0) {
        for (const element of kategoriacuccos.rows) {
            k += `<a id="${element.ID_KATEGORIA}" class="px-4 py-2 bg-zinc-300 dark:bg-slate-800 rounded-lg whitespace-nowrap hover:cursor-pointer" onclick="KategoriaKezdolap(${element.ID_KATEGORIA})">${element.KATEGORIA}</a>`;
        }
        $("#carousel-track").html(k);
    }
    else { return; }

    if (!JSON.parse(localStorage.getItem("user"))?.loggedIn) { update_gombok(0); }
    
    KosarTetelDB();
    
    if (pushHistory) {
        SPAState.currentView = 'home';
        SPAState.currentData = {};
        history.pushState(
            { view: 'home' },
            'Kezdőlap',
            '#home'
        );
    }
      // var cuccos = ajax_post("keres" + "?order=-1", 1 ); ha alapból szeretnék szűrni fontos !!!
    
}

async function Szurok_Torlese() {
    KategoriaFeltolt("kategoria_section", "check", "",false);
    $("#nev1").val("");
    elfogyott = false; 
    $("#elf").prop("checked", false);
    $("#innaktiv").prop("checked", false);
    Nemaktivak = false;
    await ArFeltolt(KeresonekSQLCraft(), "", "");
    
    KERESOBAR();
    
}

async function KategoriaKezdolap(id_kategoria) {
    bepipaltID = "";
    await KategoriaFeltolt("kategoria_section", "check", "",false); // minden bepipalt kategoriat kiveszünk
   
    /*document
  .getElementById('kategoria_section')
  .querySelector(`[id="katcheck${id_kategoria}"]`).checked = true; */

    $(`#katcheck${id_kategoria}`).prop("checked", true);
    KERESOBAR();

    console.log(document
        .getElementById('kategoria_section')
        .querySelector(`[id="katcheck${id_kategoria}"]`).checked = true);
    
}

function FelaTetore(target = "top") {
    console.log("FelaTetore lefutott");
    if (target === "top") {
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
    }

    const el = document.getElementById(target);
    if (!el) return;

    el.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });
}


function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}


async function PAUSE() {
    console.log("várunk...");
    await sleep(2000);
    Kezdolap();
    console.log("ennyi volt");
}










