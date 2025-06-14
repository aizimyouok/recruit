import { appState, config } from './state.js';
import { calculateCoreStats, filterDataByPeriod, sortData } from './logic.js';

// ===================================================================================
// 테마 및 페이지 레이아웃 관리
// ===================================================================================

export function initializeTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);
}

export function toggleTheme() {
    const newTheme = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeIcon(newTheme);
}

function updateThemeIcon(theme) {
    const icon = document.getElementById('themeIcon');
    if (icon) icon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
}

export function toggleMobileMenu() {
    document.getElementById('sidebar').classList.toggle('mobile-open');
    document.querySelector('.mobile-overlay').classList.toggle('show');
}

export function switchPage(pageId) {
    document.querySelectorAll('.page').forEach(p => {
        p.style.display = p.id === pageId ? 'block' : 'none';
    });
    document.querySelectorAll('.nav-item').forEach(b => {
        b.classList.toggle('active', b.dataset.page === pageId);
    });
    document.getElementById('pageTitle').textContent = { dashboard: '지원자 현황', stats: '통계 분석' }[pageId] || '대시보드';
}

// ===================================================================================
// 로딩 및 에러 표시
// ===================================================================================

export function showLoadingIndicator(show) {
    const container = document.getElementById('tableView');
    if (!container) return;
    if (show) {
        container.innerHTML = `<div class="smooth-loading-container"><div class="advanced-loading-spinner"></div><div class="loading-text">데이터를 불러오는 중입니다...</div></div>`;
    } else {
        container.innerHTML = '';
    }
}

export function showErrorIndicator(message) {
    const container = document.getElementById('tableView');
    if (!container) return;
    container.innerHTML = `<div class="error-container"><i class="fas fa-exclamation-triangle error-icon"></i><h3>오류 발생</h3><p class="error-message">${message}</p><button id="retryFetchBtn" class="primary-btn"><i class="fas fa-sync-alt"></i> 다시 시도</button></div>`;
}

// ===================================================================================
// 메인 콘텐츠 렌더링 (테이블, 카드, 페이지네이션 등)
// ===================================================================================

export function render() {
    const dataForCurrentPage = getCurrentPageData();
    if (appState.ui.currentView === 'table') {
        renderTable(dataForCurrentPage);
    } else {
        renderCards(dataForCurrentPage);
    }
    updatePaginationUI();
    updateSummary();
}

function getCurrentPageData() {
    const { currentPage } = appState.pagination;
    const startIndex = (currentPage - 1) * config.PAGINATION_ITEMS_PER_PAGE;
    const endIndex = Math.min(startIndex + config.PAGINATION_ITEMS_PER_PAGE, appState.filteredData.length);
    return appState.filteredData.slice(startIndex, endIndex);
}

function renderTable(dataToRender) {
    const tableContainer = document.getElementById('tableView');
    tableContainer.innerHTML = '';

    if (appState.filteredData.length === 0 && appState.allApplicantData.length > 0) {
        tableContainer.innerHTML = '<p style="text-align:center; padding: 40px; color: var(--text-secondary);">조건에 맞는 지원자가 없습니다.</p>';
        return;
    }

    const table = document.createElement('table');
    table.className = 'data-table';
    
    const thead = table.createTHead();
    const headerRow = thead.insertRow();
    appState.currentHeaders.forEach(header => {
        if (appState.ui.visibleColumns[header]) {
            const th = document.createElement('th');
            th.className = 'sortable-header';
            th.dataset.column = header;
            let sortIcon = 'fa-sort';
            if (appState.sorting.column === header) {
                sortIcon = appState.sorting.direction === 'asc' ? 'fa-sort-up' : 'fa-sort-down';
            }
            th.innerHTML = `${header} <i class="fas ${sortIcon} sort-icon"></i>`;
            headerRow.appendChild(th);
        }
    });

    const tbody = table.createTBody();
    dataToRender.forEach((rowData, index) => {
        const row = tbody.insertRow();
        const absoluteIndex = (appState.pagination.currentPage - 1) * config.PAGINATION_ITEMS_PER_PAGE + index;
        row.dataset.rowIndex = absoluteIndex;

        appState.currentHeaders.forEach((header, cellIndex) => {
            if (appState.ui.visibleColumns[header]) {
                const cell = row.insertCell();
                let cellData = rowData[cellIndex] || '';
                
                if (header === '구분') cell.textContent = cellData;
                else if (header.includes('날') || header.includes('일')) cell.textContent = formatDate(cellData);
                else if (header === '연락처') cell.innerHTML = `<a href="tel:${cellData.replace(/\D/g, '')}">${cellData}</a>`;
                else {
                    const statusClass = getStatusClass(cellData);
                    if (statusClass) cell.innerHTML = `<span class="status-badge ${statusClass}">${cellData}</span>`;
                    else cell.textContent = cellData;
                }
            }
        });
    });
    
    tableContainer.appendChild(table);
}

