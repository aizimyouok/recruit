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
                this.syncAllPages();
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
        // 필터 변경 핸들러들
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

            this.syncToAllPages();
        },

        onSearchChange() {
            const globalSearch = document.getElementById('globalSearch');
            if (globalSearch) {
                this.state.globalFilters.search = globalSearch.value;
                this.syncToAllPages();
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

            this.syncToAllPages();
        },

        // =========================
        // 페이지 동기화
        // =========================
        syncAllPages() {
            this.syncToAllPages();
        },

        syncToAllPages() {
            // 현재 활성 페이지 확인
            const activePage = document.querySelector('.page.active');
            if (!activePage) return;

            const pageId = activePage.id;

            // 각 페이지별 필터 동기화
            this.syncToPage(pageId);
        },

        syncToCurrentPage() {
            const activePage = document.querySelector('.page.active');
            if (!activePage) return;

            const pageId = activePage.id;
            this.syncToPage(pageId);
        },

        syncToPage(pageId) {
            const filters = this.state.globalFilters;

            try {
                if (pageId === 'stats') {
                    this.syncToStatsPage(filters);
                } else if (pageId === 'efficiency') {
                    this.syncToEfficiencyPage(filters);
                }

                // 대시보드는 항상 동기화 (메인 필터)
                this.syncToDashboardPage(filters);

            } catch (error) {
                console.error(`페이지 ${pageId} 동기화 실패:`, error);
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

            // 필터 적용
            if (window.App && App.filter && App.filter.apply) {
                App.filter.apply();
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

            // 통계 업데이트
            if (window.App && App.stats && App.stats.update) {
                setTimeout(() => App.stats.update(), 100);
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

            // 효율성 분석 업데이트
            if (window.App && App.efficiency && App.efficiency.updateAll) {
                setTimeout(() => App.efficiency.updateAll(), 100);
            }
        },

        // =========================
        // 필터 저장/불러오기
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

            // 사이드바 필터 업데이트
            this.applySidebarFilters(filter.filters);

            // 모든 페이지 동기화
            this.syncToAllPages();

            this.closeLoadModal();
            this.showNotification(`✅ "${filter.name}" 필터가 적용되었습니다.`);
        },

        applySidebarFilters(filters) {
            const sidebarPeriodFilter = document.getElementById('sidebarPeriodFilter');
            const sidebarStartDate = document.getElementById('sidebarStartDate');
            const sidebarEndDate = document.getElementById('sidebarEndDate');
            const globalSearch = document.getElementById('globalSearch');
            const routeFilter = document.getElementById('routeFilter');
            const positionFilter = document.getElementById('positionFilter');

            if (sidebarPeriodFilter) {
                sidebarPeriodFilter.value = filters.period;
                
                if (filters.period === 'custom') {
                    const customRange = document.getElementById('sidebarCustomDateRange');
                    if (customRange) customRange.style.display = 'block';
                    if (sidebarStartDate) sidebarStartDate.value = filters.startDate;
                    if (sidebarEndDate) sidebarEndDate.value = filters.endDate;
                } else {
                    const customRange = document.getElementById('sidebarCustomDateRange');
                    if (customRange) customRange.style.display = 'none';
                }
            }

            if (globalSearch) globalSearch.value = filters.search;
            if (routeFilter) routeFilter.value = filters.route;
            if (positionFilter) positionFilter.value = filters.position;

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
                
                // 모달이 열려있으면 업데이트
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
                
                // 모달이 열려있으면 업데이트
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
                // 전역 필터 상태 초기화
                this.state.globalFilters = {
                    period: 'all',
                    startDate: '',
                    endDate: '',
                    route: 'all',
                    position: 'all',
                    search: ''
                };

                // 사이드바 필터 초기화
                this.applySidebarFilters(this.state.globalFilters);

                // 모든 페이지 동기화
                this.syncToAllPages();

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
            // 기존 알림 제거
            const existingNotification = document.querySelector('.filter-notification');
            if (existingNotification) {
                existingNotification.remove();
            }

            // 새 알림 생성
            const notification = document.createElement('div');
            notification.className = 'filter-notification';
            notification.textContent = message;
            
            document.body.appendChild(notification);

            // 애니메이션 후 제거
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
            this.syncToAllPages();
        },

        isInitialized() {
            return this.state.isInitialized;
        }
    };

    // =========================
    // 자동 초기화 (개선된 버전)
    // =========================
    function waitForApp() {
        if (window.App && window.App.init && window.App.state) {
            console.log('✅ App 객체 발견! 필터 동기화 모듈 초기화 시작...');
            App.filterSync.init();
        } else {
            console.log('⏰ App 객체 대기 중...');
            setTimeout(waitForApp, 500);
        }
    }

    // DOM 로드 완료 후 App 객체 대기
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            setTimeout(waitForApp, 100);
        });
    } else {
        setTimeout(waitForApp, 100);
    }

    console.log('📦 필터 동기화 모듈이 로드되었습니다.');

})();
