/**
 * @file report.js
 * @description 리포트 발행 페이지의 모든 UI 및 데이터 로직을 관리합니다.
 * - 템플릿 기반 리포트 생성
 * - AI 분석 가이드 UI 생성
 * - AI 분석 요청 및 결과 시각화
 */

/**
 * 리포트 종류별 구성요소를 정의하는 템플릿 객체
 */
const ReportTemplates = {
    executive: {
        name: '경영진용 요약',
        title: '경영진용 요약 리포트',
        sections: ['kpi', 'charts']
    },
    detailed: {
        name: '상세 분석 리포트',
        title: '상세 분석 리포트',
        sections: ['table']
    },
    ai: {
        name: 'AI 분석 가이드',
        title: 'Gemini AI 분석 리포트',
        sections: [] // AI 탭은 동적으로 내용을 채움
    }
};

/**
 * AI 분석 가이드 항목 정의
 */
const AiAnalysisGuideItems = {
    '유입 분석': [
        { id: 'source_efficiency', label: '가장 효율적인 지원 경로는?', description: '어떤 지원루트가 가장 많은 최종 입사자를 만들어내는지 분석합니다.' },
        { id: 'recruiter_performance', label: '최고의 증원자는 누구인가?', description: '어떤 증원자가 추천한 지원자들이 면접 합격률이 높은지 분석합니다.' },
        { id: 'position_source', label: '특정 모집 분야에 강한 경로는?', description: '특정 모집분야의 지원자들이 주로 어떤 경로로 지원하는지 분석합니다.' }
    ],
    '지원자 특징 분석': [
        { id: 'passer_profile', label: '최종 합격자들의 공통점은?', description: '합격자들의 주요 나이대, 성별, 지역 등 인구통계학적 특징을 파악합니다.' },
        { id: 'interviewee_profile', label: '면접 전환율이 높은 지원자 유형은?', description: '서류 통과 후 면접까지 잘 이어지는 지원자들의 특징을 분석합니다.' }
    ],
    '채용 과정 분석': [
        { id: 'bottleneck', label: '이탈이 가장 많은 구간은?', description: '지원부터 입과까지 단계별 전환율을 계산하고 병목 구간을 찾아냅니다.' },
        { id: 'interviewer_tendency', label: '면접관별 합격률 차이는?', description: '면접관별 평균 합격률과 평가 성향을 비교 분석합니다.' },
        { id: 'lead_time', label: '채용 소요 기간(Lead Time) 분석', description: '지원부터 입과까지 평균 며칠이 걸리는지 분석합니다.' }
    ],
    '텍스트 데이터 분석': [
        { id: 'rejection_keywords', label: '불합격자 면접 리뷰의 핵심 키워드는?', description: '불합격 처리된 지원자들의 면접리뷰에서 공통 키워드를 추출합니다.' }
    ]
};