function renderCards(dataToRender) {
    const cardsContainer = document.getElementById('cardsView');
    cardsContainer.innerHTML = '';
    
    if (appState.filteredData.length === 0) {
        cardsContainer.innerHTML = '<p style="text-align:center; padding: 40px; grid-column: 1/-1; color: var(--text-secondary);">조건에 맞는 지원자가 없습니다.</p>';
        return;
    }
    
    dataToRender.forEach((rowData, index) => {
        const card = document.createElement('div');
        card.className = 'applicant-card';
        const absoluteIndex = (appState.pagination.currentPage - 1) * config.PAGINATION_ITEMS_PER_PAGE + index;
        card.dataset.rowIndex = absoluteIndex;
        
        const getVal = (header) => rowData[appState.currentHeaders.indexOf(header)] || '-';
        const name = getVal('이름'), phone = getVal('연락처'), route = getVal('지원루트'), position = getVal('모집분야'), date = formatDate(getVal('지원일'));

        card.innerHTML = `<div class="card-header"><div class="card-name">${name}</div><div class="card-sequence">#${getVal('구분')}</div></div><div class="card-info"><div><span class="card-label">연락처:</span> ${phone}</div><div><span class="card-label">지원루트:</span> ${route}</div><div><span class="card-label">모집분야:</span> ${position}</div></div><div class="card-footer"><span>지원일: ${date}</span>${phone !== '-' ? `<a href="tel:${phone.replace(/\D/g, '')}" onclick="event.stopPropagation()"><i class="fas fa-phone"></i></a>` : ''}</div>`;
        cardsContainer.appendChild(card);
    });
}

function updatePaginationUI() {
    const container = document.getElementById('paginationContainer');
    if (appState.filteredData.length === 0) {
        container.style.display = 'none';
        return;
    }
    container.style.display = 'flex';

    const { currentPage, totalPages } = appState.pagination;
    const startItem = (currentPage - 1) * config.PAGINATION_ITEMS_PER_PAGE + 1;
    const endItem = Math.min(currentPage * config.PAGINATION_ITEMS_PER_PAGE, appState.filteredData.length);
    
    document.getElementById('paginationInfo').textContent = `${startItem}-${endItem} / ${appState.filteredData.length}명`;

    ['firstPageBtn', 'prevPageBtn'].forEach(id => document.getElementById(id).disabled = currentPage === 1);
    ['nextPageBtn', 'lastPageBtn'].forEach(id => document.getElementById(id).disabled = currentPage === totalPages);

    const numbersContainer = document.getElementById('paginationNumbers');
    numbersContainer.innerHTML = '';
    const maxVisible = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let endPage = Math.min(totalPages, startPage + maxVisible - 1);
    if (endPage - startPage + 1 < maxVisible) startPage = Math.max(1, endPage - maxVisible + 1);

    if (startPage > 1) {
        numbersContainer.append(createPageButton(1));
        if (startPage > 2) numbersContainer.append(createPageEllipsis());
    }
    for (let i = startPage; i <= endPage; i++) numbersContainer.append(createPageButton(i, i === currentPage));
    if (endPage < totalPages) {
        if (endPage < totalPages - 1) numbersContainer.append(createPageEllipsis());
        numbersContainer.append(createPageButton(totalPages));
    }
}

function createPageButton(page, isActive = false) {
    const btn = document.createElement('button');
    btn.className = `pagination-number ${isActive ? 'active' : ''}`;
    btn.textContent = page;
    btn.dataset.page = page;
    return btn;
}

function createPageEllipsis() {
    const span = document.createElement('span');
    span.className = 'pagination-ellipsis';
    span.textContent = '...';
    return span;
}

function updateSummary() {
    const count = appState.filteredData.length;
    const term = appState.filters.searchTerm;
    document.getElementById('filterSummary').innerHTML = `<strong>지원자:</strong> ${count}명 ${term ? `(검색: "${term}")` : ''}`;
}

export function updateSidebarWidgets() {
    const selected = document.getElementById('sidebarPeriodFilter').value;
    const periodMap = { 'all': 'all', 'year': 'this_year', 'month': 'this_month', 'week': 'this_week', 'custom': 'range' };
    const filters = { mode: periodMap[selected], start: document.getElementById('sidebarStartDate').value, end: document.getElementById('sidebarEndDate').value };
    const data = filterDataByPeriod(appState.allApplicantData, appState.currentHeaders.indexOf('지원일'), filters);
    const stats = calculateCoreStats(data);

    document.getElementById('sidebarTotalApplicants').textContent = stats.total;
    document.getElementById('sidebarInterviewPending').textContent = stats.pending;
    document.getElementById('sidebarSuccessRate').textContent = `${stats.successRate}%`;
    document.getElementById('sidebarJoinRate').textContent = `${stats.joinRate}%`;
    const labelEl = document.querySelector(`#sidebarPeriodFilter option[value="${selected}"]`);
    document.getElementById('sidebarPeriodLabel').textContent = labelEl ? labelEl.textContent : '전체 기간';
}

