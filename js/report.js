// js/report.js (초기화 오류 수정된 최종 버전)

export const ReportModule = {
    // 모듈의 상태를 관리할 state 객체 추가 (이 부분이 누락되어 오류 발생)
    state: {},

    // 페이지가 처음 열릴 때 실행되는 초기화 함수
    initialize(appInstance) {
        this.app = appInstance;
        console.log('📊 리포트 모듈 초기화');
        this.populateFilters();
        this.setInitialDateRange();
    },

    // 필터 드롭다운 목록을 데이터로 채우는 함수
    populateFilters() {
        if (!this.app || !this.app.state.data.all.length) {
            console.log('리포트 필터 생성 대기: 데이터가 아직 로드되지 않았습니다.');
            return;
        }

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
    
    // 페이지 로드 시 기본 날짜 범위를 설정하는 함수
    setInitialDateRange() {
        // 모듈의 state를 초기화 (기존 코드에서는 이 부분이 잘못되어 있었음)
        this.state = {
            dateMode: 'range',
            startDate: this.formatDateForInput(new Date(new Date().getFullYear(), 0, 1)), // 올해 1월 1일
            endDate: this.formatDateForInput(new Date()) // 오늘
        };
        this.updateDateFilterUI();
    },

    // 날짜를 YYYY-MM-DD 형식으로 변환하는 헬퍼 함수
    formatDateForInput(date) {
        if (!date || !(date instanceof Date)) return '';
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    },

    // 날짜 필터 UI를 현재 상태에 맞게 업데이트하는 함수
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
    
    // 날짜 입력 필드를 업데이트하는 함수
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
             container.innerHTML = `<span class="date-input-text">전체 기간</span>`;
        }
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
                const reportHtml = this.buildReportHtml(filteredData, options);
                previewContainer.innerHTML = reportHtml;
                this.renderReportCharts(filteredData);
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
    
    // '초기화' 버튼 클릭 시 필터를 기본값으로 되돌리는 함수
    resetFilters() {
        const searchInput = document.getElementById('reportSearch');
        if(searchInput) searchInput.value = '';
        
        document.getElementById('reportRouteFilter').value = 'all';
        document.getElementById('reportPositionFilter').value = 'all';
        document.getElementById('reportInterviewerFilter').value = 'all';
        document.getElementById('reportCompanyFilter').value = 'all';
        this.setInitialDateRange();
    },

    // 필터링된 데이터로 리포트의 HTML 구조를 만드는 함수
    buildReportHtml(data, options) {
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
                <h1>채용 현황 리포트</h1>
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

    // 리포트 내부에 차트를 그리는 함수
    renderReportCharts(filteredData) {
        const chartOptions = { responsive: true, maintainAspectRatio: false };
        const routeCtx = document.getElementById('reportRouteChart');
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
        
        const positionCtx = document.getElementById('reportPositionChart');
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
        if (options.dateMode === 'range') return `${options.startDate} ~ ${options.endDate}`;
        return '전체 기간';
    }
};
