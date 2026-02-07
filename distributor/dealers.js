document.addEventListener("DOMContentLoaded", function () {

  const container = document.getElementById("product-sections");
  if (!container) return;

  // 🔹 FETCH JSON API
  fetch("/distributor/dealers.json")
    .then(res => res.json())
    .then(data => {
      showDealers(data);
    })
    .catch(err => {
      console.error("Dealer JSON Error:", err);
      container.innerHTML =
        "<p class='text-danger text-center'>Dealer data not available</p>";
    });

  // 🔹 SHOW ALL DEALERS (NO LOAD MORE)
  function showDealers(dealers) {
    dealers.forEach(dealer => {
      const col = document.createElement("div");
      col.className = "col-lg-4 col-md-6 mb-4";

      const areaHTML = dealer.area
        ? dealer.area
          .split(",")
          .map(a => `<div class="area-line">• ${a.trim()}</div>`)
          .join("")
        : "";

      col.innerHTML = `
        <div class="dealer-card"
            onclick="openDealerPage('${dealer.url}')">

          <h6>
            <i class="fa-solid fa-location-dot dealer-name-icon"></i>
            ${dealer.name}
          </h6>

          ${dealer.address ? `<p><span class="label">Address:</span> ${dealer.address}</p>` : ""}

          <p><span class="label">Tel:</span> ${dealer.phone}</p>
          <p><span class="label">Area:</span> ${dealer.area}</p>
      

          <span class="dealer-badge">${dealer.category}</span>
        </div>
        `;


      container.appendChild(col);
    });
  }


});

function openDealerPage(url) {
  if (!url) return;

  // 👉 Agar same site ke page hain
  window.location.href = "/distributor/" + url;

  // 👉 Agar full external URL ho
  // window.open(url, "_blank");
}

