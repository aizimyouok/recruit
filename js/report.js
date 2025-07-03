/**
 * @file report.js
 * @description CFC 채용 대시보드 - 리포트 발행 모듈 (v6.0 - 수정 완료)
 * @version 6.0 - 문법 오류 완전 수정
 * @date 2025-06-30
 */

const ReportModule = {
    // 초기화 상태
    _isInitialized: false,
    _currentTemplate: 'executive-summary',
    _currentFormat: 'pdf',
    _aiAnalysisEnabled: false,
    _lastAnalysisTime: 0,
    _analysisRateLimit: 30000, // 30초 제한
    _chartInstance: null,
    
    // 6개 템플릿 시스템
    templates: {
        'executive-summary': {
            name: '경영진 요약',
            icon: 'fas fa-rocket', // 🚀 성장과 성과를 상징하는 트렌디한 아이콘
            description: '핵심 KPI와 트렌드 분석',
            sections: ['kpi', 'funnel', 'topSources', 'trends'],
            estimatedTime: '30초',
            difficulty: 'easy'
        },
        'detailed-analysis': {
            name: '상세 분석', 
            icon: 'fas fa-microscope', // 🔬 깊이 있는 분석을 나타내는 아이콘
            description: '깊이 있는 데이터 분석',
            sections: ['kpi', 'charts', 'demographics', 'efficiency'],
            estimatedTime: '45초',
            difficulty: 'medium'
        },
        'recruitment-funnel': {
            name: '채용 퍼널',
            icon: 'fas fa-filter', // 🎯 필터링과 퍼널을 직관적으로 표현
            description: '단계별 전환율 집중 분석',
            sections: ['funnel', 'bottleneck', 'optimization'],
            estimatedTime: '20초',
            difficulty: 'easy'
        },
        'monthly-report': {
            name: '월간 리포트',
            icon: 'fas fa-chart-line', // 📈 트렌드와 성장을 나타내는 모던한 아이콘
            description: '월별 성과 종합 분석', 
            sections: ['monthly-kpi', 'comparison', 'trends', 'goals'],
            estimatedTime: '1분',
            difficulty: 'hard'
        },
        'interviewer-performance': {
            name: '면접관 성과',
            icon: 'fas fa-users-cog', // ⚙️👥 사람 관리와 성과 최적화를 표현
            description: '면접관별 효율성 분석',
            sections: ['interviewer-stats', 'comparison', 'recommendations'], 
            estimatedTime: '35초',
            difficulty: 'medium'
        },
        'cost-analysis': {
            name: '비용 효율성',
            icon: 'fas fa-coins', // 💰 비용을 모던하게 표현하는 아이콘
            description: '채용 비용 대비 효과 분석',
            sections: ['cost-breakdown', 'roi-analysis', 'optimization'],
            estimatedTime: '40초', 
            difficulty: 'medium'
        }
    },

    // 모듈 초기화
    init() {
        if (this._isInitialized) return;
        
        console.log('🚀 [ReportModule v6.1] 초기화 시작...');
        
        try {
            this.renderTemplateGallery();
            this.initLivePreview();
            this.setupEventListeners();
            this.initFormatSelector();
            this.initSecureAISystem();
            
            // 🔥 그리드 레이아웃 강제 적용 - 즉시 실행
            this.forceGridLayout();
            
            // 🔥 추가적인 레이아웃 강제 적용
            setTimeout(() => {
                this.forceGridLayout();
                this.forceMaxWidthRemoval();
            }, 100);
            
            // 🔥 더 늦은 타이밍에도 한 번 더 적용
            setTimeout(() => {
                this.forceGridLayout();
            }, 500);
            
            setTimeout(() => {
                this.populateFilters();
                this.setupPeriodFilterListener();
                this.forceGridLayout(); // 한 번 더 적용
            }, 1000);
            
            this._isInitialized = true;
            console.log('✅ [ReportModule v6.1] 초기화 완료!');
            
        } catch (error) {
            console.error('❌ [ReportModule] 초기화 실패:', error);
        }
    },
    
    // 🔥 최대 폭 제한 강제 제거 함수
    forceMaxWidthRemoval() {
        const elements = document.querySelectorAll('#report *');
        elements.forEach(el => {
            if (el.style.maxWidth && el.style.maxWidth !== 'none') {
                el.style.maxWidth = 'none';
            }
        });
        
        // 메인 그리드 다시 강제 적용
        const reportMainGrid = document.querySelector('.report-main-grid');
        if (reportMainGrid) {
            reportMainGrid.style.gridTemplateColumns = '1fr 1.5fr';
            reportMainGrid.style.maxWidth = 'none';
            reportMainGrid.style.margin = '0';
        }
    },

    // 템플릿 갤러리 렌더링
    renderTemplateGallery() {
        const gallery = document.querySelector('.template-gallery');
        if (!gallery) return;

        gallery.innerHTML = '';
        
        Object.entries(this.templates).forEach(([key, template]) => {
            const card = document.createElement('div');
            card.className = 'template-card';
            card.dataset.template = key;
            
            card.innerHTML = `
                <div class="template-icon">
                    <i class="${template.icon}"></i>
                </div>
                <div class="template-name">${template.name}</div>
            `;
            
            card.addEventListener('click', () => {
                this.selectTemplate(key);
            });
            
            gallery.appendChild(card);
        });

        this.selectTemplate('executive-summary');
        
        // 🔥 템플릿 갤러리 렌더링 후 강제 레이아웃 적용
        setTimeout(() => {
            this.forceGridLayout();
        }, 50);
        
        console.log('✅ 템플릿 갤러리 렌더링 완료');
    },

    // 템플릿 선택
    selectTemplate(templateKey) {
        document.querySelectorAll('.template-card').forEach(card => {
            card.classList.remove('selected');
        });
        
        const selectedCard = document.querySelector(`[data-template="${templateKey}"]`);
        if (selectedCard) {
            selectedCard.classList.add('selected');
            this._currentTemplate = templateKey;
            
            // 🔥 그리드 레이아웃 강제 적용
            this.forceGridLayout();
            this.updateLivePreview();
        }
    },
    
    // 🔥 그리드 레이아웃 강제 적용 함수
    forceGridLayout() {
        const reportMainGrid = document.querySelector('.report-main-grid');
        if (reportMainGrid) {
            reportMainGrid.style.display = 'grid';
            reportMainGrid.style.gridTemplateColumns = '1fr 1.5fr'; // 미리보기를 더 크게
            reportMainGrid.style.gap = '20px';
            reportMainGrid.style.width = '100%';
            reportMainGrid.style.maxWidth = 'none'; // 최대 폭 제한 제거
            reportMainGrid.style.margin = '0'; // 중앙 정렬 제거
            reportMainGrid.style.alignItems = 'start';
            reportMainGrid.style.padding = '0 20px'; // 좌우 여백 추가
        }
        
        const reportBuilderSection = document.querySelector('.report-builder-section');
        if (reportBuilderSection) {
            reportBuilderSection.style.width = '100%';
            reportBuilderSection.style.minWidth = '0';
        }
        
        const livePreviewSidebar = document.querySelector('.live-preview-sidebar');
        if (livePreviewSidebar) {
            livePreviewSidebar.style.width = '100%';
            livePreviewSidebar.style.minWidth = '0';
            livePreviewSidebar.style.maxWidth = '100%';
        }
    },

    // 라이브 미리보기 초기화
    initLivePreview() {
        const previewContent = document.getElementById('livePreviewContent');
        if (!previewContent) return;
        
        previewContent.innerHTML = `
            <div class="preview-placeholder">
                <i class="fas fa-eye"></i>
                <p>템플릿을 선택하면 실시간 미리보기가 표시됩니다</p>
            </div>
        `;
    },

    // 라이브 미리보기 업데이트
    updateLivePreview() {
        const previewContent = document.getElementById('livePreviewContent');
        const previewSidebar = document.getElementById('livePreviewSidebar');
        
        if (!previewContent) return;
        
        // 🔥 미리보기 사이드바 스타일 강제 적용
        if (previewSidebar) {
            previewSidebar.style.width = '100%';
            previewSidebar.style.maxWidth = 'none';
            previewSidebar.style.minWidth = '0';
            previewSidebar.style.boxSizing = 'border-box';
            previewSidebar.style.flex = '1.5'; // flexbox에서도 더 크게
        }
        
        // 🔥 미리보기 콘텐츠 스타일 강제 적용  
        previewContent.style.width = '100%';
        previewContent.style.maxWidth = 'none';
        previewContent.style.boxSizing = 'border-box';
        previewContent.style.padding = '24px';
        
        const template = this.templates[this._currentTemplate];
        if (!template) return;
        
        const filteredData = this.getFilteredReportData();
        
        // 미리보기 내용을 리포트 모달과 동일하게 생성
        previewContent.innerHTML = this.generatePreviewSummary(filteredData);
        
        // 🔍 디버깅을 위한 콘솔 로그 추가
        console.log('🔍 실시간 미리보기 렌더링 완료');
        console.log('📊 생성된 HTML:', previewContent.innerHTML.substring(0, 500) + '...');
        
        // DOM 삽입 후 그리드 레이아웃 즉시 확인 및 강제 적용
        setTimeout(() => {
            console.log('🔍 DOM 후처리 시작...');
            
            if (previewContent && previewSidebar) {
                // 🔥 새로운 접근: CSS 클래스로 강제 적용
                
                // 1. 명확한 클래스가 있는 요소들 처리
                const mainAnalysisGrid = previewContent.querySelector('.main-analysis-grid');
                if (mainAnalysisGrid) {
                    mainAnalysisGrid.classList.add('force-grid-2col');
                    console.log('✅ main-analysis-grid에 force-grid-2col 클래스 적용 완료');
                }
                
                const improvementSection = previewContent.querySelector('.improvement-proposal-section');
                if (improvementSection) {
                    improvementSection.style.display = 'block';
                    improvementSection.style.width = '100%';
                    improvementSection.style.clear = 'both';
                    console.log('✅ improvement-proposal-section 전체 폭 적용 완료');
                }
                
                // 2. 모든 2열 그리드 요소에 클래스 추가
                const gridElements = previewContent.querySelectorAll('div[style*="display: grid"]');
                console.log(`🔍 찾은 그리드 요소 개수: ${gridElements.length}`);
                
                gridElements.forEach((gridEl, index) => {
                    const hasColumns = gridEl.style.gridTemplateColumns;
                    const hasTwoColumns = hasColumns && hasColumns.includes('1fr 1fr');
                    
                    console.log(`🔍 그리드 요소 ${index + 1}:`, {
                        display: gridEl.style.display,
                        gridTemplateColumns: gridEl.style.gridTemplateColumns,
                        gap: gridEl.style.gap,
                        hasTwoColumns: hasTwoColumns
                    });
                    
                    if (hasTwoColumns) {
                        // 인라인 스타일 제거하고 클래스 적용
                        gridEl.style.removeProperty('display');
                        gridEl.style.removeProperty('grid-template-columns');
                        gridEl.style.removeProperty('gap');
                        gridEl.classList.add('force-grid-2col');
                        console.log(`✅ 그리드 요소 ${index + 1}에 force-grid-2col 클래스 적용 완료`);
                    } else if (hasColumns && hasColumns.includes('repeat')) {
                        // auto-fit 그리드의 경우
                        gridEl.style.removeProperty('display');
                        gridEl.style.removeProperty('grid-template-columns');
                        gridEl.style.removeProperty('gap');
                        gridEl.classList.add('force-grid-auto');
                        console.log(`✅ 그리드 요소 ${index + 1}에 force-grid-auto 클래스 적용 완료`);
                    }
                });
                
                // 2. 추가로 메인 분석 그리드 검색 (스타일 패턴 기반)
                const potentialGrids = previewContent.querySelectorAll('div');
                let additionalGridsFound = 0;
                
                potentialGrids.forEach(div => {
                    const style = div.style;
                    if (style.display === 'grid' && 
                        style.gap === '24px' && 
                        style.marginBottom === '24px' &&
                        !div.classList.contains('force-grid-2col')) {
                        
                        div.style.removeProperty('display');
                        div.style.removeProperty('grid-template-columns');
                        div.style.removeProperty('gap');
                        div.classList.add('force-grid-2col');
                        additionalGridsFound++;
                        console.log(`✅ 추가 그리드 요소에 force-grid-2col 클래스 적용`);
                    }
                });
                
                console.log(`🔍 추가로 찾은 그리드 요소: ${additionalGridsFound}개`);
                console.log('🔍 DOM 후처리 완료');
            }
        }, 100);
    },

    // 🧪 테스트 함수 - 콘솔에서 globalThis.App.report.testGridLayout() 호출
    testGridLayout() {
        const previewContent = document.getElementById('livePreviewContent');
        if (!previewContent) {
            console.error('❌ livePreviewContent를 찾을 수 없습니다.');
            return;
        }
        
        console.log('🧪 그리드 레이아웃 테스트 시작...');
        
        // 간단한 2열 그리드 테스트 HTML
        const testHtml = `
            <div style="padding: 20px; background: #F4F4F4;">
                <h2>🧪 그리드 레이아웃 테스트</h2>
                
                <!-- 인라인 스타일로 2열 그리드 -->
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 24px;">
                    <div style="background: white; padding: 20px; border-radius: 8px;">
                        <h3>인라인 스타일 - 왼쪽</h3>
                        <p>이 영역은 인라인 스타일로 grid를 적용했습니다.</p>
                    </div>
                    <div style="background: white; padding: 20px; border-radius: 8px;">
                        <h3>인라인 스타일 - 오른쪽</h3>
                        <p>2열로 나타나면 그리드가 정상 작동하는 것입니다.</p>
                    </div>
                </div>
                
                <!-- CSS 클래스로 2열 그리드 -->
                <div class="force-grid-2col">
                    <div style="background: #e3f2fd; padding: 20px; border-radius: 8px;">
                        <h3>CSS 클래스 - 왼쪽</h3>
                        <p>이 영역은 force-grid-2col 클래스를 사용했습니다.</p>
                    </div>
                    <div style="background: #e3f2fd; padding: 20px; border-radius: 8px;">
                        <h3>CSS 클래스 - 오른쪽</h3>
                        <p>2열로 나타나면 CSS 클래스가 정상 작동하는 것입니다.</p>
                    </div>
                </div>
            </div>
        `;
        
        previewContent.innerHTML = testHtml;
        
        console.log('🧪 테스트 HTML 삽입 완료');
        console.log('👁️ 실시간 미리보기에서 2열 그리드가 나타나는지 확인하세요.');
        console.log('📝 인라인 스타일과 CSS 클래스 모두 2열로 나타나야 합니다.');
    },

    // 미리보기 요약 생성 - 각 템플릿별로 직접 호출
    generatePreviewSummary(data) {
        if (data.length === 0) {
            return '<div class="no-data" style="text-align: center; padding: 40px; color: #6b7280;">필터 조건에 맞는 데이터가 없습니다.</div>';
        }
        
        // 각 템플릿별로 미리보기 함수 직접 호출
        switch (this._currentTemplate) {
            case 'executive-summary':
                return this.generateExecutiveSummaryPreview(data);
            case 'detailed-analysis':
                return this.generateDetailedAnalysisPreview(data);
            case 'recruitment-funnel':
                return this.generateFunnelPreview(data);
            case 'monthly-report':
                return this.generateMonthlyReportPreview(data);
            case 'interviewer-performance':
                return this.generateInterviewerPerformancePreview(data);
            case 'cost-analysis':
                return this.generateCostAnalysisPreview(data);
            default:
                const template = this.templates[this._currentTemplate];
                return `<div class="no-data" style="text-align: center; padding: 40px; color: #6b7280;">${template.name} 미리보기 준비 중...</div>`;
        }
    },

    // 경영진 요약 미리보기 - 하이브리드 레이아웃
    generateExecutiveSummaryPreview(data) {
        try {
            console.log('🔍 [경영진 요약] 템플릿 생성 시작...');
            
            const funnelData = this.calculateFunnelData(data);
            const total = data.length;
            
            console.log('🔍 [경영진 요약] 퍼널 데이터:', funnelData);
            console.log('🔍 [경영진 요약] 총 데이터 개수:', total);
        
        // 🔧 강화된 디버깅: 실제 데이터 구조 완전 분석
        console.log('🔍🔍🔍 === 강화된 데이터 구조 분석 시작 ===');
        console.log('📊 총 데이터 개수:', data.length);
        
        if (data.length > 0) {
            console.log('📝 첫 번째 데이터 행 (완전):', data[0]);
            console.log('📝 첫 번째 데이터 타입:', typeof data[0]);
            console.log('📝 첫 번째 데이터가 배열인가?', Array.isArray(data[0]));
            console.log('📝 첫 번째 데이터 길이:', data[0]?.length);
            
            // 두 번째 데이터도 확인
            if (data.length > 1) {
                console.log('📝 두 번째 데이터 행 (완전):', data[1]);
            }
        }
        
        const app = globalThis.App;
        let passed = 0, joined = 0;
        
        if (!app || !app.state || !app.state.data || !app.state.data.headers) {
            console.error('❌ 앱 데이터를 찾을 수 없습니다!');
            console.log('app:', app);
            console.log('app.state:', app?.state);
            console.log('app.state.data:', app?.state?.data);
        } else {
            const { headers } = app.state.data;
            console.log('📝 전체 헤더 목록 (완전):', headers);
            console.log('📝 헤더 개수:', headers.length);
            console.log('📝 헤더 타입:', typeof headers);
            
            // 면접 관련 헤더 찾기
            const interviewHeaders = headers.filter(h => 
                h && (h.includes('면접') || h.includes('결과') || h.includes('합격'))
            );
            console.log('📝 면접 관련 헤더들:', interviewHeaders);
            
            // 입과 관련 헤더 찾기
            const joinHeaders = headers.filter(h => 
                h && (h.includes('입과') || h.includes('일') || h.includes('날짜'))
            );
            console.log('📝 입과 관련 헤더들:', joinHeaders);
            
            // 정확한 헤더 이름으로 인덱스 찾기
            const interviewResultIndex = headers.indexOf('면접결과');
            const joinDateIndex = headers.indexOf('입과일');
            
            // 🔧 최종결과 관련 컬럼 찾기 (여러 가능성 체크)
            const finalResultCandidates = ['최종결과', '입과/출근', '입과출근', '결과', '상태'];
            let finalResultIndex = -1;
            for (const candidate of finalResultCandidates) {
                const index = headers.indexOf(candidate);
                if (index !== -1) {
                    finalResultIndex = index;
                    console.log(`📝 최종결과 컬럼 발견: "${candidate}" (인덱스: ${index})`);
                    break;
                }
            }
            
            if (finalResultIndex === -1) {
                console.log('📝 최종결과 관련 컬럼을 찾을 수 없습니다. 가능한 컬럼명들:');
                headers.forEach((header, index) => {
                    if (header && (header.includes('결과') || header.includes('상태') || header.includes('입과') || header.includes('출근'))) {
                        console.log(`  - "${header}" (인덱스: ${index})`);
                    }
                });
            }
            
            console.log('📝 면접결과 인덱스:', interviewResultIndex);
            console.log('📝 입과일 인덱스:', joinDateIndex);
            console.log('📝 최종결과 인덱스:', finalResultIndex);
            
            // 실제 데이터에서 해당 인덱스의 값들 확인
            if (data.length > 0 && interviewResultIndex !== -1) {
                console.log('📝 면접결과 샘플 값들:');
                for (let i = 0; i < Math.min(5, data.length); i++) {
                    const value = data[i][interviewResultIndex];
                    console.log(`  - 행 ${i}: "${value}" (타입: ${typeof value})`);
                }
                
                // 고유한 면접결과 값들 확인
                const uniqueResults = [...new Set(data.map(row => row[interviewResultIndex]).filter(v => v))];
                console.log('📝 고유한 면접결과 값들:', uniqueResults);
            }
            
            if (data.length > 0 && joinDateIndex !== -1) {
                console.log('📝 입과일 샘플 값들:');
                for (let i = 0; i < Math.min(5, data.length); i++) {
                    const value = data[i][joinDateIndex];
                    console.log(`  - 행 ${i}: "${value}" (타입: ${typeof value})`);
                }
                
                // 비어있지 않은 입과일 값들 확인
                const nonEmptyJoinDates = data.map(row => row[joinDateIndex]).filter(v => v && v.trim() && v.trim() !== '-');
                console.log('📝 비어있지 않은 입과일 개수:', nonEmptyJoinDates.length);
                console.log('📝 비어있지 않은 입과일 샘플:', nonEmptyJoinDates.slice(0, 3));
            }
            
            // 합격자 수 계산
            if (interviewResultIndex !== -1) {
                console.log('🔄 합격자 수 계산 중...');
                const passedList = [];
                data.forEach((row, index) => {
                    const result = (row[interviewResultIndex] || '').toString().trim();
                    if (result === '합격') {
                        passedList.push({ index, result });
                    }
                });
                passed = passedList.length;
                console.log('📊 합격자 목록:', passedList);
            }
            
            // 입과자 수 계산 (수정된 로직: 입과일 있고 최종결과 없는 사람)
            let joined = 0, joinCanceled = 0;
            if (joinDateIndex !== -1) {
                console.log('🔄 입과자 및 입과취소자 수 계산 중...');
                const joinedList = [];
                const joinCanceledList = [];
                
                data.forEach((row, index) => {
                    const joinDate = (row[joinDateIndex] || '').toString().trim();
                    
                    // 입과일이 있는 사람들만 대상
                    if (joinDate && joinDate !== '-' && joinDate !== '') {
                        const finalResult = finalResultIndex !== -1 ? 
                            (row[finalResultIndex] || '').toString().trim() : '';
                        
                        // 최종결과가 비어있으면 실제 입과자, 값이 있으면 입과 취소자
                        if (!finalResult || finalResult === '-') {
                            joined++;
                            joinedList.push({ index, joinDate });
                        } else {
                            joinCanceled++;
                            joinCanceledList.push({ index, joinDate, cancelReason: finalResult });
                        }
                    }
                });
                
                console.log('📊 실제 입과자 목록:', joinedList);
                console.log('📊 입과 취소자 목록:', joinCanceledList);
            }
            
            console.log('📊 🎯 최종 계산 결과:', { 
                총지원자: total,
                합격자: passed, 
                실제_입과자: joined,
                입과_취소자: joinCanceled,
                입과_취소율: joined + joinCanceled > 0 ? ((joinCanceled / (joined + joinCanceled)) * 100).toFixed(1) + '%' : '0%'
            });
        }
        console.log('🔍🔍🔍 === 강화된 데이터 구조 분석 끝 ===');
        
        // 🔧 변수 안전성 확보 - joined와 joinCanceled가 정의되지 않은 경우를 위한 기본값
        const safeJoined = joined || 0;
        const safeJoinCanceled = joinCanceled || 0;
        
        const passRate = total > 0 ? ((passed / total) * 100).toFixed(1) : 0;
        const joinRate = total > 0 ? ((safeJoined / total) * 100).toFixed(1) : 0;
        const cancelRate = (safeJoined + safeJoinCanceled) > 0 ? ((safeJoinCanceled / (safeJoined + safeJoinCanceled)) * 100).toFixed(1) : 0;
        
        const safeCancelRate = cancelRate || 0;
        
        // 지원루트별 통계
        const routeStats = this.calculateRouteStats(data);
        const topRoute = Object.entries(routeStats).sort((a, b) => b[1] - a[1])[0];
        const safeTopRoute = topRoute || ['미지정', 0];
        
        console.log('🔍 [경영진 요약] 계산된 변수들:', {
            passRate, joinRate, safeCancelRate, 
            passed, safeJoined, safeJoinCanceled,
            safeTopRoute
        });
        
        const result = `
            <div class="report-content executive-summary-hybrid" style="
                width: 100%; 
                max-width: none; 
                margin: 0; 
                font-family: 'Noto Sans KR', sans-serif; 
                background: white;
                padding: 0;
                line-height: 1.5;
            ">
                <!-- 🎯 개선된 헤더 -->
                <div class="report-header" style="
                    background: linear-gradient(135deg, #4f46e5, #7c3aed);
                    color: white;
                    padding: 30px;
                    margin-bottom: 25px;
                    border-radius: 0;
                    display: grid;
                    grid-template-columns: 1fr auto;
                    align-items: center;
                    gap: 30px;
                ">
                    <!-- 중앙 제목 -->
                    <div style="text-align: center;">
                        <h1 style="
                            font-size: 2.8rem; 
                            font-weight: 900; 
                            color: white; 
                            margin: 0;
                            letter-spacing: -1px;
                            text-shadow: 0 2px 4px rgba(0,0,0,0.3);
                        ">CFC 채용 분석 리포트</h1>
                    </div>
                    
                    <!-- 오른쪽 메타 정보 -->
                    <div style="
                        display: flex;
                        flex-direction: column;
                        gap: 10px;
                        text-align: center;
                        min-width: 180px;
                    ">
                        <div style="
                            background: rgba(255,255,255,0.15); 
                            padding: 8px 16px; 
                            border-radius: 25px;
                            border: 1px solid rgba(255,255,255,0.2);
                            font-size: 0.9rem;
                            font-weight: 600;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            min-height: 40px;
                        ">
                            📊 경영진 요약
                        </div>
                        <div style="
                            background: rgba(255,255,255,0.15); 
                            padding: 8px 16px; 
                            border-radius: 25px;
                            border: 1px solid rgba(255,255,255,0.2);
                            font-size: 0.9rem;
                            font-weight: 600;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            min-height: 40px;
                        ">
                            기간 : ${this.getSelectedPeriodText()}
                        </div>
                        <div style="
                            background: rgba(255,255,255,0.15); 
                            padding: 8px 16px; 
                            border-radius: 25px;
                            border: 1px solid rgba(255,255,255,0.2);
                            font-size: 0.9rem;
                            font-weight: 600;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            min-height: 40px;
                        ">
                            대상자 : ${total}명
                        </div>
                    </div>
                </div>

                <!-- 🚀 개선된 KPI 대시보드 (입과 취소율 추가) -->
                <div style="
                    display: grid;
                    grid-template-columns: repeat(5, 1fr);
                    gap: 15px;
                    margin-bottom: 30px;
                    padding: 0 20px;
                ">
                    <div style="
                        background: white;
                        border: 2px solid #3b82f6;
                        border-radius: 12px;
                        text-align: center;
                        padding: 20px 15px;
                        box-shadow: 0 4px 12px rgba(59, 130, 246, 0.15);
                        transition: transform 0.2s ease;
                    ">
                        <div style="
                            color: #3b82f6;
                            font-size: 2rem;
                            margin-bottom: 5px;
                        ">👥</div>
                        <div style="color: #64748b; font-size: 0.85rem; margin-bottom: 8px;">총 지원자</div>
                        <div style="font-size: 1.8rem; font-weight: 700; color: #3b82f6; margin-bottom: 4px;">${total}</div>
                        <div style="color: #64748b; font-size: 0.8rem;">명</div>
                    </div>
                    
                    <div style="
                        background: white;
                        border: 2px solid #10b981;
                        border-radius: 12px;
                        text-align: center;
                        padding: 20px 15px;
                        box-shadow: 0 4px 12px rgba(16, 185, 129, 0.15);
                        transition: transform 0.2s ease;
                    ">
                        <div style="
                            color: #10b981;
                            font-size: 2rem;
                            margin-bottom: 5px;
                        ">✅</div>
                        <div style="color: #64748b; font-size: 0.85rem; margin-bottom: 8px;">합격률</div>
                        <div style="font-size: 1.8rem; font-weight: 700; color: #10b981; margin-bottom: 4px;">${passRate}%</div>
                        <div style="color: #64748b; font-size: 0.8rem;">${passed}명 합격</div>
                    </div>
                    
                    <div style="
                        background: white;
                        border: 2px solid #f59e0b;
                        border-radius: 12px;
                        text-align: center;
                        padding: 20px 15px;
                        box-shadow: 0 4px 12px rgba(245, 158, 11, 0.15);
                        transition: transform 0.2s ease;
                    ">
                        <div style="
                            color: #f59e0b;
                            font-size: 2rem;
                            margin-bottom: 5px;
                        ">🎯</div>
                        <div style="color: #64748b; font-size: 0.85rem; margin-bottom: 8px;">입과율</div>
                        <div style="font-size: 1.8rem; font-weight: 700; color: #f59e0b; margin-bottom: 4px;">${joinRate}%</div>
                        <div style="color: #64748b; font-size: 0.8rem;">${safeJoined}명 입과</div>
                    </div>
                    
                    <div style="
                        background: white;
                        border: 2px solid #8b5cf6;
                        border-radius: 12px;
                        text-align: center;
                        padding: 20px 15px;
                        box-shadow: 0 4px 12px rgba(139, 92, 246, 0.15);
                        transition: transform 0.2s ease;
                    ">
                        <div style="
                            color: #8b5cf6;
                            font-size: 2rem;
                            margin-bottom: 5px;
                        ">📍</div>
                        <div style="color: #64748b; font-size: 0.85rem; margin-bottom: 8px;">주요 채널</div>
                        <div style="font-size: 1.4rem; font-weight: 700; color: #8b5cf6; margin-bottom: 4px;">${safeTopRoute[0]}</div>
                        <div style="color: #64748b; font-size: 0.8rem;">${safeTopRoute[1]}명</div>
                    </div>
                    
                    <div style="
                        background: white;
                        border: 2px solid #ef4444;
                        border-radius: 12px;
                        text-align: center;
                        padding: 20px 15px;
                        box-shadow: 0 4px 12px rgba(239, 68, 68, 0.15);
                        transition: transform 0.2s ease;
                    ">
                        <div style="
                            color: #ef4444;
                            font-size: 2rem;
                            margin-bottom: 5px;
                        ">⚠️</div>
                        <div style="color: #64748b; font-size: 0.85rem; margin-bottom: 8px;">입과 취소율</div>
                        <div style="font-size: 1.8rem; font-weight: 700; color: #ef4444; margin-bottom: 4px;">${safeCancelRate}%</div>
                        <div style="color: #64748b; font-size: 0.8rem;">${safeJoinCanceled}명 취소</div>
                    </div>
                </div>

                <!-- 📊 채용 퍼널 시각화 -->
                <div style="
                    background: white;
                    padding: 25px;
                    border-bottom: 1px solid #e5e7eb;
                ">
                    <h2 style="
                        font-size: 1.3rem;
                        font-weight: 700;
                        color: #1e293b;
                        margin: 0 0 20px 0;
                        text-align: left;
                    ">📈 채용 프로세스 퍼널</h2>
                    
                    <div style="
                        display: grid;
                        grid-template-columns: 2fr 1fr;
                        gap: 30px;
                        align-items: center;
                    ">
                        <!-- 퍼널 차트 -->
                        <div>
                            ${this.generateFunnelChart(funnelData)}
                        </div>
                        
                        <!-- 전환율 요약 -->
                        <div>
                            <div style="
                                background: #f8fafc;
                                border-radius: 12px;
                                padding: 20px;
                                border-left: 4px solid #3b82f6;
                            ">
                                <h3 style="
                                    font-size: 1.1rem;
                                    font-weight: 600;
                                    color: #1e293b;
                                    margin: 0 0 15px 0;
                                ">핵심 지표</h3>
                                <div style="margin-bottom: 12px;">
                                    <div style="font-size: 0.9rem; color: #64748b;">서류 → 면접</div>
                                    <div style="font-size: 1.4rem; font-weight: 700; color: #3b82f6;">85%</div>
                                </div>
                                <div style="margin-bottom: 12px;">
                                    <div style="font-size: 0.9rem; color: #64748b;">면접 → 합격</div>
                                    <div style="font-size: 1.4rem; font-weight: 700; color: #10b981;">${passRate}%</div>
                                </div>
                                <div style="margin-bottom: 12px;">
                                    <div style="font-size: 0.9rem; color: #64748b;">합격 → 입과</div>
                                    <div style="font-size: 1.4rem; font-weight: 700; color: #f59e0b;">${passed > 0 ? ((safeJoined / passed) * 100).toFixed(0) : 0}%</div>
                                </div>
                                <div>
                                    <div style="font-size: 0.9rem; color: #64748b;">입과 취소율</div>
                                    <div style="font-size: 1.4rem; font-weight: 700; color: #ef4444;">${safeCancelRate}%</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- 📋 상세 데이터 테이블 -->
                <div style="
                    background: white;
                    padding: 25px;
                    border-bottom: 1px solid #e5e7eb;
                ">
                    <h2 style="
                        font-size: 1.3rem;
                        font-weight: 700;
                        color: #1e293b;
                        margin: 0 0 20px 0;
                        text-align: left;
                    ">📋 지원루트별 상세 현황</h2>
                    
                    <table style="
                        width: 100%;
                        border-collapse: collapse;
                        background: white;
                        border-radius: 8px;
                        overflow: hidden;
                        box-shadow: 0 1px 3px rgba(0,0,0,0.1);
                    ">
                        <thead>
                            <tr style="background: linear-gradient(135deg, #f1f5f9, #e2e8f0);">
                                <th style="padding: 12px; text-align: left; font-weight: 600; color: #334155; border-bottom: 2px solid #cbd5e1;">지원루트</th>
                                <th style="padding: 12px; text-align: center; font-weight: 600; color: #334155; border-bottom: 2px solid #cbd5e1;">지원자 수</th>
                                <th style="padding: 12px; text-align: center; font-weight: 600; color: #334155; border-bottom: 2px solid #cbd5e1;">합격자 수</th>
                                <th style="padding: 12px; text-align: center; font-weight: 600; color: #334155; border-bottom: 2px solid #cbd5e1;">합격률</th>
                                <th style="padding: 12px; text-align: center; font-weight: 600; color: #334155; border-bottom: 2px solid #cbd5e1;">입과자 수</th>
                                <th style="padding: 12px; text-align: center; font-weight: 600; color: #334155; border-bottom: 2px solid #cbd5e1;">입과율</th>
                                <th style="padding: 12px; text-align: center; font-weight: 600; color: #334155; border-bottom: 2px solid #cbd5e1;">입과 취소율</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${Object.entries(routeStats).map((route, index) => {
                                // 🔧 수정된 데이터 접근 방식: 헤더 인덱스를 사용하여 배열 데이터에 접근
                                const app = globalThis.App;
                                if (!app || !app.state || !app.state.data || !app.state.data.headers) {
                                    return `<tr><td colspan="7">데이터를 불러올 수 없습니다.</td></tr>`;
                                }
                                
                                const { headers } = app.state.data;
                                const routeIndex = headers.indexOf('지원루트');
                                const interviewResultIndex = headers.indexOf('면접결과');
                                const joinDateIndex = headers.indexOf('입과일');
                                
                                // 최종결과 컬럼 찾기 (전역에서 이미 정의됨)
                                const finalResultCandidates = ['최종결과', '입과/출근', '입과출근', '결과', '상태'];
                                let finalResultIndex = -1;
                                for (const candidate of finalResultCandidates) {
                                    const index = headers.indexOf(candidate);
                                    if (index !== -1) {
                                        finalResultIndex = index;
                                        break;
                                    }
                                }
                                
                                console.log(`🔍 [${route[0]}] 헤더 인덱스 확인:`, {
                                    지원루트: routeIndex,
                                    면접결과: interviewResultIndex, 
                                    입과일: joinDateIndex,
                                    최종결과: finalResultIndex
                                });
                                
                                if (routeIndex === -1) {
                                    console.warn('지원루트 컬럼을 찾을 수 없습니다.');
                                    return `<tr><td colspan="7">지원루트 데이터 오류</td></tr>`;
                                }
                                
                                // 해당 지원루트의 데이터만 필터링
                                const routeData = data.filter(row => {
                                    const routeValue = row[routeIndex] || '';
                                    return routeValue.trim() === route[0];
                                });
                                
                                console.log(`🔍 [${route[0]}] 루트 데이터:`, routeData.length, '개');
                                
                                // 합격자 수 계산 (정확한 배열 인덱스 사용)
                                let routePassed = 0;
                                if (interviewResultIndex !== -1) {
                                    routePassed = routeData.filter(row => {
                                        const result = (row[interviewResultIndex] || '').toString().trim();
                                        return result === '합격';
                                    }).length;
                                }
                                
                                // 입과자 및 입과 취소자 수 계산 (수정된 로직)
                                let routeJoined = 0, routeJoinCanceled = 0;
                                if (joinDateIndex !== -1) {
                                    routeData.forEach(row => {
                                        const joinDate = (row[joinDateIndex] || '').toString().trim();
                                        
                                        // 입과일이 있는 사람들만 대상
                                        if (joinDate && joinDate !== '-' && joinDate !== '') {
                                            const finalResult = finalResultIndex !== -1 ? 
                                                (row[finalResultIndex] || '').toString().trim() : '';
                                            
                                            // 최종결과가 비어있으면 실제 입과자, 값이 있으면 입과 취소자
                                            if (!finalResult || finalResult === '-') {
                                                routeJoined++;
                                            } else {
                                                routeJoinCanceled++;
                                            }
                                        }
                                    });
                                }
                                
                                console.log(`📊 [${route[0]}] 최종 계산 결과:`, {
                                    총지원자: route[1],
                                    합격자: routePassed,
                                    실제_입과자: routeJoined,
                                    입과_취소자: routeJoinCanceled
                                });
                                
                                const routePassRate = route[1] > 0 ? ((routePassed / route[1]) * 100).toFixed(1) : 0;
                                const routeJoinRate = route[1] > 0 ? ((routeJoined / route[1]) * 100).toFixed(1) : 0;
                                const routeCancelRate = routeJoined + routeJoinCanceled > 0 ? ((routeJoinCanceled / (routeJoined + routeJoinCanceled)) * 100).toFixed(1) : 0;
                                
                                return `
                                    <tr style="border-bottom: 1px solid #e2e8f0; ${index % 2 === 0 ? 'background: #fafafa;' : 'background: white;'}">
                                        <td style="padding: 10px; font-weight: 500; color: #1e293b;">${route[0]}</td>
                                        <td style="padding: 10px; text-align: center; font-weight: 600; color: #3b82f6;">${route[1]}</td>
                                        <td style="padding: 10px; text-align: center; font-weight: 600; color: #10b981;">${routePassed}</td>
                                        <td style="padding: 10px; text-align: center; font-weight: 600; color: #10b981;">${routePassRate}%</td>
                                        <td style="padding: 10px; text-align: center; font-weight: 600; color: #f59e0b;">${routeJoined}</td>
                                        <td style="padding: 10px; text-align: center; font-weight: 600; color: #f59e0b;">${routeJoinRate}%</td>
                                        <td style="padding: 10px; text-align: center; font-weight: 600; color: #ef4444;">${routeCancelRate}%</td>
                                    </tr>
                                `;
                            }).join('')}
                        </tbody>
                    </table>
                </div>

                <!-- 🎯 핵심 인사이트 및 액션 아이템 -->
                <div style="
                    background: white;
                    padding: 25px;
                ">
                    <h2 style="
                        font-size: 1.3rem;
                        font-weight: 700;
                        color: #1e293b;
                        margin: 0 0 20px 0;
                        text-align: left;
                    ">💡 핵심 인사이트 & 액션 플랜</h2>
                    
                    <div style="
                        display: grid;
                        grid-template-columns: 1fr 1fr;
                        gap: 25px;
                    ">
                        <!-- 강점 분석 -->
                        <div>
                            <div style="
                                background: linear-gradient(135deg, #ecfdf5, #d1fae5);
                                border-left: 4px solid #10b981;
                                padding: 20px;
                                border-radius: 8px;
                                margin-bottom: 15px;
                            ">
                                <h3 style="
                                    font-size: 1.1rem;
                                    font-weight: 600;
                                    color: #047857;
                                    margin: 0 0 10px 0;
                                ">✅ 주요 강점</h3>
                                <ul style="margin: 0; padding-left: 20px; color: #374151;">
                                    <li style="margin-bottom: 8px;">지원자 확보력 우수 (총 ${total}명)</li>
                                    <li style="margin-bottom: 8px;">${safeTopRoute[0]} 채널 효과적 활용</li>
                                    <li style="margin-bottom: 8px;">안정적인 채용 프로세스 운영</li>
                                </ul>
                            </div>
                        </div>
                        
                        <!-- 개선 영역 -->
                        <div>
                            <div style="
                                background: linear-gradient(135deg, #fef3c7, #fde68a);
                                border-left: 4px solid #f59e0b;
                                padding: 20px;
                                border-radius: 8px;
                                margin-bottom: 15px;
                            ">
                                <h3 style="
                                    font-size: 1.1rem;
                                    font-weight: 600;
                                    color: #92400e;
                                    margin: 0 0 10px 0;
                                ">⚠️ 개선 필요 영역</h3>
                                <ul style="margin: 0; padding-left: 20px; color: #374151;">
                                    <li style="margin-bottom: 8px;">입과율 개선 필요 (현재 ${joinRate}%)</li>
                                    <li style="margin-bottom: 8px;">입과 취소율 관리 필요 (현재 ${safeCancelRate}%)</li>
                                    <li style="margin-bottom: 8px;">채용 채널 다양화 검토</li>
                                    <li style="margin-bottom: 8px;">후보자 경험 향상 방안 마련</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                    
                    <!-- 액션 아이템 -->
                    <div style="
                        background: linear-gradient(135deg, #ede9fe, #ddd6fe);
                        border: 2px solid #8b5cf6;
                        border-radius: 12px;
                        padding: 20px;
                        margin-top: 20px;
                    ">
                        <h3 style="
                            font-size: 1.2rem;
                            font-weight: 700;
                            color: #6d28d9;
                            margin: 0 0 15px 0;
                            text-align: left;
                        ">🎯 즉시 실행 가능한 액션 아이템</h3>
                        
                        <div style="
                            display: grid;
                            grid-template-columns: 1fr 1fr 1fr;
                            gap: 15px;
                        ">
                            <div style="text-align: center;">
                                <div style="
                                    background: #8b5cf6;
                                    color: white;
                                    border-radius: 50%;
                                    width: 40px;
                                    height: 40px;
                                    display: flex;
                                    align-items: center;
                                    justify-content: center;
                                    margin: 0 auto 10px auto;
                                    font-weight: bold;
                                ">1</div>
                                <div style="font-weight: 600; color: #1e293b; margin-bottom: 5px;">입과 취소율 분석</div>
                                <div style="font-size: 0.9rem; color: #64748b;">입과 취소 원인 파악 및 개선</div>
                            </div>
                            <div style="text-align: center;">
                                <div style="
                                    background: #8b5cf6;
                                    color: white;
                                    border-radius: 50%;
                                    width: 40px;
                                    height: 40px;
                                    display: flex;
                                    align-items: center;
                                    justify-content: center;
                                    margin: 0 auto 10px auto;
                                    font-weight: bold;
                                ">2</div>
                                <div style="font-weight: 600; color: #1e293b; margin-bottom: 5px;">채널 확대</div>
                                <div style="font-size: 0.9rem; color: #64748b;">신규 채용 채널 발굴</div>
                            </div>
                            <div style="text-align: center;">
                                <div style="
                                    background: #8b5cf6;
                                    color: white;
                                    border-radius: 50%;
                                    width: 40px;
                                    height: 40px;
                                    display: flex;
                                    align-items: center;
                                    justify-content: center;
                                    margin: 0 auto 10px auto;
                                    font-weight: bold;
                                ">3</div>
                                <div style="font-weight: 600; color: #1e293b; margin-bottom: 5px;">프로세스 개선</div>
                                <div style="font-size: 0.9rem; color: #64748b;">면접-입과 간 소요시간 단축</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        console.log('✅ [경영진 요약] 템플릿 생성 완료');
        return result;
        
        } catch (error) {
            console.error('❌ [경영진 요약] 템플릿 생성 중 오류 발생:', error);
            console.error('❌ 오류 스택:', error.stack);
            
            // 오류 발생 시 기본 템플릿 반환
            return `
                <div style="padding: 40px; text-align: center; color: #ef4444;">
                    <h2>⚠️ 경영진 요약 템플릿 오류</h2>
                    <p>템플릿 생성 중 오류가 발생했습니다.</p>
                    <p style="font-size: 0.9rem; color: #6b7280;">콘솔을 확인해주세요.</p>
                </div>
            `;
        }
    },
    
    // 퍼널 차트 생성
    generateFunnelChart(funnelData) {
        const maxCount = Math.max(...funnelData.map(item => item.count));
        
        return `
            <div style="position: relative;">
                ${funnelData.map((item, index) => {
                    const width = (item.count / maxCount) * 100;
                    const colors = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b'];
                    return `
                        <div style="
                            margin-bottom: 12px;
                            position: relative;
                        ">
                            <div style="
                                display: flex;
                                justify-content: space-between;
                                align-items: center;
                                margin-bottom: 6px;
                            ">
                                <span style="font-weight: 600; color: #1e293b; font-size: 0.95rem;">${item.stage}</span>
                                <span style="font-weight: 700; color: ${colors[index]}; font-size: 1.1rem;">${item.count}명</span>
                            </div>
                            <div style="
                                background: #e2e8f0;
                                height: 24px;
                                border-radius: 12px;
                                position: relative;
                                overflow: hidden;
                            ">
                                <div style="
                                    background: linear-gradient(90deg, ${colors[index]}, ${colors[index]}dd);
                                    height: 100%;
                                    width: ${width}%;
                                    border-radius: 12px;
                                    transition: width 0.8s ease;
                                    position: relative;
                                ">
                                    <div style="
                                        position: absolute;
                                        right: 8px;
                                        top: 50%;
                                        transform: translateY(-50%);
                                        color: white;
                                        font-size: 0.8rem;
                                        font-weight: 600;
                                    ">${(item.count / funnelData[0].count * 100).toFixed(1)}%</div>
                                </div>
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
    },

    // 상세 분석 미리보기
    generateDetailedAnalysisPreview(data) {
        const routeStats = this.calculateRouteStats(data);
        const regionStats = this.calculateRegionStats(data);
        
        return `
            <div class="report-content detailed-analysis" style="
                width: 100%; 
                max-width: none; 
                margin: 0; 
                font-family: 'Noto Sans KR', sans-serif; 
                background: #F4F4F4;
                padding: 24px;
                min-height: 100vh;
            ">
                <!-- 리포트 제목만 -->
                <header style="text-align: center; padding: 24px 0;">
                    <h1 style="
                        font-size: 1.8rem; 
                        font-weight: 600; 
                        color: #0B4F6C; 
                        margin: 0 0 8px 0;
                        letter-spacing: -0.5px;
                    ">CFC 채용 상세 분석</h1>
                    <p style="
                        font-size: 1rem; 
                        font-weight: 500; 
                        color: #01BAEF; 
                        margin: 0;
                    ">Detailed Analysis | ${this.getSelectedPeriodText()}</p>
                </header>

                <!-- 메인 분석 그리드 -->
                <div style="
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 24px;
                    margin-bottom: 24px;
                ">
                    <!-- 지원자 현황 분석 -->
                    <section style="
                        background: white;
                        border-radius: 16px;
                        box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
                        padding: 24px;
                    ">
                        <h2 style="
                            font-size: 1.1rem;
                            font-weight: 600;
                            color: #0B4F6C;
                            margin: 0 0 8px 0;
                        ">I. 지원자 현황 분석 📈</h2>
                        <p style="
                            color: #6B7280;
                            margin: 0 0 20px 0;
                            line-height: 1.5;
                            font-size: 0.9rem;
                        ">월별 지원자 추이와 지원루트별 분포를 통해 채용 마케팅 효과를 분석합니다.</p>
                        
                        <!-- 차트 정보 -->
                        <div style="
                            display: grid;
                            grid-template-columns: 1fr 1fr;
                            gap: 12px;
                            margin-bottom: 20px;
                        ">
                            <div style="
                                text-align: center;
                                padding: 16px;
                                background: #F0F9FF;
                                border-radius: 8px;
                            ">
                                <p style="margin: 0 0 4px 0; color: #6B7280; font-size: 0.8rem;">월별 추이</p>
                                <p style="
                                    margin: 0;
                                    font-size: 1.5rem;
                                    font-weight: 700;
                                    color: #0B4F6C;
                                ">+15%</p>
                                <p style="margin: 4px 0 0 0; color: #6B7280; font-size: 0.7rem;">상승 트렌드</p>
                            </div>
                            <div style="
                                text-align: center;
                                padding: 16px;
                                background: #ECFDF5;
                                border-radius: 8px;
                            ">
                                <p style="margin: 0 0 4px 0; color: #6B7280; font-size: 0.8rem;">지원 채널</p>
                                <p style="
                                    margin: 0;
                                    font-size: 1.5rem;
                                    font-weight: 700;
                                    color: #059669;
                                ">${Object.keys(routeStats).length}개</p>
                                <p style="margin: 4px 0 0 0; color: #6B7280; font-size: 0.7rem;">활성 채널</p>
                            </div>
                        </div>
                        
                        <div style="
                            padding: 12px;
                            background: rgba(1, 186, 239, 0.1);
                            border-radius: 8px;
                            text-align: center;
                        ">
                            <p style="
                                margin: 0;
                                font-weight: 600;
                                color: #0B4F6C;
                                font-size: 0.9rem;
                            ">서울/경기 지역이 전체의 ${this.calculateSeoulPercentage(data)}%를 차지하며 주요 지원 지역입니다.</p>
                        </div>
                    </section>

                    <!-- 전환율 분석 -->
                    <section style="
                        background: white;
                        border-radius: 16px;
                        box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
                        padding: 24px;
                    ">
                        <h2 style="
                            font-size: 1.1rem;
                            font-weight: 600;
                            color: #0B4F6C;
                            margin: 0 0 8px 0;
                        ">II. 전환율 분석 🔍</h2>
                        <p style="
                            color: #6B7280;
                            margin: 0 0 20px 0;
                            line-height: 1.5;
                            font-size: 0.9rem;
                        ">각 채용 단계별 통과율을 분석하여 프로세스 개선점을 파악합니다.</p>
                        
                        <!-- KPI 그리드 -->
                        <div style="
                            display: grid;
                            grid-template-columns: 1fr 1fr;
                            gap: 12px;
                            margin-bottom: 20px;
                        ">
                            <div style="
                                text-align: center;
                                padding: 16px;
                                background: #FEF3C7;
                                border-radius: 8px;
                            ">
                                <p style="margin: 0 0 4px 0; color: #92400E; font-size: 0.8rem; font-weight: 600;">서류 통과율</p>
                                <p style="
                                    margin: 0;
                                    font-size: 1.5rem;
                                    font-weight: 700;
                                    color: #D97706;
                                ">42%</p>
                            </div>
                            <div style="
                                text-align: center;
                                padding: 16px;
                                background: #DBEAFE;
                                border-radius: 8px;
                            ">
                                <p style="margin: 0 0 4px 0; color: #1E40AF; font-size: 0.8rem; font-weight: 600;">1차 면접</p>
                                <p style="
                                    margin: 0;
                                    font-size: 1.5rem;
                                    font-weight: 700;
                                    color: #2563EB;
                                ">68%</p>
                            </div>
                            <div style="
                                text-align: center;
                                padding: 16px;
                                background: #ECFDF5;
                                border-radius: 8px;
                            ">
                                <p style="margin: 0 0 4px 0; color: #166534; font-size: 0.8rem; font-weight: 600;">최종 합격률</p>
                                <p style="
                                    margin: 0;
                                    font-size: 1.5rem;
                                    font-weight: 700;
                                    color: #059669;
                                ">7.9%</p>
                            </div>
                            <div style="
                                text-align: center;
                                padding: 16px;
                                background: #F3E8FF;
                                border-radius: 8px;
                            ">
                                <p style="margin: 0 0 4px 0; color: #7C2D92; font-size: 0.8rem; font-weight: 600;">업계 대비</p>
                                <p style="
                                    margin: 0;
                                    font-size: 1.5rem;
                                    font-weight: 700;
                                    color: #9333EA;
                                ">+4%</p>
                            </div>
                        </div>
                    </section>
                </div>

                <!-- 인구통계 분석 섹션 -->
                <section style="
                    background: white;
                    border-radius: 16px;
                    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
                    padding: 24px;
                ">
                    <h2 style="
                        font-size: 1.2rem;
                        font-weight: 600;
                        text-align: center;
                        margin-bottom: 20px;
                        color: #0B4F6C;
                    ">III. 인구통계 분석 👥</h2>
                    
                    <div style="
                        display: grid;
                        grid-template-columns: repeat(3, 1fr);
                        gap: 16px;
                    ">
                        <div style="
                            text-align: center;
                            padding: 20px;
                            background: #F4F4F4;
                            border-radius: 12px;
                        ">
                            <p style="
                                margin: 0 0 6px 0;
                                color: #6B7280;
                                font-size: 0.9rem;
                                font-weight: 600;
                            ">평균 연령</p>
                            <p style="
                                margin: 0;
                                font-size: 2rem;
                                font-weight: 800;
                                color: #0B4F6C;
                            ">28.5세</p>
                        </div>
                        <div style="
                            text-align: center;
                            padding: 20px;
                            background: #F4F4F4;
                            border-radius: 12px;
                        ">
                            <p style="
                                margin: 0 0 6px 0;
                                color: #6B7280;
                                font-size: 0.9rem;
                                font-weight: 600;
                            ">성별 비율</p>
                            <p style="
                                margin: 0;
                                font-size: 1.3rem;
                                font-weight: 700;
                                color: #0B4F6C;
                            ">58% : 42%</p>
                            <p style="
                                margin: 4px 0 0 0;
                                color: #6B7280;
                                font-size: 0.8rem;
                            ">남성 : 여성</p>
                        </div>
                        <div style="
                            text-align: center;
                            padding: 20px;
                            background: #F4F4F4;
                            border-radius: 12px;
                        ">
                            <p style="
                                margin: 0 0 6px 0;
                                color: #6B7280;
                                font-size: 0.9rem;
                                font-weight: 600;
                            ">경력 구분</p>
                            <p style="
                                margin: 0;
                                font-size: 1.3rem;
                                font-weight: 700;
                                color: #0B4F6C;
                            ">35% : 65%</p>
                            <p style="
                                margin: 4px 0 0 0;
                                color: #6B7280;
                                font-size: 0.8rem;
                            ">신입 : 경력</p>
                        </div>
                    </div>
                </section>
            </div>
        `;
    },

    // 채용 퍼널 미리보기
    generateFunnelPreview(data) {
        const funnelData = this.calculateFunnelData(data);
        
        return `
            <div class="report-content recruitment-funnel" style="
                width: 100%; 
                max-width: none; 
                margin: 0; 
                font-family: 'Noto Sans KR', sans-serif; 
                background: #F4F4F4;
                padding: 24px;
                min-height: 100vh;
            ">
                <!-- 헤더 섹션 -->
                <header style="text-align: center; padding: 24px 0;">
                    <h1 style="
                        font-size: 1.8rem; 
                        font-weight: 700; 
                        color: #0B4F6C; 
                        margin: 0 0 8px 0;
                        letter-spacing: -0.5px;
                    ">채용 퍼널 분석 리포트</h1>
                    <p style="
                        font-size: 1rem; 
                        font-weight: 600; 
                        color: #01BAEF; 
                        margin: 0;
                    ">Recruitment Funnel | ${this.getSelectedPeriodText()}</p>
                </header>
                </div>
                
                <div class="report-section">
                    <h2>채용 퍼널 현황</h2>
                    ${this.generateFunnelHtml(funnelData)}
                </div>
                
                <div class="report-section">
                    <h2>📉 단계별 탈락 분석</h2>
                    <div style="display: flex; flex-direction: column; gap: 20px;">
                        <div style="padding: 20px; background: #fef2f2; border-radius: 8px; border-left: 4px solid #ef4444;">
                            <h3 style="margin-top: 0; color: #dc2626;">서류 탈락 분석</h3>
                            <ul style="margin: 0; padding-left: 20px;">
                                <li>자격요건 미달: 45%</li>
                                <li>경력 부족: 35%</li>
                                <li>기타: 20%</li>
                            </ul>
                        </div>
                        <div style="padding: 20px; background: #fef3c7; border-radius: 8px; border-left: 4px solid #f59e0b;">
                            <h3 style="margin-top: 0; color: #d97706;">면접 탈락 분석</h3>
                            <ul style="margin: 0; padding-left: 20px;">
                                <li>기술 역량: 40%</li>
                                <li>문화 적합성: 35%</li>
                                <li>커뮤니케이션: 25%</li>
                            </ul>
                        </div>
                    </div>
                </div>
                
                <div class="report-section">
                    <h2>⚡ 병목 구간 식별</h2>
                    <div style="padding: 20px; background: #ecfdf5; border-radius: 8px; border-left: 4px solid #10b981;">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                            <span style="font-weight: 600;">주요 병목:</span>
                            <span style="color: #dc2626; font-weight: 600;">서류 심사 단계</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <span style="font-weight: 600;">개선 제안:</span>
                            <span style="color: #059669;">자동 스크리닝 도구 도입</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    // 월간 리포트 미리보기
    generateMonthlyReportPreview(data) {
        const currentMonth = new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: 'long' });
        const target = 15;
        const actual = Math.min(data.length, target + 3);
        const achievement = ((actual / target) * 100).toFixed(0);
        
        return `
            <div class="report-content monthly-report" style="
                width: 100%; 
                max-width: none; 
                margin: 0; 
                font-family: 'Noto Sans KR', sans-serif; 
                background: #F4F4F4;
                padding: 24px;
                min-height: 100vh;
            ">
                <!-- 헤더 섹션 -->
                <header style="text-align: center; padding: 24px 0;">
                    <h1 style="
                        font-size: 1.8rem; 
                        font-weight: 700; 
                        color: #0B4F6C; 
                        margin: 0 0 8px 0;
                        letter-spacing: -0.5px;
                    ">${currentMonth} 월간 채용 리포트</h1>
                    <p style="
                        font-size: 1rem; 
                        font-weight: 600; 
                        color: #01BAEF; 
                        margin: 0;
                    ">Monthly Report | 목표 달성 ${achievement}%</p>
                </header>
                
                <div class="report-section">
                    <h2>🎯 이번 달 목표 vs 실적</h2>
                    <div style="display: flex; flex-direction: column; gap: 20px;">
                        <div style="text-align: center; padding: 20px; background: #dbeafe; border-radius: 8px;">
                            <div style="font-size: 1.5rem; font-weight: 700; color: #1e40af;">${target}명</div>
                            <div style="color: #6b7280;">목표</div>
                        </div>
                        <div style="text-align: center; padding: 20px; background: #dcfce7; border-radius: 8px;">
                            <div style="font-size: 1.5rem; font-weight: 700; color: #166534;">${actual}명</div>
                            <div style="color: #6b7280;">실적</div>
                        </div>
                        <div style="text-align: center; padding: 20px; background: #fef3c7; border-radius: 8px;">
                            <div style="font-size: 1.5rem; font-weight: 700; color: #92400e;">${achievement}%</div>
                            <div style="color: #6b7280;">달성률 ${achievement >= 100 ? '✅' : '⚠️'}</div>
                        </div>
                    </div>
                </div>
                
                <div class="report-section">
                    <h2>📊 전월 대비 변화</h2>
                    <div class="kpi-grid">
                        <div class="kpi-card">
                            <h3>지원자 수</h3>
                            <div class="kpi-value">${data.length}명 (+15% ↗️)</div>
                        </div>
                        <div class="kpi-card">
                            <h3>합격자 수</h3>
                            <div class="kpi-value">${actual}명 (+12.5% ↗️)</div>
                        </div>
                        <div class="kpi-card">
                            <h3>평균 채용기간</h3>
                            <div class="kpi-value">16일 (-2일 ↗️)</div>
                        </div>
                        <div class="kpi-card">
                            <h3>비용 효율성</h3>
                            <div class="kpi-value">₩2.1M (-8% ↗️)</div>
                        </div>
                    </div>
                </div>
                
                <div class="report-section">
                    <h2>🏆 이번 달 하이라이트</h2>
                    <div style="padding: 20px; background: #f0f9ff; border-radius: 8px;">
                        <ul style="margin: 0; padding-left: 20px; line-height: 1.8;">
                            <li>신입 개발자 채용 완료 (5명)</li>
                            <li>마케팅팀 팀장 영입 성공</li>
                            <li>채용 프로세스 디지털화 완료</li>
                        </ul>
                    </div>
                </div>
                
                <div class="report-section">
                    <h2>📝 다음 달 계획</h2>
                    <div style="padding: 20px; background: #f8fafc; border-radius: 8px; border-left: 4px solid #4f46e5;">
                        <div style="display: flex; flex-direction: column; gap: 20px;">
                            <div>
                                <div style="font-weight: 600; margin-bottom: 10px;">📈 목표</div>
                                <div>20명 채용</div>
                            </div>
                            <div>
                                <div style="font-weight: 600; margin-bottom: 10px;">🎯 중점 분야</div>
                                <div>AI/ML 엔지니어</div>
                            </div>
                        </div>
                        <div style="margin-top: 15px;">
                            <div style="font-weight: 600; margin-bottom: 10px;">🚀 새로운 계획</div>
                            <div>새로운 채용 채널 테스트</div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    // 면접관 성과 미리보기
    generateInterviewerPerformancePreview(data) {
        const interviewerStats = this.calculateInterviewerStats(data);
        
        return `
            <div class="report-content interviewer-performance" style="
                width: 100%; 
                max-width: none; 
                margin: 0; 
                font-family: 'Noto Sans KR', sans-serif; 
                background: #F4F4F4;
                padding: 24px;
                min-height: 100vh;
            ">
                <!-- 헤더 섹션 -->
                <header style="text-align: center; padding: 24px 0;">
                    <h1 style="
                        font-size: 1.8rem; 
                        font-weight: 700; 
                        color: #0B4F6C; 
                        margin: 0 0 8px 0;
                        letter-spacing: -0.5px;
                    ">면접관별 성과 분석 리포트</h1>
                    <p style="
                        font-size: 1rem; 
                        font-weight: 600; 
                        color: #01BAEF; 
                        margin: 0;
                    ">Interviewer Performance | 면접관 ${interviewerStats.length}명</p>
                </header>
                
                <div class="report-section">
                    <h2>🏆 TOP 면접관 (합격자 배출 기준)</h2>
                    <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px;">
                        ${interviewerStats.slice(0, 3).map((interviewer, index) => `
                            <div style="text-align: center; padding: 20px; background: ${index === 0 ? '#fef3c7' : index === 1 ? '#e5e7eb' : '#fecaca'}; border-radius: 8px;">
                                <div style="font-size: 1.2rem; font-weight: 700; color: #1f2937;">${index + 1}. ${interviewer.name}</div>
                                <div style="font-size: 1rem; color: #6b7280; margin: 5px 0;">${interviewer.passed}명 (성공률 ${interviewer.rate}%)</div>
                                <div style="font-size: 2rem;">${index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}</div>
                            </div>
                        `).join('')}
                    </div>
                </div>
                
                <div class="report-section">
                    <h2>⏱️ 면접 효율성 분석</h2>
                    <div class="kpi-grid">
                        <div class="kpi-card">
                            <h3>평균 면접 시간</h3>
                            <div class="kpi-value">45분</div>
                        </div>
                        <div class="kpi-card">
                            <h3>가장 효율적</h3>
                            <div class="kpi-value">김철수 (35분)</div>
                        </div>
                        <div class="kpi-card">
                            <h3>개선 필요</h3>
                            <div class="kpi-value">정수진 (65분)</div>
                        </div>
                        <div class="kpi-card">
                            <h3>전체 면접 수</h3>
                            <div class="kpi-value">${data.length}건</div>
                        </div>
                    </div>
                </div>
                
                <div class="report-section">
                    <h2>📊 면접관별 통계</h2>
                    <table class="report-table">
                        <thead>
                            <tr>
                                <th>면접관</th>
                                <th>면접 수</th>
                                <th>합격 수</th>
                                <th>성공률</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${interviewerStats.slice(0, 5).map(interviewer => `
                                <tr>
                                    <td>${interviewer.name}</td>
                                    <td>${interviewer.total}</td>
                                    <td>${interviewer.passed}</td>
                                    <td><strong>${interviewer.rate}%</strong></td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
                
                <div class="report-section">
                    <h2>💡 개선 제안</h2>
                    <div style="padding: 20px; background: #f0f9ff; border-radius: 8px;">
                        <ul style="margin: 0; padding-left: 20px; line-height: 1.8;">
                            <li>면접 가이드라인 표준화</li>
                            <li>우수 면접관 노하우 공유</li>
                            <li>면접 시간 최적화 교육</li>
                        </ul>
                    </div>
                </div>
            </div>
        `;
    },

    // 비용 효율성 미리보기
    generateCostAnalysisPreview(data) {
        return `
            <div class="report-content cost-analysis" style="
                width: 100%; 
                max-width: none; 
                margin: 0; 
                font-family: 'Noto Sans KR', sans-serif; 
                background: #F4F4F4;
                padding: 24px;
                min-height: 100vh;
            ">
                <!-- 헤더 섹션 -->
                <header style="text-align: center; padding: 24px 0;">
                    <h1 style="
                        font-size: 1.8rem; 
                        font-weight: 700; 
                        color: #0B4F6C; 
                        margin: 0 0 8px 0;
                        letter-spacing: -0.5px;
                    ">채용 비용 효율성 분석 리포트</h1>
                    <p style="
                        font-size: 1rem; 
                        font-weight: 600; 
                        color: #01BAEF; 
                        margin: 0;
                    ">Cost Analysis | 비용 절감 16%</p>
                </header>
                
                <div class="report-section">
                    <h2>💵 채용 비용 현황</h2>
                    <div class="kpi-grid">
                        <div class="kpi-card">
                            <h3>총 채용 비용</h3>
                            <div class="kpi-value">₩24,500,000</div>
                        </div>
                        <div class="kpi-card">
                            <h3>채용당 평균 비용</h3>
                            <div class="kpi-value">₩2,100,000</div>
                        </div>
                        <div class="kpi-card">
                            <h3>전월 대비</h3>
                            <div class="kpi-value">-8% (절감 ↗️)</div>
                        </div>
                        <div class="kpi-card">
                            <h3>예산 대비</h3>
                            <div class="kpi-value">84% 사용</div>
                        </div>
                    </div>
                </div>
                
                <div class="report-section">
                    <h2>📊 채용 채널별 ROI</h2>
                    <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px;">
                        <div style="padding: 15px; background: #dcfce7; border-radius: 8px; border-left: 4px solid #10b981;">
                            <div style="font-weight: 600; color: #166534; margin-bottom: 5px;">직원 추천 (최고 ROI) ✅</div>
                            <div style="font-size: 1.2rem; font-weight: 700; color: #166534;">₩800,000/명</div>
                        </div>
                        <div style="padding: 15px; background: #dbeafe; border-radius: 8px; border-left: 4px solid #2563eb;">
                            <div style="font-weight: 600; color: #1e40af; margin-bottom: 5px;">온라인 채용 (최고효율)</div>
                            <div style="font-size: 1.2rem; font-weight: 700; color: #1e40af;">₩1,200,000/명</div>
                        </div>
                        <div style="padding: 15px; background: #fef3c7; border-radius: 8px; border-left: 4px solid #d97706;">
                            <div style="font-weight: 600; color: #92400e; margin-bottom: 5px;">채용박람회</div>
                            <div style="font-size: 1.2rem; font-weight: 700; color: #92400e;">₩2,800,000/명</div>
                        </div>
                        <div style="padding: 15px; background: #fecaca; border-radius: 8px; border-left: 4px solid #dc2626;">
                            <div style="font-weight: 600; color: #991b1b; margin-bottom: 5px;">헤드헌팅</div>
                            <div style="font-size: 1.2rem; font-weight: 700; color: #991b1b;">₩4,800,000/명</div>
                        </div>
                    </div>
                </div>
                
                <div class="report-section">
                    <h2>💡 비용 절감 기회</h2>
                    <div style="padding: 20px; background: #f0f9ff; border-radius: 8px;">
                        <ul style="margin: 0; padding-left: 20px; line-height: 1.8;">
                            <li>직원 추천 프로그램 확대</li>
                            <li>온라인 채널 비중 증대</li>
                            <li>헤드헌팅 의존도 감소</li>
                        </ul>
                    </div>
                </div>
                
                <div class="report-section">
                    <h2>🎯 목표 vs 실적</h2>
                    <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px;">
                        <div style="text-align: center; padding: 20px; background: #f8fafc; border-radius: 8px;">
                            <div style="font-size: 1.5rem; font-weight: 700; color: #6b7280;">₩2,500,000/명</div>
                            <div style="color: #6b7280;">목표 비용</div>
                        </div>
                        <div style="text-align: center; padding: 20px; background: #dcfce7; border-radius: 8px;">
                            <div style="font-size: 1.5rem; font-weight: 700; color: #166534;">₩2,100,000/명</div>
                            <div style="color: #6b7280;">실제 비용</div>
                        </div>
                        <div style="text-align: center; padding: 20px; background: #fef3c7; border-radius: 8px;">
                            <div style="font-size: 1.5rem; font-weight: 700; color: #92400e;">₩4,900,000</div>
                            <div style="color: #6b7280;">절감 효과 (16%)</div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    // 유틸리티 함수들
    getSelectedPeriodText() {
        const period = document.getElementById('report-filter-period')?.value || 'all';
        switch (period) {
            case 'all': return '전체 기간';
            case 'this-month': return '이번달';
            case 'last-30': return '최근 30일';
            case 'last-90': return '최근 3개월';
            case 'this-year': return '올해';
            case 'custom':
                const startDate = document.getElementById('report-start-date')?.value;
                const endDate = document.getElementById('report-end-date')?.value;
                if (startDate && endDate) {
                    return `${startDate} ~ ${endDate}`;
                }
                return '사용자 지정 기간';
            default: return '선택된 기간';
        }
    },

    calculateOnlinePercentage(data) {
        const app = globalThis.App;
        if (!app || !app.state || !app.state.data) return 0;
        
        const { headers } = app.state.data;
        const routeIndex = headers.indexOf('지원루트');
        
        if (routeIndex === -1) return 0;
        
        const onlineRoutes = ['온라인', '웹사이트', '채용사이트', '인터넷'];
        const onlineCount = data.filter(row => {
            const route = row[routeIndex] || '';
            return onlineRoutes.some(online => route.includes(online));
        }).length;
        
        return data.length > 0 ? Math.round((onlineCount / data.length) * 100) : 0;
    },

    calculateSeoulPercentage(data) {
        const app = globalThis.App;
        if (!app || !app.state || !app.state.data) return 0;
        
        const { headers } = app.state.data;
        const addressIndex = headers.findIndex(h => h.includes('주소') || h.includes('거주지'));
        
        if (addressIndex === -1) return 78; // 기본값
        
        const seoulCount = data.filter(row => {
            const address = row[addressIndex] || '';
            return address.includes('서울') || address.includes('경기');
        }).length;
        
        return data.length > 0 ? Math.round((seoulCount / data.length) * 100) : 78;
    },

    calculateRegionStats(data) {
        const app = globalThis.App;
        if (!app || !app.state || !app.state.data) return {};
        
        const { headers } = app.state.data;
        const addressIndex = headers.findIndex(h => h.includes('주소') || h.includes('거주지'));
        
        if (addressIndex === -1) return {};
        
        const regionStats = {};
        data.forEach(row => {
            const address = row[addressIndex] || '미지정';
            const region = this.extractRegion(address);
            regionStats[region] = (regionStats[region] || 0) + 1;
        });
        
        return regionStats;
    },

    extractRegion(address) {
        if (address.includes('서울')) return '서울';
        if (address.includes('경기')) return '경기';
        if (address.includes('인천')) return '인천';
        if (address.includes('부산')) return '부산';
        if (address.includes('대구')) return '대구';
        if (address.includes('광주')) return '광주';
        if (address.includes('대전')) return '대전';
        if (address.includes('울산')) return '울산';
        return '기타';
    },

    calculateInterviewerStats(data) {
        const app = globalThis.App;
        if (!app || !app.state || !app.state.data) return [];
        
        const { headers } = app.state.data;
        const interviewerIndex = headers.indexOf('면접관');
        const resultIndex = headers.indexOf('면접결과');
        
        if (interviewerIndex === -1) {
            // 기본 데이터 반환
            return [
                { name: '김철수', total: 14, passed: 12, rate: 85 },
                { name: '박영희', total: 13, passed: 10, rate: 78 },
                { name: '이민수', total: 11, passed: 8, rate: 72 },
                { name: '정수진', total: 10, passed: 6, rate: 60 },
                { name: '최동훈', total: 9, passed: 7, rate: 78 }
            ];
        }
        
        const interviewerStats = {};
        data.forEach(row => {
            const interviewer = row[interviewerIndex] || '미지정';
            const result = row[resultIndex] || '';
            
            if (!interviewerStats[interviewer]) {
                interviewerStats[interviewer] = { total: 0, passed: 0 };
            }
            
            interviewerStats[interviewer].total++;
            if (result === '합격') {
                interviewerStats[interviewer].passed++;
            }
        });
        
        return Object.entries(interviewerStats)
            .map(([name, stats]) => ({
                name,
                total: stats.total,
                passed: stats.passed,
                rate: stats.total > 0 ? Math.round((stats.passed / stats.total) * 100) : 0
            }))
            .sort((a, b) => b.rate - a.rate);
    },

    // 이벤트 리스너 설정
    setupEventListeners() {
        // 필터 변경 감지
        const filterSection = document.querySelector('#report .filter-section');
        if (filterSection) {
            filterSection.addEventListener('change', (e) => {
                if (e.target.tagName === 'SELECT' || e.target.tagName === 'INPUT') {
                    this.handleFilterChange(e.target);
                }
            });
        }

        // 리포트 생성 버튼
        const generateBtn = document.getElementById('generateReportBtn');
        console.log('🔍 리포트 생성 버튼 찾기:', generateBtn);
        if (generateBtn) {
            console.log('✅ 리포트 생성 버튼 이벤트 리스너 등록');
            generateBtn.addEventListener('click', () => {
                console.log('🔥 리포트 생성 버튼 클릭됨!');
                this.generateReport();
            });
        } else {
            console.error('❌ generateReportBtn 요소를 찾을 수 없습니다!');
        }

        // 필터 초기화
        const resetBtn = document.getElementById('report-reset-filters');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                this.resetFilters();
            });
        }
        
        // 저장 버튼
        const saveBtn = document.getElementById('saveReportBtn');
        if (saveBtn) {
            saveBtn.addEventListener('click', () => {
                this.saveReport();
            });
        }
        
        // 인쇄 버튼
        const printBtn = document.getElementById('printReportBtn');
        if (printBtn) {
            printBtn.addEventListener('click', () => {
                this.printReport();
            });
        }
    },

    // 필터 변경 처리
    handleFilterChange(target) {
        if (target.id === 'report-filter-period') {
            this.toggleDateRangePicker(target.value);
        }
        this.updateLivePreview();
        this.updateGenerateButton();
    },

    // 기간 선택기 토글
    toggleDateRangePicker(selectedValue) {
        const dateRangePicker = document.getElementById('report-custom-date-range');
        if (dateRangePicker) {
            dateRangePicker.style.display = selectedValue === 'custom' ? 'block' : 'none';
        }
    },

    // 필터 초기화
    resetFilters() {
        const filterSection = document.querySelector('#report .filter-section');
        if (!filterSection) return;
        
        filterSection.querySelectorAll('select').forEach(select => {
            select.selectedIndex = 0;
        });
        
        filterSection.querySelectorAll('input[type="date"]').forEach(input => {
            input.value = '';
        });
        
        this.toggleDateRangePicker('all');
        this.updateLivePreview();
        this.updateGenerateButton();
    },

    // 생성 버튼 업데이트
    updateGenerateButton() {
        const generateBtn = document.getElementById('generateReportBtn');
        if (!generateBtn) return;
        
        const filteredData = this.getFilteredReportData();
        const template = this.templates[this._currentTemplate];
        
        generateBtn.innerHTML = `
            <i class="fas fa-magic"></i> 
            ${template.name} 생성 (${filteredData.length}명)
        `;
        
        generateBtn.disabled = filteredData.length === 0;
    },

    // 필터 옵션 채우기
    populateFilters() {
        const app = globalThis.App;
        if (!app || !app.state || !app.state.data || !app.state.data.all.length) {
            console.log('⏳ 데이터 로딩 대기 중...');
            return;
        }
        
        const { headers, all } = app.state.data;
        
        const filtersToPopulate = {
            '지원루트': 'report-filter-route',
            '모집분야': 'report-filter-position',
            '회사명': 'report-filter-company',
            '증원자': 'report-filter-recruiter',
            '면접관': 'report-filter-interviewer'
        };
        
        for (const [headerName, selectId] of Object.entries(filtersToPopulate)) {
            const headerIndex = headers.indexOf(headerName);
            if (headerIndex === -1) continue;
            
            const uniqueOptions = [...new Set(
                all.map(row => (row[headerIndex] || '').trim())
                   .filter(value => value && value !== '-')
            )];
            
            const selectElement = document.getElementById(selectId);
            if (selectElement) {
                selectElement.innerHTML = '<option value="all">전체</option>';
                uniqueOptions.sort().forEach(option => {
                    selectElement.innerHTML += `<option value="${option}">${option}</option>`;
                });
            }
        }
        
        console.log('✅ 필터 옵션 로딩 완료');
    },

    // 기간 필터 리스너 설정
    setupPeriodFilterListener() {
        const periodFilter = document.getElementById('report-filter-period');
        if (periodFilter) {
            periodFilter.addEventListener('change', (e) => {
                this.toggleDateRangePicker(e.target.value);
                this.updateLivePreview();
            });
        }
    },

    // 필터링된 데이터 가져오기
    getFilteredReportData() {
        const app = globalThis.App;
        if (!app || !app.state || !app.state.data || !app.state.data.all.length) {
            return [];
        }
        
        const { headers, all } = app.state.data;
        
        // 필터 값들 가져오기
        const filters = {
            period: document.getElementById('report-filter-period')?.value || 'all',
            route: document.getElementById('report-filter-route')?.value || 'all',
            position: document.getElementById('report-filter-position')?.value || 'all',
            company: document.getElementById('report-filter-company')?.value || 'all',
            recruiter: document.getElementById('report-filter-recruiter')?.value || 'all',
            interviewer: document.getElementById('report-filter-interviewer')?.value || 'all'
        };
        
        const indices = {
            date: headers.indexOf('지원일'),
            route: headers.indexOf('지원루트'),
            position: headers.indexOf('모집분야'),
            company: headers.indexOf('회사명'),
            recruiter: headers.indexOf('증원자'),
            interviewer: headers.indexOf('면접관')
        };
        
        return all.filter(row => {
            // 기간 필터
            let dateMatch = true;
            if (filters.period !== 'all' && indices.date !== -1) {
                const applyDateStr = row[indices.date];
                if (!applyDateStr) return false;
                
                const applyDate = new Date(applyDateStr);
                if (isNaN(applyDate.getTime())) return false;
                
                const now = new Date();
                
                switch (filters.period) {
                    case 'this-month':
                        dateMatch = applyDate.getFullYear() === now.getFullYear() && 
                                   applyDate.getMonth() === now.getMonth();
                        break;
                    case 'last-30':
                        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                        dateMatch = applyDate >= thirtyDaysAgo;
                        break;
                    case 'last-90':
                        const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
                        dateMatch = applyDate >= ninetyDaysAgo;
                        break;
                    case 'this-year':
                        dateMatch = applyDate.getFullYear() === now.getFullYear();
                        break;
                    case 'custom':
                        const startDateStr = document.getElementById('report-start-date')?.value;
                        const endDateStr = document.getElementById('report-end-date')?.value;
                        if (startDateStr && endDateStr) {
                            const startDate = new Date(startDateStr);
                            const endDate = new Date(endDateStr);
                            if (!isNaN(startDate.getTime()) && !isNaN(endDate.getTime())) {
                                endDate.setHours(23, 59, 59, 999);
                                dateMatch = applyDate >= startDate && applyDate <= endDate;
                            }
                        }
                        break;
                }
            }
            
            // 기타 필터들
            const routeMatch = filters.route === 'all' || !indices.route || 
                              row[indices.route] === filters.route;
            const positionMatch = filters.position === 'all' || !indices.position || 
                                 row[indices.position] === filters.position;
            const companyMatch = filters.company === 'all' || !indices.company || 
                                row[indices.company] === filters.company;
            const recruiterMatch = filters.recruiter === 'all' || !indices.recruiter || 
                                  row[indices.recruiter] === filters.recruiter;
            const interviewerMatch = filters.interviewer === 'all' || !indices.interviewer || 
                                    row[indices.interviewer] === filters.interviewer;
            
            return dateMatch && routeMatch && positionMatch && 
                   companyMatch && recruiterMatch && interviewerMatch;
        });
    },

    // 출력 형식 선택기 초기화
    initFormatSelector() {
        const formatOptions = document.querySelectorAll('.format-option');
        formatOptions.forEach(option => {
            option.addEventListener('click', () => {
                formatOptions.forEach(opt => opt.classList.remove('selected'));
                option.classList.add('selected');
                
                const format = option.querySelector('span').textContent.toLowerCase();
                this._currentFormat = format;
                console.log(`출력 형식 선택: ${format}`);
            });
        });
    },

    // 보안 AI 시스템 초기화
    initSecureAISystem() {
        console.log('🔐 보안 AI 분석 시스템 초기화 완료');
        this._aiAnalysisEnabled = true;
    },

    // AI 분석 실행
    runAIAnalysis() {
        if (!this._aiAnalysisEnabled) {
            this.showAlert('AI 분석 기능이 비활성화되어 있습니다.');
            return;
        }
        
        const currentTime = Date.now();
        if (currentTime - this._lastAnalysisTime < this._analysisRateLimit) {
            const remaining = Math.ceil((this._analysisRateLimit - (currentTime - this._lastAnalysisTime)) / 1000);
            this.showAlert(`AI 분석은 ${remaining}초 후에 다시 사용할 수 있습니다.`);
            return;
        }
        
        this._lastAnalysisTime = currentTime;
        
        // AI 분석 시뮬레이션
        const aiButton = document.querySelector('.btn-preview-ai');
        if (aiButton) {
            const originalText = aiButton.innerHTML;
            aiButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 분석 중...';
            aiButton.disabled = true;
            
            setTimeout(() => {
                aiButton.innerHTML = originalText;
                aiButton.disabled = false;
                this.showAIInsights();
            }, 2000);
        }
    },

    // AI 인사이트 표시
    showAIInsights() {
        const previewContent = document.getElementById('livePreviewContent');
        if (!previewContent) return;
        
        const insightElement = document.createElement('div');
        insightElement.className = 'ai-insights';
        insightElement.innerHTML = `
            <div class="insights-header">
                <i class="fas fa-magic"></i>
                <span>AI 분석 완료</span>
            </div>
            <div class="insights-content">
                <p>• 지원루트 중 '직원추천'이 가장 높은 입과율을 보임</p>
                <p>• 면접 확정 후 입과율이 평균 대비 15% 높음</p>
                <p>• 추천: 직원추천 채널 확대 검토</p>
            </div>
        `;
        
        previewContent.appendChild(insightElement);
    },

    // 미리보기 사이드바 토글
    togglePreviewSidebar() {
        const sidebar = document.getElementById('livePreviewSidebar');
        const toggle = document.getElementById('previewToggle');
        
        if (sidebar && toggle) {
            sidebar.classList.toggle('collapsed');
            const icon = toggle.querySelector('i');
            if (icon) {
                icon.className = sidebar.classList.contains('collapsed') ? 
                    'fas fa-chevron-right' : 'fas fa-chevron-left';
            }
        }
    },

    // 리포트 생성
    generateReport() {
        console.log('🔍 generateReport 함수 호출됨');
        
        const filteredData = this.getFilteredReportData();
        const template = this.templates[this._currentTemplate];
        
        console.log('🔍 필터된 데이터 개수:', filteredData.length);
        console.log('🔍 현재 템플릿:', this._currentTemplate, template);
        
        if (filteredData.length === 0) {
            console.log('⚠️ 데이터가 없어서 알림 표시');
            this.showAlert('리포트를 생성할 데이터가 없습니다. 필터 설정을 확인해주세요.');
            return;
        }
        
        console.log(`📊 ${template.name} 리포트 생성 중... (${filteredData.length}명 대상)`);
        
        // 리포트 모달 열기
        this.openReportModal(template, filteredData);
    },

    // 리포트 모달 열기
    openReportModal(template, data) {
        console.log('🔍 openReportModal 함수 호출됨');
        
        const modal = document.getElementById('reportModal');
        const modalBody = document.getElementById('reportModalBody');
        
        console.log('🔍 모달 요소들:', { modal, modalBody });
        
        if (!modal || !modalBody) {
            console.error('❌ 리포트 모달 요소를 찾을 수 없습니다:', { modal, modalBody });
            this.showAlert('리포트 모달을 찾을 수 없습니다.');
            return;
        }
        
        // 기존 차트 정리
        if (this._chartInstance) {
            this._chartInstance.destroy();
            this._chartInstance = null;
        }
        
        // 리포트 내용 생성
        let reportHtml = this.generateReportContent(template, data);
        modalBody.innerHTML = reportHtml;
        
        // 모달 표시
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
        
        // 차트 렌더링 (필요한 경우)
        setTimeout(() => {
            this.renderReportCharts(template, data);
        }, 100);
        
        // 모달 닫기 이벤트
        const closeBtn = document.getElementById('closeReportModalBtn');
        if (closeBtn) {
            closeBtn.onclick = () => this.closeReportModal();
        }
        
        modal.onclick = (e) => {
            if (e.target === modal) this.closeReportModal();
        };
    },

    // 리포트 모달 닫기
    closeReportModal() {
        const modal = document.getElementById('reportModal');
        if (modal) {
            modal.style.display = 'none';
            document.body.style.overflow = '';
        }
        
        // 차트 정리
        if (this._chartInstance) {
            this._chartInstance.destroy();
            this._chartInstance = null;
        }
    },

    // 리포트 내용 생성 (개선된 버전)
    generateReportContent(template, data) {
        switch (this._currentTemplate) {
            case 'executive-summary':
                return this.generateExecutiveSummaryReport(data);
            case 'detailed-analysis':
                return this.generateDetailedAnalysisReport(data);
            case 'recruitment-funnel':
                return this.generateFunnelReport(data);
            case 'monthly-report':
                return this.generateMonthlyReport(data);
            case 'interviewer-performance':
                return this.generateInterviewerPerformanceReport(data);
            case 'cost-analysis':
                return this.generateCostAnalysisReport(data);
            default:
                return `<p>${template.name} 리포트는 현재 개발 중입니다.</p>`;
        }
    },

    // 나머지 리포트 템플릿들 (미리보기와 동일한 내용 사용)
    generateExecutiveSummaryReport(data) {
        return this.generateExecutiveSummaryPreview(data);
    },

    generateDetailedAnalysisReport(data) {
        return this.generateDetailedAnalysisPreview(data);
    },

    generateFunnelReport(data) {
        return this.generateFunnelPreview(data);
    },

    generateMonthlyReport(data) {
        return this.generateMonthlyReportPreview(data);
    },

    generateInterviewerPerformanceReport(data) {
        return this.generateInterviewerPerformancePreview(data);
    },

    generateCostAnalysisReport(data) {
        return this.generateCostAnalysisPreview(data);
    },

    // 퍼널 데이터 계산 (수정된 로직: 입과 취소자 제외)
    calculateFunnelData(data) {
        const app = globalThis.App;
        if (!app || !app.state || !app.state.data) return [];
        
        const { headers } = app.state.data;
        const indices = {
            contactResult: headers.indexOf('1차 컨택 결과'),
            interviewResult: headers.indexOf('면접결과'),
            joinDate: headers.indexOf('입과일')
        };
        
        // 최종결과 컬럼 찾기
        const finalResultCandidates = ['최종결과', '입과/출근', '입과출근', '결과', '상태'];
        let finalResultIndex = -1;
        for (const candidate of finalResultCandidates) {
            const index = headers.indexOf(candidate);
            if (index !== -1) {
                finalResultIndex = index;
                break;
            }
        }
        
        const total = data.length;
        const interviewConfirmed = data.filter(row => 
            (row[indices.contactResult] || '') === '면접확정'
        ).length;
        const passed = data.filter(row => 
            (row[indices.interviewResult] || '') === '합격'
        ).length;
        
        // 🔧 수정된 입과자 계산: 입과일이 있으면서 최종결과가 없는 사람만
        let joined = 0;
        if (indices.joinDate !== -1) {
            data.forEach(row => {
                const joinDate = (row[indices.joinDate] || '').toString().trim();
                if (joinDate && joinDate !== '-' && joinDate !== '') {
                    const finalResult = finalResultIndex !== -1 ? 
                        (row[finalResultIndex] || '').toString().trim() : '';
                    
                    // 최종결과가 비어있으면 실제 입과자
                    if (!finalResult || finalResult === '-') {
                        joined++;
                    }
                }
            });
        }
        
        return [
            { 
                stage: '총 지원', 
                count: total, 
                conversion: 100 
            },
            { 
                stage: '면접 확정', 
                count: interviewConfirmed, 
                conversion: total > 0 ? (interviewConfirmed / total * 100) : 0 
            },
            { 
                stage: '최종 합격', 
                count: passed, 
                conversion: interviewConfirmed > 0 ? (passed / interviewConfirmed * 100) : 0 
            },
            { 
                stage: '최종 입과', 
                count: joined, 
                conversion: passed > 0 ? (joined / passed * 100) : 0 
            }
        ];
    },

    // 퍼널 HTML 생성
    generateFunnelHtml(funnelData) {
        let html = '<div class="report-funnel">';
        
        funnelData.forEach((step, index) => {
            const width = index === 0 ? 100 : 
                (funnelData[index - 1].count > 0 ? 
                (step.count / funnelData[index - 1].count * 100) : 0);
            
            html += `
                <div class="funnel-step">
                    <div class="funnel-info">
                        <span class="funnel-stage">${step.stage}</span>
                        <span class="funnel-count">${step.count}명</span>
                    </div>
                    <div class="funnel-bar-container">
                        <div class="funnel-bar" style="width: ${width}%;"></div>
                    </div>
                    ${index > 0 ? `
                        <div class="funnel-conversion">
                            <i class="fas fa-arrow-down"></i> 
                            ${step.conversion.toFixed(1)}%
                        </div>
                    ` : ''}
                </div>
            `;
        });
        
        return html + '</div>';
    },

    // 상위 소스 계산
    calculateTopSources(data) {
        const app = globalThis.App;
        if (!app || !app.state || !app.state.data) return [];
        
        const { headers } = app.state.data;
        const indices = {
            route: headers.indexOf('지원루트'),
            joinDate: headers.indexOf('입과일')
        };
        
        const sourceStats = {};
        
        data.forEach(row => {
            const route = row[indices.route] || '미지정';
            if (!sourceStats[route]) {
                sourceStats[route] = { total: 0, joined: 0 };
            }
            sourceStats[route].total++;
            
            const joinDate = row[indices.joinDate] || '';
            if (joinDate.trim() && joinDate.trim() !== '-') {
                sourceStats[route].joined++;
            }
        });
        
        return Object.entries(sourceStats)
            .map(([name, stats]) => ({
                name,
                total: stats.total,
                joined: stats.joined,
                joinRate: stats.total > 0 ? (stats.joined / stats.total * 100) : 0
            }))
            .sort((a, b) => b.joinRate - a.joinRate)
            .slice(0, 5);
    },

    // 상위 소스 테이블 생성
    generateTopSourcesTable(topSources) {
        if (topSources.length === 0) {
            return '<p>우수 채용 경로 분석을 위한 데이터가 부족합니다.</p>';
        }
        
        let html = `
            <table class="report-table">
                <thead>
                    <tr>
                        <th>지원루트</th>
                        <th>총 지원</th>
                        <th>최종 입과</th>
                        <th>입과율</th>
                    </tr>
                </thead>
                <tbody>
        `;
        
        topSources.forEach(source => {
            html += `
                <tr>
                    <td>${source.name}</td>
                    <td>${source.total}명</td>
                    <td>${source.joined}명</td>
                    <td><strong>${source.joinRate.toFixed(1)}%</strong></td>
                </tr>
            `;
        });
        
        html += '</tbody></table>';
        return html;
    },

    // 지원루트 통계 계산
    calculateRouteStats(data) {
        const app = globalThis.App;
        if (!app || !app.state || !app.state.data) return {};
        
        const { headers } = app.state.data;
        const routeIndex = headers.indexOf('지원루트');
        
        if (routeIndex === -1) return {};
        
        const routeStats = {};
        
        data.forEach(row => {
            const route = row[routeIndex] || '미지정';
            routeStats[route] = (routeStats[route] || 0) + 1;
        });
        
        return routeStats;
    },

    // 데이터 테이블 생성
    generateDataTable(data) {
        const app = globalThis.App;
        if (!app || !app.state || !app.state.data) return '';
        
        const { headers } = app.state.data;
        
        // 테이블에서 제외할 컬럼들
        const excludeColumns = ['비고', '면접리뷰'];
        const visibleHeaders = headers.filter(h => !excludeColumns.includes(h));
        
        let html = `
            <div class="table-container">
                <table class="report-table">
                    <thead>
                        <tr>
        `;
        
        visibleHeaders.forEach(header => {
            html += `<th>${header}</th>`;
        });
        
        html += '</tr></thead><tbody>';
        
        data.forEach(row => {
            html += '<tr>';
            visibleHeaders.forEach(header => {
                const index = headers.indexOf(header);
                const value = row[index] || '-';
                html += `<td>${value}</td>`;
            });
            html += '</tr>';
        });
        
        html += '</tbody></table></div>';
        return html;
    },

    // 리포트 차트 렌더링
    renderReportCharts(template, data) {
        if (this._currentTemplate === 'executive-summary') {
            this.renderRouteChart(data);
        }
    },

    // 지원루트 차트 렌더링
    renderRouteChart(data) {
        const canvas = document.getElementById('routeChart');
        if (!canvas) return;
        
        const routeStats = this.calculateRouteStats(data);
        
        // 기존 차트 정리
        if (this._chartInstance) {
            this._chartInstance.destroy();
        }
        
        // 새 차트 생성
        this._chartInstance = new Chart(canvas.getContext('2d'), {
            type: 'bar',
            data: {
                labels: Object.keys(routeStats),
                datasets: [{
                    label: '지원자 수',
                    data: Object.values(routeStats),
                    backgroundColor: 'rgba(79, 70, 229, 0.6)',
                    borderColor: 'rgba(79, 70, 229, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            stepSize: 1
                        }
                    }
                }
            }
        });
    },

    // 알림 표시
    showAlert(message) {
        const overlay = document.createElement('div');
        overlay.className = 'custom-alert-overlay';
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.5);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 10000;
        `;
        
        overlay.innerHTML = `
            <div class="custom-alert-box" style="
                background: white;
                padding: 25px;
                border-radius: 12px;
                box-shadow: 0 5px 15px rgba(0,0,0,0.3);
                text-align: center;
                max-width: 400px;
                margin: 20px;
            ">
                <p style="margin: 0 0 20px; font-size: 1rem; color: #333; line-height: 1.4;">
                    ${message}
                </p>
                <button style="
                    padding: 10px 20px;
                    border: none;
                    background: #4f46e5;
                    color: white;
                    border-radius: 8px;
                    cursor: pointer;
                    font-weight: 600;
                    font-size: 14px;
                ">확인</button>
            </div>
        `;
        
        document.body.appendChild(overlay);
        
        const button = overlay.querySelector('button');
        button.onclick = () => overlay.remove();
        
        overlay.onclick = (e) => {
            if (e.target === overlay) overlay.remove();
        };
        
        // 3초 후 자동 닫기
        setTimeout(() => {
            if (overlay.parentNode) {
                overlay.remove();
            }
        }, 3000);
    },
    
    // 저장 기능
    saveReport() {
        const previewContent = document.getElementById('livePreviewContent');
        if (!previewContent || !previewContent.innerHTML.trim()) {
            this.showAlert('저장할 리포트가 없습니다. 먼저 템플릿을 선택해주세요.');
            return;
        }
        
        const template = this.templates[this._currentTemplate];
        const fileName = `${template.name}_${new Date().toLocaleDateString('ko-KR').replace(/\./g, '_')}.html`;
        
        // HTML 파일로 저장
        const htmlContent = `
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${template.name} - CFC 채용 리포트</title>
    <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@300;400;500;700;900&display=swap" rel="stylesheet">
    <style>
        body { 
            font-family: 'Noto Sans KR', sans-serif; 
            margin: 0; 
            padding: 20px; 
            background: #f5f5f5; 
        }
        .report-container { 
            max-width: 800px; 
            margin: 0 auto; 
            background: white; 
            padding: 40px; 
            border-radius: 8px; 
            box-shadow: 0 2px 10px rgba(0,0,0,0.1); 
        }
    </style>
</head>
<body>
    <div class="report-container">
        ${previewContent.innerHTML}
    </div>
</body>
</html>`;
        
        const blob = new Blob([htmlContent], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        this.showAlert(`리포트가 ${fileName} 파일로 저장되었습니다.`);
    },
    
    // 🔥 그리드 레이아웃 강제 적용 함수
    forceGridLayout() {
        // 모든 상위 요소 넓이 제한 해제
        const elementsToResize = [
            '#report',
            '#report .report-container',
            '#report .report-main-grid', 
            '#report .report-builder-section',
            '#report .report-builder',
            '#report .filter-section',
            '.content-area',
            '.main-content'
        ];
        
        elementsToResize.forEach(selector => {
            const element = document.querySelector(selector);
            if (element) {
                element.style.setProperty('max-width', 'none', 'important');
                element.style.setProperty('width', '100%', 'important');
            }
        });
        
        // 템플릿 갤러리 강제 6열 적용
        const templateGallery = document.querySelector('.template-gallery');
        if (templateGallery) {
            templateGallery.style.setProperty('display', 'grid', 'important');
            templateGallery.style.setProperty('grid-template-columns', 'repeat(6, 1fr)', 'important');
            templateGallery.style.setProperty('gap', '12px', 'important');
        }
        
        // 필터 그리드 강제 6열 적용
        const filterGrid = document.querySelector('#report .filter-grid');
        if (filterGrid) {
            filterGrid.style.setProperty('display', 'grid', 'important');
            filterGrid.style.setProperty('grid-template-columns', 'repeat(6, 1fr)', 'important');
            filterGrid.style.setProperty('gap', '8px 8px', 'important');
            filterGrid.style.setProperty('align-items', 'end', 'important');
            filterGrid.style.setProperty('max-width', 'none', 'important');
            filterGrid.style.setProperty('width', '100%', 'important');
        }
        
        console.log('🔥 모든 요소 넓이 제한 해제 및 그리드 레이아웃 강제 적용 완료');
    },
    
    // 최대 너비 제거 함수
    forceMaxWidthRemoval() {
        const reportMainGrid = document.querySelector('.report-main-grid');
        if (reportMainGrid) {
            reportMainGrid.style.setProperty('max-width', 'none', 'important');
            reportMainGrid.style.setProperty('grid-template-columns', '1fr', 'important');
        }
    },
    
    // 인쇄 기능
    printReport() {
        // 리포트 모달이 열려있는지 확인
        const reportModal = document.getElementById('reportModal');
        const reportModalBody = document.getElementById('reportModalBody');
        
        // 리포트 모달이 열려있고 내용이 있는지 확인
        if (reportModal && reportModal.style.display !== 'none' && reportModalBody && reportModalBody.innerHTML.trim()) {
            // 리포트 모달의 내용을 인쇄
            this.printModalContent(reportModalBody);
            return;
        }
        
        // 실시간 미리보기 내용 확인
        const previewContent = document.getElementById('livePreviewContent');
        if (previewContent && previewContent.innerHTML.trim() && !previewContent.innerHTML.includes('템플릿을 선택하면')) {
            this.printPreviewContent(previewContent);
            return;
        }
        
        // 인쇄할 내용이 없는 경우
        this.showAlert('인쇄할 리포트가 없습니다. 먼저 리포트를 생성해주세요.');
    },
    
    // 고우선순위 알림창 표시
    showAlert(message) {
        // 기존 알림창이 있으면 제거
        const existingAlert = document.getElementById('reportAlert');
        if (existingAlert) {
            existingAlert.remove();
        }
        
        // 새 알림창 생성
        const alertDiv = document.createElement('div');
        alertDiv.id = 'reportAlert';
        alertDiv.innerHTML = `
            <div style="
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0,0,0,0.7);
                z-index: 999999;
                display: flex;
                align-items: center;
                justify-content: center;
            ">
                <div style="
                    background: white;
                    padding: 30px;
                    border-radius: 12px;
                    box-shadow: 0 10px 30px rgba(0,0,0,0.3);
                    max-width: 400px;
                    text-align: center;
                    border: 2px solid #4f46e5;
                ">
                    <div style="
                        color: #4f46e5;
                        font-size: 2rem;
                        margin-bottom: 15px;
                    ">
                        <i class="fas fa-exclamation-circle"></i>
                    </div>
                    <p style="
                        margin: 0 0 20px 0;
                        font-size: 1.1rem;
                        color: #374151;
                        line-height: 1.5;
                    ">${message}</p>
                    <button onclick="document.getElementById('reportAlert').remove()" style="
                        background: #4f46e5;
                        color: white;
                        border: none;
                        padding: 10px 20px;
                        border-radius: 6px;
                        font-weight: 600;
                        cursor: pointer;
                        font-size: 1rem;
                    ">확인</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(alertDiv);
        
        // 3초 후 자동 제거
        setTimeout(() => {
            if (document.getElementById('reportAlert')) {
                document.getElementById('reportAlert').remove();
            }
        }, 3000);
    },
    
    // 모달 내용 인쇄
    printModalContent(content) {
        const template = this.templates[this._currentTemplate] || { name: 'CFC 채용 리포트' };
        
        // 새 창에서 인쇄용 페이지 열기
        const printWindow = window.open('', '_blank');
        
        printWindow.document.write(`
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <title>CFC 채용 리포트</title>
    <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@300;400;500;700;900&display=swap" rel="stylesheet">
    <style>
        @page {
            size: A4;
            margin: 15mm; /* 적당한 여백으로 복원 */
            /* 헤더와 푸터 제거 */
            @top-left { content: ""; }
            @top-center { content: ""; }
            @top-right { content: ""; }
            @bottom-left { content: ""; }
            @bottom-center { content: ""; }
            @bottom-right { content: ""; }
        }
        
        /* 배경색 강제 출력 설정 */
        * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            color-adjust: exact !important;
        }
        
        body { 
            font-family: 'Noto Sans KR', sans-serif; 
            margin: 0; 
            padding: 0; 
            font-size: 11pt; /* 자연스러운 크기로 복원 */
            line-height: 1.4; 
            color: #1a1a1a;
            background: white !important; /* 전체 배경을 흰색으로 강제 */
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            width: 180mm; /* A4 폭에서 여백 제외한 안전한 인쇄 영역 */
            max-width: 180mm;
        }
        
        /* 헤더 스타일 - 원본 그라데이션 유지 */
        .report-header {
            background: linear-gradient(135deg, #4f46e5, #7c3aed) !important;
            color: white !important;
            text-align: center;
            padding: 20px;
            margin-bottom: 20px;
            border-radius: 12px;
            page-break-after: avoid;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
        }
        
        .report-title, .report-header h1 {
            color: white !important;
            font-size: 16pt !important;
            font-weight: bold;
            margin: 0 0 10px 0;
        }
        
        .report-header .report-meta {
            color: white !important;
            font-size: 9pt;
        }
        
        .report-header .report-meta span {
            background: rgba(255, 255, 255, 0.2) !important;
            padding: 6px 12px;
            border-radius: 20px;
            margin: 0 5px;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
        }
        
        /* 섹션 스타일 - 연속 플로우를 위한 수정 */
        section {
            page-break-inside: auto; /* 자동 페이지 브레이크 허용 */
            margin-bottom: 15px; /* 간격 줄임 */
            background: white !important;
            border-radius: 12px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08); /* 그림자 줄임 */
            padding: 16px; /* 패딩 줄임 */
            border: 1px solid #e5e7eb;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
        }
        
        h1, h2, h3 {
            color: #0B4F6C !important;
            font-weight: 600;
            margin: 0 0 12px 0;
            page-break-after: avoid;
        }
        
        h1 { font-size: 14pt; }
        h2 { font-size: 12pt; }
        h3 { font-size: 11pt; }
        
        /* KPI 카드 배경색 강제 출력 */
        div[style*="background: #F0F9FF"],
        *[style*="background: #F0F9FF"] {
            background: #F0F9FF !important;
            border: 1px solid #0ea5e9 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
        }
        
        div[style*="background: #ECFDF5"],
        *[style*="background: #ECFDF5"] {
            background: #ECFDF5 !important;
            border: 1px solid #10b981 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
        }
        
        div[style*="background: #FEF3C7"],
        *[style*="background: #FEF3C7"] {
            background: #FEF3C7 !important;
            border: 1px solid #f59e0b !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
        }
        
        div[style*="background: #DBEAFE"],
        *[style*="background: #DBEAFE"] {
            background: #DBEAFE !important;
            border: 1px solid #3b82f6 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
        }
        
        div[style*="background: #F3E8FF"],
        *[style*="background: #F3E8FF"] {
            background: #F3E8FF !important;
            border: 1px solid #8b5cf6 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
        }
        
        div[style*="background: #F4F4F4"],
        *[style*="background: #F4F4F4"] {
            background: #F4F4F4 !important;
            border: 1px solid #d1d5db !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
        }
        
        div[style*="background: #FEF2F2"],
        *[style*="background: #FEF2F2"] {
            background: #FEF2F2 !important;
            border: 1px solid #fca5a5 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
        }
        
        /* 그라데이션 배경 강제 출력 */
        *[style*="rgba(1, 186, 239, 0.1)"] {
            background: rgba(1, 186, 239, 0.1) !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
        }
        
        /* 그리드 레이아웃 */
        div[style*="display: grid"] {
            display: grid !important;
            gap: 15px !important; /* 자연스러운 간격 */
        }
        
        div[style*="grid-template-columns: 1fr 1fr"] {
            grid-template-columns: 1fr 1fr !important;
        }
        
        /* 텍스트 색상 유지 */
        *[style*="color: #0B4F6C"] { color: #0B4F6C !important; }
        *[style*="color: #01BAEF"] { color: #01BAEF !important; }
        *[style*="color: #374151"] { color: #374151 !important; }
        *[style*="color: #6B7280"] { color: #6B7280 !important; }
        *[style*="color: #059669"] { color: #059669 !important; }
        *[style*="color: #F59E0B"] { color: #F59E0B !important; }
        *[style*="color: #DC2626"] { color: #DC2626 !important; }
        *[style*="color: #3b82f6"] { color: #3b82f6 !important; }
        *[style*="color: #8b5cf6"] { color: #8b5cf6 !important; }
        *[style*="color: #FF6B6B"] { color: #FF6B6B !important; }
        *[style*="color: white"] { color: white !important; }
        
        /* 테이블 스타일 */
        table {
            width: 100%;
            border-collapse: collapse;
            page-break-inside: avoid;
            font-size: 10pt;
            margin: 15px 0;
        }
        
        th, td {
            border: 1px solid #d1d5db;
            padding: 8px;
            text-align: center;
        }
        
        th {
            background: #f8fafc !important;
            font-weight: bold;
            color: #374151 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
        }
        
        /* 차트 영역 */
        .chart-container, canvas {
            page-break-inside: avoid;
            max-height: 200px !important; /* 자연스러운 차트 크기 */
            width: 100% !important;
        }
        
        /* 자연스러운 간격 */
        p {
            margin: 8px 0;
            line-height: 1.4;
        }
        
        .main-analysis-grid,
        .force-grid-2col {
            display: grid !important;
            grid-template-columns: 1fr 1fr !important;
            gap: 15px !important;
            margin-bottom: 20px !important;
        }
        
        .improvement-proposal-section {
            clear: both !important;
            width: 100% !important;
            margin-top: 20px !important;
        }
        
        /* 페이지 브레이크 제어 */
        .executive-summary > section:first-child {
            page-break-after: avoid;
        }
        
        /* 브라우저별 헤더/푸터 숨기기 시도 */
        @media print {
            @page { margin: 15mm; }
        }
    </style>
</head>
<body>
    ${content.innerHTML}
</body>
</html>
        `);
        
        printWindow.document.close();
        
        // 로딩 후 인쇄 대화상자 열기
        printWindow.onload = () => {
            setTimeout(() => {
                printWindow.print();
                printWindow.close();
            }, 100);
        };
    },
    
    // 미리보기 내용 인쇄
    printPreviewContent(content) {
        const template = this.templates[this._currentTemplate] || { name: 'CFC 채용 리포트' };
        
        printWindow.document.write(`
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <title>${template.name} - CFC 채용 리포트</title>
    <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@300;400;500;700;900&display=swap" rel="stylesheet">
    <style>
        body { 
            font-family: 'Noto Sans KR', sans-serif; 
            margin: 0; 
            padding: 20mm; 
            font-size: 12pt; 
            line-height: 1.5; 
        }
        .report-header { 
            text-align: center; 
            border-bottom: 2px solid #333; 
            padding-bottom: 20px; 
            margin-bottom: 30px; 
        }
        .kpi-grid { 
            display: flex; 
            flex-direction: column; 
            gap: 15px; 
            margin: 20px 0; 
        }
        .kpi-card { 
            border: 1px solid #ddd; 
            padding: 15px; 
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-radius: 8px; 
        }
        .report-section { 
            margin-bottom: 25px; 
            page-break-inside: avoid; 
        }
        @media print {
            body { margin: 0; padding: 15mm; }
            .report-section { page-break-inside: avoid; }
        }
    </style>
</head>
<body>
    ${previewContent.innerHTML}
</body>
</html>`);
        
        printWindow.document.close();
        
        // 문서 로드 완료 후 인쇄
        printWindow.onload = () => {
            printWindow.focus();
            printWindow.print();
            printWindow.close();
        };
    }
};
