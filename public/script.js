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


function üzen(mit, tip)  {
    alerts.forEach((element) => { $("#toast1").removeClass( "bg-"+element ); });  // előző osztályok nyekk...
    $("#toast1").addClass( "bg-"+tip );                                           // új class 
    $("#toast1 .toast-body").html(mit);  
    $("#toast1").toast( { delay: 5000 });
    $("#toast1").toast("show");  
}


function ajax_get( urlsor, hova, tipus, aszinkron ) {         // html oldalak beszúrására használjuk
    $.ajax({url: urlsor, type:"get", async:aszinkron, cache:false, dataType:tipus===0?'html':'json',
        beforeSend:function(xhr)   { 
            const spinner = '<div id="spinner" class="spinner-border text-primary" style="position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); z-index: 9999;"></div>';
            // Spinner hozzáadása a body-hoz
            $('body').append(spinner);
         },
        success:   function(data)  { $(hova).html(data); },
        error:     function(jqXHR, textStatus, errorThrown) {üzen(jqXHR.responseText, "danger");},
        complete:  function()      { $('#spinner').remove(); }  
    });
    return true;
};




function ajax_post(urlsor, tipus) {
  return new Promise((resolve, reject) => {
    $.ajax({
      url: urlsor,
      type: "post",
      async: true,
      cache: false,
      dataType: tipus === 0 ? "html" : "json",
      beforeSend: function() {
        const spinner = `<div id="spinner-overlay" style="position:fixed;top:0;left:0;width:100%;height:100%;
                                        background:rgba(0,0,0,0.6);z-index:9999;
                                        display:flex;align-items:center;justify-content:center;backdrop-filter: blur(10px);opacity: 1;">
                                <div class="spinner-border text-primary"></div>
                            </div>`;
        $("body").append(spinner);
      },
      success: function(data) {
        resolve(data); // promise megoldva, a “return” a sikeres aszinkron hívásnál.
      },
      error: function(jqXHR) {
        üzen(jqXHR.responseText, "danger");
        reject(jqXHR.responseText); // ❌ Promise elutasítva
      },
      complete: function() {
        $('#spinner-overlay').remove();
      }
    });
  });
}






/*
function ajax_post( urlsor, tipus, callback ) {                         
    //var s = "";
    $.ajax({url: urlsor, type:"post", async:true, cache:false, dataType:tipus===0?'html':'json',
        beforeSend:function(xhr)   { 
            var spinner = `<div id="spinner-overlay" style="position:fixed;top:0;left:0;width:100%;height:100%;
                                        background:rgba(0,0,0,0.6);z-index:9999;
                                        display:flex;align-items:center;justify-content:center;backdrop-filter: blur(10px);opacity: 1;">
                                <div class="spinner-border text-primary"  >
                                <span class="visually-hidden">Loading...</span>
                                </div>
                            </div>
  
  `;
            $('body').append(spinner);
         },
        success:   function(data)  { 
            //s = data;
            
            callback(data); 
        },
        error:     function(jqXHR, textStatus, errorThrown) {üzen(jqXHR.responseText, "danger");},
        complete:  function()      { $('#spinner-overlay').remove();  }
    });
}; 
*/ 


function BevanJelentkezve() {
    if ($("#loginspan").html() == " Bejelentkezés") { return false; }
    else { return true; }
}

function FelaTetore() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
}


function orderby( num )   {
    ID = 0; // reset... nincs kijelölve egyetlen sor sem...
    ORDER = (ORDER === num) ? num * -1: num;
    Search_rekord();    
}


