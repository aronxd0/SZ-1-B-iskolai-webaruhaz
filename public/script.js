var ORDER = 1;
var ID = 0;    
const alerts = ["success", "info", "warning", "danger"];
var bepipaltID ="";
var webbolt_admin = false;
var admin = false;
var elfogyott = false;
var Nemaktivak = false;

function üzen(mit, tip)  {
    alerts.forEach((element) => { $("#toast1").removeClass( "bg-"+element ); });  // előző osztályok nyekk...
    $("#toast1").addClass( "bg-"+tip );                                           // új class 
    $("#toast1 .toast-body").html(mit);  
    $("#toast1").toast( { delay: 5000 });
    $("#toast1").toast("show");  
}

function makeid(length) {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const charactersLength = characters.length;
    let counter = 0;
    while (counter < length) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
        counter += 1;
    }
    return result;
}

function ajax_get( urlsor, hova, tipus, aszinkron ) {         // html oldalak beszúrására használjuk
    $.ajax({url: urlsor, type:"get", async:aszinkron, cache:false, dataType:tipus===0?'html':'json',
        beforeSend:function(xhr)   { 
            var spinner = '<div id="spinner" class="spinner-border text-primary" style="position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); z-index: 9999;"></div>';
            // Spinner hozzáadása a body-hoz
            $('body').append(spinner);
         },
        success:   function(data)  { $(hova).html(data); },
        error:     function(jqXHR, textStatus, errorThrown) {üzen(jqXHR.responseText, "danger");},
        complete:  function()      { $('#spinner').remove(); }  
    });
    return true;
};

function ajax_post( urlsor, tipus  ) {                         // json restapi-hoz használjuk
    var s = "";
    $.ajax({url: urlsor, type:"post", async:false, cache:false, dataType:tipus===0?'html':'json',
        beforeSend:function(xhr)   { 
            var spinner = '<div id="spinner" class="spinner-border text-primary" style="position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); z-index: 9999;"></div>';
            // Spinner hozzáadása a body-hoz
            $('body').append(spinner);
         },
        success:   function(data)  { s = data; },
        error:     function(jqXHR, textStatus, errorThrown) {üzen(jqXHR.responseText, "danger");},
        complete:  function()      { $('#spinner').remove(); }
    });
    return s;
};  

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



function Termek_Mutat(adatok) {
    $("#termekview").modal('show');
    $("#termek_content").html(adatok);
}




// teszt anyád cigány

function CARD_BETOLT(adatok){
    console.log(adatok);
    var ks = "";
    if ($("#loginspan").html() == " Bejelentkezés") {
        ks = "";
    }
    else ks = `<button class="btn btn-success bi bi-cart2"> Kosárba bele</button>`; 
  
    var s = "<div class='row'>"
  
    for (const element of adatok.rows) {
         s += `
         <div class="col-12 col-md-4">
            <div class="card m-3 text-center" id='${element.ID_TERMEK}' onclick='Termek_Mutat("${element.ID_TERMEK};${element.KATEGORIA};${element.NEV};${element.AZON};${element.AR};${element.MENNYISEG};${element.MEEGYS};${element.AKTIV};${element.TERMEKLINK};${element.FOTOLINK};${element.LEIRAS};${element.DATUMIDO}")'>
                <img class="card-img-top img-fluid mx-auto d-block kepp" src="${element.FOTOLINK}" alt="Card image" style="width:100%">
                <div class="card-body">
                    <h5 class="card-title">${element.NEV} </h5> (${element.KATEGORIA})
                    <p class="card-text "><h3 class="text-success anton-regular">${(element.AKTIV == "N" || element.MENNYISEG == 0) ? "Nem elérhető" : element.AR.toLocaleString() +" Ft"}</h3></p>
                    ${ks}
                    
                </div>
            </div>
         </div>
         `
         
    }
  
    s += "</div>";
    
    $("#Termek_hely").html(s);
}

function KERESOBAR(){
    const inputok = kategoria_section.getElementsByTagName("input")//lekérdezes a chechboksot
    bepipaltID = "";//reset
    for(var elem of inputok){
        if(elem.checked) {
            bepipaltID += `${elem.id}-`;// amit be vannak checkelve azt beleteszem az "s" be
        }
    }
    var nemaktiv = "";
    if(Nemaktivak)
    {
     nemaktiv = "&inaktiv=1"
    }
    var elfogy =""
    if(elfogyott){
        elfogy = "&elfogyott=1"
    }

    console.log("fronted log ID-K: "+ bepipaltID );

    var adatok = ajax_post("keres?nev="+ nev1.value+"&kategoria="+bepipaltID+ elfogy + nemaktiv , 1 ); // elküldöm lekérdezni
    console.log(`${"keres?nev="+ nev1.value+"&kategoria="+bepipaltID+ elfogy + nemaktiv }`)
    CARD_BETOLT(adatok);
    KategoriaFeltolt("kategoria_section");
}


