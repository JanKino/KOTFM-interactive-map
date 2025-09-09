 import { createSegmentBlock, showSegmentList, showSegmentDetails, initSegment} from './segments.js';

    // Kaart maken
    const map = L.map('map');

    // OpenStreetMap tiles toevoegen
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap'
    }).addTo(map);

    let allLatLngs = [];
    let allBounds = null;
    let segmentCache = [];
    let activeSegment = null;

    function setActiveSegment(seg){
      activeSegment = seg;
    }

    function segmentInView(seg, bounds){
      const latlngs = polyline.decode(seg.map.polyline);
      return latlngs.some(latlng => bounds.contains(L.latLng(latlng[0], latlng[1])));
    }

    // update segmentlijst bij verschuiven/zoomen van kaart
    map.on("moveend", () => {
      if(!activeSegment){
        const currentBounds = map.getBounds();
        const visibleSegments = segmentCache.filter(seg => segmentInView(seg, currentBounds));
        showSegmentList(visibleSegments, map, setActiveSegment);
      }
      
    });

    fetch("data/segmenten.json")
        .then(res => res.json())
        .then(segmenten => {

        segmentCache = segmenten;
        allLatLngs = [];

        const segmentListDiv = document.getElementById("segment-details");
        segmentListDiv.innerHTML = ""; // leegmaken

        segmenten.forEach(seg => {

            const latlngs = polyline.decode(seg.map.polyline);
            allLatLngs.push(...latlngs); // voegt alle punten samen

            initSegment(seg, map, latlngs, setActiveSegment);
        });
        allBounds = L.latLngBounds(allLatLngs);
        map.fitBounds(allBounds);
        showSegmentList(segmentCache, map, setActiveSegment);
    });
    document.getElementById("close-btn").addEventListener("click", () => {
      document.getElementById("sidebar").classList.remove("active");
      activeSegment = null;
      document.getElementById("sidebar-header").style.display = "none"; // header verbergen
      showSegmentList(segmentCache, map, setActiveSegment);
      if (allBounds) {
        map.fitBounds(allBounds, { padding: [25, 25], animate: true });
      }
    });