// kosar menupont, kosarba helyezes, tetelek

$("#cart_button").click(async function () {
    $("#content_hely").html("");

    var ts = ``;

    try {
        await ajax_post("tetelek", 1).then(tetelek => {
            for (const element of tetelek.rows) {
                ts += `<div class="col-12 d-flex m-2 p-2 bg-secondary bg-gradient text-center">`;

                ts += `<div class="col-4" style="height: 100px" >  <img src="${element.FOTOLINK}" class="img-fluid" alt="Card image" style="height:100px"> </div>`;
                ts += `<div class="col-4"> <h4>${element.NEV}</h4> </div>`;
                ts += `<div class="col-2 text-center text-white m-auto" id="${element.ID_TERMEK}3"><h5><b > ${element.AR * element.MENNYISEG} Ft</b><h5> </div>`;
                ts += `<div class="col-2 m-auto"> <button type="button" class="btn btn-danger"><i class="bi bi-dash-circle"></i></button><span class="p-2" id="${element.ID_TERMEK}2">${element.MENNYISEG}</span> db   <button type="button" id="${element.ID_TERMEK}" onclick="KosarPLUSZ(this)" class="btn btn-success"><i class="bi bi-plus-circle"></i></button> <button type="button" class="btn btn-warning"><i class="bi bi-x-circle-fill"></i></button></div> `;
    
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

async function Kosarba_Bele(event, id_termek) {
    event.stopPropagation();
    $("#termekview").modal("hide");

    // kosarba INSERT INTO ide
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
    var PluszVAGYminusz = id.id.substring(id.id.length - 1, id.id.length) == 9? -1 : ""  ;// ha nem 9 akkor plusz

    var idk = id.id.substring(0, id.id.length - 1);
    
    await ajax_post(`kosar_add?ID_TERMEK=${idk}&MENNYIT=${PluszVAGYminusz}`, 1);
    var db = await ajax_post("tetelek?ID_TERMEK="+idk, 1);
    document.getElementById(`${idk}2`).innerHTML = db.rows[0].MENNYISEG;
    document.getElementById(`${idk}3`).innerHTML = `<h5><b >${parseInt(db.rows[0].MENNYISEG) * parseInt(db.rows[0].AR)} Ft</b><h5>` ;// mindegyiknek igyanaz az idj ? nem jó majd othonm nekiállok .😓
    KosarTetelDB();

    };
