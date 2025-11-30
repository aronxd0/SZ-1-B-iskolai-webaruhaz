async function Admin_Velemenykezeles() {

    let varodb = await ajax_post("velemenyek?szelektalas=1", 1);
    let stimmdb = await ajax_post("velemenyek?szelektalas=0", 1);
    let decdb = await ajax_post("velemenyek?szelektalas=2", 1);

    $("#home_button").closest(".gombdiv").removeClass("aktiv");
    $("#cart_button").closest(".gombdiv").removeClass("aktiv");
    $("#welcome_section").fadeOut(300);

    $("#content_hely").fadeOut(300, function() {
        $("#content_hely").html(`
        
            <div class="row d-flex flex-column flex-md-row p-1 mx-auto mt-5 space-y-2">

                <!-- OPTION 1 -->
                <div class="col-12 col-md-4 mx-auto mt-3">
                    <label 
                        class="bg-zinc-50 
                        text-slate-900 
                        shadow-xl 
                        dark:bg-slate-900 
                        dark:text-zinc-200 
                        hover:bg-gray-200 
                        hover:outline outline-black/10 
                        dark:hover:bg-gray-700 
                        dark:hover:-outline-offset-1 
                        dark:hover:outline-white/10 
                        flex items-center justify-between p-3 rounded-xl cursor-pointer 
                            transition-all duration-200
                            has-[:checked]:bg-indigo-100 
                            has-[:checked]:border-indigo-400 
                            has-[:checked]:border 
                            has-[:checked]:shadow-md

                            dark:has-[:checked]:bg-sky-950
                            dark:has-[:checked]:border-sky-700
                            dark:has-[:checked]:border ">

                        <div class="flex items-center gap-3">
                        <input type="radio" name="plan" class="form-check-input hidden" id="varo" checked onchange="AdminVelemenyekMutat(this)">
                        <span class="font-semibold">Függőben</span>
                        <span class="inline-flex items-center rounded-md text-nowrap bg-yellow-400/10 px-2 py-1 font-medium text-yellow-700 inset-ring inset-ring-yellow-400/20"> ${varodb.rows.length}</span>
                        </div>

                        <div class="flex flex-col text-right">
                        
                        </div>
                    </label>
                </div>

                <!-- OPTION 2 -->
                <div class="col-12 col-md-4 mx-auto mt-3">
                    <label 
                        class="bg-zinc-50 
                        text-slate-900 
                        shadow-xl 
                        dark:bg-slate-900 
                        dark:text-zinc-200 
                        hover:bg-gray-200 
                        hover:outline outline-black/10 
                        dark:hover:bg-gray-700 
                        dark:hover:-outline-offset-1 
                        dark:hover:outline-white/10 
                        flex items-center justify-between p-3 rounded-xl cursor-pointer 
                            transition-all duration-200
                            has-[:checked]:bg-indigo-100 
                            has-[:checked]:border-indigo-400 
                            has-[:checked]:border 
                            has-[:checked]:shadow-md

                            dark:has-[:checked]:bg-sky-950
                            dark:has-[:checked]:border-sky-700
                            dark:has-[:checked]:border ">

                        <div class="flex items-center gap-3">
                        <input type="radio" name="plan" class="form-check-input hidden" id="jovahagyott" onchange="AdminVelemenyekMutat(this)">
                        <span class="font-semibold">Jóváhagyva</span>
                        <span class="inline-flex items-center text-nowrap rounded-md bg-green-400/10 px-2 py-1 font-medium text-green-400 inset-ring inset-ring-green-500/20"> ${stimmdb.rows.length} </span>
                        </div>

                        <div class="flex flex-col text-right">
                       
                        </div>
                    </label>
                </div>

                <!-- OPTION 3 -->
                <div class="col-12 col-md-4 mx-auto mt-3">
                    <label 
                        class="bg-zinc-50 
                        text-slate-900 
                        shadow-xl 
                        dark:bg-slate-900 
                        dark:text-zinc-200 
                        hover:bg-gray-200 
                        hover:outline outline-black/10 
                        dark:hover:bg-gray-700 
                        dark:hover:-outline-offset-1 
                        dark:hover:outline-white/10 
                        flex items-center justify-between p-3 rounded-xl cursor-pointer 
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
                        <input type="radio" name="plan" class="form-check-input hidden" id="elutasitott" onchange="AdminVelemenyekMutat(this)">
                        <span class="font-semibold">Elutasítva</span>
                        <span class="inline-flex items-center rounded-md bg-red-400/10 px-2 py-1 text-nowrap font-medium text-red-400 inset-ring inset-ring-red-400/20">${decdb.rows.length}</span>
                        </div>

                        <div class="flex flex-col text-right">
                        
                        </div>
                    </label>
                </div>

                </div>

                <div class="col-12 text-center mt-5" id="velemenyek_hely">

                </div>

            
        
        `).fadeIn(300);
        AdminVelemenyekMutat($("#varo")[0]);
        $("#pagi").html("");
        
    });
}


