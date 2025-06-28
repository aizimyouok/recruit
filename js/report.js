/**
 * @file report.js
 * @description 리포트 발행 페이지의 모든 UI 및 데이터 로직을 관리합니다.
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
            reportPage.dataset.initialized = 'true'; // 초기화 완료 플래그 설정
        }
        // 필터 채우기는 데이터 로딩 후 data.js에서 호출됩니다.
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
            '.template-card': (el) => this.selectCard(el, '.template-card'),
            '.format-option': (el) => this.selectCard(el, '.format-option'),
            '.btn-primary': (el) => {
                if (el.textContent.includes('리포트 생성')) this.showCustomAlert('리포트 생성 기능은 다음 단계에서 구현됩니다.');
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

        // 필터링할 컬럼과 대상 select 요소의 ID를 매핑합니다.
        const filtersToPopulate = {
            '지원루트': 'report-filter-route',
            '모집분야': 'report-filter-position',
            '회사명': 'report-filter-company'
        };

        for (const headerName in filtersToPopulate) {
            const headerIndex = headers.indexOf(headerName);
            if (headerIndex === -1) continue;
            
            // 해당 컬럼의 모든 고유 값을 추출합니다.
            const uniqueOptions = [...new Set(all.map(row => (row[headerIndex] || '').trim()).filter(Boolean))];
            
            const selectElement = document.getElementById(filtersToPopulate[headerName]);
            if (selectElement) {
                // 기존 옵션을 초기화하고 '전체' 옵션을 추가합니다.
                selectElement.innerHTML = '<option value="all">전체</option>';
                uniqueOptions.sort().forEach(option => {
                    selectElement.innerHTML += `<option value="${option}">${option}</option>`;
                });
            }
        }
        console.log('✅ [ReportModule] Filters populated successfully.');
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
