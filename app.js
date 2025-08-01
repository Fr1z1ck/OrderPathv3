// Глобальные переменные
let currentItemIndex = 0; // Индекс текущего товара
let isDarkTheme = false; // Состояние темной темы
let isRecording = false; // Состояние записи голоса

// Глобальная переменная для хранения цветов категорий
let categoryColors = {};

// --- Мультизаказы ---
let orders = [];
let currentOrderIndex = -1; // -1 означает, что заказ не выбран

// DOM-элементы
const loadOrderBtn = document.getElementById('loadOrderBtn');
const statsPanelEl = document.getElementById('statsPanel');
const fileInputEl = document.getElementById('fileInput');
const loadOrderModal = document.getElementById('loadOrderModal');
const closeModalBtn = document.getElementById('closeModalBtn');
const closeModalIcon = document.getElementById('closeModalIcon');
const currentItemContainer = document.getElementById('currentItem');
const itemsListContainer = document.getElementById('itemsList');
const prevItemBtn = document.getElementById('prevItemBtn');
const nextItemBtn = document.getElementById('nextItemBtn');
const collectBtn = document.getElementById('collectBtn');
const editQuantityBtn = document.getElementById('editQuantityBtn');
const quantityModal = document.getElementById('quantityModal');
const newQuantityInput = document.getElementById('newQuantity');
const confirmQuantityBtn = document.getElementById('confirmQuantityBtn');
const cancelQuantityBtn = document.getElementById('cancelQuantityBtn');
const cancelQuantityIconBtn = document.getElementById('cancelQuantityIconBtn');
const totalCollectedCountEl = document.getElementById('totalCollectedCount');
const categoryCollectedCountEl = document.getElementById('categoryCollectedCount');
const totalProgressBarEl = document.getElementById('totalProgressBar');
const categoryProgressBarEl = document.getElementById('categoryProgressBar');
const orderInfoModal = document.getElementById('orderInfoModal');
const orderDetailsEl = document.getElementById('orderDetails');
const closeInfoModalBtn = document.getElementById('closeInfoModalBtn');
const closeInfoIconBtn = document.getElementById('closeInfoIconBtn');
const plusBtn = document.querySelector('.plus-btn');
const minusBtn = document.querySelector('.minus-btn');
const themeToggleBtn = document.getElementById('themeToggleBtn');
const quantityItemNameEl = document.getElementById('quantityItemName');
const voiceInputBtn = document.getElementById('voiceInputBtn');
const connectionStatusEl = document.getElementById('connectionStatus');
const connectionStatusTextEl = document.getElementById('connectionStatusText');
const toastEl = document.getElementById('toast');

// Элементы для ручного маршрута
const manualRouteBtn = document.getElementById('manualRouteBtn');
const manualRouteModal = document.getElementById('manualRouteModal');
const manualRouteCategoryList = document.getElementById('manualRouteCategoryList');
const saveManualRouteBtn = document.getElementById('saveManualRouteBtn');
const cancelManualRouteBtn = document.getElementById('cancelManualRouteBtn');
const closeManualRouteIcon = document.getElementById('closeManualRouteIcon');
const resetManualRouteBtn = document.getElementById('resetManualRouteBtn');
// const routeStatusIndicator = document.getElementById('routeStatusIndicator');

// Новые элементы для настроек
const settingsBtn = document.getElementById('settingsBtn');
const settingsModal = document.getElementById('settingsModal');
const closeSettingsIcon = document.getElementById('closeSettingsIcon');



// DOM-элементы для мультизаказов
const ordersListEl = document.getElementById('ordersList');
const ordersCountEl = document.getElementById('ordersCount');
const emptyOrdersEl = document.getElementById('emptyOrders');
const clearAllBtn = document.getElementById('clearAllBtn');
const startWorkBtn = document.getElementById('startWorkBtn');
const dropZone = document.getElementById('dropZone');
const uploadProgress = document.getElementById('uploadProgress');
const progressFill = document.getElementById('progressFill');
const progressText = document.getElementById('progressText');

// Инициализация приложения
function init() {
    // 1. Загрузка данных из localStorage
    loadThemeSettings();
    loadCategoryColors();
    loadOrdersFromStorage(); // Загружает заказы и текущие индексы
    loadManualRoute();       // Загружает маршрут

    // 2. Инициализация обработчиков событий
    // Кнопки навигации
    prevItemBtn.addEventListener('click', goToPrevItem);
    nextItemBtn.addEventListener('click', goToNextItem);
    collectBtn.addEventListener('click', toggleCollected);
    editQuantityBtn.addEventListener('click', showQuantityModal);
    
    // Кнопки модального окна загрузки заказа
    loadOrderBtn.addEventListener('click', showLoadOrderModal);
    closeModalIcon.addEventListener('click', hideLoadOrderModal);
    
    // Кнопки модального окна настроек
    settingsBtn.addEventListener('click', showSettingsModal);
    closeSettingsIcon.addEventListener('click', hideSettingsModal);
    
    // Кнопки ручного маршрута
    manualRouteBtn.addEventListener('click', showManualRouteModal);
    closeManualRouteIcon.addEventListener('click', hideManualRouteModal);
    saveManualRouteBtn.addEventListener('click', saveManualRoute);
    cancelManualRouteBtn.addEventListener('click', hideManualRouteModal);
    resetManualRouteBtn.addEventListener('click', resetManualRoute);
    
    // Обработчик выбора файла
    if (fileInputEl) {
        fileInputEl.addEventListener('change', (e) => handleMultipleFiles(e.target.files));
    }
    
    // Кнопки модального окна изменения количества
    confirmQuantityBtn.addEventListener('click', updateQuantity);
    cancelQuantityBtn.addEventListener('click', hideQuantityModal);
    cancelQuantityIconBtn.addEventListener('click', hideQuantityModal);
    
    // Обработчики для цифровой клавиатуры
    document.querySelector('.number-pad').addEventListener('click', (e) => {
        if (e.target.matches('.number-btn')) {
            const number = e.target.dataset.number;
            const action = e.target.dataset.action;
            
            if (action === 'clear') newQuantityInput.value = '';
            else if (action === 'backspace') newQuantityInput.value = newQuantityInput.value.slice(0, -1);
            else if (number) newQuantityInput.value += number;
        }
    });
    
    // Кнопки модального окна информации о заказе
    closeInfoModalBtn.addEventListener('click', hideOrderInfo);
    closeInfoIconBtn.addEventListener('click', hideOrderInfo);
    
    statsPanelEl.addEventListener('click', showOrderInfo);
    themeToggleBtn.addEventListener('click', toggleTheme);
    monitorConnection();
    
    // Настройка перетаскивания файлов
    if (dropZone) {
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            dropZone.addEventListener(eventName, (e) => {
                e.preventDefault();
                e.stopPropagation();
            });
        });
        
        ['dragenter', 'dragover'].forEach(eventName => {
            dropZone.addEventListener(eventName, () => dropZone.classList.add('drag-over'));
        });
        
        ['dragleave', 'drop'].forEach(eventName => {
            dropZone.addEventListener(eventName, () => dropZone.classList.remove('drag-over'));
        });
        
        dropZone.addEventListener('drop', (e) => {
            if (e.dataTransfer.files.length) {
                handleMultipleFiles(e.dataTransfer.files);
            }
        });
        
        dropZone.addEventListener('click', () => fileInputEl.click());
    }
    
    // Обработчики для новых кнопок
    if (clearAllBtn) clearAllBtn.addEventListener('click', clearAllOrders);
    if (startWorkBtn) startWorkBtn.addEventListener('click', startWork);
    
    // 3. Применение маршрута, если он есть
    const currentOrder = getCurrentOrder();
    if (currentOrder && currentOrder.items && Object.keys(currentRoute).length > 0) {
        applyRouteToCurrentOrder();
    }

    // 4. Обновление UI
    updateUI();
    
    console.log('Инициализация приложения завершена');
}

// Загрузка заказа из локального хранилища (устаревшая функция)
function loadStoredOrder() {
    console.log('loadStoredOrder: функция устарела и будет удалена.');
}

// Сохранение заказа в локальное хранилище (устаревшая функция)
function saveOrderToStorage() {
    console.log('saveOrderToStorage: функция устарела и будет удалена.');
}

// Загрузка настроек темы
function loadThemeSettings() {
    const theme = localStorage.getItem('theme');
    if (theme === 'dark') {
        document.documentElement.classList.add('dark-theme');
        isDarkTheme = true;
    } else {
        document.documentElement.classList.remove('dark-theme');
        isDarkTheme = false;
    }
    // Обновляем текст кнопки темы при загрузке
    if (themeToggleBtn) {
        updateThemeButtonText();
    }
}

// Показать модальное окно настроек
function showSettingsModal() {
    settingsModal.classList.add('active');
    document.body.classList.add('modal-open');
    updateThemeButtonText();
}

// Скрыть модальное окно настроек
function hideSettingsModal() {
    settingsModal.classList.remove('active');
    document.body.classList.remove('modal-open');
}