function Search_rekord() {
    $("tr.xsor").off('click');                          // unbind,

    $(document).on("click", "tr.xsor", function () {    /* MEG KELL ISMÉTELNI, mert az AJAX eldobja...*/
        ID = $(this).attr("id");                       
        var r_json = ajax_post("rekord/"+ID, 1 );       //console.log(r_json);
        var s= `<h3>ID: [${r_json.rows[0].ID_TERMEK}] ${r_json.rows[0].NEV}</h3>
                <h5>${r_json.rows[0].AR},-Ft ${r_json.rows[0].MENNYISEG} ${r_json.rows[0].MEEGYS}</h5>
                <p>${r_json.rows[0].LEIRAS}</p>
                <img class="img-fluid" src="${r_json.rows[0].FOTOLINK}"/>`;
        $("#rekord1").html(s);            
    }); 
        
    ID = 0;                                                           // ! reset, nincs kijelölve még egyetlen sor sem...
    $("#rekord1").empty();
    var s = "";
    var tip = "";    
    var old_offset =  $('#offset1').val();
    var url = "tabla?"+$("#form1").serialize()+"&order="+ORDER;       // console.log( url );
    var t_json   = ajax_post(url, 1) ;   // maxcount: max találat van limit nélkül
    var maxcount = t_json.maxcount | 0;  // :-)

    $("#tabla1 tbody").empty();                            // tábla sorok törlése (fejléc marad)

    if (t_json.message == "ok")                            // minden oksi ...
    {  
        var limit  = $('#limit1').val();
        var offset = Math.floor(maxcount / limit) + (maxcount % limit > 0? 1 : 0);
        $('#offset1').empty();
        var sel = "";
        for (var i=0; i < offset; ++i)
        {
            sel = (i==old_offset? "selected": "");
            $('#offset1').append(`<option ${sel} value="${i}">${i+1}.lap</option>`);
        }

        for (var i=0; i < t_json.rows.length; i++) 
        {
            var s = `<tr class="xsor table-${i%2==0?'primary':'light'}" 
                    id="${t_json.rows[i].ID_TERMEK}">
                    <td>${t_json.rows[i].NEV}</td>
                    <td>${t_json.rows[i].AR}</td>
                    <td>${t_json.rows[i].MENNYISEG}</td>
                    <td>${t_json.rows[i].MEEGYS}</td>
                    <tr>`;
            $("#tabla1 tbody").append(s);                     // tábla sorok beszúrása
        }
        tip = maxcount > 0? "success" : "warning";
        s = `Összesen ${maxcount} rekord felel meg a feltételnek.`;
    }
    else 
    {
        tip = "danger";
        s = t_json.message.sqlMessage;
    }
    üzen(s, tip);  
}


 async function Kosarba_Bele(event, id_termek) {
    event.stopPropagation();
    $("#termekview").modal("hide");

    // kosarba INSERT INTO ide
    try {
        let kosaraddleiras = await ajax_post(`kosar_add?ID_TERMEK=${id_termek}` ,1);
        if (kosaraddleiras.message == "ok") {
           KosarTetelDB(); // majd a külön le kérdezést kap 

            üzen("Áru bekerült a kosárba","success");
        
        }
        else { üzen(kosaraddleiras.message, "danger"); }
    
        

        $("#idt").html(id_termek);
        $("#kosarba_bele").modal("show");

    } catch (err) { üzen(err, "danger"); }
    
    
}

async function KosarTetelDB() {
    try {
        let kosarteteldb = await ajax_post("kosarteteldb", 1);
        var db = 0;
        for (const element of kosarteteldb.rows) {
            console.log(typeof element.kdb);
            if (element.kdb == undefined) { db = 0;} 
            else { db = parseInt(element.kdb); }
            $("#kosar_content_count").html(`${db}`);
        }

    } catch (err) { üzen(err, "danger"); }
}



async function Velemeny_Kozzetesz(id_termek) {
    
    const cls = new bootstrap.Collapse('#vlm', { toggle: false });
    if ($("#velemeny_input").val() != "") {
        try {
            let velemenyiras = await ajax_post(`velemeny_add?ID_TERMEK=${id_termek}&SZOVEG=${$("#velemeny_input").val()}`, 1) 
            cls.hide();
            console.log(`velemeny_add?ID_TERMEK=${id_termek}&SZOVEG=${$("#velemeny_input").val()}`);

            if (velemenyiras.message == "ok") {
                üzen(`Vélemény elküldve`,"success");
                $("#velemeny_input").val("");
                SajatVelemenyekMutat(id_termek);
            }
            else {
                üzen(`Hiba: <br> ${velemenyiras.message}`,"danger");
            }

            
        }  catch (err) { üzen(err, "danger"); }
        
        
    }
}

async function Velemeny_Torles(id_velemeny, id_termek) {
    console.log(`gyors teszt xd, ez a velemeny id = ${id_velemeny}, termekid = ${id_termek}`);

    try {
        let velemeny_torles = await ajax_post(`velemeny_del?ID_VELEMENY=${id_velemeny}`, 1);
        if (velemeny_torles.message == "ok") {
            üzen("Vélemény sikeresen törölve!", "success");
            $("#velemeny_input").val("");
            SajatVelemenyekMutat(id_termek);
        }
    } catch (err) { üzen(err, "danger"); }
    
}

