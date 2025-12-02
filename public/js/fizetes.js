

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
     
     
     
            

    //$("#cc").html("");
    for (const element of li) {

        htmtoback += ` 
          <div class="row p-2">
            <div class="col-0 col-lg-1"></div>
            <div class=" col-12 
                        col-lg-10   
                        d-flex 
                        flex-column 
                        flex-lg-row 
                        bg-zinc-100 
                        text-slate-900 
                        dark:bg-slate-800 
                        dark:text-zinc-200 
                        shadow-lg  
                        rounded-4 
                        mt-2  
                        p-3 
                        p-xxl-none
                        ">

                <div  
                class="
                    col-12 
                    col-lg-2  
                    d-flex 
                    flex-lg-column 
                    justify-content-between 
                    py-3 p-lg-1
                ">

                    <span class="font-semibold">Mennyiség</span>
                    <span>${element.MENNYISEG} db</span>
                </div>
                        
                <div  
                class="
                    col-12 
                    col-lg-8  
                    d-flex 
                    flex-lg-column 
                    justify-content-between 
                    py-3 p-lg-1 
                    border-t border-gray-300 
                    border-b border-gray-300 
                    lg:border-t-0 
                    lg:border-b-0 
                ">
                        <span class="font-semibold">Termék</span>
                        <span class="text-end text-lg-start text-sm">${element.NEV}</span>
                </div>
                    
                

                <div  
                class="
                    col-12 
                    col-lg-2  
                    d-flex 
                    flex-lg-column 
                    justify-content-between 
                    py-3 p-lg-1
                ">
                  <span class="font-semibold">Ár</span>
                  <span class="osszegek text-success">${element.PENZ.toLocaleString()} Ft</span>
                </div>
                
              </div>
              <div class="col-0 col-lg-1"></div>
            </div>
            
            
        
        `

        
    }

    

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
        " data-bs-dismiss="modal" > Mégse</button>

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
        <div class="col-12 col-lg-6 mx-auto mt-5 space-y-3">
          <span class="text-lg p-1">Válasszon fizetési módot</span>
          <!-- bankkartya -->
          <label 
            class="
            bg-zinc-50 
            shadow-xl 
            text-slate-900 
            dark:bg-slate-800 
            dark:text-zinc-200 
            hover:bg-gray-200 
            hover:outline outline-black/10 
            dark:hover:bg-gray-700 
            dark:hover:-outline-offset-1 
            dark:hover:outline-white/10 
            flex items-center justify-between p-4 rounded-xl cursor-pointer
                   transition-all duration-200
                  has-[:checked]:bg-indigo-100 
                            has-[:checked]:border-indigo-400 
                            has-[:checked]:border 
                            has-[:checked]:shadow-md

                            dark:has-[:checked]:bg-sky-950
                            dark:has-[:checked]:border-sky-700
                            dark:has-[:checked]:border
                  " >

            <div class="flex items-center gap-3">
              <input type="radio" name="fizz" class="form-check-input" id="kartya" onchange="Fizetesmodvalaszto(this)">
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
            class="
            bg-zinc-50 
            shadow-xl 
            text-slate-900 
            dark:bg-slate-800 
            dark:text-zinc-200 
            hover:bg-gray-200 
            hover:outline outline-black/10 
            dark:hover:bg-gray-700 
            dark:hover:-outline-offset-1 
            dark:hover:outline-white/10 
            flex items-center justify-between p-4 rounded-xl cursor-pointer
                   transition-all duration-200
                  has-[:checked]:bg-indigo-100 
                            has-[:checked]:border-indigo-400 
                            has-[:checked]:border 
                            has-[:checked]:shadow-md

                            dark:has-[:checked]:bg-sky-950
                            dark:has-[:checked]:border-sky-700
                            dark:has-[:checked]:border
                  " >

            <div class="flex items-center gap-3">
              <input type="radio" name="fizz" class="form-check-input" id="paypal" onchange="Fizetesmodvalaszto(this)">
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
            class="
            bg-zinc-50 
            text-slate-900 
            shadow-xl 
            dark:bg-slate-800 
            dark:text-zinc-200 
            hover:bg-gray-200 
            hover:outline outline-black/10 
            dark:hover:bg-gray-700 
            dark:hover:-outline-offset-1 
            dark:hover:outline-white/10 
            flex items-center justify-between p-4 rounded-xl cursor-pointer
                   transition-all duration-200
                  has-[:checked]:bg-indigo-100 
                            has-[:checked]:border-indigo-400 
                            has-[:checked]:border 
                            has-[:checked]:shadow-md

                            dark:has-[:checked]:bg-sky-950
                            dark:has-[:checked]:border-sky-700
                            dark:has-[:checked]:border
                  " >

            <div class="flex items-center gap-3">
              <input type="radio" name="fizz" class="form-check-input" id="googlepay" onchange="Fizetesmodvalaszto(this)">
              <span class="font-semibold">Google Pay</span>
            </div>

            <div class="flex flex-col text-right">
              <svg height="30" width="50" version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 2387.3 948" xml:space="preserve" fill="#000000"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <style type="text/css"> .st0{fill:#5F6368;} .st1{fill:#4285F4;} .st2{fill:#34A853;} .st3{fill:#FBBC04;} .st4{fill:#EA4335;} </style> <g> <path class="st0" d="M1129.1,463.2V741h-88.2V54.8h233.8c56.4-1.2,110.9,20.2,151.4,59.4c41,36.9,64.1,89.7,63.2,144.8 c1.2,55.5-21.9,108.7-63.2,145.7c-40.9,39-91.4,58.5-151.4,58.4L1129.1,463.2L1129.1,463.2z M1129.1,139.3v239.6h147.8 c32.8,1,64.4-11.9,87.2-35.5c46.3-45,47.4-119.1,2.3-165.4c-0.8-0.8-1.5-1.6-2.3-2.3c-22.5-24.1-54.3-37.3-87.2-36.4L1129.1,139.3 L1129.1,139.3z M1692.5,256.2c65.2,0,116.6,17.4,154.3,52.2c37.7,34.8,56.5,82.6,56.5,143.2V741H1819v-65.2h-3.8 c-36.5,53.7-85.1,80.5-145.7,80.5c-51.7,0-95-15.3-129.8-46c-33.8-28.5-53-70.7-52.2-115c0-48.6,18.4-87.2,55.1-115.9 c36.7-28.7,85.7-43.1,147.1-43.1c52.3,0,95.5,9.6,129.3,28.7v-20.2c0.2-30.2-13.2-58.8-36.4-78c-23.3-21-53.7-32.5-85.1-32.1 c-49.2,0-88.2,20.8-116.9,62.3l-77.6-48.9C1545.6,286.8,1608.8,256.2,1692.5,256.2L1692.5,256.2z M1578.4,597.3 c-0.1,22.8,10.8,44.2,29.2,57.5c19.5,15.3,43.7,23.5,68.5,23c37.2-0.1,72.9-14.9,99.2-41.2c29.2-27.5,43.8-59.7,43.8-96.8 c-27.5-21.9-65.8-32.9-115-32.9c-35.8,0-65.7,8.6-89.6,25.9C1590.4,550.4,1578.4,571.7,1578.4,597.3L1578.4,597.3z M2387.3,271.5 L2093,948h-91l109.2-236.7l-193.6-439.8h95.8l139.9,337.3h1.9l136.1-337.3L2387.3,271.5z"></path> </g> <path class="st1" d="M772.8,403.2c0-26.9-2.2-53.7-6.8-80.2H394.2v151.8h212.9c-8.8,49-37.2,92.3-78.7,119.8v98.6h127.1 C729.9,624.7,772.8,523.2,772.8,403.2L772.8,403.2z"></path> <path class="st2" d="M394.2,788.5c106.4,0,196-34.9,261.3-95.2l-127.1-98.6c-35.4,24-80.9,37.7-134.2,37.7 c-102.8,0-190.1-69.3-221.3-162.7H42v101.6C108.9,704.5,245.2,788.5,394.2,788.5z"></path> <path class="st3" d="M172.9,469.7c-16.5-48.9-16.5-102,0-150.9V217.2H42c-56,111.4-56,242.7,0,354.1L172.9,469.7z"></path> <path class="st4" d="M394.2,156.1c56.2-0.9,110.5,20.3,151.2,59.1L658,102.7C586.6,35.7,492.1-1.1,394.2,0 C245.2,0,108.9,84.1,42,217.2l130.9,101.6C204.1,225.4,291.4,156.1,394.2,156.1z"></path> </g></svg>
            </div>
          </label>

          <!-- apple pay -->
          <label 
            class="
            bg-zinc-50 
            text-slate-900 
            shadow-xl 
            dark:bg-slate-800 
            dark:text-zinc-200 
            hover:bg-gray-200 
            hover:outline outline-black/10 
            dark:hover:bg-gray-700 
            dark:hover:-outline-offset-1 
            dark:hover:outline-white/10 
            flex items-center justify-between p-4 rounded-xl cursor-pointer
                   transition-all duration-200
                  has-[:checked]:bg-indigo-100 
                            has-[:checked]:border-indigo-400 
                            has-[:checked]:border 
                            has-[:checked]:shadow-md

                            dark:has-[:checked]:bg-sky-950
                            dark:has-[:checked]:border-sky-700
                            dark:has-[:checked]:border
                  ">

            <div class="flex items-center gap-3">
              <input type="radio" name="fizz" class="form-check-input" id="applepay" onchange="Fizetesmodvalaszto(this)">
              <span class="font-semibold">Apple Pay</span>
            </div>

            <div class="flex flex-col text-right">

              <svg width="60" height="40" 
               fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" 
              stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier">
               <rect x="0.5" y="0.5" width="57" height="39" rx="3.5" fill="white" stroke="#F3F3F3"></rect> <path fill-rule="evenodd" clip-rule="evenodd" 
               d="M17.5771 14.9265C17.1553 15.4313 16.4803 15.8294 15.8053 15.7725C15.7209 15.09 16.0513 14.3649 16.4381 13.9171C16.8599 13.3981 17.5982 
               13.0284 18.1959 13C18.2662 13.7109 17.992 14.4076 17.5771 14.9265ZM18.1888 15.9076C17.5942 15.873 17.0516 16.0884 16.6133 16.2624C16.3313 16.3744 16.0924 16.4692 15.9107 16.4692C15.7068 16.4692 15.4581 16.3693 15.1789 16.2571C14.813 16.1102 14.3947 15.9422 13.956 15.9502C12.9506 15.9645 12.0154 16.5403 11.5021 17.4573C10.4474 19.2915 11.2279 22.0071 12.2474 23.5C12.7467 24.2393 13.3443 25.0498 14.1318 25.0213C14.4783 25.0081 14.7275 24.9012 14.9854 24.7905C15.2823 24.6631 15.5908 24.5308 16.0724 24.5308C16.5374 24.5308 16.8324 24.6597 17.1155 24.7834C17.3847 24.9011 17.6433 25.014 18.0271 25.0071C18.8428 24.9929 19.356 24.2678 19.8553 23.5284C20.394 22.7349 20.6307 21.9605 20.6667 21.843L20.6709 21.8294C20.67 21.8285 20.6634 21.8254 20.6516 21.82C20.4715 21.7366 19.095 21.0995 19.0818 19.391C19.0686 17.957 20.1736 17.2304 20.3476 17.116C20.3582 17.109 20.3653 17.1043 20.3685 17.1019C19.6654 16.0498 18.5685 15.936 18.1888 15.9076ZM23.8349 24.9289V13.846H27.9482C30.0717 13.846 31.5553 15.3246 31.5553 17.4858C31.5553 19.6469 30.0435 21.1398 27.892 21.1398H25.5365V24.9289H23.8349ZM25.5365 15.2962H27.4982C28.9748 15.2962 29.8185 16.0924 29.8185 17.4929C29.8185 18.8934 28.9748 19.6967 27.4912 19.6967H25.5365V15.2962ZM37.1732 23.5995C36.7232 24.4668 35.7318 25.0142 34.6631 25.0142C33.081 25.0142 31.9771 24.0616 31.9771 22.6256C31.9771 21.2038 33.0459 20.3863 35.0217 20.2654L37.1451 20.1374V19.5261C37.1451 18.6232 36.5615 18.1327 35.5209 18.1327C34.6631 18.1327 34.0373 18.5806 33.9107 19.263H32.3779C32.4271 17.827 33.7631 16.782 35.5701 16.782C37.5177 16.782 38.7834 17.8128 38.7834 19.4123V24.9289H37.2084V23.5995H37.1732ZM35.1201 23.6991C34.2131 23.6991 33.6365 23.2583 33.6365 22.5829C33.6365 21.8863 34.192 21.481 35.2537 21.4171L37.1451 21.2962V21.9218C37.1451 22.9597 36.2732 23.6991 35.1201 23.6991ZM44.0076 25.3626C43.3256 27.3033 42.5451 27.9431 40.8857 27.9431C40.7592 27.9431 40.3373 27.9289 40.2388 27.9005V26.5711C40.3443 26.5853 40.6045 26.5995 40.7381 26.5995C41.4904 26.5995 41.9123 26.2796 42.1724 25.4479L42.3271 24.9573L39.4443 16.8886H41.2232L43.2271 23.436H43.2623L45.2662 16.8886H46.9959L44.0076 25.3626Z" fill="#000000"></path> </g></svg>

            </div>
          </label>

        </div>


        <div class="col-12 col-lg-6 mx-auto mt-5 space-y-3">
          <span class="text-lg p-1">Válasszon szállítási módot</span>
          <!-- mpl -->
          <label 
            class="
            bg-zinc-50 
            shadow-xl 
            text-slate-900 
            dark:bg-slate-800 
            dark:text-zinc-200 
            hover:bg-gray-200 
            hover:outline outline-black/10 
            dark:hover:bg-gray-700 
            dark:hover:-outline-offset-1 
            dark:hover:outline-white/10 
            flex items-center justify-between p-4 rounded-xl cursor-pointer
                   transition-all duration-200
                  has-[:checked]:bg-indigo-100 
                            has-[:checked]:border-indigo-400 
                            has-[:checked]:border 
                            has-[:checked]:shadow-md

                            dark:has-[:checked]:bg-sky-950
                            dark:has-[:checked]:border-sky-700
                            dark:has-[:checked]:border
                  " >

            <div class="flex items-center gap-3">
              <input type="radio" name="szall" class="form-check-input" id="mpl" onchange="Szallitasmodvalaszto(this)">
              <span class="font-semibold">MPL</span>
            </div>

            <div class="flex flex-col text-right">
              <img src="img/mplsvg.png" alt="MPL logo" class="w-8 h-8">
            </div>
          </label>

          <!-- gls -->
          <label 
            class="
            bg-zinc-50 
            shadow-xl 
            text-slate-900 
            dark:bg-slate-800 
            dark:text-zinc-200 
            hover:bg-gray-200 
            hover:outline outline-black/10 
            dark:hover:bg-gray-700 
            dark:hover:-outline-offset-1 
            dark:hover:outline-white/10 
            flex items-center justify-between p-4 rounded-xl cursor-pointer
                   transition-all duration-200
                  has-[:checked]:bg-indigo-100 
                            has-[:checked]:border-indigo-400 
                            has-[:checked]:border 
                            has-[:checked]:shadow-md

                            dark:has-[:checked]:bg-sky-950
                            dark:has-[:checked]:border-sky-700
                            dark:has-[:checked]:border
                  " >

            <div class="flex items-center gap-3">
              <input type="radio" name="szall" class="form-check-input" id="gls" onchange="Szallitasmodvalaszto(this)">
              <span class="font-semibold">GLS</span>
            </div>

            <div class="flex flex-col text-right">
              <img src="img/gls.png" alt="GLS logo" class="w-8 h-8 rounded">
            </div>
          </label>

          <!-- express one -->
          <label 
            class="
            bg-zinc-50 
            text-slate-900 
            shadow-xl 
            dark:bg-slate-800 
            dark:text-zinc-200 
            hover:bg-gray-200 
            hover:outline outline-black/10 
            dark:hover:bg-gray-700 
            dark:hover:-outline-offset-1 
            dark:hover:outline-white/10 
            flex items-center justify-between p-4 rounded-xl cursor-pointer 
                  transition-all duration-200
                  has-[:checked]:bg-indigo-100 
                            has-[:checked]:border-indigo-400 
                            has-[:checked]:border 
                            has-[:checked]:shadow-md

                            dark:has-[:checked]:bg-sky-950
                            dark:has-[:checked]:border-sky-700
                            dark:has-[:checked]:border
                  " >

            <div class="flex items-center gap-3">
              <input type="radio" name="szall" class="form-check-input" id="expressone" onchange="Szallitasmodvalaszto(this)">
              <span class="font-semibold">Express One</span>
            </div>

            <div class="flex flex-col text-right">
              <img src="img/expressonesvg.png" alt="Express One logo" class="w-8 h-8">
            </div>
          </label>

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
        await ajax_post(`rendeles?FIZMOD=${fizmod}&SZALLMOD=${szallmod}&MEGJEGYZES=${megjegyzes}&SZALLCIM=${kaki}&NEV=${_nev}&EMAIL=${_emil}&AFA=${(await ajax_post(`afa`, 1)).rows[0].AFA}`, 1);

        //email küldés a backendnek
        
        KosarTetelDB(); // frissítjük a kosár db-t
        

        üzen("A terméket sikeresen megvásároltad.","success");
        $("#fizetes").modal("hide");
        //$("#home_button").trigger("click"); //document.getElementById("home_button").click(); // visszairányítjuk a főoldalra
        console.log("ide jut el xd");
        
        
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
        const html = await emailDesign(li);
        
        ajax_post_SpinnerNelkul("send-email", { // 2 adata egyfajta tömb amit majd a backend fogad
          email: _emil,
          subject: "Rendelés visszaigazolása",
          html: html
      });
      FizetesUtan();
      console.log("Ez a minden jo xd");
  
      }
      catch{
        console.log("Email küldési hiba!");
      }
      
    } 
}


