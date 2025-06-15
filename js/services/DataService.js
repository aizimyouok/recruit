// js/services/DataService.js

/**
 * 데이터 관리 서비스
 * 기존 App.data의 모든 기능을 보존하면서 에러 처리 강화
 */
export class DataService {
    constructor(eventBus, stateManager, config) {
        this.eventBus = eventBus;
        this.stateManager = stateManager;
        this.config = config;
        this.cache = new Map();
        this.requestQueue = [];
        this.isProcessingQueue = false;
        this.retryAttempts = 3;
        this.retryDelay = 1000; // 1초
    }

    /**
     * 데이터 fetch - 기존 App.data.fetch()와 동일한 기능
     */
    async fetch() {
        const tableContainer = document.querySelector('.table-container');

        try {
            this.showLoadingState(tableContainer);
            this.eventBus.emit('data:fetch:start');

            const response = await this.fetchWithRetry(`${this.config.APPS_SCRIPT_URL}?action=read`);

            this.updateProgress(tableContainer, 60, '데이터 처리중...');

            if (!response.ok) {
                throw new Error(this.getErrorMessage(response.status));
            }

            const result = await response.json();

            this.updateProgress(tableContainer, 85, '최종 처리중...');

            if (result.status !== 'success') {
                throw new Error(result.message || '데이터 처리 중 오류가 발생했습니다.');
            }

            if (!result.data || !Array.isArray(result.data) || result.data.length === 0) {
                throw new Error('데이터가 비어있거나 올바르지 않은 형식입니다.');
            }

            // 상태 업데이트
            const headers = (result.data[0] || []).map(h => String(h || '').trim());
            const processedData = result.data.slice(1)
                .filter(row => row && Array.isArray(row) && row.some(cell => cell != null && String(cell).trim() !== ''))
                .map(row => row.map(cell => cell == null ? '' : String(cell)));

            this.stateManager.state.data.headers = headers;
            this.stateManager.state.data.all = processedData;

            this.updateSequenceNumber();
            this.generateVisibleColumns(headers);
            this.updateInterviewSchedule();

            this.updateProgress(tableContainer, 100, '완료!');

            this.eventBus.emit('data:fetch:success', {
                headers,
                data: processedData
            });

            // 캐시에 저장
            this.cache.set('applicants_data', {
                data: result,
                timestamp: Date.now()
            });

        } catch (error) {
            console.error("데이터 불러오기 실패:", error);
            this.showErrorState(tableContainer, error);
            this.eventBus.emit('data:fetch:error', error);
            throw error;
        }
    }

    /**
     * 재시도 로직이 포함된 fetch
     */
    async fetchWithRetry(url, options = {}, attempts = 0) {
        try {
            const response = await fetch(url, options);
            return response;
        } catch (error) {
            if (attempts < this.retryAttempts) {
                console.log(`재시도 ${attempts + 1}/${this.retryAttempts}:`, error.message);
                await this.delay(this.retryDelay * (attempts + 1)); // 지수적 백오프
                return this.fetchWithRetry(url, options, attempts + 1);
            }
            throw error;
        }
    }

    /**
     * 지연 함수
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * 시퀀스 번호 업데이트 - 기존 기능 보존
     */
    updateSequenceNumber() {
        const headers = this.stateManager.state.data.headers;
        const allData = this.stateManager.state.data.all;
        
        const gubunIndex = headers.indexOf('구분');
        if (gubunIndex !== -1 && allData.length > 0) {
            const lastRow = allData[allData.length - 1];
            const lastGubun = parseInt(lastRow[gubunIndex] || '0', 10);
            this.stateManager.state.ui.nextSequenceNumber = isNaN(lastGubun) ? allData.length + 1 : lastGubun + 1;
        } else {
            this.stateManager.state.ui.nextSequenceNumber = allData.length + 1;
        }

        this.eventBus.emit('sequence:updated', this.stateManager.state.ui.nextSequenceNumber);
    }

