let jelenlegi = 1;
let osszesoldal = 0;

$("#rend_button").click(async function () {
    rendelesekmegtolt();
});


// ?? Ha a gombot lenyitják, akkor betöltjük a rendelés tételeit
async function toggleRendeles(rendelId) {
    // AJAX hívás, hogy lekérd a rendelés tételeit
    
    const tetelek = await ajax_post(`rendelesek_tetelei?ID_RENDELES=${rendelId}`, 1);

    let html =`     <div class="col-0 col-lg-2"></div>

                    <div 
                    class="
                    col-12 
                    col-lg-8 
                    text-center 
                    p-2 
                    mt-3 
                    border-b 
                    border-gray-300 
                    dark:border-b 
                    dark:border-gray-600 
                    ">
                        A rendelés tartalma:
                    </div>
                    <div class="col-0 col-lg-2"></div>`; 
    
    for (const elem of tetelek.rows) {
        html += `
        <div class="col-0 col-lg-2"></div>
        <div class="col-12 
            col-lg-8 
            d-flex 
            flex-column 
            flex-sm-row 
    
            text-slate-900
            dark:text-zinc-200 

            border-b
            border-gray-300 
            dark:border-b 
            dark:border-gray-600 

        
            
            
             
            p-xxl-none">
            
                    

                    <div class="col-12 col-sm-3 col-lg-3 d-flex align-self-center justify-content-center p-1">
                        <img src="${elem.FOTOLINK}" onclick="openImage(this.src)" class="img img-fluid img-thumbnail w-10 h-10"  alt="kep">
                    </div>

                    <div class="col-12 col-sm-3 col-lg-3 d-flex align-self-center justify-content-center p-1">
                        <p>${elem.NEV}</p>
                    </div>
                    
                        <div class="col-12 col-sm-3 col-lg-3 d-flex align-self-center justify-content-center p-1">
                        <p>${elem.MENNYISEG} db</p>
                    </div>

                    
                    <div class="col-12 col-sm-3 col-lg-3 d-flex flex-column align-self-center align-items-center align-items-lg-end justify-content-center justify-content-lg-end p-1">
                        <span class="text-slate-900 dark:text-zinc-200 font-semibold text-lg termek_ar">${elem.AR.toLocaleString()} Ft</span> <span> <i> (Nettó)</i></span> 
                    
                    </div>
            

        </div>
        <div class="col-0 col-lg-2"></div>
        `;
    }


    $(`#tetelek_${rendelId}`).html(html);
    
}

function Kovi_rendeles(keri){
    switch(keri.id){
        case "Kovi1_rend": // következő oldal
            if(jelenlegi < osszesoldal){
                jelenlegi++;
            }
            break;

        case "Kovi2_rend": // utolsó oldal
            jelenlegi = osszesoldal;
            break;

        case "Vissza1_rend": // előző oldal
            if(jelenlegi > 1){
                jelenlegi--;
            }
            break;

        case "Vissza2_rend": // első oldal
            jelenlegi = 1;
            break;
    }

    rendelesekmegtolt();
}


