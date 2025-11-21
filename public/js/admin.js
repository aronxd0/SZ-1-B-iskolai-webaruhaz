function Admin_Velemenykezeles() {

    $("#home_button").closest(".gombdiv").removeClass("aktiv");
    $("#cart_button").closest(".gombdiv").removeClass("aktiv");
    $("#welcome_section").fadeOut(300);

    $("#content_hely").fadeOut(300, function() {
        $("#content_hely").html(`
        
        <div class="d-flex flex-column flex-lg-row">

            <div class="col-12 col-lg-4 text-center p-2 mt-3">
                <span class="text-xl">jovahagyasra varo velemenyek</span>
            </div>

            <div class="col-12 col-lg-4 text-center p-2 mt-3">
                <span class="text-xl">jovahagyott velemenyek</span>
            </div>

            <div class="col-12 col-lg-4 text-center p-2 mt-3">
                <span class="text-xl">elutasitott velemenyek</span>
            </div>
        </div>
        
        `).fadeIn(300);
        $("#pagi").html("");
    });
}

function UjTermek() {
    $("#home_button").closest(".gombdiv").removeClass("aktiv");
    $("#cart_button").closest(".gombdiv").removeClass("aktiv");

    $("#content_hely").fadeOut(300, function() {
        $("#content_hely").html(`
        <div class="row">
            <div class="col-12 text-center p-2 mt-3">
                <span class="text-xl">uj termek letrehozasa</span>
            </div>
        </div>
        `).fadeIn(300);
        $("#pagi").html("");
    });
    Termek_Edit(event,0,"bevitel");

    $("#idx1").html(`Új termék: `);

    $("#mod_nev").on("keyup", function(e) {
        let keres = $(this).val();
        $("#idx1").html(`Új termék: <b>${keres}</b>`);
    });

    $("#save_button").html(`<i class="bi bi-plus-lg"></i>&nbsp;Új termék létrehozása`);
}

function Statisztikak() {
    $("#home_button").closest(".gombdiv").removeClass("aktiv");
    $("#cart_button").closest(".gombdiv").removeClass("aktiv");
    

    $("#content_hely").fadeOut(300, function() {
        $("#content_hely").html(`
        <div class="row">
            <div class="col-12 text-center p-2 mt-3">
                <span class="text-xl">statisztikak</span>
            </div>
        </div>
        `).fadeIn(300);
        $("#pagi").html("");
    });
}

function SQLinput() {
    $("#home_button").closest(".gombdiv").removeClass("aktiv");
    $("#cart_button").closest(".gombdiv").removeClass("aktiv");

    $("#welcome_section").fadeOut(300);

    $("#content_hely").fadeOut(300, function() {
        $("#content_hely").html(`
        <div class="row">
            <div class="col-12 text-center p-2 mt-3">
                <span class="text-xl">SQL Input</span>
            </div>
        </div>

        <div class=mt-3">
            <div class="col-12 px-0 px-lg-5 py-1">
                <textarea id="sql_input_area" 
                class="
                resize-none 
                form-control 
                shadow-xl 
                bg-zinc-50 
                text-slate-900 
                dark:bg-slate-900 
                dark:text-zinc-200 
                p-3 
                rounded-4 
                placeholder-gray-400 
                dark:placeholder-gray-400 
                " rows="10" placeholder="Ide írd be az SQL lekérdezést..." style="border:none;"></textarea>
            </div>

            <div class="col-12 d-flex justify-content-center justify-content-lg-end px-0 px-lg-5 py-1">
                <button id="sql_execute_button" 
                class="
                btn 
                
                text-zinc-200 
                bg-zinc-600 
          rounded-4 
          dark:bg-slate-800 
          dark:text-zinc-200 
          hover:bg-zinc-700 
          hover:text-zinc-200 
          dark:hover:bg-slate-900 
          dark:hover:text-zinc-200
                " onclick="KER_CLICk()">
                    <i class="bi bi-play-fill"></i>&nbsp;Lekérdezés futtatása
                </button>
            </div>
        </div>

        <div class="col-12 
         d-flex justify-content-center 
        
         "  
            id="SQL_hiba">

             &nbsp
            </div>


        `).fadeIn(300);
        $("#pagi").html("");
        
    })
}

async function KER_CLICk(){
    try{
         
        var adat = await ajax_post(`html_sql?SQL=${sql_input_area}`,1)
    }
    catch(e){
        var sad = ` <div class="border border-danger rounded-4 bg-zinc-50 p-3   shadow-xl  "> 
                ${e}
                </div> `

        document.getElementById("SQL_hiba").innerHTML =sad ;
    }
    



}