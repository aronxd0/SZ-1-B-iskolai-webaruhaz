// termekek szerkesztese, torlese, uj felvetele + a betolto fuggveny

// termek modositasa MENT gombra kattintaskor
async function TermekModosit(url) {
  try {
    let ser = url.split("§")[0];
    let id_termek = url.split("§")[1];
    let aktiv = url.split("§")[2];

    console.log(`ez megy at: termek_edit?ID_TERMEK=${id_termek}&${ser}&mod_aktiv=${aktiv}`);

    let termekmod = await ajax_post(`termek_edit?ID_TERMEK=${id_termek}&${ser}&mod_aktiv=${aktiv}`); // aktiv is átküldve
    if (termekmod.message == "ok") {
      üzen(`A termék (${id_termek}) sikeresen módosítva!`, "success");
    } else {
      üzen(termekmod.message, "danger");
    }
  } catch (err) {
    console.log("hiba:", err);
  }

  KERESOBAR();
  KosarTetelDB(); // kosár darab mutatása frissítése
}

// termek szerkeszto ablak
function Termek_Edit(event, cuccok, tipus) {
  event.stopPropagation();

  const termek_id = cuccok[0];
  const kategoria = cuccok[1];
  const nev = cuccok[2];
  const azon = cuccok[3];
  const ar = cuccok[4];
  const mennyiseg = cuccok[5];
  const meegys = cuccok[6];
  const aktiv = cuccok[7];
  const termeklink = cuccok[8];
  const fotolink = cuccok[9];
  const leiras = cuccok[10];
  const datumido = cuccok[11];
  const id_kategoria = cuccok[12];

  console.log(leiras);

  KategoriaFeltolt("mod_kat", "select", id_kategoria);

  if (tipus == "bevitel") {
    $("#mod_nev").val("");
    $("#mod_azon").val("");
    $("#mod_ar").val(0);
    $("#mod_db").val(1);
    $("#mod_meegys").val("db");
    $("#mod_leiras").val("");
    $("#mySwitch").prop("checked", true).trigger("change"); // Default érték beállítása
  } else {
    $("#idx1").html(`${termek_id}; ${nev}`);
    $("#mod_nev").val(nev);
    $("#mod_azon").val(azon);
    $("#mod_ar").val(ar);
    $("#mod_db").val(mennyiseg);
    $("#mod_meegys").val(meegys);
    var datum = new Date();
    $("#mod_datum").val(datum.toISOString().split("T")[0]);
    $("#mod_leiras").val(leiras);

    // Switch állapot beállítása
    if (aktiv === "Y") {
      $("#mySwitch").prop("checked", true).trigger("change");
    } else {
      $("#mySwitch").prop("checked", false).trigger("change");
    }
  }

  $("#save_button")
    .off()
    .one("click", function () {
      const aktiv = $("#mySwitch").is(":checked") ? "YES" : "NO"; // Itt olvassuk ki az értéket
      TermekModosit(`${$("#mod1").serialize()}§${termek_id}§${aktiv}`);
    });

  $("#termek_edit").modal("show");
}

function Termek_Torol(event, cuccok) {
  event.stopPropagation();
  const termek_id = cuccok[0];

  $("#delete_modal .modal-body").html(`Biztosan törlöd a(z) ${termek_id} azonosítójú terméket?`);
  $("#delete_modal").off("click");
  $("#delete_modal").on("click", ".btn-success", function () {
    try {
      var s = "";
      var tip = "success";
      var d_json = ajax_post(`termek_del?ID_TERMEK=${termek_id}`, 1);
      console.log(d_json);
      if (d_json.message == "ok") {
        if (d_json.rows[0].affectedRows == 1) {
          s = "Törlés OK...";
          KERESOBAR();
        } else {
          tip = "warning";
          s = `Hiba<br>${d_json.message}`;
        }
      } else {
        tip = "danger";
        s = d_json.message;
      }
      üzen(s, tip);
    } catch (err) {
      console.log("hiba:", err);
    }
  });
  $("#delete_modal").modal("show");
  KosarTetelDB(); // kosár darab mutatása frissítése
}

