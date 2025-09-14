export function createSegmentBlock(seg, map, activeSegment){

    const block = document.createElement("div");
    if(seg.kings_data.ourKOM){
        block.classList.add("segment-block-KOM");
    }
    else{
        block.classList.add("segment-block-noKOM");
    }
    
    block.innerHTML = `
        <b1>${seg.name}</b1><br>
        ${(seg.distance / 1000).toFixed(1)}km - ${(seg.average_grade).toFixed(1)}%<br>
        ${seg.city}, ${seg.state}<br>
    `;



    block.addEventListener("click", () => {
        selectSegment(seg, map, activeSegment);
    });
    block.addEventListener("mouseover", () => {
        highlightSegment(seg, map);
    });
    block.addEventListener("mouseout", () => {
        normalSegmentView(seg, map);
    });
    return block;
}

export function showSegmentList(segmenten, map, activeSegment) {
    setSidebarMode('list-mode');

    const segmentListDiv = document.getElementById("segment-details");
    segmentListDiv.innerHTML = ""; // leegmaken

    segmenten.forEach(seg => {
        segmentListDiv.appendChild(seg.block);
    });

    const spacer = document.createElement("div");
    spacer.style.height = "3rem";
    document.getElementById("segment-details").appendChild(spacer);
}

/**
 * 
 * @param {*} mode - the mode to switch towards
 * 
 * @description changes the sidebar mode, options: "list-mode", "details-mode"
 */
function setSidebarMode(mode) {
    const sidebar = document.getElementById('sidebar');
    sidebar.classList.remove('list-mode', 'details-mode');
    sidebar.classList.add(mode);
}

export function showSegmentDetails(seg){
    setSidebarMode('details-mode');
    document.getElementById("segment-details").innerHTML = `
        <b>${seg.name}</b><br>
        Average grade: ${(seg.average_grade).toFixed(1)}% <br>
        Distance: ${(seg.distance / 1000).toFixed(1)} km<br><br>
        Best time (KOM): ${seg.xoms.kom}<br>
        Location: ${seg.city}, ${seg.state}<br>
        <a href="https://www.strava.com/segments/${seg.id}" target="_blank">View on Strava</a>
        `;
}

function scrollBlockIntoView(seg) {
    const sidebar = document.getElementById("sidebar");
    const rect = seg.block.getBoundingClientRect();
    const sidebarRect = sidebar.getBoundingClientRect();

    let scrollOptions = {behavior: "smooth"};

    // als block boven de view is
    if (rect.top < sidebarRect.top) {
        scrollOptions.top = sidebar.scrollTop - (sidebarRect.top - rect.top) - 20; // offset 20px
        sidebar.scrollTo(scrollOptions);
    }
    // als block onder de view is
    else if (rect.bottom > sidebarRect.bottom) {
        scrollOptions.top = sidebar.scrollTop + (rect.bottom - sidebarRect.bottom) + 20; // offset 20px
        sidebar.scrollTo(scrollOptions);
    }
}

function selectSegment(seg, map, activeSegment){
    if(activeSegment.getActive() == seg){
        return;
    }
    if(activeSegment.getActive()){
        closeSegment(activeSegment, map);
    }
    if(!activeSegment.getActive()){

        selectedSegmentView(seg, map);

        activeSegment.setActive(seg);

        showSegmentDetails(seg);

        map.fitBounds(polyline.decode(seg.map.polyline), {padding : [10, 50], animate: true });
        
    }
    
}

export function closeSegment(activeSegment, map, segmentCache = null, allBounds = null){
    normalSegmentView(activeSegment.getActive(), map);
    activeSegment.setActive(null);
    if(segmentCache){
        showSegmentList(segmentCache, map, activeSegment);
    }
    if (allBounds) {
        map.fitBounds(allBounds, { padding: [25, 25], animate: true });
    }
}

function highlightSegment(seg, map){
    seg.shadowLine.setStyle({ opacity: 0.8 });

    seg.block.classList.add("hover");

    const zoom = map.getZoom();
    const baseWeight = Math.max(2, (zoom - 8))*seg.style.baseWeightFactor*0.75;  

    seg.visibleLine.setStyle({ weight: baseWeight*2});
    seg.shadowLine.setStyle({ weight: baseWeight*2 + zoom/3}); // hitbox/shadow mee schalen

    seg.finishMarker.setIcon(seg.finishIconHighlight);
    seg.finishMarker.setZIndexOffset(1000);
}

