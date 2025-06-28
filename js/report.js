/**
 * @file report.js
 * @description 리포트 발행 페이지의 모든 UI 및 데이터 로직을 관리합니다. (팝업 미리보기 버전)
 */

export const ReportModule = {
    _boundEventHandler: null,
    _boundFilterChangeHandler: null,
    _chartInstance: null,

    initialize() {
        const reportPage = document.getElementById('report');
        if (reportPage && !reportPage.dataset.initialized) {
            console.log('📊 [ReportModule] Initializing...');
            this.setupEventListeners();
            this.toggleDateRangePicker(document.getElementById('report-filter-period')?.value || 'all');
            reportPage.dataset.initialized = 'true';
        }
    },

    destroy() {
        // document에 등록된 이벤트 리스너를 제거합니다.
        if (this._boundEventHandler) {
            document.removeEventListener('click', this._boundEventHandler);
            this._boundEventHandler = null;
        }
        
        const reportPage = document.getElementById('report');
        if (reportPage) {
            const filterSection = reportPage.querySelector('.filter-section');
            if (filterSection && this._boundFilterChangeHandler) {
                filterSection.removeEventListener('change', this._boundFilterChangeHandler);
                this._boundFilterChangeHandler = null;
            }
            reportPage.removeAttribute('data-initialized');
        }

        if (this._chartInstance) {
            this._chartInstance.destroy();
            this._chartInstance = null;
        }
        console.log('🧹 [ReportModule] Destroyed and removed event listeners.');
    },

    setupEventListeners() {
        // 모달과 페이지 전체의 이벤트를 잡기 위해 document에 리스너를 등록합니다.
        this._boundEventHandler = this._handleEvent.bind(this);
        document.addEventListener('click', this._boundEventHandler);

        const filterSection = document.querySelector('#report .filter-section');
        if (filterSection) {
            this._boundFilterChangeHandler = (event) => {
                const target = event.target;
                if (target.tagName === 'SELECT' || target.tagName === 'INPUT') {
                    if (target.id === 'report-filter-period') {
                        this.toggleDateRangePicker(target.value);
                    }
                    // 필터 변경 시에는 미리보기 요약만 업데이트합니다.
                    this.updatePreviewSummary();
                }
            };
            filterSection.addEventListener('change', this._boundFilterChangeHandler);
        }
    },
    
    _handleEvent(event) {
        const target = event.target;
        const handlers = {
            '.report-tab': (el) => this.switchTab(el),
            '.template-card': (el) => this.selectCard(el, '.template-card'),
            '.format-option': (el) => this.selectCard(el, '.format-option'),
            '#report-reset-filters': () => this.resetFilters(),
            '.btn-primary': (el) => {
                // 클릭된 버튼이 리포트 페이지 내에 있을 때만 generateReport 실행
                if (el.closest('#report')) this.generateReport();
            },
            '#closeReportModalBtn': () => this.closeReportModal(),
            '#printReportBtn': () => window.print(),
        };

        for (const selector in handlers) {
            const element = target.closest(selector);
            if (element) {
                handlers[selector](element);
                return;
            }
        }
        // 모달 외부 클릭 시 닫기
        if (target.matches('.report-modal')) {
            this.closeReportModal();
        }
    },

    openReportModal() {
        const modal = document.getElementById('reportModal');
        if (modal) modal.style.display = 'flex';
    },

    closeReportModal() {
        const modal = document.getElementById('reportModal');
        if (modal) modal.style.display = 'none';
        
        if (this._chartInstance) {
            this._chartInstance.destroy();
            this._chartInstance = null;
        }
    },
    
    toggleDateRangePicker(selectedValue) {
        const dateRangePicker = document.getElementById('report-custom-date-range');
        if (dateRangePicker) {
            dateRangePicker.style.display = selectedValue === 'custom' ? 'grid' : 'none';
        }
    },

    resetFilters() {
        const filterSection = document.querySelector('.filter-section');
        if (!filterSection) return;
        filterSection.querySelectorAll('select').forEach(select => {
            select.selectedIndex = 0;
        });
        this.toggleDateRangePicker('all');
        this.updatePreviewSummary(); // 리셋 후 요약 업데이트
    },

    switchTab(clickedTab) {
        const reportPage = document.getElementById('report');
        if (!reportPage) return;
        reportPage.querySelectorAll('.report-tab').forEach(t => t.classList.remove('active'));
        reportPage.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
        clickedTab.classList.add('active');
        const tabId = clickedTab.dataset.tab + '-tab';
        const contentElement = document.getElementById(tabId);
        if (contentElement) contentElement.classList.add('active');
    },

    selectCard(clickedCard, cardSelector) {
        const container = clickedCard.parentElement;
        container.querySelectorAll(cardSelector).forEach(c => c.classList.remove('selected'));
        clickedCard.classList.add('selected');
    },

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
        this.updatePreviewSummary(); // 필터 채운 후 초기 요약 업데이트
    },
    
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
    
    generateReport() {
        const modalBody = document.getElementById('reportModalBody');
        const selectedTemplateEl = document.querySelector('#report .template-card.selected');

        if (!modalBody) return;
        
        if (!selectedTemplateEl) {
            this.showCustomAlert('리포트 템플릿을 먼저 선택해주세요.');
            return;
        }

        const templateName = selectedTemplateEl.querySelector('.template-name').textContent;
        const data = this.getFilteredReportData();

        if (data.length === 0) {
            this.showCustomAlert('리포트를 생성할 데이터가 없습니다. 필터 설정을 확인해주세요.');
            return;
        }
        
        if (this._chartInstance) {
            this._chartInstance.destroy();
            this._chartInstance = null;
        }

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

    calculateFunnelData(data) {
        const { headers } = globalThis.App.state.data;
        const indices = {
            contactResult: headers.indexOf('1차 컨택 결과'),
            interviewResult: headers.indexOf('면접결과'),
            joinDate: headers.indexOf('입과일'),
        };
        const total = data.length;
        const interviewConfirmed = data.filter(r => (r[indices.contactResult] || '') === '면접확정').length;
        const passed = data.filter(r => (r[indices.interviewResult] || '') === '합격').length;
        const joined = data.filter(r => (r[indices.joinDate] || '').trim()).length;
        return [
            { stage: '총 지원', count: total, conversion: 100 },
            { stage: '면접 확정', count: interviewConfirmed, conversion: total > 0 ? (interviewConfirmed / total * 100) : 0 },
            { stage: '최종 합격', count: passed, conversion: interviewConfirmed > 0 ? (passed / interviewConfirmed * 100) : 0 },
            { stage: '최종 입과', count: joined, conversion: passed > 0 ? (joined / passed * 100) : 0 }
        ];
    },

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
                </div>
            `;
        });
        html += '</div>';
        return html;
    },

    calculateTopSources(data) {
        const { headers } = globalThis.App.state.data;
        const indices = { route: headers.indexOf('지원루트'), joinDate: headers.indexOf('입과일') };
        const sourceStats = {};
        data.forEach(row => {
            const route = row[indices.route] || '미지정';
            if (!sourceStats[route]) sourceStats[route] = { total: 0, joined: 0 };
            sourceStats[route].total++;
            if ((row[indices.joinDate] || '').trim()) sourceStats[route].joined++;
        });
        return Object.entries(sourceStats).map(([name, stats]) => ({
            name, total: stats.total, joined: stats.joined,
            joinRate: stats.total > 0 ? (stats.joined / stats.total * 100) : 0
        })).sort((a, b) => b.joinRate - a.joinRate).slice(0, 5);
    },

    generateTopSourcesTableHtml(topSourcesData) {
        let tableHtml = '<table class="report-table mini"><thead><tr><th>지원루트</th><th>총지원</th><th>최종입과</th><th>입과율</th></tr></thead><tbody>';
        if (topSourcesData.length === 0) return '<p>데이터 부족</p>';
        topSourcesData.forEach(source => {
            tableHtml += `<tr><td>${source.name}</td><td>${source.total}명</td><td>${source.joined}명</td><td><strong>${source.joinRate.toFixed(1)}%</strong></td></tr>`;
        });
        tableHtml += '</tbody></table>';
        return tableHtml;
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
        tableHtml += '</tbody></table></div>';
        return tableHtml;
    },
    
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
                    label: '지원자 수', data: Object.values(routeData),
                    backgroundColor: 'rgba(167, 139, 250, 0.6)', borderColor: 'rgba(139, 92, 246, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                indexAxis: 'y', responsive: true, maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: { y: { beginAtZero: true } }
            }
        });
    },

    showCustomAlert(message) {
        const overlay = document.createElement('div');
        overlay.className = 'custom-alert-overlay';
        overlay.innerHTML = `<div class="custom-alert-box"><p>${message}</p><button>확인</button></div>`;
        document.body.appendChild(overlay);
        overlay.querySelector('button').onclick = () => overlay.remove();
    }
};
