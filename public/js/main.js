// globalis valtozok, betolto/frissito/modosito fuggvenyek

const alerts = ["success", "info", "warning", "danger"];
let bepipaltID = "";
let webbolt_admin = false;
let admin = false;
let elfogyott = false;
let Nemaktivak = false;
let maxarr = 0;
let minarr = 0;

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
        let osszeg = parseInt($(this).html().replaceAll("&nbsp;", "").replaceAll(" ", ""));
        
        sum += osszeg;
        
    });
    
    if (vegossszeg) {
        sum = Math.round(sum * (1 + (await ajax_post(`afa`, 1)).rows[0].AFA / 100));
        $(`#${hova}`).html(`${sum.toLocaleString()} Ft`);
    }
    else {
        $(`#${hova}`).html(`${sum.toLocaleString()} Ft`);
    }
    
    
    
    
    
}




async function SESSION() {
    if (localStorage.getItem("loggedIn") !== "1") { return; }

        try {

            const js = await ajax_post('/check_session', 1);
            //const js = await session_check.json();

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
            // Ha a szerver teljesen down, nem muszáj azonnal logoutolni; várj a következő tickre
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


function KeresonekSQLCraft(){

    // ez van használva a KERESOBAR fuggvényben is
    //                      Árfeltölt fügyvényben is 




    const inputok = kategoria_section.getElementsByTagName("input")//lekérdezes a chechboksot
    bepipaltID = ""; //reset bepipalt kategória
    for(var elem of inputok){
        if(elem.checked) {
            bepipaltID += `${elem.id}-`;// amit be vannak checkelve azt beleteszem a bepipát kategóriákba
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


async function KERESOBAR() {
    console.log("keresobar lefutott");
    $("#cart_button").closest(".gombdiv").removeClass("aktiv");
    $("#admin_button").closest(".gombdiv").removeClass("aktiv");
    $("#home_button").closest(".gombdiv").addClass("aktiv");
  


    //console.log("elküld: "+ elküld);

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
    if(sqleddig != elküld2){
        Joldal = 1;
    }
    sqleddig = elküld2;
    // ha megváltozott a lekérdezés akkor az oldal újra 1-re állitása

    elküld2 += `&offset=${(Joldal-1)}`
    console.log("elküld2: "+ elküld2);
    try {
        var adatok = await ajax_post(elküld2 , 1);
        if(adatok.rows.length == 0){// ha nincs találat akkor az árakat újra lekérdezem limit nélkül
            ArFeltolt(elküld,-1,Number.MAX_SAFE_INTEGER);
            Joldal = 1;
        } 
        CARD_BETOLT(adatok);
        OLDALFELTOTL(adatok.maxcount);
        KategoriaFeltolt("kategoria_section", "check", "");    
    } catch (err) { console.log("hiba:", err); }
    
    

    /*
    ajax_post(elküld , 1, function(adatok){ 
        CARD_BETOLT(adatok);
    } ); 
     */
    
    
    
    console.log("elküldve: "+ elküld);
}
//endregion
//#region OLdelkezelés
function OLDALFELTOTL(darab){
    oldalszam = Math.ceil( darab /52); // oldalszám kiszámolása
    if(oldalszam == 0) oldalszam = 1; // ha 0 akkor 1-re állitom
    DBoldal.innerHTML = oldalszam ;
    Mostoldal.innerHTML = Joldal;

    if(Joldal == 1){ // ha az 1. oldalon van akkor a vissza gombok inaktívak
        document.querySelector(".page-item:nth-child(2)").classList.add("disabled");
        document.querySelector(".page-item:nth-child(1)").classList.add("disabled");
    }

    if(Joldal == oldalszam){ // ha az utolsó oldalon van akkor a következő gombok inaktívak
        document.querySelector(".page-item:nth-child(4)").classList.add("disabled");
        document.querySelector(".page-item:nth-child(5)").classList.add("disabled");
    }
}

function Kovi(keri){
    FelaTetore();
    switch(keri.id){
        case("Kovi1"):{ // következő oldal
            if(Joldal < oldalszam){
                Joldal++;
                KERESOBAR();
                return;}
        }
        case("Kovi2"):{ // utolsó oldal
                console.log("oldalszam: "+ oldalszam);
                Joldal = oldalszam;
                console.log("Joldal: "+ Joldal + " old szam: "+ oldalszam);
                KERESOBAR();
                return;
        }
        case("vissza1"):{// előző oldal
            if(Joldal > 1){
                Joldal--;
                KERESOBAR();
                return;
            }}
        case("Vissza2"):{// első oldal
            Joldal = 1;
            KERESOBAR();
            return
        }
   
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
        $("#pagi").html(``);
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



async function KategoriaFeltolt(hova, type, kivalasztott) {

    const inputok = kategoria_section.getElementsByTagName("input")//lekérdezes a chechboksot
    bepipaltID = ""; //reset bepipalt kategória
    for(var elem of inputok){
        if(elem.checked) {
            bepipaltID += `${elem.id}-`;// amit be vannak checkelve azt beleteszem a bepipát kategóriákba
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
    KategoriaFeltolt("kategoria_section", "check", "");
}

async function Kezdolap() {
    console.log("Kezdolap lefutott");
    $("#keresett_kifejezes").html();
    $("#welcome_section").fadeIn(300);
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
    let ker = KeresonekSQLCraft() + `${id_kategoria}&offset=0&order=-1`;
    let keresve = await ajax_post(ker, 1);
    console.log(ker);
    CARD_BETOLT(keresve);
    OLDALFELTOTL(keresve.maxcount);
    $("#keresett_kifejezes").html(`Kategória: <strong>${document.getElementById(id_kategoria).innerText}</strong>`);
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










