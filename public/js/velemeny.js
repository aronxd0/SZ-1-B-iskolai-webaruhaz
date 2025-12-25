// velemenyek irasa, torlese, megjelenitese

async function Velemeny_Kozzetesz(id_termek) {
    
    //const cls = new bootstrap.Collapse('#vlm', { toggle: false });
    if ($("#velemeny_input").val() != "") {
        try {
            let velemenyiras = await ajax_post(`velemeny_add?ID_TERMEK=${id_termek}&SZOVEG=${$("#velemeny_input").val()}`, 1) 
            //cls.hide();
            $("#velemeny_iras").modal("hide");
            console.log(`velemeny_add?ID_TERMEK=${id_termek}&SZOVEG=${$("#velemeny_input").val()}`);

            if (velemenyiras.message == "ok") {
                üzen(`Vélemény elküldve`,"success");
                $("#velemeny_input").val("");
                VelemenyekMutat(id_termek);
            }
            
        }  catch {}
        
        
    }
}

async function Velemeny_Torles(id_velemeny, id_termek) {
    console.log(`gyors teszt xd, ez a velemeny id = ${id_velemeny}, termekid = ${id_termek}`);

    try {
        let velemeny_torles = await ajax_post(`velemeny_del?ID_VELEMENY=${id_velemeny}`, 1);
        if (velemeny_torles.message == "ok") {
            üzen("Vélemény sikeresen törölve!", "success");
            $("#velemeny_input").val("");
            SajatVelemenyekMutat(id_termek);
        }
    } catch {}
    
}