async function emailDesign(li) {
  let rows = "";
  let osszes = 0;

  // Összeg + sorok
  for (const e of li) {
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

  // ÁFA-t csak egyszer kérjük le
  const afaAdat = await ajax_post(`afa`, 1);
  const afa = afaAdat.rows[0].AFA;

  const vegosszeg = Math.round(osszes * (1 + afa / 100)).toLocaleString();

  return `
  <div style="background:#f6f2e8; padding:20px 0;">
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
        <div style="text-align:center; margin-bottom:15px;">
          <img src="cid:logo2@example.com" style="width:200px; height:auto;" />
        </div>

        <h2 style="margin:0;font-size:24px;color:#064e3b;">
          Hurrá! A rendelésed sikeresen beérkezett hozzánk!
        </h2>

        <h6 style="font-size:16px;color:#064e3b;font-weight:400;margin-top:12px;line-height:1.5;">
          Kedves ${_nev}!<br>
          Köszönjük, hogy nálunk vásároltál!<br>
          Az alábbiakban összefoglaltuk a rendelés tartalmát.
        </h6>
      </div>

      <h2 style="
        margin-top:0;
        font-size:22px;
        color:#065f46;
        text-align:center;
      ">Rendelésed tartalma</h2>

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

      <div style="
        text-align:right;
        margin-top:25px;
        font-size:15px;
        color:#047857;
      ">
        Összesen: ${osszes.toLocaleString()} Ft + ${afa}% áfa
      </div>

      <div style="
        text-align:right; 
        font-size:22px;
        font-weight:bold;
        color:#047857;
      ">
        Végösszeg: ${vegosszeg} Ft
      </div>

    </div>
  </div>`;
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