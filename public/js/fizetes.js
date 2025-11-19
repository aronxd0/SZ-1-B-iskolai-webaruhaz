

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

                     value="" 

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
      <div class="row d-flex flex-column flex-lg-row p-3">
        <div class="col-12 col-lg-6 mx-auto mt-6 space-y-2">

          <!-- bankkartya -->
          <label 
            class="flex items-center justify-between p-4 rounded-xl cursor-pointer
                  border transition-all duration-200
                  has-[:checked]:bg-indigo-50 
                  has-[:checked]:border-indigo-400 
                  has-[:checked]:shadow-md">

            <div class="flex items-center gap-3">
              <input type="radio" name="fizz" class="form-check-input" checked>
              <span class="font-semibold">Bankkártya</span>
            </div>

            <div class="flex flex-col text-right">
              <span class=" d-flex justify-content-end font-semibold">
                <svg xmlns="http://www.w3.org/2000/svg" width="50" height="30" viewBox="0 0 780 500" fill="none">
                  <path d="M465.738 113.525H313.812V386.475H465.738V113.525Z" fill="#FF5A00"/>
                  <path d="M323.926 250C323.926 194.545 349.996 145.326 390 113.525C360.559 90.3769 323.42 76.3867 282.91 76.3867C186.945 
                  76.3867 109.297 154.035 109.297 250C109.297 345.965 186.945 423.614 282.91 423.614C323.42 423.614 360.559 409.623 390 
                  386.475C349.94 355.123 323.926 305.455 323.926 250Z" fill="#EB001B"/>
                  <path d="M670.711 250C670.711 345.965 593.062 423.614 497.098 423.614C456.588 423.614 419.449 409.623 390.008 
                  386.475C430.518 354.618 456.082 305.455 456.082 250C456.082 194.545 430.012 145.326 390.008 113.525C419.393 90.3769 
                  456.532 76.3867 497.041 76.3867C593.062 76.3867 670.711 154.541 670.711 250Z" fill="#F79E1B"/>
                </svg>

                <svg xmlns="http://www.w3.org/2000/svg" width="50" height="30" viewBox="0 0 780 500" fill="none">
                  <g clip-path="url(#clip0_6278_125833)">
                  <path d="M780 0H0V500H780V0Z" fill="#1434CB"/>
                  <path d="M489.823 143.111C442.988 143.111 401.134 167.393 401.134 212.256C401.134 263.706 
                  475.364 267.259 475.364 293.106C475.364 303.989 462.895 313.731 441.6 313.731C411.377 313.731 
                  388.789 300.119 388.789 300.119L379.123 345.391C379.123 345.391 405.145 356.889 439.692 356.889C490.898
                   356.889 531.19 331.415 531.19 285.784C531.19 231.419 456.652 227.971 456.652 203.981C456.652 195.455 466.887 
                   186.114 488.122 186.114C512.081 186.114 531.628 196.014 531.628 196.014L541.087 152.289C541.087 152.289 519.818 
                   143.111 489.823 143.111ZM61.3294 146.411L60.1953 153.011C60.1953 153.011 79.8988 156.618 97.645 163.814C120.495 172.064 
                   122.122 176.868 125.971 191.786L167.905 353.486H224.118L310.719 146.411H254.635L198.989 287.202L176.282 167.861C174.199 
                   154.203 163.651 146.411 150.74 146.411H61.3294ZM333.271 146.411L289.275 353.486H342.756L386.598 146.411H333.271ZM631.554 
                   146.411C618.658 146.411 611.825 153.318 606.811 165.386L528.458 353.486H584.542L595.393 322.136H663.72L670.318 
                   353.486H719.805L676.633 146.411H631.554ZM638.848 202.356L655.473 280.061H610.935L638.848 202.356Z" fill="white"/>
                  </g>
                  <defs>
                  <clipPath id="clip0_6278_125833">
                  <rect width="780" height="500" fill="white"/>
                  </clipPath>
                  </defs>
                </svg>
              </span>
            </div>
          </label>

          <!-- paypal -->
          <label 
            class="flex items-center justify-between p-4 rounded-xl cursor-pointer
                  border transition-all duration-200
                  has-[:checked]:bg-indigo-50 
                  has-[:checked]:border-indigo-400 
                  has-[:checked]:shadow-md">

            <div class="flex items-center gap-3">
              <input type="radio" name="fizz" class="form-check-input">
              <span class="font-semibold">PayPal</span>
            </div>

            <div class="flex flex-col text-right">
              <svg xmlns="http://www.w3.org/2000/svg" width="50" height="30" 
              enable-background="new 0 0 780 500" version="1.1" viewBox="0 0 780 500" 
              xml:space="preserve"><path d="M725,0H55C24.673,0,0,24.673,0,55v391c0,30.327,24.673,55,55,55h670c30.325,0,55-24.673,55-55V55 
               C780,24.673,755.325,0,725,0z" fill="#FFF"/><path d="m168.38 169.85c-8.399-5.774-19.359-8.668-32.88-8.668h-52.346c-4.145 0-6.435
                2.073-6.87 6.214l-21.265 133.48c-0.221 1.311 0.107 2.51 0.981 3.6 0.869 1.093 1.962 1.636 3.271 1.636h24.864c4.361 0 6.758-2.068 
                7.198-6.216l5.888-35.985c0.215-1.744 0.982-3.162 2.291-4.254 1.308-1.09 2.944-1.804 4.907-2.13 1.963-0.324 3.814-0.487 5.562-0.487 1.743
                 0 3.814 0.11 6.217 0.327 2.397 0.218 3.925 0.324 4.58 0.324 18.756 0 33.478-5.285 44.167-15.866 10.684-10.577 16.032-25.244 16.032-44.004
                  0-12.868-4.202-22.192-12.597-27.975zm-26.99 40.08c-1.094 7.635-3.926 12.649-8.506 15.049-4.581 2.403-11.124 3.597-19.629 3.597l-10.797 
                  0.328 5.563-35.007c0.434-2.397 1.851-3.597 4.252-3.597h6.218c8.72 0 15.049 1.257 18.975 3.761 3.924 2.51 5.233 7.802 3.924 15.869z" 
                  fill="#003087"/><path d="m720.79 161.18h-24.208c-2.405 0-3.821 1.2-4.253 3.599l-21.267 136.1-0.328 0.654c0 1.096 0.437 2.127 1.311
                   3.109 0.868 0.979 1.963 1.471 3.271 1.471h21.595c4.138 0 6.429-2.068 6.871-6.215l21.265-133.81v-0.325c-2e-3 -3.053-1.424-4.58-4.257-4.58z"
                    fill="#009CDE"/><path d="m428.31 213.86c0-1.088-0.438-2.126-1.306-3.106-0.875-0.981-1.857-1.474-2.945-1.474h-25.191c-2.404 0-4.366 
                    1.096-5.89 3.271l-34.679 51.04-14.394-49.075c-1.096-3.488-3.493-5.236-7.198-5.236h-24.54c-1.093 0-2.075 0.492-2.942 1.474-0.875 0.98-1.309
                     2.019-1.309 3.106 0 0.44 2.127 6.871 6.379 19.303 4.252 12.434 8.833 25.848 13.741 40.244 4.908 14.394 7.468 22.031 7.688 22.898-17.886 
                     24.43-26.826 37.518-26.826 39.26 0 2.838 1.417 4.254 4.253 4.254h25.191c2.399 0 4.361-1.088 5.89-3.271l83.427-120.4c0.433-0.433
                      0.651-1.193 0.651-2.289z" fill="#003087"/><path d="m662.89 209.28h-24.865c-3.056 0-4.904 3.599-5.559 10.797-5.677-8.72-16.031-13.088-31.083-13.088-15.704
                       0-29.065 5.89-40.077 17.668-11.016 11.779-16.521 25.631-16.521 41.551 0 12.871 3.761 23.121 11.285 30.752 7.524 7.639 17.611 11.451 30.266 11.451 6.323
                        0 12.757-1.311 19.3-3.926 6.544-2.617 11.665-6.105 15.379-10.469 0 0.219-0.222 1.198-0.654 2.942-0.44 1.748-0.655 3.06-0.655 3.926 0
                         3.494 1.414 5.234 4.254 5.234h22.576c4.138 0 6.541-2.068 7.193-6.216l13.415-85.389c0.215-1.309-0.111-2.507-0.981-3.599-0.876-1.087-1.964-1.634-3.273-1.634zm-42.694
                          64.452c-5.562 5.453-12.269 8.179-20.12 8.179-6.328 0-11.449-1.742-15.377-5.234-3.928-3.483-5.891-8.282-5.891-14.396 0-8.064 2.727-14.884 8.181-20.446 5.446-5.562
                           12.214-8.343 20.284-8.343 6.102 0 11.174 1.8 15.212 5.397 4.032 3.599 6.055 8.563 6.055 14.888-1e-3 7.851-2.783 14.505-8.344 19.955z" fill="#009CDE"/>
                           <path d="m291.23 209.28h-24.864c-3.058 0-4.908 3.599-5.563 10.797-5.889-8.72-16.25-13.088-31.081-13.088-15.704 0-29.065 5.89-40.078 17.668-11.016 11.779-16.521
                            25.631-16.521 41.551 0 12.871 3.763 23.121 11.288 30.752 7.525 7.639 17.61 11.451 30.262 11.451 6.104 0 12.433-1.311 18.975-3.926 6.543-2.617 11.778-6.105
                             15.704-10.469-0.875 2.616-1.309 4.907-1.309 6.868 0 3.494 1.417 5.234 4.253 5.234h22.574c4.141 0 6.543-2.068
                              7.198-6.216l13.413-85.389c0.215-1.309-0.112-2.507-0.981-3.599-0.873-1.087-1.962-1.634-3.27-1.634zm-42.695
                               64.614c-5.563 5.351-12.382 8.017-20.447 8.017-6.329 0-11.4-1.742-15.214-5.234-3.819-3.483-5.726-8.282-5.726-14.396
                                0-8.064 2.725-14.884 8.18-20.446 5.449-5.562 12.211-8.343 20.284-8.343 6.104 0 11.175 1.8 15.214 5.398 4.032 3.599
                                 6.052 8.563 6.052 14.888 0 8.069-2.781 14.778-8.343 20.116z" fill="#003087"/>
                                 <path d="m540.04 169.85c-8.398-5.774-19.356-8.668-32.879-8.668h-52.02c-4.364 0-6.765 2.073-7.197
                                  6.214l-21.266 133.48c-0.221 1.312 0.106 2.511 0.981 3.601 0.865 1.092 1.962 1.635 3.271 1.635h26.826c2.617
                                   0 4.361-1.416 5.235-4.252l5.89-37.949c0.216-1.744 0.98-3.162 2.29-4.254 1.309-1.09 2.943-1.803 4.908-2.13 
                                   1.962-0.324 3.812-0.487 5.562-0.487 1.743 0 3.814 0.11 6.214 0.327 2.399 0.218 3.931 0.324 4.58 0.324 18.76 0 
                                   33.479-5.285 44.168-15.866 10.688-10.577 16.031-25.244 16.031-44.004 2e-3 -12.867-4.199-22.191-12.594-27.974zm-33.534
                                    53.82c-4.799 3.271-11.997 4.906-21.592 4.906l-10.47 0.328 5.562-35.007c0.432-2.397 1.849-3.597 4.252-3.597h5.887c4.798
                                     0 8.614 0.218 11.454 0.653 2.831 0.44 5.562 1.799 8.179 4.089 2.618 2.291 3.926 5.618 3.926 9.98 0 9.16-2.402 15.375-7.198 18.648z" fill="#009CDE"/>
                                     </svg>
            </div>
          </label>

          <!-- google pay -->
          <label 
            class="flex items-center justify-between p-4 rounded-xl cursor-pointer
                  border transition-all duration-200
                  has-[:checked]:bg-indigo-50 
                  has-[:checked]:border-indigo-400 
                  has-[:checked]:shadow-md">

            <div class="flex items-center gap-3">
              <input type="radio" name="fizz" class="form-check-input">
              <span class="font-semibold">Google Pay</span>
            </div>

            <div class="flex flex-col text-right">
              <span class="font-semibold">$249 / mo ($2490 / yr)</span>
              <span class="text-sm text-indigo-600">Unlimited active job postings</span>
            </div>
          </label>

          <!-- apple pay -->
          <label 
            class="flex items-center justify-between p-4 rounded-xl cursor-pointer
                  border transition-all duration-200
                  has-[:checked]:bg-indigo-50 
                  has-[:checked]:border-indigo-400 
                  has-[:checked]:shadow-md">

            <div class="flex items-center gap-3">
              <input type="radio" name="fizz" class="form-check-input">
              <span class="font-semibold">Apple Pay</span>
            </div>

            <div class="flex flex-col text-right">
              <span class="font-semibold">$249 / mo ($2490 / yr)</span>
              <span class="text-sm text-indigo-600">Unlimited active job postings</span>
            </div>
          </label>

        </div>


        <div class="col-12 col-lg-6 mx-auto mt-6 space-y-2">

          <!-- mpl -->
          <label 
            class="flex items-center justify-between p-4 rounded-xl cursor-pointer
                  border transition-all duration-200
                  has-[:checked]:bg-indigo-50 
                  has-[:checked]:border-indigo-400 
                  has-[:checked]:shadow-md">

            <div class="flex items-center gap-3">
              <input type="radio" name="szall" class="form-check-input" checked>
              <span class="font-semibold">MPL</span>
            </div>

            <div class="flex flex-col text-right">
              <span class="font-semibold">$29 / mo ($290 / yr)</span>
              <span class="text-sm text-indigo-600">Up to 5 active job postings</span>
            </div>
          </label>

          <!-- gls -->
          <label 
            class="flex items-center justify-between p-4 rounded-xl cursor-pointer
                  border transition-all duration-200
                  has-[:checked]:bg-indigo-50 
                  has-[:checked]:border-indigo-400 
                  has-[:checked]:shadow-md">

            <div class="flex items-center gap-3">
              <input type="radio" name="szall" class="form-check-input">
              <span class="font-semibold">GLS</span>
            </div>

            <div class="flex flex-col text-right">
              <span class="font-semibold">$99 / mo ($990 / yr)</span>
              <span class="text-sm text-indigo-600">Up to 25 active job postings</span>
            </div>
          </label>

          <!-- express one -->
          <label 
            class="flex items-center justify-between p-4 rounded-xl cursor-pointer
                  border transition-all duration-200
                  has-[:checked]:bg-indigo-50 
                  has-[:checked]:border-indigo-400 
                  has-[:checked]:shadow-md">

            <div class="flex items-center gap-3">
              <input type="radio" name="szall" class="form-check-input">
              <span class="font-semibold">Express One</span>
            </div>

            <div class="flex flex-col text-right">
              <span class="font-semibold">$249 / mo ($2490 / yr)</span>
              <span class="text-sm text-indigo-600">Unlimited active job postings</span>
            </div>
          </label>

        </div>
      </div>
      
      `;




      /*
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


      */

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
  let mindenjo = true;
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
        $("#fizetes").modal("hide");
        document.getElementById("cart_button").click();
        mindenjo = false;
    }

    if(mindenjo){
      try{
        const html = `${emailDesign(li)}`;
        
        ajax_post_SpinnerNelkul(
          `send-email?email=${_emil}&subject=${encodeURIComponent("Rendelés visszaigazolása")}&html=${encodeURIComponent(html)}`,
          1
        );
  
      }
      catch{
        console.log("Email küldési hiba!");
      }
      
    } 
    

    
}


function emailDesign(li){
  let rows = "";
  let osszes = 0;

  for(const e of li){
      rows += `
          <tr>
              <td style="padding:10px;border-bottom:1px solid #eee;">
                  ${e.MENNYISEG} db
              </td>
              <td style="padding:10px;border-bottom:1px solid #eee;">
                  ${e.NEV}
              </td>
              <td style="padding:10px;border-bottom:1px solid #eee;font-weight:bold;color:#059669;">
                  ${e.PENZ.toLocaleString()} Ft
              </td>
          </tr>
      `;
      osszes += e.PENZ;
  }

  return `<div style="background:#f6f2e8; padding:20px 0;">
  <div style="
      font-family:Arial, Helvetica, sans-serif;
      max-width:700px;
      margin:auto;
      background:#ffffff;
      border-radius:12px;
      padding:25px 30px;
      border:1px solid #e2e2e2;
  ">
    <div style="
        text-align:center;
        margin-bottom:25px;
        background:#91ffbd;
        padding:20px 0;
        border-radius:10px;
        box-shadow:0 2px 4px rgba(0,0,0,0.08);
    ">
      <h2 style="
          margin:0;
          font-size:24px;
          color:#064e3b;
      ">
        Hurrá! A rendelésed sikeresen beérkezett hozzánk!
      </h2>

      <h6 style="
          font-size:16px;
          color:#064e3b;
          font-weight:400;
          margin-top:12px;
          line-height:1.5;
      ">
        Kedves ${_nev}!<br>
        Köszönjük, hogy nálunk vásároltál!  
        Ha bármilyen kérdésed van, fordulj hozzánk bizalommal.  
        Az email további részében összefoglaltuk a rendelésed adatait. <br>
        <strong>Üdvözlettel, a Csany Websáruház csapata</strong>
      </h6>
    </div>

    
    <h2 style="
        margin-top:0;
        font-size:22px;
        color:#065f46;
        text-align:center;
    ">
      Rendelésed tartalma
    </h2>

    <!-- TABLE -->
    <table style="width:100%;border-collapse:collapse;margin-top:20px;font-size:15px;">
      <thead>
        <tr style="background:#e0f7d7;color:#064e3b;">
          <th style="padding:12px;border-bottom:2px solid #cceccc;">Mennyiség</th>
          <th style="padding:12px;border-bottom:2px solid #cceccc;">Termék</th>
          <th style="padding:12px;border-bottom:2px solid #cceccc;">Ár</th>
        </tr>
      </thead>

      <tbody style="text-align:center; background:#ffffff;">
        ${rows}
      </tbody>
    </table>

    <!-- TOTALS -->
    <div style="
        text-align:right;
        margin-top:25px;
        font-size:15px;
        color:#047857;
    ">
       Összesen: ${osszes.toLocaleString() } Ft + Áfa
    </div>

    <div style="
        text-align:right; 
        font-size:22px;
        font-weight:bold;
        color:#047857;
    ">
      Végösszeg: ${Math.round(osszes * 1.27).toLocaleString()} Ft
    </div>

  </div>
</div>
  `.replace(/\s+/g, " "); // e-mail kódolási hibák elkerülése
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