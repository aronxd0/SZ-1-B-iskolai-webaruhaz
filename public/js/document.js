// az oldal betoltese utani resz (document ready function)

window.addEventListener("popstate", async (e) => {
    if (!e.state) {
        // Ha nincs state (pl. első betöltés), menj a kezdőlapra
        await Kezdolap(false);
        return;
    }
    console.log(e.state);
    
    // Különböző nézetek kezelése
    switch(e.state.view) {
        case "home": Kezdolap(false); break;
        case "termek": Termek_Mutat(null, e.state.id, false); break;
        case "kosar": Kosar_Mutat(false); break;
        case "rendeleseim": rendelesekmegtolt(false); break;
        case "rendeleseimreszlet": toggleRendeles(e.state.id, e.state.datum, e.state.szallcim, e.state.fizmod, e.state.szallmod, e.state.nev, e.state.email, e.state.afa, e.state.vegosszeg, false); break;
        case "velemeny-kezeles": Admin_Velemenykezeles(false); break;
        case "statisztika": Statisztikak(false); break;
        case "sql": SQLinput(false); break;
        case "search":
            if (e.state.data) {
                $("#nev1").val(e.state.data.kifejezes || '');
                await KERESOBAR(false);
            }
            break;
            
        default: await Kezdolap(false);
    }
});

