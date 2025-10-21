function FizetesAblak(li) {
    console.log(li);


    let z = "<ul class='list-group p-2'>";

    $("#cc").html("");
    for (const element of li) {

        z += ` 
            
            <li class="list-group-item d-flex justify-content-start align-items-center">
                <span class="badge bg-primary rounded-pill">${element.MENNYISEG} db</span>
                <span>
                    ${element.NEV} <span class="osszegek">${element.PENZ.toLocaleString()} Ft</span>
                </span>
                 
                
            </li>
            
            
        
        `

        
    }

    z += "</ul>";

    $("#cc").html(z);

    $("#fizetes").modal("show");
}