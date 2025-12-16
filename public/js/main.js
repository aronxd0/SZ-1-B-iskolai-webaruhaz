
// globalis valtozok, betolto/frissito/modosito fuggvenyek

const alerts = ["success", "info", "warning", "danger"];
const spinner = `<div id="spinner-overlay" style="position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.6);z-index:9999;display:flex;align-items:center;justify-content:center;backdrop-filter: blur(10px);opacity: 1;"><div class="spinner-border text-primary"></div></div>`;
let bepipaltID = "";
let webbolt_admin = false;
let admin = false;
let elfogyott = false;
let Nemaktivak = false;
let maxarr = 0;
let minarr = 0;
let sqleddig = ""; // változik a lekérdezés akkor újra az 1. oldal aktív
let oldalszam = 0; // összes oldal darabszáma
let Joldal = 1; // jelenlegi oldal

const kezdesek = [ "Szerintem", "Őszintén szólva", "Én úgy látom", "Nekem az a véleményem", "Nyilvánvalóan", "Hát megmondom őszintén, hogy" ];
const cselekvesek = [ "ez a termék", "ez a szolgáltatás", "a funkció", "ez az app", "ez a funkció", "semmiképpen sem" ];
const jelzok = [ "nagyon jó", "elég hasznos", "egészen érdekes", "meglepően hatékony", "egészen korrekt", "használhatatlan" ];
const kozospontok = [ "és", "de", "ráadásul", "viszont", "ugyanakkor" ];
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
        let osszeg = parseInt($(this).html().replaceAll("&nbsp;", "").replaceAll(" ", "")); // 1 500 000 -> 1500000
        sum += osszeg;
    });
    
    // ha vegosszeget akarunk mutatni akkor szamolunk afat
    if (vegossszeg) {
        sum = Math.round(sum * (1 + (await ajax_post(`afa`, 1)).rows[0].AFA / 100));
        $(`#${hova}`).html(`${sum.toLocaleString()} Ft`);
    }
    else {
        $(`#${hova}`).html(`${sum.toLocaleString()} Ft`);
    }
}

// Session-t vizsgáló fuggvény, ha lejárt akkor kijelentkeztet
async function SESSION() {
    if (localStorage.getItem("loggedIn") !== "1") { return; }
    try {
        const js = await ajax_post('/check_session', 1);
        const localBoot = localStorage.getItem('serverBoot') || '';
        if (!js.active || (localBoot && String(js.serverBoot) !== String(localBoot))) {
            // Biztonságos logout: törölj minden user-infót
            localStorage.removeItem('loggedIn');
            localStorage.removeItem('userName');
            localStorage.removeItem('userEmail');
            localStorage.removeItem("userGroup");
            localStorage.removeItem('serverBoot');
            localStorage.removeItem('isAdmin');
            localStorage.removeItem('isWebAdmin');
            console.log(js);
            alert('A munkamenet lejárt vagy a szerver újraindult. Kérlek jelentkezz be újra.');
            location.reload(); // frissít, így a UI vendég módra vált
        }
    } catch (err) {
        console.error('Session check hiba', err);
    }
}


