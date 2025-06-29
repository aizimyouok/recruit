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

        const data = this.getFilteredReportData();
        const previewContainer = document.querySelector('.preview-content');
        
        if (previewContainer && data.length > 0) {
            const stats = this.calculateBasicStats(data);
            previewContainer.innerHTML = this.generateLivePreviewHTML(template, stats, data.length);
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
        const modalBody = document.getElementById('reportModalBody');
        const selectedTemplateEl = document.querySelector('#report .template-card.selected');
        if (!modalBody || !selectedTemplateEl) {
            this.showCustomAlert('리포트 템플릿을 먼저 선택해주세요.'); 
            return;
        }
        
        const templateName = selectedTemplateEl.querySelector('.template-name').textContent;
        const data = this.getFilteredReportData();
        if (data.length === 0) {
            this.showCustomAlert('리포트를 생성할 데이터가 없습니다. 필터 설정을 확인해주세요.'); 
            return;
        }
        
        if (this._chartInstance) this._chartInstance.destroy();
        
        let reportHtml = `<div class="report-title">${templateName}</div>`;
        switch (templateName) {
            case '경영진 요약': 
                reportHtml += this.generateSummaryContent(data); 
                break;
            case '상세 분석': 
                reportHtml += this.generateDetailTable(data); 
                break;
            default: 
                reportHtml += `<p>${templateName} 템플릿은 현재 준비 중입니다.</p>`; 
                break;
        }
        modalBody.innerHTML = reportHtml;
        this.openReportModal();

        if (templateName === '경영진 요약') {
            const canvas = document.getElementById('report-chart');
            if (canvas) this.renderReportChart(canvas, data);
        }
    },

    // 🔥 모달 관리 함수들
    openReportModal() {
        const modal = document.getElementById('reportModal');
        if (modal) {
            modal.style.display = 'flex';
            document.body.style.overflow = 'hidden';
        }
    },

    closeReportModal() {
        const modal = document.getElementById('reportModal');
        if (modal) {
            modal.style.display = 'none';
            document.body.style.overflow = '';
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
    }