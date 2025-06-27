// js/report.js (면접일정 필터 적용 최종 버전)

export const ReportModule = {
    // 페이지가 처음 열릴 때 실행되는 초기화 함수
    initialize(appInstance) {
        this.app = appInstance;
        console.log('📊 리포트 모듈 초기화');
        this.populateFilters();
        this.setInitialDateRange();
    },

    // 면접일정 페이지의 필터 채우기 로직을 그대로 사용
    populateFilters() {
        if (!this.app || !this.app.state.data.all.length) return;

        const { headers, all } = this.app.state.data;
        const indices = {
            interviewer: headers.indexOf('면접관'),
            company: headers.indexOf('회사명'),
            route: headers.indexOf('지원루트'),
            position: headers.indexOf('모집분야')
        };

        const populate = (selector, index) => {
            const selectElement = document.getElementById(selector);
            if (selectElement && index !== -1) {
                const options = [...new Set(all.map(row => (row[index] || '').trim()).filter(Boolean))];
                selectElement.innerHTML = `<option value="all">전체</option>`;
                options.sort().forEach(name => {
                    selectElement.innerHTML += `<option value="${name}">${name}</option>`;
                });
            }
        };

        populate('reportInterviewerFilter', indices.interviewer);
        populate('reportCompanyFilter', indices.company);
        populate('reportRouteFilter', indices.route);
        populate('reportPositionFilter', indices.position);
    },
    
    // 면접일정 페이지의 날짜 설정 로직을 그대로 사용
    setInitialDateRange() {
        this.state = {
            ...this.state,
            dateMode: 'range',
            startDate: this.formatDateForInput(new Date(new Date().getFullYear(), 0, 1)), // 올해 1월 1일
            endDate: this.formatDateForInput(new Date()) // 오늘
        };
        this.updateDateFilterUI();
    },

    formatDateForInput(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    },

    updateDateFilterUI() {
        const container = document.getElementById('reportDateFilterContainer');
        if (!container) return;

        let html = `
            <div id="reportDateModeToggle" class="date-mode-toggle-group">
                <button class="date-mode-btn ${this.state.dateMode === 'all' ? 'active' : ''}" data-mode="all">전체</button>
                <button class="date-mode-btn ${this.state.dateMode === 'range' ? 'active' : ''}" data-mode="range">기간</button>
            </div>
            <div id="reportDateInputsContainer" class="date-inputs-group"></div>
        `;
        container.innerHTML = html;

        this.updateDateInputs();

        const toggleGroup = container.querySelector('#reportDateModeToggle');
        if(toggleGroup) {
            toggleGroup.addEventListener('click', (e) => {
                if (e.target.tagName === 'BUTTON') {
                    this.state.dateMode = e.target.dataset.mode;
                    this.updateDateFilterUI();
                }
            });
        }
    },
    
    updateDateInputs() {
        const container = document.getElementById('reportDateInputsContainer');
        if (!container) return;
        
        if (this.state.dateMode === 'range') {
            container.innerHTML = `
                <input type="date" class="date-input" id="reportStartDate" value="${this.state.startDate}">
                <span style="margin: 0 5px;">-</span>
                <input type="date" class="date-input" id="reportEndDate" value="${this.state.endDate}">
            `;
        } else {
             container.innerHTML = `<span style="padding: 0 10px; color: var(--text-secondary);">전체 기간</span>`;
        }
    },

    // '리포트 생성' 버튼 클릭 시 실행되는 메인 함수
    generateReport() {
        const previewContainer = document.getElementById('reportPreviewContainer');
        previewContainer.innerHTML = `<div class="smooth-loading-container"><div class="advanced-loading-spinner"></div><p class="loading-text">리포트를 생성 중입니다...</p></div>`;

        setTimeout(() => {
            try {
                const options = {
                    interviewer: document.getElementById('reportInterviewerFilter').value,
                    company: document.getElementById('reportCompanyFilter').value,
                    route: document.getElementById('reportRouteFilter').value,
                    position: document.getElementById('reportPositionFilter').value,
                    searchTerm: (document.getElementById('reportSearch')?.value || '').toLowerCase(),
                    dateMode: this.state.dateMode,
                    startDate: document.getElementById('reportStartDate')?.value,
                    endDate: document.getElementById('reportEndDate')?.value,
                };
                
                const filteredData = this.getFilteredData(options);
                const reportHtml = this.buildReportHtml(filteredData, options);
                previewContainer.innerHTML = reportHtml;
                this.renderReportCharts(filteredData);
            } catch (error) {
                console.error("리포트 생성 중 오류 발생:", error);
                previewContainer.innerHTML = `<div class="error-container"><i class="fas fa-exclamation-triangle error-icon"></i><h3 class="error-title">리포트 생성 실패</h3><p class="error-message">리포트를 만드는 중 문제가 발생했습니다. 다시 시도해주세요.</p></div>`;
            }
        }, 500);
    },

    getFilteredData(options) {
        const { all, headers } = this.app.state.data;
        let data = [...all];
        const indices = {
            applyDate: headers.indexOf('지원일'),
            interviewer: headers.indexOf('면접관'),
            company: headers.indexOf('회사명'),
            route: headers.indexOf('지원루트'),
            position: headers.indexOf('모집분야')
        };

        if (options.dateMode === 'range' && indices.applyDate !== -1) {
            data = data.filter(row => {
                const dateStr = row[indices.applyDate];
                if (!dateStr || !options.startDate || !options.endDate) return true;
                return dateStr >= options.startDate && dateStr <= options.endDate;
            });
        }
        
        if (options.interviewer !== 'all' && indices.interviewer !==-1) data = data.filter(row => (row[indices.interviewer] || '').includes(options.interviewer));
        if (options.company !== 'all' && indices.company !==-1) data = data.filter(row => row[indices.company] === options.company);
        if (options.route !== 'all' && indices.route !== -1) data = data.filter(row => row[indices.route] === options.route);
        if (options.position !== 'all' && indices.position !== -1) data = data.filter(row => row[indices.position] === options.position);
        
        if (options.searchTerm) {
            data = data.filter(row => row.some(cell => String(cell).toLowerCase().includes(options.searchTerm)));
        }
        
        return data;
    },
    
    resetFilters() {
        document.getElementById('reportSearch').value = '';
        document.getElementById('reportRouteFilter').value = 'all';
        document.getElementById('reportPositionFilter').value = 'all';
        document.getElementById('reportInterviewerFilter').value = 'all';
        document.getElementById('reportCompanyFilter').value = 'all';
        this.setInitialDateRange();
    },

    // 이 아래의 함수들은 이전과 동일합니다.
    buildReportHtml(data, options) { /* 이전과 동일 */ },
    renderReportCharts(filteredData) { /* 이전과 동일 */ },
    getPeriodText(options) { /* 이전과 동일 */ }
};