function SUM(lista) {
    let sum = 0;
    for (const element of lista) {
        sum += element;
    }
    return sum;
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


function KeresonekSQLCraft() {
    const inputok = kategoria_section.getElementsByTagName("input");
    bepipaltID = ""; //reset bepipalt kategória
    for (var elem of inputok) {
        if (elem.checked) { bepipaltID += `${elem.id}-`; }// amit be vannak checkelve azt beleteszem a bepipát kategóriákba 
    }
    let nemaktiv = "";//reset
    if (Nemaktivak) { nemaktiv = "&inaktiv=1"; }

    let elfogy = ""
    if (elfogyott){ elfogy = "&elfogyott=1"; }

    return `keres?nev=${$("#nev1").val()}&kategoria=${bepipaltID}${elfogy}${nemaktiv}`;
}


async function KERESOBAR() {
    $("#cart_button").closest(".gombdiv").removeClass("aktiv");
    $("#admin_button").closest(".gombdiv").removeClass("aktiv");
    $("#home_button").closest(".gombdiv").addClass("aktiv");

    var min = document.getElementById("min_ar_input").value == 0 ? "" : document.getElementById("min_ar_input").value; 
    var max = document.getElementById("max_ar_input").value == 0 ? "" : document.getElementById("max_ar_input").value; 
    var elküld = KeresonekSQLCraft();

    //elküldöm az sql-t offset, limit nélkül és az eddig beállított min max árakat
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

    //lekérdezes az új max és min árat
    min = document.getElementById("min_ar_input").value == 0 ? "" : document.getElementById("min_ar_input").value; 
    max = document.getElementById("max_ar_input").value == 0 ? "" : document.getElementById("max_ar_input").value; 
    
    var elküld2 = `${KeresonekSQLCraft()}${order}&minar=${min}&maxar=${max}`;

    if (sqleddig != elküld2) { Joldal = 1; } // ha változik a lekérdezés akkor az oldal újra 1-re állitása 
    sqleddig = elküld2;

    elküld2 += `&offset=${(Joldal-1)}`;
    try {
        let adatok = await ajax_post(elküld2 , 1);
        if (adatok.rows.length == 0) {// ha nincs találat akkor az árakat újra lekérdezem limit nélkül
            ArFeltolt(elküld,-1,Number.MAX_SAFE_INTEGER);
            Joldal = 1;
        } 
        await CARD_BETOLT(adatok);
        OLDALFELTOLT(adatok.maxcount);
        KategoriaFeltolt("kategoria_section", "check", "",true);    
    } catch (err) { console.log("hiba:", err); }
}

//#region OLdelkezelés
function OLDALFELTOLT(darab){
    oldalszam = Math.ceil(darab / 52); // oldalszám kiszámolása
    if (oldalszam == 0) oldalszam = 1; // ha 0 akkor 1-re állitom

    // alul a lapválastó feltöltése
    var pp = `
        <ul class="pagination justify-content-center">
            <!-- Első oldalra navigálás -->
            <li class="page-item  shadow-xl" style="border: none;">
                <a class="page-link bg-zinc-300 text-slate-900 dark:bg-slate-900 dark:text-zinc-200 dark:hover:bg-gray-800 hover:bg-gray-200 hover:outline outline-black/10 hover:text-slate-900 transition-hover duration-300 ease-in-out" id="Vissza2" onclick="Kovi(this)"> << </a>
            </li>
            
            <!-- Előző oldalra navigálás -->
            <li class="page-item shadow-xl">
                <a class="page-link bg-zinc-300 text-slate-900 dark:bg-slate-900 dark:text-zinc-200 dark:hover:bg-gray-800 hover:bg-gray-200 hover:outline outline-black/10 hover:text-slate-900 transition-hover duration-300 ease-in-out" id="vissza1" onclick="Kovi(this)">Előző</a>
            </li>
            
            <!-- Jelenlegi oldal és összes oldal száma -->
            <li class="page-item shadow-xl">
                <a class="page-link d-flex bg-zinc-300 text-slate-900 dark:bg-slate-900 dark:text-zinc-200 dark:hover:bg-gray-800 hover:bg-gray-200 hover:outline outline-black/10 hover:text-slate-900 transition-hover duration-300 ease-in-out"><b id="Mostoldal">${Joldal}</b> / <span id="DBoldal">${oldalszam}</span></a>
            </li>
            
            <!-- Következő oldalra navigálás -->
            <li class="page-item  shadow-xl">
                <a class="page-link bg-zinc-300 text-slate-900 dark:bg-slate-900 dark:text-zinc-200 dark:hover:bg-gray-800 hover:bg-gray-200 hover:outline outline-black/10 hover:text-slate-900 transition-hover duration-300 ease-in-out" id="Kovi1" onclick="Kovi(this)">Következő</a>
            </li>

            <!-- Utolsó oldalra navigálás -->
            <li class="page-item shadow-xl">
                <a class="page-link bg-zinc-300 text-slate-900 dark:bg-slate-900 dark:text-zinc-200 dark:hover:bg-gray-800 hover:bg-gray-200 hover:outline outline-black/10 hover:text-slate-900 transition-hover duration-300 ease-in-out" id="Kovi2" onclick="Kovi(this)"> >> </a>
            </li>
        </ul>`;

    $("#pagi").html(pp);

    if(Joldal == 1){ // ha az 1. oldalon van akkor a vissza gombok inaktívak
        document.querySelector(".page-item:nth-child(2)").classList.add("disabled");
        document.querySelector(".page-item:nth-child(1)").classList.add("disabled");
    }

    if(Joldal == oldalszam){ // ha az utolsó oldalon van akkor a következő gombok inaktívak
        document.querySelector(".page-item:nth-child(4)").classList.add("disabled");
        document.querySelector(".page-item:nth-child(5)").classList.add("disabled");
    }
}

function Kovi(keri) {
    FelaTetore();
    switch(keri.id){

        // következő oldal
        case("Kovi1"): if (Joldal < oldalszam) { Joldal++; KERESOBAR(); return; }

        // Jelenlegi oldal
        case("Kovi2"): Joldal = oldalszam; KERESOBAR(); return;
        
        // előző oldal
        case("vissza1"): if (Joldal > 1) { Joldal--; KERESOBAR(); return; }
        
        // első oldal
        case("Vissza2"): Joldal = 1; KERESOBAR(); return;
    }
}
//endregion

//region Szürés
async function ArFeltolt(sql, min ,max){
    try {
        var arak = await ajax_post(sql+"&maxmin_arkell=1", 1);//arak lekérdezése limit offset nélkül
        
      

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


    } catch (err) { 
        console.log("hiba:", err);
        $("#welcome_section").fadeOut(300);
        $("#content_hely").fadeOut(300, function() {
            $("#content_hely").html(`
                <div class="col-12 d-flex justify-content-center align-items-center flex-column">
                    <span class="p-3" style="font-size:70px; font-weight:bold;">404</span>
                    <span class="alert alert-danger">${err}</span>
                    <a href="https://mail.google.com/mail/?view=cm&fs=1&to=csanywebbolt@gmail.com" target="_blank">
                        Hiba jelentése
                    </a>
                </div>`).fadeIn(300);
        });
        
        $("#fejlec1").fadeOut(300);
        $("#fejlec2").fadeOut(300);
        $('#login_modal').modal('hide');
        
     }
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
                bepipaltID += `${elem.id}-`;// amit be vannak checkelve azt beleteszem a bepipát kategóriákba
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
             let k_json = await ajax_post(`kategoria?nev=${$("#nev1").val()}${elfogyt}${nemaktivt}`, 1);
            for (let i = 0; i < k_json.rows.length; ++i) {
                var pipa = ""
              
                if(k_json.rows[i].ID_KATEGORIA == bepipaltID.split("-").find(e => e == k_json.rows[i].ID_KATEGORIA)){
                    pipa = "checked";
                }

                listItems += `<p class="p-2"> <input onchange="KatbolAR()"
                class="
                form-check-input 
                outline 
                outline-[1px] 
                outline-black/10 
                bg-zinc-200 
                dark:outline 
                dark:outline-[1px] 
                dark:outline-zinc-100/5  
                dark:bg-slate-800 
                " type="checkbox" id="${k_json.rows[i].ID_KATEGORIA}" ${pipa} name="${k_json.rows[i].KATEGORIA}">  <label class="form-check-label" for="${k_json.rows[i].ID_KATEGORIA}"> ${k_json.rows[i].KATEGORIA} </label> </p>`;
            }
            
        }
        else {
            listItems += `<option value="" disabled>-</option>`;
            let k_json = await ajax_post(`kategoria`, 1);
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

async function Kezdolap() {
    console.log("Kezdolap lefutott");
    $("#keresett_kifejezes").html();
    $("#welcome_section").fadeIn(300);
    $("#kateogoria-carousel").fadeIn(300);
    $("#felsosor").removeClass("mt-[100px]");
    nev1.value = "";
    bepipaltID = "";
    KERESOBAR();

    let kategoriacuccos = await ajax_post(`kategoria`, 1);
    let k = "";
    if (kategoriacuccos.rows.length > 0) {
        for (const element of kategoriacuccos.rows) {
            k += `<a id="${element.ID_KATEGORIA}" class="px-4 py-2 bg-zinc-300 dark:bg-slate-800 rounded-lg whitespace-nowrap hover:cursor-pointer" onclick="KategoriaKezdolap(${element.ID_KATEGORIA})">${element.KATEGORIA}</a>`;
        }
        $("#carousel-track").html(k);
    }
    else { return; }

    if (!localStorage.getItem("loggedIn")) { update_gombok(0); }
    
    
      // var cuccos = ajax_post("keres" + "?order=-1", 1 ); ha alapból szeretnék szűrni fontos !!!
    
}

async function KategoriaKezdolap(id_kategoria) {
    bepipaltID = "";
    await KategoriaFeltolt("kategoria_section", "check", "",false); // minden bepipalt kategoriat kiveszünk
   
document
  .getElementById('kategoria_section')
  .querySelector('[id="' + id_kategoria + '"]').checked = true;
    KERESOBAR();
    
}

function FelaTetore() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
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










