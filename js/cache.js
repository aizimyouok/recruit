// =========================
// cache.js - 데이터 캐싱 모듈
// =========================

const CacheModule = {
    // 메모리 캐시 (페이지 새로고침 시 초기화)
    memoryCache: new Map(),
    
    // 캐시 설정
    CACHE_PREFIX: 'hiring_dashboard_',
    CACHE_EXPIRY: 5 * 60 * 1000, // 5분
    MAX_MEMORY_CACHE: 50, // 메모리 캐시 최대 개수
    
    // 캐시 키 생성
    generateKey(type, filters = {}) {
        const keyData = {
            type,
            filters: JSON.stringify(filters),
            timestamp: Math.floor(Date.now() / this.CACHE_EXPIRY) // 5분 단위로 만료
        };
        return JSON.stringify(keyData);
    },
    
    // 메모리에서 캐시 가져오기
    getFromMemory(key) {
        const cached = this.memoryCache.get(key);
        if (cached && Date.now() - cached.timestamp < this.CACHE_EXPIRY) {
            return cached.data;
        }
        if (cached) {
            this.memoryCache.delete(key); // 만료된 캐시 제거
        }
        return null;
    },
    
    // 메모리에 캐시 저장
    setToMemory(key, data) {
        this.memoryCache.set(key, {
            data,
            timestamp: Date.now()
        });
        
        // 메모리 캐시 크기 제한
        if (this.memoryCache.size > this.MAX_MEMORY_CACHE) {
            const firstKey = this.memoryCache.keys().next().value;
            this.memoryCache.delete(firstKey);
        }
    },
    
    // 로컬 스토리지에서 캐시 가져오기
    getFromStorage(key) {
        try {
            const cached = localStorage.getItem(this.CACHE_PREFIX + key);
            if (cached) {
                const parsed = JSON.parse(cached);
                if (Date.now() - parsed.timestamp < this.CACHE_EXPIRY) {
                    return parsed.data;
                } else {
                    // 만료된 캐시 제거
                    localStorage.removeItem(this.CACHE_PREFIX + key);
                }
            }
        } catch (error) {
            console.warn('⚠️ 캐시 읽기 실패:', error);
        }
        return null;
    },
    
    // 로컬 스토리지에 캐시 저장
    setToStorage(key, data) {
        try {
            const cacheData = {
                data,
                timestamp: Date.now()
            };
            localStorage.setItem(this.CACHE_PREFIX + key, JSON.stringify(cacheData));
        } catch (error) {
            console.warn('⚠️ 캐시 저장 실패 (용량 부족일 수 있음):', error);
            // 용량 부족 시 오래된 캐시 일부 삭제
            this.clearOldCache();
        }
    },
    
    // 통합 캐시 조회
    get(type, filters = {}) {
        const key = this.generateKey(type, filters);
        
        // 1. 메모리 캐시 먼저 확인 (가장 빠름)
        let cached = this.getFromMemory(key);
        if (cached) {
            console.log('💨 메모리 캐시 적중:', type);
            return cached;
        }
        
        // 2. 로컬 스토리지 캐시 확인
        cached = this.getFromStorage(key);
        if (cached) {
            console.log('💾 스토리지 캐시 적중:', type);
            // 메모리에도 저장해서 다음번엔 더 빠르게
            this.setToMemory(key, cached);
            return cached;
        }
        
        return null;
    },
    
    // 통합 캐시 저장
    set(type, filters = {}, data) {
        const key = this.generateKey(type, filters);
        
        // 메모리와 스토리지 둘 다 저장
        this.setToMemory(key, data);
        this.setToStorage(key, data);
        
        console.log('✅ 캐시 저장:', type);
    },
    
    // 캐시 무효화 (데이터 변경 시)
    invalidate(pattern = null) {
        if (pattern) {
            // 특정 패턴의 캐시만 제거
            const keysToDelete = [];
            for (const key of this.memoryCache.keys()) {
                if (key.includes(pattern)) {
                    keysToDelete.push(key);
                }
            }
            keysToDelete.forEach(key => this.memoryCache.delete(key));
            
            // 로컬 스토리지에서도 제거
            const keys = Object.keys(localStorage);
            keys.forEach(key => {
                if (key.startsWith(this.CACHE_PREFIX) && key.includes(pattern)) {
                    localStorage.removeItem(key);
                }
            });
        } else {
            // 모든 캐시 제거
            this.memoryCache.clear();
            this.clearAllCache();
        }
        console.log('🗑️ 캐시 무효화됨:', pattern || '전체');
    },
    
    // 오래된 캐시 정리
    clearOldCache() {
        const keys = Object.keys(localStorage);
        const cacheKeys = keys.filter(key => key.startsWith(this.CACHE_PREFIX));
        
        // 날짜순으로 정렬해서 오래된 것부터 삭제
        const keysByDate = cacheKeys.map(key => {
            try {
                const data = JSON.parse(localStorage.getItem(key));
                return { key, timestamp: data.timestamp };
            } catch {
                return { key, timestamp: 0 };
            }
        }).sort((a, b) => a.timestamp - b.timestamp);
        
        // 오래된 캐시 20% 삭제
        const deleteCount = Math.ceil(keysByDate.length * 0.2);
        for (let i = 0; i < deleteCount; i++) {
            localStorage.removeItem(keysByDate[i].key);
        }
        
        console.log('🧹 오래된 캐시 정리 완료:', deleteCount, '개 삭제');
    },
    
    // 모든 캐시 삭제
    clearAllCache() {
        const keys = Object.keys(localStorage);
        keys.forEach(key => {
            if (key.startsWith(this.CACHE_PREFIX)) {
                localStorage.removeItem(key);
            }
        });
    },
    
    // 캐시 상태 정보
    getStatus() {
        const memorySize = this.memoryCache.size;
        const storageKeys = Object.keys(localStorage).filter(key => 
            key.startsWith(this.CACHE_PREFIX)
        );
        
        return {
            memoryCache: memorySize,
            storageCache: storageKeys.length,
            memoryUsage: `${memorySize}/${this.MAX_MEMORY_CACHE}`,
            lastCleared: localStorage.getItem(this.CACHE_PREFIX + 'last_cleared') || 'Never'
        };
    }
};
