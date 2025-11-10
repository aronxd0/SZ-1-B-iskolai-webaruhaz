
$("#rend_button").click(async function () {

    var s = "";  
    var itemek = await ajax_post("rendelesek", 1);
    
    if (itemek.maxcount != 0) {
        for (const elemek of itemek.rows) {

            // Egyedi azonosító a collapse részhez
            const collapseId = `collapse_${elemek.ID_RENDELES}`;

            s += `
                <div 
                    class="
                        col-12 
                        d-flex 
                        flex-column 
                        flex-lg-row 
                        bg-zinc-100 
                        text-slate-900 
                        dark:bg-slate-900 
                        dark:text-zinc-200 
                        shadow-lg  
                        rounded-4 
                        mt-3 
                        p-3 
                        p-xxl-none" 
                    id="rendeles_${elemek.ID_RENDELES}"
                >

                    <div class="col-1"></div>

                    <div class="col-12 col-lg-2 d-flex align-self-center justify-content-center">
                        <span>Azonosító: ${elemek.ID_RENDELES}</span>
                    </div>

                    <div class="col-12 col-lg-3 d-flex align-self-center justify-content-center p-3">
                         <p>${new Date(elemek.DATUM).toLocaleString('hu-HU', {
                                    year: 'numeric',
                                    month: '2-digit',
                                    day: '2-digit',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                    hour12: false
                                })}</p>
                    </div>

                    <div class="col-12 col-lg-3 d-flex align-self-center justify-content-center p-3">
                        <h4 class="anton-regular text-success termek_ar">
                            ${parseInt(elemek.RENDELES_VEGOSSZEGE).toLocaleString()} Ft
                        </h4>
                    </div>      

                    <div class="col-12 col-lg-2 d-flex align-self-center justify-content-center">
                        <button 
                            type="button"
                            class="
                            btn btn-lg 
                            bg-transparent 
                            text-slate-900 
                            hover:text-red-700 
                                   
                            dark:text-zinc-200 
                            dark:hover:text-red-700 
                            transition-all 
                            duration-150 
                            ease-in-out"

                            data-bs-toggle="collapse"
                            data-bs-target="#${collapseId}"
                            aria-expanded="false"
                            aria-controls="${collapseId}"
                        >
                            <i class="bi bi-three-dots"></i>
                        </button>
                    </div>

                    <div class="col-1"></div>

                </div>

                <!-- Itt jelenik meg az összehajtható rész -->

                <div class="collapse !visible mt-2" id="${collapseId}">

                   
                <!-- card card-body  || p-3 mind a kettő jó-->


                    <div class="
                        p-3
                        bg-white
                        
                     
                     text-dark 
                     dark:text-zinc-100">
                        <div id="tetelek_${elemek.ID_RENDELES}">
                            <h6>Tételek betöltése...</h6>
                        </div>
                    </div>
                </div>

            `;
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
});


// 🔹 Ha a gombot lenyitják, akkor betöltjük a rendelés tételeit
$(document).on('show.bs.collapse', '.collapse', async function (e) {
    const collapseId = $(this).attr('id'); // az adott collapse elem ID-je pl. collapse_123
    const rendelId = collapseId.split('_')[1]; // collapse_123 → 123

    // AJAX hívás, hogy lekérd a rendelés tételeit
    const tetelek = await ajax_post(`rendelesek_tetelei?ID_RENDELES=${rendelId}`, 1);



    let html ="<div class='border-b border-gray-400'></div>";

    

    for (const elem of tetelek.rows) {
        html += `
        <div class="col-12 
        d-flex 
        flex-column 
        flex-lg-row 
 
        text-slate-900
          dark:text-zinc-200 

          border-b
         border-gray-400

      
          
          
          mt-3 p-3 
          p-xxl-none">
            <div class="col-1"></div>

                            <div class="col-12 col-lg-2 d-flex align-self-center justify-content-center">
                                <img src="${elem.FOTOLINK}" class="img img-fluid img-thumbnail" style="width:30%;" alt="kep">
                            </div>

                            <div class="col-12 col-lg-3 d-flex align-self-center justify-content-center p-3">
                                <p>${elem.NEV}</p>
                            </div>
                            
                             <div class="col-12 col-lg-2 d-flex align-self-center justify-content-center p-3">
                                <p>${elem.MENNYISEG} db</p>
                            </div>

                         
                            <div class="col-12 col-lg-3 d-flex align-self-center justify-content-center p-3">
                                <h4 class="anton-regular text-success termek_ar">${elem.AR.toLocaleString()} Ft</h4> 
                            
                             </div>
            <div class="col-1"></div>

        </div>
        `;
    }


    $(`#tetelek_${rendelId}`).html(html);
});