// Обновить текст кнопки темы
function updateThemeButtonText() {
    const themeText = themeToggleBtn.querySelector('.theme-text');
    const themeIcon = themeToggleBtn.querySelector('i');
    
    if (isDarkTheme) {
        themeIcon.className = 'fas fa-sun';
        themeText.textContent = 'Светлая тема';
    } else {
        themeIcon.className = 'fas fa-moon';
        themeText.textContent = 'Темная тема';
    }
}

// Переключение темной темы
function toggleTheme() {
    isDarkTheme = !isDarkTheme;
    if (isDarkTheme) {
        document.documentElement.classList.add('dark-theme');
        localStorage.setItem('theme', 'dark');
        showToast('Тёмная тема включена', 'info');
    } else {
        document.documentElement.classList.remove('dark-theme');
        localStorage.setItem('theme', 'light');
        showToast('Светлая тема включена', 'info');
    }
    updateThemeButtonText();
}

// Мониторинг сетевого соединения
function monitorConnection() {
    const updateConnectionStatus = () => {
        if (navigator.onLine) {
            connectionStatusEl.classList.remove('offline');
            connectionStatusEl.classList.add('online');
            connectionStatusTextEl.textContent = 'Онлайн';
            connectionStatusEl.classList.add('show');
            setTimeout(() => {
                connectionStatusEl.classList.remove('show');
            }, 3000);
        } else {
            connectionStatusEl.classList.remove('online');
            connectionStatusEl.classList.add('offline');
            connectionStatusTextEl.textContent = 'Офлайн';
            connectionStatusEl.classList.add('show');
        }
    };
    
    window.addEventListener('online', () => {
        updateConnectionStatus();
        showToast('Соединение восстановлено', 'success');
    });
    
    window.addEventListener('offline', () => {
        updateConnectionStatus();
        showToast('Соединение потеряно', 'error');
    });
    
    // Начальная проверка
    updateConnectionStatus();
}

// Показать всплывающее уведомление
function showToast(message, type = 'info') {
    console.log(`Toast: ${type} - ${message}`);
    
    // Получаем элемент toast
    let toastElement = document.getElementById('toast');
    
    // Если элемент не найден, создаем его
    if (!toastElement) {
        toastElement = document.createElement('div');
        toastElement.id = 'toast';
        toastElement.className = 'toast';
        document.body.appendChild(toastElement);
        console.log('Создан новый элемент toast');
    }
    
    // Устанавливаем класс в зависимости от типа
    toastElement.className = `toast ${type}`;
    
    // Устанавливаем сообщение
    toastElement.textContent = message;
    
    // Показываем уведомление
    toastElement.classList.add('show');
    
    // Автоматически скрываем через 3 секунды
    setTimeout(() => {
        toastElement.classList.remove('show');
    }, 3000);
}

// Обработка голосового ввода
function toggleVoiceInput() {
    if (!('webkitSpeechRecognition' in window)) {
        showToast('Голосовой ввод не поддерживается', 'error');
        return;
    }
    
    if (isRecording) {
        // Остановить запись
        if (window.recognition) {
            window.recognition.stop();
        }
        return;
    }
    
    // Начать запись
    isRecording = true;
    voiceInputBtn.classList.add('recording');
    
    const recognition = new webkitSpeechRecognition();
    window.recognition = recognition;
    
    recognition.lang = 'ru-RU';
    recognition.continuous = false;
    recognition.interimResults = false;
    
    recognition.onstart = function() {
        showToast('Говорите количество...', 'info');
    };
    
    recognition.onresult = function(event) {
        const transcript = event.results[0][0].transcript;
        const numericValue = extractNumber(transcript);
        
        if (numericValue !== null) {
            newQuantityInput.value = numericValue;
            showToast(`Распознано: ${numericValue}`, 'success');
        } else {
            showToast('Не удалось распознать число', 'error');
        }
    };
    
    recognition.onerror = function(event) {
        console.error('Speech recognition error', event.error);
        showToast('Ошибка распознавания речи', 'error');
        isRecording = false;
        voiceInputBtn.classList.remove('recording');
    };
    
    recognition.onend = function() {
        isRecording = false;
        voiceInputBtn.classList.remove('recording');
    };
    
    recognition.start();
}

// Извлечение числа из текста
function extractNumber(text) {
    // Попытка извлечь число из текста
    const numWords = {
        'ноль': 0, 'один': 1, 'два': 2, 'три': 3, 'четыре': 4, 
        'пять': 5, 'шесть': 6, 'семь': 7, 'восемь': 8, 'девять': 9,
        'десять': 10, 'одиннадцать': 11, 'двенадцать': 12, 'тринадцать': 13, 
        'четырнадцать': 14, 'пятнадцать': 15, 'шестнадцать': 16, 
        'семнадцать': 17, 'восемнадцать': 18, 'девятнадцать': 19,
        'двадцать': 20, 'тридцать': 30, 'сорок': 40, 'пятьдесят': 50
    };
    
    // Проверка на цифровое значение
    const numMatch = text.match(/\d+/);
    if (numMatch) {
        return parseInt(numMatch[0]);
    }
    
    // Проверка на словесное значение
    text = text.toLowerCase();
    for (const word in numWords) {
        if (text.includes(word)) {
            return numWords[word];
        }
    }
    
    return null;
}

// Показать модальное окно загрузки заказа
function showLoadOrderModal() {
    console.log('Показываем модальное окно загрузки заказа');
    if (loadOrderModal) {
        loadOrderModal.classList.add('active');
        document.body.classList.add('modal-open');
        console.log('Модальное окно активировано');
        
        // Обновляем UI списка заказов при открытии модального окна
        updateOrdersListUI();
    } else {
        console.error('Элемент loadOrderModal не найден!');
    }
}

// Скрыть модальное окно загрузки заказа
function hideLoadOrderModal() {
    console.log('Скрываем модальное окно загрузки заказа');
    if (loadOrderModal) {
        loadOrderModal.classList.remove('active');
        document.body.classList.remove('modal-open');
        console.log('Модальное окно деактивировано');
    } else {
        console.error('Элемент loadOrderModal не найден!');
    }
    
    if (fileInputEl) {
        fileInputEl.value = '';
        console.log('Поле выбора файла очищено');
    } else {
        console.error('Элемент fileInputEl не найден!');
    }
    
    // Скрываем прогресс загрузки при закрытии модального окна
    if (uploadProgress) {
        uploadProgress.style.display = 'none';
    }
}

// Обработка загруженного файла Excel
function handleFileUpload(e) {
    const files = e.target.files || e.dataTransfer?.files;
    if (!files || !files.length) return;
    handleMultipleFiles(files);
    e.target.value = '';
}

function handleMultipleFiles(files) {
    const validFiles = Array.from(files).filter(file => {
        const isValid = file.type.includes('excel') || 
                       file.type.includes('spreadsheet') || 
                       file.name.endsWith('.xls') || 
                       file.name.endsWith('.xlsx');
        
        if (!isValid) {
            showToast(`Файл ${file.name} не поддерживается. Используйте .xls или .xlsx`, 'error');
        }
        return isValid;
    });
    
    if (validFiles.length === 0) {
        showToast('Нет подходящих файлов для загрузки', 'error');
        return;
    }
    
    // Показываем прогресс загрузки
    showUploadProgress();
    
    let processedFiles = 0;
    let totalFiles = validFiles.length;
    
    validFiles.forEach((file, index) => {
        const reader = new FileReader();
        
        reader.onload = function(ev) {
            try {
                const data = new Uint8Array(ev.target.result);
                const workbook = XLSX.read(data, { type: 'array' });
                const order = processExcelDataForMulti(workbook);
                
                if (order) {
                    // Проверка на дубликат по id
                    if (orders.some(o => o.id === order.id)) {
                        showToast(`Заказ ${order.id} уже загружен`, 'error');
                    } else {
                    orders.push(order);
                    showToast(`Заказ ${order.id} успешно загружен`, 'success');
                    }
                } else {
                    showToast(`Не удалось обработать файл ${file.name}`, 'error');
                }
                
                processedFiles++;
                updateUploadProgress(processedFiles, totalFiles);
                
                if (processedFiles === totalFiles) {
                    // Все файлы обработаны
                    hideUploadProgress();
                    currentOrderIndex = orders.length - 1;
                    
                    // Применяем маршрут к новому заказу, если он есть
                    const currentOrder = getCurrentOrder();
                    if (currentOrder && currentOrder.items && Object.keys(currentRoute).length > 0) {
                        applyRouteToCurrentOrder();
                    }
                    
                    updateUI();
                    updateOrdersListUI();
                    saveOrdersToStorage();
                }
            } catch (error) {
                showToast('Ошибка при чтении файла: ' + error.message, 'error');
                processedFiles++;
                updateUploadProgress(processedFiles, totalFiles);
            }
        };
        
        reader.readAsArrayBuffer(file);
    });
}