    /**
     * 면접 일정 업데이트 - 기존 기능 보존
     */
    updateInterviewSchedule() {
        const headers = this.stateManager.state.data.headers;
        const allData = this.stateManager.state.data.all;

        let interviewDateIndex = headers.indexOf('면접 날짜');
        if (interviewDateIndex === -1) interviewDateIndex = headers.indexOf('면접 날자');

        const interviewTimeIndex = headers.indexOf('면접 시간');
        const nameIndex = headers.indexOf('이름');
        const positionIndex = headers.indexOf('모집분야');
        const routeIndex = headers.indexOf('지원루트');
        const recruiterIndex = headers.indexOf('증원자');
        const interviewerIndex = headers.indexOf('면접자');

        if (interviewDateIndex === -1) {
            document.getElementById('interviewScheduleList').innerHTML = '<div class="no-interviews">면접 날짜 컬럼을 찾을 수 없습니다.</div>';
            return;
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const threeDaysLater = new Date(today.getTime() + (3 * 24 * 60 * 60 * 1000));

        const upcomingInterviews = allData
            .filter(row => {
                const interviewDate = row[interviewDateIndex];
                if (!interviewDate) return false;
                try {
                    const date = new Date(interviewDate);
                    return date >= today && date <= threeDaysLater;
                } catch (e) { return false; }
            })
            .sort((a, b) => new Date(a[interviewDateIndex]) - new Date(b[interviewDateIndex]))
            .slice(0, 7);

        const scheduleContainer = document.getElementById('interviewScheduleList');

        if (upcomingInterviews.length === 0) {
            scheduleContainer.innerHTML = '<div class="no-interviews">3일 이내 예정된 면접이 없습니다.</div>';
            return;
        }

        let tableHtml = `
            <table class="interview-schedule-table">
                <thead>
                    <tr>
                        <th>이름</th><th>지원루트</th><th>증원자</th><th>모집분야</th><th>면접자</th><th>면접날짜</th><th>면접시간</th>
                    </tr>
                </thead>
                <tbody>
        `;

        upcomingInterviews.forEach(row => {
            const interviewDate = row[interviewDateIndex];
            let dateDisplay = '';

            const formattedTime = this.formatInterviewTime(row[interviewTimeIndex]);

            try {
                const date = new Date(interviewDate);
                date.setHours(0, 0, 0, 0);
                const weekdays = ['일', '월', '화', '수', '목', '금', '토'];
                const weekday = weekdays[date.getDay()];

                const diffTime = date.getTime() - today.getTime();
                const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
                let dayDiff = `D-${diffDays}`;
                let ddayClass = '';
                if (diffDays === 0) { dayDiff = 'D-Day'; ddayClass = 'today'; }

                const dateText = `${date.getMonth() + 1}/${date.getDate()}(${weekday})`;
                dateDisplay = `<span class="interview-dday ${ddayClass}">${dayDiff}</span><span class="interview-date-text">${dateText}</span>`;
            } catch (e) { dateDisplay = '날짜 오류'; }

            tableHtml += `
                <tr onclick="App.data.showInterviewDetails('${row[nameIndex] || ''}', '${row[routeIndex] || ''}')" style="cursor: pointer;">
                    <td class="interview-name-cell" title="${row[nameIndex] || ''}">${row[nameIndex] || '-'}</td>
                    <td class="interview-route-cell" title="${row[routeIndex] || ''}">${row[routeIndex] || '-'}</td>
                    <td class="interview-recruiter-cell" title="${row[recruiterIndex] || ''}">${row[recruiterIndex] || '-'}</td>
                    <td class="interview-position-cell" title="${row[positionIndex] || ''}">${row[positionIndex] || '-'}</td>
                    <td class="interview-interviewer-cell" title="${row[interviewerIndex] || ''}">${row[interviewerIndex] || '-'}</td>
                    <td class="interview-date-cell" title="${dateDisplay.replace(/<[^>]*>/g, '')}">${dateDisplay}</td>
                    <td class="interview-time-cell" title="${formattedTime}">${formattedTime}</td>
                </tr>
            `;
        });

        tableHtml += `</tbody></table>`;
        scheduleContainer.innerHTML = tableHtml;

        this.eventBus.emit('interview:schedule:updated', upcomingInterviews);
    }

    /**
     * 면접 상세 정보 표시 - 기존 기능 보존
     */
    showInterviewDetails(name, route) {
        const headers = this.stateManager.state.data.headers;
        const allData = this.stateManager.state.data.all;
        
        const nameIndex = headers.indexOf('이름');
        const routeIndex = headers.indexOf('지원루트');

        const targetRow = allData.find(row => {
            const nameMatch = String(row[nameIndex] || '') === name;
            const routeMatch = String(row[routeIndex] || '') === route;
            return nameMatch && routeMatch;
        });

        if (targetRow) {
            this.eventBus.emit('modal:open:detail', targetRow);
        }
    }

    /**
     * 데이터 저장 - 기존 기능 보존 + 에러 처리 강화
     */
    async save(data, isUpdate = false, gubun = null) {
        try {
            this.eventBus.emit('data:save:start', { data, isUpdate, gubun });

            const action = isUpdate ? 'update' : 'create';
            const payload = isUpdate ? { action, gubun, data } : { action, data };

            const response = await this.fetchWithRetry(this.config.APPS_SCRIPT_URL, {
                method: 'POST',
                body: JSON.stringify(payload)
            });

            const result = await response.json();
            
            if (result.status !== 'success') {
                throw new Error(result.message || '저장에 실패했습니다.');
            }

            // 캐시 무효화
            this.cache.clear();

            this.eventBus.emit('data:save:success', { result, isUpdate });
            
            return result;

        } catch (error) {
            console.error('데이터 저장 실패:', error);
            this.eventBus.emit('data:save:error', { error, data, isUpdate, gubun });
            throw error;
        }
    }

    /**
     * 데이터 삭제 - 기존 기능 보존 + 에러 처리 강화
     */
    async delete(gubun) {
        try {
            this.eventBus.emit('data:delete:start', gubun);

            const response = await this.fetchWithRetry(this.config.APPS_SCRIPT_URL, {
                method: 'POST',
                body: JSON.stringify({
                    action: 'delete',
                    gubun: gubun
                })
            });

            const result = await response.json();
            
            if (result.status !== 'success') {
                throw new Error(result.message || '삭제에 실패했습니다.');
            }

            // 캐시 무효화
            this.cache.clear();

            this.eventBus.emit('data:delete:success', { result, gubun });
            
            return result;

        } catch (error) {
            console.error('데이터 삭제 실패:', error);
            this.eventBus.emit('data:delete:error', { error, gubun });
            throw error;
        }
    }

    /**
     * 유틸리티 메서드들 - 기존 기능 보존
     */
    formatInterviewTime(timeValue) {
        if (!timeValue || timeValue.trim() === '-') {
            return '-';
        }

        try {
            const date = new Date(timeValue);

            if (isNaN(date.getTime())) {
                return String(timeValue);
            }

            return date.toLocaleTimeString('ko-KR', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: false
            });

        } catch (e) {
            return String(timeValue);
        }
    }

