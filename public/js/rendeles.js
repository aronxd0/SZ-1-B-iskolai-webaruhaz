function RendelesAblak(li) {

    Attekintes(li);


    $("#fizetes").modal("show");
}
//most jelenleg beir adtatok

let _nev = ""  //globális változó a név tárolására
let _emil = "" //globális változó az e-mail tárolására
let _cim = ""  //globális változó a cím tárolására
let _city = "" //globális változó a város tárolására
let _iszam = ""//globális változó az irányítószám tárolására
let _country = ""//globális változó az ország tárolására




function Attekintes(li) {
   

    console.log(li);

    $("#aktualis").html(`
        <span 
        class="
        text-cyan-600 
        dark:text-cyan-600"><b>Áttekintés</b></span> - 
        
        <span 
        class="
        text-gray-500 
        dark:text-gray-500 
        ">Adatok</span> - 
        
        <span 
        class="
        text-gray-500 
        dark:text-gray-500 
        ">Fizetés</span`);

    let z = `<label for="rend" class="p-1">A rendelésed tartalma:</label>`
     z += `<table 
            class='
            w-full 
            border-collapse 
            rounded-lg  
            overflow-hidden 
            p-3 
            shadow-xl 
            mb-4 
            
            ' id='rend'>
            
            <thead>
              <tr 
              class="
              border-b 
              border-gray-300 
              dark:border-gray-700 
              bg-zinc-300 
              text-slate-900 
              dark:bg-slate-900 
              dark:text-zinc-200 
              ">
                <th 
                class="p-2 ">Mennyiség</th>
                <th 
                class=" p-2 ">Termék</th>
                <th 
                class="p-2 ">Ár</th>
              </tr>
              
            </thead>

            <tbody>
            
            `;

    //$("#cc").html("");
    for (const element of li) {

        z += ` 
            <tr class="border-b border-gray-300 dark:border-gray-700">

                <td 
                class="bg-zinc-200 
                text-slate-900 
                dark:bg-slate-800 
                dark:text-zinc-200 
                 p-2 
                ">
                    ${element.MENNYISEG} db
                </td>
                        
                <td 
                class="bg-zinc-200 
                text-slate-900 
                dark:bg-slate-800 
                dark:text-zinc-200 
                 p-2 
                ">
                        ${element.NEV} 
                </td>
                    
                

                <td 
                class="bg-zinc-200 
                text-slate-900 
                dark:bg-slate-800 
                dark:text-zinc-200 
                 p-2 
                ">
                  <span class="osszegek text-success">${element.PENZ.toLocaleString()} Ft</span>
                </td>
                
              </tr>
            
            
            
        
        `

        
    }

    z += "</tbody></table>";

    /*
    z += `
    <div class="col-12 d-flex align-self-center">
         <span class="align-self-center p-2 me-2">Összesen: </span><span id="summu" class="text-success align-self-center p-2 me-2"></span><span class="align-self-center p-2"> (+ ÁFA)</span>
    
    </div>`;
    */
   

    let navigacio = `
        <button type="button" 
        class="
        btn btn-lg 
        bg-zinc-300 
        text-red-700 
        dark:bg-slate-800 
        dark:text-red-700 
        hover:shadow-xl 
        hover:shadow-gray-950/70 
        hover:text-red-700 
        dark:hover:shadow-xl 
        dark:hover:text-red-700 
        dark:hover:shadow-gray-700/80  
        bi bi-x-lg
        " data-bs-dismiss="modal"> Mégse</button>

        <button type="button" 
        class="
        btn btn-lg 
        bg-zinc-300 
        text-emerald-600 
        dark:bg-slate-800 
        dark:text-emerald-600 
        hover:shadow-xl 
        hover:shadow-gray-950/70 
        hover:text-emerald-600 
        dark:hover:text-emerald-600 
        dark:hover:shadow-xl 
        dark:hover:shadow-gray-700/80 
        
        bi bi-arrow-right
        " onclick='Adatok(${JSON.stringify(li)})'> Tovább</button>
    `;
    $("#lab").html(navigacio);

    $("#cc").fadeOut(300, function() {
        $("#cc").html(z).fadeIn(300);
    });

    


    AR_SUM("termek_ar", "also", true);
}


