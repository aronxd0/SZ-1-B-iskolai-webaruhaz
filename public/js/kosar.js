// kosar menupont, kosarba helyezes, tetelek

let tetelekli = [];



let ureskosar = `
                <div class="col-12 mt-5">
                    <div class="text-center p-2" id="kosarmenutitle"><h5>A Kosarad ures</h5></div>
                </div>`;

$("#cart_button").click(async function () {
    tetelekli = [];
    //$("#content_hely").html("");
    console.log("cart_button click xd");

    $("#welcome_section").fadeOut(300);

    $("#keresett_kifejezes").html("");
    $("#débé").html("");
    $("#nev1").val("");

    var ts = ``;

    let cnt = `
        <div class="col-12 mt-5">
            <div class="text-center p-2" id="kosarmenutitle"><h5>A Kosarad tartalma</h5></div>
        </div>
        `;
    
    

    try {
        await ajax_post("tetelek", 1).then(tetelek => {

             

            if (tetelek.rows.length > 0) {
                for (const element of tetelek.rows) {
                    

                    let pez = element.AR * element.MENNYISEG;
                    
                    tetelekli.push({
                        ID_TERMEK: element.ID_TERMEK,
                        NEV: element.NEV,
                        MENNYISEG: element.MENNYISEG,
                        PENZ: pez
                    });
                   

                    cnt += `
                        
                    <div class="p-3 d-flex justify-content-center">
                        <div 
                         class="
                            col-12 
                            d-flex 
                            flex-column 
                            flex-lg-row 
                            bg-zinc-100 
                            text-slate-900 
                            dark:bg-slate-950 
                            dark:!border 
                            dark:!border-zinc-200/20 
                            dark:text-zinc-200 
                            shadow-lg  
                            rounded-4 
                            p-2 
                            mt-3  
                            p-xxl-none" 

                         id="${element.ID_TERMEK}NAGY">
                            
                            <div class="col-12 col-lg-2 d-flex align-self-center justify-content-center">
                                <img src="${element.FOTOLINK}" class="img img-fluid img-thumbnail w-10 h-10" style="object-fit:cover;" alt="kep">
                            </div>
                            <div class="col-12 col-lg-4 d-flex align-self-center justify-content-center p-3">
                                <p>${element.NEV}</p>
                            </div>
                            <div class="col-12 col-sm-8 col-lg-3 d-flex align-self-center justify-content-center">
                                <button type="button" 
                                class="
                                    btn 
                                    btn-lg  
                                    bi bi-dash-lg 
                                    bal-gomb 
                                    bg-transparent 
                                    text-red-600 
                                    
                                    dark:bg-sky-950 
                                    dark:text-red-600 
                                    rounded-4 me-2 
                                    
                                    
                                    
                                    " 

                                aria-label="minusz" onclick="KosarPLUSZ(this)" id="${element.ID_TERMEK}9"></button>
                                <input type="number" 
                                class="
                                    form-control-lg 
                                    w-50 
                                    text-center 
                                    bg-zinc-200 
                                    rounded-4 
                                    text-slate-900 
                                    dark:bg-sky-950 
                                    dark:text-zinc-200 
                                    focus:outline-none 
                                    " 

                                min="1" onchange="KosarPLUSZ(this)" value="${element.MENNYISEG}" id="${element.ID_TERMEK}2" style="border: none;">
                                <button type="button" 
                                class="
                                    btn btn-lg 
                                    bi bi-plus-lg 
                                    jobb-gomb
                                    bg-transparent  
                                    text-emerald-600
                                    
                                    dark:bg-sky-950 
                                    dark:text-emerald-500 
                                    rounded-4 ms-2 
                                    
                                    
                                    " 
                                
                                aria-label="plusz" onclick="KosarPLUSZ(this)" id="${element.ID_TERMEK}1"></button>
                            </div>
                            <div class="col-12 col-lg-2 d-flex align-self-center justify-content-center p-3" id="${element.ID_TERMEK}3">
                                <h4 class="text-success termek_ar slashed-zero tabular-nums">${pez.toLocaleString()} Ft</h4>
                            </div>

                            <div class="col-12 col-lg-1 d-flex align-self-center justify-content-center">
                                <button type="button" id="${element.ID_TERMEK}" onclick="KosarItemDelete(this)" 
                                class="
                                    btn btn-lg 
                                    bg-transparent 
                                    text-slate-900 
                                    hover:text-red-700 
                                    dark:text-zinc-200 
                                    dark:hover:text-red-700 
                                    transition-all duration-150 ease-in-out
                                    " 

                                aria-label="teteltorol"><i class="bi bi-trash"></i></button>
                            </div>
                            
                        </div> 
                        
                        
                    </div>
            
                    `;
       
                }

                cnt += `
                    <div class="d-flex flex-column">
                        <div class="col-12 mt-2 p-2 d-flex flex-column flex-lg-row justify-content-center align-self-center">
                            <span class="align-self-center p-none p-lg-2 text-xl">Összesen: </span>&nbsp;<span id="sumar" class="anton-regular text-success text-xl align-self-center p-none p-lg-2 "></span>&nbsp;<span class="align-self-center text-xl p-none p-lg-2 "> (+ ÁFA)</span>
                        </div>
                        <div class="col-12 d-flex justify-content-center p-3 mb-5" id="pay_button">
                            <button type="button" 
                                class="btn btn-lg 
                                bg-emerald-700 
                                text-zinc-200 
                                rounded-5 
                                shadow-xl 
                                hover:bg-emerald-600 
                                hover:shadow-lg  
                                hover:shadow-emerald-600/70 
                                hover:text-zinc-200 
                                transition-hover duration-300 ease-in-out 
                                bi bi-credit-card 

                                
                                " id="tovabb_a_fizeteshez" onclick='RendelesAblak(${JSON.stringify(tetelekli)})'> Tovább a kasszához</button>
                        </div>
                    </div>
                
                
                `;

            }
            else {
                cnt = ureskosar;
            }
                   
            });

        } catch (err) { console.log("hiba:", err); }


        
        

        $("#content_hely").fadeOut(300, function() {
            $("#content_hely").html(cnt).fadeIn(300);
            AR_SUM("termek_ar", "sumar", false);
        });
        $("#pagi").html("");
        
});