// Новый парсер заказа для мультизагрузки
function processExcelDataForMulti(workbook) {
    try {
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: "", raw: false });
        if (rows.length === 0) return null;
        const orderNumberRow = rows.find(row => String(row[0] || '').match(/ЗАКАЗ №\s*\d+/i));
        const orderNumber = orderNumberRow ? String(orderNumberRow[0] || '').split('№')[1].trim() : 'Заказ без номера';
        const order = {
            id: orderNumber,
            createdAt: new Date().toISOString(),
            items: [],
            categories: {},
            categoryOrder: [] // Массив для сохранения порядка категорий
        };
        let category = "Без категории";
        rows.forEach((row, index) => {
            const colA = String(row[0] || '').trim().replace(/\s+/g, ' ');
            const colB = String(row[1] || '').trim();
            if ([/индивидуальный предприниматель/i, /доставка по РФ/i, /адрес доставки:/i, /статус отгрузки:/i, /комментарий:/i, /заказчик/i, /якорь нк/i, /^№/].some(p => p.test(colA) || p.test(colB))) return;
            if (colB && !row[2] && !row[6]) {
                category = colB;
                return;
            }
            if (row[2]?.trim() && row[6] && row[7]) {
                const name = row[2].trim();
                const price = parseFloat(String(row[6]).replace(',', '.')) || 0;
                const quantity = parseFloat(String(row[7]).replace(',', '.')) || 1;
                const unit = row[8]?.trim() || '';
                const item = {
                    name,
                    quantity,
                    originalQuantity: quantity,
                    price,
                    category,
                    weight: undefined,
                    unit,
                    collected: false,
                    modified: false,
                    collectedAt: null
                };
                const weightMatch = name.match(/(\d+)\s*гр?\s*\(м\)/i);
                if (weightMatch) {
                    item.weight = parseFloat(weightMatch[1]);
                }
                const itemIndex = order.items.length;
                order.items.push(item);
                if (!order.categories[category]) {
                    order.categories[category] = { items: [] };
                    order.categoryOrder.push(category); // Сохраняем порядок категорий
                }
                order.categories[category].items.push(itemIndex);
            }
        });
        if (order.items.length === 0) return null;
        return order;
    } catch (error) {
        showToast('Ошибка обработки файла: ' + error.message, 'error');
        return null;
    }
}

// Обновление интерфейса
function updateUI() {
    updateCurrentItemView();
    updateStats();
    updateNavigation();
    updateItemsList();
    updateNextItems();
    updateOrdersListUI();
    updateManualRouteBtnStatus();
}

// Обновление отображения текущего товара
function updateCurrentItemView() {
    const currentOrder = getCurrentOrder();
    if (!currentOrder || !currentOrder.items.length) {
        currentItemContainer.innerHTML = `
            <div class="item-placeholder">
                <div class="empty-state-icon">
                    <i class="fas fa-box-open"></i>
                </div>
                <p>Заказ не содержит товаров</p>
            </div>`;
        return;
    }
    
    const item = currentOrder.items[currentItemIndex];
    
    // Убираем отображение единиц измерения, оставляем только число
    // const unitDisplay = item.unit ? ` ${item.unit}` : '';
    
    // Определяем тяжелый ли товар
    const isHeavy = item.weight !== undefined && item.weight > 50;
    
    // Получаем или генерируем цвет для категории
    const categoryColor = generateCategoryColor(item.category || 'Без категории');
    
    // Проверяем, есть ли модифицированные товары в этой категории
    const categoryIndices = currentOrder.categories[item.category || 'Без категории']?.items || [];
    const hasModifiedItems = categoryIndices.some(idx => currentOrder.items[idx].modified);
    
    // Добавляем индикатор модифицированной категории
    const modifiedCategoryIndicator = hasModifiedItems ? 
        '<span class="modified-category-indicator"><i class="fas fa-edit"></i></span>' : '';
    
    // Подготавливаем HTML для отображения веса
    let weightHTML = '';
    if (item.weight !== undefined) {
        const weightClass = isHeavy ? 'weight-heavy' : 'weight-safe';
        const weightIcon = isHeavy ? 'fa-weight-hanging' : 'fa-weight';
        weightHTML = `
            <div class="weight-indicator ${weightClass}">
                <i class="fas ${weightIcon}"></i> ${item.weight} гр
            </div>
        `;
    }
    
    // Отображение для модифицированного количества
    let quantityDisplay = '';
    if (item.modified) {
        quantityDisplay = `
            <div class="quantity-label">Количество:</div>
            <div class="quantity-value-container">
                <div class="quantity-original">${item.originalQuantity}</div>
                <div class="quantity-arrow"><i class="fas fa-arrow-right"></i></div>
                <div class="quantity-modified">${item.quantity}</div>
            </div>
        `;
    } else {
        quantityDisplay = `
            <div class="quantity-label">Количество:</div>
            <div class="quantity-value">
                ${item.quantity}
            </div>
        `;
    }
    
    // Удалено: Статус сбора "собрано"
    
    // Добавляем класс для тяжелых товаров
    currentItemContainer.className = `current-item-container slide-up ${isHeavy ? 'heavy-item' : ''}`;
    
    // Определяем классы для категории
    const categoryClasses = [];
    if (hasModifiedItems) categoryClasses.push('modified-category');
    if (item.category === 'Без категории') categoryClasses.push('no-category');
    
    currentItemContainer.innerHTML = `
        <div class="item-header">
            <div class="item-category ${categoryClasses.join(' ')}" style="background-color: ${categoryColor}; color: white;" data-category="${item.category || 'Без категории'}">
                <i class="fas fa-tags"></i> ${item.category || 'Без категории'} ${modifiedCategoryIndicator}
            </div>
            <div class="item-name">${item.name}</div>
        </div>
        
        <div class="quantity-container">
            ${quantityDisplay}
        </div>
        
        <div class="item-details">
            <div class="item-price">
                <i class="fas fa-ruble-sign"></i> ${item.price} руб.
            </div>
            ${weightHTML}
        </div>
    `;
    
    // Добавляем обработчик клика на категорию
    const categoryElement = currentItemContainer.querySelector('.item-category');
    if (categoryElement) {
        categoryElement.addEventListener('click', () => {
            // Находим категорию в списке и прокручиваем к ней
            const categoryName = categoryElement.getAttribute('data-category');
            scrollToCategoryInList(categoryName);
        });
    }
    
    // Обновляем состояние кнопки "Собрано"
    collectBtn.classList.toggle('collected', item.collected);
    collectBtn.innerHTML = item.collected ? 
        '<i class="fas fa-times"></i> Отменить' : 
        '<i class="fas fa-check"></i> Собрано';
}

// Функция для прокрутки к категории в списке товаров
function scrollToCategoryInList(categoryName) {
    const categoryHeaders = document.querySelectorAll('.category-header');
    
    for (const header of categoryHeaders) {
        if (header.textContent.trim().includes(categoryName)) {
            // Находим блок категории
            const categoryBlock = header.parentElement;
            
            // Разворачиваем категорию, если она свернута
            if (categoryBlock.classList.contains('collapsed')) {
                categoryBlock.classList.remove('collapsed');
            }
            
            // Прокручиваем к категории с плавной анимацией
            header.scrollIntoView({ behavior: 'smooth', block: 'start' });
            
            // Добавляем временное выделение для привлечения внимания
            header.classList.add('highlight-animation');
            setTimeout(() => {
                header.classList.remove('highlight-animation');
            }, 2000);
            
            break;
        }
    }
}

