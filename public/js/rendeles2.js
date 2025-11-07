
$("#rend_button").click(async function () {
    
    var s ="";

    
    var itemek = await ajax_post("rendelesek",1)
    console.log("ITEMEK" + itemek);
    
    if(itemek[0] !=  undefined){
        console.log("itemek van");
    }
    else{
        s = `
        <div class="col-12">
            <div class="text-center p-2" id="kosarmenutitle"><h5>A boltunkban még nem vásásroltál.</h5></div>
        </div>`;
    }










    $("#keresett_kifejezes").html("");
    $("#débé").html("");
    $("#nev1").val("");
    $("#pagi").html("");
   

    $("#content_hely").fadeOut(300, function() {
        $("#content_hely").html(s).fadeIn(300);
    });
});