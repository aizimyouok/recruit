/**
 * @file costManagement.js
 * @description CFC 채용 대시보드 - 비용 관리 모듈 (로컬 스토리지 프로토타입)
 * @version 1.0 - 로컬 스토리지 기반 프로토타입
 * @date 2025-06-30
 */

const CostManagementModule = {
    // 초기화 상태
    _isInitialized: false,
    _currentFilter: {
        period: 'all',
        channel: 'all',
        category: 'all'
    },
    
    // 가상 데이터 (개발/테스트용)
    _mockData: [
        {
            id: 1,
            date: '2025-06-01',
            channel: '온라인채용',
            category: '광고비',
            amount: 500000,
            hires: 3,
            manager: '김철수',
            note: '사람인, 잡코리아 광고'
        },
        {
            id: 2,
            date: '2025-06-05',
            channel: '헤드헌팅',
            category: '수수료',
            amount: 12000000,
            hires: 2,
            manager: '박영희',
            note: '임원급 채용 (CTO, CFO)'
        },
        {
            id: 3,
            date: '2025-06-10',
            channel: '채용박람회',
            category: '부스비용',
            amount: 2000000,
            hires: 1,
            manager: '이민수',
            note: '코엑스 IT 채용박람회'
        },
        {
            id: 4,
            date: '2025-06-15',
            channel: '직원추천',
            category: '인센티브',
            amount: 800000,
            hires: 1,
            manager: '정수진',
            note: '개발자 추천 인센티브'
        },
        {
            id: 5,
            date: '2025-06-20',
            channel: '온라인채용',
            category: '광고비',
            amount: 300000,
            hires: 2,
            manager: '김철수',
            note: '링크드인 프리미엄 광고'
        }
    ],

    // 모듈 초기화
    init() {
        if (this._isInitialized) return;
        
        console.log('💰 [CostManagement] 초기화 시작...');
        
        try {
            // 로컬 스토리지에서 기존 데이터 로드
            this.loadLocalData();
            
            // UI 초기화
            this.renderSummaryCards();
            this.renderCostTable();
            this.setupEventListeners();
            
            this._isInitialized = true;
            console.log('✅ [CostManagement] 초기화 완료!');
            
        } catch (error) {
            console.error('❌ [CostManagement] 초기화 실패:', error);
        }
    },

    // 로컬 스토리지 데이터 관리
    loadLocalData() {
        try {
            const savedData = localStorage.getItem('cfc_cost_data');
            if (savedData) {
                const parsedData = JSON.parse(savedData);
                // 저장된 데이터가 있으면 사용, 없으면 가상 데이터 사용
                console.log('📂 로컬 스토리지에서 비용 데이터 로드:', parsedData.length + '건');
            } else {
                // 처음 실행 시 가상 데이터를 로컬 스토리지에 저장
                this.saveLocalData(this._mockData);
                console.log('🔧 가상 데이터를 로컬 스토리지에 초기화');
            }
        } catch (error) {
            console.error('❌ 로컬 데이터 로드 실패:', error);
            // 오류 시 가상 데이터 사용
        }
    },

    saveLocalData(data) {
        try {
            localStorage.setItem('cfc_cost_data', JSON.stringify(data || this.getCurrentData()));
            console.log('💾 비용 데이터 로컬 스토리지 저장 완료');
        } catch (error) {
            console.error('❌ 로컬 데이터 저장 실패:', error);
        }
    },

    getCurrentData() {
        try {
            const savedData = localStorage.getItem('cfc_cost_data');
            return savedData ? JSON.parse(savedData) : this._mockData;
        } catch (error) {
            console.error('❌ 현재 데이터 조회 실패:', error);
            return this._mockData;
        }
    },

    // 요약 카드 렌더링
    renderSummaryCards() {
        const data = this.getCurrentData();
        const summary = this.calculateSummary(data);
        
        // 총 예산 (고정값)
        const totalBudgetEl = document.getElementById('totalBudget');
        if (totalBudgetEl) {
            totalBudgetEl.textContent = this.formatCurrency(25000000);
        }
        
        // 사용 금액
        const totalSpentEl = document.getElementById('totalSpent');
        if (totalSpentEl) {
            totalSpentEl.textContent = this.formatCurrency(summary.totalSpent);
        }
        
        // 사용 비율
        const spentPercentageEl = document.getElementById('spentPercentage');
        if (spentPercentageEl) {
            const percentage = Math.round((summary.totalSpent / 25000000) * 100);
            spentPercentageEl.textContent = `${percentage}% 사용`;
            spentPercentageEl.className = percentage > 90 ? 'cost-summary-change negative' : 'cost-summary-change positive';
        }
        
        // 채용당 비용
        const costPerHireEl = document.getElementById('costPerHire');
        if (costPerHireEl) {
            costPerHireEl.textContent = this.formatCurrency(summary.costPerHire);
        }
        
        // ROI 최고 채널
        const bestROIEl = document.getElementById('bestROI');
        if (bestROIEl) {
            bestROIEl.textContent = summary.bestChannel.name;
        }
        
        console.log('📊 요약 카드 렌더링 완료:', summary);
    },

    // 요약 통계 계산
    calculateSummary(data) {
        const totalSpent = data.reduce((sum, item) => sum + item.amount, 0);
        const totalHires = data.reduce((sum, item) => sum + item.hires, 0);
        const costPerHire = totalHires > 0 ? Math.round(totalSpent / totalHires) : 0;
        
        // 채널별 효율성 계산
        const channelStats = {};
        data.forEach(item => {
            if (!channelStats[item.channel]) {
                channelStats[item.channel] = { spent: 0, hires: 0 };
            }
            channelStats[item.channel].spent += item.amount;
            channelStats[item.channel].hires += item.hires;
        });
        
        // 가장 효율적인 채널 찾기
        let bestChannel = { name: '데이터없음', costPerHire: 0 };
        let lowestCost = Infinity;
        
        Object.entries(channelStats).forEach(([channel, stats]) => {
            if (stats.hires > 0) {
                const channelCostPerHire = stats.spent / stats.hires;
                if (channelCostPerHire < lowestCost) {
                    lowestCost = channelCostPerHire;
                    bestChannel = { name: channel, costPerHire: channelCostPerHire };
                }
            }
        });
        
        return {
            totalSpent,
            totalHires,
            costPerHire,
            bestChannel
        };
    },

    // 비용 테이블 렌더링
    renderCostTable() {
        const data = this.getFilteredData();
        const tbody = document.getElementById('costTableBody');
        
        if (!tbody) return;
        
        if (data.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="9" style="text-align: center; padding: 40px; color: #6b7280;">
                        <i class="fas fa-inbox" style="font-size: 2em; margin-bottom: 10px; display: block;"></i>
                        조건에 맞는 비용 데이터가 없습니다.
                    </td>
                </tr>
            `;
            return;
        }
        
        tbody.innerHTML = data.map(item => `
            <tr>
                <td>${this.formatDate(item.date)}</td>
                <td>
                    <span class="channel-badge channel-${item.channel.replace(/\s+/g, '')}">${item.channel}</span>
                </td>
                <td>${item.category}</td>
                <td style="font-weight: 600; color: #ef4444;">${this.formatCurrency(item.amount)}</td>
                <td style="text-align: center;">${item.hires}명</td>
                <td style="font-weight: 600; color: #3b82f6;">${this.formatCurrency(Math.round(item.amount / item.hires))}</td>
                <td>${item.manager}</td>
                <td style="max-width: 200px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${item.note}">${item.note || '-'}</td>
                <td>
                    <button class="btn-icon" onclick="globalThis.App.costManagement.editCost(${item.id})" title="수정">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-icon btn-danger" onclick="globalThis.App.costManagement.deleteCost(${item.id})" title="삭제">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `).join('');
        
        console.log('📋 비용 테이블 렌더링 완료:', data.length + '건');
    },

    // 필터링된 데이터 가져오기
    getFilteredData() {
        const data = this.getCurrentData();
        const filter = this._currentFilter;
        
        return data.filter(item => {
            // 기간 필터
            if (filter.period !== 'all') {
                const itemDate = new Date(item.date);
                const now = new Date();
                
                switch (filter.period) {
                    case 'thisMonth':
                        if (itemDate.getMonth() !== now.getMonth() || itemDate.getFullYear() !== now.getFullYear()) {
                            return false;
                        }
                        break;
                    case 'lastMonth':
                        const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1);
                        if (itemDate.getMonth() !== lastMonth.getMonth() || itemDate.getFullYear() !== lastMonth.getFullYear()) {
                            return false;
                        }
                        break;
                    case 'thisQuarter':
                        const quarterStart = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1);
                        if (itemDate < quarterStart) {
                            return false;
                        }
                        break;
                    case 'thisYear':
                        if (itemDate.getFullYear() !== now.getFullYear()) {
                            return false;
                        }
                        break;
                }
            }
            
            // 채널 필터
            if (filter.channel !== 'all' && item.channel !== filter.channel) {
                return false;
            }
            
            // 카테고리 필터
            if (filter.category !== 'all' && item.category !== filter.category) {
                return false;
            }
            
            return true;
        });
    },

    // 이벤트 리스너 설정
    setupEventListeners() {
        // 필터 변경 이벤트
        const periodFilter = document.getElementById('costPeriodFilter');
        const channelFilter = document.getElementById('costChannelFilter');
        const categoryFilter = document.getElementById('costCategoryFilter');
        
        if (periodFilter) {
            periodFilter.addEventListener('change', (e) => {
                this._currentFilter.period = e.target.value;
            });
        }
        
        if (channelFilter) {
            channelFilter.addEventListener('change', (e) => {
                this._currentFilter.channel = e.target.value;
            });
        }
        
        if (categoryFilter) {
            categoryFilter.addEventListener('change', (e) => {
                this._currentFilter.category = e.target.value;
            });
        }
        
        console.log('🎛️ 비용 관리 이벤트 리스너 설정 완료');
    },

    // 필터 적용
    applyFilters() {
        this.renderCostTable();
        console.log('🔍 필터 적용:', this._currentFilter);
    },

    // 비용 추가 모달 표시
    showAddModal() {
        const modal = document.getElementById('costModal');
        if (modal) {
            // 폼 초기화
            this.resetForm();
            
            // 오늘 날짜로 기본 설정
            const today = new Date().toISOString().split('T')[0];
            const dateInput = document.getElementById('costDate');
            if (dateInput) {
                dateInput.value = today;
            }
            
            modal.style.display = 'block';
            console.log('➕ 비용 추가 모달 표시');
        }
    },

    // 모달 닫기
    closeModal() {
        const modal = document.getElementById('costModal');
        if (modal) {
            modal.style.display = 'none';
            this.resetForm();
            console.log('❌ 비용 모달 닫기');
        }
    },

    // 폼 초기화
    resetForm() {
        const form = document.getElementById('costForm');
        if (form) {
            form.reset();
        }
    },

    // 비용 데이터 저장
    saveCost() {
        try {
            // 폼 데이터 수집
            const formData = this.getFormData();
            
            // 유효성 검사
            if (!this.validateFormData(formData)) {
                return;
            }
            
            // 데이터 저장
            const currentData = this.getCurrentData();
            const newId = Math.max(...currentData.map(item => item.id), 0) + 1;
            
            const newCostItem = {
                id: newId,
                ...formData,
                amount: parseInt(formData.amount),
                hires: parseInt(formData.hires)
            };
            
            currentData.push(newCostItem);
            this.saveLocalData(currentData);
            
            // UI 업데이트
            this.renderSummaryCards();
            this.renderCostTable();
            this.closeModal();
            
            // 성공 메시지
            this.showNotification('💰 비용 데이터가 성공적으로 추가되었습니다!', 'success');
            
            console.log('✅ 새 비용 데이터 저장:', newCostItem);
            
        } catch (error) {
            console.error('❌ 비용 저장 실패:', error);
            this.showNotification('저장 중 오류가 발생했습니다.', 'error');
        }
    },

    // 폼 데이터 수집
    getFormData() {
        return {
            date: document.getElementById('costDate')?.value || '',
            channel: document.getElementById('costChannel')?.value || '',
            category: document.getElementById('costCategory')?.value || '',
            amount: document.getElementById('costAmount')?.value || '0',
            hires: document.getElementById('costHires')?.value || '0',
            manager: document.getElementById('costManager')?.value || '',
            note: document.getElementById('costNote')?.value || ''
        };
    },

    // 폼 데이터 유효성 검사
    validateFormData(data) {
        const errors = [];
        
        if (!data.date) errors.push('날짜를 선택해주세요.');
        if (!data.channel) errors.push('채용 채널을 선택해주세요.');
        if (!data.category) errors.push('비용 항목을 선택해주세요.');
        if (!data.amount || parseInt(data.amount) <= 0) errors.push('올바른 금액을 입력해주세요.');
        if (!data.hires || parseInt(data.hires) < 0) errors.push('채용 완료 수를 입력해주세요.');
        if (!data.manager.trim()) errors.push('담당자를 입력해주세요.');
        
        if (errors.length > 0) {
            this.showNotification('입력 오류:\n' + errors.join('\n'), 'error');
            return false;
        }
        
        return true;
    },

    // 비용 데이터 수정
    editCost(id) {
        const data = this.getCurrentData();
        const item = data.find(cost => cost.id === id);
        
        if (!item) {
            this.showNotification('수정할 데이터를 찾을 수 없습니다.', 'error');
            return;
        }
        
        // 폼에 기존 데이터 채우기
        document.getElementById('costDate').value = item.date;
        document.getElementById('costChannel').value = item.channel;
        document.getElementById('costCategory').value = item.category;
        document.getElementById('costAmount').value = item.amount;
        document.getElementById('costHires').value = item.hires;
        document.getElementById('costManager').value = item.manager;
        document.getElementById('costNote').value = item.note;
        
        // 모달 제목 변경
        const modalTitle = document.querySelector('#costModal .modal-title');
        if (modalTitle) {
            modalTitle.textContent = '✏️ 비용 데이터 수정';
        }
        
        // 저장 버튼을 수정 모드로 변경
        const saveBtn = document.querySelector('#costModal .btn-primary');
        if (saveBtn) {
            saveBtn.onclick = () => this.updateCost(id);
            saveBtn.innerHTML = '<i class="fas fa-save"></i> 수정';
        }
        
        this.showAddModal();
        console.log('✏️ 비용 데이터 수정 모드:', item);
    },

    // 비용 데이터 업데이트
    updateCost(id) {
        try {
            const formData = this.getFormData();
            
            if (!this.validateFormData(formData)) {
                return;
            }
            
            const currentData = this.getCurrentData();
            const index = currentData.findIndex(item => item.id === id);
            
            if (index === -1) {
                this.showNotification('수정할 데이터를 찾을 수 없습니다.', 'error');
                return;
            }
            
            // 데이터 업데이트
            currentData[index] = {
                id: id,
                ...formData,
                amount: parseInt(formData.amount),
                hires: parseInt(formData.hires)
            };
            
            this.saveLocalData(currentData);
            this.renderSummaryCards();
            this.renderCostTable();
            this.closeModal();
            
            // 버튼 원상복구
            this.resetModalToAddMode();
            
            this.showNotification('💰 비용 데이터가 성공적으로 수정되었습니다!', 'success');
            console.log('✅ 비용 데이터 수정 완료:', currentData[index]);
            
        } catch (error) {
            console.error('❌ 비용 수정 실패:', error);
            this.showNotification('수정 중 오류가 발생했습니다.', 'error');
        }
    },

    // 모달을 추가 모드로 리셋
    resetModalToAddMode() {
        const modalTitle = document.querySelector('#costModal .modal-title');
        if (modalTitle) {
            modalTitle.textContent = '💰 비용 데이터 추가';
        }
        
        const saveBtn = document.querySelector('#costModal .btn-primary');
        if (saveBtn) {
            saveBtn.onclick = () => this.saveCost();
            saveBtn.innerHTML = '<i class="fas fa-save"></i> 저장';
        }
    },

    // 비용 데이터 삭제
    deleteCost(id) {
        const data = this.getCurrentData();
        const item = data.find(cost => cost.id === id);
        
        if (!item) {
            this.showNotification('삭제할 데이터를 찾을 수 없습니다.', 'error');
            return;
        }
        
        // 확인 대화상자
        const confirmed = confirm(
            `다음 비용 데이터를 삭제하시겠습니까?\n\n` +
            `날짜: ${this.formatDate(item.date)}\n` +
            `채널: ${item.channel}\n` +
            `금액: ${this.formatCurrency(item.amount)}\n` +
            `담당자: ${item.manager}`
        );
        
        if (!confirmed) return;
        
        try {
            // 데이터에서 제거
            const updatedData = data.filter(cost => cost.id !== id);
            this.saveLocalData(updatedData);
            
            // UI 업데이트
            this.renderSummaryCards();
            this.renderCostTable();
            
            this.showNotification('🗑️ 비용 데이터가 삭제되었습니다.', 'success');
            console.log('🗑️ 비용 데이터 삭제:', item);
            
        } catch (error) {
            console.error('❌ 비용 삭제 실패:', error);
            this.showNotification('삭제 중 오류가 발생했습니다.', 'error');
        }
    },

    // 데이터 내보내기
    exportData() {
        try {
            const data = this.getFilteredData();
            
            if (data.length === 0) {
                this.showNotification('내보낼 데이터가 없습니다.', 'warning');
                return;
            }
            
            // CSV 형식으로 변환
            const headers = ['날짜', '채용채널', '비용항목', '금액', '채용완료수', '1인당비용', '담당자', '비고'];
            const csvData = [
                headers.join(','),
                ...data.map(item => [
                    item.date,
                    item.channel,
                    item.category,
                    item.amount,
                    item.hires,
                    Math.round(item.amount / item.hires),
                    item.manager,
                    `"${item.note.replace(/"/g, '""')}"` // CSV 이스케이핑
                ].join(','))
            ].join('\n');
            
            // 파일 다운로드
            const blob = new Blob(['\uFEFF' + csvData], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            const url = URL.createObjectURL(blob);
            
            link.setAttribute('href', url);
            link.setAttribute('download', `CFC_채용비용_${new Date().toISOString().split('T')[0]}.csv`);
            link.style.visibility = 'hidden';
            
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            this.showNotification('📥 비용 데이터를 CSV 파일로 내보냈습니다.', 'success');
            console.log('📥 데이터 내보내기 완료:', data.length + '건');
            
        } catch (error) {
            console.error('❌ 데이터 내보내기 실패:', error);
            this.showNotification('내보내기 중 오류가 발생했습니다.', 'error');
        }
    },

    // 리포트 모듈과 연동 - 비용 데이터 제공
    getCostDataForReport() {
        const data = this.getCurrentData();
        const summary = this.calculateSummary(data);
        
        // 채널별 통계
        const channelStats = {};
        data.forEach(item => {
            if (!channelStats[item.channel]) {
                channelStats[item.channel] = { spent: 0, hires: 0 };
            }
            channelStats[item.channel].spent += item.amount;
            channelStats[item.channel].hires += item.hires;
        });
        
        // 채널별 1인당 비용 계산
        const channelCosts = {};
        Object.entries(channelStats).forEach(([channel, stats]) => {
            channelCosts[channel] = stats.hires > 0 ? Math.round(stats.spent / stats.hires) : 0;
        });
        
        return {
            totalBudget: 25000000,
            actualCost: summary.totalSpent,
            costPerHire: summary.costPerHire,
            channelCosts: channelCosts,
            bestChannel: summary.bestChannel,
            totalHires: summary.totalHires,
            budgetUsagePercent: Math.round((summary.totalSpent / 25000000) * 100),
            savings: summary.costPerHire < 2500000 ? ((2500000 - summary.costPerHire) * summary.totalHires) : 0
        };
    },

    // 유틸리티 함수들
    formatCurrency(amount) {
        return new Intl.NumberFormat('ko-KR', {
            style: 'currency',
            currency: 'KRW',
            minimumFractionDigits: 0
        }).format(amount);
    },

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('ko-KR', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        });
    },

    formatNumber(number) {
        return new Intl.NumberFormat('ko-KR').format(number);
    },

    // 알림 메시지 표시
    showNotification(message, type = 'info') {
        // 간단한 알림 구현 (나중에 Toast 라이브러리로 교체 가능)
        const colors = {
            'success': '#10b981',
            'error': '#ef4444',
            'warning': '#f59e0b',
            'info': '#3b82f6'
        };
        
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${colors[type] || colors.info};
            color: white;
            padding: 12px 20px;
            border-radius: 6px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 10000;
            max-width: 400px;
            font-size: 14px;
            line-height: 1.4;
            white-space: pre-line;
        `;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        // 3초 후 자동 제거
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 3000);
    },

    // 페이지 표시 시 호출 (navigation.js에서 호출)
    onPageShow() {
        if (!this._isInitialized) {
            this.init();
        } else {
            // 이미 초기화된 경우 데이터만 새로고침
            this.renderSummaryCards();
            this.renderCostTable();
        }
        console.log('👁️ 비용 관리 페이지 표시');
    },

    // 디버그용 함수들
    debug: {
        // 가상 데이터 재생성
        resetMockData: () => {
            CostManagementModule.saveLocalData(CostManagementModule._mockData);
            CostManagementModule.renderSummaryCards();
            CostManagementModule.renderCostTable();
            console.log('🔧 가상 데이터로 리셋 완료');
        },
        
        // 모든 데이터 삭제
        clearAllData: () => {
            if (confirm('⚠️ 모든 비용 데이터를 삭제하시겠습니까?\n이 작업은 되돌릴 수 없습니다.')) {
                localStorage.removeItem('cfc_cost_data');
                CostManagementModule.renderSummaryCards();
                CostManagementModule.renderCostTable();
                console.log('🗑️ 모든 비용 데이터 삭제 완료');
            }
        },
        
        // 현재 데이터 출력
        showCurrentData: () => {
            console.log('📊 현재 비용 데이터:', CostManagementModule.getCurrentData());
        }
    }
};

// 전역 등록
if (typeof globalThis !== 'undefined') {
    globalThis.CostManagementModule = CostManagementModule;
    
    if (globalThis.App) {
        globalThis.App.costManagement = CostManagementModule;
    } else {
        globalThis.App = globalThis.App || {};
        globalThis.App.costManagement = CostManagementModule;
    }
}

// DOM 로드 시 초기화 (costManagement 페이지가 활성화될 때)
document.addEventListener('DOMContentLoaded', () => {
    // 페이지가 표시될 때까지 초기화 지연
    console.log('💰 비용 관리 모듈 로드 완료 - 버전 1.0 (로컬 스토리지 프로토타입)');
});
