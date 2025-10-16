$(document).ready(function() {
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
    

    // admin oldal
    $("#admin_button").click(function() {
        $("#content_hely").html("");
        $("#content_hely").html("ide jon az admin resz");
        $("#pagi").html("");
    });

    $("#szurogomb").click(function () {
        KERESOBAR();
    });


    $("#save_button").click(function() {
        console.log(`KURVA ANYÁD: ${$("#mod1").serialize()}`);
    });
});


