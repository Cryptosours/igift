// Google Analytics initialization with Consent Mode v2
// dataLayer commands are queued here; gtag.js picks them up when it loads.
window.dataLayer = window.dataLayer || [];
function gtag() { dataLayer.push(arguments); }

// Set default consent BEFORE any measurement.
// GA will queue events but not send data until 'granted'.
// wait_for_update: 500ms lets the consent-sync component grant consent
// for returning users before the first event fires.
gtag('consent', 'default', {
  analytics_storage: 'denied',
  ad_storage: 'denied',
  ad_user_data: 'denied',
  ad_personalization: 'denied',
  wait_for_update: 500,
});

gtag('js', new Date());
gtag('config', 'G-60RGP979SG');
