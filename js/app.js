
(function(){
  function onReady(fn){ if (document.readyState !== 'loading') fn(); else document.addEventListener('DOMContentLoaded', fn); }
  onReady(function(){
    // Utilities
    function $(sel, root){ return (root||document).querySelector(sel); }
    function $all(sel, root){ return Array.prototype.slice.call((root||document).querySelectorAll(sel)); }

    // ===== Lightbox (image) =====
    var imgBox = $('#img-lightbox'), imgView = $('#img-view');
    function lockScroll(on){ document.body.style.overflow = on ? 'hidden' : ''; }
    function openImageLightbox(src){
      if(!imgBox || !imgView){ return; }
      imgView.src = src;
      imgBox.hidden = false;
      lockScroll(true);
      document.addEventListener('keydown', onEscClose);
    }
    function closeImageLightbox(){
      if(!imgBox) return;
      imgBox.hidden = true;
      lockScroll(false);
      document.removeEventListener('keydown', onEscClose);
    }
    function onEscClose(e){ if(e.key === 'Escape'){ closeImageLightbox(); closeVideoModal(); } }
    document.addEventListener('click', function(e){
      if (e.target && (e.target.getAttribute('data-close') === '1' || e.target.id === 'img-backdrop' || e.target.id === 'img-close')){
        e.preventDefault(); closeImageLightbox();
      }
    });

    // ===== Video modal =====
    var videoModal = $('#videoModal');
    var videoEl = $('#surveyVideo');
    function openVideoModal(src){
      if(videoEl){ 
        // Prefer setting video.src directly
        videoEl.src = src;
        try { videoEl.load(); videoEl.play(); } catch(e){ /* autoplay may be blocked */ }
      }
      if(videoModal){ videoModal.hidden = false; lockScroll(true); }
      document.addEventListener('keydown', onEscClose);
    }
    window.closeVideoModal = function(){
      if(videoEl){ try { videoEl.pause(); } catch(e){} videoEl.currentTime = 0; }
      if(videoModal){ videoModal.hidden = true; lockScroll(false); }
      document.removeEventListener('keydown', onEscClose);
    };
    document.addEventListener('click', function(e){
      if (e.target && e.target.id === 'videoModal'){ closeVideoModal(); }
    });

    // ===== Make hover icon links inert for a11y =====
    $all('.service-image .hoverlink a').forEach(function(a){
      a.addEventListener('click', function(ev){ ev.preventDefault(); ev.stopPropagation(); });
    });

    // ===== Attach handlers to cards based on data-action =====
    function handleAction(li){
      var action = li.getAttribute('data-action');
      var idx = parseInt(li.getAttribute('data-index')||'0',10);
      var src = li.getAttribute('data-src');
      if(action === 'snapshot' && typeof window.openSnapshotGallery === 'function'){
        window.openSnapshotGallery(idx); return;
      }
      if(action === 'report' && typeof window.openReportGallery === 'function'){
        window.openReportGallery(idx); return;
      }
      if(action === 'video' && src){ openVideoModal(src); return; }
      if(action === 'image' && src){ openImageLightbox(src); return; }
    }
    $all('ul.serviceList li.report-card').forEach(function(li){
      // Click on entire card
      li.addEventListener('click', function(e){ handleAction(li); });
      // SR/keyboard: the hidden activator link
      var activator = li.querySelector('a.card-activator');
      if(activator){
        activator.addEventListener('click', function(e){ e.preventDefault(); handleAction(li); });
      }
    });
  });
})();
