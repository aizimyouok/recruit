// =========================
// 애플리케이션 메인 객체
// =========================

const App = {
    // =========================
    // 설정 및 상수 (config.js에서 가져옴)
    // =========================
    config: CONFIG,

    // =========================
    // 🔥 새로운 인구통계 분석 모듈
    // =========================
    demographics: {
        currentTab: 'region',
        
        // 🔥 기존 지도 데이터는 보관 (필요시 복원 가능)
        koreanRegions: {
            '서울': { x: 160, y: 180, name: '서울특별시' },
            '경기': { x: 140, y: 160, name: '경기도' },
            '인천': { x: 120, y: 170, name: '인천광역시' },
            '부산': { x: 280, y: 320, name: '부산광역시' },
            '대구': { x: 250, y: 250, name: '대구광역시' },
            '대전': { x: 180, y: 220, name: '대전광역시' },
            '광주': { x: 140, y: 280, name: '광주광역시' },
            '울산': { x: 290, y: 290, name: '울산광역시' },
            '세종': { x: 170, y: 200, name: '세종특별자치시' },
            '강원': { x: 220, y: 120, name: '강원특별자치도' },
            '충북': { x: 200, y: 180, name: '충청북도' },
            '충남': { x: 160, y: 200, name: '충청남도' },
            '전북': { x: 160, y: 250, name: '전라북도' },
            '전남': { x: 160, y: 300, name: '전라남도' },
            '경북': { x: 240, y: 200, name: '경상북도' },
            '경남': { x: 240, y: 280, name: '경상남도' },
            '제주': { x: 120, y: 380, name: '제주특별자치도' }
        },

        switchTab(tab) {
            App.demographics.currentTab = tab;
            
            document.querySelectorAll('.demographics-tab-btn').forEach(btn => {
                btn.classList.toggle('active', btn.dataset.tab === tab);
            });
            
            document.querySelectorAll('.demographics-tab-content').forEach(content => {
                content.classList.toggle('active', content.id === tab + 'Tab');
            });
            
            setTimeout(() => {
                App.demographics.updateCurrentTab();
            }, 100);
        },

        updateCurrentTab() {
            const filteredData = App.utils.getFilteredDataByPeriod(
                document.getElementById('statsPeriodFilter')?.value || 'all'
            );
            
            switch (App.demographics.currentTab) {
                case 'region':
                    App.demographics.updateRegionMap(filteredData);
                    break;
                case 'ageGender':  // 🔥 변경된 탭 이름
                    App.demographics.updateAgeGenderStats(filteredData);
                    break;
            }
        },

        updateRegionMap(filteredData) {
            const addressIndex = App.state.data.headers.indexOf('지역');
            const mapContainer = document.getElementById('koreaMap');
            
            if (addressIndex === -1 || !mapContainer) return;
            
            // 지역별 데이터 집계
            const regionData = {};
            let totalCount = 0;
            
            filteredData.forEach(row => {
                const address = String(row[addressIndex] || '').trim();
                if (!address || address === '-') return;
                
                const region = App.utils.extractRegion(address);
                regionData[region] = (regionData[region] || 0) + 1;
                totalCount++;
            });
            
            // 🔥 카드 그리드 스타일로 변경
            App.demographics.renderRegionCards(regionData, totalCount, mapContainer);
        },

        // 🔥 새로운 함수: 지역 카드 그리드 렌더링
        renderRegionCards(regionData, totalCount, container) {
            // 지역 데이터를 인원수 기준으로 정렬
            const sortedRegions = Object.entries(regionData)
                .sort(([,a], [,b]) => b - a)
                .slice(0, 12); // 상위 12개 지역만 표시
            
            // 최대값 계산 (프로그레스 바용)
            const maxCount = Math.max(...Object.values(regionData));
            
            let html = `
                <div class="region-cards-container">
                    <div class="region-summary">
                        <div class="region-total-info">
                            <span class="region-total-count">${totalCount}</span>
                            <span class="region-total-label">총 지원자</span>
                        </div>
                        <div class="region-total-regions">
                            <span class="region-count">${Object.keys(regionData).length}</span>
                            <span class="region-label">개 지역</span>
                        </div>
                    </div>
                    
                    <div class="region-cards-grid">
            `;
            
            sortedRegions.forEach(([region, count], index) => {
                const percentage = totalCount > 0 ? ((count / totalCount) * 100).toFixed(1) : 0;
                const progressWidth = maxCount > 0 ? (count / maxCount) * 100 : 0;
                
                // 순위별 색상 및 아이콘
                const rankColors = [
                    '#ffd700', '#c0c0c0', '#cd7f32', '#818cf8', '#10b981', 
                    '#f59e0b', '#ef4444', '#8b5cf6', '#f97316', '#06b6d4',
                    '#84cc16', '#f43f5e'
                ];
                const rankIcons = [
                    '🥇', '🥈', '🥉', '🏙️', '🏢', '🌊', '🏛️', '🏘️', '🌆', '🏞️', '🌄', '📍'
                ];
                
                const rankColor = rankColors[index] || '#6b7280';
                const rankIcon = rankIcons[index] || '📍';
                const isTopRank = index < 3;
                
                html += `
                    <div class="region-card ${isTopRank ? 'region-card-top' : ''}" 
                         data-region="${region}" 
                         data-count="${count}"
                         data-percentage="${percentage}"
                         style="--rank-color: ${rankColor}">
                        
                        <div class="region-card-header">
                            <div class="region-icon">${rankIcon}</div>
                            <div class="region-rank">#${index + 1}</div>
                        </div>
                        
                        <div class="region-card-body">
                            <div class="region-name" title="${App.demographics.getFullRegionName(region)}">${region}</div>
                            <div class="region-stats">
                                <div class="region-count-display">${count}<span class="region-unit">명</span></div>
                                <div class="region-percentage">${percentage}%</div>
                            </div>
                        </div>
                        
                        <div class="region-card-footer">
                            <div class="region-progress-container">
                                <div class="region-progress-bar">
                                    <div class="region-progress-fill" style="width: ${progressWidth}%"></div>
                                </div>
                            </div>
                        </div>
                        
                        ${isTopRank ? '<div class="region-medal-glow"></div>' : ''}
                    </div>
                `;
            });
            
            html += `
                    </div>
                </div>
            `;
            
            container.innerHTML = html;
            
            // 카드 호버 이벤트 추가
            App.demographics.addRegionCardEvents();
        },

        // 🔥 새로운 함수: 전체 지역명 반환
        getFullRegionName(shortName) {
            const regionNames = {
                '서울': '서울특별시',
                '경기': '경기도',
                '인천': '인천광역시',
                '부산': '부산광역시',
                '대구': '대구광역시',
                '대전': '대전광역시',
                '광주': '광주광역시',
                '울산': '울산광역시',
                '세종': '세종특별자치시',
                '강원': '강원특별자치도',
                '충북': '충청북도',
                '충남': '충청남도',
                '전북': '전라북도',
                '전남': '전라남도',
                '경북': '경상북도',
                '경남': '경상남도',
                '제주': '제주특별자치도',
                '기타': '기타 지역'
            };
            return regionNames[shortName] || shortName;
        },

        // 🔥 새로운 함수: 카드 이벤트 추가
        addRegionCardEvents() {
            const cards = document.querySelectorAll('.region-card');
            
            cards.forEach(card => {
                card.addEventListener('mouseenter', () => {
                    const region = card.dataset.region;
                    const count = card.dataset.count;
                    const percentage = card.dataset.percentage;
                    const fullName = App.demographics.getFullRegionName(region);
                    
                    // 호버 시 추가 정보 표시 (선택적)
                    card.setAttribute('title', `${fullName}: ${count}명 (${percentage}%)`);
                    
                    // 다른 카드들 약간 흐리게
                    cards.forEach(otherCard => {
                        if (otherCard !== card) {
                            otherCard.style.opacity = '0.7';
                            otherCard.style.transform = 'scale(0.98)';
                        }
                    });
                });
                
                card.addEventListener('mouseleave', () => {
                    // 모든 카드 원상복구
                    cards.forEach(otherCard => {
                        otherCard.style.opacity = '1';
                        otherCard.style.transform = 'scale(1)';
                    });
                });
            });
        },

        addMapTooltips() {
            // 🔥 카드 그리드 스타일에서는 툴팁이 필요 없으므로 빈 함수로 유지
            console.log('📍 카드 그리드 스타일에서는 별도 툴팁 불필요');
        },

        // 🔥 새로운 통합 연령/성별 분석
        updateAgeGenderStats(filteredData) {
            const ageIndex = App.state.data.headers.indexOf('나이');
            const genderIndex = App.state.data.headers.indexOf('성별');
            const container = document.getElementById('ageGenderTab');
            
            if (ageIndex === -1 || !container) {
                App.demographics.showNoDataMessage('ageGenderTab');
                return;
            }
            
            // 연령대별 성별 데이터 집계
            const ageGroups = {
                '60+': { total: 0, male: 0, female: 0 },
                '50-59': { total: 0, male: 0, female: 0 },
                '40-49': { total: 0, male: 0, female: 0 },
                '30-39': { total: 0, male: 0, female: 0 },
                '20-29': { total: 0, male: 0, female: 0 },
                '~19': { total: 0, male: 0, female: 0 }
            };
            
            let totalCount = 0;
            
            filteredData.forEach(row => {
                const ageStr = String(row[ageIndex] || '').trim();
                const gender = String(row[genderIndex] || '').trim();
                
                if (!ageStr || ageStr === '-') return;
                
                const age = parseInt(ageStr, 10);
                if (isNaN(age)) return;
                
                let ageGroup;
                if (age >= 60) ageGroup = '60+';
                else if (age >= 50) ageGroup = '50-59';
                else if (age >= 40) ageGroup = '40-49';
                else if (age >= 30) ageGroup = '30-39';
                else if (age >= 20) ageGroup = '20-29';
                else ageGroup = '~19';
                
                ageGroups[ageGroup].total++;
                totalCount++;
                
                if (gender === '남') ageGroups[ageGroup].male++;
                else if (gender === '여') ageGroups[ageGroup].female++;
            });
            
            // 🔥 HTML 렌더링 - 총합과 성별 분포를 함께 표시
            let html = `
                <div class="age-gender-container">
                    <div class="age-gender-summary">
                        <h4 style="text-align: center; margin-bottom: 20px; color: var(--text-primary); font-size: 1.2rem;">
                            <i class="fas fa-users" style="color: var(--sidebar-accent); margin-right: 8px;"></i>
                            연령별/성별 분포
                        </h4>
                        <div class="total-stats" style="text-align: center; margin-bottom: 30px; padding: 15px; background: var(--main-bg); border-radius: 10px;">
                            <span style="font-size: 2rem; font-weight: 800; color: var(--sidebar-accent);">${totalCount}</span>
                            <span style="color: var(--text-secondary); margin-left: 10px;">총 지원자</span>
                        </div>
                    </div>
                    
                    <div class="age-gender-chart">
            `;
            
            // 연령대별 차트
            Object.entries(ageGroups).forEach(([ageGroup, data]) => {
                const percentage = totalCount > 0 ? Math.round((data.total / totalCount) * 100) : 0;
                const malePercentage = data.total > 0 ? Math.round((data.male / data.total) * 100) : 0;
                const femalePercentage = data.total > 0 ? Math.round((data.female / data.total) * 100) : 0;
                
                html += `
                    <div class="age-group-row" style="display: flex; align-items: center; margin-bottom: 20px; padding: 15px; background: var(--content-bg); border-radius: 12px; border: 2px solid var(--border-color); transition: all 0.3s ease;">
                        <div class="age-label" style="min-width: 80px; text-align: center; font-weight: 700; color: var(--text-primary); font-size: 1.1rem;">
                            ${ageGroup}
                        </div>
                        
                        <div class="age-total" style="min-width: 100px; text-align: center; margin: 0 20px;">
                            <div style="font-size: 1.8rem; font-weight: 700; color: var(--sidebar-accent);">${data.total}</div>
                            <div style="font-size: 0.85rem; color: var(--text-secondary);">${percentage}%</div>
                        </div>
                        
                        <div class="gender-breakdown" style="flex: 1; display: flex; gap: 15px; align-items: center;">
                            <div class="male-section" style="flex: 1;">
                                <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px;">
                                    <span style="font-size: 0.9rem; color: #3b82f6; font-weight: 600;">
                                        <i class="fas fa-mars" style="margin-right: 5px;"></i>남성
                                    </span>
                                    <span style="font-weight: 600; color: #3b82f6;">${data.male}명 (${malePercentage}%)</span>
                                </div>
                                <div class="progress-bar" style="height: 8px; background: #e5e7eb; border-radius: 4px; overflow: hidden;">
                                    <div style="height: 100%; background: linear-gradient(90deg, #3b82f6, #2563eb); width: ${malePercentage}%; transition: width 0.5s ease;"></div>
                                </div>
                            </div>
                            
                            <div class="female-section" style="flex: 1;">
                                <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px;">
                                    <span style="font-size: 0.9rem; color: #ec4899; font-weight: 600;">
                                        <i class="fas fa-venus" style="margin-right: 5px;"></i>여성
                                    </span>
                                    <span style="font-weight: 600; color: #ec4899;">${data.female}명 (${femalePercentage}%)</span>
                                </div>
                                <div class="progress-bar" style="height: 8px; background: #e5e7eb; border-radius: 4px; overflow: hidden;">
                                    <div style="height: 100%; background: linear-gradient(90deg, #ec4899, #db2777); width: ${femalePercentage}%; transition: width 0.5s ease;"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
            });
            
            html += `
                    </div>
                </div>
            `;
            
            container.innerHTML = html;
            
            // 🔥 호버 효과 추가
            setTimeout(() => {
                const rows = container.querySelectorAll('.age-group-row');
                rows.forEach(row => {
                    row.addEventListener('mouseenter', () => {
                        row.style.transform = 'translateX(8px)';
                        row.style.borderColor = 'var(--sidebar-accent)';
                        row.style.boxShadow = '0 4px 15px rgba(129, 140, 248, 0.2)';
                    });
                    
                    row.addEventListener('mouseleave', () => {
                        row.style.transform = 'translateX(0)';
                        row.style.borderColor = 'var(--border-color)';
                        row.style.boxShadow = '';
                    });
                });
            }, 100);
        },

        createTooltip() {
            let tooltip = document.querySelector('.demo-tooltip');
            if (!tooltip) {
                tooltip = document.createElement('div');
                tooltip.className = 'demo-tooltip';
                document.body.appendChild(tooltip);
            }
            return tooltip;
        },

        showTooltip(tooltip, event) {
            tooltip.classList.add('show');
            App.demographics.moveTooltip(tooltip, event);
        },

        hideTooltip(tooltip) {
            tooltip.classList.remove('show');
        },

        moveTooltip(tooltip, event) {
            const x = event.clientX + 10;
            const y = event.clientY - 10;
            
            tooltip.style.left = x + 'px';
            tooltip.style.top = y + 'px';
        },

        showNoDataMessage(tabId) {
            const tab = document.getElementById(tabId);
            if (tab) {
                tab.innerHTML = `
                    <div style="text-align: center; padding: 60px 20px; color: var(--text-secondary);">
                        <i class="fas fa-chart-bar" style="font-size: 3rem; margin-bottom: 20px; opacity: 0.5;"></i>
                        <h3 style="margin-bottom: 10px;">데이터가 없습니다</h3>
                        <p>해당 컬럼의 데이터가 존재하지 않거나 필터링된 결과가 없습니다.</p>
                    </div>
                `;
            }
        },

        // 초기 로드 시 업데이트
        initialize() {
            if (document.getElementById('regionTab')) {
                App.demographics.updateCurrentTab();
            }
        }
    },

    // =========================
    // 애플리케이션 상태 (state.js에서 가져옴)
    // =========================
    state: createInitialState(),
    cache: typeof CacheModule !== 'undefined' ? CacheModule : null,
    dataCache: typeof DataCacheModule !== 'undefined' ? DataCacheModule : null,
    smartSync: typeof SmartSyncModule !== 'undefined' ? SmartSyncModule : null,
    interviewSchedule: typeof InterviewScheduleModule !== 'undefined' ? InterviewScheduleModule : null,
    report: typeof ReportModule !== 'undefined' ? ReportModule : null,
    costManagement: typeof CostManagementModule !== 'undefined' ? CostManagementModule : null,
    // =========================
    // 🔥 성능 개선 유틸리티들 (상단으로 이동)
    // =========================
    performance: {
        // 🔥 디바운스 함수 (검색, 필터링 등에 사용)
        debounce(func, wait) {
            let timeout;
            return function executedFunction(...args) {
                const later = () => {
                    clearTimeout(timeout);
                    func(...args);
                };
                clearTimeout(timeout);
                timeout = setTimeout(later, wait);
            };
        },

        // 🔥 스로틀 함수 (스크롤, 리사이즈 등에 사용)
        throttle(func, limit) {
            let inThrottle;
            return function() {
                const args = arguments;
                const context = this;
                if (!inThrottle) {
                    func.apply(context, args);
                    inThrottle = true;
                    setTimeout(() => inThrottle = false, limit);
                }
            }
        },

        // 🔥 가상 스크롤링 (대용량 데이터용)
        virtualScroll: {
            itemHeight: 60,
            visibleCount: 20,
            bufferCount: 5,
            
            calculateVisibleRange(scrollTop, containerHeight) {
                const startIndex = Math.floor(scrollTop / this.itemHeight);
                const endIndex = Math.min(
                    startIndex + Math.ceil(containerHeight / this.itemHeight) + this.bufferCount,
                    App.state.data.filtered.length
                );
                return {
                    start: Math.max(0, startIndex - this.bufferCount),
                    end: endIndex
                };
            }
        },

        // 🔥 DOM 업데이트 최적화
        batchDOMUpdates(updates) {
            // DOM 업데이트를 배치로 처리하여 리플로우 최소화
            return new Promise(resolve => {
                requestAnimationFrame(() => {
                    updates.forEach(update => update());
                    resolve();
                });
            });
        },

        // 🔥 메모리 사용량 모니터링
        monitorMemory() {
            if ('memory' in performance) {
                const memory = performance.memory;
                console.log('📊 메모리 사용량:', {
                    used: Math.round(memory.usedJSHeapSize / 1048576) + 'MB',
                    total: Math.round(memory.totalJSHeapSize / 1048576) + 'MB',
                    limit: Math.round(memory.jsHeapSizeLimit / 1048576) + 'MB'
                });
            }
        },

        // 🔥 자동 가비지 컬렉션 제안
        suggestGarbageCollection() {
            if ('memory' in performance) {
                const memory = performance.memory;
                const usageRatio = memory.usedJSHeapSize / memory.jsHeapSizeLimit;
                
                if (usageRatio > 0.8) {
                    console.warn('⚠️ 메모리 사용량이 높습니다. 가비지 컬렉션을 고려하세요.');
                    return true;
                }
            }
            return false;
        }
    },

    // =========================
    // 애플리케이션 초기화 (동기화 상태 포함)
    // =========================
    init: {
        async start() {
            console.log('🚀 애플리케이션 초기화 시작...');
            const startTime = Date.now();
            
            try {
                // 1. 기본 설정
                App.theme.initialize();
                App.init.setupEventListeners();
                App.init.setupDateFilterListeners();
                
                // 2. 네비게이션 초기화
                App.navigation.initializeHistoryHandling();
                App.navigation.addPageTransitionEffects();
                
                // 3. 초기 동기화 상태 설정
                App.ui.updateSyncStatus('syncing');
                
                // 4. 데이터 로드
                await App.data.fetch();
                
                // 5. 스마트 동기화 시스템 시작 및 상태 설정
                App.smartSync.init(App);
                
                // 6. 빠른 모드 감지 및 상태 업데이트 (스마트 동기화 모니터링)
                App.init.setupSyncStatusMonitoring();
                
                // 7. 🔥 리포트 모듈 초기화 (B) 기능 개선 단계
                if (App.report && typeof App.report.init === 'function') {
                    App.report.init();
                }
                
                // 8. 접근성 개선 (비동기)
                setTimeout(() => {
                    App.utils.enhanceAccessibility();
                }, 1000);
                
                App.ui.trackPerformance('애플리케이션 초기화', startTime);
                console.log('✅ 애플리케이션 초기화 완료');
                
            } catch (error) {
                App.ui.updateSyncStatus('disconnected');
                App.ui.trackPerformance('애플리케이션 초기화 (실패)', startTime);
                console.error('❌ 애플리케이션 초기화 실패:', error);
                throw error;
            }
        },

        setupEventListeners() {
            document.addEventListener('click', function(event) {
                const dropdownContainer = document.querySelector('.column-toggle-container');
                const dropdown = document.getElementById('columnToggleDropdown');
                
                if (dropdownContainer && !dropdownContainer.contains(event.target)) {
                    if (dropdown) {
                        dropdown.style.display = 'none';
                    }
                }

                if (window.innerWidth <= 768) {
                    const sidebar = document.getElementById('sidebar');
                    if (sidebar && sidebar.classList.contains('mobile-open') &&
                        !sidebar.contains(event.target) &&
                        !event.target.closest('.mobile-menu-btn')) {
                        App.ui.toggleMobileMenu();
                    }
                }
            });
        },

        setupDateFilterListeners() {
            try {
                const dateModeToggle = document.getElementById('dateModeToggle');
                if (dateModeToggle) {
                    dateModeToggle.addEventListener('click', (e) => {
                        if (e.target.tagName === 'BUTTON') {
                            App.state.ui.activeDateMode = e.target.dataset.mode;
                            App.filter.updateDateFilterUI();
                            App.filter.apply();
                        }
                    });
                } else {
                    console.warn('dateModeToggle 요소를 찾을 수 없습니다.');
                }
            } catch (error) {
                console.error('날짜 필터 리스너 설정 실패:', error);
            }
        },
        
        // 🔥 새로운 함수: 동기화 상태 모니터링 설정
        setupSyncStatusMonitoring() {
            // 스마트 동기화 상태를 주기적으로 확인하고 UI 업데이트
            setInterval(() => {
                if (App.smartSync) {
                    const status = App.smartSync.getStatus();
                    
                    if (status.isFastMode) {
                        App.ui.updateSyncStatus('fast-mode');
                    } else if (status.isPolling) {
                        App.ui.updateSyncStatus('connected');
                    } else {
                        App.ui.updateSyncStatus('disconnected');
                    }
                }
            }, 1000); // 1초마다 상태 확인
            
            console.log('🔄 동기화 상태 모니터링 설정 완료');
        }
    },

    // =========================
    // 테마 관련 (모듈에서 가져옴)
    // =========================
    theme: {
        initialize: () => ThemeModule.initialize(),
        toggle: () => ThemeModule.toggle(),
        updateIcon: (theme) => ThemeModule.updateIcon(theme),
        getCurrentTheme: () => ThemeModule.getCurrentTheme(),
        setTheme: (theme) => ThemeModule.setTheme(theme),
        getSystemTheme: () => ThemeModule.getSystemTheme(),
        reset: () => ThemeModule.reset(),
        onThemeChange: (callback) => ThemeModule.onThemeChange(callback),
        getThemeInfo: () => ThemeModule.getThemeInfo()
    },

    // =========================
    // 네비게이션 관련 (모듈에서 가져옴)
    // =========================
    navigation: {
        switchPage: (pageId) => NavigationModule.switchPage(App, pageId),
        handlePageSpecificActions: (pageId) => NavigationModule.handlePageSpecificActions(App, pageId),
        closeMobileSidebarIfOpen: () => NavigationModule.closeMobileSidebarIfOpen(),
        getCurrentPage: () => NavigationModule.getCurrentPage(),
        updateHistory: (pageId) => NavigationModule.updateHistory(pageId),
        initializeHistoryHandling: () => NavigationModule.initializeHistoryHandling(App),
        addPageTransitionEffects: () => NavigationModule.addPageTransitionEffects(),
        switchPageWithoutHistory: (pageId) => NavigationModule.switchPageWithoutHistory(App, pageId)
    },

    // =========================
    // UI 관련 (상태 표시 추가)
    // =========================
    ui: {
        toggleMobileMenu: () => UIModule.toggleMobileMenu(),
        toggleColumnDropdown: () => UIModule.toggleColumnDropdown(),
        handleColumnToggle: (event, columnName) => UIModule.handleColumnToggle(App, event, columnName),
        setupColumnToggles: () => UIModule.setupColumnToggles(App),
        showLoadingState: (container) => UIModule.showLoadingState(container, App),
        updateProgress: (container, percentage, text) => UIModule.updateProgress(container, percentage, text),
        showErrorState: (container, error) => UIModule.showErrorState(container, error, App),
        
        // 🔥 새로운 함수들: 상태 표시 및 업데이트 시간 관리
        updateLastUpdateTime() {
            const lastUpdateInfo = document.getElementById('lastUpdateInfo');
            const lastUpdateTime = document.getElementById('lastUpdateTime');
            
            if (lastUpdateInfo && lastUpdateTime) {
                const now = new Date();
                const timeString = now.toLocaleTimeString('ko-KR', {
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit'
                });
                const dateString = now.toLocaleDateString('ko-KR', {
                    month: '2-digit',
                    day: '2-digit'
                });
                
                lastUpdateTime.textContent = `${dateString} ${timeString}`;
                lastUpdateInfo.style.display = 'block';
                
                // 업데이트 시 짧은 하이라이트 효과
                lastUpdateInfo.style.background = 'rgba(16, 185, 129, 0.2)';
                lastUpdateInfo.style.borderColor = 'rgba(16, 185, 129, 0.4)';
                
                setTimeout(() => {
                    lastUpdateInfo.style.background = 'rgba(129, 140, 248, 0.1)';
                    lastUpdateInfo.style.borderColor = 'rgba(129, 140, 248, 0.2)';
                }, 2000);
            }
        },
        
        updateSyncStatus(status) {
            const syncStatusElement = document.getElementById('syncStatus');
            const syncStatusIcon = document.getElementById('syncStatusIcon');
            
            if (syncStatusElement && syncStatusIcon) {
                // 기존 클래스 제거
                syncStatusElement.classList.remove('connected', 'syncing', 'disconnected', 'fast-mode');
                
                // 새로운 상태 적용
                syncStatusElement.classList.add(status);
                
                // 툴팁 업데이트
                const statusMessages = {
                    connected: '실시간 동기화 연결됨',
                    syncing: '데이터 동기화 중...',
                    disconnected: '동기화 연결 끊어짐',
                    'fast-mode': '빠른 동기화 모드 (수정 후)'
                };
                
                syncStatusElement.title = statusMessages[status] || '알 수 없는 상태';
                
                console.log('🔄 동기화 상태 업데이트:', status);
            }
        },
        
        showRefreshAnimation() {
            const refreshBtn = document.querySelector('.refresh-btn');
            const refreshIcon = document.getElementById('refreshIcon');
            
            if (refreshBtn && refreshIcon) {
                refreshBtn.classList.add('loading');
                refreshBtn.disabled = true;
                refreshBtn.style.opacity = '0.8';
                
                return () => {
                    refreshBtn.classList.remove('loading');
                    refreshBtn.disabled = false;
                    refreshBtn.style.opacity = '1';
                };
            }
            
            return () => {}; // 빈 함수 반환
        },
        
        // 데이터 통계 요약 표시
        updateDataSummary() {
            const totalCount = App.state.data.all.length;
            const filteredCount = App.state.data.filtered.length;
            
            // 브라우저 탭 제목에 개수 표시
            const originalTitle = 'CFC 채용 현황 대시보드';
            document.title = totalCount > 0 ? `(${totalCount}) ${originalTitle}` : originalTitle;
            
            console.log(`📊 데이터 요약 - 전체: ${totalCount}, 필터링됨: ${filteredCount}`);
        },
        
        // 성능 모니터링
        trackPerformance(action, startTime) {
            const endTime = Date.now();
            const duration = endTime - startTime;
            
            console.log(`⏱️ 성능 측정 [${action}]: ${duration}ms`);
            
            // 성능 임계값 확인 (5초 이상이면 경고)
            if (duration > 5000) {
                console.warn(`⚠️ 성능 경고: ${action}이 ${duration}ms 소요됨`);
                
                // 사용자에게 알림 (선택적)
                if (duration > 10000) {
                    App.ui.showPerformanceWarning(action, duration);
                }
            }
            
            return duration;
        },
        
        showPerformanceWarning(action, duration) {
            const notification = document.createElement('div');
            notification.style.cssText = `
                position: fixed;
                top: 80px;
                right: 20px;
                background: linear-gradient(135deg, #f59e0b, #d97706);
                color: white;
                padding: 12px 20px;
                border-radius: 8px;
                box-shadow: 0 4px 15px rgba(245, 158, 11, 0.3);
                z-index: 2500;
                font-size: 0.9rem;
                max-width: 300px;
                border-left: 4px solid rgba(255, 255, 255, 0.8);
            `;
            
            notification.innerHTML = `
                <div style="font-weight: 600; margin-bottom: 4px;">
                    ⚠️ 성능 알림
                </div>
                <div style="font-size: 0.85rem; opacity: 0.9;">
                    ${action}이 예상보다 오래 걸리고 있습니다 (${Math.round(duration/1000)}초)
                </div>
            `;
            
            document.body.appendChild(notification);
            
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 5000);
        }
    },

    // =========================
    // 데이터 관련 (최종 통합 버전 - UI 상태 업데이트 포함)
    // =========================
    data: {
        fetch: async () => {
            const startTime = Date.now();
            App.ui.updateSyncStatus('syncing');
            
            try {
                await DataModule.fetch(App);
                App.ui.updateLastUpdateTime();
                App.ui.updateDataSummary();
                App.ui.updateSyncStatus('connected');
                App.ui.trackPerformance('데이터 로드', startTime);
            } catch (error) {
                App.ui.updateSyncStatus('disconnected');
                App.ui.trackPerformance('데이터 로드 (실패)', startTime);
                throw error;
            }
        },
        
        updateSequenceNumber: () => DataModule.updateSequenceNumber(App),
        updateInterviewSchedule: () => DataModule.updateInterviewSchedule(App),
        showInterviewDetails: (name, route) => DataModule.showInterviewDetails(App, name, route),
        
        // 🔥 수정된 save 함수 - UI 상태 업데이트 포함
        async save(data, isUpdate = false, gubun = null) {
            const startTime = Date.now();
            App.ui.updateSyncStatus('syncing');
            
            try {
                console.log('💾 데이터 저장 시작:', isUpdate ? '수정' : '신규', data);
                
                // 서버에 저장
                const result = await DataModule.save(App, data, isUpdate, gubun);
                
                // 🔥 모든 캐시 완전 초기화
                if (App.cache) {
                    App.cache.invalidate();
                    console.log('✅ CacheModule 초기화 완료');
                }
                
                if (App.dataCache) {
                    App.dataCache.clearCache();
                    console.log('✅ DataCacheModule 초기화 완료');
                }
                
                App.ui.updateSyncStatus('connected');
                App.ui.trackPerformance(isUpdate ? '데이터 수정' : '데이터 생성', startTime);
                
                console.log('✅ 데이터 저장 및 캐시 초기화 완료');
                return result;
                
            } catch (error) {
                App.ui.updateSyncStatus('disconnected');
                App.ui.trackPerformance('데이터 저장 (실패)', startTime);
                console.error('❌ 데이터 저장 실패:', error);
                throw error;
            }
        },
        
        // 🔥 수정된 delete 함수 - UI 상태 업데이트 포함
        async delete(gubun) {
            const startTime = Date.now();
            App.ui.updateSyncStatus('syncing');
            
            try {
                console.log('🗑️ 데이터 삭제 시작:', gubun);
                
                // 서버에서 삭제
                const result = await DataModule.delete(App, gubun);
                
                // 🔥 모든 캐시 완전 초기화
                if (App.cache) {
                    App.cache.invalidate();
                    console.log('✅ CacheModule 초기화 완료');
                }
                
                if (App.dataCache) {
                    App.dataCache.clearCache();
                    console.log('✅ DataCacheModule 초기화 완료');
                }
                
                App.ui.updateSyncStatus('connected');
                App.ui.trackPerformance('데이터 삭제', startTime);
                
                console.log('✅ 데이터 삭제 및 캐시 초기화 완료');
                return result;
                
            } catch (error) {
                App.ui.updateSyncStatus('disconnected');
                App.ui.trackPerformance('데이터 삭제 (실패)', startTime);
                console.error('❌ 데이터 삭제 실패:', error);
                throw error;
            }
        },
        
        // 🔥 간단한 강제 새로고침 (캐시만 지우고 기존 fetch 사용)
        async forceRefresh() {
            const startTime = Date.now();
            const stopAnimation = App.ui.showRefreshAnimation();
            App.ui.updateSyncStatus('syncing');
            
            try {
                console.log('🔄 간단 새로고침 시작...');
                
                // 1. 캐시만 지우기
                if (App.cache) {
                    App.cache.invalidate();
                    console.log('✅ CacheModule 초기화');
                }
                
                if (App.dataCache) {
                    App.dataCache.clearCache();
                    console.log('✅ DataCacheModule 초기화');
                }
                
                // 2. 기존 fetch 함수 사용 (캐시가 없으니 서버에서 새로 가져올 것)
                await App.data.fetch();
                
                console.log(`✅ 간단 새로고침 완료: ${App.state.data.all.length}개 항목`);
                
                // 3. 성공 알림
                App.data.showRefreshNotification('최신 데이터로 업데이트되었습니다! 🔄');

            } catch (error) {
                console.error('❌ 간단 새로고침 실패:', error);
                
                App.ui.updateSyncStatus('disconnected');
                App.ui.trackPerformance('간단 새로고침 (실패)', startTime);
                
                // 간단한 에러 처리
                alert('새로고침에 실패했습니다. 인터넷 연결을 확인하고 다시 시도해주세요.');
                
            } finally {
                stopAnimation();
            }
        },
        
        // 새로고침 알림 (기존과 동일)
        showRefreshNotification(message) {
            const existingNotifications = document.querySelectorAll('.refresh-notification');
            existingNotifications.forEach(notification => notification.remove());

            const notification = document.createElement('div');
            notification.className = 'refresh-notification';
            
            notification.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                background: linear-gradient(135deg, #818cf8, #6366f1);
                color: white;
                padding: 15px 25px;
                border-radius: 12px;
                box-shadow: 0 4px 20px rgba(129, 140, 248, 0.3);
                z-index: 3000;
                font-weight: 600;
                font-size: 0.95rem;
                transform: translateX(400px);
                opacity: 0;
                transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
                border-left: 4px solid rgba(255, 255, 255, 0.8);
                min-width: 280px;
                text-align: center;
            `;
            
            notification.innerHTML = `
                <div style="display: flex; align-items: center; gap: 10px; justify-content: center;">
                    <i class="fas fa-sync-alt" style="font-size: 1.2rem; animation: rotate 2s linear infinite;"></i>
                    <span>${message}</span>
                </div>
                <style>
                    @keyframes rotate {
                        from { transform: rotate(0deg); }
                        to { transform: rotate(360deg); }
                    }
                </style>
            `;
            
            document.body.appendChild(notification);
            
            // 슬라이드 인 애니메이션
            setTimeout(() => {
                notification.style.transform = 'translateX(0)';
                notification.style.opacity = '1';
            }, 10);
            
            // 3초 후 슬라이드 아웃
            setTimeout(() => {
                notification.style.transform = 'translateX(400px)';
                notification.style.opacity = '0';
                setTimeout(() => {
                    if (notification.parentNode) {
                        notification.parentNode.removeChild(notification);
                    }
                }, 400);
            }, 3000);
        }
    },

    // =========================
    // 모달 관련 (모듈에서 가져옴)
    // =========================
    modal: {
        get element() {
            return ModalModule.element;
        },
        openNew: () => ModalModule.openNew(App),
        openDetail: (rowData) => ModalModule.openDetail(App, rowData),
        openEdit: () => ModalModule.openEdit(App),
        close: () => ModalModule.close(App),
        buildForm: (data, isReadOnly) => ModalModule.buildForm(App, data, isReadOnly),
        createInput: (header, value, isRequired, isDisabled) => ModalModule.createInput(App, header, value, isRequired, isDisabled),
        createDropdownInput: (header, value, isRequired, isDisabled) => ModalModule.createDropdownInput(App, header, value, isRequired, isDisabled),
        handleDropdownChange: (selectElement, fieldName) => ModalModule.handleDropdownChange(selectElement, fieldName),
        saveNew: () => ModalModule.saveNew(App),
        saveEdit: () => ModalModule.saveEdit(App),
        delete: () => ModalModule.delete(App),
        collectFormData: () => ModalModule.collectFormData(App),
        validateFormData: (data) => ModalModule.validateFormData(App, data),
        prepareTimeData: (data) => ModalModule.prepareTimeData(data)
    },

    // =========================
    // 🔥 개선된 검색 관련
    // =========================
    search: {
        // 🔥 함수로 변경 (즉시실행함수에서 일반 함수로)
        handle() {
            // 기존 타임아웃 제거
            if (App.state.ui.searchTimeout) {
                clearTimeout(App.state.ui.searchTimeout);
            }
            
            // 디바운스 적용
            App.state.ui.searchTimeout = setTimeout(() => {
                const searchTerm = String(document.getElementById('globalSearch').value || '').toLowerCase();
                
                if (App.state.ui.searchTerm === searchTerm) return; // 동일한 검색어면 건너뛰기
                
                App.state.ui.searchTerm = searchTerm;
                App.state.ui.currentPage = 1;
                
                // 성능 측정 시작
                const startTime = Date.now();
                
                App.filter.apply();
                
                // 성능 측정 완료
                const endTime = Date.now();
                console.log(`🔍 검색 완료: ${endTime - startTime}ms (검색어: "${searchTerm}")`);
            }, 150);
        },

        // 🔥 고급 검색 기능
        advancedSearch(query, options = {}) {
            const {
                fields = [], // 특정 필드만 검색
                exact = false, // 정확한 매칭
                caseSensitive = false
            } = options;

            if (!query) return App.state.data.all;

            const searchTerm = caseSensitive ? query : query.toLowerCase();
            
            return App.state.data.all.filter(row => {
                const searchFields = fields.length > 0 ? 
                    fields.map(field => {
                        const index = App.state.data.headers.indexOf(field);
                        return index !== -1 ? row[index] : '';
                    }) : row;

                return searchFields.some(cell => {
                    const cellValue = caseSensitive ? String(cell || '') : String(cell || '').toLowerCase();
                    return exact ? cellValue === searchTerm : cellValue.includes(searchTerm);
                });
            });
        }
    },

    // =========================
    // 🔥 개선된 필터 관련
    // =========================
    filter: {
        // 🔥 간단한 디바운스로 변경
        apply() {
            // 기존 타임아웃 제거
            if (App.state.ui.filterTimeout) {
                clearTimeout(App.state.ui.filterTimeout);
            }
            
            // 디바운스 적용
            App.state.ui.filterTimeout = setTimeout(() => {
                const startTime = Date.now();
                
                let data = [...App.state.data.all];
                console.log('필터 적용 시작 - 원본 데이터:', data.length);

                const routeFilter = document.getElementById('routeFilter').value;
                const positionFilter = document.getElementById('positionFilter').value;
                const applyDateIndex = App.state.data.headers.indexOf('지원일');
                const routeIndex = App.state.data.headers.indexOf('지원루트');
                const positionIndex = App.state.data.headers.indexOf('모집분야');

                // 🔥 검색 필터 (개선된 성능)
                if (App.state.ui.searchTerm) {
                    const searchTerm = App.state.ui.searchTerm;
                    data = data.filter(row => {
                        return row.some(cell => {
                            const cellStr = String(cell || '').toLowerCase();
                            return cellStr.includes(searchTerm);
                        });
                    });
                }

                // 🔥 드롭다운 필터
                if (routeFilter !== 'all' && routeIndex !== -1) {
                    data = data.filter(row => String(row[routeIndex] || '') === routeFilter);
                }

                if (positionFilter !== 'all' && positionIndex !== -1) {
                    data = data.filter(row => String(row[positionIndex] || '') === positionFilter);
                }

                // 🔥 날짜 필터
                if (applyDateIndex !== -1 && App.state.ui.activeDateMode !== 'all') {
                    data = App.filter.applyDateFilter(data, applyDateIndex);
                }

                // 🔥 정렬 적용
                App.state.data.filtered = App.utils.sortData(data);
                
                console.log('필터 적용 완료 - 필터링된 데이터:', App.state.data.filtered.length);

                // 🔥 UI 업데이트
                App.pagination.updateTotal();
                App.filter.updateSummary();
                const pageData = App.pagination.getCurrentPageData();
                if (App.state.ui.currentView === 'table') {
                    App.render.table(pageData);
                } else {
                    App.render.cards(pageData);
                }
                App.pagination.updateUI();

                const endTime = Date.now();
                console.log(`⚡ 필터 처리 완료: ${endTime - startTime}ms`);
                
                // 메모리 사용량 체크
                if (data.length > 1000 && App.performance && App.performance.monitorMemory) {
                    App.performance.monitorMemory();
                }
            }, 100);
        },

        applyDateFilter(data, applyDateIndex) {
            try {
                if (App.state.ui.activeDateMode === 'year') {
                    const dateInput = document.getElementById('dateInput');
                    const year = dateInput ? dateInput.value : null;
                    if(year) return data.filter(row => row[applyDateIndex] && new Date(row[applyDateIndex]).getFullYear() == year);
                } else if (App.state.ui.activeDateMode === 'month') {
                    const dateInput = document.getElementById('dateInput');
                    const month = dateInput ? dateInput.value : null;
                    if(month) return data.filter(row => String(row[applyDateIndex] || '').slice(0, 7) === month);
                } else if (App.state.ui.activeDateMode === 'day') {
                    const dateInput = document.getElementById('dateInput');
                    const day = dateInput ? dateInput.value : null;
                    if(day) return data.filter(row => String(row[applyDateIndex] || '').slice(0, 10) === day);
                } else if (App.state.ui.activeDateMode === 'range') {
                    const startDateInput = document.getElementById('startDateInput');
                    const endDateInput = document.getElementById('endDateInput');
                    const startDate = startDateInput ? startDateInput.value : null;
                    const endDate = endDateInput ? endDateInput.value : null;
                    
                    if (startDate && endDate) {
                        const start = new Date(startDate);
                        const end = new Date(endDate);
                        end.setHours(23, 59, 59, 999);
                        return data.filter(row => {
                            if(!row[applyDateIndex]) return false;
                            const applyDate = new Date(row[applyDateIndex]);
                            return applyDate >= start && applyDate <= end;
                        });
                    }
                }
            } catch(e) {
                console.error("날짜 필터링 오류", e);
            }
            return data;
        },

        reset(runApplyFilters = true) {
            document.querySelectorAll('.filter-bar select').forEach(select => select.value = 'all');
            document.getElementById('globalSearch').value = '';
            App.state.ui.searchTerm = '';
            App.state.ui.activeDateMode = 'all';
            App.state.ui.currentPage = 1;
            App.filter.updateDateFilterUI();
            if (runApplyFilters) {
                console.log('필터 리셋 중 - 전체 데이터 개수:', App.state.data.all.length);
                App.filter.apply();
            }
        },

        updateSummary() {
            const filteredCount = App.state.data.filtered.length;
            const searchText = App.state.ui.searchTerm ? ` (검색: "${App.state.ui.searchTerm}")` : '';
            const pageInfo = filteredCount > App.config.ITEMS_PER_PAGE ? ` - ${App.state.ui.currentPage}/${App.state.ui.totalPages} 페이지` : '';
            document.getElementById('filterSummary').innerHTML = `<strong>지원자:</strong> ${filteredCount}명${searchText}${pageInfo}`;
        },

        populateDropdowns() {
            const routeIndex = App.state.data.headers.indexOf('지원루트');
            const positionIndex = App.state.data.headers.indexOf('모집분야');

            if (routeIndex !== -1) {
                const routes = [...new Set(App.state.data.all.map(row => String(row[routeIndex] || '').trim()).filter(Boolean))];
                const routeFilter = document.getElementById('routeFilter');
                routeFilter.innerHTML = '<option value="all">전체</option>';
                routes.sort().forEach(route => routeFilter.innerHTML += `<option value="${route}">${route}</option>`);
            }

            if (positionIndex !== -1) {
                const positions = [...new Set(App.state.data.all.map(row => String(row[positionIndex] || '').trim()).filter(Boolean))];
                const positionFilter = document.getElementById('positionFilter');
                positionFilter.innerHTML = '<option value="all">전체</option>';
                positions.sort().forEach(pos => positionFilter.innerHTML += `<option value="${pos}">${pos}</option>`);
            }
        },

        updateDateFilterUI() {
            try {
                document.querySelectorAll('.date-mode-btn').forEach(btn =>
                    btn.classList.toggle('active', btn.dataset.mode === App.state.ui.activeDateMode)
                );

                const container = document.getElementById('dateInputsContainer');
                if (!container) {
                    console.warn('dateInputsContainer 요소를 찾을 수 없습니다.');
                    return;
                }

                let html = '';
                const now = new Date();
                const year = now.getFullYear();
                const month = (now.getMonth() + 1).toString().padStart(2, '0');
                const day = now.getDate().toString().padStart(2, '0');

                if (App.state.ui.activeDateMode === 'all') {
                    html = `<span style="color: var(--text-secondary); font-size: 0.9rem; padding: 0 10px;">모든 데이터 표시</span>`;
                } else if (App.state.ui.activeDateMode === 'year') {
                    html = `<button class="date-nav-btn" onclick="globalThis.App && globalThis.App.filter && globalThis.App.filter.navigateDate(-1)">&lt;</button><input type="number" id="dateInput" value="${year}" onchange="globalThis.App && globalThis.App.filter && globalThis.App.filter.apply()" style="text-align: center; width: 80px;"><button class="date-nav-btn" onclick="globalThis.App && globalThis.App.filter && globalThis.App.filter.navigateDate(1)">&gt;</button>`;
                } else if (App.state.ui.activeDateMode === 'month') {
                    html = `<button class="date-nav-btn" onclick="globalThis.App && globalThis.App.filter && globalThis.App.filter.navigateDate(-1)">&lt;</button><input type="month" id="dateInput" value="${year}-${month}" onchange="globalThis.App && globalThis.App.filter && globalThis.App.filter.apply()"><button class="date-nav-btn" onclick="globalThis.App && globalThis.App.filter && globalThis.App.filter.navigateDate(1)">&gt;</button>`;
                } else if (App.state.ui.activeDateMode === 'day') {
                    html = `<button class="date-nav-btn" onclick="globalThis.App && globalThis.App.filter && globalThis.App.filter.navigateDate(-1)">&lt;</button><input type="date" id="dateInput" value="${year}-${month}-${day}" onchange="globalThis.App && globalThis.App.filter && globalThis.App.filter.apply()"><button class="date-nav-btn" onclick="globalThis.App && globalThis.App.filter && globalThis.App.filter.navigateDate(1)">&gt;</button>`;
                } else if (App.state.ui.activeDateMode === 'range') {
                    html = `<input type="date" id="startDateInput" onchange="globalThis.App && globalThis.App.filter && globalThis.App.filter.apply()"><span style="margin: 0 5px;">-</span><input type="date" id="endDateInput" onchange="globalThis.App && globalThis.App.filter && globalThis.App.filter.apply()">`;
                }
                container.innerHTML = html;
            } catch (error) {
                console.error('날짜 필터 UI 업데이트 오류:', error);
            }
        },

        navigateDate(direction) {
            try {
                const input = document.getElementById('dateInput');
                if (!input) return;

                if (App.state.ui.activeDateMode === 'year') {
                    input.value = Number(input.value) + direction;
                } else {
                    let currentDate = (App.state.ui.activeDateMode === 'month') ? new Date(input.value + '-02') : new Date(input.value);
                    if(App.state.ui.activeDateMode === 'month') currentDate.setMonth(currentDate.getMonth() + direction);
                    else if (App.state.ui.activeDateMode === 'day') currentDate.setDate(currentDate.getDate() + direction);
                    input.value = currentDate.toISOString().slice(0, App.state.ui.activeDateMode === 'month' ? 7 : 10);
                }
                App.filter.apply();
            } catch (error) {
                console.error('날짜 네비게이션 오류:', error);
            }
        }
    },

    // =========================
    // 페이지네이션 관련
    // =========================
    pagination: {
        updateTotal() {
            App.state.ui.totalPages = Math.ceil(App.state.data.filtered.length / App.config.ITEMS_PER_PAGE);
            if (App.state.ui.currentPage > App.state.ui.totalPages && App.state.ui.totalPages > 0) {
                App.state.ui.currentPage = App.state.ui.totalPages;
            } else if (App.state.ui.totalPages === 0) {
                App.state.ui.currentPage = 1;
            }
        },

        getCurrentPageData() {
            const startIndex = (App.state.ui.currentPage - 1) * App.config.ITEMS_PER_PAGE;
            const endIndex = Math.min(startIndex + App.config.ITEMS_PER_PAGE, App.state.data.filtered.length);
            return App.state.data.filtered.slice(startIndex, endIndex);
        },

        goToPage(page) {
            if (page >= 1 && page <= App.state.ui.totalPages) {
                App.state.ui.currentPage = page;
                const pageData = App.pagination.getCurrentPageData();
                if (App.state.ui.currentView === 'table') {
                    App.render.table(pageData);
                } else {
                    App.render.cards(pageData);
                }
                App.pagination.updateUI();
            }
        },

        goToPrevPage() {
            App.pagination.goToPage(App.state.ui.currentPage - 1);
        },

        goToNextPage() {
            App.pagination.goToPage(App.state.ui.currentPage + 1);
        },

        goToLastPage() {
            App.pagination.goToPage(App.state.ui.totalPages);
        },

        updateUI() {
            const paginationContainer = document.getElementById('paginationContainer');
            const paginationInfo = document.getElementById('paginationInfo');
            const paginationNumbers = document.getElementById('paginationNumbers');
            const firstPageBtn = document.getElementById('firstPageBtn');
            const prevPageBtn = document.getElementById('prevPageBtn');
            const nextPageBtn = document.getElementById('nextPageBtn');
            const lastPageBtn = document.getElementById('lastPageBtn');

            if (App.state.data.filtered.length === 0) {
                paginationContainer.style.display = 'none';
                return;
            }

            paginationContainer.style.display = 'flex';

            const startItem = (App.state.ui.currentPage - 1) * App.config.ITEMS_PER_PAGE + 1;
            const endItem = Math.min(App.state.ui.currentPage * App.config.ITEMS_PER_PAGE, App.state.data.filtered.length);
            paginationInfo.textContent = `${startItem}-${endItem} / ${App.state.data.filtered.length}명`;

            firstPageBtn.disabled = App.state.ui.currentPage === 1;
            prevPageBtn.disabled = App.state.ui.currentPage === 1;
            nextPageBtn.disabled = App.state.ui.currentPage === App.state.ui.totalPages;
            lastPageBtn.disabled = App.state.ui.currentPage === App.state.ui.totalPages;

            App.pagination.renderPageNumbers(paginationNumbers);
        },

        renderPageNumbers(container) {
            container.innerHTML = '';
            const maxVisiblePages = 5;
            let startPage = Math.max(1, App.state.ui.currentPage - Math.floor(maxVisiblePages / 2));
            let endPage = Math.min(App.state.ui.totalPages, startPage + maxVisiblePages - 1);

            if (endPage - startPage + 1 < maxVisiblePages) {
                startPage = Math.max(1, endPage - maxVisiblePages + 1);
            }

            if (startPage > 1) {
                const firstPageNum = document.createElement('button');
                firstPageNum.className = 'pagination-number';
                firstPageNum.textContent = '1';
                firstPageNum.onclick = () => App.pagination.goToPage(1);
                container.appendChild(firstPageNum);

                if (startPage > 2) {
                    const ellipsis = document.createElement('span');
                    ellipsis.className = 'pagination-ellipsis';
                    ellipsis.textContent = '...';
                    container.appendChild(ellipsis);
                }
            }

            for (let i = startPage; i <= endPage; i++) {
                const pageNum = document.createElement('button');
                pageNum.className = `pagination-number ${i === App.state.ui.currentPage ? 'active' : ''}`;
                pageNum.textContent = i;
                pageNum.onclick = () => App.pagination.goToPage(i);
                container.appendChild(pageNum);
            }

            if (endPage < App.state.ui.totalPages) {
                if (endPage < App.state.ui.totalPages - 1) {
                    const ellipsis = document.createElement('span');
                    ellipsis.className = 'pagination-ellipsis';
                    ellipsis.textContent = '...';
                    container.appendChild(ellipsis);
                }

                const lastPageNum = document.createElement('button');
                lastPageNum.className = 'pagination-number';
                lastPageNum.textContent = App.state.ui.totalPages;
                lastPageNum.onclick = () => App.pagination.goToPage(App.state.ui.totalPages);
                container.appendChild(lastPageNum);
            }
        }
    },

    // =========================
    // 뷰 관련 (테이블/카드)
    // =========================
    view: {
        switch(viewType) {
            App.state.ui.currentView = viewType;
            const tableView = document.getElementById('tableView');
            const cardsView = document.getElementById('cardsView');
            const viewBtns = document.querySelectorAll('.view-btn');

            // 모든 버튼에서 active 클래스 제거
            viewBtns.forEach(btn => btn.classList.remove('active'));
            
            // 선택된 뷰 버튼에 active 클래스 추가 (더 안전한 방법으로)
            const targetBtn = document.querySelector(`.view-btn[onclick*="'${viewType}'"]`);
            if (targetBtn) {
                targetBtn.classList.add('active');
            }

            const pageData = App.pagination.getCurrentPageData();

            if (viewType === 'table') {
                tableView.style.display = 'block';
                cardsView.style.display = 'none';
                cardsView.classList.remove('active');
                App.render.table(pageData);
                console.log('📋 테이블 뷰로 전환');
            } else if (viewType === 'cards') {
                tableView.style.display = 'none';
                cardsView.style.display = 'grid';
                cardsView.classList.add('active');
                App.render.cards(pageData);
                console.log('📱 카드 뷰로 전환');
            }
        }
    },

    // =========================
    // 렌더링 관련
    // =========================
    render: {
        currentView() {
            const pageData = App.pagination.getCurrentPageData();
            console.log('🔄 현재 뷰 렌더링:', App.state.ui.currentView, '데이터:', pageData.length, '개');
            
            if (App.state.ui.currentView === 'table') {
                App.render.table(pageData);
            } else {
                App.render.cards(pageData);
            }
        },

        table(dataToRender) {
            const tableContainer = document.querySelector('.table-container');
            
            if (!tableContainer) {
                console.error('❌ table-container를 찾을 수 없습니다.');
                return;
            }

            if (!dataToRender && App.state.data.all.length === 0) {
                tableContainer.innerHTML = App.utils.createSkeletonTable();
                return;
            }

            const renderData = dataToRender || [];

            tableContainer.innerHTML = '';
            const table = document.createElement('table');
            table.className = 'data-table';
            table.setAttribute('role', 'table');
            table.setAttribute('aria-label', '지원자 목록 테이블');

            App.render.tableHeader(table);
            App.render.tableBody(table, renderData);

            tableContainer.appendChild(table);
        },

        tableHeader(table) {
            const thead = table.createTHead();
            const headerRow = thead.insertRow();

            App.state.data.headers.forEach(header => {
                if (App.state.ui.visibleColumns[header]) {
                    const th = document.createElement('th');
                    th.className = 'sortable-header';
                    th.setAttribute('role', 'columnheader');
                    th.setAttribute('tabindex', '0');
                    th.setAttribute('aria-sort', 'none');
                    th.onclick = () => App.table.sort(header);

                    th.addEventListener('keydown', (e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            th.click();
                        }
                    });

                    let sortIcon = 'fa-sort';
                    if (App.state.ui.currentSortColumn === header && App.state.ui.currentSortDirection) {
                        sortIcon = App.state.ui.currentSortDirection === 'asc' ? 'fa-sort-up' : 'fa-sort-down';
                    }

                    th.innerHTML = `${header} <i class="fas ${sortIcon} sort-icon ${App.state.ui.currentSortColumn === header ? 'active' : ''}"></i>`;
                    headerRow.appendChild(th);
                }
            });
        },

        tableBody(table, dataToRender) {
            const tbody = table.createTBody();

            if (!dataToRender || dataToRender.length === 0) {
                const row = tbody.insertRow();
                const cell = row.insertCell();
                cell.colSpan = Object.values(App.state.ui.visibleColumns).filter(Boolean).length || 1;
                cell.textContent = '표시할 데이터가 없습니다.';
                cell.style.textAlign = 'center';
                cell.style.padding = '40px';
                return;
            }

            let interviewDateIndex = App.state.data.headers.indexOf('면접 날짜');
            if (interviewDateIndex === -1) interviewDateIndex = App.state.data.headers.indexOf('면접 날자');

            dataToRender.forEach((rowData, index) => {
                const row = tbody.insertRow();
                row.id = `row-${index}`;

                row.onclick = (event) => {
                    if (event.target.tagName !== 'A') {
                        App.modal.openDetail(rowData);
                    }
                };

                if (interviewDateIndex !== -1) {
                    const urgency = App.utils.getInterviewUrgency(rowData[interviewDateIndex]);
                    if (urgency >= 0) row.classList.add(`urgent-interview-${urgency}`);
                }

                App.render.tableCells(row, rowData, index);
            });
        },

        tableCells(row, rowData, index) {
            App.state.data.headers.forEach((header, cellIndex) => {
                if (App.state.ui.visibleColumns[header]) {
                    const cell = row.insertCell();
                    let cellData = rowData[cellIndex];

                    if (header === '구분') {
                        const displaySequence = (App.state.ui.currentPage - 1) * App.config.ITEMS_PER_PAGE + index + 1;
                        cellData = displaySequence;
                    }

                    const statusClass = App.utils.getStatusClass(header, cellData);
                    if (statusClass) {
                        cell.innerHTML = `<span class="status-badge ${statusClass}">${String(cellData || '')}</span>`;
                    } else if (header === '연락처' && cellData) {
                        cell.innerHTML = `<a href="tel:${String(cellData).replace(/\D/g, '')}">${cellData}</a>`;
                    } else if (header === '면접 시간' && cellData) {
                        cell.textContent = App.utils.formatInterviewTime(cellData);
                    } else if ((header.includes('날짜') || header.includes('날자') || header.includes('지원일') || header.includes('입과일')) && cellData) {
                        cell.textContent = App.utils.formatDate(cellData);
                    } else {
                        cell.textContent = String(cellData || '');
                    }
                }
            });
        },

        cards(dataToRender) {
            const cardsContainer = document.getElementById('cardsView');
            
            if (!cardsContainer) {
                console.error('❌ cardsView 컨테이너를 찾을 수 없습니다.');
                return;
            }

            cardsContainer.innerHTML = '';

            if (!dataToRender || dataToRender.length === 0) {
                cardsContainer.innerHTML = '<p style="text-align:center; padding: 40px; grid-column: 1/-1; color: var(--text-secondary);">표시할 데이터가 없습니다.</p>';
                return;
            }

            console.log('📱 카드 렌더링 시작:', dataToRender.length, '개 항목');

            let interviewDateIndex = App.state.data.headers.indexOf('면접 날짜');
            if (interviewDateIndex === -1) interviewDateIndex = App.state.data.headers.indexOf('면접 날자');

            dataToRender.forEach((rowData, index) => {
                const card = document.createElement('div');
                card.className = 'applicant-card';
                card.onclick = () => App.modal.openDetail(rowData);

                if (interviewDateIndex !== -1) {
                    const urgency = App.utils.getInterviewUrgency(rowData[interviewDateIndex]);
                    if (urgency >= 0) card.classList.add(`urgent-card-${urgency}`);
                }

                const getVal = (header) => String(rowData[App.state.data.headers.indexOf(header)] || '-');
                const name = getVal('이름');
                const phone = getVal('연락처');
                const route = getVal('지원루트');
                const position = getVal('모집분야');
                const recruiter = getVal('증원자');
                const contactResult = getVal('1차 컨택 결과');
                let date = getVal('지원일');

                if(date !== '-') {
                    try {
                        date = new Date(date).toLocaleDateString('ko-KR');
                    } catch(e) {}
                }

                const displaySequence = (App.state.ui.currentPage - 1) * App.config.ITEMS_PER_PAGE + index + 1;

                // 상태 표시를 위한 클래스
                const statusClass = App.utils.getStatusClass('1차 컨택 결과', contactResult);
                const statusBadge = statusClass ? `<span class="status-badge ${statusClass}">${contactResult}</span>` : contactResult;

                card.innerHTML = `
                    <div class="card-header">
                        <div class="card-name">${name}</div>
                        <div class="card-sequence">#${displaySequence}</div>
                    </div>
                    <div class="card-info">
                        <div><span class="card-label">📞 연락처:</span> ${phone}</div>
                        <div><span class="card-label">🔗 지원루트:</span> ${route}</div>
                        <div><span class="card-label">💼 모집분야:</span> ${position}</div>
                        <div><span class="card-label">👤 증원자:</span> ${recruiter}</div>
                        <div><span class="card-label">📋 상태:</span> ${statusBadge}</div>
                    </div>
                    <div class="card-footer">
                        <span>📅 지원일: ${date}</span>
                        ${phone !== '-' ? `<a href="tel:${phone.replace(/\D/g, '')}" onclick="event.stopPropagation()" class="phone-link"><i class="fas fa-phone"></i></a>` : ''}
                    </div>`;
                cardsContainer.appendChild(card);
            });

            console.log('✅ 카드 렌더링 완료');
        }
    },

    // =========================
    // 테이블 관련
    // =========================
    table: {
        sort(columnName) {
            if (App.state.ui.currentSortColumn === columnName) {
                App.state.ui.currentSortDirection = App.state.ui.currentSortDirection === 'asc' ? 'desc' : '';
                if (App.state.ui.currentSortDirection === '') {
                    App.state.ui.currentSortColumn = '지원일';
                    App.state.ui.currentSortDirection = 'desc';
                }
            } else {
                App.state.ui.currentSortColumn = columnName;
                App.state.ui.currentSortDirection = 'asc';
            }
            App.filter.apply();
        }
    },

    // =========================
    // 🔥 사이드바 관련 (면접 대기 카드 세분화 포함)
    // =========================
    sidebar: {
        handlePeriodChange() {
            const selectedPeriod = document.getElementById('sidebarPeriodFilter').value;
            const customRange = document.getElementById('sidebarCustomDateRange');

            if (selectedPeriod === 'custom') {
                customRange.style.display = 'block';
            } else {
                customRange.style.display = 'none';
                App.sidebar.updateWidgets();
            }
        },

        updateWidgets() {
            const selectedPeriod = document.getElementById('sidebarPeriodFilter')?.value || 'all';
            const customStartDate = document.getElementById('sidebarStartDate')?.value;
            const customEndDate = document.getElementById('sidebarEndDate')?.value;
            
            // 캐시 키를 위한 필터 정보
            const filters = {
                period: selectedPeriod,
                startDate: customStartDate,
                endDate: customEndDate,
                dataLength: App.state.data.all.length
            };

            // 캐시 확인
            const cachedResult = App.cache.get('sidebar', filters);
            if (cachedResult) {
                App.sidebar.updateUI(cachedResult.stats, cachedResult.periodLabel);
                if (document.getElementById('stats').classList.contains('active')) {
                    App.stats.update();
                }
                // 🔥 추가: 면접 위젯 업데이트
                App.sidebar.updateInterviewDetails();
                return;
            }

            // 캐시가 없으면 새로 계산
            const applyDateIndex = App.state.data.headers.indexOf('지원일');
            let filteredApplicants = [...App.state.data.all];
            let periodLabel = '전체 기간';

            if (applyDateIndex !== -1 && selectedPeriod !== 'all') {
                const result = App.sidebar.filterByPeriod(filteredApplicants, selectedPeriod, applyDateIndex);
                filteredApplicants = result.data;
                periodLabel = result.label;
            }

            const stats = App.sidebar.calculateStats(filteredApplicants);
            
            // 결과를 캐시에 저장
            const result = { stats, periodLabel };
            App.cache.set('sidebar', filters, result);
            
            App.sidebar.updateUI(stats, periodLabel);

            if (document.getElementById('stats').classList.contains('active')) {
                App.stats.update();
            }

            // 🔥 추가: 면접 위젯 업데이트
            App.sidebar.updateInterviewDetails();
        },

        filterByPeriod(data, selectedPeriod, applyDateIndex) {
            const now = new Date();
            let filteredData = [...data];
            let label = '전체 기간';

            try {
                if (selectedPeriod === 'custom') {
                    const startDateElement = document.getElementById('sidebarStartDate');
                    const endDateElement = document.getElementById('sidebarEndDate');
                    
                    const startDate = startDateElement ? startDateElement.value : null;
                    const endDate = endDateElement ? endDateElement.value : null;

                    if (startDate && endDate) {
                        const start = new Date(startDate);
                        const end = new Date(endDate);
                        end.setHours(23, 59, 59, 999);

                        filteredData = data.filter(row => {
                            try {
                                const dateValue = row[applyDateIndex];
                                if (!dateValue) return false;
                                const date = new Date(dateValue);
                                return date >= start && date <= end;
                            } catch (e) { return false; }
                        });
                        
                        const startStr = start.toLocaleDateString('ko-KR');
                        const endStr = end.toLocaleDateString('ko-KR');
                        label = `${startStr} ~ ${endStr}`;
                    }
                } else {
                    const result = App.utils.filterDataByPeriod(data, selectedPeriod, applyDateIndex, now);
                    filteredData = result.data;
                    label = result.label;
                }
            } catch (error) {
                console.error('사이드바 날짜 필터링 오류:', error);
                filteredData = data;
                label = '전체 기간';
            }

            return { data: filteredData, label };
        },

        calculateStats(filteredApplicants) {
            const contactResultIndex = App.state.data.headers.indexOf('1차 컨택 결과');
            const interviewResultIndex = App.state.data.headers.indexOf('면접결과');
            const joinDateIndex = App.state.data.headers.indexOf('입과일');
            
            const totalCount = filteredApplicants.length;
            let interviewPendingCount = 0;
            
            if (contactResultIndex !== -1) {
                const today = new Date(); // 🔥 현재 시간 기준
                console.log('🔍 현재 시간:', today); // 🔥 디버깅용
                
                let interviewDateIndex = App.state.data.headers.indexOf('면접 날짜');
                if (interviewDateIndex === -1) interviewDateIndex = App.state.data.headers.indexOf('면접 날자');
                const interviewTimeIndex = App.state.data.headers.indexOf('면접 시간');
                
                console.log('🔍 전체 필터링된 지원자:', filteredApplicants.length); // 🔥 디버깅용
                
                interviewPendingCount = filteredApplicants.filter(row => {
                    const contactResult = String(row[contactResultIndex] || '').trim();
                    console.log('🔍 1차 컨택 결과:', contactResult); // 🔥 디버깅용
                    
                    if (contactResult !== '면접확정') return false;
                    
                    if (interviewDateIndex !== -1) {
                        const interviewDate = row[interviewDateIndex];
                        const interviewTime = row[interviewTimeIndex];
                        console.log('🔍 면접 날짜:', interviewDate, '면접 시간:', interviewTime); // 🔥 디버깅용
                        
                        if (interviewDate) {
                            try {
                                const date = new Date(interviewDate);
                                
                                // 🔥 면접 시간 설정 로직 개선
                                if (interviewTime) {
                                    const timeStr = String(interviewTime).replace(/'/g, '').trim();
                                    console.log('🔍 면접 시간 파싱 전:', timeStr); // 🔥 디버깅용
                                    const timeMatch = timeStr.match(/(\d{1,2})[시:]?\s*(\d{0,2})/);
                                    
                                    if (timeMatch) {
                                        const hour = parseInt(timeMatch[1]);
                                        const minute = parseInt(timeMatch[2] || '0');
                                        console.log('🔍 파싱된 시간:', hour, '시', minute, '분'); // 🔥 디버깅용
                                        
                                        // 🔥 시간 유효성 검사 추가
                                        if (hour >= 0 && hour <= 23 && minute >= 0 && minute <= 59) {
                                            date.setHours(hour, minute, 0, 0);
                                        } else {
                                            console.log('🔍 잘못된 시간 형식, 하루 끝으로 설정'); // 🔥 디버깅용
                                            date.setHours(23, 59, 59, 999);
                                        }
                                    } else {
                                        console.log('🔍 시간 파싱 실패, 하루 끝으로 설정'); // 🔥 디버깅용
                                        date.setHours(23, 59, 59, 999);
                                    }
                                } else {
                                    console.log('🔍 시간 정보 없음, 하루 끝으로 설정'); // 🔥 디버깅용
                                    date.setHours(23, 59, 59, 999);
                                }
                                
                                console.log('🔍 최종 면접 시간:', date); // 🔥 디버깅용
                                console.log('🔍 면접 시간 >= 현재 시간:', date >= today); // 🔥 디버깅용
                                
                                // 🔥 현재 시간 이후만 카운트
                                const isUpcoming = date >= today;
                                if (isUpcoming) {
                                    console.log('✅ 카운트에 포함됨:', row[App.state.data.headers.indexOf('이름')]); // 🔥 디버깅용
                                }
                                return isUpcoming;
                            } catch (e) {
                                console.error('🔍 날짜 파싱 오류:', e); // 🔥 디버깅용
                                return false;
                            }
                        }
                    }
                    return false;
                }).length;
            }

            console.log('🔍 최종 면접 대기 인원:', interviewPendingCount); // 🔥 디버깅용

            // 🔥 합격률 계산
            let successRate = 0;
            if (interviewResultIndex !== -1 && totalCount > 0) {
                const passedApplicants = filteredApplicants.filter(row => {
                    const interviewResult = String(row[interviewResultIndex] || '').trim();
                    return interviewResult === '합격';
                });
                successRate = Math.round((passedApplicants.length / totalCount) * 100);
            }

            // 🔥 입과율 계산
            let joinRate = 0;
            if (joinDateIndex !== -1 && totalCount > 0) {
                const joinedApplicants = filteredApplicants.filter(row => {
                    const joinDate = String(row[joinDateIndex] || '').trim();
                    return joinDate !== '' && joinDate !== '-';
                });
                joinRate = Math.round((joinedApplicants.length / totalCount) * 100);
            }

            return { totalCount, interviewPendingCount, successRate, joinRate };
        },
        updateUI(stats, periodLabel) {
            document.getElementById('sidebarTotalApplicants').textContent = stats.totalCount;
            document.getElementById('sidebarPeriodLabel').textContent = periodLabel;
            document.getElementById('sidebarSuccessRate').textContent = stats.successRate + '%';
            document.getElementById('sidebarJoinRate').textContent = stats.joinRate + '%';
        },

        showInterviewPending() {
            console.log('🎯 면접 대기자 필터링 시작');
            
            const contactResultIndex = App.state.data.headers.indexOf('1차 컨택 결과');
            let interviewDateIndex = App.state.data.headers.indexOf('면접 날짜');
            if (interviewDateIndex === -1) interviewDateIndex = App.state.data.headers.indexOf('면접 날자');
            
            if (contactResultIndex === -1) {
                alert('1차 컨택 결과 컬럼을 찾을 수 없습니다.');
                return;
            }
            
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            
            App.filter.reset(false);
            
            App.state.data.filtered = App.state.data.all.filter(row => {
                const contactResult = String(row[contactResultIndex] || '').trim();
                if (contactResult !== '면접확정') return false;
                
                if (interviewDateIndex !== -1) {
                    const interviewDate = row[interviewDateIndex];
                    if (interviewDate) {
                        try {
                            const date = new Date(interviewDate);
                            date.setHours(0, 0, 0, 0);
                            return date >= today;
                        } catch (e) {
                            return false;
                        }
                    }
                }
                return false;
            });
            
            if (interviewDateIndex !== -1) {
                App.state.data.filtered.sort((a, b) => {
                    const dateA = new Date(a[interviewDateIndex] || '9999-12-31');
                    const dateB = new Date(b[interviewDateIndex] || '9999-12-31');
                    return dateA - dateB;
                });
            }
            
            App.state.ui.currentPage = 1;
            App.pagination.updateTotal();
            App.filter.updateSummary();
            
            const pageData = App.pagination.getCurrentPageData();
            if (App.state.ui.currentView === 'table') {
                App.render.table(pageData);
            } else {
                App.render.cards(pageData);
            }
            
            App.pagination.updateUI();
            
            const count = App.state.data.filtered.length;
            console.log(`✅ 면접 대기자 ${count}명 필터링 완료`);
            
            if (count === 0) {
                alert('앞으로 예정된 면접 대기자가 없습니다.');
            }
        },

        // 🔥 ===== 여기부터 새로 추가된 면접 대기 카드 세분화 함수들 =====

        // 면접 위젯 토글
        toggleInterviewWidget() {
            const details = document.getElementById('interviewDetails');
            const icon = document.getElementById('interviewToggleIcon');
            
            if (details && icon) {
                const isExpanded = details.classList.contains('expanded');
                
                if (isExpanded) {
                    details.classList.remove('expanded');
                    icon.classList.remove('expanded');
                } else {
                    details.classList.add('expanded');
                    icon.classList.add('expanded');
                    // 확장 시 데이터 업데이트
                    App.sidebar.updateInterviewDetails();
                }
            }
        },

        // 면접 기간 필터 변경
        updateInterviewPeriod() {
            const periodSelect = document.getElementById('interviewPeriodSelect');
            const customRange = document.getElementById('interviewCustomDateRange');
            
            if (periodSelect && periodSelect.value === 'custom') {
                if (customRange) {
                    customRange.style.display = 'block';
                }
            } else {
                if (customRange) {
                    customRange.style.display = 'none';
                }
                App.sidebar.updateInterviewDetails();
            }
        },

        // 🔥 새로운 면접 상세 정보 업데이트
        updateInterviewDetails() {
            const periodSelect = document.getElementById('interviewPeriodSelect');
            const period = periodSelect ? periodSelect.value : 'today';
            
            try {
                // 시간 기준 필터링된 면접 데이터 가져오기
                const interviewData = App.sidebar.getInterviewDataByTime(period);
                
                // 전체 카운트 업데이트
                const totalCountElement = document.getElementById('interviewTotalCount');
                const periodLabelElement = document.getElementById('interviewPeriodLabel');
                
                if (totalCountElement) {
                    totalCountElement.textContent = `${interviewData.total}명`;
                }
                if (periodLabelElement) {
                    periodLabelElement.textContent = interviewData.periodLabel;
                }
                
                // 면접관별 상세 정보 렌더링
                App.sidebar.renderInterviewerDetails(interviewData.byInterviewer);
                
            } catch (error) {
                console.error('❌ 면접 상세 정보 업데이트 실패:', error);
            }
        },

        // 🔥 시간 기준 면접 데이터 계산
        getInterviewDataByTime(period) {
            const contactResultIndex = App.state.data.headers.indexOf('1차 컨택 결과');
            let interviewDateIndex = App.state.data.headers.indexOf('면접 날짜');
            if (interviewDateIndex === -1) interviewDateIndex = App.state.data.headers.indexOf('면접 날자');
            const interviewTimeIndex = App.state.data.headers.indexOf('면접 시간'); // 🔥 이 줄 추가!
            const interviewerIndex = App.state.data.headers.indexOf('면접관');
            const nameIndex = App.state.data.headers.indexOf('이름');

            if (contactResultIndex === -1 || interviewDateIndex === -1) {
                return { total: 0, byInterviewer: {}, periodLabel: '데이터 없음' };
            }

            const now = new Date();
            let startTime, endTime, periodLabel;

            // 기간별 시간 범위 설정
            switch (period) {
                case 'today':
                    startTime = new Date(now);
                    // 🔥 수정: 현재 시간 그대로 사용
                    endTime = new Date(now);
                    endTime.setHours(23, 59, 59, 999);
                    periodLabel = '금일 남은 시간';
                    break;
                case 'tomorrow':
                    startTime = new Date(now);
                    startTime.setDate(now.getDate() + 1);
                    startTime.setHours(0, 0, 0, 0);
                    endTime = new Date(startTime);
                    endTime.setHours(23, 59, 59, 999);
                    periodLabel = '내일';
                    break;
                case 'week':
                    startTime = new Date(now);
                    endTime = new Date(now);
                    endTime.setDate(now.getDate() + 7);
                    endTime.setHours(23, 59, 59, 999);
                    periodLabel = '향후 7일';
                    break;
                case 'month':
                    startTime = new Date(now);
                    endTime = new Date(now);
                    endTime.setMonth(now.getMonth() + 1);
                    endTime.setHours(23, 59, 59, 999);
                    periodLabel = '이번 달';
                    break;
                case 'custom':
                    const startDateInput = document.getElementById('interviewStartDate');
                    const endDateInput = document.getElementById('interviewEndDate');
                    if (startDateInput && endDateInput && startDateInput.value && endDateInput.value) {
                        startTime = new Date(startDateInput.value);
                        endTime = new Date(endDateInput.value);
                        endTime.setHours(23, 59, 59, 999);
                        periodLabel = `${startDateInput.value} ~ ${endDateInput.value}`;
                    } else {
                        return { total: 0, byInterviewer: {}, periodLabel: '기간 선택 필요' };
                    }
                    break;
                default:
                    startTime = new Date(now);
                    endTime = new Date(now);
                    endTime.setDate(now.getDate() + 7);
                    periodLabel = '향후 7일';
            }

            // 면접 확정자 필터링
            const interviews = App.state.data.all.filter(row => {
                const contactResult = String(row[contactResultIndex] || '').trim();
                if (contactResult !== '면접확정') return false;

                const interviewDate = row[interviewDateIndex];
                const interviewTime = row[interviewTimeIndex];
                
                if (!interviewDate) return false;

                try {
                    const date = new Date(interviewDate);
                    
                    // 🔥 수정: 모든 기간에서 면접 시간 고려
                    if (interviewTime) {
                        const timeStr = String(interviewTime).replace(/'/g, '').trim();
                        const timeMatch = timeStr.match(/(\d{1,2})[시:]?\s*(\d{0,2})/);
                        
                        if (timeMatch) {
                            const hour = parseInt(timeMatch[1]);
                            const minute = parseInt(timeMatch[2] || '0');
                            if (hour >= 0 && hour <= 23 && minute >= 0 && minute <= 59) {
                                date.setHours(hour, minute, 0, 0);
                            } else {
                                if (period === 'today') {
                                    date.setHours(23, 59, 59, 999);
                                } else {
                                    date.setHours(0, 0, 0, 0);
                                }
                            }
                        } else {
                            if (period === 'today') {
                                date.setHours(23, 59, 59, 999);
                            } else {
                                date.setHours(0, 0, 0, 0);
                            }
                        }
                    } else {
                        if (period === 'today') {
                            date.setHours(23, 59, 59, 999);
                        } else {
                            date.setHours(0, 0, 0, 0);
                        }
                    }

                    return date >= startTime && date <= endTime;
                } catch (e) {
                    return false;
                }
            });

            // 면접관별 그룹핑
            const byInterviewer = {};
            interviews.forEach(row => {
                const interviewer = String(row[interviewerIndex] || '미정').trim();
                const name = String(row[nameIndex] || '').trim();
                
                if (!byInterviewer[interviewer]) {
                    byInterviewer[interviewer] = {
                        count: 0,
                        applicants: []
                    };
                }
                
                byInterviewer[interviewer].count++;
                byInterviewer[interviewer].applicants.push(name);
            });

            return {
                total: interviews.length,
                byInterviewer,
                periodLabel
            };
        },

        // 🔥 면접관별 상세 정보 렌더링
        renderInterviewerDetails(byInterviewer) {
            const container = document.getElementById('interviewByInterviewer');
            if (!container) {
                console.warn('interviewByInterviewer 요소를 찾을 수 없습니다.');
                return;
            }

            if (Object.keys(byInterviewer).length === 0) {
                container.innerHTML = '<div style="text-align: center; color: rgba(255,255,255,0.6); font-size: 0.85rem; padding: 10px;">예정된 면접이 없습니다</div>';
                return;
            }

            let html = '';
            Object.entries(byInterviewer)
                .sort(([,a], [,b]) => b.count - a.count) // 인원 수 많은 순으로 정렬
                .forEach(([interviewer, data]) => {
                    const applicantsList = data.applicants.slice(0, 3).join(', ') + 
                                         (data.applicants.length > 3 ? ` 외 ${data.applicants.length - 3}명` : '');
                    
                    html += `
                        <div class="interviewer-item">
                            <div>
                                <div class="interviewer-name">${interviewer}</div>
                                <div class="interviewer-applicants">${applicantsList}</div>
                            </div>
                            <div class="interviewer-count">${data.count}</div>
                        </div>
                    `;
                });

            container.innerHTML = html;
        }
    },

    // =========================
    // 통계 관련
    // =========================
    stats: {
        handlePeriodChange() {
            const selectedPeriod = document.getElementById('statsPeriodFilter').value;
            const customRange = document.getElementById('statsCustomDateRange');

            if (selectedPeriod === 'custom') {
                customRange.style.display = 'flex';
            } else {
                customRange.style.display = 'none';
                App.stats.update();
            }
        },

        update() {
            if (!App.state.data.all || App.state.data.all.length === 0) {
                console.log('데이터가 없어서 통계 업데이트 불가');
                return;
            }

            try {
                const selectedPeriod = document.getElementById('statsPeriodFilter')?.value || 'all';
                const customStartDate = document.getElementById('statsStartDate')?.value;
                const customEndDate = document.getElementById('statsEndDate')?.value;
                
                // 캐시 키를 위한 필터 정보
                const filters = {
                    period: selectedPeriod,
                    startDate: customStartDate,
                    endDate: customEndDate,
                    dataLength: App.state.data.all.length // 데이터 변경 감지용
                };

                // 캐시 확인
                const cachedResult = App.cache.get('stats', filters);
                if (cachedResult) {
                    // 캐시된 데이터로 즉시 렌더링
                    App.stats.updateStatCards(cachedResult.stats, cachedResult.periodLabel);
                    if (window.Chart && Object.keys(App.state.charts.instances).length > 0) {
                        App.charts.updateData(cachedResult.filteredData);
                    }
                    App.trend.update(cachedResult.filteredData, cachedResult.applyDateIndex);
                    return cachedResult;
                }

                // 캐시가 없으면 새로 계산
                console.log('🔄 통계 새로 계산 중...');
                
                const applyDateIndex = App.state.data.headers.indexOf('지원일');
                let filteredApplicants = [...App.state.data.all];
                let periodLabel = '전체 기간';

                if (applyDateIndex !== -1 && selectedPeriod !== 'all') {
                    const result = App.stats.filterByPeriod(filteredApplicants, selectedPeriod, applyDateIndex);
                    filteredApplicants = result.data;
                    periodLabel = result.label;
                }

                const stats = App.sidebar.calculateStats(filteredApplicants);
                
                // 결과를 캐시에 저장
                const result = {
                    stats,
                    periodLabel,
                    filteredData: filteredApplicants,
                    applyDateIndex
                };
                App.cache.set('stats', filters, result);

                // 화면 업데이트
                App.stats.updateStatCards(stats, periodLabel);
                if (window.Chart && Object.keys(App.state.charts.instances).length > 0) {
                    App.charts.updateData(filteredApplicants);
                }
                App.trend.update(filteredApplicants, applyDateIndex);

                return result;

            } catch (error) {
                console.error('❌ 통계 데이터 업데이트 실패:', error);
            }
        },
        
        filterByPeriod(data, selectedPeriod, applyDateIndex) {
            return App.sidebar.filterByPeriod(data, selectedPeriod, applyDateIndex);
        },

        updateStatCards(stats, periodLabel) {
            // 🔥 통계 카드들이 삭제되었으므로 이 함수는 비워둠
            console.log('📊 통계 정보:', {
                totalApplicants: stats.totalCount,
                interviewPending: stats.interviewPendingCount,
                successRate: stats.successRate + '%',
                joinRate: stats.joinRate + '%',
                period: periodLabel
            });
        }
    },

    
    // =========================
    // 🔥 개선된 차트 관련 (반응형 리사이즈 추가)
    // =========================
    charts: {
        initialize() {
            if (!window.Chart) {
                console.error('Chart.js가 로드되지 않았습니다.');
                return;
            }

            try {
                App.charts.createRouteChart();
                App.charts.createPositionChart();
                App.charts.createTrendChart();
                // 🔥 인구통계 차트들은 새로운 시스템으로 대체됨

                // 🔥 반응형 리사이즈 이벤트 리스너 추가
                App.charts.setupResponsiveResize();

                console.log('📊 기본 차트 초기화 완료');

            } catch (error) {
                console.error('기본 차트 초기화 실패:', error);
            }
        },

        initializeEfficiency() {
            if (!window.Chart) {
                console.error('Chart.js가 로드되지 않았습니다.');
                return;
            }

            try {
                App.charts.createRadarChart();
                App.charts.createScatterChart();

                // 🔥 효율성 차트도 반응형 리사이즈 적용
                App.charts.setupResponsiveResize();

                console.log('📈 효율성 차트 초기화 완료');

            } catch (error) {
                console.error('효율성 차트 초기화 실패:', error);
            }
        },

        // 🔥 새로운 함수: 반응형 리사이즈 설정
        setupResponsiveResize() {
            let resizeTimeout;
            
            const handleResize = () => {
                clearTimeout(resizeTimeout);
                resizeTimeout = setTimeout(() => {
                    console.log('🔄 화면 크기 변경 감지 - 차트 리사이즈 중...');
                    
                    // 모든 차트 인스턴스 리사이즈
                    Object.values(App.state.charts.instances).forEach(chart => {
                        if (chart && typeof chart.resize === 'function') {
                            try {
                                chart.resize();
                                chart.update('none'); // 애니메이션 없이 업데이트
                            } catch (error) {
                                console.warn('차트 리사이즈 실패:', error);
                            }
                        }
                    });
                    
                    console.log('✅ 모든 차트 리사이즈 완료');
                }, 300); // 300ms 디바운스
            };
            
            // 기존 리스너 제거 (중복 방지)
            window.removeEventListener('resize', handleResize);
            
            // 새 리스너 추가
            window.addEventListener('resize', handleResize);
            
            // 브라우저 줌 감지도 추가
            let lastWidth = window.innerWidth;
            let lastHeight = window.innerHeight;
            
            const checkZoom = () => {
                const currentWidth = window.innerWidth;
                const currentHeight = window.innerHeight;
                
                if (Math.abs(currentWidth - lastWidth) > 50 || Math.abs(currentHeight - lastHeight) > 50) {
                    handleResize();
                    lastWidth = currentWidth;
                    lastHeight = currentHeight;
                }
            };
            
            setInterval(checkZoom, 1000); // 1초마다 확인
            
            console.log('📐 반응형 리사이즈 시스템 설정 완료');
        },

        createRouteChart() {
            const routeCtx = document.getElementById('routeChart');
            if (routeCtx && !App.state.charts.instances.route) {
                App.state.charts.instances.route = new Chart(routeCtx, {
                    type: 'bar',
                    data: {
                        labels: ['데이터 로딩 중...'],
                        datasets: [{
                            data: [1],
                            backgroundColor: App.config.CHART_COLORS.primary,
                            borderColor: App.config.CHART_COLORS.primary,
                            borderWidth: 1
                        }]
                    },
                    options: {
                        indexAxis: 'y',
                        responsive: true,
                        maintainAspectRatio: false, // 🔥 중요: 컨테이너 크기에 맞춤
                        resizeDelay: 100, // 🔥 리사이즈 지연 시간 단축
                        plugins: {
                            legend: { display: false }
                        },
                        scales: {
                            x: { beginAtZero: true }
                        },
                        // 🔥 새로운 애니메이션 설정
                        animation: {
                            duration: 300 // 빠른 애니메이션
                        }
                    }
                });
            }
        },

        createPositionChart() {
            const positionCtx = document.getElementById('positionChart');
            if (positionCtx && !App.state.charts.instances.position) {
                App.state.charts.instances.position = new Chart(positionCtx, {
                    type: 'bar',
                    data: {
                        labels: ['데이터 로딩 중...'],
                        datasets: [{
                            data: [1],
                            backgroundColor: App.config.CHART_COLORS.success,
                            borderColor: App.config.CHART_COLORS.success,
                            borderWidth: 1
                        }]
                    },
                    options: {
                        indexAxis: 'y',
                        responsive: true,
                        maintainAspectRatio: false, // 🔥 중요
                        resizeDelay: 100,
                        plugins: {
                            legend: { display: false }
                        },
                        scales: {
                            x: { beginAtZero: true }
                        },
                        animation: {
                            duration: 300
                        }
                    }
                });
            }
        },

        createTrendChart() {
            const trendCtx = document.getElementById('trendChart');
            if (trendCtx && !App.state.charts.instances.trend) {
                App.state.charts.instances.trend = new Chart(trendCtx, {
                    type: 'line',
                    data: {
                        labels: ['데이터 로딩 중...'],
                        datasets: [{
                            label: '지원자 수',
                            data: [0],
                            borderColor: App.config.CHART_COLORS.primary,
                            backgroundColor: App.config.CHART_COLORS.primary + '20',
                            tension: 0.4,
                            fill: true
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false, // 🔥 중요
                        resizeDelay: 100,
                        scales: {
                            y: {
                                beginAtZero: true,
                                ticks: { stepSize: 1 }
                            }
                        },
                        animation: {
                            duration: 300
                        }
                    }
                });
            }
        },

       createRadarChart() {
            const radarCtx = document.getElementById('radarChart');
            if (radarCtx && !App.state.charts.instances.radar) {
                App.state.charts.instances.radar = new Chart(radarCtx, {
                    type: 'radar',
                    data: {
                        labels: ['지원자 수', '면접확정률', '합격률', '입과율'],
                        datasets: [{
                            label: '데이터 로딩 중...',
                            data: [1, 1, 1, 1],
                            borderColor: App.config.CHART_COLORS.primary,
                            backgroundColor: App.config.CHART_COLORS.primary + '30',
                            pointBackgroundColor: App.config.CHART_COLORS.primary,
                            pointBorderColor: '#fff',
                            pointHoverBackgroundColor: '#fff',
                            pointHoverBorderColor: App.config.CHART_COLORS.primary
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false, // 🔥 중요
                        resizeDelay: 100,
                        elements: {
                            line: {
                                borderWidth: 3
                            }
                        },
                        scales: {
                            r: {
                                angleLines: {
                                    display: false
                                },
                                suggestedMin: 0,
                                suggestedMax: 100
                            }
                        },
                        animation: {
                            duration: 300
                        }
                    }
                });
            }
        },

        createScatterChart() {
            const scatterCtx = document.getElementById('scatterChart');
            if (scatterCtx && !App.state.charts.instances.scatter) {
                App.state.charts.instances.scatter = new Chart(scatterCtx, {
                    type: 'scatter',
                    data: {
                        datasets: [{
                            label: '나이-합격률 관계',
                            data: [{ x: 25, y: 50 }],
                            backgroundColor: App.config.CHART_COLORS.orange,
                            borderColor: App.config.CHART_COLORS.orange,
                            pointRadius: 6
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false, // 🔥 중요
                        resizeDelay: 100,
                        scales: {
                            x: {
                                type: 'linear',
                                position: 'bottom',
                                title: {
                                    display: true,
                                    text: '나이'
                                }
                            },
                            y: {
                                title: {
                                    display: true,
                                    text: '합격률 (%)'
                                },
                                min: 0,
                                max: 100
                            }
                        },
                        animation: {
                            duration: 300
                        }
                    }
                });
            }
        },

        updateData(filteredData) {
            const routeIndex = App.state.data.headers.indexOf('지원루트');
            const positionIndex = App.state.data.headers.indexOf('모집분야');

            App.charts.updateRouteChart(filteredData, routeIndex);
            App.charts.updatePositionChart(filteredData, positionIndex);
            
            // 🔥 인구통계는 새로운 시스템으로 업데이트
            if (document.querySelector('.demographics-container')) {
                App.demographics.updateCurrentTab();
            }
        },

        // 🔥 추가된 함수
        updateEfficiencyCharts(filteredData) {
            App.charts.updateRadarChart(filteredData);
            App.charts.updateScatterChart(filteredData);
        },

        updateRouteChart(filteredData, routeIndex) {
            if (routeIndex !== -1 && App.state.charts.instances.route) {
                const routeData = {};
                filteredData.forEach(row => {
                    const route = String(row[routeIndex] || '').trim();
                    if (route) {
                        routeData[route] = (routeData[route] || 0) + 1;
                    }
                });

                App.state.charts.instances.route.data.labels = Object.keys(routeData);
                App.state.charts.instances.route.data.datasets[0].data = Object.values(routeData);
                App.state.charts.instances.route.update();
            }
        },

        updatePositionChart(filteredData, positionIndex) {
            if (positionIndex !== -1 && App.state.charts.instances.position) {
                const positionData = {};
                filteredData.forEach(row => {
                    const position = String(row[positionIndex] || '').trim();
                    if (position) {
                        positionData[position] = (positionData[position] || 0) + 1;
                    }
                });

                App.state.charts.instances.position.data.labels = Object.keys(positionData);
                App.state.charts.instances.position.data.datasets[0].data = Object.values(positionData);
                App.state.charts.instances.position.update();
            }
        },
        
        updateRadarChart(filteredData) {
            if (!App.state.charts.instances.radar) return;

            const routeIndex = App.state.data.headers.indexOf('지원루트');
            const contactResultIndex = App.state.data.headers.indexOf('1차 컨택 결과');
            const interviewResultIndex = App.state.data.headers.indexOf('면접결과');
            const joinDateIndex = App.state.data.headers.indexOf('입과일');

            if (routeIndex === -1) return;

            const routes = [...new Set(filteredData.map(row => String(row[routeIndex] || '').trim()).filter(Boolean))];
            const colors = [
                App.config.CHART_COLORS.primary,
                App.config.CHART_COLORS.success,
                App.config.CHART_COLORS.warning,
                App.config.CHART_COLORS.danger,
                App.config.CHART_COLORS.orange
            ];

            const datasets = routes.slice(0, 5).map((route, index) => {
                const routeData = filteredData.filter(row => String(row[routeIndex] || '').trim() === route);
                const totalApplicants = routeData.length;

                let interviewConfirmRate = 0;
                if (contactResultIndex !== -1) {
                    const confirmed = routeData.filter(row => String(row[contactResultIndex] || '').trim() === '면접확정').length;
                    interviewConfirmRate = totalApplicants > 0 ? (confirmed / totalApplicants) * 100 : 0;
                }

                let passRate = 0;
                if (interviewResultIndex !== -1 && contactResultIndex !== -1) {
                    const confirmed = routeData.filter(row => String(row[contactResultIndex] || '').trim() === '면접확정');
                    const passed = confirmed.filter(row => String(row[interviewResultIndex] || '').trim() === '합격');
                    passRate = confirmed.length > 0 ? (passed.length / confirmed.length) * 100 : 0;
                }

                let joinRate = 0;
                if (joinDateIndex !== -1) {
                    const joined = routeData.filter(row => {
                        const joinDate = String(row[joinDateIndex] || '').trim();
                        return joinDate !== '' && joinDate !== '-';
                    }).length;
                    joinRate = totalApplicants > 0 ? (joined / totalApplicants) * 100 : 0;
                }

                const maxApplicants = Math.max(...routes.slice(0, 5).map(r => 
                    filteredData.filter(row => String(row[routeIndex] || '').trim() === r).length
                ));
                const normalizedApplicants = maxApplicants > 0 ? (totalApplicants / maxApplicants) * 100 : 0;

                return {
                    label: route,
                    data: [normalizedApplicants, interviewConfirmRate, passRate, joinRate],
                    borderColor: colors[index],
                    backgroundColor: colors[index] + '30',
                    pointBackgroundColor: colors[index],
                    pointBorderColor: '#fff',
                    pointHoverBackgroundColor: '#fff',
                    pointHoverBorderColor: colors[index]
                };
            });

            App.state.charts.instances.radar.data.datasets = datasets;
            App.state.charts.instances.radar.update();
        },

        updateScatterChart(filteredData) {
            if (!App.state.charts.instances.scatter) return;

            const ageIndex = App.state.data.headers.indexOf('나이');
            const contactResultIndex = App.state.data.headers.indexOf('1차 컨택 결과');
            const interviewResultIndex = App.state.data.headers.indexOf('면접결과');

            if (ageIndex === -1 || contactResultIndex === -1 || interviewResultIndex === -1) return;

            const ageGroups = {};
            
            filteredData.forEach(row => {
                const ageStr = String(row[ageIndex] || '').trim();
                const contactResult = String(row[contactResultIndex] || '').trim();
                const interviewResult = String(row[interviewResultIndex] || '').trim();

                if (!ageStr || ageStr === '-' || contactResult !== '면접확정') return;

                const age = parseInt(ageStr, 10);
                if (isNaN(age)) return;

                if (!ageGroups[age]) {
                    ageGroups[age] = { total: 0, passed: 0 };
                }

                ageGroups[age].total++;
                if (interviewResult === '합격') {
                    ageGroups[age].passed++;
                }
            });

            const scatterData = Object.entries(ageGroups)
                .filter(([age, data]) => data.total >= 2)
                .map(([age, data]) => ({
                    x: parseInt(age),
                    y: Math.round((data.passed / data.total) * 100)
                }));

            if (scatterData.length === 0) {
                scatterData.push({ x: 25, y: 0 }, { x: 35, y: 0 }, { x: 45, y: 0 });
            }

            App.state.charts.instances.scatter.data.datasets[0].data = scatterData;
            App.state.charts.instances.scatter.update();
        }
    },

    // =========================
    // 효율성 분석 관련
    // =========================
    efficiency: {
        handlePeriodChange() {
            const selectedPeriod = document.getElementById('efficiencyPeriodFilter').value;
            const customRange = document.getElementById('efficiencyCustomDateRange');

            if (selectedPeriod === 'custom') {
                customRange.style.display = 'flex';
            } else {
                customRange.style.display = 'none';
                App.efficiency.updateAll();
            }
        },

        updateAll() {
            const selectedPeriod = document.getElementById('efficiencyPeriodFilter')?.value || 'all';
            const filteredData = App.efficiency.getFilteredData(selectedPeriod);
            
            App.efficiency.update(filteredData);
            
            // 🔥 차트 업데이트 호출 수정
            if (App.charts && typeof App.charts.updateEfficiencyCharts === 'function') {
                App.charts.updateEfficiencyCharts(filteredData);
            }
        },

        getFilteredData(selectedPeriod) {
            const applyDateIndex = App.state.data.headers.indexOf('지원일');
            let filteredData = [...App.state.data.all];

            if (applyDateIndex !== -1 && selectedPeriod !== 'all') {
                if (selectedPeriod === 'custom') {
                    const startDate = document.getElementById('efficiencyStartDate')?.value;
                    const endDate = document.getElementById('efficiencyEndDate')?.value;

                    if (startDate && endDate) {
                        const start = new Date(startDate);
                        const end = new Date(endDate);
                        end.setHours(23, 59, 59, 999);

                        filteredData = App.state.data.all.filter(row => {
                            try {
                                const dateValue = row[applyDateIndex];
                                if (!dateValue) return false;
                                const date = new Date(dateValue);
                                return date >= start && date <= end;
                            } catch (e) { return false; }
                        });
                    }
                } else {
                    const now = new Date();
                    const result = App.utils.filterDataByPeriod(App.state.data.all, selectedPeriod, applyDateIndex, now);
                    filteredData = result.data;
                }
            }

            return filteredData;
        },

        switchTab(tabName) {
            App.state.charts.currentEfficiencyTab = tabName;

            document.querySelectorAll('.efficiency-tab-btn').forEach(btn => {
                btn.classList.toggle('active', btn.dataset.tab === tabName);
            });

            App.efficiency.update();
        },

        update(filteredData = null) {
            if (!filteredData) {
                const selectedPeriod = document.getElementById('efficiencyPeriodFilter')?.value || 'all';
                filteredData = App.efficiency.getFilteredData(selectedPeriod);
            }

            const contentDiv = document.getElementById('efficiencyTabContent');

            if (App.state.charts.currentEfficiencyTab === 'route') {
                App.efficiency.updateRoute(filteredData);
            } else if (App.state.charts.currentEfficiencyTab === 'recruiter') {
                App.efficiency.updateRecruiter(filteredData);
            } else if (App.state.charts.currentEfficiencyTab === 'interviewer') {
                App.efficiency.updateInterviewer(filteredData);
            }
        },

        updateRoute(filteredData) {
            try {
                const routeIndex = App.state.data.headers.indexOf('지원루트');

                if (routeIndex === -1) {
                    document.getElementById('efficiencyTabContent').innerHTML = '<p style="text-align: center; padding: 20px; color: var(--text-secondary);">지원루트 데이터를 찾을 수 없습니다.</p>';
                    return;
                }

                const routeStats = App.efficiency.calculateStats(filteredData, routeIndex);
                App.efficiency.renderTable(routeStats, '지원루트');

            } catch (error) {
                console.error('지원루트 효율성 분석 업데이트 실패:', error);
                document.getElementById('efficiencyTabContent').innerHTML = '<p style="text-align: center; padding: 20px; color: var(--danger);">분석 중 오류가 발생했습니다.</p>';
            }
        },

        updateRecruiter(filteredData) {
            try {
                const recruiterIndex = App.state.data.headers.indexOf('증원자');

                if (recruiterIndex === -1) {
                    document.getElementById('efficiencyTabContent').innerHTML = '<p style="text-align: center; padding: 20px; color: var(--text-secondary);">증원자 데이터를 찾을 수 없습니다.</p>';
                    return;
                }

                const recruiterStats = App.efficiency.calculateStats(filteredData, recruiterIndex);
                App.efficiency.renderTable(recruiterStats, '증원자');

            } catch (error) {
                console.error('증원자별 효율성 분석 업데이트 실패:', error);
                document.getElementById('efficiencyTabContent').innerHTML = '<p style="text-align: center; padding: 20px; color: var(--danger);">분석 중 오류가 발생했습니다.</p>';
            }
        },

        updateInterviewer(filteredData) {
            try {
                const interviewerIndex = App.state.data.headers.indexOf('면접관');

                if (interviewerIndex === -1) {
                    document.getElementById('efficiencyTabContent').innerHTML = '<p style="text-align: center; padding: 20px; color: var(--text-secondary);">면접관 데이터를 찾을 수 없습니다.</p>';
                    return;
                }

                const interviewerStats = App.efficiency.calculateStats(filteredData, interviewerIndex);
                App.efficiency.renderTable(interviewerStats, '면접관');

            } catch (error) {
                console.error('면접관별 효율성 분석 업데이트 실패:', error);
                document.getElementById('efficiencyTabContent').innerHTML = '<p style="text-align: center; padding: 20px; color: var(--danger);">분석 중 오류가 발생했습니다.</p>';
            }
        },

        calculateStats(filteredData, categoryIndex) {
            const contactResultIndex = App.state.data.headers.indexOf('1차 컨택 결과');
            const interviewResultIndex = App.state.data.headers.indexOf('면접결과');
            const joinDateIndex = App.state.data.headers.indexOf('입과일');

            const stats = {};

            filteredData.forEach(row => {
                const category = String(row[categoryIndex] || '').trim();
                if (!category || category === '-') return;

                if (!stats[category]) {
                    stats[category] = {
                        total: 0,
                        contacted: 0,
                        interviewConfirmed: 0,
                        passed: 0,
                        joined: 0
                    };
                }

                stats[category].total++;

                if (contactResultIndex !== -1) {
                    const contactResult = String(row[contactResultIndex] || '').trim();
                    if (contactResult !== '' && contactResult !== '-') {
                        stats[category].contacted++;
                    }

                    if (contactResult === '면접확정') {
                        stats[category].interviewConfirmed++;
                    }
                }

                if (interviewResultIndex !== -1) {
                    const interviewResult = String(row[interviewResultIndex] || '').trim();
                    if (interviewResult === '합격') {
                        stats[category].passed++;
                    }
                }

                if (joinDateIndex !== -1) {
                    const joinDate = String(row[joinDateIndex] || '').trim();
                    if (joinDate !== '' && joinDate !== '-') {
                        stats[category].joined++;
                    }
                }
            });

            return stats;
        },

        renderTable(stats, categoryName) {
            const dataArray = Object.entries(stats).map(([name, data]) => {
                const interviewConfirmRate = data.total > 0 ? (data.interviewConfirmed / data.total) * 100 : 0;
                const passRate = data.interviewConfirmed > 0 ? (data.passed / data.interviewConfirmed) * 100 : 0;
                const joinRate = data.total > 0 ? (data.joined / data.total) * 100 : 0;
                const volumeWeight = Math.min(data.total / Math.max(...Object.values(stats).map(s => s.total)), 1) * 100;

                const efficiencyScore = (joinRate * 0.4) + (passRate * 0.3) + (interviewConfirmRate * 0.2) + (volumeWeight * 0.1);

                return {
                    name,
                    ...data,
                    interviewConfirmRate: Math.round(interviewConfirmRate),
                    passRate: Math.round(passRate),
                    joinRate: Math.round(joinRate),
                    efficiencyScore: Math.round(efficiencyScore * 10) / 10
                };
            }).sort((a, b) => b.efficiencyScore - a.efficiencyScore);

            let tableHtml = `
                <div style="overflow-x: auto;">
                    <table class="efficiency-table" style="width: 100%; border-collapse: collapse; font-size: 0.9rem;">
                        <thead>
                            <tr style="background: var(--main-bg);">
                                <th style="padding: 12px; text-align: left; border-bottom: 2px solid var(--border-color); font-weight: 600;">${categoryName}</th>
                                <th style="padding: 12px; text-align: center; border-bottom: 2px solid var(--border-color); font-weight: 600;">총 지원자</th>
                                <th style="padding: 12px; text-align: center; border-bottom: 2px solid var(--border-color); font-weight: 600;">면접확정</th>
                                <th style="padding: 12px; text-align: center; border-bottom: 2px solid var(--border-color); font-weight: 600;">합격자</th>
                                <th style="padding: 12px; text-align: center; border-bottom: 2px solid var(--border-color); font-weight: 600;">입과자</th>
                                <th style="padding: 12px; text-align: center; border-bottom: 2px solid var(--border-color); font-weight: 600;">면접확정률</th>
                                <th style="padding: 12px; text-align: center; border-bottom: 2px solid var(--border-color); font-weight: 600;">합격률</th>
                                <th style="padding: 12px; text-align: center; border-bottom: 2px solid var(--border-color); font-weight: 600; color: var(--accent-orange);">최종 입과율</th>
                                <th style="padding: 12px; text-align: center; border-bottom: 2px solid var(--border-color); font-weight: 600;">효율성 점수</th>
                            </tr>
                        </thead>
                        <tbody>
            `;

            dataArray.forEach((item, index) => {
                const rankColor = index === 0 ? 'var(--success)' : index === 1 ? 'var(--warning)' : index === 2 ? 'var(--accent-orange)' : 'var(--text-primary)';
                const rankIcon = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '';
                const rankClass = index === 0 ? 'efficiency-rank-1' : index === 1 ? 'efficiency-rank-2' : index === 2 ? 'efficiency-rank-3' : '';

                tableHtml += `
                    <tr class="${rankClass}" style="border-bottom: 1px solid var(--border-color); transition: all 0.2s ease;" onmouseover="this.style.transform='translateX(2px)'" onmouseout="this.style.transform='translateX(0)'">
                        <td style="padding: 12px; font-weight: 600; color: ${rankColor};">${rankIcon} ${item.name}</td>
                        <td style="padding: 12px; text-align: center; font-weight: 500;">${item.total.toLocaleString()}</td>
                        <td style="padding: 12px; text-align: center;">${item.interviewConfirmed}</td>
                        <td style="padding: 12px; text-align: center;">${item.passed}</td>
                        <td style="padding: 12px; text-align: center;">${item.joined}</td>
                        <td style="padding: 12px; text-align: center;">${item.interviewConfirmRate}%</td>
                        <td style="padding: 12px; text-align: center;">${item.passRate}%</td>
                        <td style="padding: 12px; text-align: center; font-weight: bold; color: var(--accent-orange);">${item.joinRate}%</td>
                        <td style="padding: 12px; text-align: center; font-weight: bold; color: ${rankColor}; font-size: 1.1rem;">${item.efficiencyScore}</td>
                    </tr>
                `;
            });

            tableHtml += `
                        </tbody>
                    </table>
                </div>
                <div style="margin-top: 15px; padding: 15px; background: var(--main-bg); border-radius: 8px; font-size: 0.85rem; color: var(--text-secondary);">
                    <strong>📊 효율성 점수 계산법:</strong> (입과율 × 0.4) + (합격률 × 0.3) + (면접확정률 × 0.2) + (총지원자수 가중치 × 0.1)
                </div>
            `;

            document.getElementById('efficiencyTabContent').innerHTML = tableHtml;
        }
    },

    // =========================
    // 추이 분석 관련
    // =========================
    trend: {
        switchTab(period) {
            App.state.charts.currentTrendTab = period;

            document.querySelectorAll('.trend-tab-btn').forEach(btn => {
                btn.classList.toggle('active', btn.dataset.period === period);
            });

            App.trend.update();
        },

        update(filteredData = null, applyDateIndex = null) {
            if (!applyDateIndex) {
                applyDateIndex = App.state.data.headers.indexOf('지원일');
            }

            if (applyDateIndex === -1 || !App.state.charts.instances.trend) return;

            let trendData = {};
            let labels = [];

            if (App.state.charts.currentTrendTab === 'all') {
                const result = App.trend.getAllTrendData(applyDateIndex);
                trendData = result.data;
                labels = result.labels;
            } else if (App.state.charts.currentTrendTab === 'year') {
                const result = App.trend.getYearTrendData(applyDateIndex);
                trendData = result.data;
                labels = result.labels;
            } else if (App.state.charts.currentTrendTab === 'month') {
                const result = App.trend.getMonthTrendData(applyDateIndex);
                trendData = result.data;
                labels = result.labels;
            }

            App.state.charts.instances.trend.data.labels = labels;
            App.state.charts.instances.trend.data.datasets[0].data = Object.values(trendData);
            App.state.charts.instances.trend.update();
        },

        getAllTrendData(applyDateIndex) {
            const trendData = {};

            for (let i = 11; i >= 0; i--) {
                const date = new Date();
                date.setMonth(date.getMonth() - i);
                const key = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
                trendData[key] = 0;
            }

            App.state.data.all.forEach(row => {
                if (!row[applyDateIndex]) return;
                try {
                    const date = new Date(row[applyDateIndex]);
                    const key = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
                    if (trendData.hasOwnProperty(key)) {
                        trendData[key]++;
                    }
                } catch (e) {}
            });

            const labels = Object.keys(trendData).map(key => {
                const [year, month] = key.split('-');
                return `${year}.${month}`;
            });

            return { data: trendData, labels };
        },

        getYearTrendData(applyDateIndex) {
            const trendData = {};
            const currentYear = new Date().getFullYear();

            for (let i = 4; i >= 0; i--) {
                const year = currentYear - i;
                trendData[year] = 0;
            }

            App.state.data.all.forEach(row => {
                if (!row[applyDateIndex]) return;
                try {
                    const date = new Date(row[applyDateIndex]);
                    const year = date.getFullYear();
                    if (trendData.hasOwnProperty(year)) {
                        trendData[year]++;
                    }
                } catch (e) {}
            });

            const labels = Object.keys(trendData).map(year => `${year}년`);

            return { data: trendData, labels };
        },

        getMonthTrendData(applyDateIndex) {
            const trendData = {};
            const currentYear = new Date().getFullYear();

            for (let i = 1; i <= 12; i++) {
                const key = `${currentYear}-${i.toString().padStart(2, '0')}`;
                trendData[key] = 0;
            }

            App.state.data.all.forEach(row => {
                if (!row[applyDateIndex]) return;
                try {
                    const date = new Date(row[applyDateIndex]);
                    if (date.getFullYear() === currentYear) {
                        const key = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
                        if (trendData.hasOwnProperty(key)) {
                            trendData[key]++;
                        }
                    }
                } catch (e) {}
            });

            const labels = Object.keys(trendData).map(key => {
                const [year, month] = key.split('-');
                return `${month}월`;
            });

            return { data: trendData, labels };
        }
    },

    // =========================
    // 유틸리티 함수들 (utils.js에서 가져온 것 + 추가 함수들)
    // =========================
    utils: {
        // utils.js에서 가져온 순수 함수들
        ...Utils,
        
        // UIModule에서 가져온 함수들
        createProgressBar: UIModule.createProgressBar,
        createSkeletonTable: UIModule.createSkeletonTable,
        
        // App 객체에 의존하는 함수들
        sortData(data) {
            if (App.state.ui.currentSortColumn && App.state.ui.currentSortDirection) {
                const sortIndex = App.state.data.headers.indexOf(App.state.ui.currentSortColumn);
                if (sortIndex !== -1) {
                    data.sort((a, b) => {
                        let valA = a[sortIndex];
                        let valB = b[sortIndex];

                        if (App.state.ui.currentSortColumn === '지원일' ||
                            App.state.ui.currentSortColumn.includes('날짜') ||
                            App.state.ui.currentSortColumn.includes('날자') ||
                            App.state.ui.currentSortColumn.includes('입과일')) {
                            valA = new Date(valA || '1970-01-01');
                            valB = new Date(valB || '1970-01-01');
                        } else if (['나이', '구분'].includes(App.state.ui.currentSortColumn)) {
                            valA = Number(valA) || 0;
                            valB = Number(valB) || 0;
                        } else {
                            valA = String(valA || '').toLowerCase();
                            valB = String(valB || '').toLowerCase();
                        }

                        if (valA < valB) return App.state.ui.currentSortDirection === 'asc' ? -1 : 1;
                        if (valA > valB) return App.state.ui.currentSortDirection === 'asc' ? 1 : -1;
                        return 0;
                    });
                }
            }
            return data;
        },

        filterDataByPeriod(data, selectedPeriod, applyDateIndex, now) {
            let filteredData = [...data];
            let label = '전체 기간';

            try {
                if (selectedPeriod === 'year') {
                    const currentYear = now.getFullYear();
                    filteredData = data.filter(row => {
                        try {
                            const dateValue = row[applyDateIndex];
                            if (!dateValue) return false;
                            const date = new Date(dateValue);
                            return date.getFullYear() === currentYear;
                        } catch (e) { return false; }
                    });
                    label = `${currentYear}년`;

                } else if (selectedPeriod === 'month') {
                    const currentMonth = now.getMonth() + 1;
                    const currentYear = now.getFullYear();
                    filteredData = data.filter(row => {
                        try {
                            const dateValue = row[applyDateIndex];
                            if (!dateValue) return false;
                            const date = new Date(dateValue);
                            return date.getMonth() + 1 === currentMonth && date.getFullYear() === currentYear;
                        } catch (e) { return false; }
                    });
                    label = `${currentYear}.${currentMonth.toString().padStart(2, '0')}`;

                } else if (selectedPeriod === 'week') {
                    const weekStart = new Date(now);
                    weekStart.setDate(now.getDate() - now.getDay());
                    weekStart.setHours(0, 0, 0, 0);
                    const weekEnd = new Date(weekStart);
                    weekEnd.setDate(weekStart.getDate() + 6);
                    weekEnd.setHours(23, 59, 59, 999);

                    filteredData = data.filter(row => {
                        try {
                            const dateValue = row[applyDateIndex];
                            if (!dateValue) return false;
                            const date = new Date(dateValue);
                            return date >= weekStart && date <= weekEnd;
                        } catch (e) { return false; }
                    });
                    label = '이번 주';
                }
            } catch (error) {
                console.error('날짜 필터링 오류:', error);
            }

            return { data: filteredData, label };
        },

        getFilteredDataByPeriod(selectedPeriod) {
            const applyDateIndex = App.state.data.headers.indexOf('지원일');
            let filteredApplicants = [...App.state.data.all];

            if (applyDateIndex !== -1 && selectedPeriod !== 'all') {
                const now = new Date();

                if (selectedPeriod === 'custom') {
                    const startDateElement = document.getElementById('statsStartDate');
                    const endDateElement = document.getElementById('statsEndDate');
                    
                    const startDate = startDateElement ? startDateElement.value : null;
                    const endDate = endDateElement ? endDateElement.value : null;

                    if (startDate && endDate) {
                        const start = new Date(startDate);
                        const end = new Date(endDate);
                        end.setHours(23, 59, 59, 999);

                        filteredApplicants = App.state.data.all.filter(row => {
                            try {
                                const dateValue = row[applyDateIndex];
                                if (!dateValue) return false;
                                const date = new Date(dateValue);
                                return date >= start && date <= end;
                            } catch (e) { return false; }
                        });
                    }
                } else {
                    const result = App.utils.filterDataByPeriod(App.state.data.all, selectedPeriod, applyDateIndex, now);
                    filteredApplicants = result.data;
                }
            }

            return filteredApplicants;
        },

        generateVisibleColumns(headers) {
            if (!headers || !Array.isArray(headers)) {
                console.warn('❌ 올바르지 않은 헤더 데이터');
                return {};
            }
            
            const visibleColumns = {};
            headers.forEach(header => {
                if (header && typeof header === 'string') {
                    visibleColumns[header] = !App.config.DEFAULT_HIDDEN_COLUMNS.includes(header);
                }
            });
            return visibleColumns;
        }
    }
}; // 🔥 중요: App 객체 끝에 세미콜론

// =========================
// 🔥 App 객체 정의 완료 후 전역 노출
// =========================
(() => {
    try {
        if (typeof globalThis !== 'undefined') {
            globalThis.App = App;
        } else if (typeof window !== 'undefined') {
            window.App = App;
        } else if (typeof global !== 'undefined') {
            global.App = App;
        }
        console.log('✅ App 객체가 전역에 성공적으로 노출되었습니다.');
    } catch (error) {
        console.error('❌ App 객체 전역 노출 실패:', error);
    }
})();

// =========================
// 전역에서 사용되는 함수들 (하위 호환성)
// =========================
document.addEventListener('click', function(event) {
    try {
        const modal = document.getElementById('applicantModal');
        if (event.target === modal && globalThis.App && globalThis.App.modal) {
            globalThis.App.modal.close();
        }
    } catch (error) {
        console.error('모달 클릭 이벤트 오류:', error);
    }
});

// =========================
// 애플리케이션 시작
// =========================
document.addEventListener('DOMContentLoaded', () => {
    try {
        console.log('🚀 애플리케이션 초기화 시작...');
        
        // App 객체가 제대로 생성되었는지 확인
        if (typeof App === 'undefined') {
            throw new Error('App 객체가 정의되지 않았습니다.');
        }
        
        // 필수 DOM 요소들이 존재하는지 확인
        const requiredElements = ['dateModeToggle', 'globalSearch', 'routeFilter', 'positionFilter'];
        const missingElements = requiredElements.filter(id => !document.getElementById(id));
        
        if (missingElements.length > 0) {
            console.warn('⚠️ 일부 DOM 요소들을 찾을 수 없습니다:', missingElements);
        }
        
        App.init.start();
        App.smartSync.init(App);
        console.log('✅ 애플리케이션 초기화 완료');
        
    } catch (error) {
        console.error('❌ 애플리케이션 초기화 실패:', error);
        
        // 사용자에게 오류 메시지 표시
        const errorContainer = document.createElement('div');
        errorContainer.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: #ef4444;
            color: white;
            padding: 20px;
            border-radius: 8px;
            text-align: center;
            z-index: 9999;
            font-family: 'Noto Sans KR', sans-serif;
        `;
        errorContainer.innerHTML = `
            <h3>⚠️ 애플리케이션 로딩 오류</h3>
            <p>페이지를 새로고침하거나 관리자에게 문의하세요.</p>
            <button onclick="location.reload()" style="margin-top: 10px; padding: 8px 16px; background: white; color: #ef4444; border: none; border-radius: 4px; cursor: pointer;">
                새로고침
            </button>
        `;
        document.body.appendChild(errorContainer);
    }
});

// =========================
// 🛡️ 전역 오류 핸들러 추가
// =========================
window.addEventListener('error', function(event) {
    console.error('전역 JavaScript 오류:', event.error);
    // 사용자에게 방해가 되지 않도록 조용히 로깅만 함
});

window.addEventListener('unhandledrejection', function(event) {
    console.error('처리되지 않은 Promise 거부:', event.reason);
    // Promise 오류도 조용히 처리
    event.preventDefault(); // 브라우저 콘솔에 오류 표시 방지
});
