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
let fizmod = "" //globális változó a fizetési mód tárolására
let szallmod = ""//globális változó a szállítási mód tárolására
let megjegyzes =""// globális változó a megjegyzés tárolására
let htmtoback =""




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

     htmtoback = `<label for="rend" class="p-1 mt-4">A rendelésed tartalma:</label>`
     htmtoback += `<table 
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

        htmtoback += ` 
            <tr class="border-b border-gray-300 dark:border-gray-700">

                <td 
                class="bg-zinc-200 
                text-slate-900 
                dark:bg-slate-800 
                dark:text-zinc-200 
                 p-3 
                ">
                    ${element.MENNYISEG} db
                </td>
                        
                <td 
                class="bg-zinc-200 
                text-slate-900 
                dark:bg-slate-800 
                dark:text-zinc-200 
                 p-3 
                ">
                        ${element.NEV} 
                </td>
                    
                

                <td 
                class="bg-zinc-200 
                text-slate-900 
                dark:bg-slate-800 
                dark:text-zinc-200 
                 p-3  
                ">
                  <span class="osszegek text-success">${element.PENZ.toLocaleString()} Ft</span>
                </td>
                
              </tr>
            
            
            
        
        `

        
    }

    htmtoback += "</tbody></table>";

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
        $("#cc").html(htmtoback).fadeIn(300);
    });

    


    AR_SUM("termek_ar", "also", true);
}


function Adatok(li) {
  szallmod ="";
  fizmod ="";
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
              " name="megj" style="border: none; height: 100px;" placeholder="Ide fűzheti egyéb csínját bínját a rendeléshez..." id="MEGJ" >${megjegyzes}</textarea> 
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
       
        document.getElementById("hiba").innerHTML = error;// ha valami rosz akkor visszairjük a hiba html elembe
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
      <div class="row mt-3">
        <div class="col-12 col-lg-6">
        
          <div class="col-12 text-center p-2">
            
            Fizetési mód kiválasztása
          </div>

          <div class="col-12 d-flex flex-wrap justify-content-center p-3">
            <div class="col-6 col-sm-3 d-flex justify-content-center gap-3">
              
              <input type="radio" class="form-check-input peer hidden" name="fiz" id="googlepay" onchange="Fizetesmodvalaszto(this)">
              <label
                for="googlepay" 
                
                class="
                peer-checked:bg-slate-900 
                peer-checked:text-zinc-200 
                dark:peer-checked:bg-slate-700 
                dark:peer-checked:text-zinc-200 
                p-2  
                rounded-xl 
                transition-all 
                duration-200 
                
                gap-2 
                cursor-pointer 
                border border-gray-400 
                dark:border-gray-700 
                hover:shadow-md 
                d-flex align-items-center 
                " 
              >
                
                <i class="bi bi-google"></i>
                
                Google Pay
              </label>
              
            </div>

            <div class="col-6 col-sm-3 d-flex justify-content-center gap-3">
              <input type="radio" class="peer hidden form-check-input" name="fiz" id="applepay" onchange="Fizetesmodvalaszto(this)">
              <label 
                for="applepay" 
                class="
                peer-checked:bg-slate-900 
                peer-checked:text-zinc-200 
                dark:peer-checked:bg-slate-700 
                dark:peer-checked:text-zinc-200 
                p-2  
                rounded-xl 
                transition-all 
                duration-200 
                
                gap-2 
                cursor-pointer 
                border border-gray-400 
                dark:border-gray-700 
                hover:shadow-md 
                d-flex align-items-center "
              >
                
                <i class="bi bi-apple"></i>
                
                Apple Pay
              </label>
              
            </div>

            <div class="col-6 col-sm-3 d-flex justify-content-center gap-3">
              <input type="radio" class="peer hidden form-check-input" name="fiz" id="paypal" onchange="Fizetesmodvalaszto(this)">
              <label 
                for="paypal" 
                class="
                peer-checked:bg-slate-900 
                peer-checked:text-zinc-200 
                dark:peer-checked:bg-slate-700 
                dark:peer-checked:text-zinc-200 
                p-2  
                rounded-xl 
                transition-all 
                duration-200 
                
                gap-2 
                cursor-pointer 
                border border-gray-400 
                dark:border-gray-700 
                hover:shadow-md 
                d-flex align-items-center "
              >
                
                <i class="bi bi-paypal"></i>
                
                 PayPal
              </label>
              
            </div>

            <div class="col-6 col-sm-3 d-flex justify-content-center gap-3">
              <input type="radio" class="peer hidden form-check-input" name="fiz" id="kartya" onchange="Fizetesmodvalaszto(this)">
              <label 
                for="kartya" 
                class="
                peer-checked:bg-slate-900 
                peer-checked:text-zinc-200 
                dark:peer-checked:bg-slate-700 
                dark:peer-checked:text-zinc-200 
                p-2 
                rounded-xl 
                transition-all 
                duration-200 
                gap-2 
                cursor-pointer 
                border border-gray-400 
                dark:border-gray-700 
                hover:shadow-md 
                d-flex align-items-center "
              >
                
                
                <i class="bi bi-credit-card"></i>
                Bankkártya
              </label>
              
            </div>


          </div>

          <div class="col-12 p-2 m-2 d-flex flex-column flex-sm-row" id="fm">
          
          
          </div>



        </div>

        <div class="col-12 col-lg-6">
          <div class="col-12 text-center p-2">
            Szállítási mód kiválasztása
          </div>

          <div class="col-12 d-flex flex-row justify-content-center p-3">
            <div class="d-flex justify-content-center gap-3 m-2">
              
              <input type="radio" class="form-check-input peer hidden" name="szal" id="mpl" onchange="Szallitasmodvalaszto(this)">
              <label
                for="mpl" 
                
                class="
                peer-checked:bg-slate-900 
                peer-checked:text-zinc-200 
                dark:peer-checked:bg-slate-700 
                dark:peer-checked:text-zinc-200 
                p-2  
                rounded-xl 
                transition-all 
                duration-200 
                
                gap-2 
                cursor-pointer 
                border border-gray-400 
                dark:border-gray-700 
                hover:shadow-md 
                d-flex align-self-center
                " 
              >
                
                <img src="img/mplsvg.png" alt="MPL logo" class="w-5 h-5">
                
                <span>MPL</span>
              </label>
              
            </div>

            <div class="d-flex justify-content-center gap-3">
              <input type="radio" class="peer hidden form-check-input" name="szal" id="expressone" onchange="Szallitasmodvalaszto(this)">
              <label 
                for="expressone" 
                class="
                peer-checked:bg-slate-900 
                peer-checked:text-zinc-200 
                dark:peer-checked:bg-slate-700 
                dark:peer-checked:text-zinc-200 
                p-2  
                rounded-xl 
                transition-all 
                duration-200 
                
                gap-2 
                cursor-pointer 
                border border-gray-400 
                dark:border-gray-700 
                hover:shadow-md 
                d-flex align-self-center"
              >
                
                <img src="img/expressonesvg.png" alt="Express One logo" class="w-5 h-5">
                
                <span>Express One</span> 
              </label>
              
            </div>

            <div class="d-flex justify-content-center gap-3">
              <input type="radio" class="peer hidden form-check-input" name="szal" id="gls" onchange="Szallitasmodvalaszto(this)">
              <label 
                for="gls" 
                class="
                peer-checked:bg-slate-900 
                peer-checked:text-zinc-200 
                dark:peer-checked:bg-slate-700 
                dark:peer-checked:text-zinc-200 
                p-2 
                rounded-xl 
                transition-all 
                duration-200 
                gap-2 
                cursor-pointer 
                border border-gray-400 
                dark:border-gray-700 
                hover:shadow-md 
                d-flex align-self-center"
              >
                
                
                <img src="img/gls.png" alt="GLS logo" class="w-5 h-5 rounded">
                
                <span>GLS</span>
              </label>
              
            </div>


          </div>



        </div>


      <div class="col-12 mt-2 p-1 text-danger text-center" id="hibauzen"></div>


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
        bi bi-credit-card" id="FIZ" onclick='Fizetésclick(${JSON.stringify(li)})'> Fizetés</button>
    `;
    $("#lab").html(navigacio);
}