async function Termek_Mutat(event, cuccok) {
  $("#termekview").modal("hide");
  console.log(`cuccok: ${cuccok}`);

  const termek_id = cuccok[0];
  const kategoria = cuccok[1];
  const nev = cuccok[2];
  const azon = cuccok[3];
  const ar = cuccok[4];
  const mennyiseg = cuccok[5];
  const meegys = cuccok[6];
  const aktiv = cuccok[7];
  const termeklink = cuccok[8];
  const fotolink = cuccok[9];
  const leiras = cuccok[10];
  const datumido = cuccok[11];

  $("#ga").html("");
  /*
    for (let index = 0; index < 100; index++) {
        $("#termek_content").append(cuccok + "<br>");
        
    }*/
  let ks = "";

  if ($("#loginspan").html() == " Bejelentkezés" || aktiv == "N" || mennyiseg == 0) {
    ks = "";
  } else
    ks = `<button class="btn btn-lg btn-success kosar bi bi-cart2" onclick='Kosarba_Bele(event, ${termek_id})'> Kosárba bele</button>`;

  let bal = ` 
                    <img class="img-fluid img-thumbnail rounded mx-auto  m-1 d-block" src="${fotolink}" alt="${nev}">
                
                
    `;

  let kozep = `   <div class="row mt-2">
                        <b>Termékleírás:</b>
                        <br>
                        <p>${leiras}</p>
                    </div>
    
                    <div class"row">
                        <p>
                            <b>Kategória: </b> ${kategoria}
                        </p>
                    </div>
    
                    <div class"row">
                        <p>
                            <b>Termékazonosító: </b> ${azon}
                        </p>
                    </div>
                    <div class="row">
                        <p> 
                            <b> Raktáron: </b> ${mennyiseg} ${meegys}
                        </p>
                    </div>
                    <div class="row">
                        <h1 class="text-success anton-regular">${parseInt(ar).toLocaleString()} Ft</h1>
                    </div>

                    <div class="row p-2">
                        
                    </div>
    
    `;

  $("#bal").html(bal);
  $("#jobb").html(kozep);
  $("#alul").html(ks);

  $("#termeknev").html(nev);

  const cls = new bootstrap.Collapse("#vlm", { toggle: false });

  $("#vlmg").html("");
  $("#ussr").html("");

  $("#vvl").html(
    `<a class="nav-link show active" href="#velemenyek" id="velemenyek-tab" onclick='VelemenyekMutat(${termek_id})'>Vélemények</a>`
  );
  //$("#velemenyek-tab").trigger("click");

  if (!BevanJelentkezve()) {
    $("#vlmg").html("Vélemény írásához jelentkezzen be");
    cls.hide();
    $("#sajatvlm").html("");
    $("#sajatvlm").addClass("eltunt");
  } else {
    $("#vlmg").html(
      `<button class="btn btn-primary bi bi-chat-dots w-auto" data-bs-toggle="collapse" data-bs-target="#vlm"> Vélemény írása</button>`
    );
    $("#ussr").html(`${$("#user").html()}`);

    $("#sajatvlm").html(
      `<a class="nav-link" href="#sajatok" id="sajat-tab" onclick='SajatVelemenyekMutat(${termek_id})'>Véleményeim</a>`
    );

    $("#sajatvlm").removeClass("eltunt");
  }

  $("#velemenyek").hide().removeClass("fade show");
  $("#sajatok").hide().removeClass("fade show");

  //velemenyek tab jelenjen meg alapbol
  $("#velemenyek").addClass("show").show();
  VelemenyekMutat(termek_id);

  $("#velemenyek-tab")
    .off("click")
    .on("click", () => {
      // eloszor levesszuk a click-et majd visszarakjuk hogy ne halmozodjon
      $("#velemenyek").addClass("show").show(); // show class + megjelenites
      $("#sajatok").hide().removeClass("show"); // show class takarodj + eltuntetes
      $(".nav-link").removeClass("active"); // minden nav linkről aktiv allapot le
      $("#velemenyek-tab").addClass("active"); // ez legyen az aktiv nav-link
      VelemenyekMutat(termek_id); // velemenyek betoltese
    });

  $("#sajat-tab")
    .off("click")
    .on("click", () => {
      /* ugyanaz mint feljebb csak a "sajat velemenyek" reszre  */
      $("#sajatok").addClass("show").show();
      $("#velemenyek").hide().removeClass("show");
      $(".nav-link").removeClass("active");
      $("#sajat-tab").addClass("active");
      SajatVelemenyekMutat(termek_id);
    });

  console.log(`VelemenyekMutat(${termek_id})`);

  /*
    for (let index = 0; index < 20; index++) {
        $("#velemenyek").append(tesztgeci);
        $("#sajatok").append(`${tesztgeci} - sajat`);
    }
        */

  let gombs = `
        <button type="button" class="btn btn-warning bi bi-dice-6 w-auto ms-2" onclick='VeletlenszeruVelemeny()'> Generálás</button>
        <button type="button" class="btn btn-danger bi bi-x-lg w-auto ms-2" data-bs-toggle="collapse" data-bs-target="#vlm" id="mgs"> Mégse</button>
        <button type="button" class="btn btn-success bi bi-send w-auto ms-2" id="velemeny_kozzetesz" onclick='Velemeny_Kozzetesz(${termek_id})'> Közzététel</button>
    
    `;
  //VelemenyekMutat(termek_id);
  if (aktiv == "N" || mennyiseg == 0) alert("Ez a termek nem elerheto teso");
  else {
    if (event.target.tagName != "button") {
      // fontos, hogy ha a kosarba gombra kattintunk akkor ne a termek nyiljon meg
      $("#ga").html(gombs);

      $("#termekview").modal("show");
      cls.hide();
    }
  }
}

