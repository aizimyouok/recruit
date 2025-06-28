/**
 * @file report.js (최소 수정 버전 - 기존 구조 유지)
 * @description 기존 코드 구조를 최대한 유지하면서 모달 문제만 해결
 */

export const ReportModule = {
    _chartInstance: null,
    _isInitialized: false,

    initialize() {
        if (this._isInitialized) return;
        console.log('📊 [ReportModule] Initializing...');
        
        // 🔥 기존 구조 유지 - 이벤트 리스너 변경 최소화
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
        
        // 🔥 스크롤 복원 (중요!)
        document.body.style.overflow = '';
        
        if (this._chartInstance) {
            this._chartInstance.destroy();
            this._chartInstance = null;
        }
        
        // 모달 닫기
        this.closeReportModal();
        
        this._isInitialized = false;
    },

    // 🔥 기존 이벤트 구조 최대한 유지
    addEventListeners() {
        this._boundHandleClick = this._handleEvents.bind(this);
        this._boundHandleChange = this._handleFilterChange.bind(this);
        
        // 기존 방식 유지 - document.body 사용
        document.body.addEventListener('click', this._boundHandleClick);
        const filterSection = document.querySelector('#report .filter-section');
        if (filterSection) {
            filterSection.addEventListener('change', this._boundHandleChange);
        }
    },

    removeEventListeners() {
        if (this._boundHandleClick) {
            document.body.removeEventListener('click', this._boundHandleClick);
        }
        const filterSection = document.querySelector('#report .filter-section');
        if (filterSection && this._boundHandleChange) {
            filterSection.removeEventListener('change', this._boundHandleChange);
        }
    },

    _handleFilterChange(event) {
        // 🔥 리포트 페이지에서만 동작하도록 체크
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
        
        // 모달 닫기 (모든 페이지에서)
        if (target.matches('.report-modal') || target.matches('#reportModal')) {
            this.closeReportModal();
            return;
        }
        
        if (!button) return;

        // 🔥 리포트 페이지에서만 동작하도록 체크
        if (button.closest('#report')) {
            if (button.matches('.report-tab')) {
                this.switchTab(button);
            } else if (button.matches('.template-card')) {
                this.selectCard(button, '.template-card');
            } else if (button.matches('.format-option')) {
                this.selectCard(button, '.format-option');
            } else if (button.matches('#report-reset-filters')) {
                this.resetFilters();
            } else if (button.matches('.btn-primary')) {
                this.generateReport();
            }
        }

        // 🔥 모달 버튼들 (모든 페이지에서)
        if (button.matches('#closeReportModalBtn')) {
            this.closeReportModal();
        } else if (button.matches('#printReportBtn')) {
            window.print();
        }
    },

    // 🔥 모달 열기 함수 수정
    openReportModal() {
        const modal = document.getElementById('reportModal');
        if (modal) {
            // 모달 스타일 강제 설정
            modal.style.display = 'flex';
            modal.style.position = 'fixed';
            modal.style.top = '0';
            modal.style.left = '0';
            modal.style.width = '100%';
            modal.style.height = '100%';
            modal.style.zIndex = '9999';
            modal.style.backgroundColor = 'rgba(0, 0, 0, 0.6)';
            modal.style.justifyContent = 'center';
            modal.style.alignItems = 'center';
            
            document.body.style.overflow = 'hidden';
            
            console.log('✅ 리포트 모달 열림');
        } else {
            console.error('❌ reportModal 요소를 찾을 수 없습니다.');
        }
    },

    closeReportModal() {
        const modal = document.getElementById('reportModal');
        if (modal) {
            modal.style.display = 'none';
            document.body.style.overflow = '';
            
            console.log('✅ 리포트 모달 닫힘');
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
        
        const startDate = document.getElementById('report-start-date');
        const endDate = document.getElementById('report-end-date');
        if (startDate) startDate.value = '';
        if (endDate) endDate.value = '';
        
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
        if (contentElement) {
            contentElement.classList.add('active');
        }
    },

    selectCard(clickedCard, cardSelector) {
        const container = clickedCard.parentElement;
        container.querySelectorAll(cardSelector).forEach(c => c.classList.remove('selected'));
        clickedCard.classList.add('selected');
    },

    populateFilters() {
        const app = globalThis.App;
        if (!app || !app.state.data.all.length) {
            console.log('⚠️ App 또는 데이터가 없어서 필터를 채울 수 없습니다.');
            return;
        }
        
        const { headers, all } = app.state.data;
        const filtersToPopulate = {
            '지원루트': 'report-filter-route',
            '모집분야': 'report-filter-position',
            '회사명': 'report-filter-company',
            '증원자': 'report-filter-recruiter',
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
        const period = document.getElementById('report-filter-period')?.value;
        const route = document.getElementById('report-filter-route')?.value;
        const position = document.getElementById('report-filter-position')?.value;
        const company = document.getElementById('report-filter-company')?.value;
        const recruiter = document.getElementById('report-filter-recruiter')?.value;
        const interviewer = document.getElementById('report-filter-interviewer')?.value;
        
        const indices = {
            date: headers.indexOf('지원일'),
            route: headers.indexOf('지원루트'),
            position: headers.indexOf('모집분야'),
            company: headers.indexOf('회사명'),
            recruiter: headers.indexOf('증원자'),
            interviewer: headers.indexOf('면접관')
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
                    dateMatch = applyDate.getFullYear() === now.getFullYear() && 
                               applyDate.getMonth() === now.getMonth();
                } else if (period === 'custom') {
                    const startDateStr = document.getElementById('report-start-date')?.value;
                    const endDateStr = document.getElementById('report-end-date')?.value;
                    
                    if (startDateStr && endDateStr) {
                        const startDate = new Date(startDateStr);
                        const endDate = new Date(endDateStr);
                        
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
    
    // 🔥 핵심 수정 - generateReport 함수
    generateReport() {
        console.log('🔥 리포트 생성 시작');
        
        const selectedTemplateEl = document.querySelector('#report .template-card.selected');
        if (!selectedTemplateEl) {
            alert('리포트 템플릿을 먼저 선택해주세요.');
            return;
        }
        
        const templateName = selectedTemplateEl.querySelector('.template-name').textContent;
        const data = this.getFilteredReportData();
        
        if (data.length === 0) {
            alert('리포트를 생성할 데이터가 없습니다. 필터 설정을 확인해주세요.');
            return;
        }

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
        this.openReportModal(); // 🔥 수정된 모달 열기 함수 사용

        if (templateName === '경영진 요약') {
            setTimeout(() => {
                const canvas = document.getElementById('report-chart');
                if (canvas) {
                    this.renderReportChart(canvas, data);
                }
            }, 300);
        }
    },
    
    // 🔥 나머지 함수들은 기존과 동일하게 유지
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
        const joined = data.filter(r => {
            const joinDate = r[indices.joinDate] || '';
            return joinDate.trim() && joinDate.trim() !== '-';
        }).length;
        
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
            const widthPercentage = index === 0 ? 100 : 
                (funnelData[index-1].count > 0 ? (step.count / funnelData[index-1].count * 100) : 0);
            
            const colors = ['#4f46e5', '#7c3aed', '#059669', '#fb923c'];
            const bgColor = colors[index] || '#6b7280';
            
            html += `
                <div class="funnel-step">
                    <div class="funnel-info">
                        <span class="funnel-stage">${step.stage}</span>
                        <span class="funnel-count">${step.count}명</span>
                    </div>
                    <div class="funnel-bar-bg">
                        <div class="funnel-bar" style="width: ${widthPercentage}%; background-color: ${bgColor};"></div>
                    </div>
                    ${index > 0 ? `<span class="funnel-conversion"><i class="fas fa-arrow-down"></i> ${step.conversion.toFixed(1)}%</span>` : ''}
                </div>`;
        });
        
        return html + '</div>';
    },

    calculateTopSources(data) {
        const { headers } = globalThis.App.state.data;
        const indices = { 
            route: headers.indexOf('지원루트'), 
            joinDate: headers.indexOf('입과일') 
        };
        
        const sourceStats = {};
        
        data.forEach(row => {
            const route = row[indices.route] || '미지정';
            if (!sourceStats[route]) {
                sourceStats[route] = { total: 0, joined: 0 };
            }
            sourceStats[route].total++;
            
            const joinDate = row[indices.joinDate] || '';
            if (joinDate.trim() && joinDate.trim() !== '-') {
                sourceStats[route].joined++;
            }
        });
        
        return Object.entries(sourceStats)
            .map(([name, stats]) => ({
                name,
                total: stats.total,
                joined: stats.joined,
                joinRate: stats.total > 0 ? (stats.joined / stats.total * 100) : 0
            }))
            .sort((a, b) => b.joinRate - a.joinRate)
            .slice(0, 5);
    },

    generateTopSourcesTableHtml(topSourcesData) {
        if (topSourcesData.length === 0) {
            return '<p>데이터가 부족하여 우수 채용 경로를 분석할 수 없습니다.</p>';
        }
        
        let tableHtml = `
            <table class="report-table mini">
                <thead>
                    <tr>
                        <th>지원루트</th>
                        <th>총지원</th>
                        <th>최종입과</th>
                        <th>입과율</th>
                    </tr>
                </thead>
                <tbody>
        `;
        
        topSourcesData.forEach(source => {
            tableHtml += `
                <tr>
                    <td>${source.name}</td>
                    <td>${source.total}명</td>
                    <td>${source.joined}명</td>
                    <td><strong>${source.joinRate.toFixed(1)}%</strong></td>
                </tr>`;
        });
        
        return tableHtml + '</tbody></table>';
    },
    
    generateDetailTable(data) {
        const { headers } = globalThis.App.state.data;
        const visibleHeaders = headers.filter(h => !['비고', '면접리뷰'].includes(h));
        
        let tableHtml = `
            <div class="report-table-container">
                <table class="report-table">
                    <thead>
                        <tr>`;
        
        visibleHeaders.forEach(h => {
            tableHtml += `<th>${h}</th>`;
        });
        
        tableHtml += `</tr>
                    </thead>
                    <tbody>`;
        
        data.forEach(row => {
            tableHtml += '<tr>';
            visibleHeaders.forEach(h => {
                const value = row[headers.indexOf(h)] || '-';
                tableHtml += `<td>${value}</td>`;
            });
            tableHtml += '</tr>';
        });
        
        return tableHtml + '</tbody></table></div>';
    },
    
    renderReportChart(canvas, data) {
        if (!window.Chart) {
            console.warn('Chart.js가 로드되지 않았습니다.');
            return;
        }
        
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
                    backgroundColor: 'rgba(79, 70, 229, 0.6)',
                    borderColor: 'rgba(79, 70, 229, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                indexAxis: 'y',
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    x: {
                        beginAtZero: true
                    }
                }
            }
        });
    }
};
