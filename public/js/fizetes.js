let _nev = ""  //globális változó a név tárolására
let _emil = "" //globális változó az e-mail tárolására
let _cim = ""  //globális változó a cím tárolására
let _city = "" //globális változó a város tárolására
let _iszam = ""//globális változó az irányítószám tárolására
let _country = ""//globális változó az ország tárolására
let fizmod = "" //globális változó a fizetési mód tárolására
let szallmod = ""//globális változó a szállítási mód tárolására
let megjegyzes =""// globális változó a megjegyzés tárolására
let attekintes = ""

function RendelesAblak(li) {
    Attekintes(li);
    $("#fizetes").modal("show");
}

function Attekintes(li) {
    $("#aktualis").html(`
        <span class="text-cyan-600 dark:text-cyan-600"><b>Áttekintés</b></span> - 
        <span class="text-gray-500 dark:text-gray-500 ">Adatok</span> - 
        <span class="text-gray-500 dark:text-gray-500 ">Fizetés</span`);

     attekintes = `<label for="rend" class="p-1 mt-4">A rendelésed tartalma:</label>`
     
    for (const element of li) {

        attekintes += ` 
          <div class="row px-4">
            <div class="col-0 col-lg-1"></div>
              <div class="col-12 col-lg-10 flex flex-col lg:flex-row bg-zinc-100 text-slate-900 dark:bg-slate-900/50 dark:text-zinc-200 shadow-lg rounded-4 mt-2 p-3 p-xxl-none dark:!border dark:!border-zinc-200/20">
                <div class="col-12 col-lg-2 flex lg:flex-col justify-between py-3 p-lg-1">
                  <span class="font-semibold">Mennyiség</span>
                  <span>${element.MENNYISEG} db</span>
                </div>
                <div class="col-12 col-lg-8 flex lg:flex-col justify-between py-3 p-lg-1 !border !border-t-gray-300 !border-b-gray-300 !border-r-0 !border-l-0 dark:!border-t-zinc-200/20 dark:!border-b-zinc-200/20 lg:!border-t-0 lg:!border-b-0 lg:dark:!border-t-0 lg:dark:!border-b-0">
                  <span class="font-semibold">Termék</span>
                  <span class="text-end text-lg-start text-sm">${element.NEV}</span>
                </div>
                <div class="col-12 col-lg-2 flex lg:flex-col justify-between py-3 p-lg-1">
                  <span class="font-semibold">Ár</span>
                  <span class="osszegek text-slate-900 dark:text-zinc-200 font-semibold">${element.PENZ.toLocaleString()} Ft</span>
                </div>
              </div>
            <div class="col-0 col-lg-1"></div>
          </div>`;
    }

    let navigacio = `
        <button type="button" class="px-3 py-2 rounded-lg !border !border-transparent bg-slate-900 text-zinc-200 dark:bg-gray-800 dark:text-zinc-200 hover:text-slate-900 hover:bg-zinc-100 hover:!border-slate-900 dark:hover:bg-gray-700/70 dark:!border-zinc-200/10 dark:hover:!border-zinc-200/20 dark:hover:text-zinc-200 transition-all duration-150 ease-in-out w-auto bi bi-x-lg" data-bs-dismiss="modal"> Mégse</button>
        <button type="button" class="px-3 py-2 rounded-lg !border !border-transparent bg-slate-900 text-zinc-200 dark:bg-gray-800 dark:text-zinc-200 hover:text-slate-900 hover:bg-zinc-100 hover:!border-slate-900 dark:hover:bg-gray-700/70 dark:!border-zinc-200/10 dark:hover:!border-zinc-200/20 dark:hover:text-zinc-200 transition-all duration-150 ease-in-out w-auto bi bi-arrow-right" onclick='Adatok(${JSON.stringify(li)})'> Tovább</button>`;
    
        $("#lab").html(navigacio);

    $("#cc").animate( { opacity: 0, left: "-300px" }, 300, function() {
        $("#cc").html(attekintes);
        $("#cc").css({ left: "300px" });
        $("#cc").animate( { opacity: 1, left: "0px" }, 300 );
    });

    AR_SUM("termek_ar", "also", true);
}