async function SajatVelemenyekMutat(id_termek) {
    let sv = "";
    let allapot_style = "";
    let ikon = "";
    $("#velemeny").prop("checked", false);
    $("#sajat_velemeny").prop("checked", true);
    try {
        
        let sajat_velemeny_lista = await ajax_post(`velemenyek?ID_TERMEK=${id_termek}&SAJATVELEMENY=1`, 1);
        console.log(sajat_velemeny_lista.rows);
        for (const element of sajat_velemeny_lista.rows) {

            if (element.ALLAPOT == "Jóváhagyva") { allapot_style = `bg-emerald-200/30 !border !border-t-emerald-300/50 !border-b-emerald-300/50 !border-r-emerald-300/50 !border-l-emerald-300/50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border border-t-emerald-800/50 border-b-emerald-800/50 border-r-emerald-800/50 border-l-emerald-800/50`; ikon = "✅" }
            else if (element.ALLAPOT == "Jóváhagyásra vár") { allapot_style = `bg-yellow-200/30 !border !border-t-yellow-500/50 !border-b-yellow-500/50 !border-r-yellow-500/50 !border-l-yellow-500/50 text-yellow-700 dark:bg-yellow-500/15 dark:text-yellow-100 dark:border border-t-yellow-500/50 border-b-yellow-500/50 border-l-yellow-500/50 border-r-yellow-500/50`; ikon = "🔄️" }
            else if (element.ALLAPOT == "Elutasítva") { allapot_style = "bg-red-200/30 !border !border-t-red-400/50 !border-b-red-400/50 !border-r-red-400/50 !border-l-red-400/50 text-red-700 dark:bg-red-950/20 dark:text-red-400 dark:border border-t-red-900/50 border-b-red-900/50 border-r-red-900/50 border-l-red-900/50"; ikon = "❌" }

            sv += `

            <div class="${allapot_style} p-3 rounded-xl">
                <div class="d-flex align-items-center gap-3 mb-2">
                    <i class="bi bi-person-circle text-3xl"></i>
                    
                    <div>
                        <p class="font-semibold">${element.NEV}</p>
                        <p class="text-xs">${new Date(element.DATUM).toLocaleString(navigator.language, {
                            year: 'numeric',
                            month: '2-digit',
                            day: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit',
                            hour12: false
                        })}</p>
                        
                    </div>
                    <div class="col-6 d-flex justify-content-end"><p></p></div>
                    
                </div>
                <p class="text-pretty">
                    ${element.SZOVEG.toString()}
                </p>
                <div class="w-full d-flex justify-content-between align-items-center mt-3 !border-t !border-slate-900/10 dark:!border-zinc-200/10">
                    <span>${element.ALLAPOT}</span>
                    <div class="dropup">
                        <button type="button" 
                                class="
                                    btn btn-lg 
                                    bg-transparent 
                                    text-slate-900 
                                    hover:text-red-700 
                                    dark:text-zinc-200 
                                    dark:hover:text-red-700 
                                    transition-all duration-150 ease-in-out 
                                    dropdown-toggle velemenykuka
                                    " 

                                aria-label="teteltorol" data-bs-toggle="dropdown" style="border:none;"><i class="bi bi-trash"></i></button>
                        <ul 
                        class="
                        dropdown-menu 
                        p-2 
                        bg-zinc-100 text-slate-900 dark:bg-slate-700 dark:text-zinc-200
                        " style="min-width: 300px;">
                            <li><span class="dropdown-item-text text-start text-slate-900 dark:text-zinc-200">Biztos vagy benne?</span></li>
                            <li><span class="dropdown-item-text text-start text-slate-900 dark:text-zinc-200">A vélemény örökre el fog veszni (ami hosszú idő)</span></li>
                            <li class="d-flex justify-content-end gap-2 p-3">
                                 <button type="button" class="btn bg-zinc-600 text-zinc-200 rounded-4 dark:bg-slate-800 dark:text-zinc-200 hover:bg-zinc-700 hover:text-zinc-200 dark:hover:bg-slate-900 dark:hover:text-zinc-200 bi bi-x-lg" > Mégse</button>
                                 <button type="button" class="btn bg-zinc-600 text-zinc-200 rounded-4 dark:bg-slate-800 dark:text-zinc-200 hover:bg-zinc-700 hover:text-red-500 dark:hover:bg-slate-900 dark:hover:text-red-500 bi bi-trash" onclick='Velemeny_Torles(${element.ID_VELEMENY},${element.ID_TERMEK})' > Törlés</button>                                                                                                                                        
                                
                                
                        </ul>
                    </div> 
                </div>
                
            </div>






            <!--
            <div role="alert" class="w-100 p-3 rounded-4 mt-3 mb-3 comment ${allapot_style}">
                <p class="d-flex justify-content-between"><b><span><i class="bi bi-person"></i> ${element.NEV}</span></b>  <span><i class="bi bi-calendar4-week"></i> ${new Date(element.DATUM).toLocaleString(navigator.language, {
                                                                                                                                                                            year: 'numeric',
                                                                                                                                                                            month: '2-digit',
                                                                                                                                                                            day: '2-digit',
                                                                                                                                                                            hour: '2-digit',
                                                                                                                                                                            minute: '2-digit',
                                                                                                                                                                            hour12: false
                                                                                                                                                                        })}</span></p>
                <p class="text-pretty">${element.SZOVEG.toString()}</p>

                 <div class="d-flex justify-content-between align-items-center">
                    <div class="w-auto">
                       <span><strong>${element.ALLAPOT} ${ikon}</strong></span>                                                                                                                                                     
                    </div>

                    <div class="dropup">
                        <button type="button" 
                                class="
                                    btn btn-lg 
                                    bg-transparent 
                                    text-slate-900 
                                    hover:text-red-700 
                                    dark:text-zinc-200 
                                    dark:hover:text-red-700 
                                    transition-all duration-150 ease-in-out 
                                    dropdown-toggle velemenykuka
                                    " 

                                aria-label="teteltorol" data-bs-toggle="dropdown" style="border:none;"><i class="bi bi-trash"></i></button>
                        <ul 
                        class="
                        dropdown-menu 
                        p-2 
                        bg-zinc-100 text-slate-900 dark:bg-slate-700 dark:text-zinc-200
                        " style="min-width: 300px;">
                            <li><span class="dropdown-item-text text-start text-slate-900 dark:text-zinc-200">Biztos vagy benne?</span></li>
                            <li><span class="dropdown-item-text text-start text-slate-900 dark:text-zinc-200">A vélemény örökre el fog veszni (ami hosszú idő)</span></li>
                            <li class="d-flex justify-content-end gap-2 p-3">
                                 <button type="button" class="btn bg-zinc-600 text-zinc-200 rounded-4 dark:bg-slate-800 dark:text-zinc-200 hover:bg-zinc-700 hover:text-zinc-200 dark:hover:bg-slate-900 dark:hover:text-zinc-200 bi bi-x-lg" > Mégse</button>
                                 <button type="button" class="btn bg-zinc-600 text-zinc-200 rounded-4 dark:bg-slate-800 dark:text-zinc-200 hover:bg-zinc-700 hover:text-red-500 dark:hover:bg-slate-900 dark:hover:text-red-500 bi bi-trash" onclick='Velemeny_Torles(${element.ID_VELEMENY},${element.ID_TERMEK})' > Törlés</button>                                                                                                                                        
                                
                                
                        </ul>
                    </div>                                                                                                                                                     
                 
                 </div>                                                                                                                                                       

                <p class="d-flex align-self-center justify-content-between"> </p>
                
                     
                
            </div>
            -->
            `;
        }
        console.log(sv);
        $("#velemenyek").fadeOut(300, function() {
            $("#velemenyek").html(sv).fadeIn(300);
        });
        console.log(`sajat velemenyek betoltve`);

    } catch (err) { console.log("hiba:", err); }
}


