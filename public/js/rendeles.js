function FizetesAblak(li) {
    console.log(li);


    let z = "<ul class='list-group p-2 w-auto '>";

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

    $("#cc").html(z);

    $("#fizetes").modal("show");
}