async function SajatVelemenyekMutat(id_termek) {
    let sv = "";
    let allapot_style = "";
    let ikon = "";
    $("#sajatok").html("");

    try {
        
        let sajat_velemeny_lista = await ajax_post(`velemenyek?ID_TERMEK=${id_termek}&SAJATVELEMENY=1`, 1);
        for (const element of sajat_velemeny_lista.rows) {

            if (element.ALLAPOT == "Jóváhagyva") { allapot_style = "alert alert-success"; ikon = "✅" }
            else if (element.ALLAPOT == "Jóváhagyásra vár") { allapot_style = "alert alert-warning"; ikon = "🔄️" }
            else if (element.ALLAPOT == "Elutasítva") { allapot_style = "alert alert-danger"; ikon = "❌" }

            sv += `
            <div class="w-100 p-2 border rounded mt-3 mb-3 comment ${allapot_style}">
                <p class="d-flex justify-content-between"><b><span><i class="bi bi-person"></i> ${element.NEV}</span></b>  <span><i class="bi bi-calendar4-week"></i> ${element.DATUM.substring(0,10)}</span></p>
                <p>${element.SZOVEG.toString().replaceAll("\n","<br>")}</p>
                <p class="d-flex align-self-center justify-content-between"><span>${element.ALLAPOT} ${ikon}</span> 
                    <div class="dropup">
                        <button type="button" class="btn btn-danger dropdown-toggle" data-bs-toggle="dropdown">
                         <i class="bi bi-trash"></i>
                        </button>
                        <ul class="dropdown-menu p-2">
                            <li><span class="dropdown-item-text">Biztosan törlöd a véleményt?</span></li>
                            <li class="d-flex justify-content-end p-3"><button class="btn btn-danger bi bi-trash" type="button" onclick='Velemeny_Torles(${element.ID_VELEMENY},${element.ID_TERMEK})'> Törlés</button></li>
                        </ul>
                    </div>
                     
                </p>
            </div>`;
        }
        console.log(sv);
        $("#sajatok").html(sv);
        console.log(`sajat velemenyek betoltve`);

    } catch (err) { console.log("hiba:", err); }
}


async function VelemenyekMutat(id_termek) {
    let vv = "";
    $("#velemenyek").html("");

    try {
        
        let velemeny_lista = await ajax_post(`velemenyek?ID_TERMEK=${id_termek}`, 1);
        if (velemeny_lista.rows.length == 0) { $("#velemenyek").html("Ehhez a termékhez még senki nem írt véleményt :("); }
        else {
            for (const element of velemeny_lista.rows) {
                vv += `
                <div class="w-100 p-2 border rounded fhr mt-3 mb-3 comment">
                    <p class="d-flex justify-content-between"><b><span><i class="bi bi-person"></i> ${element.NEV}</span></b>  <span><i class="bi bi-calendar4-week"></i> ${element.DATUM.substring(0,10)}</span></p>
                    <p>${element.SZOVEG.toString().replaceAll("\n","<br>")}</p>
                </div>`;
            }
            console.log(vv);

            $("#velemenyek").html(vv);
            console.log(`velemenyek betoltve`);
        }
        
        

    } catch (err) { console.log("hiba:", err); }
}


function Termek_Edit(event, cuccok, tipus) {
    event.stopPropagation();
 
    const termek_id = cuccok[0];
    const kategoria = cuccok[1];
    const nev = cuccok[2];
    const azon = cuccok[3];
    const ar = cuccok[4];
    const mennyiseg = cuccok[5];
    const meegys = cuccok[6];
    const aktiv = cuccok[7];
    const termeklink = cuccok[8];
    const fotolink = cuccok[9];
    const leiras = cuccok[10];
    const datumido = cuccok[11];
    const id_kategoria = cuccok[12];

    console.log(`ID KATEGORIA TERMEK EDIT XD: ${id_kategoria}`);

    KategoriaFeltolt("mod_kat", "select");

    if (tipus == "bevitel") {

        $("#mod_nev").val("");
        $("#mod_azon").val("");
        $("#mod_ar").val(0);
        $("#mod_db").val(1);
        $("#mod_meegys").val("db");
        $("#mod_leiras").val("");
    }
    else {
        $("#idx1").html(`${termek_id}; ${nev}`);
        $("#mod_kat").val(id_kategoria); 
        //$('#mod_kat').find(`option[value="${id_kategoria}"]`).prop('selected', true);
        $("#mod_nev").val(nev);
        $("#mod_azon").val(azon);
        $("#mod_ar").val(ar);
        $("#mod_db").val(mennyiseg);
        $("#mod_meegys").val(meegys);
        
        $("#mod_leiras").html(leiras);
    }


    console.log(meegys);

    $("#termek_edit").modal("show");
}