function Adatok(li) {
    $("#aktualis").html(`
        <span 
        class="
        text-emerald-500 
        dark:text-emerald-500">Áttekintés <i class="bi bi-check2"></i></span> - 
        
        <span 
        class="
        text-cyan-600 
        dark:text-cyan-600 
        "><b>Adatok</b></span> - 
        
        <span 
        class="
        text-gray-500 
        dark:text-gray-500 
        ">Fizetés</span`);
    //$("#cc").html("");

    let form = `

        <div class="row mt-3">
          <div class="col-12 text-center">
            <i class="bi bi-info-circle"></i> A *-gal jelölt mezők kitöltése kötelező!
          </div>
        </div>

        <div class="row p-1 px-xl-5">
            
            <div class="col-12 d-flex flex-column flex-xl-row p-1">
                
                <div class="col-12 col-xl-6 p-1">
                    <label for="keresztnev" class="p-2 text-slate-900 dark:text-zinc-200"><i class="bi bi-person"></i> Teljes név *</label>
                    <input type="text" 
                    class="
                    form-control 
                    rounded-4 
                    shadow-xl 
                    bg-zinc-50 
                    placeholder-gray-400 
                    dark:placeholder-gray-400 
                    dark:bg-slate-800 
                    text-slate-900 
                    dark:text-zinc-200 
                    dark:shadow-xl 
                    " id="keresztnev" name="knev" 

                    value="${ _nev != ""? _nev :  document.getElementById("user").querySelector('h5').textContent.trim()}"
                    
                    placeholder="pl.: Füty Imre" style="border: none;">
                    
                </div>

                <div class="col-12 col-xl-6 p-1">
                    <label for="emil" class="p-2 text-slate-900 dark:text-zinc-200"><i class="bi bi-envelope"></i> E-mail cím *</label>
                    <input type="email" 
                    class="
                    form-control 
                    rounded-4 
                    shadow-xl 
                    bg-zinc-50 
                    placeholder-gray-400 
                    dark:placeholder-gray-400 
                    dark:bg-slate-800 
                    text-slate-900 
                    dark:text-zinc-200 
                    dark:shadow-xl 
                    " id="emil"

                     value="${  _emil != "" ? _emil : document.getElementById("user-email").innerHTML}" 

                     name="imel" placeholder="pl.: futyimre69@valami.xd" style="border: none;">
                    
                </div>
                
            </div>
            

            <div class="col-12 d-flex flex-column flex-xl-row mt-2 p-1">

                <div class="col-12 col-xl-3 p-1">
                    <label for="iszam" class="p-2 text-slate-900 dark:text-zinc-200"><i class="bi bi-hash"></i> Irányítószám *</label>
                    <input type="number" 
                    class="
                    form-control 
                    rounded-4 
                    shadow-xl 
                    bg-zinc-50 
                    placeholder-gray-400 
                    dark:placeholder-gray-400 
                    dark:bg-slate-800 
                    text-slate-900 
                    dark:text-zinc-200 
                    dark:shadow-xl 
                    " id="iszam" 
                    
                    value="${_iszam}"

                    name="iszam" placeholder="pl.: 8900" style="border: none;">
                    
                </div>

                <div class="col-12 col-xl-9 p-1">
                    <label for="city" class="p-2 text-slate-900 dark:text-zinc-200"><i class="bi bi-building"></i> Város *</label>
                    <input type="text" 
                    class="
                    form-control 
                    rounded-4 
                    shadow-xl 
                    bg-zinc-50 
                    placeholder-gray-400 
                    dark:placeholder-gray-400 
                    dark:bg-slate-800 
                    text-slate-900 
                    dark:text-zinc-200 
                    dark:shadow-xl 
                    " id="city" 
                    
                    value="${_city}"
                    
                    name="city" placeholder="pl.: Miskolc" style="border: none;">
                    
                </div>
            </div>
            

            
            <div class="col-12 d-flex flex-column flex-xl-row mt-2 p-1">
                <div class="col-12 col-xl-6 p-1">
                    <label for="cim" class="p-2 text-slate-900 dark:text-zinc-200"><i class="bi bi-geo-alt"></i> Cím *</label>
                    <input type="text" 
                    class="
                    form-control 
                    rounded-4 
                    shadow-xl 
                    bg-zinc-50 
                    placeholder-gray-400 
                    dark:placeholder-gray-400 
                    dark:bg-slate-800 
                    text-slate-900 
                    dark:text-zinc-200 
                    dark:shadow-xl 
                    " id="cim" name="cim"
                    
                    value="${_cim}"
                    
                    placeholder="Pl. Kossuth Lajos utca 69." style="border: none;">
                    
                </div>

                <div class="autocomplete" style="width:100%;">
                  <div class="col-12 p-1">
                      <label for="country" class="p-2 text-slate-900 dark:text-zinc-200"><i class="bi bi-globe"></i> Ország *</label>
                      <input type="text" 
                      class="
                      form-control 
                      rounded-4 
                      shadow-xl 
                      bg-zinc-50 
                      placeholder-gray-400 
                      dark:placeholder-gray-400 
                      dark:bg-slate-800 
                      text-slate-900 
                      dark:text-zinc-200 
                      dark:shadow-xl 
                      " id="country" name="country"
                        value="${_country}"
                        placeholder="pl.: Magyarország" style="border: none;">
                      
                  </div>
                </div>

            </div>

            <div class="col-12 mt-2 p-1">
              <label for="megj" class="p-2 text-slate-900 dark:text-zinc-200"><i class="bi bi-chat-left-text"></i> Megjegyzés</label>
              <textarea 
              class="
                form-control 
                shadow-xl 
                rounded-4 
                bg-zinc-50 
                placeholder-gray-400 
                dark:placeholder-gray-400 
                dark:bg-slate-800 
                text-slate-900 
                dark:text-zinc-200 
                dark:shadow-xl 
              " name="megj" style="border: none; height: 100px;" placeholder="Ide fűzheti egyéb csínját bínját a rendeléshez..."></textarea> 
            </div>
            

            
            
            

            
            
             

            
            

            

            <div class="col-12 col-lg-6 mt-2 p-1 text-center m-auto">
                <label class="text-danger" id="hiba"> &nbsp;</label>
            </div>
        </div>
    
    `;

    $("#cc").fadeOut(300, function() {
        $("#cc").html(form).fadeIn(300, function() {
          // inicializáljuk az autocomplete-et miután a DOM-ba került a mező
          const countryInput = document.getElementById("country");
          if (countryInput) autocomplete(countryInput, countries);
        });
    });

    console.log(document.getElementById("user").querySelector('h5').textContent.trim());
    
    

    let navigacio = `
        <button type="button" 
        class="
        btn btn-lg
        bg-zinc-300 
        text-red-700 
        dark:bg-slate-800 
        dark:text-red-700 
        hover:shadow-xl 
        hover:text-red-700 
        dark:hover:text-red-700 
        hover:shadow-gray-950/70 
        dark:hover:shadow-xl 
        dark:hover:shadow-gray-700/80 
         bi bi-backspace
         " onclick='Attekintes(${JSON.stringify(li)})'> Vissza</button>

        <button type="button" 
        class="btn btn-lg 
        bg-zinc-300 
        text-emerald-600 
        dark:bg-slate-800 
        dark:text-emerald-600 
        hover:shadow-xl 
        hover:shadow-gray-950/70 
        hover:text-emerald-600 
        dark:hover:text-emerald-600 
        dark:hover:shadow-xl 
        dark:hover:shadow-gray-700/80 
        bi bi-arrow-right" onclick='Fizetes(${JSON.stringify(li)})'> Tovább</button>
    `;
    $("#lab").html(navigacio);
}




