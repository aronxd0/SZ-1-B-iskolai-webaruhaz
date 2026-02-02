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
            <div class="p-3 d-flex justify-content-center">
                <div class="col-12 col-lg-8 d-flex flex-column flex-lg-row bg-zinc-100 text-slate-900 dark:bg-slate-950 dark:!border dark:!border-zinc-200/20 dark:text-zinc-200 shadow-lg rounded-4 hover:cursor-pointer hover:bg-gray-200 hover:outline outline-black/10 dark:hover:bg-gray-800 dark:hover:-outline-offset-1 dark:hover:outline-white/10 my-1 p-3 p-xxl-none" id="rendeles_${elemek.ID_RENDELES}" role="button" onclick="toggleRendeles(${elemek.ID_RENDELES})" data-bs-toggle="collapse" data-bs-target="#${collapseId}" aria-expanded="false" aria-controls="${collapseId}">
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
                        <span class="text-xs">(${elemek.AFA}% ÁFA)</span>
                        <span class="termek_ar text-slate-900 dark:text-zinc-200 font-semibold">
                            ${parseInt(elemek.RENDELES_VEGOSSZEGE).toLocaleString()} Ft
                        </span>
                    </div>      
                </div>
            </div>
            <div class="collapse !visible mt-2 mb-5" id="${collapseId}">
                <div class="row" id="tetelek_${elemek.ID_RENDELES}"></div>
            </div>
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
    });
    KezdolapElemekViszlat();
    $("#nezetkicsi").addClass("eltunt");
    $("#nezetnagy").addClass("eltunt");
    $("#pagi").html("");
    $("#kosar").prop("checked", false);
    $("#kezdolap").prop("checked", false);

    if (pushHistory) {
        SPAState.currentView = 'rendelesek';
        SPAState.currentData = { };  
        history.pushState({ view: 'rendelesek' }, 'Rendelések', `#rendelesek`);
    }
}

async function toggleRendeles(rendelId) {
    const tetelek = await ajax_call(`rendelesek_tetelei?ID_RENDELES=${rendelId}`, "GET", null, true);

    let html = `
        <div class="col-0 col-lg-2"></div>
        <div class="col-12 col-lg-8 text-center p-2 mt-3 border-b border-gray-300 dark:border-b dark:border-gray-800">
            A rendelés tartalma:
        </div>
        <div class="col-0 col-lg-2"></div>`; 
    
    for (const elem of tetelek.rows) {
        html += `
        <div class="col-0 col-lg-2"></div>
            <div class="col-12 col-lg-8 d-flex flex-column flex-sm-row text-slate-900 dark:text-zinc-200 border-b border-gray-300 dark:border-b dark:border-gray-800 p-xxl-none">
                <div class="col-12 col-sm-3 col-lg-3 d-flex align-self-center justify-content-center p-2">
                    <img src="${elem.FOTOLINK}" onclick="openImage(this.src)" class="img img-fluid img-thumbnail w-10 h-10"  alt="kep">
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
        <div class="col-0 col-lg-2"></div>`;
    }
    $(`#tetelek_${rendelId}`).html(html);
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