async function AdminVelemenyekMutat(asd) {
    if (asd.id == "varo") {

        try {

            let ss = ``;

            let varo = await ajax_post("velemenyek?szelektalas=1", 1);

            if (varo.rows.length == 0) { 
                $("#velemenyek_hely").fadeOut(300, function() {
                    $("#velemenyek_hely").html("<div class='col-12 text-xl text-center p-3'>Nincsenek jóváhagyásra váró vélemények.</div>");

                }).fadeIn(300);
                
             }
            else {

                ss += `
                    <div class="row d-flex justify-content-center">
                        <div role="alert" 
                        class="
                        col-12 col-lg-4
                        !border !border-t-blue-400/50 !border-b-blue-400/50 !border-r-blue-400/50 !border-l-blue-400/50
                        bg-blue-200/30 
                        text-blue-800 
                        dark:bg-blue-900/20 
                        dark:text-blue-200 
                        w-auto
                        mx-3 
                        px-2 py-3 rounded-4">
                            <i class="bi bi-info-circle-fill"></i>
                            <strong class="font-bold">${varo.maxcount} db</strong>
                            <span> vélemény vár jóváhagyásra</span>
                            
                        </div>
                    </div>
                
                `;

                for (const element of varo.rows) {
                    ss += `
                <div 
                class="
                    w-100 
                    p-3 
                    rounded-4 
                    shadow-xl 
                    bg-zinc-50 
                    text-slate-900 
                    dark:bg-slate-900 
                    dark:text-zinc-200 
                    mt-3 
                    mb-3 
                    comment">
                    <p class="d-flex justify-content-between"><b><span><i class="bi bi-person"></i> ${element.NEV}</span></b>  <span><i class="bi bi-calendar4-week"></i> ${new Date(element.DATUM).toLocaleString('hu-HU', {
                                    year: 'numeric',
                                    month: '2-digit',
                                    day: '2-digit',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                    hour12: false
                                })}</span></p>
                    <p class="d-flex p-2 justify-content-start"><i>${element.SZOVEG.toString().replaceAll("\n","<br>")}</i></p>
                    <p class="p-2 text-start">
                        <a class="underline decoration-sky-500 hover:text-sky-500 hover:cursor-pointer" onclick="Termek_Mutat(event, ${element.ID_TERMEK})">Ehhez a termékhez</a>
                    </p>
                    <div class="d-flex justify-content-end gap-2 mt-2">
                        <button 
                        class="
                        btn 
                        
                        
                        bg-zinc-600 
                        text-zinc-200 
                        rounded-4 
                        dark:bg-slate-800 
                        dark:text-zinc-200 
                        hover:bg-zinc-700 
                        hover:text-red-600 
                        dark:hover:bg-slate-950 
                        dark:hover:text-red-600
                        transition-hover duration-300 ease-in-out 
                            w-auto" onclick="Velemeny_Elutasit(${element.ID_VELEMENY})"> 
                            <i class="bi bi-x-lg"></i>
                            <span class="d-none d-sm-inline"> Elutasítás</span>
                        </button>

                        <button 
                        class="
                        btn 
                         
                        bg-zinc-600 
                        text-zinc-200 
                        rounded-4 
                        dark:bg-slate-800 
                        dark:text-zinc-200 
                        hover:bg-zinc-700 
                        hover:text-emerald-600 
                        dark:hover:bg-slate-950 
                        dark:hover:text-emerald-600
                        transition-hover duration-300 ease-in-out 
                            w-auto" onclick="Velemeny_Elfogad(${element.ID_VELEMENY})"> 
                            <i class="bi bi-check2"></i>
                             <span class="d-none d-sm-inline"> Jóváhagyás</span> 
                        </button>
                    </div>
                </div>`;
                }

                $("#velemenyek_hely").fadeOut(300, function() {
                    $("#velemenyek_hely").html(ss).fadeIn(300);
                });
            }

            


        } catch (err) { console.log("hiba:", err);}


        //$("#velemenyek_hely").html("ide a jovahagyasra varo velemenyek");
    }
    else if (asd.id == "jovahagyott") {
        try {

            let sv = ``;

            let stimm = await ajax_post("velemenyek?szelektalas=0", 1);

            if (stimm.rows.length == 0) { 
               $("#velemenyek_hely").fadeOut(300, function() {
                    $("#velemenyek_hely").html("<div class='col-12 text-xl text-center p-3'>Nincsenek jóváhagyott vélemények.</div>");

                }).fadeIn(300);
            }
            else {
                for (const element of stimm.rows) {
                    sv += `
                <div 
                class="
                    w-100 
                    p-3 
                    

                    rounded-4 
                    shadow-xl 
                    bg-zinc-50 
                    text-slate-900 
                    dark:bg-slate-900 
                    dark:text-zinc-200 
                    mt-3 
                    mb-3 
                    comment">
                    <p class="d-flex justify-content-between"><b><span><i class="bi bi-person"></i> ${element.NEV}</span></b>  <span><i class="bi bi-calendar4-week"></i> ${new Date(element.DATUM).toLocaleString('hu-HU', {
                                    year: 'numeric',
                                    month: '2-digit',
                                    day: '2-digit',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                    hour12: false
                                })}</span></p>
                    <p class="text-start p-2 "><i>${element.SZOVEG.toString().replaceAll("\n","<br>")}</i></p>
                </div>`;
                }

                $("#velemenyek_hely").fadeOut(300, function() {
                    $("#velemenyek_hely").html(sv).fadeIn(300);
                });
            }

            


        } catch (err) { console.log("hiba:", err);}
    }
    else if (asd.id == "elutasitott") {
        try {

            let ssg = ``;

            let dec = await ajax_post("velemenyek?szelektalas=2", 1);

            if (dec.rows.length == 0) { 
                $("#velemenyek_hely").fadeOut(300, function() {
                    $("#velemenyek_hely").html("<div class='col-12 text-xl text-center p-3'>Nincsenek elutasított vélemények.</div>");

                }).fadeIn(300);
             }
            else {
                for (const element of dec.rows) {
                    ssg += `
                <div 
                class="
                    w-100 
                    p-3 
                    rounded-4 
                    shadow-xl 
                    bg-zinc-50 
                    text-slate-900 
                    dark:bg-slate-900 
                    dark:text-zinc-200 
                    mt-3 
                    mb-3 
                    comment">
                    <p class="d-flex justify-content-between"><b><span><i class="bi bi-person"></i> ${element.NEV}</span></b>  <span><i class="bi bi-calendar4-week"></i> ${new Date(element.DATUM).toLocaleString('hu-HU', {
                                    year: 'numeric',
                                    month: '2-digit',
                                    day: '2-digit',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                    hour12: false
                                })}</span></p>
                    <p class="d-flex justify-content-start">${element.SZOVEG.toString().replaceAll("\n","<br>")}</p>
                </div>`;
                }

                $("#velemenyek_hely").fadeOut(300, function() {
                    $("#velemenyek_hely").html(ssg).fadeIn(300);
                });
            }

            


        } catch (err) { console.log("hiba:", err);}
    }
}





