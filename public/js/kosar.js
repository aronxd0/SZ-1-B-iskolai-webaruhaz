// kosar menupont, kosarba helyezes, tetelek

let tetelekli = [];

let kosarsegito = `
    <span class="w-auto text-sm p-2 h-full flex items-center">
        <button type="button" class="text-slate-950 dark:text-zinc-200 hover:text-gray-600 dark:hover:text-gray-400 flex items-center gap-2 text-lg" onclick="KosarSegitseg()"><i class="bi bi-question-circle text-xl lg:text-base"></i><span class="d-none d-lg-inline"> Hogyan működik a kosár?</span></button>
    </span>`;

let ureskosar = `
    <div class="col-12 flex flex-col w-full justify-center items-center">
        <div class="text-center p-2" id="kosarmenutitle">
            <h1 class="text-2xl font-semibold text-slate-900 dark:text-zinc-100 p-2 mb-4 w-auto">
                A kosarad üres 
            </h1>
        </div>
        ${kosarsegito}
    </div>`;

let vendegnezet = `
    <div class="col-12 flex flex-col w-full justify-center items-center">
        <div class="text-center p-2" id="kosarmenutitle">
            <h1 class="text-2xl font-semibold text-slate-900 dark:text-zinc-100 p-2 mb-4 w-auto">
                A Kosár használatához <a class="text-sky-500 hover:text-sky-700 dark:text-sky-500 dark:hover:text-sky-300 underline text-decoration-sky-500 hover:cursor-pointer font-semibold" onclick="$('#login_modal').modal('show');">be kell jelentkezned</a>
            </h1>
        </div>
        ${kosarsegito}
    </div>`;

