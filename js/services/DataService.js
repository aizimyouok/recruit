// js/services/DataService.js

/**
 * 데이터 서비스
 * Google Apps Script와의 모든 비동기 통신을 담당합니다.
 */
export class DataService {
    constructor(eventBus, stateManager, config) {
        this.eventBus = eventBus;
        this.state = stateManager.state;
        this.config = config;
    }

    /**
     * 서버에서 모든 지원자 데이터를 가져옵니다.
     */
    async fetch() {
        this.eventBus.emit('data:fetch:start');
        try {
            const response = await fetch(`${this.config.APPS_SCRIPT_URL}?action=read`);
            if (!response.ok) {
                throw new Error(`Server error: ${response.status}`);
            }
            const result = await response.json();
            if (result.status !== 'success' || !result.data) {
                throw new Error(result.message || 'Invalid data format');
            }

            // 데이터 처리
            this.state.data.headers = (result.data[0] || []).map(h => String(h || '').trim());
            this.state.data.all = result.data.slice(1)
                .filter(row => row && Array.isArray(row) && row.some(cell => cell != null && String(cell).trim() !== ''))
                .map(row => row.map(cell => cell == null ? '' : String(cell)));
            
            this.eventBus.emit('data:fetch:success', this.state.data);

        } catch (error) {
            console.error("Data fetch failed:", error);
            this.eventBus.emit('data:fetch:error', error);
        }
    }

    /**
     * 신규 지원자 또는 수정된 지원자 정보를 서버에 저장합니다.
     * @param {object} data - 저장할 데이터
     * @param {boolean} isUpdate - 수정 모드 여부
     * @param {string|null} gubun - 수정 시 필요한 고유 식별자
     */
    async save(data, isUpdate = false, gubun = null) {
        const action = isUpdate ? 'update' : 'create';
        const payload = { action, data };
        if (isUpdate) {
            payload.gubun = gubun;
        }

        try {
            const response = await fetch(this.config.APPS_SCRIPT_URL, {
                method: 'POST',
                body: JSON.stringify(payload)
            });
            const result = await response.json();
            if (result.status !== 'success') {
                throw new Error(result.message || 'Save failed');
            }
            this.eventBus.emit('data:save:success', { isUpdate });
            return result;
        } catch (error) {
            console.error("Data save failed:", error);
            this.eventBus.emit('data:save:error', error);
            throw error;
        }
    }

    /**
     * 특정 지원자 정보를 서버에서 삭제합니다.
     * @param {string} gubun - 삭제할 지원자의 고유 식별자
     */
    async delete(gubun) {
        try {
            const response = await fetch(this.config.APPS_SCRIPT_URL, {
                method: 'POST',
                body: JSON.stringify({ action: 'delete', gubun })
            });
            const result = await response.json();
            if (result.status !== 'success') {
                throw new Error(result.message || 'Delete failed');
            }
            this.eventBus.emit('data:delete:success');
            return result;
        } catch (error) {
            console.error("Data delete failed:", error);
            this.eventBus.emit('data:delete:error', error);
            throw error;
        }
    }
}
