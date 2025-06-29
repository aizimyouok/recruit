/**
 * @file report.js
 * @description 향상된 리포트 발행 페이지 모듈 (완전 개선 버전)
 */

export const ReportModule = {
    _chartInstance: null,
    _isInitialized: false,

    // 🔥 새로운 템플릿 시스템
    templates: {
        'executive-summary': {
            name: '경영진 요약',
            icon: 'fas fa-chart-pie',
            description: '핵심 KPI와 트렌드 분석',
            sections: ['kpi', 'funnel', 'topSources', 'trends'],
            estimatedTime: '30초'
        },
        'detailed-analysis': {
            name: '상세 분석',
            icon: 'fas fa-chart-bar',
            description: '깊이 있는 데이터 분석',
            sections: ['kpi', 'charts', 'demographics', 'efficiency'],
            estimatedTime: '45초'
        },
        'recruitment-funnel': {
            name: '채용 퍼널',
            icon: 'fas fa-funnel-dollar',
            description: '단계별 전환율 분석',
            sections: ['funnel', 'bottleneck', 'optimization'],
            estimatedTime: '20초'
        },
        'monthly-report': {
            name: '월간 리포트',
            icon: 'fas fa-calendar-alt',
            description: '월별 성과 종합 분석',
            sections: ['monthly-kpi', 'comparison', 'trends', 'goals'],
            estimatedTime: '1분'
        },
        'interviewer-performance': {
            name: '면접관 성과',
            icon: 'fas fa-user-tie',
            description: '면접관별 효율성 분석',
            sections: ['interviewer-stats', 'comparison', 'recommendations'],
            estimatedTime: '35초'
        },
        'cost-analysis': {
            name: '비용 효율성',
            icon: 'fas fa-dollar-sign',
            description: '채용 비용 대비 효과 분석',
            sections: ['cost-per-hire', 'roi', 'optimization'],
            estimatedTime: '40초'
        }
    },

    // 🔥 실시간 미리보기 시스템
    livePreview: {
        enabled: false,
        updateInterval: null,
        
        enable() {
            this.enabled = true;
            this.updateInterval = setInterval(() => {
                if (ReportModule._isInitialized) {
                    ReportModule.updateLivePreview();
                }
            }, 1000);
        },
        
        disable() {
            this.enabled = false;
            if (this.updateInterval) {
                clearInterval(this.updateInterval);
                this.updateInterval = null;
            }
        }
    },
    // 🔥 향상된 초기화
    initialize() {
        if (this._isInitialized) return;
        console.log('📊 [ReportModule] Enhanced initialization...');
        
        this.renderEnhancedTemplates();
        this.setupLivePreview();
        this.setupReportHistory();
        this.addEventListeners();
        this.populateFilters();
        this.updatePreviewSummary();
        this.toggleDateRangePicker(document.getElementById('report-filter-period')?.value || 'all');
        this.livePreview.enable();
        
        this._isInitialized = true;
    },

    destroy() {
        if (!this._isInitialized) return;
        console.log('🧹 [ReportModule] Destroying...');
        
        this.removeEventListeners();
        this.livePreview.disable();
        if (this._chartInstance) {
            this._chartInstance.destroy();
            this._chartInstance = null;
        }
        
        this._isInitialized = false;
    },

    // 🔥 새로운 템플릿 렌더링
    renderEnhancedTemplates() {
        const gallery = document.querySelector('.template-gallery');
        if (!gallery) return;

        let html = '';
        Object.entries(this.templates).forEach(([key, template]) => {            html += `
                <div class="template-card enhanced" data-template="${key}">
                    <div class="template-icon"><i class="${template.icon}"></i></div>
                    <div class="template-name">${template.name}</div>
                    <div class="template-description">${template.description}</div>
                    <div class="template-meta">
                        <span class="template-time">⏱️ ${template.estimatedTime}</span>
                        <span class="template-sections">${template.sections.length}개 섹션</span>
                    </div>
                </div>
            `;
        });
        
        gallery.innerHTML = html;
    },

    // 🔥 실시간 미리보기 초기화 (HTML에 이미 있는 사이드바 활용)
    setupLivePreview() {
        console.log('🔄 [ReportModule] 실시간 미리보기 초기화...');
        
        // 초기 데이터 업데이트
        this.updateLivePreview();
        
        console.log('✅ [ReportModule] 실시간 미리보기 초기화 완료');
    },

    // 🔥 실시간 미리보기 사이드바 렌더링
    renderLivePreviewSidebar() {
        const reportContent = document.querySelector('.report-content');
        if (!reportContent) return;

        // 기존 그리드 구조가 없으면 생성
        let mainGrid = reportContent.querySelector('.report-main-grid');
        if (!mainGrid) {
            const reportBuilder = reportContent.querySelector('.report-builder');
            if (!reportBuilder) return;

            // 새로운 그리드 구조 생성
            mainGrid = document.createElement('div');
            mainGrid.className = 'report-main-grid';
            
            const builderSection = document.createElement('div');
            builderSection.className = 'report-builder-section';
            builderSection.appendChild(reportBuilder);
            
            mainGrid.appendChild(builderSection);
            reportContent.appendChild(mainGrid);
        }

        // 실시간 미리보기 사이드바 HTML
        const sidebarHTML = `
            <div class="live-preview-sidebar" id="livePreviewSidebar">
                <div class="preview-header">
                    <h3><i class="fas fa-eye"></i> 실시간 미리보기</h3>
                    <button class="preview-toggle" id="previewToggle">
                        <i class="fas fa-chevron-left"></i>
                    </button>
                </div>
                
                <div class="preview-content" id="livePreviewContent">
                    <div class="preview-stats">
                        <div class="stat-item">
                            <div class="stat-label">선택된 템플릿</div>
                            <div class="stat-value" id="previewTemplateName">경영진 요약</div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-label">데이터 범위</div>
                            <div class="stat-value" id="previewDataRange">전체 기간</div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-label">예상 생성 시간</div>
                            <div class="stat-value" id="previewEstimatedTime">30초</div>
                        </div>
                    </div>
                    
                    <div class="preview-summary">
                        <h4>요약 정보</h4>
                        <div class="summary-grid">
                            <div class="summary-item">
                                <div class="summary-icon"><i class="fas fa-users"></i></div>
                                <div class="summary-text">
                                    <div class="summary-label">총 지원자</div>
                                    <div class="summary-value" id="previewTotalApplicants">로딩 중...</div>
                                </div>
                            </div>
                            <div class="summary-item">
                                <div class="summary-icon"><i class="fas fa-funnel-dollar"></i></div>
                                <div class="summary-text">
                                    <div class="summary-label">전환율</div>
                                    <div class="summary-value" id="previewConversionRate">로딩 중...</div>
                                </div>
                            </div>
                            <div class="summary-item">
                                <div class="summary-icon"><i class="fas fa-chart-line"></i></div>
                                <div class="summary-text">
                                    <div class="summary-label">주요 채용 경로</div>
                                    <div class="summary-value" id="previewTopSource">로딩 중...</div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="preview-chart-container">
                        <h4>미니 차트</h4>
                        <canvas id="previewMiniChart" width="280" height="150"></canvas>
                    </div>
                    
                    <div class="preview-actions">
                        <button class="btn-preview-full" id="openFullPreview">
                            <i class="fas fa-expand-arrows-alt"></i> 전체 미리보기
                        </button>
                    </div>
                </div>
            </div>
        `;

        // 사이드바가 이미 존재하지 않으면 추가
        if (!mainGrid.querySelector('.live-preview-sidebar')) {
            mainGrid.insertAdjacentHTML('beforeend', sidebarHTML);
        }

        // 초기 데이터 업데이트
        this.updateLivePreview();
    },

    // 🔥 이벤트 리스너 관리
    addEventListeners() {
        this._boundHandleClick = this._handleEvents.bind(this);
        this._boundHandleChange = this._handleFilterChange.bind(this);
        
        document.body.addEventListener('click', this._boundHandleClick);
        const filterSection = document.querySelector('#report .filter-section');
        if (filterSection) {
            filterSection.addEventListener('change', this._boundHandleChange);
        }
    },

    removeEventListeners() {
        document.body.removeEventListener('click', this._boundHandleClick);
        const filterSection = document.querySelector('#report .filter-section');
        if (filterSection) {
            filterSection.removeEventListener('change', this._boundHandleChange);
        }
    },
    // 🔥 이벤트 핸들러
    _handleFilterChange(event) {
        if (!event.target.closest('#report')) return;
        const target = event.target;
        if (target.tagName === 'SELECT' || target.tagName === 'INPUT') {
            if (target.id === 'report-filter-period') {
                this.toggleDateRangePicker(target.value);
            }
            this.updatePreviewSummary();
        }
    },
    
    _handleEvents(event) {
        const target = event.target;
        const button = target.closest('button, .template-card, .format-option');
        
        if (target.matches('.report-modal')) { this.closeReportModal(); return; }
        if (!button) return;

        if (button.closest('#report')) {
            if (button.matches('.report-tab')) this.switchTab(button);
            else if (button.matches('.template-card')) this.selectCard(button, '.template-card');
            else if (button.matches('.format-option')) this.selectCard(button, '.format-option');
            else if (button.matches('#report-reset-filters')) this.resetFilters();
            else if (button.matches('.btn-primary')) this.generateReport();
            // 🔥 히스토리 관련 이벤트 처리
            else if (button.matches('#clearHistoryBtn')) this.clearAllHistory();
            else if (button.matches('.btn-history-view')) this.viewHistoryItem(button.dataset.id);
            else if (button.matches('.btn-history-delete')) this.deleteHistoryItem(button.dataset.id);
            else if (button.matches('.btn-history-download')) this.viewHistoryItem(button.dataset.id);
            // 🔥 미리보기 관련 이벤트 처리  
            else if (button.matches('#previewToggle')) this.togglePreviewSidebar();
            else if (button.matches('#openFullPreview')) this.generateReport();
        }

        if (button.closest('#reportModal')) {
            if (button.matches('#closeReportModalBtn')) this.closeReportModal();
            else if (button.matches('#printReportBtn')) window.print();
        }
    },

    // 🔥 실시간 미리보기 업데이트
    updateLivePreview() {
        const selectedTemplate = document.querySelector('.template-card.selected');
        if (!selectedTemplate) return;

        const templateKey = selectedTemplate.dataset.template;
        const template = this.templates[templateKey];
        if (!template) return;

        // 기본 정보 업데이트
        this.updatePreviewBasicInfo(template);
        
        // 통계 데이터 업데이트
        this.updatePreviewStats();
        
        // 미니 차트 업데이트
        this.updatePreviewMiniChart();
    },

    // 🔥 미리보기 기본 정보 업데이트
    updatePreviewBasicInfo(template) {
        const elements = {
            templateName: document.getElementById('previewTemplateName'),
            dataRange: document.getElementById('previewDataRange'),
            estimatedTime: document.getElementById('previewEstimatedTime')
        };

        if (elements.templateName) elements.templateName.textContent = template.name;
        if (elements.estimatedTime) elements.estimatedTime.textContent = template.estimatedTime;
        
        // 데이터 범위 업데이트
        const periodSelect = document.getElementById('report-filter-period');
        if (elements.dataRange && periodSelect) {
            const periodText = periodSelect.options[periodSelect.selectedIndex].textContent;
            elements.dataRange.textContent = periodText;
        }
    },

    // 🔥 미리보기 통계 데이터 업데이트
    updatePreviewStats() {
        try {
            const data = this.getFilteredReportData();
            const stats = this.calculateBasicStats(data);
            
            const elements = {
                totalApplicants: document.getElementById('previewTotalApplicants'),
                conversionRate: document.getElementById('previewConversionRate'),
                topSource: document.getElementById('previewTopSource')
            };

            if (elements.totalApplicants) elements.totalApplicants.textContent = `${stats.total}명`;
            if (elements.conversionRate) elements.conversionRate.textContent = `${stats.conversionRate}%`;
            if (elements.topSource) elements.topSource.textContent = stats.topSource;
        } catch (error) {
            console.warn('🔴 [ReportModule] Preview stats update failed:', error);
        }
    },

    // 🔥 기본 통계 계산
    calculateBasicStats(data) {
        if (!data || data.length === 0) {
            return {
                total: 0,
                conversionRate: '0.0',
                topSource: '데이터 없음'
            };
        }

        const total = data.length;
        
        // 전환율 계산 (최종 단계까지 진행한 비율)
        const finalStage = data.filter(item => {
            const status = item['진행 상태'] || item['현재 단계'] || '';
            return status.includes('합격') || status.includes('입사') || status.includes('최종');
        }).length;
        
        const conversionRate = total > 0 ? ((finalStage / total) * 100).toFixed(1) : '0.0';
        
        // 상위 채용 경로 계산
        const sources = {};
        data.forEach(item => {
            const source = item['지원루트'] || item['채용 경로'] || '기타';
            sources[source] = (sources[source] || 0) + 1;
        });
        
        const topSource = Object.keys(sources).length > 0 
            ? Object.keys(sources).reduce((a, b) => sources[a] > sources[b] ? a : b)
            : '데이터 없음';

        return { total, conversionRate, topSource };
    },

    // 🔥 미리보기 미니 차트 업데이트
    updatePreviewMiniChart() {
        const canvas = document.getElementById('previewMiniChart');
        if (!canvas) return;

        try {
            const data = this.getFilteredReportData();
            if (data.length === 0) return;

            // 기존 차트 인스턴스 제거
            if (this._previewChartInstance) {
                this._previewChartInstance.destroy();
                this._previewChartInstance = null;
            }

            const ctx = canvas.getContext('2d');
            const sources = this.calculateTopSources(data);
            
            this._previewChartInstance = new Chart(ctx, {
                type: 'doughnut',
                data: {
                    labels: sources.map(s => s.source),
                    datasets: [{
                        data: sources.map(s => s.count),
                        backgroundColor: [
                            '#3b82f6', '#ef4444', '#10b981', 
                            '#f59e0b', '#8b5cf6', '#06b6d4'
                        ],
                        borderWidth: 2,
                        borderColor: '#ffffff'
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'bottom',
                            labels: { 
                                font: { size: 10 },
                                padding: 8 
                            }
                        }
                    }
                }
            });
        } catch (error) {
            console.warn('🔴 [ReportModule] Preview chart update failed:', error);
        }
    },

    // 🔥 라이브 미리보기 HTML 생성
    generateLivePreviewHTML(template, stats, dataCount) {
        return `
            <div class="live-preview">
                <div class="preview-header">
                    <h3><i class="${template.icon}"></i> ${template.name}</h3>
                    <span class="preview-badge">${dataCount}명 데이터</span>
                </div>
                
                <div class="preview-stats-grid">
                    <div class="preview-stat">
                        <div class="stat-label">총 지원자</div>
                        <div class="stat-value">${stats.total.toLocaleString()}명</div>
                    </div>
                    <div class="preview-stat">
                        <div class="stat-label">면접 확정</div>
                        <div class="stat-value">${stats.interviewConfirmed}명</div>
                    </div>
                    <div class="preview-stat">
                        <div class="stat-label">최종 합격</div>
                        <div class="stat-value">${stats.passed}명</div>
                    </div>
                    <div class="preview-stat">
                        <div class="stat-label">입과율</div>
                        <div class="stat-value highlight">${stats.joinRate}%</div>
                    </div>
                </div>
            </div>
        `;
    },
    // 🔥 기본 통계 계산
    calculateBasicStats(data) {
        const app = globalThis.App;
        if (!app || !app.state.data.headers) return { total: 0, interviewConfirmed: 0, passed: 0, joinRate: 0 };

        const { headers } = app.state.data;
        const indices = {
            contactResult: headers.indexOf('1차 컨택 결과'),
            interviewResult: headers.indexOf('면접결과'),
            joinDate: headers.indexOf('입과일')
        };

        const total = data.length;
        const interviewConfirmed = data.filter(r => (r[indices.contactResult] || '') === '면접확정').length;
        const passed = data.filter(r => (r[indices.interviewResult] || '') === '합격').length;
        const joined = data.filter(r => (r[indices.joinDate] || '').trim() && (r[indices.joinDate] || '').trim() !== '-').length;

        return {
            total,
            interviewConfirmed,
            passed,
            joined,
            joinRate: total > 0 ? Math.round((joined / total) * 100) : 0
        };
    },

    // 🔥 탭 전환
    switchTab(clickedTab) {
        const reportPage = clickedTab.closest('#report');
        if (!reportPage) return;
        reportPage.querySelectorAll('.report-tab').forEach(t => t.classList.remove('active'));
        reportPage.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
        clickedTab.classList.add('active');
        const tabId = clickedTab.dataset.tab + '-tab';
        const contentElement = document.getElementById(tabId);
        if (contentElement) contentElement.classList.add('active');
    },

    // 🔥 카드 선택
    selectCard(clickedCard, cardSelector) {
        const container = clickedCard.parentElement;
        container.querySelectorAll(cardSelector).forEach(c => c.classList.remove('selected'));
        clickedCard.classList.add('selected');
    },
    // 🔥 필터 기능들
    populateFilters() {
        const app = globalThis.App;
        if (!app || !app.state.data.all.length) return;
        const { headers, all } = app.state.data;
        const filtersToPopulate = {
            '지원루트': 'report-filter-route', '모집분야': 'report-filter-position',
            '회사명': 'report-filter-company', '증원자': 'report-filter-recruiter',
            '면접관': 'report-filter-interviewer'
        };
        for (const headerName in filtersToPopulate) {
            const headerIndex = headers.indexOf(headerName);
            if (headerIndex === -1) continue;
            const uniqueOptions = [...new Set(all.map(row => (row[headerIndex] || '').trim()).filter(Boolean))];
            const selectElement = document.getElementById(filtersToPopulate[headerName]);
            if (selectElement) {
                selectElement.innerHTML = '<option value="all">전체</option>';
                uniqueOptions.sort().forEach(option => {
                    selectElement.innerHTML += `<option value="${option}">${option}</option>`;
                });
            }
        }
    },

    toggleDateRangePicker(selectedValue) {
        const dateRangePicker = document.getElementById('report-custom-date-range');
        if (dateRangePicker) {
            dateRangePicker.style.display = selectedValue === 'custom' ? 'grid' : 'none';
        }
    },

    resetFilters() {
        const filterSection = document.querySelector('#report .filter-section');
        if (!filterSection) return;
        filterSection.querySelectorAll('select').forEach(select => {
            select.selectedIndex = 0;
        });
        this.toggleDateRangePicker('all');
        this.updatePreviewSummary();
    },
    // 🔥 필터링된 데이터 가져오기
    getFilteredReportData() {
        const app = globalThis.App;
        if (!app || !app.state.data.all.length) return [];
        const { headers, all } = app.state.data;
        const period = document.getElementById('report-filter-period')?.value,
              route = document.getElementById('report-filter-route')?.value,
              position = document.getElementById('report-filter-position')?.value,
              company = document.getElementById('report-filter-company')?.value,
              recruiter = document.getElementById('report-filter-recruiter')?.value,
              interviewer = document.getElementById('report-filter-interviewer')?.value;
        const indices = {
            date: headers.indexOf('지원일'), route: headers.indexOf('지원루트'),
            position: headers.indexOf('모집분야'), company: headers.indexOf('회사명'),
            recruiter: headers.indexOf('증원자'), interviewer: headers.indexOf('면접관')
        };
        return all.filter(row => {
            let dateMatch = true;
            if (period !== 'all' && indices.date !== -1) {
                const applyDateStr = row[indices.date];
                if (!applyDateStr) return false;
                const applyDate = new Date(applyDateStr);
                if (isNaN(applyDate.getTime())) return false;
                const now = new Date();
                if (period === 'this-month') {
                    dateMatch = applyDate.getFullYear() === now.getFullYear() && applyDate.getMonth() === now.getMonth();
                } else if (period === 'custom') {
                    const startDateStr = document.getElementById('report-start-date')?.value,
                          endDateStr = document.getElementById('report-end-date')?.value;
                    if (startDateStr && endDateStr) {
                        const startDate = new Date(startDateStr), endDate = new Date(endDateStr);
                        if (!isNaN(startDate.getTime()) && !isNaN(endDate.getTime())) {
                            endDate.setHours(23, 59, 59, 999);
                            dateMatch = applyDate >= startDate && applyDate <= endDate;
                        }
                    }
                }
            }
            const routeMatch = (route === 'all' || !route || row[indices.route] === route);
            const positionMatch = (position === 'all' || !position || row[indices.position] === position);
            const companyMatch = (company === 'all' || !company || row[indices.company] === company);
            const recruiterMatch = (recruiter === 'all' || !recruiter || row[indices.recruiter] === recruiter);
            const interviewerMatch = (interviewer === 'all' || !interviewer || row[indices.interviewer] === interviewer);
            return dateMatch && routeMatch && positionMatch && companyMatch && recruiterMatch && interviewerMatch;
        });
    },
    
    updatePreviewSummary() {
        const totalCount = this.getFilteredReportData().length;
        const button = document.querySelector('#report .btn-primary');
        if (button) {
            button.innerHTML = `<i class="fas fa-magic"></i> ${totalCount}명 리포트 생성`;
        }
    },

    // 🔥 리포트 생성 핵심 함수
    generateReport() {
        console.log('🚀 [DEBUG] generateReport 시작');
        
        // 선택된 출력 형식 확인
        const selectedFormat = document.querySelector('#report .format-option.selected');
        const formatType = selectedFormat ? selectedFormat.textContent.trim().toLowerCase() : 'pdf';
        
        console.log('🔍 [DEBUG] 선택된 출력 형식:', formatType);
        
        // 출력 형식에 따라 다른 함수 호출
        switch (formatType) {
            case 'excel':
                this.generateExcelReport();
                return;
            case 'powerpoint':
                this.generatePowerPointReport();
                return;
            default:
                this.generatePDFReport();
                return;
        }
    },

    // 🔥 PDF 리포트 생성 (기존 로직)
    generatePDFReport() {
        console.log('🚀 [DEBUG] PDF 리포트 생성 시작');
        
        const modalBody = document.getElementById('reportModalBody');
        const selectedTemplateEl = document.querySelector('#report .template-card.selected');
        
        console.log('🔍 [DEBUG] modalBody:', modalBody);
        console.log('🔍 [DEBUG] selectedTemplateEl:', selectedTemplateEl);
        
        if (!modalBody || !selectedTemplateEl) {
            console.error('❌ [DEBUG] 필수 엘리먼트 누락');
            this.showCustomAlert('리포트 템플릿을 먼저 선택해주세요.'); 
            return;
        }
        
        const templateName = selectedTemplateEl.querySelector('.template-name').textContent;
        console.log('🔍 [DEBUG] 선택된 템플릿:', templateName);
        
        const data = this.getFilteredReportData();
        console.log('🔍 [DEBUG] 필터링된 데이터 개수:', data.length);
        
        if (data.length === 0) {
            console.error('❌ [DEBUG] 데이터 없음');
            this.showCustomAlert('리포트를 생성할 데이터가 없습니다. 필터 설정을 확인해주세요.'); 
            return;
        }
        
        if (this._chartInstance) this._chartInstance.destroy();
        
        let reportHtml = `<div class="report-title">${templateName}</div>`;
        switch (templateName) {
            case '경영진 요약': 
                console.log('📊 [DEBUG] 경영진 요약 리포트 생성');
                reportHtml += this.generateSummaryContent(data); 
                break;
            case '상세 분석': 
                console.log('📋 [DEBUG] 상세 분석 리포트 생성');
                reportHtml += this.generateDetailTable(data); 
                break;
            default: 
                console.log('⚠️ [DEBUG] 기본 템플릿 사용');
                reportHtml += `<p>${templateName} 템플릿은 현재 준비 중입니다.</p>`; 
                break;
        }
        
        console.log('🔍 [DEBUG] 생성된 HTML 길이:', reportHtml.length);
        modalBody.innerHTML = reportHtml;
        
        console.log('🔍 [DEBUG] 모달 열기 시작');
        this.openReportModal();

        if (templateName === '경영진 요약') {
            console.log('📊 [DEBUG] 차트 렌더링 시작');
            const canvas = document.getElementById('report-chart');
            if (canvas) this.renderReportChart(canvas, data);
        }
        
        // 🔥 히스토리에 저장
        this.saveReportToHistory({
            templateName: templateName,
            templateIcon: selectedTemplateEl.querySelector('.template-icon i').className,
            format: 'PDF',
            dataCount: data.length,
            summary: this.generateReportSummary(data, templateName),
            filters: this.getCurrentFilters()
        });
        
        console.log('✅ [DEBUG] generatePDFReport 완료');
    },

    // 🔥 모달 관리 함수들
    openReportModal() {
        console.log('🔍 [DEBUG] openReportModal 호출됨');
        const modal = document.getElementById('reportModal');
        console.log('🔍 [DEBUG] 모달 엘리먼트:', modal);
        
        if (modal) {
            modal.style.display = 'flex';
            modal.style.zIndex = '10000';
            modal.style.position = 'fixed';
            modal.style.top = '0';
            modal.style.left = '0';
            modal.style.width = '100%';
            modal.style.height = '100%';
            modal.style.backgroundColor = 'rgba(0,0,0,0.8)';
            modal.style.justifyContent = 'center';
            modal.style.alignItems = 'center';
            
            document.body.style.overflow = 'hidden';
            console.log('✅ [DEBUG] 모달 열림 완료');
        } else {
            console.error('❌ [DEBUG] reportModal 엘리먼트를 찾을 수 없습니다!');
        }
    },

    closeReportModal() {
        console.log('🔍 [DEBUG] closeReportModal 호출됨');
        const modal = document.getElementById('reportModal');
        
        if (modal) {
            modal.style.display = 'none';
            document.body.style.overflow = '';
            console.log('✅ [DEBUG] 모달 닫힘 완료');
        }
        
        if (this._chartInstance) {
            this._chartInstance.destroy();
            this._chartInstance = null;
        }
    },

    // 🔥 리포트 콘텐츠 생성 함수들
    generateSummaryContent(data) {
        const funnelData = this.calculateFunnelData(data);
        const topSourcesData = this.calculateTopSources(data);
        return `
            ${this.generateFunnelHtml(funnelData)}
            <div class="report-grid">
                <div class="report-chart-container">
                    <h3 class="report-subtitle">지원루트별 지원자 수</h3>
                    <canvas id="report-chart"></canvas>
                </div>
                <div class="report-table-container">
                    <h3 class="report-subtitle">우수 채용 경로 (Top 5)</h3>
                    ${this.generateTopSourcesTableHtml(topSourcesData)}
                </div>
            </div>
        `;
    },

    generateDetailTable(data) {
        const { headers } = globalThis.App.state.data;
        const visibleHeaders = headers.filter(h => !['비고', '면접리뷰'].includes(h));
        let tableHtml = '<div class="report-table-container"><table class="report-table"><thead><tr>';
        visibleHeaders.forEach(h => { tableHtml += `<th>${h}</th>`; });
        tableHtml += '</tr></thead><tbody>';
        data.forEach(row => {
            tableHtml += '<tr>';
            visibleHeaders.forEach(h => { tableHtml += `<td>${row[headers.indexOf(h)] || '-'}</td>`; });
            tableHtml += '</tr>';
        });
        return tableHtml + '</tbody></table></div>';
    },

    // 🔥 데이터 계산 함수들
    calculateFunnelData(data) {
        const { headers } = globalThis.App.state.data;
        const indices = { 
            contactResult: headers.indexOf('1차 컨택 결과'), 
            interviewResult: headers.indexOf('면접결과'), 
            joinDate: headers.indexOf('입과일') 
        };
        const total = data.length;
        const interviewConfirmed = data.filter(r => (r[indices.contactResult] || '') === '면접확정').length;
        const passed = data.filter(r => (r[indices.interviewResult] || '') === '합격').length;
        const joined = data.filter(r => (r[indices.joinDate] || '').trim() && (r[indices.joinDate] || '').trim() !== '-').length;
        
        return [
            { stage: '총 지원', count: total, conversion: 100 },
            { stage: '면접 확정', count: interviewConfirmed, conversion: total > 0 ? (interviewConfirmed / total * 100) : 0 },
            { stage: '최종 합격', count: passed, conversion: interviewConfirmed > 0 ? (passed / interviewConfirmed * 100) : 0 },
            { stage: '최종 입과', count: joined, conversion: passed > 0 ? (joined / passed * 100) : 0 }
        ];
    },

    calculateTopSources(data) {
        const { headers } = globalThis.App.state.data;
        const indices = { route: headers.indexOf('지원루트'), joinDate: headers.indexOf('입과일') };
        const sourceStats = {};
        
        data.forEach(row => {
            const route = row[indices.route] || '미지정';
            if (!sourceStats[route]) sourceStats[route] = { total: 0, joined: 0 };
            sourceStats[route].total++;
            if ((row[indices.joinDate] || '').trim() && (row[indices.joinDate] || '').trim() !== '-') {
                sourceStats[route].joined++;
            }
        });
        
        return Object.entries(sourceStats).map(([name, stats]) => ({
            name, 
            total: stats.total, 
            joined: stats.joined,
            joinRate: stats.total > 0 ? (stats.joined / stats.total * 100) : 0
        })).sort((a, b) => b.joinRate - a.joinRate).slice(0, 5);
    },

    // 🔥 HTML 생성 함수들
    generateFunnelHtml(funnelData) {
        let html = '<h3 class="report-subtitle">채용 퍼널 분석</h3><div class="report-funnel">';
        funnelData.forEach((step, index) => {
            const widthPercentage = index === 0 ? 100 : funnelData[index-1].count > 0 ? (step.count / funnelData[index-1].count * 100) : 0;
            html += `
                <div class="funnel-step" style="--step-color: var(--funnel-color-${index + 1});">
                    <div class="funnel-info">
                        <span class="funnel-stage">${step.stage}</span>
                        <span class="funnel-count">${step.count}명</span>
                    </div>
                    <div class="funnel-bar-bg">
                        <div class="funnel-bar" style="width: ${widthPercentage}%;"></div>
                    </div>
                    ${index > 0 ? `<span class="funnel-conversion"><i class="fas fa-arrow-down"></i> ${step.conversion.toFixed(1)}%</span>` : ''}
                </div>`;
        });
        return html + '</div>';
    },

    generateTopSourcesTableHtml(topSourcesData) {
        let tableHtml = '<table class="report-table mini"><thead><tr><th>지원루트</th><th>총지원</th><th>최종입과</th><th>입과율</th></tr></thead><tbody>';
        if (topSourcesData.length === 0) {
            return '<p>데이터가 부족하여 우수 채용 경로를 분석할 수 없습니다.</p>';
        }
        topSourcesData.forEach(source => {
            tableHtml += `<tr><td>${source.name}</td><td>${source.total}명</td><td>${source.joined}명</td><td><strong>${source.joinRate.toFixed(1)}%</strong></td></tr>`;
        });
        return tableHtml + '</tbody></table>';
    },

    // 🔥 차트 렌더링 함수
    renderReportChart(canvas, data) {
        const routeIndex = globalThis.App.state.data.headers.indexOf('지원루트');
        if (routeIndex === -1) return;
        
        const routeData = {};
        data.forEach(row => {
            const route = row[routeIndex] || '미지정';
            routeData[route] = (routeData[route] || 0) + 1;
        });
        
        this._chartInstance = new Chart(canvas.getContext('2d'), {
            type: 'bar',
            data: {
                labels: Object.keys(routeData),
                datasets: [{
                    label: '지원자 수',
                    data: Object.values(routeData),
                    backgroundColor: 'rgba(167, 139, 250, 0.6)',
                    borderColor: 'rgba(139, 92, 246, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                indexAxis: 'y',
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: { y: { beginAtZero: true } }
            }
        });
    },

    // 🔥 알림 함수
    showCustomAlert(message) {
        const overlay = document.createElement('div');
        overlay.className = 'custom-alert-overlay';
        overlay.innerHTML = `
            <div class="custom-alert-box" style="background: white; padding: 25px; border-radius: 12px; box-shadow: 0 5px 15px rgba(0,0,0,0.3); text-align: center; max-width: 320px;">
                <p style="margin: 0 0 20px; font-size: 1rem; color: #333;">${message}</p>
                <button style="padding: 10px 20px; border: none; background: #4f46e5; color: white; border-radius: 8px; cursor: pointer; font-weight: 600;">확인</button>
            </div>`;
        document.body.appendChild(overlay);
        overlay.querySelector('button').onclick = () => overlay.remove();
        overlay.onclick = (e) => {
            if (e.target === overlay) overlay.remove();
        };
    },

    // 🔧 강제 스크롤 복구 함수 (디버깅용)
    forceScrollReset() {
        console.log('🔧 [DEBUG] 강제 스크롤 리셋');
        document.body.style.overflow = '';
        document.documentElement.style.overflow = '';
        document.body.style.position = '';
        document.body.style.height = '';
        
        // 모든 모달 강제 닫기
        const modals = document.querySelectorAll('#reportModal, .custom-alert-overlay');
        modals.forEach(modal => {
            if (modal) {
                modal.style.display = 'none';
                modal.remove();
            }
        });
        console.log('✅ [DEBUG] 스크롤 복구 완료');
    },

    // 🔥 Excel 리포트 생성
    generateExcelReport() {
        console.log('📊 [DEBUG] Excel 리포트 생성 시작');
        
        try {
            const data = this.getFilteredReportData();
            const selectedTemplate = document.querySelector('#report .template-card.selected');
            const templateName = selectedTemplate ? selectedTemplate.querySelector('.template-name').textContent : 'Report';
            
            if (data.length === 0) {
                this.showCustomAlert('Excel로 출력할 데이터가 없습니다.');
                return;
            }

            // SheetJS 라이브러리 동적 로드
            this.loadSheetJS().then(() => {
                const wb = XLSX.utils.book_new();
                
                // 메인 데이터 시트
                const ws1 = XLSX.utils.json_to_sheet(data);
                XLSX.utils.book_append_sheet(wb, ws1, "지원자 데이터");
                
                // 통계 시트
                const stats = this.calculateDetailedStats(data);
                const statsData = [
                    ['항목', '값'],
                    ['총 지원자 수', data.length],
                    ['전환율', `${stats.conversionRate}%`],
                    ['주요 채용 경로', stats.topSource],
                    ['월별 평균 지원자', Math.round(data.length / 12)],
                    ['생성 일시', new Date().toLocaleString('ko-KR')]
                ];
                
                const ws2 = XLSX.utils.aoa_to_sheet(statsData);
                XLSX.utils.book_append_sheet(wb, ws2, "통계 요약");
                
                // 파일 다운로드
                const fileName = `${templateName}_${new Date().toISOString().slice(0, 10)}.xlsx`;
                XLSX.writeFile(wb, fileName);
                
                this.showCustomAlert(`Excel 파일이 다운로드되었습니다: ${fileName}`);
                
                // 🔥 히스토리에 저장
                this.saveReportToHistory({
                    templateName: templateName,
                    templateIcon: selectedTemplate ? selectedTemplate.querySelector('.template-icon i').className : 'fas fa-chart-pie',
                    format: 'Excel',
                    dataCount: data.length,
                    summary: this.generateReportSummary(data, templateName),
                    filters: this.getCurrentFilters()
                });
                
                console.log('✅ [DEBUG] Excel 리포트 생성 완료');
            });
            
        } catch (error) {
            console.error('❌ [DEBUG] Excel 생성 오류:', error);
            this.showCustomAlert('Excel 파일 생성 중 오류가 발생했습니다.');
        }
    },

    // 🔥 PowerPoint 리포트 생성
    generatePowerPointReport() {
        console.log('📊 [DEBUG] PowerPoint 리포트 생성 시작');
        
        try {
            const data = this.getFilteredReportData();
            const selectedTemplate = document.querySelector('#report .template-card.selected');
            const templateName = selectedTemplate ? selectedTemplate.querySelector('.template-name').textContent : 'Report';
            
            if (data.length === 0) {
                this.showCustomAlert('PowerPoint로 출력할 데이터가 없습니다.');
                return;
            }

            // HTML to Canvas 변환 후 이미지로 PowerPoint 생성
            this.generatePowerPointSlides(data, templateName);
            
        } catch (error) {
            console.error('❌ [DEBUG] PowerPoint 생성 오류:', error);
            this.showCustomAlert('PowerPoint 파일 생성 중 오류가 발생했습니다.');
        }
    },

    // 🔥 SheetJS 라이브러리 동적 로드
    loadSheetJS() {
        return new Promise((resolve, reject) => {
            if (typeof XLSX !== 'undefined') {
                resolve();
                return;
            }
            
            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js';
            script.onload = () => resolve();
            script.onerror = () => reject(new Error('SheetJS 로드 실패'));
            document.head.appendChild(script);
        });
    },

    // 🔥 상세 통계 계산
    calculateDetailedStats(data) {
        const stats = this.calculateBasicStats(data);
        
        // 월별 분포 계산
        const monthlyDistribution = {};
        data.forEach(item => {
            const date = new Date(item['지원일'] || item['등록일'] || Date.now());
            const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            monthlyDistribution[monthKey] = (monthlyDistribution[monthKey] || 0) + 1;
        });
        
        return {
            ...stats,
            monthlyDistribution,
            avgMonthly: Object.keys(monthlyDistribution).length > 0 
                ? Math.round(data.length / Object.keys(monthlyDistribution).length) 
                : 0
        };
    },

    // 🔥 PowerPoint 슬라이드 생성
    generatePowerPointSlides(data, templateName) {
        // Canvas를 사용해서 차트를 이미지로 변환
        const tempContainer = document.createElement('div');
        tempContainer.style.position = 'absolute';
        tempContainer.style.left = '-9999px';
        tempContainer.style.width = '800px';
        tempContainer.style.height = '600px';
        tempContainer.style.background = 'white';
        tempContainer.innerHTML = `
            <div style="padding: 40px; font-family: Arial, sans-serif;">
                <h1 style="color: #1e293b; border-bottom: 3px solid #3b82f6; padding-bottom: 10px;">
                    ${templateName}
                </h1>
                <div style="margin: 30px 0;">
                    <h2>📊 주요 지표</h2>
                    <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin: 20px 0;">
                        <div style="background: #f8fafc; padding: 20px; border-radius: 8px; text-align: center;">
                            <div style="font-size: 2em; font-weight: bold; color: #3b82f6;">${data.length}</div>
                            <div>총 지원자</div>
                        </div>
                    </div>
                </div>
                <div style="margin: 30px 0;">
                    <h2>📈 채용 현황</h2>
                    <canvas id="pptChart" width="600" height="300"></canvas>
                </div>
            </div>
        `;
        
        document.body.appendChild(tempContainer);
        
        // 차트 생성
        const canvas = tempContainer.querySelector('#pptChart');
        const ctx = canvas.getContext('2d');
        
        const sources = this.calculateTopSources(data);
        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: sources.map(s => s.source),
                datasets: [{
                    label: '지원자 수',
                    data: sources.map(s => s.count),
                    backgroundColor: '#3b82f6'
                }]
            },
            options: {
                responsive: false,
                plugins: {
                    legend: { display: false }
                }
            }
        });
        
        // HTML2Canvas로 이미지 변환
        setTimeout(() => {
            html2canvas(tempContainer).then(canvas => {
                const imgData = canvas.toDataURL('image/png');
                
                // 간단한 PowerPoint 형태로 다운로드 (이미지 파일)
                const link = document.createElement('a');
                link.download = `${templateName}_${new Date().toISOString().slice(0, 10)}.png`;
                link.href = imgData;
                link.click();
                
                document.body.removeChild(tempContainer);
                this.showCustomAlert('PowerPoint 슬라이드가 이미지로 다운로드되었습니다.');
                
                // 🔥 히스토리에 저장
                this.saveReportToHistory({
                    templateName: templateName,
                    templateIcon: selectedTemplate ? selectedTemplate.querySelector('.template-icon i').className : 'fas fa-chart-pie',
                    format: 'PowerPoint',
                    dataCount: data.length,
                    summary: this.generateReportSummary(data, templateName),
                    filters: this.getCurrentFilters()
                });
                
                console.log('✅ [DEBUG] PowerPoint 생성 완료');
            });
        }, 1000);
    },

    // 🔥 ==================== 리포트 히스토리 관리 ====================

    // 🔥 리포트 히스토리 초기화
    setupReportHistory() {
        this.renderHistoryTab();
        this.loadHistoryFromStorage();
    },

    // 🔥 히스토리 탭 렌더링
    renderHistoryTab() {
        const historyTab = document.querySelector('#history-tab .option-group');
        if (!historyTab) return;

        historyTab.innerHTML = `
            <div class="option-title">
                <i class="fas fa-clock"></i> 리포트 히스토리
                <button class="btn-clear-history" id="clearHistoryBtn" style="float: right; font-size: 0.8rem; padding: 4px 8px;">
                    <i class="fas fa-trash"></i> 전체 삭제
                </button>
            </div>
            <div class="history-container" id="historyContainer">
                <div class="history-loading">
                    <i class="fas fa-spinner fa-spin"></i> 히스토리 로딩 중...
                </div>
            </div>
            <div class="history-stats" id="historyStats" style="margin-top: 15px; padding: 15px; background: #f8fafc; border-radius: 8px; font-size: 0.9rem;">
                <!-- 통계 정보가 여기에 표시됩니다 -->
            </div>
        `;
    },

    // 🔥 LocalStorage에서 히스토리 로드
    loadHistoryFromStorage() {
        try {
            const historyData = localStorage.getItem('cfc_report_history');
            const history = historyData ? JSON.parse(historyData) : [];
            
            this.renderHistoryList(history);
            this.updateHistoryStats(history);
        } catch (error) {
            console.warn('🔴 [ReportModule] 히스토리 로드 실패:', error);
            this.renderHistoryList([]);
        }
    },

    // 🔥 히스토리 목록 렌더링
    renderHistoryList(history) {
        const container = document.getElementById('historyContainer');
        if (!container) return;

        if (history.length === 0) {
            container.innerHTML = `
                <div style="text-align: center; padding: 40px 20px; color: #6b7280;">
                    <i class="fas fa-inbox" style="font-size: 2rem; margin-bottom: 10px; opacity: 0.5;"></i>
                    <p>아직 생성된 리포트가 없습니다.</p>
                    <p style="font-size: 0.9rem; margin-top: 5px;">첫 번째 리포트를 생성해보세요!</p>
                </div>
            `;
            return;
        }

        const historyHTML = history.slice(0, 10).map((item, index) => `
            <div class="history-item" data-id="${item.id}">
                <div class="history-main">
                    <div class="history-info">
                        <div class="history-title">
                            <i class="${item.templateIcon}"></i>
                            ${item.templateName}
                        </div>
                        <div class="history-meta">
                            <span class="history-date">${this.formatDate(item.createdAt)}</span>
                            <span class="history-count">${item.dataCount}명</span>
                            <span class="history-format">${item.format}</span>
                        </div>
                    </div>
                    <div class="history-actions">
                        <button class="btn-history-view" data-id="${item.id}" title="다시 보기">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn-history-download" data-id="${item.id}" title="다시 다운로드">
                            <i class="fas fa-download"></i>
                        </button>
                        <button class="btn-history-delete" data-id="${item.id}" title="삭제">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
                <div class="history-preview" style="display: none;">
                    <div class="history-summary">${item.summary || '요약 정보 없음'}</div>
                </div>
            </div>
        `).join('');

        container.innerHTML = historyHTML;
    },

    // 🔥 히스토리 통계 업데이트
    updateHistoryStats(history) {
        const statsContainer = document.getElementById('historyStats');
        if (!statsContainer || history.length === 0) {
            if (statsContainer) statsContainer.style.display = 'none';
            return;
        }

        const totalReports = history.length;
        const formats = {};
        const templates = {};
        
        history.forEach(item => {
            formats[item.format] = (formats[item.format] || 0) + 1;
            templates[item.templateName] = (templates[item.templateName] || 0) + 1;
        });

        const mostUsedFormat = Object.keys(formats).reduce((a, b) => formats[a] > formats[b] ? a : b);
        const mostUsedTemplate = Object.keys(templates).reduce((a, b) => templates[a] > templates[b] ? a : b);

        statsContainer.innerHTML = `
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 10px;">
                <div><strong>총 리포트:</strong> ${totalReports}개</div>
                <div><strong>자주 사용하는 형식:</strong> ${mostUsedFormat}</div>
                <div><strong>자주 사용하는 템플릿:</strong> ${mostUsedTemplate}</div>
            </div>
        `;
        statsContainer.style.display = 'block';
    },

    // 🔥 히스토리에 새 리포트 추가
    addToHistory(reportData) {
        try {
            const historyData = localStorage.getItem('cfc_report_history');
            const history = historyData ? JSON.parse(historyData) : [];
            
            const newItem = {
                id: Date.now().toString(),
                templateName: reportData.templateName,
                templateIcon: reportData.templateIcon || 'fas fa-chart-pie',
                format: reportData.format || 'PDF',
                dataCount: reportData.dataCount || 0,
                summary: reportData.summary || '',
                createdAt: new Date().toISOString(),
                filters: reportData.filters || {}
            };

            history.unshift(newItem);
            
            // 최대 50개까지만 보관
            if (history.length > 50) {
                history.splice(50);
            }

            localStorage.setItem('cfc_report_history', JSON.stringify(history));
            
            // UI 업데이트
            this.loadHistoryFromStorage();
            
            console.log('✅ [ReportModule] 히스토리 추가 완료:', newItem);
        } catch (error) {
            console.warn('🔴 [ReportModule] 히스토리 추가 실패:', error);
        }
    },

    // 🔥 히스토리 아이템 삭제
    deleteHistoryItem(itemId) {
        try {
            const historyData = localStorage.getItem('cfc_report_history');
            const history = historyData ? JSON.parse(historyData) : [];
            
            const updatedHistory = history.filter(item => item.id !== itemId);
            localStorage.setItem('cfc_report_history', JSON.stringify(updatedHistory));
            
            this.loadHistoryFromStorage();
            this.showCustomAlert('리포트 히스토리가 삭제되었습니다.');
        } catch (error) {
            console.warn('🔴 [ReportModule] 히스토리 삭제 실패:', error);
        }
    },

    // 🔥 전체 히스토리 삭제
    clearAllHistory() {
        if (confirm('모든 리포트 히스토리를 삭제하시겠습니까?')) {
            localStorage.removeItem('cfc_report_history');
            this.loadHistoryFromStorage();
            this.showCustomAlert('모든 리포트 히스토리가 삭제되었습니다.');
        }
    },

    // 🔥 날짜 포맷팅
    formatDate(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now - date;
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        
        if (diffDays === 0) {
            return '오늘 ' + date.toLocaleTimeString('ko-KR', {hour: '2-digit', minute: '2-digit'});
        } else if (diffDays === 1) {
            return '어제 ' + date.toLocaleTimeString('ko-KR', {hour: '2-digit', minute: '2-digit'});
        } else if (diffDays < 7) {
            return `${diffDays}일 전`;
        } else {
            return date.toLocaleDateString('ko-KR');
        }
    },

    // 🔥 히스토리 아이템 다시 보기
    viewHistoryItem(itemId) {
        try {
            const historyData = localStorage.getItem('cfc_report_history');
            const history = historyData ? JSON.parse(historyData) : [];
            const item = history.find(h => h.id === itemId);
            
            if (!item) {
                this.showCustomAlert('해당 리포트를 찾을 수 없습니다.');
                return;
            }

            // 필터 복원
            if (item.filters) {
                Object.keys(item.filters).forEach(key => {
                    const element = document.getElementById(key);
                    if (element && item.filters[key] !== undefined) {
                        element.value = item.filters[key];
                    }
                });
            }

            // 템플릿 선택 복원
            const templateCards = document.querySelectorAll('.template-card');
            templateCards.forEach(card => {
                card.classList.remove('selected');
                if (card.querySelector('.template-name').textContent === item.templateName) {
                    card.classList.add('selected');
                }
            });

            // 리포트 생성
            this.generateReport();
            
            this.showCustomAlert(`"${item.templateName}" 리포트를 다시 생성했습니다.`);
        } catch (error) {
            console.warn('🔴 [ReportModule] 히스토리 아이템 보기 실패:', error);
            this.showCustomAlert('리포트를 다시 생성하는데 실패했습니다.');
        }
    }

};

    // 🔥 ==================== 히스토리 헬퍼 함수들 ====================

    // 🔥 리포트를 히스토리에 저장
    saveReportToHistory(reportData) {
        try {
            this.addToHistory(reportData);
            console.log('✅ [ReportModule] 리포트 히스토리 저장 완료:', reportData.templateName);
        } catch (error) {
            console.warn('🔴 [ReportModule] 히스토리 저장 실패:', error);
        }
    },

    // 🔥 리포트 요약 생성
    generateReportSummary(data, templateName) {
        if (!data || data.length === 0) return '데이터 없음';
        
        const stats = this.calculateBasicStats(data);
        const summary = [
            `${stats.total}명의 지원자`,
            `전환율 ${stats.conversionRate}%`,
            `주요 경로: ${stats.topSource}`
        ].join(' • ');
        
        return summary;
    },

    // 🔥 현재 필터 설정 가져오기
    getCurrentFilters() {
        const filters = {};
        
        const filterElements = [
            'report-filter-period',
            'report-filter-route',
            'report-filter-field',
            'report-filter-company',
            'report-filter-recruiter',
            'report-filter-interviewer'
        ];
        
        filterElements.forEach(id => {
            const element = document.getElementById(id);
            if (element && element.value) {
                filters[id] = element.value;
            }
        });
        
        // 사용자 지정 날짜 범위
        const startDate = document.getElementById('report-start-date');
        const endDate = document.getElementById('report-end-date');
        if (startDate && startDate.value) filters['report-start-date'] = startDate.value;
        if (endDate && endDate.value) filters['report-end-date'] = endDate.value;
        
        return filters;
    },

    // 🔥 미리보기 사이드바 토글
    togglePreviewSidebar() {
        const sidebar = document.getElementById('livePreviewSidebar');
        const toggleBtn = document.getElementById('previewToggle');
        
        if (!sidebar || !toggleBtn) return;
        
        const isCollapsed = sidebar.classList.contains('collapsed');
        
        if (isCollapsed) {
            sidebar.classList.remove('collapsed');
            toggleBtn.innerHTML = '<i class="fas fa-chevron-left"></i>';
            this.updateLivePreview(); // 다시 표시할 때 업데이트
        } else {
            sidebar.classList.add('collapsed');
            toggleBtn.innerHTML = '<i class="fas fa-chevron-right"></i>';
        }
        
        console.log('🔄 [ReportModule] 미리보기 사이드바 토글:', isCollapsed ? '표시' : '숨김');
    }

};

// 🔥 모듈 내보내기
export { ReportModule };