// Обновление списка всех товаров
function updateItemsList() {
    const currentOrder = getCurrentOrder();
    if (!currentOrder || !currentOrder.items.length) {
        itemsListContainer.innerHTML = '<div class="item-placeholder">Нет товаров для отображения</div>';
        return;
    }
    
    itemsListContainer.innerHTML = '';
    
    // Отображаем товары по категориям в исходном порядке
    const categoryOrder = currentOrder.categoryOrder || Object.keys(currentOrder.categories);
    for (const category of categoryOrder) {
        const categoryIndices = currentOrder.categories[category].items;
        if (!categoryIndices || categoryIndices.length === 0) continue;
        
        // Получаем или генерируем цвет для категории
        const categoryColor = generateCategoryColor(category);
        
        const categoryBlock = document.createElement('div');
        categoryBlock.className = 'category-block';
        
        // Подсчитываем количество собранных товаров в категории
        const collectedInCategory = categoryIndices.filter(idx => currentOrder.items[idx].collected).length;
        const allCollected = collectedInCategory === categoryIndices.length;
        
        // Проверяем, есть ли модифицированные товары в категории
        const allModified = categoryIndices.every(idx => currentOrder.items[idx].modified || currentOrder.items[idx].quantity !== currentOrder.items[idx].originalQuantity);
        const hasModifiedItems = categoryIndices.some(idx => currentOrder.items[idx].modified);
        
        // Автоматически сворачиваем категорию, если все собраны ИЛИ все изменены
        if (allCollected || allModified) {
            categoryBlock.classList.add('collapsed');
        }
        
        const categoryHeader = document.createElement('div');
        
        // Определяем класс для заголовка категории в зависимости от статуса
        // Приоритет: модифицированные > собранные
        let categoryHeaderClass = '';
        if (hasModifiedItems) {
            categoryHeaderClass = 'modified';
        } else if (allCollected) {
            categoryHeaderClass = 'completed';
        }
        
        // Добавляем специальный класс для категории "Без категории"
        if (category === 'Без категории') {
            categoryHeaderClass += ' no-category';
        }
        
        categoryHeader.className = `category-header ${categoryHeaderClass}`;
        categoryHeader.style.borderLeft = `5px solid ${categoryColor}`;
        categoryHeader.innerHTML = `
            <span class="category-name">${category}</span>
            <span class="category-count">
                ${collectedInCategory}/${categoryIndices.length}
            </span>
        `;
        
        // Добавляем обработчик клика для сворачивания/разворачивания категории
        categoryHeader.addEventListener('click', () => {
            categoryBlock.classList.toggle('collapsed');
        });
        
        categoryBlock.appendChild(categoryHeader);
        
        // Добавляем товары в категорию
        for (const idx of categoryIndices) {
            const item = currentOrder.items[idx];
            
            // Определяем классы для элемента (собранный, модифицированный, выбранный, тяжелый)
            const classes = [];
            if (item.collected) classes.push('collected');
            if (item.modified) classes.push('modified');
            if (idx === currentItemIndex) classes.push('selected');
            if (item.weight !== undefined && item.weight > 50) {
                classes.push('heavy-item-text');
            }
            
            const itemCard = document.createElement('div');
            itemCard.className = `item-card ${classes.join(' ')}`;
            itemCard.style.borderLeft = `3px solid ${categoryColor}`;
            
            // Отображаем количество
            const quantityDisplay = item.modified ? 
                `<span class="quantity-badge modified">${item.originalQuantity} → ${item.quantity}</span>` : 
                `<span class="quantity-badge">${item.quantity}</span>`;
            
            // Добавляем индикатор выбранного товара
            const selectedIndicator = idx === currentItemIndex ? 
                '<span class="selected-indicator"><i class="fas fa-angle-right"></i></span>' : '';
            
            itemCard.innerHTML = `
                <div class="item-info">
                    ${selectedIndicator}
                    ${item.name}
                </div>
                <div>
                    ${quantityDisplay}
                </div>
            `;
            
            itemCard.addEventListener('click', () => {
                currentItemIndex = idx;
                updateCurrentItemView();
                updateNavigation();
                
                // Выделяем выбранный товар и прокручиваем к нему
                const selectedCards = document.querySelectorAll('.item-card.selected');
                selectedCards.forEach(card => card.classList.remove('selected'));
                itemCard.classList.add('selected');
                
                // Обновляем весь список, чтобы обновить индикаторы
                updateItemsList();
            });
            
            categoryBlock.appendChild(itemCard);
        }
        
        itemsListContainer.appendChild(categoryBlock);
    }
    
    // Сохраняем цвета категорий
    saveCategoryColors();
}

// Обновление статистики
function updateStats() {
    const currentOrder = getCurrentOrder();
    if (!currentOrder) {
        totalCollectedCountEl.textContent = '0/0';
        categoryCollectedCountEl.textContent = '0/0';
        totalProgressBarEl.style.width = '0%';
        categoryProgressBarEl.style.width = '0%';
        return;
    }
    
    const totalItems = currentOrder.items.length;
    const collectedItems = currentOrder.items.filter(item => item.collected).length;
    
    // Статистика по всему заказу
    totalCollectedCountEl.textContent = `${collectedItems}/${totalItems}`;
    const totalProgressPercentage = totalItems > 0 ? Math.round((collectedItems / totalItems) * 100) : 0;
    totalProgressBarEl.style.width = `${totalProgressPercentage}%`;
    
    // Статистика по текущей категории
    const currentItem = currentOrder.items[currentItemIndex];
    let categoryProgressPercentage = 0;
    if (currentItem) {
        const currentCategory = currentItem.category || 'Без категории';
        const categoryItems = currentOrder.items.filter(item => item.category === currentCategory);
        const collectedInCategory = categoryItems.filter(item => item.collected).length;
        const totalInCategory = categoryItems.length;
        
        categoryCollectedCountEl.textContent = `${collectedInCategory}/${totalInCategory}`;
        categoryProgressPercentage = totalInCategory > 0 ? Math.round((collectedInCategory / totalInCategory) * 100) : 0;
        categoryProgressBarEl.style.width = `${categoryProgressPercentage}%`;
    } else {
        categoryCollectedCountEl.textContent = '0/0';
        categoryProgressBarEl.style.width = '0%';
    }
    
    // Изменение цвета прогресс-баров в зависимости от процента выполнения
    if (totalProgressPercentage === 100) {
        totalProgressBarEl.style.background = 'var(--success-color)';
    } else {
        totalProgressBarEl.style.background = 'var(--progress-gradient)';
    }
    
    if (categoryProgressPercentage === 100) {
        categoryProgressBarEl.style.background = 'var(--success-color)';
    } else {
        categoryProgressBarEl.style.background = 'var(--progress-gradient)';
    }
}

// Обновление состояния кнопок навигации
function updateNavigation() {
    const currentOrder = getCurrentOrder();
    if (!currentOrder) {
        disableNavigation();
        return;
    }
    
    prevItemBtn.disabled = currentItemIndex === 0;
    nextItemBtn.disabled = currentItemIndex === currentOrder.items.length - 1;
    collectBtn.disabled = false;
    editQuantityBtn.disabled = false;
    
    // Обновляем состояние кнопок собрано/не собрано
    if (currentOrder.items[currentItemIndex].collected) {
        collectBtn.classList.add('collected');
        collectBtn.innerHTML = '<i class="fas fa-times"></i> Отменить';
    } else {
        collectBtn.classList.remove('collected');
        collectBtn.innerHTML = '<i class="fas fa-check"></i> Собрано';
    }
}

// Отключение всех кнопок навигации
function disableNavigation() {
    prevItemBtn.disabled = true;
    nextItemBtn.disabled = true;
    collectBtn.disabled = true;
    editQuantityBtn.disabled = true;
}

// Переход к предыдущему товару
function goToPrevItem() {
    const currentOrder = getCurrentOrder();
    if (!currentOrder) return;

    if (Object.keys(currentRoute).length > 0) {
        const currentItem = currentOrder.items[currentItemIndex];
        const currentItemPriority = currentRoute[currentItem.category || 'Без категории'] || Number.MAX_SAFE_INTEGER;

        const potentialPrevItems = [];
        for (let i = 0; i < currentOrder.items.length; i++) {
            const item = currentOrder.items[i];
            const itemPriority = currentRoute[item.category || 'Без категории'] || Number.MAX_SAFE_INTEGER;

            if (itemPriority < currentItemPriority || (itemPriority === currentItemPriority && i < currentItemIndex)) {
                potentialPrevItems.push({ index: i, priority: itemPriority });
            }
        }

        if (potentialPrevItems.length > 0) {
            // Сортируем, чтобы найти ближайший предыдущий элемент
            potentialPrevItems.sort((a, b) => {
                if (a.priority !== b.priority) {
                    return a.priority - b.priority;
                }
                return a.index - b.index;
            });
            currentItemIndex = potentialPrevItems[potentialPrevItems.length - 1].index;
        } else {
            // Уже в начале маршрута
            return;
        }
    } else {
        // Обычная навигация без маршрута
        if (currentItemIndex > 0) {
            currentItemIndex--;
        } else {
            return;
        }
    }
    
    updateCurrentItemView();
    updateStats(); // Обновляем статистику при переходе
    updateNavigation();
    updateNextItems();
    updateItemsList();
}

// Переход к следующему товару
function goToNextItem() {
    const currentOrder = getCurrentOrder();
    if (!currentOrder) return;

    if (Object.keys(currentRoute).length > 0) {
        const currentItem = currentOrder.items[currentItemIndex];
        const currentItemPriority = currentRoute[currentItem.category || 'Без категории'] || Number.MAX_SAFE_INTEGER;

        const potentialNextItems = [];
        for (let i = 0; i < currentOrder.items.length; i++) {
            const item = currentOrder.items[i];
            const itemPriority = currentRoute[item.category || 'Без категории'] || Number.MAX_SAFE_INTEGER;

            if (itemPriority > currentItemPriority || (itemPriority === currentItemPriority && i > currentItemIndex)) {
                potentialNextItems.push({ index: i, priority: itemPriority });
            }
        }

        if (potentialNextItems.length > 0) {
            // Сортируем, чтобы найти ближайший следующий элемент
            potentialNextItems.sort((a, b) => {
                if (a.priority !== b.priority) {
                    return a.priority - b.priority;
                }
                return a.index - b.index;
            });
            currentItemIndex = potentialNextItems[0].index;
        } else {
            // Уже в конце маршрута
            return;
        }
    } else {
        // Обычная навигация без маршрута
        if (currentItemIndex < currentOrder.items.length - 1) {
            currentItemIndex++;
        } else {
            return;
        }
    }
    
    updateCurrentItemView();
    updateStats(); // Обновляем статистику при переходе
    updateNavigation();
    updateNextItems();
    updateItemsList();
}

