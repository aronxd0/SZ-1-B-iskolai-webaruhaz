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

    z += `<div class="row" id="sumsum"></div>`;

    $("#cc").html(z);

    AR_SUM("osszegek", "sumsum");

    $("#fizetes").modal("show");
}