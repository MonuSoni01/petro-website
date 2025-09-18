(function ($) {
  "use strict";

  // Mouse pointer
  $(".wrapper-main").prepend("<div class='mouse-pointer'></div>");

  function showCoords(event) {
    var x = event.pageX;
    var y = event.pageY;
    $(".mouse-pointer").css({
      left: x - 12.5 + "px",
      top: y - 12.5 + "px",
    });
  }

  $(window).on("mousemove", showCoords);

  // Hide mouse-pointer on hover over interactive elements
  $("li, a, button, input, textarea, .navbar-toggles")
    .on("mouseenter", function () {
      $(".mouse-pointer").css("opacity", "0");
    })
    .on("mouseleave", function () {
      $(".mouse-pointer").css("opacity", "1");
    });

  // fixed-menu on scroll
  $(window).on("scroll", function () {
    if ($(this).scrollTop() > 50) {
      $(".top-nav").addClass("fixed-menu");
    } else {
      $(".top-nav").removeClass("fixed-menu");
    }
  });

  // blog-slider
  $("#blog-slider").owlCarousel({
    items: 3,
    responsive: {
      1000: { items: 3 },
      650: { items: 1 },
    },
    autoplay: true,
    nav: false,
  });

  // customers-slider
  $("#customers-slider").owlCarousel({
    items: 5,
    responsive: {
      1000: { items: 3 },
      650: { items: 2 },
    },
    autoplay: true,
    nav: false,
  });
})(jQuery);

// Show modal on page load
$(document).ready(function () {
  $("#autoShowModal").modal("show");

  // Accordion logic
  const accordions = document.querySelectorAll(".accordion");

  accordions.forEach((accordion) => {
    const header = accordion.querySelector(".accordion__header");
    const content = accordion.querySelector(".accordion__content");
    const icon = accordion.querySelector("#accordion-icon"); // ⚠ Consider using class instead of ID if multiple accordions

    header.addEventListener("click", () => {
      const isOpen = content.style.height === `${content.scrollHeight}px`;

      accordions.forEach((a) => {
        const c = a.querySelector(".accordion__content");
        const ic = a.querySelector("#accordion-icon");

        if (a === accordion && !isOpen) {
          c.style.height = `${c.scrollHeight}px`;
          ic.classList.remove("ri-add-line");
          ic.classList.add("ri-subtract-fill");
        } else {
          c.style.height = "0px";
          ic.classList.remove("ri-subtract-fill");
          ic.classList.add("ri-add-line");
        }
      });
    });
  });
});

const firebaseConfig = {
    apiKey: "AIzaSyBl-W2OfEqfCuB1UiUE6BChzZ9cgG0xrQY",
    authDomain: "petrocounter.firebaseapp.com",
    databaseURL: "https://petrocounter-default-rtdb.firebaseio.com",
    projectId: "petrocounter",
    storageBucket: "petrocounter.appspot.com",
    messagingSenderId: "1067968150164",
    appId: "1:1067968150164:web:62c142f5d613ef7a519281"
  };

  // ✅ Initialize Firebase
  firebase.initializeApp(firebaseConfig);
  const db = firebase.database();
  const counterRef = db.ref("visitorCount");

  // ✅ Add +1 on every visit
  counterRef.transaction(current => {
    return (current || 0) + 1;
  });

  // ✅ Show visitor count + offset
  const offset = 10000; // Prefix start number
  counterRef.on("value", snapshot => {
    const actual = snapshot.val() || 0;
    document.getElementById("visitor-count").innerText = offset + actual;
  });

var counters = document.querySelectorAll('.counter-number');

const options = {
  threshold: 0.5,
};

const animateCounter = (entry) => {
  const counter = entry.target;
  const prefix = counter.getAttribute('data-prefix') || "";
  const suffix = counter.getAttribute('data-suffix') || "";

  const updateCount = () => {
    const target = +counter.getAttribute('data-target');
    const count = +counter.innerText.replace(/\D/g, ""); // keep only numbers
    const increment = target / 200;

    if (count < target) {
      counter.innerText = prefix + Math.ceil(count + increment) + suffix;
      setTimeout(updateCount, 10);
    } else {
      counter.innerText = prefix + target + suffix;
    }
  };

  updateCount();
};


const observer = new IntersectionObserver(function (entries) {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      animateCounter(entry);
      observer.unobserve(entry.target);
    }
  });
}, options);

counters.forEach(counter => {
  observer.observe(counter);
});

window.addEventListener("DOMContentLoaded", function () {
  var targetDate = new Date("2025-09-12T00:00:00").getTime();

  var countdownFunc = setInterval(function () {
    var now = new Date().getTime();
    var distance = targetDate - now;

    var days = Math.floor(distance / (1000 * 60 * 60 * 24));
    var hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    var seconds = Math.floor((distance % (1000 * 60)) / 1000);

    var daysEl = document.getElementById("days");
    var hoursEl = document.getElementById("hours");
    var minutesEl = document.getElementById("minutes");
    var secondsEl = document.getElementById("seconds");

    if (daysEl && hoursEl && minutesEl && secondsEl) {
      daysEl.innerHTML = days < 10 ? "0" + days : days;
      hoursEl.innerHTML = hours < 10 ? "0" + hours : hours;
      minutesEl.innerHTML = minutes < 10 ? "0" + minutes : minutes;
      secondsEl.innerHTML = seconds < 10 ? "0" + seconds : seconds;
    }

    if (distance < 0) {
      clearInterval(countdownFunc);
      var container = document.querySelector(".countdown-container");
      if (container) {
        container.innerHTML = "<h3 style='color:#108082'>Exhibition Started!</h3>";
      }
    }
  }, 1000);
});

//  function openModal() {
//     document.getElementById("imageModal").style.display = "flex";
//   }
//   function closeModal() {
//     document.getElementById("imageModal").style.display = "none";
//   }

//   // Auto open after 3 seconds
//   window.addEventListener('load', function() {
//     setTimeout(openModal, 1000);
//   });