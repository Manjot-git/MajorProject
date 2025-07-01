document.addEventListener("DOMContentLoaded", () => {
    const map = new maplibregl.Map({
        container: 'map',
        style: 'https://api.maptiler.com/maps/streets/style.json?key=zssgD3Y166g41rair5wK',
        center: listing.geometry.coordinates,
        zoom: 9
    });

    // Create marker element
    const markerEl = document.createElement('div');
    markerEl.style.width = '25px';
    markerEl.style.height = '25px';
    markerEl.style.borderRadius = '50%';
    markerEl.style.backgroundColor = 'red';
    markerEl.style.cursor = 'pointer';
    markerEl.style.display = 'flex';
    markerEl.style.alignItems = 'center';
    markerEl.style.justifyContent = 'center';

    // Font Awesome icon element (hidden initially)
    const icon = document.createElement('i');
    icon.className = 'fa-solid fa-compass ';
    icon.style.color = 'black';
    icon.style.fontSize = '28px';
    icon.style.display = 'none';
    markerEl.appendChild(icon);

    icon.style.transition = 'box-shadow 0.3s ease';

    // Hover effects
    markerEl.addEventListener('mouseenter', () => {
        markerEl.style.backgroundColor = 'transparent';
        icon.style.boxShadow = '0 0 20px 10px rgba(255, 0, 0, 0.4)'; 
        // icon.style.filter = 'drop-shadow(0 0 2px red)';
        icon.style.display = 'block';
    });

    markerEl.addEventListener('mouseleave', () => {
        icon.style.display = 'none';
        markerEl.style.backgroundColor = 'red';
    });

    // Add marker
    new maplibregl.Marker({ element: markerEl })
        .setLngLat(listing.geometry.coordinates)
        .setPopup(
            new maplibregl.Popup({ offset: 25 })
                .setHTML(`<h5>${listing.title}</h5><p>Your provided listing Location after booking</p>`)
        )
        .addTo(map);
});