export function normalSegmentView(seg, map){
    seg.shadowLine.setStyle({ opacity: 0 });
    const zoom = map.getZoom();
    const baseWeight = Math.max(2, (zoom - 8))*seg.style.baseWeightFactor;

    seg.block.classList.remove("hover");

    seg.visibleLine.setStyle({ weight: baseWeight });
    seg.shadowLine.setStyle({ weight: baseWeight + 5}); // hitbox/shadow mee schalen

    seg.finishMarker.setIcon(seg.finishIconNormal);
    seg.finishMarker.setZIndexOffset(seg.style.base_z);
}

export function selectedSegmentView(seg, map){
    seg.shadowLine.setStyle({ opacity: 0.8 });

    seg.block.classList.add("hover");

    const zoom = map.getZoom();
    const baseWeight = Math.max(2, (zoom - 8));  

    seg.visibleLine.setStyle({ weight: baseWeight});
    seg.shadowLine.setStyle({ weight: baseWeight + 5}); // hitbox/shadow mee schalen
    seg.finishMarker.setZIndexOffset(1000);

}


/**
 * 
 * @param {*} seg - the segment for which the style is defined 
 * @returns {object} - The style dict
 */
function getSegmentStyle(seg) {
    if (seg.kings_data.ourKOM) {
        return {
            line_color: 'gold',
            line_edge_color: 'black',
            finishIconUrl : 'images/crown_gold.png',
            icon_size_0 : [28,28],
            icon_size_1 : [32,32],
            icon_anchor_0: [14,14],
            icon_anchor_1: [16,16],
            baseWeightFactor: 1.5,
            line_opacity: 0.9,
            line_edge_opacity: 0.8,
            icon_opacity: 1,
            base_z : 100
        };
    } else {
        return {
            line_color: 'gray',
            line_edge_color: 'gray',
            finishIconUrl: 'images/crown_black.png',
            icon_size_0 : [24,24],
            icon_size_1 : [28,28],
            icon_anchor_0: [12,12],
            icon_anchor_1: [14,14],
            baseWeightFactor: 1,
            line_opacity: 0.5,
            line_edge_opacity: 0.5,
            icon_opacity: 0.5,
            base_z : 0
        };
    }
}

export function initSegment(seg, map, latlngs, activeSegment){

    const block = createSegmentBlock(seg, map, activeSegment);
    seg.block = block;

    const style = getSegmentStyle(seg);
    seg.style = style

    const shadowLine = L.polyline(latlngs, {
        color: style.line_edge_color,
        weight: 13,
        opacity: 0
    }).addTo(map);

    const visibleLine = L.polyline(latlngs, { 
        color: style.line_color,      // kleur
        weight: 6,         // dikte in pixels
        opacity: seg.style.line_opacity,      // transparantie
    }).addTo(map);


    const endLatLng = latlngs[latlngs.length -1]; // eerste punt van de polyline
    const finishIconNormal = L.icon({
        iconUrl: style.finishIconUrl, // vervang door jouw icoon
        iconSize: style.icon_size_0,               // grootte van het icoon
        iconAnchor: style.icon_anchor_0,           // het "punt" van het icoon dat op het punt komt
    });
    const finishIconHighlight = L.icon({
        iconUrl: style.finishIconUrl, // vervang door jouw icoon
        iconSize: style.icon_size_1,            // grootte van het icoon
        iconAnchor: style.icon_anchor_1,            // het "punt" van het icoon dat op het punt komt
    });
    const finishMarker = L.marker(endLatLng, { 
        icon: finishIconNormal,
        opacity: style.icon_opacity,
        zIndexOffset: style.base_z
    }).addTo(map);

    const hitBox = L.polyline(latlngs, {
        color: 'black',
        weight: '20',
        opacity: '0',
    }).addTo(map)

    seg.shadowLine = shadowLine;
    seg.visibleLine = visibleLine;
    seg.hitBox = hitBox;
    seg.finishIconNormal = finishIconNormal;
    seg.finishIconHighlight = finishIconHighlight;
    seg.finishMarker = finishMarker;


    for (const layer of [hitBox, finishMarker]) {
        layer.on('mouseover', () => {
            if (seg !== activeSegment.getActive()) {
                highlightSegment(seg, map);
            }
            scrollBlockIntoView(seg);
        });

        layer.on('mouseout', () => {
            if (seg !== activeSegment.getActive()) {
                normalSegmentView(seg, map);
            }
        });

        layer.on('click', () => {
            selectSegment(seg, map, activeSegment);
        });
    }

    
}

export class ActiveSegment{
    constructor(seg = null){
        this.seg = seg;
    }
    setActive (seg){
        this.seg = seg;
    }

    getActive(){
        return this.seg;
    }
}
