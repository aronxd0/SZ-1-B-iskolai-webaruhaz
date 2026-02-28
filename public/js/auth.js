// bejelentkezes, kijelentkezes

let bejelentkezett_usernev = "";
let bejelentkezett_useremail = "";
let csoport = "";
let rang = "";

// Bejelentkezés / Kijelentkezés esetén a változók és a felület frissítése
function Frissites() {
    // Ez akkor ha nincs bejelentkezve
    if (!JSON.parse(localStorage.getItem("user"))?.loggedIn) { 
        $("#udv").html(`Üdvözlünk a Csány webáruházban!`);
        $("#loginspan").html(' Bejelentkezés');
        $("#loginout").removeClass("bi bi-box-arrow-in-left");
        $("#loginout").addClass("bi bi-box-arrow-in-right");
        $("#vendegszoveg").html("Jelenleg nem vagy bejelentkezve.");
        $("#user-email").html("");
        $("#rangok").html(``);
        $("#user").html("");
        $("#Elfogyott_gomb").html("");
        $("#NEM_AKTIV").html("");
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
        rang = "";
        document.getElementById("rendalap").selected = true;
        üzen("Sikeres kijelentkezés!", "success");
        update_gombok(0);
        Kezdolap();
    }

    // Ez akkor ha be van jelentkezve
    else { 
        rang = "";
        $("#user").html(`<h5>${bejelentkezett_usernev}</h5>`);
        $("#user-email").html(`<span>${bejelentkezett_useremail}</span>`);
        $("#vendegszoveg").html("");
        $("#udv").html(`Üdvözlünk a Csány webáruházban ${bejelentkezett_usernev.split(" ")[1]}!`);
        rang += RangokHTML(csoport, "sm");

        if (admin) {
            rang += RangokHTML("Admin");
            update_gombok(2); 
        }   
        if (webbolt_admin) {
            rang += RangokHTML("Webbolt Admin");
            update_gombok(2); 
        }
        if (!admin && !webbolt_admin) { update_gombok(1); }

        Joldal = 1;
        $("#rangok").html(rang);        
        $('#login_modal').modal('hide');
        $("#loginspan").html(' Kijelentkezés');
        $("#loginout").removeClass("bi bi-box-arrow-in-right");
        $("#loginout").addClass("bi bi-box-arrow-in-left");
        üzen(`Vásárolj sokat ${bejelentkezett_usernev}!`,"info");

        Kezdolap();
        ADMINVAGYE();
        KosarTetelDB();
    }   
}

$("#login_button").click(function() {   
    if (!JSON.parse(localStorage.getItem("user"))?.loggedIn) { 
        $('#login_modal').modal('show'); 
        $("#loginhiba").html(""); 
        $("#login_nev").val("");
        $("#login_passwd").val("");
        $("#login_nev").removeClass("ring-2 ring-red-500").addClass("focus:ring-emerald-600");
        $("#login_passwd").removeClass("ring-2 ring-red-500").addClass("focus:ring-emerald-600");
    }
    else { $("#logout_modal").modal("show"); }
});

async function BEJELENTKEZES() {
    if ($("#login_nev").val().trim() === "") { 
        $("#loginhiba").html("Kérlek add meg az e-mail címedet!"); 
        $("#login_nev").removeClass("focus:ring-emerald-600").addClass("ring-2 ring-red-500");
        return; 
    } else $("#login_nev").removeClass("ring-2 ring-red-500").addClass("focus:ring-emerald-600");

    if ($("#login_passwd").val().trim() === "") {
        $("#loginhiba").html("Kérlek add meg a jelszavadat!");
        $("#login_passwd").removeClass("focus:ring-emerald-600").addClass("ring-2 ring-red-500");
        return;
    } else $("#login_passwd").removeClass("ring-2 ring-red-500").addClass("focus:ring-emerald-600");

    let l_json = await ajax_call("login?"+$("#form_login").serialize(), "GET", null, true);
    if (l_json.message == "ok" && l_json.maxcount == 1) {
        bejelentkezett_usernev = l_json.rows[0].NEV;
        bejelentkezett_useremail = l_json.rows[0].EMAIL;
        if (l_json.rows[0].ADMIN == "Y") { admin = true; }
        if (l_json.rows[0].WEBBOLT_ADMIN == "Y") { webbolt_admin = true; }
        csoport = l_json.rows[0].CSOPORT;

        localStorage.setItem("user", JSON.stringify({
            loggedIn: true,
            name: bejelentkezett_usernev,
            email: bejelentkezett_useremail,
            group: csoport
        }));
        Frissites();
        $("#loginhiba").html("");
        $('#login_modal').modal('hide'); 
    }
    else {
        $("#loginhiba").html("A megadott e-mail és jelszó páros nem található!");
        $("#login_nev").removeClass("focus:ring-emerald-600").addClass("ring-2 ring-red-500").focus();
        $("#login_passwd").removeClass("focus:ring-emerald-600").addClass("ring-2 ring-red-500").focus();
    }
}

$("#login_oksi_button").click(async function() { BEJELENTKEZES(); });
          
$("#kijelentkezik").click( async function() {
    ajax_call("logout", "GET", null, true).then( () => {
        localStorage.removeItem("user");
        Frissites();
    });  
});

function ADMINVAGYE(){
    if (admin || webbolt_admin) {
        let elfo = `
            <p class="p-2 !border-b !border-b-zinc-800/10 dark:!border-b dark:!border-b-zinc-200/10 dark:!border-t-0 dark:!border-r-0 dark:!border-l-0 mb-3 has-[:checked]:!border-b-sky-600 dark:has-[:checked]:!border-b-sky-600 transition-all duration-300 ease-in-out">
                <input class="form-check-input !border !border-zinc-800/20 bg-zinc-200 hover:cursor-pointer dark:!border dark:!border-zinc-200/30 dark:checked:!border-sky-600 dark:bg-slate-800 focus:outline-none focus:ring-0 focus:ring-offset-0 focus:shadow-none" type="checkbox" id="elf" value="Csakelfogyott" onchange="Elfogyott(this)">
                <label for="elf" class="form-check-label hover:cursor-pointer text-sm"> Elfogyott termékek</label>
            </p>
            `;      
        let nemakt = `
            <p class="p-2 !border-b !border-b-zinc-800/10 dark:!border-b dark:!border-b-zinc-200/10 dark:!border-t-0 dark:!border-r-0 dark:!border-l-0 mb-3 has-[:checked]:!border-b-sky-600 dark:has-[:checked]:!border-b-sky-600 transition-all duration-300 ease-in-out">
                <input class="form-check-input !border !border-zinc-800/20 bg-zinc-200 hover:cursor-pointer dark:!border dark:!border-zinc-200/30 dark:checked:!border-sky-600 dark:bg-slate-800 focus:outline-none focus:ring-0 focus:ring-offset-0 focus:shadow-none" type="checkbox" value ="ads" id="innaktiv" onchange="Elfogyott(this)">
                <label for="innaktiv" class="form-check-label hover:cursor-pointer text-sm"> Inaktiv termékek</label>
            </p>
            `;
        $("#Elfogyott_gomb").html(elfo);
        $("#NEM_AKTIV").html(nemakt);
    } 
}