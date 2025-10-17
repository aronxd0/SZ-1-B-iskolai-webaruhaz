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

function update_gombok (x) {
    if (x == 0) { 
        //$("#cart_button").hide(); 
        $("#cart_button")[0].style.setProperty('display', 'none', 'important');
        $("#admin_button").hide(); 
    }
    if (x == 1) { $("#cart_button").show(); $("#admin_button").hide(); }
    if (x == 2) { $("#cart_button").show(); $("#admin_button").show(); }
    
}

async function KERESOBAR() {
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

    var order = "";
    //console.log(document.getElementById("rend").value);
    switch($("#rend").val()){
        case("ar_nov"): order = "&order=1"; break;
        case("ar_csok"): order = "&order=-1"; break;
        case("abc"): order = "&order=2"; break;
        case("abc_desc"): order = "&order=-2"; break;
        case("db_no"): order = "&order=3"; break;
        case("db_csok"): order = "&order=-3"; break;
        default: order = "";
    }

    console.log("fronted log ID-K: "+ bepipaltID );
    //console.log (document.getElementById("min_ar").value +  "amire szor ")
   

    
    var elküld = "keres?nev="+ nev1.value+"&kategoria="+bepipaltID+ elfogy + nemaktiv;

    //console.log("elküld: "+ elküld);

    var min = document.getElementById("min_ar_input").value == 0? "" : document.getElementById("min_ar_input").value; 
    var max = document.getElementById("max_ar_input").value == 0? "" : document.getElementById("max_ar_input").value; 

    //elküldöm az sql-t offset, limit nélkül és az eddig beállított min max árakat
    await ArFeltolt(elküld, min , max);

     min = document.getElementById("min_ar_input").value == 0? "" : document.getElementById("min_ar_input").value; 
     max = document.getElementById("max_ar_input").value == 0? "" : document.getElementById("max_ar_input").value; 
    //lekérdezes az új max és min árat
    
    var elküld2 = "keres?nev="+ nev1.value+"&kategoria="+bepipaltID+ elfogy + nemaktiv+order+"&minar="+ min +"&maxar="+ max;
    if(sqleddig != elküld2){
        Joldal = 1;
    }
    sqleddig = elküld2;
    // ha megváltozott a lekérdezés akkor az oldal újra 1-re állitása

    elküld2 += `&offset=${(Joldal-1)*51}`
    console.log("elküld2: "+ elküld2);
    try {
        var adatok = await ajax_post(elküld2 , 1);
        if(adatok.rows.length == 0){// ha nincs találat akkor az árakat újra lekérdezem limit nélkül
            ArFeltolt(elküld,-1,Number.MAX_SAFE_INTEGER);
            Joldal = 1;
        } 
        CARD_BETOLT(adatok);
        OLDALFELTOTL(adatok.maxcount);
        
    } catch (err) { console.log("hiba:", err); }
    
    

    /*
    ajax_post(elküld , 1, function(adatok){ 
        CARD_BETOLT(adatok);
    } ); 
     */
    
    KategoriaFeltolt("kategoria_section", "check", "");
    
    console.log("elküldve: "+ elküld);
}
//endregion
//#region OLdelkezelés
function OLDALFELTOTL(darab){
    oldalszam = Math.ceil( darab /51); // oldalszám kiszámolása
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
        
        console.log(min+ "minarr");
        if(min == ""){// ha még nem volt minar akkor a minar = legkisebb ár
            min = arak.rows[0].MINAR;
        }
        if(max == ""){// ha még nem volt maxar akkor a maxar = legnagyobb ár
            max = arak.rows[0].MAXAR;
        }
        
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


function Sliderhuz(ettöl){
    if(ettöl.id == "min_ar"){// ha a minárt huzom
        document.getElementById("min_ar_input").value = ettöl.value;// új  ár kiirása 
        if(ettöl.value > document.getElementById("max_ar").value){ // ha a minár nagyobb mint a maxár akkor a maxár legyen a minár + 1
            document.getElementById("max_ar").value = ettöl.value+1;
            document.getElementById("max_ar_input").value = ettöl.value+1;

        }
    }
    else{// ha a maxárt huzom
        document.getElementById("max_ar_input").value = ettöl.value;
        if(ettöl.value < document.getElementById("min_ar").value){// ha a maxár kisebb mint a minár akkor a minár legyen a maxár - 1
            document.getElementById("min_ar").value = ettöl.value-1;
            document.getElementById("min_ar_input").value = ettöl.value-1;
        }
    }

}


async function KategoriaFeltolt(hova, type, kivalasztott) {
    $(`#${hova}`).empty("");
    try {
        let k_json = await ajax_post(`kategoria?nev=${$("#nev1").val()}`, 1);
        let listItems  = "";

        if (type == "check") {
            for (let i = 0; i < k_json.rows.length; ++i) {
                var pipa = ""
                if(k_json.rows[i].ID_KATEGORIA == bepipaltID.split("-").find(e => e == k_json.rows[i].ID_KATEGORIA)){
                    pipa = "checked";
                }
                listItems += `<p> <input class="form-check-input" type="checkbox" id="${k_json.rows[i].ID_KATEGORIA}" ${pipa} name="${k_json.rows[i].KATEGORIA}">  <label class="form-check-label" for="${k_json.rows[i].ID_KATEGORIA}" > ${k_json.rows[i].KATEGORIA} </label> </p>`;
            }
            
        }
        else {
            for (let index = 0; index < k_json.rows.length; index++) {
                listItems += `<option value="${k_json.rows[index].ID_KATEGORIA}" ${k_json.rows[index].ID_KATEGORIA == kivalasztott ? "selected" : ""}>${k_json.rows[index].KATEGORIA}</option>`;
                
            }
        }

        $(`#${hova}`).append(listItems);
        
    } catch (err) { console.log("hiba:", err); }                     
      
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
    else{// csak inaktivakat szeretné látni

        Nemaktivak = !Nemaktivak;
        
       
    }
}

function Kezdolap() {
    $("#keresett_kifejezes").html();
    nev1.value = "";
    bepipaltID = "";
    KERESOBAR();

    if (!BevanJelentkezve()) { update_gombok(0); }
    
    
      // var cuccos = ajax_post("keres" + "?order=-1", 1 ); ha alapból szeretnék szűrni fontos !!!
    
}

function FelaTetore() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
}
