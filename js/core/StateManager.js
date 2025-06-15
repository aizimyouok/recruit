// js/core/StateManager.js

/**
 * 애플리케이션 상태 관리자
 * 기존 App.state와 동일한 인터페이스를 제공하면서 상태 변화 추적
 */
export class StateManager {
    constructor(eventBus) {
        this.eventBus = eventBus;
        this.debugMode = false;
        
        // 기존 App.state와 동일한 초기 상태
        this._state = {
            data: {
                all: [],
                filtered: [],
                headers: []
            },
            ui: {
                currentPage: 1,
                totalPages: 1,
                visibleColumns: {},
                nextSequenceNumber: 1,
                activeDetailRowId: null,
                currentSortColumn: '지원일',
                currentSortDirection: 'desc',
                activeDateMode: 'all',
                currentView: 'table',
                searchTerm: '',
                searchTimeout: null,
                currentEditingData: null
            },
            charts: {
                instances: {},
                currentEfficiencyTab: 'route',
                currentTrendTab: 'all'
            }
        };

        // 상태 변경 감지를 위한 변경 이력
        this.history = [];
        this.maxHistorySize = 50;

        // 프록시를 통해 상태 변경 감지
        this.state = this.createStateProxy(this._state);
    }

    /**
     * 상태 프록시 생성 - 모든 상태 변경을 감지
     * @param {Object} target - 프록시할 대상 객체
     * @param {string} path - 객체 경로 (예: 'data.all')
     * @returns {Proxy} - 프록시된 객체
     */
    createStateProxy(target, path = '') {
        const self = this;

        return new Proxy(target, {
            get(obj, prop) {
                const value = obj[prop];
                const currentPath = path ? `${path}.${prop}` : prop;

                // 객체나 배열이면 재귀적으로 프록시 적용
                if (value && typeof value === 'object' && !Array.isArray(value)) {
                    return self.createStateProxy(value, currentPath);
                }

                return value;
            },

            set(obj, prop, value) {
                const currentPath = path ? `${path}.${prop}` : prop;
                const oldValue = obj[prop];

                // 값이 실제로 변경된 경우에만 처리
                if (oldValue !== value) {
                    obj[prop] = value;

                    // 상태 변경 기록
                    self.recordStateChange(currentPath, oldValue, value);

                    // 이벤트 발생
                    self.emitStateChange(currentPath, oldValue, value);

                    if (self.debugMode) {
                        console.log(`[StateManager] 상태 변경: ${currentPath}`, {
                            from: oldValue,
                            to: value
                        });
                    }
                }

                return true;
            },

            deleteProperty(obj, prop) {
                const currentPath = path ? `${path}.${prop}` : prop;
                const oldValue = obj[prop];

                if (prop in obj) {
                    delete obj[prop];
                    
                    // 상태 변경 기록
                    self.recordStateChange(currentPath, oldValue, undefined);
                    
                    // 이벤트 발생
                    self.emitStateChange(currentPath, oldValue, undefined);

                    if (self.debugMode) {
                        console.log(`[StateManager] 속성 삭제: ${currentPath}`, oldValue);
                    }
                }

                return true;
            }
        });
    }

    /**
     * 상태 변경 기록
     * @param {string} path - 변경된 경로
     * @param {any} oldValue - 이전 값
     * @param {any} newValue - 새로운 값
     */
    recordStateChange(path, oldValue, newValue) {
        const change = {
            path,
            oldValue,
            newValue,
            timestamp: Date.now()
        };

        this.history.push(change);

        // 히스토리 크기 제한
        if (this.history.length > this.maxHistorySize) {
            this.history.shift();
        }
    }

    /**
     * 상태 변경 이벤트 발생
     * @param {string} path - 변경된 경로
     * @param {any} oldValue - 이전 값
     * @param {any} newValue - 새로운 값
     */
    emitStateChange(path, oldValue, newValue) {
        // 일반적인 상태 변경 이벤트
        this.eventBus.emit('state:changed', {
            path,
            oldValue,
            newValue,
            state: this.getState()
        });

        // 특정 경로별 이벤트
        this.eventBus.emit(`state:changed:${path}`, {
            oldValue,
            newValue,
            state: this.getState()
        });

        // 주요 상태 변경에 대한 특별 이벤트
        this.emitSpecialEvents(path, oldValue, newValue);
    }

