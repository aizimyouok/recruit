import { appState, config } from './state.js';
import * as api from './api.js';
import * as logic from './logic.js';
import * as ui from './ui.js';
import * as charts from './charts.js';

// ===================================================================================
// 애플리케이션 초기화 및 메인 로직
// ===================================================================================

/**
 * 애플리케이션의 메인 진입점
 */
document.addEventListener('DOMContentLoaded', () => {
    ui.initializeTheme();
    setupEventListeners();
    initializeApplication();
});

/**
 * 데이터를 불러와 전체 애플리케이션을 초기화합니다.
 */
async function initializeApplication() {
    ui.showLoadingIndicator(true);
    try {
        const rawData = await api.fetchData();

        // 데이터 파싱 및 상태 저장
        appState.currentHeaders = (rawData[0] || []).map(h => String(h || '').trim());
        appState.allApplicantData = rawData.slice(1)
            .filter(row => row && Array.isArray(row) && row.some(cell => cell != null && String(cell).trim() !== ''))
            .map(row => row.map(cell => cell == null ? '' : String(cell)));

        const gubunIndex = appState.currentHeaders.indexOf('구분');
        if (gubunIndex !== -1 && appState.allApplicantData.length > 0) {
            const sequenceNumbers = appState.allApplicantData.map(row => parseInt(row[gubunIndex], 10)).filter(num => !isNaN(num));
            appState.nextSequenceNumber = sequenceNumbers.length > 0 ? Math.max(...sequenceNumbers) + 1 : 1;
        }

        // 초기 UI 요소 설정
        ui.generateVisibleColumns();
        ui.setupColumnToggles();
        ui.populateDropdownFilters();
        charts.initializeCharts();
        ui.resetFilters(); // 필터 UI와 관련 상태만 초기화

        // --- ✨ 핵심 변경 사항 ✨ ---
        // 1. 필터링 함수를 거치지 않고, 전체 데이터를 정렬하여 초기 데이터로 바로 설정합니다.
        appState.filteredData = logic.sortData(appState.allApplicantData);

        // 2. 화면을 직접 렌더링합니다.
        ui.render();
        // --- ✨ 여기까지 ---

        // 나머지 UI 업데이트
        ui.updateSidebarWidgets();
        ui.updateInterviewSchedule();
        charts.updateStatistics();

    } catch (error) {
        console.error("초기화 실패:", error);
        ui.showErrorIndicator(error.message);
    } finally {
        ui.showLoadingIndicator(false);
    }
}

/**
 * 필터와 정렬을 적용하고 화면을 다시 렌더링합니다.
 */
function applyFiltersAndRender() {
    let data = [...appState.allApplicantData];
    
    // 1. 키워드 검색 필터
    if (appState.filters.searchTerm) {
        data = data.filter(row => row.some(cell => String(cell || '').toLowerCase().includes(appState.filters.searchTerm)));
    }
    // 2. 드롭다운 필터
    const routeFilterValue = document.getElementById('routeFilter').value;
    const positionFilterValue = document.getElementById('positionFilter').value;
    data = data.filter(row => 
        (routeFilterValue === 'all' || String(row[appState.currentHeaders.indexOf('지원루트')] || '') === routeFilterValue) &&
        (positionFilterValue === 'all' || String(row[appState.currentHeaders.indexOf('모집분야')] || '') === positionFilterValue)
    );
    // 3. 날짜 필터
    const dateFilterConfig = {
        mode: appState.ui.activeDateMode,
        start: document.getElementById('startDateInput')?.value,
        end: document.getElementById('endDateInput')?.value,
        singleDate: document.getElementById('dateInput')?.value
    };
    data = logic.filterDataByPeriod(data, appState.currentHeaders.indexOf('지원일'), dateFilterConfig);
    
    // 4. 최종 데이터 상태 업데이트 및 렌더링
    appState.filteredData = logic.sortData(data);
    ui.render();
}


// ===================================================================================
// 이벤트 리스너 설정
// ===================================================================================

/**
 * 페이지의 모든 인터랙션(클릭, 입력 등)을 설정합니다.
 */