$(document).ready(function() {
    $("#toast1").toast("hide");

    // Modal és Offcanvas ha meg vannak nyitva ne lehessen görgetni a mögötte lévő tartalmat
    document.addEventListener('show.bs.offcanvas', () => { document.documentElement.classList.add('offcanvas-open'); });
    document.addEventListener('hidden.bs.offcanvas', () => { document.documentElement.classList.remove('offcanvas-open'); });

    document.addEventListener('show.bs.modal', () => { document.documentElement.style.overflow = 'hidden';});
    document.addEventListener('hidden.bs.modal', () => { document.documentElement.style.overflow = ''; });

    SESSION();
    F5();
    KategoriaFeltolt("kategoria_section", "check", "", false);

    var input = document.getElementById("nev1");

    // enterrel keresés
    input.addEventListener("keypress", function(event) {
        if (event.key === "Enter") {
            event.preventDefault();
            document.getElementById("kereses_gomb").click();
        }
    });

    $("#login_passwd").on("keydown", function(e) { if (e.key === " ") { e.preventDefault(); } });

    $("#nev1").on("keydown", function(e) { if (e.key === "<" || e.key === ">" || e.key === "&" || e.key === "%") { e.preventDefault(); } });

    $("#nev1").on("paste", function (e) {
        const text = (e.originalEvent || e).clipboardData.getData("text");
        if (/[<>&%]/.test(text)) {
          e.preventDefault();
        }
      });

    $("#login_passwd").on("input", function() {
        let val = $(this).val();
        $(this).val(val.replace(/\s/g, ''));
    });

    $("#nev1").on("focus", function() { FelaTetore(); });

    $('#bezar').on('click', function () {
        if (!JSON.parse(localStorage.getItem("user") || "{}")?.loggedIn) {
            ajax_call("logout", "GET", null, true).then(logoutt => {});
            Kezdolap();
        }
    });

    /*
    $("#switch").click(function () {
        let user = JSON.parse(localStorage.getItem("user")) || {};
        const isDark = $("html").hasClass("dark");
        if (isDark) {
            $("html").removeClass("dark");
            $("#switch").html(`<i class="bi bi-moon-fill"></i>`);
            user.ui = { ...user.ui, theme: "light" };
        } else {
            $("html").addClass("dark");
            $("#switch").html(`<i class="bi bi-sun-fill"></i>`);
            user.ui = { ...user.ui, theme: "dark" };
        }
        localStorage.setItem("user", JSON.stringify(user));
    });
    */

    // slidernek input mezö , változtatni kell a slider inputokaz as well as  a slider value: Enter után  szürni kell , emouseuot on is .
    $("#min_ar").on("input",  function MinarELL() {
        $("#min_ar_input").val($("#min_ar").val());
        SliderELL("min");
    });

    $("#max_ar").on("input",  function MaxarELL() {
        $("#max_ar_input").val($("#max_ar").val());
        SliderELL("max");
    });

    $("#fizetes").off("hidden.bs.modal").on("hidden.bs.modal", function () { KosarTeteleiFrissit(); });

    $("#szurogomb").click(function () { KERESOBAR(); });

    $("#kereses_gomb").click(function () {
        if ($("#nev1").val() == "") { üzen("A semmire nem kereshetsz rá", "info"); return; }
        $("#keresomodal").modal("hide");
        KERESOBAR(); 
    });

    $("#mySwitch").on("change", function() {
        if ($(this).is(":checked")) {
            $("#switchtext").html("Aktív");
            $("#mySwitch").val("YES");
        }
        else {
            $("#switchtext").html("Inaktív");
            $("#mySwitch").val("NO");
        }
    });

    const sav = document.getElementById("carousel-track");
    const balgomb = document.getElementById("carousel-left");
    const jobbgomb = document.getElementById("carousel-right");

    const mennyit = 500; // ennyit scrolloz egy kattintásra (px)

    jobbgomb.addEventListener("click", () => {
        // ha a végén vagy → vissza az elejére
        if (sav.scrollLeft + sav.clientWidth >= sav.scrollWidth - 5) {
            sav.scrollTo({ left: 0, behavior: "smooth" });
        } else {
            sav.scrollBy({ left: mennyit, behavior: "smooth" });
        }
    });

    balgomb.addEventListener("click", () => {
        // ha az elején vagy → ugorj a legvégére
        if (sav.scrollLeft <= 5) {
            sav.scrollTo({ left: sav.scrollWidth, behavior: "smooth" });
        } else {
            sav.scrollBy({ left: -mennyit, behavior: "smooth" });
        }
    });

    $(document).on("click", ".bezarmind", function() {
        const modal = bootstrap.Modal.getInstance(document.getElementById("profil"));
        modal?.hide();
        const offcanvas = bootstrap.Offcanvas.getInstance(document.getElementById("top-navbar"));
        offcanvas?.hide();
    });

    $('#suti_elfogad').on('click', function () {
        localStorage.setItem('suti', 'true');
        bootstrap.Modal.getInstance(document.getElementById('suticucc')).hide();
    });

    if (!localStorage.getItem('suti')) {
        const modal = new bootstrap.Modal(document.getElementById('suticucc'));
        modal.show();
    }

    const tema = localStorage.getItem("theme");
    if (!tema) { Megjelenes("system");} 
    else { Megjelenes(tema); }

    const media = window.matchMedia("(prefers-color-scheme: dark)");
    media.addEventListener("change", function (e) {
        if (localStorage.getItem("theme") === "system") {
            $("html").toggleClass("dark", e.matches);
        }
    });

    filterToggle.addEventListener('click', openFilter);
    closeFilter.addEventListener('click', closeFilterFunc);
    overlay.addEventListener('click', closeFilterFunc);

    // ESC billentyűvel is bezárható
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && filterSidebar.classList.contains('active')) {
            closeFilterFunc();
        }
    });


    const hash = window.location.hash;
    if (hash.startsWith('#termek/')) {
        const termekId = hash.split('/')[1];
        Termek_Mutat(null, parseInt(termekId), false);
    } else if (hash === '#kosar') {
        Kosar_Mutat(false);
    } else if (hash === '#rendeleseim') {
        rendelesekmegtolt(false); 
    } else if (hash === '#velemenykezeles') {
        Admin_Velemenykezeles(false);
    } else if (hash === "#statisztika") {
        Statisztikak(false);
    } else if (hash === "#sql") {
        SQLinput(false);
    }
    else { Kezdolap(false); }
    
    if (!history.state) { history.replaceState({ view: 'home' }, 'Kezdőlap', '#home'); }

    FelaTetore();
    setInterval(async () => { SESSION(); }, 30000);
});