function VeletlenszeruVelemeny() {
  console.log(RandomVelemeny());
  $("#velemeny_input").val("");
  $("#velemeny_input").val(RandomVelemeny());
}

//endregion

//region CARDBETOLT
function CARD_BETOLT(adatok) {
  $("#content_hely").html(); 

  let ks = "";
  let s = "";
  let el = "";
  let ee = "";
  let gg = "";
  let cuccli = [];

  //if (BevanJelentkezve()) { console.log("card betolt: be van jelentkezve"); }

  for (const element of adatok.rows) {
    if (element.AKTIV == "N" || element.MENNYISEG == 0) {
      //adminoknak a nem aktiv termekek pirossal látszódjanak
      el = ` <div class="alert alert-danger">
                        A termék jelenleg nem elérhető
                    </div>
            `;

      ee = "nem-elerheto";
    } else {
      el = `<p class="p-3 d-flex justify-content-center align-items-center align-self-center"><span class="text-2xl text-emerald-600 me-2 anton-regular">${element.AR.toLocaleString()} Ft</span>(Nettó ár)</p>`;
      ee = "";
    } //Ár kiiras

    cuccli = cuccli.slice(0, 0); //cuccok tömb ürítése

    cuccli.push(
      `${element.ID_TERMEK}`,
      `${element.KATEGORIA}`,
      `${element.NEV}`,
      `${element.AZON}`,
      `${element.AR}`,
      `${element.MENNYISEG}`,
      `${element.MEEGYS}`,
      `${element.AKTIV}`,
      `${element.TERMEKLINK}`,
      `${element.FOTOLINK}`,
      `${element.LEIRAS}`,
      `${element.DATUMIDO}`,
      `${element.ID_KATEGORIA}`
    );

    if (!BevanJelentkezve() || element.AKTIV == "N" || element.MENNYISEG == 0) {
      ks = "";
    } else {
      ks = `<button 
        class="btn btn-lg 
          bg-emerald-800 
          text-zinc-200 
          hover:bg-emerald-700 
          hover:text-zinc-200 
          hover:shadow-lg 
          hover:shadow-emerald-700/70 
          transition-all duration-150 ease-in-out
          rounded-3xl 
          kosar bi bi-cart2" onclick='Kosarba_Bele(event, ${element.ID_TERMEK})'> Kosárba</button>`; //ha be van jelentkezve és elérhető a termék akkor kosár gomb
    }


    if (BevanJelentkezve() && (webbolt_admin || admin)) {
      gg = "<div class='row d-flex justify-content-center p-3'>";
      gg += `<button type="button" 
      class="btn btn-lg 
        bg-transparent 
        text-slate-900 
        hover:text-blue-400 
        dark:text-zinc-200 
        dark:hover:text-blue-400 
        transition-all duration-150 ease-in-out
        w-auto 
        me-2" aria-label="modositas" onclick='Termek_Edit(event, ${JSON.stringify(cuccli)}, "modosit")'><i class="bi bi-pencil-square"></i></button>`;
     
     
      gg += `<button type="button" 
      class="btn btn-lg 
        bg-transparent 
        text-slate-900 
        hover:text-red-700 
        dark:text-zinc-200 
        dark:hover:text-red-700 
        transition-all duration-150 ease-in-out
        w-auto" aria-label="torles" onclick='Termek_Torol(event, ${JSON.stringify(cuccli)})'><i class="bi bi-trash"></i></button>`;
      
      gg += "</div>";
    } else gg = "";

    //var cuccok = `${element.ID_TERMEK};${element.KATEGORIA};${element.NEV};${element.AZON};${element.AR};${element.MENNYISEG};${element.MEEGYS};${element.AKTIV};${element.TERMEKLINK};${element.FOTOLINK};${element.LEIRAS};${element.DATUMIDO}`.replace('"','~');

    s += `
         <div class="col-12 col-md-6 col-xxl-4">
            <div 
            class="card 
              bg-zinc-100 
              hover:bg-gray-200 
              hover:outline outline-black/10
              dark:bg-slate-900 
              dark:text-zinc-200 
              dark:hover:bg-gray-800 
              dark:hover:-outline-offset-1 
              dark:hover:outline-white/10 
              transition-hover duration-150 ease-in-out 
              transition-color duration-700 ease-in-out 
              shadow-lg 
              m-3 p-3 rounded-4 text-center ${ee}" id='${element.ID_TERMEK}' onclick='Termek_Mutat(event, ${JSON.stringify(cuccli)})'>
                <img class="card-img-top img-fluid img-thumbnail mx-auto d-block kepp" src="${element.FOTOLINK}" alt="Card image" style="width:100%">
                <div class="card-body">
                    <span class="card-title text-lg">${element.NEV} </span> <br> <span class="text-sm">(${element.KATEGORIA})</span>
                    <p class="card-text">
                        ${el}
                    </p>
                    ${ks}
                    ${gg}
                </div>
            </div>
         </div>
         `; // card feltőltése "s" sztingbe ami kébbőb be lesz szurva a html-be
  }

  if (!$("#nev1").val().includes("<")) {
    if ($("#nev1").val() != "") {
      
      $("#keresett_kifejezes").fadeOut(300, function() {
        $("#keresett_kifejezes").html(`Találatok a(z) <b>"${$("#nev1").val()}"</b> kifejezésre`).fadeIn(300);
      });

      $("#débé").fadeOut(300, function() {
        $("#débé").html(` (${adatok.maxcount} db)`).fadeIn(300);
      });
      
    } else {
      $("#keresett_kifejezes").html("");
      $("#débé").html("");
    }

    

    var pp = `
            <ul class="pagination justify-content-center">
                <li class="page-item"><a class="page-link" id="Vissza2" onclick="Kovi(this)"> << </a></li>
                <li class="page-item"><a class="page-link" id="vissza1" onclick="Kovi(this)">Előző</a></li>
                <li class="page-item"><a class="page-link d-flex"><b id="Mostoldal">1</b> / <span id="DBoldal">100</span></a></li>
                
                <li class="page-item"><a class="page-link" id="Kovi1" onclick="Kovi(this)">Következő</a></li>
                <li class="page-item"><a class="page-link" id="Kovi2" onclick="Kovi(this)"> >> </a></li>
            </ul>`;
    // alul a lapválastó feltöltése

    $("#content_hely").fadeOut(300, function() {
      $("#content_hely").html(s).fadeIn(300);
    });

    
    $("#pagi").html(pp);
    
    
  } else {
    üzen("404", "danger");
  }
}