async function rendelesekmegtolt(){
    $("#welcome_section").fadeOut(300);
    $("#cart_button").closest(".gombdiv").removeClass("aktiv");
    $("#admin_button").closest(".gombdiv").removeClass("aktiv");
    $("#home_button").closest(".gombdiv").removeClass("aktiv");

    var s = `
        <div class="col-12 text-center p-2 mt-5">
            <span class="text-xl">Rendeléseim</span>
        </div>
    `;

    const itemek = await ajax_post(`rendelesek?OFFSET=${(jelenlegi-1)*10}`, 1);

    osszesoldal = Math.ceil(itemek.maxcount / 10);
    
    if (itemek.maxcount != 0) {
        for (const elemek of itemek.rows) {

            const collapseId = `collapse_${elemek.ID_RENDELES}`;

            s += `<div class="p-3 d-flex justify-content-center">
                <!-- <div class="col-0 col-lg-2"></div> -->

                <div 
                    class="
                    
                        col-12 
                        col-lg-8   
                        d-flex 
                        flex-column 
                        flex-lg-row 
                        bg-zinc-100 
                        text-slate-900 
                        dark:bg-slate-950 
                        dark:!border  
                        dark:!border-zinc-200/20 
                        dark:text-zinc-200 
                        shadow-lg  
                        rounded-4 
                        hover:cursor-pointer 
                        hover:bg-gray-200 
                        hover:outline outline-black/10 
                        dark:hover:bg-gray-800 
                        dark:hover:-outline-offset-1 
                        dark:hover:outline-white/10 
                        my-1  
                        p-3 
                        
                        p-xxl-none" 
                        

                    id="rendeles_${elemek.ID_RENDELES}" 

                    role="button"
                    onclick="toggleRendeles(${elemek.ID_RENDELES})"

                    data-bs-toggle="collapse"
                    data-bs-target="#${collapseId}"
                    aria-expanded="false"
                    aria-controls="${collapseId}"
                >

                    

                    <div 
                    class="
                    col-12 
                    col-lg-4 
                    d-flex 
                    flex-lg-column 
                    justify-content-between 
                    py-3 p-lg-1
                    
                    ">
                        <span><i class="bi bi-hash"></i> Rendelés Azonosító</span>
                        <span>${elemek.ID_RENDELES}</span>
                    </div>

                    <div 
                    class="
                    col-12 
                    col-lg-4 
                    d-flex 
                    flex-lg-column 
                    justify-content-between 
                    py-3 p-lg-1 
                    
                    border-t border-gray-300 
                    border-b border-gray-300 
                    lg:border-t-0 
                    lg:border-b-0 
                    ">
                        <span><i class="bi bi-calendar"></i> Dátum</span>
                        <time class="text-gray-400">
                        
                        
                         <i>${new Date(elemek.DATUM).toLocaleString(navigator.language, {
                                    year: 'numeric',
                                    month: '2-digit',
                                    day: '2-digit',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                    hour12: false
                                })}</i></time>
                    </div>

                    <div 
                    class="
                    col-12 
                    col-lg-4 
                    d-flex 
                    flex-lg-column 
                    justify-content-between 
                    align-items-lg-end 
                    py-3 p-lg-1 
                    
                    ">
                        <span><i class="bi bi-cash"></i> Bruttó végösszeg</span>
                        <span>(áfatartalom: ${elemek.AFA}%)</span>
                        <span class="termek_ar text-slate-900 dark:text-zinc-200 font-semibold">
                            ${parseInt(elemek.RENDELES_VEGOSSZEGE).toLocaleString()} Ft
                        </span>
                    </div>      
                    
                    
                    

                </div>
                <!-- <div class="col-0 col-lg-2"></div> -->
               </div>

                <!-- Itt jelenik meg az összehajtható rész -->

                <div class="collapse !visible mt-2 mb-5" id="${collapseId}">

                   
                <!-- card card-body  || p-3 mind a kettő jó-->


                    
                        <div class="row" id="tetelek_${elemek.ID_RENDELES}">
                            
                        </div>
                    
                </div>
            `;
            
        }
        if(osszesoldal > 1) {
            s+= `<ul class="pagination justify-content-center">
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
                        ${jelenlegi == 1 ? "disabled" : ""}
                        " id="Vissza2_rend" onclick="Kovi_rendeles(this)"> << </a></li>
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
                        ${jelenlegi == 1 ? "disabled" : ""}
                        " id="Vissza1_rend" onclick="Kovi_rendeles(this)">Előző</a></li>
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
                        "><b>${jelenlegi}</b> / <span id="DBoldal">${osszesoldal}</span></a></li>
                
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
                        ${jelenlegi == osszesoldal ? "disabled" : ""}
                        " id="Kovi1_rend" onclick="Kovi_rendeles(this)">Következő</a></li>

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
                        ${jelenlegi == osszesoldal ? "disabled" : ""}
                        " id="Kovi2_rend" onclick="Kovi_rendeles(this)"> >> </a></li>
            </ul>`
        }
        
    } else {
        s = `
            <div class="col-12">
                <div class="text-center p-2">
                    <h5>A boltunkban még nem vásároltál.</h5>
                </div>
            </div>
        `;
    }
    

    // Tisztítás + megjelenítés
    $("#keresett_kifejezes").html("");
    $("#débé").html("");
    $("#nev1").val("");
    $("#pagi").html("");

    $("#content_hely").fadeOut(300, function() {
        $("#content_hely").html(s).fadeIn(300);
    });
}