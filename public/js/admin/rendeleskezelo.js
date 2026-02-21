let a_jelenlegi = 1;
let a_osszesoldal = 0;

async function RendelesekKezelese(pushHistory = true) {

    var s = `
        <div class="col-12 text-center p-2"><span class="text-xl">Beérkezett rendelések</span></div>
            <div class="max-w-7xl mx-auto my-5 px-4 sm:px-6">
                <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        `;

    const itemek = await ajax_call(`rendelesek?OFFSET=${(a_jelenlegi-1)}&kezeles=1`, "GET", null, true);

    a_osszesoldal = Math.ceil(itemek.maxcount / 10);
    
    if (itemek.maxcount != 0) {
        for (const elemek of itemek.rows) {


            s += `

            <div class="bg-white rounded-xl shadow p-5 transition cursor-pointer bg-zinc-100 text-slate-900 dark:bg-slate-950 dark:!border dark:!border-zinc-200/20 dark:text-zinc-200 hover:cursor-pointer hover:bg-gray-200 hover:outline outline-black/10 dark:hover:bg-gray-800 dark:hover:-outline-offset-1 dark:hover:outline-white/10" id="rend_${elemek.ID_RENDELES}" onclick="RendelesKezeloAblak(${elemek.ID_RENDELES}, '${elemek.DATUM}', '${elemek.SZALLCIM}', '${elemek.FIZMOD}', '${elemek.SZALLMOD}', '${elemek.NEV}', '${elemek.EMAIL}', ${elemek.AFA}, ${elemek.RENDELES_VEGOSSZEGE}, '${elemek.MEGJEGYZES}')">
                <div class="flex items-center justify-between mb-3">
                    <span class="font-semibold">#${elemek.ID_RENDELES}</span>
                    <span class="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-700">
                    ${elemek.ALLAPOT}
                    </span>
                </div>

                <p class="text-sm text-gray-600">Megrendelő</p>
                <p class="font-medium mb-2">${elemek.NEV}</p>

                <div class="flex justify-between text-sm">
                    <span>Végösszeg</span>
                    <span class="font-semibold">${parseInt(elemek.RENDELES_VEGOSSZEGE).toLocaleString()} Ft</span>
                </div>

                <p class="text-xs text-gray-500 mt-3">
                    ${new Date(elemek.DATUM).toLocaleString(navigator.language, {year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false})}
                </p>
            </div>


        
            `;
        }

        s += `
                </div>
            </div>
        `;

        if (a_osszesoldal > 1) {
            s += `
            <ul class="pagination justify-content-center gap-2 select-none">
                <li class="page-item ${a_jelenlegi == 1 ? "disabled hover:cursor-not-allowed" : ""}" >
                    <a id="Vissza2_renda" onclick="KoviRendeles(this)" class="page-link px-3 py-2 rounded-xl !border !border-transparent bg-zinc-50 text-slate-900 dark:bg-zinc-950 dark:text-zinc-200 hover:bg-slate-900 hover:text-white dark:hover:bg-gray-800 dark:!border-zinc-200/10 dark:hover:!border-zinc-200/20 transition-all duration-200 shadow-sm cursor-pointer " > « </a>
                </li>
                <li class="page-item ${a_jelenlegi == 1 ? "disabled hover:cursor-not-allowed" : ""}">
                    <a id="Vissza1_renda" onclick="KoviRendeles(this)" class="page-link px-3 py-2 rounded-xl !border !border-transparent bg-zinc-50 text-slate-900 dark:bg-zinc-950 dark:text-zinc-200 hover:bg-slate-900 hover:text-white dark:hover:bg-gray-800 dark:!border-zinc-200/10 dark:hover:!border-zinc-200/20 transition-all duration-200 shadow-sm cursor-pointer ">                        
                        <i class="bi bi-caret-left-fill"></i>
                        <span class="d-none d-lg-inline">Előző</span>
                    </a>
                </li>
                <li class="page-item">
                    <span class="page-link px-4 py-2 rounded-xl !border !border-transparent bg-slate-900 text-white font-semibold hover:bg-slate-900 hover:text-white dark:!border-zinc-200/10 dark:bg-gray-800 shadow-md cursor-default">
                        <b id="Mostoldal">${a_jelenlegi}</b>
                        <span class="opacity-70 mx-1">/</span>
                        <span id="DBoldal">${a_osszesoldal}</span>
                    </span>
                </li>
                <li class="page-item ${a_jelenlegi == a_osszesoldal ? "disabled hover:cursor-not-allowed" : ""}">
                    <a id="Kovi1_renda" onclick="KoviRendeles(this)" class="page-link px-3 py-2 rounded-xl !border !border-transparent bg-zinc-50 text-slate-900 dark:bg-zinc-950 dark:text-zinc-200 hover:bg-slate-900 hover:text-white dark:hover:bg-gray-800 dark:!border-zinc-200/10 dark:hover:!border-zinc-200/20 transition-all duration-200 shadow-sm cursor-pointer ">
                        <span class="d-none d-lg-inline">Következő</span>
                        <i class="bi bi-caret-right-fill"></i>
                    </a>
                </li>
                <li class="page-item ${a_jelenlegi == a_osszesoldal ? "disabled hover:cursor-not-allowed" : ""}">
                    <a id="Kovi2_renda" onclick="KoviRendeles(this)" class="page-link px-3 py-2 rounded-xl !border !border-transparent bg-zinc-50 text-slate-900 dark:bg-zinc-950 dark:text-zinc-200 hover:bg-slate-900 hover:text-white dark:hover:bg-gray-800 dark:!border-zinc-200/10 dark:hover:!border-zinc-200/20 transition-all duration-200 shadow-sm cursor-pointer "> » </a>
                </li>
            </ul>`;
        }  
    } else {
        s = `
        <div class="col-12">
            <div class="text-center p-2">
                <h5>Nincsenek beérkezett rendelések</h5>
            </div>
        </div>`;
    }
    $("#content_hely").fadeOut(300, function() {
        $("#content_hely").html(s).fadeIn(300);
        $("#main_kontener").addClass("hidden");
        $("#content_hely").removeClass("hidden");
    });
    KezdolapElemekViszlat();
    $("#nezetkicsi").addClass("eltunt");
    $("#nezetnagy").addClass("eltunt");
    $("#pagi").html("");
    $("#kosar").prop("checked", false);
    $("#kezdolap").prop("checked", false);

    if (pushHistory) {
        SPAState.currentView = 'rendelesek-kezelese';
        SPAState.currentData = {};  
        history.pushState({ view: 'rendelesek-kezelese' }, 'Rendelések kezelése', `#rendelesek-kezelese`);
    }
}

