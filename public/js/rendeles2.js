
$("#rend_button").click(async function () {
   
    let ureskosar = `
                <div class="col-12">
                    <div class="text-center p-2" id="kosarmenutitle"><h5>A boltunkban még nem vásásroltál.</h5></div>
                </div>`;



    console.log("rendeles2.js rend_button click");
    $("#keresett_kifejezes").html("");
    $("#débé").html("");
    $("#nev1").val("");
    $("#pagi").html("");
   

    $("#content_hely").fadeOut(300, function() {
        $("#content_hely").html(ureskosar).fadeIn(300);
    });
});