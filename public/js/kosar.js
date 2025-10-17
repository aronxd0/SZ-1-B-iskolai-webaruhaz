// kosar menupont, kosarba helyezes, tetelek

$("#cart_button").click(async function () {
    $("#content_hely").html("");

    var ts = ``;

    try {
        await ajax_post("tetelek", 1).then(tetelek => {
            for (const element of tetelek.rows) {
                ts += `<div class="col-12 d-flex m-2 p-2 bg-secondary bg-gradient text-center" id="${element.ID_TERMEK}NAGY">`;

                ts += `<div class="col-3" style="height: 100px" >  <img src="${element.FOTOLINK}" class="img-fluid" alt="Card image" style="height:100px"> </div>`;
                ts += `<div class="col-3"> <h4>${element.NEV}</h4> </div>`;

                ts += `<div class="col-3 m-auto">
                
                <div class="input-group input-number-group m-auto">
                            <div class="input-group-button oclickable" onclick="KosarPLUSZ(this)" id="${element.ID_TERMEK}9">
                                <span class="input-number-decrement">-</span>
                            </div>
                            <input class="input-number" type="number" onchange="KosarPLUSZ(this)" value="${element.MENNYISEG}" id="${element.ID_TERMEK}2" min="1" >
                            <div class="input-group-button oclickable" onclick="KosarPLUSZ(this)" id="${element.ID_TERMEK}1">
                                <span class="input-number-increment">+</span>
                            </div>
                          
                            </div>
                          (db)
                    </div> 
                `

                //ts += `<div class="col-2 m-auto"> <button type="button" class="btn btn-danger"><i class="bi bi-dash-circle" id="${element.ID_TERMEK}9" onclick="KosarPLUSZ(this)"></i></button><span class="p-2" id="${element.ID_TERMEK}2">${element.MENNYISEG}</span> db   <button type="button" id="${element.ID_TERMEK}1" onclick="KosarPLUSZ(this)" class="btn btn-success"><i class="bi bi-plus-circle"></i></button> </div> `;
                ts += `<div class="col-2 text-center text-white m-auto" id="${element.ID_TERMEK}3"><h5><b > ${element.AR * element.MENNYISEG} Ft</b><h5> </div>`;               
                ts += `<div class="col-1 m-auto" ><button type="button" id="${element.ID_TERMEK}" onclick="KosarItemDelete(this)" class="btn btn-warning"><i class="bi bi-x-circle-fill"></i></button> </div>`;
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
    $("#content_hely").html(ts);
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
    // Kosár gomb megnyomása után beleteszi a terméket a kosárba
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
    var Menyiseg = id.id.substring(id.id.length - 1, id.id.length) == "2"? `&ERTEK="${id.value}"` : "";// ha 2 akkor az input mező lett változtatva
    var idk = id.id.substring(0, id.id.length - 1);
    
    await ajax_post(`kosar_add?ID_TERMEK=${idk}&MENNYIT=${PluszVAGYminusz}`, 1);
    var db = await ajax_post("tetelek?ID_TERMEK="+idk+Menyiseg, 1); // MEnyiség értéket csak akkor adok át ,a mikor az input mező lett változtatva különben üres string
    document.getElementById(`${idk}2`).value = db.rows[0].MENNYISEG;
    document.getElementById(`${idk}3`).innerHTML = `<h5><b >${parseInt(db.rows[0].MENNYISEG) * parseInt(db.rows[0].AR)} Ft</b><h5>` ; // forint firssit
    KosarTetelDB(); // fönti kosár db frissitése

};
