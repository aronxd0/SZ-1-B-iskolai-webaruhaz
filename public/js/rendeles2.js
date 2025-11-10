
$("#rend_button").click(async function () {
    
    var s ="";  
    var itemek = await ajax_post("rendelesek",1)
    
    if(itemek.maxcount !=  0){
        for(const elemek of itemek.rows ){
            

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

                         id="${elemek.ID_RENDELES}">
                            <div class="col-1"></div>
                            <div class="col-12 col-lg-2 d-flex align-self-center justify-content-center">
                                <span>Kosár id: ${elemek.ID_RENDELES}</span>
                            </div>
                            <div class="col-12 col-lg-3 d-flex align-self-center justify-content-center p-3">
                                <p>${elemek.DATUM.split("T")[0]}</p>
                            </div>
                              <div class="col-12 col-lg-3 d-flex align-self-center justify-content-center p-3">
                                  <h4 class="anton-regular text-success termek_ar">${parseInt( elemek.RENDELES_VEGOSSZEGE).toLocaleString()} Ft</h4>
                            </div>                                            

                            <div class="col-12 col-lg-2 d-flex align-self-center justify-content-center ">
                                <button type="button" id="${elemek.ID_RENDELES}" onclick="RendelesTetelei()" 
                                class="
                                    btn btn-lg 
                                    bg-transparent 
                                    text-slate-900 
                                    hover:text-red-700 
                                    dark:text-zinc-200 
                                    dark:hover:text-red-700 
                                    transition-all duration-150 ease-in-out
                                    " 

                                aria-label="kosár tételei"><i class="bi bi-three-dots"></i></button>
                            </div>
                            <div class="col-1"></div>
                        </div> 
                        
                        
                    
            
                    `;


        };
    }
    else{
        s = `
        <div class="col-12">
            <div class="text-center p-2"><h5>A boltunkban még nem vásásroltál.</h5></div>
        </div>`;
    }










    $("#keresett_kifejezes").html("");
    $("#débé").html("");
    $("#nev1").val("");
    $("#pagi").html("");
   

    $("#content_hely").fadeOut(300, function() {
        $("#content_hely").html(s).fadeIn(300);
    });
});

function RendelesTetelei(){
    alert("akaszd fel magad");
}