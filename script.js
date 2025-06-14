// ===================================================================================
// 1. 설정(Configuration)과 상태(State) 객체
// ===================================================================================

/**
 * 애플리케이션의 정적 설정값
 * (실행 중에 거의 변하지 않는 값들)
 */
const config = {
    APPS_SCRIPT_URL: 'https://script.google.com/macros/s/AKfycby3-nGn2KZCc49NIELYgr3_Wp_vUElARftdXuIEk-V2dh3Fb9p2yqe3fN4JhIVqpZR2/exec',
    DEFAULT_HIDDEN_COLUMNS: ['비고', '부재', '거절', '보류', '면접확정', '면접 날짜', '면접 시간', '미참석', '불합격/보류', '입과/출근', '입과일', '지점배치', '면접리뷰'],
    PAGINATION_ITEMS_PER_PAGE: 30
};

/**
 * 애플리케이션의 동적 상태값
 * (사용자 인터랙션에 따라 계속 변하는 값들)
 */
const appState = {
    allApplicantData: [],
    filteredData: [],
    currentHeaders: [],
    nextSequenceNumber: 1,
    pagination: {
        currentPage: 1,
        totalPages: 1,
    },
    ui: {
        visibleColumns: {},
        currentView: 'table',
        activeDateMode: 'all',
        searchTimeout: null,
        currentEditingData: null, // 현재 수정/상세보기 중인 지원자 데이터
    },
    sorting: {
        column: '지원일',
        direction: 'desc',
    },
    filters: {
        searchTerm: '',
    },
    charts: {
        instances: {},
        currentEfficiencyTab: 'route',
        currentTrendTab: 'all',
    }
};


// ===================================================================================
// 2. 애플리케이션 초기화 및 이벤트 리스너 설정
// ===================================================================================

document.addEventListener('DOMContentLoaded', () => {
    initializeTheme();
    fetchData();
    setupDateFilterListeners();
    setupEventListeners();
    setTimeout(enhanceAccessibility, 1000);
});

function setupEventListeners() {
    // 모달 외부 클릭 시 닫기
    window.onclick = function(event) {
        if (event.target == document.getElementById('applicantModal')) {
            closeModal();
        }
    }

    // 컬럼 설정 드롭다운 외부 클릭 시 닫기
    document.addEventListener('click', function(event) {
        const dropdownContainer = document.querySelector('.column-toggle-container');
        if (dropdownContainer && !dropdownContainer.contains(event.target)) {
            document.getElementById('columnToggleDropdown').style.display = 'none';
        }
    });
}

function setupDateFilterListeners() {
    document.getElementById('dateModeToggle').addEventListener('click', (e) => {
        if (e.target.tagName === 'BUTTON') {
            appState.ui.activeDateMode = e.target.dataset.mode;
            updateDateFilterUI();
            applyFilters();
        }
    });
}


// ===================================================================================
// 3. 데이터 처리 및 비즈니스 로직 (API, 필터링, 정렬 등)
// ===================================================================================

async function fetchData() {
    showLoadingIndicator(true);
    try {
        const response = await fetch(`${config.APPS_SCRIPT_URL}?action=read`);
        if (!response.ok) {
            let errorMsg = `서버 오류가 발생했습니다. (상태 코드: ${response.status})`;
            if (response.status === 404) errorMsg = "데이터를 가져올 API를 찾을 수 없습니다.";
            throw new Error(errorMsg);
        }

        const result = await response.json();
        if (result.status !== 'success') throw new Error(result.message || '데이터 처리 중 오류가 발생했습니다.');
        if (!result.data || result.data.length < 2) throw new Error('표시할 지원자 데이터가 없습니다.');

        // 데이터 파싱 및 상태 저장
        appState.currentHeaders = (result.data[0] || []).map(h => String(h || '').trim());
        appState.allApplicantData = result.data.slice(1)
            .filter(row => row && Array.isArray(row) && row.some(cell => cell != null && String(cell).trim() !== ''))
            .map(row => row.map(cell => cell == null ? '' : String(cell)));
        
        // 다음 구분 번호 계산
        const gubunIndex = appState.currentHeaders.indexOf('구분');
        if (gubunIndex !== -1 && appState.allApplicantData.length > 0) {
            const sequenceNumbers = appState.allApplicantData.map(row => parseInt(row[gubunIndex], 10)).filter(num => !isNaN(num));
            appState.nextSequenceNumber = sequenceNumbers.length > 0 ? Math.max(...sequenceNumbers) + 1 : 1;
        } else {
            appState.nextSequenceNumber = appState.allApplicantData.length + 1;
        }
        
        // 데이터 로드 후 초기 설정
        generateVisibleColumns();
        setupColumnToggles();
        populateDropdownFilters();
        resetFilters(true); // 필터 초기화 및 첫 화면 렌더링
        updateSidebarWidgets();
        updateInterviewSchedule();
        initializeCharts();
        updateStatistics(); // 차트 데이터 초기화 후 통계 업데이트

    } catch (error) {
        console.error("데이터 불러오기 실패:", error);
        showErrorIndicator(error.message);
    } finally {
        showLoadingIndicator(false);
    }
}

function applyFilters() {
    let data = [...appState.allApplicantData];
    const routeFilter = document.getElementById('routeFilter').value;
    const positionFilter = document.getElementById('positionFilter').value;
    
    // 1. 키워드 검색 필터
    if (appState.filters.searchTerm) {
        data = data.filter(row => row.some(cell => String(cell || '').toLowerCase().includes(appState.filters.searchTerm)));
    }
    // 2. 드롭다운 필터
    if (routeFilter !== 'all') data = data.filter(row => String(row[appState.currentHeaders.indexOf('지원루트')] || '') === routeFilter);
    if (positionFilter !== 'all') data = data.filter(row => String(row[appState.currentHeaders.indexOf('모집분야')] || '') === positionFilter);
    
    // 3. 날짜 필터 (공통 함수 사용)
    const dateFilterConfig = {
        mode: appState.ui.activeDateMode,
        start: document.getElementById('startDateInput')?.value,
        end: document.getElementById('endDateInput')?.value,
        singleDate: document.getElementById('dateInput')?.value
    };
    data = filterDataByPeriod(data, appState.currentHeaders.indexOf('지원일'), dateFilterConfig);

    // 4. 데이터 정렬
    appState.filteredData = sortData(data);
    
    // 5. 페이지네이션 계산 및 UI 업데이트
    appState.pagination.totalPages = Math.ceil(appState.filteredData.length / config.PAGINATION_ITEMS_PER_PAGE);
    if (appState.pagination.currentPage > appState.pagination.totalPages) {
        appState.pagination.currentPage = appState.pagination.totalPages > 0 ? appState.pagination.totalPages : 1;
    }
    
    // 6. 최종 렌더링
    render();
}