function Fizetesmodvalaszto(sigma) {
  

  if(sigma.id == "googlepay") {
    fizmod = "Google Pay";
    $("#fm").html(`
      <div class="col-12 text-center">
        <i class="bi bi-google fs-1"></i>
        <p class="p-2">A Google Pay fizetési módot választottad.</p>
      </div>
    `);
  }
  else if(sigma.id == "paypal") {
    fizmod = "PayPal";
    $("#fm").html(`
      <div class="col-12 text-center">
        <i class="bi bi-paypal fs-1"></i>
        <p class="p-2">A PayPal fizetési módot választottad.</p>
      </div>
    `);
  }

  else if(sigma.id == "applepay") {
    fizmod = "Apple Pay";
    $("#fm").html(`
      <div class="col-12 text-center">
        <i class="bi bi-apple fs-1"></i>
        <p class="p-2">Az Apple Pay fizetési módot választottad.</p>
      </div>
    `);
  }

  else if(sigma.id == "kartya") {
    fizmod = "Bankkártya";
    $("#fm").html(`
      <div 
      class="
        col-12 col-sm-6 p-2">
        
        <label for="kszam" class="p-2">Kártyaszám</label>
        <input 
            inputmode="numeric" 
            autocomplete="cc-number"
            maxlength="19"
            placeholder="1234 5678 9012 3456"
            
            class="form-control 
            rounded-4 
            shadow-xl 
            bg-zinc-50"
             style="border: none;"
            id="kszam"
        >
      </div>

      <div class="col-12 col-sm-3 p-2">
        <label for="lejarat" class="p-2">Lejárat</label>
        <input 
        inputmode="numeric"
        placeholder="MM/YY" 
        maxlength="5" 
        autocomplete="cc-exp" 
        
        class="form-control 
            rounded-4 
            shadow-xl 
            bg-zinc-50" style="border: none;" id="lejarat">

      </div>

      <div class="col-12 col-sm-3 p-2">
        <label for="lejarat" class="p-2">CVC</label>
        <input 
        inputmode="numeric"
        placeholder="123" 
        maxlength="3" 
        autocomplete="cc-csc" 
        
        class="form-control 
            rounded-4 
            shadow-xl 
            bg-zinc-50" style="border: none;" id="cvc">

      </div>

    `);
  }
  console.log(fizmod);
}

