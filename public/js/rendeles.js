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




function Attekintes(li) {
    console.log(li);

    $("#aktualis").html(`<span class="text-primary"><b>Áttekintés</b></span> - <span class="text-muted">Adatok</span> - <span class="text-muted">Fizetés</span`);

    let z = `<label for="rend" class="p-1">A rendelésed tartalma:</label>`
     z += "<ul class='list-group-flush rounded feka p-3 shadow-lg' id='rend'>";

    //$("#cc").html("");
    for (const element of li) {

        z += ` 
            
            <li class="list-group-item d-flex justify-content-between align-items-center">

                <span >
                    <span class="badge bg-primary rounded-pill me-2 float-start">${element.MENNYISEG} db</span>
                    
                    
                        ${element.NEV} 
                    
                </span>

                
                <span class="osszegek text-success">${element.PENZ.toLocaleString()} Ft</span>
                
                
            </li>
            
            
        
        `

        
    }

    z += "</ul>";

    /*
    z += `
    <div class="col-12 d-flex align-self-center">
         <span class="align-self-center p-2 me-2">Összesen: </span><span id="summu" class="text-success align-self-center p-2 me-2"></span><span class="align-self-center p-2"> (+ ÁFA)</span>
    
    </div>`;
    */
   

    let navigacio = `
        <button type="button" class="btn btn-lg btn-danger bi bi-x-lg" data-bs-dismiss="modal"> Mégse</button>
        <button type="button" class="btn btn-lg btn-success bi bi-arrow-right" onclick='Adatok(${JSON.stringify(li)})'> Tovább</button>
    `;
    $("#lab").html(navigacio);

    $("#cc").fadeOut(300, function() {
        $("#cc").html(z).fadeIn(300);
    });

    


    AR_SUM("termek_ar", "also", true);
}


function Adatok(li) {
    $("#aktualis").html(`<span class="text-muted">Áttekintés</span> - <span class="text-primary"><b>Adatok</b></span> - <span class="text-muted">Fizetés</span`);
    //$("#cc").html("");

    let form = `
        <div class="row">
            <div class="col-0 col-lg-3"></div>
            <div class="col-12 col-lg-6 mt-2 p-1">
                <div class="form-floating">
                    <input type="text" class="form-control rounded-4 shadow-lg feka" id="keresztnev" name="knev" 

                    value="${ _nev != ""? _nev :  document.getElementById("user").querySelector('h5').textContent.trim()}"
                    
                    placeholder="Teljes név">
                    <label for="keresztnev"><i class="bi bi-person"></i> Teljes név *</label>
                </div>
            </div>
            <div class="col-0 col-lg-3"></div>

            <div class="col-0 col-lg-3"></div>
            <div class="col-12 col-lg-6 mt-2 p-1">
                <div class="form-floating">
                    <input type="email" class="form-control rounded-4 shadow-lg feka" id="emil"

                     value="${  _emil != "" ? _emil : document.getElementById("user-email").innerHTML}" 

                     name="imel" placeholder="E-mail cím">
                    <label for="emil"><i class="bi bi-envelope"></i> E-mail cím *</label>
                </div>
            </div>
            <div class="col-0 col-lg-3"></div>

            <div class="col-0 col-lg-3"></div>
            <div class="col-12 col-lg-6 mt-2 p-1">
                <div class="form-floating">
                    <input type="text" class="form-control rounded-4 shadow-lg feka" id="cim" name="cim"
                    
                    value="${_cim}"
                    
                    placeholder="Pl. Kossuth Lajos utca 69.">
                    <label for="cim"><i class="bi bi-geo-alt"></i> Cím *</label>
                </div>
            </div>
            <div class="col-0 col-lg-3"></div>

            <div class="col-0 col-lg-3"></div>
            <div class="col-12 col-lg-6 mt-2 p-1">
                <div class="form-floating">
                    <input type="text" class="form-control rounded-4 shadow-lg feka" id="city" 
                    
                    value="${_city}"
                    
                    name="city" placeholder="Város">
                    <label for="city"><i class="bi bi-building"></i> Város *</label>
                </div>
            </div>
            <div class="col-0 col-lg-3"></div>

            <div class="col-0 col-lg-3"></div>
            <div class="col-12 col-lg-6 mt-2 p-1">
                <div class="form-floating">
                    <input type="number" class="form-control rounded-4 shadow-lg feka" id="iszam" 
                    
                    value="${_iszam}"

                    name="iszam" placeholder="Irányítószám">
                    <label for="iszam"><i class="bi bi-hash"></i> Irányítószám *</label>
                </div>
            </div>
            <div class="col-0 col-lg-3"></div>

            <div class="col-0 col-lg-3"></div>
            <div class="col-12 col-lg-6 mt-2 p-1">
                <div class="form-floating">
                    <input type="text" class="form-control rounded-4 shadow-lg feka" id="country" name="country"
                    
                    value="${_country}"

                    placeholder="Ország">
                    <label for="country"><i class="bi bi-globe"></i> Ország *</label>
                </div>
            </div>
            

            <div class="col-0 col-lg-3"></div>
                <div class="col-12 col-lg-6 mt-2 p-1 text-center m-auto">
                    <label class="text-danger" id="hiba"> &nbsp;</label>
                </div>
            </div>

            <div class="col-0 col-lg-3"></div>
            
        </div>
    
    `;

    $("#cc").fadeOut(300, function() {
        $("#cc").html(form).fadeIn(300);
    });

    console.log(document.getElementById("user").querySelector('h5').textContent.trim());
    
    

    let navigacio = `
        <button type="button" class="btn btn-lg btn-danger bi bi-backspace" onclick='Attekintes(${JSON.stringify(li)})'> Vissza</button>
        <button type="button" class="btn btn-lg btn-success bi bi-arrow-right" onclick='Fizetes(${JSON.stringify(li)})'> Tovább</button>
    `;
    $("#lab").html(navigacio);
}