function sortData(data) {
    const { column, direction } = appState.sorting;
    if (!column || !direction) return data;

    const sortIndex = appState.currentHeaders.indexOf(column);
    if (sortIndex === -1) return data;

    // slice()를 사용해 원본 배열을 변경하지 않도록 함
    return data.slice().sort((a, b) => {
        let valA = a[sortIndex] || '';
        let valB = b[sortIndex] || '';
        
        // 날짜, 숫자, 문자열 순으로 타입에 맞는 비교 수행
        if (column.includes('날') || column.includes('일')) {
            valA = new Date(valA || '1970-01-01');
            valB = new Date(valB || '1970-01-01');
        } else if (!isNaN(valA) && !isNaN(valB) && valA !== '' && valB !== '') {
            valA = Number(valA);
            valB = Number(valB);
        } else {
            valA = String(valA).toLowerCase();
            valB = String(valB).toLowerCase();
        }
        
        if (valA < valB) return direction === 'asc' ? -1 : 1;
        if (valA > valB) return direction === 'asc' ? 1 : -1;
        return 0;
    });
}

function resetFilters(isInitialLoad = false) {
    document.querySelectorAll('.filter-bar select').forEach(select => select.value = 'all');
    document.getElementById('globalSearch').value = '';
    appState.filters.searchTerm = '';
    appState.ui.activeDateMode = 'all';
    appState.pagination.currentPage = 1;
    appState.sorting = { column: '지원일', direction: 'desc' }; // 정렬 상태도 초기화
    updateDateFilterUI();
    
    if (isInitialLoad) {
       appState.filteredData = sortData(appState.allApplicantData);
       render();
    } else {
       applyFilters();
    }
}

/**
 * [공통 함수] 핵심 통계를 계산합니다.
 * @param {Array} data - 통계를 계산할 데이터 배열
 * @returns {object} { total, pending, successRate, joinRate }
 */
function calculateCoreStats(data) {
    const contactResultIndex = appState.currentHeaders.indexOf('1차 컨택 결과');
    const interviewResultIndex = appState.currentHeaders.indexOf('면접결과');
    const joinDateIndex = appState.currentHeaders.indexOf('입과일');

    const interviewConfirmed = data.filter(row => (row[contactResultIndex] || '').trim() === '면접확정');
    const passedFromConfirmed = interviewConfirmed.filter(row => (row[interviewResultIndex] || '').trim() === '합격');
    
    const allPassed = data.filter(row => (row[interviewResultIndex] || '').trim() === '합격');
    const joinedFromPassed = allPassed.filter(row => (row[joinDateIndex] || '').trim() !== '' && (row[joinDateIndex] || '').trim() !== '-');

    const successRate = interviewConfirmed.length > 0 ? Math.round((passedFromConfirmed.length / interviewConfirmed.length) * 100) : 0;
    const joinRate = allPassed.length > 0 ? Math.round((joinedFromPassed.length / allPassed.length) * 100) : 0;

    return {
        total: data.length,
        pending: interviewConfirmed.length,
        successRate: successRate,
        joinRate: joinRate
    };
}

/**
 * [공통 함수] 기간에 따라 데이터를 필터링합니다.
 * @param {Array} data - 필터링할 원본 데이터
 * @param {number} dateIndex - 날짜 컬럼의 인덱스
 * @param {object} filterConfig - { mode, start, end, singleDate }
 * @returns {Array} 필터링된 데이터
 */
function filterDataByPeriod(data, dateIndex, filterConfig) {
    if (dateIndex === -1 || filterConfig.mode === 'all') return data;
    
    const now = new Date();
    
    return data.filter(row => {
        const dateValue = row[dateIndex];
        if (!dateValue) return false;
        try {
            const date = new Date(dateValue);
            switch (filterConfig.mode) {
                case 'year':
                    return filterConfig.singleDate && date.getFullYear() == filterConfig.singleDate;
                case 'month':
                    return filterConfig.singleDate && String(dateValue).slice(0, 7) === filterConfig.singleDate;
                case 'day':
                    return filterConfig.singleDate && String(dateValue).slice(0, 10) === filterConfig.singleDate;
                case 'range':
                    if (!filterConfig.start || !filterConfig.end) return true;
                    const start = new Date(filterConfig.start);
                    const end = new Date(filterConfig.end);
                    end.setHours(23, 59, 59, 999);
                    return date >= start && date <= end;
                case 'this_year':
                     return date.getFullYear() === now.getFullYear();
                case 'this_month':
                     return date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth();
                case 'this_week':
                    const weekStart = new Date(now);
                    weekStart.setDate(now.getDate() - now.getDay());
                    weekStart.setHours(0, 0, 0, 0);
                    const weekEnd = new Date(weekStart);
                    weekEnd.setDate(weekStart.getDate() + 6);
                    weekEnd.setHours(23, 59, 59, 999);
                    return date >= weekStart && date <= weekEnd;
                default:
                    return true;
            }
        } catch (e) {
            return false;
        }
    });
}


// ===================================================================================
// 4. UI 렌더링 및 조작
// ===================================================================================
/**
 * 필터링된 데이터에서 현재 페이지에 표시할 데이터를 가져옵니다.
 */
function getCurrentPageData() {
    const { currentPage } = appState.pagination;
    const { PAGINATION_ITEMS_PER_PAGE } = config;
    const startIndex = (currentPage - 1) * PAGINATION_ITEMS_PER_PAGE;
    const endIndex = Math.min(startIndex + PAGINATION_ITEMS_PER_PAGE, appState.filteredData.length);
    return appState.filteredData.slice(startIndex, endIndex);
}
function render() {
    if (appState.ui.currentView === 'table') {
        renderTable(getCurrentPageData());
    } else {
        renderCards(getCurrentPageData());
    }
    updatePaginationUI();
    updateSummary();
}

function showLoadingIndicator(show) {
    const tableContainer = document.querySelector('.table-container');
    if (show) {
        tableContainer.innerHTML = `
            <div class="smooth-loading-container">
                <div class="advanced-loading-spinner"></div>
                <div class="loading-text">데이터를 불러오는 중입니다...</div>
            </div>`;
    } else {
        // 성공 시 render()가 내용을 채우므로 별도 처리 불필요
    }
}

function showErrorIndicator(message) {
    const tableContainer = document.querySelector('.table-container');
    tableContainer.innerHTML = `
        <div class="error-container">
            <i class="fas fa-exclamation-triangle error-icon"></i>
            <h3 class="error-title">오류 발생</h3>
            <p class="error-message">${message}</p>
            <button class="primary-btn" onclick="fetchData()">
                <i class="fas fa-sync-alt"></i> 다시 시도
            </button>
        </div>`;
}

