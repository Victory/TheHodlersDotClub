// == jQuery plugins ==
(function($) {
  $.fn.vModal = function(action) {

    if (action === undefined) {
      this.addClass('hide');
    } else if (action === "show") {
      this.removeClass('hide');
    } else if (action === "hide") {
      this.addClass('hide');
    }

    return this;
  };
}(jQuery));

// == global bindings ==
$('body').on('click', '[data-dismiss=modal]', function () {
  $(this).parents('.modal').addClass('hide');
});

$('body').on('click', '.modal', function (evt) {
  var $target = $(evt.target);
  if (evt.target == this || $target.hasClass('modal-dialog')) {
    $(this).addClass('hide');
  }
});
