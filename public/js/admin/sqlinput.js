function SQLinput(pushHistory = true) {
    $("#kosar").prop("checked", false);
    $("#kezdolap").prop("checked", false);
    // A kosár és kezdőlap gomb inaktívvá tétele ==> aláhuzás levétele

    $("#welcome_section").fadeOut(300);
    $("#felsosor").removeClass("mt-[100px]");;
    $("#kateogoria-carousel").fadeOut(300);

    $("#nezetkicsi").addClass("eltunt");
    $("#nezetnagy").addClass("eltunt");

    $("#content_hely").fadeOut(300, function() {
        // Tartalom betöltése
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
                dark:bg-slate-950 
                dark:text-zinc-200 
                dark:!border 
                dark:!border-zinc-200/20 
                p-3 
                rounded-4 
                placeholder-gray-400 
                dark:placeholder-gray-400 
                " rows="10" placeholder="Ide írd be az SQL lekérdezést..."></textarea>
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

            // lapozó eltüntetése
        $("#pagi").html("");

        if (pushHistory) {
            SPAState.currentView = 'sql';
            SPAState.currentData = {};
            history.pushState(
                { view: 'sql' },
                'sql',
                '#sql'
            );
        }
        
    })
}

// SQL lekérdezés futtatása
async function KER_CLICk(){
    try{
        // SQL lekérdezés mező ellenőrzése

        if(sql_input_area.value.replaceAll(/\n/g, " ").trim() =="") throw '{"error" : "Üres a lekérdezés mező"}';

        // AJAX hívás az SQL lekérdezés futtatásához plusz space/enter/tab kezelése
        var adat = await ajax_call(`html_sql?SQL=${sql_input_area.value.replaceAll(/\n/g, " ")}`, "GET", null, true);


        // ha select akkor táblázatként jelenítse meg az eredményt
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
        // select nélküli műveletek esetén sikerüzenet
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

    // Hiba esetén
    catch(e){
        
        let errmsg = JSON.parse(e);
        var sad = ` 
                <div role="alert" 
                    class="
                    bg-red-200   
                    text-red-700 
                    dark:bg-red-950/50  
                    dark:text-red-400 
                    
                    px-4 py-3 rounded-4" style="border: none;">
                        <i class="bi bi-exclamation-triangle-fill"></i>
                        <strong class="font-bold">Hiba: </strong>
                        &nbsp;
                        <span> ${errmsg.error}</span>
                        
                    </div> `

        document.getElementById("SQL_hiba").innerHTML =sad ;
    }
    

}