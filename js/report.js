/**
 * @file report.js
 * @description 리포트 발행 페이지의 모든 UI 및 데이터 로직을 관리합니다.
 */

export const ReportModule = {
    _boundEventHandler: null,
    _boundFilterChangeHandler: null,

    /**
     * 모듈을 초기화하고 이벤트 리스너를 설정합니다.
     */
    initialize() {
        const reportPage = document.getElementById('report');
        if (reportPage && !reportPage.dataset.initialized) {
            console.log('📊 [ReportModule] Initializing...');
            this.setupEventListeners();
            this.updatePreview();
            // 페이지가 로드될 때 '사용자 지정' 날짜 선택기는 숨겨둡니다.
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

        // 클릭 이벤트 위임 (탭, 카드 선택, 버튼 등)
        this._boundEventHandler = this._handleEvent.bind(this);
        reportPage.addEventListener('click', this._boundEventHandler);

        // 필터 섹션의 'change' 이벤트를 위임하여 select, input 변경을 감지합니다.
        const filterSection = reportPage.querySelector('.filter-section');
        if (filterSection) {
            this._boundFilterChangeHandler = (event) => {
                const target = event.target;
                if (target.tagName === 'SELECT' || target.tagName === 'INPUT') {
                    // 기간 선택 <select>가 변경되면 날짜 범위 선택 UI를 토글합니다.
                    if (target.id === 'report-filter-period') {
                        this.toggleDateRangePicker(target.value);
                    }
                    // 필터가 변경될 때마다 미리보기를 업데이트합니다.
                    this.updatePreview();
                }
            };
            filterSection.addEventListener('change', this._boundFilterChangeHandler);
        }
    },
    
    /**
     * 클릭 이벤트를 처리합니다.
     * @param {Event} event - 발생한 클릭 이벤트 객체
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
                if (el.textContent.includes('리포트 생성')) this.showCustomAlert('리포트 생성 기능은 3단계에서 구현됩니다.');
            }
        };

        for (const selector in handlers) {
            // event.target이 selector의 자손 요소인지 확인
            const element = target.closest(selector);
            if (element) {
                // 핸들러 실행
                handlers[selector](element);
                return; // 하나의 이벤트만 처리
            }
        }
    },
    
    /**
     * 기간 선택 필터 값에 따라 사용자 지정 날짜 범위 선택 UI를 토글합니다.
     * @param {string} selectedValue - 기간 선택 필드의 현재 값
     */
    toggleDateRangePicker(selectedValue) {
        const dateRangePicker = document.getElementById('report-custom-date-range');
        if (dateRangePicker) {
            // 'custom'일 때만 보이도록 설정
            dateRangePicker.style.display = selectedValue === 'custom' ? 'grid' : 'none';
        }
    },

    /**
     * 리포트 페이지의 모든 필터를 초기 상태로 리셋합니다.
     */
    resetFilters() {
        const filterSection = document.querySelector('.filter-section');
        if (!filterSection) return;

        // 모든 select 필드를 첫 번째 옵션('전체' 또는 '이번달' 등)으로 되돌립니다.
        filterSection.querySelectorAll('select').forEach(select => {
            select.selectedIndex = 0;
        });

        // 날짜 범위 선택기를 숨깁니다.
        this.toggleDateRangePicker(document.getElementById('report-filter-period').value);
        
        // 미리보기를 업데이트하여 초기화된 상태를 반영합니다.
        this.updatePreview(); 
        console.log('🔄 [ReportModule] Filters have been reset.');
    },

    // 탭 전환 로직
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

    // 템플릿/형식 카드 선택 로직
    selectCard(clickedCard, cardSelector) {
        const container = clickedCard.parentElement;
        container.querySelectorAll(cardSelector).forEach(c => c.classList.remove('selected'));
        clickedCard.classList.add('selected');
    },

    /**
     * App 데이터를 기반으로 리포트 필터 UI를 채웁니다.
     */
    populateFilters() {
        const app = globalThis.App;
        if (!app || !app.state.data.all.length) return;

        const { headers, all } = app.state.data;

        // 필터링할 컬럼과 대상 select 요소의 ID를 매핑
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
            
            // 고유 값 추출 및 정렬
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
    
    /**
     * 현재 필터 설정을 기반으로 데이터를 필터링하여 반환합니다.
     * @returns {Array} 필터링된 데이터 배열
     */
    getFilteredReportData() {
        const app = globalThis.App;
        if (!app || !app.state.data.all.length) return [];

        const { headers, all } = app.state.data;

        // 필터 값 가져오기
        const period = document.getElementById('report-filter-period')?.value;
        const route = document.getElementById('report-filter-route')?.value;
        const position = document.getElementById('report-filter-position')?.value;
        const company = document.getElementById('report-filter-company')?.value;
        const recruiter = document.getElementById('report-filter-recruiter')?.value;
        const interviewer = document.getElementById('report-filter-interviewer')?.value;

        // 헤더 인덱스 찾기
        const dateIndex = headers.indexOf('지원일');
        const routeIndex = headers.indexOf('지원루트');
        const positionIndex = headers.indexOf('모집분야');
        const companyIndex = headers.indexOf('회사명');
        const recruiterIndex = headers.indexOf('증원자');
        const interviewerIndex = headers.indexOf('면접관');

        const filteredData = all.filter(row => {
            // 기간 필터링 로직
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
                // 'last-30', 'this-year' 등 다른 기간 로직도 여기에 추가할 수 있습니다.
            }

            // 나머지 텍스트 필터링
            const routeMatch = (route === 'all' || row[routeIndex] === route);
            const positionMatch = (position === 'all' || row[positionIndex] === position);
            const companyMatch = (company === 'all' || row[companyIndex] === company);
            const recruiterMatch = (recruiter === 'all' || row[recruiterIndex] === recruiter);
            const interviewerMatch = (interviewer === 'all' || row[interviewerIndex] === interviewer);
            
            return dateMatch && routeMatch && positionMatch && companyMatch && recruiterMatch && interviewerMatch;
        });

        return filteredData;
    },

    /**
     * 필터링된 데이터 개수를 기반으로 미리보기 영역을 업데이트합니다.
     */
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

    /**
     * 커스텀 알림창을 표시합니다.
     * @param {string} message - 알림창에 표시할 메시지
     */
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
