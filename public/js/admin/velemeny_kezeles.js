
var velemeny_osszes;
var velemeny_jelenlegi = 1;

async function Admin_Velemenykezeles() {
    let varodb = await ajax_call(`velemenyek?szelektalas=1&OFFSET=${(velemeny_jelenlegi-1)}`, "GET", null, true);
    velemeny_osszes = Math.ceil(varodb.maxcount / 10)
    
    if(velemeny_jelenlegi > velemeny_osszes){
        velemeny_jelenlegi = velemeny_osszes
    }
    
    $("#home_button").closest(".gombdiv").removeClass("aktiv");
    $("#cart_button").closest(".gombdiv").removeClass("aktiv");
    $("#welcome_section").fadeOut(300);
    $("#felsosor").removeClass("mt-[100px]");
    $("#kateogoria-carousel").fadeOut(300);
    $("#nezetkicsi").addClass("eltunt");
    $("#nezetnagy").addClass("eltunt");

    $("#content_hely").fadeOut(300, function() {
        $("#content_hely").html(`
            <div class="row d-flex flex-column flex-md-row p-1 mx-auto mt-5 space-y-2">
                <div class="col-12 col-md-4 mx-auto mt-3">
                    <div class="row d-flex justify-content-center">
                        <div role="alert" class="col-12 col-lg-4 !border !border-t-blue-400/50 !border-b-blue-400/50 !border-r-blue-400/50 !border-l-blue-400/50 bg-blue-200/30 text-blue-800 dark:bg-blue-900/20 dark:text-blue-200 w-auto mx-3 px-2 py-3 rounded-4">
                            <i class="bi bi-info-circle-fill"></i>
                            <strong class="font-bold">${varodb.maxcount} db</strong>
                            <span> vélemény vár jóváhagyásra</span>
                        </div>
                        <input type="radio" name="plan" class="form-check-input hidden" id="varo" checked onchange="AdminVelemenyekMutat(this)">
                    </div>
                </div>
            </div>
            <div class="col-12 text-center mt-5" id="velemenyek_hely"></div>
        `).fadeIn(300);

        AdminVelemenyekMutat();
        $("#pagi").html("");
    });
}




