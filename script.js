const idDictionary = {
    // Heroes
    28000000: "Barbarian King", 28000001: "Archer Queen", 28000002: "Grand Warden", 28000004: "Royal Champion",
    28000006: "Battle Machine", 28000007: "Battle Copter",
    // Pets
    73000000: "L.A.S.S.I", 73000001: "Electro Owl", 73000002: "Mighty Yak", 73000003: "Unicorn",
    73000004: "Frosty", 73000007: "Poison Lizard", 73000008: "Diggy", 73000009: "Phoenix",
    73000010: "Spirit Fox", 73000011: "Angry Jelly"
};

function getName(id) {
    return idDictionary[id] || `Mã ID: ${id}`;
}

function formatTime(seconds) {
    if (!seconds) return "";
    const days = Math.floor(seconds / (3600 * 24));
    const hours = Math.floor(seconds % (3600 * 24) / 3600);
    const mins = Math.floor(seconds % 3600 / 60);
    let timeStr = "";
    if (days > 0) timeStr += `${days}d `;
    if (hours > 0) timeStr += `${hours}h `;
    timeStr += `${mins}m`;
    return `Còn: ${timeStr}`;
}

function clearUI() {
    document.getElementById('upgrading-list').innerHTML = '';
    document.getElementById('heroes-list').innerHTML = '';
    document.getElementById('pets-list').innerHTML = '';
    document.getElementById('player-tag').textContent = 'Chưa có dữ liệu';
    document.getElementById('error-msg').style.display = 'none';
}

function processData(data) {
    clearUI(); 
    document.getElementById('player-tag').textContent = data.tag || "Không rõ";

    const upgradingList = document.getElementById('upgrading-list');
    const heroesList = document.getElementById('heroes-list');
    const petsList = document.getElementById('pets-list');

    function renderItems(container, itemsArray) {
        if (!itemsArray) return;
        itemsArray.forEach(item => {
            const li = document.createElement('li');
            const name = getName(item.data);
            const levelNum = item.lvl || 0;
            const lvlHtml = `<span class="level">Cấp ${levelNum}</span>`;
            
            if (item.timer) {
                const timerHtml = `<span class="timer">⏳ ${formatTime(item.timer)}</span>`;
                const upLi = document.createElement('li');
                upLi.innerHTML = `<span>${name} ➡️ Cấp ${levelNum + 1}</span> ${timerHtml}`;
                upgradingList.appendChild(upLi);
            }

            li.innerHTML = `<span>${name}</span> <div>${lvlHtml}</div>`;
            container.appendChild(li);
        });
    }

    renderItems(heroesList, data.heroes);
    renderItems(petsList, data.pets);

    // Quét buildings đang nâng cấp
    if (data.buildings) {
        data.buildings.forEach(b => {
            if (b.timer) {
                const li = document.createElement('li');
                const levelNum = b.lvl || 0;
                li.innerHTML = `<span>${getName(b.data)} (Đang lên Cấp ${levelNum + 1})</span> <span class="timer">⏳ ${formatTime(b.timer)}</span>`;
                upgradingList.appendChild(li);
            }
        });
    }

    if(upgradingList.children.length === 0) {
        upgradingList.innerHTML = "<li><span style='color:#7f8c8d;'>Thợ xây đang rảnh rỗi, không có công trình nào đang nâng!</span></li>";
    }
}

function handleJSON(jsonText) {
    if (!jsonText.trim()) return;
    try {
        const data = JSON.parse(jsonText); 
        processData(data);
    } catch (error) {
        const errorMsg = document.getElementById('error-msg');
        errorMsg.textContent = "Lỗi: Mã JSON chưa hoàn chỉnh hoặc bị sai định dạng. Vui lòng copy lại từ đầu đến cuối nhé!";
        errorMsg.style.display = 'block';
    }
}

// 1. Tự động chạy khi bấm nút "Hiển thị"
document.getElementById('btn-process').addEventListener('click', () => {
    handleJSON(document.getElementById('json-input').value);
});

// 2. Nút "Dán mã": Lấy từ bộ nhớ tạm và chạy luôn
document.getElementById('btn-paste').addEventListener('click', async () => {
    try {
        const text = await navigator.clipboard.readText(); // Đọc dữ liệu đã copy
        document.getElementById('json-input').value = text; // Điền vào ô
        handleJSON(text); // Chạy luôn dữ liệu
    } catch (err) {
        alert("Trình duyệt không cho phép dán tự động. Vui lòng chạm vào ô trống và dán thủ công!");
    }
});

// 3. Tự động chạy khi bạn dán bằng phím (Ctrl+V hoặc chạm giữ dán trên điện thoại)
document.getElementById('json-input').addEventListener('input', (e) => {
    // Đợi 0.5s sau khi dán để đảm bảo load hết chữ rồi mới chạy
    setTimeout(() => {
        handleJSON(e.target.value);
    }, 500);
});

// Xóa trắng
document.getElementById('btn-clear').addEventListener('click', () => {
    document.getElementById('json-input').value = '';
    clearUI();
});
