/* the hero journey is an illustration: its buttons are not focusable */
document.querySelectorAll('#section-1 .aj-journey button, #section-1 .aj-journey a').forEach(function(e){e.setAttribute('tabindex','-1');e.setAttribute('aria-hidden','true')});
