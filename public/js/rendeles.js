let jelenlegi = 1;
let osszesoldal = 0;

async function rendelesekmegtolt(pushHistory = true) {
    var s = `<div class="col-12 text-center p-2"><span class="text-xl">Rendeléseim</span></div>`;

    const itemek = await ajax_call(`rendelesek?OFFSET=${(jelenlegi-1)}`, "GET", null, true);

    osszesoldal = Math.ceil(itemek.maxcount / 10);
    
    if (itemek.maxcount != 0) {
        for (const elemek of itemek.rows) {

            const collapseId = `collapse_${elemek.ID_RENDELES}`;

            s += `
            <div class="max-w-5xl mx-auto p-4 space-y-1">
                <div class="col-12 d-flex flex-column flex-lg-row bg-zinc-100 text-slate-900 dark:bg-slate-950 dark:!border dark:!border-zinc-200/20 dark:text-zinc-200 shadow-lg rounded-4 hover:cursor-pointer hover:bg-gray-200 hover:outline outline-black/10 dark:hover:bg-gray-800 dark:hover:-outline-offset-1 dark:hover:outline-white/10 my-1 p-3 p-xxl-none" id="rendeles_${elemek.ID_RENDELES}" role="button" onclick="toggleRendeles(${elemek.ID_RENDELES}, '${elemek.DATUM}', '${elemek.SZALLCIM}', '${elemek.FIZMOD}', '${elemek.SZALLMOD}', '${elemek.NEV}', '${elemek.EMAIL}', ${elemek.AFA}, ${elemek.RENDELES_VEGOSSZEGE})">
                    <div class="col-12 col-lg-4 d-flex flex-lg-column justify-content-between py-3 p-lg-1">
                        <span><i class="bi bi-hash"></i> Rendelés Azonosító</span>
                        <span>${elemek.ID_RENDELES}</span>
                    </div>
                    <div class="col-12 col-lg-4 d-flex flex-lg-column justify-content-between py-3 p-lg-1 !border !border-t-gray-300 !border-b-gray-300 !border-r-0 !border-l-0 dark:!border-t-zinc-200/20 dark:!border-b-zinc-200/20 lg:!border-t-0 lg:!border-b-0 lg:dark:!border-t-0 lg:dark:!border-b-0">
                        <span><i class="bi bi-calendar"></i> Dátum</span>
                        <time class="text-gray-400">
                            <i>${new Date(elemek.DATUM).toLocaleString(navigator.language, {year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false})}</i>
                        </time>
                    </div>
                    <div class="col-12 col-lg-4 d-flex flex-lg-column justify-content-between align-items-lg-end py-3 p-lg-1">
                        <span><i class="bi bi-cash"></i> Bruttó végösszeg</span>
                        <span class="termek_ar text-slate-900 dark:text-zinc-200 font-semibold">
                            ${parseInt(elemek.RENDELES_VEGOSSZEGE).toLocaleString()} Ft
                        </span>
                    </div>      
                </div>
            </div>
            <!--
            <div class="collapse !visible mt-2 mb-5" id="${collapseId}">
                <div class="row" id="tetelek_${elemek.ID_RENDELES}"></div>
            </div>
            -->
            `;
        }
        if (osszesoldal > 1) {
            s+= `
            <ul class="pagination justify-content-center gap-2 select-none">
                <li class="page-item ${jelenlegi == 1 ? "disabled hover:cursor-not-allowed" : ""}" >
                    <a id="Vissza2_rend" onclick="Kovi_rendeles(this)" class="page-link px-3 py-2 rounded-xl !border !border-transparent bg-zinc-50 text-slate-900 dark:bg-zinc-950 dark:text-zinc-200 hover:bg-slate-900 hover:text-white dark:hover:bg-gray-800 dark:!border-zinc-200/10 dark:hover:!border-zinc-200/20 transition-all duration-200 shadow-sm cursor-pointer " > « </a>
                </li>
                <li class="page-item ${jelenlegi == 1 ? "disabled hover:cursor-not-allowed" : ""}">
                    <a id="Vissza1_rend" onclick="Kovi_rendeles(this)" class="page-link px-3 py-2 rounded-xl !border !border-transparent bg-zinc-50 text-slate-900 dark:bg-zinc-950 dark:text-zinc-200 hover:bg-slate-900 hover:text-white dark:hover:bg-gray-800 dark:!border-zinc-200/10 dark:hover:!border-zinc-200/20 transition-all duration-200 shadow-sm cursor-pointer ">                        
                        <i class="bi bi-caret-left-fill"></i>
                        <span class="d-none d-lg-inline">Előző</span>
                    </a>
                </li>
                <li class="page-item">
                    <span class="page-link px-4 py-2 rounded-xl !border !border-transparent bg-slate-900 text-white font-semibold hover:bg-slate-900 hover:text-white dark:!border-zinc-200/10 dark:bg-gray-800 shadow-md cursor-default">
                        <b id="Mostoldal">${jelenlegi}</b>
                        <span class="opacity-70 mx-1">/</span>
                        <span id="DBoldal">${osszesoldal}</span>
                    </span>
                </li>
                <li class="page-item ${jelenlegi == osszesoldal ? "disabled hover:cursor-not-allowed" : ""}">
                    <a id="Kovi1_rend" onclick="Kovi_rendeles(this)" class="page-link px-3 py-2 rounded-xl !border !border-transparent bg-zinc-50 text-slate-900 dark:bg-zinc-950 dark:text-zinc-200 hover:bg-slate-900 hover:text-white dark:hover:bg-gray-800 dark:!border-zinc-200/10 dark:hover:!border-zinc-200/20 transition-all duration-200 shadow-sm cursor-pointer ">
                        <span class="d-none d-lg-inline">Következő</span>
                        <i class="bi bi-caret-right-fill"></i>
                    </a>
                </li>
                <li class="page-item ${jelenlegi == osszesoldal ? "disabled hover:cursor-not-allowed" : ""}">
                    <a id="Kovi2_rend" onclick="Kovi_rendeles(this)" class="page-link px-3 py-2 rounded-xl !border !border-transparent bg-zinc-50 text-slate-900 dark:bg-zinc-950 dark:text-zinc-200 hover:bg-slate-900 hover:text-white dark:hover:bg-gray-800 dark:!border-zinc-200/10 dark:hover:!border-zinc-200/20 transition-all duration-200 shadow-sm cursor-pointer "> » </a>
                </li>
            </ul>`;
        }  
    } else {
        s = `
        <div class="col-12">
            <div class="text-center p-2">
                <h5>A boltunkban még nem vásároltál :(</h5>
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
        SPAState.currentView = 'rendeleseim';
        SPAState.currentData = { };  
        history.pushState({ view: 'rendeleseim' }, 'Rendelések', `#rendeleseim`);
    }
}