function Adatok(li) {
  szallmod = "";
  fizmod = "";

  $("#aktualis").html(`
      <span class="text-emerald-500 dark:text-emerald-500">Áttekintés <i class="bi bi-check2"></i></span> - 
      <span class="text-cyan-600 dark:text-cyan-600 "><b>Adatok</b></span> - 
      <span class="text-gray-500 dark:text-gray-500 ">Fizetés</span`);

  let form = `
      <div class="row mt-3">
        <div class="col-12 text-center">
          <i class="bi bi-info-circle"></i> A *-gal jelölt mezők kitöltése kötelező!
        </div>
      </div>
      <div class="row p-1 px-xl-5">
        <div class="col-12 flex flex-col xl:flex-row p-1">
          <div class="col-12 col-xl-6 p-1">
            <label for="keresztnev" class="p-2 text-slate-900 dark:text-zinc-200"><i class="bi bi-person"></i> Teljes név *</label>
            <input type="text" class="form-control rounded-xl duration-300 focus:transition-all focus:outline-none focus:ring-2 focus:ring-emerald-600 shadow-xl bg-zinc-100 text-slate-900 dark:bg-gray-800 dark:text-zinc-200 placeholder-gray-400 dark:placeholder-gray-400 dark:!border dark:!border-zinc-200/20" id="keresztnev" name="knev" value="${ _nev != ""? _nev :  document.getElementById("user").querySelector('h5').textContent.trim()}" placeholder="pl.: Füty Imre">
          </div>
          <div class="col-12 col-xl-6 p-1">
            <label for="emil" class="p-2 text-slate-900 dark:text-zinc-200"><i class="bi bi-envelope"></i> E-mail cím *</label>
            <input type="email" class="form-control rounded-xl duration-300 focus:transition-all focus:outline-none focus:ring-2 focus:ring-emerald-600 shadow-xl bg-zinc-100 text-slate-900 dark:bg-gray-800 dark:text-zinc-200 placeholder-gray-400 dark:placeholder-gray-400 dark:!border dark:!border-zinc-200/20" id="emil" value="${_emil}" name="imel" placeholder="pl.: futyimre69@valami.xd">              
          </div>
        </div>
        <div class="col-12 flex flex-col xl:flex-row mt-2 p-1">
          <div class="col-12 col-xl-3 p-1">
            <label for="iszam" class="p-2 text-slate-900 dark:text-zinc-200"><i class="bi bi-hash"></i> Irányítószám *</label>
            <input type="number" class="form-control rounded-xl duration-300 focus:transition-all focus:outline-none focus:ring-2 focus:ring-emerald-600 shadow-xl bg-zinc-100 placeholder-gray-400 dark:placeholder-gray-400 dark:bg-slate-800 text-slate-900 dark:text-zinc-200 dark:!border dark:!border-zinc-200/20" id="iszam" value="${_iszam}" name="iszam" placeholder="pl.: 8900">
          </div>
          <div class="col-12 col-xl-9 p-1">
            <label for="city" class="p-2 text-slate-900 dark:text-zinc-200"><i class="bi bi-building"></i> Város *</label>
            <input type="text" class="form-control rounded-xl duration-300 focus:transition-all focus:outline-none focus:ring-2 focus:ring-emerald-600 shadow-xl bg-zinc-100 placeholder-gray-400 dark:placeholder-gray-400 dark:bg-slate-800 text-slate-900 dark:text-zinc-200 dark:!border dark:!border-zinc-200/20" id="city" value="${_city}" name="city" placeholder="pl.: Miskolc">
          </div>
        </div>
        <div class="col-12 flex flex-col xl:flex-row mt-2 p-1">
          <div class="col-12 col-xl-6 p-1">
            <label for="cim" class="p-2 text-slate-900 dark:text-zinc-200"><i class="bi bi-geo-alt"></i> Cím *</label>
            <input type="text" class="form-control rounded-xl duration-300 focus:transition-all focus:outline-none focus:ring-2 focus:ring-emerald-600 shadow-xl bg-zinc-100 placeholder-gray-400 dark:placeholder-gray-400 dark:bg-slate-800 text-slate-900 dark:text-zinc-200 dark:!border dark:!border-zinc-200/20" id="cim" name="cim" value="${_cim}" placeholder="Pl. Kossuth Lajos utca 69.">                
          </div>
          <div class="autocomplete" style="width:100%;">
            <div class="col-12 p-1">
              <label for="country" class="p-2 text-slate-900 dark:text-zinc-200"><i class="bi bi-globe"></i> Ország *</label>
              <input type="text" class="form-control rounded-xl duration-300 focus:transition-all focus:outline-none focus:ring-2 focus:ring-emerald-600 shadow-xl bg-zinc-100 placeholder-gray-400 dark:placeholder-gray-400 dark:bg-slate-800 text-slate-900 dark:text-zinc-200 dark:!border dark:!border-zinc-200/20" id="country" name="country" value="${_country}" placeholder="pl.: Magyarország">                  
            </div>
          </div>
        </div>
        <div class="col-12 mt-2 p-1">
          <label for="megj" class="p-2 text-slate-900 dark:text-zinc-200"><i class="bi bi-chat-left-text"></i> Megjegyzés</label>
          <textarea class="h-[150px] form-control duration-300 focus:transition-all focus:outline-none focus:ring-2 focus:ring-emerald-600 shadow-xl bg-zinc-100 text-slate-900 dark:bg-gray-800 dark:text-zinc-200 placeholder-gray-400 dark:placeholder-gray-400 dark:!border dark:!border-zinc-200/20 resize-none" name="megj" placeholder="Ide fűzheti egyéb csínját bínját a rendeléshez..." id="MEGJ" >${megjegyzes}</textarea> 
        </div>
        <div class="col-12 col-lg-6 mt-2 p-1 text-center m-auto">
            <label class="text-danger" id="hiba"> &nbsp;</label>
        </div>
      </div>
    
    `;

    $("#cc").animate( { opacity: 0, left: "-300px" }, 300, function() {
        $("#cc").html(form);
        $("#cc").css({ left: "300px" });
        // inicializáljuk az autocomplete-et miután a DOM-ba került a mező
        const countryInput = document.getElementById("country");
        if (countryInput) autocomplete(countryInput, countries);
        $("#cc").animate( { opacity: 1, left: "0px" }, 300 );
    });

    let navigacio = `
        <button type="button" class="px-3 py-2 rounded-lg !border !border-transparent bg-slate-900 text-zinc-200 dark:bg-gray-800 dark:text-zinc-200 hover:text-slate-900 hover:bg-zinc-100 hover:!border-slate-900 dark:hover:bg-gray-700/70 dark:!border-zinc-200/10 dark:hover:!border-zinc-200/20 dark:hover:text-zinc-200 transition-all duration-150 ease-in-out w-auto bi bi-backspace" onclick='Attekintes(${JSON.stringify(li)})'> Vissza</button>
        <button type="button" class="px-3 py-2 rounded-lg !border !border-transparent bg-slate-900 text-zinc-200 dark:bg-gray-800 dark:text-zinc-200 hover:text-slate-900 hover:bg-zinc-100 hover:!border-slate-900 dark:hover:bg-gray-700/70 dark:!border-zinc-200/10 dark:hover:!border-zinc-200/20 dark:hover:text-zinc-200 transition-all duration-150 ease-in-out w-auto bi bi-arrow-right" onclick='Fizetes(${JSON.stringify(li)})'> Tovább</button>`;
    
    $("#lab").html(navigacio);
}




