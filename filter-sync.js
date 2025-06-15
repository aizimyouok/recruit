/**
 * =======================================
 * 필터 동기화 모듈 (Filter Synchronization Module)
 * =======================================
 * 역할: 애플리케이션 내의 모든 필터 UI(사이드바, 현황, 통계, 효율성)의 상태를
 * 양방향으로 동기화하고, 변경 시 모든 페이지 콘텐츠를 업데이트합니다.
 */
const FilterSync = {
    /**
     * 동기화 모듈을 초기화하고 모든 필터 UI에 이벤트 리스너를 연결합니다.
     */
    init() {
        this.attachEventListeners('sidebar');
        this.attachEventListeners('dashboard');
        this.attachEventListeners('stats');
        this.attachEventListeners('efficiency');
        console.log('✅ FilterSync initialized.');
    },

    /**
     * 지정된 위치(location)의 필터 UI 요소들에 이벤트 리스너를 부착합니다.
     */
    attachEventListeners(location) {
        let periodEl, customContainer;

        if (location === 'sidebar') {
            periodEl = document.getElementById('sidebarPeriodFilter');
            customContainer = document.getElementById('sidebarCustomDateRange');
        } else if (location === 'dashboard') {
            document.getElementById('dateModeToggle').addEventListener('click', (e) => {
                if (e.target.tagName === 'BUTTON') {
                    // 현황 페이지는 App.state.ui.activeDateMode를 먼저 업데이트해야 함
                    App.state.ui.activeDateMode = e.target.dataset.mode;
                    this.applyAndSync('dashboard');
                }
            });
            document.getElementById('dateInputsContainer').addEventListener('change', (e) => {
                 if (e.target.tagName === 'INPUT') this.applyAndSync('dashboard');
            });
            return;
        } else {
            periodEl = document.getElementById(`${location}PeriodFilter`);
            customContainer = document.getElementById(`${location}CustomDateRange`);
        }

        if (periodEl) {
            periodEl.addEventListener('change', () => this.applyAndSync(location));
        }
        if (customContainer) {
            customContainer.querySelectorAll('input, button').forEach(el => {
                const eventType = el.tagName === 'BUTTON' ? 'click' : 'change';
                el.addEventListener(eventType, () => this.applyAndSync(location));
            });
        }
    },

    /**
     * 특정 UI 위치에서 현재 필터 값을 읽어 객체로 반환합니다.
     * [수정] 'year', 'month', 'week' 등에 대한 실제 날짜 계산 로직 추가
     * @param {string} source - 변경이 발생한 UI의 위치
     * @returns {{period: string, startDate: string, endDate: string}}
     */
    readFiltersFrom(source) {
        let period, startDate = '', endDate = '';
        const now = new Date();

        // [수정] 필터 초기화('reset') 소스에 대한 처리 추가
        if (source === 'reset') {
            return { period: 'all', startDate: '', endDate: '' };
        }
        
        if (source === 'dashboard') {
            period = App.state.ui.activeDateMode;
            if (period === 'range') {
                startDate = document.getElementById('startDateInput')?.value || '';
                endDate = document.getElementById('endDateInput')?.value || '';
            } else if (period !== 'all') {
                const dateInput = document.getElementById('dateInput');
                startDate = dateInput ? dateInput.value : '';
                endDate = startDate; 
            }
        } else {
            const periodEl = document.getElementById(`${source}PeriodFilter`);
            period = periodEl ? periodEl.value : 'all';
            
            if (period === 'custom') {
                const startEl = document.getElementById(`${source}StartDate`);
                const endEl = document.getElementById(`${source}EndDate`);
                startDate = startEl ? startEl.value : '';
                endDate = endEl ? endEl.value : '';
            } else if (period === 'year') {
                startDate = `${now.getFullYear()}-01-01`;
                endDate = `${now.getFullYear()}-12-31`;
            } else if (period === 'month') {
                const year = now.getFullYear();
                const month = now.getMonth();
                const firstDay = new Date(year, month, 1);
                const lastDay = new Date(year, month + 1, 0);
                startDate = firstDay.toISOString().split('T')[0];
                endDate = lastDay.toISOString().split('T')[0];
            } else if (period === 'week') {
                const first = now.getDate() - now.getDay();
                const firstDay = new Date(now.setDate(first));
                const lastDay = new Date(now.setDate(first + 6));
                startDate = firstDay.toISOString().split('T')[0];
                endDate = lastDay.toISOString().split('T')[0];
            }
        }
        return { period, startDate, endDate };
    },
    
    /**
     * 중앙 상태에 따라 특정 UI의 값을 업데이트합니다.
     */
    updateUIFor(location) {
        const centralState = App.state.filters;
        const periodMap = {
            'year': 'year', 'month': 'month', 'week': 'week',
            'custom': 'custom', 'range': 'range',
            'day': 'day', 'all': 'all'
        };
        const mappedPeriod = periodMap[centralState.period] || 'all';

        if (location === 'dashboard') {
            App.state.ui.activeDateMode = mappedPeriod;
            App.filter.updateDateFilterUI(); // UI 구조를 다시 그림

            // UI가 다시 그려진 후 값 설정
            setTimeout(() => {
                if (centralState.period === 'range') {
                    const startDateInput = document.getElementById('startDateInput');
                    const endDateInput = document.getElementById('endDateInput');
                    if(startDateInput) startDateInput.value = centralState.startDate;
                    if(endDateInput) endDateInput.value = centralState.endDate;
                } else if (centralState.period !== 'all') {
                    const dateInput = document.getElementById('dateInput');
                    if(dateInput) dateInput.value = centralState.startDate;
                }
            }, 0);

        } else {
            const periodEl = document.getElementById(`${location}PeriodFilter`);
            const customContainer = document.getElementById(`${location}CustomDateRange`);
            const startEl = document.getElementById(`${location}StartDate`);
            const endEl = document.getElementById(`${location}EndDate`);
            
            if (periodEl) periodEl.value = mappedPeriod;

            const isCustom = mappedPeriod === 'custom';
            if (customContainer) {
                 customContainer.style.display = isCustom ? (location === 'sidebar' ? 'block' : 'flex') : 'none';
            }
            
            if (isCustom) {
                if (startEl) startEl.value = centralState.startDate;
                if (endEl) endEl.value = centralState.endDate;
            }
        }
    },

    /**
     * 변경이 시작된 UI를 제외한 모든 필터 UI를 중앙 상태에 맞춰 업데이트합니다.
     */
    updateAllUIs(sourceToSkip) {
        const locations = ['sidebar', 'dashboard', 'stats', 'efficiency'];
        locations.forEach(loc => {
            if (loc !== sourceToSkip) {
                this.updateUIFor(loc);
            }
        });
    },

    /**
     * 동기화 프로세스의 메인 함수입니다.
     */
    applyAndSync(source) {
        const newFilters = this.readFiltersFrom(source);
        App.state.filters = { ...App.state.filters, ...newFilters };
        this.updateAllUIs(source);

        console.log(`🔄 Filter sync triggered from '${source}'. Refreshing all components.`, App.state.filters);
        
        if (App.sidebar && typeof App.sidebar.updateWidgets === 'function') {
            App.sidebar.updateWidgets();
        }
        if (App.filter && typeof App.filter.apply === 'function') {
            App.filter.apply();
        }
        if (App.stats && typeof App.stats.update === 'function') {
            App.stats.update();
        }
        if (App.efficiency && typeof App.efficiency.updateAll === 'function') {
            App.efficiency.updateAll();
        }
    }
};