function Termek_Torol(event, cuccok) {
    event.stopPropagation();
    for (const element of lista) {
        console.log(element);
    }
}


async function Termek_Mutat(event, cuccok) {
    
    $("#termekview").modal("hide");
    console.log(`cuccok: ${cuccok}`);

    const termek_id = cuccok[0];
    const kategoria = cuccok[1];
    const nev = cuccok[2];
    const azon = cuccok[3];
    const ar = cuccok[4];
    const mennyiseg = cuccok[5];
    const meegys = cuccok[6];
    const aktiv = cuccok[7];
    const termeklink = cuccok[8];
    const fotolink = cuccok[9];
    const leiras = cuccok[10];
    const datumido = cuccok[11];

    $("#ga").html("");
    /*
    for (let index = 0; index < 100; index++) {
        $("#termek_content").append(cuccok + "<br>");
        
    }*/
   let ks = "";

    if ($("#loginspan").html() == " Bejelentkezés" || aktiv == "N" || mennyiseg == 0) {
            ks = "";
    }
    else ks = `<button class="btn btn-lg btn-success kosar bi bi-cart2" onclick='Kosarba_Bele(event, ${termek_id})'> Kosárba bele</button>`;


    let bal = ` 
                    <img class="img-fluid rounded mx-auto  m-1 d-block" src="${fotolink}" alt="${nev}">
                
                
    `;

    let kozep = `   <div class="row mt-2">
                        <b>Termékleírás:</b>
                        <br>
                        <p>${leiras}</p>
                    </div>
    
                    <div class"row">
                        <p>
                            <b>Kategória: </b> ${kategoria}
                        </p>
                    </div>
    
                    <div class"row">
                        <p>
                            <b>Termékazonosító: </b> ${azon}
                        </p>
                    </div>
                    <div class="row">
                        <p> 
                            <b> Raktáron: </b> ${mennyiseg} ${meegys}
                        </p>
                    </div>
                    <div class="row">
                        <h1 class="text-success anton-regular">${parseInt(ar).toLocaleString()} Ft</h1>
                    </div>

                    <div class="row p-2">
                        
                    </div>
    
    `;

    $("#bal").html(bal);
    $("#jobb").html(kozep);
    $("#alul").html(ks);

    $("#termeknev").html(nev);

    
     

    const cls = new bootstrap.Collapse('#vlm', { toggle: false });

    
    
    $("#vlmg").html("");
    $("#ussr").html("");

    
    $("#vvl").html(`<a class="nav-link show active" href="#velemenyek" id="velemenyek-tab" onclick='VelemenyekMutat(${termek_id})'>Vélemények</a>`);
    //$("#velemenyek-tab").trigger("click");


    if (!BevanJelentkezve()) {
        $("#vlmg").html("Vélemény írásához jelentkezzen be");
        cls.hide();
        $("#sajatvlm").html("");
        $("#sajatvlm").addClass("eltunt");
        
    }
    else {
        $("#vlmg").html(`<button class="btn btn-primary bi bi-chat-dots w-auto" data-bs-toggle="collapse" data-bs-target="#vlm"> Vélemény írása</button>`);
        $("#ussr").html(`${$("#user").html()}`);

        $("#sajatvlm").html(`<a class="nav-link" href="#sajatok" id="sajat-tab" onclick='SajatVelemenyekMutat(${termek_id})'>Véleményeim</a>`);
        
        $("#sajatvlm").removeClass("eltunt");
    }

    $("#velemenyek").hide().removeClass("fade show");
    $("#sajatok").hide().removeClass("fade show");

    //velemenyek tab jelenjen meg alapbol
    $("#velemenyek").addClass("show").show();
    VelemenyekMutat(termek_id);

    $("#velemenyek-tab").off("click").on("click", () => { // eloszor levesszuk a click-et majd visszarakjuk hogy ne halmozodjon
        $("#velemenyek").addClass("show").show(); // show class + megjelenites
        $("#sajatok").hide().removeClass("show"); // show class takarodj + eltuntetes
        $(".nav-link").removeClass("active"); // minden nav linkről aktiv allapot le
        $("#velemenyek-tab").addClass("active"); // ez legyen az aktiv nav-link
        VelemenyekMutat(termek_id); // velemenyek betoltese
    });

    $("#sajat-tab").off("click").on("click", () => { /* ugyanaz mint feljebb csak a "sajat velemenyek" reszre  */
        $("#sajatok").addClass("show").show();
        $("#velemenyek").hide().removeClass("show");
        $(".nav-link").removeClass("active");
        $("#sajat-tab").addClass("active"); 
        SajatVelemenyekMutat(termek_id);
    });

    
    
    console.log(`VelemenyekMutat(${termek_id})`);
    
    
    /*
    for (let index = 0; index < 20; index++) {
        $("#velemenyek").append(tesztgeci);
        $("#sajatok").append(`${tesztgeci} - sajat`);
    }
        */

    let gombs = `
        <button type="button" class="btn btn-info bi bi-info-circle w-auto ms-2" data-bs-toggle="tooltip" title="A vélemény jóváhagyás esetén lesz majd látható!"></button>
        <button type="button" class="btn btn-danger bi bi-x-lg w-auto ms-2" data-bs-toggle="collapse" data-bs-target="#vlm" id="mgs"> Mégse</button>
        <button type="button" class="btn btn-success bi bi-send w-auto ms-2" id="velemeny_kozzetesz" onclick='Velemeny_Kozzetesz(${termek_id})'> Közzététel</button>
    
    `
    //VelemenyekMutat(termek_id);
    if (aktiv == "N" || mennyiseg == 0) alert("Ez a termek nem elerheto teso");
    else {
        if (event.target.tagName != "button") { // fontos, hogy ha a kosarba gombra kattintunk akkor ne a termek nyiljon meg
            $("#ga").html(gombs);
            
            $("#termekview").modal("show");
            cls.hide();
        }
        
    }

    
    
}



