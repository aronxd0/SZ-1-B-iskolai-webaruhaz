// itt vannak a backend kommunikációhoz használt függvények

function üzen(mit, tip)  {
    alerts.forEach((element) => { $("#toast1").removeClass( "bg-"+element ); });  // előző osztályok nyekk...
    $("#toast1").addClass( "bg-"+tip );                                           // új class 
    $("#toast1 .toast-body").html(mit);  
    $("#toast1").toast( { delay: 5000 });
    $("#toast1").toast("show");  
}


function ajax_post(urlsor, tipus) {
  return new Promise((resolve, reject) => {
    $.ajax({
      url: urlsor,
      type: "post",
      async: true,
      cache: false,
      dataType: tipus === 0 ? "html" : "json",
      beforeSend: function() {
        const spinner = `<div id="spinner-overlay" style="position:fixed;top:0;left:0;width:100%;height:100%;
                                        background:rgba(0,0,0,0.6);z-index:9999;
                                        display:flex;align-items:center;justify-content:center;backdrop-filter: blur(10px);opacity: 1;">
                                <div class="spinner-border text-primary"></div>
                            </div>`;
        $("body").append(spinner);
      },
      success: function(data) {
        resolve(data); // promise megoldva, a “return” a sikeres aszinkron hivasnal.
      },
      error: function(jqXHR) {
        üzen(jqXHR.responseText, "danger");
        reject(jqXHR.responseText); // promise elutasitva
      },
      complete: function() {
        $('#spinner-overlay').remove();
      }
    });
  });
}

function ajax_post_SpinnerNelkul(urlsor, adat) { // emailnek a ajaxposta 
  return new Promise((resolve, reject) => { // 2 paraméter küldése ami a backendnek kell html/email/subject 
    $.ajax({
      url: urlsor,
      type: "post",
      async: true,
      cache: false,
      data: adat,           // <<< KELL !!! az a + adat ami a hmtl / subject / email
      dataType: "json",
      success: function(data) {
        resolve(data);
      },
      error: function(jqXHR) {
        üzen(jqXHR.responseText, "danger");
        reject(jqXHR.responseText);
      },    
    });
  });
}



// masik post fuggveny formdata-hoz (kep feltolteshez stimmeljen minden szar)

function ajax_post_formdata(url, formData) {
  return new Promise((resolve, reject) => {
    $.ajax({
      url: url,
      type: "POST",
      data: formData,
      processData: false,
      contentType: false,
      dataType: "json",

      beforeSend: function() {
        const spinner = `
          <div id="spinner-overlay" style="position:fixed;top:0;left:0;width:100%;height:100%;
          background:rgba(0,0,0,0.6);z-index:9999;
          display:flex;align-items:center;justify-content:center;backdrop-filter: blur(10px);opacity: 1;">
            <div class="spinner-border text-primary"></div>
          </div>`;
        $("body").append(spinner);
      },

      success: resolve,
      error: (jqXHR) => {
        üzen(jqXHR.responseText, "danger");
        reject(jqXHR.responseText);
      },

      complete: function() {
        $('#spinner-overlay').remove();
      }
    });
  });
}













function ajax_get( urlsor, hova, tipus, aszinkron ) {         // html oldalak beszúrására használjuk
    $.ajax({url: urlsor, type:"get", async:aszinkron, cache:false, dataType:tipus===0?'html':'json',
        beforeSend:function(xhr)   { 
            const spinner = '<div id="spinner" class="spinner-border text-primary" style="position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); z-index: 9999;"></div>';
            // Spinner hozzáadása a body-hoz
            $('body').append(spinner);
         },
        success:   function(data)  { $(hova).html(data); },
        error:     function(jqXHR, textStatus, errorThrown) {üzen(jqXHR.responseText, "danger");},
        complete:  function()      { $('#spinner').remove(); }  
    });
    return true;
};

