// =========================
// 스마트 필터 동기화 모듈
// =========================

(function() {
    'use strict';
    
    // App 객체가 존재하는지 확인
    if (!window.App) {
        console.error('❌ Filter Sync Module: App 객체를 찾을 수 없습니다. script.js를 먼저 로드해주세요.');
        return;
    }

    // =========================
    // 필터 동기화 모듈 정의
    // =========================
    App.filterSync = {
        // 상태 관리
        state: {
            globalFilters: {
                period: 'all',
                startDate: '',
                endDate: '',
                route: 'all',
                position: 'all',
                search: ''
            },
            savedFilters: [],
            favoriteFilters: [],
            isInitialized: false
        },

        // =========================
        // 초기화
        // =========================
        init() {
            console.log('🔄 필터 동기화 모듈 초기화 시작...');
            
            try {
                this.loadSavedFilters();
                this.setupEventListeners();
                this.createFilterUI();
                // 초기화 시, 현재 페이지(대시보드)의 필터를 동기화합니다.
                this.syncToCurrentPage();
                this.state.isInitialized = true;
                
                console.log('✅ 필터 동기화 모듈 초기화 완료!');
            } catch (error) {
                console.error('❌ 필터 동기화 모듈 초기화 실패:', error);
            }
        },

        // =========================
        // 이벤트 리스너 설정
        // =========================
        setupEventListeners() {
            // 사이드바 필터 변경 감지
            const sidebarPeriodFilter = document.getElementById('sidebarPeriodFilter');
            if (sidebarPeriodFilter) {
                sidebarPeriodFilter.addEventListener('change', () => {
                    this.onSidebarFilterChange();
                });
            }

            // 페이지 전환 감지
            const originalSwitchPage = App.navigation.switchPage;
            App.navigation.switchPage = (pageId) => {
                originalSwitchPage.call(App.navigation, pageId);
                setTimeout(() => {
                    this.syncToCurrentPage();
                }, 100);
            };

            // 검색 필터 변경 감지
            const globalSearch = document.getElementById('globalSearch');
            if (globalSearch) {
                globalSearch.addEventListener('input', () => {
                    this.onSearchChange();
                });
            }

            // 드롭다운 필터 변경 감지
            const routeFilter = document.getElementById('routeFilter');
            const positionFilter = document.getElementById('positionFilter');
            
            if (routeFilter) {
                routeFilter.addEventListener('change', () => {
                    this.onDropdownFilterChange();
                });
            }

            if (positionFilter) {
                positionFilter.addEventListener('change', () => {
                    this.onDropdownFilterChange();
                });
            }
        },

        // =========================
        // 필터 UI 생성
        // =========================
        createFilterUI() {
            const sidebarWidget = document.querySelector('.sidebar-widgets');
            if (!sidebarWidget) return;

            // 필터 관리 위젯 추가
            const filterManagementWidget = document.createElement('div');
            filterManagementWidget.className = 'sidebar-widget filter-management-widget';
            filterManagementWidget.style.borderLeft = '3px solid #a78bfa';
            
            filterManagementWidget.innerHTML = `
                <div class="sidebar-widget-title">필터 관리</div>
                <div class="filter-controls">
                    <button class="filter-save-btn" onclick="App.filterSync.openSaveDialog()">
                        <i class="fas fa-save"></i> 현재 필터 저장
                    </button>
                    <button class="filter-load-btn" onclick="App.filterSync.openLoadDialog()">
                        <i class="fas fa-folder-open"></i> 저장된 필터
                    </button>
                    <button class="filter-reset-all-btn" onclick="App.filterSync.resetAllFilters()">
                        <i class="fas fa-refresh"></i> 전체 초기화
                    </button>
                </div>
                <div class="favorite-filters" id="favoriteFilters">
                    <div class="sidebar-widget-subtitle">즐겨찾기 필터</div>
                    <div id="favoriteFiltersList"></div>
                </div>
            `;

            // 기존 위젯들 앞에 추가
            sidebarWidget.insertBefore(filterManagementWidget, sidebarWidget.firstChild);

            this.updateFavoriteFiltersList();
        },

        // =========================
        // 필터 변경 핸들러들 (수정됨)
        // =========================
        onSidebarFilterChange() {
            const sidebarPeriodFilter = document.getElementById('sidebarPeriodFilter');
            const startDateInput = document.getElementById('sidebarStartDate');
            const endDateInput = document.getElementById('sidebarEndDate');

            if (sidebarPeriodFilter) {
                this.state.globalFilters.period = sidebarPeriodFilter.value;
            }

            if (startDateInput && endDateInput) {
                this.state.globalFilters.startDate = startDateInput.value;
                this.state.globalFilters.endDate = endDateInput.value;
            }
            // 변경된 부분: 모든 페이지의 필터 UI를 업데이트하고 현재 페이지의 데이터를 다시 로드합니다.
            this.syncFilterUIsAndRefreshData();
        },

        onSearchChange() {
            const globalSearch = document.getElementById('globalSearch');
            if (globalSearch) {
                this.state.globalFilters.search = globalSearch.value;
                this.syncFilterUIsAndRefreshData();
            }
        },

        onDropdownFilterChange() {
            const routeFilter = document.getElementById('routeFilter');
            const positionFilter = document.getElementById('positionFilter');

            if (routeFilter) {
                this.state.globalFilters.route = routeFilter.value;
            }

            if (positionFilter) {
                this.state.globalFilters.position = positionFilter.value;
            }

            this.syncFilterUIsAndRefreshData();
        },

        // =========================
        // 페이지 동기화 (개선된 로직)
        // =========================
        /**
         * 모든 페이지의 필터 UI를 동기화하고, 현재 활성화된 페이지의 데이터만 새로고침합니다.
         */
        syncFilterUIsAndRefreshData() {
            const filters = this.state.globalFilters;

            // 1. 모든 페이지의 필터 UI 컨트롤을 현재 전역 필터 상태와 일치시킵니다.
            this.syncToDashboardPage(filters);
            this.syncToStatsPage(filters);
            this.syncToEfficiencyPage(filters);

            // 2. 현재 활성화된 페이지를 확인하고 해당 페이지의 데이터만 업데이트합니다.
            const activePage = document.querySelector('.page.active');
            if (!activePage) return;

            try {
                switch (activePage.id) {
                    case 'dashboard':
                        // App.filter.apply()는 dashboard의 필터링 및 뷰 업데이트를 담당합니다.
                        if (window.App && App.filter && App.filter.apply) {
                            App.filter.apply();
                        }
                        break;
                    case 'stats':
                        if (window.App && App.stats && App.stats.update) {
                            App.stats.update();
                        }
                        break;
                    case 'efficiency':
                         if (window.App && App.efficiency && App.efficiency.updateAll) {
                            App.efficiency.updateAll();
                        }
                        break;
                }
            } catch(e) {
                console.error(`${activePage.id} 페이지 데이터 새로고침 중 오류 발생:`, e);
            }
        },
        
        /**
         * 페이지 전환 시 호출되어 새롭게 활성화된 페이지의 UI를 동기화합니다.
         */
        syncToCurrentPage() {
            const activePage = document.querySelector('.page.active');
            if (!activePage) return;

            const filters = this.state.globalFilters;

            switch (activePage.id) {
                case 'dashboard':
                    this.syncToDashboardPage(filters);
                    break;
                case 'stats':
                    this.syncToStatsPage(filters);
                    break;
                case 'efficiency':
                    this.syncToEfficiencyPage(filters);
                    break;
            }
        },
        
        syncToDashboardPage(filters) {
            // 검색 필터 동기화
            const globalSearch = document.getElementById('globalSearch');
            if (globalSearch && globalSearch.value !== filters.search) {
                globalSearch.value = filters.search;
            }

            // 드롭다운 필터 동기화
            const routeFilter = document.getElementById('routeFilter');
            const positionFilter = document.getElementById('positionFilter');

            if (routeFilter && routeFilter.value !== filters.route) {
                routeFilter.value = filters.route;
            }

            if (positionFilter && positionFilter.value !== filters.position) {
                positionFilter.value = filters.position;
            }

            // ★★★ 추가된 핵심 로직: 대시보드의 날짜 필터 UI 동기화 ★★★
            if (App.state && App.state.ui) {
                // 대시보드는 'custom' 대신 'range'를 사용하므로 변환해줍니다.
                const dashboardDateMode = filters.period === 'custom' ? 'range' : filters.period;
                App.state.ui.activeDateMode = dashboardDateMode;
                
                // script.js에 정의된 날짜 UI 업데이트 함수를 호출합니다.
                // 이 함수가 날짜 버튼 활성화 및 기간 입력 필드 생성을 담당합니다.
                if (App.filter && typeof App.filter.updateDateFilterUI === 'function') {
                    // 날짜 값을 주입하여 UI가 올바르게 생성되도록 합니다.
                    if (App.filter.dateValues) {
                        App.filter.dateValues.start = filters.startDate;
                        App.filter.dateValues.end = filters.endDate;
                    }
                    App.filter.updateDateFilterUI();
                }
            }
        },

        syncToStatsPage(filters) {
            const statsPeriodFilter = document.getElementById('statsPeriodFilter');
            const statsStartDate = document.getElementById('statsStartDate');
            const statsEndDate = document.getElementById('statsEndDate');

            if (statsPeriodFilter) {
                if (filters.period === 'custom' && filters.startDate && filters.endDate) {
                    statsPeriodFilter.value = 'custom';
                    if (statsStartDate) statsStartDate.value = filters.startDate;
                    if (statsEndDate) statsEndDate.value = filters.endDate;
                    
                    const customRange = document.getElementById('statsCustomDateRange');
                    if (customRange) customRange.style.display = 'flex';
                } else {
                    statsPeriodFilter.value = filters.period;
                    const customRange = document.getElementById('statsCustomDateRange');
                    if (customRange) customRange.style.display = 'none';
                }
            }
        },

        syncToEfficiencyPage(filters) {
            const efficiencyPeriodFilter = document.getElementById('efficiencyPeriodFilter');
            const efficiencyStartDate = document.getElementById('efficiencyStartDate');
            const efficiencyEndDate = document.getElementById('efficiencyEndDate');

            if (efficiencyPeriodFilter) {
                if (filters.period === 'custom' && filters.startDate && filters.endDate) {
                    efficiencyPeriodFilter.value = 'custom';
                    if (efficiencyStartDate) efficiencyStartDate.value = filters.startDate;
                    if (efficiencyEndDate) efficiencyEndDate.value = filters.endDate;
                    
                    const customRange = document.getElementById('efficiencyCustomDateRange');
                    if (customRange) customRange.style.display = 'flex';
                } else {
                    efficiencyPeriodFilter.value = filters.period;
                    const customRange = document.getElementById('efficiencyCustomDateRange');
                    if (customRange) customRange.style.display = 'none';
                }
            }
        },

        // =========================
        // 필터 저장/불러오기 (이하 코드는 변경 없음)
        // =========================
        openSaveDialog() {
            const filterName = prompt('필터 조합에 이름을 지어주세요:', 
                this.generateFilterName());
            
            if (filterName && filterName.trim()) {
                this.saveFilter(filterName.trim());
            }
        },

        saveFilter(name) {
            const filterData = {
                id: Date.now(),
                name: name,
                filters: { ...this.state.globalFilters },
                createdAt: new Date().toISOString(),
                isFavorite: false
            };

            // 중복 이름 체크
            const existingIndex = this.state.savedFilters.findIndex(f => f.name === name);
            if (existingIndex !== -1) {
                if (confirm(`"${name}" 필터가 이미 존재합니다. 덮어쓰시겠습니까?`)) {
                    this.state.savedFilters[existingIndex] = filterData;
                } else {
                    return;
                }
            } else {
                this.state.savedFilters.push(filterData);
            }

            this.saveSavedFilters();
            this.showNotification(`✅ "${name}" 필터가 저장되었습니다.`);
        },

        openLoadDialog() {
            if (this.state.savedFilters.length === 0) {
                alert('저장된 필터가 없습니다.');
                return;
            }

            this.createFilterLoadModal();
        },

        createFilterLoadModal() {
            // 기존 모달 제거
            const existingModal = document.getElementById('filterLoadModal');
            if (existingModal) {
                existingModal.remove();
            }

            const modal = document.createElement('div');
            modal.id = 'filterLoadModal';
            modal.className = 'filter-load-modal';
            modal.innerHTML = `
                <div class="filter-load-modal-content">
                    <div class="filter-load-header">
                        <h3>저장된 필터 목록</h3>
                        <button class="filter-modal-close" onclick="App.filterSync.closeLoadModal()">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <div class="filter-load-body">
                        <div class="saved-filters-list" id="savedFiltersList">
                            ${this.renderSavedFiltersList()}
                        </div>
                    </div>
                </div>
            `;

            document.body.appendChild(modal);
            modal.style.display = 'flex';
        },

        renderSavedFiltersList() {
            if (this.state.savedFilters.length === 0) {
                return '<p class="no-filters">저장된 필터가 없습니다.</p>';
            }

            return this.state.savedFilters.map(filter => `
                <div class="saved-filter-item ${filter.isFavorite ? 'favorite' : ''}">
                    <div class="filter-info">
                        <div class="filter-name">
                            ${filter.isFavorite ? '<i class="fas fa-star"></i>' : ''}
                            ${filter.name}
                        </div>
                        <div class="filter-details">
                            ${this.formatFilterDetails(filter.filters)}
                        </div>
                        <div class="filter-date">
                            저장일: ${new Date(filter.createdAt).toLocaleDateString('ko-KR')}
                        </div>
                    </div>
                    <div class="filter-actions">
                        <button class="filter-action-btn load-btn" onclick="App.filterSync.loadFilter(${filter.id})">
                            <i class="fas fa-upload"></i> 적용
                        </button>
                        <button class="filter-action-btn favorite-btn" onclick="App.filterSync.toggleFavorite(${filter.id})">
                            <i class="fas fa-star"></i>
                        </button>
                        <button class="filter-action-btn delete-btn" onclick="App.filterSync.deleteFilter(${filter.id})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            `).join('');
        },

        formatFilterDetails(filters) {
            const details = [];
            
            if (filters.period !== 'all') {
                if (filters.period === 'custom' && filters.startDate && filters.endDate) {
                    details.push(`기간: ${filters.startDate} ~ ${filters.endDate}`);
                } else {
                    const periodNames = {
                        'year': '올해',
                        'month': '이번 달',
                        'week': '이번 주'
                    };
                    details.push(`기간: ${periodNames[filters.period] || filters.period}`);
                }
            }

            if (filters.route !== 'all') {
                details.push(`지원루트: ${filters.route}`);
            }

            if (filters.position !== 'all') {
                details.push(`모집분야: ${filters.position}`);
            }

            if (filters.search) {
                details.push(`검색: "${filters.search}"`);
            }

            return details.length > 0 ? details.join(' | ') : '기본 필터';
        },

        loadFilter(filterId) {
            const filter = this.state.savedFilters.find(f => f.id === filterId);
            if (!filter) {
                alert('필터를 찾을 수 없습니다.');
                return;
            }

            // 전역 필터 상태 업데이트
            this.state.globalFilters = { ...filter.filters };

            // 사이드바 필터 UI 업데이트
            this.applySidebarFilters(filter.filters);

            // 모든 페이지의 필터 UI를 동기화하고 현재 페이지 데이터를 새로고침
            this.syncFilterUIsAndRefreshData();

            this.closeLoadModal();
            this.showNotification(`✅ "${filter.name}" 필터가 적용되었습니다.`);
        },

        applySidebarFilters(filters) {
            const sidebarPeriodFilter = document.getElementById('sidebarPeriodFilter');
            const sidebarStartDate = document.getElementById('sidebarStartDate');
            const sidebarEndDate = document.getElementById('sidebarEndDate');

            if (sidebarPeriodFilter) {
                sidebarPeriodFilter.value = filters.period;
                
                const customRange = document.getElementById('sidebarCustomDateRange');
                if (customRange) {
                    if (filters.period === 'custom') {
                        customRange.style.display = 'block';
                        if (sidebarStartDate) sidebarStartDate.value = filters.startDate;
                        if (sidebarEndDate) sidebarEndDate.value = filters.endDate;
                    } else {
                        customRange.style.display = 'none';
                    }
                }
            }

            // 사이드바 위젯 업데이트
            if (window.App && App.sidebar && App.sidebar.updateWidgets) {
                App.sidebar.updateWidgets();
            }
        },

        toggleFavorite(filterId) {
            const filter = this.state.savedFilters.find(f => f.id === filterId);
            if (filter) {
                filter.isFavorite = !filter.isFavorite;
                this.saveSavedFilters();
                this.updateFavoriteFiltersList();
                
                const savedFiltersList = document.getElementById('savedFiltersList');
                if (savedFiltersList) {
                    savedFiltersList.innerHTML = this.renderSavedFiltersList();
                }
            }
        },

        deleteFilter(filterId) {
            const filter = this.state.savedFilters.find(f => f.id === filterId);
            if (!filter) return;

            if (confirm(`"${filter.name}" 필터를 삭제하시겠습니까?`)) {
                this.state.savedFilters = this.state.savedFilters.filter(f => f.id !== filterId);
                this.saveSavedFilters();
                this.updateFavoriteFiltersList();
                
                const savedFiltersList = document.getElementById('savedFiltersList');
                if (savedFiltersList) {
                    savedFiltersList.innerHTML = this.renderSavedFiltersList();
                }

                this.showNotification(`🗑️ "${filter.name}" 필터가 삭제되었습니다.`);
            }
        },

        closeLoadModal() {
            const modal = document.getElementById('filterLoadModal');
            if (modal) {
                modal.remove();
            }
        },

        // =========================
        // 즐겨찾기 필터 관리
        // =========================
        updateFavoriteFiltersList() {
            const favoriteFiltersList = document.getElementById('favoriteFiltersList');
            if (!favoriteFiltersList) return;

            const favoriteFilters = this.state.savedFilters.filter(f => f.isFavorite);

            if (favoriteFilters.length === 0) {
                favoriteFiltersList.innerHTML = '<div class="no-favorites">즐겨찾기 필터가 없습니다.</div>';
                return;
            }

            favoriteFiltersList.innerHTML = favoriteFilters.map(filter => `
                <div class="favorite-filter-item" onclick="App.filterSync.loadFilter(${filter.id})">
                    <i class="fas fa-star"></i>
                    <span class="favorite-filter-name">${filter.name}</span>
                </div>
            `).join('');
        },

        // =========================
        // 전체 필터 초기화
        // =========================
        resetAllFilters() {
            if (confirm('모든 페이지의 필터를 초기화하시겠습니까?')) {
                this.state.globalFilters = {
                    period: 'all',
                    startDate: '',
                    endDate: '',
                    route: 'all',
                    position: 'all',
                    search: ''
                };

                this.applySidebarFilters(this.state.globalFilters);
                this.syncFilterUIsAndRefreshData();

                this.showNotification('🔄 모든 필터가 초기화되었습니다.');
            }
        },

        // =========================
        // 유틸리티 함수들
        // =========================
        generateFilterName() {
            const filters = this.state.globalFilters;
            const nameParts = [];

            if (filters.period !== 'all') {
                if (filters.period === 'custom' && filters.startDate && filters.endDate) {
                    nameParts.push(`${filters.startDate.slice(5)}-${filters.endDate.slice(5)}`);
                } else {
                    const periodNames = {
                        'year': '올해',
                        'month': '이번달',
                        'week': '이번주'
                    };
                    nameParts.push(periodNames[filters.period] || filters.period);
                }
            }

            if (filters.position !== 'all') {
                nameParts.push(filters.position);
            }

            if (filters.route !== 'all') {
                nameParts.push(filters.route);
            }

            return nameParts.length > 0 ? nameParts.join('_') : '커스텀필터';
        },

        showNotification(message) {
            const existingNotification = document.querySelector('.filter-notification');
            if (existingNotification) {
                existingNotification.remove();
            }

            const notification = document.createElement('div');
            notification.className = 'filter-notification';
            notification.textContent = message;
            
            document.body.appendChild(notification);

            setTimeout(() => {
                notification.classList.add('show');
            }, 100);

            setTimeout(() => {
                notification.classList.remove('show');
                setTimeout(() => {
                    if (notification.parentNode) {
                        notification.parentNode.removeChild(notification);
                    }
                }, 300);
            }, 3000);
        },

        // =========================
        // 로컬 스토리지 관리
        // =========================
        saveSavedFilters() {
            try {
                localStorage.setItem('hireDashboard_savedFilters', JSON.stringify(this.state.savedFilters));
            } catch (error) {
                console.error('필터 저장 실패:', error);
            }
        },

        loadSavedFilters() {
            try {
                const saved = localStorage.getItem('hireDashboard_savedFilters');
                if (saved) {
                    this.state.savedFilters = JSON.parse(saved);
                }
            } catch (error) {
                console.error('저장된 필터 로드 실패:', error);
                this.state.savedFilters = [];
            }
        },

        // =========================
        // 공개 API
        // =========================
        getCurrentFilters() {
            return { ...this.state.globalFilters };
        },

        setFilters(filters) {
            this.state.globalFilters = { ...this.state.globalFilters, ...filters };
            this.syncFilterUIsAndRefreshData();
        },

        isInitialized() {
            return this.state.isInitialized;
        }
    };

    // =========================
    // 자동 초기화 (강화된 버전)
    // =========================
    let initAttempts = 0;
    const maxAttempts = 20; // 최대 10초 대기

    function waitForApp() {
        initAttempts++;
        
        console.log(`🔍 App 객체 체크 시도 ${initAttempts}/${maxAttempts}`);
        
        if (window.App && 
            window.App.init && 
            window.App.state && 
            window.App.data &&
            typeof window.App.init === 'object') {
            
            console.log('✅ App 객체 완전 로드 확인! 필터 동기화 모듈 초기화 시작...');
            
            try {
                App.filterSync.init();
            } catch (error) {
                console.error('❌ 필터 동기화 초기화 실패:', error);
            }
        } else if (initAttempts < maxAttempts) {
            console.log(`⏰ App 객체 대기 중... (${initAttempts}/${maxAttempts})`);
            setTimeout(waitForApp, 500);
        } else {
            console.error('❌ App 객체 로드 타임아웃. 수동 초기화를 시도해주세요.');
            console.log('💡 브라우저 콘솔에서 "App.filterSync.init()" 입력하여 수동 초기화 가능');
        }
    }

    // 여러 방법으로 초기화 시도
    function attemptInitialization() {
        console.log('🚀 필터 동기화 모듈 초기화 시도 시작...');
        
        // 즉시 체크
        if (window.App && window.App.init && window.App.state && window.App.data) {
            console.log('✅ 즉시 초기화 가능!');
            App.filterSync.init();
            return;
        }
        
        // DOM 로드 완료 대기
        if (document.readyState === 'loading') {
            console.log('📄 DOM 로드 대기 중...');
            document.addEventListener('DOMContentLoaded', function() {
                console.log('📄 DOM 로드 완료, App 객체 대기 시작...');
                setTimeout(waitForApp, 100);
            });
        } else {
            console.log('📄 DOM 이미 로드됨, App 객체 대기 시작...');
            setTimeout(waitForApp, 100);
        }

        // window.onload로도 시도
        if (window.addEventListener) {
            window.addEventListener('load', function() {
                if (!App.filterSync.isInitialized()) {
                    console.log('🔄 window.onload에서 재시도...');
                    setTimeout(waitForApp, 200);
                }
            });
        }
    }

    // 수동 초기화 함수 글로벌 등록
    window.initFilterSync = function() {
        console.log('🔧 수동 초기화 호출됨...');
        if (window.App && window.App.filterSync) {
            App.filterSync.init();
        } else {
            console.error('❌ App.filterSync 객체를 찾을 수 없습니다.');
        }
    };

    // 초기화 시작
    attemptInitialization();

    console.log('📦 필터 동기화 모듈이 로드되었습니다.');

})();