export function updateInterviewSchedule() { /* ...생략... */ } // 이전과 동일

// ===================================================================================
// 필터 및 보기 옵션 UI
// ===================================================================================

export function handleSearch(callback) {
    return (event) => {
        if (appState.ui.searchTimeout) clearTimeout(appState.ui.searchTimeout);
        appState.ui.searchTimeout = setTimeout(() => {
            appState.filters.searchTerm = event.target.value.toLowerCase();
            appState.pagination.currentPage = 1;
            callback();
        }, 300);
    }
}

export function resetFilters(isInitialLoad = false, callback) {
    document.querySelectorAll('.filter-bar select').forEach(select => select.value = 'all');
    document.getElementById('globalSearch').value = '';
    appState.filters.searchTerm = '';
    appState.ui.activeDateMode = 'all';
    appState.pagination.currentPage = 1;
    appState.sorting = { column: '지원일', direction: 'desc' };
    updateDateFilterUI();
    if (isInitialLoad) {
        appState.filteredData = sortData(appState.allApplicantData);
        render();
    } else {
        callback();
    }
}

export function populateDropdownFilters() {
    const populate = (colName, elId) => {
        const index = appState.currentHeaders.indexOf(colName);
        if (index === -1) return;
        const options = [...new Set(appState.allApplicantData.map(row => (row[index] || '').trim()).filter(Boolean))].sort();
        const select = document.getElementById(elId);
        select.innerHTML = '<option value="all">전체</option>';
        options.forEach(opt => select.innerHTML += `<option value="${opt}">${opt}</option>`);
    };
    populate('지원루트', 'routeFilter');
    populate('모집분야', 'positionFilter');
}

export function switchView(viewType) {
    appState.ui.currentView = viewType;
    document.getElementById('tableView').style.display = viewType === 'table' ? 'block' : 'none';
    document.getElementById('cardsView').style.display = viewType === 'cards' ? 'grid' : 'none';
    document.getElementById('tableViewBtn').classList.toggle('active', viewType === 'table');
    document.getElementById('cardsViewBtn').classList.toggle('active', viewType === 'cards');
    render();
}

export function updateDateFilterUI() { /* ...생략... */ } // 이전과 동일
export function navigateDate(direction) { /* ...생략... */ } // 이전과 동일

// ===================================================================================
// 컬럼 설정 및 모달 UI (누락되었던 함수들 포함)
// ===================================================================================

export function generateVisibleColumns() {
    appState.ui.visibleColumns = appState.currentHeaders.reduce((acc, header) => {
        acc[header] = !config.DEFAULT_HIDDEN_COLUMNS.includes(header);
        return acc;
    }, {});
}

export function setupColumnToggles() {
    const dropdown = document.getElementById('columnToggleDropdown');
    if (!dropdown) return;
    dropdown.innerHTML = '';
    appState.currentHeaders.forEach(header => {
        const item = document.createElement('div');
        item.className = 'column-toggle-item';
        const isChecked = appState.ui.visibleColumns[header] ? 'checked' : '';
        item.innerHTML = `<input type="checkbox" id="toggle-${header}" ${isChecked} data-column="${header}"><label for="toggle-${header}">${header}</label>`;
        dropdown.appendChild(item);
    });
}

export function handleColumnToggle(columnName, isChecked) {
    appState.ui.visibleColumns[columnName] = isChecked;
    render();
}

export function toggleColumnDropdown() {
    const dropdown = document.getElementById('columnToggleDropdown');
    if(dropdown) dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';
}

export function openNewApplicantModal() { /* ...생략... */ } // 이전과 동일
export function openCardDetail(rowData) { /* ...생략... */ } // 이전과 동일
export function openEditModal() { /* ...생략... */ } // 이전과 동일
export function closeModal() { /* ...생략... */ } // 이전과 동일
export function buildModalForm(data) { /* ...생략... */ } // 이전과 동일
export function getFormData() { /* ...생략... */ } // 이전과 동일
export function handleDropdownChange(selectElement, fieldName) { /* ...생략... */ } // 이전과 동일

// ===================================================================================
// 유틸리티 함수 (UI 관련)
// ===================================================================================
function formatDate(dateString) {
    if (!dateString) return '';
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return dateString;
        return date.toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\s/g, '').slice(0, -1);
    } catch (e) {
        return dateString;
    }
}

function getStatusClass(value) {
    const valueStr = (value || '').trim();
    if (!valueStr) return '';
    const statusMap = { '합격': 'status-합격', '입과': 'status-입과', '출근': 'status-출근', '불합격': 'status-불합격', '거절': 'status-거절', '미참석': 'status-미참석', '보류': 'status-보류', '면접확정': 'status-면접확정', '대기': 'status-대기' };
    for (const [status, className] of Object.entries(statusMap)) {
        if (valueStr.includes(status)) return className;
    }
    return '';
}