function Fizetes(li) {
  // ha már tovább ment az adatok oldalról, akkor a mezők értékeit elmentjük a globális változókba
  _nev = keresztnev.value; 
  _emil = emil.value;
  _cim = cim.value;
  _city = city.value;
  _iszam = iszam.value;
  _country = country.value;
  megjegyzes = MEGJ.value;

  // Lellenőrzések az adatok helyességére miellöt betöltjük a kövi oldalt
    try{
        if (keresztnev.value.trim() == "" || emil.value.trim() == "" || cim.value.trim() == "" || city.value.trim() == "" || iszam.value.trim() == "" || country.value.trim() == ""){         
            throw "Töltse ki a kötelező mezőket";
        }
        if (!/^[a-zA-ZáéíóöőúüűÁÉÍÓÖŐÚÜŰ\s-]+$/.test(keresztnev.value)) {// a-z → kis angol betűk,A-Z → nagy angol betűk, áéíóöőúüűÁÉÍÓÖŐÚÜŰ → magyar ékezetes betűk,\s → szóköz (space, tab stb.)- → kötőjel (pl. „Kovács-Nagy”),^ → a string eleje,$ → a string vége
            throw "A név csak betűket, szóközt és kötőjelet tartalmazhat!";
        }
        const minta = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!minta.test(emil.value)) {  // ^[^\s@]+ → az e-mail első része: nem tartalmazhat szóközt vagy @ jelet ||  @ → kötelező kukac jel || [^\s@]+ → a domain rész (pl. gmail) || \. → kötelező pont || [^\s@]+$ → a végződés (pl. com, hu stb.)
            throw "Érvénytelen e-mail cím formátum!";
        }
        if (!/^[a-zA-ZáéíóöőúüűÁÉÍÓÖŐÚÜŰ\s-]+$/.test(city.value)) {// a-z → kis angol betűk,A-Z → nagy angol betűk, áéíóöőúüűÁÉÍÓÖŐÚÜŰ → magyar ékezetes betűk,\s → szóköz (space, tab stb.)- → kötőjel (pl. „: Dél-Komárom”),^ → a string eleje,$ → a string vége
            throw "A Város neve csak betűket, szóközt és kötőjelet tartalmazhat!";
        }
        if (!/^\d{4}$/.test(iszam.value)) {// 4 katakter számjegy
            throw "Az irányítószámnak 4 számjegyből kell állnia!";
        }
        if (!/^[a-zA-ZáéíóöőúüűÁÉÍÓÖŐÚÜŰ\s-\.]+$/.test(cim.value)) {
            throw "Az cím csak betűket, szóközt, kötőjelet és pontot tartalmazhat!";
        }
        if (!/^[a-zA-ZáéíóöőúüűÁÉÍÓÖŐÚÜŰ\s-]+$/.test(country.value)) {
            throw "Az ország neve csak betűket, szóközt és kötőjelet tartalmazhat!";
        }
        if (!/^[a-zA-ZáéíóöőúüűÁÉÍÓÖŐÚÜŰ\s-]+$/.test(MEGJ.value)) {
            throw "Az megjegyzés csak betűket, szóközt és kötőjelet tartalmazhat!";
        }
    } 
    catch (error) {
        $("#hiba").html(error);// ha valami rosz akkor visszairjük a hiba html elembe
        return;
    }
        

    $("#aktualis").html(`
        <span class="text-emerald-500 dark:text-emerald-500">Áttekintés <i class="bi bi-check2"></i></span> - 
        <span class="text-emerald-500 dark:text-emerald-500 ">Adatok <i class="bi bi-check2"></i></span> - 
        <span class="text-cyan-600 dark:text-cyan-600 "><b>Fizetés</b></span`);

      let form = `
      <div class="row flex flex-col lg:flex-row p-3">
        <div class="col-12 col-lg-6 mx-auto mt-5 space-y-3">
          <span class="text-lg p-1">Válasszon fizetési módot</span>
          <label class="!border !border-transparent bg-zinc-50 shadow-xl text-slate-900 dark:bg-slate-800 dark:text-zinc-200 hover:bg-gray-200 hover:outline outline-black/10 dark:hover:bg-gray-700 dark:hover:-outline-offset-1 dark:hover:outline-white/10 flex items-center justify-between p-4 rounded-xl cursor-pointer transition-all duration-200 has-[:checked]:bg-indigo-100 has-[:checked]:!border-indigo-400 has-[:checked]:border has-[:checked]:shadow-md dark:has-[:checked]:bg-sky-950 dark:has-[:checked]:!border-sky-700 dark:has-[:checked]:border">
            <div class="flex items-center gap-3">
              <input type="radio" name="fizz" class="form-check-input" id="kartya" onchange="Fizetesmodvalaszto(this)">
              <span class="font-semibold">Bankkártya</span>
            </div>
            <div class="flex justify-end items-center">
              <img src="img/mastercard.png" class="img-fluid w-15 h-[20px]">
              <img src="img/visa.png" class="img-fluid w-15 h-[20px]">
            </div>
          </label>
          <label class="!border !border-transparent bg-zinc-50 shadow-xl text-slate-900 dark:bg-slate-800 dark:text-zinc-200 hover:bg-gray-200 hover:outline outline-black/10 dark:hover:bg-gray-700 dark:hover:-outline-offset-1 dark:hover:outline-white/10 flex items-center justify-between p-4 rounded-xl cursor-pointer transition-all duration-200 has-[:checked]:bg-indigo-100 has-[:checked]:!border-indigo-400 has-[:checked]:border has-[:checked]:shadow-md dark:has-[:checked]:bg-sky-950 dark:has-[:checked]:!border-sky-700 dark:has-[:checked]:border">
            <div class="flex items-center gap-3">
              <input type="radio" name="fizz" class="form-check-input" id="paypal" onchange="Fizetesmodvalaszto(this)">
              <span class="font-semibold">PayPal</span>
            </div>
            <div class="flex justify-end items-center">
              <img src="img/paypal.png" class="img-fluid w-15 h-[20px]">
            </div>
          </label>
          <label class="!border !border-transparent bg-zinc-50 text-slate-900 shadow-xl dark:bg-slate-800 dark:text-zinc-200 hover:bg-gray-200 hover:outline outline-black/10 dark:hover:bg-gray-700 dark:hover:-outline-offset-1 dark:hover:outline-white/10 flex items-center justify-between p-4 rounded-xl cursor-pointer transition-all duration-200 has-[:checked]:bg-indigo-100 has-[:checked]:!border-indigo-400 has-[:checked]:border has-[:checked]:shadow-md dark:has-[:checked]:bg-sky-950 dark:has-[:checked]:!border-sky-700 dark:has-[:checked]:border">
            <div class="flex items-center gap-3">
              <input type="radio" name="fizz" class="form-check-input" id="googlepay" onchange="Fizetesmodvalaszto(this)">
              <span class="font-semibold">Google Pay</span>
            </div>
            <div class="flex justify-end items-center">
              <img src="img/googlepay.png" class="img-fluid rounded-2 w-15 h-[20px]">
            </div>
          </label>
          <label class="!border !border-transparent bg-zinc-50 text-slate-900 shadow-xl dark:bg-slate-800 dark:text-zinc-200 hover:bg-gray-200 hover:outline outline-black/10 dark:hover:bg-gray-700 dark:hover:-outline-offset-1 dark:hover:outline-white/10 flex items-center justify-between p-4 rounded-xl cursor-pointer transition-all duration-200 has-[:checked]:bg-indigo-100 has-[:checked]:!border-indigo-400 has-[:checked]:border has-[:checked]:shadow-md dark:has-[:checked]:bg-sky-950 dark:has-[:checked]:!border-sky-700 dark:has-[:checked]:border">
            <div class="flex items-center gap-3">
              <input type="radio" name="fizz" class="form-check-input" id="applepay" onchange="Fizetesmodvalaszto(this)">
              <span class="font-semibold">Apple Pay</span>
            </div>
            <div class="flex justify-end items-center">
              <img src="img/applepay.png" class="img-fluid w-15 h-[20px]">
            </div>
          </label>
        </div>

        <div class="col-12 col-lg-6 mx-auto mt-5 space-y-3">
          <span class="text-lg p-1">Válasszon szállítási módot</span>
          <label class="!border !border-transparent bg-zinc-50 shadow-xl text-slate-900 dark:bg-slate-800 dark:text-zinc-200 hover:bg-gray-200 hover:outline outline-black/10 dark:hover:bg-gray-700 dark:hover:-outline-offset-1 dark:hover:outline-white/10 flex items-center justify-between p-4 rounded-xl cursor-pointer transition-all duration-200 has-[:checked]:bg-indigo-100 has-[:checked]:!border-indigo-400 has-[:checked]:border has-[:checked]:shadow-md dark:has-[:checked]:bg-sky-950 dark:has-[:checked]:!border-sky-700 dark:has-[:checked]:border">
            <div class="flex items-center gap-3">
              <input type="radio" name="szall" class="form-check-input" id="mpl" onchange="Szallitasmodvalaszto(this)">
              <span class="font-semibold">MPL</span>
            </div>
            <div class="flex flex-col text-right">
              <img src="img/mplsvg.png" alt="MPL logo" class="w-8 h-8">
            </div>
          </label>
          <label class="!border !border-transparent bg-zinc-50 shadow-xl text-slate-900 dark:bg-slate-800 dark:text-zinc-200 hover:bg-gray-200 hover:outline outline-black/10 dark:hover:bg-gray-700 dark:hover:-outline-offset-1 dark:hover:outline-white/10 flex items-center justify-between p-4 rounded-xl cursor-pointer transition-all duration-200 has-[:checked]:bg-indigo-100 has-[:checked]:!border-indigo-400 has-[:checked]:border has-[:checked]:shadow-md dark:has-[:checked]:bg-sky-950 dark:has-[:checked]:!border-sky-700 dark:has-[:checked]:border">
            <div class="flex items-center gap-3">
              <input type="radio" name="szall" class="form-check-input" id="gls" onchange="Szallitasmodvalaszto(this)">
              <span class="font-semibold">GLS</span>
            </div>
            <div class="flex flex-col text-right">
              <img src="img/gls.png" alt="GLS logo" class="w-8 h-8 rounded">
            </div>
          </label>
          <label class="!border !border-transparent bg-zinc-50 text-slate-900 shadow-xl dark:bg-slate-800 dark:text-zinc-200 hover:bg-gray-200 hover:outline outline-black/10 dark:hover:bg-gray-700 dark:hover:-outline-offset-1 dark:hover:outline-white/10 flex items-center justify-between p-4 rounded-xl cursor-pointer transition-all duration-200 has-[:checked]:bg-indigo-100 has-[:checked]:!border-indigo-400 has-[:checked]:border has-[:checked]:shadow-md dark:has-[:checked]:bg-sky-950 dark:has-[:checked]:!border-sky-700 dark:has-[:checked]:border">
            <div class="flex items-center gap-3">
              <input type="radio" name="szall" class="form-check-input" id="expressone" onchange="Szallitasmodvalaszto(this)">
              <span class="font-semibold">Express One</span>
            </div>
            <div class="flex flex-col text-right">
              <img src="img/expressonesvg.png" alt="Express One logo" class="w-8 h-8">
            </div>
          </label>
        </div>
        <div class="col-12 text-center text-danger mt-3" id="hibauzen">
      </div>`;

    $("#cc").animate( { opacity: 0, left: "-300px" }, 300, function() {
        $("#cc").html(form);
        $("#cc").css({ left: "300px" });
        $("#cc").animate( { opacity: 1, left: "0px" }, 300 );
    });

    let navigacio = `
        <button type="button" class="px-3 py-2 rounded-lg !border !border-transparent bg-slate-900 text-zinc-200 dark:bg-gray-800 dark:text-zinc-200 hover:text-slate-900 hover:bg-zinc-100 hover:!border-slate-900 dark:hover:bg-gray-700/70 dark:!border-zinc-200/10 dark:hover:!border-zinc-200/20 dark:hover:text-zinc-200 w-auto transition-all duration-150 ease-in-out bi bi-backspace" onclick='Adatok(${JSON.stringify(li)})'> Vissza</button>
        <button type="button" class="px-3 py-2 rounded-lg !border !border-transparent bg-slate-900 text-zinc-200 dark:bg-gray-800 dark:text-zinc-200 hover:text-slate-900 hover:bg-zinc-100 hover:!border-slate-900 dark:hover:bg-gray-700/70 dark:!border-zinc-200/10 dark:hover:!border-zinc-200/20 dark:hover:text-zinc-200 w-auto transition-all duration-150 ease-in-out bi bi-credit-card" id="FIZ" onclick='Fizetésclick(${JSON.stringify(li)})'> Fizetés</button>`;
    
    $("#lab").html(navigacio);
}


