(function(){
  if (window.__tortillaScroll) return;
  window.__tortillaScroll = true;

  var hero = null, pending = false;

  function paint(){
    pending = false;
    if (!hero) hero = document.getElementById("heroInner");
    if (!hero) return;
    var t = Math.min(1, Math.max(0, (window.scrollY || 0) / window.innerHeight));
    hero.style.transform = "scale(" + (1 - t * 0.1) + ") translateY(" + (t * -40) + "px)";
    hero.style.opacity = String(1 - t * 0.35);
  }
  function onScroll(){
    if (pending) return;
    pending = true;
    requestAnimationFrame(paint);
  }
  window.addEventListener("scroll", onScroll, {passive:true});
  window.addEventListener("resize", onScroll);
  onScroll();

  // reveal on enter; nothing may stay hidden
  if (typeof IntersectionObserver === "function"){
    var io = new IntersectionObserver(function(es){
      for (var i = 0; i !== es.length; i++){
        if (es[i].isIntersecting){
          var n = es[i].target;
          n.style.opacity = "";
          n.style.transform = "";
          io.unobserve(n);
        }
      }
    }, {rootMargin: "0px 0px -6% 0px", threshold: 0.02});

    var seen = 0;
    function register(){
      var ns = document.querySelectorAll("[data-reveal]");
      if (ns.length === seen) return;
      seen = ns.length;
      var h = window.innerHeight;
      for (var i = 0; i !== ns.length; i++){
        var n = ns[i];
        if (n.dataset.init) continue;
        n.dataset.init = "1";
        if (n.getBoundingClientRect().top > h * 0.92){
          n.style.opacity = "0";
          n.style.transform = "translateY(30px)";
        }
        io.observe(n);
      }
    }
    var reg = setInterval(register, 500);
    setTimeout(function(){ clearInterval(reg); }, 8000);
    register();
  }

  // hard mute: no media on this page ever plays sound
  function kill(v){
    try { if (v.muted !== true) v.muted = true; if (v.volume !== 0) v.volume = 0; } catch(e){}
  }
  var P = window.HTMLMediaElement && HTMLMediaElement.prototype;
  if (P && P.play && !P.__tortillaWrapped){
    var origPlay = P.play;
    P.play = function(){ kill(this); var r = origPlay.apply(this, arguments); kill(this); return r; };
    P.__tortillaWrapped = true;
  }
  ["loadedmetadata","canplay","play","playing","volumechange"].forEach(function(ev){
    document.addEventListener(ev, function(e){
      var t = e.target;
      if (t && (t.tagName === "VIDEO" || t.tagName === "AUDIO")) kill(t);
    }, true);
  });
  setInterval(function(){
    var vs = document.querySelectorAll("video, audio");
    for (var i = 0; i !== vs.length; i++) kill(vs[i]);
  }, 1000);
})();
