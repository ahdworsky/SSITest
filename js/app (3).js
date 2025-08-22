
(function(){
  function onReady(fn){ if(document.readyState!=='loading') fn(); else document.addEventListener('DOMContentLoaded', fn); }

  onReady(function(){
    function $(sel, root){ return (root||document).querySelector(sel); }
    function $all(sel, root){ return Array.prototype.slice.call((root||document).querySelectorAll(sel)); }
    function lockScroll(on){ try{ document.body.style.overflow = on ? 'hidden' : ''; }catch(e){} }

    // ---------- Appointment Form ----------
    var formEl = $('#appointment-form');
    var backdropEl = $('#modal-backdrop');
    function openForm(){ if(formEl && backdropEl){ formEl.hidden=false; backdropEl.hidden=false; lockScroll(true); } }
    function closeForm(){ if(formEl && backdropEl){ formEl.hidden=true; backdropEl.hidden=true; lockScroll(false); } }

    document.addEventListener('click', function(e){
      var openBtn = e.target.closest && e.target.closest('a.js-open-appt');
      if(openBtn){ e.preventDefault(); openForm(); }
    });
    document.addEventListener('click', function(e){
      if(e.target && e.target.id==='modal-backdrop'){ closeForm(); }
      if(e.target && e.target.closest && e.target.closest('.close-btn')){ e.preventDefault(); closeForm(); }
    });
    document.addEventListener('keydown', function(e){
      if(e.key==='Escape'){ closeForm(); closeVideoModal(); closeImageLightbox(); }
    });

    // ---------- Image Lightbox (supports single + gallery) ----------
    var imgBox = $('#img-lightbox');
    var imgView = $('#img-view');
    var fig = $('#img-modal');
    var prevBtn = $('#img-prev');
    var nextBtn = $('#img-next');
    var galleryList = null;
    var galleryIndex = 0;

    function ensureNavButtons(){
      if(!fig) { fig = $('#img-modal'); if(!fig) return; }
      if(!prevBtn){
        prevBtn = document.createElement('button');
        prevBtn.id='img-prev'; prevBtn.setAttribute('aria-label','Previous image');
        prevBtn.textContent='‹';
        Object.assign(prevBtn.style, {position:'absolute', left:'8px', top:'50%', transform:'translateY(-50%)', fontSize:'28px', background:'rgba(0,0,0,.55)', color:'#fff', border:'0', borderRadius:'4px', width:'36px', height:'36px', cursor:'pointer', display:'none'});
        fig.appendChild(prevBtn);
        prevBtn.addEventListener('click', function(ev){ ev.preventDefault(); step(-1); });
      }
      if(!nextBtn){
        nextBtn = document.createElement('button');
        nextBtn.id='img-next'; nextBtn.setAttribute('aria-label','Next image');
        nextBtn.textContent='›';
        Object.assign(nextBtn.style, {position:'absolute', right:'8px', top:'50%', transform:'translateY(-50%)', fontSize:'28px', background:'rgba(0,0,0,.55)', color:'#fff', border:'0', borderRadius:'4px', width:'36px', height:'36px', cursor:'pointer', display:'none'});
        fig.appendChild(nextBtn);
        nextBtn.addEventListener('click', function(ev){ ev.preventDefault(); step(1); });
      }
    }

    function showNav(show){
      ensureNavButtons();
      if(prevBtn && nextBtn){
        prevBtn.style.display = show ? '' : 'none';
        nextBtn.style.display = show ? '' : 'none';
      }
    }

    function render(src){ if(imgView){ imgView.src = src; } }
    function openImageLightbox(arg, startIndex){
      if(!imgBox) return;
      if(Array.isArray(arg)){
        galleryList = arg.slice();
        galleryIndex = startIndex||0;
        render(galleryList[galleryIndex]);
        showNav(true);
      } else {
        galleryList = null;
        render(arg);
        showNav(false); // hide arrows for single images
      }
      imgBox.hidden=false; lockScroll(true);
    }
    function closeImageLightbox(){ if(!imgBox) return; imgBox.hidden=true; lockScroll(false); }
    function step(delta){
      if(!galleryList || !galleryList.length) return;
      galleryIndex = (galleryIndex + delta + galleryList.length) % galleryList.length;
      render(galleryList[galleryIndex]);
    }

    document.addEventListener('click', function(e){
      if(e.target && (e.target.getAttribute('data-close')==='1' || e.target.id==='img-backdrop' || e.target.id==='img-close')){
        e.preventDefault(); closeImageLightbox();
      }
    });

    // ---------- Video Modal ----------
    var videoModal = $('#videoModal');
    var videoEl = $('#surveyVideo');
    function openVideoModal(src){
      if(videoEl){ videoEl.src = src; try{ videoEl.load(); videoEl.play(); }catch(e){} }
      if(videoModal){ videoModal.hidden=false; lockScroll(true); }
    }
    function closeVideoModal(){
      if(videoEl){ try{ videoEl.pause(); }catch(e){} videoEl.currentTime = 0; }
      if(videoModal){ videoModal.hidden=true; lockScroll(false); }
    }
    // Bind close for X and backdrop
    document.addEventListener('click', function(e){
      if(e.target && e.target.classList && e.target.classList.contains('video-modal-close')){
        e.preventDefault(); closeVideoModal();
      }
      if(e.target && e.target.id==='videoModal'){ closeVideoModal(); }
    });

    // ---------- Utilities: detect existing files for galleries ----------
    function imgExists(url){
      return new Promise(function(resolve){
        var i = new Image();
        i.onload = function(){ resolve(true); };
        i.onerror = function(){ resolve(false); };
        i.src = url + (url.indexOf('?')>-1 ? '&' : '?') + 'cachebust=' + Date.now();
      });
    }
    async function detectSequence(patternFns, count){
      for(var p=0;p<patternFns.length;p++){
        var first = await imgExists(patternFns[p](1));
        if(first){
          // Build the list including only those that exist
          var out = [];
          for(var n=1;n<=count;n++){
            var candidate = patternFns[p](n);
            /* eslint-disable no-await-in-loop */
            var ok = await imgExists(candidate);
            if(ok) out.push(candidate);
          }
          if(out.length>=2) return out;
        }
      }
      return null;
    }

    // Snapshot gallery (try common patterns)
    async function getSnapshotList(){
      var patterns = [
        function(n){ return 'images/' + String(n).padStart(2,'0') + '.jpg'; },
        function(n){ return 'images/' + n + '.jpg'; },
        function(n){ return 'images/snapshot-' + String(n).padStart(2,'0') + '.jpg'; },
        function(n){ return 'images/snapshot-' + n + '.jpg'; },
        function(n){ return 'images/roof-' + String(n).padStart(2,'0') + '.jpg'; },
        function(n){ return 'images/roof-' + n + '.jpg'; }
      ];
      var list = await detectSequence(patterns, 16);
      if(list && list.length){ return list; }
      // Fallback to 01..16 to avoid a dead click
      return Array.from({length:16}, (_,i)=> 'images/' + String(i+1).padStart(2,'0') + '.jpg');
    }

    // Report gallery (4 pages)
    async function getReportList(){
      var patterns = [
        function(n){ return 'images/report-' + String(n).padStart(2,'0') + '.jpg'; },
        function(n){ return 'images/report-' + n + '.jpg'; },
        function(n){ return 'images/report' + n + '.jpg'; },
        function(n){ return 'images/detailed-report-' + n + '.jpg'; }
      ];
      var list = await detectSequence(patterns, 4);
      if(list && list.length){ return list; }
      // Fallback to a single representative image
      return ['images/two.jpg'];
    }

    // ---------- Card handler ----------
    function parseInline(li){
      var oc = li.getAttribute('onclick') || '';
      if(/openSnapshotGallery/.test(oc)) return {action:'snapshot', idx:0};
      if(/openReportGallery/.test(oc)) return {action:'report', idx:0};
      var mV = oc.match(/openVideoModal\('([^']+)'/); if(mV) return {action:'video', src:mV[1]};
      var mI = oc.match(/openImageLightbox\('([^']+)'/); if(mI) return {action:'image', src:mI[1]};
      // Default: try the image inside the card
      var img = li.querySelector('.service-image img');
      if(img && img.getAttribute('src')) return {action:'image', src: img.getAttribute('src')};
      return null;
    }

    async function handleCard(li){
      var action = li.getAttribute('data-action');
      var src = li.getAttribute('data-src');
      var idx = parseInt(li.getAttribute('data-index')||'0',10);
      if(!action){
        var parsed = parseInline(li) || {};
        action = parsed.action; src = src || parsed.src; idx = isNaN(idx) ? (parsed.idx||0) : idx;
      }
      if(action === 'snapshot'){
        var snap = await getSnapshotList();
        openImageLightbox(snap, idx||0);
        return;
      }
      if(action === 'report'){
        var rep = await getReportList();
        if(rep.length>1) openImageLightbox(rep, 0);
        else openImageLightbox(rep[0], 0);
        return;
      }
      if(action === 'video' && src){ openVideoModal(src); return; }
      if(action === 'image' && src){ openImageLightbox(src, 0); return; }
    }

    // Bind clicks to cards (works with data-* or legacy inline)
    $all('ul.serviceList li.report-card').forEach(function(li){
      li.addEventListener('click', function(){ handleCard(li); });
      // Accessible hidden link (if present)
      var activator = li.querySelector('a.card-activator');
      if(activator){ activator.addEventListener('click', function(e){ e.preventDefault(); handleCard(li); }); }
      // Make overlay icon link inert
      var small = li.querySelector('.service-image .hoverlink a');
      if(small){ small.addEventListener('click', function(e){ e.preventDefault(); e.stopPropagation(); }); }
    });

    // Expose a tiny API for any legacy calls lingering in markup
    window.openImageLightbox = function(arg, start){ openImageLightbox(arg, start||0); };
    window.openVideoModal   = function(src){ openVideoModal(src); };
    window.closeVideoModal  = function(){ closeVideoModal(); };
    window.openSnapshotGallery = async function(i){ var list = await getSnapshotList(); openImageLightbox(list, i||0); };
    window.openReportGallery   = async function(i){ var list = await getReportList(); if(list.length>1) openImageLightbox(list, i||0); else openImageLightbox(list[0], 0); };

    console.log('[app.js] enhanced handlers ready');
  });
})();
