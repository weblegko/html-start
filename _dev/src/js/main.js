// import "matchmedia-polyfill";
// import "matchmedia-polyfill/matchMedia.addListener";

//import objectFitImages from "object-fit-images"; // Полифил
//import "lazysizes";

//import {MDCRipple} from '@material/ripple';
// import {MDCTextField} from '@material/textfield';

import Lightbox from "./components/lightbox.js";
import Slider from "./components/slider.js";
import ScrollToTopBtn from "./components/scrolltotop-btn.js";
import MainMenu from './components/main-menu.js';
import NavBar from "./components/nav-bar.js";
//import ymaps from 'ymaps';

class Application {

    constructor() {

        this.initCommon();
        // //this.initMaterialDesignStuff();
        // this.initSliders();
        // //this.initAjaxBlogLoad();
        // this.initMobileViewPortHeight();
        // this.initYandexMap();


        // Carousel
        let $carousel = $('.carousel');
        if ($carousel.length !== 0) {
             new Slider($carousel, {
                 counter: false,
                 infinite: true,
                 slidesToShow: 1,
                 slidesToScroll: 1,                
                 arrows: true,
                 prevArrow: '<button class="carousel-prev"><span class="icon-left"></span></button>',
                 nextArrow: '<button class="carousel-next"><span class="icon-right"></span></button>',
                 adaptiveHeight: true,                
                 
                //  responsive: [
                //      {
                //          breakpoint: 767,
                //          settings: {
                //              slidesToShow: 2,
                //              arrows: false
                //          }
                //      },
                //  ]
             });
        }

        
    }


    // initMaterialDesignStuff() {
    //     // еффект ripple на кнопках        
    //     [].map.call(document.querySelectorAll('.mdc-button'), function(el) {
    //         return new MDCRipple(el);
    //     });

    //     // текстовые поля форм
    //     // [].map.call(document.querySelectorAll('.mdc-text-field'), function(el) {
    //     //     return new MDCTextField(el);
    //     // });
    // }
    
    
    // Инициализации
    initCommon() {

        new Lightbox();

        new ScrollToTopBtn();

        new MainMenu('ul.sf-menu');

        new NavBar();



        
        // прокрутить вниз первый экран
        // $('.js-go-down').click(function (e) {
        //     e.preventDefault();
        //     let y = $('.header-wrap').height();
        //     $("html, body").animate(
        //         { scrollTop: y }, 1000);
        // });

        // // Плавная прокрутка при переходе по якорю
        // const $root = $('html, body');
        // $('#main-menu a').click(function() {
        //     var href = $.attr(this, 'href');
        //     href = href.substring(1, href.length);
        //     //console.log(href);
        //     $root.animate({
        //         scrollTop: $(href).offset().top
        //     }, 1500, function () {
        //         window.location.hash = href;
        //     });
        //     return false;
        // });
        
    }

    // кастыльное решение 100vh для мобильников
    initMobileViewPortHeight() {
        // https://css-tricks.com/the-trick-to-viewport-units-on-mobile/
        // First we get the viewport height and we multiple it by 1% to get a value for a vh unit
        let vh = window.innerHeight * 0.01;
        // Then we set the value in the --vh custom property to the root of the document
        document.documentElement.style.setProperty('--vh', `${vh}px`);
        let document_width = window.innerWidth; 
        // We listen to the resize event (а ресайз в мобилках срабатывает и при скроле, когда исчезает строка ввода адреса в браузере)
        window.addEventListener('resize', () => {
            // We execute the same script as before
            if (document_width != window.innerWidth) {
                document_width = window.innerWidth; 
                let vh = window.innerHeight * 0.01;                    
                document.documentElement.style.setProperty('--vh', `${vh}px`);
            }
        });
    }
    
}


// запуск приложения
$(() => {
    new Application();
});