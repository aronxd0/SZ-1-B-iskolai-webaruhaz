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
        resolve(data); // promise megoldva, a “return” a sikeres aszinkron hívásnál.
      },
      error: function(jqXHR) {
        üzen(jqXHR.responseText, "danger");
        reject(jqXHR.responseText); // ❌ Promise elutasítva
      },
      complete: function() {
        $('#spinner-overlay').remove();
      }
    });
  });
}


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