// Переключение состояния "собрано"
function toggleCollected() {
    const currentOrder = getCurrentOrder();
    if (!currentOrder || !currentOrder.items || currentItemIndex >= currentOrder.items.length) return;
    
    const currentItem = currentOrder.items[currentItemIndex];
    currentItem.collected = !currentItem.collected;
    
    // Обновляем интерфейс
    updateCurrentItemView();
    updateStats();
    updateNavigation();
    updateItemsList();
    updateNextItems();
    
    // Сохраняем изменения
    saveOrdersToStorage();
    
    // Убрано уведомление о собранной позиции
    
    updateManualRouteBtnStatus();
    
    // Если товар отмечен как собранный, переходим к следующему
    if (currentItem.collected) {
        const nextIndex = findNextUncollectedItem();
        if (nextIndex !== -1 && nextIndex !== currentItemIndex) {
            currentItemIndex = nextIndex;
            updateCurrentItemView();
            updateStats(); // Обновляем статистику при переходе к новой позиции
            updateNavigation();
            updateNextItems();
            updateItemsList();
        }
    }
}

// Поиск следующего несобранного товара
function findNextUncollectedItem() {
    const currentOrder = getCurrentOrder();
    if (!currentOrder) return -1;
    
    // Если есть активный маршрут, используем приоритет категорий
    if (Object.keys(currentRoute).length > 0) {
        // Получаем текущую категорию и её приоритет
        const currentItem = currentOrder.items[currentItemIndex];
        const currentCategory = currentItem.category || 'Без категории';
        const currentPriority = currentRoute[currentCategory] || Number.MAX_SAFE_INTEGER;
        
        // 1. Сначала ищем несобранные товары в текущей категории после текущего индекса
        for (let i = currentItemIndex + 1; i < currentOrder.items.length; i++) {
            const item = currentOrder.items[i];
            const itemCategory = item.category || 'Без категории';
            
            // Если нашли несобранный товар в той же категории - возвращаем его
            if (!item.collected && itemCategory === currentCategory) {
                return i;
            }
        }
        
        // 2. Проверяем, остались ли в текущей категории еще несобранные товары (до текущего)
        for (let i = 0; i < currentItemIndex; i++) {
            const item = currentOrder.items[i];
            const itemCategory = item.category || 'Без категории';
            
            // Если нашли несобранный товар в той же категории - возвращаем его
            if (!item.collected && itemCategory === currentCategory) {
                return i;
            }
        }
        
        // 3. Если в текущей категории все собрано, ищем следующую по приоритету категорию
        // Сначала создаем массив категорий с их приоритетами
        const categories = {};
        
        // Собираем все категории и вычисляем статистику по каждой
        for (let i = 0; i < currentOrder.items.length; i++) {
            const item = currentOrder.items[i];
            const category = item.category || 'Без категории';
            const priority = currentRoute[category] || Number.MAX_SAFE_INTEGER;
            
            if (!categories[category]) {
                categories[category] = {
                    priority: priority,
                    totalItems: 0,
                    uncollectedItems: 0,
                    indices: []
                };
            }
            
            categories[category].totalItems++;
            if (!item.collected) {
                categories[category].uncollectedItems++;
                categories[category].indices.push(i);
            }
        }
        
        // Преобразуем в массив и сортируем по приоритету
        const sortedCategories = Object.keys(categories)
            .map(category => ({
                name: category,
                ...categories[category]
            }))
            .filter(cat => cat.uncollectedItems > 0) // Только с несобранными товарами
            .sort((a, b) => a.priority - b.priority);
            
        // Ищем категорию с более высоким приоритетом (меньшее число)
        let nextCategory = null;
        for (const cat of sortedCategories) {
            if (cat.priority > currentPriority && cat.uncollectedItems > 0) {
                nextCategory = cat;
                break;
            }
        }
        
        // Если не нашли категорию с более высоким приоритетом, берем категорию с самым высоким приоритетом
        if (!nextCategory && sortedCategories.length > 0) {
            nextCategory = sortedCategories[0];
        }
        
        // Если нашли подходящую категорию, возвращаем первый несобранный товар в ней
        if (nextCategory && nextCategory.indices.length > 0) {
            return nextCategory.indices[0];
        }
        
        return -1;
    } else {
        // Если маршрута нет, используем обычную навигацию
        // Сначала ищем среди оставшихся товаров
        for (let i = currentItemIndex + 1; i < currentOrder.items.length; i++) {
            if (!currentOrder.items[i].collected) {
                return i;
            }
        }
        
        // Если не нашли, ищем с начала
        for (let i = 0; i < currentItemIndex; i++) {
            if (!currentOrder.items[i].collected) {
                return i;
            }
        }
    }
    
    // Если все собраны, остаемся на текущем
    return -1;
}

// Показать модальное окно для изменения количества
function showQuantityModal() {
    const currentOrder = getCurrentOrder();
    if (!currentOrder || !currentOrder.items.length) return;
    
    const currentItem = currentOrder.items[currentItemIndex];
    
    // Устанавливаем название товара
    quantityItemNameEl.textContent = currentItem.name;
    
    // Устанавливаем текущее количество
    newQuantityInput.value = currentItem.quantity.toString();
    
    // Показываем модальное окно
    quantityModal.classList.add('active');
    document.body.classList.add('modal-open');
}

// Скрыть модальное окно изменения количества
function hideQuantityModal() {
    quantityModal.classList.remove('active');
    document.body.classList.remove('modal-open');
}

// Обновление количества товара
function updateQuantity() {
    const currentOrder = getCurrentOrder();
    if (!currentOrder || !currentOrder.items.length) return;
    const currentItem = currentOrder.items[currentItemIndex];
    let newQty;
    try {
        const inputValue = newQuantityInput.value.replace(',', '.');
        newQty = parseFloat(inputValue);
    } catch (e) {
        newQty = NaN;
    }
    if (isNaN(newQty) || newQty < 0) {
        showToast('Пожалуйста, введите корректное количество', 'error');
        return;
    }
    newQty = Math.round(newQty * 1000) / 1000;
    
    // Проверяем, не пытается ли пользователь установить то же количество
    if (newQty === currentItem.quantity) {
        hideQuantityModal();
        return;
    }
    
    // Если количество отличается от исходного
    if (newQty !== currentItem.originalQuantity) {
        // Если товар еще не был изменен, сохраняем исходное количество
        if (!currentItem.modified) {
            currentItem.originalQuantity = currentItem.quantity;
        }
        currentItem.quantity = newQty;
        currentItem.modified = true;
        if (!currentItem.collected) {
            currentItem.collected = true;
            currentItem.collectedAt = new Date().toISOString();
        }
        // Убрано уведомление об измененном количестве
    } else {
        // Если вернули исходное количество
        currentItem.quantity = newQty;
        currentItem.modified = false;
        if (!currentItem.collected) {
            currentItem.collected = true;
            currentItem.collectedAt = new Date().toISOString();
        }
        // Убрано уведомление о возвращении к исходному количеству
    }
    updateCurrentItemView();
    updateItemsList();
    updateStats();
    updateNavigation();
    updateNextItems();
    saveOrdersToStorage();
    updateManualRouteBtnStatus();
    hideQuantityModal();
    
    // Переходим к следующему товару после изменения количества
    const nextIndex = findNextUncollectedItem();
    if (nextIndex !== -1 && nextIndex !== currentItemIndex) {
        currentItemIndex = nextIndex;
        updateCurrentItemView();
        updateStats(); // Обновляем статистику при переходе к новой позиции
        updateNavigation();
        updateNextItems();
        updateItemsList();
    }
}

// Показать информацию о заказе
function showOrderInfo() {
    const currentOrder = getCurrentOrder();
    if (!currentOrder) return;
    orderDetailsEl.innerHTML = `
        <p><strong>Номер заказа:</strong> ${currentOrder.id || 'Без номера'}</p>
        <h3>Модифицированные товары:</h3>
        <ul class="modified-items-list">
            ${getModifiedItemsList()}
        </ul>
    `;
    orderInfoModal.classList.add('active');
}

// Получение списка модифицированных товаров
function getModifiedItemsList() {
    const currentOrder = getCurrentOrder();
    if (!currentOrder) return '';
    
    const modifiedItems = currentOrder.items.filter(item => item.modified);
    if (modifiedItems.length === 0) {
        return '<li>Нет модифицированных товаров</li>';
    }
    
    return modifiedItems.map(item => `
        <li>
            ${item.name}: ${item.originalQuantity} → ${item.quantity}
        </li>
    `).join('');
}

// Скрыть информацию о заказе
function hideOrderInfo() {
    orderInfoModal.classList.remove('active');
}

