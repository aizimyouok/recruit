// js/report.js (데이터를 스스로 확인하는 최종 버전)

export const ReportModule = {
    // 모듈의 상태를 관리할 state 객체
    state: {
        currentReportType: 'executive' // 현재 선택된 리포트 타입을 저장할 상태 추가
    },

    // 페이지가 처음 열릴 때 실행되는 초기화 함수
    initialize(appInstance) {
        this.app = appInstance;
        console.log('📊 리포트 모듈 초기화 시작...');
        this.populateFilters();
        this.setupTabEvents(); // 탭 이벤트 리스너 설정 함수 호출 추가
    },

    // 탭 클릭 이벤트를 설정하는 새 함수 추가
    setupTabEvents() {
        const tabContainer = document.querySelector('.report-tabs');
        if (tabContainer) {
            tabContainer.addEventListener('click', (e) => {
                if (e.target.matches('.report-tab-btn')) {
                    const reportType = e.target.dataset.reportType;
                    this.state.currentReportType = reportType; // 현재 리포트 타입 상태 업데이트

                    // 모든 탭의 active 클래스 제거 후, 클릭된 탭에만 추가
                    document.querySelectorAll('.report-tab-btn').forEach(btn => btn.classList.remove('active'));
                    e.target.classList.add('active');

                    // 탭을 누르면 바로 리포트가 생성되도록 하려면 아래 주석을 해제하세요.
                    // this.generateReport();
                }
            });
        }
    },

    // 리포트 조건 필터(드롭다운)에 옵션을 채워 넣는 함수
    populateFilters() {
        const reportFilterBar = document.getElementById('reportFilterBar');
        if (!reportFilterBar) return;

        // 데이터가 아직 준비되지 않았다면,
        if (!this.app || !this.app.state.data.all.length) {
            reportFilterBar.innerHTML = `<p style="color: var(--text-secondary);">전체 지원자 데이터를 불러오는 중입니다...</p>`;
            // 1초 뒤에 다시 이 함수를 실행하여 데이터가 준비되었는지 확인합니다.
            setTimeout(() => this.populateFilters(), 1000);
            return; // 데이터가 없으므로 여기서 함수를 중단합니다.
        }

        // --- 이 아래 코드는 데이터가 성공적으로 로드되었을 때만 실행됩니다 ---
        console.log('✅ 데이터 로드 확인! 리포트 필터를 생성합니다.');
        const { headers, all } = this.app.state.data;
        const indices = {
            interviewer: headers.indexOf('면접관'),
            company: headers.indexOf('회사명'),
            route: headers.indexOf('지원루트'),
            position: headers.indexOf('모집분야')
        };

        // 면접일정 페이지의 필터 UI를 그대로 가져옵니다.
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

        this.setInitialDateRange(); // 날짜 필터 초기화
    },

    setInitialDateRange() {
        this.state = {
            ...this.state, // 기존의 currentReportType을 유지하기 위해 ...this.state 사용
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

    resetFilters() {
        const searchInput = document.getElementById('reportSearch');
        if(searchInput) searchInput.value = '';

        document.getElementById('reportRouteFilter').value = 'all';
        document.getElementById('reportPositionFilter').value = 'all';
        document.getElementById('reportInterviewerFilter').value = 'all';
        document.getElementById('reportCompanyFilter').value = 'all';
        this.setInitialDateRange();
    },

    // '리포트 생성하기' 버튼 클릭 시 실행되는 메인 함수
    generateReport() {
        const previewContainer = document.getElementById('reportPreviewContainer');
        previewContainer.innerHTML = `<div class="smooth-loading-container"><div class="advanced-loading-spinner"></div><p class="loading-text">리포트를 생성 중입니다...</p></div>`;

        setTimeout(() => {
            try {
                // UI에서 현재 필터 값들을 가져옴
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
                
                // 선택된 리포트 타입에 따라 다른 HTML 생성 함수를 호출
                const reportType = this.state.currentReportType;
                let reportHtml = '';

                switch (reportType) {
                    case 'executive':
                        reportHtml = this.buildExecutiveReport(filteredData, options);
                        break;
                    case 'detailed':
                        reportHtml = this.buildDetailedReport(filteredData, options);
                        break;
                    // 다른 리포트 타입에 대한 케이스를 여기에 추가할 수 있습니다.
                    // case 'recruiter':
                    //     reportHtml = this.buildRecruiterReport(filteredData, options);
                    //     break;
                    default:
                        // 기본값으로 경영진 리포트 표시
                        reportHtml = this.buildExecutiveReport(filteredData, options);
                }

                previewContainer.innerHTML = reportHtml;
                
                // 리포트 타입에 맞는 차트를 그리도록 수정
                if (reportType === 'executive' || reportType === 'detailed') {
                    this.renderReportCharts(filteredData);
                }

            } catch (error) {
                console.error("리포트 생성 중 오류 발생:", error);
                previewContainer.innerHTML = `<div class="error-container"><i class="fas fa-exclamation-triangle error-icon"></i><h3 class="error-title">리포트 생성 실패</h3><p class="error-message">리포트를 만드는 중 문제가 발생했습니다. 콘솔을 확인해주세요.</p></div>`;
            }
        }, 500);
    },

    // 선택된 옵션에 따라 데이터를 필터링하는 함수
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

        if (options.interviewer !== 'all' && indices.interviewer !==-1) data = data.filter(row => (row[indices.interviewer] || '').includes(options.interviewer));
        if (options.company !== 'all' && indices.company !==-1) data = data.filter(row => row[indices.company] === options.company);
        if (options.route !== 'all' && indices.route !== -1) data = data.filter(row => row[indices.route] === options.route);
        if (options.position !== 'all' && indices.position !== -1) data = data.filter(row => row[indices.position] === options.position);

        if (options.searchTerm) {
            data = data.filter(row => row.some(cell => String(cell).toLowerCase().includes(options.searchTerm)));
        }

        return data;
    },

    // 경영진용 요약 리포트 HTML 생성
    buildExecutiveReport(data, options) {
        console.log("경영진용 요약 리포트 생성");
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
                .chart-container-report { border: 1px solid #e2e8f0; padding: 15px; border-radius: 8px; }
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

    // 상세 분석 리포트 HTML 생성
    buildDetailedReport(data, options) {
        console.log("상세 분석 리포트 생성");
        const now = new Date();
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

    // 상세 테이블 HTML 생성 헬퍼 함수
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

    // 리포트 내부에 차트를 그리는 함수
    renderReportCharts(filteredData) {
        // Chart.js가 로드되었는지 확인
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

    // 리포트 상단에 표시될 기간 텍스트를 생성하는 함수
    getPeriodText(options) {
        if (options.dateMode === 'range' && options.startDate && options.endDate) {
            return `${options.startDate} ~ ${options.endDate}`;
        }
        return '전체 기간';
    }
};
