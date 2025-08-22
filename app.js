
(function(){
  function onReady(fn){ if (document.readyState !== 'loading') fn(); else document.addEventListener('DOMContentLoaded', fn); }
  onReady(function(){
    function $(sel, root){ return (root||document).querySelector(sel); }
    function $all(sel, root){ return Array.prototype.slice.call((root||document).querySelectorAll(sel)); }
    function lockScroll(on){ document.body.style.overflow = on ? 'hidden' : ''; }

    // Image lightbox helpers
    var imgBox = $('#img-lightbox'), imgView = $('#img-view');
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

    // Video modal helpers
    var videoModal = $('#videoModal');
    var videoEl = $('#surveyVideo');
    function openVideoModal(src){
      if(videoEl){ videoEl.src = src; try{ videoEl.load(); videoEl.play(); }catch(e){} }
      if(videoModal){ videoModal.hidden = false; lockScroll(true); }
      document.addEventListener('keydown', onEscClose);
    }
    window.closeVideoModal = function(){
      if(videoEl){ try{ videoEl.pause(); }catch(e){} videoEl.currentTime = 0; }
      if(videoModal){ videoModal.hidden = true; lockScroll(false); }
      document.removeEventListener('keydown', onEscClose);
    };

    function onEscClose(e){
      if(e.key === 'Escape'){
        closeImageLightbox();
        if (typeof window.closeVideoModal === 'function') window.closeVideoModal();
      }
    }
    document.addEventListener('click', function(e){
      if (e.target && (e.target.getAttribute('data-close')==='1' || e.target.id==='img-backdrop' || e.target.id==='img-close')){
        e.preventDefault(); closeImageLightbox();
      }
      if (e.target && e.target.id==='videoModal'){ window.closeVideoModal(); }
    });

    // Make overlay icon inert
    $all('.service-image .hoverlink a').forEach(function(a){
      a.addEventListener('click', function(ev){ ev.preventDefault(); ev.stopPropagation(); });
    });

    // Card handler
    function handleAction(li){
      var action = li.getAttribute('data-action');
      var idx = parseInt(li.getAttribute('data-index')||'0',10);
      var src = li.getAttribute('data-src');
      if(action === 'snapshot'){
        if (typeof window.openSnapshotGallery === 'function'){ window.openSnapshotGallery(idx); }
        else { openImageLightbox('images/one.jpg'); } // fallback
        return;
      }
      if(action === 'report'){
        if (typeof window.openReportGallery === 'function'){ window.openReportGallery(idx); }
        else { openImageLightbox('images/two.jpg'); } // fallback
        return;
      }
      if(action === 'video' && src){ openVideoModal(src); return; }
      if(action === 'image' && src){ openImageLightbox(src); return; }
    }

    // Bind clicks
    $all('ul.serviceList li.report-card').forEach(function(li){
      li.addEventListener('click', function(){ handleAction(li); });
      var activator = li.querySelector('a.card-activator');
      if(activator){
        activator.addEventListener('click', function(e){ e.preventDefault(); handleAction(li); });
      }
    });

    // Debug marker: helps confirm app.js is loaded
    console.log('[app.js] handlers attached');
  });
})();
