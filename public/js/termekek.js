// termekek szerkesztese, torlese, uj felvetele + a betolto fuggveny


// termek modositasa MENT gombra kattintaskor
async function TermekModosit(url) {
  try {
    let ser = url.split("§")[0];
    let id_termek = url.split("§")[1];
    let aktiv = url.split("§")[2];
    //let uj_kategoria = url.split("§")[3];
    var upd = document.getElementById("idx1").innerHTML.substring(0,9) == "Új termék" ? 1 : 0;
    const fd = new FormData(document.getElementById("mod1"));

    fd.append("ID_TERMEK", id_termek);


    // eloszor kitorlom az aktiv erteket akarmi is az
    fd.delete("mod_aktiv");

    // majd hozzaadom ami van h fixen benne legyen
    fd.append("mod_aktiv", $("#mySwitch").is(":checked") ? "YES" : "NO");

    

  

    console.log("");
    console.log("-----------FD------------");
    for (let [key, value] of fd.entries()) {
      console.log(key, value);
    }
    console.log("-----------FD------------");
    console.log("");
    
    if (upd == 1) {
      fd.delete("ID_TERMEK"); // uj termeknel ne legyen ID_TERMEK kuldve
    }

    //console.log(`ez megy at: termek_edit?ID_TERMEK=${id_termek}&${ser}&mod_aktiv=${aktiv}`);
    console.log("az t kapod inser/ update: "  + `termek_edit?insert=${upd}}`, fd)
    let termekmod = await ajax_call(`termek_edit?insert=${upd}}`, "POST", fd, true); 
    if (termekmod.message == "ok") {

      if (upd == 1) { 
        üzen("Új termék sikeresen hozzáadva!", "success");
      }
      else { üzen(`A termék (${id_termek}) sikeresen módosítva!`, "success"); }
      
    } 
  } catch (err) {
    console.log("hiba:", err);
  }

  KERESOBAR();
  KosarTetelDB(); // kosár darab mutatása frissítése
}

// termek szerkeszto ablak
async function Termek_Edit(event, termek_id, tipus) {
  event.stopPropagation();

  $("#mod_foto").val("");

  //console.log(leiras);

  let nev, azon, ar, mennyiseg, meegys, aktiv, leiras, id_kategoria, fotolink;

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
      fotolink = ta.rows[0].FOTOLINK;
      fotonev = ta.rows[0].FOTONEV;
    }
    
    
    

    if (tipus == "bevitel") {

      $("#idx1").html(`Új termék: `);

      $("#uj_kat").val("");
      $("#mod_kat").prop("disabled", false);
      KategoriaFeltolt("mod_kat", "select", 1);
      $("#mod_nev").val("");
      $("#mod_azon").val("");
      $("#mod_ar").val(0);
      $("#mod_db").val(1);
      $("#mod_fotolink").val("");
      $("#mod_meegys").val("db");
      $("#mod_leiras").val("");
      $("#mySwitch").prop("checked", true).trigger("change"); // Default érték beállítása

      $("#uj_kat").on("keyup", function (e) {
        let keres = $(this).val();
        if (keres != "") { $("#mod_kat").prop("disabled", true).val(""); }
        else { 
          $("#mod_kat").prop("disabled", false); 
          KategoriaFeltolt("mod_kat", "select", 1);
        }
      });


      $("#mod_nev").on("keyup", function() {
        let keres = $(this).val();
        $("#idx1").html(`Új termék: <b>${keres}</b>`);
      });

    } else {
      $("#uj_kat").val("");
      $("#mod_kat").prop("disabled", false);
      KategoriaFeltolt("mod_kat", "select", id_kategoria);
      $("#idx1").html(`Termék szerkesztés`);
      $("#mod_nev").val(nev);
      $("#mod_azon").val(azon);
      $("#mod_ar").val(ar);
      $("#mod_db").val(mennyiseg);
      $("#mod_fotolink").val(fotonev);
      $("#mod_meegys").val(meegys);
      var datum = new Date();
      $("#mod_datum").val(datum.toISOString().split("T")[0]);
      $("#mod_leiras").val(leiras);
      $("#save_button").html(`<i class="bi bi-save2"></i>&nbsp;Módosítások mentése`); 

      $("#mod_nev").off("keyup");

      // ha uj kategoriat irok be akkor ne lehessen a meglevoekbol valasztani

      $("#uj_kat").on("keyup", function (e) {
        let a = $(this).val();
        if (a != "") { $("#mod_kat").prop("disabled", true).val(""); }
        else { 
          $("#mod_kat").prop("disabled", false); 
          KategoriaFeltolt("mod_kat", "select", id_kategoria);
        }
      });




      // ha kivalasztok kepet feltolteskor akkor ne legyen fotolink

      $("#mod_foto").off("change").on("change", function() {
        if (this.files.length > 0) {
          console.log("Kiválasztott fájl:", this.files[0].name);
          $("#mod_fotolink").val("");
        } else {
          console.log("Nincs semmi kiválasztva.");
          $("#mod_fotolink").val(fotonev);
        }
      });

      $("#mod_fotolink").on("keyup", function() {
        let b = $(this).val();
        if (b != "") { $("#mod_foto").val(""); }
      });

      

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
        TermekModosit(`${$("#mod1").serialize()}§${termek_id}§${aktiv}§${$("#uj_kat").val()}`);
      });

    $("#termek_edit").modal("show");


  } catch (err) { console.log("hiba:", err);}

  
}

