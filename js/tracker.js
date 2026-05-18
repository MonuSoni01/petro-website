(function () {
  const STORAGE_KEY = "petro_tracker_events";
  const SESSION_KEY = "petro_tracker_session_id";

  function getSessionId() {
    let sessionId = sessionStorage.getItem(SESSION_KEY);

    if (!sessionId) {
      sessionId = "session_" + Date.now() + "_" + Math.random().toString(36).substring(2, 10);
      sessionStorage.setItem(SESSION_KEY, sessionId);
    }

    return sessionId;
  }

  function getDeviceType() {
    const width = window.innerWidth;

    if (width <= 767) return "Mobile";
    if (width <= 1024) return "Tablet";
    return "Desktop";
  }

  function getBrowserName() {
    const ua = navigator.userAgent;

    if (ua.includes("Chrome")) return "Chrome";
    if (ua.includes("Firefox")) return "Firefox";
    if (ua.includes("Safari") && !ua.includes("Chrome")) return "Safari";
    if (ua.includes("Edge")) return "Edge";

    return "Other";
  }

  function getEvents() {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  }

  function saveEvents(events) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
  }

  function saveTrackEvent(eventData) {
    const events = getEvents();

    events.push({
      id: Date.now() + "_" + Math.random().toString(36).substring(2, 8),
      eventName: eventData.eventName || "unknown_event",
      label: eventData.label || eventData.eventName || "Unknown",
      pageUrl: window.location.href,
      pagePath: window.location.pathname,
      pageTitle: document.title,
      device: getDeviceType(),
      browser: getBrowserName(),
      sessionId: getSessionId(),
      date: new Date().toLocaleDateString("en-IN"),
      time: new Date().toLocaleTimeString("en-IN"),
      timestamp: new Date().toISOString()
    });

    saveEvents(events);

    console.log("Tracked:", eventData.eventName);
  }

  document.addEventListener("click", function (e) {
    const trackedElement = e.target.closest("[data-track]");
    if (!trackedElement) return;

    saveTrackEvent({
      eventName: trackedElement.getAttribute("data-track"),
      label: trackedElement.getAttribute("data-label") || trackedElement.innerText.trim()
    });
  });

  let scroll25 = false;
  let scroll50 = false;
  let scroll75 = false;
  let scroll100 = false;

  window.addEventListener("scroll", function () {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;

    if (docHeight <= 0) return;

    const scrollPercent = Math.round((scrollTop / docHeight) * 100);

    if (scrollPercent >= 25 && !scroll25) {
      scroll25 = true;
      saveTrackEvent({ eventName: "scroll_25", label: "Scroll 25%" });
    }

    if (scrollPercent >= 50 && !scroll50) {
      scroll50 = true;
      saveTrackEvent({ eventName: "scroll_50", label: "Scroll 50%" });
    }

    if (scrollPercent >= 75 && !scroll75) {
      scroll75 = true;
      saveTrackEvent({ eventName: "scroll_75", label: "Scroll 75%" });
    }

    if (scrollPercent >= 95 && !scroll100) {
      scroll100 = true;
      saveTrackEvent({ eventName: "scroll_100", label: "Scroll 100%" });
    }
  });

  window.addEventListener("load", function () {
    saveTrackEvent({
      eventName: "page_view",
      label: "Page View"
    });
  });
})();