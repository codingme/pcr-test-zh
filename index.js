window.onload = () => {
  new Vue({
    el: "#app",
    data() {
      return {
        gmap: null,
        geocoder: null,
        places: null,
        markers: null,
        prefs: [
          { text: "東京使", value: "Chiyodaku" },
          { text: "大阪領", value: "Osaka" },
          { text: "福岡領", value: "Fukuoka" },
          { text: "名古屋領", value: "Nagoya" },
          { text: "新潟領", value: "Niigata" }
        ],
        selected: "Chiyodaku"
      };
    },
    methods: {
      showPlaces: function (prefecture) {
        this.markers.map((m, i) => {
          m.setMap(null);
          return false;
        });
        this.markers = [];

        this.geocoder.geocode({ address: prefecture }, (results, status) => {
          this.gmap.setCenter(results[0].geometry.location);
        });

        this.places.map((place, i) => {
          if (prefecture !== place.prefecture.en) {
            return false;
          }
          setTimeout(() => {
            this.geocoder.geocode(
              { address: place.facility.address },
              (results, status) => {
                if (status !== google.maps.GeocoderStatus.OK) {
                  return false;
                }
                const marker = new google.maps.Marker({
                  // position: { lat: 34.6937, lng: 135.5023 },
                  position: results[0].geometry.location,
                  map: this.gmap,
                  label: { text: "PCR", color: "red", fontSize: "1.6em" },
                  title: place.facility.name,
                  icon:
                    "http://maps.google.com/mapfiles/ms/icons/ylw-pushpin.png",
                  optimized: true
                });
                this.markers.push(marker);
                const infoWindow = new google.maps.InfoWindow({
                  content:
                    "<h2>" +
                    place.facility.name +
                    "</h2>" +
                    JSON.stringify(place.facility)
                      .replaceAll("{", "")
                      .replaceAll("}", "")
                      .replaceAll(",", "<br>")
                      .replaceAll("name", "检测机构")
                      .replaceAll("address", "地址")
                      .replaceAll("pcr", "PCR")
                      .replaceAll("result", "出结果时间")
                      .replaceAll("workday", "工作时间")
                });
                marker.addListener("click", () => {
                  infoWindow.open({
                    anchor: marker,
                    map: this.gmap
                  });
                });
              }
            );
          }, 500);
          return false;
        });
      }
    },
    mounted() {
      this.gmap = new google.maps.Map(document.getElementById("map"), {
        center: { lat: 34.6937, lng: 135.5023 },
        zoom: 12
      });

      fetch("./data.json")
        .then((response) => {
          if (!response.ok) {
            throw new Error("HTTP error, status = " + response.status);
          }
          return response.json();
        })
        .then((jsonData) => {
          this.geocoder = new google.maps.Geocoder();
          this.markers = [];
          // console.debug(json.place);
          this.places = jsonData.place;
          this.showPlaces("Chiyodaku");
        });
    }
  });
};