function Termek_Torol(event, termek_id) {
  event.stopPropagation();
 console.log("bejoszssssssssssssssss" + termek_id)
  $("#delete_modal .modal-body").html(`Biztosan törlöd a(z) <b>${termek_id}.</b> azonosítójú terméket?<br><br>A termék örökre el fog veszni (ami hosszú idő).`);
  $("#delete_modal").off("click");
  $("#delete_modal").on("click", ".szemetes", async function () {
    try {
      var s = "";
      var tip = "success";
      var d_json = await ajax_call(`termek_del?ID_TERMEK=${termek_id}`, "DELETE", null, true);
      console.log(d_json);
      if (d_json.message == "ok") {
          s = "Törlés OK...";
          KERESOBAR();
        } 
        else {
          tip = "warning";
          s = `Hiba<br>${d_json.message}`;
        }
      üzen(s, tip);
    } catch (err) {
      console.log("hiba:", err);
    }
  });
  $("#delete_modal").modal("show");
  KosarTetelDB(); // kosár darab mutatása frissítése

}


function openImage(src) {
  document.getElementById("fsImg").src = src;
  $("#imgFullscreen").removeClass("hidden");


  // fade + scale animáció
  requestAnimationFrame(() => {
    $("#imgFullscreen").addClass("opacity-100");
    $("#fsImg").removeClass("scale-95");
    $("#fsImg").addClass("scale-100");
  });
}

function closeImage() {
  
  requestAnimationFrame(() => {
    $("#imgFullscreen").removeClass("opacity-100");
    $("#fsImg").removeClass("scale-100");
    $("#fsImg").addClass("scale-95");

  });
  

  setTimeout(() => {
    $("#imgFullscreen").addClass("hidden");
  }, 250);
}


function zoomMove(e, container) {
  const img = container.querySelector(".zoom-img");
  img.classList.remove("aspect-square");
  

  const rect = container.getBoundingClientRect();
  const x = ((e.clientX - rect.left) / rect.width) * 100;
  const y = ((e.clientY - rect.top) / rect.height) * 100;

  img.style.transformOrigin = `${x}% ${y}%`;
  img.style.transform = "scale(3)";
}

function zoomReset(container) {
  const img = container.querySelector(".zoom-img");
  img.classList.add("aspect-square");

  img.style.transformOrigin = "center center";
  img.style.transform = "scale(1)";
}




