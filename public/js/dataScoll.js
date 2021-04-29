// 数字滚动
function numInit() {
  $('.counter-value').each(function () {
    $(this).prop('Counter', 0).animate({
      Counter: $(this).text()
    }, {
      duration: 2500,
      easing: 'swing',
      step: function (now) {
        $(this).text(now.toFixed(0));
      }
    });
  });
}

function numInit1() {
  $('.counter-value1').each(function () {
    $(this).prop('Counter', 0).animate({
      Counter: $(this).text()
    }, {
      duration: 2500,
      easing: 'swing',
      step: function (now) {
        $(this).text(now.toFixed(1));
      }
    });
  });
}

function numInit2() {
  $('.counter-value2').each(function () {
    $(this).prop('Counter', 0).animate({
      Counter: $(this).text()
    }, {
      duration: 2500,
      easing: 'swing',
      step: function (now) {
        $(this).text(now.toFixed(2));
      }
    });
  });
}

function numRandom() {
  $('.counter-value-random').each(function () {
    let val = Number($(this).prop('innerText'));
    let r_val = Math.round(Math.random() * 5)
    if (Math.round(Math.random()) === 0) {
      val = val + r_val;
    } else {
      val = val - r_val;
    }
    $(this).prop('innerText', val)
  })
}

numInit();
numInit1();
numInit2();
numRandom();
