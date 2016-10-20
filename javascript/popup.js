$(function() {
    $(".nav .nav-item").on("click", function() {
        var index = $(this).index();
        $(this).addClass("active").siblings().removeClass("active");
        $(".content-box>div").hide().eq(index).show();
    });
});