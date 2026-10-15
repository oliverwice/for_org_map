// Инициализация карты
const map = L.map('map').setView([57.431508032922935, 56.939569121586814], 13);

L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}', {
  attribution: '© Esri',
  maxZoom: 19
}).addTo(map);

function makeIcon(color, emoji) {
  return L.divIcon({
    className: 'custom-marker',
    html: `
      <svg xmlns="http://www.w3.org/2000/svg" width="36" height="46" viewBox="0 0 36 46">
        <path d="M18 0C8.06 0 0 8.06 0 18c0 13.5 18 28 18 28s18-14.5 18-28C36 8.06 27.94 0 18 0z"
              fill="${color}" stroke="#ffffff" stroke-width="2"/>
        <text x="18" y="24" text-anchor="middle" font-size="18" dominant-baseline="middle">${emoji}</text>
      </svg>
    `,
    iconSize: [36, 46],
    iconAnchor: [18, 46],       // остриё капельки указывает на точку
    popupAnchor: [0, -42]        // попап появляется над маркером
  });
}

const icons = {
  museum:   makeIcon('#2c7be5', '🏛️'),  // синий — музеи
  monument: makeIcon('#e74c3c', '🗿'),  // красный — памятники
  park:     makeIcon('#27ae60', '🌳'),  // зелёный — парки
  nature:   makeIcon('#16a085', '🏞️')   // бирюзовый — природные места
};

let allPlaces = [];
let markers = [];

// Загрузка данных
fetch('data.json')
  .then(r => r.json())
  .then(places => {
    allPlaces = places;
    renderMarkers(places);
  })
  .catch(err => console.error('Ошибка загрузки data.json:', err));

// Отрисовка маркеров
function renderMarkers(places) {
  // убираем старые
  markers.forEach(m => map.removeLayer(m));
  markers = [];

  places.forEach(place => {
    const icon = icons[place.category] || icons.museum;
    const marker = L.marker([place.lat, place.lng], { icon }).addTo(map);

    const firstPhoto = place.photos && place.photos[0] ? place.photos[0] : '';

    marker.bindPopup(`
      <div class="popup">
        <h3>${place.name}</h3>
        ${firstPhoto ? `<img src="${firstPhoto}" alt="${place.name}">` : ''}
        <p><strong>📍</strong> ${place.address}</p>
        <p><strong>🕐</strong> ${place.hours}</p>
        <p>${place.description.slice(0, 120)}${place.description.length > 120 ? '…' : ''}</p>
        <button class="btn-gallery" onclick="openModal(${place.id})">
          Подробнее (${place.photos.length} фото)
        </button>
      </div>
    `);

    markers.push(marker);
  });
}

// Модальное окно
function openModal(id) {
  const place = allPlaces.find(p => p.id === id);
  if (!place) return;

  document.getElementById('modal-title').textContent = place.name;

  const gallery = document.getElementById('modal-gallery');
  gallery.innerHTML = place.photos
    .map(src => `<img src="${src}" alt="${place.name}" onclick="window.open('${src}', '_blank')">`)
    .join('');

  document.getElementById('modal-info').innerHTML = `
    <p><strong>📍 Адрес:</strong> ${place.address}</p>
    <p><strong>🕐 Часы работы:</strong> ${place.hours}</p>
    <p style="margin-top:12px;">${place.description}</p>
  `;

  document.getElementById('modal').classList.remove('hidden');
  map.closePopup();
}

function closeModal() {
  document.getElementById('modal').classList.add('hidden');
}

// Закрытие по клику вне окна
document.getElementById('modal').addEventListener('click', (e) => {
  if (e.target.id === 'modal') closeModal();
});

// Закрытие по Escape
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeModal();
});