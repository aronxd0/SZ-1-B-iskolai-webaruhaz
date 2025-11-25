function Admin_Velemenykezeles() {

    $("#home_button").closest(".gombdiv").removeClass("aktiv");
    $("#cart_button").closest(".gombdiv").removeClass("aktiv");
    $("#welcome_section").fadeOut(300);

    $("#content_hely").fadeOut(300, function() {
        $("#content_hely").html(`
        
            <div class="row d-flex flex-column flex-xl-row p-1 mx-auto mt-5 space-y-2">

                <!-- OPTION 1 -->
                <div class="col-12 col-xl-4 mx-auto mt-3">
                    <label 
                        class="bg-zinc-50 
                        text-slate-900 
                        shadow-xl 
                        dark:bg-slate-900 
                        dark:text-zinc-200 
                        hover:bg-gray-200 
                        hover:outline outline-black/10 
                        dark:hover:bg-gray-700 
                        dark:hover:-outline-offset-1 
                        dark:hover:outline-white/10 
                        flex items-center justify-between p-4 rounded-xl cursor-pointer 
                            transition-all duration-200
                            has-[:checked]:bg-indigo-100 
                            has-[:checked]:border-indigo-400 
                            has-[:checked]:border 
                            has-[:checked]:shadow-md

                            dark:has-[:checked]:bg-sky-950
                            dark:has-[:checked]:border-sky-700
                            dark:has-[:checked]:border ">

                        <div class="flex items-center gap-3">
                        <input type="radio" name="plan" class="form-check-input" id="varo" checked onchange="AdminVelemenyekMutat(this)">
                        <span class="font-semibold">Jóváhagyásra váró vélemények</span>
                        </div>

                        <div class="flex flex-col text-right">
                        
                        </div>
                    </label>
                </div>

                <!-- OPTION 2 -->
                <div class="col-12 col-xl-4 mx-auto mt-3">
                    <label 
                        class="bg-zinc-50 
                        text-slate-900 
                        shadow-xl 
                        dark:bg-slate-900 
                        dark:text-zinc-200 
                        hover:bg-gray-200 
                        hover:outline outline-black/10 
                        dark:hover:bg-gray-700 
                        dark:hover:-outline-offset-1 
                        dark:hover:outline-white/10 
                        flex items-center justify-between p-4 rounded-xl cursor-pointer 
                            transition-all duration-200
                            has-[:checked]:bg-indigo-100 
                            has-[:checked]:border-indigo-400 
                            has-[:checked]:border 
                            has-[:checked]:shadow-md

                            dark:has-[:checked]:bg-sky-950
                            dark:has-[:checked]:border-sky-700
                            dark:has-[:checked]:border ">

                        <div class="flex items-center gap-3">
                        <input type="radio" name="plan" class="form-check-input" id="jovahagyott" onchange="AdminVelemenyekMutat(this)">
                        <span class="font-semibold">Jóváhagyott vélemények</span>
                        </div>

                        <div class="flex flex-col text-right">
                       
                        </div>
                    </label>
                </div>

                <!-- OPTION 3 -->
                <div class="col-12 col-xl-4 mx-auto mt-3">
                    <label 
                        class="bg-zinc-50 
                        text-slate-900 
                        shadow-xl 
                        dark:bg-slate-900 
                        dark:text-zinc-200 
                        hover:bg-gray-200 
                        hover:outline outline-black/10 
                        dark:hover:bg-gray-700 
                        dark:hover:-outline-offset-1 
                        dark:hover:outline-white/10 
                        flex items-center justify-between p-4 rounded-xl cursor-pointer 
                            transition-all duration-200
                            has-[:checked]:bg-indigo-100 
                            has-[:checked]:border-indigo-400 
                            has-[:checked]:border 
                            has-[:checked]:shadow-md

                            dark:has-[:checked]:bg-sky-950
                            dark:has-[:checked]:border-sky-700
                            dark:has-[:checked]:border
                                        ">

                        <div class="flex items-center gap-3">
                        <input type="radio" name="plan" class="form-check-input" id="elutasitott" onchange="AdminVelemenyekMutat(this)">
                        <span class="font-semibold">Elutasított vélemények</span>
                        </div>

                        <div class="flex flex-col text-right">
                        
                        </div>
                    </label>
                </div>

                </div>

                <div class="col-12 text-center mt-5" id="velemenyek_hely">

                </div>

            
        
        `).fadeIn(300);
        AdminVelemenyekMutat($("#varo")[0]);
        $("#pagi").html("");
        
    });
}


