/**
 * @file report.js
 * @description 리포트 발행 페이지의 모든 UI 및 데이터 로직을 관리합니다.
 * 페이지에 들어올 때 이벤트 리스너를 추가(initialize)하고,
 * 페이지를 떠날 때 이벤트 리스너를 제거(destroy)하여 다른 페이지와의 충돌을 방지합니다.
 */

export const ReportModule = {
    // _boundEventHandler: this 컨텍스트가 바인딩된 이벤트 핸들러 함수를 저장하는 속성
    _boundEventHandler: null,

    /**
     * 모듈을 초기화하고 이벤트 리스너를 설정합니다.
     * 페이지가 활성화될 때 한 번만 실행되도록 'data-initialized' 속성으로 체크합니다.
     */
    initialize() {
        const reportPage = document.getElementById('report');
        if (reportPage && !reportPage.dataset.initialized) {
            console.log('📊 [ReportModule] Initializing and adding event listeners...');
            this.setupEventListeners();
            this.updatePreview(); // 초기 미리보기 설정
            reportPage.dataset.initialized = 'true'; // 초기화 완료 플래그 설정
        }
    },

    /**
     * 모듈을 파괴하고 추가했던 이벤트 리스너를 깨끗하게 제거합니다.
     * 다른 페이지로 이동할 때 호출되어 이벤트 충돌을 방지합니다.
     */
    destroy() {
        const reportPage = document.getElementById('report');
        if (reportPage && this._boundEventHandler) {
            reportPage.removeEventListener('click', this._boundEventHandler);
            this._boundEventHandler = null; // 핸들러 참조 제거
            reportPage.removeAttribute('data-initialized'); // 초기화 플래그 제거
            console.log('🧹 [ReportModule] Destroyed and removed event listeners.');
        }
    },

    /**
     * #report 요소에 단일 클릭 이벤트 리스너를 설정합니다(이벤트 위임 방식).
     */
    setupEventListeners() {
        const reportPage = document.getElementById('report');
        if (!reportPage) return;

        // this 컨텍스트를 바인딩하여 나중에 제거할 수 있도록 핸들러를 저장합니다.
        this._boundEventHandler = this._handleEvent.bind(this);
        reportPage.addEventListener('click', this._boundEventHandler);
    },
    
    /**
     * #report 내에서 발생하는 모든 클릭 이벤트를 처리합니다.
     * @param {Event} event - 발생한 클릭 이벤트 객체
     */
    _handleEvent(event) {
        const target = event.target;

        const handlers = {
            '.report-tab': (el) => this.switchTab(el),
            '.template-card': (el) => {
                this.selectCard(el, '.template-card');
                this.updatePreview();
            },
            '.format-option': (el) => this.selectCard(el, '.format-option'),
            '.btn-secondary': (el) => {
                if (el.textContent.includes('미리보기')) this.updatePreview();
            },
            '.btn-primary': (el) => {
                if (el.textContent.includes('리포트 생성')) this.simulateReportGeneration();
            }
        };

        for (const selector in handlers) {
            const element = target.closest(selector);
            if (element) {
                handlers[selector](element);
                return; // 하나의 이벤트만 처리
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

    // 미리보기 업데이트 로직
    updatePreview() {
        const reportPage = document.getElementById('report');
        if (!reportPage) return;

        const previewContainer = reportPage.querySelector('.report-preview');
        const previewContent = reportPage.querySelector('.preview-content');
        const selectedTemplate = reportPage.querySelector('.template-card.selected .template-name');

        if (!previewContent || !selectedTemplate) {
            // 선택된 템플릿이 없을 경우 플레이스홀더를 보여줍니다.
            if(previewContent) {
                 previewContent.innerHTML = `<div class="preview-placeholder">
                    <i class="fas fa-file-alt"></i>
                    <h4>리포트 미리보기</h4>
                    <p>설정을 완료하고 '미리보기' 버튼을 눌러<br>리포트를 확인해보세요.</p>
                </div>`;
            }
            if(previewContainer) {
                previewContainer.classList.remove('has-content');
            }
            return;
        }

        const templateName = selectedTemplate.textContent;

        previewContent.innerHTML = `
            <div style="text-align: center; padding: 20px;">
                <h3 style="color: #374151; margin-bottom: 15px;">${templateName} 리포트</h3>
                <div style="background: #f3f4f6; height: 200px; border-radius: 8px; display: flex; align-items: center; justify-content: center; color: #6b7280;">
                    <i class="fas fa-chart-pie" style="font-size: 3rem;"></i>
                </div>
                <p style="margin-top: 15px; color: #6b7280; font-size: 0.9rem;">
                    선택하신 설정으로 ${templateName} 리포트가 생성됩니다.
                </p>
            </div>
        `;

        if (previewContainer) {
            previewContainer.classList.add('has-content');
        }
    },

    // 리포트 생성 시뮬레이션 로직
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
                if (index < currentStep) {
                    step.classList.add('completed');
                } else if (index === currentStep) {
                    step.classList.add('active');
                }
            });

            currentStep++;
        }, 1000);
    },

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