function CARD_BETOLT(adatok){
    $("#content_hely").html();/// adatok is undefined

    
    let ks = "";
    let s = ""
    let el = "";
    let ee = "";  
    let gg = "";  
    let cuccli = [];
    $("#keresett_kifejezes").html();
    
   //if (BevanJelentkezve()) { console.log("card betolt: be van jelentkezve"); }

    

    for (const element of adatok.rows) {

        if (element.AKTIV == "N" || element.MENNYISEG == 0) {//adminoknak a nem aktiv termekek pirossal látszódjanak
            el = ` <div class="alert alert-danger">
                        A termék jelenleg nem elérhető
                    </div>
            `;

            ee = "nem-elerheto";
           
        }
        else { el = `<h2 class="text-success anton-regular">${element.AR.toLocaleString()} Ft</h2>`; ee = ""; } //Ár kiiras
        

        cuccli = [];

        cuccli.push(`${element.ID_TERMEK}`, `${element.KATEGORIA}`, `${element.NEV}`, `${element.AZON}`, `${element.AR}`, `${element.MENNYISEG}`, `${element.MEEGYS}`, `${element.AKTIV}`, `${element.TERMEKLINK}`, `${element.FOTOLINK}`, `${element.LEIRAS}`, `${element.DATUMIDO}`, `${element.ID_KATEGORIA}`);


        if (!BevanJelentkezve() || element.AKTIV == "N" || element.MENNYISEG == 0) {
            ks = "";
        }

        else ks = `<button class="btn btn-lg btn-success kosar bi bi-cart2" onclick='Kosarba_Bele(event, ${element.ID_TERMEK})'> Kosárba bele</button>`;  //ha be van jelentkezve és elérhető a termék akkor kosár gomb

        if (BevanJelentkezve() && (webbolt_admin || admin)) {
            gg = "<div class='row d-flex justify-content-center p-3'>";
            gg += `<button type="button" class="btn btn-lg btn-warning w-auto me-2" aria-label="modositas" onclick='Termek_Edit(event, ${JSON.stringify(cuccli)}, "modosit")'><i class="bi bi-pencil-square"></i></button>`;
            gg += `<button type="button" class="btn btn-lg btn-danger w-auto" aria-label="torles" onclick='Termek_Torol(event, ${JSON.stringify(cuccli)})'><i class="bi bi-trash"></i></button>`;
            gg += "</div>";
        }
        else gg = "";


        //var cuccok = `${element.ID_TERMEK};${element.KATEGORIA};${element.NEV};${element.AZON};${element.AR};${element.MENNYISEG};${element.MEEGYS};${element.AKTIV};${element.TERMEKLINK};${element.FOTOLINK};${element.LEIRAS};${element.DATUMIDO}`.replace('"','~');
        

         s += `
         <div class="col-12 col-sm-6 col-xxl-4">
            <div class="card shadow-lg feka hover-shadow m-3 p-3 rounded-4 text-center ${ee}" id='${element.ID_TERMEK}' onclick='Termek_Mutat(event, ${JSON.stringify(cuccli)})'>
                <img class="card-img-top img-fluid mx-auto d-block kepp" src="${element.FOTOLINK}" alt="Card image" style="width:100%">
                <div class="card-body">
                    <h5 class="card-title">${element.NEV} </h5> (${element.KATEGORIA})
                    <p class="card-text">
                        ${el}
                    </p>
                    ${ks}
                    ${gg}
                </div>
            </div>
         </div>
         `// card feltőltése "s" sztingbe ami kébbőb be lesz szurva a html-be
         
    }
  
    


    if ($("#nev1").val() != "") $("#keresett_kifejezes").html(`Találatok a(z) <b>"${$("#nev1").val()}"</b> kifejezésre`);// ha van találat kifejezésre akkor kiirja a keresett kifejezést
    else {$("#keresett_kifejezes").html("")};

    if(nev1.value != "" ){
        débé.innerHTML = ` (${adatok.maxcount} db)`;//talalat darabszam kiirasa
    }
    else{
        débé.innerHTML ="";
    }

    var pp = `
        <ul class="pagination justify-content-center">
            <li class="page-item"><a class="page-link" id="Vissza2" onclick="Kovi(this)"> << </a></li>
            <li class="page-item"><a class="page-link" id="vissza1" onclick="Kovi(this)">Előző</a></li>
            <li class="page-item"><a class="page-link d-flex"><b id="Mostoldal">1</b> / <span id="DBoldal">100</span></a></li>
            
            <li class="page-item"><a class="page-link" id="Kovi1" onclick="Kovi(this)">Következő</a></li>
            <li class="page-item"><a class="page-link" id="Kovi2" onclick="Kovi(this)"> >> </a></li>
        </ul>`;
    // alul a lapválastó feltöltése
    
    $("#content_hely").html(s);
    $("#pagi").html(pp);
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
    
    KategoriaFeltolt("kategoria_section", "check");
    
    console.log("elküldve: "+ elküld);
}

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