    generateVisibleColumns(headers) {
        const visibleColumns = {};
        const defaultHiddenColumns = this.config.DEFAULT_HIDDEN_COLUMNS;
        
        headers.forEach(header => {
            visibleColumns[header] = !defaultHiddenColumns.includes(header);
        });
        
        this.stateManager.state.ui.visibleColumns = visibleColumns;
    }

    getErrorMessage(status) {
        if (status === 404) {
            return '데이터를 찾을 수 없습니다. 관리자에게 문의하세요.';
        } else if (status === 500) {
            return '서버에 일시적인 문제가 발생했습니다. 잠시 후 다시 시도해주세요.';
        } else if (status === 403) {
            return '데이터에 접근할 권한이 없습니다.';
        } else {
            return `서버 오류 (${status})`;
        }
    }

    showLoadingState(container) {
        container.innerHTML = `
            <div class="smooth-loading-container">
                <div class="advanced-loading-spinner"></div>
                <div class="loading-text">
                    데이터를 불러오는 중입니다
                    <div class="loading-dots">
                        <div class="loading-dot"></div>
                        <div class="loading-dot"></div>
                        <div class="loading-dot"></div>
                    </div>
                </div>
                <div class="loading-subtext">잠시만 기다려 주세요...</div>
                ${this.createProgressBar(25, '연결중...')}
            </div>`;
    }

    updateProgress(container, percentage, text) {
        setTimeout(() => {
            const progressFill = container.querySelector('.progress-fill');
            const progressPercentage = container.querySelector('.progress-percentage');
            const loadingSubtext = container.querySelector('.loading-subtext');

            if (progressFill && progressPercentage) {
                progressFill.style.width = percentage + '%';
                progressPercentage.textContent = percentage + '%';
            }

            if (loadingSubtext && text) {
                loadingSubtext.textContent = text;
            }
        }, 200);
    }

    showErrorState(container, error) {
        const isNetworkError = error.name === 'TypeError' && error.message.includes('fetch');
        const canRetry = isNetworkError || error.message.includes('서버에 일시적인');

        container.innerHTML = `
            <div class="error-container">
                <i class="fas fa-exclamation-triangle error-icon"></i>
                <h3 class="error-title">데이터 로드 실패</h3>
                <p class="error-message">
                    ${isNetworkError ? '🌐 인터넷 연결을 확인해주세요.' : error.message}
                </p>
                <div class="error-actions">
                    ${canRetry ? `
                        <button class="primary-btn" onclick="App.data.fetch()">
                            <i class="fas fa-sync-alt"></i> 다시 시도
                        </button>
                    ` : ''}
                    <button class="secondary-btn" onclick="location.reload()">
                        <i class="fas fa-redo"></i> 페이지 새로고침
                    </button>
                </div>
            </div>`;
    }

    createProgressBar(percentage = 0, text = '로딩 중...') {
        return `
            <div class="progress-container">
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${percentage}%"></div>
                </div>
                <div class="progress-text">
                    <span class="progress-percentage">${percentage}%</span> ${text}
                </div>
            </div>
        `;
    }

    /**
     * 캐시 관리
     */
    clearCache() {
        this.cache.clear();
        this.eventBus.emit('cache:cleared');
    }

    getCacheInfo() {
        return {
            size: this.cache.size,
            keys: Array.from(this.cache.keys())
        };
    }
}