function Fizetesmodvalaszto(mod) {
  if (mod.id == "googlepay") { fizmod = "Google Pay"; }
  else if (mod.id == "paypal") { fizmod = "PayPal"; }
  else if (mod.id == "applepay") { fizmod = "Apple Pay"; }
  else if (mod.id == "kartya") { fizmod = "Bankkártya"; }
}

function Szallitasmodvalaszto(mod) {
  if(mod.id == "mpl") { szallmod = "MPL"; }
  else if(mod.id == "expressone") { szallmod = "Express One"; }
  else if(mod.id == "gls") { szallmod = "GLS"; }
}



async function Fizetésclick(li) {
  let mindenjo = true;
  try{
    for (const element of li) {
      // ellenőrizzük, hogy abból a tételből van a még készleten a kivánt darabból
      var ell = await ajax_call(`rendeles_ellenorzes?ID_TERMEK=${element.ID_TERMEK}&MENNYISEG=${element.MENNYISEG}`, "GET", null, true);

      if(ell.rows[0].allapot == "karramba") { throw `Az egyik termékből nincs elég készleten. A rendelése módosítva lett.`; }
    }
    // ha nincs kiválasztva fizetési vagy szállítási mód
    if(szallmod == "" ||  fizmod == "") { throw "Válassza ki a fizetési és szállítási módot!"; }
    
      // ha minden jó akkor elküldjük a rendelést
    let kaki = `${_cim} ${_iszam} ${_city} ${_country}`;            
    var dsa = await ajax_call(`rendeles?FIZMOD=${fizmod}&SZALLMOD=${szallmod}&MEGJEGYZES=${megjegyzes}&SZALLCIM=${kaki}&NEV=${_nev}&EMAIL=${_emil}&AFA=${(await ajax_call(`afa`, "GET", null, true)).rows[0].AFA}`, "POST", null, true);  
    if(dsa.message != "ok") { throw "Hiba a rendelés leadásakor!"; }
    KosarTetelDB(); // frissítjük a kosár db-t
    üzen("A terméket sikeresen megvásároltad.","success");
    $("#fizetes").modal("hide");
    PAUSE(); // a fizetes modal bezárása után várunk egy kicsit hogy betoltse a kezdolapot
  }
  catch(e) {
    if (e == "Válassza ki a fizetési és szállítási módot!"){
      $("#hibauzen").html(e);
      return;
    } 
    else {
      $("#fizetes").modal("hide");
      PAUSE();
      mindenjo = false;
    }
  }

  if (mindenjo){
    try {
      const html = await emailDesign(li);
      // 2 adata egyfajta tömb amit majd a backend fogad
      ajax_call("send-email", "POST", { email: _emil, subject: "Rendelés visszaigazolása", html: html }, false);
    }
    catch (err) { console.error(err); }
  } 
}