function Velemeny_Iras(id_termek) {
  let gombs = `
        <button type="button" 
        class="
        btn 
        bg-zinc-600 
      text-zinc-200 
      rounded-4 
      dark:bg-slate-900 
      dark:text-zinc-200 
      hover:bg-zinc-700 
      hover:text-zinc-200 
      dark:hover:bg-slate-950 
      dark:hover:text-zinc-200
      transition-hover duration-300 ease-in-out   w-auto " onclick='VeletlenszeruVelemeny()'> 
      <i class="bi bi-dice-6"></i>
      <span class="d-none d-lg-inline"> Generálás</span>
      </button>
        
        <button type="button" 
        class="
        btn bg-zinc-600 
      text-zinc-200 
      rounded-4 
      dark:bg-slate-900 
      dark:text-zinc-200 
      hover:bg-zinc-700 
      hover:text-zinc-200 
      dark:hover:bg-slate-950 
      dark:hover:text-zinc-200
      transition-hover duration-300 ease-in-out   w-auto ms-2" data-bs-dismiss="modal" data-bs-target="#velemeny_iras" id="mgs">
      <i class="bi bi-x-lg"></i>
      <span class="d-none d-lg-inline"> Mégse</span>
      </button>
        
        <button type="button" 
        class="
        btn bg-zinc-600 
      text-zinc-200 
      rounded-4 
      dark:bg-slate-900 
      dark:text-zinc-200 
      hover:bg-zinc-700 
      hover:text-zinc-200 
      dark:hover:bg-slate-950 
      dark:hover:text-zinc-200
      transition-hover duration-300 ease-in-out   w-auto ms-2" id="velemeny_kozzetesz" onclick='Velemeny_Kozzetesz(${id_termek})'> 
      <i class="bi bi-send"></i>
      <span class="d-none d-lg-inline"> Közzététel</span>
      </button>
    
    `;

    $("#interakcio").html(gombs);

    $("#velemeny_iras").modal("show");
}