async function AdminVelemenyekMutat(asd) {
    if (asd.id == "varo") {

        try {

            let ss = ``;

            let varo = await ajax_post("velemenyek?szelektalas=1", 1);

            if (varo.rows.length == 0) { 
                $("#velemenyek_hely").fadeOut(300, function() {
                    $("#velemenyek_hely").html("<div class='col-12 text-xl text-center p-3'>Nincsenek jóváhagyásra váró vélemények.</div>");

                }).fadeIn(300);
                
             }
            else {

                ss += `
                    <div class="row d-flex justify-content-center">
                        <div role="alert" 
                        class="
                        col-12 col-lg-4
                        !border !border-t-blue-400/50 !border-b-blue-400/50 !border-r-blue-400/50 !border-l-blue-400/50
                        bg-blue-200/30 
                        text-blue-800 
                        dark:bg-blue-900/20 
                        dark:text-blue-200 
                        w-auto
                        mx-3 
                        px-2 py-3 rounded-4">
                            <i class="bi bi-info-circle-fill"></i>
                            <strong class="font-bold">${varo.maxcount} db</strong>
                            <span> vélemény vár jóváhagyásra</span>
                            
                        </div>
                    </div>
                
                `;

                for (const element of varo.rows) {
                    ss += `
                <div 
                class="
                    w-100 
                    p-3 
                    rounded-4 
                    shadow-xl 
                    bg-zinc-50 
                    text-slate-900 
                    dark:bg-slate-900 
                    dark:text-zinc-200 
                    mt-3 
                    mb-3 
                    comment">
                    <p class="d-flex justify-content-between"><b><span><i class="bi bi-person"></i> ${element.NEV}</span></b>  <span><i class="bi bi-calendar4-week"></i> ${new Date(element.DATUM).toLocaleString('hu-HU', {
                                    year: 'numeric',
                                    month: '2-digit',
                                    day: '2-digit',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                    hour12: false
                                })}</span></p>
                    <p class="d-flex justify-content-start">${element.SZOVEG.toString().replaceAll("\n","<br>")}</p>
                    <div class="d-flex justify-content-end gap-2 mt-2">
                        <button 
                        class="
                        btn 
                        
                        
                        bg-zinc-600 
                        text-zinc-200 
                        rounded-4 
                        dark:bg-slate-800 
                        dark:text-zinc-200 
                        hover:bg-zinc-700 
                        hover:text-red-600 
                        dark:hover:bg-slate-950 
                        dark:hover:text-red-600
                        transition-hover duration-300 ease-in-out 
                            w-auto" onclick="Velemeny_Elutasit(${element.ID_VELEMENY})"> 
                            <i class="bi bi-x-lg"></i>
                            <span class="d-none d-sm-inline"> Elutasítás</span>
                        </button>

                        <button 
                        class="
                        btn 
                         
                        bg-zinc-600 
                        text-zinc-200 
                        rounded-4 
                        dark:bg-slate-800 
                        dark:text-zinc-200 
                        hover:bg-zinc-700 
                        hover:text-emerald-600 
                        dark:hover:bg-slate-950 
                        dark:hover:text-emerald-600
                        transition-hover duration-300 ease-in-out 
                            w-auto" onclick="Velemeny_Elfogad(${element.ID_VELEMENY})"> 
                            <i class="bi bi-check2"></i>
                             <span class="d-none d-sm-inline"> Jóváhagyás</span> 
                        </button>
                    </div>
                </div>`;
                }

                $("#velemenyek_hely").fadeOut(300, function() {
                    $("#velemenyek_hely").html(ss).fadeIn(300);
                });
            }

            


        } catch (err) { console.log("hiba:", err);}


        //$("#velemenyek_hely").html("ide a jovahagyasra varo velemenyek");
    }
    else if (asd.id == "jovahagyott") {
        try {

            let sv = ``;

            let stimm = await ajax_post("velemenyek?szelektalas=0", 1);

            if (stimm.rows.length == 0) { 
               $("#velemenyek_hely").fadeOut(300, function() {
                    $("#velemenyek_hely").html("<div class='col-12 text-xl text-center p-3'>Nincsenek jóváhagyott vélemények.</div>");

                }).fadeIn(300);
            }
            else {
                for (const element of stimm.rows) {
                    sv += `
                <div 
                class="
                    w-100 
                    p-3 
                    

                    rounded-4 
                    shadow-xl 
                    bg-zinc-50 
                    text-slate-900 
                    dark:bg-slate-900 
                    dark:text-zinc-200 
                    mt-3 
                    mb-3 
                    comment">
                    <p class="d-flex justify-content-between"><b><span><i class="bi bi-person"></i> ${element.NEV}</span></b>  <span><i class="bi bi-calendar4-week"></i> ${new Date(element.DATUM).toLocaleString('hu-HU', {
                                    year: 'numeric',
                                    month: '2-digit',
                                    day: '2-digit',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                    hour12: false
                                })}</span></p>
                    <p class="d-flex justify-content-start">${element.SZOVEG.toString().replaceAll("\n","<br>")}</p>
                </div>`;
                }

                $("#velemenyek_hely").fadeOut(300, function() {
                    $("#velemenyek_hely").html(sv).fadeIn(300);
                });
            }

            


        } catch (err) { console.log("hiba:", err);}
    }
    else if (asd.id == "elutasitott") {
        try {

            let ssg = ``;

            let dec = await ajax_post("velemenyek?szelektalas=2", 1);

            if (dec.rows.length == 0) { 
                $("#velemenyek_hely").fadeOut(300, function() {
                    $("#velemenyek_hely").html("<div class='col-12 text-xl text-center p-3'>Nincsenek elutasított vélemények.</div>");

                }).fadeIn(300);
             }
            else {
                for (const element of dec.rows) {
                    ssg += `
                <div 
                class="
                    w-100 
                    p-3 
                    rounded-4 
                    shadow-xl 
                    bg-zinc-50 
                    text-slate-900 
                    dark:bg-slate-900 
                    dark:text-zinc-200 
                    mt-3 
                    mb-3 
                    comment">
                    <p class="d-flex justify-content-between"><b><span><i class="bi bi-person"></i> ${element.NEV}</span></b>  <span><i class="bi bi-calendar4-week"></i> ${new Date(element.DATUM).toLocaleString('hu-HU', {
                                    year: 'numeric',
                                    month: '2-digit',
                                    day: '2-digit',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                    hour12: false
                                })}</span></p>
                    <p class="d-flex justify-content-start">${element.SZOVEG.toString().replaceAll("\n","<br>")}</p>
                </div>`;
                }

                $("#velemenyek_hely").fadeOut(300, function() {
                    $("#velemenyek_hely").html(ssg).fadeIn(300);
                });
            }

            


        } catch (err) { console.log("hiba:", err);}
    }
}





