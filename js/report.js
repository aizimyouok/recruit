/**
 * @file report.js
 * @description 리포트 발행 페이지의 모든 UI 및 데이터 로직을 관리합니다.
 * - 전체 기능 복원 및 데이터 연동, 기간 선택 기능 구현
 */

export const ReportModule = {
    app: null,
    _boundEventHandler: null,

    initialize(appInstance) {
        this.app = appInstance;
        const reportPage = document.getElementById('report');
        if (reportPage && !reportPage.dataset.initialized) {
            console.log('📊 [ReportModule] Initializing...');
            this.populateFilters();
            this.setupEventListeners();
            this.updatePreview(); 
            reportPage.dataset.initialized = 'true';
        }
    },

    destroy() {
        const reportPage = document.getElementById('report');
        if (reportPage && this._boundEventHandler) {
            reportPage.removeEventListener('click', this._boundEventHandler);
            reportPage.removeEventListener('change', this._boundEventHandler);
            this._boundEventHandler = null;
            reportPage.removeAttribute('data-initialized');
            console.log('🧹 [ReportModule] Destroyed.');
        }
    },
    
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

    setupEventListeners() {
        const reportPage = document.getElementById('report');
        if (!reportPage) return;

        this._boundEventHandler = this._handleEvent.bind(this);
        reportPage.addEventListener('click', this._boundEventHandler);
        reportPage.addEventListener('change', this._boundEventHandler);
    },

    _handleEvent(event) {
        const target = event.target;
        
        // 이벤트 타입에 따라 처리 분기
        if (event.type === 'click') {
            if (target.closest('.report-tab')) this.switchTab(target.closest('.report-tab'));
            else if (target.closest('.template-card')) this.selectCard(target.closest('.template-card'));
            else if (target.closest('.format-option')) this.selectCard(target.closest('.format-option'));
            else if (target.closest('.btn-secondary')?.textContent.includes('미리보기')) this.updatePreview();
            else if (target.closest('.btn-primary')?.textContent.includes('리포트 생성')) this.simulateReportGeneration();
        } else if (event.type === 'change') {
            if (target.id === 'report-period-filter') this.handlePeriodChange(event);
            else if (target.closest('.filter-grid select')) this.updatePreview();
        }
    },

    handlePeriodChange(event) {
        const period = event.target.value;
        const customDateContainer = document.getElementById('report-custom-date-container');
        if (!customDateContainer) return;

        if (period === 'custom') {
            customDateContainer.style.display = 'flex';
        } else {
            customDateContainer.style.display = 'none';
        }
        this.updatePreview();
    },
    
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

    selectCard(clickedCard) {
        const container = clickedCard.parentElement;
        container.querySelectorAll('.template-card, .format-option').forEach(c => c.classList.remove('selected'));
        clickedCard.classList.add('selected');
        this.updatePreview();
    },

    getFilteredData() {
        if (!this.app) return [];

        const period = document.getElementById('report-period-filter').value;
        const route = document.getElementById('report-route-filter').value;
        const position = document.getElementById('report-position-filter').value;
        const company = document.getElementById('report-company-filter').value;

        const { all, headers } = this.app.state.data;
        const routeIndex = headers.indexOf('지원루트');
        const positionIndex = headers.indexOf('모집분야');
        const companyIndex = headers.indexOf('회사명');
        const dateIndex = headers.indexOf('지원일');

        const now = new Date();
        let startDate = null;
        let endDate = new Date(now); 

        if (period !== 'all') {
            startDate = new Date(now);
            if (period === 'this-month') startDate.setDate(1);
            else if (period === 'last-30-days') startDate.setDate(now.getDate() - 30);
            else if (period === 'last-3-months') startDate.setMonth(now.getMonth() - 3);
            else if (period === 'this-year') startDate.setFullYear(now.getFullYear(), 0, 1);
            else if (period === 'custom') {
                 startDate = new Date(document.getElementById('report-start-date').value || '1970-01-01');
                 endDate = new Date(document.getElementById('report-end-date').value || new Date());
            }
        }
        
        endDate.setHours(23, 59, 59, 999); // 끝나는 날의 마지막 시간까지 포함

        return all.filter(row => {
            const isRouteMatch = (route === 'all') || (row[routeIndex] === route);
            const isPositionMatch = (position === 'all') || (row[positionIndex] === position);
            const isCompanyMatch = (company === 'all') || (row[companyIndex] === company);
            
            let isDateMatch = true;
            if (startDate && dateIndex !== -1 && row[dateIndex]) {
                const rowDate = new Date(row[dateIndex]);
                isDateMatch = rowDate >= startDate && rowDate <= endDate;
            }

            return isRouteMatch && isPositionMatch && isCompanyMatch && isDateMatch;
        });
    },

    updatePreview() {
        const reportPage = document.getElementById('report');
        if (!reportPage) return;

        const previewContent = reportPage.querySelector('.preview-content');
        const selectedTemplateCard = reportPage.querySelector('.template-card.selected');
        
        if (!previewContent || !selectedTemplateCard) return;

        const filteredData = this.getFilteredData();
        const templateType = selectedTemplateCard.dataset.template;
        const templateName = selectedTemplateCard.querySelector('.template-name').textContent;

        let contentHtml = `<div style="padding: 15px;">`;
        contentHtml += `<h3 style="text-align:center; margin-bottom: 20px;">${templateName}</h3>`;

        contentHtml += `<div style="background: #f8fafc; padding: 15px; border-radius: 8px; text-align:center; margin-bottom: 20px;"><div style="font-size: 1rem; color: #6b7280;">조회된 데이터</div><div style="font-size: 2.2rem; font-weight: 700; color: #4f46e5;">${filteredData.length}건</div></div>`;
        
        if (templateType === 'summary') {
            contentHtml += this.generateKpiHtml(filteredData);
        } else if (templateType === 'funnel') {
            contentHtml += this.generateFunnelHtml(filteredData);
        } else {
             contentHtml += `<p style="text-align:center; color: #6b7280;">'리포트 생성'을 누르면 상세 내용이 생성됩니다.</p>`;
        }

        contentHtml += `</div>`;
        previewContent.innerHTML = contentHtml;
        reportPage.querySelector('.report-preview').classList.add('has-content');
    },

    generateKpiHtml(data) {
        if(data.length === 0) return '<p style="text-align:center; color: #9ca3af; padding: 20px;">분석할 데이터가 없습니다.</p>';
        const headers = this.app.state.data.headers;
        const total = data.length;
        const confirmed = data.filter(r => r[headers.indexOf('1차 컨택 결과')] === '면접확정').length;
        const passed = data.filter(r => r[headers.indexOf('면접결과')] === '합격').length;
        const hired = data.filter(r => r[headers.indexOf('입과일')] && r[headers.indexOf('입과일')].trim() !== '').length;
        const interviewRate = total > 0 ? (confirmed / total * 100).toFixed(1) : 0;
        const passRate = confirmed > 0 ? (passed / confirmed * 100).toFixed(1) : 0;
        const hireRate = passed > 0 ? (hired / passed * 100).toFixed(1) : 0;
        return `<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; font-size: 0.9rem;"><div style="padding: 10px; border-radius: 6px; background: #f0f9ff;"><strong>면접 전환율:</strong> ${interviewRate}%</div><div style="padding: 10px; border-radius: 6px; background: #f0f9ff;"><strong>합격률:</strong> ${passRate}%</div><div style="padding: 10px; border-radius: 6px; background: #f0f9ff;""><strong>최종 입과율:</strong> ${hireRate}%</div><div style="padding: 10px; border-radius: 6px; background: #f0f9ff;""><strong>총 입과 인원:</strong> ${hired}명</div></div>`;
    },

    generateFunnelHtml(data) {
        if(data.length === 0) return '<p style="text-align:center; color: #9ca3af; padding: 20px;">분석할 데이터가 없습니다.</p>';
        const headers = this.app.state.data.headers;
        const stages = [
            { name: '총 지원', count: data.length },
            { name: '면접 확정', count: data.filter(r => r[headers.indexOf('1차 컨택 결과')] === '면접확정').length },
            { name: '최종 합격', count: data.filter(r => r[headers.indexOf('면접결과')] === '합격').length },
            { name: '최종 입과', count: data.filter(r => r[headers.indexOf('입과일')] && r[headers.indexOf('입과일')].trim() !== '').length }
        ];
        let funnelHtml = '<div style="display: flex; flex-direction: column; gap: 10px;">';
        for (let i = 0; i < stages.length; i++) {
            const width = data.length > 0 ? (stages[i].count / data.length) * 100 : 0;
            const conversion = (i > 0 && stages[i-1].count > 0) ? (stages[i].count / stages[i-1].count * 100).toFixed(1) : '-';
            funnelHtml += `<div><div style="display: flex; justify-content: space-between; font-size: 0.9rem; margin-bottom: 4px;"><span>${stages[i].name}</span><strong>${stages[i].count}명</strong></div><div style="background: #e5e7eb; border-radius: 4px; overflow: hidden;"><div style="width: ${width}%; background: linear-gradient(90deg, #4f46e5, #a855f7); color: white; text-align: right; padding: 2px 5px; font-size:0.75rem; white-space:nowrap;">${width.toFixed(1)}%</div></div>${i > 0 ? `<div style="text-align:center; font-size:0.8rem; color:#9ca3af;">▼ 전환율: ${conversion}%</div>` : ''}</div>`;
        }
        funnelHtml += '</div>';
        return funnelHtml;
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
