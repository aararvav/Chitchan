/**
 * Created by Daniel on 10/23/2016.
 */
var toggle_form_button = document.getElementById("post-form-toggle");
var post_thread_form = document.getElementById("post-thread-form");
var hideIcon = document.getElementsByClassName("hideIcon");
var getUrl = window.location;
var baseUrl = getUrl.protocol + "//" + getUrl.host + "/" + getUrl.pathname.split('/')[1];
var imageLinks = document.querySelectorAll('.threadImg-big[href$=".png"],  .threadImg-big[href$=".jpg"],  .threadImg-big[href$=".gif"], .threadImg-big[href$=".bmp"], .threadImg-big[href$=".PNG"]');

function randomBanner(){
    var currentBoard = window.location.pathname.split('/')[2]; // Get the board slug from URL
    var baseUrl = document.location.origin;
    
    // If we're on /pol/ board, use 2.gif
    if (currentBoard === 'pol') {
        document.getElementById('banner-img').setAttribute('src', baseUrl + "/assets/img/board-titles/2.gif");
        return;
    }
    
    // For other boards, use random banner excluding 2.gif
    var images = ["1.gif", "3.gif", "4.gif", "5.gif", "6.gif"];
    var imageNum = Math.floor(Math.random() * images.length);
    document.getElementById('banner-img').setAttribute('src', baseUrl + "/assets/img/board-titles/" + images[imageNum]);
}

window.onload = randomBanner();

toggle_form_button.addEventListener('click', function(e){
    e.preventDefault();
    post_thread_form.style.display = "block";
    toggle_form_button.style.display = "none"; //why does 4chan hide their toggle ?
}, false);


for (var i = 0; i < hideIcon.length; i++) {
   hideIcon[i].addEventListener('click', function(e){
       e.preventDefault();
       this.classList.toggle("hideThread");
   }, false);
}

Array.prototype.forEach.call(imageLinks, function(el, i){
    if(el){
        console.log("There is an element");
        el.setAttribute('title', "Click to enlarge image.");
        el.addEventListener('click', function(e){
            e.preventDefault();
            this.children[0].classList.toggle("expandedImg");
            this.parentElement.classList.toggle("threadThumbnail-push");
        }, false);
    }
});


//Front end validation.

