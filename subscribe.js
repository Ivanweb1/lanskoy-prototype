/* Подписка: кнопки внутри экранов переключают состояние.
   Сам переключатель состояний живёт в events.js. */
document.querySelectorAll('[data-state-go]').forEach(function (b) {
  b.addEventListener('click', function () {
    var target = document.querySelector('.proto-bar__st[data-state="' + b.dataset.stateGo + '"]');
    if (target) target.click();
  });
});
