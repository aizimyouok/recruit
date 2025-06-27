// js/report.js (AI 분석 기능이 통합된 최종 버전)

const ReportTemplates = {
    executive: { name: '경영진용 요약', title: '경영진용 요약 리포트', sections: ['kpi', 'charts'] },
    detailed: { name: '상세 분석 리포트', title: '상세 분석 리포트', sections: ['table'] },
    recruiter: { name: '채용담당자용 리포트', title: '채용담당자용 리포트', sections: ['placeholder'] },
    weekly: { name: '주간 채용 현황', title: '주간 채용 현황', sections: ['placeholder'] },
    monthly: { name: '월간 채용 성과', title: '월간 채용 성과', sections: ['placeholder'] },
    comparison: { name: '기간별 비교 리포트', title: '기간별 비교 리포트', sections: ['placeholder'] },
    ai: { name: 'AI 분석', title: 'Gemini AI 분석 리포트', sections: [] } // AI 탭은 동적으로 내용을 채우므로 sections가 비어있음
};

export const ReportModule = {
    state: {
        currentReportType: 'executive'
    },

    initialize(appInstance) {
        this.app = appInstance;
        this.populateFilters();
        this.setupTabEvents();
        // 페이지가 처음 로드될 때 기본 리포트 생성
        this.generateReport();
    },

    setupTabEvents() {
        const tabContainer = document.querySelector('.report-tabs');
        if (tabContainer) {
            tabContainer.addEventListener('click', (e) => {
                if (e.target.matches('.report-tab-btn')) {
                    const reportType = e.target.dataset.reportType;
                    this.state.currentReportType = reportType;
                    document.querySelectorAll('.report-tab-btn').forEach(btn => btn.classList.remove('active'));
                    e.target.classList.add('active');
                    // 탭을 누르면 필터 설정이 유지된 채로 해당 리포트가 즉시 생성됩니다.
                    // '리포트 생성하기' 버튼을 누를 필요가 없습니다.
                    this.generateReport();
                }
            });
        }
    },

    generateReport() {
        const reportType = this.state.currentReportType;
        
        // AI 분석 탭을 선택한 경우, AI 분석 함수를 호출
        if (reportType === 'ai') {
            this.requestAiAnalysis();
        } else {
            // 그 외의 탭은 기존 템플릿 기반으로 리포트 생성
            this.generateTemplateReport();
        }
    },

    generateTemplateReport() {
        const previewContainer = document.getElementById('reportPreviewContainer');
        previewContainer.innerHTML = `<div class="smooth-loading-container"><div class="advanced-loading-spinner"></div><p class="loading-text">리포트를 생성 중입니다...</p></div>`;

        setTimeout(() => {
            try {
                const options = this.getFilterOptions();
                const filteredData = this.getFilteredData(options);
                const template = ReportTemplates[this.state.currentReportType] || ReportTemplates.executive;
                const reportHtml = this.buildReportFromTemplate(template, filteredData, options);
                
                previewContainer.innerHTML = reportHtml;

                if (template.sections.includes('charts')) {
                    this.renderReportCharts(filteredData);
                }
            } catch (error) {
                console.error("템플릿 리포트 생성 중 오류:", error);
                previewContainer.innerHTML = `<div class="error-container"><h3>리포트 생성 실패</h3><p>오류가 발생했습니다.</p></div>`;
            }
        }, 500);
    },

    async requestAiAnalysis() {
        const previewContainer = document.getElementById('reportPreviewContainer');
        previewContainer.innerHTML = `<div class="smooth-loading-container"><div class="advanced-loading-spinner"></div><p class="loading-text">Gemini AI가 데이터를 분석 중입니다...</p></div>`;

        try {
            const options = this.getFilterOptions();
            const dataForAnalysis = this.getFilteredData(options);
            
            if (dataForAnalysis.length === 0) {
                previewContainer.innerHTML = `<div class="report-placeholder">분석할 데이터가 없습니다. 필터 조건을 변경해보세요.</div>`;
                return;
            }

            // [중요] 실제 구현 시, 이 부분에서 백엔드(Apps Script 등)로 데이터와 분석 요청을 보냅니다.
            // 여기서는 시연을 위해 가상의 분석 결과를 생성합니다.
            console.log("AI 분석 요청 데이터:", dataForAnalysis);
            await new Promise(resolve => setTimeout(resolve, 2000)); // 2초 딜레이로 분석하는 척하기

            const analysisResult = this.createMockAnalysis(dataForAnalysis, options);
            
            const reportHtml = this.buildAiReport(analysisResult, options);
            previewContainer.innerHTML = reportHtml;

            if (analysisResult.chartData) {
                this.renderAiChart(analysisResult.chartData);
            }
        } catch (error) {
            console.error("AI 분석 요청 실패:", error);
            previewContainer.innerHTML = `<div class="error-container"><h3>AI 분석 실패</h3><p>분석 중 오류가 발생했습니다.</p></div>`;
        }
    },
    
    // 가상의 AI 분석 결과를 만드는 함수 (시연용)
    createMockAnalysis(data, options) {
        const headers = this.app.state.data.headers;
        const total = data.length;
        const routeIndex = headers.indexOf('지원루트');
        const routeCounts = {};
        data.forEach(row => {
            const route = row[routeIndex] || '미기입';
            routeCounts[route] = (routeCounts[route] || 0) + 1;
        });
        const topRoute = Object.entries(routeCounts).sort((a,b) => b[1] - a[1])[0] || ['N/A', 0];

        return {
            summary: `설정된 필터 조건에 따라 총 ${total}명의 지원자 데이터가 분석되었습니다. 이 중 **'${topRoute[0]}'** 경로를 통한 지원이 ${topRoute[1]}명으로 가장 많았습니다.`,
            recommendation: `가장 많은 지원자가 유입된 **'${topRoute[0]}'** 채널의 효율성을 상세 분석하여, 해당 채널에 대한 마케팅 전략을 강화하는 것을 추천합니다.`,
            chartData: {
                type: 'bar',
                labels: Object.keys(routeCounts),
                values: Object.values(routeCounts),
                title: '지원 경로별 지원자 수'
            }
        };
    },

    buildAiReport(result, options) {
        return `
            <div id="reportPage">
                <h1>Gemini AI 분석 리포트</h1>
                <p class="report-info"><strong>분석 기간:</strong> ${this.getPeriodText(options)}</p>
                <h2><i class="fas fa-search"></i> 분석 요약</h2>
                <p class="ai-summary">${result.summary}</p>
                <h2><i class="fas fa-lightbulb"></i> 추천 액션</h2>
                <p class="ai-recommendation">${result.recommendation}</p>
                ${result.chartData ? `
                <h2><i class="fas fa-chart-bar"></i> 데이터 시각화: ${result.chartData.title}</h2>
                <div class="chart-container-report">
                    <canvas id="aiReportChart"></canvas>
                </div>
                ` : ''}
            </div>
        `;
    },

    renderAiChart(chartData) {
        const ctx = document.getElementById('aiReportChart')?.getContext('2d');
        if (!ctx) return;
        new Chart(ctx, {
            type: chartData.type || 'bar',
            data: {
                labels: chartData.labels,
                datasets: [{
                    label: chartData.title,
                    data: chartData.values,
                    backgroundColor: Object.values(this.app.config.CHART_COLORS)
                }]
            },
            options: { responsive: true, maintainAspectRatio: false }
        });
    },
    
    getFilterOptions() {
        return {
            interviewer: document.getElementById('reportInterviewerFilter').value,
            company: document.getElementById('reportCompanyFilter').value,
            route: document.getElementById('reportRouteFilter').value,
            position: document.getElementById('reportPositionFilter').value,
            searchTerm: (document.getElementById('reportSearch')?.value || '').toLowerCase(),
            dateMode: this.state.dateMode,
            startDate: document.getElementById('reportStartDate')?.value,
            endDate: document.getElementById('reportEndDate')?.value,
        };
    },
    
    // ... (이하 나머지 함수들은 이전과 거의 동일)
    getFilteredData: function(options) {
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
    buildReportFromTemplate: function(template, data, options) {
        const now = new Date();
        const periodText = this.getPeriodText(options);
        const sectionsHtml = template.sections.map(sectionType => {
            switch (sectionType) {
                case 'kpi': return this.renderKpiSection(data);
                case 'charts': return this.renderChartsSection();
                case 'table': return this.renderTableSection(data);
                case 'placeholder': return `<div class="report-placeholder">${template.name} 리포트는 현재 개발 중입니다.</div>`;
                default: return '';
            }
        }).join('');
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
                .chart-container-report { position: relative; height: 400px; border: 1px solid #e2e8f0; padding: 15px; border-radius: 8px; }
                .report-placeholder { text-align: center; padding: 40px; background-color: #f8fafc; border: 2px dashed #e2e8f0; border-radius: 8px; color: var(--text-secondary); }
            </style>
            <div id="reportPage">
                <h1>${template.title}</h1>
                <p class="report-info">
                    <strong>조회 기간:</strong> ${periodText} | 
                    <strong>발행일:</strong> ${now.toLocaleDateString('ko-KR')}
                </p>
                ${sectionsHtml}
            </div>
        `;
    },
    renderKpiSection: function(data) {
        const headers = this.app.state.data.headers;
        const totalApplicants = data.length;
        const interviewConfirmedCount = data.filter(row => (row[headers.indexOf('1차 컨택 결과')] || '') === '면접확정').length;
        const passedCount = data.filter(row => (row[headers.indexOf('면접결과')] || '') === '합격').length;
        const joinedCount = data.filter(row => (row[headers.indexOf('입과일')] || '').trim() !== '').length;
        const interviewRate = totalApplicants > 0 ? ((interviewConfirmedCount / totalApplicants) * 100).toFixed(1) : 0;
        const passRate = interviewConfirmedCount > 0 ? ((passedCount / interviewConfirmedCount) * 100).toFixed(1) : 0;
        const joinRate = passedCount > 0 ? ((joinedCount / passedCount) * 100).toFixed(1) : 0;
        return `
            <h2>핵심 성과 지표 (KPIs)</h2>
            <div class="report-grid">
                <div class="kpi-box"><div class="label">총 지원자</div><div class="value">${totalApplicants}명</div></div>
                <div class="kpi-box"><div class="label">면접 전환율</div><div class="value">${interviewRate}%</div></div>
                <div class="kpi-box"><div class="label">면접자 중 합격률</div><div class="value">${passRate}%</div></div>
                <div class="kpi-box"><div class="label">합격자 중 입과율</div><div class="value">${joinRate}%</div></div>
            </div>
        `;
    },
    renderChartsSection: function() {
        return `
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
        `;
    },
    renderTableSection: function(data) {
        return `
            <h2>상세 데이터</h2>
            <div class="table-container" style="max-height: 500px; overflow-y: auto;">
                ${this.createDetailedTable(data)}
            </div>
        `;
    },
    createDetailedTable: function(data) {
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
    renderReportCharts: function(filteredData) {
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
    getPeriodText: function(options) {
        if (options.dateMode === 'range' && options.startDate && options.endDate) {
            return `${options.startDate} ~ ${options.endDate}`;
        }
        return '전체 기간';
    }
};// js/report.js (AI 분석 기능이 통합된 최종 버전)

const ReportTemplates = {
    executive: { name: '경영진용 요약', title: '경영진용 요약 리포트', sections: ['kpi', 'charts'] },
    detailed: { name: '상세 분석 리포트', title: '상세 분석 리포트', sections: ['table'] },
    recruiter: { name: '채용담당자용 리포트', title: '채용담당자용 리포트', sections: ['placeholder'] },
    weekly: { name: '주간 채용 현황', title: '주간 채용 현황', sections: ['placeholder'] },
    monthly: { name: '월간 채용 성과', title: '월간 채용 성과', sections: ['placeholder'] },
    comparison: { name: '기간별 비교 리포트', title: '기간별 비교 리포트', sections: ['placeholder'] },
    ai: { name: 'AI 분석', title: 'Gemini AI 분석 리포트', sections: [] } // AI 탭은 동적으로 내용을 채우므로 sections가 비어있음
};

export const ReportModule = {
    state: {
        currentReportType: 'executive'
    },

    initialize(appInstance) {
        this.app = appInstance;
        this.populateFilters();
        this.setupTabEvents();
        // 페이지가 처음 로드될 때 기본 리포트 생성
        this.generateReport();
    },

    setupTabEvents() {
        const tabContainer = document.querySelector('.report-tabs');
        if (tabContainer) {
            tabContainer.addEventListener('click', (e) => {
                if (e.target.matches('.report-tab-btn')) {
                    const reportType = e.target.dataset.reportType;
                    this.state.currentReportType = reportType;
                    document.querySelectorAll('.report-tab-btn').forEach(btn => btn.classList.remove('active'));
                    e.target.classList.add('active');
                    // 탭을 누르면 필터 설정이 유지된 채로 해당 리포트가 즉시 생성됩니다.
                    // '리포트 생성하기' 버튼을 누를 필요가 없습니다.
                    this.generateReport();
                }
            });
        }
    },

    generateReport() {
        const reportType = this.state.currentReportType;
        
        // AI 분석 탭을 선택한 경우, AI 분석 함수를 호출
        if (reportType === 'ai') {
            this.requestAiAnalysis();
        } else {
            // 그 외의 탭은 기존 템플릿 기반으로 리포트 생성
            this.generateTemplateReport();
        }
    },

    generateTemplateReport() {
        const previewContainer = document.getElementById('reportPreviewContainer');
        previewContainer.innerHTML = `<div class="smooth-loading-container"><div class="advanced-loading-spinner"></div><p class="loading-text">리포트를 생성 중입니다...</p></div>`;

        setTimeout(() => {
            try {
                const options = this.getFilterOptions();
                const filteredData = this.getFilteredData(options);
                const template = ReportTemplates[this.state.currentReportType] || ReportTemplates.executive;
                const reportHtml = this.buildReportFromTemplate(template, filteredData, options);
                
                previewContainer.innerHTML = reportHtml;

                if (template.sections.includes('charts')) {
                    this.renderReportCharts(filteredData);
                }
            } catch (error) {
                console.error("템플릿 리포트 생성 중 오류:", error);
                previewContainer.innerHTML = `<div class="error-container"><h3>리포트 생성 실패</h3><p>오류가 발생했습니다.</p></div>`;
            }
        }, 500);
    },

    async requestAiAnalysis() {
        const previewContainer = document.getElementById('reportPreviewContainer');
        previewContainer.innerHTML = `<div class="smooth-loading-container"><div class="advanced-loading-spinner"></div><p class="loading-text">Gemini AI가 데이터를 분석 중입니다...</p></div>`;

        try {
            const options = this.getFilterOptions();
            const dataForAnalysis = this.getFilteredData(options);
            
            if (dataForAnalysis.length === 0) {
                previewContainer.innerHTML = `<div class="report-placeholder">분석할 데이터가 없습니다. 필터 조건을 변경해보세요.</div>`;
                return;
            }

            // [중요] 실제 구현 시, 이 부분에서 백엔드(Apps Script 등)로 데이터와 분석 요청을 보냅니다.
            // 여기서는 시연을 위해 가상의 분석 결과를 생성합니다.
            console.log("AI 분석 요청 데이터:", dataForAnalysis);
            await new Promise(resolve => setTimeout(resolve, 2000)); // 2초 딜레이로 분석하는 척하기

            const analysisResult = this.createMockAnalysis(dataForAnalysis, options);
            
            const reportHtml = this.buildAiReport(analysisResult, options);
            previewContainer.innerHTML = reportHtml;

            if (analysisResult.chartData) {
                this.renderAiChart(analysisResult.chartData);
            }
        } catch (error) {
            console.error("AI 분석 요청 실패:", error);
            previewContainer.innerHTML = `<div class="error-container"><h3>AI 분석 실패</h3><p>분석 중 오류가 발생했습니다.</p></div>`;
        }
    },
    
    // 가상의 AI 분석 결과를 만드는 함수 (시연용)
    createMockAnalysis(data, options) {
        const headers = this.app.state.data.headers;
        const total = data.length;
        const routeIndex = headers.indexOf('지원루트');
        const routeCounts = {};
        data.forEach(row => {
            const route = row[routeIndex] || '미기입';
            routeCounts[route] = (routeCounts[route] || 0) + 1;
        });
        const topRoute = Object.entries(routeCounts).sort((a,b) => b[1] - a[1])[0] || ['N/A', 0];

        return {
            summary: `설정된 필터 조건에 따라 총 ${total}명의 지원자 데이터가 분석되었습니다. 이 중 **'${topRoute[0]}'** 경로를 통한 지원이 ${topRoute[1]}명으로 가장 많았습니다.`,
            recommendation: `가장 많은 지원자가 유입된 **'${topRoute[0]}'** 채널의 효율성을 상세 분석하여, 해당 채널에 대한 마케팅 전략을 강화하는 것을 추천합니다.`,
            chartData: {
                type: 'bar',
                labels: Object.keys(routeCounts),
                values: Object.values(routeCounts),
                title: '지원 경로별 지원자 수'
            }
        };
    },

    buildAiReport(result, options) {
        return `
            <div id="reportPage">
                <h1>Gemini AI 분석 리포트</h1>
                <p class="report-info"><strong>분석 기간:</strong> ${this.getPeriodText(options)}</p>
                <h2><i class="fas fa-search"></i> 분석 요약</h2>
                <p class="ai-summary">${result.summary}</p>
                <h2><i class="fas fa-lightbulb"></i> 추천 액션</h2>
                <p class="ai-recommendation">${result.recommendation}</p>
                ${result.chartData ? `
                <h2><i class="fas fa-chart-bar"></i> 데이터 시각화: ${result.chartData.title}</h2>
                <div class="chart-container-report">
                    <canvas id="aiReportChart"></canvas>
                </div>
                ` : ''}
            </div>
        `;
    },

    renderAiChart(chartData) {
        const ctx = document.getElementById('aiReportChart')?.getContext('2d');
        if (!ctx) return;
        new Chart(ctx, {
            type: chartData.type || 'bar',
            data: {
                labels: chartData.labels,
                datasets: [{
                    label: chartData.title,
                    data: chartData.values,
                    backgroundColor: Object.values(this.app.config.CHART_COLORS)
                }]
            },
            options: { responsive: true, maintainAspectRatio: false }
        });
    },
    
    getFilterOptions() {
        return {
            interviewer: document.getElementById('reportInterviewerFilter').value,
            company: document.getElementById('reportCompanyFilter').value,
            route: document.getElementById('reportRouteFilter').value,
            position: document.getElementById('reportPositionFilter').value,
            searchTerm: (document.getElementById('reportSearch')?.value || '').toLowerCase(),
            dateMode: this.state.dateMode,
            startDate: document.getElementById('reportStartDate')?.value,
            endDate: document.getElementById('reportEndDate')?.value,
        };
    },
    
    // ... (이하 나머지 함수들은 이전과 거의 동일)
    getFilteredData: function(options) {
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
    buildReportFromTemplate: function(template, data, options) {
        const now = new Date();
        const periodText = this.getPeriodText(options);
        const sectionsHtml = template.sections.map(sectionType => {
            switch (sectionType) {
                case 'kpi': return this.renderKpiSection(data);
                case 'charts': return this.renderChartsSection();
                case 'table': return this.renderTableSection(data);
                case 'placeholder': return `<div class="report-placeholder">${template.name} 리포트는 현재 개발 중입니다.</div>`;
                default: return '';
            }
        }).join('');
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
                .chart-container-report { position: relative; height: 400px; border: 1px solid #e2e8f0; padding: 15px; border-radius: 8px; }
                .report-placeholder { text-align: center; padding: 40px; background-color: #f8fafc; border: 2px dashed #e2e8f0; border-radius: 8px; color: var(--text-secondary); }
            </style>
            <div id="reportPage">
                <h1>${template.title}</h1>
                <p class="report-info">
                    <strong>조회 기간:</strong> ${periodText} | 
                    <strong>발행일:</strong> ${now.toLocaleDateString('ko-KR')}
                </p>
                ${sectionsHtml}
            </div>
        `;
    },
    renderKpiSection: function(data) {
        const headers = this.app.state.data.headers;
        const totalApplicants = data.length;
        const interviewConfirmedCount = data.filter(row => (row[headers.indexOf('1차 컨택 결과')] || '') === '면접확정').length;
        const passedCount = data.filter(row => (row[headers.indexOf('면접결과')] || '') === '합격').length;
        const joinedCount = data.filter(row => (row[headers.indexOf('입과일')] || '').trim() !== '').length;
        const interviewRate = totalApplicants > 0 ? ((interviewConfirmedCount / totalApplicants) * 100).toFixed(1) : 0;
        const passRate = interviewConfirmedCount > 0 ? ((passedCount / interviewConfirmedCount) * 100).toFixed(1) : 0;
        const joinRate = passedCount > 0 ? ((joinedCount / passedCount) * 100).toFixed(1) : 0;
        return `
            <h2>핵심 성과 지표 (KPIs)</h2>
            <div class="report-grid">
                <div class="kpi-box"><div class="label">총 지원자</div><div class="value">${totalApplicants}명</div></div>
                <div class="kpi-box"><div class="label">면접 전환율</div><div class="value">${interviewRate}%</div></div>
                <div class="kpi-box"><div class="label">면접자 중 합격률</div><div class="value">${passRate}%</div></div>
                <div class="kpi-box"><div class="label">합격자 중 입과율</div><div class="value">${joinRate}%</div></div>
            </div>
        `;
    },
    renderChartsSection: function() {
        return `
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
        `;
    },
    renderTableSection: function(data) {
        return `
            <h2>상세 데이터</h2>
            <div class="table-container" style="max-height: 500px; overflow-y: auto;">
                ${this.createDetailedTable(data)}
            </div>
        `;
    },
    createDetailedTable: function(data) {
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
    renderReportCharts: function(filteredData) {
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
    getPeriodText: function(options) {
        if (options.dateMode === 'range' && options.startDate && options.endDate) {
            return `${options.startDate} ~ ${options.endDate}`;
        }
        return '전체 기간';
    }
};
