// Từ điển dịch ID sang Tên (Bạn có thể bổ sung thêm các ID khác nếu biết)
const idDictionary = {
    // Heroes
    28000000: "Barbarian King",
    28000001: "Archer Queen",
    28000002: "Grand Warden",
    28000004: "Royal Champion",
    28000006: "Battle Machine (Builder Base)",
    28000007: "Battle Copter (Builder Base)",
    
    // Pets
    73000000: "L.A.S.S.I",
    73000001: "Electro Owl",
    73000002: "Mighty Yak",
    73000003: "Unicorn",
    73000004: "Frosty",
    73000007: "Poison Lizard",
    73000008: "Diggy",
    73000009: "Phoenix",
    73000010: "Spirit Fox",
    73000011: "Angry Jelly",
    73000016: "Chữa lành", // Ví dụ tên pet mới
    73000017: "Pet mới",
};

// Hàm dịch ID sang Tên
function getName(id) {
    return idDictionary[id] || `Mục ID: ${id}`;
}

// Hàm format thời gian (từ giây sang Ngày Giờ)
function formatTime(seconds) {
    if (!seconds) return "";
    const days = Math.floor(seconds / (3600 * 24));
    const hours = Math.floor(seconds % (3600 * 24) / 3600);
    const mins = Math.floor(seconds % 3600 / 60);
    return `Còn: ${days}d ${hours}h ${mins}m`;
}

// Lấy dữ liệu từ file JSON
fetch('data.json')
    .then(response => response.json())
    .then(data => {
        // Hiển thị Player Tag
        document.getElementById('player-tag').textContent = data.tag;

        const upgradingList = document.getElementById('upgrading-list');
        const heroesList = document.getElementById('heroes-list');
        const petsList = document.getElementById('pets-list');

        // Hàm render dữ liệu chung
        function renderItems(container, itemsArray, type) {
            itemsArray.forEach(item => {
                const li = document.createElement('li');
                const name = getName(item.data);
                const lvlHtml = `<span class="level">Cấp ${item.lvl}</span>`;
                
                // Nếu mục này đang được nâng cấp (có timer)
                let timerHtml = '';
                if (item.timer) {
                    timerHtml = `<span class="timer">⏳ ${formatTime(item.timer)}</span>`;
                    
                    // Thêm riêng vào danh sách Đang nâng cấp
                    const upLi = document.createElement('li');
                    upLi.innerHTML = `<span>${name} -> Cấp ${item.lvl + 1}</span> ${timerHtml}`;
                    upgradingList.appendChild(upLi);
                }

                li.innerHTML = `<span>${name}</span> <div>${lvlHtml}</div>`;
                container.appendChild(li);
            });
        }

        // Render Heroes
        if(data.heroes) renderItems(heroesList, data.heroes, 'Hero');
        
        // Render Pets
        if(data.pets) renderItems(petsList, data.pets, 'Pet');

        // Quét các công trình (buildings) để tìm xem cái nào đang nâng cấp
        if(data.buildings) {
            data.buildings.forEach(b => {
                if (b.timer) {
                    const li = document.createElement('li');
                    li.innerHTML = `<span>${getName(b.data)} (Đang lên Cấp ${b.lvl + 1})</span> <span class="timer">⏳ ${formatTime(b.timer)}</span>`;
                    upgradingList.appendChild(li);
                }
            });
        }
    })
    .catch(error => console.error("Lỗi khi tải dữ liệu:", error));
