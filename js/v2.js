/* v2.js — fade/reveal 1회 재생, 챕터 위치, 대시보드 영역 확대 연동 (스크롤 가로채기 없음) */
(function(){
  'use strict';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // 1) 진입: 뷰포트에 들어오면 한 번만 재생
  var rv = document.querySelectorAll('.rv, .rv-img, .rv-slide');
  if (reduce || !('IntersectionObserver' in window)) {
    rv.forEach(function(el){ el.classList.add('in'); });
  } else {
    var io = new IntersectionObserver(function(es){
      es.forEach(function(e){
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    rv.forEach(function(el){ io.observe(el); });
  }

  // 2) 상단 바: 현재 챕터 표시 (S1~S2 구간은 01로)
  var links = {};
  document.querySelectorAll('.bar__nav a').forEach(function(a){ links[a.getAttribute('data-ch')] = a; });
  function setCh(id){
    Object.keys(links).forEach(function(k){
      if (k === id) links[k].setAttribute('aria-current','true'); else links[k].removeAttribute('aria-current');
    });
  }
  var chIds = ['S2','S5','S6'];
  function onScroll(){
    var y = window.scrollY + 120, cur = null;
    chIds.forEach(function(id){
      var el = document.getElementById(id);
      if (el && el.offsetTop <= y) cur = id;
    });
    // S2 이전(Hero)에서는 표시 없음, S7 이후도 마지막 챕터 유지
    setCh(cur);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // 3) 대시보드: 오른쪽 단계가 화면 중앙에 오면 왼쪽 축소 화면의 강조 영역 이동
  var stage = document.getElementById('zoomStage');
  if (stage && 'IntersectionObserver' in window) {
    var so = new IntersectionObserver(function(es){
      es.forEach(function(e){
        if (e.isIntersecting) stage.setAttribute('data-active', e.target.getAttribute('data-step'));
      });
    }, { rootMargin: '-42% 0px -42% 0px' });
    document.querySelectorAll('.zoom__steps li').forEach(function(li){ so.observe(li); });
  }

})();