function Fizetes(li) {
    _nev = keresztnev.value;
    _emil = emil.value;
    _cim = cim.value;
    _city = city.value;
    _iszam = iszam.value;
    _country = country.value;




    try{
        if(keresztnev.value.trim() == "" || emil.value.trim() == "" || cim.value.trim() == "" || city.value.trim() == "" || iszam.value.trim() == "" || country.value.trim() == ""){         
            throw "Töltse ki a kötelező mezőket";
        }
        if (!/^[a-zA-ZáéíóöőúüűÁÉÍÓÖŐÚÜŰ\s-]+$/.test(keresztnev.value)) {// a-z → kis angol betűk,A-Z → nagy angol betűk, áéíóöőúüűÁÉÍÓÖŐÚÜŰ → magyar ékezetes betűk,\s → szóköz (space, tab stb.)- → kötőjel (pl. „Kovács-Nagy”),^ → a string eleje,$ → a string vége
            throw "A név csak betűket, szóközt és kötőjelet tartalmazhat!";
        }

        const minta = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!minta.test(emil.value)) {  // ^[^\s@]+ → az e-mail első része: nem tartalmazhat szóközt vagy @ jelet ||  @ → kötelező kukac jel || [^\s@]+ → a domain rész (pl. gmail) || \. → kötelező pont || [^\s@]+$ → a végződés (pl. com, hu stb.)
            return "Érvénytelen e-mail cím formátum!";
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
       
        document.getElementById("hiba").innerHTML = error;
        return;
    }





    $("#aktualis").html(`<span class="text-muted">Áttekintés</span> - <span class="text-muted">Adatok</span> - <span class="text-primary"><b>Fizetés</b></span`);
    $("#cc").html("");

    


    let navigacio = `
        <button type="button" class="btn btn-lg btn-danger bi bi-backspace" onclick='Adatok(${JSON.stringify(li)})'> Vissza</button>
        <button type="button" class="btn btn-lg btn-success bi bi-credit-card"> Fizetés</button>
    `;
    $("#lab").html(navigacio);
}