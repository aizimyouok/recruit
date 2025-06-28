/**
 * @file report.js
 * @description 리포트 발행 페이지의 모든 UI 및 데이터 로직을 관리합니다.
 * - 필터 동적 생성, 데이터 필터링, 미리보기 업데이트 기능 포함
 */

export const ReportModule = {
    app: null, // 메인 App 인스턴스를 저장할 속성
    _boundEventHandler: null,

    /**
     * 모듈을 초기화하고 이벤트 리스너를 설정합니다.
     * @param {object} appInstance - 메인 App 객체
     */
    initialize(appInstance) {
        this.app = appInstance;
        const reportPage = document.getElementById('report');
        if (reportPage && !reportPage.dataset.initialized) {
            console.log('📊 리포트 발행 모듈 초기화 및 데이터 연동 시작...');
            this.populateFilters();
            this.setupEventListeners();
            this.updatePreview(); // 초기 미리보기 설정
            reportPage.dataset.initialized = 'true';
        }
    },

    /**
     * 모듈을 파괴하고 이벤트 리스너를 제거합니다.
     */
    destroy() {
        const reportPage = document.getElementById('report');
        if (reportPage && this._boundEventHandler) {
            reportPage.removeEventListener('click', this._boundEventHandler);
            this._boundEventHandler = null;
            reportPage.removeAttribute('data-initialized');
            console.log('🧹 리포트 발행 모듈 기능 및 이벤트 리스너가 정리되었습니다.');
        }
    },
    
    /**
     * 실제 데이터를 기반으로 필터 옵션을 동적으로 생성합니다.
     */
    populateFilters() {
        if (!this.app || !this.app.state.data.all.length) {
            console.warn('[ReportModule] 필터를 생성하기 위한 데이터가 없습니다.');
            return;
        }

        const { headers, all } = this.app.state.data;
        
        const filterConfigs = [
            { id: 'report-route-filter', headerName: '지원루트' },
            { id: 'report-position-filter', headerName: '모집분야' },
            { id: 'report-company-filter', headerName: '회사명' }
        ];

        filterConfigs.forEach(config => {
            const selectElement = document.getElementById(config.id);
            const headerIndex = headers.indexOf(config.headerName);

            if (selectElement && headerIndex !== -1) {
                // 기존 옵션 초기화 (All 제외)
                selectElement.innerHTML = '<option value="all">전체</option>'; 
                
                const options = [...new Set(all.map(row => (row[headerIndex] || '').trim()).filter(Boolean))];
                options.sort().forEach(optionValue => {
                    const option = document.createElement('option');
                    option.value = optionValue;
                    option.textContent = optionValue;
                    selectElement.appendChild(option);
                });
            }
        });
        console.log('[ReportModule] 필터 옵션이 동적으로 생성되었습니다.');
    },

    /**
     * 이벤트 리스너를 설정합니다.
     */
    setupEventListeners() {
        const reportPage = document.getElementById('report');
        if (!reportPage) return;

        this._boundEventHandler = this._handleEvent.bind(this);
        reportPage.addEventListener('click', this._boundEventHandler);
    },

    /**
     * 클릭 이벤트를 처리합니다.
     * @param {Event} event - 클릭 이벤트 객체
     */
    _handleEvent(event) {
        const target = event.target;
        const buttonAction = target.closest('.btn-primary, .btn-secondary');

        if (target.closest('.report-tab')) {
            this.switchTab(target.closest('.report-tab'));
        } else if (target.closest('.template-card')) {
            this.selectCard(target.closest('.template-card'), '.template-card');
            this.updatePreview();
        } else if (target.closest('.format-option')) {
            this.selectCard(target.closest('.format-option'), '.format-option');
        } else if (buttonAction) {
            // "미리보기" 또는 "리포트 생성" 버튼 클릭 시
            this.updatePreview(); // 두 버튼 모두 미리보기 업데이트를 트리거
            if(buttonAction.classList.contains('btn-primary')) {
                this.simulateReportGeneration();
            }
        }
    },

    /**
     * 현재 필터 설정에 따라 데이터를 필터링합니다.
     * @returns {Array} 필터링된 데이터 배열
     */
    getFilteredData() {
        if (!this.app) return [];

        const route = document.getElementById('report-route-filter').value;
        const position = document.getElementById('report-position-filter').value;
        const company = document.getElementById('report-company-filter').value;
        // (기간 필터 로직은 필요시 여기에 추가)

        const { all, headers } = this.app.state.data;
        const routeIndex = headers.indexOf('지원루트');
        const positionIndex = headers.indexOf('모집분야');
        const companyIndex = headers.indexOf('회사명');

        const filteredData = all.filter(row => {
            const isRouteMatch = (route === 'all') || (row[routeIndex] === route);
            const isPositionMatch = (position === 'all') || (row[positionIndex] === position);
            const isCompanyMatch = (company === 'all') || (row[companyIndex] === company);
            return isRouteMatch && isPositionMatch && isCompanyMatch;
        });

        return filteredData;
    },

    /**
     * 필터링된 데이터를 기반으로 미리보기 영역을 업데이트합니다.
     */
    updatePreview() {
        const reportPage = document.getElementById('report');
        if (!reportPage) return;

        const previewContent = reportPage.querySelector('.preview-content');
        const selectedTemplate = reportPage.querySelector('.template-card.selected .template-name');
        
        if (!previewContent || !selectedTemplate) return;

        const filteredData = this.getFilteredData();
        const templateName = selectedTemplate.textContent;

        previewContent.innerHTML = `
            <div style="text-align: center; padding: 20px;">
                <h3 style="color: #374151; margin-bottom: 15px;">${templateName} 리포트</h3>
                <div style="background: #f3f4f6; height: 150px; border-radius: 8px; display: flex; flex-direction: column; align-items: center; justify-content: center; color: #6b7280; border: 1px solid var(--border-color);">
                    <div style="font-size: 2.5rem; font-weight: 700; color: #4f46e5;">${filteredData.length}</div>
                    <div style="font-size: 0.9rem; margin-top: 5px;">건의 데이터가 조회되었습니다.</div>
                </div>
                <p style="margin-top: 15px; color: #6b7280; font-size: 0.9rem;">
                    '리포트 생성' 버튼을 눌러주세요.
                </p>
            </div>
        `;
        
        reportPage.querySelector('.report-preview').classList.add('has-content');
    },

    // (이하 다른 함수들은 이전과 동일합니다)
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
    
    simulateReportGeneration() {
        const reportPage = document.getElementById('report');
        if (!reportPage) return;
        const progressSection = reportPage.querySelector('.progress-section');
        const progressFill = reportPage.querySelector('.progress-fill');
        const steps = reportPage.querySelectorAll('.progress-step');
        if (!progressSection || !progressFill || steps.length === 0) return;
        progressSection.style.display = 'block';
        let currentStep = 0;
        const totalSteps = steps.length;
        const interval = setInterval(() => {
            if (currentStep > totalSteps) {
                clearInterval(interval);
                this.showCustomAlert('리포트 생성이 완료되었습니다!');
                progressSection.style.display = 'none';
                progressFill.style.width = '0%';
                steps.forEach(step => step.classList.remove('active', 'completed'));
                return;
            }
            const progress = (currentStep / totalSteps) * 100;
            progressFill.style.width = progress + '%';
            steps.forEach((step, index) => {
                step.classList.remove('active', 'completed');
                if (index < currentStep) step.classList.add('completed');
                else if (index === currentStep) step.classList.add('active');
            });
            currentStep++;
        }, 1000);
    },

    showCustomAlert(message) {
        const existingAlert = document.querySelector('.custom-alert-overlay');
        if (existingAlert) existingAlert.remove();
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
            if (e.target === overlay) overlay.remove();
        };
    }
};
