/*!
 * Start Bootstrap - Freelancer Bootstrap Theme (http://startbootstrap.com)
 * Code licensed under the Apache License v2.0.
 * For details, see http://www.apache.org/licenses/LICENSE-2.0.
 */

// jQuery for page scrolling feature - requires jQuery Easing plugin
$(function() {
    $('.page-scroll a').bind('click', function(event) {
        var $anchor = $(this);
        var headerHeight = $('.navbar-fixed-top').outerHeight();
        $('html, body').stop().animate({
            scrollTop: $($anchor.attr('href')).offset().top - headerHeight
        }, 1500, 'easeInOutExpo');
        event.preventDefault();
    });
});

// Floating label headings for the contact form
$(function() {
    $("body").on("input propertychange", ".floating-label-form-group", function(e) {
        $(this).toggleClass("floating-label-form-group-with-value", !! $(e.target).val());
    }).on("focus", ".floating-label-form-group", function() {
        $(this).addClass("floating-label-form-group-with-focus");
    }).on("blur", ".floating-label-form-group", function() {
        $(this).removeClass("floating-label-form-group-with-focus");
    });
});

// Highlight the top nav as scrolling occurs
$(function() {
    var $body = $('body');
    var $navbar = $('.navbar-fixed-top');
    function setScrollSpy() {
        var headerHeight = $navbar.outerHeight();
        $body.scrollspy('dispose');
        $body.scrollspy({
            target: '.navbar-fixed-top',
            offset: headerHeight
        });
    }
    setScrollSpy();
    $(window).on('resize', setScrollSpy);
});

// Closes the Responsive Menu on Menu Item Click
$('.navbar-collapse ul li a').click(function() {
    $('.navbar-toggle:visible').click();
});
