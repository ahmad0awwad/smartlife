(function trackVisitorSource() {
    try {
      const params = new URLSearchParams(window.location.search);
      const utmSource = params.get('utm_source');
      const utmMedium = params.get('utm_medium');
      const utmCampaign = params.get('utm_campaign');
      const referrer = document.referrer;
  
      let source = 'direct';
  
      if (utmSource) {
        source = utmSource.toLowerCase();
      } else if (referrer) {
        const refHost = new URL(referrer).hostname.toLowerCase();
        if (refHost.includes('instagram')) source = 'instagram';
        else if (refHost.includes('facebook')) source = 'facebook';
        else if (refHost.includes('youtube')) source = 'youtube';
        else if (refHost.includes('google')) source = 'google';
        else source = refHost;
      }
  
      // Save current session source
      localStorage.setItem('visitorSource', source);
      if (utmMedium) localStorage.setItem('utmMedium', utmMedium);
      if (utmCampaign) localStorage.setItem('utmCampaign', utmCampaign);
  
      // Save first-click attribution
      if (!localStorage.getItem('firstVisitorSource')) {
        localStorage.setItem('firstVisitorSource', source);
      }
      if (utmMedium && !localStorage.getItem('firstUtmMedium')) {
        localStorage.setItem('firstUtmMedium', utmMedium);
      }
      if (utmCampaign && !localStorage.getItem('firstUtmCampaign')) {
        localStorage.setItem('firstUtmCampaign', utmCampaign);
      }
  
    } catch (err) {
      console.error('⚠️ Error tracking source:', err);
    }
  })();
  