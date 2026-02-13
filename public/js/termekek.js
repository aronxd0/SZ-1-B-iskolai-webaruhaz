// termekek szerkesztese, torlese, uj felvetele + a betolto fuggveny

// termek modositasa MENTÉS gombra kattintaskor
async function TermekModosit(id_termek) {
  try {
    var upd = document.getElementById("idx1").innerHTML.substring(0,9) == "Új termék" ? 1 : 0;
    const fd = new FormData(document.getElementById("mod1"));

    fd.append("ID_TERMEK", id_termek);
    fd.delete("mod_aktiv"); // eloszor kitorlom az aktiv erteket akarmi is az
    fd.append("mod_aktiv", $("#mySwitch").is(":checked") ? "YES" : "NO"); // majd hozzaadom ami van h fixen benne legyen
    
    if (upd == 1) { fd.delete("ID_TERMEK"); } // uj termeknel ne legyen ID_TERMEK kuldve
    
    let termekmod = await ajax_call(`termek_edit?insert=${upd}}`, "POST", fd, true); 

    if (termekmod.message == "ok") {
      if (upd == 1) { üzen("Új termék sikeresen hozzáadva!", "success"); }
      else { üzen(`A termék (${id_termek}) sikeresen módosítva!`, "success"); }
    }
  } catch (err) { console.error(err); }
  Kezdolap(false);
  KosarTetelDB(); 
}

