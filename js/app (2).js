
(function(){
  function onReady(fn){ if(document.readyState!=='loading') fn(); else document.addEventListener('DOMContentLoaded', fn); }
  onReady(function(){

    // Helpers
    function $(sel, root){ return (root||document).querySelector(sel); }
    function $all(sel, root){ return Array.prototype.slice.call((root||document).querySelectorAll(sel)); }
    function lockScroll(on){ document.body.style.overflow = on ? 'hidden' : ''; }

    // ===== Appointment form modal =====
    var formEl = $('#appointment-form');
    var backdropEl = $('#modal-backdrop');
    function openForm(){ if(formEl && backdropEl){ formEl.removeAttribute('hidden'); backdropEl.removeAttribute('hidden'); lockScroll(true); } }
    function closeForm(){ if(formEl && backdropEl){ formEl.setAttribute('hidden',''); backdropEl.setAttribute('hidden',''); lockScroll(false); } }
    // Open on any .js-open-appt click
    document.addEventListener('click', function(e){
      var a = e.target.closest('a.js-open-appt');
      if(!a) return;
      e.preventDefault(); openForm();
    });
    // Close on X, backdrop, or Esc
    if(formEl){
      formEl.addEventListener('click', function(e){
        if(e.target.closest('.close-btn')){ e.preventDefault(); closeForm(); }
      });
    }
    document.addEventListener('click', function(e){
      if(e.target && e.target.id==='modal-backdrop'){ closeForm(); }
    });
    document.addEventListener('keydown', function(e){
      if(e.key==='Escape'){ closeForm(); closeVideoModal(); closeImageLightbox(); }
    });

    // ===== Lightbox (single + gallery support) =====
    var imgBox = $('#img-lightbox'), imgView = $('#img-view');
    var gallery = null; var galleryIndex = 0;
    function renderImage(src){ if(imgView){ imgView.src = src; } }

    function ensureGalleryControls(){
      var fig = $('#img-modal'); if(!fig) return;
      if(!$('#img-prev')){
        var prev = document.createElement('button'); prev.id='img-prev'; prev.setAttribute('aria-label','Previous image');
        prev.textContent = '‹'; prev.style.position='absolute'; prev.style.left='8px'; prev.style.top='50%';
        prev.style.transform='translateY(-50%)'; prev.style.fontSize='28px'; prev.style.background='rgba(0,0,0,.5)'; prev.style.color='#fff';
        prev.style.border='0'; prev.style.borderRadius='4px'; prev.style.width='36px'; prev.style.height='36px'; prev.style.cursor='pointer';
        fig.appendChild(prev);
        prev.addEventListener('click', function(e){ e.preventDefault(); stepGallery(-1); });
      }
      if(!$('#img-next')){
        var next = document.createElement('button'); next.id='img-next'; next.setAttribute('aria-label','Next image');
        next.textContent = '›'; next.style.position='absolute'; next.style.right='8px'; next.style.top='50%';
        next.style.transform='translateY(-50%)'; next.style.fontSize='28px'; next.style.background='rgba(0,0,0,.5)'; next.style.color='#fff';
        next.style.border='0'; next.style.borderRadius='4px'; next.style.width='36px'; next.style.height='36px'; next.style.cursor='pointer';
        fig.appendChild(next);
        next.addEventListener('click', function(e){ e.preventDefault(); stepGallery(1); });
      }
    }
    function stepGallery(delta){
      if(!gallery || !gallery.length) return;
      galleryIndex = (galleryIndex + delta + gallery.length) % gallery.length;
      renderImage(gallery[galleryIndex]);
    }

    function openImageLightbox(srcOrArray, startIndex){
      if(!imgBox) return;
      if(Array.isArray(srcOrArray)){ gallery = srcOrArray.slice(); galleryIndex = startIndex||0; renderImage(gallery[galleryIndex]); ensureGalleryControls(); }
      else { gallery = null; renderImage(srcOrArray); }
      imgBox.hidden = false; lockScroll(true);
    }
    function closeImageLightbox(){ if(!imgBox) return; imgBox.hidden=true; lockScroll(false); }

    // Backdrop/close for image lightbox
    document.addEventListener('click', function(e){
      if(e.target && (e.target.getAttribute('data-close')==='1' || e.target.id==='img-backdrop' || e.target.id==='img-close')){
        e.preventDefault(); closeImageLightbox();
      }
    });

    // ===== Video modal =====
    var videoModal = $('#videoModal'); var videoEl = $('#surveyVideo');
    function openVideoModal(src){
      if(videoEl){ videoEl.src = src; try{ videoEl.load(); videoEl.play(); }catch(e){} }
      if(videoModal){ videoModal.hidden=false; lockScroll(true); }
    }
    function closeVideoModal(){
      if(videoEl){ try{ videoEl.pause(); }catch(e){} videoEl.currentTime=0; }
      if(videoModal){ videoModal.hidden=true; lockScroll(false); }
    }
    // Wire X and backdrop
    document.addEventListener('click', function(e){
      if(e.target && e.target.classList && e.target.classList.contains('video-modal-close')){ e.preventDefault(); closeVideoModal(); }
      if(e.target && e.target.id==='videoModal'){ closeVideoModal(); }
    });

    // ===== Card actions =====
    // Known gallery for Snapshot: 01..16
    var SNAPSHOT = Array.from({length:16}, (_,i)=> 'images/' + String(i+1).padStart(2,'0') + '.jpg');

    function handleCard(li){
      var action = li.getAttribute('data-action');
      var idx = parseInt(li.getAttribute('data-index')||'0',10);
      var src = li.getAttribute('data-src');
      if(action==='snapshot'){ openImageLightbox(SNAPSHOT, idx); return; }
      if(action==='report'){
        // If a REPORT gallery exists, swap here; fallback to a representative image
        openImageLightbox('images/two.jpg', 0); return;
      }
      if(action==='video' && src){ openVideoModal(src); return; }
      if(action==='image' && src){ openImageLightbox(src, 0); return; }
    }

    // Bind clicks to current cards w/ data-action; also support existing inline onclicks if any remain via capturing
    $all('ul.serviceList li.report-card').forEach(function(li){
      li.addEventListener('click', function(){ handleCard(li); });
      var activator = li.querySelector('a.card-activator');
      if(activator){ activator.addEventListener('click', function(e){ e.preventDefault(); handleCard(li); }); }
      // Make small overlay link inert
      var small = li.querySelector('.service-image .hoverlink a');
      if(small){ small.addEventListener('click', function(e){ e.preventDefault(); e.stopPropagation(); }); }
    });

    // Expose functions in case any attributes still call them (back-compat)
    window.openImageLightbox = function(arg){ openImageLightbox(arg); };
    window.openVideoModal = function(src){ openVideoModal(src); };
    window.closeVideoModal = function(){ closeVideoModal(); };
    window.openSnapshotGallery = function(i){ openImageLightbox(SNAPSHOT, i||0); };
    window.openReportGallery = function(i){ openImageLightbox('images/two.jpg', 0); };
    
    console.log('[app.js] initialized');
  });
})();