async function Velemeny_Elutasit(id_velemeny) {
    try {

        let elutasit = await ajax_post(`velemeny_elutasit?ID_VELEMENY=${id_velemeny}`, 1);

        if (elutasit.message == "ok") {
            üzen("Művelet sikeresen végrehajtva","success");
        }
        else { üzen(elutasit.message, "danger"); }


        AdminVelemenyekMutat($("#varo")[0]);

    } catch (err) { console.log("hiba:", err); }
}

async function Velemeny_Elfogad(id_velemeny) {
    try {

        let elfogad = await ajax_post(`velemeny_elfogad?ID_VELEMENY=${id_velemeny}`, 1);

        if (elfogad.message == "ok") {
            üzen("Művelet sikeresen végrehajtva","success");
        }
        else { üzen(elfogad.message, "danger"); }

        AdminVelemenyekMutat($("#varo")[0]);


    } catch (err) { console.log("hiba:", err); }
}











function UjTermek() {
    $("#home_button").closest(".gombdiv").removeClass("aktiv");
    $("#cart_button").closest(".gombdiv").removeClass("aktiv");

    $("#content_hely").fadeOut(300, function() {
        $("#content_hely").html(`
        <div class="row">
            <div class="col-12 text-center p-2 mt-3">
                <span class="text-xl">uj termek letrehozasa</span>
            </div>
        </div>
        `).fadeIn(300);
        $("#pagi").html("");
    });
    Termek_Edit(event,0,"bevitel");

    

    

    $("#save_button").html(`<i class="bi bi-plus-lg"></i>&nbsp;Új termék létrehozása`);
}
//#region Statisztika