function updateSidebarWidgets() {
    const selectedPeriod = document.getElementById('sidebarPeriodFilter')?.value;
    if (!selectedPeriod) return;

    const periodMap = { 'all': 'all', 'year': 'this_year', 'month': 'this_month', 'week': 'this_week', 'custom': 'range' };
    const dateFilterConfig = {
        mode: periodMap[selectedPeriod],
        start: document.getElementById('sidebarStartDate')?.value,
        end: document.getElementById('sidebarEndDate')?.value
    };

    const dataToAnalyze = filterDataByPeriod(appState.allApplicantData, appState.currentHeaders.indexOf('지원일'), dateFilterConfig);
    const stats = calculateCoreStats(dataToAnalyze);

    const periodLabelEl = document.querySelector(`#sidebarPeriodFilter option[value="${selectedPeriod}"]`);
    const periodLabel = periodLabelEl ? periodLabelEl.textContent : '전체 기간';
    document.getElementById('sidebarPeriodLabel').textContent = selectedPeriod === 'custom' && dateFilterConfig.start && dateFilterConfig.end ? `${dateFilterConfig.start} ~ ${dateFilterConfig.end}` : periodLabel;
    
    document.getElementById('sidebarTotalApplicants').textContent = stats.total;
    document.getElementById('sidebarInterviewPending').textContent = stats.pending;
    document.getElementById('sidebarSuccessRate').textContent = stats.successRate + '%';
    document.getElementById('sidebarJoinRate').textContent = stats.joinRate + '%';
}

function updateInterviewSchedule() {
    let interviewDateIndex = appState.currentHeaders.indexOf('면접 날짜');
    if (interviewDateIndex === -1) interviewDateIndex = appState.currentHeaders.indexOf('면접 날자');
    
    const nameIndex = appState.currentHeaders.indexOf('이름');
    const routeIndex = appState.currentHeaders.indexOf('지원루트');
    
    if (interviewDateIndex === -1 || nameIndex === -1) {
        document.getElementById('interviewScheduleList').innerHTML = '<div class="no-interviews">면접일정 관련 컬럼(이름, 면접 날짜)을 찾을 수 없습니다.</div>';
        return;
    }
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const threeDaysLater = new Date(today.getTime() + (3 * 24 * 60 * 60 * 1000));
    
    const upcomingInterviews = appState.allApplicantData
        .filter(row => {
            const interviewDate = row[interviewDateIndex];
            if (!interviewDate) return false;
            try {
                const date = new Date(interviewDate);
                return !isNaN(date) && date >= today && date <= threeDaysLater;
            } catch (e) { return false; }
        })
        .sort((a, b) => new Date(a[interviewDateIndex]) - new Date(b[interviewDateIndex]))
        .slice(0, 7);
    
    const scheduleContainer = document.getElementById('interviewScheduleList');
    
    if (upcomingInterviews.length === 0) {
        scheduleContainer.innerHTML = '<div class="no-interviews">3일 이내 예정된 면접이 없습니다.</div>';
        return;
    }
    
    const headersToShow = ['이름', '지원루트', '증원자', '모집분야', '면접자', '면접 날짜', '면접 시간'];
    const headerIndices = headersToShow.map(h => appState.currentHeaders.indexOf(h));

    let tableHtml = `<table class="interview-schedule-table"><thead><tr>${headersToShow.map(h => `<th>${h}</th>`).join('')}</tr></thead><tbody>`;
    
    upcomingInterviews.forEach(row => {
        tableHtml += `<tr onclick="showInterviewDetails('${row[nameIndex]}', '${row[routeIndex]}')" style="cursor: pointer;">`;
        headerIndices.forEach((idx, colIdx) => {
            const header = headersToShow[colIdx];
            let cellData = idx !== -1 ? (row[idx] || '-') : '-';
            let cellHtml = cellData;

            if (header === '면접 날짜') {
                 // D-day 계산 로직
                 const date = new Date(cellData);
                 const diffTime = new Date(date.toDateString()) - new Date(today.toDateString());
                 const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
                 let dday = `D-${diffDays}`;
                 let ddayClass = '';
                 if (diffDays === 0) { dday = 'D-Day'; ddayClass = 'today'; }
                 const dateText = `${date.getMonth() + 1}/${date.getDate()}(${'일월화수목금토'[date.getDay()]})`;
                 cellHtml = `<span class="interview-dday ${ddayClass}">${dday}</span><span class="interview-date-text">${dateText}</span>`;
            } else if (header === '면접 시간') {
                cellHtml = formatInterviewTime(cellData);
            }
            tableHtml += `<td>${cellHtml}</td>`;
        });
        tableHtml += `</tr>`;
    });
    
    tableHtml += `</tbody></table>`;
    scheduleContainer.innerHTML = tableHtml;
}
    