async function KategoriaFeltolt(hova, type) {
    $(`#${hova}`).html("");
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
                listItems += `<option value="${k_json.rows[index].ID_KATEGORIA}">${k_json.rows[index].KATEGORIA}</option>`;
                
            }
        }

        $(`#${hova}`).html(listItems);
        
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

function ADMINVAGYE(){
    if(admin){// ha admin akkor a "csakelfogyott " és a "Csak inaktiv" gomb is látszódjon
        document.getElementById("Elfogyott_gomb").innerHTML = `
            <p>
                <input class="form-check-input" type="checkbox" id="elf" value="Csakelfogyott" onchange="Elfogyott(this)">
                <label for="elf" class="form-check-label"> Csak az elfogyott áruk mutatása</label>
            </p>
            `;      
        document.getElementById("NEM_AKTIV").innerHTML = `
            <p>
                <input class="form-check-input" type="checkbox" value ="ads" id="innaktiv" onchange="Elfogyott(this)">
                <label for="innaktiv" class="form-check-label"> Csak az inaktiv áruk mutatása</label>
            </p>
            `;
    } 
}




$(document).ready(function() {
    // balazs.aron@csany-zeg.hu 123456

    var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'))
    var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl)
    })
    

    update_gombok(0);          
    $('#login_modal').modal('show');                       
     
    
    
    
    KategoriaFeltolt("kategoria_section", "check");

    var input = document.getElementById("nev1");

    // enterrel keresés
    input.addEventListener("keypress", function(event) {
        // ha enterrel kattint
        if (event.key === "Enter") {
            // Cancel the default action, if needed
            event.preventDefault();
            // Trigger the button element with a click
            document.getElementById("kereses_gomb").click();
        }

  
    });

    $("#nev1").on("focus", function() {
        console.log("keresomezo focus xd");
        FelaTetore();
    });

    
    
    


    

    $("#search_button").click(function() {               Search_rekord();       } );
    $("#insert_button").click(function() {               Edit_rekord( 0 );      } );
    $("#modify_button").click(function() { if (ID > 0) { Edit_rekord( ID );   } } );
    $("#delete_button").click(function() { if (ID > 0) { Delete_rekord( ID ); } } );
    $("#save_button").click(function()   {               Save_rekord();         } );

    $("#login_button").click(function() {   
        if (!BevanJelentkezve()) {
            $('#login_modal').modal('show'); $("#login_gomb_div").removeClass("bal jobb").addClass("kozep");
        } else {   // logout
            $("#logout_modal").modal("show");
            
        }  
    });



    $('#login_modal').on('hidden.bs.modal', function () {

        if(!BevanJelentkezve()){
            ajax_post("logout", 1,).then(logoutt => {});
            Kezdolap();
        }
   
    });


    $("#termekview").on("hidden.bs.modal", function() {
        console.log("bezarva");
        window.history.replaceState(null, null, window.location.pathname); // az url vegen ne maradjon bent a #velemenyek es a #sajatok
        $("#velemeny_input").val("");
    });
    
    

     $('#bezar').on('click', function () {
        if (!BevanJelentkezve()) {
            ajax_post("logout", 1,).then(logoutt => {});
            Kezdolap();
        }
       

        

    });


   


    $("#kijelentkezik").click(function() {
        ajax_post("logout", 1).then(logout_json => {
            console.log(logout_json);
            $("#loginspan").html(' Bejelentkezés');
            $("#loginout").removeClass("bi bi-box-arrow-in-left");
            $("#loginout").addClass("bi bi-box-arrow-in-right");
            üzen("Sikeres logout", "success");
             
            $("#user").html("Jelentkezz be a fiókodba");
            $("#user-email").html("");
            $("#csoport").html(``);
            $("#admin").html("");
            
            webbolt_admin = false;
            admin = false;
            elfogyott = false;
            Nemaktivak = false;
            Joldal =1;
            
            document.getElementById("rendalap").selected = true;

            document.getElementById("Elfogyott_gomb").innerHTML = ``;
            document.getElementById("NEM_AKTIV").innerHTML = ``;
            //Kezdolap();
            $("#home_button").trigger("click");
            update_gombok(0);
        });  
        
    });


    $("#login_oksi_button").click(function() { 
        ajax_post("login?"+$("#form_login").serialize(), 1).then(l_json => {
            if (l_json.message == "ok" && l_json.maxcount == 1) {  
                $("#user").html(`<h5><i class="bi bi-person"></i> ${l_json.rows[0].NEV}</h5>`);
                $("#user-email").html(`${l_json.rows[0].EMAIL}`);
                
                $("#csoport").html(`${l_json.rows[0].CSOPORT}`);

                if (l_json.rows[0].ADMIN == "Y") {
                    $("#admin").html("<b>ADMIN</b>");
                    admin = true;
                    update_gombok(2); 
                }
                else if (l_json.rows[0].WEBBOLT_ADMIN == "Y") {
                    $("#admin").html("<b>WEBBOLT ADMIN</b>");
                    webbolt_admin = true;
                    update_gombok(2); 
                }
                else { update_gombok(1); }

                
                Joldal = 1;

                $('#login_modal').modal('hide');
                üzen(`Vásárolj sokat ${l_json.rows[0].NEV}!`,"success");
                $("#loginspan").html(' Kijelentkezés');
                $("#loginout").removeClass("bi bi-box-arrow-in-right");
                $("#loginout").addClass("bi bi-box-arrow-in-left");
                 
                //console.log("webbolt_admin: "+ admin);
                Kezdolap();
                ADMINVAGYE();
                KosarTetelDB();

            } else {    
                üzen(`Hibás felhasználónév, vagy jelszó!`,"danger");
            }
        });  
        
    });


    // sotet mod - vilagos mod valto
    $("#switch").click(function() {
        if ($("html").attr("data-bs-theme") === "dark") {
            $("html").removeAttr("data-bs-theme");
            $("#switch").html(`<i class="bi bi-moon-fill"></i>`);
        }
        else {
            $("html").attr("data-bs-theme", "dark");
            $("#switch").html(`<i class="bi bi-sun-fill"></i>`);
        }
    });


    // jelszo mutatasa ikon a bejelentkezesnel
    $("#jelszo_mutatasa").click(function() {
        let v = $("#login_passwd"); // azert nincs .val() mert akkor leljebb nem lehetne attributumot valtoztatni
        
        if(v.attr('type') === 'password') {
        v.attr('type', 'text'); // atvaltozik szovegge tehat lathato lesz
        $("#sz").removeClass('bi-eye').addClass('bi-eye-slash');
        } 
        else {
        v.attr('type', 'password'); // vissza 
        $("#sz").removeClass('bi-eye-slash').addClass('bi-eye');
        }
    });

    $(".gombdiv button").click(function() {
        $(".gombdiv").removeClass("aktiv");
        $(this).closest(".gombdiv").addClass("aktiv");
    });

    

    $("#home_button").click(function() {
        Kezdolap();
        FelaTetore();
    });

    $("#home_button").trigger("click");
    

    $("#min_ar").on("input", function() {
        $("#min_ar_input").val($("#min_ar").val());

        if(parseInt ($("#min_ar").val()) > parseInt( $("#max_ar").val())){
            $("#max_ar").val(parseInt( $("#min_ar").val()) +1 );  
            $("#max_ar_input").val($("#max_ar").val());
        }


    });
    
    $("#max_ar").on("input", function() {
        $("#max_ar_input").val($("#max_ar").val());

         if(parseInt ($("#max_ar").val()) < parseInt( $("#min_ar").val())){
            $("#min_ar").val(parseInt( $("#max_ar").val()) -1 );  
            $("#min_ar_input").val($("#min_ar").val());
        }
    });


    // kosár menüpont
    $("#cart_button").click(function () {
        $("#content_hely").html("");

        var ts = ``;

        try {
            ajax_post("tetelek", 1).then(tetelek => {
                for (const element of tetelek.rows) {
                    ts += `<div class="col-12 d-flex p-2">`;
                    ts += `<img class="card-img-top img-fluid mx-auto d-block kepp" src="${element.FOTOLINK}" alt="Card image" style="width:100%">`;
                    ts+= `${element.NEV} ${element.AR}Ft`
                }
            });

        } catch (err) { console.log("hiba:", err); }



        var kd = `
            <div class="col-12">
                <div class="text-center p-2 bg-success" id="kosarmenutitle"><h1>ha a kosar ures akkor "kosar ures" ha nem akkor kosar tartalma</h1> </div>
                <div class="feka p-2" id="kosar_tetelek">
                    ide jonnek a tetelek  | Nagyon sok backend ÁDI készülj, alvásnak vége munka lesz
                </div>
            </div>
        
        `;


        $("#content_hely").html(ts);
        $("#pagi").html("");
    });


    


    // admin oldal
    $("#admin_button").click(function() {
        $("#content_hely").html("");
        $("#content_hely").html("ide jon az admin resz");
        $("#pagi").html("");
    });

    $("#szurogomb").click(function () {
        KERESOBAR();
    });


});


function Kezdolap() {
    $("#keresett_kifejezes").html();
    nev1.value = "";
    bepipaltID = "";
    KERESOBAR();

    if (!BevanJelentkezve()) { update_gombok(0); }
    
    
      // var cuccos = ajax_post("keres" + "?order=-1", 1 ); ha alapból szeretnék szűrni fontos !!!
    
}

// 0 = nincs bejelentkezve, 1 = sima user, 2 = admin vagy webbolt_admin
function update_gombok (x) {
    if (x == 0) { 
        //$("#cart_button").hide(); 
        $("#cart_button")[0].style.setProperty('display', 'none', 'important');
        $("#admin_button").hide(); 
    }
    if (x == 1) { $("#cart_button").show(); $("#admin_button").hide(); }
    if (x == 2) { $("#cart_button").show(); $("#admin_button").show(); }
    
}
