// =========================
// dataCache.js - 전체 데이터 캐싱 모듈
// =========================

const DataCacheModule = {
    CACHE_KEY: 'hiring_data_cache_v2',
    CACHE_DURATION: 15 * 60 * 1000, // 15분
    
    // 캐시된 데이터 확인
    getCachedData() {
        try {
            const cached = localStorage.getItem(this.CACHE_KEY);
            if (cached) {
                const data = JSON.parse(cached);
                const isExpired = Date.now() - data.timestamp > this.CACHE_DURATION;
                
                if (!isExpired) {
                    console.log('💾 캐시된 전체 데이터 발견 - 즉시 로딩!');
                    return data.payload;
                } else {
                    console.log('⏰ 전체 데이터 캐시 만료됨 - 새로 로딩');
                    localStorage.removeItem(this.CACHE_KEY);
                }
            }
        } catch (error) {
            console.warn('⚠️ 전체 데이터 캐시 읽기 실패:', error);
            localStorage.removeItem(this.CACHE_KEY);
        }
        return null;
    },
    
    // 데이터 캐시에 저장
    setCachedData(headers, allData) {
        try {
            const cacheData = {
                payload: { 
                    headers: headers,
                    allData: allData 
                },
                timestamp: Date.now(),
                version: '2.0',
                itemCount: allData.length
            };
            
            localStorage.setItem(this.CACHE_KEY, JSON.stringify(cacheData));
            console.log('✅ 전체 데이터 캐시 저장 완료 -', allData.length, '개 항목');
            
            // 캐시 알림 표시
            this.showCacheNotification('저장');
            
        } catch (error) {
            console.warn('⚠️ 전체 데이터 캐시 저장 실패 (저장공간 부족):', error);
            // 용량 부족 시 기존 캐시 삭제 후 재시도
            this.clearOldCaches();
            try {
                localStorage.setItem(this.CACHE_KEY, JSON.stringify(cacheData));
                console.log('✅ 캐시 재시도 성공');
            } catch (retryError) {
                console.error('❌ 전체 데이터 캐시 저장 재시도 실패:', retryError);
            }
        }
    },
    
    // 캐시에서 빠른 로딩 수행
    async loadFromCache(appInstance) {
        const cachedData = this.getCachedData();
        if (!cachedData) return false;
        
        console.log('⚡ 캐시에서 즉시 로딩 시작...');
        const startTime = Date.now();
        
        // 상태 업데이트
        appInstance.state.data.headers = cachedData.headers;
        appInstance.state.data.all = cachedData.allData;
        
        // 기존 초기화 로직 실행 (data.js의 로직과 동일)
        appInstance.data.updateSequenceNumber();
        appInstance.state.ui.visibleColumns = appInstance.utils.generateVisibleColumns(cachedData.headers);
        
        if (appInstance.filter && appInstance.filter.populateDropdowns) {
            appInstance.filter.populateDropdowns();
        }
        
        if (appInstance.sidebar && appInstance.sidebar.updateWidgets) {
            appInstance.sidebar.updateWidgets();
        }
        
        appInstance.data.updateInterviewSchedule();
        
        if (appInstance.filter && appInstance.filter.reset) {
            appInstance.filter.reset(true);
        }
        
        // DOM 준비 후 컬럼 토글 설정
        setTimeout(() => {
            if (appInstance.ui && appInstance.ui.setupColumnToggles) {
                appInstance.ui.setupColumnToggles();
            }
            
            if (appInstance.render && appInstance.state.data.all.length > 0) {
                appInstance.render.currentView();
            }
        }, 50);
        
        const loadTime = Date.now() - startTime;
        console.log(`⚡ 캐시 로딩 완료: ${loadTime}ms`);
        
        // 캐시 알림 표시
        this.showCacheNotification('로딩', loadTime);
        
        return true;
    },
    
    // 서버에서 로딩 후 캐시에 저장
    saveToCache(headers, allData) {
        this.setCachedData(headers, allData);
    },
    
    // 캐시 삭제
    clearCache() {
        localStorage.removeItem(this.CACHE_KEY);
        console.log('🗑️ 전체 데이터 캐시 삭제됨');
    },
    
    // 오래된 캐시들 정리
    clearOldCaches() {
        const keys = Object.keys(localStorage);
        const oldCacheKeys = keys.filter(key => 
            key.includes('hiring') && key !== this.CACHE_KEY
        );
        
        oldCacheKeys.forEach(key => {
            localStorage.removeItem(key);
        });
        
        console.log('🧹 오래된 전체 데이터 캐시 정리 완료:', oldCacheKeys.length, '개 삭제');
    },
    
    // 캐시 알림 표시
    showCacheNotification(type, loadTime = null) {
        const notification = document.createElement('div');
        
        let message = '';
        let color = '';
        
        if (type === '저장') {
            message = '💾 데이터가 캐시에 저장되었습니다';
            color = '#10b981'; // 초록색
        } else if (type === '로딩') {
            message = `⚡ 캐시에서 빠르게 로딩됨! (${loadTime}ms)`;
            color = '#818cf8'; // 보라색
        }
        
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(135deg, ${color}, ${color}dd);
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
            z-index: 3000;
            font-weight: 600;
            font-size: 0.9rem;
            transform: translateX(300px);
            opacity: 0;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            border-left: 4px solid rgba(255, 255, 255, 0.8);
        `;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        // 슬라이드 인 애니메이션
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
            notification.style.opacity = '1';
        }, 10);
        
        // 3초 후 슬라이드 아웃
        setTimeout(() => {
            notification.style.transform = 'translateX(300px)';
            notification.style.opacity = '0';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    },
    
    // 캐시 상태 정보
    getCacheInfo() {
        const cached = this.getCachedData();
        if (cached) {
            const cacheString = localStorage.getItem(this.CACHE_KEY);
            const parsedCache = JSON.parse(cacheString);
            const size = new Blob([cacheString]).size;
            const ageMs = Date.now() - parsedCache.timestamp;
            const remainingMs = Math.max(0, this.CACHE_DURATION - ageMs);
            
            return {
                exists: true,
                itemCount: cached.allData.length,
                sizeKB: Math.round(size / 1024),
                ageMinutes: Math.round(ageMs / 60000),
                remainingMinutes: Math.round(remainingMs / 60000),
                lastUpdate: new Date(parsedCache.timestamp).toLocaleString()
            };
        }
        return { 
            exists: false,
            itemCount: 0,
            sizeKB: 0,
            ageMinutes: 0,
            remainingMinutes: 0,
            lastUpdate: 'Never'
        };
    },
    
    // 강제 새로고침 (개발자 도구에서 사용 가능)
    forceRefresh() {
        this.clearCache();
        window.location.reload();
    }
};
