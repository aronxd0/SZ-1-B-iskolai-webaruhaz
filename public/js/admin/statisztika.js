let voltNagy = window.innerWidth > 600;  

window.addEventListener("resize", () => {
    let mostNagy = window.innerWidth > 600;
    // Ha átlépted a 600px határt
    if (mostNagy !== voltNagy && document.getElementById("NagyCIM") != null)  {
        DiagrammokSelect("kezdes");
        // állapot frissítése
        voltNagy = mostNagy;
    }
});

function Statisztikak(pushHistory = true) {
    html = `
        <div class="container bg-zinc-50 rounded-4 shadow-xl text-slate-900 dark:bg-slate-950 dark:!border dark:!border-zinc-200/20 dark:text-zinc-200 p-3">
            <div class="row d-flex flex-column flex-md-row justify-content-between align-items-center gap-y-5">
                <div class="col-0 col-md-3"></div>
                <div class="col-12 col-md-6 d-flex justify-content-center align-items-center">
                    <span class="chart-title text-2xl" id="NagyCIM">Legkelendőbb termékek</span>
                </div>
                <div class="col-12 col-md-3 d-flex justify-content-center align-items-center">
                    <select id="honapValaszto" onchange="DiagrammokSelect(this)" class="form-select shadow-xl bg-zinc-100 text-slate-900 dark:bg-slate-800 dark:text-zinc-200 " style="border: none;">
                        <option value="1">1 hónap</option>
                        <option value="3">3 hónap</option>
                        <option value="5">All time</option>
                    </select>
                </div>
            </div>
            <div class="row mt-5" id="_Top5" style="min-width: 310px; height: 400px;" ></div>
        </div>
        <div class="container mt-5 mb-5 rounded-4  shadow-xl bg-zinc-50 text-slate-900 dark:bg-slate-950 dark:!border dark:!border-zinc-200/20 dark:text-zinc-200  ">
        <div class="row">
            <div class="col-12 d-flex justify-content-center fs-2"> Egyéb statisztikák</div>
        </div>
        <div class="row p-4">
            <div class="col-12">
                <div class="col-12 justify-content-between bg-zinc-100 text-slate-900 shadow-xl dark:bg-slate-950 dark:!border dark:!border-zinc-200/20 dark:text-zinc-200 rounded-4 mb-5 p-3">
                    <div class="d-felx content-center" style="height:300px;">
                        <canvas id="STAT_PENZ_GRAF"></canvas>
                    </div>
                    <div class="row mt-auto p-0 p-md-5">
                        <div class="col-md-4 col-12">                
                            <label class="bg-zinc-50 text-slate-900 shadow-xl dark:bg-slate-950 dark:!border dark:!border-zinc-200/20 dark:text-zinc-200 hover:bg-gray-200 hover:outline outline-black/10 dark:hover:bg-gray-700 dark:hover:-outline-offset-1 dark:hover:outline-white/10 d-flex align-items-center justify-content-center p-2 my-2 rounded-xl cursor-pointer transition-all duration-200 has-[:checked]:bg-indigo-100 has-[:checked]:border-indigo-400 has-[:checked]:border has-[:checked]:shadow-md dark:has-[:checked]:bg-sky-950 dark:has-[:checked]:border-sky-700 dark:has-[:checked]:border">
                                <input type="radio" class="form-check-input hidden" name="hatar" id="_01" value="1" checked  onchange="STAT_Penz(this)">
                                1 hónap
                            </label>
                        </div>
                        <div class="col-md-4 col-12">                
                            <label class="bg-zinc-50 text-slate-900 shadow-xl dark:bg-slate-950 dark:!border dark:!border-zinc-200/20 dark:text-zinc-200 hover:bg-gray-200 hover:outline outline-black/10 dark:hover:bg-gray-700 dark:hover:-outline-offset-1 dark:hover:outline-white/10 d-flex align-items-center justify-content-center p-2 my-2 rounded-xl cursor-pointer transition-all duration-200 has-[:checked]:bg-indigo-100 has-[:checked]:border-indigo-400 has-[:checked]:border has-[:checked]:shadow-md dark:has-[:checked]:bg-sky-950 dark:has-[:checked]:border-sky-700 dark:has-[:checked]:border">
                                <input type="radio" class="form-check-input hidden" name="hatar" id="_02" value="6"  onchange="STAT_Penz(this)">
                                6 hónap
                            </label>
                        </div>
                        <div class="col-md-4 col-12">                
                            <label class="bg-zinc-50 text-slate-900 shadow-xl dark:bg-slate-950 dark:!border dark:!border-zinc-200/20 dark:text-zinc-200 hover:bg-gray-200 hover:outline outline-black/10 dark:hover:bg-gray-700 dark:hover:-outline-offset-1 dark:hover:outline-white/10 d-flex align-items-center justify-content-center p-2 my-2 rounded-xl cursor-pointer transition-all duration-200 has-[:checked]:bg-indigo-100 has-[:checked]:border-indigo-400 has-[:checked]:border has-[:checked]:shadow-md dark:has-[:checked]:bg-sky-950 dark:has-[:checked]:border-sky-700 dark:has-[:checked]:border">
                                <input type="radio" class="form-check-input hidden" name="hatar" id="_03"  value="12" onchange="STAT_Penz(this)">
                                1 év
                            </label>
                        </div>
                    </div>
                </div>
            </div>
            <div class="col-12" id="_2_STAT">
                <div class="col-12 bg-zinc-100 text-slate-900 shadow-xl dark:bg-slate-950 dark:!border dark:!border-zinc-200/20 dark:text-zinc-200 rounded-4 mb-5 p-3">
                    <div class="text-center d-flex" style="height:300px;">
                        <canvas id="STAT_VMI_GRAF"></canvas>
                    </div>
                    <div class="row mt-auto d-flex p-0 p-md-5">
                        <div class="col-md-4 col-12">                
                            <label class="bg-zinc-50 text-slate-900 shadow-xl dark:bg-slate-950 dark:!border dark:!border-zinc-200/20 dark:text-zinc-200 hover:bg-gray-200 hover:outline outline-black/10 dark:hover:bg-gray-700 dark:hover:-outline-offset-1 dark:hover:outline-white/10 d-flex align-items-center justify-content-center p-2 my-2 rounded-xl cursor-pointer transition-all duration-200 has-[:checked]:bg-indigo-100 has-[:checked]:border-indigo-400 has-[:checked]:border has-[:checked]:shadow-md dark:has-[:checked]:bg-sky-950 dark:has-[:checked]:border-sky-700 dark:has-[:checked]:border">
                                    <input type="radio" name="hatar2" class="form-check-input hidden" id="_03" value="1" checked  onchange="STAT_ELAD(this)">
                                    1 hónap
                            </label>
                        </div>
                        <div class="col-md-4 col-12">                
                            <label class="bg-zinc-50 text-slate-900 shadow-xl dark:bg-slate-950 dark:!border dark:!border-zinc-200/20 dark:text-zinc-200 hover:bg-gray-200 hover:outline outline-black/10 dark:hover:bg-gray-700 dark:hover:-outline-offset-1 dark:hover:outline-white/10 d-flex align-items-center justify-content-center p-2 my-2 rounded-xl cursor-pointer transition-all duration-200 has-[:checked]:bg-indigo-100 has-[:checked]:border-indigo-400 has-[:checked]:border has-[:checked]:shadow-md dark:has-[:checked]:bg-sky-950 dark:has-[:checked]:border-sky-700 dark:has-[:checked]:border">
                                <input type="radio" name="hatar2" class="form-check-input hidden" id="_03" value="6"   onchange="STAT_ELAD(this)">
                                3 hónap
                            </label>
                        </div>
                        <div class="col-md-4 col-12">                
                            <label class="bg-zinc-50 text-slate-900 shadow-xl dark:bg-slate-950 dark:!border dark:!border-zinc-200/20 dark:text-zinc-200 hover:bg-gray-200 hover:outline outline-black/10 dark:hover:bg-gray-700 dark:hover:-outline-offset-1 dark:hover:outline-white/10 d-flex align-items-center justify-content-center p-2 my-2 rounded-xl cursor-pointer transition-all duration-200 has-[:checked]:bg-indigo-100 has-[:checked]:border-indigo-400 has-[:checked]:border has-[:checked]:shadow-md dark:has-[:checked]:bg-sky-950 dark:has-[:checked]:border-sky-700 dark:has-[:checked]:border">
                                <input type="radio" name="hatar2" class="form-check-input hidden" id="_03" value="12"  onchange="STAT_ELAD(this)" >
                                1 év
                            </label>
                        </div>
                    </div>
                </div>
            </div>
            <div class="col-12 col-md-6 mb-4" id="_2_STAT">
                <div class="col-12 d-flex flex-column justify-content-between  bg-zinc-100 text-slate-900 shadow-xl dark:bg-slate-950 dark:!border dark:!border-zinc-200/20 dark:text-zinc-200  rounded-4 mb-5 p-3" id="_3_STAT">
                    <div class="text-center d-felx content-center" style ="max-height:300px;">
                        <canvas id="STAT_KOR_GRAF"></canvas>
                    </div>
                    <div class="row mt-auto p-2">
                        <div class="col-xl-4 col-12">                
                            <label class="bg-zinc-50 text-slate-900 shadow-xl dark:bg-slate-950 dark:!border dark:!border-zinc-200/20 dark:text-zinc-200 hover:bg-gray-200 hover:outline outline-black/10 dark:hover:bg-gray-700 dark:hover:-outline-offset-1 dark:hover:outline-white/10 d-flex align-items-center justify-content-center p-2 my-2 rounded-xl cursor-pointer transition-all duration-200 has-[:checked]:bg-indigo-100 has-[:checked]:border-indigo-400 has-[:checked]:border has-[:checked]:shadow-md dark:has-[:checked]:bg-sky-950 dark:has-[:checked]:border-sky-700 dark:has-[:checked]:border">
                                <input type="radio" name="hatar3" class="form-check-input hidden" id="_03" value="1" checked   onchange="STAT_KATEG(this)">
                                1 hónap
                            </label>
                        </div>
                        <div class="col-xl-4 col-12">                
                            <label class="bg-zinc-50 text-slate-900 shadow-xl dark:bg-slate-950 dark:!border dark:!border-zinc-200/20 dark:text-zinc-200 hover:bg-gray-200 hover:outline outline-black/10 dark:hover:bg-gray-700 dark:hover:-outline-offset-1 dark:hover:outline-white/10 d-flex align-items-center justify-content-center p-2 my-2 rounded-xl cursor-pointer transition-all duration-200 has-[:checked]:bg-indigo-100 has-[:checked]:border-indigo-400 has-[:checked]:border has-[:checked]:shadow-md dark:has-[:checked]:bg-sky-950 dark:has-[:checked]:border-sky-700 dark:has-[:checked]:border">
                                <input type="radio" name="hatar3" class="form-check-input hidden" id="_03" value="6" onchange="STAT_KATEG(this)"> 
                                6 hónap
                            </label>
                        </div>
                        <div class="col-xl-4 col-12">                
                            <label class="bg-zinc-50 text-slate-900 shadow-xl dark:bg-slate-950 dark:!border dark:!border-zinc-200/20 dark:text-zinc-200 hover:bg-gray-200 hover:outline outline-black/10 dark:hover:bg-gray-700 dark:hover:-outline-offset-1 dark:hover:outline-white/10 d-flex align-items-center justify-content-center p-2 my-2 rounded-xl cursor-pointer transition-all duration-200 has-[:checked]:bg-indigo-100 has-[:checked]:border-indigo-400 has-[:checked]:border has-[:checked]:shadow-md dark:has-[:checked]:bg-sky-950 dark:has-[:checked]:border-sky-700 dark:has-[:checked]:border">  
                                <input type="radio" name="hatar3" class="form-check-input hidden" id="_03" value="12" onchange="STAT_KATEG(this)"> 
                                All time
                            </label>
                        </div>
                    </div>
                </div>
            </div>
            <div class="col-12 col-md-6 mb-4" id="_2_STAT">
                <div class="col-12 d-flex flex-column justify-content-between bg-zinc-100 text-slate-900 shadow-xl dark:bg-slate-950 dark:!border dark:!border-zinc-200/20 dark:text-zinc-200  rounded-4 mb-5 p-3" id="_3_STAT">
                    <div class="text-center d-felx content-center" style ="max-height:300px;">
                        <canvas id="STAT_COMMENT"></canvas> 
                    </div>
                    <div class="row mt-auto p-2 " >
                        <div class="col-xl-4 col-12 ">                
                            <label class="bg-zinc-50 text-slate-900 shadow-xl dark:bg-slate-950 dark:!border dark:!border-zinc-200/20 dark:text-zinc-200 hover:bg-gray-200 hover:outline outline-black/10 dark:hover:bg-gray-700 dark:hover:-outline-offset-1 dark:hover:outline-white/10 d-flex align-items-center justify-content-center p-2 my-2 rounded-xl cursor-pointer transition-all duration-200 has-[:checked]:bg-indigo-100 has-[:checked]:border-indigo-400 has-[:checked]:border has-[:checked]:shadow-md dark:has-[:checked]:bg-sky-950 dark:has-[:checked]:border-sky-700 dark:has-[:checked]:border">
                                <input type="radio" name="hatar4" class="form-check-input hidden" id="_03" value="1" checked   onchange="STAT_COM(this)">
                                1 hónap
                            </label>
                        </div>
                        <div class="col-xl-4 col-12">                
                            <label class="bg-zinc-50 text-slate-900 shadow-xl dark:bg-slate-950 dark:!border dark:!border-zinc-200/20 dark:text-zinc-200 hover:bg-gray-200 hover:outline outline-black/10 dark:hover:bg-gray-700 dark:hover:-outline-offset-1 dark:hover:outline-white/10 d-flex align-items-center justify-content-center p-2 my-2 rounded-xl cursor-pointer transition-all duration-200 has-[:checked]:bg-indigo-100 has-[:checked]:border-indigo-400 has-[:checked]:border has-[:checked]:shadow-md dark:has-[:checked]:bg-sky-950 dark:has-[:checked]:border-sky-700 dark:has-[:checked]:border">
                                <input type="radio" name="hatar4" class="form-check-input hidden" id="_03" value="6" onchange="STAT_COM(this)"> 
                                6 hónap
                            </label>
                        </div>
                        <div class="col-xl-4 col-12">                
                            <label class="bg-zinc-50 text-slate-900 shadow-xl dark:bg-slate-950 dark:!border dark:!border-zinc-200/20 dark:text-zinc-200 hover:bg-gray-200 hover:outline outline-black/10 dark:hover:bg-gray-700 dark:hover:-outline-offset-1 dark:hover:outline-white/10 d-flex align-items-center justify-content-center p-2 my-2 rounded-xl cursor-pointer transition-all duration-200 has-[:checked]:bg-indigo-100 has-[:checked]:border-indigo-400 has-[:checked]:border has-[:checked]:shadow-md dark:has-[:checked]:bg-sky-950 dark:has-[:checked]:border-sky-700 dark:has-[:checked]:border">  
                                <input type="radio" name="hatar4" class="form-check-input hidden" id="_03" value="12" onchange="STAT_COM(this)"> 
                                All time
                            </label>
                        </div>
                    </div>
                </div>
            </div>
        </div>`;

     $("#content_hely").fadeOut(300, async function() {
        await $("#content_hely").html(html).fadeIn(300); 
        $("#main_kontener").addClass("hidden");
        $("#content_hely").removeClass("hidden");
        DiagrammokSelect("kezdes");
        STAT_Penz();
        STAT_ELAD();
        STAT_KATEG();
        STAT_COM();
    });

    KezdolapElemekViszlat();
    $("#nezetkicsi").addClass("eltunt");
    $("#nezetnagy").addClass("eltunt");
    $("#pagi").html("");
    $("#kosar").prop("checked", false);
    $("#kezdolap").prop("checked", false);

    if (pushHistory) {
        SPAState.currentView = 'statisztika';
        SPAState.currentData = {};  
        history.pushState({ view: 'statisztika' }, 'Statisztika', `#statisztika`);
      }
}