async function AdminVelemenyekMutat() {
        try {
            let ss = ``;
            let varo = await ajax_call(`velemenyek?szelektalas=1&OFFSET=${(velemeny_jelenlegi-1)}`, "GET", null, true);

            if (varo.rows.length == 0) { 
                $("#velemenyek_hely").fadeOut(300, function() {
                    $("#velemenyek_hely").html("<div class='col-12 text-xl text-center p-3'>Nincsenek jóváhagyásra váró vélemények.</div>");
                }).fadeIn(300);
            }
            else {
                for (const element of varo.rows) {
                    ss += `

                    <div class="row !border-b !border-gray-300 dark:!border-b dark:!border-sky-950 pb-4 mt-3">
                        <div class="col-12 col-lg-8">
                            <div class="">
                                <div class="flex items-center gap-3 mb-2">
                                <i class="bi bi-person-circle text-3xl"></i>
                                <div>
                                    <p class="font-semibold">${element.NEV}</p>
                                    <p class="text-xs text-zinc-500">${new Date(element.DATUM).toLocaleString(navigator.language, {
                                        year: 'numeric',
                                        month: '2-digit',
                                        day: '2-digit',
                                        hour: '2-digit',
                                        minute: '2-digit',
                                        hour12: false
                                    })}</p>
                                </div>
                                </div>
                                <p class="text-zinc-600 dark:text-zinc-400 text-start">
                                    ${element.SZOVEG.toString()}
                                </p>
                                
                            </div>
                        </div>
                        <div class="col-12 col-lg-4">
                            <div class="d-flex align-items-center h-full justify-content-center justify-content-sm-end gap-2 mt-2">
                                <button 
                                class="
                                px-3 py-1 text-sm lg:text-base rounded-4 !border !border-transparent bg-slate-900 text-zinc-200 dark:bg-gray-800 dark:text-zinc-200 
                                hover:text-red-700  
                                hover:bg-red-400/5  
                                hover:!border-red-700 
                                dark:hover:bg-red-900/20 
                                dark:hover:!border-red-600/30 
                                dark:hover:text-red-600    dark:!border-zinc-200/10  transition-all duration-150 ease-in-out 
                                    w-auto" onclick="Velemeny_Elutasit(${element.ID_VELEMENY})"> 
                                    <i class="bi bi-x-lg "></i> 
                                     Elutasítás
                                </button>

                                <button 
                                class="
                                px-3 py-1 text-sm lg:text-base rounded-4 !border !border-transparent bg-slate-900 text-zinc-200 dark:bg-gray-800 dark:text-zinc-200 
                                hover:text-emerald-600  
                                hover:bg-emerald-400/10   
                                hover:!border-emerald-700 
                                dark:hover:bg-emerald-900/20 
                                dark:hover:!border-emerald-600/60 
                                dark:hover:text-emerald-600  dark:!border-zinc-200/10  transition-all duration-150 ease-in-out 
                                    w-auto" onclick="Velemeny_Elfogad(${element.ID_VELEMENY})"> 
                                    <i class="bi bi-check2 "></i>
                                     Jóváhagyás
                                </button>
                            </div>
                        </div>
                    </div>

                <!--
                <div class="w-100 p-3 rounded-4 shadow-xl bg-zinc-50 text-slate-900 dark:bg-slate-950 dark:!border dark:!border-zinc-200/20 dark:text-zinc-200 mt-3 mb-3 comment">
                    <p class="d-flex justify-content-between">
                        <b><span><i class="bi bi-person"></i> ${element.NEV}</span></b>  
                        <span><i class="bi bi-calendar4-week"></i> ${new Date(element.DATUM).toLocaleString(navigator.language, {year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false })}</span>
                    </p>
                    <p class="d-flex p-2 justify-content-start">
                        <i>${element.SZOVEG.toString().replaceAll("\n","<br>")}</i>
                    </p>
                    <p class="p-2 text-start">
                        <a class="underline decoration-sky-500 hover:text-sky-500 hover:cursor-pointer" onclick="Termek_Mutat(event, ${element.ID_TERMEK})">Ehhez a termékhez</a>
                    </p>
                    <div class="d-flex justify-content-end gap-2 mt-2">
                        <button 
                        class="
                        px-6 py-2 rounded-xl !border !border-transparent  
                        bg-slate-900 
                        text-zinc-200 
                        dark:bg-gray-800   
                        dark:text-zinc-200 
                        hover:text-slate-900  
                        hover:bg-zinc-100 
                        hover:!border-slate-900 
                        dark:hover:bg-gray-700/70  
                        dark:!border-zinc-200/10 
                        dark:hover:!border-zinc-200/20 
                        dark:hover:text-zinc-200 
                        
                        transition-all duration-150 ease-in-out 
                            w-auto" onclick="Velemeny_Elutasit(${element.ID_VELEMENY})"> 
                            <i class="bi bi-x-lg font-semibold "></i>
                            <span class="d-none d-sm-inline font-semibold "> Elutasítás</span>
                        </button>

                        <button 
                        class="
                       px-6 py-2 rounded-xl !border !border-transparent 
                        bg-slate-900 
                        text-zinc-200 
                        dark:bg-gray-800   
                        dark:text-zinc-200 
                        hover:text-slate-900  
                        hover:bg-zinc-100 
                        hover:!border-slate-900 
                        dark:hover:bg-gray-700/70  
                        dark:!border-zinc-200/10 
                        dark:hover:!border-zinc-200/20 
                        dark:hover:text-zinc-200 
                        transition-all duration-150 ease-in-out 
                            w-auto" onclick="Velemeny_Elfogad(${element.ID_VELEMENY})"> 
                            <i class="bi bi-check2 font-semibold "></i>
                             <span class="d-none d-sm-inline font-semibold "> Jóváhagyás</span> 
                        </button>
                    </div>
                </div> 
                --> 
                `;
                }

                if(velemeny_osszes > 1) {
                    ss+= `
                    

                <ul class="pagination justify-content-center gap-2 select-none mt-3">

                    <!-- Elejére -->
                    <li class="page-item ${velemeny_jelenlegi == 1 ? "disabled hover:cursor-not-allowed" : ""}" >
                        <a id="Vissza2_vel" onclick="Kovi_vel(this)"
                        class="page-link px-3 py-2 rounded-xl !border !border-transparent 
                        bg-zinc-50 text-slate-900 
                        dark:bg-zinc-950 dark:text-zinc-200 
                        hover:bg-slate-900 hover:text-white 
                        dark:hover:bg-gray-800 dark:!border-zinc-200/10 dark:hover:!border-zinc-200/20 
                        transition-all duration-200 shadow-sm cursor-pointer " >
                            «
                        </a>
                    </li>

                    <!-- Előző -->
                    <li class="page-item ${velemeny_jelenlegi == 1 ? "disabled hover:cursor-not-allowed" : ""}">
                        <a id="Vissza1_vel" onclick="Kovi_vel(this)"
                        class="page-link px-3 py-2 rounded-xl !border !border-transparent 
                        bg-zinc-50 text-slate-900 
                        dark:bg-zinc-950 dark:text-zinc-200 
                        hover:bg-slate-900 hover:text-white 
                        dark:hover:bg-gray-800 dark:!border-zinc-200/10 dark:hover:!border-zinc-200/20 
                        transition-all duration-200 shadow-sm cursor-pointer ">
                            
                            <i class="bi bi-caret-left-fill"></i>
                            <span class="d-none d-lg-inline">Előző</span>
                        </a>
                    </li>

                    <!-- Aktuális oldal -->
                    <li class="page-item">
                        <span
                            class="page-link px-4 py-2 rounded-xl !border !border-transparent 
                            bg-slate-900 text-white font-semibold 
                            hover:bg-slate-900 hover:text-white dark:!border-zinc-200/10 dark:bg-gray-800 
                            shadow-md cursor-default">
                            <b id="Mostoldal">${velemeny_jelenlegi}</b>
                            <span class="opacity-70 mx-1">/</span>
                            <span id="DBoldal">${velemeny_osszes}</span>
                        </span>
                    </li>

                    <!-- Következő -->
                    <li class="page-item ${velemeny_jelenlegi == velemeny_osszes ? "disabled hover:cursor-not-allowed" : ""}">
                        <a id="Kovi1_vel" onclick="Kovi_vel(this)"
                        class="page-link px-3 py-2 rounded-xl !border !border-transparent 
                        bg-zinc-50 text-slate-900 
                        dark:bg-zinc-950 dark:text-zinc-200 
                        hover:bg-slate-900 hover:text-white 
                        dark:hover:bg-gray-800 dark:!border-zinc-200/10 dark:hover:!border-zinc-200/20 
                        transition-all duration-200 shadow-sm cursor-pointer ">
                            <span class="d-none d-lg-inline">Következő</span>
                            <i class="bi bi-caret-right-fill"></i>
                            
                        </a>
                    </li>

                    <!-- Végére -->
                    <li class="page-item ${velemeny_jelenlegi == velemeny_osszes ? "disabled hover:cursor-not-allowed" : ""}">
                        <a id="Kovi2_vel" onclick="Kovi_vel(this)"
                        class="page-link px-3 py-2 rounded-xl !border !border-transparent 
                        bg-zinc-50 text-slate-900 
                        dark:bg-zinc-950 dark:text-zinc-200 
                        hover:bg-slate-900 hover:text-white 
                        dark:hover:bg-gray-800 dark:!border-zinc-200/10 dark:hover:!border-zinc-200/20 
                        transition-all duration-200 shadow-sm cursor-pointer ">
                            »
                        </a>
                    </li>

                </ul>
                
                    
                    

                    <!--
                    
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
                        ${velemeny_jelenlegi == 1 ? "disabled" : ""}
                        " id="Vissza2_vel" onclick="Kovi_vel(this)"> << </a></li>
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
                        ${velemeny_jelenlegi == 1 ? "disabled" : ""}
                        " id="Vissza1_vel" onclick="Kovi_vel(this)">Előző</a></li>
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
                        "><b>${velemeny_jelenlegi}</b> / <span id="DBoldal">${velemeny_osszes}</span></a></li>
                
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
                        ${velemeny_jelenlegi == velemeny_osszes ? "disabled" : ""}
                        " id="Kovi1_vel" onclick="Kovi_vel(this)">Következő</a></li>

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
                        ${velemeny_jelenlegi == velemeny_osszes ? "disabled" : ""}
                        " id="Kovi2_vel" onclick="Kovi_vel(this)"> >> </a></li>
            </ul>
            -->
            `
                }

                $("#velemenyek_hely").fadeOut(300, function() {
                    $("#velemenyek_hely").html(ss).fadeIn(300);
                });
                
            }

        } catch (err) { console.log("hiba:", err);}

    }

