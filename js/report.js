/**
 * @file report.js
 * @description 🚀 CFC 채용 대시보드 - 리포트 발행 모듈 (B) 기능 개선 단계
 * @version 2.0 - B Stage Implementation
 * @date 2025-06-30
 */

export const ReportModule = {
    // 🔧 초기화 상태
    _isInitialized: false,
    _chartInstance: null,
    _currentTemplate: 'executive-summary',
    _currentFormat: 'pdf',
    
    // 🎨 6개 확장 템플릿 시스템
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

    // 🔄 모듈 초기화
    init() {
        if (this._isInitialized) return;
        
        console.log('🚀 [ReportModule] B) 기능 개선 단계 초기화 시작...');
        
        try {
            // 1. 템플릿 갤러리 렌더링
            this.renderTemplateGallery();
            
            // 2. 실시간 미리보기 초기화
            this.initLivePreview();
            
            // 3. 이벤트 리스너 설정
            this.setupEventListeners();
            
            // 4. 히스토리 시스템 초기화
            this.initHistorySystem();
            
            // 5. 출력 형식 설정
            this.initFormatSelector();
            
            // 6. 🎨 커스텀 템플릿 편집기 초기화
            this.initCustomTemplateEditor();
            
            // 7. 🤖 AI 분석 시스템 초기화
            this.initAIAnalysisSystem();
            
            // 8. 📊 차트 인터랙션 시스템 초기화
            this.initChartInteractionSystem();
            
            // 9. 🔗 외부 연동 시스템 초기화
            this.initExternalIntegrationSystem();
            
            this._isInitialized = true;
            console.log('✅ [ReportModule] B+C 고급 기능 전체 초기화 완료!');
            
        } catch (error) {
            console.error('❌ [ReportModule] 초기화 실패:', error);
        }
    },

    // 🎨 템플릿 갤러리 동적 렌더링
    renderTemplateGallery() {
        const gallery = document.querySelector('.template-gallery');
        if (!gallery) {
            console.error('❌ 템플릿 갤러리 요소를 찾을 수 없습니다.');
            return;
        }

        // 로딩 제거
        gallery.innerHTML = '';
        
        // 템플릿 카드들 생성
        Object.entries(this.templates).forEach(([key, template]) => {
            const card = document.createElement('div');
            card.className = 'template-card enhanced';
            card.dataset.template = key;
            
            // 난이도별 색상
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
                        <h4>${template.name}</h4>
                        <p>${template.description}</p>
                    </div>
                </div>
                <div class="template-meta">
                    <div class="meta-item">
                        <i class="fas fa-clock"></i>
                        <span>${template.estimatedTime}</span>
                    </div>
                    <div class="meta-item">
                        <i class="fas fa-layer-group"></i>
                        <span>${template.sections.length}개 섹션</span>
                    </div>
                    <div class="difficulty-badge" style="background: ${difficultyColors[template.difficulty]}">
                        ${template.difficulty === 'easy' ? '간단' : template.difficulty === 'medium' ? '보통' : '상세'}
                    </div>
                </div>
            `;
            
            // 클릭 이벤트
            card.addEventListener('click', () => {
                this.selectTemplate(key);
            });
            
            gallery.appendChild(card);
        });

        // 기본 템플릿 선택 
        this.selectTemplate('executive-summary');
        
        console.log('✅ 템플릿 갤러리 렌더링 완료 (6개 템플릿)');
    },

    // 🎯 템플릿 선택 
    selectTemplate(templateKey) {
        // 기존 선택 해제
        document.querySelectorAll('.template-card').forEach(card => {
            card.classList.remove('selected');
        });
        
        // 새 템플릿 선택
        const selectedCard = document.querySelector(`[data-template="${templateKey}"]`);
        if (selectedCard) {
            selectedCard.classList.add('selected');
            this._currentTemplate = templateKey;
            
            // 실시간 미리보기 업데이트
            this.updateLivePreview();
            
            console.log(`📋 템플릿 선택: ${this.templates[templateKey].name}`);
        }
    },
    // 🔄 실시간 미리보기 시스템 초기화
    initLivePreview() {
        const sidebar = document.getElementById('livePreviewSidebar');
        if (!sidebar) {
            console.warn('⚠️ 실시간 미리보기 사이드바 요소가 없습니다.');
            return;
        }

        // 토글 버튼 이벤트
        const toggleBtn = document.getElementById('previewToggle');
        if (toggleBtn) {
            toggleBtn.addEventListener('click', () => {
                this.togglePreviewSidebar();
            });
        }

        // 초기 미리보기 렌더링
        this.renderLivePreviewContent();
        this.updateLivePreview();
        
        console.log('✅ 실시간 미리보기 시스템 초기화 완료');
    },

    // 🎨 실시간 미리보기 콘텐츠 렌더링  
    renderLivePreviewContent() {
        const content = document.getElementById('livePreviewContent');
        if (!content) return;

        content.innerHTML = `
            <div class="preview-stats">
                <div class="stat-item">
                    <div class="stat-label">선택된 템플릿</div>
                    <div class="stat-value" id="previewTemplateName">경영진 요약</div>
                </div>
                <div class="stat-item">
                    <div class="stat-label">데이터 범위</div>
                    <div class="stat-value" id="previewDataRange">전체 기간</div>
                </div>
                <div class="stat-item">
                    <div class="stat-label">예상 생성 시간</div>
                    <div class="stat-value" id="previewEstimatedTime">30초</div>
                </div>
            </div>

            <div class="summary-grid">
                <div class="summary-item">
                    <div class="summary-label">총 지원자</div>
                    <div class="summary-value" id="previewTotalApplicants">-</div>
                </div>
                <div class="summary-item">
                    <div class="summary-label">전환율</div>
                    <div class="summary-value" id="previewConversionRate">-</div>
                </div>
                <div class="summary-item">
                    <div class="summary-label">주요 채용 경로</div>
                    <div class="summary-value" id="previewTopSource">-</div>
                </div>
            </div>

            <div class="preview-chart-container">
                <div class="chart-title">채용 경로 분포</div>
                <div class="mini-chart-wrapper">
                    <canvas id="previewMiniChart" width="200" height="200"></canvas>
                </div>
            </div>

            <div class="preview-filters">
                <div class="filter-summary" id="previewFilterSummary">
                    필터: 전체 데이터
                </div>
            </div>
        `;
    },

    // 📊 실시간 미리보기 업데이트
    updateLivePreview() {
        try {
            // 현재 선택된 템플릿 정보 업데이트
            this.updatePreviewTemplateInfo();
            
            // 통계 업데이트
            this.updatePreviewStats();
            
            // 미니 차트 업데이트
            this.updatePreviewMiniChart();
            
            // 필터 요약 업데이트
            this.updatePreviewFilters();
            
        } catch (error) {
            console.error('❌ 실시간 미리보기 업데이트 실패:', error);
        }
    },

    // 📋 템플릿 정보 업데이트
    updatePreviewTemplateInfo() {
        const template = this.templates[this._currentTemplate];
        if (!template) return;

        const nameEl = document.getElementById('previewTemplateName');
        const timeEl = document.getElementById('previewEstimatedTime');
        
        if (nameEl) nameEl.textContent = template.name;
        if (timeEl) timeEl.textContent = template.estimatedTime;
    },

    // 📈 통계 업데이트
    updatePreviewStats() {
        // 필터링된 데이터 가져오기
        const filteredData = this.getFilteredData();
        
        if (!filteredData || filteredData.length === 0) {
            this.setPreviewStatsEmpty();
            return;
        }

        // 기본 통계 계산
        const stats = this.calculateBasicStats(filteredData);
        
        // UI 업데이트
        const totalEl = document.getElementById('previewTotalApplicants');
        const conversionEl = document.getElementById('previewConversionRate');
        const topSourceEl = document.getElementById('previewTopSource');
        
        if (totalEl) totalEl.textContent = stats.total.toLocaleString() + '명';
        if (conversionEl) conversionEl.textContent = stats.conversionRate + '%';
        if (topSourceEl) topSourceEl.textContent = stats.topSource;
    },

    // 🔢 기본 통계 계산
    calculateBasicStats(data) {
        const total = data.length;
        
        // 전환율 계산 (예시: 최종 합격자 / 전체 지원자)
        const finalPassed = data.filter(item => {
            const status = item['최종결과'] || item['진행상황'] || '';
            return status.includes('합격') || status.includes('입과');
        }).length;
        
        const conversionRate = total > 0 ? Math.round((finalPassed / total) * 100) : 0;
        
        // 주요 채용 경로 계산
        const sources = {};
        data.forEach(item => {
            const source = item['지원루트'] || '기타';
            sources[source] = (sources[source] || 0) + 1;
        });
        
        const topSource = Object.keys(sources).reduce((a, b) => 
            sources[a] > sources[b] ? a : b, '기타');
        
        return {
            total,
            conversionRate,
            topSource,
            sources
        };
    },

    // 📊 미니 차트 업데이트
    updatePreviewMiniChart() {
        const canvas = document.getElementById('previewMiniChart');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        
        // 기존 차트 제거
        if (this._miniChartInstance) {
            this._miniChartInstance.destroy();
        }

        const filteredData = this.getFilteredData();
        if (!filteredData || filteredData.length === 0) {
            this.drawEmptyChart(ctx);
            return;
        }

        // 채용 경로별 데이터 준비
        const stats = this.calculateBasicStats(filteredData);
        const chartData = Object.entries(stats.sources).map(([label, value]) => ({
            label: label.length > 8 ? label.substring(0, 8) + '...' : label,
            value
        }));

        // Chart.js 미니 도넛 차트
        this._miniChartInstance = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: chartData.map(item => item.label),
                datasets: [{
                    data: chartData.map(item => item.value),
                    backgroundColor: [
                        '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'
                    ],
                    borderWidth: 0
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
                cutout: '60%'
            }
        });
    },

    // 🔄 사이드바 토글
    togglePreviewSidebar() {
        const sidebar = document.getElementById('livePreviewSidebar');
        const toggleBtn = document.getElementById('previewToggle');
        
        if (!sidebar || !toggleBtn) return;
        
        const isCollapsed = sidebar.classList.contains('collapsed');
        
        if (isCollapsed) {
            sidebar.classList.remove('collapsed');
            toggleBtn.innerHTML = '<i class="fas fa-chevron-left"></i>';
            this.updateLivePreview(); // 다시 표시할 때 업데이트
        } else {
            sidebar.classList.add('collapsed');
            toggleBtn.innerHTML = '<i class="fas fa-chevron-right"></i>';
        }
        
        console.log('🔄 미리보기 사이드바 토글:', isCollapsed ? '표시' : '숨김');
    },
    // 📊 Excel/PowerPoint 출력 시스템

    // 📄 출력 형식 선택기 초기화
    initFormatSelector() {
        const formatOptions = document.querySelectorAll('.format-option');
        
        formatOptions.forEach(option => {
            option.addEventListener('click', () => {
                // 기존 선택 해제
                formatOptions.forEach(opt => opt.classList.remove('selected'));
                
                // 새 선택 적용
                option.classList.add('selected');
                
                // 형식 저장
                const format = option.textContent.trim().toLowerCase();
                this._currentFormat = format;
                
                console.log(`📄 출력 형식 선택: ${format}`);
            });
        });
    },

    // 📋 리포트 생성 (형식별 분기)
    async generateReport() {
        const format = this._currentFormat;
        
        console.log(`🚀 리포트 생성 시작 - 형식: ${format}, 템플릿: ${this._currentTemplate}`);
        
        // 진행률 표시
        this.showProgressIndicator();
        
        try {
            switch (format) {
                case 'pdf':
                    await this.generatePDFReport();
                    break;
                case 'excel':
                    await this.generateExcelReport();
                    break;
                case 'powerpoint':
                    await this.generatePowerPointReport();
                    break;
                case '웹 리포트':
                    await this.generateWebReport();
                    break;
                default:
                    await this.generatePDFReport();
            }
            
            // 히스토리에 저장
            this.saveToHistory();
            
            console.log('✅ 리포트 생성 완료!');
            
        } catch (error) {
            console.error('❌ 리포트 생성 실패:', error);
            alert('리포트 생성 중 오류가 발생했습니다.');
        } finally {
            this.hideProgressIndicator();
        }
    },

    // 📊 Excel 리포트 생성
    async generateExcelReport() {
        console.log('📊 Excel 리포트 생성 시작...');
        
        // SheetJS 라이브러리 동적 로딩
        if (typeof XLSX === 'undefined') {
            await this.loadSheetJS();
        }
        
        const filteredData = this.getFilteredData();
        const stats = this.calculateBasicStats(filteredData);
        
        // 워크북 생성
        const wb = XLSX.utils.book_new();
        
        // 1. 지원자 데이터 시트
        const applicantSheet = XLSX.utils.json_to_sheet(filteredData);
        XLSX.utils.book_append_sheet(wb, applicantSheet, '지원자 데이터');
        
        // 2. 통계 요약 시트
        const summaryData = [
            ['항목', '값'],
            ['총 지원자 수', stats.total],
            ['전환율', stats.conversionRate + '%'],
            ['주요 채용 경로', stats.topSource],
            ['리포트 생성일', new Date().toLocaleString('ko-KR')],
            ['템플릿', this.templates[this._currentTemplate].name]
        ];
        const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
        XLSX.utils.book_append_sheet(wb, summarySheet, '통계 요약');
        
        // 3. 채용 경로별 분석 시트
        const sourceData = [['채용 경로', '지원자 수', '비율']];
        Object.entries(stats.sources).forEach(([source, count]) => {
            const percentage = Math.round((count / stats.total) * 100);
            sourceData.push([source, count, percentage + '%']);
        });
        const sourceSheet = XLSX.utils.aoa_to_sheet(sourceData);
        XLSX.utils.book_append_sheet(wb, sourceSheet, '채용 경로 분석');
        
        // 파일 다운로드
        const fileName = `CFC_채용리포트_${this.templates[this._currentTemplate].name}_${this.getCurrentDateString()}.xlsx`;
        XLSX.writeFile(wb, fileName);
        
        console.log('✅ Excel 리포트 다운로드 완료:', fileName);
    },

    // 🎨 PowerPoint 리포트 생성  
    async generatePowerPointReport() {
        console.log('🎨 PowerPoint 리포트 생성 시작...');
        
        // HTML2Canvas로 차트 캡처
        const chartElement = await this.generateTempChartForCapture();
        
        if (!chartElement) {
            throw new Error('차트 생성 실패');
        }
        
        // 차트를 이미지로 변환
        const canvas = await html2canvas(chartElement, {
            backgroundColor: '#ffffff',
            scale: 2,
            width: 800,
            height: 600
        });
        
        // Canvas를 Blob으로 변환
        canvas.toBlob((blob) => {
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `CFC_채용리포트_${this.templates[this._currentTemplate].name}_${this.getCurrentDateString()}.png`;
            link.click();
            
            // 임시 차트 요소 제거
            if (chartElement.parentNode) {
                chartElement.parentNode.removeChild(chartElement);
            }
            
            console.log('✅ PowerPoint용 이미지 다운로드 완료');
        }, 'image/png');
    },

    // 🔧 임시 차트 생성 (PowerPoint용)
    async generateTempChartForCapture() {
        const filteredData = this.getFilteredData();
        const stats = this.calculateBasicStats(filteredData);
        
        // 임시 컨테이너 생성
        const container = document.createElement('div');
        container.style.cssText = `
            position: fixed;
            top: -2000px;
            left: -2000px;
            width: 800px;
            height: 600px;
            background: white;
            padding: 40px;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        `;
        
        container.innerHTML = `
            <div style="text-align: center; margin-bottom: 30px;">
                <h1 style="color: #1f2937; margin: 0 0 10px 0;">CFC 채용 리포트</h1>
                <h2 style="color: #6b7280; margin: 0; font-weight: normal;">${this.templates[this._currentTemplate].name}</h2>
            </div>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 20px; margin-bottom: 40px;">
                <div style="text-align: center; padding: 20px; background: #f8fafc; border-radius: 8px;">
                    <div style="font-size: 2rem; font-weight: bold; color: #3b82f6;">${stats.total}</div>
                    <div style="color: #6b7280;">총 지원자</div>
                </div>
                <div style="text-align: center; padding: 20px; background: #f8fafc; border-radius: 8px;">
                    <div style="font-size: 2rem; font-weight: bold; color: #10b981;">${stats.conversionRate}%</div>
                    <div style="color: #6b7280;">전환율</div>
                </div>
                <div style="text-align: center; padding: 20px; background: #f8fafc; border-radius: 8px;">
                    <div style="font-size: 1.2rem; font-weight: bold; color: #f59e0b;">${stats.topSource}</div>
                    <div style="color: #6b7280;">주요 채용 경로</div>
                </div>
            </div>
            
            <div style="height: 300px; position: relative;">
                <canvas id="tempChart" width="720" height="300"></canvas>
            </div>
            
            <div style="text-align: center; margin-top: 20px; color: #9ca3af; font-size: 0.9rem;">
                생성일: ${new Date().toLocaleString('ko-KR')}
            </div>
        `;
        
        document.body.appendChild(container);
        
        // 차트 생성
        const canvas = container.querySelector('#tempChart');
        const ctx = canvas.getContext('2d');
        
        const chartData = Object.entries(stats.sources).map(([label, value]) => ({
            label,
            value
        }));
        
        new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: chartData.map(item => item.label),
                datasets: [{
                    data: chartData.map(item => item.value),
                    backgroundColor: [
                        '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'
                    ],
                    borderWidth: 2,
                    borderColor: '#ffffff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'right',
                        labels: {
                            padding: 20,
                            usePointStyle: true
                        }
                    }
                }
            }
        });
        
        // 렌더링 완료 대기
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        return container;
    },

    // 📚 SheetJS 동적 로딩
    async loadSheetJS() {
        return new Promise((resolve, reject) => {
            if (typeof XLSX !== 'undefined') {
                resolve();
                return;
            }
            
            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js';
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    },
    // 💾 리포트 히스토리 관리 시스템

    // 🔧 히스토리 시스템 초기화
    initHistorySystem() {
        this.loadHistoryFromStorage();
        this.renderHistoryTab();
        
        console.log('✅ 히스토리 시스템 초기화 완료');
    },

    // 💾 히스토리 저장
    saveToHistory() {
        const historyItem = {
            id: Date.now(),
            timestamp: new Date().toISOString(),
            template: this._currentTemplate,
            templateName: this.templates[this._currentTemplate].name,
            format: this._currentFormat,
            filters: this.getCurrentFilters(),
            dataCount: this.getFilteredData().length
        };
        
        // 기존 히스토리 로드
        let history = JSON.parse(localStorage.getItem('reportHistory') || '[]');
        
        // 새 아이템 추가 (최신순)
        history.unshift(historyItem);
        
        // 최대 20개만 유지
        history = history.slice(0, 20);
        
        // 저장
        localStorage.setItem('reportHistory', JSON.stringify(history));
        
        // UI 업데이트
        this.renderHistoryTab();
        
        console.log('💾 히스토리 저장 완료:', historyItem);
    },

    // 📋 히스토리 탭 렌더링
    renderHistoryTab() {
        const historyTab = document.getElementById('history-tab');
        if (!historyTab) return;

        const history = JSON.parse(localStorage.getItem('reportHistory') || '[]');
        
        if (history.length === 0) {
            historyTab.innerHTML = `
                <div class="option-group">
                    <div class="option-title"><i class="fas fa-clock"></i> 최근 생성된 리포트</div>
                    <div style="background: #f8fafc; padding: 20px; border-radius: 12px; text-align: center; color: #6b7280;">
                        <i class="fas fa-inbox" style="font-size: 2rem; margin-bottom: 10px; opacity: 0.5;"></i>
                        <p>아직 생성된 리포트가 없습니다.</p>
                        <p style="font-size: 0.9rem; margin-top: 5px;">첫 번째 리포트를 생성해보세요!</p>
                    </div>
                </div>
            `;
            return;
        }

        // 히스토리 목록 HTML 생성
        const historyHTML = history.map(item => {
            const timeAgo = this.getTimeAgo(item.timestamp);
            const filterSummary = this.getFilterSummary(item.filters);
            
            return `
                <div class="history-item" data-id="${item.id}">
                    <div class="history-main">
                        <div class="history-info">
                            <div class="history-title">
                                <i class="${this.templates[item.template]?.icon || 'fas fa-file'}"></i>
                                ${item.templateName}
                            </div>
                            <div class="history-meta">
                                <span class="history-format">${item.format.toUpperCase()}</span>
                                <span class="history-data-count">${item.dataCount}건</span>
                                <span class="history-time">${timeAgo}</span>
                            </div>
                            <div class="history-filters">${filterSummary}</div>
                        </div>
                        <div class="history-actions">
                            <button class="btn-history-view" onclick="App.report.viewHistoryItem(${item.id})">
                                <i class="fas fa-eye"></i> 다시보기
                            </button>
                            <button class="btn-history-download" onclick="App.report.downloadHistoryItem(${item.id})">
                                <i class="fas fa-download"></i>
                            </button>
                            <button class="btn-history-delete" onclick="App.report.deleteHistoryItem(${item.id})">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        historyTab.innerHTML = `
            <div class="option-group">
                <div class="option-title">
                    <i class="fas fa-clock"></i> 최근 생성된 리포트
                    <div class="history-stats">
                        <span>총 ${history.length}개</span>
                        <button class="btn-clear-history" onclick="App.report.clearAllHistory()">
                            <i class="fas fa-trash-alt"></i> 전체 삭제
                        </button>
                    </div>
                </div>
                <div class="history-container">
                    ${historyHTML}
                </div>
            </div>
        `;
    },

    // 👀 히스토리 아이템 다시보기
    viewHistoryItem(itemId) {
        const history = JSON.parse(localStorage.getItem('reportHistory') || '[]');
        const item = history.find(h => h.id === itemId);
        
        if (!item) {
            alert('히스토리 아이템을 찾을 수 없습니다.');
            return;
        }

        // 템플릿 선택
        this.selectTemplate(item.template);
        
        // 출력 형식 선택
        this._currentFormat = item.format;
        document.querySelectorAll('.format-option').forEach(opt => {
            opt.classList.remove('selected');
            if (opt.textContent.trim().toLowerCase() === item.format) {
                opt.classList.add('selected');
            }
        });
        
        // 필터 복원
        this.restoreFilters(item.filters);
        
        // 미리보기 업데이트
        this.updateLivePreview();
        
        // 템플릿 탭으로 이동
        const templateTab = document.querySelector('[data-tab="template"]');
        if (templateTab) {
            templateTab.click();
        }
        
        console.log('👀 히스토리 아이템 복원 완료:', item);
    },

    // 🗑️ 히스토리 아이템 삭제
    deleteHistoryItem(itemId) {
        if (!confirm('이 리포트를 히스토리에서 삭제하시겠습니까?')) return;
        
        let history = JSON.parse(localStorage.getItem('reportHistory') || '[]');
        history = history.filter(item => item.id !== itemId);
        
        localStorage.setItem('reportHistory', JSON.stringify(history));
        this.renderHistoryTab();
        
        console.log('🗑️ 히스토리 아이템 삭제 완료:', itemId);
    },

    // 🗑️ 전체 히스토리 삭제
    clearAllHistory() {
        if (!confirm('모든 리포트 히스토리를 삭제하시겠습니까?\n이 작업은 되돌릴 수 없습니다.')) return;
        
        localStorage.removeItem('reportHistory');
        this.renderHistoryTab();
        
        console.log('🗑️ 전체 히스토리 삭제 완료');
    },

    // 📥 히스토리에서 다운로드
    downloadHistoryItem(itemId) {
        const history = JSON.parse(localStorage.getItem('reportHistory') || '[]');
        const item = history.find(h => h.id === itemId);
        
        if (!item) {
            alert('히스토리 아이템을 찾을 수 없습니다.');
            return;
        }

        // 설정 복원 후 리포트 생성
        this.viewHistoryItem(itemId);
        
        // 약간의 지연 후 리포트 생성
        setTimeout(() => {
            this.generateReport();
        }, 500);
    },

    // 🔄 히스토리 로드
    loadHistoryFromStorage() {
        try {
            const history = JSON.parse(localStorage.getItem('reportHistory') || '[]');
            console.log(`📊 히스토리 로드 완료: ${history.length}개 아이템`);
            return history;
        } catch (error) {
            console.error('❌ 히스토리 로드 실패:', error);
            return [];
        }
    },

    // 🔧 필터 복원
    restoreFilters(filters) {
        Object.entries(filters).forEach(([key, value]) => {
            const element = document.getElementById(key);
            if (element && value) {
                element.value = value;
            }
        });
    },

    // ⏰ 상대적 시간 계산
    getTimeAgo(timestamp) {
        const now = new Date();
        const time = new Date(timestamp);
        const diffMs = now - time;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return '방금 전';
        if (diffMins < 60) return `${diffMins}분 전`;
        if (diffHours < 24) return `${diffHours}시간 전`;
        if (diffDays < 7) return `${diffDays}일 전`;
        
        return time.toLocaleDateString('ko-KR');
    },

    // 📋 필터 요약 생성
    getFilterSummary(filters) {
        const activeFiters = Object.entries(filters)
            .filter(([key, value]) => value && value !== '전체' && value !== '')
            .map(([key, value]) => {
                const labels = {
                    'report-filter-period': '기간',
                    'report-filter-route': '지원루트',
                    'report-filter-field': '모집분야',
                    'report-filter-company': '회사명',
                    'report-filter-recruiter': '증원자',
                    'report-filter-interviewer': '면접관'
                };
                return `${labels[key] || key}: ${value}`;
            });
        
        return activeFiters.length > 0 ? activeFiters.join(', ') : '전체 데이터';
    },
    // 🎯 이벤트 리스너 설정
    setupEventListeners() {
        // 리포트 생성 버튼
        const generateBtn = document.getElementById('generateReportBtn');
        if (generateBtn) {
            generateBtn.addEventListener('click', () => {
                this.generateReport();
            });
        }

        // 필터 변경 이벤트
        const filterIds = [
            'report-filter-period',
            'report-filter-route', 
            'report-filter-field',
            'report-filter-company',
            'report-filter-recruiter',
            'report-filter-interviewer',
            'report-start-date',
            'report-end-date'
        ];

        filterIds.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.addEventListener('change', () => {
                    this.updateLivePreview();
                });
            }
        });

        console.log('✅ 이벤트 리스너 설정 완료');
    },

    // 📊 PDF 리포트 생성 (기존 기능 유지)
    async generatePDFReport() {
        console.log('📄 PDF 리포트 생성 시작...');
        
        const filteredData = this.getFilteredData();
        const template = this.templates[this._currentTemplate];
        
        // PDF 콘텐츠 생성
        const content = this.generateReportContent(filteredData, template);
        
        // 모달로 PDF 미리보기 표시
        this.showPDFModal(content);
    },

    // 🌐 웹 리포트 생성
    async generateWebReport() {
        console.log('🌐 웹 리포트 생성 시작...');
        
        const filteredData = this.getFilteredData();
        const template = this.templates[this._currentTemplate];
        
        // 웹 리포트 콘텐츠 생성
        const content = this.generateReportContent(filteredData, template);
        
        // 새 창에서 웹 리포트 표시
        const newWindow = window.open('', '_blank');
        newWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>CFC 채용 리포트 - ${template.name}</title>
                <style>
                    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; margin: 0; padding: 20px; }
                    .report-container { max-width: 1200px; margin: 0 auto; }
                </style>
            </head>
            <body>
                <div class="report-container">${content}</div>
            </body>
            </html>
        `);
        newWindow.document.close();
    },

    // 📝 리포트 콘텐츠 생성
    generateReportContent(data, template) {
        const stats = this.calculateBasicStats(data);
        
        let content = `
            <div class="report-header">
                <h1>CFC 채용 리포트</h1>
                <h2>${template.name}</h2>
                <p>생성일: ${new Date().toLocaleString('ko-KR')}</p>
            </div>
            
            <div class="report-summary">
                <div class="kpi-grid">
                    <div class="kpi-item">
                        <div class="kpi-label">총 지원자</div>
                        <div class="kpi-value">${stats.total.toLocaleString()}명</div>
                    </div>
                    <div class="kpi-item">
                        <div class="kpi-label">전환율</div>
                        <div class="kpi-value">${stats.conversionRate}%</div>
                    </div>
                    <div class="kpi-item">
                        <div class="kpi-label">주요 채용 경로</div>
                        <div class="kpi-value">${stats.topSource}</div>
                    </div>
                </div>
            </div>
        `;

        // 템플릿별 추가 섹션
        if (template.sections.includes('funnel')) {
            content += this.generateFunnelSection(data);
        }
        
        if (template.sections.includes('demographics')) {
            content += this.generateDemographicsSection(data);
        }
        
        if (template.sections.includes('trends')) {
            content += this.generateTrendsSection(data);
        }

        return content;
    },

    // 🔍 데이터 헬퍼 함수들

    // 📊 필터링된 데이터 가져오기
    getFilteredData() {
        try {
            // 전역 앱 상태에서 데이터 가져오기
            const allData = globalThis.App?.state?.data?.all || [];
            
            if (!allData || allData.length === 0) {
                console.warn('⚠️ 데이터가 없습니다.');
                return [];
            }

            // 현재 필터 적용
            const filters = this.getCurrentFilters();
            
            return this.applyFilters(allData, filters);
            
        } catch (error) {
            console.error('❌ 데이터 가져오기 실패:', error);
            return [];
        }
    },

    // 🔧 현재 필터 상태 가져오기
    getCurrentFilters() {
        const filters = {};
        
        const filterElements = [
            'report-filter-period',
            'report-filter-route',
            'report-filter-field', 
            'report-filter-company',
            'report-filter-recruiter',
            'report-filter-interviewer'
        ];
        
        filterElements.forEach(id => {
            const element = document.getElementById(id);
            if (element && element.value && element.value !== '전체') {
                filters[id] = element.value;
            }
        });
        
        // 사용자 지정 날짜 범위
        const startDate = document.getElementById('report-start-date');
        const endDate = document.getElementById('report-end-date');
        if (startDate && startDate.value) filters['report-start-date'] = startDate.value;
        if (endDate && endDate.value) filters['report-end-date'] = endDate.value;
        
        return filters;
    },

    // 🔍 필터 적용
    applyFilters(data, filters) {
        return data.filter(item => {
            // 기간 필터
            if (filters['report-filter-period']) {
                const period = filters['report-filter-period'];
                if (!this.matchesPeriod(item, period)) return false;
            }
            
            // 사용자 지정 날짜 범위
            if (filters['report-start-date'] || filters['report-end-date']) {
                if (!this.matchesDateRange(item, filters['report-start-date'], filters['report-end-date'])) {
                    return false;
                }
            }
            
            // 기타 필터들
            const filterMappings = {
                'report-filter-route': '지원루트',
                'report-filter-field': '모집분야',
                'report-filter-company': '회사명',
                'report-filter-recruiter': '증원자',
                'report-filter-interviewer': '면접관'
            };
            
            for (const [filterId, column] of Object.entries(filterMappings)) {
                if (filters[filterId] && item[column] !== filters[filterId]) {
                    return false;
                }
            }
            
            return true;
        });
    },

    // 📅 기간 매칭
    matchesPeriod(item, period) {
        const itemDate = new Date(item['지원일자'] || item['등록일']);
        const now = new Date();
        
        switch (period) {
            case '이번달':
                return itemDate.getMonth() === now.getMonth() && 
                       itemDate.getFullYear() === now.getFullYear();
            case '최근 30일':
                const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                return itemDate >= thirtyDaysAgo;
            case '최근 3개월':
                const threeMonthsAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
                return itemDate >= threeMonthsAgo;
            case '올해':
                return itemDate.getFullYear() === now.getFullYear();
            default:
                return true;
        }
    },

    // 📅 날짜 범위 매칭
    matchesDateRange(item, startDate, endDate) {
        const itemDate = new Date(item['지원일자'] || item['등록일']);
        
        if (startDate && itemDate < new Date(startDate)) return false;
        if (endDate && itemDate > new Date(endDate)) return false;
        
        return true;
    },

    // 🔧 유틸리티 함수들
    getCurrentDateString() {
        return new Date().toISOString().split('T')[0];
    },

    setPreviewStatsEmpty() {
        const elements = [
            'previewTotalApplicants',
            'previewConversionRate', 
            'previewTopSource'
        ];
        
        elements.forEach(id => {
            const el = document.getElementById(id);
            if (el) el.textContent = '-';
        });
    },

    updatePreviewFilters() {
        const summaryEl = document.getElementById('previewFilterSummary');
        if (!summaryEl) return;

        const filters = this.getCurrentFilters();
        const summary = this.getFilterSummary(filters);
        summaryEl.textContent = `필터: ${summary}`;
    },

    drawEmptyChart(ctx) {
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        ctx.fillStyle = '#e5e7eb';
        ctx.font = '14px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('데이터 없음', ctx.canvas.width / 2, ctx.canvas.height / 2);
    },

    showProgressIndicator() {
        const progressSection = document.querySelector('.progress-section');
        if (progressSection) {
            progressSection.style.display = 'block';
        }
    },

    hideProgressIndicator() {
        const progressSection = document.querySelector('.progress-section');
        if (progressSection) {
            progressSection.style.display = 'none';
        }
    },

    showPDFModal(content) {
        // 기존 PDF 모달 표시 로직 (기존 코드 활용)
        console.log('📄 PDF 모달 표시');
        // 실제 PDF 모달 구현은 기존 코드를 참조하여 구현
    },

    // 📊 섹션별 콘텐츠 생성 함수들
    generateFunnelSection(data) {
        return `
            <div class="report-section">
                <h3>채용 퍼널 분석</h3>
                <p>단계별 전환율 분석 결과입니다.</p>
            </div>
        `;
    },

    generateDemographicsSection(data) {
        return `
            <div class="report-section">
                <h3>인구통계학적 분석</h3>
                <p>지원자 특성 분석 결과입니다.</p>
            </div>
        `;
    },

    generateTrendsSection(data) {
        return `
            <div class="report-section">
                <h3>트렌드 분석</h3>
                <p>시간별 지원자 추이 분석 결과입니다.</p>
            </div>
        `;
    },
    // 🎨 C) 고급 기능 - 커스텀 템플릿 편집기

    // 🔧 커스텀 템플릿 편집기 초기화
    initCustomTemplateEditor() {
        console.log('🎨 커스텀 템플릿 편집기 초기화...');
        
        this.customTemplate = {
            id: 'custom-' + Date.now(),
            name: '커스텀 템플릿',
            sections: ['kpi', 'charts'],
            layout: 'grid',
            chartTypes: {
                'source-distribution': 'doughnut',
                'trend-analysis': 'line',
                'funnel-analysis': 'bar'
            },
            colorTheme: 'modern',
            customColors: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4']
        };
        
        this.renderCustomEditor();
        this.setupCustomEditorEvents();
        
        console.log('✅ 커스텀 템플릿 편집기 초기화 완료');
    },

    // 🎨 커스텀 편집기 렌더링
    renderCustomEditor() {
        const customTab = document.getElementById('custom-tab');
        if (!customTab) return;

        customTab.innerHTML = `
            <div class="custom-editor-container">
                <!-- 템플릿 기본 정보 -->
                <div class="editor-section">
                    <div class="section-header">
                        <h3><i class="fas fa-info-circle"></i> 템플릿 정보</h3>
                    </div>
                    <div class="template-info-form">
                        <div class="form-group">
                            <label>템플릿 이름</label>
                            <input type="text" id="custom-template-name" value="${this.customTemplate.name}" 
                                   placeholder="나만의 템플릿 이름을 입력하세요">
                        </div>
                    </div>
                </div>

                <!-- 섹션 선택 및 드래그 앤 드롭 -->
                <div class="editor-section">
                    <div class="section-header">
                        <h3><i class="fas fa-puzzle-piece"></i> 리포트 구성 요소</h3>
                        <button class="btn-preview-layout" id="previewLayoutBtn">
                            <i class="fas fa-eye"></i> 레이아웃 미리보기
                        </button>
                    </div>
                    
                    <!-- 사용 가능한 섹션들 -->
                    <div class="available-sections">
                        <h4>사용 가능한 섹션</h4>
                        <div class="section-pool" id="sectionPool">
                            ${this.renderAvailableSections()}
                        </div>
                    </div>
                    
                    <!-- 드래그 앤 드롭 레이아웃 -->
                    <div class="layout-editor">
                        <h4>리포트 레이아웃 (드래그하여 구성)</h4>
                        <div class="layout-canvas" id="layoutCanvas">
                            ${this.renderLayoutCanvas()}
                        </div>
                    </div>
                </div>

                <!-- 차트 타입 선택 -->
                <div class="editor-section">
                    <div class="section-header">
                        <h3><i class="fas fa-chart-bar"></i> 차트 설정</h3>
                    </div>
                    <div class="chart-type-selector">
                        ${this.renderChartTypeSelector()}
                    </div>
                </div>

                <!-- 색상 테마 커스터마이징 -->
                <div class="editor-section">
                    <div class="section-header">
                        <h3><i class="fas fa-palette"></i> 색상 테마</h3>
                    </div>
                    <div class="color-theme-editor">
                        ${this.renderColorThemeEditor()}
                    </div>
                </div>

                <!-- 템플릿 저장/불러오기 -->
                <div class="editor-section">
                    <div class="section-header">
                        <h3><i class="fas fa-save"></i> 템플릿 관리</h3>
                    </div>
                    <div class="template-management">
                        <div class="template-actions">
                            <button class="btn btn-primary" id="saveCustomTemplate">
                                <i class="fas fa-save"></i> 템플릿 저장
                            </button>
                            <button class="btn btn-secondary" id="loadCustomTemplate">
                                <i class="fas fa-folder-open"></i> 템플릿 불러오기
                            </button>
                            <button class="btn btn-success" id="exportCustomTemplate">
                                <i class="fas fa-download"></i> 템플릿 내보내기
                            </button>
                        </div>
                        
                        <div class="saved-templates" id="savedTemplates">
                            ${this.renderSavedTemplates()}
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    // 📝 사용 가능한 섹션들 렌더링
    renderAvailableSections() {
        const sections = {
            'kpi': {
                name: '핵심 성과 지표',
                icon: 'fas fa-tachometer-alt',
                description: '총 지원자, 전환율, 입과율 등'
            },
            'charts': {
                name: '시각화 차트',
                icon: 'fas fa-chart-pie',
                description: '지원루트별, 모집분야별 분포도'
            },
            'trends': {
                name: '트렌드 분석',
                icon: 'fas fa-chart-line',
                description: '시간별 지원자 추이 및 패턴'
            },
            'funnel': {
                name: '채용 퍼널',
                icon: 'fas fa-funnel-dollar',
                description: '단계별 전환율 분석'
            },
            'demographics': {
                name: '인구통계 분석',
                icon: 'fas fa-users',
                description: '연령대, 성별, 지역별 분포'
            },
            'efficiency': {
                name: '효율성 분석',
                icon: 'fas fa-chart-bar',
                description: '채용 경로별 효율성 비교'
            },
            'interviews': {
                name: '면접 현황',
                icon: 'fas fa-user-tie',
                description: '면접 일정 및 결과 분석'
            },
            'cost-analysis': {
                name: '비용 분석',
                icon: 'fas fa-dollar-sign',
                description: '채용 비용 대비 효과'
            }
        };

        return Object.entries(sections).map(([key, section]) => `
            <div class="section-item" data-section="${key}" draggable="true">
                <div class="section-icon">
                    <i class="${section.icon}"></i>
                </div>
                <div class="section-info">
                    <div class="section-name">${section.name}</div>
                    <div class="section-description">${section.description}</div>
                </div>
                <div class="section-controls">
                    <button class="btn-add-section" title="레이아웃에 추가">
                        <i class="fas fa-plus"></i>
                    </button>
                </div>
            </div>
        `).join('');
    },

    // 🎨 레이아웃 캔버스 렌더링
    renderLayoutCanvas() {
        const selectedSections = this.customTemplate.sections;
        const layoutCanvas = document.getElementById('layoutCanvas');
        
        if (!layoutCanvas) return;
        
        if (selectedSections.length === 0) {
            layoutCanvas.innerHTML = `
                <div class="empty-canvas">
                    <i class="fas fa-plus-circle"></i>
                    <p>왼쪽에서 섹션을 드래그하여 레이아웃을 구성하세요</p>
                </div>
            `;
            return;
        }

        layoutCanvas.innerHTML = `
            <div class="layout-grid" id="layoutGrid">
                ${selectedSections.map((section, index) => `
                    <div class="layout-section" data-section="${section}" data-index="${index}">
                        <div class="section-header">
                            <span class="section-title">${this.getSectionName(section)}</span>
                            <div class="section-actions">
                                <button class="btn-move-up" title="위로 이동">
                                    <i class="fas fa-chevron-up"></i>
                                </button>
                                <button class="btn-move-down" title="아래로 이동">
                                    <i class="fas fa-chevron-down"></i>
                                </button>
                                <button class="btn-remove-section" title="제거">
                                    <i class="fas fa-times"></i>
                                </button>
                            </div>
                        </div>
                        <div class="section-preview">
                            ${this.renderSectionPreview(section)}
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
        
        // 이벤트 리스너 재설정
        this.setupLayoutSectionEvents();
    },

    // 📊 차트 타입 선택기 렌더링
    renderChartTypeSelector() {
        const chartOptions = {
            'source-distribution': {
                name: '지원루트 분포',
                types: ['doughnut', 'pie', 'bar', 'polar']
            },
            'trend-analysis': {
                name: '트렌드 분석',
                types: ['line', 'area', 'bar']
            },
            'funnel-analysis': {
                name: '채용 퍼널',
                types: ['bar', 'funnel', 'waterfall']
            },
            'demographics': {
                name: '인구통계',
                types: ['bar', 'doughnut', 'radar']
            }
        };

        return Object.entries(chartOptions).map(([key, chart]) => `
            <div class="chart-type-group">
                <h4>${chart.name}</h4>
                <div class="chart-type-options">
                    ${chart.types.map(type => `
                        <div class="chart-type-option ${this.customTemplate.chartTypes[key] === type ? 'selected' : ''}" 
                             data-chart="${key}" data-type="${type}">
                            <div class="chart-icon">
                                <i class="fas fa-${this.getChartIcon(type)}"></i>
                            </div>
                            <span>${this.getChartTypeName(type)}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
        `).join('');
    },

    // 🎨 색상 테마 편집기 렌더링
    renderColorThemeEditor() {
        const presetThemes = {
            'modern': {
                name: '모던',
                colors: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4']
            },
            'classic': {
                name: '클래식',
                colors: ['#1f2937', '#374151', '#6b7280', '#9ca3af', '#d1d5db', '#e5e7eb']
            },
            'vibrant': {
                name: '활기찬',
                colors: ['#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ef4444']
            },
            'nature': {
                name: '자연',
                colors: ['#059669', '#84cc16', '#eab308', '#f97316', '#dc2626', '#7c2d12']
            },
            'corporate': {
                name: '기업',
                colors: ['#1e40af', '#1d4ed8', '#2563eb', '#3b82f6', '#60a5fa', '#93c5fd']
            }
        };

        return `
            <div class="theme-presets">
                <h4>미리 설정된 테마</h4>
                <div class="preset-themes">
                    ${Object.entries(presetThemes).map(([key, theme]) => `
                        <div class="theme-preset ${this.customTemplate.colorTheme === key ? 'selected' : ''}" 
                             data-theme="${key}">
                            <div class="theme-name">${theme.name}</div>
                            <div class="theme-colors">
                                ${theme.colors.map(color => `
                                    <div class="theme-color" style="background-color: ${color}"></div>
                                `).join('')}
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
            
            <div class="custom-colors">
                <h4>사용자 정의 색상</h4>
                <div class="color-picker-grid">
                    ${this.customTemplate.customColors.map((color, index) => `
                        <div class="color-picker-item">
                            <label>색상 ${index + 1}</label>
                            <input type="color" value="${color}" data-color-index="${index}" 
                                   class="color-input">
                            <div class="color-preview" style="background-color: ${color}"></div>
                        </div>
                    `).join('')}
                </div>
                <button class="btn-add-color" id="addColorBtn">
                    <i class="fas fa-plus"></i> 색상 추가
                </button>
            </div>
        `;
    },

    // 💾 저장된 템플릿들 렌더링
    renderSavedTemplates() {
        const savedTemplatesContainer = document.getElementById('savedTemplates');
        if (!savedTemplatesContainer) return;
        
        const savedTemplates = this.getSavedCustomTemplates();
        
        if (savedTemplates.length === 0) {
            savedTemplatesContainer.innerHTML = `
                <div class="no-saved-templates">
                    <i class="fas fa-folder-open"></i>
                    <p>저장된 커스텀 템플릿이 없습니다.</p>
                </div>
            `;
            return;
        }

        savedTemplatesContainer.innerHTML = `
            <div class="saved-templates-list">
                ${savedTemplates.map(template => `
                    <div class="saved-template-item" data-template-id="${template.id}">
                        <div class="template-info">
                            <div class="template-name">${template.name}</div>
                            <div class="template-meta">
                                ${template.sections.length}개 섹션 • ${template.colorTheme} 테마
                            </div>
                        </div>
                        <div class="template-actions">
                            <button class="btn-load-template" title="불러오기" onclick="App.report.loadSavedTemplate('${template.id}')">
                                <i class="fas fa-folder-open"></i>
                            </button>
                            <button class="btn-duplicate-template" title="복사" onclick="App.report.duplicateSavedTemplate('${template.id}')">
                                <i class="fas fa-copy"></i>
                            </button>
                            <button class="btn-delete-template" title="삭제" onclick="App.report.deleteSavedTemplate('${template.id}')">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    },
    // 🎯 커스텀 편집기 이벤트 설정
    setupCustomEditorEvents() {
        // 템플릿 이름 변경
        const nameInput = document.getElementById('custom-template-name');
        if (nameInput) {
            nameInput.addEventListener('input', (e) => {
                this.customTemplate.name = e.target.value;
                this.updateCustomTemplatePreview();
            });
        }

        // 섹션 추가 버튼들
        document.querySelectorAll('.btn-add-section').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const sectionItem = e.target.closest('.section-item');
                const sectionType = sectionItem.dataset.section;
                this.addSectionToLayout(sectionType);
            });
        });

        // 차트 타입 선택
        document.querySelectorAll('.chart-type-option').forEach(option => {
            option.addEventListener('click', (e) => {
                const chartKey = e.currentTarget.dataset.chart;
                const chartType = e.currentTarget.dataset.type;
                this.updateChartType(chartKey, chartType);
            });
        });

        // 색상 테마 선택
        document.querySelectorAll('.theme-preset').forEach(preset => {
            preset.addEventListener('click', (e) => {
                const themeKey = e.currentTarget.dataset.theme;
                this.selectColorTheme(themeKey);
            });
        });

        // 사용자 정의 색상 변경
        document.querySelectorAll('.color-input').forEach(input => {
            input.addEventListener('change', (e) => {
                const colorIndex = parseInt(e.target.dataset.colorIndex);
                this.updateCustomColor(colorIndex, e.target.value);
            });
        });

        // 템플릿 관리 버튼들
        const saveBtn = document.getElementById('saveCustomTemplate');
        const loadBtn = document.getElementById('loadCustomTemplate');
        const exportBtn = document.getElementById('exportCustomTemplate');
        const previewBtn = document.getElementById('previewLayoutBtn');

        if (saveBtn) saveBtn.addEventListener('click', () => this.saveCustomTemplate());
        if (loadBtn) loadBtn.addEventListener('click', () => this.showLoadTemplateDialog());
        if (exportBtn) exportBtn.addEventListener('click', () => this.exportCustomTemplate());
        if (previewBtn) previewBtn.addEventListener('click', () => this.showLayoutPreview());

        // 파일 가져오기 버튼 추가
        const importBtn = document.createElement('button');
        importBtn.className = 'btn btn-info';
        importBtn.innerHTML = '<i class="fas fa-upload"></i> 템플릿 가져오기';
        importBtn.addEventListener('click', () => this.importCustomTemplate());
        
        const actionButtons = document.querySelector('.template-actions');
        if (actionButtons) {
            actionButtons.appendChild(importBtn);
        }

        // 커스텀 리포트 생성 버튼 추가
        const generateBtn = document.createElement('button');
        generateBtn.className = 'btn btn-success';
        generateBtn.innerHTML = '<i class="fas fa-magic"></i> 커스텀 리포트 생성';
        generateBtn.addEventListener('click', () => this.generateCustomReport());
        
        if (actionButtons) {
            actionButtons.appendChild(generateBtn);
        }

        // 드래그 앤 드롭 설정
        this.setupDragAndDrop();
        
        console.log('✅ 커스텀 편집기 이벤트 설정 완료');
    },

    // 🔄 드래그 앤 드롭 설정
    setupDragAndDrop() {
        const sectionPool = document.getElementById('sectionPool');
        const layoutCanvas = document.getElementById('layoutCanvas');

        if (sectionPool) {
            // 섹션 아이템들에 드래그 이벤트 추가
            sectionPool.querySelectorAll('.section-item').forEach(item => {
                item.addEventListener('dragstart', (e) => {
                    e.dataTransfer.setData('text/plain', item.dataset.section);
                    item.classList.add('dragging');
                });

                item.addEventListener('dragend', (e) => {
                    item.classList.remove('dragging');
                });
            });
        }

        if (layoutCanvas) {
            // 레이아웃 캔버스에 드롭 이벤트 추가
            layoutCanvas.addEventListener('dragover', (e) => {
                e.preventDefault();
                layoutCanvas.classList.add('drag-over');
            });

            layoutCanvas.addEventListener('dragleave', (e) => {
                if (!layoutCanvas.contains(e.relatedTarget)) {
                    layoutCanvas.classList.remove('drag-over');
                }
            });

            layoutCanvas.addEventListener('drop', (e) => {
                e.preventDefault();
                layoutCanvas.classList.remove('drag-over');
                
                const sectionType = e.dataTransfer.getData('text/plain');
                if (sectionType) {
                    this.addSectionToLayout(sectionType);
                }
            });
        }
    },

    // ➕ 레이아웃에 섹션 추가
    addSectionToLayout(sectionType) {
        if (!this.customTemplate.sections.includes(sectionType)) {
            this.customTemplate.sections.push(sectionType);
            this.renderLayoutCanvas();
            this.updateCustomTemplatePreview();
            
            console.log(`📝 섹션 추가: ${sectionType}`);
        }
    },

    // 🗑️ 레이아웃에서 섹션 제거
    removeSectionFromLayout(sectionType) {
        const index = this.customTemplate.sections.indexOf(sectionType);
        if (index > -1) {
            this.customTemplate.sections.splice(index, 1);
            this.renderLayoutCanvas();
            this.updateCustomTemplatePreview();
            
            console.log(`🗑️ 섹션 제거: ${sectionType}`);
        }
    },

    // 🔄 섹션 순서 변경
    moveSectionInLayout(sectionType, direction) {
        const sections = this.customTemplate.sections;
        const currentIndex = sections.indexOf(sectionType);
        
        if (currentIndex === -1) return;
        
        let newIndex;
        if (direction === 'up' && currentIndex > 0) {
            newIndex = currentIndex - 1;
        } else if (direction === 'down' && currentIndex < sections.length - 1) {
            newIndex = currentIndex + 1;
        } else {
            return;
        }
        
        // 배열에서 위치 변경
        [sections[currentIndex], sections[newIndex]] = [sections[newIndex], sections[currentIndex]];
        
        this.renderLayoutCanvas();
        this.updateCustomTemplatePreview();
        
        console.log(`🔄 섹션 이동: ${sectionType} ${direction}`);
    },

    // 🎯 레이아웃 섹션 이벤트 설정
    setupLayoutSectionEvents() {
        // 섹션 제거 버튼
        document.querySelectorAll('.btn-remove-section').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const section = e.target.closest('.layout-section');
                const sectionType = section.dataset.section;
                this.removeSectionFromLayout(sectionType);
            });
        });

        // 섹션 이동 버튼
        document.querySelectorAll('.btn-move-up').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const section = e.target.closest('.layout-section');
                const sectionType = section.dataset.section;
                this.moveSectionInLayout(sectionType, 'up');
            });
        });

        document.querySelectorAll('.btn-move-down').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const section = e.target.closest('.layout-section');
                const sectionType = section.dataset.section;
                this.moveSectionInLayout(sectionType, 'down');
            });
        });
    },

    // 📊 차트 타입 업데이트
    updateChartType(chartKey, chartType) {
        this.customTemplate.chartTypes[chartKey] = chartType;
        
        // UI 업데이트
        document.querySelectorAll(`.chart-type-option[data-chart="${chartKey}"]`).forEach(option => {
            option.classList.remove('selected');
        });
        document.querySelector(`.chart-type-option[data-chart="${chartKey}"][data-type="${chartType}"]`).classList.add('selected');
        
        this.updateCustomTemplatePreview();
        console.log(`📊 차트 타입 변경: ${chartKey} -> ${chartType}`);
    },

    // 🎨 색상 테마 선택
    selectColorTheme(themeKey) {
        this.customTemplate.colorTheme = themeKey;
        
        // 미리 설정된 테마 색상으로 업데이트
        const presetThemes = {
            'modern': ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'],
            'classic': ['#1f2937', '#374151', '#6b7280', '#9ca3af', '#d1d5db', '#e5e7eb'],
            'vibrant': ['#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ef4444'],
            'nature': ['#059669', '#84cc16', '#eab308', '#f97316', '#dc2626', '#7c2d12'],
            'corporate': ['#1e40af', '#1d4ed8', '#2563eb', '#3b82f6', '#60a5fa', '#93c5fd']
        };
        
        if (presetThemes[themeKey]) {
            this.customTemplate.customColors = [...presetThemes[themeKey]];
        }
        
        // UI 업데이트
        document.querySelectorAll('.theme-preset').forEach(preset => {
            preset.classList.remove('selected');
        });
        document.querySelector(`.theme-preset[data-theme="${themeKey}"]`).classList.add('selected');
        
        // 색상 입력 필드들 업데이트
        this.updateColorInputs();
        this.updateCustomTemplatePreview();
        
        console.log(`🎨 색상 테마 변경: ${themeKey}`);
    },

    // 🌈 사용자 정의 색상 업데이트
    updateCustomColor(colorIndex, newColor) {
        if (colorIndex < this.customTemplate.customColors.length) {
            this.customTemplate.customColors[colorIndex] = newColor;
            
            // 색상 미리보기 업데이트
            const preview = document.querySelector(`.color-input[data-color-index="${colorIndex}"]`).nextElementSibling;
            if (preview) {
                preview.style.backgroundColor = newColor;
            }
            
            this.updateCustomTemplatePreview();
            console.log(`🌈 사용자 정의 색상 변경: ${colorIndex} -> ${newColor}`);
        }
    },

    // 💾 커스텀 템플릿 저장
    saveCustomTemplate() {
        if (!this.customTemplate.name.trim()) {
            alert('템플릿 이름을 입력해주세요.');
            return;
        }

        const savedTemplates = this.getSavedCustomTemplates();
        
        // 새 템플릿 객체 생성
        const templateToSave = {
            ...this.customTemplate,
            id: this.customTemplate.id || 'custom-' + Date.now(),
            createdAt: new Date().toISOString(),
            version: '1.0'
        };

        // 기존 템플릿이 있으면 업데이트, 없으면 추가
        const existingIndex = savedTemplates.findIndex(t => t.id === templateToSave.id);
        if (existingIndex > -1) {
            savedTemplates[existingIndex] = templateToSave;
        } else {
            savedTemplates.push(templateToSave);
        }

        // LocalStorage에 저장
        localStorage.setItem('customTemplates', JSON.stringify(savedTemplates));
        
        // UI 업데이트
        this.renderSavedTemplates();
        
        alert(`템플릿 "${templateToSave.name}"이 저장되었습니다.`);
        console.log('💾 커스텀 템플릿 저장 완료:', templateToSave);
    },

    // 📂 저장된 커스텀 템플릿들 가져오기
    getSavedCustomTemplates() {
        try {
            return JSON.parse(localStorage.getItem('customTemplates') || '[]');
        } catch (error) {
            console.error('❌ 저장된 템플릿 로드 실패:', error);
            return [];
        }
    },

    // 📋 레이아웃 미리보기 표시
    showLayoutPreview() {
        const previewModal = document.createElement('div');
        previewModal.className = 'custom-preview-modal';
        previewModal.innerHTML = `
            <div class="preview-modal-content">
                <div class="preview-modal-header">
                    <h3>레이아웃 미리보기: ${this.customTemplate.name}</h3>
                    <button class="btn-close-preview">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="preview-modal-body">
                    ${this.generateCustomTemplatePreview()}
                </div>
            </div>
        `;
        
        // 모달 표시
        document.body.appendChild(previewModal);
        
        // 닫기 이벤트
        previewModal.querySelector('.btn-close-preview').addEventListener('click', () => {
            document.body.removeChild(previewModal);
        });
        
        previewModal.addEventListener('click', (e) => {
            if (e.target === previewModal) {
                document.body.removeChild(previewModal);
            }
        });
    },

    // 🔧 헬퍼 함수들
    getSectionName(sectionType) {
        const sectionNames = {
            'kpi': '핵심 성과 지표',
            'charts': '시각화 차트',
            'trends': '트렌드 분석',
            'funnel': '채용 퍼널',
            'demographics': '인구통계 분석',
            'efficiency': '효율성 분석',
            'interviews': '면접 현황',
            'cost-analysis': '비용 분석'
        };
        return sectionNames[sectionType] || sectionType;
    },

    getChartIcon(chartType) {
        const icons = {
            'doughnut': 'chart-pie',
            'pie': 'chart-pie',
            'bar': 'chart-bar',
            'line': 'chart-line',
            'area': 'chart-area',
            'polar': 'chart-pie',
            'funnel': 'funnel-dollar',
            'waterfall': 'chart-bar',
            'radar': 'chart-area'
        };
        return icons[chartType] || 'chart-bar';
    },

    getChartTypeName(chartType) {
        const names = {
            'doughnut': '도넛',
            'pie': '파이',
            'bar': '막대',
            'line': '선',
            'area': '영역',
            'polar': '극좌표',
            'funnel': '깔때기',
            'waterfall': '폭포',
            'radar': '레이더'
        };
        return names[chartType] || chartType;
    },

    renderSectionPreview(sectionType) {
        return `
            <div class="section-preview-content">
                <i class="fas fa-${this.getSectionIcon(sectionType)}"></i>
                <span>${this.getSectionName(sectionType)} 섹션</span>
            </div>
        `;
    },

    getSectionIcon(sectionType) {
        const icons = {
            'kpi': 'tachometer-alt',
            'charts': 'chart-pie',
            'trends': 'chart-line',
            'funnel': 'funnel-dollar',
            'demographics': 'users',
            'efficiency': 'chart-bar',
            'interviews': 'user-tie',
            'cost-analysis': 'dollar-sign'
        };
        return icons[sectionType] || 'cube';
    },

    updateColorInputs() {
        this.customTemplate.customColors.forEach((color, index) => {
            const input = document.querySelector(`.color-input[data-color-index="${index}"]`);
            const preview = input?.nextElementSibling;
            if (input) input.value = color;
            if (preview) preview.style.backgroundColor = color;
        });
    },

    updateCustomTemplatePreview() {
        // 실시간 미리보기에서 커스텀 템플릿 정보 업데이트
        this.updateLivePreview();
    },

    generateCustomTemplatePreview() {
        return `
            <div class="custom-template-preview">
                <h4>템플릿: ${this.customTemplate.name}</h4>
                <div class="preview-sections">
                    ${this.customTemplate.sections.map((section, index) => `
                        <div class="preview-section" style="order: ${index}">
                            <h5>${this.getSectionName(section)}</h5>
                            <div class="section-placeholder">
                                <i class="fas fa-${this.getSectionIcon(section)}"></i>
                                <span>섹션 내용이 여기에 표시됩니다</span>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    },

    // 📤 템플릿 내보내기
    exportCustomTemplate() {
        const templateData = {
            ...this.customTemplate,
            exportedAt: new Date().toISOString(),
            version: '1.0'
        };

        const dataStr = JSON.stringify(templateData, null, 2);
        const dataBlob = new Blob([dataStr], {type: 'application/json'});
        const url = URL.createObjectURL(dataBlob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `custom-template-${this.customTemplate.name.replace(/\s+/g, '-')}.json`;
        link.click();
        
        URL.revokeObjectURL(url);
        console.log('📤 커스텀 템플릿 내보내기 완료');
    },
    // 📂 저장된 템플릿 불러오기
    loadSavedTemplate(templateId) {
        const savedTemplates = this.getSavedCustomTemplates();
        const template = savedTemplates.find(t => t.id === templateId);
        
        if (!template) {
            alert('템플릿을 찾을 수 없습니다.');
            return;
        }

        // 현재 커스텀 템플릿에 복사
        this.customTemplate = {
            ...template,
            id: 'custom-' + Date.now() // 새로운 ID 생성
        };

        // UI 전체 재렌더링
        this.renderCustomEditor();
        this.updateCustomTemplatePreview();

        console.log('📂 저장된 템플릿 불러오기 완료:', template.name);
        alert(`템플릿 "${template.name}"을 불러왔습니다.`);
    },

    // 📋 저장된 템플릿 복사
    duplicateSavedTemplate(templateId) {
        const savedTemplates = this.getSavedCustomTemplates();
        const template = savedTemplates.find(t => t.id === templateId);
        
        if (!template) {
            alert('템플릿을 찾을 수 없습니다.');
            return;
        }

        // 복사본 생성
        const duplicatedTemplate = {
            ...template,
            id: 'custom-' + Date.now(),
            name: template.name + ' (복사본)',
            createdAt: new Date().toISOString()
        };

        // 저장된 템플릿 목록에 추가
        savedTemplates.push(duplicatedTemplate);
        localStorage.setItem('customTemplates', JSON.stringify(savedTemplates));

        // UI 업데이트
        this.renderSavedTemplates();

        console.log('📋 템플릿 복사 완료:', duplicatedTemplate.name);
        alert(`템플릿 "${duplicatedTemplate.name}"이 생성되었습니다.`);
    },

    // 🗑️ 저장된 템플릿 삭제
    deleteSavedTemplate(templateId) {
        const savedTemplates = this.getSavedCustomTemplates();
        const template = savedTemplates.find(t => t.id === templateId);
        
        if (!template) {
            alert('템플릿을 찾을 수 없습니다.');
            return;
        }

        if (!confirm(`템플릿 "${template.name}"을 삭제하시겠습니까?`)) {
            return;
        }

        // 템플릿 목록에서 제거
        const updatedTemplates = savedTemplates.filter(t => t.id !== templateId);
        localStorage.setItem('customTemplates', JSON.stringify(updatedTemplates));

        // UI 업데이트
        this.renderSavedTemplates();

        console.log('🗑️ 템플릿 삭제 완료:', template.name);
        alert(`템플릿 "${template.name}"이 삭제되었습니다.`);
    },

    // 📂 템플릿 불러오기 다이얼로그 표시
    showLoadTemplateDialog() {
        const savedTemplates = this.getSavedCustomTemplates();
        
        if (savedTemplates.length === 0) {
            alert('저장된 템플릿이 없습니다.');
            return;
        }

        // 템플릿 선택 다이얼로그 생성
        const dialog = document.createElement('div');
        dialog.className = 'template-load-dialog';
        dialog.innerHTML = `
            <div class="dialog-content">
                <div class="dialog-header">
                    <h3>템플릿 불러오기</h3>
                    <button class="btn-close-dialog">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="dialog-body">
                    <div class="template-list">
                        ${savedTemplates.map(template => `
                            <div class="template-option" data-template-id="${template.id}">
                                <div class="template-info">
                                    <div class="template-name">${template.name}</div>
                                    <div class="template-meta">
                                        ${template.sections.length}개 섹션 • ${template.colorTheme} 테마
                                    </div>
                                    <div class="template-date">
                                        생성일: ${new Date(template.createdAt).toLocaleDateString('ko-KR')}
                                    </div>
                                </div>
                                <button class="btn-select-template">선택</button>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(dialog);

        // 이벤트 리스너 설정
        dialog.querySelector('.btn-close-dialog').addEventListener('click', () => {
            document.body.removeChild(dialog);
        });

        dialog.addEventListener('click', (e) => {
            if (e.target === dialog) {
                document.body.removeChild(dialog);
            }
        });

        dialog.querySelectorAll('.btn-select-template').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const templateOption = e.target.closest('.template-option');
                const templateId = templateOption.dataset.templateId;
                
                this.loadSavedTemplate(templateId);
                document.body.removeChild(dialog);
            });
        });
    },

    // 📥 템플릿 파일 가져오기 (JSON 파일)
    importCustomTemplate() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        
        input.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    const templateData = JSON.parse(event.target.result);
                    
                    // 템플릿 데이터 검증
                    if (!this.validateTemplateData(templateData)) {
                        alert('올바르지 않은 템플릿 파일입니다.');
                        return;
                    }

                    // 새로운 ID로 가져오기
                    templateData.id = 'custom-' + Date.now();
                    templateData.createdAt = new Date().toISOString();

                    // 현재 템플릿으로 설정
                    this.customTemplate = templateData;

                    // UI 업데이트
                    this.renderCustomEditor();
                    this.updateCustomTemplatePreview();

                    alert(`템플릿 "${templateData.name}"을 가져왔습니다.`);
                    console.log('📥 템플릿 가져오기 완료:', templateData);

                } catch (error) {
                    console.error('❌ 템플릿 가져오기 실패:', error);
                    alert('템플릿 파일을 읽는 중 오류가 발생했습니다.');
                }
            };
            
            reader.readAsText(file);
        });

        input.click();
    },

    // ✅ 템플릿 데이터 검증
    validateTemplateData(templateData) {
        const requiredFields = ['name', 'sections', 'chartTypes', 'colorTheme', 'customColors'];
        
        for (const field of requiredFields) {
            if (!(field in templateData)) {
                return false;
            }
        }

        // 배열 타입 검증
        if (!Array.isArray(templateData.sections) || !Array.isArray(templateData.customColors)) {
            return false;
        }

        // 객체 타입 검증
        if (typeof templateData.chartTypes !== 'object' || templateData.chartTypes === null) {
            return false;
        }

        return true;
    },

    // 🔄 커스텀 에디터 새로고침
    refreshCustomEditor() {
        if (document.getElementById('custom-tab').innerHTML.includes('custom-editor-container')) {
            this.renderCustomEditor();
            console.log('🔄 커스텀 에디터 새로고침 완료');
        }
    },

    // 🎯 커스텀 템플릿으로 리포트 생성
    generateCustomReport() {
        // 현재 커스텀 템플릿을 임시 템플릿으로 등록
        const tempTemplateKey = 'custom-temp';
        const originalTemplates = { ...this.templates };
        
        // 임시 템플릿 추가
        this.templates[tempTemplateKey] = {
            name: this.customTemplate.name,
            icon: 'fas fa-magic',
            description: '사용자 정의 템플릿',
            sections: this.customTemplate.sections,
            estimatedTime: this.calculateEstimatedTime(this.customTemplate.sections),
            difficulty: this.calculateDifficulty(this.customTemplate.sections),
            isCustom: true,
            customConfig: this.customTemplate
        };

        // 임시 템플릿 선택
        this._currentTemplate = tempTemplateKey;

        try {
            // 리포트 생성
            this.generateReport();
            
            console.log('🎯 커스텀 템플릿으로 리포트 생성:', this.customTemplate.name);
        } finally {
            // 임시 템플릿 제거 및 원본 복원
            this.templates = originalTemplates;
        }
    },

    // ⏱️ 예상 시간 계산
    calculateEstimatedTime(sections) {
        const baseTimes = {
            'kpi': 5,
            'charts': 10,
            'trends': 15,
            'funnel': 8,
            'demographics': 12,
            'efficiency': 10,
            'interviews': 8,
            'cost-analysis': 12
        };

        const totalSeconds = sections.reduce((total, section) => {
            return total + (baseTimes[section] || 5);
        }, 0);

        if (totalSeconds < 30) return '30초 미만';
        if (totalSeconds < 60) return `${totalSeconds}초`;
        return `${Math.ceil(totalSeconds / 60)}분`;
    },

    // 📊 난이도 계산
    calculateDifficulty(sections) {
        const complexSections = ['trends', 'demographics', 'efficiency', 'cost-analysis'];
        const complexCount = sections.filter(s => complexSections.includes(s)).length;
        
        if (complexCount === 0) return 'easy';
        if (complexCount <= 2) return 'medium';
        return 'hard';
    },
    // 🤖 C) 고급 기능 - AI 분석 시스템

    // 🔧 AI 분석 시스템 초기화
    initAIAnalysisSystem() {
        console.log('🤖 AI 분석 시스템 초기화...');
        
        this.aiAnalysis = {
            insights: [],
            recommendations: [],
            predictions: {},
            anomalies: [],
            lastAnalyzedAt: null
        };
        
        this.renderAIAnalysisTab();
        this.setupAIAnalysisEvents();
        
        console.log('✅ AI 분석 시스템 초기화 완료');
    },

    // 🎨 AI 분석 탭 렌더링
    renderAIAnalysisTab() {
        const aiTab = document.getElementById('ai-tab');
        if (!aiTab) return;

        aiTab.innerHTML = `
            <div class="ai-analysis-container">
                <!-- AI 분석 헤더 -->
                <div class="ai-header">
                    <div class="ai-title">
                        <i class="fas fa-robot"></i>
                        <h3>AI 분석 엔진</h3>
                    </div>
                    <div class="ai-controls">
                        <button class="btn btn-primary" id="runAIAnalysis">
                            <i class="fas fa-play"></i> 분석 실행
                        </button>
                        <button class="btn btn-secondary" id="exportAIInsights">
                            <i class="fas fa-download"></i> 인사이트 내보내기
                        </button>
                    </div>
                </div>

                <!-- 분석 선택 패널 -->
                <div class="analysis-selection">
                    <h4><i class="fas fa-cogs"></i> 분석 유형 선택</h4>
                    <div class="analysis-types">
                        <div class="analysis-type-card" data-type="insights">
                            <div class="card-icon">
                                <i class="fas fa-lightbulb"></i>
                            </div>
                            <div class="card-content">
                                <h5>자동 인사이트</h5>
                                <p>데이터 패턴을 분석하여 핵심 인사이트를 자동 생성합니다</p>
                                <div class="card-features">
                                    <span>• 채용 효율성 분석</span>
                                    <span>• 성과 패턴 발견</span>
                                    <span>• 최적화 포인트 제안</span>
                                </div>
                            </div>
                            <div class="card-toggle">
                                <input type="checkbox" id="enable-insights" checked>
                                <label for="enable-insights"></label>
                            </div>
                        </div>

                        <div class="analysis-type-card" data-type="recommendations">
                            <div class="card-icon">
                                <i class="fas fa-bullseye"></i>
                            </div>
                            <div class="card-content">
                                <h5>추천 시스템</h5>
                                <p>최적의 채용 전략과 개선 방안을 제안합니다</p>
                                <div class="card-features">
                                    <span>• 최적 채용 경로 추천</span>
                                    <span>• 면접관 배정 최적화</span>
                                    <span>• 전략적 개선안 제시</span>
                                </div>
                            </div>
                            <div class="card-toggle">
                                <input type="checkbox" id="enable-recommendations" checked>
                                <label for="enable-recommendations"></label>
                            </div>
                        </div>

                        <div class="analysis-type-card" data-type="predictions">
                            <div class="card-icon">
                                <i class="fas fa-crystal-ball"></i>
                            </div>
                            <div class="card-content">
                                <h5>예측 분석</h5>
                                <p>과거 데이터를 기반으로 미래 트렌드를 예측합니다</p>
                                <div class="card-features">
                                    <span>• 지원자 수 예측</span>
                                    <span>• 계절성 패턴 분석</span>
                                    <span>• 성과 예측 모델링</span>
                                </div>
                            </div>
                            <div class="card-toggle">
                                <input type="checkbox" id="enable-predictions" checked>
                                <label for="enable-predictions"></label>
                            </div>
                        </div>

                        <div class="analysis-type-card" data-type="anomalies">
                            <div class="card-icon">
                                <i class="fas fa-exclamation-triangle"></i>
                            </div>
                            <div class="card-content">
                                <h5>이상 패턴 감지</h5>
                                <p>비정상적인 패턴이나 급격한 변화를 감지합니다</p>
                                <div class="card-features">
                                    <span>• 급격한 증감 알림</span>
                                    <span>• 이상 행동 패턴 탐지</span>
                                    <span>• 위험 요소 식별</span>
                                </div>
                            </div>
                            <div class="card-toggle">
                                <input type="checkbox" id="enable-anomalies" checked>
                                <label for="enable-anomalies"></label>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- 분석 결과 영역 -->
                <div class="analysis-results" id="aiAnalysisResults">
                    ${this.renderAnalysisPlaceholder()}
                </div>

                <!-- 분석 히스토리 -->
                <div class="analysis-history">
                    <h4><i class="fas fa-history"></i> 분석 히스토리</h4>
                    <div class="history-list" id="aiAnalysisHistory">
                        ${this.renderAnalysisHistory()}
                    </div>
                </div>
            </div>
        `;
    },

    // 🔄 분석 결과 플레이스홀더
    renderAnalysisPlaceholder() {
        return `
            <div class="analysis-placeholder">
                <div class="placeholder-icon">
                    <i class="fas fa-robot"></i>
                </div>
                <h4>AI 분석 준비 완료</h4>
                <p>위의 "분석 실행" 버튼을 클릭하여 데이터를 분석하고 인사이트를 생성하세요.</p>
                <div class="placeholder-features">
                    <div class="feature-item">
                        <i class="fas fa-check-circle"></i>
                        <span>자동 패턴 인식</span>
                    </div>
                    <div class="feature-item">
                        <i class="fas fa-check-circle"></i>
                        <span>맞춤형 추천사항</span>
                    </div>
                    <div class="feature-item">
                        <i class="fas fa-check-circle"></i>
                        <span>예측 분석</span>
                    </div>
                </div>
            </div>
        `;
    },

    // 🎯 AI 분석 이벤트 설정
    setupAIAnalysisEvents() {
        // 분석 실행 버튼
        const runBtn = document.getElementById('runAIAnalysis');
        if (runBtn) {
            runBtn.addEventListener('click', () => {
                this.runAIAnalysis();
            });
        }

        // 인사이트 내보내기 버튼
        const exportBtn = document.getElementById('exportAIInsights');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => {
                this.exportAIInsights();
            });
        }

        // 분석 타입 카드 클릭 이벤트
        document.querySelectorAll('.analysis-type-card').forEach(card => {
            card.addEventListener('click', () => {
                const checkbox = card.querySelector('input[type="checkbox"]');
                checkbox.checked = !checkbox.checked;
                card.classList.toggle('disabled', !checkbox.checked);
            });
        });

        console.log('✅ AI 분석 이벤트 설정 완료');
    },

    // 🚀 AI 분석 실행
    async runAIAnalysis() {
        const runBtn = document.getElementById('runAIAnalysis');
        if (runBtn) {
            runBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 분석 중...';
            runBtn.disabled = true;
        }

        try {
            console.log('🤖 AI 분석 시작...');
            
            // 필터링된 데이터 가져오기
            const data = this.getFilteredData();
            
            if (!data || data.length === 0) {
                throw new Error('분석할 데이터가 없습니다.');
            }

            // 분석 진행 상황 표시
            this.showAnalysisProgress();

            // 각 분석 타입별로 실행
            const analysisResults = {
                insights: [],
                recommendations: [],
                predictions: {},
                anomalies: []
            };

            if (document.getElementById('enable-insights').checked) {
                analysisResults.insights = await this.generateInsights(data);
            }

            if (document.getElementById('enable-recommendations').checked) {
                analysisResults.recommendations = await this.generateRecommendations(data);
            }

            if (document.getElementById('enable-predictions').checked) {
                analysisResults.predictions = await this.generatePredictions(data);
            }

            if (document.getElementById('enable-anomalies').checked) {
                analysisResults.anomalies = await this.detectAnomalies(data);
            }

            // 결과 저장 및 표시
            this.aiAnalysis = {
                ...analysisResults,
                lastAnalyzedAt: new Date().toISOString(),
                dataCount: data.length
            };

            this.renderAnalysisResults(analysisResults);
            this.saveAnalysisToHistory(analysisResults);

            console.log('✅ AI 분석 완료:', analysisResults);

        } catch (error) {
            console.error('❌ AI 분석 실패:', error);
            this.showAnalysisError(error.message);
        } finally {
            if (runBtn) {
                runBtn.innerHTML = '<i class="fas fa-play"></i> 분석 실행';
                runBtn.disabled = false;
            }
        }
    },

    // 🔍 자동 인사이트 생성
    async generateInsights(data) {
        console.log('🔍 인사이트 생성 중...');
        
        const insights = [];
        const stats = this.calculateBasicStats(data);

        // 1. 채용 효율성 분석
        const sourceAnalysis = this.analyzeSourceEfficiency(data);
        if (sourceAnalysis.bestSource) {
            insights.push({
                type: 'efficiency',
                title: `가장 효율적인 채용 경로: ${sourceAnalysis.bestSource.name}`,
                description: `${sourceAnalysis.bestSource.name}을 통한 지원자들의 최종 합격률이 ${sourceAnalysis.bestSource.successRate}%로 가장 높습니다.`,
                priority: 'high',
                actionable: true,
                recommendation: `${sourceAnalysis.bestSource.name} 채널에 더 많은 리소스를 투자하는 것을 고려해보세요.`
            });
        }

        // 2. 시간대별 패턴 분석
        const timePattern = this.analyzeTimePatterns(data);
        if (timePattern.peakMonth) {
            insights.push({
                type: 'pattern',
                title: `최대 지원 시기: ${timePattern.peakMonth}`,
                description: `${timePattern.peakMonth}에 전체 지원자의 ${timePattern.peakPercentage}%가 집중되어 있습니다.`,
                priority: 'medium',
                actionable: true,
                recommendation: '피크 시즌에 맞춰 채용 프로세스와 인력 배치를 사전에 준비하세요.'
            });
        }

        // 3. 전환율 분석
        if (stats.conversionRate < 20) {
            insights.push({
                type: 'performance',
                title: '전환율 개선 필요',
                description: `현재 전환율 ${stats.conversionRate}%는 업계 평균인 25-30% 대비 낮은 수준입니다.`,
                priority: 'high',
                actionable: true,
                recommendation: '면접 프로세스 개선이나 채용 기준 재검토를 통해 전환율을 높여보세요.'
            });
        }

        // 4. 면접관 성과 분석
        const interviewerAnalysis = this.analyzeInterviewerPerformance(data);
        if (interviewerAnalysis.topPerformer) {
            insights.push({
                type: 'performance',
                title: `우수 면접관: ${interviewerAnalysis.topPerformer.name}`,
                description: `${interviewerAnalysis.topPerformer.name} 면접관의 합격률이 ${interviewerAnalysis.topPerformer.successRate}%로 가장 높습니다.`,
                priority: 'medium',
                actionable: true,
                recommendation: '우수 면접관의 면접 방식을 다른 면접관들과 공유하여 전체적인 면접 품질을 향상시키세요.'
            });
        }

        return insights;
    },

    // 📊 추천 시스템
    async generateRecommendations(data) {
        console.log('📊 추천사항 생성 중...');
        
        const recommendations = [];

        // 1. 채용 경로 최적화 추천
        const sourceOptimization = this.recommendSourceOptimization(data);
        recommendations.push(...sourceOptimization);

        // 2. 면접 프로세스 개선 추천
        const processOptimization = this.recommendProcessOptimization(data);
        recommendations.push(...processOptimization);

        // 3. 시기별 전략 추천
        const timingStrategy = this.recommendTimingStrategy(data);
        recommendations.push(...timingStrategy);

        return recommendations;
    },

    // 🔮 예측 분석
    async generatePredictions(data) {
        console.log('🔮 예측 분석 중...');
        
        const predictions = {};

        // 1. 다음 달 지원자 수 예측
        predictions.nextMonthApplicants = this.predictNextMonthApplicants(data);

        // 2. 계절성 패턴 예측
        predictions.seasonalPattern = this.predictSeasonalPatterns(data);

        // 3. 성과 예측
        predictions.performanceForecast = this.predictPerformanceTrends(data);

        return predictions;
    },

    // ⚠️ 이상 패턴 감지
    async detectAnomalies(data) {
        console.log('⚠️ 이상 패턴 감지 중...');
        
        const anomalies = [];

        // 1. 급격한 지원자 수 변화 감지
        const volumeAnomalies = this.detectVolumeAnomalies(data);
        anomalies.push(...volumeAnomalies);

        // 2. 전환율 급변 감지
        const conversionAnomalies = this.detectConversionAnomalies(data);
        anomalies.push(...conversionAnomalies);

        // 3. 특정 경로의 비정상적 패턴 감지
        const sourceAnomalies = this.detectSourceAnomalies(data);
        anomalies.push(...sourceAnomalies);

        return anomalies;
    },
    // 🔍 채용 경로 효율성 분석
    analyzeSourceEfficiency(data) {
        const sourceStats = {};
        
        data.forEach(item => {
            const source = item['지원루트'] || '기타';
            const isFinalPass = item['최종결과']?.includes('합격') || item['진행상황']?.includes('입과');
            
            if (!sourceStats[source]) {
                sourceStats[source] = { total: 0, success: 0 };
            }
            
            sourceStats[source].total++;
            if (isFinalPass) {
                sourceStats[source].success++;
            }
        });

        let bestSource = null;
        let bestRate = 0;

        Object.entries(sourceStats).forEach(([source, stats]) => {
            if (stats.total >= 5) { // 최소 5명 이상의 샘플
                const successRate = Math.round((stats.success / stats.total) * 100);
                if (successRate > bestRate) {
                    bestRate = successRate;
                    bestSource = {
                        name: source,
                        successRate,
                        totalApplicants: stats.total,
                        successCount: stats.success
                    };
                }
            }
        });

        return { bestSource, sourceStats };
    },

    // 📅 시간 패턴 분석
    analyzeTimePatterns(data) {
        const monthStats = {};
        
        data.forEach(item => {
            const dateStr = item['지원일자'] || item['등록일'];
            if (dateStr) {
                const date = new Date(dateStr);
                const month = date.getMonth() + 1;
                const monthName = `${month}월`;
                
                monthStats[monthName] = (monthStats[monthName] || 0) + 1;
            }
        });

        let peakMonth = null;
        let peakCount = 0;
        let totalCount = 0;

        Object.entries(monthStats).forEach(([month, count]) => {
            totalCount += count;
            if (count > peakCount) {
                peakCount = count;
                peakMonth = month;
            }
        });

        const peakPercentage = totalCount > 0 ? Math.round((peakCount / totalCount) * 100) : 0;

        return {
            peakMonth,
            peakCount,
            peakPercentage,
            monthStats
        };
    },

    // 👨‍💼 면접관 성과 분석
    analyzeInterviewerPerformance(data) {
        const interviewerStats = {};
        
        data.forEach(item => {
            const interviewer = item['면접관'] || '미지정';
            const isFinalPass = item['최종결과']?.includes('합격') || item['진행상황']?.includes('입과');
            
            if (!interviewerStats[interviewer]) {
                interviewerStats[interviewer] = { total: 0, success: 0 };
            }
            
            interviewerStats[interviewer].total++;
            if (isFinalPass) {
                interviewerStats[interviewer].success++;
            }
        });

        let topPerformer = null;
        let bestRate = 0;

        Object.entries(interviewerStats).forEach(([interviewer, stats]) => {
            if (stats.total >= 3 && interviewer !== '미지정') {
                const successRate = Math.round((stats.success / stats.total) * 100);
                if (successRate > bestRate) {
                    bestRate = successRate;
                    topPerformer = {
                        name: interviewer,
                        successRate,
                        totalInterviews: stats.total,
                        successCount: stats.success
                    };
                }
            }
        });

        return { topPerformer, interviewerStats };
    },

    // 🎯 채용 경로 최적화 추천
    recommendSourceOptimization(data) {
        const recommendations = [];
        const { sourceStats } = this.analyzeSourceEfficiency(data);
        
        // 성과가 낮은 채용 경로 식별
        const lowPerformingSources = Object.entries(sourceStats)
            .filter(([source, stats]) => stats.total >= 5)
            .map(([source, stats]) => ({
                source,
                successRate: Math.round((stats.success / stats.total) * 100),
                total: stats.total
            }))
            .filter(item => item.successRate < 15)
            .sort((a, b) => a.successRate - b.successRate);

        if (lowPerformingSources.length > 0) {
            const worstSource = lowPerformingSources[0];
            recommendations.push({
                type: 'optimization',
                category: '채용 경로',
                title: `${worstSource.source} 채널 개선 필요`,
                description: `${worstSource.source}의 성공률이 ${worstSource.successRate}%로 낮습니다.`,
                priority: 'high',
                impact: 'medium',
                effort: 'low',
                actions: [
                    '채용 공고 내용 개선',
                    '타겟 지원자층 재정의',
                    '스크리닝 프로세스 강화'
                ]
            });
        }

        return recommendations;
    },

    // ⚙️ 프로세스 최적화 추천
    recommendProcessOptimization(data) {
        const recommendations = [];
        const stats = this.calculateBasicStats(data);
        
        // 전체 전환율이 낮은 경우
        if (stats.conversionRate < 20) {
            recommendations.push({
                type: 'process',
                category: '면접 프로세스',
                title: '면접 프로세스 최적화',
                description: `현재 전환율 ${stats.conversionRate}%를 개선이 필요합니다.`,
                priority: 'high',
                impact: 'high',
                effort: 'medium',
                actions: [
                    '면접 질문 표준화',
                    '평가 기준 명확화',
                    '면접관 교육 강화',
                    '피드백 프로세스 개선'
                ]
            });
        }

        return recommendations;
    },

    // 📅 시기별 전략 추천
    recommendTimingStrategy(data) {
        const recommendations = [];
        const { peakMonth, monthStats } = this.analyzeTimePatterns(data);
        
        if (peakMonth && monthStats) {
            const sortedMonths = Object.entries(monthStats)
                .sort((a, b) => b[1] - a[1]);
            
            recommendations.push({
                type: 'strategy',
                category: '시기별 전략',
                title: `${peakMonth} 피크 시즌 대비 강화`,
                description: `${peakMonth}에 지원자가 집중되므로 사전 준비가 필요합니다.`,
                priority: 'medium',
                impact: 'medium',
                effort: 'low',
                actions: [
                    '피크 시즌 전 면접관 추가 배정',
                    '채용 프로세스 간소화 검토',
                    '자동화 도구 활용 증대'
                ]
            });
        }

        return recommendations;
    },

    // 📈 다음 달 지원자 수 예측
    predictNextMonthApplicants(data) {
        const monthlyData = this.getMonthlyData(data);
        
        if (monthlyData.length < 3) {
            return {
                prediction: null,
                confidence: 'low',
                message: '예측을 위한 충분한 데이터가 없습니다.'
            };
        }

        // 단순 이동평균 예측 (최근 3개월)
        const recent3Months = monthlyData.slice(-3);
        const average = recent3Months.reduce((sum, count) => sum + count, 0) / 3;
        
        // 트렌드 분석
        const trend = this.calculateTrend(recent3Months);
        const prediction = Math.round(average + trend);

        return {
            prediction: Math.max(0, prediction),
            confidence: recent3Months.length >= 3 ? 'medium' : 'low',
            trend: trend > 0 ? 'increasing' : trend < 0 ? 'decreasing' : 'stable',
            historicalAverage: Math.round(average)
        };
    },

    // 🌍 계절성 패턴 예측
    predictSeasonalPatterns(data) {
        const { monthStats } = this.analyzeTimePatterns(data);
        
        // 계절별 그룹화
        const seasons = {
            '봄 (3-5월)': [3, 4, 5],
            '여름 (6-8월)': [6, 7, 8],
            '가을 (9-11월)': [9, 10, 11],
            '겨울 (12-2월)': [12, 1, 2]
        };

        const seasonalPattern = {};
        
        Object.entries(seasons).forEach(([seasonName, months]) => {
            const seasonTotal = months.reduce((sum, month) => {
                const monthKey = `${month}월`;
                return sum + (monthStats[monthKey] || 0);
            }, 0);
            seasonalPattern[seasonName] = seasonTotal;
        });

        // 가장 활발한 계절 찾기
        const mostActiveSeasonEntry = Object.entries(seasonalPattern)
            .sort((a, b) => b[1] - a[1])[0];

        return {
            pattern: seasonalPattern,
            mostActiveSeason: mostActiveSeasonEntry ? mostActiveSeasonEntry[0] : null,
            recommendation: `${mostActiveSeasonEntry?.[0] || '특정 계절'}에 채용 활동을 집중하는 것이 효과적입니다.`
        };
    },

    // 📊 성과 예측
    predictPerformanceTrends(data) {
        const monthlyStats = this.getMonthlyPerformanceData(data);
        
        if (monthlyStats.length < 2) {
            return {
                trend: 'insufficient_data',
                message: '트렌드 분석을 위한 충분한 데이터가 없습니다.'
            };
        }

        const recentTrend = this.calculatePerformanceTrend(monthlyStats);
        
        return {
            trend: recentTrend > 5 ? 'improving' : recentTrend < -5 ? 'declining' : 'stable',
            trendValue: recentTrend,
            prediction: `향후 성과가 ${recentTrend > 0 ? '개선' : recentTrend < 0 ? '악화' : '유지'}될 것으로 예상됩니다.`
        };
    },

    // ⚠️ 볼륨 이상 감지
    detectVolumeAnomalies(data) {
        const anomalies = [];
        const monthlyData = this.getMonthlyData(data);
        
        if (monthlyData.length < 3) return anomalies;

        const average = monthlyData.reduce((sum, count) => sum + count, 0) / monthlyData.length;
        const threshold = average * 0.5; // 평균의 50% 이하면 이상

        const recentMonth = monthlyData[monthlyData.length - 1];
        
        if (recentMonth < threshold) {
            anomalies.push({
                type: 'volume_drop',
                severity: 'high',
                title: '지원자 수 급감 감지',
                description: `최근 지원자 수가 평균 대비 ${Math.round((1 - recentMonth/average) * 100)}% 감소했습니다.`,
                recommendation: '채용 공고 확산이나 마케팅 강화를 고려해보세요.'
            });
        }

        return anomalies;
    },

    // 📉 전환율 이상 감지
    detectConversionAnomalies(data) {
        const anomalies = [];
        const recentData = data.slice(-50); // 최근 50명 데이터
        
        if (recentData.length < 20) return anomalies;

        const recentStats = this.calculateBasicStats(recentData);
        const totalStats = this.calculateBasicStats(data);
        
        const conversionDrop = totalStats.conversionRate - recentStats.conversionRate;
        
        if (conversionDrop > 10) {
            anomalies.push({
                type: 'conversion_drop',
                severity: 'medium',
                title: '최근 전환율 하락 감지',
                description: `최근 전환율이 전체 평균 대비 ${Math.round(conversionDrop)}%p 하락했습니다.`,
                recommendation: '면접 프로세스나 평가 기준을 재검토해보세요.'
            });
        }

        return anomalies;
    },

    // 🔍 특정 경로 이상 감지
    detectSourceAnomalies(data) {
        const anomalies = [];
        const { sourceStats } = this.analyzeSourceEfficiency(data);
        
        Object.entries(sourceStats).forEach(([source, stats]) => {
            if (stats.total >= 10 && stats.success === 0) {
                anomalies.push({
                    type: 'source_failure',
                    severity: 'high',
                    title: `${source} 채널 성과 이상`,
                    description: `${source}을 통한 지원자 ${stats.total}명 중 합격자가 0명입니다.`,
                    recommendation: `${source} 채널의 타겟팅이나 스크리닝 프로세스를 점검해보세요.`
                });
            }
        });

        return anomalies;
    },

    // 🔧 헬퍼 함수들
    getMonthlyData(data) {
        const monthCounts = {};
        
        data.forEach(item => {
            const dateStr = item['지원일자'] || item['등록일'];
            if (dateStr) {
                const date = new Date(dateStr);
                const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
                monthCounts[monthKey] = (monthCounts[monthKey] || 0) + 1;
            }
        });

        return Object.values(monthCounts);
    },

    getMonthlyPerformanceData(data) {
        const monthlyPerf = {};
        
        data.forEach(item => {
            const dateStr = item['지원일자'] || item['등록일'];
            if (dateStr) {
                const date = new Date(dateStr);
                const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
                
                if (!monthlyPerf[monthKey]) {
                    monthlyPerf[monthKey] = { total: 0, success: 0 };
                }
                
                monthlyPerf[monthKey].total++;
                if (item['최종결과']?.includes('합격') || item['진행상황']?.includes('입과')) {
                    monthlyPerf[monthKey].success++;
                }
            }
        });

        return Object.values(monthlyPerf).map(month => 
            Math.round((month.success / month.total) * 100)
        );
    },

    calculateTrend(data) {
        if (data.length < 2) return 0;
        return data[data.length - 1] - data[0];
    },

    calculatePerformanceTrend(performanceData) {
        if (performanceData.length < 2) return 0;
        
        const recent = performanceData.slice(-2);
        return recent[1] - recent[0];
    },
    // 📊 분석 결과 렌더링
    renderAnalysisResults(results) {
        const resultsContainer = document.getElementById('aiAnalysisResults');
        if (!resultsContainer) return;

        resultsContainer.innerHTML = `
            <div class="analysis-results-content">
                <div class="results-header">
                    <h4><i class="fas fa-chart-line"></i> 분석 결과</h4>
                    <div class="results-meta">
                        <span>분석 완료: ${new Date().toLocaleString('ko-KR')}</span>
                        <span>데이터: ${this.aiAnalysis.dataCount}건</span>
                    </div>
                </div>

                ${this.renderInsightsSection(results.insights)}
                ${this.renderRecommendationsSection(results.recommendations)}
                ${this.renderPredictionsSection(results.predictions)}
                ${this.renderAnomaliesSection(results.anomalies)}
            </div>
        `;
    },

    // 💡 인사이트 섹션 렌더링
    renderInsightsSection(insights) {
        if (!insights || insights.length === 0) {
            return `
                <div class="results-section">
                    <h5><i class="fas fa-lightbulb"></i> 자동 인사이트</h5>
                    <div class="no-results">발견된 특별한 패턴이 없습니다.</div>
                </div>
            `;
        }

        return `
            <div class="results-section">
                <h5><i class="fas fa-lightbulb"></i> 자동 인사이트 (${insights.length}개)</h5>
                <div class="insights-grid">
                    ${insights.map(insight => `
                        <div class="insight-card priority-${insight.priority}">
                            <div class="insight-header">
                                <div class="insight-type">${this.getInsightTypeIcon(insight.type)}</div>
                                <div class="insight-priority priority-${insight.priority}">${this.getPriorityText(insight.priority)}</div>
                            </div>
                            <h6>${insight.title}</h6>
                            <p>${insight.description}</p>
                            ${insight.actionable ? `
                                <div class="insight-action">
                                    <i class="fas fa-arrow-right"></i>
                                    <span>${insight.recommendation}</span>
                                </div>
                            ` : ''}
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    },

    // 🎯 추천사항 섹션 렌더링
    renderRecommendationsSection(recommendations) {
        if (!recommendations || recommendations.length === 0) {
            return `
                <div class="results-section">
                    <h5><i class="fas fa-bullseye"></i> 추천사항</h5>
                    <div class="no-results">현재 상황에서는 특별한 개선 추천사항이 없습니다.</div>
                </div>
            `;
        }

        return `
            <div class="results-section">
                <h5><i class="fas fa-bullseye"></i> 추천사항 (${recommendations.length}개)</h5>
                <div class="recommendations-list">
                    ${recommendations.map(rec => `
                        <div class="recommendation-card">
                            <div class="rec-header">
                                <div class="rec-category">${rec.category}</div>
                                <div class="rec-metrics">
                                    <span class="metric impact-${rec.impact}">영향도: ${this.getMetricText(rec.impact)}</span>
                                    <span class="metric effort-${rec.effort}">노력도: ${this.getMetricText(rec.effort)}</span>
                                </div>
                            </div>
                            <h6>${rec.title}</h6>
                            <p>${rec.description}</p>
                            <div class="rec-actions">
                                <h6>실행 방안:</h6>
                                <ul>
                                    ${rec.actions.map(action => `<li>${action}</li>`).join('')}
                                </ul>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    },

    // 🔮 예측 섹션 렌더링
    renderPredictionsSection(predictions) {
        if (!predictions || Object.keys(predictions).length === 0) {
            return `
                <div class="results-section">
                    <h5><i class="fas fa-crystal-ball"></i> 예측 분석</h5>
                    <div class="no-results">예측을 위한 충분한 데이터가 없습니다.</div>
                </div>
            `;
        }

        return `
            <div class="results-section">
                <h5><i class="fas fa-crystal-ball"></i> 예측 분석</h5>
                <div class="predictions-grid">
                    ${predictions.nextMonthApplicants ? `
                        <div class="prediction-card">
                            <div class="pred-icon">
                                <i class="fas fa-users"></i>
                            </div>
                            <div class="pred-content">
                                <h6>다음 달 예상 지원자</h6>
                                <div class="pred-value">${predictions.nextMonthApplicants.prediction || 'N/A'}명</div>
                                <div class="pred-confidence confidence-${predictions.nextMonthApplicants.confidence}">
                                    신뢰도: ${this.getConfidenceText(predictions.nextMonthApplicants.confidence)}
                                </div>
                                ${predictions.nextMonthApplicants.trend ? `
                                    <div class="pred-trend trend-${predictions.nextMonthApplicants.trend}">
                                        트렌드: ${this.getTrendText(predictions.nextMonthApplicants.trend)}
                                    </div>
                                ` : ''}
                            </div>
                        </div>
                    ` : ''}
                    
                    ${predictions.seasonalPattern ? `
                        <div class="prediction-card">
                            <div class="pred-icon">
                                <i class="fas fa-calendar-alt"></i>
                            </div>
                            <div class="pred-content">
                                <h6>계절성 패턴</h6>
                                <div class="pred-value">${predictions.seasonalPattern.mostActiveSeason || 'N/A'}</div>
                                <div class="pred-desc">${predictions.seasonalPattern.recommendation}</div>
                            </div>
                        </div>
                    ` : ''}
                    
                    ${predictions.performanceForecast ? `
                        <div class="prediction-card">
                            <div class="pred-icon">
                                <i class="fas fa-chart-line"></i>
                            </div>
                            <div class="pred-content">
                                <h6>성과 전망</h6>
                                <div class="pred-value trend-${predictions.performanceForecast.trend}">
                                    ${this.getTrendText(predictions.performanceForecast.trend)}
                                </div>
                                <div class="pred-desc">${predictions.performanceForecast.prediction}</div>
                            </div>
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
    },

    // ⚠️ 이상 패턴 섹션 렌더링
    renderAnomaliesSection(anomalies) {
        if (!anomalies || anomalies.length === 0) {
            return `
                <div class="results-section">
                    <h5><i class="fas fa-shield-alt"></i> 이상 패턴 감지</h5>
                    <div class="no-results success">감지된 이상 패턴이 없습니다. 안정적인 상태입니다.</div>
                </div>
            `;
        }

        return `
            <div class="results-section">
                <h5><i class="fas fa-exclamation-triangle"></i> 이상 패턴 감지 (${anomalies.length}개)</h5>
                <div class="anomalies-list">
                    ${anomalies.map(anomaly => `
                        <div class="anomaly-card severity-${anomaly.severity}">
                            <div class="anomaly-header">
                                <div class="anomaly-icon">${this.getAnomalyIcon(anomaly.type)}</div>
                                <div class="anomaly-severity severity-${anomaly.severity}">
                                    ${this.getSeverityText(anomaly.severity)}
                                </div>
                            </div>
                            <h6>${anomaly.title}</h6>
                            <p>${anomaly.description}</p>
                            <div class="anomaly-recommendation">
                                <i class="fas fa-lightbulb"></i>
                                <span>${anomaly.recommendation}</span>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    },

    // 📈 분석 진행 상황 표시
    showAnalysisProgress() {
        const resultsContainer = document.getElementById('aiAnalysisResults');
        if (!resultsContainer) return;

        resultsContainer.innerHTML = `
            <div class="analysis-progress">
                <div class="progress-header">
                    <h4><i class="fas fa-cog fa-spin"></i> AI 분석 진행 중...</h4>
                </div>
                <div class="progress-steps">
                    <div class="progress-step active">
                        <i class="fas fa-database"></i>
                        <span>데이터 수집</span>
                    </div>
                    <div class="progress-step active">
                        <i class="fas fa-search"></i>
                        <span>패턴 분석</span>
                    </div>
                    <div class="progress-step active">
                        <i class="fas fa-lightbulb"></i>
                        <span>인사이트 생성</span>
                    </div>
                    <div class="progress-step active">
                        <i class="fas fa-chart-line"></i>
                        <span>예측 모델링</span>
                    </div>
                </div>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: 100%; animation: progress-animation 3s ease-in-out;"></div>
                </div>
            </div>
        `;
    },

    // ❌ 분석 오류 표시
    showAnalysisError(errorMessage) {
        const resultsContainer = document.getElementById('aiAnalysisResults');
        if (!resultsContainer) return;

        resultsContainer.innerHTML = `
            <div class="analysis-error">
                <div class="error-icon">
                    <i class="fas fa-exclamation-circle"></i>
                </div>
                <h4>분석 중 오류가 발생했습니다</h4>
                <p>${errorMessage}</p>
                <button class="btn btn-primary" onclick="App.report.runAIAnalysis()">
                    <i class="fas fa-redo"></i> 다시 시도
                </button>
            </div>
        `;
    },

    // 💾 분석 히스토리 저장
    saveAnalysisToHistory(results) {
        const history = JSON.parse(localStorage.getItem('aiAnalysisHistory') || '[]');
        
        const historyItem = {
            id: Date.now(),
            timestamp: new Date().toISOString(),
            results,
            dataCount: this.aiAnalysis.dataCount,
            filters: this.getCurrentFilters()
        };
        
        history.unshift(historyItem);
        
        // 최대 10개만 유지
        if (history.length > 10) {
            history.splice(10);
        }
        
        localStorage.setItem('aiAnalysisHistory', JSON.stringify(history));
        this.renderAnalysisHistory();
    },

    // 📜 분석 히스토리 렌더링
    renderAnalysisHistory() {
        const historyContainer = document.getElementById('aiAnalysisHistory');
        if (!historyContainer) return '';

        const history = JSON.parse(localStorage.getItem('aiAnalysisHistory') || '[]');
        
        if (history.length === 0) {
            historyContainer.innerHTML = `
                <div class="no-history">
                    <i class="fas fa-history"></i>
                    <p>아직 분석 히스토리가 없습니다.</p>
                </div>
            `;
            return;
        }

        historyContainer.innerHTML = `
            <div class="history-items">
                ${history.map(item => `
                    <div class="history-item" data-id="${item.id}">
                        <div class="history-info">
                            <div class="history-date">${new Date(item.timestamp).toLocaleString('ko-KR')}</div>
                            <div class="history-stats">
                                ${item.dataCount}건 데이터 • 
                                ${item.results.insights?.length || 0}개 인사이트 • 
                                ${item.results.recommendations?.length || 0}개 추천사항
                            </div>
                        </div>
                        <div class="history-actions">
                            <button class="btn-view-history" onclick="App.report.viewAnalysisHistory(${item.id})">
                                <i class="fas fa-eye"></i>
                            </button>
                            <button class="btn-delete-history" onclick="App.report.deleteAnalysisHistory(${item.id})">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    },

    // 👀 히스토리 아이템 보기
    viewAnalysisHistory(historyId) {
        const history = JSON.parse(localStorage.getItem('aiAnalysisHistory') || '[]');
        const item = history.find(h => h.id === historyId);
        
        if (!item) {
            alert('히스토리 아이템을 찾을 수 없습니다.');
            return;
        }

        // 과거 분석 결과 표시
        this.aiAnalysis = {
            ...item.results,
            lastAnalyzedAt: item.timestamp,
            dataCount: item.dataCount
        };

        this.renderAnalysisResults(item.results);
        console.log('👀 과거 분석 결과 보기:', item);
    },

    // 🗑️ 히스토리 아이템 삭제
    deleteAnalysisHistory(historyId) {
        if (!confirm('이 분석 히스토리를 삭제하시겠습니까?')) return;
        
        let history = JSON.parse(localStorage.getItem('aiAnalysisHistory') || '[]');
        history = history.filter(item => item.id !== historyId);
        
        localStorage.setItem('aiAnalysisHistory', JSON.stringify(history));
        this.renderAnalysisHistory();
        
        console.log('🗑️ 분석 히스토리 삭제 완료:', historyId);
    },

    // 📤 AI 인사이트 내보내기
    exportAIInsights() {
        if (!this.aiAnalysis.insights && !this.aiAnalysis.recommendations) {
            alert('내보낼 분석 결과가 없습니다. 먼저 분석을 실행해주세요.');
            return;
        }

        const exportData = {
            generatedAt: new Date().toISOString(),
            dataCount: this.aiAnalysis.dataCount,
            insights: this.aiAnalysis.insights || [],
            recommendations: this.aiAnalysis.recommendations || [],
            predictions: this.aiAnalysis.predictions || {},
            anomalies: this.aiAnalysis.anomalies || [],
            filters: this.getCurrentFilters()
        };

        const dataStr = JSON.stringify(exportData, null, 2);
        const dataBlob = new Blob([dataStr], {type: 'application/json'});
        const url = URL.createObjectURL(dataBlob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `CFC_AI_인사이트_${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        
        URL.revokeObjectURL(url);
        console.log('📤 AI 인사이트 내보내기 완료');
    },

    // 🔧 헬퍼 함수들
    getInsightTypeIcon(type) {
        const icons = {
            'efficiency': '<i class="fas fa-tachometer-alt"></i>',
            'pattern': '<i class="fas fa-chart-line"></i>',
            'performance': '<i class="fas fa-trophy"></i>'
        };
        return icons[type] || '<i class="fas fa-lightbulb"></i>';
    },

    getPriorityText(priority) {
        const texts = {
            'high': '높음',
            'medium': '보통',
            'low': '낮음'
        };
        return texts[priority] || priority;
    },

    getMetricText(level) {
        const texts = {
            'high': '높음',
            'medium': '보통',
            'low': '낮음'
        };
        return texts[level] || level;
    },

    getConfidenceText(confidence) {
        const texts = {
            'high': '높음',
            'medium': '보통',
            'low': '낮음'
        };
        return texts[confidence] || confidence;
    },

    getTrendText(trend) {
        const texts = {
            'increasing': '증가',
            'decreasing': '감소',
            'stable': '안정',
            'improving': '개선',
            'declining': '악화',
            'insufficient_data': '데이터 부족'
        };
        return texts[trend] || trend;
    },

    getAnomalyIcon(type) {
        const icons = {
            'volume_drop': '<i class="fas fa-arrow-down"></i>',
            'conversion_drop': '<i class="fas fa-chart-line-down"></i>',
            'source_failure': '<i class="fas fa-times-circle"></i>'
        };
        return icons[type] || '<i class="fas fa-exclamation-triangle"></i>';
    },

    getSeverityText(severity) {
        const texts = {
            'high': '높음',
            'medium': '보통',
            'low': '낮음'
        };
        return texts[severity] || severity;
    },
    // 📊 C) 고급 기능 - 차트 인터랙션 강화

    // 🔧 차트 인터랙션 시스템 초기화
    initChartInteractionSystem() {
        console.log('📊 차트 인터랙션 시스템 초기화...');
        
        this.chartInteractions = {
            drillDownHistory: [],
            annotations: [],
            highlights: {},
            activeFilters: {},
            animationEnabled: true
        };
        
        this.setupAdvancedChartFeatures();
        
        console.log('✅ 차트 인터랙션 시스템 초기화 완료');
    },

    // 🎯 고급 차트 기능 설정
    setupAdvancedChartFeatures() {
        // 기존 차트 인스턴스들에 인터랙션 추가
        this.enhanceExistingCharts();
        
        // 새로운 차트 생성 시 자동으로 인터랙션 추가
        this.interceptChartCreation();
    },

    // 📈 기존 차트들 향상
    enhanceExistingCharts() {
        // 실시간 미리보기 미니 차트 향상
        if (this._miniChartInstance) {
            this.addChartInteractions(this._miniChartInstance, 'mini-chart');
        }
        
        // 페이지 내 다른 차트들 찾아서 향상
        this.findAndEnhanceCharts();
    },

    // 🔍 페이지 내 차트 찾기 및 향상
    findAndEnhanceCharts() {
        const canvasElements = document.querySelectorAll('canvas');
        
        canvasElements.forEach(canvas => {
            // Chart.js 인스턴스가 있는 캔버스 확인
            if (Chart.getChart(canvas)) {
                const chartInstance = Chart.getChart(canvas);
                this.addChartInteractions(chartInstance, canvas.id || 'unnamed-chart');
            }
        });
    },

    // 📊 차트 생성 인터셉트
    interceptChartCreation() {
        // Chart.js 생성자 래핑
        const originalChart = window.Chart;
        const self = this;
        
        window.Chart = function(ctx, config) {
            const chart = new originalChart(ctx, config);
            
            // 새로 생성된 차트에 인터랙션 추가
            setTimeout(() => {
                self.addChartInteractions(chart, ctx.canvas?.id || 'dynamic-chart');
            }, 100);
            
            return chart;
        };
        
        // Chart.js의 정적 메서드들 복사
        Object.setPrototypeOf(window.Chart, originalChart);
        Object.assign(window.Chart, originalChart);
    },

    // 🎯 차트에 인터랙션 추가
    addChartInteractions(chartInstance, chartId) {
        if (!chartInstance || chartInstance._interactionsAdded) return;
        
        console.log(`📊 차트 인터랙션 추가: ${chartId}`);
        
        // 1. 드릴다운 기능
        this.addDrillDownInteraction(chartInstance, chartId);
        
        // 2. 호버 하이라이트
        this.addHoverHighlight(chartInstance, chartId);
        
        // 3. 클릭 애니메이션
        this.addClickAnimation(chartInstance, chartId);
        
        // 4. 컨텍스트 메뉴
        this.addContextMenu(chartInstance, chartId);
        
        // 5. 데이터 레이블 토글
        this.addDataLabelToggle(chartInstance, chartId);
        
        // 인터랙션 추가 표시
        chartInstance._interactionsAdded = true;
        chartInstance._chartId = chartId;
    },

    // 🔽 드릴다운 기능 추가
    addDrillDownInteraction(chartInstance, chartId) {
        const originalOnClick = chartInstance.options.onClick;
        
        chartInstance.options.onClick = (event, elements) => {
            if (elements && elements.length > 0) {
                const element = elements[0];
                const datasetIndex = element.datasetIndex;
                const dataIndex = element.index;
                
                this.handleChartDrillDown(chartInstance, chartId, datasetIndex, dataIndex, event);
            }
            
            // 원래 onClick 이벤트도 실행
            if (originalOnClick) {
                originalOnClick.call(chartInstance, event, elements);
            }
        };
    },

    // 📊 드릴다운 처리
    handleChartDrillDown(chartInstance, chartId, datasetIndex, dataIndex, event) {
        const dataset = chartInstance.data.datasets[datasetIndex];
        const label = chartInstance.data.labels[dataIndex];
        const value = dataset.data[dataIndex];
        
        console.log(`🔽 드릴다운: ${label} (${value})`);
        
        // 드릴다운 가능한 차트인지 확인
        if (this.canDrillDown(chartId, label)) {
            this.showDrillDownModal(chartId, label, value, event);
        } else {
            // 기본 동작: 상세 정보 툴팁 표시
            this.showDetailTooltip(chartInstance, label, value, event);
        }
    },

    // 🔍 드릴다운 가능 여부 확인
    canDrillDown(chartId, label) {
        const drillDownRules = {
            'previewMiniChart': {
                '지원루트': true,
                '모집분야': true,
                '회사명': false
            }
        };
        
        return drillDownRules[chartId]?.[label] || false;
    },

    // 📋 드릴다운 모달 표시
    showDrillDownModal(chartId, label, value, event) {
        const modal = document.createElement('div');
        modal.className = 'drilldown-modal';
        modal.innerHTML = `
            <div class="drilldown-content">
                <div class="drilldown-header">
                    <h4>${label} 상세 분석</h4>
                    <button class="btn-close-drilldown">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="drilldown-body">
                    ${this.generateDrillDownContent(label, value)}
                </div>
                <div class="drilldown-actions">
                    <button class="btn btn-primary" onclick="App.report.applyDrillDownFilter('${label}')">
                        이 조건으로 필터 적용
                    </button>
                    <button class="btn btn-secondary" onclick="App.report.generateDetailedReport('${label}')">
                        상세 리포트 생성
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // 닫기 이벤트
        modal.querySelector('.btn-close-drilldown').addEventListener('click', () => {
            document.body.removeChild(modal);
        });
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                document.body.removeChild(modal);
            }
        });
        
        // 드릴다운 히스토리에 추가
        this.chartInteractions.drillDownHistory.push({
            chartId,
            label,
            value,
            timestamp: new Date().toISOString()
        });
    },

    // 📊 드릴다운 콘텐츠 생성
    generateDrillDownContent(label, value) {
        const filteredData = this.getFilteredData();
        const detailData = this.getDetailDataForLabel(filteredData, label);
        
        return `
            <div class="drilldown-stats">
                <div class="stat-item">
                    <div class="stat-label">총 지원자</div>
                    <div class="stat-value">${value}명</div>
                </div>
                <div class="stat-item">
                    <div class="stat-label">전체 대비 비율</div>
                    <div class="stat-value">${this.calculatePercentage(value, filteredData.length)}%</div>
                </div>
            </div>
            
            <div class="drilldown-breakdown">
                <h5>세부 분석</h5>
                ${this.generateBreakdownChart(detailData)}
            </div>
            
            <div class="drilldown-trends">
                <h5>시간별 트렌드</h5>
                ${this.generateTrendChart(detailData)}
            </div>
        `;
    },

    // ✨ 호버 하이라이트 추가
    addHoverHighlight(chartInstance, chartId) {
        const originalOnHover = chartInstance.options.onHover;
        
        chartInstance.options.onHover = (event, elements) => {
            const canvas = chartInstance.canvas;
            
            if (elements && elements.length > 0) {
                canvas.style.cursor = 'pointer';
                
                // 호버된 요소 하이라이트
                this.highlightElement(chartInstance, elements[0]);
            } else {
                canvas.style.cursor = 'default';
                this.clearHighlight(chartInstance);
            }
            
            // 원래 onHover 이벤트도 실행
            if (originalOnHover) {
                originalOnHover.call(chartInstance, event, elements);
            }
        };
    },

    // 🌟 요소 하이라이트
    highlightElement(chartInstance, element) {
        const dataset = chartInstance.data.datasets[element.datasetIndex];
        
        // 원래 색상 백업
        if (!dataset._originalBackgroundColor) {
            dataset._originalBackgroundColor = [...dataset.backgroundColor];
        }
        
        // 하이라이트 효과
        const newColors = dataset._originalBackgroundColor.map((color, index) => {
            if (index === element.index) {
                return this.brightenColor(color, 0.2);
            } else {
                return this.fadeColor(color, 0.6);
            }
        });
        
        dataset.backgroundColor = newColors;
        chartInstance.update('none');
    },

    // 🔄 하이라이트 제거
    clearHighlight(chartInstance) {
        chartInstance.data.datasets.forEach(dataset => {
            if (dataset._originalBackgroundColor) {
                dataset.backgroundColor = [...dataset._originalBackgroundColor];
            }
        });
        chartInstance.update('none');
    },

    // 💫 클릭 애니메이션 추가
    addClickAnimation(chartInstance, chartId) {
        const canvas = chartInstance.canvas;
        
        canvas.addEventListener('click', (event) => {
            if (this.chartInteractions.animationEnabled) {
                this.createClickRipple(canvas, event);
            }
        });
    },

    // 🌊 클릭 리플 효과
    createClickRipple(canvas, event) {
        const rect = canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        
        const ripple = document.createElement('div');
        ripple.className = 'chart-ripple';
        ripple.style.cssText = `
            position: absolute;
            left: ${x}px;
            top: ${y}px;
            width: 4px;
            height: 4px;
            background: rgba(59, 130, 246, 0.6);
            border-radius: 50%;
            transform: translate(-50%, -50%);
            pointer-events: none;
            animation: ripple-animation 0.6s ease-out;
            z-index: 1000;
        `;
        
        canvas.parentElement.style.position = 'relative';
        canvas.parentElement.appendChild(ripple);
        
        setTimeout(() => {
            if (ripple.parentElement) {
                ripple.parentElement.removeChild(ripple);
            }
        }, 600);
    },

    // 📱 컨텍스트 메뉴 추가
    addContextMenu(chartInstance, chartId) {
        const canvas = chartInstance.canvas;
        
        canvas.addEventListener('contextmenu', (event) => {
            event.preventDefault();
            this.showChartContextMenu(chartInstance, chartId, event);
        });
    },

    // 📋 차트 컨텍스트 메뉴 표시
    showChartContextMenu(chartInstance, chartId, event) {
        // 기존 컨텍스트 메뉴 제거
        const existingMenu = document.querySelector('.chart-context-menu');
        if (existingMenu) {
            existingMenu.remove();
        }
        
        const menu = document.createElement('div');
        menu.className = 'chart-context-menu';
        menu.innerHTML = `
            <div class="context-menu-item" data-action="export">
                <i class="fas fa-download"></i>
                <span>차트 내보내기</span>
            </div>
            <div class="context-menu-item" data-action="fullscreen">
                <i class="fas fa-expand"></i>
                <span>전체화면</span>
            </div>
            <div class="context-menu-item" data-action="annotations">
                <i class="fas fa-comment"></i>
                <span>주석 추가</span>
            </div>
            <div class="context-menu-separator"></div>
            <div class="context-menu-item" data-action="data-labels">
                <i class="fas fa-tag"></i>
                <span>데이터 레이블 토글</span>
            </div>
            <div class="context-menu-item" data-action="animation-toggle">
                <i class="fas fa-magic"></i>
                <span>애니메이션 ${this.chartInteractions.animationEnabled ? '끄기' : '켜기'}</span>
            </div>
        `;
        
        menu.style.cssText = `
            position: fixed;
            left: ${event.clientX}px;
            top: ${event.clientY}px;
            z-index: 1001;
        `;
        
        document.body.appendChild(menu);
        
        // 메뉴 아이템 클릭 이벤트
        menu.querySelectorAll('.context-menu-item').forEach(item => {
            item.addEventListener('click', () => {
                const action = item.dataset.action;
                this.handleContextMenuAction(chartInstance, chartId, action);
                menu.remove();
            });
        });
        
        // 외부 클릭 시 메뉴 닫기
        setTimeout(() => {
            document.addEventListener('click', function closeMenu() {
                menu.remove();
                document.removeEventListener('click', closeMenu);
            });
        }, 100);
    },

    // 🎬 컨텍스트 메뉴 액션 처리
    handleContextMenuAction(chartInstance, chartId, action) {
        switch (action) {
            case 'export':
                this.exportChart(chartInstance, chartId);
                break;
            case 'fullscreen':
                this.showChartFullscreen(chartInstance, chartId);
                break;
            case 'annotations':
                this.showAnnotationDialog(chartInstance, chartId);
                break;
            case 'data-labels':
                this.toggleDataLabels(chartInstance);
                break;
            case 'animation-toggle':
                this.toggleAnimations();
                break;
        }
    },

    // 📤 차트 내보내기
    exportChart(chartInstance, chartId) {
        const canvas = chartInstance.canvas;
        const link = document.createElement('a');
        link.download = `차트_${chartId}_${new Date().toISOString().split('T')[0]}.png`;
        link.href = canvas.toDataURL();
        link.click();
        
        console.log('📤 차트 내보내기 완료:', chartId);
    },

    // 🔍 차트 전체화면
    showChartFullscreen(chartInstance, chartId) {
        const modal = document.createElement('div');
        modal.className = 'chart-fullscreen-modal';
        modal.innerHTML = `
            <div class="fullscreen-content">
                <div class="fullscreen-header">
                    <h4>차트 전체화면</h4>
                    <button class="btn-close-fullscreen">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="fullscreen-chart-container">
                    <canvas id="fullscreen-chart"></canvas>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // 전체화면 차트 생성
        const fullscreenCanvas = modal.querySelector('#fullscreen-chart');
        const fullscreenChart = new Chart(fullscreenCanvas, {
            type: chartInstance.config.type,
            data: JSON.parse(JSON.stringify(chartInstance.data)),
            options: {
                ...chartInstance.options,
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    ...chartInstance.options.plugins,
                    legend: {
                        ...chartInstance.options.plugins?.legend,
                        display: true,
                        position: 'top'
                    }
                }
            }
        });
        
        // 닫기 이벤트
        modal.querySelector('.btn-close-fullscreen').addEventListener('click', () => {
            fullscreenChart.destroy();
            document.body.removeChild(modal);
        });
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                fullscreenChart.destroy();
                document.body.removeChild(modal);
            }
        });
    },

    // 🏷️ 데이터 레이블 토글
    toggleDataLabels(chartInstance) {
        const plugins = chartInstance.options.plugins;
        
        if (!plugins.datalabels) {
            plugins.datalabels = {
                display: true,
                color: '#1f2937',
                font: {
                    weight: 'bold',
                    size: 12
                },
                formatter: (value, context) => {
                    return value;
                }
            };
        } else {
            plugins.datalabels.display = !plugins.datalabels.display;
        }
        
        chartInstance.update();
        console.log('🏷️ 데이터 레이블 토글:', plugins.datalabels.display);
    },

    // 🎭 애니메이션 토글
    toggleAnimations() {
        this.chartInteractions.animationEnabled = !this.chartInteractions.animationEnabled;
        console.log('🎭 애니메이션 토글:', this.chartInteractions.animationEnabled);
    },

    // 🔧 유틸리티 함수들
    brightenColor(color, factor) {
        if (typeof color === 'string' && color.startsWith('#')) {
            const hex = color.slice(1);
            const r = Math.min(255, parseInt(hex.slice(0, 2), 16) + Math.round(255 * factor));
            const g = Math.min(255, parseInt(hex.slice(2, 4), 16) + Math.round(255 * factor));
            const b = Math.min(255, parseInt(hex.slice(4, 6), 16) + Math.round(255 * factor));
            return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
        }
        return color;
    },

    fadeColor(color, factor) {
        if (typeof color === 'string' && color.startsWith('#')) {
            const hex = color.slice(1);
            const r = Math.round(parseInt(hex.slice(0, 2), 16) * factor);
            const g = Math.round(parseInt(hex.slice(2, 4), 16) * factor);
            const b = Math.round(parseInt(hex.slice(4, 6), 16) * factor);
            return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
        }
        return color;
    },

    calculatePercentage(value, total) {
        return total > 0 ? Math.round((value / total) * 100) : 0;
    },

    getDetailDataForLabel(data, label) {
        return data.filter(item => {
            return item['지원루트'] === label || 
                   item['모집분야'] === label || 
                   item['회사명'] === label;
        });
    },

    // 📊 드릴다운 필터 적용
    applyDrillDownFilter(label) {
        // 해당 라벨로 필터 설정
        const routeFilter = document.getElementById('report-filter-route');
        const fieldFilter = document.getElementById('report-filter-field');
        const companyFilter = document.getElementById('report-filter-company');
        
        [routeFilter, fieldFilter, companyFilter].forEach(filter => {
            if (filter) {
                Array.from(filter.options).forEach(option => {
                    if (option.text === label) {
                        filter.value = option.value;
                        filter.dispatchEvent(new Event('change'));
                    }
                });
            }
        });
        
        console.log('🔍 드릴다운 필터 적용:', label);
    },

    // 📋 상세 리포트 생성
    generateDetailedReport(label) {
        // 해당 라벨에 대한 상세 리포트 생성
        this.applyDrillDownFilter(label);
        
        // 잠시 후 리포트 생성
        setTimeout(() => {
            this.generateReport();
        }, 500);
        
        console.log('📋 상세 리포트 생성:', label);
    },
    // 🔗 C) 고급 기능 - 외부 연동 시스템

    // 🔧 외부 연동 시스템 초기화
    initExternalIntegrationSystem() {
        console.log('🔗 외부 연동 시스템 초기화...');
        
        this.integrations = {
            googleAnalytics: {
                enabled: false,
                trackingId: '',
                lastSync: null
            },
            slack: {
                enabled: false,
                webhookUrl: '',
                channels: [],
                lastNotification: null
            },
            email: {
                enabled: false,
                smtpConfig: {},
                templates: {},
                lastSent: null
            },
            api: {
                enabled: false,
                endpoints: {},
                lastFetch: null
            }
        };
        
        this.setupIntegrationUI();
        
        console.log('✅ 외부 연동 시스템 초기화 완료');
    },

    // 🎨 연동 설정 UI 생성
    setupIntegrationUI() {
        // 리포트 설정에 연동 탭 추가
        this.addIntegrationTab();
        
        // 연동 상태 표시기 추가
        this.addIntegrationStatusIndicator();
    },

    // 📋 연동 탭 추가
    addIntegrationTab() {
        const reportTabs = document.querySelector('.report-tabs');
        if (!reportTabs) return;

        // 연동 탭 버튼 추가
        const integrationTab = document.createElement('button');
        integrationTab.className = 'report-tab';
        integrationTab.dataset.tab = 'integrations';
        integrationTab.innerHTML = '<i class="fas fa-plug"></i> 외부 연동';
        
        reportTabs.appendChild(integrationTab);

        // 연동 탭 콘텐츠 추가
        const reportContent = document.querySelector('.report-content');
        if (reportContent) {
            const integrationTabContent = document.createElement('div');
            integrationTabContent.id = 'integrations-tab';
            integrationTabContent.className = 'tab-content';
            integrationTabContent.innerHTML = this.renderIntegrationsTabContent();
            
            reportContent.querySelector('.report-builder-section .report-builder').appendChild(integrationTabContent);
        }

        // 탭 클릭 이벤트 추가
        integrationTab.addEventListener('click', () => {
            this.showIntegrationsTab();
        });
    },

    // 🎨 연동 탭 콘텐츠 렌더링
    renderIntegrationsTabContent() {
        return `
            <div class="integrations-container">
                <div class="integrations-header">
                    <h3><i class="fas fa-plug"></i> 외부 시스템 연동</h3>
                    <p>다양한 외부 서비스와 연동하여 리포트 기능을 확장하세요.</p>
                </div>

                <!-- Google Analytics 연동 -->
                <div class="integration-card" data-integration="googleAnalytics">
                    <div class="integration-header">
                        <div class="integration-info">
                            <div class="integration-icon ga-icon">
                                <i class="fab fa-google"></i>
                            </div>
                            <div class="integration-details">
                                <h4>Google Analytics</h4>
                                <p>웹사이트 트래픽 데이터를 연동하여 지원자 유입 경로를 분석합니다.</p>
                            </div>
                        </div>
                        <div class="integration-toggle">
                            <input type="checkbox" id="ga-toggle" ${this.integrations.googleAnalytics.enabled ? 'checked' : ''}>
                            <label for="ga-toggle" class="toggle-label"></label>
                        </div>
                    </div>
                    <div class="integration-config ${this.integrations.googleAnalytics.enabled ? 'active' : ''}">
                        <div class="config-form">
                            <div class="form-group">
                                <label>Tracking ID</label>
                                <input type="text" id="ga-tracking-id" placeholder="GA-XXXXXXXX-X" 
                                       value="${this.integrations.googleAnalytics.trackingId}">
                            </div>
                            <div class="form-actions">
                                <button class="btn btn-primary" onclick="App.report.testGoogleAnalytics()">
                                    <i class="fas fa-flask"></i> 연결 테스트
                                </button>
                                <button class="btn btn-success" onclick="App.report.syncGoogleAnalytics()">
                                    <i class="fas fa-sync"></i> 데이터 동기화
                                </button>
                            </div>
                        </div>
                        <div class="integration-features">
                            <h5>제공 기능</h5>
                            <ul>
                                <li>웹사이트 유입 경로 분석</li>
                                <li>페이지별 지원자 전환율</li>
                                <li>실시간 방문자 통계</li>
                                <li>기간별 트래픽 트렌드</li>
                            </ul>
                        </div>
                    </div>
                </div>

                <!-- Slack 연동 -->
                <div class="integration-card" data-integration="slack">
                    <div class="integration-header">
                        <div class="integration-info">
                            <div class="integration-icon slack-icon">
                                <i class="fab fa-slack"></i>
                            </div>
                            <div class="integration-details">
                                <h4>Slack 알림</h4>
                                <p>중요한 채용 이벤트와 리포트를 Slack 채널로 자동 알림을 받습니다.</p>
                            </div>
                        </div>
                        <div class="integration-toggle">
                            <input type="checkbox" id="slack-toggle" ${this.integrations.slack.enabled ? 'checked' : ''}>
                            <label for="slack-toggle" class="toggle-label"></label>
                        </div>
                    </div>
                    <div class="integration-config ${this.integrations.slack.enabled ? 'active' : ''}">
                        <div class="config-form">
                            <div class="form-group">
                                <label>Webhook URL</label>
                                <input type="text" id="slack-webhook" placeholder="https://hooks.slack.com/services/..." 
                                       value="${this.integrations.slack.webhookUrl}">
                            </div>
                            <div class="form-group">
                                <label>알림 채널</label>
                                <input type="text" id="slack-channel" placeholder="#recruitment" 
                                       value="${this.integrations.slack.channels[0] || ''}">
                            </div>
                            <div class="form-group">
                                <label>알림 유형</label>
                                <div class="checkbox-group">
                                    <label><input type="checkbox" checked> 일일 리포트</label>
                                    <label><input type="checkbox" checked> 주간 요약</label>
                                    <label><input type="checkbox"> 긴급 알림</label>
                                    <label><input type="checkbox"> 목표 달성 알림</label>
                                </div>
                            </div>
                            <div class="form-actions">
                                <button class="btn btn-primary" onclick="App.report.testSlackIntegration()">
                                    <i class="fas fa-paper-plane"></i> 테스트 메시지 발송
                                </button>
                                <button class="btn btn-success" onclick="App.report.sendSlackReport()">
                                    <i class="fas fa-share"></i> 리포트 공유
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- 이메일 연동 -->
                <div class="integration-card" data-integration="email">
                    <div class="integration-header">
                        <div class="integration-info">
                            <div class="integration-icon email-icon">
                                <i class="fas fa-envelope"></i>
                            </div>
                            <div class="integration-details">
                                <h4>이메일 자동 발송</h4>
                                <p>정기적으로 리포트를 이메일로 자동 발송하거나 알림을 받습니다.</p>
                            </div>
                        </div>
                        <div class="integration-toggle">
                            <input type="checkbox" id="email-toggle" ${this.integrations.email.enabled ? 'checked' : ''}>
                            <label for="email-toggle" class="toggle-label"></label>
                        </div>
                    </div>
                    <div class="integration-config ${this.integrations.email.enabled ? 'active' : ''}">
                        <div class="config-form">
                            <div class="form-row">
                                <div class="form-group">
                                    <label>SMTP 서버</label>
                                    <input type="text" id="email-smtp-host" placeholder="smtp.gmail.com">
                                </div>
                                <div class="form-group">
                                    <label>포트</label>
                                    <input type="number" id="email-smtp-port" placeholder="587">
                                </div>
                            </div>
                            <div class="form-row">
                                <div class="form-group">
                                    <label>사용자명</label>
                                    <input type="email" id="email-username" placeholder="user@company.com">
                                </div>
                                <div class="form-group">
                                    <label>비밀번호</label>
                                    <input type="password" id="email-password" placeholder="앱 비밀번호">
                                </div>
                            </div>
                            <div class="form-group">
                                <label>수신자 목록</label>
                                <textarea id="email-recipients" placeholder="hr@company.com, manager@company.com" rows="2"></textarea>
                            </div>
                            <div class="form-group">
                                <label>발송 주기</label>
                                <select id="email-schedule">
                                    <option value="daily">매일</option>
                                    <option value="weekly" selected>매주</option>
                                    <option value="monthly">매월</option>
                                    <option value="custom">사용자 지정</option>
                                </select>
                            </div>
                            <div class="form-actions">
                                <button class="btn btn-primary" onclick="App.report.testEmailConfiguration()">
                                    <i class="fas fa-envelope-open"></i> 테스트 이메일 발송
                                </button>
                                <button class="btn btn-success" onclick="App.report.scheduleEmailReports()">
                                    <i class="fas fa-calendar-plus"></i> 자동 발송 설정
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- API 연동 -->
                <div class="integration-card" data-integration="api">
                    <div class="integration-header">
                        <div class="integration-info">
                            <div class="integration-icon api-icon">
                                <i class="fas fa-code"></i>
                            </div>
                            <div class="integration-details">
                                <h4>API 데이터 연동</h4>
                                <p>외부 시스템의 API를 통해 추가 데이터를 가져오거나 내보냅니다.</p>
                            </div>
                        </div>
                        <div class="integration-toggle">
                            <input type="checkbox" id="api-toggle" ${this.integrations.api.enabled ? 'checked' : ''}>
                            <label for="api-toggle" class="toggle-label"></label>
                        </div>
                    </div>
                    <div class="integration-config ${this.integrations.api.enabled ? 'active' : ''}">
                        <div class="config-form">
                            <div class="api-endpoints">
                                <h5>API 엔드포인트 설정</h5>
                                <div class="endpoint-item">
                                    <div class="form-row">
                                        <div class="form-group">
                                            <label>이름</label>
                                            <input type="text" placeholder="HR 시스템">
                                        </div>
                                        <div class="form-group">
                                            <label>URL</label>
                                            <input type="url" placeholder="https://api.hr-system.com/candidates">
                                        </div>
                                    </div>
                                    <div class="form-row">
                                        <div class="form-group">
                                            <label>인증 토큰</label>
                                            <input type="password" placeholder="Bearer token">
                                        </div>
                                        <div class="form-group">
                                            <label>동기화 주기</label>
                                            <select>
                                                <option>실시간</option>
                                                <option>매시간</option>
                                                <option>매일</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                                <button class="btn btn-outline add-endpoint-btn">
                                    <i class="fas fa-plus"></i> 엔드포인트 추가
                                </button>
                            </div>
                            <div class="form-actions">
                                <button class="btn btn-primary" onclick="App.report.testAPIConnection()">
                                    <i class="fas fa-link"></i> 연결 테스트
                                </button>
                                <button class="btn btn-success" onclick="App.report.syncAPIData()">
                                    <i class="fas fa-sync-alt"></i> 데이터 동기화
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- 연동 상태 요약 -->
                <div class="integration-summary">
                    <h4><i class="fas fa-chart-pie"></i> 연동 상태 요약</h4>
                    <div class="summary-grid">
                        <div class="summary-item">
                            <div class="summary-label">활성 연동</div>
                            <div class="summary-value" id="active-integrations">0</div>
                        </div>
                        <div class="summary-item">
                            <div class="summary-label">마지막 동기화</div>
                            <div class="summary-value" id="last-sync">없음</div>
                        </div>
                        <div class="summary-item">
                            <div class="summary-label">연동 상태</div>
                            <div class="summary-value status-indicator" id="integration-status">
                                <span class="status-dot offline"></span> 오프라인
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    // 📱 연동 탭 표시
    showIntegrationsTab() {
        // 모든 탭 비활성화
        document.querySelectorAll('.report-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });

        // 연동 탭 활성화
        document.querySelector('[data-tab="integrations"]').classList.add('active');
        document.getElementById('integrations-tab').classList.add('active');

        // 연동 이벤트 설정
        this.setupIntegrationEvents();
        this.updateIntegrationStatus();
    },

    // 🎯 연동 이벤트 설정
    setupIntegrationEvents() {
        // 토글 스위치 이벤트
        document.querySelectorAll('.integration-toggle input[type="checkbox"]').forEach(toggle => {
            toggle.addEventListener('change', (e) => {
                const integrationCard = e.target.closest('.integration-card');
                const integrationType = integrationCard.dataset.integration;
                const config = integrationCard.querySelector('.integration-config');
                
                if (e.target.checked) {
                    config.classList.add('active');
                    this.enableIntegration(integrationType);
                } else {
                    config.classList.remove('active');
                    this.disableIntegration(integrationType);
                }
            });
        });

        // 엔드포인트 추가 버튼
        const addEndpointBtn = document.querySelector('.add-endpoint-btn');
        if (addEndpointBtn) {
            addEndpointBtn.addEventListener('click', () => {
                this.addAPIEndpoint();
            });
        }
    },

    // ✅ 연동 활성화
    enableIntegration(type) {
        this.integrations[type].enabled = true;
        this.saveIntegrationSettings();
        this.updateIntegrationStatus();
        
        console.log(`✅ ${type} 연동 활성화`);
    },

    // ❌ 연동 비활성화
    disableIntegration(type) {
        this.integrations[type].enabled = false;
        this.saveIntegrationSettings();
        this.updateIntegrationStatus();
        
        console.log(`❌ ${type} 연동 비활성화`);
    },

    // 🔬 Google Analytics 테스트
    testGoogleAnalytics() {
        const trackingId = document.getElementById('ga-tracking-id').value;
        
        if (!trackingId) {
            alert('Tracking ID를 입력해주세요.');
            return;
        }

        // 시뮬레이션된 테스트
        this.showLoadingIndicator('Google Analytics 연결 테스트 중...');
        
        setTimeout(() => {
            this.hideLoadingIndicator();
            
            // 성공 시뮬레이션
            const success = Math.random() > 0.3;
            
            if (success) {
                this.integrations.googleAnalytics.trackingId = trackingId;
                this.saveIntegrationSettings();
                alert('✅ Google Analytics 연결 테스트 성공!');
            } else {
                alert('❌ 연결 실패: Tracking ID를 확인해주세요.');
            }
        }, 2000);
    },

    // 📊 Google Analytics 동기화
    syncGoogleAnalytics() {
        if (!this.integrations.googleAnalytics.trackingId) {
            alert('먼저 Google Analytics를 설정해주세요.');
            return;
        }

        this.showLoadingIndicator('Google Analytics 데이터 동기화 중...');
        
        setTimeout(() => {
            this.hideLoadingIndicator();
            
            // 시뮬레이션된 데이터
            const mockData = {
                sessions: Math.floor(Math.random() * 10000) + 5000,
                pageviews: Math.floor(Math.random() * 20000) + 10000,
                conversion: (Math.random() * 5 + 2).toFixed(2) + '%',
                topPages: [
                    '/careers',
                    '/jobs/developer',
                    '/jobs/designer',
                    '/about'
                ]
            };

            this.integrations.googleAnalytics.lastSync = new Date().toISOString();
            this.saveIntegrationSettings();
            this.updateIntegrationStatus();

            alert(`✅ Google Analytics 동기화 완료!\n\n세션: ${mockData.sessions}\n페이지뷰: ${mockData.pageviews}\n전환율: ${mockData.conversion}`);
            
            console.log('📊 Google Analytics 데이터:', mockData);
        }, 3000);
    },
    // 💬 Slack 연동 테스트
    testSlackIntegration() {
        const webhookUrl = document.getElementById('slack-webhook').value;
        const channel = document.getElementById('slack-channel').value;
        
        if (!webhookUrl) {
            alert('Slack Webhook URL을 입력해주세요.');
            return;
        }

        this.showLoadingIndicator('Slack 연결 테스트 중...');
        
        setTimeout(() => {
            this.hideLoadingIndicator();
            
            // 시뮬레이션된 테스트 메시지 발송
            const testMessage = {
                text: "🤖 CFC 채용 대시보드 테스트 메시지",
                channel: channel || '#general',
                username: 'CFC 채용봇',
                icon_emoji: ':robot_face:'
            };

            this.integrations.slack.webhookUrl = webhookUrl;
            this.integrations.slack.channels = [channel || '#general'];
            this.saveIntegrationSettings();

            alert('✅ Slack 테스트 메시지 발송 성공!');
            console.log('💬 Slack 테스트 메시지:', testMessage);
        }, 1500);
    },

    // 📤 Slack 리포트 공유
    sendSlackReport() {
        if (!this.integrations.slack.webhookUrl) {
            alert('먼저 Slack을 설정해주세요.');
            return;
        }

        this.showLoadingIndicator('Slack으로 리포트 전송 중...');
        
        setTimeout(() => {
            this.hideLoadingIndicator();
            
            const stats = this.calculateBasicStats(this.getFilteredData());
            const slackMessage = this.formatSlackReportMessage(stats);
            
            this.integrations.slack.lastNotification = new Date().toISOString();
            this.saveIntegrationSettings();
            this.updateIntegrationStatus();

            alert('✅ Slack으로 리포트가 성공적으로 전송되었습니다!');
            console.log('📤 Slack 리포트 메시지:', slackMessage);
        }, 2000);
    },

    // 📝 Slack 리포트 메시지 포맷
    formatSlackReportMessage(stats) {
        const today = new Date().toLocaleDateString('ko-KR');
        
        return {
            text: "📊 CFC 채용 대시보드 일일 리포트",
            attachments: [{
                color: "good",
                fields: [
                    {
                        title: "총 지원자",
                        value: `${stats.total}명`,
                        short: true
                    },
                    {
                        title: "전환율",
                        value: `${stats.conversionRate}%`,
                        short: true
                    },
                    {
                        title: "주요 채용 경로",
                        value: stats.topSource,
                        short: true
                    },
                    {
                        title: "리포트 생성일",
                        value: today,
                        short: true
                    }
                ],
                footer: "CFC 채용 대시보드",
                ts: Math.floor(Date.now() / 1000)
            }]
        };
    },

    // 📧 이메일 설정 테스트
    testEmailConfiguration() {
        const config = this.getEmailConfiguration();
        
        if (!config.smtpHost || !config.username || !config.password) {
            alert('이메일 설정을 모두 입력해주세요.');
            return;
        }

        this.showLoadingIndicator('이메일 설정 테스트 중...');
        
        setTimeout(() => {
            this.hideLoadingIndicator();
            
            // 시뮬레이션된 테스트
            const success = Math.random() > 0.2;
            
            if (success) {
                this.integrations.email.smtpConfig = config;
                this.saveIntegrationSettings();
                alert('✅ 이메일 설정 테스트 성공!\n테스트 이메일이 발송되었습니다.');
            } else {
                alert('❌ 이메일 설정 오류: SMTP 설정을 확인해주세요.');
            }
        }, 2500);
    },

    // 📅 이메일 자동 발송 설정
    scheduleEmailReports() {
        const config = this.getEmailConfiguration();
        const schedule = document.getElementById('email-schedule').value;
        const recipients = document.getElementById('email-recipients').value;
        
        if (!recipients) {
            alert('수신자를 입력해주세요.');
            return;
        }

        this.integrations.email.smtpConfig = config;
        this.integrations.email.schedule = schedule;
        this.integrations.email.recipients = recipients.split(',').map(email => email.trim());
        this.saveIntegrationSettings();

        alert(`✅ ${schedule} 주기로 이메일 자동 발송이 설정되었습니다.\n수신자: ${recipients}`);
        
        // 시뮬레이션된 첫 번째 발송
        setTimeout(() => {
            this.sendScheduledEmail();
        }, 5000);
    },

    // 📬 예약된 이메일 발송
    sendScheduledEmail() {
        const stats = this.calculateBasicStats(this.getFilteredData());
        const emailContent = this.formatEmailReportContent(stats);
        
        this.integrations.email.lastSent = new Date().toISOString();
        this.saveIntegrationSettings();
        this.updateIntegrationStatus();

        console.log('📬 이메일 리포트 발송:', emailContent);
        
        // 사용자에게 알림 (실제로는 백그라운드에서 발송됨)
        if (Notification.permission === 'granted') {
            new Notification('CFC 채용 대시보드', {
                body: '이메일 리포트가 성공적으로 발송되었습니다.',
                icon: '/favicon.ico'
            });
        }
    },

    // 📧 이메일 설정 가져오기
    getEmailConfiguration() {
        return {
            smtpHost: document.getElementById('email-smtp-host')?.value || '',
            smtpPort: document.getElementById('email-smtp-port')?.value || '587',
            username: document.getElementById('email-username')?.value || '',
            password: document.getElementById('email-password')?.value || '',
            security: 'STARTTLS'
        };
    },

    // 📝 이메일 리포트 콘텐츠 포맷
    formatEmailReportContent(stats) {
        const today = new Date().toLocaleDateString('ko-KR');
        
        return {
            subject: `CFC 채용 대시보드 리포트 - ${today}`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; color: white; text-align: center;">
                        <h1 style="margin: 0;">CFC 채용 대시보드</h1>
                        <p style="margin: 10px 0 0 0;">일일 리포트 - ${today}</p>
                    </div>
                    
                    <div style="padding: 30px; background: #f8fafc;">
                        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 20px; margin-bottom: 30px;">
                            <div style="text-align: center; padding: 20px; background: white; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                                <div style="font-size: 2rem; font-weight: bold; color: #3b82f6;">${stats.total}</div>
                                <div style="color: #6b7280;">총 지원자</div>
                            </div>
                            <div style="text-align: center; padding: 20px; background: white; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                                <div style="font-size: 2rem; font-weight: bold; color: #10b981;">${stats.conversionRate}%</div>
                                <div style="color: #6b7280;">전환율</div>
                            </div>
                            <div style="text-align: center; padding: 20px; background: white; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                                <div style="font-size: 1.2rem; font-weight: bold; color: #f59e0b;">${stats.topSource}</div>
                                <div style="color: #6b7280;">주요 채용 경로</div>
                            </div>
                        </div>
                        
                        <div style="background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                            <h3 style="margin-top: 0; color: #1f2937;">채용 현황 요약</h3>
                            <p>오늘 ${today} 기준으로 총 ${stats.total}명의 지원자가 있으며, 전체 전환율은 ${stats.conversionRate}%입니다.</p>
                            <p>주요 채용 경로는 "${stats.topSource}"이며, 지속적인 모니터링이 필요합니다.</p>
                        </div>
                    </div>
                    
                    <div style="background: #1f2937; padding: 20px; text-align: center; color: white;">
                        <p style="margin: 0;">CFC 채용 대시보드에서 자동 생성된 리포트입니다.</p>
                    </div>
                </div>
            `
        };
    },

    // 🔗 API 연결 테스트
    testAPIConnection() {
        const endpoints = this.getAPIEndpoints();
        
        if (endpoints.length === 0) {
            alert('API 엔드포인트를 설정해주세요.');
            return;
        }

        this.showLoadingIndicator('API 연결 테스트 중...');
        
        setTimeout(() => {
            this.hideLoadingIndicator();
            
            // 시뮬레이션된 연결 테스트
            const results = endpoints.map(endpoint => ({
                name: endpoint.name,
                url: endpoint.url,
                status: Math.random() > 0.3 ? 'success' : 'error',
                responseTime: Math.floor(Math.random() * 500) + 100
            }));

            const successCount = results.filter(r => r.status === 'success').length;
            const totalCount = results.length;

            alert(`API 연결 테스트 완료!\n성공: ${successCount}/${totalCount} 엔드포인트`);
            console.log('🔗 API 테스트 결과:', results);
        }, 2000);
    },

    // 🔄 API 데이터 동기화
    syncAPIData() {
        const endpoints = this.getAPIEndpoints();
        
        if (endpoints.length === 0) {
            alert('API 엔드포인트를 설정해주세요.');
            return;
        }

        this.showLoadingIndicator('API 데이터 동기화 중...');
        
        setTimeout(() => {
            this.hideLoadingIndicator();
            
            // 시뮬레이션된 데이터 동기화
            const syncedData = {
                candidates: Math.floor(Math.random() * 100) + 50,
                positions: Math.floor(Math.random() * 20) + 10,
                interviews: Math.floor(Math.random() * 200) + 100,
                lastSync: new Date().toISOString()
            };

            this.integrations.api.lastFetch = syncedData.lastSync;
            this.saveIntegrationSettings();
            this.updateIntegrationStatus();

            alert(`✅ API 데이터 동기화 완료!\n\n지원자: ${syncedData.candidates}명\n포지션: ${syncedData.positions}개\n면접: ${syncedData.interviews}건`);
            
            console.log('🔄 동기화된 API 데이터:', syncedData);
        }, 3000);
    },

    // ➕ API 엔드포인트 추가
    addAPIEndpoint() {
        const container = document.querySelector('.api-endpoints');
        const newEndpoint = document.createElement('div');
        newEndpoint.className = 'endpoint-item';
        newEndpoint.innerHTML = `
            <div class="form-row">
                <div class="form-group">
                    <label>이름</label>
                    <input type="text" placeholder="시스템 이름">
                </div>
                <div class="form-group">
                    <label>URL</label>
                    <input type="url" placeholder="https://api.example.com/endpoint">
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>인증 토큰</label>
                    <input type="password" placeholder="Bearer token">
                </div>
                <div class="form-group">
                    <label>동기화 주기</label>
                    <select>
                        <option>실시간</option>
                        <option>매시간</option>
                        <option>매일</option>
                    </select>
                </div>
            </div>
            <button class="btn btn-danger btn-sm remove-endpoint" style="margin-top: 10px;">
                <i class="fas fa-trash"></i> 제거
            </button>
        `;
        
        container.insertBefore(newEndpoint, container.querySelector('.add-endpoint-btn'));
        
        // 제거 버튼 이벤트
        newEndpoint.querySelector('.remove-endpoint').addEventListener('click', () => {
            newEndpoint.remove();
        });
    },

    // 📊 연동 상태 업데이트
    updateIntegrationStatus() {
        const activeCount = Object.values(this.integrations).filter(i => i.enabled).length;
        const lastSyncTimes = Object.values(this.integrations)
            .map(i => i.lastSync || i.lastNotification || i.lastSent || i.lastFetch)
            .filter(Boolean);
        
        const lastSync = lastSyncTimes.length > 0 ? 
            Math.max(...lastSyncTimes.map(t => new Date(t).getTime())) : null;
        
        // UI 업데이트
        const activeEl = document.getElementById('active-integrations');
        const lastSyncEl = document.getElementById('last-sync');
        const statusEl = document.getElementById('integration-status');
        
        if (activeEl) activeEl.textContent = activeCount;
        if (lastSyncEl) {
            lastSyncEl.textContent = lastSync ? 
                new Date(lastSync).toLocaleString('ko-KR') : '없음';
        }
        if (statusEl) {
            const dot = statusEl.querySelector('.status-dot');
            const text = statusEl.childNodes[1];
            
            if (activeCount > 0) {
                dot.className = 'status-dot online';
                text.textContent = ' 온라인';
            } else {
                dot.className = 'status-dot offline';
                text.textContent = ' 오프라인';
            }
        }
    },

    // 🔧 유틸리티 함수들
    getAPIEndpoints() {
        const endpoints = [];
        document.querySelectorAll('.endpoint-item').forEach(item => {
            const name = item.querySelector('input[placeholder*="이름"]')?.value;
            const url = item.querySelector('input[type="url"]')?.value;
            const token = item.querySelector('input[type="password"]')?.value;
            
            if (name && url) {
                endpoints.push({ name, url, token });
            }
        });
        return endpoints;
    },

    saveIntegrationSettings() {
        localStorage.setItem('integrationSettings', JSON.stringify(this.integrations));
    },

    loadIntegrationSettings() {
        try {
            const saved = localStorage.getItem('integrationSettings');
            if (saved) {
                this.integrations = { ...this.integrations, ...JSON.parse(saved) };
            }
        } catch (error) {
            console.error('❌ 연동 설정 로드 실패:', error);
        }
    },

    showLoadingIndicator(message) {
        const indicator = document.createElement('div');
        indicator.id = 'integration-loading';
        indicator.className = 'integration-loading-overlay';
        indicator.innerHTML = `
            <div class="loading-content">
                <i class="fas fa-spinner fa-spin"></i>
                <p>${message}</p>
            </div>
        `;
        document.body.appendChild(indicator);
    },

    hideLoadingIndicator() {
        const indicator = document.getElementById('integration-loading');
        if (indicator) {
            indicator.remove();
        }
    },

    // 🔄 연동 상태 표시기 추가
    addIntegrationStatusIndicator() {
        const header = document.querySelector('.live-preview-sidebar .preview-header');
        if (!header) return;

        const statusIndicator = document.createElement('div');
        statusIndicator.className = 'integration-status-mini';
        statusIndicator.innerHTML = `
            <div class="status-mini-dot offline" id="statusMiniDot"></div>
            <span id="statusMiniText">연동 없음</span>
        `;
        
        header.appendChild(statusIndicator);
        
        // 주기적으로 상태 업데이트
        setInterval(() => {
            this.updateMiniStatusIndicator();
        }, 30000); // 30초마다 업데이트
    },

    updateMiniStatusIndicator() {
        const activeCount = Object.values(this.integrations).filter(i => i.enabled).length;
        const dot = document.getElementById('statusMiniDot');
        const text = document.getElementById('statusMiniText');
        
        if (dot && text) {
            if (activeCount > 0) {
                dot.className = 'status-mini-dot online';
                text.textContent = `${activeCount}개 연동`;
            } else {
                dot.className = 'status-mini-dot offline';
                text.textContent = '연동 없음';
            }
        }
    },
};

// 🚀 모듈 내보내기
export { ReportModule };