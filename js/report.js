/**
 * @file report.js
 * @description 리포트 발행 페이지의 모든 UI 및 데이터 로직을 관리합니다.
 */

export const ReportModule = {
    _boundEventHandler: null,
    _boundFilterChangeHandler: null,
    _chartInstance: null, // 차트 인스턴스를 관리하기 위한 속성

    /**
     * 모듈을 초기화하고 이벤트 리스너를 설정합니다.
     */
    initialize() {
        const reportPage = document.getElementById('report');
        if (reportPage && !reportPage.dataset.initialized) {
            console.log('📊 [ReportModule] Initializing...');
            this.setupEventListeners();
            this.updatePreview();
            this.toggleDateRangePicker(document.getElementById('report-filter-period')?.value || 'all');
            reportPage.dataset.initialized = 'true';
        }
    },

    /**
     * 모듈을 파괴하고 추가했던 이벤트 리스너를 깨끗하게 제거합니다.
     */
    destroy() {
        const reportPage = document.getElementById('report');
        const filterSection = reportPage?.querySelector('.filter-section');

        if (reportPage && this._boundEventHandler) {
            reportPage.removeEventListener('click', this._boundEventHandler);
            this._boundEventHandler = null;
        }
        if (filterSection && this._boundFilterChangeHandler) {
            filterSection.removeEventListener('change', this._boundFilterChangeHandler);
            this._boundFilterChangeHandler = null;
        }
        // 차트 인스턴스가 있다면 파괴
        if (this._chartInstance) {
            this._chartInstance.destroy();
            this._chartInstance = null;
        }
        
        if (reportPage) {
            reportPage.removeAttribute('data-initialized');
        }
        console.log('🧹 [ReportModule] Destroyed and removed event listeners.');
    },

    /**
     * 이벤트 리스너를 설정합니다.
     */
    setupEventListeners() {
        const reportPage = document.getElementById('report');
        if (!reportPage) return;

        this._boundEventHandler = this._handleEvent.bind(this);
        reportPage.addEventListener('click', this._boundEventHandler);

        const filterSection = reportPage.querySelector('.filter-section');
        if (filterSection) {
            this._boundFilterChangeHandler = (event) => {
                const target = event.target;
                if (target.tagName === 'SELECT' || target.tagName === 'INPUT') {
                    if (target.id === 'report-filter-period') {
                        this.toggleDateRangePicker(target.value);
                    }
                    this.updatePreview();
                }
            };
            filterSection.addEventListener('change', this._boundFilterChangeHandler);
        }
    },
    
    /**
     * 클릭 이벤트를 처리합니다.
     */
    _handleEvent(event) {
        const target = event.target;
        const handlers = {
            '.report-tab': (el) => this.switchTab(el),
            '.template-card': (el) => this.selectCard(el, '.template-card'),
            '.format-option': (el) => this.selectCard(el, '.format-option'),
            '#report-reset-filters': () => this.resetFilters(),
            '.btn-secondary': (el) => {
                if (el.textContent.includes('미리보기')) this.updatePreview();
            },
            '.btn-primary': (el) => {
                if (el.textContent.includes('리포트 생성')) this.generateReport();
            }
        };

        for (const selector in handlers) {
            const element = target.closest(selector);
            if (element) {
                handlers[selector](element);
                return;
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
        const filterSection = document.querySelector('.filter-section');
        if (!filterSection) return;
        filterSection.querySelectorAll('select').forEach(select => {
            select.selectedIndex = 0;
        });
        this.toggleDateRangePicker('all');
        this.updatePreview();
        console.log('🔄 [ReportModule] Filters have been reset.');
    },

    switchTab(clickedTab) {
        const reportPage = document.getElementById('report');
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

    // ▼▼▼▼▼ [버그 수정] 빠뜨렸던 함수 내용 복구 ▼▼▼▼▼
    populateFilters() {
        const app = globalThis.App;
        if (!app || !app.state.data.all.length) {
            console.warn('[ReportModule] Data is not available for populating filters.');
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
        console.log('✅ [ReportModule] Filters populated successfully.');
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

        const dateIndex = headers.indexOf('지원일');
        const routeIndex = headers.indexOf('지원루트');
        const positionIndex = headers.indexOf('모집분야');
        const companyIndex = headers.indexOf('회사명');
        const recruiterIndex = headers.indexOf('증원자');
        const interviewerIndex = headers.indexOf('면접관');

        const filteredData = all.filter(row => {
            let dateMatch = true;
            if (period !== 'all' && dateIndex !== -1) {
                const applyDateStr = row[dateIndex];
                if (!applyDateStr) return false;
                const applyDate = new Date(applyDateStr);
                if (isNaN(applyDate.getTime())) return false;
                const now = new Date();
                
                if (period === 'this-month') {
                    dateMatch = applyDate.getFullYear() === now.getFullYear() && applyDate.getMonth() === now.getMonth();
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

            const routeMatch = (route === 'all' || !route || row[routeIndex] === route);
            const positionMatch = (position === 'all' || !position || row[positionIndex] === position);
            const companyMatch = (company === 'all' || !company || row[companyIndex] === company);
            const recruiterMatch = (recruiter === 'all' || !recruiter || row[recruiterIndex] === recruiter);
            const interviewerMatch = (interviewer === 'all' || !interviewer || row[interviewerIndex] === interviewer);
            
            return dateMatch && routeMatch && positionMatch && companyMatch && recruiterMatch && interviewerMatch;
        });

        return filteredData;
    },
    // ▲▲▲▲▲ [버그 수정] 끝 ▲▲▲▲▲
    
    updatePreview() {
        const reportPage = document.getElementById('report');
        if (!reportPage) return;

        const previewContainer = reportPage.querySelector('.report-preview');
        const previewContent = reportPage.querySelector('.preview-content');
        
        const filteredData = this.getFilteredReportData();
        const totalCount = filteredData.length;

        if (!previewContent) return;

        previewContent.innerHTML = `
            <div class="preview-summary">
                <div class="summary-item">
                    <span class="summary-label">분석 대상</span>
                    <span class="summary-value highlight">${totalCount}명</span>
                </div>
            </div>
            <div class="preview-placeholder-dynamic">
                <i class="fas fa-file-invoice"></i>
                <h4>리포트 요약</h4>
                <p>현재 설정으로 <strong>${totalCount}명</strong>의 지원자 데이터에 대한 리포트를 생성합니다.</p>
                <p style="font-size: 0.85rem; color: #9ca3af; margin-top: 15px;">
                    템플릿을 선택하고 '리포트 생성' 버튼을 누르세요.
                </p>
            </div>
        `;

        previewContainer.classList.toggle('has-content', totalCount > 0);
    },
    
    generateReport() {
        const reportPage = document.getElementById('report');
        const previewContent = reportPage?.querySelector('.preview-content');
        const selectedTemplateEl = reportPage?.querySelector('.template-card.selected');

        if (!previewContent || !selectedTemplateEl) {
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

        previewContent.innerHTML = reportHtml;
        
        if (templateName === '경영진 요약') {
            const canvas = document.getElementById('report-chart');
            if (canvas) {
                this.renderReportChart(canvas, data);
            }
        }
    },
    
    generateSummaryContent(data) {
        const app = globalThis.App;
        const headers = app.state.data.headers;
        const contactResultIndex = headers.indexOf('1차 컨택 결과');
        const interviewResultIndex = headers.indexOf('면접결과');
        
        const total = data.length;
        const interviewConfirmed = data.filter(row => (row[contactResultIndex] || '').trim() === '면접확정').length;
        const passed = data.filter(row => (row[interviewResultIndex] || '').trim() === '합격').length;
        
        const passRate = interviewConfirmed > 0 ? ((passed / interviewConfirmed) * 100).toFixed(1) : 0;
        
        return `
            <div class="report-stats-grid">
                <div class="stat-card">
                    <div class="stat-label">총 지원자</div>
                    <div class="stat-value">${total}명</div>
                </div>
                <div class="stat-card">
                    <div class="stat-label">면접 확정</div>
                    <div class="stat-value">${interviewConfirmed}명</div>
                </div>
                <div class="stat-card">
                    <div class="stat-label">최종 합격</div>
                    <div class="stat-value">${passed}명</div>
                </div>
                <div class="stat-card">
                    <div class="stat-label">면접자 중 합격률</div>
                    <div class="stat-value">${passRate}%</div>
                </div>
            </div>
            <div class="report-chart-container">
                <canvas id="report-chart"></canvas>
            </div>
        `;
    },

    generateDetailTable(data) {
        const headers = globalThis.App.state.data.headers;
        const visibleHeaders = headers.filter(h => !['비고', '면접리뷰'].includes(h));
        
        let tableHtml = '<div class="report-table-container"><table class="report-table"><thead><tr>';
        visibleHeaders.forEach(header => {
            tableHtml += `<th>${header}</th>`;
        });
        tableHtml += '</tr></thead><tbody>';

        data.forEach(row => {
            tableHtml += '<tr>';
            visibleHeaders.forEach(header => {
                const cellValue = row[headers.indexOf(header)] || '-';
                tableHtml += `<td>${cellValue}</td>`;
            });
            tableHtml += '</tr>';
        });

        tableHtml += '</tbody></table></div>';
        return tableHtml;
    },
    
    renderReportChart(canvas, data) {
        const app = globalThis.App;
        const routeIndex = app.state.data.headers.indexOf('지원루트');
        if (routeIndex === -1) return;

        const routeData = {};
        data.forEach(row => {
            const route = row[routeIndex] || '미지정';
            routeData[route] = (routeData[route] || 0) + 1;
        });

        const labels = Object.keys(routeData);
        const values = Object.values(routeData);

        this._chartInstance = new Chart(canvas.getContext('2d'), {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: '지원자 수',
                    data: values,
                    backgroundColor: '#a78bfa',
                    borderColor: '#8b5cf6',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    title: {
                        display: true,
                        text: '지원루트별 지원자 수',
                        font: { size: 16 }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    },

    showCustomAlert(message) {
        const existingAlert = document.querySelector('.custom-alert-overlay');
        if (existingAlert) {
            existingAlert.remove();
        }

        const overlay = document.createElement('div');
        overlay.className = 'custom-alert-overlay';
        overlay.style.cssText = `position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0, 0, 0, 0.4); z-index: 10000; display: flex; align-items: center; justify-content: center;`;

        const alertBox = document.createElement('div');
        alertBox.className = 'custom-alert-box';
        alertBox.style.cssText = `background: white; padding: 25px; border-radius: 12px; box-shadow: 0 5px 15px rgba(0,0,0,0.3); text-align: center; max-width: 320px;`;
        
        const messageP = document.createElement('p');
        messageP.textContent = message;
        messageP.style.cssText = 'margin: 0 0 20px; font-size: 1rem; color: #333;';

        const closeButton = document.createElement('button');
        closeButton.textContent = '확인';
        closeButton.style.cssText = `padding: 10px 20px; border: none; background: #4f46e5; color: white; border-radius: 8px; cursor: pointer; font-weight: 600;`;

        alertBox.appendChild(messageP);
        alertBox.appendChild(closeButton);
        overlay.appendChild(alertBox);
        document.body.appendChild(overlay);

        closeButton.onclick = () => overlay.remove();
        overlay.onclick = (e) => {
            if (e.target === overlay) {
                overlay.remove();
            }
        };
    }
};
