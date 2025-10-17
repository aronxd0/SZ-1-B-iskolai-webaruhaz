// kosar menupont, kosarba helyezes, tetelek

$("#cart_button").click(async function () {
    $("#content_hely").html("");

    $("#keresett_kifejezes").html("");
    $("#débé").html("");
    $("#nev1").val("");

    var ts = ``;

    let cnt = "";

    try {
        await ajax_post("tetelek", 1).then(tetelek => {
            for (const element of tetelek.rows) {
                
                let pez = element.AR * element.MENNYISEG;

                cnt += `
                    <div class="d-flex flex-column flex-xxl-row feka shadow-lg rounded-4 mt-3 p-3 p-xxl-none" id="${element.ID_TERMEK}NAGY">
                        <div class="col-1"></div>
                        <div class="col-12 col-xxl-2 d-flex align-self-center justify-content-center">
                            <img src="${element.FOTOLINK}" class="img img-fluid" style="width:30%;" alt="kep">
                        </div>
                        <div class="col-12 col-xxl-2 d-flex align-self-center justify-content-center p-3">
                            <p>${element.NEV}</p>
                        </div>
                        <div class="col-12 col-xxl-2 d-flex align-self-center justify-content-center">
                            <button type="button" class="btn btn-lg btn-secondary bi bi-dash-lg bal-gomb" aria-label="minusz" onclick="KosarPLUSZ(this)" id="${element.ID_TERMEK}9"></button>
                            <input type="number" class="form-control-lg w-50" min="1" onchange="KosarPLUSZ(this)" value="${element.MENNYISEG}" id="${element.ID_TERMEK}2">
                            <button type="button" class="btn btn-lg btn-secondary bi bi-plus-lg jobb-gomb" aria-label="plusz" onclick="KosarPLUSZ(this)" id="${element.ID_TERMEK}1"></button>
                        </div>
                        <div class="col-12 col-xxl-2 d-flex align-self-center justify-content-center p-3" id="${element.ID_TERMEK}3">
                            <h4 class="anton-regular text-success">${pez.toLocaleString()} Ft</h4>
                        </div>

                        <div class="col-12 col-xxl-2 d-flex align-self-center justify-content-center">
                            <button type="button" id="${element.ID_TERMEK}" onclick="KosarItemDelete(this)" class="btn btn-danger" aria-label="teteltorol"><i class="bi bi-x-lg"></i></button>
                        </div>
                        <div class="col-1"></div>
                    </div>        
                
        
                
                `;





                ts += `<div class="col-12 d-flex flex-column flex-lg-row" id="${element.ID_TERMEK}NAGY">`;

                ts += `<img src="${element.FOTOLINK}" class="img-fluid" style="width:50%;height:50%;" alt="kep"> `;
                ts += `<h4>${element.NEV}</h4>`;

                ts += `
                
                <div >
                            <div class="input-group-button oclickable" onclick="KosarPLUSZ(this)" id="${element.ID_TERMEK}9">
                                <span class="input-number-decrement">-</span>
                            </div>
                            <input class="input-number" type="number" onchange="KosarPLUSZ(this)" value="${element.MENNYISEG}" id="${element.ID_TERMEK}2" min="1" >
                            <div class="input-group-button oclickable" onclick="KosarPLUSZ(this)" id="${element.ID_TERMEK}1">
                                <span class="input-number-increment">+</span>
                            </div>
                          
                            </div>
                          (db)
                     
                `

                //ts += `<div class="col-2 m-auto"> <button type="button" class="btn btn-danger"><i class="bi bi-dash-circle" id="${element.ID_TERMEK}9" onclick="KosarPLUSZ(this)"></i></button><span class="p-2" id="${element.ID_TERMEK}2">${element.MENNYISEG}</span> db   <button type="button" id="${element.ID_TERMEK}1" onclick="KosarPLUSZ(this)" class="btn btn-success"><i class="bi bi-plus-circle"></i></button> </div> `;
                ts += `<div id="${element.ID_TERMEK}3"><h5><b > ${element.AR * element.MENNYISEG} Ft</b><h5>`;               
                ts += `<div ><button type="button" id="${element.ID_TERMEK}" onclick="KosarItemDelete(this)" class="btn btn-warning"><i class="bi bi-x-circle-fill"></i></button> `;
                ts += "</div>" 
            }   
        });

    } catch (err) { console.log("hiba:", err); }



    var kd = `
        <div class="col-12">
            <div class="text-center p-2 bg-success" id="kosarmenutitle"><h1>ha a kosar ures akkor "kosar ures" ha nem akkor kosar tartalma</h1> </div>
            <div class="feka p-2" id="kosar_tetelek">
                ide jonnek a tetelek  | Nagyon sok backend ÁDI készülj, alvásnak vége munka lesz
            </div>
        </div>
    
    `;

    console.log(ts +" ez a tr")
    $("#content_hely").html(cnt);
    $("#pagi").html("");
});



function KosarItemDelete(id){
    ajax_post(`/kosar_del?ID_TERMEK=${id.id}`)
    .then(() => {
        $(`#${id.id}NAGY`).remove();
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
            if (element.kdb == undefined) { db = 0;} 
            else { db = parseInt(element.kdb); }
            $("#kosar_content_count").html(`${db}`);
        }

    } catch (err) { üzen(err, "danger"); }
}

async function KosarPLUSZ(id){
    var PluszVAGYminusz = id.id.substring(id.id.length - 1, id.id.length) == 9? -1 : ""  ;// ha nem 9 akkor - / ha 1 akkor + 
    var ertek = id.id.substring(id.id.length - 1, id.id.length) == "2"? `&ERTEK=${id.value > 0 ? id.value: 1}` : "";// ha 2 akkor az input mező lett változtatva
    var idk = id.id.substring(0, id.id.length - 1);
    
    await ajax_post(`kosar_add?ID_TERMEK=${idk}&MENNYIT=${PluszVAGYminusz}${ertek}`, 1);
    var db = await ajax_post("tetelek?ID_TERMEK="+idk, 1); // MEnyiség értéket csak akkor adok át ,a mikor az input mező lett változtatva különben üres string
    document.getElementById(`${idk}2`).value = db.rows[0].MENNYISEG;
    let money = parseInt(db.rows[0].MENNYISEG) * parseInt(db.rows[0].AR);
    document.getElementById(`${idk}3`).innerHTML = `<h4 class="anton-regular text-success">${money.toLocaleString()} Ft<h4>` ; // forint firssit
    KosarTetelDB(); // fönti kosár db frissitése

};