async function emailDesign(li) {
// itt állítjuk össze az email html dizájnt
  let rows = "";
  let osszes = 0;
  // Vásárolt termékek listázása
  for (const e of li) {
    rows += `
      <tr>
        <td style="padding:10px;border-bottom:1px solid #eee;text-align:center;">
          ${e.MENNYISEG} db
        </td>
        <td style="padding:10px;border-bottom:1px solid #eee;text-align:center;">
          ${e.NEV}
        </td>
        <td width="30%" style="padding:8px; border-bottom:1px solid #eee; font-weight:bold; color:#047857; text-align:right; white-space:normal; word-break:break-word; overflow:hidden;">
          <div style="max-width:100%;">
            ${e.PENZ.toLocaleString()}<br>
            <span style="font-size:13px;">Ft</span>
          </div>
        </td>
      </tr>`;
    osszes += e.PENZ;
  }

  const afaAdat = await ajax_call(`afa`, "GET", null, false);
  const afa = afaAdat.rows[0].AFA;
  const vegosszeg = Math.round(osszes * (1 + afa / 100)).toLocaleString();
  const rendelesazonAdat = await ajax_call(`rendeles_azon`, "GET", null, false);
  const rendelesazon = rendelesazonAdat.rows[0].RENDELES_AZONOSITO;

  // fejléc + törzs 
  // itt használjuk fel a globális változókat is amik az adatokat tartalmazzák
  return `
    <div style="background:#f5f1e8;padding:30px 0;">
      <div style="max-width:720px; margin:auto; background:#ffffff; border-radius:14px; padding:30px; font-family:Arial,Helvetica,sans-serif; border:1px solid #e5e5e5;">
        <div style="background:linear-gradient(135deg,#9cffc7,#7ef3b1); padding:30px 20px; border-radius:12px; text-align:center; margin-bottom:25px;">
          <img src="cid:logo2@example.com" style="width:180px;margin-bottom:15px;" />
          <h2 style="margin:0; color:#064e3b; font-size:24px;">
            Hurrá! A rendelésed megérkezett
          </h2>
          <p style="margin-top:12px;color:#064e3b;font-size:15px;line-height:1.6;">
            Kedves ${_nev}!<br>
            Köszönjük a vásárlást.<br>
            Az alábbiakban megtalálod a rendelés részleteit.
          </p>
        </div>
        <div style="margin-left:3px; display:flex; margin-bottom:30px; flex-wrap:wrap;">
        <div style="width:48%; border:1px solid #e5e7eb; border-radius:12px; padding:20px; box-sizing:border-box; background:#ffffff; margin-right:12px;">
          <div style="font-size:13px;color:#6b7280;">
            Rendelési azonosító
          </div>
          <div style="font-size:16px;font-weight:bold;color:#065f46;">
            ${rendelesazon}
          </div>
        </div>
        <div style="width:48%; border:1px solid #e5e7eb; border-radius:12px; padding:20px; box-sizing:border-box; background:#ffffff;">
          <div style="font-size:13px;color:#6b7280;">
            Szállítási cím
          </div>
          <div style="font-size:15px;color:#065f46;line-height:1.4;">
            ${_cim}<br>
            ${_iszam} ${_city}<br>
            ${_country}
          </div>
        </div>
      </div>
      <h2 style="text-align:center;color:#065f46;margin-bottom:15px;">
        Rendelésed tartalma
      </h2>
      <table width="100%" cellpadding="0" cellspacing="0" style="width:100%; table-layout:fixed; border-collapse:collapse; font-size:15px;">
          <thead>
            <tr style="background:#e6f9ee;color:#064e3b;">
              <th width="25%" style="padding:12px;">Mennyiség</th>
              <th width="45%" style="padding:12px;">Termék</th>
              <th width="30%" style="padding:12px;">Ár</th>
            </tr>
          </thead>
          <tbody> ${rows} </tbody>
      </table>

      <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:20px;">
        <tr>
          <td style="text-align:right; font-size:14px; color:#047857; padding:5px 0;">
            Összesen: ${osszes.toLocaleString()} Ft + ${afa}% áfa
          </td>
        </tr>
        <tr>
          <td style="text-align:right; font-size:22px; font-weight:bold; color:#047857; padding:5px 0;">
            Végösszeg: ${vegosszeg} Ft
          </td>
        </tr>
      </table>
    </div>`;
}

