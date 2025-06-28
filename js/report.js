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
            // --- ▼▼▼ [3단계 수정] 리포트 생성 버튼 클릭 시 generateReport 호출 ▼▼▼ ---
            '.btn-primary': (el) => {
                if (el.textContent.includes('리포트 생성')) this.generateReport();
            }
            // --- ▲▲▲ [3단계 수정] 끝 ▲▲▲ ---
        };

        for (const selector in handlers) {
            const element = target.closest(selector);
            if (element) {
                handlers[selector](element);
                return;
            }
        }
    },
    
    /**
     * 기간 선택 필터 값에 따라 사용자 지정 날짜 범위 선택 UI를 토글합니다.
     */
    toggleDateRangePicker(selectedValue) {
        const dateRangePicker = document.getElementById('report-custom-date-range');
        if (dateRangePicker) {
            dateRangePicker.style.display = selectedValue === 'custom' ? 'grid' : 'none';
        }
    },

    /**
     * 리포트 페이지의 모든 필터를 초기 상태로 리셋합니다.
     */
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

    // 탭 전환 및 카드 선택 로직 (기존과 동일)
    switchTab(clickedTab) { /* ... */ },
    selectCard(clickedCard, cardSelector) { /* ... */ },

    /**
     * App 데이터를 기반으로 리포트 필터 UI를 채웁니다.
     */
    populateFilters() {
        // (기존과 동일, 변경 없음)
    },
    
    /**
     * 현재 필터 설정을 기반으로 데이터를 필터링하여 반환합니다.
     */
    getFilteredReportData() {
        // (기존과 동일, 변경 없음)
        return [];
    },

    /**
     * 필터링된 데이터 개수를 기반으로 미리보기 영역을 업데이트합니다.
     */
    updatePreview() {
        // (기존과 동일, 변경 없음)
    },
    
    // --- ▼▼▼ [3단계 추가] 리포트 생성 로직 ▼▼▼ ---
    /**
     * 선택된 템플릿에 따라 실제 리포트 콘텐츠를 생성하여 미리보기 영역에 표시합니다.
     */
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
        
        // 기존 차트가 있다면 파괴
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
        
        // '경영진 요약' 템플릿의 경우, 차트를 렌더링
        if (templateName === '경영진 요약') {
            const canvas = document.getElementById('report-chart');
            if (canvas) {
                this.renderReportChart(canvas, data);
            }
        }
    },
    
    /**
     * '경영진 요약' 템플릿의 콘텐츠(통계 카드, 차트 캔버스)를 생성합니다.
     * @param {Array} data - 필터링된 데이터
     * @returns {string} 생성된 HTML 문자열
     */
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

    /**
     * '상세 분석' 템플릿의 콘텐츠(데이터 테이블)를 생성합니다.
     * @param {Array} data - 필터링된 데이터
     * @returns {string} 생성된 HTML 테이블 문자열
     */
    generateDetailTable(data) {
        const headers = globalThis.App.state.data.headers;
        const visibleHeaders = headers.filter(h => !['비고', '면접리뷰'].includes(h)); // 너무 긴 컬럼은 제외
        
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
    
    /**
     * '경영진 요약' 리포트의 지원루트별 차트를 렌더링합니다.
     * @param {HTMLCanvasElement} canvas - 차트를 그릴 캔버스 요소
     * @param {Array} data - 필터링된 데이터
     */
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
    // --- ▲▲▲ [3단계 추가] 끝 ▲▲▲ ---

    /**
     * 커스텀 알림창을 표시합니다.
     */
    showCustomAlert(message) {
        // (기존과 동일, 변경 없음)
    }
};
