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
                        class="flex items-center justify-between p-3 rounded-xl cursor-pointer 
                            bg-zinc-100 
                            border transition-all duration-200
                            has-[:checked]:bg-indigo-50 
                            has-[:checked]:border-indigo-400 
                            has-[:checked]:shadow-md">

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
                        class="flex items-center justify-between p-3 rounded-xl cursor-pointer 
                        bg-zinc-100 
                            border transition-all duration-200
                            has-[:checked]:bg-indigo-50 
                            has-[:checked]:border-indigo-400 
                            has-[:checked]:shadow-md">

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
                        class="flex items-center justify-between p-3 rounded-xl cursor-pointer 
                        bg-zinc-100 
                            border transition-all duration-200
                            has-[:checked]:bg-indigo-50 
                            has-[:checked]:border-indigo-400 
                            has-[:checked]:shadow-md">

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
                    <div role="alert" class="bg-blue-100 border border-blue-500 text-blue-700 px-4 py-3 rounded-4">
                        <i class="bi bi-info-circle-fill"></i>
                        <strong class="font-bold">${varo.maxcount} db</strong>
                        <span> vélemény vár jóváhagyásra</span>
                        
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
                    dark:bg-slate-700 
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
                        
                        bi bi-x-lg 
                        bg-zinc-600 
                        text-zinc-200 
                        rounded-4 
                        dark:bg-slate-900 
                        dark:text-zinc-200 
                        hover:bg-zinc-700 
                        hover:text-red-600 
                        dark:hover:bg-slate-950 
                        dark:hover:text-red-600
                        transition-hover duration-300 ease-in-out 
                            w-auto" onclick="Velemeny_Elutasit(${element.ID_VELEMENY})"> Elutasítás </button>

                        <button 
                        class="
                        btn 
                        
                        bi bi-check2  
                        bg-zinc-600 
                        text-zinc-200 
                        rounded-4 
                        dark:bg-slate-900 
                        dark:text-zinc-200 
                        hover:bg-zinc-700 
                        hover:text-emerald-600 
                        dark:hover:bg-slate-950 
                        dark:hover:text-emerald-600
                        transition-hover duration-300 ease-in-out 
                            w-auto" onclick="Velemeny_Elfogad(${element.ID_VELEMENY})"> Jóváhagyás </button>
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
                    dark:bg-slate-700 
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
                    dark:bg-slate-700 
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
         
        var adat = await ajax_post(`html_sql?SQL=${sql_input_area.value.replaceAll(/\n/g, " ")}`,1)    

        if(adat.select == true){
            if (adat.adat.rows.length > 0) {
                var html = "<table class=' table table-striped table-bordered p-4 mt-3 text-center'  ><tr>"
                // mezőnevek
                var tablamevek = Object.keys(adat.adat.rows[0])
                console.log(" tablanevek"+ tablamevek);
                // elso sor betölt 
                for(var nevek of tablamevek){
                    html +=  `<th class="p-2">${ nevek.toString()}</th>`
                }
                html+="<>"
                for (var item of adat.adat.rows) {
                    html += "<tr>";
    
                    for (var nev of tablamevek) {
                        html += `<td>${item[nev]}</td>`;
                    }
    
                    html += "</tr>";
                }
    
                html += "</table>";
                document.getElementById("SQL_hiba").innerHTML = `
                        <div class="table-responsive mt-3">
                            ${html}
                        </div>
                    `;
            }        
        }
        else{
            document.getElementById("SQL_hiba").innerHTML = "hkaki" ;
        }
    }
    catch(e){
    
        var sad = ` <div class="border border-danger rounded-4 bg-zinc-50 p-3   shadow-xl  "> 
                ${e}  
                </div> `

        document.getElementById("SQL_hiba").innerHTML =sad ;
    }
    



}