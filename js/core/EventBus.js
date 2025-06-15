// js/core/EventBus.js

/**
 * 애플리케이션 전역 이벤트 버스
 * 컴포넌트 간의 직접적인 의존성을 없애고, 이벤트 기반 통신을 가능하게 합니다.
 */
export class EventBus {
    constructor() {
        this.events = {};
    }

    /**
     * 이벤트 리스너 등록
     * @param {string} event - 이벤트 이름
     * @param {Function} callback - 실행할 콜백 함수
     */
    on(event, callback) {
        if (!this.events[event]) {
            this.events[event] = [];
        }
        this.events[event].push(callback);
    }

    /**
     * 이벤트 발생 (게시)
     * 등록된 모든 리스너들에게 데이터를 전달하며 콜백을 실행합니다.
     * @param {string} event - 이벤트 이름
     * @param {any} data - 전달할 데이터
     */
    emit(event, data) {
        if (this.events[event]) {
            this.events[event].forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    console.error(`Error in event handler for ${event}:`, error);
                }
            });
        }
    }

    /**
     * 이벤트 리스너 제거
     * @param {string} event - 이벤트 이름
     * @param {Function} callback - 제거할 콜백 함수
     */
    off(event, callback) {
        if (this.events[event]) {
            this.events[event] = this.events[event].filter(cb => cb !== callback);
        }
    }
}
