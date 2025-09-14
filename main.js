 import {showSegmentList, initSegment, ActiveSegment, closeSegment, normalSegmentView, selectedSegmentView} from './segments.js';

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

    const activeSegment = new ActiveSegment(null);
    

    function segmentInView(seg, bounds){
      const latlngs = polyline.decode(seg.map.polyline);
      return latlngs.some(latlng => bounds.contains(L.latLng(latlng[0], latlng[1])));
    }

    // update segmentlijst bij verschuiven/zoomen van kaart
    map.on("moveend", () => {
      if(!activeSegment.getActive()){
        const currentBounds = map.getBounds();
        const visibleSegments = segmentCache.filter(seg => segmentInView(seg, currentBounds));
        showSegmentList(visibleSegments, map, activeSegment);
      }

      segmentCache.forEach(seg => {
          if(seg !== activeSegment.getActive()){
            normalSegmentView(seg, map);
          }
          else{
            selectedSegmentView(seg, map);
          }
      });
    });

    fetch("data/segment_data.json")
        .then(res => res.json())
        .then(segmenten => {

        segmentCache = segmenten;
        allLatLngs = [];

        const segmentListDiv = document.getElementById("segment-details");
        segmentListDiv.innerHTML = ""; // leegmaken

        segmenten.forEach(seg => {

            const latlngs = polyline.decode(seg.map.polyline);
            allLatLngs.push(...latlngs); // voegt alle punten samen

            initSegment(seg, map, latlngs, activeSegment);
        });


        allBounds = L.latLngBounds(allLatLngs);
        map.fitBounds(allBounds);
        showSegmentList(segmentCache, map, activeSegment);
    });
    document.getElementById("close-btn").addEventListener("click", () => {

      closeSegment(activeSegment, map, segmentCache, allBounds);
      
    });