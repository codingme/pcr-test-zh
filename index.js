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
      showPlaces: async function (prefecture) {
        this.markers.map((m, i) => {
          m.setMap(null);
          return false;
        });
        this.markers = [];
        const prefPlaces = this.places.filter((place) => {
          return prefecture === place.prefecture.en;
        });

        this.geocoder.geocode({ address: prefecture }, (results, status) => {
          this.gmap.setCenter(results[0].geometry.location);
        });

        for (let i = 0; i < prefPlaces.length; i++) {
          await new Promise((resolve) => setTimeout(resolve, 200));
          console.debug(i);
          this.renderMarker(prefPlaces[i]);
        }
        alert("加载结束");
      },
      renderMarker: function (place) {
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
              icon: "http://maps.google.com/mapfiles/ms/icons/ylw-pushpin.png",
              optimized: true
            });
            this.markers.push(marker);
            const infoWindow = new google.maps.InfoWindow({
              content:
                "<h3>" +
                place.facility.name +
                "</h3>" +
                "<h6>" +
                place.facility.address +
                "</h6>" +
                "<h6>" +
                "<a href=" +
                place.facility.hp +
                " target='_blank'>" +
                place.facility.hp +
                "</a>" +
                "</h6>" +
                "<h6>" +
                place.facility.tel +
                "</h6>" +
                "<h6>" +
                place.facility.pcr.result +
                " 出结果" +
                "</h6>" +
                "<h6>" +
                place.facility.pcr.workday +
                "</h6>"
            });
            marker.addListener("click", () => {
              infoWindow.open({
                anchor: marker,
                map: this.gmap
              });
            });
          }
        );
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
