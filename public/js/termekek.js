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
    let termekmod = await ajax_post_formdata(`termek_edit?insert=${upd}}`, fd); 
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
async function Termek_Edit(event, termek_id, tipus) {
  event.stopPropagation();

  $("#mod_foto").val("");

  //console.log(leiras);

  let nev, azon, ar, mennyiseg, meegys, aktiv, leiras, id_kategoria, fotolink;

  try {

    if (termek_id != 0) {
      let ta = await ajax_post(`termek_adatok?ID_TERMEK=${termek_id}`, 1);

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


      $("#mod_nev").on("keyup", function(e) {
        let keres = $(this).val();
        $("#idx1").html(`Új termék: <b>${keres}</b>`);
      });

    } else {
      $("#uj_kat").val("");
      $("#mod_kat").prop("disabled", false);
      KategoriaFeltolt("mod_kat", "select", id_kategoria);
      $("#idx1").html(`${termek_id}; ${nev}`);
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

function Termek_Torol(event, cuccok) {
  event.stopPropagation();
  const termek_id = cuccok[0];
 console.log("bejoszssssssssssssssss" + termek_id)
  $("#delete_modal .modal-body").html(`Biztosan törlöd a(z) <b>${termek_id}.</b> azonosítójú terméket?<br><br>A termék örökre el fog veszni (ami hosszú idő).`);
  $("#delete_modal").off("click");
  $("#delete_modal").on("click", ".szemetes", async function () {
    try {
      var s = "";
      var tip = "success";
      var d_json = await ajax_post(`termek_del?ID_TERMEK=${termek_id}`, 1);
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





function KepNagyban(termek_id, fotolink) {
  $("#termek_content").fadeOut(300, function() {
    $("#lenti").fadeOut(300);
    $("#termek_content").html(`
      <button class="btn bg-zinc-200 text-slate-900 dark:bg-slate-800 dark:text-zinc-200 p-2 "><i class="bi bi-arrow-left"></i></button>
      <div 
          class="
            relative
            d-flex 
            align-items-center 
            justify-content-center 
            p-5 
            w-100 
            ">


      
            <img 
              src="${fotolink}"
              class="rounded-lg w-full h-full hover:outline outline-black/10 hover:cursor-pointer dark:hover:-outline-offset-1 dark:hover:outline-white/10 "
             
              >
          
            
          </div>`);
      
  }).fadeIn(300);
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







async function Termek_Mutat(event, termek_id) {
  $("#lenti").fadeIn(300);
  $("#termekview").modal("hide");
  //console.log(`cuccok: ${cuccok}`);

  /*
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
  */

  $("#ga").html("");
  /*
    for (let index = 0; index < 100; index++) {
        $("#termek_content").append(cuccok + "<br>");
        
    }*/
  let ks = "";


  try {



    let termekadatok = await ajax_post(`termek_adatok?ID_TERMEK=${termek_id}`, 1);

    
    const nev = termekadatok.rows[0].NEV;
    const kategoria = termekadatok.rows[0].KATEGORIA;
    const azon = termekadatok.rows[0].AZON;
    const ar = termekadatok.rows[0].AR;
    const mennyiseg = termekadatok.rows[0].MENNYISEG;
    const aktiv = termekadatok.rows[0].AKTIV;
    const meegys = termekadatok.rows[0].MEEGYS;
    const fotolink = termekadatok.rows[0].FOTOLINK; 
    const leiras = termekadatok.rows[0].LEIRAS;


    if (localStorage.getItem("loggedIn") !== "1" || aktiv == "N" || mennyiseg == 0) {
    ks = "";
    } else
    ks = `<button 
        class="btn btn-lg 
          bg-gray-900 
          text-zinc-200 
          hover:bg-gray-700 
          hover:text-zinc-200 
          dark:bg-zinc-800 
          dark:hover:bg-zinc-700 
          transition-all duration-150 ease-in-out 
          rounded-xl 
          kosar bi bi-plus  
           w-auto p-2 
          " onclick='Kosarba_Bele(event, ${termek_id})'> Kosárba</button>`;

  let bal = ` 


    <div class="relative d-flex align-items-center justify-content-center p-5">
      <img src="${fotolink}" 
          class="w-full h-60 rounded-xl object-cover cursor-pointer hover:opacity-90 transition"
          onclick="openImage(this.src)">
    </div>
          
      <!-- kep teljes kepernyo overlay -->
      <div id="imgFullscreen" 
          class="fixed inset-0 bg-black/80 hidden z-50 transition-opacity duration-300 opacity-0">
      
        <div class="d-flex justify-content-center align-items-center h-full w-full">
          <img id="fsImg" class="max-w-[90%] max-h-[90%] rounded-xl shadow-2xl transition-all duration-300">
        </div>
        
        <button onclick="closeImage()" 
                class="absolute top-6 right-6 text-white text-3xl font-bold">
          ✕
        </button>
      </div>






        <!--

          <div 
          class="
            relative
            d-flex 
            align-items-center 
            
            
            ">


      
            <img 
              src="${fotolink}"
              class="rounded-lg w-full h-60 object-cover hover:outline outline-black/10 hover:cursor-pointer dark:hover:-outline-offset-1 dark:hover:outline-white/10 "
             onclick="KepNagyban(${termek_id}, '${fotolink}')"
              >
          
            
          </div>
              
          -->
                
                
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
                        <span class="text-success text-4xl anton-regular">${parseInt(ar).toLocaleString()} Ft</span>
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

  const cls = new bootstrap.Collapse("#vlm", { toggle: false });

  $("#vlmg").html("");
  $("#ussr").html("");


  $("#vvl").html(`
    
      
          <label 
              class="bg-zinc-50 
              my-2 
              text-slate-900 
              shadow-xl 
              dark:bg-slate-900 
              dark:text-zinc-200 
              hover:bg-gray-200 
              hover:outline outline-black/10 
              dark:hover:bg-gray-700 
              dark:hover:-outline-offset-1 
              dark:hover:outline-white/10 
              d-flex align-items-center justify-content-center p-1 text-center rounded-xl cursor-pointer 
                  transition-all duration-200
                  has-[:checked]:bg-indigo-100 
                  has-[:checked]:border-indigo-400 
                  has-[:checked]:border 
                  has-[:checked]:shadow-md

                  dark:has-[:checked]:bg-sky-950
                  dark:has-[:checked]:border-sky-700
                  dark:has-[:checked]:border ">

              <div class="flex items-center gap-3">
              <input type="radio" name="comment" class="form-check-input hidden" id="velemeny" checked onchange="VelemenyekMutat(${termek_id})">
              <span class="font-semibold"><i class="bi bi-chat-dots"></i> Vélemények</span>
              </div>

              <div class="flex flex-col text-right">
              
              </div>
          </label>
                

    
    `);


  

  if (localStorage.getItem("loggedIn") !== "1") {
    $("#vlmg").html("Vélemény írásához jelentkezzen be");
    cls.hide();
    $("#sajatvlm").html("");
    $("#sajatvlm").addClass("eltunt");
  } else {
    $("#vlmg").html(
      `<button 
      class="
      btn 
      
      bi bi-pen 
      bg-zinc-600 
      text-zinc-200 
      rounded-4 
      dark:bg-slate-900 
      dark:text-zinc-200 
      hover:bg-zinc-700 
      hover:text-zinc-200 
      dark:hover:bg-slate-950 
      dark:hover:text-zinc-200
      transition-hover duration-300 ease-in-out 
        w-auto" data-bs-toggle="collapse" data-bs-target="#vlm"> Vélemény írása</button>`
    );
    $("#ussr").html(`${$("#user").html()}`);

    $("#sajatvlm").html(
      `
            <label 
              class="bg-zinc-50 
              my-2 
              text-slate-900 
              shadow-xl 
              dark:bg-slate-900 
              dark:text-zinc-200 
              hover:bg-gray-200 
              hover:outline outline-black/10 
              dark:hover:bg-gray-700 
              dark:hover:-outline-offset-1 
              dark:hover:outline-white/10 
              d-flex align-items-center justify-content-center p-1  rounded-xl cursor-pointer 
                  transition-all duration-200
                  has-[:checked]:bg-indigo-100 
                  has-[:checked]:border-indigo-400 
                  has-[:checked]:border 
                  has-[:checked]:shadow-md

                  dark:has-[:checked]:bg-sky-950
                  dark:has-[:checked]:border-sky-700
                  dark:has-[:checked]:border ">

              <div class="flex items-center gap-3">
              <input type="radio" name="comment" class="form-check-input hidden " id="sajat_velemeny" onchange="SajatVelemenyekMutat(${termek_id})">
              <span class="font-semibold"><i class="bi bi-person"></i> Véleményeim</span>
              </div>

              <div class="flex flex-col text-right">
              
              </div>
          </label>`
    );

    $("#sajatvlm").removeClass("eltunt");
  }

  $("#velemenyek").html("");
  VelemenyekMutat(termek_id);

  

  console.log(`VelemenyekMutat(${termek_id})`);

  /*
    for (let index = 0; index < 20; index++) {
        $("#velemenyek").append(tesztgeci);
        $("#sajatok").append(`${tesztgeci} - sajat`);
    }
        */

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
      transition-hover duration-300 ease-in-out   w-auto ms-2" data-bs-toggle="collapse" data-bs-target="#vlm" id="mgs">
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
      transition-hover duration-300 ease-in-out   w-auto ms-2" id="velemeny_kozzetesz" onclick='Velemeny_Kozzetesz(${termek_id})'> 
      <i class="bi bi-send"></i>
      <span class="d-none d-lg-inline"> Közzététel</span>
      </button>
    
    `;
      

    if (aktiv == "N" || mennyiseg == 0) alert("Ez a termek nem elerheto teso");
    else {
      if (event.target.tagName != "button") {
        // fontos, hogy ha a kosarba gombra kattintunk akkor ne a termek nyiljon meg
        $("#ga").html(gombs);

        $("#termekview").modal("show");
        cls.hide();
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
      el = `<p class="w-full py-2 d-flex justify-content-start align-items-center align-self-center"><span class="text-emerald-600 me-2 anton-regular">${element.AR.toLocaleString()} Ft</span><span class="text-xs">(Nettó)</span></p>`;
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

    if (localStorage.getItem("loggedIn") !== "1" || element.AKTIV == "N" || element.MENNYISEG == 0) {
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
          kosar bi bi-plus  
           w-full p-2 
          " onclick='Kosarba_Bele(event, ${element.ID_TERMEK})'> Kosárba</button>`; //ha be van jelentkezve és elérhető a termék akkor kosár gomb
    }


    if (localStorage.getItem("loggedIn") === "1" && (webbolt_admin || admin)) {
      gg = "";
      gg += `<button type="button" 
      class="btn  
        bg-transparent 
        text-slate-900 
        hover:text-blue-400 
        dark:text-zinc-200 
        dark:hover:text-blue-400 
        transition-all duration-150 ease-in-out 
        
        me-1" aria-label="modositas" onclick='Termek_Edit(event, ${element.ID_TERMEK}, "modosit")'><i class="bi bi-pencil-square"></i></button>`;
     
     
      gg += `<button type="button" 
      class="btn  
        bg-transparent 
        text-slate-900 
        hover:text-red-700 
        dark:text-zinc-200 
        dark:hover:text-red-700 
        transition-all duration-150 ease-in-out 
        " aria-label="torles" onclick='Termek_Torol(event, ${JSON.stringify(cuccli)})'><i class="bi bi-trash"></i></button>`;
      
      gg += "";
    } else gg = "";

    //var cuccok = `${element.ID_TERMEK};${element.KATEGORIA};${element.NEV};${element.AZON};${element.AR};${element.MENNYISEG};${element.MEEGYS};${element.AKTIV};${element.TERMEKLINK};${element.FOTOLINK};${element.LEIRAS};${element.DATUMIDO}`.replace('"','~');

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





      <!--
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
              
              shadow-lg 
              m-3 p-3 rounded-4 text-center ${ee}" id='${element.ID_TERMEK}' onclick='Termek_Mutat(event, ${element.ID_TERMEK})'>
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
         -->
         `; // card feltőltése "s" sztingbe ami kébbőb be lesz szurva a html-be
  }

  if (!$("#nev1").val().includes("<")) {
    if ($("#nev1").val() != "") {
      $("#welcome_section").fadeOut(300);
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

    console.log(`card betolt: ${localStorage.getItem("loggedIn")}`);

    var pp = `
            <ul class="pagination justify-content-center">
                <li class="page-item  shadow-xl" style="border: none;">
                    <a class="
                        page-link 
                        bg-zinc-300 
                        text-slate-900 
                         dark:bg-slate-900 
                        dark:text-zinc-200 
                        dark:hover:bg-gray-800 
                        
                        hover:bg-gray-200 
                        hover:outline outline-black/10 
                        hover:text-slate-900 
                        transition-hover duration-300 ease-in-out 
                        " id="Vissza2" onclick="Kovi(this)"> << </a></li>
                <li class="page-item  shadow-xl">
                    <a class="
                        page-link 
                        bg-zinc-300 
                        text-slate-900 
                         dark:bg-slate-900 
                        dark:text-zinc-200 
                        dark:hover:bg-gray-800 
                        
                        hover:bg-gray-200 
                        hover:outline outline-black/10 
                        hover:text-slate-900 
                        transition-hover duration-300 ease-in-out 
                        " id="vissza1" onclick="Kovi(this)">Előző</a></li>
                <li class="page-item shadow-xl">
                    <a class="
                        page-link 
                        d-flex 
                        bg-zinc-300 
                        text-slate-900 
                         dark:bg-slate-900 
                        dark:text-zinc-200 
                        dark:hover:bg-gray-800 
                        
                        hover:bg-gray-200 
                        hover:outline outline-black/10 
                        hover:text-slate-900 
                        transition-hover duration-300 ease-in-out 
                        "><b id="Mostoldal">1</b> / <span id="DBoldal">100</span></a></li>
                
                <li class="page-item  shadow-xl">
                    <a class="
                        page-link 
                        bg-zinc-300 
                        text-slate-900 
                         dark:bg-slate-900 
                        dark:text-zinc-200 
                        dark:hover:bg-gray-800 
                        
                        hover:bg-gray-200 
                        hover:outline outline-black/10 
                        hover:text-slate-900 
                        transition-hover duration-300 ease-in-out 
                        " id="Kovi1" onclick="Kovi(this)">Következő</a></li>

                <li class="page-item shadow-xl">
                    <a class="
                        page-link 
                        bg-zinc-300 
                        text-slate-900 
                         dark:bg-slate-900 
                        dark:text-zinc-200 
                        dark:hover:bg-gray-800 
                        
                        hover:bg-gray-200 
                        hover:outline outline-black/10 
                        hover:text-slate-900 
                        transition-hover duration-300 ease-in-out 
                        " id="Kovi2" onclick="Kovi(this)"> >> </a></li>
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
