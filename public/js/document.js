// az oldal betoltese utani resz (document ready function)

$(document).ready(function() {
    
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

    
    if (localStorage.getItem("loggedIn")) { 
        
        bejelentkezett_usernev = localStorage.getItem("userName") || "";
        bejelentkezett_useremail = localStorage.getItem("userEmail") || "";
        csoport = localStorage.getItem("userGroup") || "";
        admin = localStorage.getItem("isAdmin") === "1";
        webbolt_admin = localStorage.getItem("isWebAdmin") === "1";

        BevaneJelentkezve();
        Kezdolap();
    }
    else {
        $('#login_modal').modal('show');
    };
                   
        


    //ArFeltolt();
    KategoriaFeltolt("kategoria_section", "check", "");

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
        if (!BevanJelentkezve()) {
            ajax_post("logout", 1,).then(logoutt => {});
            Kezdolap();
        }
    
    });

    // sotet mod - vilagos mod valto

    /*
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
    */

    $("#switch").click(function() {
        if ($("html").hasClass("dark")) {
            $("html").removeClass("dark");
            $("#switch").html(`<i class="bi bi-moon-fill"></i> Téma`);
        } else {
            $("html").addClass("dark");
            $("#switch").html(`<i class="bi bi-sun-fill"></i> Téma`);
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

    


    setInterval(async () => {

        SESSION();

        /*
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

                alert('A munkamenet lejárt vagy a szerver újraindult. Kérlek jelentkezz be újra.');
                location.reload(); // frissít, így a UI vendég módra vált
            }

        } catch (err) {
            console.error('Session check hiba', err);
            // Ha a szerver teljesen down, nem muszáj azonnal logoutolni; várj a következő tickre
        }
        */
        
    }, 30000);


});


