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
     * 이 함수는 App.init.start()의 마지막에 호출되어야 합니다.
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
     * @param {string} location - 'sidebar', 'dashboard', 'stats', 'efficiency'
     */
    attachEventListeners(location) {
        let periodEl, customContainer;

        if (location === 'sidebar') {
            periodEl = document.getElementById('sidebarPeriodFilter');
            customContainer = document.getElementById('sidebarCustomDateRange');
        } else if (location === 'dashboard') {
            // 현황 페이지는 UI가 동적으로 생성되므로 상위 컨테이너에 이벤트 위임 사용
            document.getElementById('dateModeToggle').addEventListener('click', (e) => {
                if (e.target.tagName === 'BUTTON') this.applyAndSync('dashboard');
            });
            document.getElementById('dateInputsContainer').addEventListener('change', (e) => {
                 if (e.target.tagName === 'INPUT') this.applyAndSync('dashboard');
            });
            return; // 아래 로직은 필요 없으므로 반환
        } else {
            periodEl = document.getElementById(`${location}PeriodFilter`);
            customContainer = document.getElementById(`${location}CustomDateRange`);
        }

        if (periodEl) {
            periodEl.addEventListener('change', () => this.applyAndSync(location));
        }
        if (customContainer) {
            // 커스텀 날짜 범위 내의 모든 input과 button에 리스너 추가
            customContainer.querySelectorAll('input, button').forEach(el => {
                const eventType = el.tagName === 'BUTTON' ? 'click' : 'change';
                el.addEventListener(eventType, () => this.applyAndSync(location));
            });
        }
    },

    /**
     * 특정 UI 위치에서 현재 필터 값을 읽어 객체로 반환합니다.
     * @param {string} source - 변경이 발생한 UI의 위치
     * @returns {{period: string, startDate: string, endDate: string}}
     */
    readFiltersFrom(source) {
        let period, startDate = '', endDate = '';

        if (source === 'dashboard') {
            period = App.state.ui.activeDateMode; // 현황 페이지는 App 객체 상태를 직접 사용
            if (period === 'range') {
                startDate = document.getElementById('startDateInput')?.value || '';
                endDate = document.getElementById('endDateInput')?.value || '';
            } else if (period !== 'all') {
                startDate = document.getElementById('dateInput')?.value || '';
                endDate = startDate; // 연,월,일 모드는 시작/종료일이 같음
            }
        } else {
            const periodEl = document.getElementById(`${source}PeriodFilter`);
            period = periodEl ? periodEl.value : 'all';
            
            if (period === 'custom') {
                const startEl = document.getElementById(`${source}StartDate`);
                const endEl = document.getElementById(`${source}EndDate`);
                startDate = startEl ? startEl.value : '';
                endDate = endEl ? endEl.value : '';
            }
        }
        return { period, startDate, endDate };
    },

    /**
     * 중앙 상태에 따라 특정 UI의 값을 업데이트합니다. (UI 자동 변경 로직)
     * @param {string} location - 값을 업데이트할 UI의 위치
     */
    updateUIFor(location) {
        const centralState = App.state.filters;

        if (location === 'dashboard') {
            // 현황 페이지는 기존의 UI 업데이트 함수를 그대로 활용
            if (App.state.ui.activeDateMode !== centralState.period) {
                App.state.ui.activeDateMode = centralState.period;
                App.filter.updateDateFilterUI();
            }
            // 값 설정
            const dateInput = document.getElementById('dateInput');
            const startDateInput = document.getElementById('startDateInput');
            const endDateInput = document.getElementById('endDateInput');

            if (centralState.period === 'range') {
                if(startDateInput) startDateInput.value = centralState.startDate;
                if(endDateInput) endDateInput.value = centralState.endDate;
            } else if (centralState.period !== 'all') {
                if(dateInput) dateInput.value = centralState.startDate;
            }

        } else {
            const periodEl = document.getElementById(`${location}PeriodFilter`);
            const customContainer = document.getElementById(`${location}CustomDateRange`);
            const startEl = document.getElementById(`${location}StartDate`);
            const endEl = document.getElementById(`${location}EndDate`);

            if (periodEl) periodEl.value = centralState.period;

            // 기간 직접입력(custom) UI 표시 여부 처리
            if (customContainer) {
                 customContainer.style.display = centralState.period === 'custom' ? 'block' : 'none';
                 if (location === 'stats' || location === 'efficiency') {
                     customContainer.style.display = centralState.period === 'custom' ? 'flex' : 'none';
                 }
            }
            
            if (centralState.period === 'custom') {
                if (startEl) startEl.value = centralState.startDate;
                if (endEl) endEl.value = centralState.endDate;
            }
        }
    },

    /**
     * 변경이 시작된 UI를 제외한 모든 필터 UI를 중앙 상태에 맞춰 업데이트합니다.
     * @param {string} sourceToSkip - 업데이트에서 제외할 UI 위치
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
     * @param {string} source - 변경을 시작한 UI 위치
     */
    applyAndSync(source) {
        // 1. 변경된 UI에서 최신 필터 값을 읽어옵니다.
        const newFilters = this.readFiltersFrom(source);

        // 2. 중앙 필터 상태(App.state.filters)를 업데이트합니다.
        App.state.filters = { ...App.state.filters, ...newFilters };
        
        // 3. 변경을 시작한 UI를 제외한 나머지 모든 UI의 값을 동기화합니다. (무한루프 방지)
        this.updateAllUIs(source);

        // 4. 동기화된 중앙 상태를 기준으로 모든 페이지의 콘텐츠를 새로고침합니다.
        console.log(`🔄 Filter sync triggered from '${source}'. Refreshing all components.`);
        
        // 각 컴포넌트의 업데이트 함수가 존재하는지 확인 후 호출
        if (App.sidebar && typeof App.sidebar.updateWidgets === 'function') {
            App.sidebar.updateWidgets();
        }
        if (App.filter && typeof App.filter.apply === 'function') {
            App.filter.apply(); // 현황 페이지 업데이트
        }
        if (App.stats && typeof App.stats.update === 'function') {
            App.stats.update(); // 통계 페이지 업데이트
        }
        if (App.efficiency && typeof App.efficiency.updateAll === 'function') {
            App.efficiency.updateAll(); // 효율성 페이지 업데이트
        }
    }
};