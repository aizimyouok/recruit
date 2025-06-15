// js/core/EventBus.js

/**
 * 애플리케이션 전역 이벤트 버스
 * 컴포넌트 간 통신을 담당
 */
export class EventBus {
    constructor() {
        this.events = new Map();
        this.debugMode = false; // 개발시에만 true로 설정
    }

    /**
     * 이벤트 리스너 등록
     * @param {string} event - 이벤트 이름
     * @param {Function} callback - 콜백 함수
     * @param {Object} options - 옵션 (once: 한번만 실행)
     * @returns {Function} - 구독 해제 함수
     */
    on(event, callback, options = {}) {
        if (!this.events.has(event)) {
            this.events.set(event, []);
        }

        const listener = {
            callback,
            once: options.once || false,
            id: Date.now() + Math.random()
        };

        this.events.get(event).push(listener);

        if (this.debugMode) {
            console.log(`[EventBus] 이벤트 등록: ${event}`, listener.id);
        }

        // 구독 해제 함수 반환
        return () => this.off(event, listener.id);
    }

    /**
     * 한번만 실행되는 이벤트 리스너 등록
     * @param {string} event - 이벤트 이름  
     * @param {Function} callback - 콜백 함수
     * @returns {Function} - 구독 해제 함수
     */
    once(event, callback) {
        return this.on(event, callback, { once: true });
    }

    /**
     * 이벤트 리스너 제거
     * @param {string} event - 이벤트 이름
     * @param {string|Function} callbackOrId - 콜백 함수 또는 리스너 ID
     */
    off(event, callbackOrId) {
        if (!this.events.has(event)) return;

        const listeners = this.events.get(event);
        
        if (typeof callbackOrId === 'string') {
            // ID로 제거
            const index = listeners.findIndex(listener => listener.id === callbackOrId);
            if (index !== -1) {
                listeners.splice(index, 1);
                if (this.debugMode) {
                    console.log(`[EventBus] 이벤트 제거: ${event}`, callbackOrId);
                }
            }
        } else if (typeof callbackOrId === 'function') {
            // 콜백 함수로 제거
            const index = listeners.findIndex(listener => listener.callback === callbackOrId);
            if (index !== -1) {
                listeners.splice(index, 1);
                if (this.debugMode) {
                    console.log(`[EventBus] 이벤트 제거: ${event}`);
                }
            }
        }

        // 리스너가 없으면 이벤트 자체를 제거
        if (listeners.length === 0) {
            this.events.delete(event);
        }
    }

    /**
     * 이벤트 발생
     * @param {string} event - 이벤트 이름
     * @param {any} data - 전달할 데이터
     */
    emit(event, data) {
        if (!this.events.has(event)) {
            if (this.debugMode) {
                console.log(`[EventBus] 리스너가 없는 이벤트: ${event}`);
            }
            return;
        }

        const listeners = [...this.events.get(event)]; // 복사본 생성

        if (this.debugMode) {
            console.log(`[EventBus] 이벤트 발생: ${event}`, data, `(${listeners.length}개 리스너)`);
        }

        listeners.forEach(listener => {
            try {
                listener.callback(data, event);

                // once 옵션이 true면 실행 후 제거
                if (listener.once) {
                    this.off(event, listener.id);
                }
            } catch (error) {
                console.error(`[EventBus] 이벤트 ${event} 처리 중 오류:`, error);
                // 에러가 발생해도 다른 리스너들은 계속 실행
            }
        });
    }

    /**
     * 특정 이벤트의 모든 리스너 제거
     * @param {string} event - 이벤트 이름
     */
    removeAllListeners(event) {
        if (event) {
            this.events.delete(event);
            if (this.debugMode) {
                console.log(`[EventBus] 모든 리스너 제거: ${event}`);
            }
        } else {
            this.events.clear();
            if (this.debugMode) {
                console.log(`[EventBus] 모든 이벤트 리스너 제거`);
            }
        }
    }

    /**
     * 등록된 이벤트 목록 반환
     * @returns {Array} - 이벤트 이름 배열
     */
    getEventNames() {
        return Array.from(this.events.keys());
    }

    /**
     * 특정 이벤트의 리스너 개수 반환
     * @param {string} event - 이벤트 이름
     * @returns {number} - 리스너 개수
     */
    getListenerCount(event) {
        return this.events.has(event) ? this.events.get(event).length : 0;
    }

    /**
     * 디버그 모드 토글
     * @param {boolean} enabled - 디버그 모드 활성화 여부
     */
    setDebugMode(enabled) {
        this.debugMode = enabled;
        console.log(`[EventBus] 디버그 모드: ${enabled ? '활성화' : '비활성화'}`);
    }

    /**
     * 이벤트 버스 상태 정보 출력 (디버깅용)
     */
    getStatus() {
        const status = {
            totalEvents: this.events.size,
            events: {}
        };

        this.events.forEach((listeners, eventName) => {
            status.events[eventName] = listeners.length;
        });

        return status;
    }

    /**
     * Promise 기반 이벤트 대기
     * @param {string} event - 대기할 이벤트 이름
     * @param {number} timeout - 타임아웃 (ms)
     * @returns {Promise} - 이벤트 데이터를 resolve하는 Promise
     */
    waitFor(event, timeout = 0) {
        return new Promise((resolve, reject) => {
            let timeoutId;

            const unsubscribe = this.once(event, (data) => {
                if (timeoutId) clearTimeout(timeoutId);
                resolve(data);
            });

            if (timeout > 0) {
                timeoutId = setTimeout(() => {
                    unsubscribe();
                    reject(new Error(`이벤트 ${event} 대기 시간 초과 (${timeout}ms)`));
                }, timeout);
            }
        });
    }
}
