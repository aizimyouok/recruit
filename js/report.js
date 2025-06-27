// js/report.js (모든 리포트 탭 기능 구현 버전)

export const ReportModule = {
    // 모듈의 상태를 관리할 state 객체
    state: {
        currentReportType: 'executive'
    },

    // 페이지가 처음 열릴 때 실행되는 초기화 함수
    initialize(appInstance) {
        this.app = appInstance;
        console.log('📊 리포트 모듈 초기화 시작...');
        this.populateFilters();
        this.setupTabEvents();
    },

    // 탭 클릭 이벤트를 설정하는 함수
    setupTabEvents() {
        const tabContainer = document.querySelector('.report-tabs');
        if (tabContainer) {
            tabContainer.addEventListener('click', (e) => {
                if (e.target.matches('.report-tab-btn')) {
                    const reportType = e.target.dataset.reportType;
                    this.state.currentReportType = reportType;

                    document.querySelectorAll('.report-tab-btn').forEach(btn => btn.classList.remove('active'));
                    e.target.classList.add('active');

                    // 탭 클릭 시 바로 리포트 생성 (사용자 경험 향상)
                    this.generateReport();
                }
            });
        }
    },

    // 리포트 조건 필터(드롭다운)에 옵션을 채워 넣는 함수
    populateFilters() {
        const reportFilterBar = document.getElementById('reportFilterBar');
        if (!reportFilterBar) return;

        if (!this.app || !this.app.state.data.all.length) {
            reportFilterBar.innerHTML = `<p style="color: var(--text-secondary);">전체 지원자 데이터를 불러오는 중입니다...</p>`;
            setTimeout(() => this.populateFilters(), 1000);
            return;
        }

        console.log('✅ 데이터 로드 확인! 리포트 필터를 생성합니다.');
        const { headers, all } = this.app.state.data;
        const indices = {
            interviewer: headers.indexOf('면접관'),
            company: headers.indexOf('회사명'),
            route: headers.indexOf('지원루트'),
            position: headers.indexOf('모집분야')
        };

        reportFilterBar.innerHTML = `
            <div class="filter-group search-input">
                <label for="reportSearch">통합 검색</label>
                <div style="position: relative;">
                    <i class="fas fa-search search-icon"></i>
                    <input type="text" id="reportSearch" placeholder="이름, 비고 등 검색..." />
                </div>
            </div>
            <div class="filter-group"><label for="reportRouteFilter">지원루트</label><select id="reportRouteFilter"></select></div>
            <div class="filter-group"><label for="reportPositionFilter">모집분야</label><select id="reportPositionFilter"></select></div>
            <div class="filter-group"><label for="reportInterviewerFilter">면접관</label><select id="reportInterviewerFilter"></select></div>
            <div class="filter-group"><label for="reportCompanyFilter">회사명</label><select id="reportCompanyFilter"></select></div>
            <div class="filter-group date-filter-group"><label>조회 기간</label><div class="date-filter-container" id="reportDateFilterContainer"></div></div>
            <div class="filter-group reset-group"><button class="secondary-btn reset-btn" onclick="globalThis.App.report.resetFilters()"><i class="fas fa-undo"></i> 초기화</button></div>
        `;

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

        this.setInitialDateRange();
    },

    setInitialDateRange() {
        this.state = {
            ...this.state,
            dateMode: 'range',
            startDate: this.formatDateForInput(new Date(new Date().getFullYear(), 0, 1)),
            endDate: this.formatDateForInput(new Date())
        };
        this.updateDateFilterUI();
    },

    formatDateForInput(date) {
        if (!date || !(date instanceof Date)) return '';
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    },

    updateDateFilterUI() {
        const container = document.getElementById('reportDateFilterContainer');
        if (!container) return;

        container.innerHTML = `
            <div id="reportDateModeToggle" class="date-mode-toggle-group">
                <button class="date-mode-btn ${this.state.dateMode === 'all' ? 'active' : ''}" data-mode="all">전체</button>
                <button class="date-mode-btn ${this.state.dateMode === 'range' ? 'active' : ''}" data-mode="range">기간</button>
            </div>
            <div id="reportDateInputsContainer" class="date-inputs-group"></div>
        `;

        this.updateDateInputs();

        const toggleGroup = container.querySelector('#reportDateModeToggle');
        if (toggleGroup) {
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

    resetFilters() {
        const searchInput = document.getElementById('reportSearch');
        if (searchInput) searchInput.value = '';

        document.getElementById('reportRouteFilter').value = 'all';
        document.getElementById('reportPositionFilter').value = 'all';
        document.getElementById('reportInterviewerFilter').value = 'all';
        document.getElementById('reportCompanyFilter').value = 'all';
        this.setInitialDateRange();
    },

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
                const reportType = this.state.currentReportType;
                let reportHtml = '';

                switch (reportType) {
                    case 'executive':
                        reportHtml = this.buildExecutiveReport(filteredData, options);
                        break;
                    case 'detailed':
                        reportHtml = this.buildDetailedReport(filteredData, options);
                        break;
                    case 'recruiter':
                        reportHtml = this.buildRecruiterReport(filteredData, options);
                        break;
                    case 'weekly':
                        reportHtml = this.buildWeeklyReport(filteredData, options);
                        break;
                    case 'monthly':
                        reportHtml = this.buildMonthlyReport(filteredData, options);
                        break;
                    case 'comparison':
                        reportHtml = this.buildComparisonReport(filteredData, options);
                        break;
                    default:
                        reportHtml = this.buildExecutiveReport(filteredData, options);
                }

                previewContainer.innerHTML = reportHtml;

                if (reportType === 'executive') {
                    this.renderReportCharts(filteredData);
                }

            } catch (error) {
                console.error("리포트 생성 중 오류 발생:", error);
                previewContainer.innerHTML = `<div class="error-container"><i class="fas fa-exclamation-triangle error-icon"></i><h3 class="error-title">리포트 생성 실패</h3><p class="error-message">리포트를 만드는 중 문제가 발생했습니다. 콘솔을 확인해주세요.</p></div>`;
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
                const date = new Date(dateStr);
                const start = new Date(options.startDate);
                const end = new Date(options.endDate);
                return date >= start && date <= end;
            });
        }

        if (options.interviewer !== 'all' && indices.interviewer !== -1) data = data.filter(row => (row[indices.interviewer] || '').includes(options.interviewer));
        if (options.company !== 'all' && indices.company !== -1) data = data.filter(row => row[indices.company] === options.company);
        if (options.route !== 'all' && indices.route !== -1) data = data.filter(row => row[indices.route] === options.route);
        if (options.position !== 'all' && indices.position !== -1) data = data.filter(row => row[indices.position] === options.position);

        if (options.searchTerm) {
            data = data.filter(row => row.some(cell => String(cell).toLowerCase().includes(options.searchTerm)));
        }

        return data;
    },

    buildExecutiveReport(data, options) {
        const now = new Date();
        const periodText = this.getPeriodText(options);
        const headers = this.app.state.data.headers;
        const totalApplicants = data.length;
        const interviewConfirmedCount = data.filter(row => (row[headers.indexOf('1차 컨택 결과')] || '') === '면접확정').length;
        const passedCount = data.filter(row => (row[headers.indexOf('면접결과')] || '') === '합격').length;
        const joinedCount = data.filter(row => (row[headers.indexOf('입과일')] || '').trim() !== '').length;
        const interviewRate = totalApplicants > 0 ? ((interviewConfirmedCount / totalApplicants) * 100).toFixed(1) : 0;
        const passRate = interviewConfirmedCount > 0 ? ((passedCount / interviewConfirmedCount) * 100).toFixed(1) : 0;
        const joinRate = passedCount > 0 ? ((joinedCount / passedCount) * 100).toFixed(1) : 0;

        return `
            <style>
                #reportPage { padding: 20px; font-family: 'Noto Sans KR', sans-serif; background: white; color: #333; }
                #reportPage h1, #reportPage h2, #reportPage h3 { color: #334155; border-bottom: 1px solid #e2e8f0; padding-bottom: 10px; margin-bottom: 15px; }
                #reportPage h1 { font-size: 1.8rem; text-align: center; border: none; }
                #reportPage .report-info { color: #64748b; text-align: center; margin-bottom: 25px; }
                .report-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 30px; }
                .kpi-box { background: #f8fafc; border: 1px solid #e2e8f0; padding: 20px; text-align: center; border-radius: 8px;}
                .kpi-box .label { font-size: 1rem; color: #64748b; margin-bottom: 8px; }
                .kpi-box .value { font-size: 2.2rem; font-weight: 700; color: #818cf8; }
                .chart-container-report { 
                    position: relative;
                    height: 400px;
                    border: 1px solid #e2e8f0; 
                    padding: 15px; 
                    border-radius: 8px; 
                }
                 .report-placeholder {
                    text-align: center;
                    padding: 40px;
                    background-color: #f8fafc;
                    border: 2px dashed #e2e8f0;
                    border-radius: 8px;
                    color: var(--text-secondary);
                }
            </style>
            <div id="reportPage">
                <h1>경영진용 요약 리포트</h1>
                <p class="report-info">
                    <strong>조회 기간:</strong> ${periodText} | 
                    <strong>발행일:</strong> ${now.toLocaleDateString('ko-KR')}
                </p>
                <h2>핵심 성과 지표 (KPIs)</h2>
                <div class="report-grid">
                    <div class="kpi-box"><div class="label">총 지원자</div><div class="value">${totalApplicants}명</div></div>
                    <div class="kpi-box"><div class="label">면접 전환율</div><div class="value">${interviewRate}%</div></div>
                    <div class="kpi-box"><div class="label">면접자 중 합격률</div><div class="value">${passRate}%</div></div>
                    <div class="kpi-box"><div class="label">합격자 중 입과율</div><div class="value">${joinRate}%</div></div>
                </div>
                <h2>시각화 자료</h2>
                <div class="report-grid">
                    <div class="chart-container-report">
                        <h3>지원루트별 분포</h3>
                        <canvas id="reportRouteChart"></canvas>
                    </div>
                    <div class="chart-container-report">
                        <h3>모집분야별 분포</h3>
                        <canvas id="reportPositionChart"></canvas>
                    </div>
                </div>
            </div>
        `;
    },

    buildDetailedReport(data, options) {
        const periodText = this.getPeriodText(options);
        return `
            <div id="reportPage">
                <h1>상세 분석 리포트</h1>
                <p class="report-info"><strong>조회 기간:</strong> ${periodText}</p>
                <h2>지원자 전체 목록</h2>
                <div class="table-container" style="max-height: 500px; overflow-y: auto;">
                    ${this.createDetailedTable(data)}
                </div>
            </div>
        `;
    },

    buildRecruiterReport(data, options) {
        const periodText = this.getPeriodText(options);
        return `
            <div id="reportPage">
                <h1>채용담당자용 리포트</h1>
                <p class="report-info"><strong>조회 기간:</strong> ${periodText}</p>
                <div class="report-placeholder">채용담당자용 리포트 내용이 여기에 표시됩니다. (예: 면접 확정자 목록, 컨택 필요 지원자 등)</div>
            </div>
        `;
    },

    buildWeeklyReport(data, options) {
        const periodText = this.getPeriodText(options);
        return `
            <div id="reportPage">
                <h1>주간 채용 현황</h1>
                <p class="report-info"><strong>조회 기간:</strong> ${periodText}</p>
                <div class="report-placeholder">선택된 기간의 주간 채용 현황 데이터가 여기에 표시됩니다.</div>
            </div>
        `;
    },

    buildMonthlyReport(data, options) {
        const periodText = this.getPeriodText(options);
        return `
            <div id="reportPage">
                <h1>월간 채용 성과</h1>
                <p class="report-info"><strong>조회 기간:</strong> ${periodText}</p>
                <div class="report-placeholder">선택된 기간의 월간 채용 성과 데이터가 여기에 표시됩니다.</div>
            </div>
        `;
    },

    buildComparisonReport(data, options) {
        const periodText = this.getPeriodText(options);
        return `
            <div id="reportPage">
                <h1>기간별 비교 리포트</h1>
                <p class="report-info"><strong>조회 기간:</strong> ${periodText}</p>
                <div class="report-placeholder">기간별 비교 리포트 기능은 개발 예정입니다. (예: 기준 기간과 비교 기간 설정 UI 필요)</div>
            </div>
        `;
    },

    createDetailedTable(data) {
        if (!data || data.length === 0) return '<p style="text-align: center; padding: 20px;">해당 조건의 데이터가 없습니다.</p>';
        const headers = this.app.state.data.headers;
        let table = '<table class="data-table"><thead><tr>';
        headers.forEach(h => table += `<th>${h}</th>`);
        table += '</tr></thead><tbody>';
        data.forEach(row => {
            table += '<tr>';
            row.forEach(cell => table += `<td>${cell || '-'}</td>`);
            table += '</tr>';
        });
        table += '</tbody></table>';
        return table;
    },

    renderReportCharts(filteredData) {
        if (typeof Chart === 'undefined') {
            console.error('Chart.js is not loaded.');
            return;
        }

        const chartOptions = { responsive: true, maintainAspectRatio: false };
        const routeCtx = document.getElementById('reportRouteChart')?.getContext('2d');
        if (routeCtx) {
            const routeIndex = this.app.state.data.headers.indexOf('지원루트');
            const routeData = {};
            filteredData.forEach(row => {
                const route = String(row[routeIndex] || '미기입').trim();
                routeData[route] = (routeData[route] || 0) + 1;
            });
            new Chart(routeCtx, {
                type: 'doughnut',
                data: { labels: Object.keys(routeData), datasets: [{ data: Object.values(routeData), backgroundColor: Object.values(this.app.config.CHART_COLORS) }] },
                options: chartOptions
            });
        }

        const positionCtx = document.getElementById('reportPositionChart')?.getContext('2d');
        if (positionCtx) {
            const positionIndex = this.app.state.data.headers.indexOf('모집분야');
            const positionData = {};
            filteredData.forEach(row => {
                const position = String(row[positionIndex] || '미기입').trim();
                positionData[position] = (positionData[position] || 0) + 1;
            });
            new Chart(positionCtx, {
                type: 'pie',
                data: { labels: Object.keys(positionData), datasets: [{ data: Object.values(positionData), backgroundColor: Object.values(this.app.config.CHART_COLORS).reverse() }] },
                options: chartOptions
            });
        }
    },

    getPeriodText(options) {
        if (options.dateMode === 'range' && options.startDate && options.endDate) {
            return `${options.startDate} ~ ${options.endDate}`;
        }
        return '전체 기간';
    }
};