function Szallitasmodvalaszto(sigma) {
  if(sigma.id == "mpl") {
    szallmod = "MPL";
  }
  else if(sigma.id == "expressone") {
    szallmod = "Express One";
  }
  else if(sigma.id == "gls") {
    szallmod = "GLS";
  }
  console.log(szallmod);
}



async function Fizetésclick(li) {
  // rákattiontoo a fizetés gombra
  // ellenörizzük, hogy minden rendben van-e
    try{
      for (const element of li) { // ellenőrizzük, hogy abból a tételből van a még készleten a kivánt darabból
        var ell = await ajax_post(`rendeles_ellenorzes?ID_TERMEK=${element.ID_TERMEK}&MENNYISEG=${element.MENNYISEG}`, 1);
        if(ell.rows[0].allapot == "karramba") {
            throw `Az egyik termékből nincs elég készleten. A rendelése módosítva lett.`;
        }
      }
      if(szallmod == "" ||  fizmod == "") { // ha nincs kiválasztva fizetési vagy szállítási mód
        throw "Válassza ki a fizetési és szállítási módot!";
      }
      
       // ha minden jó akkor elküldjük a rendelést
        let kaki = `${_cim} ${_iszam} ${_city} ${_country}`;            
        await ajax_post(`rendeles?FIZMOD=${fizmod}&SZALLMOD=${szallmod}&MEGJEGYZES=${megjegyzes}&SZALLCIM=${kaki}&NEV=${_nev}&EMAIL=${_emil}`, 1);

        //email küldés a backendnek
        console.log( "htmltobck : "+ htmtoback );

        await ajax_post( `send-email?name=OKSA&email=szaloky.aron@csany-zeg.hu&html=${htmtoback.replace(/\s+/g, ' ')}&subject=Rendelés visszaigazolása`, 1)
              
        console.log("Email elküldve a backendnek.");


        
        KosarTetelDB(); // frissítjük a kosár db-t
        document.getElementById("home_button").click(); // visszairányítjuk a főoldalra

        üzen("A terméket sikeresen megvásároltad.","success");
        $("#fizetes").modal("hide");
        
    }
    catch(e){
      if(e == "Válassza ki a fizetési és szállítási módot!"){
        document.getElementById("hibauzen").innerHTML = e;
        return;
      }


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