async function Termek_Mutat(event, termek_id) {
  $("#lenti").fadeIn(300);
  $("#termekview").modal("hide");
  //console.log(`cuccok: ${cuccok}`);


  $("#ga").html("");
  /*
    for (let index = 0; index < 100; index++) {
        $("#termek_content").append(cuccok + "<br>");
        
    }*/
  let gg = "";
  let ks = "";


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


    if (!JSON.parse(localStorage.getItem("user"))?.loggedIn || aktiv == "N" || mennyiseg == 0) {
    ks = "";
    } else
    ks = `<button 
        class="px-6 py-2 rounded-xl 
          bg-gray-900 
          text-zinc-200 
          hover:bg-gray-700 
          hover:text-zinc-200 
          dark:bg-zinc-800 
          dark:hover:bg-zinc-700 
          transition-all duration-150 ease-in-out 
          rounded-lg  
          kosar bi bi-plus-lg  
           w-auto  tracking-[2px]  
          " onclick='Kosarba_Bele(event, ${termek_id})'> KOSÁRBA TESZEM </button>`;

  let bal = ` 


    <div class="relative d-flex align-items-center justify-content-center p-5">
      <img src="${fotolink}" 
          class="w-full h-60 rounded-xl object-cover cursor-pointer hover:opacity-90 transition"
          onclick="openImage(this.src)">
    </div>
               
    `;

  let kozep = `   <div class="row mt-2">
                        <b class="text-lg"><i class="bi bi-card-list"></i> Termékleírás:</b>
                        <br>
                        <p>${leiras}</p>
                    </div>
    
                    <div class="row mt-3">
                        <p>
                            <b class="text-lg"><i class="bi bi-grid"></i> Kategória: </b> ${kategoria}
                        </p>
                    </div>
    
                    <div class="row mt-3">
                        <p>
                            <b class="text-lg"><i class="bi bi-hash"></i> Termékazonosító: </b> <span class="tracking-4">${azon}</span>
                        </p>
                    </div>
                    <div class="row mt-3">
                        <p> 
                            <b class="text-lg"><i class="bi bi-box-seam"></i> Raktáron: </b> ${mennyiseg} ${meegys}
                        </p>
                    </div>
                    <div class="row mt-5 mb-3">
                        <span class="text-slate-900 dark:text-zinc-200 text-2xl font-semibold">${parseInt(ar).toLocaleString()} Ft</span>
                    </div>

                    
    
    `;

  //$("#bal").html(bal);
  //$("#jobb").html(kozep);
  $("#alul").html(ks);

  $("#termek_content").html(`

    <div class="col-lg-6 d-flex justify-content-center p-1" id="bal">
      ${bal}
    </div>
    <div class="col-lg-6 p-2" id="jobb">
      ${kozep}
    </div>  
    
    
  `);

  $("#termeknev").html(nev);

  //const cls = new bootstrap.Collapse("#vlm", { toggle: false });

  $("#vlmg").html("");
  $("#ussr").html("");



    if (JSON.parse(localStorage.getItem("user"))?.loggedIn && (webbolt_admin || admin)) {
      gg = "";
      gg += `<button type="button" 
      class="px-6 py-2 rounded-xl 
          bg-gray-900 
          text-zinc-200 
          hover:bg-gray-700 
          hover:text-zinc-200 
          dark:bg-zinc-800 
          dark:hover:bg-zinc-700 
          transition-all duration-150 ease-in-out 
          rounded-lg  
           
           w-full  tracking-[2px] " aria-label="modositas" onclick='Termek_Edit(event, ${termek_id}, "modosit")'><i class="bi bi-pencil-square"></i> SZERKESZTÉS</button>`;
     
     
      gg += `<button type="button" 
      class="px-6 py-2 rounded-xl 
          bg-gray-900 
          text-zinc-200 
          hover:bg-gray-700 
          hover:text-red-600 
          dark:bg-zinc-800 
          dark:hover:bg-zinc-700 
          dark:hover:text-red-600 
          transition-all duration-150 ease-in-out 
          rounded-lg  
            
           w-full  tracking-[2px] 
        " aria-label="torles" onclick='Termek_Torol(event, ${termek_id})'><i class="bi bi-trash"></i> TÖRLÉS</button>`;
      
      gg += "";
    } else gg = "";



    let velemenyiras_gomb = `
      <button 
      class=" 
       
      bg-transparent  
      text-slate-900 
      rounded-4 
      dark:bg-slate-900 
      dark:text-zinc-200 
      hover:text-gray-600 
      dark:hover:bg-slate-950 
      dark:hover:text-zinc-200
      transition-hover duration-300 ease-in-out 
        w-auto" onclick="Velemeny_Iras(${termek_id})"> 
        <i class="bi bi-plus-lg"></i>
        <span class="d-none d-sm-inline">Vélemény írása</span>
        </button>`



    let velemenyek_tab = `
          <label 
          class="
          group 
          bg-transparent 
          my-2 
          text-slate-900 
          dark:bg-slate-900 
          dark:text-zinc-200 
          hover:text-gray-600 
          dark:hover:text-gray-400 
          
          d-flex align-items-center justify-content-center p-2 text-center cursor-pointer 
              transition-all duration-200
              
              has-[:checked]:!border-b 
              has-[:checked]:!border-indigo-400 
              
              
              dark:has-[:checked]:!border-b
              dark:has-[:checked]:!border-sky-700 ">

          <div class="flex items-center gap-2">
            <input type="radio" name="comment" class="form-check-input hidden" id="velemeny" checked onchange="VelemenyekMutat(${termek_id})">
            <i class="bi bi-chat-dots font-semibold"></i>
            <span class=" hidden group-has-[:checked]:inline group-has-[:checked]:font-semibold  sm:inline transition-all duration-200">Vélemények</span>
          </div>

          
      </label>
    
    `

    let sajatvelemenyek_tab = `
        <label 
          class="
          group 
          bg-transparent 
          my-2 
          text-slate-900 
          
          dark:bg-slate-900 
          dark:text-zinc-200 
          hover:text-gray-600 
          dark:hover:text-gray-400 
          
          
          d-flex align-items-center justify-content-center p-2  cursor-pointer 
              transition-all duration-200
              has-[:checked]:!border-b  
              has-[:checked]:!border-indigo-400 

              dark:has-[:checked]:!border-b
              dark:has-[:checked]:!border-sky-700
              ">
              

          <div class="flex items-center gap-2">
            <input type="radio" name="comment" class="form-check-input hidden " id="sajat_velemeny" onchange="SajatVelemenyekMutat(${termek_id})">
            <i class="bi bi-person"></i> 
            <span class="hidden group-has-[:checked]:inline group-has-[:checked]:font-semibold sm:inline transition-all duration-200 ">Véleményeim</span>
          </div>

          
      </label>`;


  



  

  

  




    let termek_megtekintes = `
    
      <div class="container my-1">
        <button class="p-2 my-3" onclick="KERESOBAR()"><i class="bi bi-caret-left-fill" ></i> Inkább böngészek tovább</button>
        <div class="row g-5">
          <div class="col-12 col-xl-7">
            <div onmousemove="zoomMove(event, this)" onmouseleave="zoomReset(this)" class="relative w-full h-[420px] lg:h-[500px] flex items-center justify-center overflow-hidden rounded-2xl overflow-hidden bg-zinc-300 dark:bg-slate-950">
              <img src="${fotolink}" alt="" class="zoom-img h-full aspect-square object-cover cursor-pointer hover:opacity-90 transition-transform duration-300 ease-out" onclick="openImage(this.src)"/>
            </div>
          </div>

          <div class="col-12 col-xl-5">
            <div class="flex flex-col gap-4">

              

              
              <h2 class="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                ${nev}
              </h2>

              <span class="text-slate-900 dark:text-zinc-200 text-lg">${parseInt(ar).toLocaleString()} Ft</span>

             
              <p class="text-sm text-zinc-500">
                Utoljára frissítve ${datum.toString().split("T")[0]}
              </p>

              
              <p class="text-zinc-600 dark:text-zinc-400">
                ${leiras}
              </p>

              
              <div class="d-flex flex-column gap-3 mt-4">
                ${ks} 
                <div class="d-flex flex-column flex-xxl-row gap-3">${gg}</div>
                
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
              <div id="vvl"></div>
              <div id="sajatvlm"></div>
              <div id="vlmg" class="d-flex align-items-center"></div>
            </div>

            <div class="space-y-6" id="velemenyek">

              <!-- 
              <div class="!border-b !border-gray-300 pb-4">
                <div class="flex items-center gap-3 mb-2">
                  <i class="bi bi-person-circle text-3xl"></i>
                  <div>
                    <p class="font-semibold">Emily Selman</p>
                    <p class="text-xs text-zinc-500">July 16, 2021</p>
                  </div>
                </div>
                <p class="text-zinc-600 dark:text-zinc-400">
                  Love the playful look! Exactly what I needed for my project.
                </p>
              </div>

              
              <div class="!border-b !border-gray-300 pb-4">
                <div class="flex items-center gap-3 mb-2">
                  <i class="bi bi-person-circle text-3xl"></i>
                  <div>
                    <p class="font-semibold">Hector Gibbons</p>
                    <p class="text-xs text-zinc-500">July 12, 2021</p>
                  </div>
                </div>
                <p class="text-zinc-600 dark:text-zinc-400">
                  Super polished icons, worth every cent.
                </p>
              </div>
              -->

            </div>
          </div>
        
        </div>
      
      
      
      
      
      </div>
    
    `;


















      

    if (aktiv == "N" || mennyiseg == 0) alert("Ez a termek nem elerheto teso");
    else {
      if (event.target.tagName != "button") {
        // fontos, hogy ha a kosarba gombra kattintunk akkor ne a termek nyiljon meg
        $("#welcome_section").fadeOut(300);
        $("#pagi").html("");
        $("#kategoria_carousel").fadeOut(300);
        //$("#termekview").modal("show");
        $("#content_hely").fadeOut(300, function() {
          $("#content_hely").html(termek_megtekintes).fadeIn(300);
          $("#vvl").html(velemenyek_tab);
          $("#velemenyek").html("");
          VelemenyekMutat(termek_id);
          $("#nezetkicsi").addClass("eltunt");
          $("#nezetnagy").addClass("eltunt");

          if (!JSON.parse(localStorage.getItem("user"))?.loggedIn) {
            $("#vlmg").html("Vélemény írásához jelentkezzen be");
            $("#sajatvlm").html("");
            $("#sajatvlm").addClass("eltunt");
          } else {
            $("#vlmg").html(velemenyiras_gomb);
            $("#ussr").html(`${$("#user").html()}`);
        
            $("#sajatvlm").html(sajatvelemenyek_tab);
        
            $("#sajatvlm").removeClass("eltunt");
          }
          FelaTetore();

        });


        


        
      }
    }
    


  } catch (err) { console.log("hiba:", err); }


  
  //VelemenyekMutat(termek_id);
  
}