// nem biztos hogy jó
let voltNagy = window.innerWidth > 600;  

window.addEventListener("resize", () => {
    let mostNagy = window.innerWidth > 600;

    // Ha átlépted a 600px határt
    if (mostNagy !== voltNagy && document.getElementById("NagyCIM") != null)  {

        // console.log("Átlépted a 600px-t, újrarajzolom...");
        DiagrammokSelect("kezdes");
        
        // állapot frissítése
        voltNagy = mostNagy;
    }
});

function Statisztikak() {

    $("#home_button").closest(".gombdiv").removeClass("aktiv");
    $("#cart_button").closest(".gombdiv").removeClass("aktiv");
    
    $("#welcome_section").fadeOut(300);
            
        html = `
        <div class="container bg-white">
            <div class="row">
            <div class="col-md-2"></div>
                <div class="top-select-box col-12 col-md-8 d-flex justify-content-center">
                    <span class="chart-title" id="NagyCIM">Top 5 termék eladás szerint</span>
                </div>
                
                <div class="col-12 col-md-2 mt-10 d-flex justify-content-center">
                    <select id="honapValaszto" onchange="DiagrammokSelect(this)" class="select-box px-2">
                        <option value="1">1 hónap</option>
                        <option value="3">3 hónap</option>
                        <option value="5">All time</option>
                    </select>
                 </div>
            </div>
            <div id="_Top5" style="min-width: 310px; height: 400px;"></div>

        </div>
        `
        // ezekhez tartozik css is (style.css 440-458 sor)


     $("#content_hely").fadeOut(300,  function() {
         $("#content_hely").html(html).fadeIn(300); 
        $("#pagi").html("");
        //drawChart();
        DiagrammokSelect("kezdes");
    });

}