// termek szerkeszto ablak
async function Termek_Edit(event, termek_id, tipus) {
  event.stopPropagation();
  $("#mod_hiba").html("");
  let hiba = false;
  let nev, azon, ar, mennyiseg, meegys, aktiv, leiras, id_kategoria;

  try {
    if (termek_id != 0) {
      let ta = await ajax_call(`termek_adatok?ID_TERMEK=${termek_id}`, "GET", null, true);

      nev = ta.rows[0].NEV;
      azon = ta.rows[0].AZON;
      ar = ta.rows[0].AR;
      mennyiseg = ta.rows[0].MENNYISEG;
      meegys = ta.rows[0].MEEGYS;
      aktiv = ta.rows[0].AKTIV;
      leiras = ta.rows[0].LEIRAS;
      id_kategoria = ta.rows[0].ID_KATEGORIA;
      fotonev = ta.rows[0].FOTONEV;
    }

    $("#mod_foto").val("");

    if (tipus == "bevitel") { // új termék
      $("#idx1").html(`Új termék: `);
      $("#uj_kat").val("");
      $("#mod_kat").prop("disabled", false);
      $("#mod_nev").val("");
      $("#mod_azon").val("");
      $("#mod_ar").val(0);
      $("#mod_db").val(1);
      $("#mod_fotolink").val("");
      $("#mod_meegys").val("db");
      $("#mod_leiras").val("");
      $("#mySwitch").prop("checked", true).trigger("change"); 

      KategoriaFeltolt("mod_kat", "select", 1);

      $("#uj_kat").off("keyup").on("keyup", function () {
        let keres = $(this).val();
        if (keres != "") { $("#mod_kat").prop("disabled", true).val(""); }
        else { 
          $("#mod_kat").prop("disabled", false); 
          KategoriaFeltolt("mod_kat", "select", 1);
        }
      });

      $("#mod_nev").off("keyup").on("keyup", function() {
        let keres = $(this).val();
        $("#idx1").html(`Új termék: <b>${keres}</b>`);
      });

    } else { // szerkesztés
      $("#uj_kat").val("");
      $("#mod_kat").prop("disabled", false);
      $("#idx1").html(`Termék szerkesztés`);
      $("#mod_nev").val(nev);
      $("#mod_azon").val(azon);
      $("#mod_ar").val(ar);
      $("#mod_db").val(mennyiseg);
      $("#mod_fotolink").val(fotonev);
      $("#mod_meegys").val(meegys);
      $("#mod_leiras").val(leiras);
      $("#save_button").html(`<i class="bi bi-save2"></i>&nbsp;Mentés`); 
      $("#mod_nev").off("keyup");

      var datum = new Date();
      $("#mod_datum").val(datum.toISOString().split("T")[0]);

      KategoriaFeltolt("mod_kat", "select", id_kategoria);

      $("#uj_kat").off("keyup").on("keyup", function () {
        let a = $(this).val();
        if (a != "") { $("#mod_kat").prop("disabled", true).val(""); }
        else { 
          $("#mod_kat").prop("disabled", false); 
          KategoriaFeltolt("mod_kat", "select", id_kategoria);
        }
      });

      // ha kivalasztok kepet feltolteskor akkor ne legyen fotolink
      $("#mod_foto").off("change").on("change", function() {
        if (this.files.length > 0) { $("#mod_fotolink").val(""); } 
        else { $("#mod_fotolink").val(fotonev); }
      });

      $("#mod_fotolink").off("keyup").on("keyup", function() {
        let b = $(this).val();
        if (b != "") { $("#mod_foto").val(""); }
      });

      // switch (aktív/inaktív) állapot beállítása
      if (aktiv === "Y") {
        $("#mySwitch").prop("checked", true).trigger("change");
      } else {
        $("#mySwitch").prop("checked", false).trigger("change");
      }
    }
    
    

    $("#save_button").off().on("click", function () { 
      if ($("#mod_nev").val().includes("<") || $("#mod_nev").val().includes("%") || $("#mod_nev").val().includes("&") || $("#uj_kat").val().includes("<") || $("#uj_kat").val().includes("%") || $("#uj_kat").val().includes("&") || $("#mod_leiras").val().includes("<") || $("#mod_leiras").val().includes("%") || $("#mod_leiras").val().includes("&") || $("#mod_azon").val().includes("<") || $("#mod_azon").val().includes("%") || $("#mod_azon").val().includes("&") || $("#mod_ar").val().includes("<") || $("#mod_ar").val().includes("%") || $("#mod_ar").val().includes("&") || $("#mod_db").val().includes("<") || $("#mod_db").val().includes("%") || $("#mod_db").val().includes("&") || $("#mod_fotolink").val().includes("<") || $("#mod_fotolink").val().includes("%") || $("#mod_fotolink").val().includes("&")) {
        hiba = true;
      }
      else hiba = false;
      if (hiba) { $("#mod_hiba").html("Hibásan megadott adatok!"); }
      else {
        TermekModosit(termek_id);
        $("#termek_edit").modal("hide");
      }
     });

    $("#termek_edit").modal("show");
  } catch (err) { console.error(err); }
}

function Termek_Torol(event, termek_id) {
  event.stopPropagation();
  $("#delete_modal .modal-body").html(`Biztosan törlöd a(z) <b>${termek_id}.</b> azonosítójú terméket?<br><br>A termék örökre el fog veszni (ami hosszú idő).`);
  $("#delete_modal").off("click");
  $("#delete_modal").on("click", ".szemetes", async function () {
    try {
      var d_json = await ajax_call(`termek_del?ID_TERMEK=${termek_id}`, "DELETE", null, true);
      if (d_json.message == "ok") {
          üzen("A termék sikeresen törölve!", "success");
          KERESOBAR();
        }
    } catch (err) { console.error(err); }
  });
  $("#delete_modal").modal("show");
  KosarTetelDB();
}

// kép megnyitása teljes képernyőben
function KepMegnyitas(src) {
  document.getElementById("fsImg").src = src;
  $("#imgFullscreen").removeClass("hidden");

  // fade + scale animáció
  requestAnimationFrame(() => {
    $("#imgFullscreen").addClass("opacity-100");
    $("#fsImg").removeClass("scale-95");
    $("#fsImg").addClass("scale-100");
  });
}