// www.highcharts.com
function drawChart(rang) {
    // ha túl hosszú a neve, akkor lent ... lesz
    function shorten(name) { return name.length > 12 ? name.substring(0, 12) + "..." : name; 

    }
    // data előkészítés
     data = [
      { name: rang.rows[3].NEV, y:parseInt(rang.rows[3].DB)},
      { name: rang.rows[1].NEV, y:parseInt(rang.rows[1].DB)},
      { name: rang.rows[0].NEV, y:parseInt(rang.rows[0].DB)},
      { name: rang.rows[2].NEV, y:parseInt(rang.rows[2].DB)},
      { name: rang.rows[4].NEV, y:parseInt(rang.rows[4].DB)}
    ];
  
    // MOBIL nézet – 3 középső ==> ha kiseeb mint 600 px a szélesség akkor csak a top 3 mutatom meg
    let visibleData = data;
    if (window.innerWidth < 600) { visibleData = data.slice(1, 4); }
  
    // rangsor
    const sortedUnique = [...new Set(visibleData.map(d => d.y))].sort((a, b) => b - a);

    // rang meghatározása érték alapján
    function getRankByValue(v) { return sortedUnique.indexOf(v) + 1; }

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
        chart: { type: 'column', spacingTop: 10, backgroundColor: '' },
        exporting: { enabled: false },
        credits: { enabled: false },

        // semmi nincs benne, de itt  kell lennie, hogy a korona jól pozícionálva legyen
        title: { useHTML: true, text: "<div style='height:6px; padding: 5px;'></div>", margin: 180 },

        xAxis: { // ez a oszlop alatti rész, kiirja a neveket, és a darabszámokat / értéket
        categories: visibleData.map(d => shorten(d.name)),
        labels: {
            useHTML: true,
            formatter: function () {
            const original = visibleData[this.pos];
            return `
                <div style="text-align:center;">
                <div class="text-slate-900 dark:text-zinc-200" style="font-size:20px; font-weight:bold;">${shorten(original.name)}</div>
                <div class="text-slate-900 dark:text-zinc-200" style="font-size:18px;">${original.y}</div>
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
            backgroundColor: "",
            shadow: false,
            padding: 8,
            formatter: function () { // ez  a tooltip tartalma azért van így megcsinálva mert html kell bele és eltörhető legyen a szöveg
                return `<div class="bg-zinc-200 text-slate-900 rounded-3 shadow-lg" style="width: 180px; padding: 10px; text-align: center; white-space: normal; overflow-wrap: break-word;">
                            <div class="bg-zinc-200 text-slate-900" style="font-size:14px; font-weight:bold; margin-bottom:5px;">
                                ${this.point.name}
                            </div>
                            <div class="bg-zinc-200 text-slate-900" style="font-size:12px;">
                                ${this.point.y} db
                            </div>
                        </div>`;
            },

            positioner: function (tooltipWidth, tooltipHeight, point) { // ez a tooltip pozíciója 

                // azért ilyen bonyolult mert meg kellett nézni hogy hova fér el a tooltip és aszerint pozícionálni
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
                if (x + tooltipWidth > chartWidth) x = chartWidth - tooltipWidth; // HA FELFELÉ NEM FÉR EL → RAKD LEFELÉ
                
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
                    <div style="margin-top:-140px; position:relative; width:100px; display:flex; flex-direction:column; align-items:center; justify-content:center;text-align:center;">
                        ${isWinner ? `<img src="https://images-wixmp-ed30a86b8c4ca887773594c2.wixmp.com/f/25d45014-8cc3-4c98-b02c-5a0cf3a55ddd/dclmy10-72419003-8e69-41e8-a9f3-b7df637b74f8.png/v1/fill/w_900%2Ch_633/gold_crown_on_a_transparent_background__by_prussiaart_dclmy10-fullview.png?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1cm46YXBwOjdlMGQxODg5ODIyNjQzNzNhNWYwZDQxNWVhMGQyNmUwIiwiaXNzIjoidXJuOmFwcDo3ZTBkMTg4OTgyMjY0MzczYTVmMGQ0MTVlYTBkMjZlMCIsIm9iaiI6W1t7ImhlaWdodCI6Ijw9NjMzIiwicGF0aCI6Ii9mLzI1ZDQ1MDE0LThjYzMtNGM5OC1iMDJjLTVhMGNmM2E1NWRkZC9kY2xteTEwLTcyNDE5MDAzLThlNjktNDFlOC1hOWYzLWI3ZGY2MzdiNzRmOC5wbmciLCJ3aWR0aCI6Ijw9OTAwIn1dXSwiYXVkIjpbInVybjpzZXJ2aWNlOmltYWdlLm9wZXJhdGlvbnMiXX0.-1xQwTm0xcpa2ZJ_vvNA5hTKxUAe78z6H679BjudfZs" style="width:90px; position:absolute; top:-70px; left:50%; transform:translateX(-50%);">` : ''}
                        <div id="${this.point.name}"></div>
                        <div style="font-size:40px; font-weight:bold; color:white; text-shadow:0 0 5px black; margin-top:5px;">
                            ${place}
                        </div>
                    </div>`;
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
    if (innen !== "kezdes") { kivalasztott = innen.value; }

    // adat lekérés
    const eredmeny = await ajax_call(`Top5?INTERVALLUM=${kivalasztott}`, "GET", null, true);

    if (eredmeny.rows.length == 0) {
        if(eredmeny.message != "ok") {
            $('#_Top5').html("<div class='col-12 text-xl text-center p-3'>Hiba történt az adatok lekérdezésekor.</div>");
            return;
        }
        else{ // nincs adat
            $('#_Top5').html("<div class='col-12 text-xl text-center p-3'>Nincs elég adat a diagram megjelenítéséhez a kijelölt időszakban.</div>");
            return;
        }
    }
    if (eredmeny.rows.length < 5) {
        var db = 0;
        while (eredmeny.rows.length < 5) {
            db++;
            eredmeny.rows.push({NEV: "Nincs termék" + db , DB: 0, FOTOLINK: "img/Noimage.png"});
        }
    }

    // diagram rarajzolás
    await drawChart(eredmeny);


    // ||| képek betöltése |||

    // aktuális képernyőméret
    const mobil = window.innerWidth < 600;

    // 600px alatt: 3 darab (a highchart is a első 3-at mutatja)
    // 600px fölött: az összes bejön (5 darab) 
    const lista = mobil ? eredmeny.rows.slice(0, 3) : eredmeny.rows;

    // képek berakása
    for (const item of lista) {
        document.getElementById(item.NEV).innerHTML = `<img class="img-fluid rounded-3 object-cover" src="${item.FOTOLINK}" style="height:100px;">`;
    }
}

// ================= Bevétel diagram =====================
let penzChart = null;
async function STAT_Penz(innen){
    var intervallum = "1";
    if (innen != null){ intervallum = innen.value; }
    if (penzChart != null){ penzChart.destroy(); }

    var adat = await ajax_call(`bevetel_stat?INTERVALLUM=${intervallum}`, "GET", null, true);
    
    // adatok előkészítése
    const xValues = [];
    const yValues = [];

    
    var idok = [];

    // Évek kigyűjtése rendesen
    for (var item of adat.rows) {
        let ev = new Date(item.IDO).getFullYear();
        if (!idok.includes(ev)) { idok.push(ev); }
    }
    // IDÖ szép formátumu kiirása
    for (var item of adat.rows){
        let d = new Date(item.IDO);
        let text;
        if (idok.length > 1) {
            //több év van
            if (intervallum == "1") { text = d.toLocaleDateString(navigator.language, {year: "numeric", month: "long", day: "2-digit"}); } // napra bontva kell
            else { text = d.toLocaleDateString(navigator.language, {year: "numeric", month: "long"}); } // hónapos bontás
        }
        else {
            //1 évben vannak csak adatok
            if (intervallum == "1") { text = d.toLocaleDateString(navigator.language, {month: "long", day: "2-digit"}); } // napra bontva kell
            else { text = d.toLocaleDateString(navigator.language, {month: "long"}); } // hónapos bontás
        }
        xValues.push(text);
        yValues.push(item.BEVETEL);
    }
    
    penzChart =  new Chart("STAT_PENZ_GRAF", {
        type: "bar",
        data: { labels: xValues, datasets: [{ backgroundColor: "green", data: yValues }] },
        options: { 
            responsive: true, maintainAspectRatio: false,
            plugins: {
                legend: {display: false},
                title: { display: true, text: "Bevétel alakulása", font: {size: 16} }
            }
        }
    });
 // cancva divének legyen fix magassága
  // resposnive true           !! FONOTOS
  // maintainAspectRatio false !! FONTOS
  //
  // ezzekkel a paraméterekkel lehet  responzivvá tenni a chartot
}

// ================= Rendelések darabszáma diagram =====================

let Elad_Chart = null;
async function STAT_ELAD(innen){
    var intervallum = "1";
    if (innen != null){ intervallum = innen.value; }
    if (Elad_Chart != null){ Elad_Chart.destroy(); }

    var adat = await ajax_call(`rendelesek_stat?INTERVALLUM=${intervallum}`, "GET", null, true);
    
    const xValues = [];
    const yValues = [];

    var idok = [];

    // Évek kigyűjtése rendesen
    for (var item of adat.rows) {
        let ev = new Date(item.IDO).getFullYear();
        if (!idok.includes(ev)) { idok.push(ev); }
    }

    var tobbEv = idok.length > 1 || intervallum != 1;

    for (var item of adat.rows) {
        let d = new Date(item.IDO);
        let text;
        if (idok.length > 1) {
            //több év van
            if (intervallum == "1") { text = d.toLocaleDateString(navigator.language, {year: "numeric", month: "long", day: "2-digit"}); } // napra bontva kell
            else { text = d.toLocaleDateString(navigator.language, {year: "numeric", month: "long"}); } // hónapos bontás
        }
        else {
            //1 évben vannak csak adatok
            if(intervallum == "1"){ text = d.toLocaleDateString(navigator.language, {month: "long", day: "2-digit"}); } // napra bontva kell
            else { text = d.toLocaleDateString(navigator.language, {month: "long"}); } // hónapos bontás
        }
        xValues.push(text);
        yValues.push(item.DARAB);
    }

    Elad_Chart = new Chart("STAT_VMI_GRAF", {
        type: "bar",
        data: {
            labels: xValues,
            datasets: [{ backgroundColor: "Lightblue", data: yValues }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {display: false},
                title: { display: true, text: "Rendelések száma", font: {size: 16} }
            }
        }
    });
}

// ================= Rendelések kategóriákra bontva diagram =====================
let KAT_chart = null;
async function STAT_KATEG(innen){
    
    // alapértelmezett 1 hónap | ha innen nem null akkor onnan veszi az értéket
    var intervallum = innen ? innen.value : "1";
    if (KAT_chart) {
        KAT_chart.destroy();
        KAT_chart = null;
    }

    // adat lekérése az intevallummal
    var adat = await ajax_call(`kategoriak_stat?INTERVALLUM=${intervallum}`, "GET", null, true);

    // === ha NINCS ADAT ===
    if (adat.maxcount == 0) {
        KAT_chart = new Chart("STAT_KOR_GRAF", {
            type: "pie",
            data: { datasets: [{ backgroundColor: ["#ccc"], data: [1] }] },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: { enabled: false },
                    title: {
                        display: true,
                        text: ["Nincs adat ebben az időszakban, hogy", "kategóriák  ra bontva lássa", "a rendeléseket."],
                        color: "#777",
                        font: { size: 16 }
                    }
                }
            }
        });
        return;
    }

    // ==== VAN ADAT ====
    const xValues = [];
    const yValues = [];
    const szinek = ["red", "green", "blue", "orange", "cyan", "pink"];

    for (var item of adat.rows){
        xValues.push(item.KATEGORIA);
        yValues.push(item.DARAB);
    }

    KAT_chart = new Chart("STAT_KOR_GRAF", {
        type: "pie",
        data: { labels: xValues, datasets: [{ backgroundColor: szinek, data: yValues }] },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: true, position: 'right' },
                title: {
                    display: true,
                    text: "Rendelések kategóriákra bontva",
                    font: { size: 16 }
                }
            }
        }
    });
}