function drawChart(rang) {
    function shorten(name) { // ha túl hosszú a neve, akkor lent ... lesz
      return name.length > 12 ? name.substring(0, 12) + "..." : name;
    }
    // data előkészítés
     data = [
      { name: rang.rows[3].NEV, y:parseInt(rang.rows[3].DB)},
      { name: rang.rows[1].NEV, y:parseInt(rang.rows[1].DB)},
      { name: rang.rows[0].NEV, y:parseInt(rang.rows[0].DB)},
      { name: rang.rows[2].NEV, y:parseInt(rang.rows[2].DB)},
      { name: rang.rows[4].NEV, y:parseInt(rang.rows[4].DB)}
    ];
  
    // MOBIL nézet – 3 középső
    let visibleData = data;
    if (window.innerWidth < 600) {
      visibleData = data.slice(1, 4);
    }
  
    // rangsor
    const sortedUnique = [...new Set(visibleData.map(d => d.y))].sort((a, b) => b - a);
  // rang meghatározása érték alapján
    function getRankByValue(v) {
      return sortedUnique.indexOf(v) + 1;
    }
   // a színek meghatározása rang alapján
    function getColorByRank(value) {
      const rank = getRankByValue(value);
      if (rank === 1) return "#FFD700";
      if (rank === 2) return "#C0C0C0";
      if (rank === 3) return "#CD7F32";
      return "#4db8ff";
    }

    // diagram rajzolás
    $('#_Top5').highcharts({
  
      chart: {
        type: 'column',
        spacingTop: 10,
        backgroundColor: '#ffffff' /// majd itt lehet szinezni
      },
  
      title: { // semmi nincs benne, de itt  kell lennie, hogy a korona jól pozícionálva legyen
                useHTML: true, 
                text: "<div style='height:6px; padding: 5px;'></div>",
                margin: 180
            },
  
      xAxis: { // ez a oszlop alatti rész, kiirja a neveket, és a darabszámokat / értéket
        categories: visibleData.map(d => shorten(d.name)),
        labels: {
          useHTML: true,
          formatter: function () {
            const original = visibleData[this.pos];
            return `
              <div style="text-align:center;">
                <div style="font-size:20px; font-weight:bold;">${shorten(original.name)}</div>
                <div style="font-size:18px; color:#666;">${original.y}</div>
              </div>`;
          },
          y: 25
        },
        lineWidth: 0,
        tickLength: 0
      },
  
      yAxis: { min: 0, visible: false },
  
     tooltip: { // ez akkor jön elő, ha ráviszed az oszlopra az egeret
            useHTML: true,
            outside: true,
            borderWidth: 0,
            backgroundColor: "rgba(124,124,124,0.95)",
            shadow: false,
            padding: 8,
            formatter: function () { // ez  a tooltip tartalma azért van így megcsinálva mert html kell bele és eltörhető legyen a szöveg
                                return `
                                <div style="
                            width: 180px; 
                            padding: 10px; 
                            text-align: center; 
                            white-space: normal; 
                            overflow-wrap: break-word;
                        ">
                            <div style="
                                font-size:14px;
                                font-weight:bold;
                                margin-bottom:5px;
                            ">
                                ${this.point.name}
                            </div>

                            <div style="font-size:12px; color:#f0f0f0;">
                                ${this.point.y} db
                            </div>
                        </div>

                                `;
     },

            positioner: function (tooltipWidth, tooltipHeight, point) { // ez a tooltip pozíciója 

                // azért ilyen bonyolult mert meg kellett nézni hogy hova fér el a tooltip
                // és aszerint pozícionálni

                let chart = this.chart;
                let chartWidth = chart.chartWidth;

                const offset = 160;  // Egyivel feljebb van a tooltip mint az oszlop teteje

                let x = point.plotX + chart.plotLeft - (tooltipWidth / 2);       
                //point.plotX: a konkrét oszlop vízszintes pozíciója
                //chart.plotLeft: mennyivel tolta arrébb a chart a bal margó miat
                //mínusz (tooltipWidth / 2): hogy középre rakja a tooltipet a bar fölött

                let y = point.plotY + chart.plotTop - tooltipHeight - offset;
                //point.plotY: az oszlop csúcsa, ahol a tooltipnek kapcsolódnia kell
                //chart.plotTop: a felső margó
                //tooltipHeight: hogy ne a bar tetejére rajzolódjon rá, hanem fölé
                //offset: megyivel legyen az oszlop felett




                // Oldalsó keretek
                if (x < 0) x = 0;
                if (x + tooltipWidth > chartWidth) x = chartWidth - tooltipWidth;

                // HA FELFELÉ NEM FÉR EL → RAKD LEFELÉ

                return { x, y };
            }
},

  
      legend: { enabled: false },
  
      plotOptions: { // a korona rész, meg a számok
        column: {
          borderWidth: 0,
          colorByPoint: true,
          colors: visibleData.map(d => getColorByRank(d.y)),
          dataLabels: {
            enabled: true,
            useHTML: true,
            formatter: function () {
              const place = getRankByValue(this.y);
              const isWinner = place === 1;
  
              return `
                <div style="
                        margin-top:-140px;
                        position:relative;
                        width:100px;
                        display:flex;
                        flex-direction:column;
                        align-items:center;
                        justify-content:center;
                        text-align:center;
                        ">

                    ${isWinner ? `
                        <img src="https://images-wixmp-ed30a86b8c4ca887773594c2.wixmp.com/f/25d45014-8cc3-4c98-b02c-5a0cf3a55ddd/dclmy10-72419003-8e69-41e8-a9f3-b7df637b74f8.png/v1/fill/w_900%2Ch_633/gold_crown_on_a_transparent_background__by_prussiaart_dclmy10-fullview.png?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1cm46YXBwOjdlMGQxODg5ODIyNjQzNzNhNWYwZDQxNWVhMGQyNmUwIiwiaXNzIjoidXJuOmFwcDo3ZTBkMTg4OTgyMjY0MzczYTVmMGQ0MTVlYTBkMjZlMCIsIm9iaiI6W1t7ImhlaWdodCI6Ijw9NjMzIiwicGF0aCI6Ii9mLzI1ZDQ1MDE0LThjYzMtNGM5OC1iMDJjLTVhMGNmM2E1NWRkZC9kY2xteTEwLTcyNDE5MDAzLThlNjktNDFlOC1hOWYzLWI3ZGY2MzdiNzRmOC5wbmciLCJ3aWR0aCI6Ijw9OTAwIn1dXSwiYXVkIjpbInVybjpzZXJ2aWNlOmltYWdlLm9wZXJhdGlvbnMiXX0.-1xQwTm0xcpa2ZJ_vvNA5hTKxUAe78z6H679BjudfZs"
                            style="width:90px; position:absolute; top:-70px; left:50%; transform:translateX(-50%);">
                    ` : ''}

                        <div id="${this.point.name}">
                            
                        </div>

                        <div style="
                            font-size:40px;
                            font-weight:bold;
                            color:white;
                            text-shadow:0 0 5px black;
                            margin-top:5px;
                        ">
                        ${place}
                        </div>
                </div>

                `;
                        // megnézzük a pont nevét, és ahová kell, oda berakjuk a képet is
                        // a div id="${this.point.name}" lesz a kép helye
                        // is Winner pedig az 1. helyezettre teszi a koronát, több is lehet első helyezett esetén töre is felteszi
                        // az oszlop felé meg kiirjük a helyezést pl 1. 2. 3. ... 


            }
          }
        }
      },
  
      series: [{ data: visibleData }]
    });
  
  }

  async function DiagrammokSelect(innen){

   let kivalasztott = "1";
    // ha nem kezdes, akkor dropdownból jön
    if (innen !== "kezdes") {
        kivalasztott = innen.value;
    }
    // adat lekérés
    const eredmeny = await ajax_post(`Top5?INTERVALLUM='${kivalasztott}'`, 1);

    // diagram rarajzolás
    await drawChart(eredmeny);

    // aktuális képernyőméret
    const mobil = window.innerWidth < 600;

    // 600px alatt: 3 darab (a highchart is a első 3-at mutatja)
    // 600px fölött: az összes bejön
    const lista = mobil ? eredmeny.rows.slice(0, 3) : eredmeny.rows;

    // képek berakása
    for (const item of lista) {
        document.getElementById(item.NEV).innerHTML =
            `<img src="${item.FOTOLINK}" style="height:100px;">`;
    }
}
  

