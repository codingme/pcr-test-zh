window.onload = () => {
  new Vue({
    el: "#app",
    data() {
      return {
        gmap: null,
        geocoder: null,
        places: null,
        markers: null,
        counter: 0,
        prefs: [
          { text: "東京使", value: "Chiyodaku" },
          { text: "大阪領", value: "Osaka" },
          { text: "福岡領", value: "Fukuoka" },
          { text: "名古屋領", value: "Nagoya" },
          { text: "新潟領", value: "Niigata" },
          { text: "未选", value: "Tokyo" }
        ],
        prefPlaces: null,
        selected: "Tokyo"
      };
    },
    methods: {
      showPlaces: function (prefecture) {
        this.counter = 0;
        this.prefPlaces = null;
        for (let m of this.markers) {
          m.setMap(null);
        }
        this.markers = [];

        this.geocoder.geocode({ address: prefecture }, (results, status) => {
          this.gmap.setCenter(results[0].geometry.location);
        });

        if ("Tokyo" === this.selected) {
          this.counter = 0;
          this.prefPlaces = null;
          return false;
        }

        this.prefPlaces = this.places.filter((place) => {
          return prefecture === place.prefecture_en;
        });
        for (let p of this.prefPlaces) {
          this.counter++;
          this.renderMarker(p);
        }
      },
      renderMarker: function (place) {
        const marker = new google.maps.Marker({
          // position: { lat: 34.6937, lng: 135.5023 },
          position: { lat: Number(place.lat), lng: Number(place.lng) },
          map: this.gmap,
          label: { text: "PCR", color: "red", fontSize: "1.6em" },
          title: place.facility_name,
          icon: "http://maps.google.com/mapfiles/ms/icons/ylw-pushpin.png",
          animation: google.maps.Animation.DROP,
          optimized: true
        });
        this.markers.push(marker);
        const infoWindow = new google.maps.InfoWindow({
          content:
            "<h3>" +
            place.facility_name +
            "</h3>" +
            "<h6>" +
            place.facility_address +
            "</h6>" +
            "<h6>" +
            "<a href=" +
            place.facility_hp +
            " target='_blank'>" +
            place.facility_hp +
            "</a>" +
            "</h6>" +
            "<h6>" +
            place.facility_tel +
            "</h6>" +
            "<h6>" +
            place.pcr_result +
            " 出结果" +
            "</h6>" +
            "<h6>" +
            place.pcr_workday +
            "</h6>"
        });
        marker.addListener("click", () => {
          infoWindow.open({
            anchor: marker,
            map: this.gmap
          });
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
