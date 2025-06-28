/**
 * @file report.js (수정된 버전)
 * @description 리포트 발행 페이지의 모든 UI 및 데이터 로직을 관리합니다. (문제 해결 버전)
 */

export const ReportModule = {
    _chartInstance: null,
    _isInitialized: false,
    _modal: null, // 모달 요소 캐시

    initialize() {
        if (this._isInitialized) return;
        console.log('📊 [ReportModule] Initializing...');
        
        // 모달 HTML이 없다면 생성
        this.ensureModalExists();
        
        this.addEventListeners();
        this.populateFilters();
        this.updatePreviewSummary();
        this.toggleDateRangePicker(document.getElementById('report-filter-period')?.value || 'all');
        
        this._isInitialized = true;
    },

    destroy() {
        if (!this._isInitialized) return;
        console.log('🧹 [ReportModule] Destroying...');
        
        this.removeEventListeners();
        
        // 🔥 스크롤 복원 추가
        document.body.style.overflow = '';
        
        if (this._chartInstance) {
            this._chartInstance.destroy();
            this._chartInstance = null;
        }
        
        // 모달 닫기
        this.closeReportModal();
        
        this._isInitialized = false;
    },

    // 🔥 모달 HTML 존재 확인 및 생성
    ensureModalExists() {
        if (document.getElementById('reportModal')) {
            this._modal = document.getElementById('reportModal');
            return;
        }

        // 모달 HTML 생성
        const modalHtml = `
            <div id="reportModal" class="report-modal" style="display: none;">
                <div class="report-modal-content">
                    <div class="report-modal-header">
                        <h2>생성된 리포트</h2>
                        <div class="report-modal-actions">
                            <button id="printReportBtn" class="btn-secondary">
                                <i class="fas fa-print"></i> 인쇄
                            </button>
                            <button id="closeReportModalBtn" class="btn-close">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>
                    </div>
                    <div id="reportModalBody" class="report-modal-body">
                        <!-- 리포트 내용이 여기에 표시됩니다 -->
                    </div>
                </div>
            </div>
        `;

        // body에 모달 추가
        document.body.insertAdjacentHTML('beforeend', modalHtml);
        this._modal = document.getElementById('reportModal');

        // 모달 CSS 추가
        this.addModalStyles();
    },

    // 🔥 모달 CSS 스타일 추가
    addModalStyles() {
        if (document.head.querySelector('#report-modal-styles')) return;

        const style = document.createElement('style');
        style.id = 'report-modal-styles';
        style.textContent = `
            .report-modal {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background-color: rgba(0, 0, 0, 0.5);
                z-index: 9999; /* 🔥 높은 z-index */
                display: flex;
                justify-content: center;
                align-items: center;
                padding: 20px;
                box-sizing: border-box;
            }

            .report-modal-content {
                background: white;
                border-radius: 12px;
                max-width: 90vw;
                max-height: 90vh;
                overflow-y: auto;
                box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
                animation: modalSlideIn 0.3s ease;
            }

            @keyframes modalSlideIn {
                from {
                    opacity: 0;
                    transform: scale(0.9) translateY(-20px);
                }
                to {
                    opacity: 1;
                    transform: scale(1) translateY(0);
                }
            }

            .report-modal-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 20px 24px;
                border-bottom: 1px solid #e5e7eb;
                background: #f8fafc;
                border-radius: 12px 12px 0 0;
            }

            .report-modal-header h2 {
                margin: 0;
                color: #1f2937;
                font-size: 1.5rem;
                font-weight: 600;
            }

            .report-modal-actions {
                display: flex;
                gap: 10px;
            }

            .report-modal-body {
                padding: 24px;
                max-height: 70vh;
                overflow-y: auto;
            }

            .btn-close {
                background: none;
                border: none;
                font-size: 1.2rem;
                cursor: pointer;
                color: #6b7280;
                padding: 8px;
                border-radius: 6px;
                transition: all 0.2s ease;
            }

            .btn-close:hover {
                background: #f3f4f6;
                color: #374151;
            }

            .btn-secondary {
                padding: 8px 16px;
                background: #6b7280;
                color: white;
                border: none;
                border-radius: 6px;
                cursor: pointer;
                font-size: 0.9rem;
                transition: all 0.2s ease;
            }

            .btn-secondary:hover {
                background: #4b5563;
                transform: translateY(-1px);
            }

            /* 리포트 내용 스타일 */
            .report-title {
                font-size: 2rem;
                font-weight: bold;
                text-align: center;
                margin-bottom: 2rem;
                color: #1f2937;
                padding-bottom: 1rem;
                border-bottom: 2px solid #e5e7eb;
            }

            .report-funnel {
                margin: 2rem 0;
            }

            .report-grid {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 2rem;
                margin-top: 2rem;
            }

            @media (max-width: 768px) {
                .report-grid {
                    grid-template-columns: 1fr;
                }
                
                .report-modal-content {
                    max-width: 95vw;
                    margin: 10px;
                }
            }
        `;
        document.head.appendChild(style);
    },

    addEventListeners() {
        this._boundHandleClick = this._handleEvents.bind(this);
        this._boundHandleChange = this._handleFilterChange.bind(this);
        
        // 🔥 이벤트를 리포트 페이지로만 한정
        const reportPage = document.getElementById('report');
        if (reportPage) {
            reportPage.addEventListener('click', this._boundHandleClick);
            const filterSection = reportPage.querySelector('.filter-section');
            if (filterSection) {
                filterSection.addEventListener('change', this._boundHandleChange);
            }
        }

        // 🔥 모달 클릭 이벤트 (모달 외부 클릭시 닫기)
        if (this._modal) {
            this._modal.addEventListener('click', (e) => {
                if (e.target === this._modal) {
                    this.closeReportModal();
                }
            });
        }
    },

    removeEventListeners() {
        const reportPage = document.getElementById('report');
        if (reportPage && this._boundHandleClick) {
            reportPage.removeEventListener('click', this._boundHandleClick);
            const filterSection = reportPage.querySelector('.filter-section');
            if (filterSection && this._boundHandleChange) {
                filterSection.removeEventListener('change', this._boundHandleChange);
            }
        }
    },

    _handleFilterChange(event) {
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
        
        if (!button) return;

        // 🔥 리포트 페이지 내에서만 처리
        if (button.matches('.report-tab')) {
            this.switchTab(button);
        } else if (button.matches('.template-card')) {
            this.selectCard(button, '.template-card');
        } else if (button.matches('.format-option')) {
            this.selectCard(button, '.format-option');
        } else if (button.matches('#report-reset-filters')) {
            this.resetFilters();
        } else if (button.matches('.btn-primary')) {
            // 🔥 리포트 페이지의 primary 버튼만 처리
            if (button.closest('#report')) {
                this.generateReport();
            }
        }

        // 🔥 모달 내 버튼 처리
        if (button.matches('#closeReportModalBtn')) {
            this.closeReportModal();
        } else if (button.matches('#printReportBtn')) {
            window.print();
        }
    },

    openReportModal() {
        if (!this._modal) {
            this.ensureModalExists();
        }
        
        if (this._modal) {
            this._modal.style.display = 'flex';
            document.body.style.overflow = 'hidden';
            
            // 🔥 포커스 관리
            const closeBtn = this._modal.querySelector('#closeReportModalBtn');
            if (closeBtn) {
                setTimeout(() => closeBtn.focus(), 100);
            }
        }
    },

    closeReportModal() {
        if (this._modal) {
            this._modal.style.display = 'none';
            document.body.style.overflow = '';
        }
        
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
        const filterSection = document.querySelector('#report .filter-section');
        if (!filterSection) return;
        filterSection.querySelectorAll('select').forEach(select => {
            select.selectedIndex = 0;
        });
        this.toggleDateRangePicker('all');
        this.updatePreviewSummary();
    },

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
            button.innerHTML = `<i class="fas fa-magic"></i> ${totalCount}명 리포트 생성 및 확인`;
        }
    },
    
    generateReport() {
        console.log('🔥 [ReportModule] 리포트 생성 시작');
        
        const selectedTemplateEl = document.querySelector('#report .template-card.selected');
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

        // 🔥 모달 존재 확인 및 생성
        this.ensureModalExists();
        
        const modalBody = document.getElementById('reportModalBody');
        if (!modalBody) {
            console.error('reportModalBody 요소를 찾을 수 없습니다.');
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
            setTimeout(() => {
                const canvas = document.getElementById('report-chart');
                if (canvas) this.renderReportChart(canvas, data);
            }, 100);
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
                    <canvas id="report-chart" style="max-height: 400px;"></canvas>
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

    generateFunnelHtml(funnelData) {
        let html = '<h3 class="report-subtitle">채용 퍼널 분석</h3><div class="report-funnel">';
        funnelData.forEach((step, index) => {
            const widthPercentage = index === 0 ? 100 : funnelData[index-1].count > 0 ? (step.count / funnelData[index-1].count * 100) : 0;
            html += `
                <div class="funnel-step" style="--step-color: var(--funnel-color-${index + 1});">
                    <div class="funnel-info"> <span class="funnel-stage">${step.stage}</span> <span class="funnel-count">${step.count}명</span> </div>
                    <div class="funnel-bar-bg"> <div class="funnel-bar" style="width: ${widthPercentage}%;"></div> </div>
                    ${index > 0 ? `<span class="funnel-conversion"><i class="fas fa-arrow-down"></i> ${step.conversion.toFixed(1)}%</span>` : ''}
                </div>`;
        });
        return html + '</div>';
    },

    calculateTopSources(data) {
        const { headers } = globalThis.App.state.data;
        const indices = { route: headers.indexOf('지원루트'), joinDate: headers.indexOf('입과일') };
        const sourceStats = {};
        data.forEach(row => {
            const route = row[indices.route] || '미지정';
            if (!sourceStats[route]) sourceStats[route] = { total: 0, joined: 0 };
            sourceStats[route].total++;
            if ((row[indices.joinDate] || '').trim() && (row[indices.joinDate] || '').trim() !== '-') sourceStats[route].joined++;
        });
        return Object.entries(sourceStats).map(([name, stats]) => ({
            name, total: stats.total, joined: stats.joined,
            joinRate: stats.total > 0 ? (stats.joined / stats.total * 100) : 0
        })).sort((a, b) => b.joinRate - a.joinRate).slice(0, 5);
    },

    generateTopSourcesTableHtml(topSourcesData) {
        let tableHtml = '<table class="report-table mini"><thead><tr><th>지원루트</th><th>총지원</th><th>최종입과</th><th>입과율</th></tr></thead><tbody>';
        if (topSourcesData.length === 0) return '<p>데이터가 부족하여 우수 채용 경로를 분석할 수 없습니다.</p>';
        topSourcesData.forEach(source => {
            tableHtml += `<tr><td>${source.name}</td><td>${source.total}명</td><td>${source.joined}명</td><td><strong>${source.joinRate.toFixed(1)}%</strong></td></tr>`;
        });
        return tableHtml + '</tbody></table>';
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
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.5);
            z-index: 10000;
            display: flex;
            justify-content: center;
            align-items: center;
        `;
        overlay.innerHTML = `
            <div class="custom-alert-box" style="background: white; padding: 25px; border-radius: 12px; box-shadow: 0 5px 15px rgba(0,0,0,0.3); text-align: center; max-width: 320px;">
                <p style="margin: 0 0 20px; font-size: 1rem; color: #333;">${message}</p>
                <button style="padding: 10px 20px; border: none; background: #4f46e5; color: white; border-radius: 8px; cursor: pointer; font-weight: 600;">확인</button>
            </div>
        `;
        document.body.appendChild(overlay);
        overlay.querySelector('button').onclick = () => overlay.remove();
        overlay.onclick = (e) => {
            if (e.target === overlay) overlay.remove();
        };
    }
};
