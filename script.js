// =========================
// 모듈 import
// =========================
import { CONFIG } from './js/config.js';
import { createInitialState } from './js/state.js';
import { Utils } from './js/utils.js';
import { DataModule } from './js/data.js';
import { UIModule } from './js/ui.js';
import { ModalModule } from './modal.js';
import { NavigationModule } from './navigation.js';
import { ThemeModule } from './theme.js';

// =========================
// 애플리케이션 메인 객체
// =========================

const App = {
    // =========================
    // 설정 및 상수 (config.js에서 가져옴)
    // =========================
    config: CONFIG,

    // =========================
    // 애플리케이션 상태 (state.js에서 가져옴)
    // =========================
    state: createInitialState(),

    // =========================
    // 애플리케이션 초기화
    // =========================
    init: {
        async start() {
            App.theme.initialize();
            App.init.setupEventListeners();
            App.init.setupDateFilterListeners();
            
            // 네비게이션 히스토리 초기화
            App.navigation.initializeHistoryHandling();
            App.navigation.addPageTransitionEffects();
            
            await App.data.fetch();
            setTimeout(() => {
                App.utils.enhanceAccessibility();
            }, 1000);
        },

        setupEventListeners() {
            document.addEventListener('click', function(event) {
                const dropdownContainer = document.querySelector('.column-toggle-container');
                if (dropdownContainer && !dropdownContainer.contains(event.target)) {
                    document.getElementById('columnToggleDropdown').style.display = 'none';
                }

                if (window.innerWidth <= 768) {
                    const sidebar = document.getElementById('sidebar');
                    if (sidebar.classList.contains('mobile-open') &&
                        !sidebar.contains(event.target) &&
                        !event.target.closest('.mobile-menu-btn')) {
                        App.ui.toggleMobileMenu();
                    }
                }
            });
        },

        setupDateFilterListeners() {
            try {
                const dateModeToggle = document.getElementById('dateModeToggle');
                if (dateModeToggle) {
                    dateModeToggle.addEventListener('click', (e) => {
                        if (e.target.tagName === 'BUTTON') {
                            App.state.ui.activeDateMode = e.target.dataset.mode;
                            App.filter.updateDateFilterUI();
                            App.filter.apply();
                        }
                    });
                } else {
                    console.warn('dateModeToggle 요소를 찾을 수 없습니다.');
                }
            } catch (error) {
                console.error('날짜 필터 리스너 설정 실패:', error);
            }
        }
    },

    // =========================
    // 테마 관련 (모듈에서 가져옴)
    // =========================
    theme: {
        initialize: () => ThemeModule.initialize(),
        toggle: () => ThemeModule.toggle(),
        updateIcon: (theme) => ThemeModule.updateIcon(theme),
        getCurrentTheme: () => ThemeModule.getCurrentTheme(),
        setTheme: (theme) => ThemeModule.setTheme(theme),
        getSystemTheme: () => ThemeModule.getSystemTheme(),
        reset: () => ThemeModule.reset(),
        onThemeChange: (callback) => ThemeModule.onThemeChange(callback),
        getThemeInfo: () => ThemeModule.getThemeInfo()
    },

    // =========================
    // 네비게이션 관련 (모듈에서 가져옴)
    // =========================
    navigation: {
        switchPage: (pageId) => NavigationModule.switchPage(App, pageId),
        handlePageSpecificActions: (pageId) => NavigationModule.handlePageSpecificActions(App, pageId),
        closeMobileSidebarIfOpen: () => NavigationModule.closeMobileSidebarIfOpen(),
        getCurrentPage: () => NavigationModule.getCurrentPage(),
        updateHistory: (pageId) => NavigationModule.updateHistory(pageId),
        initializeHistoryHandling: () => NavigationModule.initializeHistoryHandling(App),
        addPageTransitionEffects: () => NavigationModule.addPageTransitionEffects(),
        switchPageWithoutHistory: (pageId) => NavigationModule.switchPageWithoutHistory(App, pageId)
    },

    // =========================
    // UI 관련
    // =========================
    ui: {
        toggleMobileMenu: () => UIModule.toggleMobileMenu(),
        toggleColumnDropdown: () => UIModule.toggleColumnDropdown(),
        handleColumnToggle: (event, columnName) => UIModule.handleColumnToggle(App, event, columnName),
        setupColumnToggles: () => UIModule.setupColumnToggles(App),
        showLoadingState: (container) => UIModule.showLoadingState(container, App),
        updateProgress: (container, percentage, text) => UIModule.updateProgress(container, percentage, text),
        showErrorState: (container, error) => UIModule.showErrorState(container, error, App)
    },

    // =========================
    // 데이터 관련
    // =========================
    data: {
        fetch: () => DataModule.fetch(App),
        updateSequenceNumber: () => DataModule.updateSequenceNumber(App),
        updateInterviewSchedule: () => DataModule.updateInterviewSchedule(App),
        showInterviewDetails: (name, route) => DataModule.showInterviewDetails(App, name, route),
        save: (data, isUpdate, gubun) => DataModule.save(App, data, isUpdate, gubun),
        delete: (gubun) => DataModule.delete(App, gubun)
    },

    // =========================
    // 모달 관련 (모듈에서 가져옴)
    // =========================
    modal: {
        get element() {
            return ModalModule.element;
        },
        openNew: () => ModalModule.openNew(App),
        openDetail: (rowData) => ModalModule.openDetail(App, rowData),
        openEdit: () => ModalModule.openEdit(App),
        close: () => ModalModule.close(App),
        buildForm: (data, isReadOnly) => ModalModule.buildForm(App, data, isReadOnly),
        createInput: (header, value, isRequired, isDisabled) => ModalModule.createInput(App, header, value, isRequired, isDisabled),
        createDropdownInput: (header, value, isRequired, isDisabled) => ModalModule.createDropdownInput(App, header, value, isRequired, isDisabled),
        handleDropdownChange: (selectElement, fieldName) => ModalModule.handleDropdownChange(selectElement, fieldName),
        saveNew: () => ModalModule.saveNew(App),
        saveEdit: () => ModalModule.saveEdit(App),
        delete: () => ModalModule.delete(App),
        collectFormData: () => ModalModule.collectFormData(App),
        validateFormData: (data) => ModalModule.validateFormData(App, data),
        prepareTimeData: (data) => ModalModule.prepareTimeData(data)
    },

    // =========================
    // 검색 관련
    // =========================
    search: {
        handle() {
            if (App.state.ui.searchTimeout) {
                clearTimeout(App.state.ui.searchTimeout);
            }

            App.state.ui.searchTimeout = setTimeout(() => {
                App.state.ui.searchTerm = String(document.getElementById('globalSearch').value || '').toLowerCase();
                App.state.ui.currentPage = 1;
                App.filter.apply();
            }, 300);
        }
    },

    // =========================
    // 필터 관련
    // =========================
    filter: {
        apply() {
            let data = [...App.state.data.all];
            console.log('필터 적용 시작 - 원본 데이터:', data.length);

            const routeFilter = document.getElementById('routeFilter').value;
            const positionFilter = document.getElementById('positionFilter').value;
            const applyDateIndex = App.state.data.headers.indexOf('지원일');
            const routeIndex = App.state.data.headers.indexOf('지원루트');
            const positionIndex = App.state.data.headers.indexOf('모집분야');

            if (App.state.ui.searchTerm) {
                data = data.filter(row => row.some(cell => String(cell || '').toLowerCase().includes(App.state.ui.searchTerm)));
            }

            if (routeFilter !== 'all' && routeIndex !== -1) {
                data = data.filter(row => String(row[routeIndex] || '') === routeFilter);
            }

            if (positionFilter !== 'all' && positionIndex !== -1) {
                data = data.filter(row => String(row[positionIndex] || '') === positionFilter);
            }

            if (applyDateIndex !== -1 && App.state.ui.activeDateMode !== 'all') {
                data = App.filter.applyDateFilter(data, applyDateIndex);
            }

            App.state.data.filtered = App.utils.sortData(data);
            console.log('필터 적용 완료 - 필터링된 데이터:', App.state.data.filtered.length);ㅂ

            App.pagination.updateTotal();
            App.filter.updateSummary();

            const pageData = App.pagination.getCurrentPageData();
            console.log('렌더링할 페이지 데이터:', pageData.length);

            if (App.state.ui.currentView === 'table') {
                App.render.table(pageData);
            } else {
                App.render.cards(pageData);
            }

            App.pagination.updateUI();
        },

        applyDateFilter(data, applyDateIndex) {
            try {
                if (App.state.ui.activeDateMode === 'year') {
                    const dateInput = document.getElementById('dateInput');
                    const year = dateInput ? dateInput.value : null;
                    if(year) return data.filter(row => row[applyDateIndex] && new Date(row[applyDateIndex]).getFullYear() == year);
                } else if (App.state.ui.activeDateMode === 'month') {
                    const dateInput = document.getElementById('dateInput');
                    const month = dateInput ? dateInput.value : null;
                    if(month) return data.filter(row => String(row[applyDateIndex] || '').slice(0, 7) === month);
                } else if (App.state.ui.activeDateMode === 'day') {
                    const dateInput = document.getElementById('dateInput');
                    const day = dateInput ? dateInput.value : null;
                    if(day) return data.filter(row => String(row[applyDateIndex] || '').slice(0, 10) === day);
                } else if (App.state.ui.activeDateMode === 'range') {
                    const startDateInput = document.getElementById('startDateInput');
                    const endDateInput = document.getElementById('endDateInput');
                    const startDate = startDateInput ? startDateInput.value : null;
                    const endDate = endDateInput ? endDateInput.value : null;
                    
                    if (startDate && endDate) {
                        const start = new Date(startDate);
                        const end = new Date(endDate);
                        end.setHours(23, 59, 59, 999);
                        return data.filter(row => {
                            if(!row[applyDateIndex]) return false;
                            const applyDate = new Date(row[applyDateIndex]);
                            return applyDate >= start && applyDate <= end;
                        });
                    }
                }
            } catch(e) {
                console.error("날짜 필터링 오류", e);
            }
            return data;
        },

        reset(runApplyFilters = true) {
            document.querySelectorAll('.filter-bar select').forEach(select => select.value = 'all');
            document.getElementById('globalSearch').value = '';
            App.state.ui.searchTerm = '';
            App.state.ui.activeDateMode = 'all';
            App.state.ui.currentPage = 1;
            App.filter.updateDateFilterUI();
            if (runApplyFilters) {
                console.log('필터 리셋 중 - 전체 데이터 개수:', App.state.data.all.length);
                App.filter.apply();
            }
        },

        updateSummary() {
            const filteredCount = App.state.data.filtered.length;
            const searchText = App.state.ui.searchTerm ? ` (검색: "${App.state.ui.searchTerm}")` : '';
            const pageInfo = filteredCount > App.config.ITEMS_PER_PAGE ? ` - ${App.state.ui.currentPage}/${App.state.ui.totalPages} 페이지` : '';
            document.getElementById('filterSummary').innerHTML = `<strong>지원자:</strong> ${filteredCount}명${searchText}${pageInfo}`;
        },

        populateDropdowns() {
            const routeIndex = App.state.data.headers.indexOf('지원루트');
            const positionIndex = App.state.data.headers.indexOf('모집분야');

            if (routeIndex !== -1) {
                const routes = [...new Set(App.state.data.all.map(row => String(row[routeIndex] || '').trim()).filter(Boolean))];
                const routeFilter = document.getElementById('routeFilter');
                routeFilter.innerHTML = '<option value="all">전체</option>';
                routes.sort().forEach(route => routeFilter.innerHTML += `<option value="${route}">${route}</option>`);
            }

            if (positionIndex !== -1) {
                const positions = [...new Set(App.state.data.all.map(row => String(row[positionIndex] || '').trim()).filter(Boolean))];
                const positionFilter = document.getElementById('positionFilter');
                positionFilter.innerHTML = '<option value="all">전체</option>';
                positions.sort().forEach(pos => positionFilter.innerHTML += `<option value="${pos}">${pos}</option>`);
            }
        },

        updateDateFilterUI() {
            try {
                document.querySelectorAll('.date-mode-btn').forEach(btn =>
                    btn.classList.toggle('active', btn.dataset.mode === App.state.ui.activeDateMode)
                );

                const container = document.getElementById('dateInputsContainer');
                if (!container) {
                    console.warn('dateInputsContainer 요소를 찾을 수 없습니다.');
                    return;
                }

                let html = '';
                const now = new Date();
                const year = now.getFullYear();
                const month = (now.getMonth() + 1).toString().padStart(2, '0');
                const day = now.getDate().toString().padStart(2, '0');

                if (App.state.ui.activeDateMode === 'all') {
                    html = `<span style="color: var(--text-secondary); font-size: 0.9rem; padding: 0 10px;">모든 데이터 표시</span>`;
                } else if (App.state.ui.activeDateMode === 'year') {
                    html = `<input type="number" id="dateInput" value="${year}" onchange="globalThis.App && globalThis.App.filter && globalThis.App.filter.apply()">`;
                } else if (App.state.ui.activeDateMode === 'month') {
                    html = `<button class="date-nav-btn" onclick="globalThis.App && globalThis.App.filter && globalThis.App.filter.navigateDate(-1)">&lt;</button><input type="month" id="dateInput" value="${year}-${month}" onchange="globalThis.App && globalThis.App.filter && globalThis.App.filter.apply()"><button class="date-nav-btn" onclick="globalThis.App && globalThis.App.filter && globalThis.App.filter.navigateDate(1)">&gt;</button>`;
                } else if (App.state.ui.activeDateMode === 'day') {
                    html = `<button class="date-nav-btn" onclick="globalThis.App && globalThis.App.filter && globalThis.App.filter.navigateDate(-1)">&lt;</button><input type="date" id="dateInput" value="${year}-${month}-${day}" onchange="globalThis.App && globalThis.App.filter && globalThis.App.filter.apply()"><button class="date-nav-btn" onclick="globalThis.App && globalThis.App.filter && globalThis.App.filter.navigateDate(1)">&gt;</button>`;
                } else if (App.state.ui.activeDateMode === 'range') {
                    html = `<input type="date" id="startDateInput" onchange="globalThis.App && globalThis.App.filter && globalThis.App.filter.apply()"><span style="margin: 0 5px;">-</span><input type="date" id="endDateInput" onchange="globalThis.App && globalThis.App.filter && globalThis.App.filter.apply()">`;
                }
                container.innerHTML = html;
            } catch (error) {
                console.error('날짜 필터 UI 업데이트 오류:', error);
            }
        },

        navigateDate(direction) {
            try {
                const input = document.getElementById('dateInput');
                if (!input) return;

                if (App.state.ui.activeDateMode === 'year') {
                    input.value = Number(input.value) + direction;
                } else {
                    let currentDate = (App.state.ui.activeDateMode === 'month') ? new Date(input.value + '-02') : new Date(input.value);
                    if(App.state.ui.activeDateMode === 'month') currentDate.setMonth(currentDate.getMonth() + direction);
                    else if (App.state.ui.activeDateMode === 'day') currentDate.setDate(currentDate.getDate() + direction);
                    input.value = currentDate.toISOString().slice(0, App.state.ui.activeDateMode === 'month' ? 7 : 10);
                }
                App.filter.apply();
            } catch (error) {
                console.error('날짜 네비게이션 오류:', error);
            }
        }
    },

    // =========================
    // 페이지네이션 관련
    // =========================
    pagination: {
        updateTotal() {
            App.state.ui.totalPages = Math.ceil(App.state.data.filtered.length / App.config.ITEMS_PER_PAGE);
            if (App.state.ui.currentPage > App.state.ui.totalPages && App.state.ui.totalPages > 0) {
                App.state.ui.currentPage = App.state.ui.totalPages;
            } else if (App.state.ui.totalPages === 0) {
                App.state.ui.currentPage = 1;
            }
        },

        getCurrentPageData() {
            const startIndex = (App.state.ui.currentPage - 1) * App.config.ITEMS_PER_PAGE;
            const endIndex = Math.min(startIndex + App.config.ITEMS_PER_PAGE, App.state.data.filtered.length);
            return App.state.data.filtered.slice(startIndex, endIndex);
        },

        goToPage(page) {
            if (page >= 1 && page <= App.state.ui.totalPages) {
                App.state.ui.currentPage = page;
                const pageData = App.pagination.getCurrentPageData();
                if (App.state.ui.currentView === 'table') {
                    App.render.table(pageData);
                } else {
                    App.render.cards(pageData);
                }
                App.pagination.updateUI();
            }
        },

        goToPrevPage() {
            App.pagination.goToPage(App.state.ui.currentPage - 1);
        },

        goToNextPage() {
            App.pagination.goToPage(App.state.ui.currentPage + 1);
        },

        goToLastPage() {
            App.pagination.goToPage(App.state.ui.totalPages);
        },

        updateUI() {
            const paginationContainer = document.getElementById('paginationContainer');
            const paginationInfo = document.getElementById('paginationInfo');
            const paginationNumbers = document.getElementById('paginationNumbers');
            const firstPageBtn = document.getElementById('firstPageBtn');
            const prevPageBtn = document.getElementById('prevPageBtn');
            const nextPageBtn = document.getElementById('nextPageBtn');
            const lastPageBtn = document.getElementById('lastPageBtn');

            if (App.state.data.filtered.length === 0) {
                paginationContainer.style.display = 'none';
                return;
            }

            paginationContainer.style.display = 'flex';

            const startItem = (App.state.ui.currentPage - 1) * App.config.ITEMS_PER_PAGE + 1;
            const endItem = Math.min(App.state.ui.currentPage * App.config.ITEMS_PER_PAGE, App.state.data.filtered.length);
            paginationInfo.textContent = `${startItem}-${endItem} / ${App.state.data.filtered.length}명`;

            firstPageBtn.disabled = App.state.ui.currentPage === 1;
            prevPageBtn.disabled = App.state.ui.currentPage === 1;
            nextPageBtn.disabled = App.state.ui.currentPage === App.state.ui.totalPages;
            lastPageBtn.disabled = App.state.ui.currentPage === App.state.ui.totalPages;

            App.pagination.renderPageNumbers(paginationNumbers);
        },

        renderPageNumbers(container) {
            container.innerHTML = '';
            const maxVisiblePages = 5;
            let startPage = Math.max(1, App.state.ui.currentPage - Math.floor(maxVisiblePages / 2));
            let endPage = Math.min(App.state.ui.totalPages, startPage + maxVisiblePages - 1);

            if (endPage - startPage + 1 < maxVisiblePages) {
                startPage = Math.max(1, endPage - maxVisiblePages + 1);
            }

            if (startPage > 1) {
                const firstPageNum = document.createElement('button');
                firstPageNum.className = 'pagination-number';
                firstPageNum.textContent = '1';
                firstPageNum.onclick = () => App.pagination.goToPage(1);
                container.appendChild(firstPageNum);

                if (startPage > 2) {
                    const ellipsis = document.createElement('span');
                    ellipsis.className = 'pagination-ellipsis';
                    ellipsis.textContent = '...';
                    container.appendChild(ellipsis);
                }
            }

            for (let i = startPage; i <= endPage; i++) {
                const pageNum = document.createElement('button');
                pageNum.className = `pagination-number ${i === App.state.ui.currentPage ? 'active' : ''}`;
                pageNum.textContent = i;
                pageNum.onclick = () => App.pagination.goToPage(i);
                container.appendChild(pageNum);
            }

            if (endPage < App.state.ui.totalPages) {
                if (endPage < App.state.ui.totalPages - 1) {
                    const ellipsis = document.createElement('span');
                    ellipsis.className = 'pagination-ellipsis';
                    ellipsis.textContent = '...';
                    container.appendChild(ellipsis);
                }

                const lastPageNum = document.createElement('button');
                lastPageNum.className = 'pagination-number';
                lastPageNum.textContent = App.state.ui.totalPages;
                lastPageNum.onclick = () => App.pagination.goToPage(App.state.ui.totalPages);
                container.appendChild(lastPageNum);
            }
        }
    },

    // =========================
    // 뷰 관련 (테이블/카드)
    // =========================
    view: {
        switch(viewType) {
            App.state.ui.currentView = viewType;
            const tableView = document.getElementById('tableView');
            const cardsView = document.getElementById('cardsView');
            const viewBtns = document.querySelectorAll('.view-btn');

            // 모든 버튼에서 active 클래스 제거
            viewBtns.forEach(btn => btn.classList.remove('active'));
            
            // 선택된 뷰 버튼에 active 클래스 추가 (더 안전한 방법으로)
            const targetBtn = document.querySelector(`.view-btn[onclick*="'${viewType}'"]`);
            if (targetBtn) {
                targetBtn.classList.add('active');
            }

            const pageData = App.pagination.getCurrentPageData();

            if (viewType === 'table') {
                tableView.style.display = 'block';
                cardsView.style.display = 'none';
                cardsView.classList.remove('active');
                App.render.table(pageData);
                console.log('📋 테이블 뷰로 전환');
            } else if (viewType === 'cards') {
                tableView.style.display = 'none';
                cardsView.style.display = 'grid';
                cardsView.classList.add('active');
                App.render.cards(pageData);
                console.log('📱 카드 뷰로 전환');
            }
        }
    },

    // =========================
    // 렌더링 관련
    // =========================
    render: {
        currentView() {
            const pageData = App.pagination.getCurrentPageData();
            if (App.state.ui.currentView === 'table') {
                App.render.table(pageData);
            } else {
                App.render.cards(pageData);
            }
        },

        table(dataToRender) {
            const tableContainer = document.querySelector('.table-container');

            if (!dataToRender && App.state.data.all.length === 0) {
                tableContainer.innerHTML = App.utils.createSkeletonTable();
                return;
            }

            const renderData = dataToRender || [];

            tableContainer.innerHTML = '';
            const table = document.createElement('table');
            table.className = 'data-table';
            table.setAttribute('role', 'table');
            table.setAttribute('aria-label', '지원자 목록 테이블');

            App.render.tableHeader(table);
            App.render.tableBody(table, renderData);

            tableContainer.appendChild(table);
        },

        tableHeader(table) {
            const thead = table.createTHead();
            const headerRow = thead.insertRow();

            App.state.data.headers.forEach(header => {
                if (App.state.ui.visibleColumns[header]) {
                    const th = document.createElement('th');
                    th.className = 'sortable-header';
                    th.setAttribute('role', 'columnheader');
                    th.setAttribute('tabindex', '0');
                    th.setAttribute('aria-sort', 'none');
                    th.onclick = () => App.table.sort(header);

                    th.addEventListener('keydown', (e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            th.click();
                        }
                    });

                    let sortIcon = 'fa-sort';
                    if (App.state.ui.currentSortColumn === header && App.state.ui.currentSortDirection) {
                        sortIcon = App.state.ui.currentSortDirection === 'asc' ? 'fa-sort-up' : 'fa-sort-down';
                    }

                    th.innerHTML = `${header} <i class="fas ${sortIcon} sort-icon ${App.state.ui.currentSortColumn === header ? 'active' : ''}"></i>`;
                    headerRow.appendChild(th);
                }
            });
        },

        tableBody(table, dataToRender) {
            const tbody = table.createTBody();

            if (!dataToRender || dataToRender.length === 0) {
                const row = tbody.insertRow();
                const cell = row.insertCell();
                cell.colSpan = Object.values(App.state.ui.visibleColumns).filter(Boolean).length || 1;
                cell.textContent = '표시할 데이터가 없습니다.';
                cell.style.textAlign = 'center';
                cell.style.padding = '40px';
                return;
            }

            let interviewDateIndex = App.state.data.headers.indexOf('면접 날짜');
            if (interviewDateIndex === -1) interviewDateIndex = App.state.data.headers.indexOf('면접 날자');

            dataToRender.forEach((rowData, index) => {
                const row = tbody.insertRow();
                row.id = `row-${index}`;

                row.onclick = (event) => {
                    if (event.target.tagName !== 'A') {
                        App.modal.openDetail(rowData);
                    }
                };

                if (interviewDateIndex !== -1) {
                    const urgency = App.utils.getInterviewUrgency(rowData[interviewDateIndex]);
                    if (urgency >= 0) row.classList.add(`urgent-interview-${urgency}`);
                }

                App.render.tableCells(row, rowData, index);
            });
        },

        tableCells(row, rowData, index) {
            App.state.data.headers.forEach((header, cellIndex) => {
                if (App.state.ui.visibleColumns[header]) {
                    const cell = row.insertCell();
                    let cellData = rowData[cellIndex];

                    if (header === '구분') {
                        const displaySequence = (App.state.ui.currentPage - 1) * App.config.ITEMS_PER_PAGE + index + 1;
                        cellData = displaySequence;
                    }

                    const statusClass = App.utils.getStatusClass(header, cellData);
                    if (statusClass) {
                        cell.innerHTML = `<span class="status-badge ${statusClass}">${String(cellData || '')}</span>`;
                    } else if (header === '연락처' && cellData) {
                        cell.innerHTML = `<a href="tel:${String(cellData).replace(/\D/g, '')}">${cellData}</a>`;
                    } else if (header === '면접 시간' && cellData) {
                        cell.textContent = App.utils.formatInterviewTime(cellData);
                    } else if ((header.includes('날짜') || header.includes('날자') || header.includes('지원일') || header.includes('입과일')) && cellData) {
                        cell.textContent = App.utils.formatDate(cellData);
                    } else {
                        cell.textContent = String(cellData || '');
                    }
                }
            });
        },

        cards(dataToRender) {
            const cardsContainer = document.getElementById('cardsView');
            cardsContainer.innerHTML = '';

            if (!dataToRender || dataToRender.length === 0) {
                cardsContainer.innerHTML = '<p style="text-align:center; padding: 40px; grid-column: 1/-1;">표시할 데이터가 없습니다.</p>';
                return;
            }

            let interviewDateIndex = App.state.data.headers.indexOf('면접 날짜');
            if (interviewDateIndex === -1) interviewDateIndex = App.state.data.headers.indexOf('면접 날자');

            dataToRender.forEach((rowData, index) => {
                const card = document.createElement('div');
                card.className = 'applicant-card';
                card.onclick = () => App.modal.openDetail(rowData);

                if (interviewDateIndex !== -1) {
                    const urgency = App.utils.getInterviewUrgency(rowData[interviewDateIndex]);
                    if (urgency >= 0) card.classList.add(`urgent-card-${urgency}`);
                }

                const getVal = (header) => String(rowData[App.state.data.headers.indexOf(header)] || '-');
                const name = getVal('이름');
                const phone = getVal('연락처');
                const route = getVal('지원루트');
                const position = getVal('모집분야');
                let date = getVal('지원일');

                if(date !== '-') {
                    try {
                        date = new Date(date).toLocaleDateString('ko-KR');
                    } catch(e) {}
                }

                const displaySequence = (App.state.ui.currentPage - 1) * App.config.ITEMS_PER_PAGE + index + 1;

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
    },

    // =========================
    // 테이블 관련
    // =========================
    table: {
        sort(columnName) {
            if (App.state.ui.currentSortColumn === columnName) {
                App.state.ui.currentSortDirection = App.state.ui.currentSortDirection === 'asc' ? 'desc' : '';
                if (App.state.ui.currentSortDirection === '') {
                    App.state.ui.currentSortColumn = '지원일';
                    App.state.ui.currentSortDirection = 'desc';
                }
            } else {
                App.state.ui.currentSortColumn = columnName;
                App.state.ui.currentSortDirection = 'asc';
            }
            App.filter.apply();
        }
    },

    // =========================
    // 사이드바 관련
    // =========================
    sidebar: {
        handlePeriodChange() {
            const selectedPeriod = document.getElementById('sidebarPeriodFilter').value;
            const customRange = document.getElementById('sidebarCustomDateRange');

            if (selectedPeriod === 'custom') {
                customRange.style.display = 'block';
            } else {
                customRange.style.display = 'none';
                App.sidebar.updateWidgets();
            }
        },

        updateWidgets() {
            const selectedPeriod = document.getElementById('sidebarPeriodFilter')?.value || 'all';
            const applyDateIndex = App.state.data.headers.indexOf('지원일');

            let filteredApplicants = [...App.state.data.all];
            let periodLabel = '전체 기간';

            if (applyDateIndex !== -1 && selectedPeriod !== 'all') {
                const result = App.sidebar.filterByPeriod(filteredApplicants, selectedPeriod, applyDateIndex);
                filteredApplicants = result.data;
                periodLabel = result.label;
            }

            const stats = App.sidebar.calculateStats(filteredApplicants);
            App.sidebar.updateUI(stats, periodLabel);

            if (document.getElementById('stats').classList.contains('active')) {
                App.stats.update();
            }
        },

        filterByPeriod(data, selectedPeriod, applyDateIndex) {
            const now = new Date();
            let filteredData = [...data];
            let label = '전체 기간';

            if (selectedPeriod === 'custom') {
                const startDate = document.getElementById('sidebarStartDate')?.value;
                const endDate = document.getElementById('sidebarEndDate')?.value;

                if (startDate && endDate) {
                    const start = new Date(startDate);
                    const end = new Date(endDate);
                    end.setHours(23, 59, 59, 999);

                    filteredData = data.filter(row => {
                        try {
                            const dateValue = row[applyDateIndex];
                            if (!dateValue) return false;
                            const date = new Date(dateValue);
                            return date >= start && date <= end;
                        } catch (e) { return false; }
                    });

                    label = `${startDate} ~ ${endDate}`;
                }
            } else {
                const result = App.utils.filterDataByPeriod(data, selectedPeriod, applyDateIndex, now);
                filteredData = result.data;
                label = result.label;
            }

            return { data: filteredData, label };
        },

        calculateStats(filteredApplicants) {
            const contactResultIndex = App.state.data.headers.indexOf('1차 컨택 결과');
            const interviewResultIndex = App.state.data.headers.indexOf('면접결과');
            const joinDateIndex = App.state.data.headers.indexOf('입과일');

            const totalCount = filteredApplicants.length;

            let interviewPendingCount = 0;
            if (contactResultIndex !== -1) {
                interviewPendingCount = filteredApplicants.filter(row => {
                    const contactResult = String(row[contactResultIndex] || '').trim();
                    return contactResult === '면접확정';
                }).length;
            }

            let successRate = 0;
            if (contactResultIndex !== -1 && interviewResultIndex !== -1) {
                const interviewConfirmed = filteredApplicants.filter(row => {
                    const contactResult = String(row[contactResultIndex] || '').trim();
                    return contactResult === '면접확정';
                });

                const passed = interviewConfirmed.filter(row => {
                    const interviewResult = String(row[interviewResultIndex] || '').trim();
                    return interviewResult === '합격';
                });

                successRate = interviewConfirmed.length > 0 ? Math.round((passed.length / interviewConfirmed.length) * 100) : 0;
            }

            let joinRate = 0;
            if (interviewResultIndex !== -1 && joinDateIndex !== -1) {
                const passedApplicants = filteredApplicants.filter(row => {
                    const interviewResult = String(row[interviewResultIndex] || '').trim();
                    return interviewResult === '합격';
                });

                const joinedApplicants = passedApplicants.filter(row => {
                    const joinDate = String(row[joinDateIndex] || '').trim();
                    return joinDate !== '' && joinDate !== '-';
                });

                joinRate = passedApplicants.length > 0 ? Math.round((joinedApplicants.length / passedApplicants.length) * 100) : 0;
            }

            return { totalCount, interviewPendingCount, successRate, joinRate };
        },

        updateUI(stats, periodLabel) {
            document.getElementById('sidebarTotalApplicants').textContent = stats.totalCount;
            document.getElementById('sidebarPeriodLabel').textContent = periodLabel;
            document.getElementById('sidebarInterviewPending').textContent = stats.interviewPendingCount;
            document.getElementById('sidebarSuccessRate').textContent = stats.successRate + '%';
            document.getElementById('sidebarJoinRate').textContent = stats.joinRate + '%';
        }
    },

    // =========================
    // 통계 관련
    // =========================
    stats: {
        handlePeriodChange() {
            const selectedPeriod = document.getElementById('statsPeriodFilter').value;
            const customRange = document.getElementById('statsCustomDateRange');

            if (selectedPeriod === 'custom') {
                customRange.style.display = 'flex';
            } else {
                customRange.style.display = 'none';
                App.stats.update();
            }
        },

        update() {
            if (!App.state.data.all || App.state.data.all.length === 0) {
                console.log('데이터가 없어서 통계 업데이트 불가');
                return;
            }

            try {
                const selectedPeriod = document.getElementById('statsPeriodFilter')?.value || 'all';
                const applyDateIndex = App.state.data.headers.indexOf('지원일');

                let filteredApplicants = [...App.state.data.all];
                let periodLabel = '전체 기간';

                if (applyDateIndex !== -1 && selectedPeriod !== 'all') {
                    const result = App.stats.filterByPeriod(filteredApplicants, selectedPeriod, applyDateIndex);
                    filteredApplicants = result.data;
                    periodLabel = result.label;
                }

                const stats = App.sidebar.calculateStats(filteredApplicants);
                App.stats.updateStatCards(stats, periodLabel);

                if (window.Chart && Object.keys(App.state.charts.instances).length > 0) {
                    App.charts.updateData(filteredApplicants);
                }

                App.trend.update(filteredApplicants, applyDateIndex);

            } catch (error) {
                console.error('❌ 통계 데이터 업데이트 실패:', error);
            }
        },

        filterByPeriod(data, selectedPeriod, applyDateIndex) {
            return App.sidebar.filterByPeriod(data, selectedPeriod, applyDateIndex);
        },

        updateStatCards(stats, periodLabel) {
            App.utils.updateElement('totalApplicantsChart', stats.totalCount);
            App.utils.updateElement('statsTimePeriod', periodLabel);
            App.utils.updateElement('pendingInterviewChart', stats.interviewPendingCount);
            App.utils.updateElement('successRateChart', stats.successRate + '%');
            App.utils.updateElement('joinRateChart', stats.joinRate + '%');
        }
    },

    // =========================
    // 차트 관련
    // =========================
    charts: {
        initialize() {
            if (!window.Chart) {
                console.error('Chart.js가 로드되지 않았습니다.');
                return;
            }

            try {
                App.charts.createRouteChart();
                App.charts.createPositionChart();
                App.charts.createTrendChart();
                App.charts.createRegionChart();
                App.charts.createGenderChart();
                App.charts.createAgeChart();

                console.log('📊 기본 차트 초기화 완료');

            } catch (error) {
                console.error('기본 차트 초기화 실패:', error);
            }
        },

        initializeEfficiency() {
            if (!window.Chart) {
                console.error('Chart.js가 로드되지 않았습니다.');
                return;
            }

            try {
                App.charts.createRadarChart();
                App.charts.createScatterChart();

                console.log('📈 효율성 차트 초기화 완료');

            } catch (error) {
                console.error('효율성 차트 초기화 실패:', error);
            }
        },

        createRouteChart() {
            const routeCtx = document.getElementById('routeChart');
            if (routeCtx && !App.state.charts.instances.route) {
                App.state.charts.instances.route = new Chart(routeCtx, {
                    type: 'bar',
                    data: {
                        labels: ['데이터 로딩 중...'],
                        datasets: [{
                            data: [1],
                            backgroundColor: App.config.CHART_COLORS.primary,
                            borderColor: App.config.CHART_COLORS.primary,
                            borderWidth: 1
                        }]
                    },
                    options: {
                        indexAxis: 'y',
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            legend: { display: false }
                        },
                        scales: {
                            x: { beginAtZero: true }
                        }
                    }
                });
            }
        },

        createPositionChart() {
            const positionCtx = document.getElementById('positionChart');
            if (positionCtx && !App.state.charts.instances.position) {
                App.state.charts.instances.position = new Chart(positionCtx, {
                    type: 'bar',
                    data: {
                        labels: ['데이터 로딩 중...'],
                        datasets: [{
                            data: [1],
                            backgroundColor: App.config.CHART_COLORS.success,
                            borderColor: App.config.CHART_COLORS.success,
                            borderWidth: 1
                        }]
                    },
                    options: {
                        indexAxis: 'y',
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            legend: { display: false }
                        },
                        scales: {
                            x: { beginAtZero: true }
                        }
                    }
                });
            }
        },

        createTrendChart() {
            const trendCtx = document.getElementById('trendChart');
            if (trendCtx && !App.state.charts.instances.trend) {
                App.state.charts.instances.trend = new Chart(trendCtx, {
                    type: 'line',
                    data: {
                        labels: ['데이터 로딩 중...'],
                        datasets: [{
                            label: '지원자 수',
                            data: [0],
                            borderColor: App.config.CHART_COLORS.primary,
                            backgroundColor: App.config.CHART_COLORS.primary + '20',
                            tension: 0.4,
                            fill: true
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        scales: {
                            y: {
                                beginAtZero: true,
                                ticks: { stepSize: 1 }
                            }
                        }
                    }
                });
            }
        },

        createRegionChart() {
            const regionCtx = document.getElementById('regionChart');
            if (regionCtx && !App.state.charts.instances.region) {
                App.state.charts.instances.region = new Chart(regionCtx, {
                    type: 'doughnut',
                    data: {
                        labels: ['데이터 로딩 중...'],
                        datasets: [{
                            data: [1],
                            backgroundColor: [
                                App.config.CHART_COLORS.primary,
                                App.config.CHART_COLORS.success,
                                App.config.CHART_COLORS.warning,
                                App.config.CHART_COLORS.danger,
                                App.config.CHART_COLORS.orange
                            ]
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            legend: { position: 'bottom' }
                        }
                    }
                });
            }
        },

        createGenderChart() {
            const genderCtx = document.getElementById('genderChart');
            if (genderCtx && !App.state.charts.instances.gender) {
                App.state.charts.instances.gender = new Chart(genderCtx, {
                    type: 'pie',
                    data: {
                        labels: ['데이터 로딩 중...'],
                        datasets: [{
                            data: [1],
                            backgroundColor: [App.config.CHART_COLORS.primary, App.config.CHART_COLORS.warning]
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            legend: { position: 'bottom' }
                        }
                    }
                });
            }
        },

        createAgeChart() {
            const ageCtx = document.getElementById('ageChart');
            if (ageCtx && !App.state.charts.instances.age) {
                App.state.charts.instances.age = new Chart(ageCtx, {
                    type: 'bar',
                    data: {
                        labels: ['데이터 로딩 중...'],
                        datasets: [{
                            data: [1],
                            backgroundColor: App.config.CHART_COLORS.success,
                            borderColor: App.config.CHART_COLORS.success,
                            borderWidth: 1
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            legend: { display: false }
                        },
                        scales: {
                            y: { beginAtZero: true }
                        }
                    }
                });
            }
        },

        createRadarChart() {
            const radarCtx = document.getElementById('radarChart');
            if (radarCtx && !App.state.charts.instances.radar) {
                App.state.charts.instances.radar = new Chart(radarCtx, {
                    type: 'radar',
                    data: {
                        labels: ['지원자 수', '면접확정률', '합격률', '입과율'],
                        datasets: [{
                            label: '데이터 로딩 중...',
                            data: [1, 1, 1, 1],
                            borderColor: App.config.CHART_COLORS.primary,
                            backgroundColor: App.config.CHART_COLORS.primary + '30',
                            pointBackgroundColor: App.config.CHART_COLORS.primary,
                            pointBorderColor: '#fff',
                            pointHoverBackgroundColor: '#fff',
                            pointHoverBorderColor: App.config.CHART_COLORS.primary
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        elements: {
                            line: {
                                borderWidth: 3
                            }
                        },
                        scales: {
                            r: {
                                angleLines: {
                                    display: false
                                },
                                suggestedMin: 0,
                                suggestedMax: 100
                            }
                        }
                    }
                });
            }
        },

        createScatterChart() {
            const scatterCtx = document.getElementById('scatterChart');
            if (scatterCtx && !App.state.charts.instances.scatter) {
                App.state.charts.instances.scatter = new Chart(scatterCtx, {
                    type: 'scatter',
                    data: {
                        datasets: [{
                            label: '나이-합격률 관계',
                            data: [{ x: 25, y: 50 }],
                            backgroundColor: App.config.CHART_COLORS.orange,
                            borderColor: App.config.CHART_COLORS.orange,
                            pointRadius: 6
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        scales: {
                            x: {
                                type: 'linear',
                                position: 'bottom',
                                title: {
                                    display: true,
                                    text: '나이'
                                }
                            },
                            y: {
                                title: {
                                    display: true,
                                    text: '합격률 (%)'
                                },
                                min: 0,
                                max: 100
                            }
                        }
                    }
                });
            }
        },

        updateData(filteredData) {
            const routeIndex = App.state.data.headers.indexOf('지원루트');
            const positionIndex = App.state.data.headers.indexOf('모집분야');

            App.charts.updateRouteChart(filteredData, routeIndex);
            App.charts.updatePositionChart(filteredData, positionIndex);
            App.charts.updateRegionChart(filteredData);
            App.charts.updateGenderChart(filteredData);
            App.charts.updateAgeChart(filteredData);
        },

        updateEfficiencyCharts(filteredData) {
            App.charts.updateRadarChart(filteredData);
            App.charts.updateScatterChart(filteredData);
        },

        updateRouteChart(filteredData, routeIndex) {
            if (routeIndex !== -1 && App.state.charts.instances.route) {
                const routeData = {};
                filteredData.forEach(row => {
                    const route = String(row[routeIndex] || '').trim();
                    if (route) {
                        routeData[route] = (routeData[route] || 0) + 1;
                    }
                });

                App.state.charts.instances.route.data.labels = Object.keys(routeData);
                App.state.charts.instances.route.data.datasets[0].data = Object.values(routeData);
                App.state.charts.instances.route.update();
            }
        },

        updatePositionChart(filteredData, positionIndex) {
            if (positionIndex !== -1 && App.state.charts.instances.position) {
                const positionData = {};
                filteredData.forEach(row => {
                    const position = String(row[positionIndex] || '').trim();
                    if (position) {
                        positionData[position] = (positionData[position] || 0) + 1;
                    }
                });

                App.state.charts.instances.position.data.labels = Object.keys(positionData);
                App.state.charts.instances.position.data.datasets[0].data = Object.values(positionData);
                App.state.charts.instances.position.update();
            }
        },

        updateRegionChart(filteredData) {
            const addressIndex = App.state.data.headers.indexOf('지역');

            if (addressIndex === -1 || !App.state.charts.instances.region) return;

            const regionData = {};

            filteredData.forEach(row => {
                const address = String(row[addressIndex] || '').trim();
                if (!address || address === '-') return;

                let region = App.utils.extractRegion(address);
                regionData[region] = (regionData[region] || 0) + 1;
            });

            if (Object.keys(regionData).length === 0) {
                App.state.charts.instances.region.data.labels = ['데이터 없음'];
                App.state.charts.instances.region.data.datasets[0].data = [1];
            } else {
                App.state.charts.instances.region.data.labels = Object.keys(regionData);
                App.state.charts.instances.region.data.datasets[0].data = Object.values(regionData);
            }

            App.state.charts.instances.region.update();
        },

        updateGenderChart(filteredData) {
            const genderIndex = App.state.data.headers.indexOf('성별');

            if (genderIndex === -1 || !App.state.charts.instances.gender) return;

            const genderData = {};

            filteredData.forEach(row => {
                const gender = String(row[genderIndex] || '').trim();
                if (!gender || gender === '-') return;

                genderData[gender] = (genderData[gender] || 0) + 1;
            });

            if (Object.keys(genderData).length === 0) {
                App.state.charts.instances.gender.data.labels = ['데이터 없음'];
                App.state.charts.instances.gender.data.datasets[0].data = [1];
            } else {
                App.state.charts.instances.gender.data.labels = Object.keys(genderData);
                App.state.charts.instances.gender.data.datasets[0].data = Object.values(genderData);
            }

            App.state.charts.instances.gender.update();
        },

        updateAgeChart(filteredData) {
            const ageIndex = App.state.data.headers.indexOf('나이');

            if (ageIndex === -1 || !App.state.charts.instances.age) return;

            const ageGroupData = {
                '20대 이하': 0,
                '30대': 0,
                '40대': 0,
                '50대': 0,
                '60대 이상': 0
            };

            filteredData.forEach(row => {
                const ageStr = String(row[ageIndex] || '').trim();
                if (!ageStr || ageStr === '-') return;

                const age = parseInt(ageStr, 10);
                if (isNaN(age)) return;

                if (age <= 29) ageGroupData['20대 이하']++;
                else if (age <= 39) ageGroupData['30대']++;
                else if (age <= 49) ageGroupData['40대']++;
                else if (age <= 59) ageGroupData['50대']++;
                else ageGroupData['60대 이상']++;
            });

            App.state.charts.instances.age.data.labels = Object.keys(ageGroupData);
            App.state.charts.instances.age.data.datasets[0].data = Object.values(ageGroupData);
            App.state.charts.instances.age.update();
        },

        updateRadarChart(filteredData) {
            if (!App.state.charts.instances.radar) return;

            const routeIndex = App.state.data.headers.indexOf('지원루트');
            const contactResultIndex = App.state.data.headers.indexOf('1차 컨택 결과');
            const interviewResultIndex = App.state.data.headers.indexOf('면접결과');
            const joinDateIndex = App.state.data.headers.indexOf('입과일');

            if (routeIndex === -1) return;

            const routes = [...new Set(filteredData.map(row => String(row[routeIndex] || '').trim()).filter(Boolean))];
            const colors = [
                App.config.CHART_COLORS.primary,
                App.config.CHART_COLORS.success,
                App.config.CHART_COLORS.warning,
                App.config.CHART_COLORS.danger,
                App.config.CHART_COLORS.orange
            ];

            const datasets = routes.slice(0, 5).map((route, index) => {
                const routeData = filteredData.filter(row => String(row[routeIndex] || '').trim() === route);
                const totalApplicants = routeData.length;

                let interviewConfirmRate = 0;
                if (contactResultIndex !== -1) {
                    const confirmed = routeData.filter(row => String(row[contactResultIndex] || '').trim() === '면접확정').length;
                    interviewConfirmRate = totalApplicants > 0 ? (confirmed / totalApplicants) * 100 : 0;
                }

                let passRate = 0;
                if (interviewResultIndex !== -1 && contactResultIndex !== -1) {
                    const confirmed = routeData.filter(row => String(row[contactResultIndex] || '').trim() === '면접확정');
                    const passed = confirmed.filter(row => String(row[interviewResultIndex] || '').trim() === '합격');
                    passRate = confirmed.length > 0 ? (passed.length / confirmed.length) * 100 : 0;
                }

                let joinRate = 0;
                if (joinDateIndex !== -1) {
                    const joined = routeData.filter(row => {
                        const joinDate = String(row[joinDateIndex] || '').trim();
                        return joinDate !== '' && joinDate !== '-';
                    }).length;
                    joinRate = totalApplicants > 0 ? (joined / totalApplicants) * 100 : 0;
                }

                const maxApplicants = Math.max(...routes.slice(0, 5).map(r => 
                    filteredData.filter(row => String(row[routeIndex] || '').trim() === r).length
                ));
                const normalizedApplicants = maxApplicants > 0 ? (totalApplicants / maxApplicants) * 100 : 0;

                return {
                    label: route,
                    data: [normalizedApplicants, interviewConfirmRate, passRate, joinRate],
                    borderColor: colors[index],
                    backgroundColor: colors[index] + '30',
                    pointBackgroundColor: colors[index],
                    pointBorderColor: '#fff',
                    pointHoverBackgroundColor: '#fff',
                    pointHoverBorderColor: colors[index]
                };
            });

            App.state.charts.instances.radar.data.datasets = datasets;
            App.state.charts.instances.radar.update();
        },

        updateScatterChart(filteredData) {
            if (!App.state.charts.instances.scatter) return;

            const ageIndex = App.state.data.headers.indexOf('나이');
            const contactResultIndex = App.state.data.headers.indexOf('1차 컨택 결과');
            const interviewResultIndex = App.state.data.headers.indexOf('면접결과');

            if (ageIndex === -1 || contactResultIndex === -1 || interviewResultIndex === -1) return;

            const ageGroups = {};
            
            filteredData.forEach(row => {
                const ageStr = String(row[ageIndex] || '').trim();
                const contactResult = String(row[contactResultIndex] || '').trim();
                const interviewResult = String(row[interviewResultIndex] || '').trim();

                if (!ageStr || ageStr === '-' || contactResult !== '면접확정') return;

                const age = parseInt(ageStr, 10);
                if (isNaN(age)) return;

                if (!ageGroups[age]) {
                    ageGroups[age] = { total: 0, passed: 0 };
                }

                ageGroups[age].total++;
                if (interviewResult === '합격') {
                    ageGroups[age].passed++;
                }
            });

            const scatterData = Object.entries(ageGroups)
                .filter(([age, data]) => data.total >= 2)
                .map(([age, data]) => ({
                    x: parseInt(age),
                    y: Math.round((data.passed / data.total) * 100)
                }));

            if (scatterData.length === 0) {
                scatterData.push({ x: 25, y: 0 }, { x: 35, y: 0 }, { x: 45, y: 0 });
            }

            App.state.charts.instances.scatter.data.datasets[0].data = scatterData;
            App.state.charts.instances.scatter.update();
        }
    },

    // =========================
    // 효율성 분석 관련
    // =========================
    efficiency: {
        handlePeriodChange() {
            const selectedPeriod = document.getElementById('efficiencyPeriodFilter').value;
            const customRange = document.getElementById('efficiencyCustomDateRange');

            if (selectedPeriod === 'custom') {
                customRange.style.display = 'flex';
            } else {
                customRange.style.display = 'none';
                App.efficiency.updateAll();
            }
        },

        updateAll() {
            const selectedPeriod = document.getElementById('efficiencyPeriodFilter')?.value || 'all';
            const filteredData = App.efficiency.getFilteredData(selectedPeriod);
            
            App.efficiency.update(filteredData);
            if (App.state.charts.instances.radar || App.state.charts.instances.scatter) {
                App.charts.updateEfficiencyCharts(filteredData);
            }
        },

        getFilteredData(selectedPeriod) {
            const applyDateIndex = App.state.data.headers.indexOf('지원일');
            let filteredData = [...App.state.data.all];

            if (applyDateIndex !== -1 && selectedPeriod !== 'all') {
                if (selectedPeriod === 'custom') {
                    const startDate = document.getElementById('efficiencyStartDate')?.value;
                    const endDate = document.getElementById('efficiencyEndDate')?.value;

                    if (startDate && endDate) {
                        const start = new Date(startDate);
                        const end = new Date(endDate);
                        end.setHours(23, 59, 59, 999);

                        filteredData = App.state.data.all.filter(row => {
                            try {
                                const dateValue = row[applyDateIndex];
                                if (!dateValue) return false;
                                const date = new Date(dateValue);
                                return date >= start && date <= end;
                            } catch (e) { return false; }
                        });
                    }
                } else {
                    const now = new Date();
                    const result = App.utils.filterDataByPeriod(App.state.data.all, selectedPeriod, applyDateIndex, now);
                    filteredData = result.data;
                }
            }

            return filteredData;
        },

        switchTab(tabName) {
            App.state.charts.currentEfficiencyTab = tabName;

            document.querySelectorAll('.efficiency-tab-btn').forEach(btn => {
                btn.classList.toggle('active', btn.dataset.tab === tabName);
            });

            App.efficiency.update();
        },

        update(filteredData = null) {
            if (!filteredData) {
                const selectedPeriod = document.getElementById('efficiencyPeriodFilter')?.value || 'all';
                filteredData = App.efficiency.getFilteredData(selectedPeriod);
            }

            const contentDiv = document.getElementById('efficiencyTabContent');

            if (App.state.charts.currentEfficiencyTab === 'route') {
                App.efficiency.updateRoute(filteredData);
            } else if (App.state.charts.currentEfficiencyTab === 'recruiter') {
                App.efficiency.updateRecruiter(filteredData);
            } else if (App.state.charts.currentEfficiencyTab === 'interviewer') {
                App.efficiency.updateInterviewer(filteredData);
            }
        },

        updateRoute(filteredData) {
            try {
                const routeIndex = App.state.data.headers.indexOf('지원루트');

                if (routeIndex === -1) {
                    document.getElementById('efficiencyTabContent').innerHTML = '<p style="text-align: center; padding: 20px; color: var(--text-secondary);">지원루트 데이터를 찾을 수 없습니다.</p>';
                    return;
                }

                const routeStats = App.efficiency.calculateStats(filteredData, routeIndex);
                App.efficiency.renderTable(routeStats, '지원루트');

            } catch (error) {
                console.error('지원루트 효율성 분석 업데이트 실패:', error);
                document.getElementById('efficiencyTabContent').innerHTML = '<p style="text-align: center; padding: 20px; color: var(--danger);">분석 중 오류가 발생했습니다.</p>';
            }
        },

        updateRecruiter(filteredData) {
            try {
                const recruiterIndex = App.state.data.headers.indexOf('증원자');

                if (recruiterIndex === -1) {
                    document.getElementById('efficiencyTabContent').innerHTML = '<p style="text-align: center; padding: 20px; color: var(--text-secondary);">증원자 데이터를 찾을 수 없습니다.</p>';
                    return;
                }

                const recruiterStats = App.efficiency.calculateStats(filteredData, recruiterIndex);
                App.efficiency.renderTable(recruiterStats, '증원자');

            } catch (error) {
                console.error('증원자별 효율성 분석 업데이트 실패:', error);
                document.getElementById('efficiencyTabContent').innerHTML = '<p style="text-align: center; padding: 20px; color: var(--danger);">분석 중 오류가 발생했습니다.</p>';
            }
        },

        updateInterviewer(filteredData) {
            try {
                const interviewerIndex = App.state.data.headers.indexOf('면접관');

                if (interviewerIndex === -1) {
                    document.getElementById('efficiencyTabContent').innerHTML = '<p style="text-align: center; padding: 20px; color: var(--text-secondary);">면접관 데이터를 찾을 수 없습니다.</p>';
                    return;
                }

                const interviewerStats = App.efficiency.calculateStats(filteredData, interviewerIndex);
                App.efficiency.renderTable(interviewerStats, '면접관');

            } catch (error) {
                console.error('면접관별 효율성 분석 업데이트 실패:', error);
                document.getElementById('efficiencyTabContent').innerHTML = '<p style="text-align: center; padding: 20px; color: var(--danger);">분석 중 오류가 발생했습니다.</p>';
            }
        },

        calculateStats(filteredData, categoryIndex) {
            const contactResultIndex = App.state.data.headers.indexOf('1차 컨택 결과');
            const interviewResultIndex = App.state.data.headers.indexOf('면접결과');
            const joinDateIndex = App.state.data.headers.indexOf('입과일');

            const stats = {};

            filteredData.forEach(row => {
                const category = String(row[categoryIndex] || '').trim();
                if (!category || category === '-') return;

                if (!stats[category]) {
                    stats[category] = {
                        total: 0,
                        contacted: 0,
                        interviewConfirmed: 0,
                        passed: 0,
                        joined: 0
                    };
                }

                stats[category].total++;

                if (contactResultIndex !== -1) {
                    const contactResult = String(row[contactResultIndex] || '').trim();
                    if (contactResult !== '' && contactResult !== '-') {
                        stats[category].contacted++;
                    }

                    if (contactResult === '면접확정') {
                        stats[category].interviewConfirmed++;
                    }
                }

                if (interviewResultIndex !== -1) {
                    const interviewResult = String(row[interviewResultIndex] || '').trim();
                    if (interviewResult === '합격') {
                        stats[category].passed++;
                    }
                }

                if (joinDateIndex !== -1) {
                    const joinDate = String(row[joinDateIndex] || '').trim();
                    if (joinDate !== '' && joinDate !== '-') {
                        stats[category].joined++;
                    }
                }
            });

            return stats;
        },

        renderTable(stats, categoryName) {
            const dataArray = Object.entries(stats).map(([name, data]) => {
                const interviewConfirmRate = data.total > 0 ? (data.interviewConfirmed / data.total) * 100 : 0;
                const passRate = data.interviewConfirmed > 0 ? (data.passed / data.interviewConfirmed) * 100 : 0;
                const joinRate = data.total > 0 ? (data.joined / data.total) * 100 : 0;
                const volumeWeight = Math.min(data.total / Math.max(...Object.values(stats).map(s => s.total)), 1) * 100;

                const efficiencyScore = (joinRate * 0.4) + (passRate * 0.3) + (interviewConfirmRate * 0.2) + (volumeWeight * 0.1);

                return {
                    name,
                    ...data,
                    interviewConfirmRate: Math.round(interviewConfirmRate),
                    passRate: Math.round(passRate),
                    joinRate: Math.round(joinRate),
                    efficiencyScore: Math.round(efficiencyScore * 10) / 10
                };
            }).sort((a, b) => b.efficiencyScore - a.efficiencyScore);

            let tableHtml = `
                <div style="overflow-x: auto;">
                    <table class="efficiency-table" style="width: 100%; border-collapse: collapse; font-size: 0.9rem;">
                        <thead>
                            <tr style="background: var(--main-bg);">
                                <th style="padding: 12px; text-align: left; border-bottom: 2px solid var(--border-color); font-weight: 600;">${categoryName}</th>
                                <th style="padding: 12px; text-align: center; border-bottom: 2px solid var(--border-color); font-weight: 600;">총 지원자</th>
                                <th style="padding: 12px; text-align: center; border-bottom: 2px solid var(--border-color); font-weight: 600;">면접확정</th>
                                <th style="padding: 12px; text-align: center; border-bottom: 2px solid var(--border-color); font-weight: 600;">합격자</th>
                                <th style="padding: 12px; text-align: center; border-bottom: 2px solid var(--border-color); font-weight: 600;">입과자</th>
                                <th style="padding: 12px; text-align: center; border-bottom: 2px solid var(--border-color); font-weight: 600;">면접확정률</th>
                                <th style="padding: 12px; text-align: center; border-bottom: 2px solid var(--border-color); font-weight: 600;">합격률</th>
                                <th style="padding: 12px; text-align: center; border-bottom: 2px solid var(--border-color); font-weight: 600; color: var(--accent-orange);">최종 입과율</th>
                                <th style="padding: 12px; text-align: center; border-bottom: 2px solid var(--border-color); font-weight: 600;">효율성 점수</th>
                            </tr>
                        </thead>
                        <tbody>
            `;

            dataArray.forEach((item, index) => {
                const rankColor = index === 0 ? 'var(--success)' : index === 1 ? 'var(--warning)' : index === 2 ? 'var(--accent-orange)' : 'var(--text-primary)';
                const rankIcon = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '';
                const rankClass = index === 0 ? 'efficiency-rank-1' : index === 1 ? 'efficiency-rank-2' : index === 2 ? 'efficiency-rank-3' : '';

                tableHtml += `
                    <tr class="${rankClass}" style="border-bottom: 1px solid var(--border-color); transition: all 0.2s ease;" onmouseover="this.style.transform='translateX(2px)'" onmouseout="this.style.transform='translateX(0)'">
                        <td style="padding: 12px; font-weight: 600; color: ${rankColor};">${rankIcon} ${item.name}</td>
                        <td style="padding: 12px; text-align: center; font-weight: 500;">${item.total.toLocaleString()}</td>
                        <td style="padding: 12px; text-align: center;">${item.interviewConfirmed}</td>
                        <td style="padding: 12px; text-align: center;">${item.passed}</td>
                        <td style="padding: 12px; text-align: center;">${item.joined}</td>
                        <td style="padding: 12px; text-align: center;">${item.interviewConfirmRate}%</td>
                        <td style="padding: 12px; text-align: center;">${item.passRate}%</td>
                        <td style="padding: 12px; text-align: center; font-weight: bold; color: var(--accent-orange);">${item.joinRate}%</td>
                        <td style="padding: 12px; text-align: center; font-weight: bold; color: ${rankColor}; font-size: 1.1rem;">${item.efficiencyScore}</td>
                    </tr>
                `;
            });

            tableHtml += `
                        </tbody>
                    </table>
                </div>
                <div style="margin-top: 15px; padding: 15px; background: var(--main-bg); border-radius: 8px; font-size: 0.85rem; color: var(--text-secondary);">
                    <strong>📊 효율성 점수 계산법:</strong> (입과율 × 0.4) + (합격률 × 0.3) + (면접확정률 × 0.2) + (총지원자수 가중치 × 0.1)
                </div>
            `;

            document.getElementById('efficiencyTabContent').innerHTML = tableHtml;
        }
    },

    // =========================
    // 추이 분석 관련
    // =========================
    trend: {
        switchTab(period) {
            App.state.charts.currentTrendTab = period;

            document.querySelectorAll('.trend-tab-btn').forEach(btn => {
                btn.classList.toggle('active', btn.dataset.period === period);
            });

            App.trend.update();
        },

        update(filteredData = null, applyDateIndex = null) {
            if (!applyDateIndex) {
                applyDateIndex = App.state.data.headers.indexOf('지원일');
            }

            if (applyDateIndex === -1 || !App.state.charts.instances.trend) return;

            let trendData = {};
            let labels = [];

            if (App.state.charts.currentTrendTab === 'all') {
                const result = App.trend.getAllTrendData(applyDateIndex);
                trendData = result.data;
                labels = result.labels;
            } else if (App.state.charts.currentTrendTab === 'year') {
                const result = App.trend.getYearTrendData(applyDateIndex);
                trendData = result.data;
                labels = result.labels;
            } else if (App.state.charts.currentTrendTab === 'month') {
                const result = App.trend.getMonthTrendData(applyDateIndex);
                trendData = result.data;
                labels = result.labels;
            }

            App.state.charts.instances.trend.data.labels = labels;
            App.state.charts.instances.trend.data.datasets[0].data = Object.values(trendData);
            App.state.charts.instances.trend.update();
        },

        getAllTrendData(applyDateIndex) {
            const trendData = {};

            for (let i = 11; i >= 0; i--) {
                const date = new Date();
                date.setMonth(date.getMonth() - i);
                const key = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
                trendData[key] = 0;
            }

            App.state.data.all.forEach(row => {
                if (!row[applyDateIndex]) return;
                try {
                    const date = new Date(row[applyDateIndex]);
                    const key = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
                    if (trendData.hasOwnProperty(key)) {
                        trendData[key]++;
                    }
                } catch (e) {}
            });

            const labels = Object.keys(trendData).map(key => {
                const [year, month] = key.split('-');
                return `${year}.${month}`;
            });

            return { data: trendData, labels };
        },

        getYearTrendData(applyDateIndex) {
            const trendData = {};
            const currentYear = new Date().getFullYear();

            for (let i = 4; i >= 0; i--) {
                const year = currentYear - i;
                trendData[year] = 0;
            }

            App.state.data.all.forEach(row => {
                if (!row[applyDateIndex]) return;
                try {
                    const date = new Date(row[applyDateIndex]);
                    const year = date.getFullYear();
                    if (trendData.hasOwnProperty(year)) {
                        trendData[year]++;
                    }
                } catch (e) {}
            });

            const labels = Object.keys(trendData).map(year => `${year}년`);

            return { data: trendData, labels };
        },

        getMonthTrendData(applyDateIndex) {
            const trendData = {};
            const currentYear = new Date().getFullYear();

            for (let i = 1; i <= 12; i++) {
                const key = `${currentYear}-${i.toString().padStart(2, '0')}`;
                trendData[key] = 0;
            }

            App.state.data.all.forEach(row => {
                if (!row[applyDateIndex]) return;
                try {
                    const date = new Date(row[applyDateIndex]);
                    if (date.getFullYear() === currentYear) {
                        const key = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
                        if (trendData.hasOwnProperty(key)) {
                            trendData[key]++;
                        }
                    }
                } catch (e) {}
            });

            const labels = Object.keys(trendData).map(key => {
                const [year, month] = key.split('-');
                return `${month}월`;
            });

            return { data: trendData, labels };
        }
    },

    // =========================
    // 유틸리티 함수들 (utils.js에서 가져온 것 + 추가 함수들)
    // =========================
    utils: {
        // utils.js에서 가져온 순수 함수들
        ...Utils,
        
        // UIModule에서 가져온 함수들
        createProgressBar: UIModule.createProgressBar,
        createSkeletonTable: UIModule.createSkeletonTable,
        
        // App 객체에 의존하는 함수들
        sortData(data) {
            if (App.state.ui.currentSortColumn && App.state.ui.currentSortDirection) {
                const sortIndex = App.state.data.headers.indexOf(App.state.ui.currentSortColumn);
                if (sortIndex !== -1) {
                    data.sort((a, b) => {
                        let valA = a[sortIndex];
                        let valB = b[sortIndex];

                        if (App.state.ui.currentSortColumn === '지원일' ||
                            App.state.ui.currentSortColumn.includes('날짜') ||
                            App.state.ui.currentSortColumn.includes('날자') ||
                            App.state.ui.currentSortColumn.includes('입과일')) {
                            valA = new Date(valA || '1970-01-01');
                            valB = new Date(valB || '1970-01-01');
                        } else if (['나이', '구분'].includes(App.state.ui.currentSortColumn)) {
                            valA = Number(valA) || 0;
                            valB = Number(valB) || 0;
                        } else {
                            valA = String(valA || '').toLowerCase();
                            valB = String(valB || '').toLowerCase();
                        }

                        if (valA < valB) return App.state.ui.currentSortDirection === 'asc' ? -1 : 1;
                        if (valA > valB) return App.state.ui.currentSortDirection === 'asc' ? 1 : -1;
                        return 0;
                    });
                }
            }
            return data;
        },

        filterDataByPeriod(data, selectedPeriod, applyDateIndex, now) {
            let filteredData = [...data];
            let label = '전체 기간';

            try {
                if (selectedPeriod === 'year') {
                    const currentYear = now.getFullYear();
                    filteredData = data.filter(row => {
                        try {
                            const dateValue = row[applyDateIndex];
                            if (!dateValue) return false;
                            const date = new Date(dateValue);
                            return date.getFullYear() === currentYear;
                        } catch (e) { return false; }
                    });
                    label = `${currentYear}년`;

                } else if (selectedPeriod === 'month') {
                    const currentMonth = now.getMonth() + 1;
                    const currentYear = now.getFullYear();
                    filteredData = data.filter(row => {
                        try {
                            const dateValue = row[applyDateIndex];
                            if (!dateValue) return false;
                            const date = new Date(dateValue);
                            return date.getMonth() + 1 === currentMonth && date.getFullYear() === currentYear;
                        } catch (e) { return false; }
                    });
                    label = `${currentYear}.${currentMonth.toString().padStart(2, '0')}`;

                } else if (selectedPeriod === 'week') {
                    const weekStart = new Date(now);
                    weekStart.setDate(now.getDate() - now.getDay());
                    weekStart.setHours(0, 0, 0, 0);
                    const weekEnd = new Date(weekStart);
                    weekEnd.setDate(weekStart.getDate() + 6);
                    weekEnd.setHours(23, 59, 59, 999);

                    filteredData = data.filter(row => {
                        try {
                            const dateValue = row[applyDateIndex];
                            if (!dateValue) return false;
                            const date = new Date(dateValue);
                            return date >= weekStart && date <= weekEnd;
                        } catch (e) { return false; }
                    });
                    label = '이번 주';
                }
            } catch (error) {
                console.error('날짜 필터링 오류:', error);
            }

            return { data: filteredData, label };
        },

        getFilteredDataByPeriod(selectedPeriod) {
            const applyDateIndex = App.state.data.headers.indexOf('지원일');
            let filteredApplicants = [...App.state.data.all];

            if (applyDateIndex !== -1 && selectedPeriod !== 'all') {
                const now = new Date();

                if (selectedPeriod === 'custom') {
                    const startDateElement = document.getElementById('statsStartDate');
                    const endDateElement = document.getElementById('statsEndDate');
                    
                    const startDate = startDateElement ? startDateElement.value : null;
                    const endDate = endDateElement ? endDateElement.value : null;

                    if (startDate && endDate) {
                        const start = new Date(startDate);
                        const end = new Date(endDate);
                        end.setHours(23, 59, 59, 999);

                        filteredApplicants = App.state.data.all.filter(row => {
                            try {
                                const dateValue = row[applyDateIndex];
                                if (!dateValue) return false;
                                const date = new Date(dateValue);
                                return date >= start && date <= end;
                            } catch (e) { return false; }
                        });
                    }
                } else {
                    const result = App.utils.filterDataByPeriod(App.state.data.all, selectedPeriod, applyDateIndex, now);
                    filteredApplicants = result.data;
                }
            }

            return filteredApplicants;
        },

        generateVisibleColumns(headers) {
            const visibleColumns = {};
            headers.forEach(header => {
                visibleColumns[header] = !App.config.DEFAULT_HIDDEN_COLUMNS.includes(header);
            });
            return visibleColumns;
        }
    }
}; // 🔥 중요: App 객체 끝에 세미콜론

// =========================
// 🔥 핵심: 전역 객체로 노출
// =========================
try {
    if (typeof globalThis !== 'undefined') {
        globalThis.App = App;
    } else if (typeof window !== 'undefined') {
        window.App = App;
    } else if (typeof global !== 'undefined') {
        global.App = App;
    }
    console.log('✅ App 객체가 전역에 성공적으로 노출되었습니다.');
} catch (error) {
    console.error('❌ App 객체 전역 노출 실패:', error);
}

// =========================
// 전역에서 사용되는 함수들 (하위 호환성)
// =========================
document.addEventListener('click', function(event) {
    try {
        const modal = document.getElementById('applicantModal');
        if (event.target === modal && globalThis.App && globalThis.App.modal) {
            globalThis.App.modal.close();
        }
    } catch (error) {
        console.error('모달 클릭 이벤트 오류:', error);
    }
});

// =========================
// 애플리케이션 시작
// =========================
document.addEventListener('DOMContentLoaded', () => {
    try {
        console.log('🚀 애플리케이션 초기화 시작...');
        
        // App 객체가 제대로 생성되었는지 확인
        if (typeof App === 'undefined') {
            throw new Error('App 객체가 정의되지 않았습니다.');
        }
        
        // 필수 DOM 요소들이 존재하는지 확인
        const requiredElements = ['dateModeToggle', 'globalSearch', 'routeFilter', 'positionFilter'];
        const missingElements = requiredElements.filter(id => !document.getElementById(id));
        
        if (missingElements.length > 0) {
            console.warn('⚠️ 일부 DOM 요소들을 찾을 수 없습니다:', missingElements);
        }
        
        App.init.start();
        console.log('✅ 애플리케이션 초기화 완료');
        
    } catch (error) {
        console.error('❌ 애플리케이션 초기화 실패:', error);
        
        // 사용자에게 오류 메시지 표시
        const errorContainer = document.createElement('div');
        errorContainer.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: #ef4444;
            color: white;
            padding: 20px;
            border-radius: 8px;
            text-align: center;
            z-index: 9999;
            font-family: 'Noto Sans KR', sans-serif;
        `;
        errorContainer.innerHTML = `
            <h3>⚠️ 애플리케이션 로딩 오류</h3>
            <p>페이지를 새로고침하거나 관리자에게 문의하세요.</p>
            <button onclick="location.reload()" style="margin-top: 10px; padding: 8px 16px; background: white; color: #ef4444; border: none; border-radius: 4px; cursor: pointer;">
                새로고침
            </button>
        `;
        document.body.appendChild(errorContainer);
    }
});