// Скролл к текущему товару в списке
function scrollToCurrentItem() {
    const currentOrder = getCurrentOrder();
    if (!currentOrder) return;
    
    const selectedItem = document.querySelector('.item-card.selected');
    if (selectedItem) {
        selectedItem.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
}

// Обновление отображения следующих двух позиций
function updateNextItems() {
    const currentOrder = getCurrentOrder();
    const nextItemsContainer = document.querySelector('.next-items-list');
    
    if (!currentOrder || !currentOrder.items.length) {
        document.getElementById('nextItems').style.display = 'none';
        return;
    }
    
    // Показываем контейнер
    document.getElementById('nextItems').style.display = 'block';
    
    // Очищаем контейнер
    nextItemsContainer.innerHTML = '';
    
    // Находим следующие две несобранные позиции
    let nextItems = [];
    let nextItemIndices = [];
    
    // Если есть активный маршрут, используем приоритет категорий
    if (Object.keys(currentRoute).length > 0) {
        // Создаем массив несобранных товаров с их приоритетами, исключая текущий товар
        const uncollectedItems = currentOrder.items
            .map((item, index) => ({ item, index, priority: item.categoryPriority || Number.MAX_SAFE_INTEGER }))
            .filter(({ item, index }) => !item.collected && index !== currentItemIndex)
            .sort((a, b) => a.priority - b.priority);
        
        // Берем первые два элемента
        for (let i = 0; i < Math.min(2, uncollectedItems.length); i++) {
            nextItems.push(uncollectedItems[i].item);
            nextItemIndices.push(uncollectedItems[i].index);
        }
    } else {
        // Если маршрута нет, используем обычную навигацию
        let count = 0;
        
        // Начинаем поиск со следующей позиции после текущей
        for (let i = currentItemIndex + 1; i < currentOrder.items.length && count < 2; i++) {
            if (!currentOrder.items[i].collected) {
                nextItems.push(currentOrder.items[i]);
                nextItemIndices.push(i);
                count++;
            }
        }
        
        // Если не нашли две позиции, ищем с начала списка
        if (count < 2) {
            for (let i = 0; i < currentItemIndex && count < 2; i++) {
                if (!currentOrder.items[i].collected) {
                    nextItems.push(currentOrder.items[i]);
                    nextItemIndices.push(i);
                    count++;
                }
            }
        }
    }
    
    // Если нет следующих позиций, скрываем контейнер
    if (nextItems.length === 0) {
        document.getElementById('nextItems').style.display = 'none';
        return;
    }
    
    // Добавляем следующие позиции в контейнер
    nextItems.forEach((item, index) => {
        // Убираем отображение единиц измерения, оставляем только число
        // const unitDisplay = item.unit ? ` ${item.unit}` : '';
        
        const nextItemCard = document.createElement('div');
        nextItemCard.className = 'next-item-card';
        nextItemCard.innerHTML = `
            <div class="next-item-name">${item.name}</div>
            <div class="next-item-quantity">${item.quantity}</div>
        `;
        
        // Добавляем обработчик клика для перехода к этой позиции
        nextItemCard.addEventListener('click', () => {
            currentItemIndex = nextItemIndices[index];
            updateCurrentItemView();
            updateStats(); // Обновляем статистику при переходе
            updateNavigation();
            updateNextItems();
            scrollToCurrentItem();
        });
        
        nextItemsContainer.appendChild(nextItemCard);
    });
}

// Функция для генерации случайного цвета для категории
function generateCategoryColor(categoryName) {
    // Если цвет уже сгенерирован, возвращаем его
    if (categoryColors[categoryName]) {
        return categoryColors[categoryName];
    }
    // Предопределенные приятные цвета для категорий
    const colorPalette = [
        '#4CAF50', // зеленый
        '#2196F3', // синий
        '#FF9800', // оранжевый
        '#9C27B0', // фиолетовый
        '#F44336', // красный
        '#009688', // бирюзовый
        '#673AB7', // темно-фиолетовый
        '#3F51B5', // индиго
        '#795548', // коричневый
        '#607D8B', // серо-синий
        '#E91E63', // розовый
        '#CDDC39', // лайм
    ];
    // Собираем уже занятые цвета
    const usedColors = Object.values(categoryColors);
    // Ищем первый свободный цвет из палитры
    let color = colorPalette.find(c => !usedColors.includes(c));
    // Если все цвета заняты, генерируем новый уникальный HSL-цвет
    if (!color) {
        // Генерируем цвет на основе количества категорий (чтобы не было повторов)
        const hue = (Object.keys(categoryColors).length * 47) % 360;
        color = `hsl(${hue}, 70%, 55%)`;
    }
    // Сохраняем цвет для категории
    categoryColors[categoryName] = color;
    return color;
}

// Функция для сохранения цветов категорий
function saveCategoryColors() {
    localStorage.setItem('categoryColors', JSON.stringify(categoryColors));
}

// Функция для загрузки цветов категорий
function loadCategoryColors() {
    const savedColors = localStorage.getItem('categoryColors');
    if (savedColors) {
        categoryColors = JSON.parse(savedColors);
    }
}

// --- Загрузка и сохранение всех заказов ---
function saveOrdersToStorage() {
    localStorage.setItem('orders', JSON.stringify(orders));
    localStorage.setItem('currentOrderIndex', currentOrderIndex.toString());
    localStorage.setItem('currentItemIndex', currentItemIndex.toString());
}

function loadOrdersFromStorage() {
    const storedOrders = localStorage.getItem('orders');
    if (storedOrders) {
        try {
            orders = JSON.parse(storedOrders);
            currentOrderIndex = parseInt(localStorage.getItem('currentOrderIndex') || '0');
            currentItemIndex = parseInt(localStorage.getItem('currentItemIndex') || '0');
            
            if (isNaN(currentOrderIndex) || currentOrderIndex < 0 || currentOrderIndex >= orders.length) {
                currentOrderIndex = 0;
            }
            if (isNaN(currentItemIndex) || currentItemIndex < 0 || currentItemIndex >= (orders[currentOrderIndex]?.items.length || 0)) {
                currentItemIndex = 0;
            }

        } catch (e) {
            orders = [];
            currentOrderIndex = 0;
            currentItemIndex = 0;
        }
    }
    
    // Применяем маршрут к текущему заказу после загрузки
    const currentOrder = getCurrentOrder();
    if (currentOrder && currentOrder.items && Object.keys(currentRoute).length > 0) {
        applyRouteToCurrentOrder();
    }
}

// --- UI обновление для мультизаказов ---
function updateOrdersListUI() {
    if (!ordersListEl) return;
    ordersListEl.innerHTML = '';
    
    // Обновляем счетчик заказов
    if (ordersCountEl) {
        const count = orders.length;
        ordersCountEl.textContent = `${count} ${count === 1 ? 'заказ' : count < 5 ? 'заказа' : 'заказов'}`;
    }
    
    // Показываем/скрываем пустое состояние
    if (emptyOrdersEl) {
        emptyOrdersEl.style.display = orders.length === 0 ? 'flex' : 'none';
    }
    
    // Обновляем состояние кнопок действий
    if (clearAllBtn) {
        clearAllBtn.disabled = orders.length === 0;
    }
    
    if (startWorkBtn) {
        startWorkBtn.disabled = orders.length === 0;
    }
    
    if (!orders.length) {
        return;
    }
    
    orders.forEach((order, idx) => {
        const div = document.createElement('div');
        div.className = 'order-list-item' + (idx === currentOrderIndex ? ' active' : '');
        
        // Подсчитываем статистику заказа
        const totalItems = order.items ? order.items.length : 0;
        const collectedItems = order.items ? order.items.filter(item => item.collected).length : 0;
        const progress = totalItems > 0 ? Math.round((collectedItems / totalItems) * 100) : 0;
        
        div.innerHTML = `
            <div class="order-list-main">
                <span class="order-list-title">${order.id || 'Без номера'}</span>
                <span class="order-list-date">${order.createdAt ? new Date(order.createdAt).toLocaleDateString() : ''}</span>
                <span class="order-list-count">${totalItems} позиций • ${collectedItems}/${totalItems} собрано</span>
                <div class="order-progress">
                    <div class="order-progress-bar">
                        <div class="order-progress-fill" style="width: ${progress}%"></div>
                    </div>
                    <span class="order-progress-text">${progress}%</span>
                </div>
            </div>
            <div class="order-list-actions">
                <button class="make-active-btn" title="Сделать активным" ${idx === currentOrderIndex ? 'disabled' : ''}><i class="fas fa-check"></i></button>
                <button class="delete-order-btn" title="Удалить заказ"><i class="fas fa-trash"></i></button>
            </div>
        `;
        
        // Клик по основной части — сделать активным
        div.querySelector('.order-list-main').addEventListener('click', () => {
            if (currentOrderIndex !== idx) {
                currentOrderIndex = idx;
                // Применяем маршрут к новому активному заказу
                const currentOrder = getCurrentOrder();
                if (currentOrder && currentOrder.items && Object.keys(currentRoute).length > 0) {
                    applyRouteToCurrentOrder();
                }
                updateUI();
                updateOrdersListUI();
                saveOrdersToStorage();
                hideLoadOrderModal();
            }
        });
        
        // Кнопка "Сделать активным"
        div.querySelector('.make-active-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            if (currentOrderIndex !== idx) {
                currentOrderIndex = idx;
                // Применяем маршрут к новому активному заказу
                const currentOrder = getCurrentOrder();
                if (currentOrder && currentOrder.items && Object.keys(currentRoute).length > 0) {
                    applyRouteToCurrentOrder();
                }
                updateUI();
                updateOrdersListUI();
                saveOrdersToStorage();
                hideLoadOrderModal();
            }
        });
        
        // Кнопка "Удалить"
        div.querySelector('.delete-order-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            if (confirm('Удалить этот заказ?')) {
                orders.splice(idx, 1);
                if (currentOrderIndex >= orders.length) currentOrderIndex = orders.length - 1;
                // Очищаем маршрут, если удаляем активный заказ
                if (idx === currentOrderIndex) {
                    currentRoute = {};
                    localStorage.removeItem('manualRoute');
                }
                updateUI();
                updateOrdersListUI();
                saveOrdersToStorage();
            }
        });
        
        ordersListEl.appendChild(div);
    });
}