//#endregion
//#region SQl input 

function SQLinput() {
    $("#home_button").closest(".gombdiv").removeClass("aktiv");
    $("#cart_button").closest(".gombdiv").removeClass("aktiv");

    $("#welcome_section").fadeOut(300);

    $("#content_hely").fadeOut(300, function() {
        $("#content_hely").html(`
        <div class="row mt-5">
            <div class="col-12 text-center p-2 mt-3">
                <span class="text-xl">SQL Input</span>
            </div>
        </div>

        <div class=mt-3">
            <div class="col-12 px-0 px-lg-5 py-1">
                <textarea id="sql_input_area" 
                class="
                resize-none 
                form-control 
                shadow-xl 
                bg-zinc-50 
                text-slate-900 
                dark:bg-slate-900 
                dark:text-zinc-200 
                p-3 
                rounded-4 
                placeholder-gray-400 
                dark:placeholder-gray-400 
                " rows="10" placeholder="Ide írd be az SQL lekérdezést..." style="border:none;"></textarea>
            </div>

            <div class="col-12 d-flex justify-content-center justify-content-lg-end px-0 px-lg-5 py-1">
                <button id="sql_execute_button" 
                class="
                btn 
                
                text-zinc-200 
                bg-zinc-600 
                my-4
          rounded-4 
          dark:bg-slate-800 
          dark:text-zinc-200 
          hover:bg-zinc-700 
          hover:text-zinc-200 
          dark:hover:bg-slate-900 
          dark:hover:text-zinc-200
                " onclick="KER_CLICk()">
                    <i class="bi bi-play-fill"></i>&nbsp;Lekérdezés futtatása
                </button>
            </div>
        </div>

        <div class="col-12 
         d-flex justify-content-center       
         "  
            id="SQL_hiba">

             &nbsp
            </div>


        `).fadeIn(300);
        $("#pagi").html("");
        
    })
}

