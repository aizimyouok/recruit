/**
 * @file report.js
 * @description 리포트 발행 페이지의 모든 UI 및 데이터 로직을 관리합니다.
 * 이 모듈은 메인 애플리케이션(script.js)에 의해 로드되며,
 * 사용자가 '리포트 발행' 페이지로 이동했을 때 initialize 함수가 호출됩니다.
 */

export const ReportModule = {
    // 모듈 초기화 함수: 페이지가 표시될 때 호출됩니다.
    initialize() {
        // 이미 이벤트 리스너가 설정되었는지 확인하여 중복 등록을 방지합니다.
        const reportPage = document.getElementById('report');
        if (reportPage && !reportPage.dataset.initialized) {
            console.log('📊 리포트 발행 모듈을 초기화합니다.');
            this.setupEventListeners();
            this.updatePreview(); // 처음 들어왔을 때 기본 미리보기 설정
            reportPage.dataset.initialized = 'true'; // 초기화되었음을 표시
        }
    },

    // 모든 이벤트 리스너를 설정하는 함수
    setupEventListeners() {
        const reportPage = document.getElementById('report');
        if (!reportPage) return;

        // 이벤트 위임을 사용하여 #report 페이지 내의 클릭만 효율적으로 감지합니다.
        reportPage.addEventListener('click', (event) => {
            const target = event.target;

            // 탭 클릭 처리
            const tab = target.closest('.report-tab');
            if (tab) {
                this.switchTab(tab);
                return;
            }

            // 템플릿 카드 선택 처리
            const templateCard = target.closest('.template-card');
            if (templateCard) {
                this.selectCard(templateCard, '.template-card');
                this.updatePreview();
                return;
            }

            // 출력 형식 선택 처리
            const formatOption = target.closest('.format-option');
            if (formatOption) {
                this.selectCard(formatOption, '.format-option');
                return;
            }

            // 미리보기 버튼 클릭 처리
            const previewBtn = target.closest('.btn-secondary');
            if (previewBtn && previewBtn.textContent.includes('미리보기')) {
                this.updatePreview();
                return;
            }

            // 리포트 생성 버튼 클릭 처리
            const generateBtn = target.closest('.btn-primary');
            if (generateBtn && generateBtn.textContent.includes('리포트 생성')) {
                this.simulateReportGeneration();
                return;
            }
        });
    },

    // 탭 전환 로직
    switchTab(clickedTab) {
        const reportPage = document.getElementById('report');
        if (!reportPage) return;

        // 모든 탭과 콘텐츠를 비활성화합니다.
        reportPage.querySelectorAll('.report-tab').forEach(t => t.classList.remove('active'));
        reportPage.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));

        // 클릭된 탭과 그에 해당하는 콘텐츠만 활성화합니다.
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

        if (!previewContent || !selectedTemplate) return;

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

        // 진행률 업데이트를 위한 인터벌 설정
        const interval = setInterval(() => {
            if (currentStep > totalSteps) { // 모든 단계가 완료되면
                clearInterval(interval);
                this.showCustomAlert('리포트 생성이 완료되었습니다!'); // alert 대신 커스텀 알림 사용
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
        // 기존 알림이 있다면 제거
        const existingAlert = document.querySelector('.custom-alert-overlay');
        if (existingAlert) {
            existingAlert.remove();
        }

        // 알림 오버레이 생성
        const overlay = document.createElement('div');
        overlay.className = 'custom-alert-overlay';
        overlay.style.cssText = `
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(0, 0, 0, 0.4); z-index: 10000;
            display: flex; align-items: center; justify-content: center;
        `;

        // 알림 박스 생성
        const alertBox = document.createElement('div');
        alertBox.className = 'custom-alert-box';
        alertBox.style.cssText = `
            background: white; padding: 25px; border-radius: 12px;
            box-shadow: 0 5px 15px rgba(0,0,0,0.3); text-align: center;
            max-width: 320px;
        `;
        
        // 메시지 내용
        const messageP = document.createElement('p');
        messageP.textContent = message;
        messageP.style.cssText = 'margin: 0 0 20px; font-size: 1rem; color: #333;';

        // 확인 버튼
        const closeButton = document.createElement('button');
        closeButton.textContent = '확인';
        closeButton.style.cssText = `
            padding: 10px 20px; border: none; background: #4f46e5;
            color: white; border-radius: 8px; cursor: pointer;
            font-weight: 600;
        `;

        // 요소 조립
        alertBox.appendChild(messageP);
        alertBox.appendChild(closeButton);
        overlay.appendChild(alertBox);
        document.body.appendChild(overlay);

        // 닫기 이벤트
        closeButton.onclick = () => overlay.remove();
        overlay.onclick = (e) => {
            if (e.target === overlay) {
                overlay.remove();
            }
        };
    }
};