//#region Autocomplete országokhoz
const countries = [
  "Afganisztán", "Albánia", "Algéria", "Andorra", "Angola", "Argentína", "Örményország", "Ausztrália", "Ausztria", "Azerbajdzsán",
  "Bahama-szigetek", "Bahrein", "Banglades", "Barbados", "Fehéroroszország", "Belgium", "Belize", "Benin", "Bhután", "Bolívia",
  "Bosznia-Hercegovina", "Brazília", "Bulgária", "Kambodzsa", "Kamerun", "Kanada", "Csád", "Chile", "Kína", "Kolumbia", "Costa Rica",
  "Horvátország", "Kuba", "Ciprus", "Csehország", "Dánia", "Dominikai Köztársaság", "Ecuador", "Egyiptom", "Észtország", "Finnország",
  "Franciaország", "Németország", "Görögország", "Magyarország", "Izland", "India", "Indonézia", "Irán", "Irak", "Írország",
  "Izrael", "Olaszország", "Japán", "Kenya", "Kuvait", "Lettország", "Libanon", "Litvánia", "Luxemburg", "Malajzia", "Málta",
  "Mexikó", "Moldova", "Monaco", "Marokkó", "Hollandia", "Új-Zéland", "Nigéria", "Norvégia", "Pakisztán", "Panama", "Peru",
  "Fülöp-szigetek", "Lengyelország", "Portugália", "Románia", "Oroszország", "Szaúd-Arábia", "Szerbia", "Szingapúr", "Szlovákia",
  "Szlovénia", "Dél-afrikai Köztársaság", "Dél-Korea", "Spanyolország", "Svédország", "Svájc", "Tajvan", "Thaiföld", "Törökország",
  "Ukrajna", "Egyesült Királyság", "Amerikai Egyesült Államok", "Venezuela", "Vietnam", "Zimbabwe"
]