// --- Функции для работы с прогрессом загрузки ---
function showUploadProgress() {
    if (uploadProgress) {
        uploadProgress.style.display = 'block';
        progressFill.style.width = '0%';
        progressText.textContent = 'Подготовка...';
    }
}

function updateUploadProgress(processed, total) {
    if (uploadProgress && progressFill && progressText) {
        const percentage = Math.round((processed / total) * 100);
        progressFill.style.width = `${percentage}%`;
        progressText.textContent = `Обработано ${processed} из ${total} файлов`;
    }
}

function hideUploadProgress() {
    if (uploadProgress) {
        setTimeout(() => {
            uploadProgress.style.display = 'none';
        }, 1000);
    }
}

// --- Дополнительные функции для новых кнопок ---
function clearAllOrders() {
    if (orders.length === 0) return;
    
    if (confirm('Удалить все загруженные заказы?')) {
        orders = [];
        currentOrderIndex = 0;
        // Очищаем маршрут при удалении всех заказов
        currentRoute = {};
        localStorage.removeItem('manualRoute');
        updateUI();
        updateOrdersListUI();
        saveOrdersToStorage();
        showToast('Все заказы удалены', 'info');
    }
}

function startWork() {
    if (orders.length === 0) return;
    
    hideLoadOrderModal();
    showToast('Начинаем работу с заказами', 'success');
    
    // Фокусируемся на первом заказе
    if (currentOrderIndex === -1 && orders.length > 0) {
        currentOrderIndex = 0;
    }
    
    // Если есть активный маршрут, применяем его к текущему заказу
    const currentOrder = getCurrentOrder();
    if (currentOrder && currentOrder.items && Object.keys(currentRoute).length > 0) {
        applyRouteToCurrentOrder();
    }
    
    // Обновляем текущий товар в первую очередь
    updateCurrentItemView();
    
    // Обновляем только необходимые элементы интерфейса, без автоматического скроллинга
    updateStats();
    updateNavigation();
    updateNextItems();
    
    // Обновляем список товаров без прокрутки к текущему элементу
    updateItemsList();
    
    // Обновляем список заказов
    updateOrdersListUI();
    saveOrdersToStorage();
}

// --- Переопределяем функции для работы с выбранным заказом ---
function getCurrentOrder() {
    return orders[currentOrderIndex] || null;
}

// === ФУНКЦИИ ДЛЯ СИСТЕМЫ МАРШРУТА ===

// Переменная для хранения текущего маршрута
let currentRoute = {};

// Показать модальное окно ручного маршрута
function showManualRouteModal() {
    const currentOrder = getCurrentOrder();
    if (!currentOrder || !currentOrder.items || currentOrder.items.length === 0) {
        showToast('Сначала загрузите заказ', 'warning');
        return;
    }
    
    // Получаем уникальные категории из заказа и их количество,
    // сохраняя порядок их первого появления в заказе
    const categoriesMap = {};
    const categoryOrder = [];
    
    currentOrder.items.forEach(item => {
        if (item.category) {
            if (!categoriesMap[item.category]) {
                categoriesMap[item.category] = {
                    count: 0,
                    priority: currentRoute[item.category] || 0
                };
                categoryOrder.push(item.category);
            }
            categoriesMap[item.category].count++;
        }
    });
    
    // Преобразуем в массив, сохраняя исходный порядок из заказа
    const categories = categoryOrder.map(category => ({
        name: category,
        count: categoriesMap[category].count,
        priority: categoriesMap[category].priority
    }));
    
    // Обновляем список категорий в модальном окне
    manualRouteCategoryList.innerHTML = '';
    categories.forEach(category => {
        const div = document.createElement('div');
        let divClasses = 'manual-route-item' + (category.priority ? ' selected' : '');
        
        // Проверяем, есть ли тяжелые товары в категории
        const categoryItems = currentOrder.items.filter(item => item.category === category.name);
        const hasHeavyItem = categoryItems.some(item => item.weight !== undefined && item.weight > 50);
        if (hasHeavyItem) {
            divClasses += ' heavy-item-text';
        }
        
        div.className = divClasses;
        div.dataset.category = category.name;
        
        const priorityBadge = document.createElement('span');
        priorityBadge.className = 'priority-badge';
        priorityBadge.textContent = category.priority || '';
        
        const categoryName = document.createElement('span');
        categoryName.className = 'category-name';
        categoryName.textContent = category.name;
        
        const itemCount = document.createElement('span');
        itemCount.className = 'item-count';
        itemCount.textContent = `${category.count} поз.`;
        
        div.appendChild(priorityBadge);
        div.appendChild(categoryName);
        div.appendChild(itemCount);
        
        div.addEventListener('click', () => toggleCategoryPriority(category.name));
        
        // Добавляем поддержку drag and drop
        div.draggable = true;
        div.addEventListener('dragstart', handleDragStart);
        div.addEventListener('dragover', handleDragOver);
        div.addEventListener('drop', handleDrop);
        div.addEventListener('dragend', handleDragEnd);
        
        manualRouteCategoryList.appendChild(div);
    });
    
    // Показываем модальное окно
    manualRouteModal.classList.add('active');
    document.body.classList.add('modal-open');
}

// Скрыть модальное окно ручного маршрута
function hideManualRouteModal() {
    manualRouteModal.classList.remove('active');
    document.body.classList.remove('modal-open');
}

// Переключить приоритет категории
function toggleCategoryPriority(categoryName) {
    const items = manualRouteCategoryList.querySelectorAll('.manual-route-item');
    
    // Находим элемент категории
    let targetItem;
    items.forEach(item => {
        if (item.dataset.category === categoryName) {
            targetItem = item;
        }
    });
    
    if (!targetItem) return;
    
    const priorityBadge = targetItem.querySelector('.priority-badge');
    
    // Если у категории уже есть приоритет, удаляем его и сдвигаем остальные
    if (currentRoute[categoryName]) {
        const removedPriority = currentRoute[categoryName];
        delete currentRoute[categoryName];
        // Сдвигаем все приоритеты выше удалённого вниз
        Object.keys(currentRoute).forEach(cat => {
            if (currentRoute[cat] > removedPriority) {
                currentRoute[cat]--;
            }
        });
        targetItem.classList.remove('selected');
        priorityBadge.textContent = '';
    } else {
        // Находим максимальный приоритет
        let maxPriority = 0;
        Object.values(currentRoute).forEach(priority => {
            if (priority > maxPriority) maxPriority = priority;
        });
        // Устанавливаем следующий приоритет
        currentRoute[categoryName] = maxPriority + 1;
        targetItem.classList.add('selected');
        priorityBadge.textContent = currentRoute[categoryName];
    }
    
    // Обновляем визуальное представление
    updatePriorityBadges();
}

// Сбросить ручной маршрут
function resetManualRoute() {
    currentRoute = {};
    
    // Очищаем приоритеты категорий из товаров
    const currentOrder = getCurrentOrder();
    if (currentOrder && currentOrder.items) {
        currentOrder.items.forEach(item => {
            delete item.categoryPriority;
        });
        saveOrdersToStorage();
    }
    
    const items = manualRouteCategoryList.querySelectorAll('.manual-route-item');
    items.forEach(item => {
        item.classList.remove('selected');
        const priorityBadge = item.querySelector('.priority-badge');
        if (priorityBadge) priorityBadge.textContent = '';
    });
    
    // Показываем уведомление
    showToast('Порядок маршрута сброшен', 'info');
    
    updateManualRouteBtnStatus();
}

