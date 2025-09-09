export function createSegmentBlock(seg, map, setActiveSegment){

    const block = document.createElement("div");
    block.classList.add("segment-block");
    block.innerHTML = `
        <b>${seg.name}</b><br>
        Average grade: ${(seg.average_grade).toFixed(1)}% <br>
        Distance: ${(seg.distance / 1000).toFixed(1)} km<br>
        Our time: NOG INVULLEN <br>
        Location: ${seg.city}, ${seg.state}<br>
    `;
    block.addEventListener("click", () => {
        seg.shadowLine.setStyle({ opacity: 0 });
        seg.visibleLine.setStyle({ weight: 6 });
        map.fitBounds(polyline.decode(seg.map.polyline), { padding: [50, 50], animate: true });
        setActiveSegment(seg);
        document.getElementById("sidebar").classList.add("active");
        document.getElementById("sidebar-header").style.display = "flex";  // header tonen
        document.getElementById("segment-details").innerHTML = `
        <b>${seg.name}</b><br>
        Average grade: ${(seg.average_grade).toFixed(1)}% <br>
        Distance: ${(seg.distance / 1000).toFixed(1)} km<br><br>
        Best time (KOM): ${seg.xoms.kom}<br>
        Location: ${seg.city}, ${seg.state}<br><br>
        <a href="https://www.strava.com/segments/${seg.id}" target="_blank">View on Strava</a>
        `;
    });
    block.addEventListener("mouseover", () => {
        seg.shadowLine.setStyle({ opacity: 0.8 });
        seg.visibleLine.setStyle({ weight: 8 });
    });
    block.addEventListener("mouseout", () => {
        seg.shadowLine.setStyle({ opacity: 0 });
        seg.visibleLine.setStyle({ weight: 6 });
    });
    return block;
}

export function showSegmentList(segmenten, map, setActiveSegment) {
    const segmentListDiv = document.getElementById("segment-details");
    segmentListDiv.innerHTML = ""; // leegmaken

    segmenten.forEach(seg => {
    segmentListDiv.appendChild(seg.block);
    });

    const spacer = document.createElement("div");
    spacer.style.height = "3rem";
    document.getElementById("segment-details").appendChild(spacer);
}

export function showSegmentDetails(seg){
    document.getElementById("sidebar").classList.add("active");
    document.getElementById("sidebar-header").style.display = "flex";  // header tonen
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

export function initSegment(seg, map, latlngs, setActiveSegment){

    const block = createSegmentBlock(seg, map, setActiveSegment);
    seg.block = block;


    const shadowLine = L.polyline(latlngs, {
        color: 'black',
        weight: '13',
        opacity: '0'
    }).addTo(map);

    const visibleLine = L.polyline(latlngs, { 
        color: 'red',      // kleur
        weight: 6,         // dikte in pixels
        opacity: 0.8,      // transparantie
        //lineJoin: 'square', // afgeronde hoeken
        //lineCap: 'square'   // ronde uiteinden
    }).addTo(map);

    seg.shadowLine = shadowLine;
    seg.visibleLine = visibleLine;

    const hitBox = L.polyline(latlngs, {
        color: 'black',
        weight: '20',
        opacity: '0',
    }).addTo(map)

    hitBox.on('mouseover', () => {
        shadowLine.setStyle({ opacity: 0.8 });
        visibleLine.setStyle({ weight: 8 }); // rode lijn iets dikker maken
        seg.block.classList.add("hover");

        //seg.block.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        scrollBlockIntoView(seg);
    });

    hitBox.on('mouseout', () => {
        shadowLine.setStyle({ opacity: 0 });
        visibleLine.setStyle({ weight: 6 }); // terug naar normaal
        seg.block.classList.remove("hover");
    });

    hitBox.on('click', () =>{
        map.fitBounds(polyline.decode(seg.map.polyline), { padding: [50, 50], animate: true });
        setActiveSegment(seg);

        showSegmentDetails(seg);
    });

    
}