async function KER_CLICk(){
    try{
        if(sql_input_area.value.replaceAll(/\n/g, " ").trim() =="") throw "Üres a lekérdezés mező";

         
        var adat = await ajax_post(`html_sql?SQL=${sql_input_area.value.replaceAll(/\n/g, " ")}`,1)    

        if(adat.select == true){
            if (adat.adat.rows.length > 0) {
                var html = "<table class='tablazat p-4 mt-3 text-center sticky-header'> <thead class='bg-slate-900 text-zinc-200 border-b-gray-400'><tr>"
                // mezőnevek
                var tablamevek = Object.keys(adat.adat.rows[0])
                console.log(" tablanevek"+ tablamevek);
                // elso sor betölt 
                for(var nevek of tablamevek){
                    html +=  `<th class="p-2 ">${ nevek.toString()}</th>`
                }
                html += "</tr></thead><tbody>"
                for (var item of adat.adat.rows) {
                    html += "<tr class='bg-zinc-50 text-slate-900 dark:bg-sky-950 dark:text-zinc-200 border !border-b-gray-400 !border-r-0 !border-l-0 !border-t-0 dark:!border-b-gray-600 dark:!border-r-0 dark:!border-l-0 dark:!border-t-0'>";
    
                    for (var nev of tablamevek) {
                        html += `<td class='p-2'>${item[nev]}</td>`;
                    }
    
                    html += "</tr>";
                }
    
                html += "</tbody></table>";
                document.getElementById("SQL_hiba").innerHTML = `
                        <div class="table-responsive mt-3">
                            ${html}
                        </div>
                    `;
            }        
        }
        else{
            document.getElementById("SQL_hiba").innerHTML =  `
            
            <div role="alert" 
                    class="
                    bg-emerald-200 
                    text-emerald-700 
                    dark:bg-emerald-900 
                    dark:text-emerald-400 
                    
                    px-4 py-3 rounded-4" style="border: none;">
                        <i class="bi bi-check2"></i>
                        <strong class="font-bold">Művelet sikeresen végrehajtva: </strong>
                        &nbsp;
                        <span> ${adat.adat.rows.info} </span>  
                        
                    </div> `
        }
    }
    catch(e){
    
        var sad = ` 
                <div role="alert" 
                    class="
                    bg-red-200 
                    text-red-700 
                    dark:bg-red-950 
                    dark:text-red-400 
                    
                    px-4 py-3 rounded-4" style="border: none;">
                        <i class="bi bi-exclamation-triangle-fill"></i>
                        <strong class="font-bold">Hiba: </strong>
                        &nbsp;
                        <span> ${e}</span>
                        
                    </div> `

        document.getElementById("SQL_hiba").innerHTML =sad ;
    }
    



}
//#endregion