let COMM_chart = null;

async function STAT_COM(innen){
    // alapértelmezett 1 hónap | ha innen nem null akkor onnan veszi az értéket
    var intervallum = innen ? innen.value : "1";
    if (COMM_chart) {
        COMM_chart.destroy();
        COMM_chart = null;
    }
    // adat lekérése az intevallummal
    var adat = await ajax_call(`velemeny_stat?INTERVALLUM=${intervallum}`, "GET", null, true);

    // ===HA NINCS ADAT ===
    if (adat.maxcount == 0) {
        COMM_chart = new Chart("STAT_COMMENT", {
            type: "pie",
            data: { datasets: [{ backgroundColor: ["#ccc"], data: [1] }] },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: { enabled: false },
                    title: {
                        display: true,
                        text: ["Nincs adat ebben az időszakban, hogy", "lássa a kommentek eloszlását."],
                        position: "top",
                        font: { size: 16 },
                        color: "#777"
                    }
                }
            }
        });
        return;
    }

    // === VAN ADAT ===
    const xValues = [];
    const yValues = [];
    const barColors = [];

    for (var item of adat.rows) {
        xValues.push(item.ALLAPOT);
        yValues.push(item.DARAB);

        switch (item.ALLAPOT) {
            case "Jóváhagyva": barColors.push("green"); break;
            case "Jóváhagyásra vár": barColors.push("orange"); break;
            case "Elutasítva": barColors.push("red"); break;
        }
    }

    COMM_chart = new Chart("STAT_COMMENT", {
        type: "pie",
        data: {
            labels: xValues,
            datasets: [{ backgroundColor: barColors, data: yValues }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: true, position: 'right' },
                title: {
                    display: true,
                    text: "Commentek eloszlása",
                    position: "top",
                    font: { size: 16 }
                }
            }
        }
    });
}