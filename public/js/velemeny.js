// velemenyek irasa, torlese, megjelenitese

async function Velemeny_Kozzetesz(id_termek) {
    if ($("#velemeny_input").val() != "") {
        try {
            let velemenyiras = await ajax_call(`velemeny_add?ID_TERMEK=${id_termek}&SZOVEG=${$("#velemeny_input").val()}`, "POST", null, true);
            $("#velemeny_iras").modal("hide");
 
            if (velemenyiras.message == "ok") {
                üzen(`Vélemény elküldve`,"success");
                $("#velemeny_input").val("");
                VelemenyekMutat(id_termek);
            }
        }  catch (err) { console.error(err); }
    }
}

async function Velemeny_Torles(id_velemeny, id_termek) {
    try {
        let velemeny_torles = await ajax_call(`velemeny_del?ID_VELEMENY=${id_velemeny}`, "DELETE", null, true);
        if (velemeny_torles.message == "ok") {
            üzen("Vélemény sikeresen törölve!", "success");
            $("#velemeny_input").val("");
            SajatVelemenyekMutat(id_termek);
        }
    } catch (err) { console.error(err); }
}

async function SajatVelemenyekMutat(id_termek) {
    let sv = "";
    let allapot_style = "";
    $("#velemeny").prop("checked", false);
    $("#sajat_velemeny").prop("checked", true);
    try {
        let sajat_velemeny_lista = await ajax_call(`velemenyek?ID_TERMEK=${id_termek}&SAJATVELEMENY=1`, "GET", null, true);

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
                        <p class="text-xs">${new Date(element.DATUM).toLocaleString(navigator.language, { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false})}</p>
                    </div>
                    <div class="col-6 d-flex justify-content-end"><p></p></div>
                </div>
                <p class="text-pretty text-sm sm:text-base">${element.SZOVEG.toString()}</p>
                <div class="w-full d-flex justify-content-between align-items-center mt-3 !border-t !border-slate-900/10 dark:!border-zinc-200/10">
                    <span>${element.ALLAPOT}</span>
                    <div class="dropup">
                        <button type="button" class="btn btn-lg bg-transparent text-slate-900 hover:text-red-700 dark:text-zinc-200 dark:hover:text-red-700 transition-all duration-150 ease-in-out dropdown-toggle velemenykuka" aria-label="teteltorol" data-bs-toggle="dropdown" style="border:none;"><i class="bi bi-trash"></i></button>
                        <ul class=" dropdown-menu p-2 bg-zinc-100 text-slate-900 dark:bg-slate-700 dark:text-zinc-200" style="min-width: 300px;">
                            <li><span class="dropdown-item-text text-start text-slate-900 dark:text-zinc-200">Biztos vagy benne?</span></li>
                            <li><span class="dropdown-item-text text-start text-slate-900 dark:text-zinc-200">A vélemény örökre el fog veszni (ami hosszú idő)</span></li>
                            <li class="d-flex justify-content-end gap-2 p-3">
                                <button type="button" class="btn bg-zinc-600 text-zinc-200 rounded-4 dark:bg-slate-800 dark:text-zinc-200 hover:bg-zinc-700 hover:text-zinc-200 dark:hover:bg-slate-900 dark:hover:text-zinc-200 bi bi-x-lg"> Mégse</button>
                                <button type="button" class="btn bg-zinc-600 text-zinc-200 rounded-4 dark:bg-slate-800 dark:text-zinc-200 hover:bg-zinc-700 hover:text-red-500 dark:hover:bg-slate-900 dark:hover:text-red-500 bi bi-trash" onclick='Velemeny_Torles(${element.ID_VELEMENY},${element.ID_TERMEK})'> Törlés</button>                                                                                                                                        
                            </li>
                        </ul>
                    </div> 
                </div>
            </div>`;
        }
        
        $("#velemenyek").fadeOut(300, function() {
            $("#velemenyek").html(sv).fadeIn(300);
        });
    } catch (err) { console.error(err); }
}

async function VelemenyekMutat(id_termek) {
    let vv = "";
    $("#velemeny").prop("checked", true);
    $("#sajat_velemeny").prop("checked", false);
    try {
        let velemeny_lista = await ajax_call(`velemenyek?ID_TERMEK=${id_termek}`, "GET", null, true);
        if (velemeny_lista.rows.length == 0) { $("#velemenyek").html("<div class='col-12 text-xl text-center p-3'>Ehhez a termékhez még senki nem írt véleményt :(</div>"); }
        else {
            for (const element of velemeny_lista.rows) {
                vv += `
                    <div class="!border-b !border-gray-300 dark:!border-b dark:!border-sky-950 pb-4">
                        <div class="flex items-center gap-3 mb-2">
                            <i class="bi bi-person-circle text-3xl"></i>
                            <div class="w-full">
                                <p class="font-semibold space-x-2">${element.NEV} </p>
                                <p class="text-xs text-zinc-500">${new Date(element.DATUM).toLocaleString(navigator.language, { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false })}</p>
                            </div>
                        </div>
                        <p class="text-zinc-600 dark:text-zinc-400 text-sm sm:text-base">${element.SZOVEG.toString()}</p>
                    </div>`;
            }
            $("#velemenyek").fadeOut(300, function() {
                $("#velemenyek").html(vv).fadeIn(300);
            });
        }
    } catch (err) { console.error(err); }
}