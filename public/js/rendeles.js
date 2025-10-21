function FizetesAblak(li) {
    console.log(li);

    let z = `<label for="rend" class="p-1">A rendelésed tartalma:</label>`
     z += "<ul class='list-group p-2' id='rend'>";

    $("#cc").html("");
    for (const element of li) {

        z += ` 
            
            <li class="list-group-item d-flex justify-content-between align-items-center">

                <span >
                    <span class="badge bg-primary rounded-pill me-2 float-start">${element.MENNYISEG} db</span>
                    
                    
                        ${element.NEV} 
                    
                </span>

                
                <span class="osszegek anton-regular text-success">${element.PENZ.toLocaleString()} Ft</span>
                
                
            </li>
            
            
        
        `

        
    }

    z += "</ul>";

    z += `
    <div class="col-12 d-flex align-self-center">
         <span class="align-self-center p-2 me-2">Összesen: </span><span id="summu" class="anton-regular text-success align-self-center p-2 me-2"></span><span class="align-self-center p-2"> (+ ÁFA)</span>
    
    </div>`;

    z += `
        <div class="col-12 d-flex align-self-center">
            Végösszeg (nettó ár): 
        </div>
    
    `;

    $("#cc").html(z);

    AR_SUM("osszegek", "summu");

    $("#fizetes").modal("show");
}