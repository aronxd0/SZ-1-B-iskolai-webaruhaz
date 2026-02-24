function UjTermek() {
    $("#home_button").closest(".gombdiv").removeClass("aktiv");
    $("#cart_button").closest(".gombdiv").removeClass("aktiv");
    TermekSzerkesztoAblak(event,0,"bevitel");
    $("#save_button").html(`<i class="bi bi-plus-lg"></i>&nbsp;Új termék létrehozása`);
}