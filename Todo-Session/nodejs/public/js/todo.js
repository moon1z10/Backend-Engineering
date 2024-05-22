$(document).ready(function () {
    $('form').on('submit', function () {
        $(this).find('button').prop('disabled', true);
    });
});