function KategoriaFeltolt(hova) {
    $(`#${hova}`).html("");                              
    var k_json = ajax_post(`kategoria?nev=${$("#nev1").val()}`, 1);            
    var listItems  = "";
    for (var i = 0; i < k_json.rows.length; ++i) {
        var pipa = ""
        if(k_json.rows[i].ID_KATEGORIA == bepipaltID.split("-").find(e => e == k_json.rows[i].ID_KATEGORIA)){
            pipa = "checked";
        }
        listItems += `<p> <input class="form-check-input" type="checkbox" id="${k_json.rows[i].ID_KATEGORIA}" ${pipa} name="${k_json.rows[i].KATEGORIA}">  <Label class="form-check-label" id="lbl" for="${k_json.rows[i].ID_KATEGORIA}" > ${k_json.rows[i].KATEGORIA} </Label> </p>`;
    }

    $(`#${hova}`).html(listItems);
    console.log($("#nev1").val());
}
function Elfogyott(alma){
    if(alma.value == "Csakelfogyott"){

        elfogyott = !elfogyott;
    }
    else{

        Nemaktivak = !Nemaktivak;

    }
}

function ADMINVAGYE(){
    if(admin){
        document.getElementById("Elfogyott_gomb").innerHTML = `<span> Elfogyott áruk mutatása: <input type="checkbox" value="Csakelfogyott" onchange="Elfogyott(this)"> </span>`;
        document.getElementById("NEM_AKTIV").innerHTML = `<span>Inaktiv áruk mutatása: <input type="checkbox" value ="ads" id="innaktiv" onchange="Elfogyott(this)"> </span>`;
    } 
}



$(document).ready(function() {
        // balazs.aron@csany-zeg.hu 123456
    

    update_gombok(0);           // insert, update, delete nem kell! (csak login után)
    $('#login_modal').modal('show');                           
    $("#kategoria1").empty(); 
    var listItems  = "";

    Kezdolap();
    KategoriaFeltolt("kategoria_section");

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




    /*
    var k_json = ajax_post("kategoria", 1 );     
    
    
    for (var i = 0; i < k_json.rows.length; ++i)
    {
        listItems +=`<option value='${k_json.rows[i].ID_KATEGORIA}'>${k_json.rows[i].KATEGORIA}</option>`;
    }
    $("#kategoria1").append(listItems);
    */

    $("#search_button").click(function() {               Search_rekord();       } );
    $("#insert_button").click(function() {               Edit_rekord( 0 );      } );
    $("#modify_button").click(function() { if (ID > 0) { Edit_rekord( ID );   } } );
    $("#delete_button").click(function() { if (ID > 0) { Delete_rekord( ID ); } } );
    $("#save_button").click(function()   {               Save_rekord();         } );

    $("#login_button").click(function() {   
        if ($("#loginspan").html() == " Bejelentkezés") {
            $('#login_modal').modal('show'); 
        } else {   // logout
            $("#logout_modal").modal("show");
            
        }  
    });


    $("#kijelentkezik").click(function() {
        var logout_json = ajax_post("logout", 1);  
        console.log(logout_json);
        $("#loginspan").html(' Bejelentkezés');
        $("#loginout").removeClass("bi bi-box-arrow-in-left");
        $("#loginout").addClass("bi bi-box-arrow-in-right");
        üzen("Sikeres logout", "success");
        update_gombok(0); 
        $("#user").html("Jelentkezz be a fiókodba");
        $("#user-email").html("");
        $("#csoport").html(``);
        $("#admin").html("");
        
        webbolt_admin = false;
        admin = false;
        Kezdolap();
    });


    $("#login_oksi_button").click(function() { 
        var l_json = ajax_post("login?"+$("#form_login").serialize(), 1) ;  
        if (l_json.message == "ok" && l_json.maxcount == 1) {  
            $("#user").html(`<h5><i class="bi bi-person"></i> ${l_json.rows[0].NEV}</h5>`);
            $("#user-email").html(`${l_json.rows[0].EMAIL}`);
            
            $("#csoport").html(`${l_json.rows[0].CSOPORT}`);

            if (l_json.rows[0].ADMIN == "Y") $("#admin").html("<b>ADMIN</b>");
            else if (l_json.rows[0].WEBBOLT_ADMIN == "Y") $("#admin").html("<b>WEBBOLT ADMIN</b>");

            
            $('#login_modal').modal('hide');
            üzen(`Vásárolj sokat ${l_json.rows[0].NEV}!`,"success");
            update_gombok(1); 
            $("#loginspan").html(' Kijelentkezés');
            $("#loginout").removeClass("bi bi-box-arrow-in-right");
            $("#loginout").addClass("bi bi-box-arrow-in-left");
            if (l_json.rows[0].WEBBOLT_ADMIN == 'Y') webbolt_admin = true;
            if (l_json.rows[0].ADMIN == 'Y') admin = true;
            console.log("webbolt_admin: "+ admin);
            Kezdolap();
            ADMINVAGYE();

        } else {    
            üzen(`Hibás felhasználónév, vagy jelszó!`,"danger");
        }
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


    


    $("#home_button").click(function() {
        Kezdolap();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });


});


function Kezdolap() {
    var cuccos = ajax_post("keres", 1 );
    CARD_BETOLT(cuccos);
    nev1.value = "";
    KategoriaFeltolt("kategoria_section");
}


function update_gombok (x) {
if (x == 0) { $("#insert_button").hide(); $("#cart_button").hide(); $("#delete_button").hide(); $("#admin_button").hide(); } 
else        { $("#insert_button").show(); $("#cart_button").show(); $("#delete_button").show(); $("#admin_button").show(); }
}