// bezárás
function KepBezaras() {
  requestAnimationFrame(() => {
    $("#imgFullscreen").removeClass("opacity-100");
    $("#fsImg").removeClass("scale-100");
    $("#fsImg").addClass("scale-95");
  });
  
  setTimeout(() => {
    $("#imgFullscreen").addClass("hidden");
  }, 250);
}

// A képre ha ráviszem az egeret
function zoomMove(e, container) {
  const img = container.querySelector(".zoom-img");
  img.classList.remove("aspect-square");

  const rect = container.getBoundingClientRect();
  const x = ((e.clientX - rect.left) / rect.width) * 100;
  const y = ((e.clientY - rect.top) / rect.height) * 100;

  img.style.transformOrigin = `${x}% ${y}%`;
  img.style.transform = "scale(3)";
}

// Amikor leviszem róla
function zoomReset(container) {
  const img = container.querySelector(".zoom-img");
  img.classList.add("aspect-square");
  img.style.transformOrigin = "center center";
  img.style.transform = "scale(1)";
}

// Vélemény írás ablak megnyitása
function Velemeny_Iras(id_termek) {
  let gombs = `
      <button type="button" class="px-3 py-1 rounded-4 !border !border-transparent bg-slate-900 text-zinc-200 dark:bg-gray-800 dark:text-zinc-200 hover:text-slate-900 hover:bg-zinc-100 hover:!border-slate-900 dark:hover:bg-gray-700/70 dark:!border-zinc-200/10 dark:hover:!border-zinc-200/20 dark:hover:text-zinc-200 transition-all duration-150 ease-in-out   w-auto " onclick='VeletlenszeruVelemeny()'> 
        <i class="bi bi-dice-6"></i>
        <span class="d-none d-lg-inline"> Generálás</span>
      </button>
        
      <button type="button" class="px-3 py-1 rounded-4 !border !border-transparent bg-slate-900 text-zinc-200 dark:bg-gray-800 dark:text-zinc-200 hover:text-slate-900 hover:bg-zinc-100 hover:!border-slate-900 dark:hover:bg-gray-700/70 dark:!border-zinc-200/10 dark:hover:!border-zinc-200/20 dark:hover:text-zinc-200 transition-all duration-150 ease-in-out    w-auto ms-2" data-bs-dismiss="modal" data-bs-target="#velemeny_iras" id="mgs">
        <i class="bi bi-x-lg"></i>
        <span class="d-none d-lg-inline"> Mégse</span>
      </button>
        
      <button type="button" class="px-3 py-1 rounded-4 !border !border-transparent bg-slate-900 text-zinc-200 dark:bg-gray-800 dark:text-zinc-200 hover:text-slate-900 hover:bg-zinc-100 hover:!border-slate-900 dark:hover:bg-gray-700/70 dark:!border-zinc-200/10 dark:hover:!border-zinc-200/20 dark:hover:text-zinc-200 transition-all duration-150 ease-in-out   w-auto ms-2" id="velemeny_kozzetesz" onclick='Velemeny_Kozzetesz(${id_termek})'> 
        <i class="bi bi-send"></i>
        <span class="d-none d-lg-inline"> Közzététel</span>
      </button>
    `;
    $("#interakcio").html(gombs);
    $("#velemeny_hiba").html("");
    $("#velemeny_iras").modal("show");
}