function VeletlenszeruVelemeny() {
  console.log(RandomVelemeny());
  $("#velemeny_input").val("");
  $("#velemeny_input").val(RandomVelemeny());
}

//endregion

//region CARDBETOLT
function CARD_BETOLT(adatok) {
   
  

  let ks = "";
  let s = "";
  let el = "";
  let ee = "";
  let gg = "";
  const kicsinezet = document.getElementById("kicsi_nezet").checked;
  const nagynezet = document.getElementById("nagy_nezet").checked;

  //if (BevanJelentkezve()) { console.log("card betolt: be van jelentkezve"); }

  for (const element of adatok.rows) {
    

  

    


    



    
    var nev_hossz = element.NEV.toString().length;
    var ppp = "";

    if (nev_hossz > 15) { ppp = "..."; } else { ppp = ""; }

    if (kicsinezet) {

      if (element.AKTIV == "N" || element.MENNYISEG == 0) {
        //adminoknak a nem aktiv termekek pirossal látszódjanak
        el = ` <div class="alert alert-danger">
                          A termék jelenleg nem elérhető
                      </div>
              `;
  
        ee = "nem-elerheto";
      } else {
        el = `<p class="w-full py-2 d-flex justify-content-center align-items-center align-self-center"><span class="text-slate-900 dark:text-zinc-200 text-sm me-2 font-semibold">${element.AR.toLocaleString()} Ft</span></p>`;
        ee = "";
      } 

      if (!JSON.parse(localStorage.getItem("user"))?.loggedIn || element.AKTIV == "N" || element.MENNYISEG == 0) {
        ks = "";
      } else {
        ks = `<button 
          class="btn 
            bg-gray-900 
            text-zinc-200 
            hover:bg-gray-700 
            hover:text-zinc-200 
            dark:bg-zinc-800 
            dark:hover:bg-zinc-700 
            transition-all duration-150 ease-in-out 
            rounded-xl 
            kosar    
              py-2 px-3 text-sm tracking-wider    
            " onclick='Kosarba_Bele(event, ${element.ID_TERMEK})'><i class="bi bi-plus-lg"></i></button>`; //ha be van jelentkezve és elérhető a termék akkor kosár gomb
      }


      s += `
        <div class="col-6 col-sm-4 col-md-3 col-lg-2 px-0 !border-b !border-slate-900/10 dark:!border-b dark:!border-zinc-200/20 ">
        <div 
        class="
        py-3 
        my-2 
        bg-zinc-200   
        hover:bg-gray-300 
        rounded-xl 
        hover:cursor-pointer 
        
        dark:bg-slate-900  
        dark:text-zinc-200 
        dark:hover:bg-gray-800 
        
        d-flex flex-column 
        transition-hover duration-150 ease-in-out 
        " id='${element.ID_TERMEK}' onclick='Termek_Mutat(event, ${element.ID_TERMEK})'>

          <div class="d-flex justify-content-center align-items-center p-2">
            <img 
              src="${element.FOTOLINK}"
              class="rounded-lg w-50 h-50 aspect-square object-cover"
            >
            
            
          </div>

          <span class="mt-4 font-semibold text-sm text-center">${element.NEV.toString().substring(0,15)}${ppp}</span>
          
          ${el}
          
          <div class="d-flex align-items-center justify-content-center">${ks} ${gg}</div>
          
          

        </div>
        </div>
      `;
    }

    

    if (nagynezet) {

      if (element.AKTIV == "N" || element.MENNYISEG == 0) {
        //adminoknak a nem aktiv termekek pirossal látszódjanak
        el = ` <div class="alert alert-danger">
                          A termék jelenleg nem elérhető
                      </div>
              `;
  
        ee = "nem-elerheto";
      } else {
        el = `<p class="w-full py-2 d-flex justify-content-start align-items-center align-self-center"><span class="text-slate-900 dark:text-zinc-200 me-2 font-semibold">${element.AR.toLocaleString()} Ft</span><span class="text-xs">(Nettó)</span></p>`;
        ee = "";
      } 

      if (!JSON.parse(localStorage.getItem("user"))?.loggedIn || element.AKTIV == "N" || element.MENNYISEG == 0) {
        ks = "";
      } else {
        ks = `<button 
          class="btn 
            bg-gray-900 
            text-zinc-200 
            hover:bg-gray-700 
            hover:text-zinc-200 
            dark:bg-zinc-800 
            dark:hover:bg-zinc-700 
            transition-all duration-150 ease-in-out 
            rounded-xl 
            kosar bi bi-plus-lg   
             w-full p-2 text-sm tracking-wider    
            " onclick='Kosarba_Bele(event, ${element.ID_TERMEK})'> KOSÁRBA</button>`; //ha be van jelentkezve és elérhető a termék akkor kosár gomb
      }


      s += `
        <div class="col-12 col-sm-6 col-lg-4 col-xxl-3 p-3 d-flex justify-content-center  ">
          <div 
          class="
          rounded-xl 
          p-4 
          w-72 
          shadow-lg
          
          bg-zinc-100 
          hover:bg-gray-200 
          hover:outline outline-black/10 
          hover:cursor-pointer 
          dark:!border 
          dark:!border-zinc-200/20 
          dark:bg-slate-950 
          dark:text-zinc-200 
          dark:hover:bg-gray-800 
          dark:hover:-outline-offset-1 
          dark:hover:outline-white/10 
          d-flex flex-column 
          transition-hover duration-150 ease-in-out 
          " id='${element.ID_TERMEK}' onclick='Termek_Mutat(event, ${element.ID_TERMEK})'>

            <div class="relative">
              <img 
                src="${element.FOTOLINK}"
                class="rounded-lg w-full h-60 object-cover"
              >
              
              
            </div>

            <h3 class="mt-4 font-semibold text-md">${element.NEV}</h3>
            <p class="text-sm text-neutral-400">${element.KATEGORIA}</p>
            
            ${el}
            
            <div class="d-flex align-items-center mt-auto">
            ${ks} ${gg}
            </div>
            <!--
            <button
              class="w-full mt-4 bg-neutral-800 hover:bg-neutral-700 transition rounded-lg py-3 text-center"
            >
              Add to bag
            </button>
            -->

          </div>

        </div>


      `;
    }
  }

  if (!$("#nev1").val().includes("<")) {
    if ($("#nev1").val() != "") {
      $("#welcome_section").fadeOut(300);
      $("#keresett_kifejezes").fadeOut(300, function() {
        $("#keresett_kifejezes").html(`Találatok a(z) <b>"${$("#nev1").val()}"</b> kifejezésre`).fadeIn(300);
      });
      $("#felsosor").addClass("mt-[100px]");
      $("#kateogoria-carousel").fadeOut(300);

      $("#débé").fadeOut(300, function() {
        $("#débé").html(` (${adatok.maxcount} db)`).fadeIn(300);
      });
      
    } else {
      $("#keresett_kifejezes").html("");
      $("#débé").html("");
      $("#welcome_section").fadeIn(300);
      $("#kateogoria-carousel").fadeIn(300);
      
    }

    console.log(`card betolt: ${localStorage.getItem("loggedIn")}`);

    $("#content_hely").fadeOut(300, function() {
      $("#content_hely").html(s).fadeIn(300);
    });
    OLDALFELTOTL();
    
 
    
  } else {
    üzen("404", "danger");
  }
}