function Kovi_vel(keri){
    switch(keri.id){
        case "Kovi1_vel": // következő oldal
            if(velemeny_jelenlegi < velemeny_osszes){
                velemeny_jelenlegi++;
            }
            break;

        case "Kovi2_vel": // utolsó oldal
            velemeny_jelenlegi = velemeny_osszes;
            break;

        case "Vissza1_vel": // előző oldal
            if(velemeny_jelenlegi > 1){
                velemeny_jelenlegi--;
            }
            break;

        case "Vissza2_vel": // első oldal
            velemeny_jelenlegi = 1;
            break;
    }

    Admin_Velemenykezeles();
}


async function Velemeny_Elutasit(id_velemeny) {
  

    let elutasit = await ajax_call(`velemeny_elutasit?ID_VELEMENY=${id_velemeny}`, "POST", null, true);

    if (elutasit.message == "ok") {
        üzen("Művelet sikeresen végrehajtva","success");
    }


    await Admin_Velemenykezeles();
}

async function Velemeny_Elfogad(id_velemeny) {
    let elfogad = await ajax_call(`velemeny_elfogad?ID_VELEMENY=${id_velemeny}`, "POST", null, true);

    if (elfogad.message == "ok") {
        üzen("Művelet sikeresen végrehajtva","success");
    }    

    await Admin_Velemenykezeles();
}
