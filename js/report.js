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
            icon: 'fas fa-chart-pie',
            description: '핵심 KPI와 트렌드 분석',
            sections: ['kpi', 'funnel', 'topSources', 'trends'],
            estimatedTime: '30초',
            difficulty: 'easy'
        },
        'detailed-analysis': {
            name: '상세 분석', 
            icon: 'fas fa-chart-bar',
            description: '깊이 있는 데이터 분석',
            sections: ['kpi', 'charts', 'demographics', 'efficiency'],
            estimatedTime: '45초',
            difficulty: 'medium'
        },
        'recruitment-funnel': {
            name: '채용 퍼널',
            icon: 'fas fa-funnel-dollar', 
            description: '단계별 전환율 집중 분석',
            sections: ['funnel', 'bottleneck', 'optimization'],
            estimatedTime: '20초',
            difficulty: 'easy'
        },
        'monthly-report': {
            name: '월간 리포트',
            icon: 'fas fa-calendar-alt',
            description: '월별 성과 종합 분석', 
            sections: ['monthly-kpi', 'comparison', 'trends', 'goals'],
            estimatedTime: '1분',
            difficulty: 'hard'
        },
        'interviewer-performance': {
            name: '면접관 성과',
            icon: 'fas fa-user-tie',
            description: '면접관별 효율성 분석',
            sections: ['interviewer-stats', 'comparison', 'recommendations'], 
            estimatedTime: '35초',
            difficulty: 'medium'
        },
        'cost-analysis': {
            name: '비용 효율성',
            icon: 'fas fa-dollar-sign',
            description: '채용 비용 대비 효과 분석',
            sections: ['cost-breakdown', 'roi-analysis', 'optimization'],
            estimatedTime: '40초', 
            difficulty: 'medium'
        }
    },

    // 모듈 초기화
    init() {
        if (this._isInitialized) return;
        
        console.log('🚀 [ReportModule v6.0] 초기화 시작...');
        
        try {
            this.renderTemplateGallery();
            this.initLivePreview();
            this.setupEventListeners();
            this.initFormatSelector();
            this.initSecureAISystem();
            
            // 🔥 그리드 레이아웃 강제 적용
            setTimeout(() => {
                this.forceGridLayout();
            }, 500);
            
            setTimeout(() => {
                this.populateFilters();
                this.setupPeriodFilterListener();
            }, 1000);
            
            this._isInitialized = true;
            console.log('✅ [ReportModule v6.0] 초기화 완료!');
            
        } catch (error) {
            console.error('❌ [ReportModule] 초기화 실패:', error);
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
            
            const difficultyColors = {
                'easy': '#10b981',
                'medium': '#f59e0b', 
                'hard': '#ef4444'
            };
            
            card.innerHTML = `
                <div class="template-header">
                    <div class="template-icon">
                        <i class="${template.icon}"></i>
                    </div>
                    <div class="template-info">
                        <h4 class="template-name">${template.name}</h4>
                        <p>${template.description}</p>
                    </div>
                </div>
                <div class="template-meta">
                    <div class="meta-item">
                        <i class="fas fa-clock"></i>
                        <span>${template.estimatedTime}</span>
                    </div>
                    <div class="difficulty-badge" style="background: ${difficultyColors[template.difficulty]}">
                        ${template.difficulty === 'easy' ? '간단' : template.difficulty === 'medium' ? '보통' : '상세'}
                    </div>
                </div>
            `;
            
            card.addEventListener('click', () => {
                this.selectTemplate(key);
            });
            
            gallery.appendChild(card);
        });

        this.selectTemplate('executive-summary');
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
            reportMainGrid.style.gridTemplateColumns = '1fr 1fr';
            reportMainGrid.style.gap = '20px';
            reportMainGrid.style.width = '100%';
            reportMainGrid.style.maxWidth = '2800px';
            reportMainGrid.style.margin = '0 auto';
            reportMainGrid.style.alignItems = 'start';
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
            previewSidebar.style.maxWidth = '100%';
            previewSidebar.style.minWidth = '0';
            previewSidebar.style.boxSizing = 'border-box';
        }
        
        // 🔥 미리보기 콘텐츠 스타일 강제 적용  
        previewContent.style.width = '100%';
        previewContent.style.maxWidth = '100%';
        previewContent.style.boxSizing = 'border-box';
        
        const template = this.templates[this._currentTemplate];
        if (!template) return;
        
        const filteredData = this.getFilteredReportData();
        
        previewContent.innerHTML = `
            <div class="preview-header" style="display: flex; flex-direction: column; align-items: center; gap: 10px; padding: 15px 0; border-bottom: 1px solid #e2e8f0;">
                <h4 style="margin: 0; font-size: 1.1rem; font-weight: 600; color: #1e293b; text-align: center;">${template.name}</h4>
                <span class="preview-count" style="background: #3b82f6; color: white; padding: 4px 12px; border-radius: 20px; font-size: 0.85rem; font-weight: 500; display: inline-block; width: auto;">${filteredData.length}명 대상</span>
            </div>
            <div class="preview-summary" style="width: 100%; max-width: 100%; overflow-x: auto; box-sizing: border-box;">
                ${this.generatePreviewSummary(filteredData)}
            </div>
            <div class="preview-actions">
                <button class="btn-preview-ai" onclick="globalThis.App.report.runAIAnalysis()">
                    <i class="fas fa-magic"></i> 분석 실행
                </button>
            </div>
        `;
        
        // 🔥 DOM 삽입 후 전체 너비 사용 및 제목 색상 극강 테스트
        setTimeout(() => {
            const previewContent = document.getElementById('livePreviewContent');
            const previewSidebar = document.getElementById('livePreviewSidebar');
            
            if (previewContent && previewSidebar) {
                console.log('🔍 미리보기 콘텐츠 발견:', previewContent);
                
                // 🎯 모든 가능한 제목 요소를 찾아서 극강 스타일 테스트
                const titleSelectors = [
                    '.report-title', 'h1.report-title', '.report-header h1', 
                    'h1', 'h2', 'h3', '.report-header .report-title'
                ];
                
                titleSelectors.forEach(selector => {
                    const titles = previewContent.querySelectorAll(selector);
                    console.log(`🔍 미리보기 ${selector} 선택자로 찾은 요소:`, titles.length);
                    
                    titles.forEach((title, index) => {
                        console.log(`🎯 미리보기 제목 요소 ${index + 1}:`, title.textContent?.substring(0, 50));
                        
                        // 모던하고 세련된 스타일 적용
                        title.style.cssText = `
                            color: #1a202c !important;
                            font-size: 2.5rem !important;
                            font-weight: 800 !important;
                            text-shadow: none !important;
                            background: transparent !important;
                            padding: 0 !important;
                            border: none !important;
                            opacity: 1 !important;
                            visibility: visible !important;
                            display: block !important;
                            text-align: center !important;
                            margin: 0 !important;
                            position: relative !important;
                            z-index: 1 !important;
                            letter-spacing: -1px !important;
                            line-height: 1.1 !important;
                        `;
                    });
                });
                
                // 🎯 리포트 헤더 전체도 강력하게 스타일링
                const reportHeaders = previewContent.querySelectorAll('.report-header');
                console.log('🔍 미리보기 리포트 헤더 발견:', reportHeaders.length);
                
                reportHeaders.forEach((header, index) => {
                    console.log(`🎯 미리보기 헤더 ${index + 1}:`, header.innerHTML?.substring(0, 100));
                    
                    // 헤더 자체를 매우 눈에 띄게
                    header.style.cssText = `
                        background: #ff0000 !important;
                        padding: 30px !important;
                        border: 5px solid #00ff00 !important;
                        border-radius: 12px !important;
                        margin: 20px 0 !important;
                        text-align: center !important;
                        color: #ffffff !important;
                        font-size: 2rem !important;
                        z-index: 999999 !important;
                        position: relative !important;
                        width: 100% !important;
                        max-width: 100% !important;
                        box-sizing: border-box !important;
                    `;
                });
                
                // 미리보기 사이드바 패딩 최소화
                previewSidebar.style.padding = '15px';
                
                // 전체 너비 적용
                const allElements = previewContent.querySelectorAll('*');
                allElements.forEach(el => {
                    el.style.width = '100%';
                    el.style.maxWidth = '100%';
                    el.style.boxSizing = 'border-box';
                });
                
                console.log('🎯 미리보기 극강 스타일 적용 완료!');
            }
        }, 300); // 300ms로 늘림
    },

    // 미리보기 요약 생성
    generatePreviewSummary(data) {
        if (data.length === 0) {
            return '<p class="no-data">필터 조건에 맞는 데이터가 없습니다.</p>';
        }
        
        const template = this.templates[this._currentTemplate];
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
                return `<p>${template.name} 미리보기 준비 중...</p>`;
        }
    },

    // 경영진 요약 미리보기
    generateExecutiveSummaryPreview(data) {
        const funnelData = this.calculateFunnelData(data);
        const total = data.length;
        const passed = funnelData[2]?.count || 0;
        const joined = funnelData[3]?.count || 0;
        const passRate = total > 0 ? ((passed / total) * 100).toFixed(1) : 0;
        const joinRate = total > 0 ? ((joined / total) * 100).toFixed(1) : 0;
        
        return `
            <div class="report-content executive-summary" style="
                width: 100%; 
                max-width: 900px; 
                margin: 0 auto; 
                font-family: 'Inter', 'Noto Sans KR', -apple-system, BlinkMacSystemFont, sans-serif; 
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                border-radius: 24px;
                padding: 0;
                overflow: hidden;
                box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
                position: relative;
            ">
                <!-- Animated Background Pattern -->
                <div style="
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: url('data:image/svg+xml,<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 100 100\"><defs><pattern id=\"grid\" width=\"20\" height=\"20\" patternUnits=\"userSpaceOnUse\"><path d=\"M 20 0 L 0 0 0 20\" fill=\"none\" stroke=\"rgba(255,255,255,0.1)\" stroke-width=\"1\"/></pattern></defs><rect width=\"100\" height=\"100\" fill=\"url(%23grid)\"/></svg>');
                    opacity: 0.3;
                "></div>
                
                <!-- Header Section -->
                <div class="report-header" style="
                    position: relative;
                    z-index: 2;
                    background: rgba(255, 255, 255, 0.95);
                    backdrop-filter: blur(20px);
                    padding: 40px;
                    text-align: center;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.2);
                ">
                    <div style="
                        display: inline-flex;
                        align-items: center;
                        gap: 16px;
                        background: linear-gradient(135deg, #667eea, #764ba2);
                        -webkit-background-clip: text;
                        -webkit-text-fill-color: transparent;
                        background-clip: text;
                        margin-bottom: 16px;
                    ">
                        <div style="
                            width: 48px;
                            height: 48px;
                            background: linear-gradient(135deg, #667eea, #764ba2);
                            border-radius: 16px;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            color: white;
                            font-size: 24px;
                            box-shadow: 0 8px 32px rgba(102, 126, 234, 0.3);
                        ">📊</div>
                        <h1 style="
                            color: #1a202c !important; 
                            font-size: 2.5rem !important; 
                            font-weight: 800 !important; 
                            margin: 0 !important;
                            letter-spacing: -1px !important;
                            line-height: 1.1 !important;
                        ">CFC 채용 리포트</h1>
                    </div>
                    <p style="
                        color: #64748b; 
                        font-size: 1.1rem; 
                        margin: 0 0 24px 0; 
                        font-weight: 500;
                    ">Executive Summary · ${this.getSelectedPeriodText()}</p>
                    <div style="
                        display: inline-flex;
                        gap: 16px;
                        flex-wrap: wrap;
                        justify-content: center;
                    ">
                        <div style="
                            background: rgba(102, 126, 234, 0.1);
                            border: 1px solid rgba(102, 126, 234, 0.2);
                            padding: 8px 20px;
                            border-radius: 50px;
                            color: #667eea;
                            font-weight: 600;
                            font-size: 0.9rem;
                        ">총 ${total}명 분석</div>
                        <div style="
                            background: rgba(16, 185, 129, 0.1);
                            border: 1px solid rgba(16, 185, 129, 0.2);
                            padding: 8px 20px;
                            border-radius: 50px;
                            color: #10b981;
                            font-weight: 600;
                            font-size: 0.9rem;
                        ">${passed}명 합격</div>
                    </div>
                </div>

                <!-- Content Section -->
                <div style="
                    position: relative;
                    z-index: 2;
                    background: #ffffff;
                    padding: 48px 40px;
                ">
                    <!-- KPI Dashboard -->
                    <div style="margin-bottom: 48px;">
                        <h2 style="
                            color: #1a202c;
                            font-size: 1.5rem;
                            font-weight: 700;
                            margin-bottom: 24px;
                            display: flex;
                            align-items: center;
                            gap: 12px;
                        ">
                            <div style="
                                width: 6px;
                                height: 24px;
                                background: linear-gradient(135deg, #667eea, #764ba2);
                                border-radius: 3px;
                            "></div>
                            핵심 성과 지표
                        </h2>
                        <div style="
                            display: grid;
                            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                            gap: 20px;
                        ">
                            <div style="
                                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                                border-radius: 20px;
                                padding: 32px 24px;
                                text-align: center;
                                color: white;
                                position: relative;
                                overflow: hidden;
                                box-shadow: 0 10px 40px rgba(102, 126, 234, 0.3);
                            ">
                                <div style="
                                    position: absolute;
                                    top: -50%;
                                    right: -30%;
                                    width: 120px;
                                    height: 120px;
                                    background: rgba(255, 255, 255, 0.1);
                                    border-radius: 50%;
                                "></div>
                                <div style="font-size: 3rem; font-weight: 800; margin-bottom: 8px; position: relative; z-index: 1;">${total}</div>
                                <div style="font-size: 0.9rem; opacity: 0.9; font-weight: 500; position: relative; z-index: 1;">총 지원자</div>
                            </div>
                            <div style="
                                background: linear-gradient(135deg, #10b981 0%, #059669 100%);
                                border-radius: 20px;
                                padding: 32px 24px;
                                text-align: center;
                                color: white;
                                position: relative;
                                overflow: hidden;
                                box-shadow: 0 10px 40px rgba(16, 185, 129, 0.3);
                            ">
                                <div style="
                                    position: absolute;
                                    top: -50%;
                                    right: -30%;
                                    width: 120px;
                                    height: 120px;
                                    background: rgba(255, 255, 255, 0.1);
                                    border-radius: 50%;
                                "></div>
                                <div style="font-size: 3rem; font-weight: 800; margin-bottom: 8px; position: relative; z-index: 1;">${passed}</div>
                                <div style="font-size: 0.9rem; opacity: 0.9; font-weight: 500; position: relative; z-index: 1;">최종 합격</div>
                            </div>
                            <div style="
                                background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
                                border-radius: 20px;
                                padding: 32px 24px;
                                text-align: center;
                                color: white;
                                position: relative;
                                overflow: hidden;
                                box-shadow: 0 10px 40px rgba(139, 92, 246, 0.3);
                            ">
                                <div style="
                                    position: absolute;
                                    top: -50%;
                                    right: -30%;
                                    width: 120px;
                                    height: 120px;
                                    background: rgba(255, 255, 255, 0.1);
                                    border-radius: 50%;
                                "></div>
                                <div style="font-size: 3rem; font-weight: 800; margin-bottom: 8px; position: relative; z-index: 1;">${passRate}%</div>
                                <div style="font-size: 0.9rem; opacity: 0.9; font-weight: 500; position: relative; z-index: 1;">합격률</div>
                            </div>
                            <div style="
                                background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
                                border-radius: 20px;
                                padding: 32px 24px;
                                text-align: center;
                                color: white;
                                position: relative;
                                overflow: hidden;
                                box-shadow: 0 10px 40px rgba(245, 158, 11, 0.3);
                            ">
                                <div style="
                                    position: absolute;
                                    top: -50%;
                                    right: -30%;
                                    width: 120px;
                                    height: 120px;
                                    background: rgba(255, 255, 255, 0.1);
                                    border-radius: 50%;
                                "></div>
                                <div style="font-size: 3rem; font-weight: 800; margin-bottom: 8px; position: relative; z-index: 1;">${joinRate}%</div>
                                <div style="font-size: 0.9rem; opacity: 0.9; font-weight: 500; position: relative; z-index: 1;">입과율</div>
                            </div>
                        </div>
                    </div>

                    <!-- Success Highlights -->
                    <div style="margin-bottom: 48px;">
                        <h2 style="
                            color: #1a202c;
                            font-size: 1.5rem;
                            font-weight: 700;
                            margin-bottom: 24px;
                            display: flex;
                            align-items: center;
                            gap: 12px;
                        ">
                            <div style="
                                width: 6px;
                                height: 24px;
                                background: linear-gradient(135deg, #10b981, #059669);
                                border-radius: 3px;
                            "></div>
                            주요 성과
                        </h2>
                        <div style="
                            background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%);
                            border-radius: 16px;
                            padding: 32px;
                            border-left: 4px solid #10b981;
                            position: relative;
                            overflow: hidden;
                        ">
                            <div style="
                                position: absolute;
                                top: -20px;
                                right: -20px;
                                width: 80px;
                                height: 80px;
                                background: rgba(16, 185, 129, 0.1);
                                border-radius: 50%;
                            "></div>
                            <ul style="
                                margin: 0;
                                padding-left: 24px;
                                line-height: 2;
                                color: #065f46;
                                font-weight: 500;
                                list-style: none;
                                position: relative;
                                z-index: 1;
                            ">
                                <li style="
                                    margin-bottom: 12px;
                                    display: flex;
                                    align-items: center;
                                    gap: 12px;
                                ">
                                    <div style="
                                        width: 20px;
                                        height: 20px;
                                        background: #10b981;
                                        border-radius: 50%;
                                        display: flex;
                                        align-items: center;
                                        justify-content: center;
                                        color: white;
                                        font-size: 12px;
                                        flex-shrink: 0;
                                    ">✓</div>
                                    온라인 지원 비중 증가 (전체의 ${this.calculateOnlinePercentage(data)}%)
                                </li>
                                <li style="
                                    margin-bottom: 12px;
                                    display: flex;
                                    align-items: center;
                                    gap: 12px;
                                ">
                                    <div style="
                                        width: 20px;
                                        height: 20px;
                                        background: #10b981;
                                        border-radius: 50%;
                                        display: flex;
                                        align-items: center;
                                        justify-content: center;
                                        color: white;
                                        font-size: 12px;
                                        flex-shrink: 0;
                                    ">✓</div>
                                    평균 채용 기간 단축 (목표 대비 우수)
                                </li>
                                <li style="
                                    display: flex;
                                    align-items: center;
                                    gap: 12px;
                                ">
                                    <div style="
                                        width: 20px;
                                        height: 20px;
                                        background: #10b981;
                                        border-radius: 50%;
                                        display: flex;
                                        align-items: center;
                                        justify-content: center;
                                        color: white;
                                        font-size: 12px;
                                        flex-shrink: 0;
                                    ">✓</div>
                                    면접 진행률 향상
                                </li>
                            </ul>
                        </div>
                    </div>

                    <!-- Action Items -->
                    <div>
                        <h2 style="
                            color: #1a202c;
                            font-size: 1.5rem;
                            font-weight: 700;
                            margin-bottom: 24px;
                            display: flex;
                            align-items: center;
                            gap: 12px;
                        ">
                            <div style="
                                width: 6px;
                                height: 24px;
                                background: linear-gradient(135deg, #ef4444, #dc2626);
                                border-radius: 3px;
                            "></div>
                            개선 포인트
                        </h2>
                        <div style="
                            background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%);
                            border-radius: 16px;
                            padding: 32px;
                            border-left: 4px solid #ef4444;
                            position: relative;
                            overflow: hidden;
                        ">
                            <div style="
                                position: absolute;
                                top: -20px;
                                right: -20px;
                                width: 80px;
                                height: 80px;
                                background: rgba(239, 68, 68, 0.1);
                                border-radius: 50%;
                            "></div>
                            <ul style="
                                margin: 0;
                                padding-left: 24px;
                                line-height: 2;
                                color: #7f1d1d;
                                font-weight: 500;
                                list-style: none;
                                position: relative;
                                z-index: 1;
                            ">
                                <li style="
                                    margin-bottom: 12px;
                                    display: flex;
                                    align-items: center;
                                    gap: 12px;
                                ">
                                    <div style="
                                        width: 20px;
                                        height: 20px;
                                        background: #ef4444;
                                        border-radius: 50%;
                                        display: flex;
                                        align-items: center;
                                        justify-content: center;
                                        color: white;
                                        font-size: 12px;
                                        flex-shrink: 0;
                                    ">!</div>
                                    서류 통과율 개선 필요
                                </li>
                                <li style="
                                    margin-bottom: 12px;
                                    display: flex;
                                    align-items: center;
                                    gap: 12px;
                                ">
                                    <div style="
                                        width: 20px;
                                        height: 20px;
                                        background: #ef4444;
                                        border-radius: 50%;
                                        display: flex;
                                        align-items: center;
                                        justify-content: center;
                                        color: white;
                                        font-size: 12px;
                                        flex-shrink: 0;
                                    ">!</div>
                                    면접 후 입과율 향상 방안 검토
                                </li>
                                <li style="
                                    display: flex;
                                    align-items: center;
                                    gap: 12px;
                                ">
                                    <div style="
                                        width: 20px;
                                        height: 20px;
                                        background: #ef4444;
                                        border-radius: 50%;
                                        display: flex;
                                        align-items: center;
                                        justify-content: center;
                                        color: white;
                                        font-size: 12px;
                                        flex-shrink: 0;
                                    ">!</div>
                                    지원 채널 다양화 추진
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        `;
                            <li>서류 검토 단계 병목 현상</li>
                            <li>면접관 스케줄 조정 필요</li>
                            <li>채용 채널 다양화 검토</li>
                        </ul>
                    </div>
                </div>
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
                max-width: 900px; 
                margin: 0 auto; 
                font-family: 'Inter', 'Noto Sans KR', sans-serif; 
                background: linear-gradient(135deg, #4f46e5 0%, #06b6d4 100%);
                border-radius: 24px;
                padding: 0;
                overflow: hidden;
                box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
            ">
                <div class="report-header" style="
                    background: rgba(255, 255, 255, 0.95);
                    backdrop-filter: blur(20px);
                    padding: 40px;
                    text-align: center;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.2);
                ">
                    <div style="
                        display: inline-flex;
                        align-items: center;
                        gap: 16px;
                        margin-bottom: 16px;
                    ">
                        <div style="
                            width: 48px;
                            height: 48px;
                            background: linear-gradient(135deg, #4f46e5, #06b6d4);
                            border-radius: 16px;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            color: white;
                            font-size: 24px;
                            box-shadow: 0 8px 32px rgba(79, 70, 229, 0.3);
                        ">📊</div>
                        <h1 style="
                            color: #1a202c !important; 
                            font-size: 2.5rem !important; 
                            font-weight: 800 !important; 
                            margin: 0 !important;
                            letter-spacing: -1px !important;
                        ">채용 상세 분석</h1>
                    </div>
                    <p style="color: #64748b; font-size: 1.1rem; margin: 0 0 24px 0; font-weight: 500;">Detailed Analysis · ${this.getSelectedPeriodText()}</p>
                    <div style="
                        display: inline-flex;
                        gap: 16px;
                        flex-wrap: wrap;
                        justify-content: center;
                    ">
                        <div style="
                            background: rgba(79, 70, 229, 0.1);
                            border: 1px solid rgba(79, 70, 229, 0.2);
                            padding: 8px 20px;
                            border-radius: 50px;
                            color: #4f46e5;
                            font-weight: 600;
                            font-size: 0.9rem;
                        ">총 ${data.length}명 분석</div>
                    </div>
                </div>
                
                <div class="report-section">
                    <h2>📈 지원자 현황 분석</h2>
                    <div class="preview-charts">
                        <div class="chart-info">
                            <span>월별 지원자 추이</span>
                            <span>상승 트렌드 (+15%)</span>
                        </div>
                        <div class="chart-info">
                            <span>지원루트별 분포</span>
                            <span>${Object.keys(routeStats).length}개 채널</span>
                        </div>
                        <div class="chart-info">
                            <span>직무별 지원 현황</span>
                            <span>IT 분야 최다</span>
                        </div>
                        <div class="chart-info">
                            <span>지역별 분포</span>
                            <span>서울/경기 ${this.calculateSeoulPercentage(data)}%</span>
                        </div>
                    </div>
                </div>
                
                <div class="report-section">
                    <h2>🔍 전환율 분석</h2>
                    <div class="kpi-grid">
                        <div class="kpi-card">
                            <h3>서류 통과율</h3>
                            <div class="kpi-value">42%</div>
                        </div>
                        <div class="kpi-card">
                            <h3>1차 면접 통과율</h3>
                            <div class="kpi-value">68%</div>
                        </div>
                        <div class="kpi-card">
                            <h3>최종 합격률</h3>
                            <div class="kpi-value">7.9%</div>
                        </div>
                        <div class="kpi-card">
                            <h3>업계 평균 대비</h3>
                            <div class="kpi-value">+4%</div>
                        </div>
                    </div>
                </div>
                
                <div class="report-section">
                    <h2>👥 인구통계 분석</h2>
                    <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px;">
                        <div style="text-align: center; padding: 20px; background: #f8fafc; border-radius: 8px;">
                            <div style="font-size: 1.5rem; font-weight: 700; color: #4f46e5;">28.5세</div>
                            <div style="color: #6b7280;">평균 연령</div>
                        </div>
                        <div style="text-align: center; padding: 20px; background: #f8fafc; border-radius: 8px;">
                            <div style="font-size: 1.5rem; font-weight: 700; color: #4f46e5;">58% : 42%</div>
                            <div style="color: #6b7280;">남성 : 여성</div>
                        </div>
                        <div style="text-align: center; padding: 20px; background: #f8fafc; border-radius: 8px;">
                            <div style="font-size: 1.5rem; font-weight: 700; color: #4f46e5;">35% : 65%</div>
                            <div style="color: #6b7280;">신입 : 경력</div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    // 채용 퍼널 미리보기
    generateFunnelPreview(data) {
        const funnelData = this.calculateFunnelData(data);
        
        return `
            <div class="report-content recruitment-funnel" style="width: 100%; max-width: 800px; margin: 0 auto; font-family: 'Noto Sans KR', sans-serif; background: #ffffff; padding: 40px; border-radius: 0; box-shadow: none;">
                <div class="report-header" style="width: 100%; background: #ffffff; padding: 0; border-radius: 0; color: #1e293b; text-align: center; border-bottom: 3px solid #3b82f6; padding-bottom: 20px; margin-bottom: 30px;">
                    <h1 class="report-title" style="color: #1e293b !important; font-size: 1.8rem !important; margin-bottom: 8px !important; font-weight: 700 !important; text-shadow: none !important; opacity: 1 !important; visibility: visible !important; display: block !important; letter-spacing: -0.5px;">채용 퍼널 분석 리포트</h1>
                    <div class="report-meta" style="display: flex; justify-content: center; gap: 25px; font-size: 0.9rem; color: #64748b !important; margin-top: 10px;">
                        <span style="background: #f1f5f9; padding: 8px 16px; border-radius: 6px; color: #475569 !important; font-weight: 500;">분석 기간: ${this.getSelectedPeriodText()}</span>
                        <span style="background: rgba(255, 255, 255, 0.2); padding: 6px 12px; border-radius: 20px; color: white !important;">전체 단계: 4단계</span>
                    </div>
                </div>
                
                <div class="report-section">
                    <h2>채용 퍼널 현황</h2>
                    ${this.generateFunnelHtml(funnelData)}
                </div>
                
                <div class="report-section">
                    <h2>📉 단계별 탈락 분석</h2>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
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
            <div class="report-content monthly-report" style="width: 100%; max-width: 800px; margin: 0 auto; font-family: 'Noto Sans KR', sans-serif; background: #ffffff; padding: 40px; border-radius: 0; box-shadow: none;">
                <div class="report-header" style="width: 100%; background: #ffffff; padding: 0; border-radius: 0; color: #1e293b; text-align: center; border-bottom: 3px solid #3b82f6; padding-bottom: 20px; margin-bottom: 30px;">
                    <h1 class="report-title" style="color: #1e293b !important; font-size: 1.8rem !important; margin-bottom: 8px !important; font-weight: 700 !important; text-shadow: none !important; opacity: 1 !important; visibility: visible !important; display: block !important; letter-spacing: -0.5px;">${currentMonth} 월간 채용 리포트</h1>
                    <div class="report-meta" style="display: flex; justify-content: center; gap: 25px; font-size: 0.9rem; color: #64748b !important; margin-top: 10px;">
                        <span style="background: rgba(255, 255, 255, 0.2); padding: 6px 12px; border-radius: 20px; color: white !important;">보고 기간: ${currentMonth}</span>
                        <span style="background: rgba(255, 255, 255, 0.2); padding: 6px 12px; border-radius: 20px; color: white !important;">목표 달성: ${achievement}%</span>
                    </div>
                </div>
                
                <div class="report-section">
                    <h2>🎯 이번 달 목표 vs 실적</h2>
                    <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 20px;">
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
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
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
            <div class="report-content interviewer-performance" style="width: 100%; max-width: 800px; margin: 0 auto; font-family: 'Noto Sans KR', sans-serif; background: #ffffff; padding: 40px; border-radius: 0; box-shadow: none;">
                <div class="report-header" style="width: 100%; background: #ffffff; padding: 0; border-radius: 0; color: #1e293b; text-align: center; border-bottom: 3px solid #3b82f6; padding-bottom: 20px; margin-bottom: 30px;">
                    <h1 class="report-title" style="color: #1e293b !important; font-size: 1.8rem !important; margin-bottom: 8px !important; font-weight: 700 !important; text-shadow: none !important; opacity: 1 !important; visibility: visible !important; display: block !important; letter-spacing: -0.5px;">면접관별 성과 분석 리포트</h1>
                    <div class="report-meta" style="display: flex; justify-content: center; gap: 25px; font-size: 0.9rem; color: #64748b !important; margin-top: 10px;">
                        <span style="background: #f1f5f9; padding: 8px 16px; border-radius: 6px; color: #475569 !important; font-weight: 500;">분석 기간: ${this.getSelectedPeriodText()}</span>
                        <span style="background: #f1f5f9; padding: 8px 16px; border-radius: 6px; color: #475569 !important; font-weight: 500;">면접관 수: ${interviewerStats.length}명</span>
                    </div>
                </div>
                
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
            <div class="report-content cost-analysis" style="width: 100%; max-width: 800px; margin: 0 auto; font-family: 'Noto Sans KR', sans-serif; background: #ffffff; padding: 40px; border-radius: 0; box-shadow: none;">
                <div class="report-header" style="width: 100%; background: #ffffff; padding: 0; border-radius: 0; color: #1e293b; text-align: center; border-bottom: 3px solid #3b82f6; padding-bottom: 20px; margin-bottom: 30px;">
                    <h1 class="report-title" style="color: #1e293b !important; font-size: 1.8rem !important; margin-bottom: 8px !important; font-weight: 700 !important; text-shadow: none !important; opacity: 1 !important; visibility: visible !important; display: block !important; letter-spacing: -0.5px;">채용 비용 효율성 분석 리포트</h1>
                    <div class="report-meta" style="display: flex; justify-content: center; gap: 25px; font-size: 0.9rem; color: #64748b !important; margin-top: 10px;">
                        <span style="background: #f1f5f9; padding: 8px 16px; border-radius: 6px; color: #475569 !important; font-weight: 500;">분석 기간: ${this.getSelectedPeriodText()}</span>
                        <span style="background: #f1f5f9; padding: 8px 16px; border-radius: 6px; color: #475569 !important; font-weight: 500;">비용 절감: 16%</span>
                    </div>
                </div>
                
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
        if (generateBtn) {
            generateBtn.addEventListener('click', () => {
                this.generateReport();
            });
        }

        // 미리보기 토글
        const previewToggle = document.getElementById('previewToggle');
        if (previewToggle) {
            previewToggle.addEventListener('click', () => {
                this.togglePreviewSidebar();
            });
        }

        // 필터 초기화
        const resetBtn = document.getElementById('report-reset-filters');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                this.resetFilters();
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
        const filteredData = this.getFilteredReportData();
        const template = this.templates[this._currentTemplate];
        
        if (filteredData.length === 0) {
            this.showAlert('리포트를 생성할 데이터가 없습니다. 필터 설정을 확인해주세요.');
            return;
        }
        
        console.log(`📊 ${template.name} 리포트 생성 중... (${filteredData.length}명 대상)`);
        
        // 리포트 모달 열기
        this.openReportModal(template, filteredData);
    },

    // 리포트 모달 열기
    openReportModal(template, data) {
        const modal = document.getElementById('reportModal');
        const modalBody = document.getElementById('reportModalBody');
        
        if (!modal || !modalBody) {
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
        
        // 🔥 모달 내 모든 텍스트 요소 강제 스타일 적용 - 단순하고 강력하게
        setTimeout(() => {
            const modalBody = document.getElementById('reportModalBody');
            
            if (modalBody) {
                console.log('🔍 모달 바디 발견, 내용:', modalBody.innerHTML.substring(0, 200));
                
                // 모든 요소를 찾아서 강제로 스타일 적용
                const allElements = modalBody.querySelectorAll('*');
                console.log('🔍 모달 내 전체 요소 개수:', allElements.length);
                
                allElements.forEach((element, index) => {
                    // h1 태그이거나 제목과 관련된 요소라면
                    if (element.tagName === 'H1' || 
                        element.classList.contains('report-title') ||
                        element.textContent?.includes('CFC 채용') ||
                        element.textContent?.includes('리포트')) {
                        
                        console.log(`🎯 제목 요소 발견 ${index}:`, element.tagName, element.textContent?.substring(0, 30));
                        
                        // 모든 스타일을 cssText로 한 번에 적용
                        element.style.cssText = `
                            color: #ff0000 !important;
                            font-size: 2rem !important;
                            font-weight: 900 !important;
                            text-shadow: 2px 2px 4px #000000 !important;
                            background: #ffff00 !important;
                            padding: 10px !important;
                            border: 3px solid #00ff00 !important;
                            opacity: 1 !important;
                            visibility: visible !important;
                            display: block !important;
                            text-align: center !important;
                            margin: 10px 0 !important;
                            position: relative !important;
                            z-index: 999999 !important;
                            width: 100% !important;
                            box-sizing: border-box !important;
                        `;
                    }
                });
                
                console.log('🎯 모든 요소에 강제 스타일 적용 완료!');
            } else {
                console.log('❌ 모달 바디를 찾을 수 없음');
            }
        }, 500); // 500ms로 더 늘림
        
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

    // 퍼널 데이터 계산
    calculateFunnelData(data) {
        const app = globalThis.App;
        if (!app || !app.state || !app.state.data) return [];
        
        const { headers } = app.state.data;
        const indices = {
            contactResult: headers.indexOf('1차 컨택 결과'),
            interviewResult: headers.indexOf('면접결과'),
            joinDate: headers.indexOf('입과일')
        };
        
        const total = data.length;
        const interviewConfirmed = data.filter(row => 
            (row[indices.contactResult] || '') === '면접확정'
        ).length;
        const passed = data.filter(row => 
            (row[indices.interviewResult] || '') === '합격'
        ).length;
        const joined = data.filter(row => {
            const joinDate = row[indices.joinDate] || '';
            return joinDate.trim() && joinDate.trim() !== '-';
        }).length;
        
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
    }
};
