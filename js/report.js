// js/report.js (오타 최종 수정 버전)

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
            <div class="filter-group" style="flex-grow: 2; min-width: 300px;">
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

        // ▼▼▼▼▼ [오류 수정된 부분] ▼▼▼▼▼
        if (interviewerIndex !== -1) {
            const options = [...new Set(all.map(row => (row[interviewerIndex] || '').trim()).filter(Boolean))];
            const select = document.getElementById('reportInterviewer');
            options.sort().forEach(name => {
                select.innerHTML += \`<option value="\${name}">\${name}</option>\`;
            });
        }
        if (routeIndex !== -1) {
            const options = [...new Set(all.map(row => (row[routeIndex] || '').trim()).filter(Boolean))];
            const select = document.getElementById('reportRoute');
            options.sort().forEach(name => {
                select.innerHTML += \`<option value="\${name}">\${name}</option>\`;
            });
        }
        // ▲▲▲▲▲ [오류 수정된 부분] ▲▲▲▲▲

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
                <p class="loading-text">리포트를 생성 중입니다...</p>
            </div>
        \`;

        // 0.5초 후 리포트 생성 (로딩 애니메이션을 보여주기 위함)
        setTimeout(() => {
            try {
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
            } catch (error) {
                console.error("리포트 생성 중 오류 발생:", error);
                previewContainer.innerHTML = \`
                    <div class="error-container">
                        <i class="fas fa-exclamation-triangle error-icon"></i>
                        <h3 class="error-title">리포트 생성 실패</h3>
                        <p class="error-message">리포트를 만드는 중 문제가 발생했습니다. 다시 시도해주세요.</p>
                    </div>
                \`;
            }
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
                        const dateValue = row[applyDateIndex];
                        if (!dateValue) return false;
                        const date = new Date(dateValue);
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


        return \`
            <style>
                #reportPage { padding: 20px; font-family: 'Noto Sans KR', sans-serif; background: white; color: #333; }
                #reportPage h1, #reportPage h2, #reportPage h3 { color: #334155; border-bottom: 1px solid #e2e8f0; padding-bottom: 10px; margin-bottom: 15px; }
                #reportPage h1 { font-size: 1.8rem; text-align: center; border: none; }
                #reportPage p { color: #64748b; text-align: center; margin-bottom: 25px; }
                .report-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 30px; }
                .kpi-box { background: #f8fafc; border: 1px solid #e2e8f0; padding: 20px; text-align: center; border-radius: 8px;}
                .kpi-box .label { font-size: 1rem; color: #64748b; margin-bottom: 8px; }
                .kpi-box .value { font-size: 2.2rem; font-weight: 700; color: #818cf8; }
                .chart-container-report { border: 1px solid #e2e8f0; padding: 15px; border-radius: 8px; }
                table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                th, td { border: 1px solid #e2e8f0; padding: 10px; text-align: center; font-size: 0.85rem; }
                th { background: #f8fafc; font-weight: 600; }
                @media print {
                    body, .main-content, .content-area { background: white !important; }
                    .sidebar, .main-header, .stats-fixed-header { display: none !important; }
                    #report, #reportPreviewContainer { display: block !important; padding: 0 !important; margin: 0 !important; }
                    #reportPage { box-shadow: none; border: none; }
                }
            </style>
            <div id="reportPage">
                <h1>채용 현황 리포트</h1>
                <p>
                    <strong>조회 기간:</strong> \${periodText} | 
                    <strong>발행일:</strong> \${now.toLocaleDateString('ko-KR')}
                </p>

                <h2>핵심 성과 지표 (KPIs)</h2>
                <div class="report-grid">
                    <div class="kpi-box"><div class="label">총 지원자</div><div class="value">\${totalApplicants}명</div></div>
                    <div class="kpi-box"><div class="label">면접 전환율</div><div class="value">\${interviewRate}%</div></div>
                    <div class="kpi-box"><div class="label">면접자 중 합격률</div><div class="value">\${passRate}%</div></div>
                    <div class="kpi-box"><div class="label">합격자 중 입과율</div><div class="value">\${joinRate}%</div></div>
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
                },
                options: { responsive: true, maintainAspectRatio: false }
            });
        }
        
        // 모집분야 차트
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
                data: {
                    labels: Object.keys(positionData),
                    datasets: [{
                        data: Object.values(positionData),
                        backgroundColor: Object.values(this.app.config.CHART_COLORS).reverse()
                    }]
                },
                options: { responsive: true, maintainAspectRatio: false }
            });
        }
    },

    getPeriodText(options) {
        const periodMap = {
            'all': '전체 기간', 'year': '올해',
            'month': '이번 달', 'week': '이번 주'
        };
        if (options.period === 'custom') return \`\${options.startDate} ~ \${options.endDate}\`;
        return periodMap[options.period] || 'N/A';
    },

    // PDF 다운로드 또는 인쇄를 처리하는 최종 함수
    async createAndDownloadReport() {
        const generateBtn = document.querySelector('#report .primary-btn');
        const originalBtnHtml = generateBtn.innerHTML;

        try {
            // 1. 리포트 생성
            this.generateReport();
            
            // 로딩 애니메이션을 위해 잠시 대기
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // 2. PDF 다운로드
            generateBtn.disabled = true;
            generateBtn.innerHTML = '<i class="fas fa-file-pdf"></i> PDF 생성 중...';

            const reportElement = document.getElementById('reportPage');
            if (!reportElement) {
                alert('리포트 내용이 없습니다.');
                return;
            }

            const canvas = await html2canvas(reportElement, { scale: 2 });
            const imgData = canvas.toDataURL('image/png');
            
            const { jsPDF } = window.jspdf;
            const pdf = new jsPDF('p', 'mm', 'a4');
            
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const canvasWidth = canvas.width;
            const canvasHeight = canvas.height;
            const ratio = canvasWidth / canvasHeight;
            let imgHeight = pdfWidth / ratio;
            
            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, imgHeight);
            pdf.save(\`채용현황-리포트-\${new Date().toISOString().slice(0,10)}.pdf\`);

        } catch (error) {
            console.error('리포트 생성/다운로드 실패:', error);
            alert('리포트 생성 또는 PDF 다운로드에 실패했습니다.');
        } finally {
            generateBtn.disabled = false;
            generateBtn.innerHTML = originalBtnHtml;
        }
    }
};