function KosarTeteleiFrissit() {
    $("#cart_button").trigger("click");
    KosarTetelDB();
}






function KosarItemDelete(id){
    ajax_post(`/kosar_del?ID_TERMEK=${id.id}`)
    .then(() => {
        $(`#${id.id}NAGY`).remove();

        console.log(id.id);

        const ti = tetelekli.findIndex(x => x.ID_TERMEK == parseInt(id.id));

        if (ti != -1) {
            tetelekli.splice(ti, 1);
        }

        

        KosarTetelDB();

        
        if (tetelekli.length > 0) {
            $("#pay_button").html("");
            $("#pay_button").html(`
                
                <button type="button" 
                                class="btn btn-lg 
                                bg-emerald-700 
                                text-zinc-200 
                                rounded-5 
                                shadow-xl 
                                hover:bg-emerald-600 
                                hover:shadow-lg  
                                hover:shadow-emerald-600/70 
                                hover:text-zinc-200 
                                transition-hover duration-300 ease-in-out 
                                bi bi-credit-card 

                                
                                " id="tovabb_a_fizeteshez" onclick='RendelesAblak(${JSON.stringify(tetelekli)})'> Tovább a kasszához</button>`);

            AR_SUM("termek_ar", "sumar" , false);
        }
        else {
            $("#content_hely").fadeOut(300, function() {
                $("#content_hely").html(ureskosar).fadeIn(300);
            
            });
        }

        üzen("Tétel törölve a kosárból","success");
    })
}

async function Kosarba_Bele(event, id_termek) {
    event.stopPropagation();
    $("#termekview").modal("hide");
    // Kosár gomb megnyomása után beleteszi a termeket
    try {
        let kosaraddleiras = await ajax_post(`kosar_add?ID_TERMEK=${id_termek}` ,1);
        if (kosaraddleiras.message == "ok") {
            KosarTetelDB(); // majd a külön le kérdezést kap 
            üzen("Áru bekerült a kosárba","success");   
        }
        else { üzen(kosaraddleiras.message, "danger"); }         

        //$("#idt").html(id_termek);
        $("#kosarba_bele").modal("show");

    } catch (err) { üzen(err, "danger"); }
    
    
}

async function KosarTetelDB() {
    try {
        let kosarteteldb = await ajax_post("kosarteteldb", 1);
        var db = 0;
        for (const element of kosarteteldb.rows) {
            console.log(typeof element.kdb);
            if (element.kdb == undefined) { 
                db = 0;

            } 
            else { db = parseInt(element.kdb); }
            $("#kosar_content_count").html(`${db}`);
        }

    } catch (err) { üzen(err, "danger"); }
}

async function KosarPLUSZ(id) {
    
    var PluszVAGYminusz = id.id.substring(id.id.length - 1, id.id.length) == 9? -1 : ""  ;// ha nem 9 akkor - / ha 1 akkor + 
    var ertek = id.id.substring(id.id.length - 1, id.id.length) == "2"? `&ERTEK=${id.value > 0 ? id.value: 1}` : "";// ha 2 akkor az input mező lett változtatva
    var idk = id.id.substring(0, id.id.length - 1);
    
    await ajax_post(`kosar_add?ID_TERMEK=${idk}&MENNYIT=${PluszVAGYminusz}${ertek}`, 1);
    var db = await ajax_post("tetelek?ID_TERMEK="+idk, 1); // MEnyiség értéket csak akkor adok át ,a mikor az input mező lett változtatva különben üres string
    
    let mennyiseg = parseInt(db.rows[0].MENNYISEG);
    let ar = parseInt(db.rows[0].AR);
    let money = mennyiseg * ar;

    for (const element of tetelekli) {
        if (element.ID_TERMEK == parseInt(idk)) {
            element.MENNYISEG = mennyiseg;
            element.PENZ = money;
        };
        
    }

    

    console.log(tetelekli);
    
    document.getElementById(`${idk}2`).value = mennyiseg;
    document.getElementById(`${idk}3`).innerHTML = `<h4 class="anton-regular text-success termek_ar">${money.toLocaleString()} Ft<h4>` ; // forint firssit

    $("#pay_button").html("");
    $("#pay_button").html(`
                <button type="button" 
                        class="btn btn-lg 
                        bg-emerald-700 
                        text-zinc-200 
                        rounded-5 
                        shadow-xl 
                        hover:bg-emerald-600 
                        hover:shadow-lg  
                        hover:shadow-emerald-600/70 
                        hover:text-zinc-200 
                        transition-hover duration-300 ease-in-out 
                        bi bi-credit-card 

                        
                        " id="tovabb_a_fizeteshez" onclick='RendelesAblak(${JSON.stringify(tetelekli)})'> Tovább a kasszához</button>`);

    AR_SUM("termek_ar", "sumar" , false);
    KosarTetelDB(); // fönti kosár db frissitése

};