async function RendelesKezeloAblak(rendelId, datum, szallcim, fizmod, szallmod, nev, email, afa, vegosszeg, megjegyzes) {
        const tetelek = await ajax_call(`rendelesek_tetelei?ID_RENDELES=${rendelId}`, "GET", null, true);
        let fizmodkep = "";
        let szallmodkep = "";
    
        switch(fizmod) {
            case "Bankkártya": fizmodkep = "<img src='img/visa.png' class='w-auto h-6' alt='visa'> <img src='img/mastercard.png' class='w-auto h-6' alt='mastercard'>"; break;
            case "PayPal": fizmodkep = "<img src='img/paypal.png' class='w-auto h-6' alt='paypal'>"; break;
            case "Apple Pay": fizmodkep = "<img src='img/applepay.png' class='w-auto h-6' alt='applepay'>"; break;
            case "Google Pay": fizmodkep = "<img src='img/googlepay.png' class='w-auto h-6' alt='googlepay'>"; break;
            default: fizmodkep = `<span>${fizmod}</span>`; break;
        }
    
        switch(szallmod) {
            case "GLS": szallmodkep = "<img src='img/gls.png' class='w-auto h-6' alt='gls'>"; break;
            case "MPL": szallmodkep = "<img src='img/mplsvg.png' class='w-auto h-6' alt='mpl'>"; break;
            case "Express One": szallmodkep = "<img src='img/expressonesvg.png' class='w-auto h-6' alt='expressone'>"; break;
            default: szallmodkep = `<span>${szallmod}</span>`; break;
        }

        $("#r-azon").html(`<span class="text-xl font-semibold">Rendelés #${rendelId}</span><span class="text-sm text-gray-500">Elküldve: ${new Date(datum).toLocaleString(navigator.language, {year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false})}</span>`);
    
        let html = `
    
            <div class="max-w-5xl mx-auto p-4 sm:p-6 space-y-6">
                <div class="flex items-center justify-between my-4 py-2 !border-b !border-b-slate-900/20">
                    <span>Név: ${nev}</span>
                    <span><i class="bi bi-envelope"></i> ${email}</span>
                </div>
                <div class="flex flex-col space-y-6 bg-zinc-50 rounded-xl shadow-lg p-4 sm:p-6">
                    <span class="text-lg text-gray-600 font-medium">Megrendelt termék(ek):</span>`; 
        
        for (const elem of tetelek.rows) {
            html += `
    
    
            <div>
    
                <!-- Product Info -->
                <div class="flex flex-col items-center sm:flex-row gap-4 ">
                    <img src="${elem.FOTOLINK}" alt="${elem.NEV}" class="w-10 h-10 rounded-lg object-cover">
    
                    <div class="flex-1">
                        <h2 class="font-semibold">${elem.NEV} (${elem.ID_TERMEK})</h2>
                        <p class="text-sm text-gray-600 mt-1 text-center sm:!text-start">${elem.KATEGORIA}</p>
                        <p class="hidden arak">${(elem.MENNYISEG * elem.AR).toLocaleString()} Ft</p>
                    </div>
    
                    <!-- Delivery -->
                    <div class="text-sm">
                        <p class="text-sm text-gray-600 font-semibold  text-center sm:!text-end">${elem.MENNYISEG} db</p>
                        <p class="mt-2 font-semibold text-center sm:!text-end">${elem.AR.toLocaleString()} Ft</p>
                    </div>
                </div>
    
                
            </div>
    
    
    
    `;
        }
    
        html += `
            </div>
            <div class="flex flex-col mt-4 bg-zinc-50 rounded-xl shadow-lg p-4 sm:p-6 text-sm">
                <span class="text-lg text-gray-600 font-medium">Rendeléshez fűzött megjegyzés:</span>
                <p class="mt-2 p-2 bg-gray-100 dark:bg-gray-800 rounded-lg text-sm text-gray-700 dark:text-gray-300">${megjegyzes.trim() == "" ? "Nincs megjegyzés" : megjegyzes}</p>
            </div>

            <div class="bg-zinc-50 rounded-xl shadow-lg p-4 sm:p-6 grid lg:grid-cols-3 gap-6 text-sm">
    
                <!-- Billing -->
                <div>
                    <h3 class="font-medium mb-2">Szállítási információk</h3>
                    <p>${szallcim}</p>
                    <p class="flex items-center gap-2 mt-2">${szallmodkep} ${szallmod}</p>
                </div>
    
                <!-- Payment -->
                <div>
                    <h3 class="font-medium mb-2">Fizetési információk</h3>
                    <p class="flex items-center gap-2">
                       ${fizmodkep} ${fizmod}
                    </p>
                </div>
    
                <!-- Totals -->
                <div class="space-y-1">
                    <div class="flex justify-between">
                        <span>Összesen</span><span id="ossz"></span>
                    </div>
                    <div class="flex justify-between">
                        <span>Szállítási költség</span><span>0 Ft</span>
                    </div>
                    <div class="flex justify-between">
                        <span>Áfa</span><span>${afa}%</span>
                    </div>
                    <div class="flex justify-between pt-2 border-t">
                        <span class="font-semibold">Végösszeg</span><span class="text-indigo-600 font-semibold" id="rendelesvegosszeg"></span>
                    </div>
                </div>
    
            </div>
        </div>
        
        `;

    let gomb = `
        <button id="kiszallit" type="button" class="px-3 py-1 text-base flex items-center gap-2 !border !border-transparent bg-slate-900 text-zinc-200 dark:bg-gray-800 dark:text-zinc-200 hover:text-slate-900 hover:bg-zinc-100 hover:!border-slate-900 dark:hover:bg-gray-700/70 dark:!border-zinc-200/10 dark:hover:!border-zinc-200/20 dark:hover:text-zinc-200 transition-all duration-150 ease-in-out rounded-2xl w-auto" > 
            <i class="bi bi-check"></i>
            <span> Kiszállítva</span>
        </button>
    `;
    

    $("#rendeles_kezeles_modal .modal-body").html(html);
    $("#rendeles_kezeles_modal .modal-footer").html(gomb);
    AR_SUM("arak", "ossz", false);
    AR_SUM("arak", "rendelesvegosszeg", true);

    $("#rendeles_kezeles_modal").modal("show");
}

function KoviRendeles(mod) {
    FelaTetore();
    switch(mod.id) {
        case "Kovi1_renda": // következő oldal
            if (a_jelenlegi < a_osszesoldal) { a_jelenlegi++; }
            break;

        case "Kovi2_renda": // utolsó oldal
            a_jelenlegi = a_osszesoldal;
            break;

        case "Vissza1_renda": // előző oldal
            if (a_jelenlegi > 1) { a_jelenlegi--; }
            break;

        case "Vissza2_renda": // első oldal
            a_jelenlegi = 1;
            break;
    }
    RendelesekKezelese(true);
}

