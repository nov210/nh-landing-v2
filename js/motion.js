/* motion.js — 스크롤 연동 모션 (줄 마스크, 히어로 펴짐, 오프너 슬라이드, 패럴랙스, 읽기 진행 바) */
(function(){
  'use strict';
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  var root = document.documentElement;
  root.classList.add('mo');

  // 1) 제목을 줄 단위 마스크로 감싸기 (<br> 기준)
  var heads = document.querySelectorAll('.hero .display, .headline, .opener h2');
  heads.forEach(function(h){
    var parts = h.innerHTML.split(/<br\s*\/?>/i);
    h.innerHTML = parts.map(function(t, i){
      return '<span class="ln"><span class="ln__in" style="transition-delay:' + (i * 0.12) + 's">' + t.trim() + '</span></span>';
    }).join('');
    h.classList.add('mask');
  });

  // 2) 화면에 들어오면 한 번 재생 (제목 마스크, 설계 판단 구분선)
  var once = document.querySelectorAll('.mask, .dec__row');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function(es){
      es.forEach(function(e){
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, { threshold: 0.2 });
    once.forEach(function(el){ io.observe(el); });
  } else {
    once.forEach(function(el){ el.classList.add('in'); });
  }

  // 3) 챕터 오프너 뒤 큰 번호
  document.querySelectorAll('.opener').forEach(function(op){
    var idx = op.querySelector('.ctx__idx');
    if (!idx) return;
    var n = document.createElement('span');
    n.className = 'opener__num';
    n.setAttribute('aria-hidden', 'true');
    n.textContent = idx.textContent.trim();
    op.appendChild(n);
  });

  // 4) 패럴랙스 대상
  document.querySelectorAll('.asis__imgs figure:nth-child(2), .vset figure:nth-child(even) > div')
    .forEach(function(el){ el.classList.add('px'); });

  // 5) 스크롤 진행값 --p
  var panel = document.querySelector('.hero__panel');
  var openers = Array.prototype.slice.call(document.querySelectorAll('.opener'));
  var pxs = Array.prototype.slice.call(document.querySelectorAll('.px'));
  var clamp = function(v){ return v < 0 ? 0 : v > 1 ? 1 : v; };
  var ticking = false;

  function update(){
    ticking = false;
    var vh = window.innerHeight;
    if (panel) {
      var r = panel.getBoundingClientRect();
      panel.style.setProperty('--p', clamp((vh - r.top) / (vh * 0.8)).toFixed(3));
    }
    openers.forEach(function(op){
      var r = op.getBoundingClientRect();
      op.style.setProperty('--p', clamp((vh - r.top) / (vh * 0.6)).toFixed(3));
    });
    pxs.forEach(function(el){
      var r = el.getBoundingClientRect();
      if (r.bottom < -200 || r.top > vh + 200) return;
      el.style.setProperty('--p', clamp((vh - r.top) / (vh + r.height)).toFixed(3));
    });
    var max = document.documentElement.scrollHeight - vh;
    root.style.setProperty('--read', max > 0 ? clamp(window.scrollY / max).toFixed(4) : 1);
  }
  function onScroll(){ if (!ticking) { ticking = true; requestAnimationFrame(update); } }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  update();

  // 6) 히어로 제목은 로드 직후 바로 재생
  var hero = document.querySelector('.hero .display');
  if (hero) requestAnimationFrame(function(){ hero.classList.add('in'); });
})();
