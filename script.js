const idDictionary = {
    // Tướng
    28000000: "Barbarian King", 28000001: "Archer Queen", 28000002: "Grand Warden", 28000004: "Royal Champion",
    28000006: "Battle Machine", 28000007: "Battle Copter",
    // Thú cưng
    73000000: "L.A.S.S.I", 73000001: "Electro Owl", 73000002: "Mighty Yak", 73000003: "Unicorn",
    73000004: "Frosty", 73000007: "Poison Lizard", 73000008: "Diggy", 73000009: "Phoenix",
    73000010: "Spirit Fox", 73000011: "Angry Jelly",
    // Một số công trình cơ bản (bạn có thể tự thêm sau)
    1000000: "Town Hall", 1000011: "Gold Mine", 1000012: "Elixir Collector", 
    1000013: "Dark Elixir Drill", 1000020: "Clan Castle", 1000010: "Wall"
};

function getName(id) {
    return idDictionary[id] || `Mã ID: ${id}`;
}

function formatTime(seconds) {
    if (!seconds || seconds <= 0) return "";
    const days = Math.floor(seconds / (3600 * 24));
    const hours = Math.floor((seconds % (3600 * 24)) / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    
    let timeParts = [];
    if (days > 0) timeParts.push(`${days}d`);
    if (hours > 0) timeParts.push(`${hours}h`);
    if (mins > 0 || timeParts.length === 0) timeParts.push(`${mins}m`);
    
    return `Còn: ${timeParts.join(' ')}`;
}

// Khai báo các biến DOM để dùng lại
const uiElements = {
    upgrading: document.getElementById('upgrading-list'),
    heroes: document.getElementById('heroes-list'),
    pets: document.getElementById('pets-list'),
    playerTag: document.getElementById('player-tag'),
    errorMsg: document.getElementById('error-msg')
};

function clearUI() {
    uiElements.upgrading.innerHTML = '';
    uiElements.heroes.innerHTML = '';
    uiElements.pets.innerHTML = '';
    uiElements.playerTag.textContent = 'Đang xử lý...';
    uiElements.errorMsg.style.display = 'none';
}

function showError(message) {
    console.error(message);
    uiElements.errorMsg.textContent = message;
    uiElements.errorMsg.style.display = 'block';
    uiElements.playerTag.textContent = 'Lỗi xử lý dữ liệu';
}

function processData(data) {
    clearUI(); 
    
    // Kiểm tra cấu trúc dữ liệu cơ bản
    if (!data || typeof data !== 'object') {
        showError("Lỗi: Dữ liệu JSON không hợp lệ (không phải object).");
        return;
    }

    uiElements.playerTag.textContent = data.tag || "Không tìm thấy Player Tag";
    uiElements.playerTag.style.color = "#27ae60"; // Đổi màu xanh báo hiệu thành công

    // Hàm render chung (có thêm kiểm tra an toàn)
    function renderItems(container, itemsArray, isBuilding = false) {
        if (!Array.isArray(itemsArray)) return;

        itemsArray.forEach(item => {
            if (!item || !item.data) return; // Bỏ qua nếu dữ liệu lỗi
            
            const li = document.createElement('li');
            const name = getName(item.data);
            const currentLevel = item.lvl || 0;
            const lvlHtml = `<span class="level">Cấp ${currentLevel}</span>`;
            
            // Xử lý các mục đang nâng cấp (có timer)
            if (item.timer && item.timer > 0) {
                const timerHtml = `<span class="timer">⏳ ${formatTime(item.timer)}</span>`;
                const upLi = document.createElement('li');
                // Nếu là công trình thì hiển thị "Đang lên cấp", tướng/pet thì "➡️ Cấp"
                const actionText = isBuilding ? `Đang lên Cấp ${currentLevel + 1}` : `➡️ Cấp ${currentLevel + 1}`;
                upLi.innerHTML = `<span>${name} (${actionText})</span> ${timerHtml}`;
                uiElements.upgrading.appendChild(upLi);
            }

            // Chỉ render vào danh sách heroes/pets nếu không phải là building
            if (!isBuilding) {
                li.innerHTML = `<span>${name}</span> <div>${lvlHtml}</div>`;
                container.appendChild(li);
            }
        });
    }

    // Render dữ liệu
    renderItems(uiElements.heroes, data.heroes);
    renderItems(uiElements.pets, data.pets);
    
    // Quét các công trình (chỉ lấy những cái đang nâng cấp)
    renderItems(null, data.buildings, true);

    // Thông báo nếu không có thợ xây nào đang làm việc
    if (uiElements.upgrading.children.length === 0) {
        uiElements.upgrading.innerHTML = "<li><span style='color:#7f8c8d; font-style: italic;'>Zzz... Không có công trình/tướng nào đang được nâng cấp!</span></li>";
    }
}

function handleJSON(jsonText) {
    const trimmedText = jsonText.trim();
    if (!trimmedText) {
        showError("Vui lòng dán mã JSON vào ô trống.");
        return;
    }

    // Kiểm tra nhanh xem có phải là JSON (bắt đầu bằng { và kết thúc bằng })
    if (!trimmedText.startsWith('{') || !trimmedText.endsWith('}')) {
       showError("Lỗi: Mã bạn dán không phải là cấu trúc JSON hợp lệ (Phải bắt đầu bằng '{' và kết thúc bằng '}'). Bạn đã copy thiếu đoạn đầu hoặc đoạn cuối rồi!");
       return;
    }

    try {
        const data = JSON.parse(trimmedText); 
        processData(data);
    } catch (error) {
        showError(`Lỗi phân tích JSON: ${error.message}. (Có thể do dấu phẩy dư hoặc sai định dạng chữ).`);
    }
}

// 1. Nút "Hiển thị dữ liệu" (Xử lý thủ công)
document.getElementById('btn-process').addEventListener('click', () => {
    const inputArea = document.getElementById('json-input');
    handleJSON(inputArea.value);
});

// 2. Nút "Dán mã" (Cố gắng đọc clipboard, nếu lỗi sẽ báo)
document.getElementById('btn-paste').addEventListener('click', async () => {
    const inputArea = document.getElementById('json-input');
    
    try {
        // Yêu cầu quyền đọc clipboard (trình duyệt có thể hỏi người dùng)
        const text = await navigator.clipboard.readText(); 
        
        if (!text) {
             showError("Bộ nhớ tạm đang trống. Hãy copy đoạn mã JSON trước.");
             return;
        }

        inputArea.value = text;
        handleJSON(text);

    } catch (err) {
        console.error("Lỗi clipboard:", err);
        showError("Trình duyệt từ chối quyền dán tự động (do bảo mật). Vui lòng chạm vào ô trống và dán thủ công (Ctrl+V / Nhấn giữ).");
    }
});

// 3. Xử lý khi người dùng dán thủ công vào Textarea (Dùng sự kiện paste)
document.getElementById('json-input').addEventListener('paste', (e) => {
    // Ngăn chặn hành vi dán mặc định để ta tự kiểm soát
    e.preventDefault();
    
    // Lấy dữ liệu văn bản từ sự kiện paste
    let pasteData = (e.clipboardData || window.clipboardData).getData('text');
    
    // Cập nhật giá trị vào ô input
    e.target.value = pasteData;

    // Chạy xử lý ngay
    handleJSON(pasteData);
});

// Nút xóa
document.getElementById('btn-clear').addEventListener('click', () => {
    document.getElementById('json-input').value = '';
    clearUI();
    uiElements.playerTag.textContent = 'Chưa có dữ liệu';
    uiElements.playerTag.style.color = '#f1c40f'; // Trả lại màu vàng
});
