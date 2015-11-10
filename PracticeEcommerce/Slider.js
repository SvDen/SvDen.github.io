window.onload = function () {


    var slides = document.querySelectorAll('.sliderPoints');
    var wrapper = document.querySelector('.slides_wrapper');
    var currentSlide;
    var currentSlideNumber = 0;
    var interval;

    for (var i=0; i< slides.length; i++){
        slides[i].addEventListener('click', clickSlide);
    }

    slides[0].classList.add('active');

    function clickSlide(e){
        clearSlides();

        currentSlide = e.target;
        currentSlideNumber = parseInt(currentSlide.getAttribute('data-pos'))/-900;

        rotateSlider(currentSlide);

        /*Clear interval on first click & set another one for 5 sec instead 3 sec*/
        clearInterval(interval);
        interval = setInterval(autoR, 5000)
    }

    function clearSlides() {
        for (var i=0; i<slides.length;i++){
            slides[i].classList.remove('active');
        }
    }

    function rotateSlider(slide) {
        slide.classList.add('active');
        var position = slide.getAttribute('data-pos');
        wrapper.style.left = position;
    }

    /*Auto rotate function*/
    interval = setInterval(autoR, 3000);

    function autoR() {
        clearSlides();
        currentSlideNumber + 1 == slides.length ? currentSlideNumber = 0 : currentSlideNumber++;
        rotateSlider(slides[currentSlideNumber]);
    }

    /***FEATURE SLIDER***/

    startFeatureSlider();

    /*Feature Slider*/
    function startFeatureSlider () {
        var wrapper_feature = document.querySelector('#feature_container');
        var itemsQuantity = document.querySelectorAll('.feature_item').length;
        var sliderWidth = parseInt(getComputedStyle(document.querySelector('#feature_screen')).width) + 1;
        var currentPos = 0;

        document.querySelector('#leftArrow').addEventListener('click', rotateLeft);
        document.querySelector('#rightArrow').addEventListener('click', rotateRight);

        function rotateRight() {
            if (currentPos < itemsQuantity - Math.round(sliderWidth/340)) {currentPos++;
                wrapper_feature.style.transform = 'translate3D(' + (-340*currentPos) + 'px,0px,0px)'}
            else {
                wrapper_feature.style.transform = 'translate3D(' + (-340*(currentPos+1)) + 'px,0px,0px)';
                setTimeout(function () {wrapper_feature.style.transform = 'translate3D(' + (-340*(currentPos)) + 'px,0px,0px)'},500);
            }
        }

        function rotateLeft() {
            if (currentPos > 0) {currentPos--;
                wrapper_feature.style.transform = 'translate3D(' + (-340*currentPos) + 'px,0px,0px)'}
            else {
                wrapper_feature.style.transform = 'translate3D(' + (340) + 'px,0px,0px)';
                setTimeout(function () {wrapper_feature.style.transform = 'translate3D(' + 0 + 'px,0px,0px)'},500);
            }
        }
    }

    /*** MENU ON PHONES ***/

    document.querySelector('#pull').addEventListener('click', actionMenu);
    var menuHight = document.querySelectorAll('.menu_item').length * 35 + 20 + 'px';

    var menu = document.querySelector('#nav_menu');

    function actionMenu () {
        this.height = getComputedStyle(menu).height;
        if (document.documentElement.clientWidth <= '450' && this.height == '35px') menu.style.height = menuHight;
        if (this.height == menuHight) menu.style.height = 35 +'px';
    }

}