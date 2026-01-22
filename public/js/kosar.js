// kosar menupont, kosarba helyezes, tetelek

let tetelekli = [];
let ureskosar = `
    <div class="col-12">
        <div class="text-center p-2" id="kosarmenutitle"><h5>A Kosarad ures</h5></div>
    </div>`;

async function Kosar_Mutat(pushHistory = true) {
    tetelekli = [];
    let tartalom = `
        <div class="col-12">
            <div class="text-center p-2" id="kosarmenutitle"><h5>A Kosarad tartalma</h5></div>
        </div>
        `;

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
                    <div class="p-3 d-flex justify-content-center kosartetelcucc">
                        <div class="col-12 d-flex flex-column flex-lg-row bg-zinc-100 text-slate-900 dark:bg-slate-950/60 dark:!border dark:!border-zinc-200/20 dark:text-zinc-200 shadow-lg rounded-4 p-2 mt-3 p-xxl-none" id="${element.ID_TERMEK}NAGY">
                            <div class="col-12 col-lg-2 d-flex align-self-center justify-content-center">
                                <img src="${element.FOTOLINK}" class="img img-fluid img-thumbnail w-10 h-10" style="object-fit:cover;" alt="kep">
                            </div>
                            <div class="col-12 col-lg-4 d-flex align-self-center justify-content-center p-3">
                                <p>${element.NEV}</p>
                            </div>
                            <div class="col-12 col-sm-8 col-lg-3 d-flex align-self-center justify-content-center">
                                <button type="button" class="btn btn-lg bi bi-dash-lg bal-gomb bg-transparent text-red-600 dark:bg-sky-950 dark:text-red-600 rounded-4 me-2" aria-label="minusz" onclick="KosarPLUSZ(this)" id="${element.ID_TERMEK}9"></button>
                                <input type="number" class="form-control-lg w-50 text-center bg-zinc-200 rounded-4 text-slate-900 dark:bg-sky-950 dark:text-zinc-200 focus:outline-none" min="1" onchange="KosarPLUSZ(this)" value="${element.MENNYISEG}" id="${element.ID_TERMEK}2" style="border: none;">
                                <button type="button" class="btn btn-lg bi bi-plus-lg jobb-gomb bg-transparent text-emerald-600 dark:bg-sky-950 dark:text-emerald-500 rounded-4 ms-2" aria-label="plusz" onclick="KosarPLUSZ(this)" id="${element.ID_TERMEK}1"></button>
                            </div>
                            <div class="col-12 col-lg-2 d-flex align-self-center justify-content-center p-3" id="${element.ID_TERMEK}3">
                                <h4 class="text-slate-900 dark:text-zinc-200 font-semibold termek_ar">${pez.toLocaleString()} Ft</h4>
                            </div>
                            <div class="col-12 col-lg-1 d-flex align-self-center justify-content-center">
                                <button type="button" id="${element.ID_TERMEK}" onclick="KosarItemDelete(this)" class="btn btn-lg bg-transparent text-slate-900 hover:text-red-700 dark:text-zinc-200 dark:hover:text-red-700 transition-all duration-150 ease-in-out" aria-label="teteltorol"><i class="bi bi-trash"></i></button>
                            </div>
                        </div> 
                    </div>`;
       
            }
            tartalom += `
                <div class="d-flex flex-column">
                    <div class="col-12 mt-2 p-2 d-flex flex-column flex-lg-row justify-content-center align-self-center">
                        <span class="align-self-center p-none p-lg-2 text-xl">Összesen: </span>&nbsp;<span id="sumar" class="text-slate-900 dark:text-zinc-200 font-semibold text-xl align-self-center p-none p-lg-2 "></span>&nbsp;<span class="align-self-center text-xl p-none p-lg-2 "> (+ ÁFA)</span>
                    </div>
                    <div class="col-12 d-flex justify-content-center p-3 mb-5" id="pay_button">
                        <button type="button" class="px-3 py-2 rounded-xl !border !border-transparent bg-slate-900 text-zinc-200 dark:bg-gray-800 dark:text-zinc-200 hover:text-slate-900 hover:bg-zinc-100 hover:!border-slate-900 dark:hover:bg-gray-700/70 dark:!border-zinc-200/10 dark:hover:!border-zinc-200/20 dark:hover:text-zinc-200 transition-all duration-150 ease-in-out bi bi-credit-card tracking-[2px]" id="tovabb_a_fizeteshez" onclick='RendelesAblak(${JSON.stringify(tetelekli)})'> TOVÁBB A KASSZÁHOZ</button>
                    </div>
                </div>`;
            }
            else { tartalom = ureskosar; }

    } catch (err) { console.error(err); }

    $("#content_hely").fadeOut(300, function() {
        $("#content_hely").html(tartalom).fadeIn(300);
        AR_SUM("termek_ar", "sumar", false);
    });

    NezetValtas("ki");

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
            AR_SUM("termek_ar", "sumar", false);
        });

        const ti = tetelekli.findIndex(x => x.ID_TERMEK == parseInt(id.id));

        if (ti != -1) { tetelekli.splice(ti, 1); }
        
        if (tetelekli.length > 0) { $("#pay_button").html(`<button type="button" class="px-3 py-2 rounded-xl !border !border-transparent bg-slate-900 text-zinc-200 dark:bg-gray-800 dark:text-zinc-200 hover:text-slate-900 hover:bg-zinc-100 hover:!border-slate-900 dark:hover:bg-gray-700/70 dark:!border-zinc-200/10 dark:hover:!border-zinc-200/20 dark:hover:text-zinc-200 transition-all duration-150 ease-in-out bi bi-credit-card tracking-[2px]" id="tovabb_a_fizeteshez" onclick='RendelesAblak(${JSON.stringify(tetelekli)})'> TOVÁBB A KASSZÁHOZ</button>`); }
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
    let money = mennyiseg * ar;

    for (const element of tetelekli) {
        if (element.ID_TERMEK == parseInt(idk)) {
            element.MENNYISEG = mennyiseg;
            element.PENZ = money;
        };
    }

    if ($(`#${idk}2`).val() == 1 && PluszVAGYminusz == -1) { üzen("A terméket a törlés gombbal (<i class='bi bi-trash'></i>) tudod eltávolítani a kosárból!", "info"); }
    document.getElementById(`${idk}2`).value = mennyiseg;
    document.getElementById(`${idk}3`).innerHTML = `<h4 class="text-slate-900 dark:text-zinc-200 font-semibold termek_ar">${money.toLocaleString()} Ft<h4>`;

    $("#pay_button").html(`<button type="button" class="px-3 py-2 rounded-xl !border !border-transparent bg-slate-900 text-zinc-200 dark:bg-gray-800 dark:text-zinc-200 hover:text-slate-900 hover:bg-zinc-100 hover:!border-slate-900 dark:hover:bg-gray-700/70 dark:!border-zinc-200/10 dark:hover:!border-zinc-200/20 dark:hover:text-zinc-200 transition-all duration-150 ease-in-out bi bi-credit-card tracking-[2px]" id="tovabb_a_fizeteshez" onclick='RendelesAblak(${JSON.stringify(tetelekli)})'> TOVÁBB A KASSZÁHOZ</button>`);

    AR_SUM("termek_ar", "sumar" , false);
    KosarTetelDB(); 
};