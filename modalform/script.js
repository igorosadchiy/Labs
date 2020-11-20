  $(function() {
    // Кнопка "Обратный звонок"
    $(".makecall").click(function(){
      $(".popup_callback").fadeIn(100);
      return false;
    });
    $(".popup_close").click(goodClose);
    function goodClose() {
        $(".popup_good").fadeOut(50);
		$(".popup_phone").fadeIn(50);
		$("input[name=imya]").val("");
		$("input[name=phone]").val("");
        $(".popup_callback").fadeOut(200);
    };
    // $("input[name=phone]").mask("(999) 999-99-99");
    // $("input[name=tel]").mask("(999) 999-99-99");

    // Если нажали кнопку отправить (обратный звонок)
    $("#request").click(function() {

        // Номер телефона
      var phone = $("input[name=phone]").val();
	  var name = $("input[name=name]").val();
      if(phone == "") {
        $("input[name=phone]").css("background-color", "orangered");
            return;
      }
        $.ajax({
            type: "POST",
            url: "/mail.php",
            data: {
                phone:phone,
				name:name
            },
            success: function(data){
				gtag('event', 'tel_callback', { 'event_category': 'tel', 'event_action': 'callback', });
                // ga('send', 'event', 'callback','clicked');
            }
        });
        $(".popup_phone").fadeOut(200);
        $(".popup_good").fadeIn(400);
        setTimeout(goodClose, 4000);
    });
  });