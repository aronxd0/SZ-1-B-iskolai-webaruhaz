// bejelentkezes, kijelentkezes

function BevanJelentkezve() {
    if ($("#loginspan").html() == " Bejelentkezés") { return false; }
    else { return true; }
}

$("#login_button").click(function() {   
        if (!BevanJelentkezve()) {
            $('#login_modal').modal('show'); $("#login_gomb_div").removeClass("bal jobb").addClass("kozep");
        } else {   // logout
            $("#logout_modal").modal("show");
            
        }  
});


$("#login_oksi_button").click(function() { 
    ajax_post("login?"+$("#form_login").serialize(), 1).then(l_json => {
        if (l_json.message == "ok" && l_json.maxcount == 1) {  
            $("#user").html(`<h5><i class="bi bi-person"></i> ${l_json.rows[0].NEV}</h5>`);
            $("#user-email").html(`<i class="bi bi-envelope"></i> ${l_json.rows[0].EMAIL}`);
            
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
        _nev = "" ;
        _emil = "" ;
        _cim = ""  ;
        _city = "" ;
        _iszam = "";
        _country = "";
        fizmod = "";
        szallmod = "";
        megjegyzes = "";
        
        document.getElementById("rendalap").selected = true;

        document.getElementById("Elfogyott_gomb").innerHTML = ``;
        document.getElementById("NEM_AKTIV").innerHTML = ``;
        //Kezdolap();
        $("#home_button").trigger("click");
        update_gombok(0);
    });  
});


function ADMINVAGYE(){
    if(admin || webbolt_admin){// ha admin akkor a "csakelfogyott " és a "Csak inaktiv" gomb is látszódjon
        document.getElementById("Elfogyott_gomb").innerHTML = `
            <p>
                <input class="form-check-input" type="checkbox" id="elf" value="Csakelfogyott" onchange="Elfogyott(this)">
                <label for="elf" class="form-check-label"> Az elfogyott áruk mutatása</label>
            </p>
            `;      
        document.getElementById("NEM_AKTIV").innerHTML = `
            <p>
                <input class="form-check-input" type="checkbox" value ="ads" id="innaktiv" onchange="Elfogyott(this)">
                <label for="innaktiv" class="form-check-label"> Az inaktiv áruk mutatása</label>
            </p>
            `;
    } 
}