function setupEventListeners() {
    // 헤더
    document.querySelector('.mobile-menu-btn').addEventListener('click', ui.toggleMobileMenu);
    document.querySelector('.theme-toggle').addEventListener('click', ui.toggleTheme);
    document.querySelector('.mobile-overlay').addEventListener('click', ui.toggleMobileMenu);

    // 네비게이션 메뉴 (이벤트 위임)
    document.querySelector('.nav-menu').addEventListener('click', e => {
        const navItem = e.target.closest('.nav-item');
        if (navItem && navItem.dataset.page) {
            ui.switchPage(navItem.dataset.page);
            if (navItem.dataset.page === 'stats') {
                charts.updateStatistics();
            }
        }
    });
    
    // 사이드바
    document.getElementById('sidebarPeriodFilter').addEventListener('change', ui.handleSidebarPeriodChange);
    document.getElementById('sidebarDateApplyBtn').addEventListener('click', ui.updateSidebarWidgets);

    // 대시보드 컨트롤 버튼
    document.getElementById('addApplicantBtn').addEventListener('click', ui.openNewApplicantModal);
    document.getElementById('resetFiltersBtn').addEventListener('click', () => ui.resetFilters(false, applyFiltersAndRender));
    document.getElementById('columnToggleBtn').addEventListener('click', ui.toggleColumnDropdown);
    document.getElementById('tableViewBtn').addEventListener('click', () => ui.switchView('table'));
    document.getElementById('cardsViewBtn').addEventListener('click', () => ui.switchView('cards'));
    document.getElementById('columnToggleDropdown').addEventListener('change', e => {
        if (e.target.type === 'checkbox') {
            ui.handleColumnToggle(e.target.id.replace('toggle-', ''), e.target.checked);
        }
    });


    // 필터
    document.getElementById('globalSearch').addEventListener('input', ui.handleSearch(applyFiltersAndRender));
    document.getElementById('routeFilter').addEventListener('change', () => { appState.pagination.currentPage = 1; applyFiltersAndRender(); });
    document.getElementById('positionFilter').addEventListener('change', () => { appState.pagination.currentPage = 1; applyFiltersAndRender(); });

    // 날짜 필터 (이벤트 위임)
    document.getElementById('dateModeToggle').addEventListener('click', e => {
        if (e.target.tagName === 'BUTTON') {
            appState.ui.activeDateMode = e.target.dataset.mode;
            ui.updateDateFilterUI();
            applyFiltersAndRender();
        }
    });
    document.getElementById('dateInputsContainer').addEventListener('change', e => {
        if (e.target.tagName === 'INPUT') applyFiltersAndRender();
    });
    document.getElementById('dateInputsContainer').addEventListener('click', e => {
        if (e.target.classList.contains('date-nav-btn')) {
            ui.navigateDate(Number(e.target.dataset.direction));
            applyFiltersAndRender();
        }
    });
    
    // 테이블 및 카드 클릭 (이벤트 위임)
    const handleDetailView = (e) => {
        const rowEl = e.target.closest('[data-row-index]');
        if (rowEl && e.target.tagName !== 'A') {
            const index = parseInt(rowEl.dataset.rowIndex, 10);
            const rowData = appState.filteredData[index];
            if (rowData) ui.openCardDetail(rowData);
        }
    };
    document.getElementById('tableView').addEventListener('click', handleDetailView);
    document.getElementById('cardsView').addEventListener('click', handleDetailView);
    
    // 테이블 헤더 정렬 클릭 (이벤트 위임)
    document.getElementById('tableView').addEventListener('click', e => {
        const header = e.target.closest('.sortable-header');
        if (header) {
            const column = header.dataset.column;
            if (appState.sorting.column === column) {
                appState.sorting.direction = appState.sorting.direction === 'asc' ? 'desc' : 'asc';
            } else {
                appState.sorting.column = column;
                appState.sorting.direction = 'asc';
            }
            applyFiltersAndRender();
        }
    });

    // 페이지네이션 (이벤트 위임)
    document.getElementById('paginationContainer').addEventListener('click', e => {
        const button = e.target.closest('button');
        if (!button || button.disabled) return;
        
        let newPage = appState.pagination.currentPage;
        if (button.dataset.page) newPage = Number(button.dataset.page);
        else if (button.id === 'firstPageBtn') newPage = 1;
        else if (button.id === 'prevPageBtn') newPage--;
        else if (button.id === 'nextPageBtn') newPage++;
        else if (button.id === 'lastPageBtn') newPage = appState.pagination.totalPages;
        
        if (newPage !== appState.pagination.currentPage) {
            appState.pagination.currentPage = newPage;
            ui.render();
        }
    });

    // 통계 페이지
    document.getElementById('statsRefreshBtn').addEventListener('click', charts.updateStatistics);
    document.getElementById('statsPeriodFilter').addEventListener('change', charts.updateStatistics);
    document.getElementById('statsDateApplyBtn').addEventListener('click', charts.updateStatistics);
    document.querySelector('.efficiency-tabs').addEventListener('click', e => {
        if (e.target.tagName === 'BUTTON') charts.handleEfficiencyTabClick(e.target.dataset.tab);
    });
    document.querySelector('.trend-tabs').addEventListener('click', e => {
        if (e.target.tagName === 'BUTTON') charts.handleTrendTabClick(e.target.dataset.period);
    });

    // 모달 (이벤트 위임)
    document.getElementById('applicantModal').addEventListener('click', async e => {
        const target = e.target.closest('button');
        if (!target) return;

        if (target.matches('.close-btn')) ui.closeModal();
        else if (target.matches('.modal-edit-btn')) ui.openEditModal();
        else if (target.matches('.modal-save-btn')) {
             const action = appState.ui.currentEditingData ? 'update' : 'create';
             const gubun = appState.ui.currentEditingData ? appState.ui.currentEditingData[appState.currentHeaders.indexOf('구분')] : null;
             
             const formData = ui.getFormData();
             if (!formData) return;

             target.innerHTML = '<div class="advanced-loading-spinner" style="width: 20px; height: 20px; margin: 0;"></div>';
             target.disabled = true;

             try {
                await api.saveApplicant(action, formData, gubun);
                alert(`정보가 성공적으로 ${action === 'create' ? '등록' : '수정'}되었습니다.`);
                ui.closeModal();
                initializeApplication();
             } catch(err) {
                alert(err.message);
                target.innerHTML = '저장';
                target.disabled = false;
             }
        }
        else if (target.matches('.modal-delete-btn')) {
            const gubun = appState.ui.currentEditingData[appState.currentHeaders.indexOf('구분')];
            const name = appState.ui.currentEditingData[appState.currentHeaders.indexOf('이름')];
            if (confirm(`정말로 '${name}' 님의 정보를 삭제하시겠습니까?`)) {
                try {
                    await api.deleteApplicant(gubun);
                    alert('성공적으로 삭제되었습니다.');
                    ui.closeModal();
                    initializeApplication();
                } catch(err) {
                    alert(err.message);
                }
            }
        }
    });

    // 동적으로 생성된 요소에 대한 이벤트 리스너 (재시도 버튼)
    document.body.addEventListener('click', e => {
        if (e.target.id === 'retryFetchBtn') {
            initializeApplication();
        }
    });
}