async function Kosar_Mutat(pushHistory = true) {
    tetelekli = [];
    let tartalom = `
        <div class="max-w-7xl mx-auto py-10">
            ${kosarsegito}
            <div class="d-flex w-full align-items-center justify-content-between">
                <h1 class="text-2xl font-semibold text-slate-900 dark:text-zinc-100 p-2 mb-8 w-auto">
                    A kosarad tartalma
                </h1>
            </div>
            
            
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div class="lg:col-span-2 space-y-6">`;

    try {
        let tetelek = await ajax_call("tetelek", "GET", null, true);
        if (tetelek.rows.length > 0) {
            for (const element of tetelek.rows) {
                let pez = element.AR * element.MENNYISEG;
                
                tetelekli.push({
                    ID_TERMEK: element.ID_TERMEK,
                    NEV: element.NEV,
                    MENNYISEG: element.MENNYISEG,
                    PENZ: pez
                });

                tartalom += ` 
                    <div class="row kosartetelcucc d-flex flex-column !border-b !border-slate-400/20 dark:!border-slate-700 pb-6">
                        <div class="col-12 flex gap-4" id="${element.ID_TERMEK}NAGY">
                            <img src="${element.FOTOLINK}" alt="${element.NEV}" class="w-24 h-24 rounded-lg object-cover bg-slate-100 dark:bg-slate-800"/>
                            <div class="flex-1">
                                <div class="flex justify-between">
                                    <div>
                                    <h3 class="font-medium text-slate-900 dark:text-zinc-100">${element.NEV}</h3>
                                    <p class="text-xs text-slate-500">${element.KATEGORIA}</p>
                                    <p class="mt-2 font-medium text-slate-900 dark:text-zinc-100" id="${element.ID_TERMEK}3">
                                        <span class="termek_ar">${pez.toLocaleString()} Ft</span>
                                    </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="col-12 mt-4 d-flex flex-column flex-sm-row justify-content-start w-full align-items-start align-items-sm-center gap-4">
                            <div class="w-auto">
                                <button type="button" class="btn btn-lg bi bi-dash-lg bal-gomb bg-transparent text-slate-900 dark:bg-sky-950 dark:text-zinc-200 hover:text-slate-700 dark:hover:text-zinc-300 rounded-4 me-2" aria-label="minusz" onclick="KosarPLUSZ(this)" id="${element.ID_TERMEK}9"></button>
                                <input type="number" class="w-50 py-1 text-center text-lg duration-300 focus:transition-all focus:outline-none focus:ring-2 focus:ring-emerald-600 !border !border-slate-900/10 bg-zinc-100 rounded-4 text-slate-900 dark:bg-slate-900 dark:text-zinc-200 focus:outline-none dark:!border dark:!border-zinc-200/20" min="1" onchange="KosarPLUSZ(this)" value="${element.MENNYISEG}" id="${element.ID_TERMEK}2">
                                <button type="button" class="btn btn-lg bi bi-plus-lg jobb-gomb bg-transparent text-slate-900 dark:bg-sky-950 dark:text-zinc-200 hover:text-slate-700 dark:hover:text-zinc-300 rounded-4 ms-2" aria-label="plusz" onclick="KosarPLUSZ(this)" id="${element.ID_TERMEK}1"></button>
                            </div>
                            <button class="text-slate-400 hover:text-red-600 text-lg transition" id="${element.ID_TERMEK}" onclick="KosarItemDelete(this)"><i class="bi bi-trash"></i></button>
                        </div>
                    </div>`;
            }
            tartalom += `
                </div>
                <div class="rounded-xl bg-slate-50 shadow-xl dark:bg-slate-950 dark:!border dark:!border-zinc-200/20 p-6 h-fit">
                    <h2 class="text-lg font-semibold text-slate-900 dark:text-zinc-100 mb-4">Összegzés</h2>
                    <div class="space-y-3 text-sm">
                        <div class="flex justify-between">
                            <span class="text-slate-500">Összesen</span>
                            <span class="font-medium" id="osszesen"></span>
                        </div>
                        <div class="flex justify-between">
                            <span class="text-slate-500">Szállítási költség</span>
                            <span>0 Ft</span>
                        </div>
                        <div class="flex justify-between">
                            <span class="text-slate-500">Áfa</span>
                            <span>${(await ajax_call(`afa`, "GET", null, true)).rows[0].AFA} %</span>
                        </div>
                    </div>
                    <div class="mt-6 flex justify-between font-semibold text-slate-900 dark:text-zinc-100">
                        <span>Végösszeg</span>
                        <span id="sumar"></span>
                    </div>
                    <div id="pay_button">
                        <button id="tovabb_a_fizeteshez" onclick='RendelesAblak(${JSON.stringify(tetelekli)})' class="mt-6 w-full rounded-lg bg-slate-950 dark:bg-gray-800  text-zinc-200 hover:bg-zinc-100 hover:text-slate-950 !border !border-transparent hover:!border-slate-900 dark:hover:bg-gray-700/70 dark:!border-zinc-200/10 dark:hover:!border-zinc-200/20 dark:hover:text-zinc-200 transition-all duration-150 ease-in-out py-3 font-medium">
                            Tovább &nbsp; <i class="bi bi-arrow-right"></i>
                        </button>
                    </div>
                </div>
            </div>
        </div>`;
            }
            else { tartalom = ureskosar; }

    } catch (err) { console.error(err); }

    $("#content_hely").fadeOut(300, function() {
        if (!JSON.parse(localStorage.getItem("user"))?.loggedIn) { tartalom = vendegnezet; }
        $("#content_hely").html(tartalom).fadeIn(300);
        $("#main_kontener").addClass("hidden");
        $("#content_hely").removeClass("hidden");
        AR_SUM("termek_ar", "osszesen", false);
        AR_SUM("termek_ar", "sumar", true);
    });

    KezdolapElemekViszlat();
    $("#nezetkicsi").addClass("eltunt");
    $("#nezetnagy").addClass("eltunt");
    $("#pagi").html("");

    $("#kosar").prop("checked", true);
    $("#kezdolap").prop("checked", false);

    if (pushHistory) {
        SPAState.currentView = 'kosar';
        SPAState.currentData = {};
        history.pushState(
            { view: 'kosar' },
            'Kosár',
            '#kosar'
        );
    }
};

function KosarTeteleiFrissit() {
    Kosar_Mutat(false);
    KosarTetelDB();
}

