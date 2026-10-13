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
  document.querySelectorAll('.asis__imgs figure:nth-child(2)')
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


  // 7) Attio식 커서 데모: 히어로 대시보드 위를 커서가 돌며 판단 순서를 짚음
  var heroFrame = document.querySelector('.hero__panel .frame');
  if (heroFrame) {
    var demo = document.createElement('div');
    demo.className = 'demo';
    demo.setAttribute('aria-hidden', 'true');
    demo.innerHTML = '<div class="demo__box"><span class="demo__tag">01 총자산</span></div>' +
      '<svg class="demo__cursor" viewBox="0 0 24 24"><path d="M4 2l16 9.5-7 1.6-3.6 6.4z" fill="#17243A" stroke="#fff" stroke-width="1.5" stroke-linejoin="round"/></svg>';
    heroFrame.appendChild(demo);
    var tag = demo.querySelector('.demo__tag'), cur = demo.querySelector('.demo__cursor');
    var labels = ['01 총자산', '02 지역', '03 예산 집행'], step = 0;
    setTimeout(function tick(){
      step = step % 3 + 1;
      demo.setAttribute('data-step', step);
      tag.textContent = labels[step - 1];
      setTimeout(function(){ cur.classList.add('click'); setTimeout(function(){ cur.classList.remove('click'); }, 160); }, 950);
      setTimeout(tick, 2600);
    }, 2200);
  }

  // 8) Pitch식 펼침: 사택신청현황 4버전이 한 더미에서 2×2로 펼쳐짐
  var vset = document.querySelector('.vset');
  var fans = vset ? Array.prototype.slice.call(vset.querySelectorAll('figure')) : [];
  var rots = [-7, -2.5, 2.5, 7];
  function measureFan(){
    if (!vset) return;
    var cx = vset.offsetWidth / 2, cy = vset.offsetHeight / 2;
    fans.forEach(function(f, i){
      f.style.setProperty('--dx', (cx - (f.offsetLeft + f.offsetWidth / 2)) + 'px');
      f.style.setProperty('--dy', (cy - (f.offsetTop + f.offsetHeight / 2)) + 'px');
      f.style.setProperty('--rot', rots[i % 4] + 'deg');
      f.style.zIndex = 4 - i;
    });
  }
  fans.forEach(function(f){ f.classList.remove('rv'); f.classList.add('fan'); });
  measureFan();
  window.addEventListener('resize', measureFan);
  function updateFan(){
    if (!vset) return;
    var r = vset.getBoundingClientRect(), vh = window.innerHeight;
    var p = clamp((vh * 0.85 - r.top) / (vh * 0.6));
    fans.forEach(function(f){ f.style.setProperty('--p', p.toFixed(3)); });
  }
  window.addEventListener('scroll', function(){ requestAnimationFrame(updateFan); }, { passive: true });
  updateFan();

  // 6) 히어로 제목은 로드 직후 바로 재생
  var hero = document.querySelector('.hero .display');
  if (hero) requestAnimationFrame(function(){ hero.classList.add('in'); });
})();
