// =========================
// smartSync.js - 스마트 준실시간 동기화 시스템
// =========================

export const SmartSyncModule = {
    // 설정
    POLL_INTERVAL: 30000,        // 30초마다 확인
    FAST_POLL_INTERVAL: 5000,    // 수정 후 5초마다 (1분간)
    
    // 상태
    isPolling: false,
    isFastMode: false,
    currentHash: null,
    fastModeTimer: null,
    pollTimer: null,
    
    // 초기화
    init(appInstance) {
        this.appInstance = appInstance;
        this.HASH_CHECK_URL = appInstance.config.APPS_SCRIPT_URL + '?action=hash';
        
        // 5초 후 시작 (앱 로딩 완료 후)
        setTimeout(() => {
            this.startPolling();
            this.setupUserActivityDetection();
        }, 5000);
        
        console.log('🔄 스마트 동기화 시스템 초기화 완료');
    },
    
    // 주기적 확인 시작
    startPolling() {
        if (this.isPolling) return;
        
        this.isPolling = true;
        this.scheduleNextPoll();
        console.log('🔄 스마트 동기화 시작 (30초 간격)');
    },
    
    // 다음 확인 스케줄링
    scheduleNextPoll() {
        if (!this.isPolling) return;
        
        if (this.pollTimer) {
            clearTimeout(this.pollTimer);
        }
        
        const interval = this.isFastMode ? this.FAST_POLL_INTERVAL : this.POLL_INTERVAL;
        
        this.pollTimer = setTimeout(async () => {
            await this.checkForChanges();
            this.scheduleNextPoll();
        }, interval);
    },
    
    // 변경사항 확인
    async checkForChanges() {
        try {
            const serverHash = await this.getServerDataHash();
            
            if (serverHash && this.currentHash && this.currentHash !== serverHash) {
                console.log('🔄 서버 데이터 변경 감지!');
                await this.handleDataChange();
            }
            
            if (serverHash) {
                this.currentHash = serverHash;
            }
            
        } catch (error) {
            console.warn('⚠️ 동기화 확인 실패:', error);
        }
    },
    
    // 서버 데이터 해시 가져오기
    async getServerDataHash() {
        try {
            const response = await fetch(this.HASH_CHECK_URL, {
                method: 'GET',
                cache: 'no-cache'
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }
            
            const result = await response.json();
            
            if (result.status === 'success') {
                return result.hash;
            } else {
                console.warn('해시 API 응답 오류:', result);
                return null;
            }
        } catch (error) {
            console.warn('해시 확인 실패:', error);
            return null;
        }
    },
    
    // 데이터 변경 처리
    async handleDataChange() {
        // 현재 편집 중인지 확인
        if (this.isCurrentlyEditing()) {
            this.showEditConflictWarning();
            return;
        }
        
        // 사용자에게 선택권 제공
        this.showUpdateNotification();
    },
    
    // 현재 편집 중인지 확인
    isCurrentlyEditing() {
        // 모달이 열려있는지 확인
        const modal = document.getElementById('applicantModal');
        const isModalOpen = modal && modal.style.display !== 'none' && modal.style.display !== '';
        
        // 입력 필드에 포커스가 있는지 확인
        const activeElement = document.activeElement;
        const isInputFocused = activeElement && 
            (activeElement.tagName === 'INPUT' || 
             activeElement.tagName === 'TEXTAREA' || 
             activeElement.tagName === 'SELECT');
        
        return isModalOpen || isInputFocused;
    },
    
    // 자동 업데이트 수행
    async performAutoUpdate() {
        try {
            console.log('🔄 자동 데이터 갱신 시작...');
            
            // 기존 알림 제거
            this.removeExistingNotifications();
            
            // 로딩 알림 표시
            this.showLoadingNotification();
            
            // 기존 캐시 무효화
            if (this.appInstance.dataCache) {
                this.appInstance.dataCache.clearCache();
            }
            if (this.appInstance.cache) {
                this.appInstance.cache.invalidate();
            }
            
            // 새 데이터 로드
            await this.appInstance.data.fetch();
            
            // 로딩 알림 제거 후 성공 알림
            this.removeExistingNotifications();
            this.showSuccessNotification();
            
            console.log('✅ 자동 갱신 완료');
            
        } catch (error) {
            console.error('❌ 자동 갱신 실패:', error);
            this.removeExistingNotifications();
            this.showErrorNotification();
        }
    },
    
    // 사용자 활동 감지 설정
    setupUserActivityDetection() {
        // 데이터 저장/수정 후 빠른 모드 활성화
        const originalSave = this.appInstance.data.save;
        this.appInstance.data.save = async (...args) => {
            const result = await originalSave.apply(this.appInstance.data, args);
            this.activateFastMode();
            return result;
        };
        
        const originalDelete = this.appInstance.data.delete;
        this.appInstance.data.delete = async (...args) => {
            const result = await originalDelete.apply(this.appInstance.data, args);
            this.activateFastMode();
            return result;
        };
    },
    
    // 빠른 모드 활성화 (수정 후 1분간 5초마다 확인)
    activateFastMode() {
        if (this.isFastMode) return; // 이미 활성화된 경우
        
        this.isFastMode = true;
        console.log('⚡ 빠른 동기화 모드 활성화 (1분간)');
        
        if (this.fastModeTimer) {
            clearTimeout(this.fastModeTimer);
        }
        
        this.fastModeTimer = setTimeout(() => {
            this.isFastMode = false;
            console.log('🔄 일반 동기화 모드로 복귀');
        }, 60000); // 1분
    },
    
    // 기존 알림 제거
    removeExistingNotifications() {
        const notifications = document.querySelectorAll('.smart-sync-notification');
        notifications.forEach(notification => notification.remove());
    },
    
    // 로딩 알림
    showLoadingNotification() {
        this.showNotification(
            '🔄 데이터 갱신 중...',
            '최신 데이터를 가져오고 있습니다.',
            '#818cf8',
            []
        );
    },
    
    // 업데이트 알림 표시
    showUpdateNotification() {
        this.showNotification(
            '🔄 새로운 데이터가 있습니다',
            '다른 사용자가 데이터를 업데이트했습니다.',
            '#818cf8',
            [
                {
                    text: '지금 갱신',
                    action: 'performAutoUpdate'
                },
                {
                    text: '나중에',
                    action: 'removeExistingNotifications'
                }
            ]
        );
    },
    
    // 편집 충돌 경고 표시
    showEditConflictWarning() {
        this.showNotification(
            '⚠️ 편집 중 데이터 변경됨',
            '현재 편집 중인 데이터가 다른 사용자에 의해 변경되었습니다. 저장 전에 확인하세요.',
            '#f59e0b',
            [
                {
                    text: '확인',
                    action: 'removeExistingNotifications'
                }
            ]
        );
    },
    
    // 성공 알림
    showSuccessNotification() {
        this.showNotification(
            '✅ 갱신 완료',
            '최신 데이터로 업데이트되었습니다.',
            '#10b981',
            []
        );
    },
    
    // 오류 알림
    showErrorNotification() {
        this.showNotification(
            '❌ 갱신 실패',
            '데이터 갱신 중 오류가 발생했습니다.',
            '#ef4444',
            [
                {
                    text: '다시 시도',
                    action: 'performAutoUpdate'
                }
            ]
        );
    },
    
    // 범용 알림 시스템
    showNotification(title, message, color, actions = []) {
        // 기존 알림이 있으면 제거
        this.removeExistingNotifications();
        
        const notification = document.createElement('div');
        notification.className = 'smart-sync-notification';
        
        let actionsHtml = '';
        if (actions.length > 0) {
            actionsHtml = '<div class="notification-actions">' +
                actions.map((action, index) => 
                    `<button class="notification-btn" data-action="${action.action}">${action.text}</button>`
                ).join('') +
                '</div>';
        }
        
        notification.innerHTML = `
            <div class="notification-header">
                <strong>${title}</strong>
                <button class="notification-close">×</button>
            </div>
            <div class="notification-body">${message}</div>
            ${actionsHtml}
        `;
        
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: white;
            border-left: 4px solid ${color};
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            padding: 16px;
            max-width: 350px;
            z-index: 5000;
            animation: slideInRight 0.3s ease;
            font-family: inherit;
        `;
        
        // 이벤트 리스너 추가
        notification.querySelector('.notification-close').addEventListener('click', () => {
            notification.remove();
        });
        
        // 액션 버튼 이벤트 리스너
        notification.querySelectorAll('.notification-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const actionName = btn.getAttribute('data-action');
                if (this[actionName]) {
                    this[actionName]();
                }
            });
        });
        
        // CSS 애니메이션 추가 (한 번만)
        this.addNotificationStyles();
        
        document.body.appendChild(notification);
        
        // 자동 제거 (액션이 없는 경우)
        if (actions.length === 0) {
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove();
                }
            }, 3000);
        }
    },
    
    // 알림 스타일 추가
    addNotificationStyles() {
        if (document.head.querySelector('#smart-sync-styles')) return;
        
        const style = document.createElement('style');
        style.id = 'smart-sync-styles';
        style.textContent = `
            @keyframes slideInRight {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            .smart-sync-notification .notification-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 8px;
            }
            .smart-sync-notification .notification-close {
                background: none;
                border: none;
                font-size: 18px;
                cursor: pointer;
                color: #999;
                padding: 0;
                margin: 0;
            }
            .smart-sync-notification .notification-close:hover {
                color: #333;
            }
            .smart-sync-notification .notification-body {
                color: #666;
                margin-bottom: 12px;
                line-height: 1.4;
                font-size: 0.9rem;
            }
            .smart-sync-notification .notification-actions {
                display: flex;
                gap: 8px;
                justify-content: flex-end;
            }
            .smart-sync-notification .notification-btn {
                padding: 6px 12px;
                border: none;
                border-radius: 4px;
                cursor: pointer;
                font-size: 0.85rem;
                transition: all 0.2s ease;
                font-weight: 500;
            }
            .smart-sync-notification .notification-btn:first-child {
                background: #818cf8;
                color: white;
            }
            .smart-sync-notification .notification-btn:last-child {
                background: #f5f5f5;
                color: #666;
            }
            .smart-sync-notification .notification-btn:hover {
                transform: translateY(-1px);
                box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            }
        `;
        document.head.appendChild(style);
    },
    
    // 수동 새로고침
    async forceRefresh() {
        console.log('🔄 수동 새로고침 시작...');
        await this.performAutoUpdate();
    },
    
    // 동기화 중지
    stop() {
        this.isPolling = false;
        if (this.pollTimer) {
            clearTimeout(this.pollTimer);
        }
        if (this.fastModeTimer) {
            clearTimeout(this.fastModeTimer);
        }
        this.removeExistingNotifications();
        console.log('⏹️ 동기화 시스템 중지');
    },
    
    // 상태 정보 (개발자 도구에서 사용)
    getStatus() {
        return {
            isPolling: this.isPolling,
            isFastMode: this.isFastMode,
            currentHash: this.currentHash,
            pollInterval: this.isFastMode ? this.FAST_POLL_INTERVAL : this.POLL_INTERVAL,
            nextPollIn: this.pollTimer ? 'scheduled' : 'none'
        };
    }
};