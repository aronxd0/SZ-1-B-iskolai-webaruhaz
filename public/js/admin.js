function Admin_Velemenykezeles() {

    $("#content_hely").fadeOut(300, function() {
        $("#content_hely").html(`
        <div class="row">
            <div class="col-12 text-center p-2 mt-3">
                <span class="text-xl">admin velemenykezeles hely</span>
            </div>
        </div>
        `).fadeIn(300);
    });
}