export const ReportModule = {
    state: {
        currentReportType: 'executive'
    },

    // =================================================
    // 초기화 및 이벤트 설정
    // =================================================
    initialize(appInstance) {
        this.app = appInstance;
        this.populateFilters();
        this.setupTabEvents();
        this.generateReport();
    },

    setupTabEvents() {
        const tabContainer = document.querySelector('.report-tabs');
        if (tabContainer) {
            tabContainer.addEventListener('click', (e) => {
                const target = e.target.closest('.report-tab-btn');
                if (target) {
                    this.state.currentReportType = target.dataset.reportType;
                    document.querySelectorAll('.report-tab-btn').forEach(btn => btn.classList.remove('active'));
                    target.classList.add('active');
                    this.generateReport();
                }
            });
        }
        const actionBtn = document.getElementById('reportActionBtn');
        if (actionBtn) {
            actionBtn.onclick = () => this.handleGenerateButtonClick();
        }
    },

    // =================================================
    // 리포트 생성 컨트롤 타워
    // =================================================
    handleGenerateButtonClick() {
        if (this.state.currentReportType === 'ai') {
            this.requestAiAnalysis();
        } else {
            this.generateTemplateReport();
        }
    },
    
    generateReport() {
        const reportType = this.state.currentReportType;
        const actionBtn = document.getElementById('reportActionBtn');
        const guideContainer = document.getElementById('aiAnalysisGuide');
        const previewContainer = document.getElementById('reportPreviewContainer');
        
        guideContainer.style.display = 'none';
        previewContainer.style.display = 'block';

        if (reportType === 'ai') {
            previewContainer.innerHTML = '';
            guideContainer.style.display = 'block';
            actionBtn.innerHTML = `<i class="fas fa-magic"></i> 선택 항목 AI 분석`;
            this.renderAiGuide();
        } else {
            actionBtn.innerHTML = `<i class="fas fa-file-download"></i> 리포트 생성하기`;
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

    // =================================================
    // AI 분석 관련 함수
    // =================================================
    renderAiGuide() {
        const guideContainer = document.getElementById('aiAnalysisGuide');
        let html = `
            <div class="ai-guide-header">
                <h3>AI 분석 가이드</h3>
                <p>분석하고 싶은 항목을 선택하고, 상단 필터로 데이터 범위를 조정한 후 분석 버튼을 눌러주세요.</p>
            </div>
            <div class="ai-guide-grid">
        `;
        for (const [category, items] of Object.entries(AiAnalysisGuideItems)) {
            html += `<div class="ai-guide-category"><h4><i class="fas fa-check-square"></i> ${category}</h4>`;
            items.forEach(item => {
                html += `
                    <div class="ai-guide-item">
                        <label>
                            <input type="checkbox" name="ai_analysis_task" value="${item.id}">
                            <span>${item.label}</span>
                        </label>
                        <small>${item.description}</small>
                    </div>
                `;
            });
            html += `</div>`;
        }
        html += `</div>`;
        guideContainer.innerHTML = html;
    },

    async requestAiAnalysis() {
        const checkedItems = document.querySelectorAll('input[name="ai_analysis_task"]:checked');
        if (checkedItems.length === 0) {
            alert('분석할 항목을 하나 이상 선택해주세요.');
            return;
        }

        const tasks = Array.from(checkedItems).map(item => ({
            id: item.value,
            label: item.nextElementSibling.textContent
        }));
        
        const guideContainer = document.getElementById('aiAnalysisGuide');
        const previewContainer = document.getElementById('reportPreviewContainer');
        guideContainer.style.display = 'none';
        previewContainer.style.display = 'block';
        previewContainer.innerHTML = `<div class="smooth-loading-container"><div class="advanced-loading-spinner"></div><p class="loading-text">Gemini AI가 선택된 항목들을 분석 중입니다...</p></div>`;

        try {
            const options = this.getFilterOptions();
            const dataForAnalysis = this.getFilteredData(options);
            
            if (dataForAnalysis.length === 0) {
                previewContainer.innerHTML = `<div class="report-placeholder">분석할 데이터가 없습니다. 필터 조건을 변경해보세요.</div>`;
                return;
            }

            const response = await fetch(this.app.config.APPS_SCRIPT_URL, {
                method: 'POST',
                body: JSON.stringify({
                    action: 'analyzeData',
                    data: dataForAnalysis,
                    headers: this.app.state.data.headers,
                    tasks: tasks
                })
            });

            if (!response.ok) throw new Error(`서버 오류: ${response.statusText}`);
            
            const result = await response.json();
            if (result.status !== 'success') throw new Error(result.message);

            const reportHtml = this.buildAiReport(result.analysis, options);
            previewContainer.innerHTML = reportHtml;

            if (result.analysis.trendChartData) {
                this.renderAiChart(result.analysis.trendChartData);
            }

        } catch (error) {
            console.error("AI 분석 요청 실패:", error);
            previewContainer.innerHTML = `<div class="error-container"><h3>AI 분석 실패</h3><p>${error.message}</p></div>`;
        }
    },
    
    buildAiReport(result, options) {
        const periodText = this.getPeriodText(options);
        const kpis = result.kpis || {};
        const insights = result.insights || [];
        const actionItems = result.actionItems || [];

        const kpiHtml = `
            <div class="kpi-card">
                <div class="kpi-header"><i class="fas fa-users"></i> 총 지원자</div>
                <div class="kpi-value">${kpis.totalApplicants?.value || 'N/A'}</div>
                <div class="kpi-change positive">${kpis.totalApplicants?.change || ''}</div>
            </div>
            <div class="kpi-card">
                <div class="kpi-header"><i class="fas fa-comments"></i> 면접 전환율</div>
                <div class="kpi-value">${kpis.interviewRate?.value || 'N/A'}</div>
                <div class="kpi-change positive">${kpis.interviewRate?.change || ''}</div>
            </div>
            <div class="kpi-card">
                <div class="kpi-header"><i class="fas fa-check-circle"></i> 최종 합격률</div>
                <div class="kpi-value">${kpis.passRate?.value || 'N/A'}</div>
                <div class="kpi-change negative">${kpis.passRate?.change || ''}</div>
            </div>
            <div class="kpi-card">
                <div class="kpi-header"><i class="fas fa-rocket"></i> 입사 전환율</div>
                <div class="kpi-value">${kpis.hireRate?.value || 'N/A'}</div>
                <div class="kpi-change positive">${kpis.hireRate?.change || ''}</div>
            </div>
        `;

        const insightsHtml = insights.map(item => `
            <div class="insight-card">
                <div class="insight-title">${item.title || '핵심 발견'}</div>
                <p class="insight-text">${item.text || '내용 없음'}</p>
            </div>
        `).join('');

        const actionItemsHtml = actionItems.map(item => `
            <li class="action-item">${item}</li>
        `).join('');

        return `
            <div id="advancedReportPage">
                <div class="report-main-header">
                    <h1>채용 성과 리포트</h1>
                    <p>${periodText} 종합 분석 보고서</p>
                </div>
                <div class="report-grid kpi-grid">${kpiHtml}</div>
                
                ${result.trendChartData ? `
                <div class="report-section">
                    <h2><i class="fas fa-chart-line"></i> 트렌드 분석</h2>
                    <div class="chart-container-report">
                        <canvas id="aiTrendChart"></canvas>
                    </div>
                </div>
                ` : ''}

                <div class="report-section">
                    <h2><i class="fas fa-lightbulb"></i> 핵심 인사이트</h2>
                    <div class="report-grid insight-grid">${insightsHtml}</div>
                </div>

                <div class="report-section">
                    <h2><i class="fas fa-tasks"></i> 다음 달 액션 아이템</h2>
                    <ol class="action-item-list">${actionItemsHtml}</ol>
                </div>
            </div>
        `;
    },

    renderAiChart(chartData) {
        const ctx = document.getElementById('aiTrendChart')?.getContext('2d');
        if (!ctx || !chartData) return;

        new Chart(ctx, {
            type: chartData.type || 'line',
            data: {
                labels: chartData.labels,
                datasets: chartData.datasets.map((ds, index) => ({
                    ...ds,
                    borderColor: Object.values(this.app.config.CHART_COLORS)[index],
                    backgroundColor: `${Object.values(this.app.config.CHART_COLORS)[index]}33`,
                    fill: true,
                    tension: 0.4
                }))
            },
            options: { responsive: true, maintainAspectRatio: false }
        });
    },

    // =================================================
    // 모든 헬퍼 함수들 (필터, UI, 데이터 처리 등)
    // =================================================
    populateFilters() {
        const reportFilterBar = document.getElementById('reportFilterBar');
        if (!reportFilterBar) return;
        if (!this.app || !this.app.state.data.all.length) {
            reportFilterBar.innerHTML = `<p style="color: var(--text-secondary);">데이터 로딩 중...</p>`;
            setTimeout(() => this.populateFilters(), 1000);
            return;
        }

        const { headers, all } = this.app.state.data;
        const indices = {
            interviewer: headers.indexOf('면접관'),
            company: headers.indexOf('회사명'),
            route: headers.indexOf('지원루트'),
            position: headers.indexOf('모집분야')
        };
        reportFilterBar.innerHTML = `
            <div class="filter-group search-input"><label for="reportSearch">통합 검색</label><div style="position: relative;"><i class="fas fa-search search-icon"></i><input type="text" id="reportSearch" placeholder="이름, 비고 등 검색..." /></div></div>
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
                options.sort().forEach(name => { selectElement.innerHTML += `<option value="${name}">${name}</option>`; });
            }
        };
        populate('reportInterviewerFilter', indices.interviewer);
        populate('reportCompanyFilter', indices.company);
        populate('reportRouteFilter', indices.route);
        populate('reportPositionFilter', indices.position);
        
        this.setInitialDateRange();
    },

    setInitialDateRange() {
        if (!this.state) { this.state = {}; }
        this.state.dateMode = 'range';
        this.state.startDate = this.formatDateForInput(new Date(new Date().getFullYear(), 0, 1));
        this.state.endDate = this.formatDateForInput(new Date());
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
        container.innerHTML = `<div id="reportDateModeToggle" class="date-mode-toggle-group"><button class="date-mode-btn ${this.state.dateMode === 'all' ? 'active' : ''}" data-mode="all">전체</button><button class="date-mode-btn ${this.state.dateMode === 'range' ? 'active' : ''}" data-mode="range">기간</button></div><div id="reportDateInputsContainer" class="date-inputs-group"></div>`;
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
            container.innerHTML = `<input type="date" class="date-input" id="reportStartDate" value="${this.state.startDate}"><span style="margin: 0 5px;">-</span><input type="date" class="date-input" id="reportEndDate" value="${this.state.endDate}">`;
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

    getFilterOptions() {
        return {
            interviewer: document.getElementById('reportInterviewerFilter')?.value || 'all',
            company: document.getElementById('reportCompanyFilter')?.value || 'all',
            route: document.getElementById('reportRouteFilter')?.value || 'all',
            position: document.getElementById('reportPositionFilter')?.value || 'all',
            searchTerm: (document.getElementById('reportSearch')?.value || '').toLowerCase(),
            dateMode: this.state.dateMode,
            startDate: document.getElementById('reportStartDate')?.value,
            endDate: document.getElementById('reportEndDate')?.value,
        };
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
        if (options.interviewer !== 'all' && indices.interviewer !==-1) data = data.filter(row => (row[indices.interviewer] || '').includes(options.interviewer));
        if (options.company !== 'all' && indices.company !==-1) data = data.filter(row => row[indices.company] === options.company);
        if (options.route !== 'all' && indices.route !== -1) data = data.filter(row => row[indices.route] === options.route);
        if (options.position !== 'all' && indices.position !== -1) data = data.filter(row => row[indices.position] === options.position);
        if (options.searchTerm) {
            data = data.filter(row => row.some(cell => String(cell).toLowerCase().includes(options.searchTerm)));
        }
        return data;
    },
    
    buildReportFromTemplate(template, data, options) {
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
                #reportPage { padding: 20px; font-family: 'Noto Sans KR', sans-serif; background: var(--content-bg, white); color: var(--text-primary, #333); }
                #reportPage h1, #reportPage h2, #reportPage h3 { color: var(--text-primary, #334155); border-bottom: 1px solid var(--border-color, #e2e8f0); padding-bottom: 10px; margin-bottom: 15px; }
                #reportPage h1 { font-size: 1.8rem; text-align: center; border: none; }
                #reportPage .report-info { color: var(--text-secondary, #64748b); text-align: center; margin-bottom: 25px; }
                .report-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 30px; }
                .kpi-box { background: var(--main-bg, #f8fafc); border: 1px solid var(--border-color, #e2e8f0); padding: 20px; text-align: center; border-radius: 8px;}
                .kpi-box .label { font-size: 1rem; color: var(--text-secondary, #64748b); margin-bottom: 8px; }
                .kpi-box .value { font-size: 2.2rem; font-weight: 700; color: #818cf8; }
                .chart-container-report { position: relative; height: 400px; border: 1px solid var(--border-color, #e2e8f0); padding: 15px; border-radius: 8px; }
                .report-placeholder { text-align: center; padding: 40px; background-color: var(--main-bg, #f8fafc); border: 2px dashed var(--border-color, #e2e8f0); border-radius: 8px; color: var(--text-secondary); }
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

    renderKpiSection(data) {
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

    renderChartsSection() {
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

    renderTableSection(data) {
        return `
            <h2>상세 데이터</h2>
            <div class="table-container" style="max-height: 500px; overflow-y: auto;">
                ${this.createDetailedTable(data)}
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
        if (typeof Chart === 'undefined') return;
        const chartOptions = { responsive: true, maintainAspectRatio: false };
        const routeCtx = document.getElementById('reportRouteChart')?.getContext('2d');
        if (routeCtx) {
            const routeIndex = this.app.state.data.headers.indexOf('지원루트');
            const routeData = {};
            filteredData.forEach(row => {
                const route = String(row[routeIndex] || '미기입').trim();
                routeData[route] = (routeData[route] || 0) + 1;
            });
            new Chart(routeCtx, { type: 'doughnut', data: { labels: Object.keys(routeData), datasets: [{ data: Object.values(routeData), backgroundColor: Object.values(this.app.config.CHART_COLORS) }] }, options: chartOptions });
        }
        const positionCtx = document.getElementById('reportPositionChart')?.getContext('2d');
        if (positionCtx) {
            const positionIndex = this.app.state.data.headers.indexOf('모집분야');
            const positionData = {};
            filteredData.forEach(row => {
                const position = String(row[positionIndex] || '미기입').trim();
                positionData[position] = (positionData[position] || 0) + 1;
            });
            new Chart(positionCtx, { type: 'pie', data: { labels: Object.keys(positionData), datasets: [{ data: Object.values(positionData), backgroundColor: Object.values(this.app.config.CHART_COLORS).reverse() }] }, options: chartOptions });
        }
    },
    
    getPeriodText(options) {
        if (options.dateMode === 'range' && options.startDate && options.endDate) {
            return `${options.startDate} ~ ${options.endDate}`;
        }
        return '전체 기간';
    }
};