async function VelemenyekMutat(id_termek) {
    let vv = "";
    //$("#velemenyek").html("");
    $("#velemeny").prop("checked", true);
    $("#sajat_velemeny").prop("checked", false);
    try {
        
        let velemeny_lista = await ajax_post(`velemenyek?ID_TERMEK=${id_termek}`, 1);
        if (velemeny_lista.rows.length == 0) { $("#velemenyek").html("<div class='col-12 text-xl text-center p-3'>Ehhez a termékhez még senki nem írt véleményt :(</div>"); }
        else {
            for (const element of velemeny_lista.rows) {
                vv += `

                <div class="!border-b !border-gray-300 pb-4">
                    <div class="flex items-center gap-3 mb-2">
                    <i class="bi bi-person-circle text-3xl"></i>
                    <div>
                        <p class="font-semibold">${element.NEV}</p>
                        <p class="text-xs text-zinc-500">${new Date(element.DATUM).toLocaleString(navigator.language, {
                            year: 'numeric',
                            month: '2-digit',
                            day: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit',
                            hour12: false
                        })}</p>
                    </div>
                    </div>
                    <p class="text-zinc-600 dark:text-zinc-400">
                    ${element.SZOVEG.toString()}
                    </p>
                </div>



                <!--
                <div 
                class="
                    w-100 
                    p-3 
                    rounded-4 
                    shadow-xl 
                    bg-zinc-50 
                    text-slate-900 
                    dark:bg-slate-900 
                    dark:!border dark:!border-zinc-200/20  
                    dark:text-zinc-200 
                    mt-3 
                    mb-3 
                    comment">
                    <p class="d-flex justify-content-between"><b><span><i class="bi bi-person"></i> ${element.NEV}</span></b>  <span><i class="bi bi-calendar4-week"></i> ${new Date(element.DATUM).toLocaleString(navigator.language, {
                                    year: 'numeric',
                                    month: '2-digit',
                                    day: '2-digit',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                    hour12: false
                                })}</span></p>
                    <p class="text-pretty">${element.SZOVEG.toString()}</p>
                </div>
                -->

                `;
            }
            console.log(vv);

            $("#velemenyek").fadeOut(300, function() {
                $("#velemenyek").html(vv).fadeIn(300);
            });
            console.log(`velemenyek betoltve`);
        }
        
        

    } catch (err) { console.log("hiba:", err); }
}