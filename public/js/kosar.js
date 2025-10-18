// kosar menupont, kosarba helyezes, tetelek

let tetelekli = [];

$("#cart_button").click(async function () {
    tetelekli = [];
    $("#content_hely").html("");

    $("#keresett_kifejezes").html("");
    $("#débé").html("");
    $("#nev1").val("");

    var ts = ``;

    let cnt = `
        <div class="col-12">
            <div class="text-center p-2" id="kosarmenutitle"><h5>A Kosarad tartalma</h5></div>
        </div>
        `;
    
    

    try {
        await ajax_post("tetelek", 1).then(tetelek => {

             

            if (tetelek.rows.length > 0) {
                for (const element of tetelek.rows) {
                    

                    let pez = element.AR * element.MENNYISEG;
                    
                    tetelekli.push(`${element.ID_TERMEK}`, `${element.NEV}`, `${element.MENNYISEG}`, `${pez}`);

                    cnt += `
                        

                        <div class="col-12 d-flex flex-column flex-lg-row feka shadow-lg rounded-4 mt-3 p-3 p-xxl-none" id="${element.ID_TERMEK}NAGY">
                            <div class="col-1"></div>
                            <div class="col-12 col-lg-2 d-flex align-self-center justify-content-center">
                                <img src="${element.FOTOLINK}" class="img img-fluid" style="width:30%;" alt="kep">
                            </div>
                            <div class="col-12 col-lg-2 d-flex align-self-center justify-content-center p-3">
                                <p>${element.NEV}</p>
                            </div>
                            <div class="col-12 col-sm-8 col-lg-3 d-flex align-self-center justify-content-center">
                                <button type="button" class="btn btn-lg btn-dark bi bi-dash-lg bal-gomb" aria-label="minusz" onclick="KosarPLUSZ(this)" id="${element.ID_TERMEK}9"></button>
                                <input type="number" class="form-control-lg w-50 text-center fhr" min="1" onchange="KosarPLUSZ(this)" value="${element.MENNYISEG}" id="${element.ID_TERMEK}2">
                                <button type="button" class="btn btn-lg btn-dark bi bi-plus-lg jobb-gomb" aria-label="plusz" onclick="KosarPLUSZ(this)" id="${element.ID_TERMEK}1"></button>
                            </div>
                            <div class="col-12 col-lg-2 d-flex align-self-center justify-content-center p-3" id="${element.ID_TERMEK}3">
                                <h4 class="anton-regular text-success termek_ar">${pez.toLocaleString()} Ft</h4>
                            </div>

                            <div class="col-12 col-lg-1 d-flex align-self-center justify-content-center">
                                <button type="button" id="${element.ID_TERMEK}" onclick="KosarItemDelete(this)" class="btn btn-danger" aria-label="teteltorol"><i class="bi bi-trash"></i></button>
                            </div>
                            <div class="col-1"></div>
                        </div> 
                        
                        
                    
            
                    `;
       
                }

                cnt += `
                    <div class="row">
                        <div class="col-12 mt-2 p-2 d-flex justify-content-center align-self-center">
                            <h5 class="align-self-center p-2">Összesen: </h5>&nbsp;<h3 id="sumar" class="anton-regular text-success align-self-center p-2"></h3>&nbsp;<h5 class="align-self-center p-2"> (+ ÁFA)</h5>
                        </div>
                        <div class="col-12 d-flex justify-content-center p-3 mb-5">
                            <button type="button" class="btn btn-lg btn-success bi bi-credit-card" id="tovabb_a_fizeteshez" onclick='FizetesAblak(${JSON.stringify(tetelekli)})'> Tovább a fizetéshez</button>
                        </div>
                    </div>
                
                
                `;

            }
            else {
                cnt = `
                    <div class="col-12">
                        <div class="text-center p-2" id="kosarmenutitle"><h5>A Kosarad ures</h5></div>
                    </div>
            
            `;
            }
                   
            });

        } catch (err) { console.log("hiba:", err); }


        
        

        $("#content_hely").html(cnt);
        $("#pagi").html("");
        AR_SUM("termek_ar", "sumar");
});








function KosarItemDelete(id){
    ajax_post(`/kosar_del?ID_TERMEK=${id.id}`)
    .then(() => {
        $(`#${id.id}NAGY`).remove();

        AR_SUM("termek_ar", "sumar");

        KosarTetelDB();
        üzen("Tétel törölve a kosárból","success");
    })
}

async function Kosarba_Bele(event, id_termek) {
    event.stopPropagation();
    $("#termekview").modal("hide");
    // Kosár gomb megnyomása után beleteszi a ter
    try {
        let kosaraddleiras = await ajax_post(`kosar_add?ID_TERMEK=${id_termek}` ,1);
        if (kosaraddleiras.message == "ok") {
           KosarTetelDB(); // majd a külön le kérdezést kap 
            üzen("Áru bekerült a kosárba","success");   
        }
        else { üzen(kosaraddleiras.message, "danger"); }         

        $("#idt").html(id_termek);
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
    
    document.getElementById(`${idk}2`).value = mennyiseg;
    document.getElementById(`${idk}3`).innerHTML = `<h4 class="anton-regular text-success termek_ar">${money.toLocaleString()} Ft<h4>` ; // forint firssit


    AR_SUM("termek_ar", "sumar");
    KosarTetelDB(); // fönti kosár db frissitése

};