function autocomplete(inp, arr) {
  //arr == countries
  //inp == country input mező
  var currentFocus;
  inp.addEventListener("input", function(e) {
    var a, b, i, val = this.value;

    // bezárja a régi ablakokat  listákat 
    closeAllLists();

    if (!val) { return false; }

    currentFocus = -1;
    a = document.createElement("DIV");

    a.setAttribute("id", this.id + "autocomplete-list"); // ha már volt country kiválasztva akkor újra létrehozza
    a.setAttribute("class", "autocomplete-items");
    this.parentNode.appendChild(a);

    //létrehozunk egy divet amibe betesszük a találatokat

    var darab  = 0;
    for (i = 0; i < arr.length; i++) {
      if (arr[i].substr(0, val.length).toUpperCase() == val.toUpperCase()) { //ha be van valmi irva akkor összehasonlítja a beírt értékkel a lista minden elemének a kezdését
        // ha találat van akkor ide bejön
        
        if(darab == 3) {break}; // maximum 4 találat legyen megjelenitve
        darab = darab +1 ;
        // létrehoz egy divet a találathoz
        b = document.createElement("DIV");
        b.innerHTML = "<strong>" + arr[i].substr(0, val.length) + "</strong>"; // félkövérrel kiemeli a találat elejét
        b.innerHTML += arr[i].substr(val.length);
        b.innerHTML += "<input type='hidden' value='" + arr[i] + "'>"; // inputtá teszi a találatot hogy később ki lehessen választani

        // amikor rákattint a találatra akkor beírja az input mezőbe a kiválasztott értéket
        b.addEventListener("click", function(e) {
          inp.value = this.getElementsByTagName("input")[0].value;
          closeAllLists();
        });
        a.appendChild(b); // betesszi a találatot a divbe
      }
    }
  });

  inp.addEventListener("keydown", function(e) {

    // az aoutoccomplete listában való navigáció billentyűkkel
    var x = document.getElementById(this.id + "autocomplete-list");
    if (x) x = x.getElementsByTagName("div");
    if (e.keyCode == 40) { // lefelenyil nyíl
      currentFocus++;// növeli a fókuszt
      addActive(x);
    } else if (e.keyCode == 38) {// felnyil nyíl
      currentFocus--;
      addActive(x);
    } else if (e.keyCode == 13) { // enter
      e.preventDefault();
      if (currentFocus > -1) {
        if (x) x[currentFocus].click(); // ha van fókuszban lévő elem akkor rákattint
      }
    }
  });

  function addActive(x) {
    if (!x) return false; // ha nincs találat akkor kilép
    removeActive(x);// eltávolítja az aktív osztályt minden elemtől
    if (currentFocus >= x.length) currentFocus = 0; // ha a fókusz nagyobb mint a találatok száma akkor visszaállítja 0-ra
    if (currentFocus < 0) currentFocus = (x.length - 1); // ha a fókusz kisebb mint 0 akkor a találatok utolsó elemére állítja
    x[currentFocus].classList.add("autocomplete-active"); // hozzáadja az aktív osztályt a fókuszban lévő elemhez
  }
  function removeActive(x) {
    for (var i = 0; i < x.length; i++) { //
      x[i].classList.remove("autocomplete-active"); // eltávolítja az aktív osztályt minden elemtől
    }
  }

  function closeAllLists(elmnt) {
    var x = document.getElementsByClassName("autocomplete-items"); // lekéri az összes találatot
    for (var i = 0; i < x.length; i++) {
      if (elmnt != x[i] && elmnt != inp) {
        x[i].parentNode.removeChild(x[i]); // eltávolítja a találatot ha nem az input mező vagy a találat maga az elem
      }
    }
  }
  document.addEventListener("click", function (e) {
    closeAllLists(e.target); // bezárja a találatokat ha máshova kattintanak
  });
}
//#endregion