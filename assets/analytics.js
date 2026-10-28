(function () {
  'use strict';

  var ITEM = {
    item_id: 'popupbook_dinosaur_001',
    item_name: '펼쳐라, 공룡시대!',
    item_brand: '하마북',
    price: 33000,
    quantity: 1
  };
  var FORM_ID = 'lead-form';
  var formStarted = false;
  var galleryIndex = 0;
  var galleryLength = 3;

  function send(eventName, params) {
    if (typeof window.gtag !== 'function') return;
    window.gtag('event', eventName, params || {});
  }

  function trackCta(element) {
    send('cta_click', {
      cta_name: element.getAttribute('data-analytics-name') || element.textContent.trim(),
      cta_location: element.getAttribute('data-analytics-location') || 'unknown',
      target_section: element.getAttribute('data-analytics-target') || 'order',
      item_id: ITEM.item_id
    });
  }

  function trackSection(element) {
    send('section_navigation', {
      link_name: element.getAttribute('data-analytics-name') || element.textContent.trim(),
      link_location: element.getAttribute('data-analytics-location') || 'unknown',
      target_section: element.getAttribute('data-analytics-target') || ''
    });
  }

  function initMainPage() {
    send('view_item', {
      currency: 'KRW',
      value: ITEM.price,
      items: [ITEM]
    });

    document.querySelectorAll('[data-analytics-event="cta_click"]').forEach(function (element) {
      element.addEventListener('click', function () { trackCta(element); });
    });

    document.querySelectorAll('[data-analytics-event="section_navigation"]').forEach(function (element) {
      element.addEventListener('click', function () { trackSection(element); });
    });

    document.querySelectorAll('.cover-gallery').forEach(function (gallery) {
      var slides = gallery.querySelectorAll('.cover-slide');
      galleryLength = slides.length || galleryLength;
      gallery.querySelectorAll('.cover-nav').forEach(function (button) {
        button.addEventListener('click', function () {
          var fromIndex = galleryIndex;
          var direction = button.classList.contains('prev') ? 'previous' : 'next';
          galleryIndex = direction === 'previous'
            ? (galleryIndex - 1 + galleryLength) % galleryLength
            : (galleryIndex + 1) % galleryLength;
          send('item_gallery_navigation', {
            direction: direction,
            from_index: fromIndex + 1,
            to_index: galleryIndex + 1,
            item_id: ITEM.item_id
          });
        });
      });
    });

    var form = document.getElementById(FORM_ID);
    if (!form) return;

    form.addEventListener('input', function () {
      if (formStarted) return;
      formStarted = true;
      send('form_start', {
        form_id: FORM_ID,
        form_name: '구매 신청',
        item_id: ITEM.item_id
      });
    });

    form.addEventListener('submit', function () {
      if (form.checkValidity()) return;
      var field = form.querySelector(':invalid');
      if (!field) return;
      send('form_validation_error', {
        form_id: FORM_ID,
        field_name: field.id === 'f-contact' ? 'phone' : 'name',
        error_type: field.validity.valueMissing ? 'required' : 'pattern_mismatch'
      });
    }, true);
  }

  function initResultPage() {
    var home = document.querySelector('[data-analytics-event="return_home"]');
    if (!home) return;
    home.addEventListener('click', function () {
      send('return_home', { source_page: 'lead_complete' });
    });
  }

  window.HamaAnalytics = {
    privacyModalOpen: function (source, mode) {
      send('privacy_modal_open', {
        open_source: source,
        modal_mode: mode === 'submit' ? 'submission' : 'information'
      });
    },
    privacyConsentUpdate: function (granted, mode) {
      send('privacy_consent_update', {
        consent_state: granted ? 'granted' : 'revoked',
        modal_mode: mode === 'submit' ? 'submission' : 'information',
        form_id: FORM_ID
      });
    },
    privacyModalClose: function (method, mode, source) {
      send('privacy_modal_close', {
        close_method: method,
        modal_mode: mode === 'submit' ? 'submission' : 'information',
        open_source: source
      });
    },
    generateLead: function (done) {
      var completed = false;
      function finish() {
        if (completed) return;
        completed = true;
        done();
      }
      if (typeof window.gtag !== 'function') {
        finish();
        return;
      }
      window.gtag('event', 'generate_lead', {
        currency: 'KRW',
        value: ITEM.price,
        item_id: ITEM.item_id,
        form_id: FORM_ID,
        lead_type: 'purchase_application',
        event_callback: finish,
        event_timeout: 1500
      });
      window.setTimeout(finish, 1700);
    }
  };

  if (document.getElementById(FORM_ID)) initMainPage();
  else initResultPage();
})();

