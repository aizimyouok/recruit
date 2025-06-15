// js/core/StateManager.js

/**
 * 애플리케이션 상태 관리자
 * 모든 상태를 중앙에서 관리하고, 상태 변경 시 이벤트를 발생시켜 일관성을 유지합니다.
 */
export class StateManager {
    constructor(eventBus) {
        this.eventBus = eventBus;

        // Proxy를 사용하여 상태 변경을 자동으로 감지합니다.
        this._state = new Proxy({
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
        }, {
            set: (target, property, value) => {
                const oldState = { ...target };
                target[property] = value;
                // 상태가 변경되면 'state:changed' 이벤트를 발생시킵니다.
                this.eventBus.emit('state:changed', {
                    newState: target,
                    oldState
                });
                return true;
            }
        });
    }

    /**
     * 외부에서 상태 객체에 접근할 수 있는 getter를 제공합니다.
     */
    get state() {
        return this._state;
    }
}