function Fizetes(li) {
    _nev = keresztnev.value;
    _emil = emil.value;
    _cim = cim.value;
    _city = city.value;
    _iszam = iszam.value;
    _country = country.value;




    try{
        if(keresztnev.value.trim() == "" || emil.value.trim() == "" || cim.value.trim() == "" || city.value.trim() == "" || iszam.value.trim() == "" || country.value.trim() == ""){         
            throw "Töltse ki a kötelező mezőket";
        }
        if (!/^[a-zA-ZáéíóöőúüűÁÉÍÓÖŐÚÜŰ\s-]+$/.test(keresztnev.value)) {// a-z → kis angol betűk,A-Z → nagy angol betűk, áéíóöőúüűÁÉÍÓÖŐÚÜŰ → magyar ékezetes betűk,\s → szóköz (space, tab stb.)- → kötőjel (pl. „Kovács-Nagy”),^ → a string eleje,$ → a string vége
            throw "A név csak betűket, szóközt és kötőjelet tartalmazhat!";
        }

        const minta = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!minta.test(emil.value)) {  // ^[^\s@]+ → az e-mail első része: nem tartalmazhat szóközt vagy @ jelet ||  @ → kötelező kukac jel || [^\s@]+ → a domain rész (pl. gmail) || \. → kötelező pont || [^\s@]+$ → a végződés (pl. com, hu stb.)
            throw "Érvénytelen e-mail cím formátum!";
        }

        if (!/^[a-zA-ZáéíóöőúüűÁÉÍÓÖŐÚÜŰ\s-]+$/.test(city.value)) {// a-z → kis angol betűk,A-Z → nagy angol betűk, áéíóöőúüűÁÉÍÓÖŐÚÜŰ → magyar ékezetes betűk,\s → szóköz (space, tab stb.)- → kötőjel (pl. „Kovács-Nagy”),^ → a string eleje,$ → a string vége
            throw "A Város neve csak betűket, szóközt és kötőjelet tartalmazhat!";
        }
        if (!/^\d{4}$/.test(iszam.value)) {// 4 katakter számjegy
            throw "Az irányítószámnak 4 számjegyből kell állnia!";
        }
        if (!/^[a-zA-ZáéíóöőúüűÁÉÍÓÖŐÚÜŰ\s-]+$/.test(country.value)) {
            throw "Az ország neve csak betűket, szóközt és kötőjelet tartalmazhat!";
        }


    } 
    catch (error) {
       
        document.getElementById("hiba").innerHTML = error;
        return;
    }





    $("#aktualis").html(`
        <span 
        class="
        text-emerald-500 
        dark:text-emerald-500">Áttekintés <i class="bi bi-check2"></i></span> - 
        
        <span 
        class="
        text-emerald-500 
        dark:text-emerald-500 
        ">Adatok <i class="bi bi-check2"></i></span> - 
        
        <span 
        class="
        text-cyan-600 
        dark:text-cyan-600 
        "><b>Fizetés</b></span`);
    

    
    console.log( `li ::    +${JSON.stringify(li)}`);


      let form = `
      
      <div class="row">
      
        <div class="col-12 text-center">
          Fizetési mód kiválasztása
        </div>

        <div class="col-12 justify-content-center">
          <div class="row">
            <div class="col-4"></div>
            <div
              class="
              has-checked:bg-indigo-50 
              has-checked:text-indigo-900 
              has-checked:ring-indigo-200 
              dark:has-checked:bg-indigo-950 
              dark:has-checked:text-indigo-200 
              dark:has-checked:ring-indigo-900 
              p-2 
              form-check 
              col-4 
              d-flex 
              justify-content-center"
            >
              
              
              <input type="radio" class="checked:border-indigo-500 form-check-input" name="fiz" id="radio1">
              <label class="form-check-label" for="radio1">Google Pay</label>
            </div>
            <div class="col-4"></div>
          </div>

          <div class="row">
            <div class="col-4"></div>
            <div
              class="
              has-checked:bg-indigo-50 
              has-checked:text-indigo-900 
              has-checked:ring-indigo-200 
              dark:has-checked:bg-indigo-950 
              dark:has-checked:text-indigo-200 
              dark:has-checked:ring-indigo-900 
              p-2 
              form-check 
              col-4 d-flex justify-content-center"
            >
              
              
              <input type="radio" class="checked:border-indigo-500 form-check-input" name="fiz" id="radio2">
              <label class="form-check-label" for="radio2">Apple Pay</label>
            </div>
            <div class="col-4"></div>
          </div>

          <div class="row">
            <div class="col-4"></div>
            <div
              class="
              has-checked:bg-indigo-50 
              has-checked:text-indigo-900 
              has-checked:ring-indigo-200 
              dark:has-checked:bg-indigo-950 
              dark:has-checked:text-indigo-200 
              dark:has-checked:ring-indigo-900 
              p-2 
              form-check col-4 d-flex justify-content-center"
            >
              
              
              <input type="radio" class="checked:border-indigo-500 form-check-input" name="fiz" id="radio3">
              <label class="form-check-label" for="radio3">Bankkártya</label>
            </div>
            <div class="col-4"></div>
          </div>


        </div>





      </div>


      
      
      `;




    $("#cc").fadeOut(300, function() {
        $("#cc").html(form).fadeIn(300);
    });




    let navigacio = `
        <button type="button" 
        class="
        btn btn-lg  
        bi bi-backspace 
        bg-zinc-300 
        text-red-700 
        hover:text-red-700 
        dark:bg-slate-800 
        dark:text-red-700 
        hover:shadow-xl 
        dark:hover:text-red-700 
        hover:shadow-gray-950/70 
        dark:hover:shadow-xl 
        dark:hover:shadow-gray-700/80 
        " onclick='Adatok(${JSON.stringify(li)})'> Vissza</button>

        <button type="button" 
        class="btn btn-lg 
        bg-zinc-300 
        text-emerald-600 
        dark:bg-slate-800 
        dark:text-emerald-600 
        hover:shadow-xl 
        hover:shadow-gray-950/70 
        hover:text-emerald-600 
        dark:hover:text-emerald-600 
        dark:hover:shadow-xl 
        dark:hover:shadow-gray-700/80 
        bi bi-credit-card"   data-bs-dismiss="modal" onclick='Fizetésclick(${JSON.stringify(li)})'> Fizetés</button>
    `;
    $("#lab").html(navigacio);
}

async function Fizetésclick(li) {
    try{
      for (const element of li) {
        var ell = await ajax_post(`rendeles_ellenorzes?ID_TERMEK=${element.ID_TERMEK}&MENNYISEG=${element.MENNYISEG}`, 1);
        if(ell.rows[0].allapot == "karramba") {
            throw `Az egyik termékből nincs elég készleten. A rendelése módosítva lett.`;
        }
      }
      

        let kaki = `${_cim} ${_iszam} ${_city} ${_country}`;            
        await ajax_post(`rendeles?FIZMOD=${"PayPal"}&SZALLMOD=${"MPL"}&MEGJEGYZES=${"MÉG SEMMI"}&SZALLCIM=${kaki}&NEV=${_nev}&EMAIL=${_emil}`, 1);

        
        KosarTetelDB();
        document.getElementById("home_button").click();

        üzen("A terméket sikeresen megvásároltad.","success");
        
    }
    catch(e){
        üzen(e,"danger");
        document.getElementById("cart_button").click();
    }

    
}


//#region Autocomplete országokhoz

// ----------------- Autocomplete support (countries) -----------------
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