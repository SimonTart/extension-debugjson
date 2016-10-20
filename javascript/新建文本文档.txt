(function() {
    var $messageBox = $(".message-box");
    var timeId;
    $.message = function(message, time) {
        clearTimeout(timeId);
        time = time || 1200;
        $messageBox.text(message).show();
        timeId = setTimeout(function() {
            $messageBox.hide();
        }, time);
    }

})();

$(function() {
    chrome.storage.local.get("parameters", function(obj) {
        var parameters = obj.parameters || [];
        $("#queryParam").val(parameters.join("&"));
    });

    $(".nav .nav-item").on("click", function() {
        var index = $(this).index();
        $(this).addClass("active").siblings().removeClass("active");
        $(".content-box>div").hide().eq(index).show();
    });
    $(".confirm-btn").on("click", function() {
        var params = $("#queryParam").val();
        if (!params) {
            $.message("请输入要添加的参数");
            return;
        }
        chrome.storage.local.set({
            parameters: params.split("&")
        }, function() {
            $.message("保存成功");
        });
    });
});