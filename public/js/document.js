// az oldal betoltese utani resz (document ready function)


window.addEventListener("popstate", (e) => {
    if (!e.state) {
        // Ha nincs state (pl. első betöltés), menj a kezdőlapra
        Kezdolap(false);
        return;
    }
    
    console.log("popstate event:", e.state);
    
    // Különböző nézetek kezelése
    switch(e.state.view) {
        case "home":
            Kezdolap(false);
            break;
            
        case "termek":
            Termek_Mutat(null, e.state.id, false);
            break;
            
        case "kosar":
            Kosar_Mutat(false);
            break;
            
        case "search":
            if (e.state.data) {
                $("#nev1").val(e.state.data.searchTerm || '');
                // További feltételek visszaállítása szükség szerint
                KERESOBAR();
            }
            break;
            
        default:
            Kezdolap(false);
    }
});


$(document).ready(function() {
    
    $("#toast1").toast("hide");

    document.addEventListener('show.bs.offcanvas', () => {
        document.documentElement.classList.add('offcanvas-open');
    });
    document.addEventListener('hidden.bs.offcanvas', () => {
        document.documentElement.classList.remove('offcanvas-open');
    });

    document.addEventListener('show.bs.modal', () => {
        document.documentElement.style.overflow = 'hidden';
    });
    document.addEventListener('hidden.bs.modal', () => {
        document.documentElement.style.overflow = '';
    });

    SESSION();

    
    F5();
                   
    


    


    //ArFeltolt();
    KategoriaFeltolt("kategoria_section", "check", "");

    console.log("xd");

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


    $("#login_passwd").on("keydown", function(e) {
        if (e.key === " ") {
            e.preventDefault();
        }
    });

    $("#login_passwd").on("input", function() {
        let val = $(this).val();
        $(this).val(val.replace(/\s/g, ''));
    });


    $("#nev1").on("focus", function() {
        console.log("keresomezo focus xd");
        FelaTetore();
    });

    $("#termekview").on("hidden.bs.modal", function() {
        console.log("bezarva");
        $("#velemeny_input").val("");
    });

    $('#bezar').on('click', function () {
        if (!JSON.parse(localStorage.getItem("user") || "{}")?.loggedIn) {
            ajax_call("logout", "GET", null, true).then(logoutt => {});
            Kezdolap();
        }
    
    });

    $("#switch").click(function () {
        let user = JSON.parse(localStorage.getItem("user")) || {};
    
        const isDark = $("html").hasClass("dark");
    
        if (isDark) {
            $("html").removeClass("dark");
            $("#switch").html(`<i class="bi bi-moon-fill"></i> Téma`);
            user.ui = { ...user.ui, theme: "light" };
        } else {
            $("html").addClass("dark");
            $("#switch").html(`<i class="bi bi-sun-fill"></i> Téma`);
            user.ui = { ...user.ui, theme: "dark" };
        }
    
        localStorage.setItem("user", JSON.stringify(user));
    });

    


    



    $(".gombdiv button").click(function() {
        Joldal = 1;
        oldalszam = 0;
        sqleddig = "";
        $(".gombdiv").removeClass("aktiv");
        $(this).closest(".gombdiv").addClass("aktiv");
    });

    $("#cart_button").click(function() {
        Kosar_Mutat(true);
    });

    $("#home_button").click(function() {
        Kezdolap(true);
        FelaTetore();
    });


    // slidernek input mezö , változtatni kell a slider inputokaz as well as  a slider value: Enter után  szürni kell , emouseuot on is .

    $("#min_ar").on("input",  function MinarELL() {
        $("#min_ar_input").val($("#min_ar").val());

        SliderELL("min");
        /*
        if(parseInt ($("#min_ar").val()) > parseInt( $("#max_ar").val())){
            $("#max_ar").val(parseInt( $("#min_ar").val()) +1 );  
            $("#max_ar_input").val($("#max_ar").val());
        }   */

    });

    $("#max_ar").on("input",  function MaxarELL() {
        $("#max_ar_input").val($("#max_ar").val());

        SliderELL("max");
        /*
        if(parseInt ($("#max_ar").val()) < parseInt( $("#min_ar").val())){
            $("#min_ar").val(parseInt( $("#max_ar").val()) -1 );  
            $("#min_ar_input").val($("#min_ar").val());
        }*/
    });


    $("#fizetes").off("hidden.bs.modal").on("hidden.bs.modal", function () {
        KosarTeteleiFrissit();
    });

    $("#szurogomb").click(function () {
        KERESOBAR();
    });


    $("#kosarmegtekintese").click(function() {
        $("#cart_button").trigger("click");
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


    const track = document.getElementById("carousel-track");
    const btnLeft = document.getElementById("carousel-left");
    const btnRight = document.getElementById("carousel-right");

    const step = 500; // ennyit scrolloz egy kattintásra (px)

    btnRight.addEventListener("click", () => {
        // ha a végén vagy → vissza az elejére
        if (track.scrollLeft + track.clientWidth >= track.scrollWidth - 5) {
        track.scrollTo({ left: 0, behavior: "smooth" });
        } else {
        track.scrollBy({ left: step, behavior: "smooth" });
        }
    });

    btnLeft.addEventListener("click", () => {
        // ha az elején vagy → ugorj a legvégére
        if (track.scrollLeft <= 5) {
        track.scrollTo({ left: track.scrollWidth, behavior: "smooth" });
        } else {
        track.scrollBy({ left: -step, behavior: "smooth" });
        }
    });

    
    $(".bezarmind").click(function() {
        // Modal bezárása
        const modal = bootstrap.Modal.getInstance(document.getElementById("profil"));
        modal?.hide();
    
        // Offcanvas bezárása
        const offcanvas = bootstrap.Offcanvas.getInstance(document.getElementById("top-navbar"));
        offcanvas?.hide();
    });

    setInterval(async () => {

        SESSION();
        
    }, 30000);

    FelaTetore();

    const hash = window.location.hash;
    if (hash.startsWith('#termek/')) {
        const termekId = hash.split('/')[1];
        Termek_Mutat(null, parseInt(termekId), false);
    } else if (hash === '#kosar') {
        Kosar_Mutat(false);
    } else {
        Kezdolap(false);
    }
    
    // ✅ EZ IS KELL - History inicializálás
    if (!history.state) {
        history.replaceState({ view: 'home' }, 'Kezdőlap', '#home');
    }

});