async function Velemeny_Elutasit(id_velemeny) {
    try {

        let elutasit = await ajax_post(`velemeny_elutasit?ID_VELEMENY=${id_velemeny}`, 1);

        if (elutasit.message == "ok") {
            üzen("Művelet sikeresen végrehajtva","success");
        }
        else { üzen(elutasit.message, "danger"); }


        AdminVelemenyekMutat($("#varo")[0]);

    } catch (err) { console.log("hiba:", err); }
}

async function Velemeny_Elfogad(id_velemeny) {
    try {

        let elfogad = await ajax_post(`velemeny_elfogad?ID_VELEMENY=${id_velemeny}`, 1);

        if (elfogad.message == "ok") {
            üzen("Művelet sikeresen végrehajtva","success");
        }
        else { üzen(elfogad.message, "danger"); }

        AdminVelemenyekMutat($("#varo")[0]);


    } catch (err) { console.log("hiba:", err); }
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
        <div class="row mt-5">
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
                my-4
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
        if(sql_input_area.value.replaceAll(/\n/g, " ").trim() =="") throw "Üres a lekérdezés mező";

         
        var adat = await ajax_post(`html_sql?SQL=${sql_input_area.value.replaceAll(/\n/g, " ")}`,1)    

        if(adat.select == true){
            if (adat.adat.rows.length > 0) {
                var html = "<table class='tablazat p-4 mt-3 text-center sticky-header'> <thead class='bg-slate-900 text-zinc-200 border-b-gray-400'><tr>"
                // mezőnevek
                var tablamevek = Object.keys(adat.adat.rows[0])
                console.log(" tablanevek"+ tablamevek);
                // elso sor betölt 
                for(var nevek of tablamevek){
                    html +=  `<th class="p-2 ">${ nevek.toString()}</th>`
                }
                html += "</tr></thead><tbody>"
                for (var item of adat.adat.rows) {
                    html += "<tr class='bg-zinc-50 text-slate-900 dark:bg-sky-950 dark:text-zinc-200 border !border-b-gray-400 !border-r-0 !border-l-0 !border-t-0 dark:!border-b-gray-600 dark:!border-r-0 dark:!border-l-0 dark:!border-t-0'>";
    
                    for (var nev of tablamevek) {
                        html += `<td class='p-2'>${item[nev]}</td>`;
                    }
    
                    html += "</tr>";
                }
    
                html += "</tbody></table>";
                document.getElementById("SQL_hiba").innerHTML = `
                        <div class="table-responsive mt-3">
                            ${html}
                        </div>
                    `;
            }        
        }
        else{
            document.getElementById("SQL_hiba").innerHTML =  `
            
            <div role="alert" 
                    class="
                    bg-emerald-200 
                    text-emerald-700 
                    dark:bg-emerald-900 
                    dark:text-emerald-400 
                    
                    px-4 py-3 rounded-4" style="border: none;">
                        <i class="bi bi-check2"></i>
                        <strong class="font-bold">Művelet sikeresen végrehajtva: </strong>
                        &nbsp;
                        <span> ${adat.adat.rows.info} </span>  
                        
                    </div> `
        }
    }
    catch(e){
    
        var sad = ` 
                <div role="alert" 
                    class="
                    bg-red-200 
                    text-red-700 
                    dark:bg-red-950 
                    dark:text-red-400 
                    
                    px-4 py-3 rounded-4" style="border: none;">
                        <i class="bi bi-exclamation-triangle-fill"></i>
                        <strong class="font-bold">Hiba: </strong>
                        &nbsp;
                        <span> ${e}</span>
                        
                    </div> `

        document.getElementById("SQL_hiba").innerHTML =sad ;
    }
    



}