// Termék megjelenítése
async function Termek_Mutat(event, termek_id, pushHistory = true) {
  let admingombok = "";
  let kosargomb = "";

  try {
    let termekadatok = await ajax_call(`termek_adatok?ID_TERMEK=${termek_id}`, "GET", null, true);

    const nev = termekadatok.rows[0].NEV;
    const kategoria = termekadatok.rows[0].KATEGORIA;
    const azon = termekadatok.rows[0].AZON;
    const ar = termekadatok.rows[0].AR;
    const mennyiseg = termekadatok.rows[0].MENNYISEG;
    const aktiv = termekadatok.rows[0].AKTIV;
    const meegys = termekadatok.rows[0].MEEGYS;
    const fotolink = termekadatok.rows[0].FOTOLINK; 
    const leiras = termekadatok.rows[0].LEIRAS;
    const datum = termekadatok.rows[0].DATUMIDO;

    if (!JSON.parse(localStorage.getItem("user"))?.loggedIn || aktiv == "N" || mennyiseg == 0) { kosargomb = ""; } 
    else { kosargomb = `<button class="px-6 py-2 rounded-lg !border !border-transparent bg-slate-900 text-zinc-200 dark:bg-gray-800 dark:text-zinc-200 hover:text-slate-900 hover:bg-zinc-100 hover:!border-slate-900 dark:hover:bg-gray-700/70 dark:!border-zinc-200/10 dark:hover:!border-zinc-200/20 dark:hover:text-zinc-200 transition-all duration-150 ease-in-out bi bi-plus-lg w-auto tracking-[2px]" onclick='Kosarba_Bele(event, ${termek_id})'> KOSÁRBA TESZEM </button>`; }

    $("#vlmg").html("");
    $("#ussr").html("");

    if (JSON.parse(localStorage.getItem("user"))?.loggedIn && (webbolt_admin || admin)) {
      admingombok = "";
      admingombok += `<button type="button"class="px-6 py-2 rounded-lg !border !border-transparent bg-slate-900 text-zinc-200 dark:bg-gray-800 dark:text-zinc-200 hover:text-slate-900 hover:bg-zinc-100 hover:!border-slate-900 dark:hover:bg-gray-700/70 dark:!border-zinc-200/10 dark:hover:!border-zinc-200/20 dark:hover:text-zinc-200 transition-all duration-150 ease-in-out w-full tracking-[2px]" aria-label="modositas" onclick='Termek_Edit(event, ${termek_id}, "modosit")'><i class="bi bi-pencil-square"></i> SZERKESZTÉS</button>`;
      admingombok += `<button type="button"class="px-6 py-2 rounded-lg !border !border-transparent bg-slate-900 text-zinc-200 dark:bg-gray-800 dark:text-zinc-200 dark:!border-zinc-200/10 hover:text-red-700 hover:bg-red-400/5 hover:!border-red-700 dark:hover:bg-red-900/20 dark:hover:!border-red-600/30 dark:hover:text-red-600 transition-all duration-150 ease-in-out w-full tracking-[2px]" aria-label="torles" onclick='Termek_Torol(event, ${termek_id})'><i class="bi bi-trash"></i> TÖRLÉS</button>`;
    } else admingombok = "";

    let velemenyiras_gomb = `<button class="bg-transparent text-slate-900 rounded-4 dark:bg-slate-900 dark:text-zinc-200 hover:text-gray-600 dark:hover:bg-slate-950 dark:hover:text-gray-400 transition-hover duration-300 ease-in-out w-auto" onclick="Velemeny_Iras(${termek_id})"><i class="bi bi-plus-lg"></i><span class="d-none d-sm-inline"> Vélemény írása</span></button>`;

    let velemenyek_tab = `
      <label class="group bg-transparent my-2 text-slate-900 dark:bg-slate-900 dark:text-zinc-200 hover:text-gray-600 dark:hover:text-gray-400 !border-b !border-transparent d-flex align-items-center justify-content-center p-2 text-center cursor-pointer transition-all duration-200 has-[:checked]:!border-b has-[:checked]:!border-indigo-400 dark:has-[:checked]:!border-b dark:has-[:checked]:!border-sky-700">
          <div class="flex items-center gap-2">
            <input type="radio" name="comment" class="form-check-input hidden" id="velemeny" checked onchange="VelemenyekMutat(${termek_id})">
            <i class="bi bi-chat-dots font-semibold"></i>
            <span class=" hidden group-has-[:checked]:inline group-has-[:checked]:font-semibold  sm:inline transition-all duration-200">Vélemények</span>
          </div>
      </label>`;

    let sajatvelemenyek_tab = `
      <label class="group bg-transparent my-2 text-slate-900 dark:bg-slate-900 dark:text-zinc-200 hover:text-gray-600 dark:hover:text-gray-400 !border-b !border-transparent d-flex align-items-center justify-content-center p-2 cursor-pointer transition-all duration-200 has-[:checked]:!border-b has-[:checked]:!border-indigo-400 dark:has-[:checked]:!border-b dark:has-[:checked]:!border-sky-700">
          <div class="flex items-center gap-2">
            <input type="radio" name="comment" class="form-check-input hidden " id="sajat_velemeny" onchange="SajatVelemenyekMutat(${termek_id})">
            <i class="bi bi-person"></i> 
            <span class="hidden group-has-[:checked]:inline group-has-[:checked]:font-semibold sm:inline transition-all duration-200 ">Véleményeim</span>
          </div>
      </label>`;

    let velemeny_segitseg = `
      <label class="group bg-transparent my-2 text-slate-900 dark:bg-slate-900 dark:text-zinc-200 hover:text-gray-600 dark:hover:text-gray-400 !border-b !border-transparent d-flex align-items-center justify-content-center p-2 cursor-pointer transition-all duration-200 has-[:checked]:!border-b has-[:checked]:!border-indigo-400 dark:has-[:checked]:!border-b dark:has-[:checked]:!border-sky-700">
          <div class="flex items-center gap-2">
            <button type="button" id="velemeny_help" onclick="VelemenySegitseg()">
              <i class="bi bi-question-circle"></i> 
              <span class="hidden group-has-[:checked]:inline group-has-[:checked]:font-semibold sm:inline transition-all duration-200 "> Hogyan működnek a vélemények?</span>
            </button>
          </div>
      </label>
    `;

    let termek_megtekintes = `
      <div class="container mt-3">
        <div class="row g-5">
          <div class="col-12 col-xl-7">
            <div onmousemove="zoomMove(event, this)" onmouseleave="zoomReset(this)" class="relative w-full h-[420px] lg:h-[500px] flex items-center justify-center overflow-hidden rounded-2xl overflow-hidden bg-zinc-300 dark:bg-slate-950">
              <img src="${fotolink}" alt="" class="zoom-img h-full aspect-square object-cover cursor-pointer hover:opacity-90 transition-transform duration-300 ease-out" onclick="KepMegnyitas(this.src)"/>
            </div>
          </div>
          <div class="col-12 col-xl-5">
            <div class="flex flex-col gap-4">
              <h2 class="text-2xl font-bold text-zinc-900 dark:text-zinc-100">${nev}</h2>
              <span class="text-slate-900 dark:text-zinc-200 text-lg">${parseInt(ar).toLocaleString()} Ft</span>
              <p class="text-sm text-zinc-500">Utoljára frissítve ${datum.toString().split("T")[0]}</p>
              <p class="text-zinc-600 dark:text-zinc-400">${leiras}</p>
              <div class="d-flex flex-column gap-3 mt-4">
                ${kosargomb} 
                <div class="d-flex flex-column flex-xxl-row gap-3">${admingombok}</div>
              </div>
              <div class="mt-6">
                <span class="d-flex align-items-center justify-content-start gap-x-2"><i class="bi bi-info-circle"></i> Egyéb információk:</span>
                <ul class="text-sm mt-2 text-zinc-600 dark:text-zinc-400 space-y-2 list-disc list-inside">
                  <li>Kategória: ${kategoria}</li>
                  <li>Termékazonosító: ${azon}</li>
                  <li>Raktáron: ${mennyiseg} ${meegys}</li>
                </ul>
              </div>
            </div>
          </div>
          <div class="col-12 mt-3">
            <div class="d-flex py-3 gap-x-5">
              <div id="velemenyek-menupont"></div>
              <div id="sajatvelemenyek-menupont"></div>
              <div id="velemeny-irasa" class="d-flex w-full align-items-center"></div>
              <div id="velemeny-segitseg" class="w-full d-flex align-items-center justify-content-end">${velemeny_segitseg}</div>
            </div>
            <div class="space-y-6" id="velemenyek"></div>
          </div>
        </div>
      </div>`;

      // fontos, hogy ha a kosarba gombra kattintunk akkor ne a termek nyiljon meg
      const gombraKattintas = event && event.target && event.target.tagName === "BUTTON";
      if (!gombraKattintas) {
        $("#content_hely").fadeOut(300, function() {
          $("#content_hely").html(termek_megtekintes).fadeIn(300);
          $("#velemenyek-menupont").html(velemenyek_tab);
          $("#velemenyek").html("");
          VelemenyekMutat(termek_id);
          $("#main_kontener").addClass("hidden");
          $("#content_hely").removeClass("hidden");

          if (!JSON.parse(localStorage.getItem("user"))?.loggedIn) {
            $("#velemeny-irasa").html("Vélemény írásához jelentkezzen be");
            $("#sajatvelemenyek-menupont").html("");
            $("#sajatvelemenyek-menupont").hide();
          } else {
            $("#velemeny-irasa").html(velemenyiras_gomb);
            $("#ussr").html(`${$("#user").html()}`);
        
            $("#sajatvelemenyek-menupont").html(sajatvelemenyek_tab);
        
            $("#sajatvelemenyek-menupont").show();
          }
          FelaTetore();
        });

        
        KezdolapElemekViszlat();
        $("#nezetkicsi").addClass("eltunt");
        $("#nezetnagy").addClass("eltunt");
        $("#pagi").html("");
        $("#kosar").prop("checked", false);
        $("#kezdolap").prop("checked", false);

        if (pushHistory) {
          SPAState.currentView = 'termek';
          SPAState.currentData = { id: termek_id };  
          history.pushState(
              { 
                  view: 'termek',
                  id: termek_id  
              },
              'Termék',
              `#termek/${termek_id}`
          );
        }
      }
    } catch (err) { console.error(err); }
}

