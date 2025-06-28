/**
 * @file report.js
 * @description 리포트 발행 페이지의 모든 UI 및 데이터 로직을 관리합니다.
 */

export const ReportModule = {
    _boundEventHandler: null,
    _boundFilterChangeHandler: null, // 필터 변경 핸들러 추가

    /**
     * 모듈을 초기화하고 이벤트 리스너를 설정합니다.
     */
    initialize() {
        const reportPage = document.getElementById('report');
        if (reportPage && !reportPage.dataset.initialized) {
            console.log('📊 [ReportModule] Initializing...');
            this.setupEventListeners();
            this.updatePreview(); // 초기 미리보기 설정
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

        // 클릭 이벤트 위임 (탭, 카드 선택 등)
        this._boundEventHandler = this._handleEvent.bind(this);
        reportPage.addEventListener('click', this._boundEventHandler);

        // --- ▼▼▼ [2단계 추가] 필터 변경 이벤트 위임 ▼▼▼ ---
        const filterSection = reportPage.querySelector('.filter-section');
        if (filterSection) {
            this._boundFilterChangeHandler = (event) => {
                if (event.target.tagName === 'SELECT') {
                    this.updatePreview();
                }
            };
            filterSection.addEventListener('change', this._boundFilterChangeHandler);
        }
        // --- ▲▲▲ [2단계 추가] 끝 ▲▲▲ ---
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
            '.btn-primary': (el) => {
                if (el.textContent.includes('리포트 생성')) this.showCustomAlert('리포트 생성 기능은 다음 단계에서 구현됩니다.');
            },
            // --- ▼▼▼ [2단계 추가] 미리보기 버튼 클릭 시 업데이트 ▼▼▼ ---
            '.btn-secondary': (el) => {
                if (el.textContent.includes('미리보기')) this.updatePreview();
            }
            // --- ▲▲▲ [2단계 추가] 끝 ▲▲▲ ---
        };

        for (const selector in handlers) {
            const element = target.closest(selector);
            if (element) {
                handlers[selector](element);
                return;
            }
        }
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
     * App의 전체 데이터를 기반으로 리포트 페이지의 필터 UI(<select>)를 채웁니다.
     */
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
            '회사명': 'report-filter-company'
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
    
    // --- ▼▼▼ [2단계 추가] 필터링된 데이터를 가져오는 함수 ▼▼▼ ---
    /**
     * 현재 리포트 필터 설정을 기반으로 데이터를 필터링하여 반환합니다.
     * @returns {Array} 필터링된 데이터 배열
     */
    getFilteredReportData() {
        const app = globalThis.App;
        if (!app || !app.state.data.all.length) {
            return [];
        }

        const { headers, all } = app.state.data;

        // 각 필터의 현재 선택된 값을 가져옵니다.
        const routeFilterValue = document.getElementById('report-filter-route')?.value;
        const positionFilterValue = document.getElementById('report-filter-position')?.value;
        const companyFilterValue = document.getElementById('report-filter-company')?.value;
        // (기간 필터는 다음 단계에서 추가 예정)

        const routeIndex = headers.indexOf('지원루트');
        const positionIndex = headers.indexOf('모집분야');
        const companyIndex = headers.indexOf('회사명');

        const filteredData = all.filter(row => {
            const routeMatch = (routeFilterValue === 'all' || row[routeIndex] === routeFilterValue);
            const positionMatch = (positionFilterValue === 'all' || row[positionIndex] === positionFilterValue);
            const companyMatch = (companyFilterValue === 'all' || row[companyIndex] === companyFilterValue);
            
            return routeMatch && positionMatch && companyMatch;
        });

        return filteredData;
    },
    // --- ▲▲▲ [2단계 추가] 끝 ▲▲▲ ---

    // --- ▼▼▼ [2단계 수정] 미리보기 업데이트 로직 수정 ▼▼▼ ---
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

        // 데이터를 기반으로 한 동적 콘텐츠 생성
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

        if (totalCount > 0) {
            previewContainer.classList.add('has-content');
        } else {
            previewContainer.classList.remove('has-content');
        }
    },
    // --- ▲▲▲ [2단계 수정] 끝 ▲▲▲ ---

    // alert()를 대체하는 커스텀 알림 함수
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
