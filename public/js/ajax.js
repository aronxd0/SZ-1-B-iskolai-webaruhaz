// itt vannak a backend kommunikációhoz használt függvények

function üzen(mit, tip)  {
    alerts.forEach((element) => { $("#toast1").removeClass( "bg-"+element ); });  // előző osztályok nyekk...
    $("#toast1").addClass( "bg-"+tip );                                           // új class 
    $("#toast1 .toast-body").html(mit);  
    $("#toast1").toast( { delay: 7500 });
    $("#toast1").toast("show");  
}

function ajax_call(urlsor, tipus, data = null, spinner = false) {
  return new Promise((resolve, reject) => {
    const isFormData = data instanceof FormData;
    const hasData = data !== null && data !== undefined;
    $.ajax({
      url: urlsor,
      type: tipus,
      data: hasData ? (isFormData ? data : JSON.stringify(data)) : undefined,  // Ha nincs adat, undefined
      processData: hasData ? false : false,
      contentType: hasData ? (isFormData ? false : 'application/json; charset=UTF-8') : false,  // Ha nincs adat, false
      async: true,
      cache: false,
      dataType: "json",
      beforeSend: spinner ? function() {
        const spinner = `<div id="spinner-overlay" style="position:fixed;top:0;left:0;width:100%;height:100%;
                                        background:rgba(0,0,0,0.6);z-index:9999;
                                        display:flex;align-items:center;justify-content:center;backdrop-filter: blur(10px);opacity: 1;">
                                <div class="spinner-border text-primary"></div>
                            </div>`;
        $("body").append(spinner);
      } : "",
      success: resolve,
      error: (jqXHR) => {
        üzen(JSON.parse(jqXHR.responseText).message, "danger");
        reject(jqXHR.responseText);
      },
      complete: spinner ? function() {
        $('#spinner-overlay').remove();
      } : ""
    });
  });
}