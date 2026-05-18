(function () {
  const API_URL = "/tracker-api.php";
  const SESSION_KEY = "petro_tracker_session_id";

  function getSessionId() {
    let sessionId = sessionStorage.getItem(SESSION_KEY);

    if (!sessionId) {
      sessionId =
        "session_" +
        Date.now() +
        "_" +
        Math.random().toString(36).substring(2, 10);

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

    if (ua.includes("Edg")) return "Edge";
    if (ua.includes("Chrome")) return "Chrome";
    if (ua.includes("Firefox")) return "Firefox";
    if (ua.includes("Safari") && !ua.includes("Chrome")) return "Safari";

    return "Other";
  }

  async function saveTrackEvent(eventData) {
    try {
      await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          event_name: eventData.eventName || "unknown_event",
          label_name: eventData.label || "Unknown",
          page_url: window.location.href,
          page_path: window.location.pathname,
          page_title: document.title,
          device: getDeviceType(),
          browser: getBrowserName(),
          session_id: getSessionId(),
          referrer: document.referrer || ""
        })
      });

      console.log("Tracked:", eventData.eventName);
    } catch (error) {
      console.error("Tracking failed:", error);
    }
  }

  document.addEventListener("click", function (e) {
    const trackedElement = e.target.closest("[data-track]");
    if (!trackedElement) return;

    saveTrackEvent({
      eventName: trackedElement.getAttribute("data-track"),
      label:
        trackedElement.getAttribute("data-label") ||
        trackedElement.innerText.trim()
    });
  });

  let scroll25 = false;
  let scroll50 = false;
  let scroll75 = false;
  let scroll100 = false;

  window.addEventListener("scroll", function () {
    const scrollTop = window.scrollY;
    const docHeight =
      document.documentElement.scrollHeight - window.innerHeight;

    if (docHeight <= 0) return;

    const scrollPercent = Math.round((scrollTop / docHeight) * 100);

    if (scrollPercent >= 25 && !scroll25) {
      scroll25 = true;
      saveTrackEvent({
        eventName: "scroll_25",
        label: "Scroll 25%"
      });
    }

    if (scrollPercent >= 50 && !scroll50) {
      scroll50 = true;
      saveTrackEvent({
        eventName: "scroll_50",
        label: "Scroll 50%"
      });
    }

    if (scrollPercent >= 75 && !scroll75) {
      scroll75 = true;
      saveTrackEvent({
        eventName: "scroll_75",
        label: "Scroll 75%"
      });
    }

    if (scrollPercent >= 95 && !scroll100) {
      scroll100 = true;
      saveTrackEvent({
        eventName: "scroll_100",
        label: "Scroll 100%"
      });
    }
  });

  window.addEventListener("load", function () {
    saveTrackEvent({
      eventName: "page_view",
      label: "Page View"
    });
  });
})();