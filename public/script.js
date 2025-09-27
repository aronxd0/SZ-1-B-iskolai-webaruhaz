var ORDER = 1;
var ID = 0;    
const alerts = ["success", "info", "warning", "danger"];

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
        beforeSend:function(xhr)   {  },
        success:   function(data)  { $(hova).html(data); },
        error:     function(jqXHR, textStatus, errorThrown) {üzen(jqXHR.responseText, "danger");},
        complete:  function()      {  }  
    });
    return true;
};

function ajax_post( urlsor, tipus  ) {                         // json restapi-hoz használjuk
    var s = "";
    $.ajax({url: urlsor, type:"post", async:false, cache:false, dataType:tipus===0?'html':'json',
        beforeSend:function(xhr)   {  },
        success:   function(data)  { s = data; },
        error:     function(jqXHR, textStatus, errorThrown) {üzen(jqXHR.responseText, "danger");},
        complete:  function()      {  }
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

function Delete_rekord( idx ) {                        // törlés
    $("#myModal1 .modal-body").html(`Törlöd a ${idx} azonosítójú terméket?`); 
    $('#myModal1').off('click');                         // unbind, különben N.szer futna le az N. hívásra !!
    $("#myModal1").on("click",".btn-success", function(){
    var s = "";
    var tip = "success"; 
    var d_json = ajax_post("delete/"+ID, 1);
    console.log(d_json);
    if (d_json.message == "ok")                        // minden oksi ...
    {
    if (d_json.rows[0].affectedRows == 1) 
    {
        s= "Törlés OK..."; 
        Search_rekord();                               // refresh táblázat
    }     
    else                                    
    {
        tip = "warning";
        s= `Hiba: nincs meg az ID:[${idx}] azonosítójú rekord!<br>${d_json.message}`;}
    }
    else
    {
    tip = "danger";
    s = d_json.message;
    }  
    üzen(s, tip); 
});

$("#myModal1").modal('show');
}

function Save_rekord() {                              // bevitel, vagy módosítás
    var s = "";
    var tip = "success"; 
    var m_json = ajax_post("save/"+ID+"?"+$("#mod1").serialize(), 1);
    console.log(m_json);
    if (m_json.message == "ok")                       // minden oksi ...
    {
    if (m_json.rows[0].affectedRows == 1) 
    {
        s= "Módosítás OK..."; 
        Search_rekord();                              // refresh táblázat
    }     
    else                                    
    {
        tip = "warning";
        s= `Hiba: ID:[${idx}]!<br>${m_json.message}`;}
    }
    else
    {
    tip = "danger";
    s = m_json.message;
    }  
    üzen(s, tip); 
}

function Edit_rekord( idx ) {   
    $("#idx1").html("Termék " + (idx|0 > 0? "módosítás [ ID: "+idx+" ]" : "bevitel") ) ;   

    $("#mod_kat").empty();                              // listbox ürítése
    var k_json = ajax_post("kategoria", 1);             // JSON!
    var listItems  = "";
    for (var i = 0; i < k_json.rows.length; ++i)
    {
        listItems += `<option value='${k_json.rows[i].ID_KATEGORIA}'>${k_json.rows[i].KATEGORIA}</option>`;
    }

    $("#mod_kat").append(listItems);

    if (idx == 0)              // bevitel
    {
        $("#mod_nev").val("");
        $("#mod_azon").val(makeid(10));   // https://stackoverflow.com/questions/1349404/generate-random-string-characters-in-javascript
        $("#mod_ar").val(0);
        $("#mod_db").val(1);
        $("#mod_meegys").val("darab");
        $("#mod_leiras").val("");

    } else                     // módosítás
    {
        var r_json = ajax_post("rekord/"+ID, 1 );
        $("#mod_kat").val(r_json.rows[0].ID_KATEGORIA).change();  // selected beállítása! https://stackoverflow.com/questions/13343566/set-select-option-selected-by-value
        $("#mod_nev").val(r_json.rows[0].NEV);
        $("#mod_azon").val(r_json.rows[0].AZON);
        $("#mod_ar").val(r_json.rows[0].AR);
        $("#mod_db").val(r_json.rows[0].MENNYISEG);
        $("#mod_meegys").val(r_json.rows[0].MEEGYS);
        $("#mod_leiras").val(r_json.rows[0].LEIRAS);
        var datum = new Date();                                 // now - de felesleges a dátum, mivel mysql auto....
        $("#mod_datum").val(datum.toISOString().split('T')[0]); // 2021-12-10T18:19:48.000Z'
    }

    $('#myModal0').modal('show');
}






$(document).ready(function() {
    update_gombok(0);           // insert, update, delete nem kell! (csak login után)
    $('#login_modal').modal('show');                           
    $("#kategoria1").empty(); 
    var listItems  = "";
    var k_json = ajax_post("kategoria", 1 );               // post kategoria, json formátum
    for (var i = 0; i < k_json.rows.length; ++i)
    {
        listItems +=`<option value='${k_json.rows[i].ID_KATEGORIA}'>${k_json.rows[i].KATEGORIA}</option>`;
    }
    $("#kategoria1").append(listItems);

    $("#search_button").click(function() {               Search_rekord();       } );
    $("#insert_button").click(function() {               Edit_rekord( 0 );      } );
    $("#modify_button").click(function() { if (ID > 0) { Edit_rekord( ID );   } } );
    $("#delete_button").click(function() { if (ID > 0) { Delete_rekord( ID ); } } );
    $("#save_button").click(function()   {               Save_rekord();         } );

    $("#login_button").click(function() {   
        if ($("#loginspan").html() == " Bejelentkezés") {
            $('#login_modal').modal('show'); 
        } else {   // logout
            var logout_json = ajax_post("logout", 1);  
            console.log(logout_json);
            $("#loginspan").html(' Bejelentkezés');
            $("#loginout").removeClass("bi bi-box-arrow-in-left");
            $("#loginout").addClass("bi bi-box-arrow-in-right");
            üzen("Sikeres logout", "success");
            update_gombok(0); 
            $("#user").html("");
            $("#user-email").html("");
        }  
    });

    $("#login_oksi_button").click(function() { 
        var l_json = ajax_post("login?"+$("#form_login").serialize(), 1) ;  
        if (l_json.message == "ok" && l_json.maxcount == 1) {  
            $("#user").html(`<h5><i class="bi bi-person"></i> ${l_json.rows[0].NEV}</h5>`);
            $("#user-email").html(`${l_json.rows[0].EMAIL}`);
            $('#login_modal').modal('hide');
            üzen(`Sikeres login: ${l_json.rows[0].NEV}!`,"success");
            update_gombok(1); 
            $("#loginspan").html(' Kijelentkezés');
            $("#loginout").removeClass("bi bi-box-arrow-in-right");
            $("#loginout").addClass("bi bi-box-arrow-in-left");

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


    $("#kereses_gomb").click(function() {
        var usernev = $("#user-email").html();
        alert(usernev);
    });


});





function update_gombok (x) {
if (x == 0) { $("#insert_button").hide(); $("#modify_button").hide(); $("#delete_button").hide(); $("#admin_button").hide(); } 
else        { $("#insert_button").show(); $("#modify_button").show(); $("#delete_button").show(); $("#admin_button").show(); }
}