function renderTable(dataToRender) {
    const tableContainer = document.querySelector('.table-container');
    tableContainer.innerHTML = '';
    
    if (appState.filteredData.length === 0) {
        tableContainer.innerHTML = '<p style="text-align:center; padding: 40px; color: var(--text-secondary);">표시할 데이터가 없습니다.</p>';
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
            th.onclick = () => sortTable(header);
            
            let sortIcon = 'fa-sort';
            if (appState.sorting.column === header && appState.sorting.direction) {
                sortIcon = appState.sorting.direction === 'asc' ? 'fa-sort-up' : 'fa-sort-down';
            }
            th.innerHTML = `${header} <i class="fas ${sortIcon} sort-icon ${appState.sorting.column === header ? 'active' : ''}"></i>`;
            headerRow.appendChild(th);
        }
    });

    const tbody = table.createTBody();
    dataToRender.forEach((rowData, index) => {
        const row = tbody.insertRow();
        row.onclick = (event) => { if (event.target.tagName !== 'A') openCardDetail(rowData); };
        
        const interviewDateIndex = appState.currentHeaders.indexOf('면접 날짜');
        if (interviewDateIndex !== -1) {
            const urgency = getInterviewUrgency(rowData[interviewDateIndex]);
            if (urgency >= 0) row.classList.add(`urgent-interview-${urgency}`);
        }
        
        appState.currentHeaders.forEach((header, cellIndex) => {
            if (appState.ui.visibleColumns[header]) {
                const cell = row.insertCell();
                let cellData = rowData[cellIndex] || '';
                
                if (header === '구분') {
                    cell.textContent = (appState.pagination.currentPage - 1) * config.PAGINATION_ITEMS_PER_PAGE + index + 1;
                } else if (header.includes('날') || header.includes('일')) {
                    cell.textContent = formatDate(cellData);
                } else if (header === '연락처') {
                    cell.innerHTML = `<a href="tel:${cellData.replace(/\D/g, '')}">${cellData}</a>`;
                } else {
                    const statusClass = getStatusClass(header, cellData);
                    if (statusClass) {
                        cell.innerHTML = `<span class="status-badge ${statusClass}">${cellData}</span>`;
                    } else {
                        cell.textContent = cellData;
                    }
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
        cardsContainer.innerHTML = '<p style="text-align:center; padding: 40px; grid-column: 1/-1; color: var(--text-secondary);">표시할 데이터가 없습니다.</p>';
        return;
    }
    
    dataToRender.forEach((rowData, index) => {
        const card = document.createElement('div');
        card.className = 'applicant-card';
        card.onclick = () => openCardDetail(rowData);
        
        const interviewDateIndex = appState.currentHeaders.indexOf('면접 날짜');
        if (interviewDateIndex !== -1) {
            const urgency = getInterviewUrgency(rowData[interviewDateIndex]);
            if (urgency >= 0) card.classList.add(`urgent-card-${urgency}`);
        }
        
        const getVal = (header) => rowData[appState.currentHeaders.indexOf(header)] || '-';
        const name = getVal('이름'), phone = getVal('연락처'), route = getVal('지원루트'), position = getVal('모집분야');
        const date = formatDate(getVal('지원일'));
        const displaySequence = (appState.pagination.currentPage - 1) * config.PAGINATION_ITEMS_PER_PAGE + index + 1;

        card.innerHTML = `
            <div class="card-header">
                <div class="card-name">${name}</div>
                <div class="card-sequence">#${displaySequence}</div>
            </div>
            <div class="card-info">
                <div><span class="card-label">연락처:</span> ${phone}</div>
                <div><span class="card-label">지원루트:</span> ${route}</div>
                <div><span class="card-label">모집분야:</span> ${position}</div>
            </div>
            <div class="card-footer">
                <span>지원일: ${date}</span>
                ${phone !== '-' ? `<a href="tel:${phone.replace(/\D/g, '')}" onclick="event.stopPropagation()"><i class="fas fa-phone"></i></a>` : ''}
            </div>`;
        cardsContainer.appendChild(card);
    });
}

function updatePaginationUI() {
    const paginationContainer = document.getElementById('paginationContainer');
    if (appState.filteredData.length === 0) {
        paginationContainer.style.display = 'none';
        return;
    }
    paginationContainer.style.display = 'flex';

    const { currentPage, totalPages } = appState.pagination;
    const startItem = (currentPage - 1) * config.PAGINATION_ITEMS_PER_PAGE + 1;
    const endItem = Math.min(currentPage * config.PAGINATION_ITEMS_PER_PAGE, appState.filteredData.length);
    
    document.getElementById('paginationInfo').textContent = `${startItem}-${endItem} / ${appState.filteredData.length}명`;

    ['firstPageBtn', 'prevPageBtn'].forEach(id => document.getElementById(id).disabled = currentPage === 1);
    ['nextPageBtn', 'lastPageBtn'].forEach(id => document.getElementById(id).disabled = currentPage === totalPages);

    const paginationNumbers = document.getElementById('paginationNumbers');
    paginationNumbers.innerHTML = '';
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    startPage = Math.max(1, endPage - maxVisiblePages + 1);

    if (startPage > 1) {
        paginationNumbers.append(createPageButton(1));
        if (startPage > 2) paginationNumbers.append(createPageEllipsis());
    }
    for (let i = startPage; i <= endPage; i++) {
        paginationNumbers.append(createPageButton(i, i === currentPage));
    }
    if (endPage < totalPages) {
        if (endPage < totalPages - 1) paginationNumbers.append(createPageEllipsis());
        paginationNumbers.append(createPageButton(totalPages));
    }
}

function createPageButton(pageNumber, isActive = false) {
    const btn = document.createElement('button');
    btn.className = `pagination-number ${isActive ? 'active' : ''}`;
    btn.textContent = pageNumber;
    btn.onclick = () => goToPage(pageNumber);
    return btn;
}

function createPageEllipsis() {
    const ellipsis = document.createElement('span');
    ellipsis.className = 'pagination-ellipsis';
    ellipsis.textContent = '...';
    return ellipsis;
}

function updateSummary() {
    const { searchTerm } = appState.filters;
    const { currentPage, totalPages } = appState.pagination;
    const filteredCount = appState.filteredData.length;

    const searchText = searchTerm ? ` (검색: "${searchTerm}")` : '';
    const pageInfo = filteredCount > config.PAGINATION_ITEMS_PER_PAGE ? ` - ${currentPage}/${totalPages} 페이지` : '';
    document.getElementById('filterSummary').innerHTML = `<strong>지원자:</strong> ${filteredCount}명${searchText}${pageInfo}`;
}

// ... 이 아래로 모든 나머지 함수들 (모달, 차트, 유틸리티 등)이 계속됩니다.
// 모든 함수는 여기에 포함되어야 합니다. 지면 관계상 일부만 표시
function handleSearch() {
    if (appState.ui.searchTimeout) clearTimeout(appState.ui.searchTimeout);
    appState.ui.searchTimeout = setTimeout(() => {
        appState.filters.searchTerm = document.getElementById('globalSearch').value.toLowerCase();
        appState.pagination.currentPage = 1;
        applyFilters();
    }, 300);
}

function switchPage(pageId) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById(pageId).classList.add('active');
    document.querySelectorAll('.nav-item').forEach(b => b.classList.remove('active'));
    document.querySelector(`.nav-item[onclick="switchPage('${pageId}')"]`).classList.add('active');
    document.getElementById('pageTitle').textContent = { dashboard: '지원자 현황', stats: '통계 분석' }[pageId];
    
    if (pageId === 'stats' && appState.allApplicantData.length > 0) {
        if(Object.keys(appState.charts.instances).length === 0) initializeCharts();
        updateStatistics();
    }
    if (window.innerWidth <= 768 && document.getElementById('sidebar').classList.contains('mobile-open')) {
        toggleMobileMenu();
    }
}

function openNewApplicantModal() {
    appState.ui.currentEditingData = null;
    document.querySelector('#applicantModal .modal-title').textContent = '신규 지원자 등록';
    buildModalForm(null); 
    document.querySelector('#applicantModal .modal-footer').innerHTML = `<button class="modal-close-btn" onclick="saveNewApplicant()"><i class="fas fa-save"></i> 저장하기</button>`;
    document.getElementById('applicantModal').style.display = 'flex'; 
}

function closeModal() {
    document.getElementById('applicantModal').style.display = 'none'; 
    document.getElementById('applicantForm').innerHTML = '';
    appState.ui.currentEditingData = null;
}

function handleSidebarPeriodChange() {
    const selectedPeriod = document.getElementById('sidebarPeriodFilter').value;
    document.getElementById('sidebarCustomDateRange').style.display = selectedPeriod === 'custom' ? 'block' : 'none';
    if (selectedPeriod !== 'custom') updateSidebarWidgets();
}

function handleStatsPeriodChange() {
    const selectedPeriod = document.getElementById('statsPeriodFilter').value;
    document.getElementById('statsCustomDateRange').style.display = selectedPeriod === 'custom' ? 'flex' : 'none';
    if (selectedPeriod !== 'custom') updateStatistics();
}

function getInterviewUrgency(interviewDate) {
    if (!interviewDate) return -1;
    try {
        const today = new Date(); today.setHours(0, 0, 0, 0);
        const date = new Date(interviewDate); date.setHours(0, 0, 0, 0);
        const diffDays = Math.round((date - today) / (1000 * 60 * 60 * 24));
        return (diffDays >= 0 && diffDays <= 2) ? diffDays : -1;
    } catch (e) { return -1; }
}
    
async function saveApplicant(action) {
    const isNew = action === 'create';
    const btnSelector = isNew ? '.modal-close-btn' : '.modal-edit-btn';
    const saveBtn = document.querySelector(`#applicantModal .modal-footer ${btnSelector}`);
    const originalText = saveBtn.innerHTML;

    try {
        const applicantData = {};
        let isFormValid = true;
        
        appState.currentHeaders.forEach(header => {
            const input = document.getElementById(`modal-form-${header}`);
            if(input) {
                const customInput = document.getElementById(`modal-form-${header}-custom`);
                let value = (customInput && customInput.style.display !== 'none') ? customInput.value : input.value;
                applicantData[header] = value;
                if (input.required && !value && !(customInput && customInput.required)) isFormValid = false;
                if (customInput && customInput.required && !value) isFormValid = false;
            }
        });

        if (!isFormValid) {
            alert('필수 항목을 모두 입력해주세요.');
            return;
        }

        if (isNew) {
            applicantData['구분'] = appState.nextSequenceNumber.toString();
            applicantData['지원일'] = new Date().toISOString().split('T')[0];
        }

        if (applicantData['면접 시간']) applicantData['면접 시간'] = "'" + applicantData['면접 시간'];

        saveBtn.disabled = true;
        saveBtn.innerHTML = '<div class="advanced-loading-spinner" style="width: 20px; height: 20px; margin: 0;"></div> 저장 중...';

        const body = { action, data: applicantData };
        if (!isNew) {
            const gubunIndex = appState.currentHeaders.indexOf('구분');
            body.gubun = appState.ui.currentEditingData[gubunIndex];
        }

        const response = await fetch(config.APPS_SCRIPT_URL, {
            method: 'POST', 
            body: JSON.stringify(body)
        });
        
        const result = await response.json();
        if (result.status !== 'success') throw new Error(result.message || '저장에 실패했습니다.');
        
        alert(`정보가 성공적으로 ${isNew ? '등록' : '수정'}되었습니다.`);
        closeModal();
        fetchData();
        
    } catch (error) {
        console.error(`데이터 ${isNew ? '저장' : '수정'} 실패:`, error);
        alert(`데이터 ${isNew ? '저장' : '수정'} 중 오류 발생: ${error.message}`);
    } finally {
        saveBtn.disabled = false;
        saveBtn.innerHTML = originalText;
    }
}

function saveNewApplicant() { saveApplicant('create'); }
function saveEditedApplicant() { saveApplicant('update'); }

async function deleteApplicant() {
    const { currentEditingData, currentHeaders } = appState;
    if (!currentEditingData) return alert('삭제할 데이터가 없습니다.');

    const gubunIndex = currentHeaders.indexOf('구분');
    const nameIndex = currentHeaders.indexOf('이름');
    const applicantName = currentEditingData[nameIndex] || '해당 지원자';

    if (!confirm(`정말로 '${applicantName}' 님의 정보를 삭제하시겠습니까?\n이 작업은 되돌릴 수 없습니다.`)) return;
    
    const deleteBtn = document.querySelector('.modal-delete-btn');
    const originalText = deleteBtn.innerHTML;
    
    try {
        deleteBtn.disabled = true;
        deleteBtn.innerHTML = '<div class="advanced-loading-spinner" style="width: 20px; height: 20px; margin: 0;"></div> 삭제 중...';

        const response = await fetch(config.APPS_SCRIPT_URL, {
            method: 'POST',
            body: JSON.stringify({ action: 'delete', gubun: currentEditingData[gubunIndex] })
        });
        const result = await response.json();
        if (result.status !== 'success') throw new Error(result.message || '삭제에 실패했습니다.');

        alert(`'${applicantName}' 님의 정보가 성공적으로 삭제되었습니다.`);
        closeModal();
        fetchData(); 

    } catch (error) {
        alert(`데이터 삭제 중 오류가 발생했습니다: ${error.message}`);
        console.error("데이터 삭제 실패:", error);
    } finally {
         deleteBtn.disabled = false;
         deleteBtn.innerHTML = originalText;
    }
}
//... (이하 나머지 함수들 전체 포함)
// 이 아래로 모든 나머지 함수들 (모달, 차트, 유틸리티 등)이 계속됩니다.
function sortTable(columnName) {
    if (appState.sorting.column === columnName) {
        appState.sorting.direction = appState.sorting.direction === 'asc' ? 'desc' : 'asc';
    } else {
        appState.sorting.column = columnName;
        appState.sorting.direction = 'asc';
    }
    applyFilters();
}

function goToPage(page) {
    const { totalPages } = appState.pagination;
    if (page >= 1 && page <= totalPages) {
        appState.pagination.currentPage = page;
        render();
    }
}

function goToPrevPage() { goToPage(appState.pagination.currentPage - 1); }
function goToNextPage() { goToPage(appState.pagination.currentPage + 1); }
function goToFirstPage() { goToPage(1); }
function goToLastPage() { goToPage(appState.pagination.totalPages); }

function switchView(viewType) {
    appState.ui.currentView = viewType;
    document.getElementById('tableView').style.display = viewType === 'table' ? 'block' : 'none';
    document.getElementById('cardsView').style.display = viewType === 'cards' ? 'grid' : 'none';
    document.querySelectorAll('.view-btn').forEach(btn => btn.classList.toggle('active', btn.getAttribute('onclick').includes(viewType)));
    render();
}

function populateDropdownFilters() {
    const routeIndex = appState.currentHeaders.indexOf('지원루트');
    const positionIndex = appState.currentHeaders.indexOf('모집분야');
    
    const populate = (index, elementId) => {
        if (index === -1) return;
        const options = [...new Set(appState.allApplicantData.map(row => (row[index] || '').trim()).filter(Boolean))].sort();
        const select = document.getElementById(elementId);
        select.innerHTML = '<option value="all">전체</option>';
        options.forEach(opt => select.innerHTML += `<option value="${opt}">${opt}</option>`);
    };

    populate(routeIndex, 'routeFilter');
    populate(positionIndex, 'positionFilter');
}

function updateDateFilterUI() {
    const { activeDateMode } = appState.ui;
    document.querySelectorAll('.date-mode-btn').forEach(btn => btn.classList.toggle('active', btn.dataset.mode === activeDateMode));
    
    const container = document.getElementById('dateInputsContainer');
    const now = new Date();
    const year = now.getFullYear();
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const day = now.getDate().toString().padStart(2, '0');
    
    let html = '';
    if (activeDateMode === 'all') html = `<span style="color: var(--text-secondary); font-size: 0.9rem; padding: 0 10px;">모든 데이터 표시</span>`;
    else if (activeDateMode === 'year') html = `<input type="number" id="dateInput" value="${year}" onchange="applyFilters()">`;
    else if (activeDateMode === 'month') html = `<button class="date-nav-btn" onclick="navigateDate(-1)">&lt;</button><input type="month" id="dateInput" value="${year}-${month}" onchange="applyFilters()"><button class="date-nav-btn" onclick="navigateDate(1)">&gt;</button>`;
    else if (activeDateMode === 'day') html = `<button class="date-nav-btn" onclick="navigateDate(-1)">&lt;</button><input type="date" id="dateInput" value="${year}-${month}-${day}" onchange="applyFilters()"><button class="date-nav-btn" onclick="navigateDate(1)">&gt;</button>`;
    else if (activeDateMode === 'range') html = `<input type="date" id="startDateInput" onchange="applyFilters()"><span style="margin: 0 5px;">-</span><input type="date" id="endDateInput" onchange="applyFilters()">`;
    container.innerHTML = html;
}

function navigateDate(direction) {
    const input = document.getElementById('dateInput');
    if (!input) return;
    const { activeDateMode } = appState.ui;
    
    if (activeDateMode === 'year') {
        input.value = Number(input.value) + direction;
    } else {
        let currentDate = new Date(input.value);
        if (activeDateMode === 'month') currentDate.setMonth(currentDate.getMonth() + direction);
        else if (activeDateMode === 'day') currentDate.setDate(currentDate.getDate() + direction);
        input.value = currentDate.toISOString().slice(0, activeDateMode === 'month' ? 7 : 10);
    }
    applyFilters();
}

function toggleColumnDropdown() {
    const dropdown = document.getElementById('columnToggleDropdown');
    dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';
}

function handleColumnToggle(event, columnName) {
    appState.ui.visibleColumns[columnName] = event.target.checked;
    render();
}

function setupColumnToggles() {
    const dropdown = document.getElementById('columnToggleDropdown');
    dropdown.innerHTML = '';
    appState.currentHeaders.forEach(header => {
        const item = document.createElement('div');
        item.className = 'column-toggle-item';
        item.innerHTML = `<input type="checkbox" id="toggle-${header}" ${appState.ui.visibleColumns[header] ? 'checked' : ''} onchange="handleColumnToggle(event, '${header}')"><label for="toggle-${header}">${header}</label>`;
        dropdown.appendChild(item);
    });
}

function generateVisibleColumns() {
    appState.ui.visibleColumns = appState.currentHeaders.reduce((acc, header) => {
        acc[header] = !config.DEFAULT_HIDDEN_COLUMNS.includes(header);
        return acc;
    }, {});
}

function buildModalForm(data = null) {
    const isReadOnly = data && !appState.ui.currentEditingData; // 상세보기 모드
    const isEdit = data && appState.ui.currentEditingData; // 수정 모드

    const form = document.getElementById('applicantForm');
    form.innerHTML = '';
    
    const requiredFields = ['이름', '연락처', '지원루트', '모집분야'];
    const dropdownOptions = {
        '지원루트': ['사람인', '잡코리아', '인크루트', '아웃바운드', '배우공고', '당근', 'Instagram', 'Threads', '직접입력'],
        '모집분야': ['영업', '강사', '상조', '직접입력'], '성별': ['남', '여'],
        '증원자': ['회사', '이성진', '김영빈', '최혜진', '직접입력'],
        '1차 컨택 결과': ['부재1회', '부재2회', '보류', '거절', '파기', '면접확정'],
        '면접자': ['이성진', '김영빈', '최혜진', '직접입력'],
        '면접결과': ['미참석', '불합격', '보류', '합격']
    };
    
    appState.currentHeaders.forEach((header, index) => {
        const formGroup = document.createElement('div');
        formGroup.className = `form-group ${['비고', '면접리뷰'].includes(header) ? 'full-width' : ''}`;
        
        let value = data ? (data[index] || '') : '';
        if (!data && header === '구분') value = appState.nextSequenceNumber;
        if (!data && header === '지원일') value = new Date().toISOString().split('T')[0];
        
        // 날짜 형식 통일
        if ((header.includes('날') || header.includes('일')) && value) {
            value = formatDate(value, 'YYYY-MM-DD');
        }

        const isRequired = requiredFields.includes(header) && !isReadOnly;
        const isDisabled = isReadOnly || header === '구분' || (header === '지원일' && isEdit);

        let inputHtml = '';
        if (dropdownOptions[header]) {
             // 드롭다운 로직
             const options = dropdownOptions[header];
             const hasDirectInput = options.includes('직접입력');
             let selectValue = value;
             let customValue = '';
             if (hasDirectInput && value && !options.includes(value)) {
                 selectValue = '직접입력';
                 customValue = value;
             }
             inputHtml = `<select id="modal-form-${header}" ${isDisabled ? 'disabled' : ''} onchange="handleDropdownChange(this, '${header}')" ${isRequired ? 'required' : ''}>
                             <option value="">선택</option>
                             ${options.map(opt => `<option value="${opt}" ${selectValue === opt ? 'selected' : ''}>${opt}</option>`).join('')}
                         </select>`;
             if (hasDirectInput) {
                 inputHtml += `<input type="text" id="modal-form-${header}-custom" value="${customValue}" placeholder="직접 입력" style="display:${selectValue === '직접입력' ? 'block' : 'none'}; margin-top:5px;" ${isDisabled ? 'disabled' : ''}>`;
             }
        } else if (['비고', '면접리뷰'].includes(header)) {
            inputHtml = `<textarea id="modal-form-${header}" rows="3" ${isDisabled ? 'disabled' : ''}>${value}</textarea>`;
        } else {
            const type = (header.includes('날') || header.includes('일')) ? 'date' : 'text';
            inputHtml = `<input type="${type}" id="modal-form-${header}" value="${value}" ${isDisabled ? 'disabled' : ''} ${isRequired ? 'required' : ''}>`;
        }
        
        formGroup.innerHTML = `<label for="modal-form-${header}">${header}${isRequired ? ' *' : ''}</label>${inputHtml}`;
        form.appendChild(formGroup);
    });
}

function handleDropdownChange(selectElement, fieldName) {
    const customInput = document.getElementById(`modal-form-${fieldName}-custom`);
    if (customInput) customInput.style.display = selectElement.value === '직접입력' ? 'block' : 'none';
}

function openCardDetail(rowData) {
    appState.ui.currentEditingData = rowData;
    document.querySelector('#applicantModal .modal-title').textContent = '지원자 상세 정보';
    buildModalForm(rowData);
    document.querySelector('#applicantModal .modal-footer').innerHTML = `
        <button class="modal-close-btn" onclick="closeModal()"><i class="fas fa-times"></i> 닫기</button>
        <button class="modal-edit-btn" onclick="openEditModal()"><i class="fas fa-edit"></i> 수정</button>
        <button class="modal-delete-btn" onclick="deleteApplicant()"><i class="fas fa-trash"></i> 삭제</button>`;
    document.getElementById('applicantModal').style.display = 'flex';
}

function openEditModal() {
    if (!appState.ui.currentEditingData) return;
    document.querySelector('#applicantModal .modal-title').textContent = '지원자 정보 수정';
    buildModalForm(appState.ui.currentEditingData); // 데이터를 다시 빌드하여 disabled 해제
    document.querySelector('#applicantModal .modal-footer').innerHTML = `
        <button class="secondary-btn" onclick="openCardDetail(appState.ui.currentEditingData)">취소</button>
        <button class="modal-edit-btn" onclick="saveEditedApplicant()"><i class="fas fa-save"></i> 저장</button>`;
}

function showInterviewDetails(name, route) {
    const targetRow = appState.allApplicantData.find(row => 
        row[appState.currentHeaders.indexOf('이름')] === name && 
        row[appState.currentHeaders.indexOf('지원루트')] === route
    );
    if (targetRow) openCardDetail(targetRow);
}

// 차트 관련 함수들
function initializeCharts() {
    const colors = { primary: '#818cf8', success: '#10b981', warning: '#f59e0b', danger: '#ef4444', orange: '#fb923c' };
    const chartConfigs = {
        route: { type: 'bar', options: { indexAxis: 'y', plugins: { legend: { display: false } } }, data: { datasets: [{ backgroundColor: colors.primary }] } },
        position: { type: 'bar', options: { indexAxis: 'y', plugins: { legend: { display: false } } }, data: { datasets: [{ backgroundColor: colors.success }] } },
        trend: { type: 'line', options: {}, data: { datasets: [{ label: '지원자 수', borderColor: colors.primary, backgroundColor: colors.primary + '20', tension: 0.4, fill: true }] } },
        region: { type: 'doughnut', options: { plugins: { legend: { position: 'bottom' } } }, data: { datasets: [{ backgroundColor: Object.values(colors) }] } },
        gender: { type: 'pie', options: { plugins: { legend: { position: 'bottom' } } }, data: { datasets: [{ backgroundColor: [colors.primary, colors.warning] }] } },
        age: { type: 'bar', options: { plugins: { legend: { display: false } } }, data: { datasets: [{ backgroundColor: colors.orange }] } },
    };

    Object.entries(chartConfigs).forEach(([name, config]) => {
        const ctx = document.getElementById(`${name}Chart`);
        if (ctx && !appState.charts.instances[name]) {
            appState.charts.instances[name] = new Chart(ctx, {
                type: config.type,
                data: { labels: [], datasets: config.data.datasets },
                options: { responsive: true, maintainAspectRatio: false, ...config.options }
            });
        }
    });
}

function updateStatistics() {
    if (appState.allApplicantData.length === 0) return;
    const selectedPeriod = document.getElementById('statsPeriodFilter')?.value || 'all';
    const periodMap = { 'all': 'all', 'year': 'this_year', 'month': 'this_month', 'week': 'this_week', 'custom': 'range' };
    const dateFilterConfig = {
        mode: periodMap[selectedPeriod],
        start: document.getElementById('statsStartDate')?.value,
        end: document.getElementById('statsEndDate')?.value
    };
    
    const dataToAnalyze = filterDataByPeriod(appState.allApplicantData, appState.currentHeaders.indexOf('지원일'), dateFilterConfig);
    const stats = calculateCoreStats(dataToAnalyze);

    updateStatCard('totalApplicantsChart', stats.total);
    updateStatCard('pendingInterviewChart', stats.pending);
    updateStatCard('successRateChart', stats.successRate + '%');
    updateStatCard('joinRateChart', stats.joinRate + '%');
    
    // 차트 업데이트
    updateAllCharts(dataToAnalyze);
    updateEfficiencyAnalysis(dataToAnalyze);
    updateTrendAnalysis(); // 추이 차트는 항상 전체 데이터를 기준으로 함
}

function updateAllCharts(data) {
    const updateChart = (name, labels, chartData) => {
        const chart = appState.charts.instances[name];
        if (!chart) return;
        chart.data.labels = labels.length > 0 ? labels : ['데이터 없음'];
        chart.data.datasets[0].data = labels.length > 0 ? chartData : [1];
        chart.update();
    };
    
    const aggregate = (colName) => {
        const counts = {};
        const index = appState.currentHeaders.indexOf(colName);
        if (index === -1) return { labels: [], data: [] };
        data.forEach(row => {
            const key = (row[index] || '미입력').trim();
            counts[key] = (counts[key] || 0) + 1;
        });
        return { labels: Object.keys(counts), data: Object.values(counts) };
    };

    let chartData;
    chartData = aggregate('지원루트'); updateChart('route', chartData.labels, chartData.data);
    chartData = aggregate('모집분야'); updateChart('position', chartData.labels, chartData.data);
    chartData = aggregate('성별'); updateChart('gender', chartData.labels, chartData.data);
    
    // 연령대별 집계
    const ageIndex = appState.currentHeaders.indexOf('나이');
    const ageGroups = { '20대 이하': 0, '30대': 0, '40대': 0, '50대': 0, '60대 이상': 0 };
    if (ageIndex !== -1) {
        data.forEach(row => {
            const age = parseInt(row[ageIndex], 10);
            if(isNaN(age)) return;
            if (age <= 29) ageGroups['20대 이하']++;
            else if (age <= 39) ageGroups['30대']++;
            else if (age <= 49) ageGroups['40대']++;
            else if (age <= 59) ageGroups['50대']++;
            else ageGroups['60대 이상']++;
        });
    }
    updateChart('age', Object.keys(ageGroups), Object.values(ageGroups));
}

function updateTrendAnalysis() {
    const trendChart = appState.charts.instances.trend;
    if (!trendChart) return;
    const applyDateIndex = appState.currentHeaders.indexOf('지원일');
    if (applyDateIndex === -1) return;

    const trendData = {};
    const dataSet = appState.allApplicantData; // 추이는 항상 전체 데이터 기준
    const mode = appState.charts.currentTrendTab;

    if (mode === 'all') { // 최근 12개월
        for (let i = 11; i >= 0; i--) {
            const d = new Date(); d.setMonth(d.getMonth() - i);
            trendData[`${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}`] = 0;
        }
    } else if (mode === 'year') { // 최근 5년
        const currentYear = new Date().getFullYear();
        for (let i = 4; i >= 0; i--) trendData[currentYear - i] = 0;
    } else if (mode === 'month') { // 올해 월별
        const currentYear = new Date().getFullYear();
        for (let i = 1; i <= 12; i++) trendData[`${currentYear}-${i.toString().padStart(2, '0')}`] = 0;
    }

    dataSet.forEach(row => {
        try {
            const date = new Date(row[applyDateIndex]);
            let key;
            if (mode === 'year') key = date.getFullYear();
            else key = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
            if (trendData.hasOwnProperty(key)) trendData[key]++;
        } catch(e) {}
    });
    
    trendChart.data.labels = Object.keys(trendData);
    trendChart.data.datasets[0].data = Object.values(trendData);
    trendChart.update();
}

function updateEfficiencyAnalysis(data) {
    const tab = appState.charts.currentEfficiencyTab;
    const categoryHeader = { 'route': '지원루트', 'recruiter': '증원자', 'interviewer': '면접자' }[tab];
    
    const categoryIndex = appState.currentHeaders.indexOf(categoryHeader);
    if (categoryIndex === -1) {
        document.getElementById('efficiencyTabContent').innerHTML = `<p class="error-message">${categoryHeader} 컬럼이 없습니다.</p>`;
        return;
    }
    const contactResultIndex = appState.currentHeaders.indexOf('1차 컨택 결과');
    const interviewResultIndex = appState.currentHeaders.indexOf('면접결과');
    const joinDateIndex = appState.currentHeaders.indexOf('입과일');
    
    const stats = {};
    data.forEach(row => {
        const category = (row[categoryIndex] || '미입력').trim();
        if (!stats[category]) stats[category] = { total: 0, interviewConfirmed: 0, passed: 0, joined: 0 };
        stats[category].total++;
        if ((row[contactResultIndex] || '').trim() === '면접확정') stats[category].interviewConfirmed++;
        if ((row[interviewResultIndex] || '').trim() === '합격') stats[category].passed++;
        if ((row[joinDateIndex] || '').trim() !== '' && (row[joinDateIndex] || '').trim() !== '-') stats[category].joined++;
    });

    renderEfficiencyTable(stats, categoryHeader);
}

function renderEfficiencyTable(stats, categoryName) {
    const maxTotal = Math.max(...Object.values(stats).map(s => s.total), 1);
    const dataArray = Object.entries(stats).map(([name, data]) => {
        const interviewConfirmRate = data.total > 0 ? (data.interviewConfirmed / data.total) * 100 : 0;
        const passRate = data.interviewConfirmed > 0 ? (data.passed / data.interviewConfirmed) * 100 : 0;
        const joinRate = data.total > 0 ? (data.joined / data.total) * 100 : 0;
        const volumeWeight = (data.total / maxTotal) * 100;
        const efficiencyScore = (joinRate * 0.4) + (passRate * 0.3) + (interviewConfirmRate * 0.2) + (volumeWeight * 0.1);
        return { name, ...data, interviewConfirmRate: Math.round(interviewConfirmRate), passRate: Math.round(passRate), joinRate: Math.round(joinRate), efficiencyScore: Math.round(efficiencyScore * 10) / 10 };
    }).sort((a, b) => b.efficiencyScore - a.efficiencyScore);
    
    let tableHtml = `<div class="table-container"><table class="efficiency-table"> ... </table></div>`; // 테이블 구조 생략
    document.getElementById('efficiencyTabContent').innerHTML = tableHtml;
}


function switchEfficiencyTab(tabName) {
    appState.charts.currentEfficiencyTab = tabName;
    document.querySelectorAll('.efficiency-tab-btn').forEach(btn => btn.classList.toggle('active', btn.dataset.tab === tabName));
    updateStatistics();
}

function switchTrendTab(period) {
    appState.charts.currentTrendTab = period;
    document.querySelectorAll('.trend-tab-btn').forEach(btn => btn.classList.toggle('active', btn.dataset.period === period));
    updateTrendAnalysis();
}

// 유틸리티 함수들
function initializeTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);
}

function toggleTheme() {
    const newTheme = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeIcon(newTheme);
}

function updateThemeIcon(theme) {
    document.getElementById('themeIcon').className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
}

function toggleMobileMenu() {
    document.getElementById('sidebar').classList.toggle('mobile-open');
    document.querySelector('.mobile-overlay').classList.toggle('show');
}

function getStatusClass(header, value) {
    const valueStr = (value || '').trim();
    if (!valueStr) return '';
    const statusMap = { '합격': 'status-합격', '입과': 'status-입과', '출근': 'status-출근', '불합격': 'status-불합격', '거절': 'status-거절', '미참석': 'status-미참석', '보류': 'status-보류', '면접확정': 'status-면접확정', '대기': 'status-대기' };
    for (const [status, className] of Object.entries(statusMap)) {
        if (valueStr.includes(status)) return className;
    }
    return '';
}

function formatDate(dateString, format = 'YYYY. MM. DD') {
    if (!dateString) return '';
    try {
        const date = new Date(dateString);
        if (isNaN(date)) return dateString; // 유효하지 않은 날짜는 원본 반환

        if (format === 'YYYY-MM-DD') {
            const tzOffset = date.getTimezoneOffset() * 60000;
            return new Date(date.getTime() - tzOffset).toISOString().split('T')[0];
        }
        return date.toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\.$/, '');
    } catch (e) {
        return dateString;
    }
}

function formatInterviewTime(timeValue) {
    if (!timeValue || String(timeValue).trim() === '-') return '-';
    try {
        // '15:30' 과 같은 간단한 시간 형식도 처리
        if (/^\d{1,2}:\d{2}$/.test(timeValue)) return timeValue;
        
        const date = new Date(timeValue);
        if (isNaN(date.getTime())) return String(timeValue);
        return date.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', hour12: false });
    } catch (e) {
        return String(timeValue);
    }
}

function updateStatCard(elementId, value) {
    const element = document.getElementById(elementId);
    if (element) element.textContent = value;
}

function enhanceAccessibility() {
    document.querySelectorAll('[role]').forEach(el => {
        if (!el.getAttribute('aria-label') && !el.getAttribute('aria-labelledby')) {
            console.warn('접근성 경고: role이 있는 요소에 aria-label 또는 aria-labelledby가 없습니다.', el);
        }
    });
}