    /**
     * 주요 상태 변경에 대한 특별 이벤트 발생
     * @param {string} path - 변경된 경로
     * @param {any} oldValue - 이전 값
     * @param {any} newValue - 새로운 값
     */
    emitSpecialEvents(path, oldValue, newValue) {
        // 데이터 변경
        if (path === 'data.all' || path === 'data.filtered') {
            this.eventBus.emit('data:updated', {
                type: path === 'data.all' ? 'all' : 'filtered',
                data: newValue
            });
        }

        // 페이지 변경
        if (path === 'ui.currentPage') {
            this.eventBus.emit('pagination:changed', {
                page: newValue,
                previousPage: oldValue
            });
        }

        // 필터 변경
        if (path.startsWith('ui.') && ['searchTerm', 'activeDateMode'].some(key => path.includes(key))) {
            this.eventBus.emit('filter:changed', {
                filterType: path.split('.')[1],
                value: newValue
            });
        }

        // 뷰 변경
        if (path === 'ui.currentView') {
            this.eventBus.emit('view:changed', {
                view: newValue,
                previousView: oldValue
            });
        }

        // 모달 관련
        if (path === 'ui.currentEditingData') {
            this.eventBus.emit('modal:editing', {
                data: newValue,
                isEditing: newValue !== null
            });
        }
    }

    /**
     * 전체 상태 반환 (읽기 전용)
     * @returns {Object} - 상태 객체의 깊은 복사본
     */
    getState() {
        return JSON.parse(JSON.stringify(this._state));
    }

    /**
     * 특정 경로의 상태 값 반환
     * @param {string} path - 상태 경로 (예: 'data.all', 'ui.currentPage')
     * @returns {any} - 상태 값
     */
    get(path) {
        return path.split('.').reduce((obj, key) => obj && obj[key], this._state);
    }

    /**
     * 특정 경로의 상태 값 설정
     * @param {string} path - 상태 경로
     * @param {any} value - 설정할 값
     */
    set(path, value) {
        const keys = path.split('.');
        const lastKey = keys.pop();
        const target = keys.reduce((obj, key) => {
            if (!obj[key]) obj[key] = {};
            return obj[key];
        }, this._state);

        target[lastKey] = value;
    }

    /**
     * 상태 일괄 업데이트 (기존 객체와 병합)
     * @param {Object} updates - 업데이트할 상태 객체
     */
    update(updates) {
        this.mergeDeep(this._state, updates);
    }

    /**
     * 깊은 병합 수행
     * @param {Object} target - 대상 객체
     * @param {Object} source - 소스 객체
     */
    mergeDeep(target, source) {
        Object.keys(source).forEach(key => {
            if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
                if (!target[key]) target[key] = {};
                this.mergeDeep(target[key], source[key]);
            } else {
                target[key] = source[key];
            }
        });
    }

    /**
     * 상태 초기화
     * @param {Object} newState - 새로운 상태 (선택사항)
     */
    reset(newState) {
        if (newState) {
            this._state = newState;
            this.state = this.createStateProxy(this._state);
        } else {
            // 기본 상태로 리셋
            Object.keys(this._state).forEach(key => {
                if (key === 'data') {
                    this._state[key] = { all: [], filtered: [], headers: [] };
                } else if (key === 'ui') {
                    this._state[key] = {
                        currentPage: 1,
                        totalPages: 1,
                        visibleColumns: {},
                        nextSequenceNumber: 1,
                        activeDetailRowId: null,
                        currentSortColumn: '지원일',
                        currentSortDirection: 'desc',
                        activeDateMode: 'all',
                        currentView: 'table',
                        searchTerm: '',
                        searchTimeout: null,
                        currentEditingData: null
                    };
                } else if (key === 'charts') {
                    this._state[key] = {
                        instances: {},
                        currentEfficiencyTab: 'route',
                        currentTrendTab: 'all'
                    };
                }
            });
        }

        this.history = [];
        this.eventBus.emit('state:reset', this.getState());
    }

    /**
     * 상태 변경 히스토리 반환
     * @param {number} limit - 반환할 히스토리 개수 (기본값: 전체)
     * @returns {Array} - 상태 변경 히스토리
     */
    getHistory(limit) {
        return limit ? this.history.slice(-limit) : [...this.history];
    }

    /**
     * 디버그 모드 토글
     * @param {boolean} enabled - 디버그 모드 활성화 여부
     */
    setDebugMode(enabled) {
        this.debugMode = enabled;
        console.log(`[StateManager] 디버그 모드: ${enabled ? '활성화' : '비활성화'}`);
    }

    /**
     * 상태 구독 (특정 경로 감시)
     * @param {string} path - 감시할 상태 경로
     * @param {Function} callback - 콜백 함수
     * @returns {Function} - 구독 해제 함수
     */
    subscribe(path, callback) {
        return this.eventBus.on(`state:changed:${path}`, callback);
    }

    /**
     * 전체 상태 변경 구독
     * @param {Function} callback - 콜백 함수
     * @returns {Function} - 구독 해제 함수
     */
    subscribeAll(callback) {
        return this.eventBus.on('state:changed', callback);
    }

    /**
     * 상태 관리자 정보 반환 (디버깅용)
     * @returns {Object} - 상태 관리자 정보
     */
    getStatus() {
        return {
            stateSize: JSON.stringify(this._state).length,
            historySize: this.history.length,
            lastChange: this.history[this.history.length - 1] || null,
            debugMode: this.debugMode
        };
    }
}
