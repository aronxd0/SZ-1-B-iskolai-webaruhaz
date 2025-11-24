// velemenyek irasa, torlese, megjelenitese

async function Velemeny_Kozzetesz(id_termek) {
    
    const cls = new bootstrap.Collapse('#vlm', { toggle: false });
    if ($("#velemeny_input").val() != "") {
        try {
            let velemenyiras = await ajax_post(`velemeny_add?ID_TERMEK=${id_termek}&SZOVEG=${$("#velemeny_input").val()}`, 1) 
            cls.hide();
            console.log(`velemeny_add?ID_TERMEK=${id_termek}&SZOVEG=${$("#velemeny_input").val()}`);

            if (velemenyiras.message == "ok") {
                üzen(`Vélemény elküldve`,"success");
                $("#velemeny_input").val("");
                VelemenyekMutat(id_termek);
            }
            else {
                üzen(`Hiba: <br> ${velemenyiras.message}`,"danger");
            }

            
        }  catch (err) { üzen(err, "danger"); }
        
        
    }
}

async function Velemeny_Torles(id_velemeny, id_termek) {
    console.log(`gyors teszt xd, ez a velemeny id = ${id_velemeny}, termekid = ${id_termek}`);

    try {
        let velemeny_torles = await ajax_post(`velemeny_del?ID_VELEMENY=${id_velemeny}`, 1);
        if (velemeny_torles.message == "ok") {
            üzen("Vélemény sikeresen törölve!", "success");
            $("#velemeny_input").val("");
            SajatVelemenyekMutat(id_termek);
        }
    } catch (err) { üzen(err, "danger"); }
    
}

async function SajatVelemenyekMutat(id_termek) {
    let sv = "";
    let allapot_style = "";
    let ikon = "";
    //$("#sajatok").html("");

    try {
        
        let sajat_velemeny_lista = await ajax_post(`velemenyek?ID_TERMEK=${id_termek}&SAJATVELEMENY=1`, 1);
        for (const element of sajat_velemeny_lista.rows) {

            if (element.ALLAPOT == "Jóváhagyva") { allapot_style = "alert alert-success"; ikon = "✅" }
            else if (element.ALLAPOT == "Jóváhagyásra vár") { allapot_style = "alert alert-warning"; ikon = "🔄️" }
            else if (element.ALLAPOT == "Elutasítva") { allapot_style = "alert alert-danger"; ikon = "❌" }

            sv += `
            <div class="w-100 p-2 border rounded mt-3 mb-3 comment ${allapot_style}">
                <p class="d-flex justify-content-between"><b><span><i class="bi bi-person"></i> ${element.NEV}</span></b>  <span><i class="bi bi-calendar4-week"></i> ${new Date(element.DATUM).toLocaleString('hu-HU', {
                                                                                                                                                                            year: 'numeric',
                                                                                                                                                                            month: '2-digit',
                                                                                                                                                                            day: '2-digit',
                                                                                                                                                                            hour: '2-digit',
                                                                                                                                                                            minute: '2-digit',
                                                                                                                                                                            hour12: false
                                                                                                                                                                        })}</span></p>
                <p class="break-all">${element.SZOVEG.toString()}</p>
                <p class="d-flex align-self-center justify-content-between"><span>${element.ALLAPOT} ${ikon}</span> 
                    <div class="dropup">
                        <button type="button" class="btn btn-danger dropdown-toggle" data-bs-toggle="dropdown">
                         <i class="bi bi-trash"></i>
                        </button>
                        <ul class="dropdown-menu p-2">
                            <li><span class="dropdown-item-text">Biztosan törlöd a véleményt?</span></li>
                            <li class="d-flex justify-content-end p-3"><button class="btn btn-danger bi bi-trash" type="button" onclick='Velemeny_Torles(${element.ID_VELEMENY},${element.ID_TERMEK})'> Törlés</button></li>
                        </ul>
                    </div>
                     
                </p>
            </div>`;
        }
        console.log(sv);
        $("#velemenyek").fadeOut(300, function() {
            $("#velemenyek").html(sv).fadeIn(300);
        });
        console.log(`sajat velemenyek betoltve`);

    } catch (err) { console.log("hiba:", err); }
}


async function VelemenyekMutat(id_termek) {
    let vv = "";
    //$("#velemenyek").html("");

    try {
        
        let velemeny_lista = await ajax_post(`velemenyek?ID_TERMEK=${id_termek}`, 1);
        if (velemeny_lista.rows.length == 0) { $("#velemenyek").html("<div class='col-12 text-xl text-center p-3'>Ehhez a termékhez még senki nem írt véleményt :(</div>"); }
        else {
            for (const element of velemeny_lista.rows) {
                vv += `
                <div 
                class="
                    w-100 
                    p-3 
                    rounded-4 
                    shadow-xl 
                    bg-zinc-50 
                    text-slate-900 
                    dark:bg-slate-700 
                    dark:text-zinc-200 
                    mt-3 
                    mb-3 
                    comment">
                    <p class="d-flex justify-content-between"><b><span><i class="bi bi-person"></i> ${element.NEV}</span></b>  <span><i class="bi bi-calendar4-week"></i> ${new Date(element.DATUM).toLocaleString('hu-HU', {
                                    year: 'numeric',
                                    month: '2-digit',
                                    day: '2-digit',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                    hour12: false
                                })}</span></p>
                    <p class="break-all">${element.SZOVEG.toString()}</p>
                </div>`;
            }
            console.log(vv);

            $("#velemenyek").fadeOut(300, function() {
                $("#velemenyek").html(vv).fadeIn(300);
            });
            console.log(`velemenyek betoltve`);
        }
        
        

    } catch (err) { console.log("hiba:", err); }
}