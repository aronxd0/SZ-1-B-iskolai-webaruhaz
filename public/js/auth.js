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
        üzen("Sikeres logout", "success");
        $("#vendegszoveg").html("Jelentkezz be a fiókodba");
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
        update_gombok(0);
        Kezdolap();
    }

    // Ez akkor ha be van jelentkezve
    else { 
        rang = "";
        $("#user").html(`<i class="bi bi-person"></i> <h5>${bejelentkezett_usernev}</h5>`);
        $("#user-email").html(`<i class="bi bi-envelope"></i> <span>${bejelentkezett_useremail}</span>`);
        $("#vendegszoveg").html("");
        $("#udv").html(`Üdvözlünk a Csány webáruházban <span class="font-semibold">${bejelentkezett_usernev.split(" ")[1]}</span>!`);
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
    if (!JSON.parse(localStorage.getItem("user"))?.loggedIn) {$('#login_modal').modal('show'); }
    else { $("#logout_modal").modal("show"); }
});

$("#login_oksi_button").click(async function() { 
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
            group: csoport,
            ui: { theme: "light" },
        }));
        Frissites();
    }
});
          
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
                <label for="elf" class="form-check-label hover:cursor-pointer "> Az elfogyott áruk mutatása</label>
            </p>
            `;      
        let nemakt = `
            <p class="p-2 !border-b !border-b-zinc-800/10 dark:!border-b dark:!border-b-zinc-200/10 dark:!border-t-0 dark:!border-r-0 dark:!border-l-0 mb-3 has-[:checked]:!border-b-sky-600 dark:has-[:checked]:!border-b-sky-600 transition-all duration-300 ease-in-out">
                <input class="form-check-input !border !border-zinc-800/20 bg-zinc-200 hover:cursor-pointer dark:!border dark:!border-zinc-200/30 dark:checked:!border-sky-600 dark:bg-slate-800 focus:outline-none focus:ring-0 focus:ring-offset-0 focus:shadow-none" type="checkbox" value ="ads" id="innaktiv" onchange="Elfogyott(this)">
                <label for="innaktiv" class="form-check-label hover:cursor-pointer "> Az inaktiv áruk mutatása</label>
            </p>
            `;
        $("#Elfogyott_gomb").html(elfo);
        $("#NEM_AKTIV").html(nemakt);
    } 
}