// Сохранить ручной маршрут
function saveManualRoute() {
    // Сохраняем маршрут в localStorage
    localStorage.setItem('manualRoute', JSON.stringify(currentRoute));
    
    // Применяем маршрут к текущему заказу
    applyRouteToCurrentOrder();
    
    // Скрываем модальное окно
    hideManualRouteModal();
    
    // Обновляем текущий товар в первую очередь
    updateCurrentItemView();
    
    // Обновляем только необходимые элементы интерфейса, без автоматического скроллинга
    updateStats();
    updateNavigation();
    updateNextItems();
    
    // Обновляем список товаров без прокрутки к текущему элементу
    updateItemsList();
    
    // Показываем уведомление
    showToast('Маршрут сохранен и применен', 'success');
    
    updateManualRouteBtnStatus();
}

// Применить маршрут к текущему заказу
function applyRouteToCurrentOrder() {
    const currentOrder = getCurrentOrder();
    if (!currentOrder || !currentOrder.items) return;
    
    // Сохраняем исходный порядок товаров
    const originalItems = [...currentOrder.items];
    
    // Добавляем информацию о приоритете категории к каждому товару
    // НЕ изменяем порядок товаров, только добавляем метаданные
    currentOrder.items.forEach(item => {
        const category = item.category || 'Без категории';
        item.categoryPriority = currentRoute[category] || Number.MAX_SAFE_INTEGER;
    });
    
    // Если есть категории с приоритетом, находим первый товар из категории с наивысшим приоритетом (наименьшим значением)
    if (Object.keys(currentRoute).length > 0) {
        // Находим категорию с наивысшим приоритетом (наименьшее число)
        let highestPriorityCategory = '';
        let highestPriority = Number.MAX_SAFE_INTEGER;
        
        Object.keys(currentRoute).forEach(category => {
            if (currentRoute[category] < highestPriority) {
                highestPriority = currentRoute[category];
                highestPriorityCategory = category;
            }
        });
        
        // Если нашли категорию с наивысшим приоритетом, ищем первый товар из этой категории
        if (highestPriorityCategory) {
            let foundUncollectedItem = false;
            
            // Сначала ищем несобранный товар из приоритетной категории
            for (let i = 0; i < currentOrder.items.length; i++) {
                const itemCategory = currentOrder.items[i].category || 'Без категории';
                if (itemCategory === highestPriorityCategory && !currentOrder.items[i].collected) {
                    // Устанавливаем текущим элементом первый несобранный товар из приоритетной категории
                    currentItemIndex = i;
                    foundUncollectedItem = true;
                    break;
                }
            }
            
            // Если не нашли несобранных товаров, берем просто первый товар из категории
            if (!foundUncollectedItem) {
                for (let i = 0; i < currentOrder.items.length; i++) {
                    const itemCategory = currentOrder.items[i].category || 'Без категории';
                    if (itemCategory === highestPriorityCategory) {
                        currentItemIndex = i;
                        break;
                    }
                }
            }
        }
    }
    
    // Сохраняем изменения
    saveOrdersToStorage();
}

// Загрузить маршрут из localStorage
function loadManualRoute() {
    const savedRoute = localStorage.getItem('manualRoute');
    if (savedRoute) {
        try {
            currentRoute = JSON.parse(savedRoute);
        } catch (e) {
            currentRoute = {};
        }
    }
    // Логика применения маршрута перенесена в init()
    updateManualRouteBtnStatus();
}

// Обновить индикатор статуса маршрута
function updateRouteStatusIndicator() {
    // if (!routeStatusIndicator) return; // Удалено
    
    const currentOrder = getCurrentOrder();
    if (!currentOrder || !currentOrder.items || Object.keys(currentRoute).length === 0) {
        // routeStatusIndicator.style.display = 'none'; // Удалено
        return;
    }
    
    // Проверяем, все ли позиции в маршруте собраны
    const routeCategories = Object.keys(currentRoute);
    let allCollected = true;
    
    for (const category of routeCategories) {
        const categoryItems = currentOrder.items.filter(item => item.category === category);
        const hasUncollected = categoryItems.some(item => !item.collected);
        
        if (hasUncollected) {
            allCollected = false;
            break;
        }
    }
    
    // Показываем индикатор с соответствующим цветом
    // routeStatusIndicator.style.display = 'flex'; // Удалено
    // routeStatusIndicator.className = 'route-status-indicator ' + (allCollected ? 'completed' : 'active'); // Удалено
    
    // Обновляем иконку
    // const icon = routeStatusIndicator.querySelector('i'); // Удалено
    // icon.className = allCollected ? 'fas fa-check-circle' : 'fas fa-route'; // Удалено
}

// Обновить бейджи с приоритетами
function updatePriorityBadges() {
    const items = manualRouteCategoryList.querySelectorAll('.manual-route-item');
    items.forEach(item => {
        const category = item.dataset.category;
        const priorityBadge = item.querySelector('.priority-badge');
        
        if (currentRoute[category]) {
            item.classList.add('selected');
            priorityBadge.textContent = currentRoute[category];
        } else {
            item.classList.remove('selected');
            priorityBadge.textContent = '';
        }
    });
}

// Функции для поддержки drag and drop
let draggedItem = null;

function handleDragStart(e) {
    draggedItem = this;
    setTimeout(() => this.classList.add('dragging'), 0);
    e.dataTransfer.effectAllowed = 'move';
}

function handleDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    
    const item = e.target.closest('.manual-route-item');
    if (item && item !== draggedItem) {
        item.classList.add('drag-over');
    }
}

function handleDrop(e) {
    e.preventDefault();
    e.stopPropagation();
    
    const dropTarget = e.target.closest('.manual-route-item');
    if (!dropTarget || dropTarget === draggedItem) return;
    
    const categoryA = draggedItem.dataset.category;
    const categoryB = dropTarget.dataset.category;
    
    // Если оба элемента имеют приоритет, меняем их местами
    if (currentRoute[categoryA] && currentRoute[categoryB]) {
        const tempPriority = currentRoute[categoryA];
        currentRoute[categoryA] = currentRoute[categoryB];
        currentRoute[categoryB] = tempPriority;
    } 
    // Если только перетаскиваемый элемент имеет приоритет
    else if (currentRoute[categoryA] && !currentRoute[categoryB]) {
        currentRoute[categoryB] = currentRoute[categoryA];
        delete currentRoute[categoryA];
    }
    // Если только целевой элемент имеет приоритет
    else if (!currentRoute[categoryA] && currentRoute[categoryB]) {
        currentRoute[categoryA] = currentRoute[categoryB];
        delete currentRoute[categoryB];
    }
    
    // Обновляем визуальное отображение
    updatePriorityBadges();
    
    dropTarget.classList.remove('drag-over');
}

function handleDragEnd() {
    this.classList.remove('dragging');
    const items = manualRouteCategoryList.querySelectorAll('.manual-route-item');
    items.forEach(item => item.classList.remove('drag-over'));
    draggedItem = null;
}

// Обновить статус кнопки ручного маршрута
function updateManualRouteBtnStatus() {
    if (!manualRouteBtn) return;
    const icon = manualRouteBtn.querySelector('i');
    const currentOrder = getCurrentOrder();
    if (!currentOrder || !currentOrder.items || Object.keys(currentRoute).length === 0) {
        manualRouteBtn.classList.remove('route-active', 'route-completed');
        icon.className = 'fas fa-list-ol';
        return;
    }
    // Проверяем, все ли позиции в маршруте собраны
    const routeCategories = Object.keys(currentRoute);
    let allCollected = true;
    for (const category of routeCategories) {
        const categoryItems = currentOrder.items.filter(item => item.category === category);
        const hasUncollected = categoryItems.some(item => !item.collected);
        if (hasUncollected) {
            allCollected = false;
            break;
        }
    }
    if (allCollected) {
        manualRouteBtn.classList.remove('route-active');
        manualRouteBtn.classList.add('route-completed');
        icon.className = 'fas fa-check-circle';
    } else {
        manualRouteBtn.classList.remove('route-completed');
        manualRouteBtn.classList.add('route-active');
        icon.className = 'fas fa-route';
    }
}

// Вызовы в нужных местах:
// После updateUI, saveManualRoute, resetManualRoute, toggleCollected, loadManualRoute

// Инициализация приложения после загрузки DOM
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM загружен, инициализация приложения...');
    
    // Проверяем наличие библиотеки XLSX
    if (typeof XLSX === 'undefined') {
        console.error('Библиотека XLSX не загружена!');
        showToast('Ошибка: библиотека для работы с Excel не загружена. Проверьте подключение к интернету.', 'error');
    } else {
        console.log('Библиотека XLSX успешно загружена, версия:', XLSX.version);
    }
    
    loadOrdersFromStorage();
    init();
    
    // Применяем маршрут к текущему заказу после загрузки
    const currentOrder = getCurrentOrder();
    if (currentOrder && currentOrder.items && Object.keys(currentRoute).length > 0) {
        applyRouteToCurrentOrder();
    }
    
    updateUI();
    updateOrdersListUI();
});

// --- Обработчики для мультизагрузки ---
// Обработчики уже добавлены в функции init()