function VeletlenszeruVelemeny() {
  $("#velemeny_input").val("");
  $("#velemeny_input").val(RandomVelemeny());
}

function VelemenySegitseg() { $("#velemeny_help_modal").modal("show"); }

//region CARDBETOLT
function CARD_BETOLT(adatok) {
  let kosargomb = "";
  let termekKartya = "";
  let allapotVagyAr = "";

  const kicsinezet = false;
  const nagynezet = true;

  for (const element of adatok.rows) {
    var nev_hossz = element.NEV.toString().length;
    var ppp = "";
    if (nev_hossz > 15) { ppp = "..."; } else { ppp = ""; }

    if (kicsinezet) {
      if (element.AKTIV == "N" || element.MENNYISEG == 0) { allapotVagyAr = `<span class="text-red-600 dark:text-red-400">Nem elérhető!</span>`; } 
      else { allapotVagyAr = `<p class="w-full py-2 d-flex justify-content-center align-items-center align-self-center"><span class="text-slate-900 dark:text-zinc-200 text-sm me-2 font-semibold">${element.AR.toLocaleString()} Ft</span></p>`; } 

      termekKartya += `
        <div class="col-6 col-sm-4 col-md-3 col-lg-2 px-0 !border-b !border-slate-900/10 dark:!border-b dark:!border-zinc-200/20">
          <div class="py-3 my-2 bg-zinc-200 hover:bg-gray-300 rounded-xl hover:cursor-pointer dark:bg-slate-950/95 dark:text-zinc-200 dark:hover:bg-gray-800 d-flex flex-column transition-hover duration-150 ease-in-out" id='${element.ID_TERMEK}' onclick='Termek_Mutat(event, ${element.ID_TERMEK})'>
            <div class="d-flex justify-content-center align-items-center p-2">
              <img src="${element.FOTOLINK}"class="rounded-lg w-50 h-50 aspect-square object-cover">
            </div>
          <span class="mt-4 font-semibold text-sm text-center">${element.NEV.toString().substring(0,15)}${ppp}</span>
          ${allapotVagyAr}
          </div>
        </div>`;
    }

    if (nagynezet) {
      if (element.AKTIV == "N" || element.MENNYISEG == 0) {
        allapotVagyAr = ` <span class="text-red-600 dark:text-red-400">A termék jelenleg nem elérhető!</span>`; } 
        else { allapotVagyAr = `<p class="w-full py-2 d-flex justify-content-start align-items-center align-self-center"><span class="text-slate-900 dark:text-zinc-200 me-2 font-semibold">${element.AR.toLocaleString()} Ft</span><span class="text-xs">(Nettó)</span></p>`; } 

      if (!JSON.parse(localStorage.getItem("user"))?.loggedIn || element.AKTIV == "N" || element.MENNYISEG == 0) { kosargomb = ""; } 
      else { kosargomb = `<button class="px-3 py-2 rounded-lg !border !border-transparent bg-slate-900 text-zinc-200 dark:bg-gray-800 dark:text-zinc-200 hover:text-slate-900 hover:bg-zinc-100 hover:!border-slate-900 dark:hover:bg-gray-700/70 dark:!border-zinc-200/10 dark:hover:!border-zinc-200/20 dark:hover:text-zinc-200 transition-all duration-150 ease-in-out kosar bi bi-plus-lg w-full text-sm tracking-[2px]" onclick='Kosarba_Bele(event, ${element.ID_TERMEK})'> KOSÁRBA</button>`; }

      termekKartya += `
        <div class="p-3 d-flex justify-content-center">
          <div class="rounded-xl p-4 w-72 shadow-lg bg-zinc-100 hover:bg-gray-200 hover:outline outline-black/10 hover:cursor-pointer dark:!border dark:!border-zinc-200/20 dark:bg-slate-950 dark:text-zinc-200 dark:hover:bg-sky-950/10 dark:hover:-outline-offset-1 dark:hover:outline-white/10 d-flex flex-column transition-hover duration-150 ease-in-out" id='${element.ID_TERMEK}' onclick='Termek_Mutat(event, ${element.ID_TERMEK})'>
            <div class="relative">
              <img src="${element.FOTOLINK}" class="rounded-lg w-full h-60 object-cover">
            </div>
            <h3 class="mt-4 font-semibold text-md">${element.NEV}</h3>
            <p class="text-xs text-neutral-400">${element.KATEGORIA}</p>
            ${allapotVagyAr}
            <div class="d-flex align-items-center mt-auto">
              ${kosargomb}
            </div>
          </div>
        </div>`;
    }
  }

  if (!$("#nev1").val().includes("<")) {
    
    $("#kosar").prop("checked", false);

    // ha van keresett kifejezes
    if ($("#nev1").val() != "") {
      $("#keresett_kifejezes").html(`Találatok a(z) <b>"${$("#nev1").val()}"</b> kifejezésre`);
      $("#débé").html(` (${adatok.maxcount} db)`);
      $("#kezdolap").prop("checked", false);
      KezdolapElemekViszlat();
      
    } else {
      $("#kezdolap").prop("checked", true);
      $("#keresett_kifejezes").html("");
      $("#débé").html("");
      
    }
    $("#termekek_hely").fadeOut(300, function() {
      $("#termekek_hely").html(termekKartya).fadeIn(300);
      $("#content_hely").html("");
      $("#content_hely").addClass("hidden");
      $("#main_kontener").removeClass("hidden");
    });
  } else { üzen("404", "danger"); }
}