async function KosarItemDelete(id) {
    var eredmeny = await ajax_call(`/kosar_del?ID_TERMEK=${id.id}`, "DELETE", null, true);
    if (eredmeny.message == "ok"){
        $(`#${id.id}NAGY`).closest('.kosartetelcucc').fadeOut(300, function() {
            $(this).remove();
            AR_SUM("termek_ar", "sumar", true);
            AR_SUM("termek_ar", "osszesen", false);
        });

        const ti = tetelekli.findIndex(x => x.ID_TERMEK == parseInt(id.id));

        if (ti != -1) { tetelekli.splice(ti, 1); }
        
        if (tetelekli.length > 0) { $("#pay_button").html(`<button id="tovabb_a_fizeteshez" onclick='RendelesAblak(${JSON.stringify(tetelekli)})' class="mt-6 w-full rounded-lg bg-slate-950 dark:bg-gray-800  text-zinc-200 hover:bg-zinc-100 hover:text-slate-950 !border !border-transparent hover:!border-slate-900 dark:hover:bg-gray-700/70 dark:!border-zinc-200/10 dark:hover:!border-zinc-200/20 dark:hover:text-zinc-200 transition-all duration-150 ease-in-out py-3 font-medium">Tovább &nbsp; <i class="bi bi-arrow-right"></i></button>`); }
        else {
            $("#content_hely").fadeOut(300, function() {
                $("#content_hely").html(ureskosar).fadeIn(300);
            });
        }
        üzen("Tétel törölve a kosárból","success");
        KosarTetelDB();
    }
}

async function Kosarba_Bele(event, id_termek) {
    event.stopPropagation();
    let kosaraddleiras = await ajax_call(`kosar_add?ID_TERMEK=${id_termek}`, "POST", null, true);
    if (kosaraddleiras.message == "ok") {
        KosarTetelDB();
        üzen("Áru bekerült a kosárba","success");   
    }
    $("#kosarba_bele").modal("show");
}

async function KosarTetelDB() {
    let kosarteteldb = await ajax_call("kosarteteldb", "GET", null, true);
    var db = 0;
    for (const element of kosarteteldb.rows) {
        if (element.kdb == undefined) { db = 0; } 
        else { db = parseInt(element.kdb); }
        $("#kosar_content_count").html(`${db}`);
    }
}

async function KosarPLUSZ(id) {
    var PluszVAGYminusz = id.id.substring(id.id.length - 1, id.id.length) == 9? -1 : ""  ;// ha nem 9 akkor - / ha 1 akkor + 
    var ertek = id.id.substring(id.id.length - 1, id.id.length) == "2"? `&ERTEK=${id.value > 0 ? id.value: 1}` : "";// ha 2 akkor az input mező lett változtatva
    var idk = id.id.substring(0, id.id.length - 1);

    await ajax_call(`kosar_add?ID_TERMEK=${idk}&MENNYIT=${PluszVAGYminusz}${ertek}`, "POST", null, true);
    var db = await ajax_call("tetelek?ID_TERMEK="+idk, "GET", null, true); // MEnyiség értéket csak akkor adok át ,a mikor az input mező lett változtatva különben üres string
    
    let mennyiseg = parseInt(db.rows[0].MENNYISEG);
    let ar = parseInt(db.rows[0].AR);
    let penzecske = mennyiseg * ar;

    for (const element of tetelekli) {
        if (element.ID_TERMEK == parseInt(idk)) {
            element.MENNYISEG = mennyiseg;
            element.PENZ = penzecske;
        };
    }

    if ($(`#${idk}2`).val() == 1 && PluszVAGYminusz == -1) { üzen("A terméket a törlés (<i class='bi bi-trash'></i>) gombbal tudod eltávolítani a kosárból!", "info"); }
    document.getElementById(`${idk}2`).value = mennyiseg;
    document.getElementById(`${idk}3`).innerHTML = `<span class="termek_ar">${penzecske.toLocaleString()} Ft</span>`;

    $("#pay_button").html(`<button id="tovabb_a_fizeteshez" onclick='RendelesAblak(${JSON.stringify(tetelekli)})' class="mt-6 w-full rounded-lg bg-slate-950 dark:bg-gray-800  text-zinc-200 hover:bg-zinc-100 hover:text-slate-950 !border !border-transparent hover:!border-slate-900 dark:hover:bg-gray-700/70 dark:!border-zinc-200/10 dark:hover:!border-zinc-200/20 dark:hover:text-zinc-200 transition-all duration-150 ease-in-out py-3 font-medium">Tovább &nbsp; <i class="bi bi-arrow-right"></i></button>`);

    AR_SUM("termek_ar", "sumar" , true);
    AR_SUM("termek_ar", "osszesen", false);
    KosarTetelDB(); 
};

function KosarSegitseg() { $("#kosar_help_modal").modal("show"); }