async function toggleRendeles(rendelId, datum, szallcim, fizmod, szallmod, nev, email, afa, vegosszeg, pushHistory = true) {
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

    let html = `

        <div class="max-w-5xl mx-auto p-4 sm:p-6 space-y-6">
            <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <h1 class="text-2xl font-bold">Rendelés #${rendelId}</h1>
                <span class="text-sm text-gray-500">Rendelés elküldve: ${new Date(datum).toLocaleString(navigator.language, {year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false})}</span>
            </div>`; 
    
    for (const elem of tetelek.rows) {
        html += `


        <div class="bg-white rounded-xl shadow p-4 sm:p-6 space-y-6 bg-zinc-100 text-slate-900 dark:bg-slate-950 dark:!border dark:!border-zinc-200/20 dark:text-zinc-200 shadow-lg rounded-4 hover:cursor-pointer hover:bg-gray-200 hover:outline outline-black/10 dark:hover:bg-gray-800 dark:hover:-outline-offset-1 dark:hover:outline-white/10">

            <!-- Product Info -->
            <div class="flex flex-col items-center sm:flex-row gap-4 ">
                <img src="${elem.FOTOLINK}" alt="${elem.NEV}" class="w-10 h-10 rounded-lg object-cover">

                <div class="flex-1">
                    <h2 class="font-semibold text-lg">${elem.NEV}</h2>
                    <p class="text-sm text-gray-600 mt-1 text-center sm:!text-start">${elem.KATEGORIA}</p>
                    <p class="hidden arak">${(elem.MENNYISEG * elem.AR).toLocaleString()} Ft</p>
                </div>

                <!-- Delivery -->
                <div class="text-sm text-gray-600">
                    <p class="text-sm text-gray-600 text-center sm:text-end">${elem.MENNYISEG} db</p>
                    <p class="mt-2 font-medium text-center sm:text-end">${elem.AR.toLocaleString()} Ft</p>
                </div>
            </div>

            
        </div>





        <!--
        <div class="col-0 col-lg-2"></div>
            <div class="col-12 col-lg-8 d-flex flex-column flex-sm-row text-slate-900 dark:text-zinc-200 border-b border-gray-300 dark:border-b dark:border-gray-800 p-xxl-none">
                <div class="col-12 col-sm-3 col-lg-3 d-flex align-self-center justify-content-center p-2">
                    <img src="${elem.FOTOLINK}" onclick="KepMegnyitas(this.src)" class="img img-fluid img-thumbnail w-10 h-10 hover:cursor-pointer" alt="kep">
                </div>
                <div class="col-12 col-sm-3 col-lg-3 d-flex align-self-center justify-content-center p-2">
                    <p>${elem.NEV}</p>
                </div>
                    <div class="col-12 col-sm-3 col-lg-3 d-flex align-self-center justify-content-center p-2">
                    <p>${elem.MENNYISEG} db</p>
                </div>

                <div class="col-12 col-sm-3 col-lg-3 d-flex flex-column align-self-center align-items-center align-items-lg-end justify-content-center justify-content-lg-end p-2">
                    <span class="text-slate-900 dark:text-zinc-200 font-semibold text-lg termek_ar">${elem.AR.toLocaleString()} Ft</span> <span> <i> (Nettó)</i></span> 
                </div>
            </div>
        <div class="col-0 col-lg-2"></div>
        -->`;
    }

    html += `

        <!-- Status -->
        <div>
            <p class="text-lg font-medium mb-2">
                Rendelés állapota
            </p>

            <!-- Progress Bar -->
            <div class="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                <div class="h-full bg-indigo-600 w-1/2"></div>
            </div>

            <!-- Steps -->
            <div class="flex justify-between text-sm text-gray-500 mt-2">
                <span class="text-indigo-600 font-medium">Rendelés elküldve</span>
                <span>Kiszállítva</span>
            </div>
        </div>

        <div class="bg-white rounded-xl shadow p-4 sm:p-6 grid lg:grid-cols-3 gap-6 text-sm">

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

    //$(`#tetelek_${rendelId}`).html(html);
    $("#content_hely").fadeOut(300, function() {
        $("#content_hely").html(html).fadeIn(300);
        $("#main_kontener").addClass("hidden");
        $("#content_hely").removeClass("hidden");
        AR_SUM("arak", "ossz", false);
        AR_SUM("arak", "rendelesvegosszeg", true);
    });

    if (pushHistory) {
        SPAState.currentView = 'rendeleseimreszlet';
        SPAState.currentData = { id: rendelId, datum, szallcim, fizmod, szallmod, nev, email, afa, vegosszeg };
        history.pushState({ view: 'rendeleseimreszlet', id: rendelId, datum, szallcim, fizmod, szallmod, nev, email, afa, vegosszeg }, 'Rendeléseim', `#rendeleseim/${rendelId}`);
    }

}

function Kovi_rendeles(keri) {
    FelaTetore();
    switch(keri.id) {
        case "Kovi1_rend": // következő oldal
            if (jelenlegi < osszesoldal) { jelenlegi++; }
            break;

        case "Kovi2_rend": // utolsó oldal
            jelenlegi = osszesoldal;
            break;

        case "Vissza1_rend": // előző oldal
            if (jelenlegi > 1) { jelenlegi--; }
            break;

        case "Vissza2_rend": // első oldal
            jelenlegi = 1;
            break;
    }
    rendelesekmegtolt(true);
}