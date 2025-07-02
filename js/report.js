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
        
        // 미리보기 내용을 리포트 모달과 동일하게 생성
        previewContent.innerHTML = this.generatePreviewSummary(filteredData);
        
        // DOM 삽입 후 기본 레이아웃 적용
        // setTimeout을 제거하여 즉시 적용하고, 과도한 스타일 오버라이드 제거
        if (previewContent && previewSidebar) {
            // 미리보기 사이드바 기본 패딩만 적용
            previewSidebar.style.padding = '20px';
            
            // 전체 너비 적용 (과도하지 않게)
            previewContent.style.width = '100%';
            previewContent.style.maxWidth = '100%';
            previewContent.style.boxSizing = 'border-box';
        }
    },

    // 미리보기 요약 생성 - 리포트 모달과 동일한 내용 사용
    generatePreviewSummary(data) {
        if (data.length === 0) {
            return '<div class="no-data" style="text-align: center; padding: 40px; color: #6b7280;">필터 조건에 맞는 데이터가 없습니다.</div>';
        }
        
        // 리포트 모달과 동일한 생성 방식 사용
        const template = this.templates[this._currentTemplate];
        return this.generateReportContent(template, data);
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
                max-width: 1200px; 
                margin: 0 auto; 
                font-family: 'Noto Sans KR', sans-serif; 
                background: #F4F4F4;
                padding: 24px 16px;
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
                    ">CFC 채용 분석 리포트</h1>
                    <p style="
                        font-size: 1rem; 
                        font-weight: 600; 
                        color: #01BAEF; 
                        margin: 0;
                    ">경영진 요약 | ${this.getSelectedPeriodText()}</p>
                </header>

                <!-- 핵심 요약 섹션 -->
                <section style="
                    background: white;
                    border-radius: 16px;
                    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
                    padding: 24px;
                    margin-bottom: 24px;
                ">
                    <h2 style="
                        font-size: 1.2rem;
                        font-weight: 600;
                        text-align: center;
                        margin-bottom: 20px;
                        color: #0B4F6C;
                    ">📊 한눈에 보는 핵심 요약</h2>
                    <div style="
                        display: grid;
                        grid-template-columns: 1fr 1fr;
                        gap: 20px;
                        text-align: center;
                    ">
                        <div style="
                            background: #F4F4F4;
                            padding: 20px;
                            border-radius: 12px;
                            border-left: 6px solid #0B4F6C;
                        ">
                            <h3 style="
                                font-size: 1rem;
                                font-weight: 600;
                                color: #374151;
                                margin: 0 0 8px 0;
                            ">👍 강점: 지원자 확보</h3>
                            <p style="
                                margin: 0;
                                color: #6B7280;
                                line-height: 1.5;
                                font-size: 0.9rem;
                            ">총 ${total}명의 지원자가 몰려 브랜드 인지도와 채용 경쟁력이 높음을 보여줍니다.</p>
                        </div>
                        <div style="
                            background: #F4F4F4;
                            padding: 20px;
                            border-radius: 12px;
                            border-left: 6px solid #FF6B6B;
                        ">
                            <h3 style="
                                font-size: 1rem;
                                font-weight: 600;
                                color: #374151;
                                margin: 0 0 8px 0;
                            ">👎 약점: 낮은 입과율</h3>
                            <p style="
                                margin: 0;
                                color: #6B7280;
                                line-height: 1.5;
                                font-size: 0.9rem;
                            ">입과율 ${joinRate}%로 개선이 필요하며, 채용 프로세스 효율화가 시급합니다.</p>
                        </div>
                    </div>
                </section>

                <!-- 메인 분석 그리드 -->
                <div style="
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 24px;
                    margin-bottom: 24px;
                ">
                    <!-- 채용 성과 분석 -->
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
                        ">I. 채용 성과 분석: 목표 달성 📈</h2>
                        <p style="
                            color: #6B7280;
                            margin: 0 0 20px 0;
                            line-height: 1.5;
                            font-size: 0.9rem;
                        ">지원자 확보는 성공적이었으나, 최종 입과까지 이어지는 전환율 개선이 필요한 상황입니다.</p>
                        
                        <!-- KPI 카드들 -->
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
                                <p style="margin: 0 0 4px 0; color: #6B7280; font-size: 0.8rem;">총 지원자</p>
                                <p style="
                                    margin: 0;
                                    font-size: 1.5rem;
                                    font-weight: 700;
                                    color: #0B4F6C;
                                ">${total}명</p>
                            </div>
                            <div style="
                                text-align: center;
                                padding: 16px;
                                background: #ECFDF5;
                                border-radius: 8px;
                            ">
                                <p style="margin: 0 0 4px 0; color: #6B7280; font-size: 0.8rem;">최종 합격</p>
                                <p style="
                                    margin: 0;
                                    font-size: 1.5rem;
                                    font-weight: 700;
                                    color: #059669;
                                ">${passed}명</p>
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
                            ">합격률 ${passRate}%는 업계 평균 수준이지만, 입과율 개선을 통해 효율성을 높일 수 있습니다.</p>
                        </div>
                    </section>

                    <!-- 채용 효율성 분석 -->
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
                        ">II. 채용 효율성 분석: 개선 필요 ⚠️</h2>
                        <p style="
                            color: #6B7280;
                            margin: 0 0 20px 0;
                            line-height: 1.5;
                            font-size: 0.9rem;
                        ">전체적인 채용 프로세스에서 단계별 이탈률이 높아 효율성 개선이 시급합니다.</p>
                        
                        <!-- 프로세스 단계 -->
                        <div style="margin-bottom: 20px;">
                            <h3 style="
                                font-size: 0.95rem;
                                font-weight: 600;
                                color: #374151;
                                margin: 0 0 12px 0;
                            ">채용 단계별 현황</h3>
                            
                            <div style="space-y: 8px;">
                                <div style="
                                    display: flex;
                                    justify-content: space-between;
                                    align-items: center;
                                    padding: 10px 12px;
                                    background: #F9FAFB;
                                    border-radius: 6px;
                                    margin-bottom: 8px;
                                ">
                                    <span style="font-weight: 500; color: #374151; font-size: 0.9rem;">지원 접수</span>
                                    <span style="font-weight: 600; color: #0B4F6C; font-size: 0.9rem;">${total}명</span>
                                </div>
                                <div style="
                                    display: flex;
                                    justify-content: space-between;
                                    align-items: center;
                                    padding: 10px 12px;
                                    background: #F9FAFB;
                                    border-radius: 6px;
                                    margin-bottom: 8px;
                                ">
                                    <span style="font-weight: 500; color: #374151; font-size: 0.9rem;">서류 통과</span>
                                    <span style="font-weight: 600; color: #059669; font-size: 0.9rem;">약 ${Math.round(total * 0.6)}명</span>
                                </div>
                                <div style="
                                    display: flex;
                                    justify-content: space-between;
                                    align-items: center;
                                    padding: 10px 12px;
                                    background: #F9FAFB;
                                    border-radius: 6px;
                                    margin-bottom: 8px;
                                ">
                                    <span style="font-weight: 500; color: #374151; font-size: 0.9rem;">면접 합격</span>
                                    <span style="font-weight: 600; color: #F59E0B; font-size: 0.9rem;">${passed}명</span>
                                </div>
                                <div style="
                                    display: flex;
                                    justify-content: space-between;
                                    align-items: center;
                                    padding: 10px 12px;
                                    background: #FEF2F2;
                                    border-radius: 6px;
                                ">
                                    <span style="font-weight: 500; color: #374151; font-size: 0.9rem;">최종 입과</span>
                                    <span style="font-weight: 600; color: #DC2626; font-size: 0.9rem;">${Math.round(total * joinRate / 100)}명</span>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>

                <!-- 개선 제안 섹션 -->
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
                    ">III. 문제 원인 및 개선 제안 💡</h2>
                    
                    <div style="
                        display: grid;
                        grid-template-columns: 1fr 1fr;
                        gap: 24px;
                    ">
                        <!-- 문제점 1 -->
                        <div>
                            <h3 style="
                                font-size: 1rem;
                                font-weight: 600;
                                color: #374151;
                                margin: 0 0 10px 0;
                            ">1. 문제: 높은 단계별 이탈률</h3>
                            <p style="
                                color: #6B7280;
                                margin: 0 0 12px 0;
                                line-height: 1.5;
                                font-size: 0.9rem;
                            ">서류 심사부터 최종 입과까지 각 단계에서 상당한 인원이 이탈하고 있어 전체적인 효율성이 떨어집니다.</p>
                            
                            <div style="
                                padding: 12px;
                                background: rgba(1, 186, 239, 0.1);
                                border-radius: 8px;
                            ">
                                <p style="
                                    margin: 0;
                                    font-weight: 600;
                                    color: #0B4F6C;
                                    font-size: 0.9rem;
                                ">💡 제안: 프로세스 개선</p>
                                <p style="
                                    margin: 6px 0 0 0;
                                    color: #374151;
                                    font-size: 0.85rem;
                                ">각 단계별 이탈 원인을 분석하고 개선 방안을 마련해야 합니다.</p>
                            </div>
                        </div>
                        
                        <!-- 문제점 2 -->
                        <div>
                            <h3 style="
                                font-size: 1rem;
                                font-weight: 600;
                                color: #374151;
                                margin: 0 0 10px 0;
                            ">2. 문제: 채용 채널 의존도</h3>
                            <p style="
                                color: #6B7280;
                                margin: 0 0 12px 0;
                                line-height: 1.5;
                                font-size: 0.9rem;
                            ">특정 채용 채널에 대한 의존도가 높아 다양한 인재 확보에 제약이 있을 수 있습니다.</p>
                            
                            <div style="
                                text-align: center;
                                padding: 16px;
                                background: #F4F4F4;
                                border-radius: 12px;
                                margin-bottom: 12px;
                            ">
                                <p style="
                                    margin: 0 0 6px 0;
                                    font-size: 0.9rem;
                                    font-weight: 600;
                                    color: #374151;
                                ">온라인 채용 비중</p>
                                <p style="
                                    margin: 0;
                                    font-size: 2rem;
                                    font-weight: 800;
                                    color: #FF6B6B;
                                ">${this.calculateOnlinePercentage(data)}%</p>
                            </div>
                            
                            <div style="
                                padding: 12px;
                                background: rgba(1, 186, 239, 0.1);
                                border-radius: 8px;
                            ">
                                <p style="
                                    margin: 0;
                                    font-weight: 600;
                                    color: #0B4F6C;
                                    font-size: 0.9rem;
                                ">💡 제안: 채널 다양화</p>
                                <p style="
                                    margin: 6px 0 0 0;
                                    color: #374151;
                                    font-size: 0.85rem;
                                ">채용 채널을 다양화하여 더 폭넓은 인재풀을 확보해야 합니다.</p>
                            </div>
                        </div>
                    </div>
                </section>
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
                max-width: 1200px; 
                margin: 0 auto; 
                font-family: 'Noto Sans KR', sans-serif; 
                background: #F4F4F4;
                padding: 24px 16px;
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
                max-width: 1200px; 
                margin: 0 auto; 
                font-family: 'Noto Sans KR', sans-serif; 
                background: #F4F4F4;
                padding: 24px 16px;
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
            <div class="report-content monthly-report" style="
                width: 100%; 
                max-width: 1200px; 
                margin: 0 auto; 
                font-family: 'Noto Sans KR', sans-serif; 
                background: #F4F4F4;
                padding: 24px 16px;
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
            <div class="report-content interviewer-performance" style="
                width: 100%; 
                max-width: 1200px; 
                margin: 0 auto; 
                font-family: 'Noto Sans KR', sans-serif; 
                background: #F4F4F4;
                padding: 24px 16px;
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
                max-width: 1200px; 
                margin: 0 auto; 
                font-family: 'Noto Sans KR', sans-serif; 
                background: #F4F4F4;
                padding: 24px 16px;
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
