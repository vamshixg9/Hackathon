document.addEventListener("DOMContentLoaded", () => {
    const map = L.map("map").setView([20.5937, 78.9629], 5);
    const latInput = document.getElementById("latitude");
    const lngInput = document.getElementById("longitude");
  
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap contributors"
    }).addTo(map);
  
    let marker;
  
    function updateMarker(lat, lng) {
      const latLng = [parseFloat(lat), parseFloat(lng)];
      if (marker) {
        marker.setLatLng(latLng);
      } else {
        marker = L.marker(latLng, { draggable: true }).addTo(map);
        marker.on("dragend", function (e) {
          const pos = e.target.getLatLng();
          latInput.value = pos.lat.toFixed(6);
          lngInput.value = pos.lng.toFixed(6);
        });
      }
      map.setView(latLng, 14);
    }
  
    map.on("click", function (e) {
      latInput.value = e.latlng.lat.toFixed(6);
      lngInput.value = e.latlng.lng.toFixed(6);
      updateMarker(e.latlng.lat, e.latlng.lng);
    });
  
    [latInput, lngInput].forEach(input => {
      input.addEventListener("change", () => {
        if (latInput.value && lngInput.value) {
          updateMarker(latInput.value, lngInput.value);
        }
      });
    });
  
    // ✅ Custom Locate Button
    const locateBtn = L.control({ position: "topright" });
    locateBtn.onAdd = function () {
      const div = L.DomUtil.create("div", "leaflet-bar leaflet-control leaflet-control-custom");
      div.innerHTML = `<button title="Use My Location" style="width:34px;height:34px;font-size:18px;padding:0;">📍</button>`;
      div.style.backgroundColor = "#fff";
      div.style.boxShadow = "0 2px 6px rgba(0,0,0,0.3)";
      div.style.borderRadius = "5px";
      div.style.padding = "2px";
  
      div.onclick = function () {
        if (!navigator.geolocation) {
          alert("Geolocation not supported");
          return;
        }
  
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            const lat = pos.coords.latitude.toFixed(6);
            const lng = pos.coords.longitude.toFixed(6);
            console.log("Your location:", lat, lng);
            latInput.value = lat;
            lngInput.value = lng;
            updateMarker(lat, lng);
          },
          () => alert("Unable to get your location. Please allow location access."),
          { timeout: 10000 }
        );
      };
  
      return div;
    };
    locateBtn.addTo(map);
  });
  