// js/report.js (신규 파일)

export const ReportModule = {
    // 페이지가 처음 열릴 때 실행되는 초기화 함수
    initialize(appInstance) {
        this.app = appInstance;
        console.log('📊 리포트 모듈 초기화');
        this.populateFilters(); // 필터 옵션 채우기
    },

    // 리포트 조건 필터(드롭다운)에 옵션을 채워 넣는 함수
    populateFilters() {
        if (!this.app || !this.app.state.data.all.length) return;

        const { headers, all } = this.app.state.data;
        const reportFilterBar = document.getElementById('reportFilterBar');
        if (!reportFilterBar) return;

        // 필터 HTML 구조 생성
        reportFilterBar.innerHTML = `
            <div class="filter-group">
                <label for="reportPeriod">기간</label>
                <select id="reportPeriod" onchange="ReportModule.handlePeriodChange(this.value)">
                    <option value="all">전체</option>
                    <option value="year">올해</option>
                    <option value="month" selected>이번 달</option>
                    <option value="week">이번 주</option>
                    <option value="custom">기간 직접 선택</option>
                </select>
                <div id="reportCustomDateRange" style="display: none; margin-top: 5px; display: flex; gap: 10px;">
                    <input type="date" id="reportStartDate">
                    <input type="date" id="reportEndDate">
                </div>
            </div>
            <div class="filter-group">
                <label for="reportInterviewer">면접관</label>
                <select id="reportInterviewer"><option value="all">전체</option></select>
            </div>
            <div class="filter-group">
                <label for="reportRoute">지원 루트</label>
                <select id="reportRoute"><option value="all">전체</option></select>
            </div>
        `;

        // 드롭다운 옵션 채우기
        const interviewerIndex = headers.indexOf('면접관');
        const routeIndex = headers.indexOf('지원루트');

        if (interviewerIndex !== -1) {
            const options = [...new Set(all.map(row => (row[interviewerIndex] || '').trim()).filter(Boolean))];
            const select = document.getElementById('reportInterviewer');
            options.sort().forEach(name => select.innerHTML += \`<option value="\${name}">\${name}</option>\`);
        }
        if (routeIndex !== -1) {
            const options = [...new Set(all.map(row => (row[routeIndex] || '').trim()).filter(Boolean))];
            const select = document.getElementById('reportRoute');
            options.sort().forEach(name => select.innerHTML += \`<option value="\${name}">\${name}</option>\`);
        }

        // 기간 선택 '직접입력' 핸들러
        this.handlePeriodChange('month');
    },

    // 기간 선택 변경 시, 직접입력 필드를 보여주거나 숨기는 함수
    handlePeriodChange(value) {
        const customRange = document.getElementById('reportCustomDateRange');
        if (customRange) {
            const now = new Date();
            if (value === 'custom') {
                customRange.style.display = 'flex';
                document.getElementById('reportStartDate').valueAsDate = new Date(now.getFullYear(), now.getMonth(), 1);
                document.getElementById('reportEndDate').valueAsDate = now;
            } else {
                customRange.style.display = 'none';
            }
        }
    },

    // '리포트 생성' 버튼 클릭 시 실행되는 메인 함수
    generateReport() {
        const previewContainer = document.getElementById('reportPreviewContainer');
        previewContainer.innerHTML = \`
            <div class="smooth-loading-container">
                <div class="advanced-loading-spinner"></div>
                <p>리포트를 생성 중입니다...</p>
            </div>
        \`;

        // 0.5초 후 리포트 생성 (로딩 애니메이션을 보여주기 위함)
        setTimeout(() => {
            // 1. 선택된 필터 값 가져오기
            const options = {
                period: document.getElementById('reportPeriod').value,
                startDate: document.getElementById('reportStartDate').value,
                endDate: document.getElementById('reportEndDate').value,
                interviewer: document.getElementById('reportInterviewer').value,
                route: document.getElementById('reportRoute').value
            };

            // 2. 필터에 맞는 데이터 추출
            const filteredData = this.getFilteredData(options);

            // 3. 리포트 HTML 생성 및 표시
            const reportHtml = this.buildReportHtml(filteredData, options);
            previewContainer.innerHTML = reportHtml;

            // 4. 리포트 내 차트 그리기
            this.renderReportCharts(filteredData);
        }, 500);
    },

    // 옵션에 따라 데이터를 필터링하는 함수
    getFilteredData(options) {
        const { all, headers } = this.app.state.data;
        let data = [...all];

        // 기간 필터링
        const applyDateIndex = headers.indexOf('지원일');
        if (applyDateIndex !== -1 && options.period !== 'all') {
            if (options.period === 'custom') {
                 if (options.startDate && options.endDate) {
                    const start = new Date(options.startDate);
                    const end = new Date(options.endDate);
                    end.setHours(23, 59, 59, 999);
                    data = data.filter(row => {
                        const date = new Date(row[applyDateIndex]);
                        return date >= start && date <= end;
                    });
                 }
            } else {
                 data = this.app.utils.filterDataByPeriod(data, options.period, applyDateIndex, new Date()).data;
            }
        }

        // 면접관 필터링
        const interviewerIndex = headers.indexOf('면접관');
        if (interviewerIndex !== -1 && options.interviewer !== 'all') {
            data = data.filter(row => (row[interviewerIndex] || '').includes(options.interviewer));
        }

        // 지원루트 필터링
        const routeIndex = headers.indexOf('지원루트');
        if (routeIndex !== -1 && options.route !== 'all') {
            data = data.filter(row => row[routeIndex] === options.route);
        }
        
        return data;
    },

    // 필터링된 데이터로 리포트의 전체 HTML 구조를 만드는 함수
    buildReportHtml(data, options) {
        // ... (KPI, 차트, 테이블 등 리포트 내용 구성)
        // 이 부분은 다음 단계에서 더 상세하게 채워나갈 예정입니다.
        // 지금은 기본적인 틀만 만듭니다.
        const now = new Date();
        const periodText = this.getPeriodText(options);

        const totalApplicants = data.length;
        const passedCount = data.filter(row => (row[this.app.state.data.headers.indexOf('면접결과')] || '') === '합격').length;
        const passRate = totalApplicants > 0 ? ((passedCount / totalApplicants) * 100).toFixed(1) : 0;

        return \`
            <style>
                /* PDF 출력 시 깔끔하게 보이도록 스타일 지정 */
                #reportPage { padding: 20px; font-family: 'Noto Sans KR', sans-serif; }
                h1, h2, h3 { color: #333; border-bottom: 2px solid #eee; padding-bottom: 10px; margin-bottom: 15px; }
                .report-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
                .kpi-box { background: #f9f9f9; border: 1px solid #ddd; padding: 15px; text-align: center; border-radius: 8px;}
                .kpi-box .label { font-size: 1rem; color: #666; }
                .kpi-box .value { font-size: 2rem; font-weight: 700; color: #818cf8; }
                table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                th, td { border: 1px solid #ddd; padding: 8px; text-align: center; font-size: 0.8rem; }
                th { background: #f2f2f2; }
            </style>
            <div id="reportPage">
                <h1>채용 현황 리포트</h1>
                <p><strong>조회 기간:</strong> \${periodText}</p>
                <p><strong>발행일:</strong> \${now.toLocaleDateString('ko-KR')}</p>
                <hr style="margin: 20px 0;">

                <h2>핵심 성과 지표 (KPIs)</h2>
                <div class="report-grid">
                    <div class="kpi-box">
                        <div class="label">총 지원자</div>
                        <div class="value">\${totalApplicants}명</div>
                    </div>
                    <div class="kpi-box">
                        <div class="label">최종 합격률</div>
                        <div class="value">\${passRate}%</div>
                    </div>
                </div>

                <h2>시각화 자료</h2>
                <div class="report-grid">
                    <div>
                        <h3>지원루트별 분포</h3>
                        <canvas id="reportRouteChart"></canvas>
                    </div>
                    <div>
                        <h3>모집분야별 분포</h3>
                        <canvas id="reportPositionChart"></canvas>
                    </div>
                </div>
            </div>
        \`;
    },

    // 리포트 내부에 차트를 그리는 함수
    renderReportCharts(filteredData) {
        // 지원루트 차트
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
                data: {
                    labels: Object.keys(routeData),
                    datasets: [{
                        data: Object.values(routeData),
                        backgroundColor: Object.values(this.app.config.CHART_COLORS)
                    }]
                }
            });
        }
        // 모집분야 차트도 동일한 방식으로 생성
    },

    getPeriodText(options) {
        // 리포트 상단에 표시될 기간 텍스트를 생성하는 헬퍼 함수
        switch(options.period) {
            case 'all': return '전체 기간';
            case 'year': return '올해';
            case 'month': return '이번 달';
            case 'week': return '이번 주';
            case 'custom': return \`\${options.startDate} ~ \${options.endDate}\`;
            default: return 'N/A';
        }
    }
};
