/**
 * @file report.js
 * @description ?? CFC 梨꾩슜 ??쒕낫??- 由ы룷??諛쒗뻾 紐⑤뱢 (B) 湲곕뒫 媛쒖꽑 ?④퀎
 * @version 2.0 - B Stage Implementation
 * @date 2025-06-30
 */

export const ReportModule = {
    // ?뵩 珥덇린???곹깭
    _isInitialized: false,
    _chartInstance: null,
    _currentTemplate: 'executive-summary',
    _currentFormat: 'pdf',
    
    // ?렓 6媛??뺤옣 ?쒗뵆由??쒖뒪??
    templates: {
        'executive-summary': {
            name: '寃쎌쁺吏??붿빟',
            icon: 'fas fa-chart-pie',
            description: '?듭떖 KPI? ?몃젋??遺꾩꽍',
            sections: ['kpi', 'funnel', 'topSources', 'trends'],
            estimatedTime: '30珥?,
            difficulty: 'easy'
        },
        'detailed-analysis': {
            name: '?곸꽭 遺꾩꽍', 
            icon: 'fas fa-chart-bar',
            description: '源딆씠 ?덈뒗 ?곗씠??遺꾩꽍',
            sections: ['kpi', 'charts', 'demographics', 'efficiency'],
            estimatedTime: '45珥?,
            difficulty: 'medium'
        },
        'recruitment-funnel': {
            name: '梨꾩슜 ?쇰꼸',
            icon: 'fas fa-funnel-dollar', 
            description: '?④퀎蹂??꾪솚??吏묒쨷 遺꾩꽍',
            sections: ['funnel', 'bottleneck', 'optimization'],
            estimatedTime: '20珥?,
            difficulty: 'easy'
        },
        'monthly-report': {
            name: '?붽컙 由ы룷??,
            icon: 'fas fa-calendar-alt',
            description: '?붾퀎 ?깃낵 醫낇빀 遺꾩꽍', 
            sections: ['monthly-kpi', 'comparison', 'trends', 'goals'],
            estimatedTime: '1遺?,
            difficulty: 'hard'
        },
        'interviewer-performance': {
            name: '硫댁젒愿 ?깃낵',
            icon: 'fas fa-user-tie',
            description: '硫댁젒愿蹂??⑥쑉??遺꾩꽍',
            sections: ['interviewer-stats', 'comparison', 'recommendations'], 
            estimatedTime: '35珥?,
            difficulty: 'medium'
        },
        'cost-analysis': {
            name: '鍮꾩슜 ?⑥쑉??,
            icon: 'fas fa-dollar-sign',
            description: '梨꾩슜 鍮꾩슜 ?鍮??④낵 遺꾩꽍',
            sections: ['cost-breakdown', 'roi-analysis', 'optimization'],
            estimatedTime: '40珥?, 
            difficulty: 'medium'
        }
    },

    // ?봽 紐⑤뱢 珥덇린??
    init() {
        if (this._isInitialized) return;
        
        console.log('?? [ReportModule] B) 湲곕뒫 媛쒖꽑 ?④퀎 珥덇린???쒖옉...');
        
        try {
            // 1. ?쒗뵆由?媛ㅻ윭由??뚮뜑留?
            this.renderTemplateGallery();
            
            // 2. ?ㅼ떆媛?誘몃━蹂닿린 珥덇린??
            this.initLivePreview();
            
            // 3. ?대깽??由ъ뒪???ㅼ젙
            this.setupEventListeners();
            
            // 4. ?덉뒪?좊━ ?쒖뒪??珥덇린??
            this.initHistorySystem();
            
            // 5. 異쒕젰 ?뺤떇 ?ㅼ젙
            this.initFormatSelector();
            
            // 6. ?렓 而ㅼ뒪? ?쒗뵆由??몄쭛湲?珥덇린??
            this.initCustomTemplateEditor();
            
            // 7. ?쨼 AI 遺꾩꽍 ?쒖뒪??珥덇린??
            this.initAIAnalysisSystem();
            
            // 8. ?뱤 李⑦듃 ?명꽣?숈뀡 ?쒖뒪??珥덇린??
            this.initChartInteractionSystem();
            
            // 9. ?뵕 ?몃? ?곕룞 ?쒖뒪??珥덇린??
            this.initExternalIntegrationSystem();
            
            this._isInitialized = true;
            console.log('??[ReportModule] B+C 怨좉툒 湲곕뒫 ?꾩껜 珥덇린???꾨즺!');
            
        } catch (error) {
            console.error('??[ReportModule] 珥덇린???ㅽ뙣:', error);
        }
    },

    // ?렓 ?쒗뵆由?媛ㅻ윭由??숈쟻 ?뚮뜑留?
    renderTemplateGallery() {
        const gallery = document.querySelector('.template-gallery');
        if (!gallery) {
            console.error('???쒗뵆由?媛ㅻ윭由??붿냼瑜?李얠쓣 ???놁뒿?덈떎.');
            return;
        }

        // 濡쒕뵫 ?쒓굅
        gallery.innerHTML = '';
        
        // ?쒗뵆由?移대뱶???앹꽦
        Object.entries(this.templates).forEach(([key, template]) => {
            const card = document.createElement('div');
            card.className = 'template-card enhanced';
            card.dataset.template = key;
            
            // ?쒖씠?꾨퀎 ?됱긽
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
                        <span>${template.sections.length}媛??뱀뀡</span>
                    </div>
                    <div class="difficulty-badge" style="background: ${difficultyColors[template.difficulty]}">
                        ${template.difficulty === 'easy' ? '媛꾨떒' : template.difficulty === 'medium' ? '蹂댄넻' : '?곸꽭'}
                    </div>
                </div>
            `;
            
            // ?대┃ ?대깽??
            card.addEventListener('click', () => {
                this.selectTemplate(key);
            });
            
            gallery.appendChild(card);
        });

        // 湲곕낯 ?쒗뵆由??좏깮 
        this.selectTemplate('executive-summary');
        
        console.log('???쒗뵆由?媛ㅻ윭由??뚮뜑留??꾨즺 (6媛??쒗뵆由?');
    },

    // ?렞 ?쒗뵆由??좏깮 
    selectTemplate(templateKey) {
        // 湲곗〈 ?좏깮 ?댁젣
        document.querySelectorAll('.template-card').forEach(card => {
            card.classList.remove('selected');
        });
        
        // ???쒗뵆由??좏깮
        const selectedCard = document.querySelector(`[data-template="${templateKey}"]`);
        if (selectedCard) {
            selectedCard.classList.add('selected');
            this._currentTemplate = templateKey;
            
            // ?ㅼ떆媛?誘몃━蹂닿린 ?낅뜲?댄듃
            this.updateLivePreview();
            
            console.log(`?뱥 ?쒗뵆由??좏깮: ${this.templates[templateKey].name}`);
        }
    },
    // ?봽 ?ㅼ떆媛?誘몃━蹂닿린 ?쒖뒪??珥덇린??
    initLivePreview() {
        const sidebar = document.getElementById('livePreviewSidebar');
        if (!sidebar) {
            console.warn('?좑툘 ?ㅼ떆媛?誘몃━蹂닿린 ?ъ씠?쒕컮 ?붿냼媛 ?놁뒿?덈떎.');
            return;
        }

        // ?좉? 踰꾪듉 ?대깽??
        const toggleBtn = document.getElementById('previewToggle');
        if (toggleBtn) {
            toggleBtn.addEventListener('click', () => {
                this.togglePreviewSidebar();
            });
        }

        // 珥덇린 誘몃━蹂닿린 ?뚮뜑留?
        this.renderLivePreviewContent();
        this.updateLivePreview();
        
        console.log('???ㅼ떆媛?誘몃━蹂닿린 ?쒖뒪??珥덇린???꾨즺');
    },

    // ?렓 ?ㅼ떆媛?誘몃━蹂닿린 肄섑뀗痢??뚮뜑留? 
    renderLivePreviewContent() {
        const content = document.getElementById('livePreviewContent');
        if (!content) return;

        content.innerHTML = `
            <div class="preview-stats">
                <div class="stat-item">
                    <div class="stat-label">?좏깮???쒗뵆由?/div>
                    <div class="stat-value" id="previewTemplateName">寃쎌쁺吏??붿빟</div>
                </div>
                <div class="stat-item">
                    <div class="stat-label">?곗씠??踰붿쐞</div>
                    <div class="stat-value" id="previewDataRange">?꾩껜 湲곌컙</div>
                </div>
                <div class="stat-item">
                    <div class="stat-label">?덉긽 ?앹꽦 ?쒓컙</div>
                    <div class="stat-value" id="previewEstimatedTime">30珥?/div>
                </div>
            </div>

            <div class="summary-grid">
                <div class="summary-item">
                    <div class="summary-label">珥?吏?먯옄</div>
                    <div class="summary-value" id="previewTotalApplicants">-</div>
                </div>
                <div class="summary-item">
                    <div class="summary-label">?꾪솚??/div>
                    <div class="summary-value" id="previewConversionRate">-</div>
                </div>
                <div class="summary-item">
                    <div class="summary-label">二쇱슂 梨꾩슜 寃쎈줈</div>
                    <div class="summary-value" id="previewTopSource">-</div>
                </div>
            </div>

            <div class="preview-chart-container">
                <div class="chart-title">梨꾩슜 寃쎈줈 遺꾪룷</div>
                <div class="mini-chart-wrapper">
                    <canvas id="previewMiniChart" width="200" height="200"></canvas>
                </div>
            </div>

            <div class="preview-filters">
                <div class="filter-summary" id="previewFilterSummary">
                    ?꾪꽣: ?꾩껜 ?곗씠??
                </div>
            </div>
        `;
    },

    // ?뱤 ?ㅼ떆媛?誘몃━蹂닿린 ?낅뜲?댄듃
    updateLivePreview() {
        try {
            // ?꾩옱 ?좏깮???쒗뵆由??뺣낫 ?낅뜲?댄듃
            this.updatePreviewTemplateInfo();
            
            // ?듦퀎 ?낅뜲?댄듃
            this.updatePreviewStats();
            
            // 誘몃땲 李⑦듃 ?낅뜲?댄듃
            this.updatePreviewMiniChart();
            
            // ?꾪꽣 ?붿빟 ?낅뜲?댄듃
            this.updatePreviewFilters();
            
        } catch (error) {
            console.error('???ㅼ떆媛?誘몃━蹂닿린 ?낅뜲?댄듃 ?ㅽ뙣:', error);
        }
    },

    // ?뱥 ?쒗뵆由??뺣낫 ?낅뜲?댄듃
    updatePreviewTemplateInfo() {
        const template = this.templates[this._currentTemplate];
        if (!template) return;

        const nameEl = document.getElementById('previewTemplateName');
        const timeEl = document.getElementById('previewEstimatedTime');
        
        if (nameEl) nameEl.textContent = template.name;
        if (timeEl) timeEl.textContent = template.estimatedTime;
    },

    // ?뱢 ?듦퀎 ?낅뜲?댄듃
    updatePreviewStats() {
        // ?꾪꽣留곷맂 ?곗씠??媛?몄삤湲?
        const filteredData = this.getFilteredData();
        
        if (!filteredData || filteredData.length === 0) {
            this.setPreviewStatsEmpty();
            return;
        }

        // 湲곕낯 ?듦퀎 怨꾩궛
        const stats = this.calculateBasicStats(filteredData);
        
        // UI ?낅뜲?댄듃
        const totalEl = document.getElementById('previewTotalApplicants');
        const conversionEl = document.getElementById('previewConversionRate');
        const topSourceEl = document.getElementById('previewTopSource');
        
        if (totalEl) totalEl.textContent = stats.total.toLocaleString() + '紐?;
        if (conversionEl) conversionEl.textContent = stats.conversionRate + '%';
        if (topSourceEl) topSourceEl.textContent = stats.topSource;
    },

    // ?뵢 湲곕낯 ?듦퀎 怨꾩궛
    calculateBasicStats(data) {
        const total = data.length;
        
        // ?꾪솚??怨꾩궛 (?덉떆: 理쒖쥌 ?⑷꺽??/ ?꾩껜 吏?먯옄)
        const finalPassed = data.filter(item => {
            const status = item['理쒖쥌寃곌낵'] || item['吏꾪뻾?곹솴'] || '';
            return status.includes('?⑷꺽') || status.includes('?낃낵');
        }).length;
        
        const conversionRate = total > 0 ? Math.round((finalPassed / total) * 100) : 0;
        
        // 二쇱슂 梨꾩슜 寃쎈줈 怨꾩궛
        const sources = {};
        data.forEach(item => {
            const source = item['吏?먮（??] || '湲고?';
            sources[source] = (sources[source] || 0) + 1;
        });
        
        const topSource = Object.keys(sources).reduce((a, b) => 
            sources[a] > sources[b] ? a : b, '湲고?');
        
        return {
            total,
            conversionRate,
            topSource,
            sources
        };
    },

    // ?뱤 誘몃땲 李⑦듃 ?낅뜲?댄듃
    updatePreviewMiniChart() {
        const canvas = document.getElementById('previewMiniChart');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        
        // 湲곗〈 李⑦듃 ?쒓굅
        if (this._miniChartInstance) {
            this._miniChartInstance.destroy();
        }

        const filteredData = this.getFilteredData();
        if (!filteredData || filteredData.length === 0) {
            this.drawEmptyChart(ctx);
            return;
        }

        // 梨꾩슜 寃쎈줈蹂??곗씠??以鍮?
        const stats = this.calculateBasicStats(filteredData);
        const chartData = Object.entries(stats.sources).map(([label, value]) => ({
            label: label.length > 8 ? label.substring(0, 8) + '...' : label,
            value
        }));

        // Chart.js 誘몃땲 ?꾨꽋 李⑦듃
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

    // ?봽 ?ъ씠?쒕컮 ?좉?
    togglePreviewSidebar() {
        const sidebar = document.getElementById('livePreviewSidebar');
        const toggleBtn = document.getElementById('previewToggle');
        
        if (!sidebar || !toggleBtn) return;
        
        const isCollapsed = sidebar.classList.contains('collapsed');
        
        if (isCollapsed) {
            sidebar.classList.remove('collapsed');
            toggleBtn.innerHTML = '<i class="fas fa-chevron-left"></i>';
            this.updateLivePreview(); // ?ㅼ떆 ?쒖떆?????낅뜲?댄듃
        } else {
            sidebar.classList.add('collapsed');
            toggleBtn.innerHTML = '<i class="fas fa-chevron-right"></i>';
        }
        
        console.log('?봽 誘몃━蹂닿린 ?ъ씠?쒕컮 ?좉?:', isCollapsed ? '?쒖떆' : '?④?');
    },
    // ?뱤 Excel/PowerPoint 異쒕젰 ?쒖뒪??

    // ?뱞 異쒕젰 ?뺤떇 ?좏깮湲?珥덇린??
    initFormatSelector() {
        const formatOptions = document.querySelectorAll('.format-option');
        
        formatOptions.forEach(option => {
            option.addEventListener('click', () => {
                // 湲곗〈 ?좏깮 ?댁젣
                formatOptions.forEach(opt => opt.classList.remove('selected'));
                
                // ???좏깮 ?곸슜
                option.classList.add('selected');
                
                // ?뺤떇 ???
                const format = option.textContent.trim().toLowerCase();
                this._currentFormat = format;
                
                console.log(`?뱞 異쒕젰 ?뺤떇 ?좏깮: ${format}`);
            });
        });
    },

    // ?뱥 由ы룷???앹꽦 (?뺤떇蹂?遺꾧린)
    async generateReport() {
        const format = this._currentFormat;
        
        console.log(`?? 由ы룷???앹꽦 ?쒖옉 - ?뺤떇: ${format}, ?쒗뵆由? ${this._currentTemplate}`);
        
        // 吏꾪뻾瑜??쒖떆
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
                case '??由ы룷??:
                    await this.generateWebReport();
                    break;
                default:
                    await this.generatePDFReport();
            }
            
            // ?덉뒪?좊━?????
            this.saveToHistory();
            
            console.log('??由ы룷???앹꽦 ?꾨즺!');
            
        } catch (error) {
            console.error('??由ы룷???앹꽦 ?ㅽ뙣:', error);
            alert('由ы룷???앹꽦 以??ㅻ쪟媛 諛쒖깮?덉뒿?덈떎.');
        } finally {
            this.hideProgressIndicator();
        }
    },

    // ?뱤 Excel 由ы룷???앹꽦
    async generateExcelReport() {
        console.log('?뱤 Excel 由ы룷???앹꽦 ?쒖옉...');
        
        // SheetJS ?쇱씠釉뚮윭由??숈쟻 濡쒕뵫
        if (typeof XLSX === 'undefined') {
            await this.loadSheetJS();
        }
        
        const filteredData = this.getFilteredData();
        const stats = this.calculateBasicStats(filteredData);
        
        // ?뚰겕遺??앹꽦
        const wb = XLSX.utils.book_new();
        
        // 1. 吏?먯옄 ?곗씠???쒗듃
        const applicantSheet = XLSX.utils.json_to_sheet(filteredData);
        XLSX.utils.book_append_sheet(wb, applicantSheet, '吏?먯옄 ?곗씠??);
        
        // 2. ?듦퀎 ?붿빟 ?쒗듃
        const summaryData = [
            ['??ぉ', '媛?],
            ['珥?吏?먯옄 ??, stats.total],
            ['?꾪솚??, stats.conversionRate + '%'],
            ['二쇱슂 梨꾩슜 寃쎈줈', stats.topSource],
            ['由ы룷???앹꽦??, new Date().toLocaleString('ko-KR')],
            ['?쒗뵆由?, this.templates[this._currentTemplate].name]
        ];
        const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
        XLSX.utils.book_append_sheet(wb, summarySheet, '?듦퀎 ?붿빟');
        
        // 3. 梨꾩슜 寃쎈줈蹂?遺꾩꽍 ?쒗듃
        const sourceData = [['梨꾩슜 寃쎈줈', '吏?먯옄 ??, '鍮꾩쑉']];
        Object.entries(stats.sources).forEach(([source, count]) => {
            const percentage = Math.round((count / stats.total) * 100);
            sourceData.push([source, count, percentage + '%']);
        });
        const sourceSheet = XLSX.utils.aoa_to_sheet(sourceData);
        XLSX.utils.book_append_sheet(wb, sourceSheet, '梨꾩슜 寃쎈줈 遺꾩꽍');
        
        // ?뚯씪 ?ㅼ슫濡쒕뱶
        const fileName = `CFC_梨꾩슜由ы룷??${this.templates[this._currentTemplate].name}_${this.getCurrentDateString()}.xlsx`;
        XLSX.writeFile(wb, fileName);
        
        console.log('??Excel 由ы룷???ㅼ슫濡쒕뱶 ?꾨즺:', fileName);
    },

    // ?렓 PowerPoint 由ы룷???앹꽦  
    async generatePowerPointReport() {
        console.log('?렓 PowerPoint 由ы룷???앹꽦 ?쒖옉...');
        
        // HTML2Canvas濡?李⑦듃 罹≪쿂
        const chartElement = await this.generateTempChartForCapture();
        
        if (!chartElement) {
            throw new Error('李⑦듃 ?앹꽦 ?ㅽ뙣');
        }
        
        // 李⑦듃瑜??대?吏濡?蹂??
        const canvas = await html2canvas(chartElement, {
            backgroundColor: '#ffffff',
            scale: 2,
            width: 800,
            height: 600
        });
        
        // Canvas瑜?Blob?쇰줈 蹂??
        canvas.toBlob((blob) => {
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `CFC_梨꾩슜由ы룷??${this.templates[this._currentTemplate].name}_${this.getCurrentDateString()}.png`;
            link.click();
            
            // ?꾩떆 李⑦듃 ?붿냼 ?쒓굅
            if (chartElement.parentNode) {
                chartElement.parentNode.removeChild(chartElement);
            }
            
            console.log('??PowerPoint???대?吏 ?ㅼ슫濡쒕뱶 ?꾨즺');
        }, 'image/png');
    },

    // ?뵩 ?꾩떆 李⑦듃 ?앹꽦 (PowerPoint??
    async generateTempChartForCapture() {
        const filteredData = this.getFilteredData();
        const stats = this.calculateBasicStats(filteredData);
        
        // ?꾩떆 而⑦뀒?대꼫 ?앹꽦
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
                <h1 style="color: #1f2937; margin: 0 0 10px 0;">CFC 梨꾩슜 由ы룷??/h1>
                <h2 style="color: #6b7280; margin: 0; font-weight: normal;">${this.templates[this._currentTemplate].name}</h2>
            </div>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 20px; margin-bottom: 40px;">
                <div style="text-align: center; padding: 20px; background: #f8fafc; border-radius: 8px;">
                    <div style="font-size: 2rem; font-weight: bold; color: #3b82f6;">${stats.total}</div>
                    <div style="color: #6b7280;">珥?吏?먯옄</div>
                </div>
                <div style="text-align: center; padding: 20px; background: #f8fafc; border-radius: 8px;">
                    <div style="font-size: 2rem; font-weight: bold; color: #10b981;">${stats.conversionRate}%</div>
                    <div style="color: #6b7280;">?꾪솚??/div>
                </div>
                <div style="text-align: center; padding: 20px; background: #f8fafc; border-radius: 8px;">
                    <div style="font-size: 1.2rem; font-weight: bold; color: #f59e0b;">${stats.topSource}</div>
                    <div style="color: #6b7280;">二쇱슂 梨꾩슜 寃쎈줈</div>
                </div>
            </div>
            
            <div style="height: 300px; position: relative;">
                <canvas id="tempChart" width="720" height="300"></canvas>
            </div>
            
            <div style="text-align: center; margin-top: 20px; color: #9ca3af; font-size: 0.9rem;">
                ?앹꽦?? ${new Date().toLocaleString('ko-KR')}
            </div>
        `;
        
        document.body.appendChild(container);
        
        // 李⑦듃 ?앹꽦
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
        
        // ?뚮뜑留??꾨즺 ?湲?
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        return container;
    },

    // ?뱴 SheetJS ?숈쟻 濡쒕뵫
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
    // ?뮶 由ы룷???덉뒪?좊━ 愿由??쒖뒪??

    // ?뵩 ?덉뒪?좊━ ?쒖뒪??珥덇린??
    initHistorySystem() {
        this.loadHistoryFromStorage();
        this.renderHistoryTab();
        
        console.log('???덉뒪?좊━ ?쒖뒪??珥덇린???꾨즺');
    },

    // ?뮶 ?덉뒪?좊━ ???
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
        
        // 湲곗〈 ?덉뒪?좊━ 濡쒕뱶
        let history = JSON.parse(localStorage.getItem('reportHistory') || '[]');
        
        // ???꾩씠??異붽? (理쒖떊??
        history.unshift(historyItem);
        
        // 理쒕? 20媛쒕쭔 ?좎?
        history = history.slice(0, 20);
        
        // ???
        localStorage.setItem('reportHistory', JSON.stringify(history));
        
        // UI ?낅뜲?댄듃
        this.renderHistoryTab();
        
        console.log('?뮶 ?덉뒪?좊━ ????꾨즺:', historyItem);
    },

    // ?뱥 ?덉뒪?좊━ ???뚮뜑留?
    renderHistoryTab() {
        const historyTab = document.getElementById('history-tab');
        if (!historyTab) return;

        const history = JSON.parse(localStorage.getItem('reportHistory') || '[]');
        
        if (history.length === 0) {
            historyTab.innerHTML = `
                <div class="option-group">
                    <div class="option-title"><i class="fas fa-clock"></i> 理쒓렐 ?앹꽦??由ы룷??/div>
                    <div style="background: #f8fafc; padding: 20px; border-radius: 12px; text-align: center; color: #6b7280;">
                        <i class="fas fa-inbox" style="font-size: 2rem; margin-bottom: 10px; opacity: 0.5;"></i>
                        <p>?꾩쭅 ?앹꽦??由ы룷?멸? ?놁뒿?덈떎.</p>
                        <p style="font-size: 0.9rem; margin-top: 5px;">泥?踰덉㎏ 由ы룷?몃? ?앹꽦?대낫?몄슂!</p>
                    </div>
                </div>
            `;
            return;
        }

        // ?덉뒪?좊━ 紐⑸줉 HTML ?앹꽦
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
                                <span class="history-data-count">${item.dataCount}嫄?/span>
                                <span class="history-time">${timeAgo}</span>
                            </div>
                            <div class="history-filters">${filterSummary}</div>
                        </div>
                        <div class="history-actions">
                            <button class="btn-history-view" onclick="App.report.viewHistoryItem(${item.id})">
                                <i class="fas fa-eye"></i> ?ㅼ떆蹂닿린
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
                    <i class="fas fa-clock"></i> 理쒓렐 ?앹꽦??由ы룷??
                    <div class="history-stats">
                        <span>珥?${history.length}媛?/span>
                        <button class="btn-clear-history" onclick="App.report.clearAllHistory()">
                            <i class="fas fa-trash-alt"></i> ?꾩껜 ??젣
                        </button>
                    </div>
                </div>
                <div class="history-container">
                    ${historyHTML}
                </div>
            </div>
        `;
    },

    // ?? ?덉뒪?좊━ ?꾩씠???ㅼ떆蹂닿린
    viewHistoryItem(itemId) {
        const history = JSON.parse(localStorage.getItem('reportHistory') || '[]');
        const item = history.find(h => h.id === itemId);
        
        if (!item) {
            alert('?덉뒪?좊━ ?꾩씠?쒖쓣 李얠쓣 ???놁뒿?덈떎.');
            return;
        }

        // ?쒗뵆由??좏깮
        this.selectTemplate(item.template);
        
        // 異쒕젰 ?뺤떇 ?좏깮
        this._currentFormat = item.format;
        document.querySelectorAll('.format-option').forEach(opt => {
            opt.classList.remove('selected');
            if (opt.textContent.trim().toLowerCase() === item.format) {
                opt.classList.add('selected');
            }
        });
        
        // ?꾪꽣 蹂듭썝
        this.restoreFilters(item.filters);
        
        // 誘몃━蹂닿린 ?낅뜲?댄듃
        this.updateLivePreview();
        
        // ?쒗뵆由???쑝濡??대룞
        const templateTab = document.querySelector('[data-tab="template"]');
        if (templateTab) {
            templateTab.click();
        }
        
        console.log('?? ?덉뒪?좊━ ?꾩씠??蹂듭썝 ?꾨즺:', item);
    },

    // ?뿊截??덉뒪?좊━ ?꾩씠????젣
    deleteHistoryItem(itemId) {
        if (!confirm('??由ы룷?몃? ?덉뒪?좊━?먯꽌 ??젣?섏떆寃좎뒿?덇퉴?')) return;
        
        let history = JSON.parse(localStorage.getItem('reportHistory') || '[]');
        history = history.filter(item => item.id !== itemId);
        
        localStorage.setItem('reportHistory', JSON.stringify(history));
        this.renderHistoryTab();
        
        console.log('?뿊截??덉뒪?좊━ ?꾩씠????젣 ?꾨즺:', itemId);
    },

    // ?뿊截??꾩껜 ?덉뒪?좊━ ??젣
    clearAllHistory() {
        if (!confirm('紐⑤뱺 由ы룷???덉뒪?좊━瑜???젣?섏떆寃좎뒿?덇퉴?\n???묒뾽? ?섎룎由????놁뒿?덈떎.')) return;
        
        localStorage.removeItem('reportHistory');
        this.renderHistoryTab();
        
        console.log('?뿊截??꾩껜 ?덉뒪?좊━ ??젣 ?꾨즺');
    },

    // ?뱿 ?덉뒪?좊━?먯꽌 ?ㅼ슫濡쒕뱶
    downloadHistoryItem(itemId) {
        const history = JSON.parse(localStorage.getItem('reportHistory') || '[]');
        const item = history.find(h => h.id === itemId);
        
        if (!item) {
            alert('?덉뒪?좊━ ?꾩씠?쒖쓣 李얠쓣 ???놁뒿?덈떎.');
            return;
        }

        // ?ㅼ젙 蹂듭썝 ??由ы룷???앹꽦
        this.viewHistoryItem(itemId);
        
        // ?쎄컙??吏????由ы룷???앹꽦
        setTimeout(() => {
            this.generateReport();
        }, 500);
    },

    // ?봽 ?덉뒪?좊━ 濡쒕뱶
    loadHistoryFromStorage() {
        try {
            const history = JSON.parse(localStorage.getItem('reportHistory') || '[]');
            console.log(`?뱤 ?덉뒪?좊━ 濡쒕뱶 ?꾨즺: ${history.length}媛??꾩씠??);
            return history;
        } catch (error) {
            console.error('???덉뒪?좊━ 濡쒕뱶 ?ㅽ뙣:', error);
            return [];
        }
    },

    // ?뵩 ?꾪꽣 蹂듭썝
    restoreFilters(filters) {
        Object.entries(filters).forEach(([key, value]) => {
            const element = document.getElementById(key);
            if (element && value) {
                element.value = value;
            }
        });
    },

    // ???곷????쒓컙 怨꾩궛
    getTimeAgo(timestamp) {
        const now = new Date();
        const time = new Date(timestamp);
        const diffMs = now - time;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return '諛⑷툑 ??;
        if (diffMins < 60) return `${diffMins}遺???;
        if (diffHours < 24) return `${diffHours}?쒓컙 ??;
        if (diffDays < 7) return `${diffDays}????;
        
        return time.toLocaleDateString('ko-KR');
    },

    // ?뱥 ?꾪꽣 ?붿빟 ?앹꽦
    getFilterSummary(filters) {
        const activeFiters = Object.entries(filters)
            .filter(([key, value]) => value && value !== '?꾩껜' && value !== '')
            .map(([key, value]) => {
                const labels = {
                    'report-filter-period': '湲곌컙',
                    'report-filter-route': '吏?먮（??,
                    'report-filter-field': '紐⑥쭛遺꾩빞',
                    'report-filter-company': '?뚯궗紐?,
                    'report-filter-recruiter': '利앹썝??,
                    'report-filter-interviewer': '硫댁젒愿'
                };
                return `${labels[key] || key}: ${value}`;
            });
        
        return activeFiters.length > 0 ? activeFiters.join(', ') : '?꾩껜 ?곗씠??;
    },
    // ?렞 ?대깽??由ъ뒪???ㅼ젙
    setupEventListeners() {
        // 由ы룷???앹꽦 踰꾪듉
        const generateBtn = document.getElementById('generateReportBtn');
        if (generateBtn) {
            generateBtn.addEventListener('click', () => {
                this.generateReport();
            });
        }

        // ?꾪꽣 蹂寃??대깽??
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

        console.log('???대깽??由ъ뒪???ㅼ젙 ?꾨즺');
    },

    // ?뱤 PDF 由ы룷???앹꽦 (湲곗〈 湲곕뒫 ?좎?)
    async generatePDFReport() {
        console.log('?뱞 PDF 由ы룷???앹꽦 ?쒖옉...');
        
        const filteredData = this.getFilteredData();
        const template = this.templates[this._currentTemplate];
        
        // PDF 肄섑뀗痢??앹꽦
        const content = this.generateReportContent(filteredData, template);
        
        // 紐⑤떖濡?PDF 誘몃━蹂닿린 ?쒖떆
        this.showPDFModal(content);
    },

    // ?뙋 ??由ы룷???앹꽦
    async generateWebReport() {
        console.log('?뙋 ??由ы룷???앹꽦 ?쒖옉...');
        
        const filteredData = this.getFilteredData();
        const template = this.templates[this._currentTemplate];
        
        // ??由ы룷??肄섑뀗痢??앹꽦
        const content = this.generateReportContent(filteredData, template);
        
        // ??李쎌뿉????由ы룷???쒖떆
        const newWindow = window.open('', '_blank');
        newWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>CFC 梨꾩슜 由ы룷??- ${template.name}</title>
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

    // ?뱷 由ы룷??肄섑뀗痢??앹꽦
    generateReportContent(data, template) {
        const stats = this.calculateBasicStats(data);
        
        let content = `
            <div class="report-header">
                <h1>CFC 梨꾩슜 由ы룷??/h1>
                <h2>${template.name}</h2>
                <p>?앹꽦?? ${new Date().toLocaleString('ko-KR')}</p>
            </div>
            
            <div class="report-summary">
                <div class="kpi-grid">
                    <div class="kpi-item">
                        <div class="kpi-label">珥?吏?먯옄</div>
                        <div class="kpi-value">${stats.total.toLocaleString()}紐?/div>
                    </div>
                    <div class="kpi-item">
                        <div class="kpi-label">?꾪솚??/div>
                        <div class="kpi-value">${stats.conversionRate}%</div>
                    </div>
                    <div class="kpi-item">
                        <div class="kpi-label">二쇱슂 梨꾩슜 寃쎈줈</div>
                        <div class="kpi-value">${stats.topSource}</div>
                    </div>
                </div>
            </div>
        `;

        // ?쒗뵆由용퀎 異붽? ?뱀뀡
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

    // ?뵇 ?곗씠???ы띁 ?⑥닔??

    // ?뱤 ?꾪꽣留곷맂 ?곗씠??媛?몄삤湲?
    getFilteredData() {
        try {
            // ?꾩뿭 ???곹깭?먯꽌 ?곗씠??媛?몄삤湲?
            const allData = globalThis.App?.state?.data?.all || [];
            
            if (!allData || allData.length === 0) {
                console.warn('?좑툘 ?곗씠?곌? ?놁뒿?덈떎.');
                return [];
            }

            // ?꾩옱 ?꾪꽣 ?곸슜
            const filters = this.getCurrentFilters();
            
            return this.applyFilters(allData, filters);
            
        } catch (error) {
            console.error('???곗씠??媛?몄삤湲??ㅽ뙣:', error);
            return [];
        }
    },

    // ?뵩 ?꾩옱 ?꾪꽣 ?곹깭 媛?몄삤湲?
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
            if (element && element.value && element.value !== '?꾩껜') {
                filters[id] = element.value;
            }
        });
        
        // ?ъ슜??吏???좎쭨 踰붿쐞
        const startDate = document.getElementById('report-start-date');
        const endDate = document.getElementById('report-end-date');
        if (startDate && startDate.value) filters['report-start-date'] = startDate.value;
        if (endDate && endDate.value) filters['report-end-date'] = endDate.value;
        
        return filters;
    },

    // ?뵇 ?꾪꽣 ?곸슜
    applyFilters(data, filters) {
        return data.filter(item => {
            // 湲곌컙 ?꾪꽣
            if (filters['report-filter-period']) {
                const period = filters['report-filter-period'];
                if (!this.matchesPeriod(item, period)) return false;
            }
            
            // ?ъ슜??吏???좎쭨 踰붿쐞
            if (filters['report-start-date'] || filters['report-end-date']) {
                if (!this.matchesDateRange(item, filters['report-start-date'], filters['report-end-date'])) {
                    return false;
                }
            }
            
            // 湲고? ?꾪꽣??
            const filterMappings = {
                'report-filter-route': '吏?먮（??,
                'report-filter-field': '紐⑥쭛遺꾩빞',
                'report-filter-company': '?뚯궗紐?,
                'report-filter-recruiter': '利앹썝??,
                'report-filter-interviewer': '硫댁젒愿'
            };
            
            for (const [filterId, column] of Object.entries(filterMappings)) {
                if (filters[filterId] && item[column] !== filters[filterId]) {
                    return false;
                }
            }
            
            return true;
        });
    },

    // ?뱟 湲곌컙 留ㅼ묶
    matchesPeriod(item, period) {
        const itemDate = new Date(item['吏?먯씪??] || item['?깅줉??]);
        const now = new Date();
        
        switch (period) {
            case '?대쾲??:
                return itemDate.getMonth() === now.getMonth() && 
                       itemDate.getFullYear() === now.getFullYear();
            case '理쒓렐 30??:
                const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                return itemDate >= thirtyDaysAgo;
            case '理쒓렐 3媛쒖썡':
                const threeMonthsAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
                return itemDate >= threeMonthsAgo;
            case '?ы빐':
                return itemDate.getFullYear() === now.getFullYear();
            default:
                return true;
        }
    },

    // ?뱟 ?좎쭨 踰붿쐞 留ㅼ묶
    matchesDateRange(item, startDate, endDate) {
        const itemDate = new Date(item['吏?먯씪??] || item['?깅줉??]);
        
        if (startDate && itemDate < new Date(startDate)) return false;
        if (endDate && itemDate > new Date(endDate)) return false;
        
        return true;
    },

    // ?뵩 ?좏떥由ы떚 ?⑥닔??
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
        summaryEl.textContent = `?꾪꽣: ${summary}`;
    },

    drawEmptyChart(ctx) {
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        ctx.fillStyle = '#e5e7eb';
        ctx.font = '14px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('?곗씠???놁쓬', ctx.canvas.width / 2, ctx.canvas.height / 2);
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
        // 湲곗〈 PDF 紐⑤떖 ?쒖떆 濡쒖쭅 (湲곗〈 肄붾뱶 ?쒖슜)
        console.log('?뱞 PDF 紐⑤떖 ?쒖떆');
        // ?ㅼ젣 PDF 紐⑤떖 援ы쁽? 湲곗〈 肄붾뱶瑜?李몄“?섏뿬 援ы쁽
    },

    // ?뱤 ?뱀뀡蹂?肄섑뀗痢??앹꽦 ?⑥닔??
    generateFunnelSection(data) {
        return `
            <div class="report-section">
                <h3>梨꾩슜 ?쇰꼸 遺꾩꽍</h3>
                <p>?④퀎蹂??꾪솚??遺꾩꽍 寃곌낵?낅땲??</p>
            </div>
        `;
    },

    generateDemographicsSection(data) {
        return `
            <div class="report-section">
                <h3>?멸뎄?듦퀎?숈쟻 遺꾩꽍</h3>
                <p>吏?먯옄 ?뱀꽦 遺꾩꽍 寃곌낵?낅땲??</p>
            </div>
        `;
    },

    generateTrendsSection(data) {
        return `
            <div class="report-section">
                <h3>?몃젋??遺꾩꽍</h3>
                <p>?쒓컙蹂?吏?먯옄 異붿씠 遺꾩꽍 寃곌낵?낅땲??</p>
            </div>
        `;
    },
    // ?렓 C) 怨좉툒 湲곕뒫 - 而ㅼ뒪? ?쒗뵆由??몄쭛湲?

    // ?뵩 而ㅼ뒪? ?쒗뵆由??몄쭛湲?珥덇린??
    initCustomTemplateEditor() {
        console.log('?렓 而ㅼ뒪? ?쒗뵆由??몄쭛湲?珥덇린??..');
        
        this.customTemplate = {
            id: 'custom-' + Date.now(),
            name: '而ㅼ뒪? ?쒗뵆由?,
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
        
        console.log('??而ㅼ뒪? ?쒗뵆由??몄쭛湲?珥덇린???꾨즺');
    },

    // ?렓 而ㅼ뒪? ?몄쭛湲??뚮뜑留?
    renderCustomEditor() {
        const customTab = document.getElementById('custom-tab');
        if (!customTab) return;

        customTab.innerHTML = `
            <div class="custom-editor-container">
                <!-- ?쒗뵆由?湲곕낯 ?뺣낫 -->
                <div class="editor-section">
                    <div class="section-header">
                        <h3><i class="fas fa-info-circle"></i> ?쒗뵆由??뺣낫</h3>
                    </div>
                    <div class="template-info-form">
                        <div class="form-group">
                            <label>?쒗뵆由??대쫫</label>
                            <input type="text" id="custom-template-name" value="${this.customTemplate.name}" 
                                   placeholder="?섎쭔???쒗뵆由??대쫫???낅젰?섏꽭??>
                        </div>
                    </div>
                </div>

                <!-- ?뱀뀡 ?좏깮 諛??쒕옒洹????쒕∼ -->
                <div class="editor-section">
                    <div class="section-header">
                        <h3><i class="fas fa-puzzle-piece"></i> 由ы룷??援ъ꽦 ?붿냼</h3>
                        <button class="btn-preview-layout" id="previewLayoutBtn">
                            <i class="fas fa-eye"></i> ?덉씠?꾩썐 誘몃━蹂닿린
                        </button>
                    </div>
                    
                    <!-- ?ъ슜 媛?ν븳 ?뱀뀡??-->
                    <div class="available-sections">
                        <h4>?ъ슜 媛?ν븳 ?뱀뀡</h4>
                        <div class="section-pool" id="sectionPool">
                            ${this.renderAvailableSections()}
                        </div>
                    </div>
                    
                    <!-- ?쒕옒洹????쒕∼ ?덉씠?꾩썐 -->
                    <div class="layout-editor">
                        <h4>由ы룷???덉씠?꾩썐 (?쒕옒洹명븯??援ъ꽦)</h4>
                        <div class="layout-canvas" id="layoutCanvas">
                            ${this.renderLayoutCanvas()}
                        </div>
                    </div>
                </div>

                <!-- 李⑦듃 ????좏깮 -->
                <div class="editor-section">
                    <div class="section-header">
                        <h3><i class="fas fa-chart-bar"></i> 李⑦듃 ?ㅼ젙</h3>
                    </div>
                    <div class="chart-type-selector">
                        ${this.renderChartTypeSelector()}
                    </div>
                </div>

                <!-- ?됱긽 ?뚮쭏 而ㅼ뒪?곕쭏?댁쭠 -->
                <div class="editor-section">
                    <div class="section-header">
                        <h3><i class="fas fa-palette"></i> ?됱긽 ?뚮쭏</h3>
                    </div>
                    <div class="color-theme-editor">
                        ${this.renderColorThemeEditor()}
                    </div>
                </div>

                <!-- ?쒗뵆由????遺덈윭?ㅺ린 -->
                <div class="editor-section">
                    <div class="section-header">
                        <h3><i class="fas fa-save"></i> ?쒗뵆由?愿由?/h3>
                    </div>
                    <div class="template-management">
                        <div class="template-actions">
                            <button class="btn btn-primary" id="saveCustomTemplate">
                                <i class="fas fa-save"></i> ?쒗뵆由????
                            </button>
                            <button class="btn btn-secondary" id="loadCustomTemplate">
                                <i class="fas fa-folder-open"></i> ?쒗뵆由?遺덈윭?ㅺ린
                            </button>
                            <button class="btn btn-success" id="exportCustomTemplate">
                                <i class="fas fa-download"></i> ?쒗뵆由??대낫?닿린
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

    // ?뱷 ?ъ슜 媛?ν븳 ?뱀뀡???뚮뜑留?
    renderAvailableSections() {
        const sections = {
            'kpi': {
                name: '?듭떖 ?깃낵 吏??,
                icon: 'fas fa-tachometer-alt',
                description: '珥?吏?먯옄, ?꾪솚?? ?낃낵????
            },
            'charts': {
                name: '?쒓컖??李⑦듃',
                icon: 'fas fa-chart-pie',
                description: '吏?먮（?몃퀎, 紐⑥쭛遺꾩빞蹂?遺꾪룷??
            },
            'trends': {
                name: '?몃젋??遺꾩꽍',
                icon: 'fas fa-chart-line',
                description: '?쒓컙蹂?吏?먯옄 異붿씠 諛??⑦꽩'
            },
            'funnel': {
                name: '梨꾩슜 ?쇰꼸',
                icon: 'fas fa-funnel-dollar',
                description: '?④퀎蹂??꾪솚??遺꾩꽍'
            },
            'demographics': {
                name: '?멸뎄?듦퀎 遺꾩꽍',
                icon: 'fas fa-users',
                description: '?곕졊?, ?깅퀎, 吏??퀎 遺꾪룷'
            },
            'efficiency': {
                name: '?⑥쑉??遺꾩꽍',
                icon: 'fas fa-chart-bar',
                description: '梨꾩슜 寃쎈줈蹂??⑥쑉??鍮꾧탳'
            },
            'interviews': {
                name: '硫댁젒 ?꾪솴',
                icon: 'fas fa-user-tie',
                description: '硫댁젒 ?쇱젙 諛?寃곌낵 遺꾩꽍'
            },
            'cost-analysis': {
                name: '鍮꾩슜 遺꾩꽍',
                icon: 'fas fa-dollar-sign',
                description: '梨꾩슜 鍮꾩슜 ?鍮??④낵'
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
                    <button class="btn-add-section" title="?덉씠?꾩썐??異붽?">
                        <i class="fas fa-plus"></i>
                    </button>
                </div>
            </div>
        `).join('');
    },

    // ?렓 ?덉씠?꾩썐 罹붾쾭???뚮뜑留?
    renderLayoutCanvas() {
        const selectedSections = this.customTemplate.sections;
        const layoutCanvas = document.getElementById('layoutCanvas');
        
        if (!layoutCanvas) return;
        
        if (selectedSections.length === 0) {
            layoutCanvas.innerHTML = `
                <div class="empty-canvas">
                    <i class="fas fa-plus-circle"></i>
                    <p>?쇱そ?먯꽌 ?뱀뀡???쒕옒洹명븯???덉씠?꾩썐??援ъ꽦?섏꽭??/p>
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
                                <button class="btn-move-up" title="?꾨줈 ?대룞">
                                    <i class="fas fa-chevron-up"></i>
                                </button>
                                <button class="btn-move-down" title="?꾨옒濡??대룞">
                                    <i class="fas fa-chevron-down"></i>
                                </button>
                                <button class="btn-remove-section" title="?쒓굅">
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
        
        // ?대깽??由ъ뒪???ъ꽕??
        this.setupLayoutSectionEvents();
    },

    // ?뱤 李⑦듃 ????좏깮湲??뚮뜑留?
    renderChartTypeSelector() {
        const chartOptions = {
            'source-distribution': {
                name: '吏?먮（??遺꾪룷',
                types: ['doughnut', 'pie', 'bar', 'polar']
            },
            'trend-analysis': {
                name: '?몃젋??遺꾩꽍',
                types: ['line', 'area', 'bar']
            },
            'funnel-analysis': {
                name: '梨꾩슜 ?쇰꼸',
                types: ['bar', 'funnel', 'waterfall']
            },
            'demographics': {
                name: '?멸뎄?듦퀎',
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

    // ?렓 ?됱긽 ?뚮쭏 ?몄쭛湲??뚮뜑留?
    renderColorThemeEditor() {
        const presetThemes = {
            'modern': {
                name: '紐⑤뜕',
                colors: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4']
            },
            'classic': {
                name: '?대옒??,
                colors: ['#1f2937', '#374151', '#6b7280', '#9ca3af', '#d1d5db', '#e5e7eb']
            },
            'vibrant': {
                name: '?쒓린李?,
                colors: ['#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ef4444']
            },
            'nature': {
                name: '?먯뿰',
                colors: ['#059669', '#84cc16', '#eab308', '#f97316', '#dc2626', '#7c2d12']
            },
            'corporate': {
                name: '湲곗뾽',
                colors: ['#1e40af', '#1d4ed8', '#2563eb', '#3b82f6', '#60a5fa', '#93c5fd']
            }
        };

        return `
            <div class="theme-presets">
                <h4>誘몃━ ?ㅼ젙???뚮쭏</h4>
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
                <h4>?ъ슜???뺤쓽 ?됱긽</h4>
                <div class="color-picker-grid">
                    ${this.customTemplate.customColors.map((color, index) => `
                        <div class="color-picker-item">
                            <label>?됱긽 ${index + 1}</label>
                            <input type="color" value="${color}" data-color-index="${index}" 
                                   class="color-input">
                            <div class="color-preview" style="background-color: ${color}"></div>
                        </div>
                    `).join('')}
                </div>
                <button class="btn-add-color" id="addColorBtn">
                    <i class="fas fa-plus"></i> ?됱긽 異붽?
                </button>
            </div>
        `;
    },

    // ?뮶 ??λ맂 ?쒗뵆由용뱾 ?뚮뜑留?
    renderSavedTemplates() {
        const savedTemplatesContainer = document.getElementById('savedTemplates');
        if (!savedTemplatesContainer) return;
        
        const savedTemplates = this.getSavedCustomTemplates();
        
        if (savedTemplates.length === 0) {
            savedTemplatesContainer.innerHTML = `
                <div class="no-saved-templates">
                    <i class="fas fa-folder-open"></i>
                    <p>??λ맂 而ㅼ뒪? ?쒗뵆由우씠 ?놁뒿?덈떎.</p>
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
                                ${template.sections.length}媛??뱀뀡 ??${template.colorTheme} ?뚮쭏
                            </div>
                        </div>
                        <div class="template-actions">
                            <button class="btn-load-template" title="遺덈윭?ㅺ린" onclick="App.report.loadSavedTemplate('${template.id}')">
                                <i class="fas fa-folder-open"></i>
                            </button>
                            <button class="btn-duplicate-template" title="蹂듭궗" onclick="App.report.duplicateSavedTemplate('${template.id}')">
                                <i class="fas fa-copy"></i>
                            </button>
                            <button class="btn-delete-template" title="??젣" onclick="App.report.deleteSavedTemplate('${template.id}')">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    },
    // ?렞 而ㅼ뒪? ?몄쭛湲??대깽???ㅼ젙
    setupCustomEditorEvents() {
        // ?쒗뵆由??대쫫 蹂寃?
        const nameInput = document.getElementById('custom-template-name');
        if (nameInput) {
            nameInput.addEventListener('input', (e) => {
                this.customTemplate.name = e.target.value;
                this.updateCustomTemplatePreview();
            });
        }

        // ?뱀뀡 異붽? 踰꾪듉??
        document.querySelectorAll('.btn-add-section').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const sectionItem = e.target.closest('.section-item');
                const sectionType = sectionItem.dataset.section;
                this.addSectionToLayout(sectionType);
            });
        });

        // 李⑦듃 ????좏깮
        document.querySelectorAll('.chart-type-option').forEach(option => {
            option.addEventListener('click', (e) => {
                const chartKey = e.currentTarget.dataset.chart;
                const chartType = e.currentTarget.dataset.type;
                this.updateChartType(chartKey, chartType);
            });
        });

        // ?됱긽 ?뚮쭏 ?좏깮
        document.querySelectorAll('.theme-preset').forEach(preset => {
            preset.addEventListener('click', (e) => {
                const themeKey = e.currentTarget.dataset.theme;
                this.selectColorTheme(themeKey);
            });
        });

        // ?ъ슜???뺤쓽 ?됱긽 蹂寃?
        document.querySelectorAll('.color-input').forEach(input => {
            input.addEventListener('change', (e) => {
                const colorIndex = parseInt(e.target.dataset.colorIndex);
                this.updateCustomColor(colorIndex, e.target.value);
            });
        });

        // ?쒗뵆由?愿由?踰꾪듉??
        const saveBtn = document.getElementById('saveCustomTemplate');
        const loadBtn = document.getElementById('loadCustomTemplate');
        const exportBtn = document.getElementById('exportCustomTemplate');
        const previewBtn = document.getElementById('previewLayoutBtn');

        if (saveBtn) saveBtn.addEventListener('click', () => this.saveCustomTemplate());
        if (loadBtn) loadBtn.addEventListener('click', () => this.showLoadTemplateDialog());
        if (exportBtn) exportBtn.addEventListener('click', () => this.exportCustomTemplate());
        if (previewBtn) previewBtn.addEventListener('click', () => this.showLayoutPreview());

        // ?뚯씪 媛?몄삤湲?踰꾪듉 異붽?
        const importBtn = document.createElement('button');
        importBtn.className = 'btn btn-info';
        importBtn.innerHTML = '<i class="fas fa-upload"></i> ?쒗뵆由?媛?몄삤湲?;
        importBtn.addEventListener('click', () => this.importCustomTemplate());
        
        const actionButtons = document.querySelector('.template-actions');
        if (actionButtons) {
            actionButtons.appendChild(importBtn);
        }

        // 而ㅼ뒪? 由ы룷???앹꽦 踰꾪듉 異붽?
        const generateBtn = document.createElement('button');
        generateBtn.className = 'btn btn-success';
        generateBtn.innerHTML = '<i class="fas fa-magic"></i> 而ㅼ뒪? 由ы룷???앹꽦';
        generateBtn.addEventListener('click', () => this.generateCustomReport());
        
        if (actionButtons) {
            actionButtons.appendChild(generateBtn);
        }

        // ?쒕옒洹????쒕∼ ?ㅼ젙
        this.setupDragAndDrop();
        
        console.log('??而ㅼ뒪? ?몄쭛湲??대깽???ㅼ젙 ?꾨즺');
    },

    // ?봽 ?쒕옒洹????쒕∼ ?ㅼ젙
    setupDragAndDrop() {
        const sectionPool = document.getElementById('sectionPool');
        const layoutCanvas = document.getElementById('layoutCanvas');

        if (sectionPool) {
            // ?뱀뀡 ?꾩씠?쒕뱾???쒕옒洹??대깽??異붽?
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
            // ?덉씠?꾩썐 罹붾쾭?ㅼ뿉 ?쒕∼ ?대깽??異붽?
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

    // ???덉씠?꾩썐???뱀뀡 異붽?
    addSectionToLayout(sectionType) {
        if (!this.customTemplate.sections.includes(sectionType)) {
            this.customTemplate.sections.push(sectionType);
            this.renderLayoutCanvas();
            this.updateCustomTemplatePreview();
            
            console.log(`?뱷 ?뱀뀡 異붽?: ${sectionType}`);
        }
    },

    // ?뿊截??덉씠?꾩썐?먯꽌 ?뱀뀡 ?쒓굅
    removeSectionFromLayout(sectionType) {
        const index = this.customTemplate.sections.indexOf(sectionType);
        if (index > -1) {
            this.customTemplate.sections.splice(index, 1);
            this.renderLayoutCanvas();
            this.updateCustomTemplatePreview();
            
            console.log(`?뿊截??뱀뀡 ?쒓굅: ${sectionType}`);
        }
    },

    // ?봽 ?뱀뀡 ?쒖꽌 蹂寃?
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
        
        // 諛곗뿴?먯꽌 ?꾩튂 蹂寃?
        [sections[currentIndex], sections[newIndex]] = [sections[newIndex], sections[currentIndex]];
        
        this.renderLayoutCanvas();
        this.updateCustomTemplatePreview();
        
        console.log(`?봽 ?뱀뀡 ?대룞: ${sectionType} ${direction}`);
    },

    // ?렞 ?덉씠?꾩썐 ?뱀뀡 ?대깽???ㅼ젙
    setupLayoutSectionEvents() {
        // ?뱀뀡 ?쒓굅 踰꾪듉
        document.querySelectorAll('.btn-remove-section').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const section = e.target.closest('.layout-section');
                const sectionType = section.dataset.section;
                this.removeSectionFromLayout(sectionType);
            });
        });

        // ?뱀뀡 ?대룞 踰꾪듉
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

    // ?뱤 李⑦듃 ????낅뜲?댄듃
    updateChartType(chartKey, chartType) {
        this.customTemplate.chartTypes[chartKey] = chartType;
        
        // UI ?낅뜲?댄듃
        document.querySelectorAll(`.chart-type-option[data-chart="${chartKey}"]`).forEach(option => {
            option.classList.remove('selected');
        });
        document.querySelector(`.chart-type-option[data-chart="${chartKey}"][data-type="${chartType}"]`).classList.add('selected');
        
        this.updateCustomTemplatePreview();
        console.log(`?뱤 李⑦듃 ???蹂寃? ${chartKey} -> ${chartType}`);
    },

    // ?렓 ?됱긽 ?뚮쭏 ?좏깮
    selectColorTheme(themeKey) {
        this.customTemplate.colorTheme = themeKey;
        
        // 誘몃━ ?ㅼ젙???뚮쭏 ?됱긽?쇰줈 ?낅뜲?댄듃
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
        
        // UI ?낅뜲?댄듃
        document.querySelectorAll('.theme-preset').forEach(preset => {
            preset.classList.remove('selected');
        });
        document.querySelector(`.theme-preset[data-theme="${themeKey}"]`).classList.add('selected');
        
        // ?됱긽 ?낅젰 ?꾨뱶???낅뜲?댄듃
        this.updateColorInputs();
        this.updateCustomTemplatePreview();
        
        console.log(`?렓 ?됱긽 ?뚮쭏 蹂寃? ${themeKey}`);
    },

    // ?뙂 ?ъ슜???뺤쓽 ?됱긽 ?낅뜲?댄듃
    updateCustomColor(colorIndex, newColor) {
        if (colorIndex < this.customTemplate.customColors.length) {
            this.customTemplate.customColors[colorIndex] = newColor;
            
            // ?됱긽 誘몃━蹂닿린 ?낅뜲?댄듃
            const preview = document.querySelector(`.color-input[data-color-index="${colorIndex}"]`).nextElementSibling;
            if (preview) {
                preview.style.backgroundColor = newColor;
            }
            
            this.updateCustomTemplatePreview();
            console.log(`?뙂 ?ъ슜???뺤쓽 ?됱긽 蹂寃? ${colorIndex} -> ${newColor}`);
        }
    },

    // ?뮶 而ㅼ뒪? ?쒗뵆由????
    saveCustomTemplate() {
        if (!this.customTemplate.name.trim()) {
            alert('?쒗뵆由??대쫫???낅젰?댁＜?몄슂.');
            return;
        }

        const savedTemplates = this.getSavedCustomTemplates();
        
        // ???쒗뵆由?媛앹껜 ?앹꽦
        const templateToSave = {
            ...this.customTemplate,
            id: this.customTemplate.id || 'custom-' + Date.now(),
            createdAt: new Date().toISOString(),
            version: '1.0'
        };

        // 湲곗〈 ?쒗뵆由우씠 ?덉쑝硫??낅뜲?댄듃, ?놁쑝硫?異붽?
        const existingIndex = savedTemplates.findIndex(t => t.id === templateToSave.id);
        if (existingIndex > -1) {
            savedTemplates[existingIndex] = templateToSave;
        } else {
            savedTemplates.push(templateToSave);
        }

        // LocalStorage?????
        localStorage.setItem('customTemplates', JSON.stringify(savedTemplates));
        
        // UI ?낅뜲?댄듃
        this.renderSavedTemplates();
        
        alert(`?쒗뵆由?"${templateToSave.name}"????λ릺?덉뒿?덈떎.`);
        console.log('?뮶 而ㅼ뒪? ?쒗뵆由?????꾨즺:', templateToSave);
    },

    // ?뱛 ??λ맂 而ㅼ뒪? ?쒗뵆由용뱾 媛?몄삤湲?
    getSavedCustomTemplates() {
        try {
            return JSON.parse(localStorage.getItem('customTemplates') || '[]');
        } catch (error) {
            console.error('????λ맂 ?쒗뵆由?濡쒕뱶 ?ㅽ뙣:', error);
            return [];
        }
    },

    // ?뱥 ?덉씠?꾩썐 誘몃━蹂닿린 ?쒖떆
    showLayoutPreview() {
        const previewModal = document.createElement('div');
        previewModal.className = 'custom-preview-modal';
        previewModal.innerHTML = `
            <div class="preview-modal-content">
                <div class="preview-modal-header">
                    <h3>?덉씠?꾩썐 誘몃━蹂닿린: ${this.customTemplate.name}</h3>
                    <button class="btn-close-preview">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="preview-modal-body">
                    ${this.generateCustomTemplatePreview()}
                </div>
            </div>
        `;
        
        // 紐⑤떖 ?쒖떆
        document.body.appendChild(previewModal);
        
        // ?リ린 ?대깽??
        previewModal.querySelector('.btn-close-preview').addEventListener('click', () => {
            document.body.removeChild(previewModal);
        });
        
        previewModal.addEventListener('click', (e) => {
            if (e.target === previewModal) {
                document.body.removeChild(previewModal);
            }
        });
    },

    // ?뵩 ?ы띁 ?⑥닔??
    getSectionName(sectionType) {
        const sectionNames = {
            'kpi': '?듭떖 ?깃낵 吏??,
            'charts': '?쒓컖??李⑦듃',
            'trends': '?몃젋??遺꾩꽍',
            'funnel': '梨꾩슜 ?쇰꼸',
            'demographics': '?멸뎄?듦퀎 遺꾩꽍',
            'efficiency': '?⑥쑉??遺꾩꽍',
            'interviews': '硫댁젒 ?꾪솴',
            'cost-analysis': '鍮꾩슜 遺꾩꽍'
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
            'doughnut': '?꾨꽋',
            'pie': '?뚯씠',
            'bar': '留됰?',
            'line': '??,
            'area': '?곸뿭',
            'polar': '洹뱀쥖??,
            'funnel': '源붾븣湲?,
            'waterfall': '??룷',
            'radar': '?덉씠??
        };
        return names[chartType] || chartType;
    },

    renderSectionPreview(sectionType) {
        return `
            <div class="section-preview-content">
                <i class="fas fa-${this.getSectionIcon(sectionType)}"></i>
                <span>${this.getSectionName(sectionType)} ?뱀뀡</span>
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
        // ?ㅼ떆媛?誘몃━蹂닿린?먯꽌 而ㅼ뒪? ?쒗뵆由??뺣낫 ?낅뜲?댄듃
        this.updateLivePreview();
    },

    generateCustomTemplatePreview() {
        return `
            <div class="custom-template-preview">
                <h4>?쒗뵆由? ${this.customTemplate.name}</h4>
                <div class="preview-sections">
                    ${this.customTemplate.sections.map((section, index) => `
                        <div class="preview-section" style="order: ${index}">
                            <h5>${this.getSectionName(section)}</h5>
                            <div class="section-placeholder">
                                <i class="fas fa-${this.getSectionIcon(section)}"></i>
                                <span>?뱀뀡 ?댁슜???ш린???쒖떆?⑸땲??/span>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    },

    // ?뱾 ?쒗뵆由??대낫?닿린
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
        console.log('?뱾 而ㅼ뒪? ?쒗뵆由??대낫?닿린 ?꾨즺');
    },
    // ?뱛 ??λ맂 ?쒗뵆由?遺덈윭?ㅺ린
    loadSavedTemplate(templateId) {
        const savedTemplates = this.getSavedCustomTemplates();
        const template = savedTemplates.find(t => t.id === templateId);
        
        if (!template) {
            alert('?쒗뵆由우쓣 李얠쓣 ???놁뒿?덈떎.');
            return;
        }

        // ?꾩옱 而ㅼ뒪? ?쒗뵆由우뿉 蹂듭궗
        this.customTemplate = {
            ...template,
            id: 'custom-' + Date.now() // ?덈줈??ID ?앹꽦
        };

        // UI ?꾩껜 ?щ젋?붾쭅
        this.renderCustomEditor();
        this.updateCustomTemplatePreview();

        console.log('?뱛 ??λ맂 ?쒗뵆由?遺덈윭?ㅺ린 ?꾨즺:', template.name);
        alert(`?쒗뵆由?"${template.name}"??遺덈윭?붿뒿?덈떎.`);
    },

    // ?뱥 ??λ맂 ?쒗뵆由?蹂듭궗
    duplicateSavedTemplate(templateId) {
        const savedTemplates = this.getSavedCustomTemplates();
        const template = savedTemplates.find(t => t.id === templateId);
        
        if (!template) {
            alert('?쒗뵆由우쓣 李얠쓣 ???놁뒿?덈떎.');
            return;
        }

        // 蹂듭궗蹂??앹꽦
        const duplicatedTemplate = {
            ...template,
            id: 'custom-' + Date.now(),
            name: template.name + ' (蹂듭궗蹂?',
            createdAt: new Date().toISOString()
        };

        // ??λ맂 ?쒗뵆由?紐⑸줉??異붽?
        savedTemplates.push(duplicatedTemplate);
        localStorage.setItem('customTemplates', JSON.stringify(savedTemplates));

        // UI ?낅뜲?댄듃
        this.renderSavedTemplates();

        console.log('?뱥 ?쒗뵆由?蹂듭궗 ?꾨즺:', duplicatedTemplate.name);
        alert(`?쒗뵆由?"${duplicatedTemplate.name}"???앹꽦?섏뿀?듬땲??`);
    },

    // ?뿊截???λ맂 ?쒗뵆由???젣
    deleteSavedTemplate(templateId) {
        const savedTemplates = this.getSavedCustomTemplates();
        const template = savedTemplates.find(t => t.id === templateId);
        
        if (!template) {
            alert('?쒗뵆由우쓣 李얠쓣 ???놁뒿?덈떎.');
            return;
        }

        if (!confirm(`?쒗뵆由?"${template.name}"????젣?섏떆寃좎뒿?덇퉴?`)) {
            return;
        }

        // ?쒗뵆由?紐⑸줉?먯꽌 ?쒓굅
        const updatedTemplates = savedTemplates.filter(t => t.id !== templateId);
        localStorage.setItem('customTemplates', JSON.stringify(updatedTemplates));

        // UI ?낅뜲?댄듃
        this.renderSavedTemplates();

        console.log('?뿊截??쒗뵆由???젣 ?꾨즺:', template.name);
        alert(`?쒗뵆由?"${template.name}"????젣?섏뿀?듬땲??`);
    },

    // ?뱛 ?쒗뵆由?遺덈윭?ㅺ린 ?ㅼ씠?쇰줈洹??쒖떆
    showLoadTemplateDialog() {
        const savedTemplates = this.getSavedCustomTemplates();
        
        if (savedTemplates.length === 0) {
            alert('??λ맂 ?쒗뵆由우씠 ?놁뒿?덈떎.');
            return;
        }

        // ?쒗뵆由??좏깮 ?ㅼ씠?쇰줈洹??앹꽦
        const dialog = document.createElement('div');
        dialog.className = 'template-load-dialog';
        dialog.innerHTML = `
            <div class="dialog-content">
                <div class="dialog-header">
                    <h3>?쒗뵆由?遺덈윭?ㅺ린</h3>
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
                                        ${template.sections.length}媛??뱀뀡 ??${template.colorTheme} ?뚮쭏
                                    </div>
                                    <div class="template-date">
                                        ?앹꽦?? ${new Date(template.createdAt).toLocaleDateString('ko-KR')}
                                    </div>
                                </div>
                                <button class="btn-select-template">?좏깮</button>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(dialog);

        // ?대깽??由ъ뒪???ㅼ젙
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

    // ?뱿 ?쒗뵆由??뚯씪 媛?몄삤湲?(JSON ?뚯씪)
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
                    
                    // ?쒗뵆由??곗씠??寃利?
                    if (!this.validateTemplateData(templateData)) {
                        alert('?щ컮瑜댁? ?딆? ?쒗뵆由??뚯씪?낅땲??');
                        return;
                    }

                    // ?덈줈??ID濡?媛?몄삤湲?
                    templateData.id = 'custom-' + Date.now();
                    templateData.createdAt = new Date().toISOString();

                    // ?꾩옱 ?쒗뵆由우쑝濡??ㅼ젙
                    this.customTemplate = templateData;

                    // UI ?낅뜲?댄듃
                    this.renderCustomEditor();
                    this.updateCustomTemplatePreview();

                    alert(`?쒗뵆由?"${templateData.name}"??媛?몄솕?듬땲??`);
                    console.log('?뱿 ?쒗뵆由?媛?몄삤湲??꾨즺:', templateData);

                } catch (error) {
                    console.error('???쒗뵆由?媛?몄삤湲??ㅽ뙣:', error);
                    alert('?쒗뵆由??뚯씪???쎈뒗 以??ㅻ쪟媛 諛쒖깮?덉뒿?덈떎.');
                }
            };
            
            reader.readAsText(file);
        });

        input.click();
    },

    // ???쒗뵆由??곗씠??寃利?
    validateTemplateData(templateData) {
        const requiredFields = ['name', 'sections', 'chartTypes', 'colorTheme', 'customColors'];
        
        for (const field of requiredFields) {
            if (!(field in templateData)) {
                return false;
            }
        }

        // 諛곗뿴 ???寃利?
        if (!Array.isArray(templateData.sections) || !Array.isArray(templateData.customColors)) {
            return false;
        }

        // 媛앹껜 ???寃利?
        if (typeof templateData.chartTypes !== 'object' || templateData.chartTypes === null) {
            return false;
        }

        return true;
    },

    // ?봽 而ㅼ뒪? ?먮뵒???덈줈怨좎묠
    refreshCustomEditor() {
        if (document.getElementById('custom-tab').innerHTML.includes('custom-editor-container')) {
            this.renderCustomEditor();
            console.log('?봽 而ㅼ뒪? ?먮뵒???덈줈怨좎묠 ?꾨즺');
        }
    },

    // ?렞 而ㅼ뒪? ?쒗뵆由우쑝濡?由ы룷???앹꽦
    generateCustomReport() {
        // ?꾩옱 而ㅼ뒪? ?쒗뵆由우쓣 ?꾩떆 ?쒗뵆由우쑝濡??깅줉
        const tempTemplateKey = 'custom-temp';
        const originalTemplates = { ...this.templates };
        
        // ?꾩떆 ?쒗뵆由?異붽?
        this.templates[tempTemplateKey] = {
            name: this.customTemplate.name,
            icon: 'fas fa-magic',
            description: '?ъ슜???뺤쓽 ?쒗뵆由?,
            sections: this.customTemplate.sections,
            estimatedTime: this.calculateEstimatedTime(this.customTemplate.sections),
            difficulty: this.calculateDifficulty(this.customTemplate.sections),
            isCustom: true,
            customConfig: this.customTemplate
        };

        // ?꾩떆 ?쒗뵆由??좏깮
        this._currentTemplate = tempTemplateKey;

        try {
            // 由ы룷???앹꽦
            this.generateReport();
            
            console.log('?렞 而ㅼ뒪? ?쒗뵆由우쑝濡?由ы룷???앹꽦:', this.customTemplate.name);
        } finally {
            // ?꾩떆 ?쒗뵆由??쒓굅 諛??먮낯 蹂듭썝
            this.templates = originalTemplates;
        }
    },

    // ?깍툘 ?덉긽 ?쒓컙 怨꾩궛
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

        if (totalSeconds < 30) return '30珥?誘몃쭔';
        if (totalSeconds < 60) return `${totalSeconds}珥?;
        return `${Math.ceil(totalSeconds / 60)}遺?;
    },

    // ?뱤 ?쒖씠??怨꾩궛
    calculateDifficulty(sections) {
        const complexSections = ['trends', 'demographics', 'efficiency', 'cost-analysis'];
        const complexCount = sections.filter(s => complexSections.includes(s)).length;
        
        if (complexCount === 0) return 'easy';
        if (complexCount <= 2) return 'medium';
        return 'hard';
    },
    // ?쨼 C) 怨좉툒 湲곕뒫 - AI 遺꾩꽍 ?쒖뒪??

    // ?뵩 AI 遺꾩꽍 ?쒖뒪??珥덇린??
    initAIAnalysisSystem() {
        console.log('?쨼 AI 遺꾩꽍 ?쒖뒪??珥덇린??..');
        
        this.aiAnalysis = {
            insights: [],
            recommendations: [],
            predictions: {},
            anomalies: [],
            lastAnalyzedAt: null
        };
        
        this.renderAIAnalysisTab();
        this.setupAIAnalysisEvents();
        
        console.log('??AI 遺꾩꽍 ?쒖뒪??珥덇린???꾨즺');
    },

    // ?렓 AI 遺꾩꽍 ???뚮뜑留?
    renderAIAnalysisTab() {
        const aiTab = document.getElementById('ai-tab');
        if (!aiTab) return;

        aiTab.innerHTML = `
            <div class="ai-analysis-container">
                <!-- AI 遺꾩꽍 ?ㅻ뜑 -->
                <div class="ai-header">
                    <div class="ai-title">
                        <i class="fas fa-robot"></i>
                        <h3>AI 遺꾩꽍 ?붿쭊</h3>
                    </div>
                    <div class="ai-controls">
                        <button class="btn btn-primary" id="runAIAnalysis">
                            <i class="fas fa-play"></i> 遺꾩꽍 ?ㅽ뻾
                        </button>
                        <button class="btn btn-secondary" id="exportAIInsights">
                            <i class="fas fa-download"></i> ?몄궗?댄듃 ?대낫?닿린
                        </button>
                    </div>
                </div>

                <!-- 遺꾩꽍 ?좏깮 ?⑤꼸 -->
                <div class="analysis-selection">
                    <h4><i class="fas fa-cogs"></i> 遺꾩꽍 ?좏삎 ?좏깮</h4>
                    <div class="analysis-types">
                        <div class="analysis-type-card" data-type="insights">
                            <div class="card-icon">
                                <i class="fas fa-lightbulb"></i>
                            </div>
                            <div class="card-content">
                                <h5>?먮룞 ?몄궗?댄듃</h5>
                                <p>?곗씠???⑦꽩??遺꾩꽍?섏뿬 ?듭떖 ?몄궗?댄듃瑜??먮룞 ?앹꽦?⑸땲??/p>
                                <div class="card-features">
                                    <span>??梨꾩슜 ?⑥쑉??遺꾩꽍</span>
                                    <span>???깃낵 ?⑦꽩 諛쒓껄</span>
                                    <span>??理쒖쟻???ъ씤???쒖븞</span>
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
                                <h5>異붿쿇 ?쒖뒪??/h5>
                                <p>理쒖쟻??梨꾩슜 ?꾨왂怨?媛쒖꽑 諛⑹븞???쒖븞?⑸땲??/p>
                                <div class="card-features">
                                    <span>??理쒖쟻 梨꾩슜 寃쎈줈 異붿쿇</span>
                                    <span>??硫댁젒愿 諛곗젙 理쒖쟻??/span>
                                    <span>???꾨왂??媛쒖꽑???쒖떆</span>
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
                                <h5>?덉륫 遺꾩꽍</h5>
                                <p>怨쇨굅 ?곗씠?곕? 湲곕컲?쇰줈 誘몃옒 ?몃젋?쒕? ?덉륫?⑸땲??/p>
                                <div class="card-features">
                                    <span>??吏?먯옄 ???덉륫</span>
                                    <span>??怨꾩젅???⑦꽩 遺꾩꽍</span>
                                    <span>???깃낵 ?덉륫 紐⑤뜽留?/span>
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
                                <h5>?댁긽 ?⑦꽩 媛먯?</h5>
                                <p>鍮꾩젙?곸쟻???⑦꽩?대굹 湲됯꺽??蹂?붾? 媛먯??⑸땲??/p>
                                <div class="card-features">
                                    <span>??湲됯꺽??利앷컧 ?뚮┝</span>
                                    <span>???댁긽 ?됰룞 ?⑦꽩 ?먯?</span>
                                    <span>???꾪뿕 ?붿냼 ?앸퀎</span>
                                </div>
                            </div>
                            <div class="card-toggle">
                                <input type="checkbox" id="enable-anomalies" checked>
                                <label for="enable-anomalies"></label>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- 遺꾩꽍 寃곌낵 ?곸뿭 -->
                <div class="analysis-results" id="aiAnalysisResults">
                    ${this.renderAnalysisPlaceholder()}
                </div>

                <!-- 遺꾩꽍 ?덉뒪?좊━ -->
                <div class="analysis-history">
                    <h4><i class="fas fa-history"></i> 遺꾩꽍 ?덉뒪?좊━</h4>
                    <div class="history-list" id="aiAnalysisHistory">
                        ${this.renderAnalysisHistory()}
                    </div>
                </div>
            </div>
        `;
    },

    // ?봽 遺꾩꽍 寃곌낵 ?뚮젅?댁뒪???
    renderAnalysisPlaceholder() {
        return `
            <div class="analysis-placeholder">
                <div class="placeholder-icon">
                    <i class="fas fa-robot"></i>
                </div>
                <h4>AI 遺꾩꽍 以鍮??꾨즺</h4>
                <p>?꾩쓽 "遺꾩꽍 ?ㅽ뻾" 踰꾪듉???대┃?섏뿬 ?곗씠?곕? 遺꾩꽍?섍퀬 ?몄궗?댄듃瑜??앹꽦?섏꽭??</p>
                <div class="placeholder-features">
                    <div class="feature-item">
                        <i class="fas fa-check-circle"></i>
                        <span>?먮룞 ?⑦꽩 ?몄떇</span>
                    </div>
                    <div class="feature-item">
                        <i class="fas fa-check-circle"></i>
                        <span>留욎땄??異붿쿇?ы빆</span>
                    </div>
                    <div class="feature-item">
                        <i class="fas fa-check-circle"></i>
                        <span>?덉륫 遺꾩꽍</span>
                    </div>
                </div>
            </div>
        `;
    },

    // ?렞 AI 遺꾩꽍 ?대깽???ㅼ젙
    setupAIAnalysisEvents() {
        // 遺꾩꽍 ?ㅽ뻾 踰꾪듉
        const runBtn = document.getElementById('runAIAnalysis');
        if (runBtn) {
            runBtn.addEventListener('click', () => {
                this.runAIAnalysis();
            });
        }

        // ?몄궗?댄듃 ?대낫?닿린 踰꾪듉
        const exportBtn = document.getElementById('exportAIInsights');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => {
                this.exportAIInsights();
            });
        }

        // 遺꾩꽍 ???移대뱶 ?대┃ ?대깽??
        document.querySelectorAll('.analysis-type-card').forEach(card => {
            card.addEventListener('click', () => {
                const checkbox = card.querySelector('input[type="checkbox"]');
                checkbox.checked = !checkbox.checked;
                card.classList.toggle('disabled', !checkbox.checked);
            });
        });

        console.log('??AI 遺꾩꽍 ?대깽???ㅼ젙 ?꾨즺');
    },

    // ?? AI 遺꾩꽍 ?ㅽ뻾
    async runAIAnalysis() {
        const runBtn = document.getElementById('runAIAnalysis');
        if (runBtn) {
            runBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 遺꾩꽍 以?..';
            runBtn.disabled = true;
        }

        try {
            console.log('?쨼 AI 遺꾩꽍 ?쒖옉...');
            
            // ?꾪꽣留곷맂 ?곗씠??媛?몄삤湲?
            const data = this.getFilteredData();
            
            if (!data || data.length === 0) {
                throw new Error('遺꾩꽍???곗씠?곌? ?놁뒿?덈떎.');
            }

            // 遺꾩꽍 吏꾪뻾 ?곹솴 ?쒖떆
            this.showAnalysisProgress();

            // 媛?遺꾩꽍 ??낅퀎濡??ㅽ뻾
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

            // 寃곌낵 ???諛??쒖떆
            this.aiAnalysis = {
                ...analysisResults,
                lastAnalyzedAt: new Date().toISOString(),
                dataCount: data.length
            };

            this.renderAnalysisResults(analysisResults);
            this.saveAnalysisToHistory(analysisResults);

            console.log('??AI 遺꾩꽍 ?꾨즺:', analysisResults);

        } catch (error) {
            console.error('??AI 遺꾩꽍 ?ㅽ뙣:', error);
            this.showAnalysisError(error.message);
        } finally {
            if (runBtn) {
                runBtn.innerHTML = '<i class="fas fa-play"></i> 遺꾩꽍 ?ㅽ뻾';
                runBtn.disabled = false;
            }
        }
    },

    // ?뵇 ?먮룞 ?몄궗?댄듃 ?앹꽦
    async generateInsights(data) {
        console.log('?뵇 ?몄궗?댄듃 ?앹꽦 以?..');
        
        const insights = [];
        const stats = this.calculateBasicStats(data);

        // 1. 梨꾩슜 ?⑥쑉??遺꾩꽍
        const sourceAnalysis = this.analyzeSourceEfficiency(data);
        if (sourceAnalysis.bestSource) {
            insights.push({
                type: 'efficiency',
                title: `媛???⑥쑉?곸씤 梨꾩슜 寃쎈줈: ${sourceAnalysis.bestSource.name}`,
                description: `${sourceAnalysis.bestSource.name}???듯븳 吏?먯옄?ㅼ쓽 理쒖쥌 ?⑷꺽瑜좎씠 ${sourceAnalysis.bestSource.successRate}%濡?媛???믪뒿?덈떎.`,
                priority: 'high',
                actionable: true,
                recommendation: `${sourceAnalysis.bestSource.name} 梨꾨꼸????留롮? 由ъ냼?ㅻ? ?ъ옄?섎뒗 寃껋쓣 怨좊젮?대낫?몄슂.`
            });
        }

        // 2. ?쒓컙?蹂??⑦꽩 遺꾩꽍
        const timePattern = this.analyzeTimePatterns(data);
        if (timePattern.peakMonth) {
            insights.push({
                type: 'pattern',
                title: `理쒕? 吏???쒓린: ${timePattern.peakMonth}`,
                description: `${timePattern.peakMonth}???꾩껜 吏?먯옄??${timePattern.peakPercentage}%媛 吏묒쨷?섏뼱 ?덉뒿?덈떎.`,
                priority: 'medium',
                actionable: true,
                recommendation: '?쇳겕 ?쒖쫵??留욎떠 梨꾩슜 ?꾨줈?몄뒪? ?몃젰 諛곗튂瑜??ъ쟾??以鍮꾪븯?몄슂.'
            });
        }

        // 3. ?꾪솚??遺꾩꽍
        if (stats.conversionRate < 20) {
            insights.push({
                type: 'performance',
                title: '?꾪솚??媛쒖꽑 ?꾩슂',
                description: `?꾩옱 ?꾪솚??${stats.conversionRate}%???낃퀎 ?됯퇏??25-30% ?鍮???? ?섏??낅땲??`,
                priority: 'high',
                actionable: true,
                recommendation: '硫댁젒 ?꾨줈?몄뒪 媛쒖꽑?대굹 梨꾩슜 湲곗? ?ш??좊? ?듯빐 ?꾪솚?⑥쓣 ?믪뿬蹂댁꽭??'
            });
        }

        // 4. 硫댁젒愿 ?깃낵 遺꾩꽍
        const interviewerAnalysis = this.analyzeInterviewerPerformance(data);
        if (interviewerAnalysis.topPerformer) {
            insights.push({
                type: 'performance',
                title: `?곗닔 硫댁젒愿: ${interviewerAnalysis.topPerformer.name}`,
                description: `${interviewerAnalysis.topPerformer.name} 硫댁젒愿???⑷꺽瑜좎씠 ${interviewerAnalysis.topPerformer.successRate}%濡?媛???믪뒿?덈떎.`,
                priority: 'medium',
                actionable: true,
                recommendation: '?곗닔 硫댁젒愿??硫댁젒 諛⑹떇???ㅻⅨ 硫댁젒愿?ㅺ낵 怨듭쑀?섏뿬 ?꾩껜?곸씤 硫댁젒 ?덉쭏???μ긽?쒗궎?몄슂.'
            });
        }

        return insights;
    },

    // ?뱤 異붿쿇 ?쒖뒪??
    async generateRecommendations(data) {
        console.log('?뱤 異붿쿇?ы빆 ?앹꽦 以?..');
        
        const recommendations = [];

        // 1. 梨꾩슜 寃쎈줈 理쒖쟻??異붿쿇
        const sourceOptimization = this.recommendSourceOptimization(data);
        recommendations.push(...sourceOptimization);

        // 2. 硫댁젒 ?꾨줈?몄뒪 媛쒖꽑 異붿쿇
        const processOptimization = this.recommendProcessOptimization(data);
        recommendations.push(...processOptimization);

        // 3. ?쒓린蹂??꾨왂 異붿쿇
        const timingStrategy = this.recommendTimingStrategy(data);
        recommendations.push(...timingStrategy);

        return recommendations;
    },

    // ?뵰 ?덉륫 遺꾩꽍
    async generatePredictions(data) {
        console.log('?뵰 ?덉륫 遺꾩꽍 以?..');
        
        const predictions = {};

        // 1. ?ㅼ쓬 ??吏?먯옄 ???덉륫
        predictions.nextMonthApplicants = this.predictNextMonthApplicants(data);

        // 2. 怨꾩젅???⑦꽩 ?덉륫
        predictions.seasonalPattern = this.predictSeasonalPatterns(data);

        // 3. ?깃낵 ?덉륫
        predictions.performanceForecast = this.predictPerformanceTrends(data);

        return predictions;
    },

    // ?좑툘 ?댁긽 ?⑦꽩 媛먯?
    async detectAnomalies(data) {
        console.log('?좑툘 ?댁긽 ?⑦꽩 媛먯? 以?..');
        
        const anomalies = [];

        // 1. 湲됯꺽??吏?먯옄 ??蹂??媛먯?
        const volumeAnomalies = this.detectVolumeAnomalies(data);
        anomalies.push(...volumeAnomalies);

        // 2. ?꾪솚??湲됰? 媛먯?
        const conversionAnomalies = this.detectConversionAnomalies(data);
        anomalies.push(...conversionAnomalies);

        // 3. ?뱀젙 寃쎈줈??鍮꾩젙?곸쟻 ?⑦꽩 媛먯?
        const sourceAnomalies = this.detectSourceAnomalies(data);
        anomalies.push(...sourceAnomalies);

        return anomalies;
    },
    // ?뵇 梨꾩슜 寃쎈줈 ?⑥쑉??遺꾩꽍
    analyzeSourceEfficiency(data) {
        const sourceStats = {};
        
        data.forEach(item => {
            const source = item['吏?먮（??] || '湲고?';
            const isFinalPass = item['理쒖쥌寃곌낵']?.includes('?⑷꺽') || item['吏꾪뻾?곹솴']?.includes('?낃낵');
            
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
            if (stats.total >= 5) { // 理쒖냼 5紐??댁긽???섑뵆
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

    // ?뱟 ?쒓컙 ?⑦꽩 遺꾩꽍
    analyzeTimePatterns(data) {
        const monthStats = {};
        
        data.forEach(item => {
            const dateStr = item['吏?먯씪??] || item['?깅줉??];
            if (dateStr) {
                const date = new Date(dateStr);
                const month = date.getMonth() + 1;
                const monthName = `${month}??;
                
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

    // ?뫅?랅윊?硫댁젒愿 ?깃낵 遺꾩꽍
    analyzeInterviewerPerformance(data) {
        const interviewerStats = {};
        
        data.forEach(item => {
            const interviewer = item['硫댁젒愿'] || '誘몄???;
            const isFinalPass = item['理쒖쥌寃곌낵']?.includes('?⑷꺽') || item['吏꾪뻾?곹솴']?.includes('?낃낵');
            
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
            if (stats.total >= 3 && interviewer !== '誘몄???) {
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

    // ?렞 梨꾩슜 寃쎈줈 理쒖쟻??異붿쿇
    recommendSourceOptimization(data) {
        const recommendations = [];
        const { sourceStats } = this.analyzeSourceEfficiency(data);
        
        // ?깃낵媛 ??? 梨꾩슜 寃쎈줈 ?앸퀎
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
                category: '梨꾩슜 寃쎈줈',
                title: `${worstSource.source} 梨꾨꼸 媛쒖꽑 ?꾩슂`,
                description: `${worstSource.source}???깃났瑜좎씠 ${worstSource.successRate}%濡???뒿?덈떎.`,
                priority: 'high',
                impact: 'medium',
                effort: 'low',
                actions: [
                    '梨꾩슜 怨듦퀬 ?댁슜 媛쒖꽑',
                    '?寃?吏?먯옄痢??ъ젙??,
                    '?ㅽ겕由щ떇 ?꾨줈?몄뒪 媛뺥솕'
                ]
            });
        }

        return recommendations;
    },

    // ?숋툘 ?꾨줈?몄뒪 理쒖쟻??異붿쿇
    recommendProcessOptimization(data) {
        const recommendations = [];
        const stats = this.calculateBasicStats(data);
        
        // ?꾩껜 ?꾪솚?⑥씠 ??? 寃쎌슦
        if (stats.conversionRate < 20) {
            recommendations.push({
                type: 'process',
                category: '硫댁젒 ?꾨줈?몄뒪',
                title: '硫댁젒 ?꾨줈?몄뒪 理쒖쟻??,
                description: `?꾩옱 ?꾪솚??${stats.conversionRate}%瑜?媛쒖꽑???꾩슂?⑸땲??`,
                priority: 'high',
                impact: 'high',
                effort: 'medium',
                actions: [
                    '硫댁젒 吏덈Ц ?쒖???,
                    '?됯? 湲곗? 紐낇솗??,
                    '硫댁젒愿 援먯쑁 媛뺥솕',
                    '?쇰뱶諛??꾨줈?몄뒪 媛쒖꽑'
                ]
            });
        }

        return recommendations;
    },

    // ?뱟 ?쒓린蹂??꾨왂 異붿쿇
    recommendTimingStrategy(data) {
        const recommendations = [];
        const { peakMonth, monthStats } = this.analyzeTimePatterns(data);
        
        if (peakMonth && monthStats) {
            const sortedMonths = Object.entries(monthStats)
                .sort((a, b) => b[1] - a[1]);
            
            recommendations.push({
                type: 'strategy',
                category: '?쒓린蹂??꾨왂',
                title: `${peakMonth} ?쇳겕 ?쒖쫵 ?鍮?媛뺥솕`,
                description: `${peakMonth}??吏?먯옄媛 吏묒쨷?섎?濡??ъ쟾 以鍮꾧? ?꾩슂?⑸땲??`,
                priority: 'medium',
                impact: 'medium',
                effort: 'low',
                actions: [
                    '?쇳겕 ?쒖쫵 ??硫댁젒愿 異붽? 諛곗젙',
                    '梨꾩슜 ?꾨줈?몄뒪 媛꾩냼??寃??,
                    '?먮룞???꾧뎄 ?쒖슜 利앸?'
                ]
            });
        }

        return recommendations;
    },

    // ?뱢 ?ㅼ쓬 ??吏?먯옄 ???덉륫
    predictNextMonthApplicants(data) {
        const monthlyData = this.getMonthlyData(data);
        
        if (monthlyData.length < 3) {
            return {
                prediction: null,
                confidence: 'low',
                message: '?덉륫???꾪븳 異⑸텇???곗씠?곌? ?놁뒿?덈떎.'
            };
        }

        // ?⑥닚 ?대룞?됯퇏 ?덉륫 (理쒓렐 3媛쒖썡)
        const recent3Months = monthlyData.slice(-3);
        const average = recent3Months.reduce((sum, count) => sum + count, 0) / 3;
        
        // ?몃젋??遺꾩꽍
        const trend = this.calculateTrend(recent3Months);
        const prediction = Math.round(average + trend);

        return {
            prediction: Math.max(0, prediction),
            confidence: recent3Months.length >= 3 ? 'medium' : 'low',
            trend: trend > 0 ? 'increasing' : trend < 0 ? 'decreasing' : 'stable',
            historicalAverage: Math.round(average)
        };
    },

    // ?뙇 怨꾩젅???⑦꽩 ?덉륫
    predictSeasonalPatterns(data) {
        const { monthStats } = this.analyzeTimePatterns(data);
        
        // 怨꾩젅蹂?洹몃９??
        const seasons = {
            '遊?(3-5??': [3, 4, 5],
            '?щ쫫 (6-8??': [6, 7, 8],
            '媛??(9-11??': [9, 10, 11],
            '寃⑥슱 (12-2??': [12, 1, 2]
        };

        const seasonalPattern = {};
        
        Object.entries(seasons).forEach(([seasonName, months]) => {
            const seasonTotal = months.reduce((sum, month) => {
                const monthKey = `${month}??;
                return sum + (monthStats[monthKey] || 0);
            }, 0);
            seasonalPattern[seasonName] = seasonTotal;
        });

        // 媛???쒕컻??怨꾩젅 李얘린
        const mostActiveSeasonEntry = Object.entries(seasonalPattern)
            .sort((a, b) => b[1] - a[1])[0];

        return {
            pattern: seasonalPattern,
            mostActiveSeason: mostActiveSeasonEntry ? mostActiveSeasonEntry[0] : null,
            recommendation: `${mostActiveSeasonEntry?.[0] || '?뱀젙 怨꾩젅'}??梨꾩슜 ?쒕룞??吏묒쨷?섎뒗 寃껋씠 ?④낵?곸엯?덈떎.`
        };
    },

    // ?뱤 ?깃낵 ?덉륫
    predictPerformanceTrends(data) {
        const monthlyStats = this.getMonthlyPerformanceData(data);
        
        if (monthlyStats.length < 2) {
            return {
                trend: 'insufficient_data',
                message: '?몃젋??遺꾩꽍???꾪븳 異⑸텇???곗씠?곌? ?놁뒿?덈떎.'
            };
        }

        const recentTrend = this.calculatePerformanceTrend(monthlyStats);
        
        return {
            trend: recentTrend > 5 ? 'improving' : recentTrend < -5 ? 'declining' : 'stable',
            trendValue: recentTrend,
            prediction: `?ν썑 ?깃낵媛 ${recentTrend > 0 ? '媛쒖꽑' : recentTrend < 0 ? '?낇솕' : '?좎?'}??寃껋쑝濡??덉긽?⑸땲??`
        };
    },

    // ?좑툘 蹂쇰ⅷ ?댁긽 媛먯?
    detectVolumeAnomalies(data) {
        const anomalies = [];
        const monthlyData = this.getMonthlyData(data);
        
        if (monthlyData.length < 3) return anomalies;

        const average = monthlyData.reduce((sum, count) => sum + count, 0) / monthlyData.length;
        const threshold = average * 0.5; // ?됯퇏??50% ?댄븯硫??댁긽

        const recentMonth = monthlyData[monthlyData.length - 1];
        
        if (recentMonth < threshold) {
            anomalies.push({
                type: 'volume_drop',
                severity: 'high',
                title: '吏?먯옄 ??湲됯컧 媛먯?',
                description: `理쒓렐 吏?먯옄 ?섍? ?됯퇏 ?鍮?${Math.round((1 - recentMonth/average) * 100)}% 媛먯냼?덉뒿?덈떎.`,
                recommendation: '梨꾩슜 怨듦퀬 ?뺤궛?대굹 留덉???媛뺥솕瑜?怨좊젮?대낫?몄슂.'
            });
        }

        return anomalies;
    },

    // ?뱣 ?꾪솚???댁긽 媛먯?
    detectConversionAnomalies(data) {
        const anomalies = [];
        const recentData = data.slice(-50); // 理쒓렐 50紐??곗씠??
        
        if (recentData.length < 20) return anomalies;

        const recentStats = this.calculateBasicStats(recentData);
        const totalStats = this.calculateBasicStats(data);
        
        const conversionDrop = totalStats.conversionRate - recentStats.conversionRate;
        
        if (conversionDrop > 10) {
            anomalies.push({
                type: 'conversion_drop',
                severity: 'medium',
                title: '理쒓렐 ?꾪솚???섎씫 媛먯?',
                description: `理쒓렐 ?꾪솚?⑥씠 ?꾩껜 ?됯퇏 ?鍮?${Math.round(conversionDrop)}%p ?섎씫?덉뒿?덈떎.`,
                recommendation: '硫댁젒 ?꾨줈?몄뒪???됯? 湲곗????ш??좏빐蹂댁꽭??'
            });
        }

        return anomalies;
    },

    // ?뵇 ?뱀젙 寃쎈줈 ?댁긽 媛먯?
    detectSourceAnomalies(data) {
        const anomalies = [];
        const { sourceStats } = this.analyzeSourceEfficiency(data);
        
        Object.entries(sourceStats).forEach(([source, stats]) => {
            if (stats.total >= 10 && stats.success === 0) {
                anomalies.push({
                    type: 'source_failure',
                    severity: 'high',
                    title: `${source} 梨꾨꼸 ?깃낵 ?댁긽`,
                    description: `${source}???듯븳 吏?먯옄 ${stats.total}紐?以??⑷꺽?먭? 0紐낆엯?덈떎.`,
                    recommendation: `${source} 梨꾨꼸???寃잜똿?대굹 ?ㅽ겕由щ떇 ?꾨줈?몄뒪瑜??먭??대낫?몄슂.`
                });
            }
        });

        return anomalies;
    },

    // ?뵩 ?ы띁 ?⑥닔??
    getMonthlyData(data) {
        const monthCounts = {};
        
        data.forEach(item => {
            const dateStr = item['吏?먯씪??] || item['?깅줉??];
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
            const dateStr = item['吏?먯씪??] || item['?깅줉??];
            if (dateStr) {
                const date = new Date(dateStr);
                const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
                
                if (!monthlyPerf[monthKey]) {
                    monthlyPerf[monthKey] = { total: 0, success: 0 };
                }
                
                monthlyPerf[monthKey].total++;
                if (item['理쒖쥌寃곌낵']?.includes('?⑷꺽') || item['吏꾪뻾?곹솴']?.includes('?낃낵')) {
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
    // ?뱤 遺꾩꽍 寃곌낵 ?뚮뜑留?
    renderAnalysisResults(results) {
        const resultsContainer = document.getElementById('aiAnalysisResults');
        if (!resultsContainer) return;

        resultsContainer.innerHTML = `
            <div class="analysis-results-content">
                <div class="results-header">
                    <h4><i class="fas fa-chart-line"></i> 遺꾩꽍 寃곌낵</h4>
                    <div class="results-meta">
                        <span>遺꾩꽍 ?꾨즺: ${new Date().toLocaleString('ko-KR')}</span>
                        <span>?곗씠?? ${this.aiAnalysis.dataCount}嫄?/span>
                    </div>
                </div>

                ${this.renderInsightsSection(results.insights)}
                ${this.renderRecommendationsSection(results.recommendations)}
                ${this.renderPredictionsSection(results.predictions)}
                ${this.renderAnomaliesSection(results.anomalies)}
            </div>
        `;
    },

    // ?뮕 ?몄궗?댄듃 ?뱀뀡 ?뚮뜑留?
    renderInsightsSection(insights) {
        if (!insights || insights.length === 0) {
            return `
                <div class="results-section">
                    <h5><i class="fas fa-lightbulb"></i> ?먮룞 ?몄궗?댄듃</h5>
                    <div class="no-results">諛쒓껄???밸퀎???⑦꽩???놁뒿?덈떎.</div>
                </div>
            `;
        }

        return `
            <div class="results-section">
                <h5><i class="fas fa-lightbulb"></i> ?먮룞 ?몄궗?댄듃 (${insights.length}媛?</h5>
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

    // ?렞 異붿쿇?ы빆 ?뱀뀡 ?뚮뜑留?
    renderRecommendationsSection(recommendations) {
        if (!recommendations || recommendations.length === 0) {
            return `
                <div class="results-section">
                    <h5><i class="fas fa-bullseye"></i> 異붿쿇?ы빆</h5>
                    <div class="no-results">?꾩옱 ?곹솴?먯꽌???밸퀎??媛쒖꽑 異붿쿇?ы빆???놁뒿?덈떎.</div>
                </div>
            `;
        }

        return `
            <div class="results-section">
                <h5><i class="fas fa-bullseye"></i> 異붿쿇?ы빆 (${recommendations.length}媛?</h5>
                <div class="recommendations-list">
                    ${recommendations.map(rec => `
                        <div class="recommendation-card">
                            <div class="rec-header">
                                <div class="rec-category">${rec.category}</div>
                                <div class="rec-metrics">
                                    <span class="metric impact-${rec.impact}">?곹뼢?? ${this.getMetricText(rec.impact)}</span>
                                    <span class="metric effort-${rec.effort}">?몃젰?? ${this.getMetricText(rec.effort)}</span>
                                </div>
                            </div>
                            <h6>${rec.title}</h6>
                            <p>${rec.description}</p>
                            <div class="rec-actions">
                                <h6>?ㅽ뻾 諛⑹븞:</h6>
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

    // ?뵰 ?덉륫 ?뱀뀡 ?뚮뜑留?
    renderPredictionsSection(predictions) {
        if (!predictions || Object.keys(predictions).length === 0) {
            return `
                <div class="results-section">
                    <h5><i class="fas fa-crystal-ball"></i> ?덉륫 遺꾩꽍</h5>
                    <div class="no-results">?덉륫???꾪븳 異⑸텇???곗씠?곌? ?놁뒿?덈떎.</div>
                </div>
            `;
        }

        return `
            <div class="results-section">
                <h5><i class="fas fa-crystal-ball"></i> ?덉륫 遺꾩꽍</h5>
                <div class="predictions-grid">
                    ${predictions.nextMonthApplicants ? `
                        <div class="prediction-card">
                            <div class="pred-icon">
                                <i class="fas fa-users"></i>
                            </div>
                            <div class="pred-content">
                                <h6>?ㅼ쓬 ???덉긽 吏?먯옄</h6>
                                <div class="pred-value">${predictions.nextMonthApplicants.prediction || 'N/A'}紐?/div>
                                <div class="pred-confidence confidence-${predictions.nextMonthApplicants.confidence}">
                                    ?좊ː?? ${this.getConfidenceText(predictions.nextMonthApplicants.confidence)}
                                </div>
                                ${predictions.nextMonthApplicants.trend ? `
                                    <div class="pred-trend trend-${predictions.nextMonthApplicants.trend}">
                                        ?몃젋?? ${this.getTrendText(predictions.nextMonthApplicants.trend)}
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
                                <h6>怨꾩젅???⑦꽩</h6>
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
                                <h6>?깃낵 ?꾨쭩</h6>
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

    // ?좑툘 ?댁긽 ?⑦꽩 ?뱀뀡 ?뚮뜑留?
    renderAnomaliesSection(anomalies) {
        if (!anomalies || anomalies.length === 0) {
            return `
                <div class="results-section">
                    <h5><i class="fas fa-shield-alt"></i> ?댁긽 ?⑦꽩 媛먯?</h5>
                    <div class="no-results success">媛먯????댁긽 ?⑦꽩???놁뒿?덈떎. ?덉젙?곸씤 ?곹깭?낅땲??</div>
                </div>
            `;
        }

        return `
            <div class="results-section">
                <h5><i class="fas fa-exclamation-triangle"></i> ?댁긽 ?⑦꽩 媛먯? (${anomalies.length}媛?</h5>
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

    // ?뱢 遺꾩꽍 吏꾪뻾 ?곹솴 ?쒖떆
    showAnalysisProgress() {
        const resultsContainer = document.getElementById('aiAnalysisResults');
        if (!resultsContainer) return;

        resultsContainer.innerHTML = `
            <div class="analysis-progress">
                <div class="progress-header">
                    <h4><i class="fas fa-cog fa-spin"></i> AI 遺꾩꽍 吏꾪뻾 以?..</h4>
                </div>
                <div class="progress-steps">
                    <div class="progress-step active">
                        <i class="fas fa-database"></i>
                        <span>?곗씠???섏쭛</span>
                    </div>
                    <div class="progress-step active">
                        <i class="fas fa-search"></i>
                        <span>?⑦꽩 遺꾩꽍</span>
                    </div>
                    <div class="progress-step active">
                        <i class="fas fa-lightbulb"></i>
                        <span>?몄궗?댄듃 ?앹꽦</span>
                    </div>
                    <div class="progress-step active">
                        <i class="fas fa-chart-line"></i>
                        <span>?덉륫 紐⑤뜽留?/span>
                    </div>
                </div>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: 100%; animation: progress-animation 3s ease-in-out;"></div>
                </div>
            </div>
        `;
    },

    // ??遺꾩꽍 ?ㅻ쪟 ?쒖떆
    showAnalysisError(errorMessage) {
        const resultsContainer = document.getElementById('aiAnalysisResults');
        if (!resultsContainer) return;

        resultsContainer.innerHTML = `
            <div class="analysis-error">
                <div class="error-icon">
                    <i class="fas fa-exclamation-circle"></i>
                </div>
                <h4>遺꾩꽍 以??ㅻ쪟媛 諛쒖깮?덉뒿?덈떎</h4>
                <p>${errorMessage}</p>
                <button class="btn btn-primary" onclick="App.report.runAIAnalysis()">
                    <i class="fas fa-redo"></i> ?ㅼ떆 ?쒕룄
                </button>
            </div>
        `;
    },

    // ?뮶 遺꾩꽍 ?덉뒪?좊━ ???
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
        
        // 理쒕? 10媛쒕쭔 ?좎?
        if (history.length > 10) {
            history.splice(10);
        }
        
        localStorage.setItem('aiAnalysisHistory', JSON.stringify(history));
        this.renderAnalysisHistory();
    },

    // ?뱶 遺꾩꽍 ?덉뒪?좊━ ?뚮뜑留?
    renderAnalysisHistory() {
        const historyContainer = document.getElementById('aiAnalysisHistory');
        if (!historyContainer) return '';

        const history = JSON.parse(localStorage.getItem('aiAnalysisHistory') || '[]');
        
        if (history.length === 0) {
            historyContainer.innerHTML = `
                <div class="no-history">
                    <i class="fas fa-history"></i>
                    <p>?꾩쭅 遺꾩꽍 ?덉뒪?좊━媛 ?놁뒿?덈떎.</p>
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
                                ${item.dataCount}嫄??곗씠????
                                ${item.results.insights?.length || 0}媛??몄궗?댄듃 ??
                                ${item.results.recommendations?.length || 0}媛?異붿쿇?ы빆
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

    // ?? ?덉뒪?좊━ ?꾩씠??蹂닿린
    viewAnalysisHistory(historyId) {
        const history = JSON.parse(localStorage.getItem('aiAnalysisHistory') || '[]');
        const item = history.find(h => h.id === historyId);
        
        if (!item) {
            alert('?덉뒪?좊━ ?꾩씠?쒖쓣 李얠쓣 ???놁뒿?덈떎.');
            return;
        }

        // 怨쇨굅 遺꾩꽍 寃곌낵 ?쒖떆
        this.aiAnalysis = {
            ...item.results,
            lastAnalyzedAt: item.timestamp,
            dataCount: item.dataCount
        };

        this.renderAnalysisResults(item.results);
        console.log('?? 怨쇨굅 遺꾩꽍 寃곌낵 蹂닿린:', item);
    },

    // ?뿊截??덉뒪?좊━ ?꾩씠????젣
    deleteAnalysisHistory(historyId) {
        if (!confirm('??遺꾩꽍 ?덉뒪?좊━瑜???젣?섏떆寃좎뒿?덇퉴?')) return;
        
        let history = JSON.parse(localStorage.getItem('aiAnalysisHistory') || '[]');
        history = history.filter(item => item.id !== historyId);
        
        localStorage.setItem('aiAnalysisHistory', JSON.stringify(history));
        this.renderAnalysisHistory();
        
        console.log('?뿊截?遺꾩꽍 ?덉뒪?좊━ ??젣 ?꾨즺:', historyId);
    },

    // ?뱾 AI ?몄궗?댄듃 ?대낫?닿린
    exportAIInsights() {
        if (!this.aiAnalysis.insights && !this.aiAnalysis.recommendations) {
            alert('?대낫??遺꾩꽍 寃곌낵媛 ?놁뒿?덈떎. 癒쇱? 遺꾩꽍???ㅽ뻾?댁＜?몄슂.');
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
        link.download = `CFC_AI_?몄궗?댄듃_${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        
        URL.revokeObjectURL(url);
        console.log('?뱾 AI ?몄궗?댄듃 ?대낫?닿린 ?꾨즺');
    },

    // ?뵩 ?ы띁 ?⑥닔??
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
            'high': '?믪쓬',
            'medium': '蹂댄넻',
            'low': '??쓬'
        };
        return texts[priority] || priority;
    },

    getMetricText(level) {
        const texts = {
            'high': '?믪쓬',
            'medium': '蹂댄넻',
            'low': '??쓬'
        };
        return texts[level] || level;
    },

    getConfidenceText(confidence) {
        const texts = {
            'high': '?믪쓬',
            'medium': '蹂댄넻',
            'low': '??쓬'
        };
        return texts[confidence] || confidence;
    },

    getTrendText(trend) {
        const texts = {
            'increasing': '利앷?',
            'decreasing': '媛먯냼',
            'stable': '?덉젙',
            'improving': '媛쒖꽑',
            'declining': '?낇솕',
            'insufficient_data': '?곗씠??遺議?
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
            'high': '?믪쓬',
            'medium': '蹂댄넻',
            'low': '??쓬'
        };
        return texts[severity] || severity;
    },
    // ?뱤 C) 怨좉툒 湲곕뒫 - 李⑦듃 ?명꽣?숈뀡 媛뺥솕

    // ?뵩 李⑦듃 ?명꽣?숈뀡 ?쒖뒪??珥덇린??
    initChartInteractionSystem() {
        console.log('?뱤 李⑦듃 ?명꽣?숈뀡 ?쒖뒪??珥덇린??..');
        
        this.chartInteractions = {
            drillDownHistory: [],
            annotations: [],
            highlights: {},
            activeFilters: {},
            animationEnabled: true
        };
        
        this.setupAdvancedChartFeatures();
        
        console.log('??李⑦듃 ?명꽣?숈뀡 ?쒖뒪??珥덇린???꾨즺');
    },

    // ?렞 怨좉툒 李⑦듃 湲곕뒫 ?ㅼ젙
    setupAdvancedChartFeatures() {
        // 湲곗〈 李⑦듃 ?몄뒪?댁뒪?ㅼ뿉 ?명꽣?숈뀡 異붽?
        this.enhanceExistingCharts();
        
        // ?덈줈??李⑦듃 ?앹꽦 ???먮룞?쇰줈 ?명꽣?숈뀡 異붽?
        this.interceptChartCreation();
    },

    // ?뱢 湲곗〈 李⑦듃???μ긽
    enhanceExistingCharts() {
        // ?ㅼ떆媛?誘몃━蹂닿린 誘몃땲 李⑦듃 ?μ긽
        if (this._miniChartInstance) {
            this.addChartInteractions(this._miniChartInstance, 'mini-chart');
        }
        
        // ?섏씠吏 ???ㅻⅨ 李⑦듃??李얠븘???μ긽
        this.findAndEnhanceCharts();
    },

    // ?뵇 ?섏씠吏 ??李⑦듃 李얘린 諛??μ긽
    findAndEnhanceCharts() {
        const canvasElements = document.querySelectorAll('canvas');
        
        canvasElements.forEach(canvas => {
            // Chart.js ?몄뒪?댁뒪媛 ?덈뒗 罹붾쾭???뺤씤
            if (Chart.getChart(canvas)) {
                const chartInstance = Chart.getChart(canvas);
                this.addChartInteractions(chartInstance, canvas.id || 'unnamed-chart');
            }
        });
    },

    // ?뱤 李⑦듃 ?앹꽦 ?명꽣?됲듃
    interceptChartCreation() {
        // Chart.js ?앹꽦???섑븨
        const originalChart = window.Chart;
        const self = this;
        
        window.Chart = function(ctx, config) {
            const chart = new originalChart(ctx, config);
            
            // ?덈줈 ?앹꽦??李⑦듃???명꽣?숈뀡 異붽?
            setTimeout(() => {
                self.addChartInteractions(chart, ctx.canvas?.id || 'dynamic-chart');
            }, 100);
            
            return chart;
        };
        
        // Chart.js???뺤쟻 硫붿꽌?쒕뱾 蹂듭궗
        Object.setPrototypeOf(window.Chart, originalChart);
        Object.assign(window.Chart, originalChart);
    },

    // ?렞 李⑦듃???명꽣?숈뀡 異붽?
    addChartInteractions(chartInstance, chartId) {
        if (!chartInstance || chartInstance._interactionsAdded) return;
        
        console.log(`?뱤 李⑦듃 ?명꽣?숈뀡 異붽?: ${chartId}`);
        
        // 1. ?쒕┫?ㅼ슫 湲곕뒫
        this.addDrillDownInteraction(chartInstance, chartId);
        
        // 2. ?몃쾭 ?섏씠?쇱씠??
        this.addHoverHighlight(chartInstance, chartId);
        
        // 3. ?대┃ ?좊땲硫붿씠??
        this.addClickAnimation(chartInstance, chartId);
        
        // 4. 而⑦뀓?ㅽ듃 硫붾돱
        this.addContextMenu(chartInstance, chartId);
        
        // 5. ?곗씠???덉씠釉??좉?
        this.addDataLabelToggle(chartInstance, chartId);
        
        // ?명꽣?숈뀡 異붽? ?쒖떆
        chartInstance._interactionsAdded = true;
        chartInstance._chartId = chartId;
    },

    // ?뵿 ?쒕┫?ㅼ슫 湲곕뒫 異붽?
    addDrillDownInteraction(chartInstance, chartId) {
        const originalOnClick = chartInstance.options.onClick;
        
        chartInstance.options.onClick = (event, elements) => {
            if (elements && elements.length > 0) {
                const element = elements[0];
                const datasetIndex = element.datasetIndex;
                const dataIndex = element.index;
                
                this.handleChartDrillDown(chartInstance, chartId, datasetIndex, dataIndex, event);
            }
            
            // ?먮옒 onClick ?대깽?몃룄 ?ㅽ뻾
            if (originalOnClick) {
                originalOnClick.call(chartInstance, event, elements);
            }
        };
    },

    // ?뱤 ?쒕┫?ㅼ슫 泥섎━
    handleChartDrillDown(chartInstance, chartId, datasetIndex, dataIndex, event) {
        const dataset = chartInstance.data.datasets[datasetIndex];
        const label = chartInstance.data.labels[dataIndex];
        const value = dataset.data[dataIndex];
        
        console.log(`?뵿 ?쒕┫?ㅼ슫: ${label} (${value})`);
        
        // ?쒕┫?ㅼ슫 媛?ν븳 李⑦듃?몄? ?뺤씤
        if (this.canDrillDown(chartId, label)) {
            this.showDrillDownModal(chartId, label, value, event);
        } else {
            // 湲곕낯 ?숈옉: ?곸꽭 ?뺣낫 ?댄똻 ?쒖떆
            this.showDetailTooltip(chartInstance, label, value, event);
        }
    },

    // ?뵇 ?쒕┫?ㅼ슫 媛???щ? ?뺤씤
    canDrillDown(chartId, label) {
        const drillDownRules = {
            'previewMiniChart': {
                '吏?먮（??: true,
                '紐⑥쭛遺꾩빞': true,
                '?뚯궗紐?: false
            }
        };
        
        return drillDownRules[chartId]?.[label] || false;
    },

    // ?뱥 ?쒕┫?ㅼ슫 紐⑤떖 ?쒖떆
    showDrillDownModal(chartId, label, value, event) {
        const modal = document.createElement('div');
        modal.className = 'drilldown-modal';
        modal.innerHTML = `
            <div class="drilldown-content">
                <div class="drilldown-header">
                    <h4>${label} ?곸꽭 遺꾩꽍</h4>
                    <button class="btn-close-drilldown">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="drilldown-body">
                    ${this.generateDrillDownContent(label, value)}
                </div>
                <div class="drilldown-actions">
                    <button class="btn btn-primary" onclick="App.report.applyDrillDownFilter('${label}')">
                        ??議곌굔?쇰줈 ?꾪꽣 ?곸슜
                    </button>
                    <button class="btn btn-secondary" onclick="App.report.generateDetailedReport('${label}')">
                        ?곸꽭 由ы룷???앹꽦
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // ?リ린 ?대깽??
        modal.querySelector('.btn-close-drilldown').addEventListener('click', () => {
            document.body.removeChild(modal);
        });
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                document.body.removeChild(modal);
            }
        });
        
        // ?쒕┫?ㅼ슫 ?덉뒪?좊━??異붽?
        this.chartInteractions.drillDownHistory.push({
            chartId,
            label,
            value,
            timestamp: new Date().toISOString()
        });
    },

    // ?뱤 ?쒕┫?ㅼ슫 肄섑뀗痢??앹꽦
    generateDrillDownContent(label, value) {
        const filteredData = this.getFilteredData();
        const detailData = this.getDetailDataForLabel(filteredData, label);
        
        return `
            <div class="drilldown-stats">
                <div class="stat-item">
                    <div class="stat-label">珥?吏?먯옄</div>
                    <div class="stat-value">${value}紐?/div>
                </div>
                <div class="stat-item">
                    <div class="stat-label">?꾩껜 ?鍮?鍮꾩쑉</div>
                    <div class="stat-value">${this.calculatePercentage(value, filteredData.length)}%</div>
                </div>
            </div>
            
            <div class="drilldown-breakdown">
                <h5>?몃? 遺꾩꽍</h5>
                ${this.generateBreakdownChart(detailData)}
            </div>
            
            <div class="drilldown-trends">
                <h5>?쒓컙蹂??몃젋??/h5>
                ${this.generateTrendChart(detailData)}
            </div>
        `;
    },

    // ???몃쾭 ?섏씠?쇱씠??異붽?
    addHoverHighlight(chartInstance, chartId) {
        const originalOnHover = chartInstance.options.onHover;
        
        chartInstance.options.onHover = (event, elements) => {
            const canvas = chartInstance.canvas;
            
            if (elements && elements.length > 0) {
                canvas.style.cursor = 'pointer';
                
                // ?몃쾭???붿냼 ?섏씠?쇱씠??
                this.highlightElement(chartInstance, elements[0]);
            } else {
                canvas.style.cursor = 'default';
                this.clearHighlight(chartInstance);
            }
            
            // ?먮옒 onHover ?대깽?몃룄 ?ㅽ뻾
            if (originalOnHover) {
                originalOnHover.call(chartInstance, event, elements);
            }
        };
    },

    // ?뙚 ?붿냼 ?섏씠?쇱씠??
    highlightElement(chartInstance, element) {
        const dataset = chartInstance.data.datasets[element.datasetIndex];
        
        // ?먮옒 ?됱긽 諛깆뾽
        if (!dataset._originalBackgroundColor) {
            dataset._originalBackgroundColor = [...dataset.backgroundColor];
        }
        
        // ?섏씠?쇱씠???④낵
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

    // ?봽 ?섏씠?쇱씠???쒓굅
    clearHighlight(chartInstance) {
        chartInstance.data.datasets.forEach(dataset => {
            if (dataset._originalBackgroundColor) {
                dataset.backgroundColor = [...dataset._originalBackgroundColor];
            }
        });
        chartInstance.update('none');
    },

    // ?뮟 ?대┃ ?좊땲硫붿씠??異붽?
    addClickAnimation(chartInstance, chartId) {
        const canvas = chartInstance.canvas;
        
        canvas.addEventListener('click', (event) => {
            if (this.chartInteractions.animationEnabled) {
                this.createClickRipple(canvas, event);
            }
        });
    },

    // ?뙄 ?대┃ 由ы뵆 ?④낵
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

    // ?벑 而⑦뀓?ㅽ듃 硫붾돱 異붽?
    addContextMenu(chartInstance, chartId) {
        const canvas = chartInstance.canvas;
        
        canvas.addEventListener('contextmenu', (event) => {
            event.preventDefault();
            this.showChartContextMenu(chartInstance, chartId, event);
        });
    },

    // ?뱥 李⑦듃 而⑦뀓?ㅽ듃 硫붾돱 ?쒖떆
    showChartContextMenu(chartInstance, chartId, event) {
        // 湲곗〈 而⑦뀓?ㅽ듃 硫붾돱 ?쒓굅
        const existingMenu = document.querySelector('.chart-context-menu');
        if (existingMenu) {
            existingMenu.remove();
        }
        
        const menu = document.createElement('div');
        menu.className = 'chart-context-menu';
        menu.innerHTML = `
            <div class="context-menu-item" data-action="export">
                <i class="fas fa-download"></i>
                <span>李⑦듃 ?대낫?닿린</span>
            </div>
            <div class="context-menu-item" data-action="fullscreen">
                <i class="fas fa-expand"></i>
                <span>?꾩껜?붾㈃</span>
            </div>
            <div class="context-menu-item" data-action="annotations">
                <i class="fas fa-comment"></i>
                <span>二쇱꽍 異붽?</span>
            </div>
            <div class="context-menu-separator"></div>
            <div class="context-menu-item" data-action="data-labels">
                <i class="fas fa-tag"></i>
                <span>?곗씠???덉씠釉??좉?</span>
            </div>
            <div class="context-menu-item" data-action="animation-toggle">
                <i class="fas fa-magic"></i>
                <span>?좊땲硫붿씠??${this.chartInteractions.animationEnabled ? '?꾧린' : '耳쒓린'}</span>
            </div>
        `;
        
        menu.style.cssText = `
            position: fixed;
            left: ${event.clientX}px;
            top: ${event.clientY}px;
            z-index: 1001;
        `;
        
        document.body.appendChild(menu);
        
        // 硫붾돱 ?꾩씠???대┃ ?대깽??
        menu.querySelectorAll('.context-menu-item').forEach(item => {
            item.addEventListener('click', () => {
                const action = item.dataset.action;
                this.handleContextMenuAction(chartInstance, chartId, action);
                menu.remove();
            });
        });
        
        // ?몃? ?대┃ ??硫붾돱 ?リ린
        setTimeout(() => {
            document.addEventListener('click', function closeMenu() {
                menu.remove();
                document.removeEventListener('click', closeMenu);
            });
        }, 100);
    },

    // ?렗 而⑦뀓?ㅽ듃 硫붾돱 ?≪뀡 泥섎━
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

    // ?뱾 李⑦듃 ?대낫?닿린
    exportChart(chartInstance, chartId) {
        const canvas = chartInstance.canvas;
        const link = document.createElement('a');
        link.download = `李⑦듃_${chartId}_${new Date().toISOString().split('T')[0]}.png`;
        link.href = canvas.toDataURL();
        link.click();
        
        console.log('?뱾 李⑦듃 ?대낫?닿린 ?꾨즺:', chartId);
    },

    // ?뵇 李⑦듃 ?꾩껜?붾㈃
    showChartFullscreen(chartInstance, chartId) {
        const modal = document.createElement('div');
        modal.className = 'chart-fullscreen-modal';
        modal.innerHTML = `
            <div class="fullscreen-content">
                <div class="fullscreen-header">
                    <h4>李⑦듃 ?꾩껜?붾㈃</h4>
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
        
        // ?꾩껜?붾㈃ 李⑦듃 ?앹꽦
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
        
        // ?リ린 ?대깽??
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

    // ?뤇截??곗씠???덉씠釉??좉?
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
        console.log('?뤇截??곗씠???덉씠釉??좉?:', plugins.datalabels.display);
    },

    // ?렚 ?좊땲硫붿씠???좉?
    toggleAnimations() {
        this.chartInteractions.animationEnabled = !this.chartInteractions.animationEnabled;
        console.log('?렚 ?좊땲硫붿씠???좉?:', this.chartInteractions.animationEnabled);
    },

    // ?뵩 ?좏떥由ы떚 ?⑥닔??
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
            return item['吏?먮（??] === label || 
                   item['紐⑥쭛遺꾩빞'] === label || 
                   item['?뚯궗紐?] === label;
        });
    },

    // ?뱤 ?쒕┫?ㅼ슫 ?꾪꽣 ?곸슜
    applyDrillDownFilter(label) {
        // ?대떦 ?쇰꺼濡??꾪꽣 ?ㅼ젙
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
        
        console.log('?뵇 ?쒕┫?ㅼ슫 ?꾪꽣 ?곸슜:', label);
    },

    // ?뱥 ?곸꽭 由ы룷???앹꽦
    generateDetailedReport(label) {
        // ?대떦 ?쇰꺼??????곸꽭 由ы룷???앹꽦
        this.applyDrillDownFilter(label);
        
        // ?좎떆 ??由ы룷???앹꽦
        setTimeout(() => {
            this.generateReport();
        }, 500);
        
        console.log('?뱥 ?곸꽭 由ы룷???앹꽦:', label);
    },
    // ?뵕 C) 怨좉툒 湲곕뒫 - ?몃? ?곕룞 ?쒖뒪??

    // ?뵩 ?몃? ?곕룞 ?쒖뒪??珥덇린??
    initExternalIntegrationSystem() {
        console.log('?뵕 ?몃? ?곕룞 ?쒖뒪??珥덇린??..');
        
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
        
        console.log('???몃? ?곕룞 ?쒖뒪??珥덇린???꾨즺');
    },

    // ?렓 ?곕룞 ?ㅼ젙 UI ?앹꽦
    setupIntegrationUI() {
        // 由ы룷???ㅼ젙???곕룞 ??異붽?
        this.addIntegrationTab();
        
        // ?곕룞 ?곹깭 ?쒖떆湲?異붽?
        this.addIntegrationStatusIndicator();
    },

    // ?뱥 ?곕룞 ??異붽?
    addIntegrationTab() {
        const reportTabs = document.querySelector('.report-tabs');
        if (!reportTabs) return;

        // ?곕룞 ??踰꾪듉 異붽?
        const integrationTab = document.createElement('button');
        integrationTab.className = 'report-tab';
        integrationTab.dataset.tab = 'integrations';
        integrationTab.innerHTML = '<i class="fas fa-plug"></i> ?몃? ?곕룞';
        
        reportTabs.appendChild(integrationTab);

        // ?곕룞 ??肄섑뀗痢?異붽?
        const reportContent = document.querySelector('.report-content');
        if (reportContent) {
            const integrationTabContent = document.createElement('div');
            integrationTabContent.id = 'integrations-tab';
            integrationTabContent.className = 'tab-content';
            integrationTabContent.innerHTML = this.renderIntegrationsTabContent();
            
            reportContent.querySelector('.report-builder-section .report-builder').appendChild(integrationTabContent);
        }

        // ???대┃ ?대깽??異붽?
        integrationTab.addEventListener('click', () => {
            this.showIntegrationsTab();
        });
    },

    // ?렓 ?곕룞 ??肄섑뀗痢??뚮뜑留?
    renderIntegrationsTabContent() {
        return `
            <div class="integrations-container">
                <div class="integrations-header">
                    <h3><i class="fas fa-plug"></i> ?몃? ?쒖뒪???곕룞</h3>
                    <p>?ㅼ뼇???몃? ?쒕퉬?ㅼ? ?곕룞?섏뿬 由ы룷??湲곕뒫???뺤옣?섏꽭??</p>
                </div>

                <!-- Google Analytics ?곕룞 -->
                <div class="integration-card" data-integration="googleAnalytics">
                    <div class="integration-header">
                        <div class="integration-info">
                            <div class="integration-icon ga-icon">
                                <i class="fab fa-google"></i>
                            </div>
                            <div class="integration-details">
                                <h4>Google Analytics</h4>
                                <p>?뱀궗?댄듃 ?몃옒???곗씠?곕? ?곕룞?섏뿬 吏?먯옄 ?좎엯 寃쎈줈瑜?遺꾩꽍?⑸땲??</p>
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
                                    <i class="fas fa-flask"></i> ?곌껐 ?뚯뒪??
                                </button>
                                <button class="btn btn-success" onclick="App.report.syncGoogleAnalytics()">
                                    <i class="fas fa-sync"></i> ?곗씠???숆린??
                                </button>
                            </div>
                        </div>
                        <div class="integration-features">
                            <h5>?쒓났 湲곕뒫</h5>
                            <ul>
                                <li>?뱀궗?댄듃 ?좎엯 寃쎈줈 遺꾩꽍</li>
                                <li>?섏씠吏蹂?吏?먯옄 ?꾪솚??/li>
                                <li>?ㅼ떆媛?諛⑸Ц???듦퀎</li>
                                <li>湲곌컙蹂??몃옒???몃젋??/li>
                            </ul>
                        </div>
                    </div>
                </div>

                <!-- Slack ?곕룞 -->
                <div class="integration-card" data-integration="slack">
                    <div class="integration-header">
                        <div class="integration-info">
                            <div class="integration-icon slack-icon">
                                <i class="fab fa-slack"></i>
                            </div>
                            <div class="integration-details">
                                <h4>Slack ?뚮┝</h4>
                                <p>以묒슂??梨꾩슜 ?대깽?몄? 由ы룷?몃? Slack 梨꾨꼸濡??먮룞 ?뚮┝??諛쏆뒿?덈떎.</p>
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
                                <label>?뚮┝ 梨꾨꼸</label>
                                <input type="text" id="slack-channel" placeholder="#recruitment" 
                                       value="${this.integrations.slack.channels[0] || ''}">
                            </div>
                            <div class="form-group">
                                <label>?뚮┝ ?좏삎</label>
                                <div class="checkbox-group">
                                    <label><input type="checkbox" checked> ?쇱씪 由ы룷??/label>
                                    <label><input type="checkbox" checked> 二쇨컙 ?붿빟</label>
                                    <label><input type="checkbox"> 湲닿툒 ?뚮┝</label>
                                    <label><input type="checkbox"> 紐⑺몴 ?ъ꽦 ?뚮┝</label>
                                </div>
                            </div>
                            <div class="form-actions">
                                <button class="btn btn-primary" onclick="App.report.testSlackIntegration()">
                                    <i class="fas fa-paper-plane"></i> ?뚯뒪??硫붿떆吏 諛쒖넚
                                </button>
                                <button class="btn btn-success" onclick="App.report.sendSlackReport()">
                                    <i class="fas fa-share"></i> 由ы룷??怨듭쑀
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- ?대찓???곕룞 -->
                <div class="integration-card" data-integration="email">
                    <div class="integration-header">
                        <div class="integration-info">
                            <div class="integration-icon email-icon">
                                <i class="fas fa-envelope"></i>
                            </div>
                            <div class="integration-details">
                                <h4>?대찓???먮룞 諛쒖넚</h4>
                                <p>?뺢린?곸쑝濡?由ы룷?몃? ?대찓?쇰줈 ?먮룞 諛쒖넚?섍굅???뚮┝??諛쏆뒿?덈떎.</p>
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
                                    <label>SMTP ?쒕쾭</label>
                                    <input type="text" id="email-smtp-host" placeholder="smtp.gmail.com">
                                </div>
                                <div class="form-group">
                                    <label>?ы듃</label>
                                    <input type="number" id="email-smtp-port" placeholder="587">
                                </div>
                            </div>
                            <div class="form-row">
                                <div class="form-group">
                                    <label>?ъ슜?먮챸</label>
                                    <input type="email" id="email-username" placeholder="user@company.com">
                                </div>
                                <div class="form-group">
                                    <label>鍮꾨?踰덊샇</label>
                                    <input type="password" id="email-password" placeholder="??鍮꾨?踰덊샇">
                                </div>
                            </div>
                            <div class="form-group">
                                <label>?섏떊??紐⑸줉</label>
                                <textarea id="email-recipients" placeholder="hr@company.com, manager@company.com" rows="2"></textarea>
                            </div>
                            <div class="form-group">
                                <label>諛쒖넚 二쇨린</label>
                                <select id="email-schedule">
                                    <option value="daily">留ㅼ씪</option>
                                    <option value="weekly" selected>留ㅼ＜</option>
                                    <option value="monthly">留ㅼ썡</option>
                                    <option value="custom">?ъ슜??吏??/option>
                                </select>
                            </div>
                            <div class="form-actions">
                                <button class="btn btn-primary" onclick="App.report.testEmailConfiguration()">
                                    <i class="fas fa-envelope-open"></i> ?뚯뒪???대찓??諛쒖넚
                                </button>
                                <button class="btn btn-success" onclick="App.report.scheduleEmailReports()">
                                    <i class="fas fa-calendar-plus"></i> ?먮룞 諛쒖넚 ?ㅼ젙
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- API ?곕룞 -->
                <div class="integration-card" data-integration="api">
                    <div class="integration-header">
                        <div class="integration-info">
                            <div class="integration-icon api-icon">
                                <i class="fas fa-code"></i>
                            </div>
                            <div class="integration-details">
                                <h4>API ?곗씠???곕룞</h4>
                                <p>?몃? ?쒖뒪?쒖쓽 API瑜??듯빐 異붽? ?곗씠?곕? 媛?몄삤嫄곕굹 ?대낫?낅땲??</p>
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
                                <h5>API ?붾뱶?ъ씤???ㅼ젙</h5>
                                <div class="endpoint-item">
                                    <div class="form-row">
                                        <div class="form-group">
                                            <label>?대쫫</label>
                                            <input type="text" placeholder="HR ?쒖뒪??>
                                        </div>
                                        <div class="form-group">
                                            <label>URL</label>
                                            <input type="url" placeholder="https://api.hr-system.com/candidates">
                                        </div>
                                    </div>
                                    <div class="form-row">
                                        <div class="form-group">
                                            <label>?몄쬆 ?좏겙</label>
                                            <input type="password" placeholder="Bearer token">
                                        </div>
                                        <div class="form-group">
                                            <label>?숆린??二쇨린</label>
                                            <select>
                                                <option>?ㅼ떆媛?/option>
                                                <option>留ㅼ떆媛?/option>
                                                <option>留ㅼ씪</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                                <button class="btn btn-outline add-endpoint-btn">
                                    <i class="fas fa-plus"></i> ?붾뱶?ъ씤??異붽?
                                </button>
                            </div>
                            <div class="form-actions">
                                <button class="btn btn-primary" onclick="App.report.testAPIConnection()">
                                    <i class="fas fa-link"></i> ?곌껐 ?뚯뒪??
                                </button>
                                <button class="btn btn-success" onclick="App.report.syncAPIData()">
                                    <i class="fas fa-sync-alt"></i> ?곗씠???숆린??
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- ?곕룞 ?곹깭 ?붿빟 -->
                <div class="integration-summary">
                    <h4><i class="fas fa-chart-pie"></i> ?곕룞 ?곹깭 ?붿빟</h4>
                    <div class="summary-grid">
                        <div class="summary-item">
                            <div class="summary-label">?쒖꽦 ?곕룞</div>
                            <div class="summary-value" id="active-integrations">0</div>
                        </div>
                        <div class="summary-item">
                            <div class="summary-label">留덉?留??숆린??/div>
                            <div class="summary-value" id="last-sync">?놁쓬</div>
                        </div>
                        <div class="summary-item">
                            <div class="summary-label">?곕룞 ?곹깭</div>
                            <div class="summary-value status-indicator" id="integration-status">
                                <span class="status-dot offline"></span> ?ㅽ봽?쇱씤
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    // ?벑 ?곕룞 ???쒖떆
    showIntegrationsTab() {
        // 紐⑤뱺 ??鍮꾪솢?깊솕
        document.querySelectorAll('.report-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });

        // ?곕룞 ???쒖꽦??
        document.querySelector('[data-tab="integrations"]').classList.add('active');
        document.getElementById('integrations-tab').classList.add('active');

        // ?곕룞 ?대깽???ㅼ젙
        this.setupIntegrationEvents();
        this.updateIntegrationStatus();
    },

    // ?렞 ?곕룞 ?대깽???ㅼ젙
    setupIntegrationEvents() {
        // ?좉? ?ㅼ쐞移??대깽??
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

        // ?붾뱶?ъ씤??異붽? 踰꾪듉
        const addEndpointBtn = document.querySelector('.add-endpoint-btn');
        if (addEndpointBtn) {
            addEndpointBtn.addEventListener('click', () => {
                this.addAPIEndpoint();
            });
        }
    },

    // ???곕룞 ?쒖꽦??
    enableIntegration(type) {
        this.integrations[type].enabled = true;
        this.saveIntegrationSettings();
        this.updateIntegrationStatus();
        
        console.log(`??${type} ?곕룞 ?쒖꽦??);
    },

    // ???곕룞 鍮꾪솢?깊솕
    disableIntegration(type) {
        this.integrations[type].enabled = false;
        this.saveIntegrationSettings();
        this.updateIntegrationStatus();
        
        console.log(`??${type} ?곕룞 鍮꾪솢?깊솕`);
    },

    // ?뵮 Google Analytics ?뚯뒪??
    testGoogleAnalytics() {
        const trackingId = document.getElementById('ga-tracking-id').value;
        
        if (!trackingId) {
            alert('Tracking ID瑜??낅젰?댁＜?몄슂.');
            return;
        }

        // ?쒕??덉씠?섎맂 ?뚯뒪??
        this.showLoadingIndicator('Google Analytics ?곌껐 ?뚯뒪??以?..');
        
        setTimeout(() => {
            this.hideLoadingIndicator();
            
            // ?깃났 ?쒕??덉씠??
            const success = Math.random() > 0.3;
            
            if (success) {
                this.integrations.googleAnalytics.trackingId = trackingId;
                this.saveIntegrationSettings();
                alert('??Google Analytics ?곌껐 ?뚯뒪???깃났!');
            } else {
                alert('???곌껐 ?ㅽ뙣: Tracking ID瑜??뺤씤?댁＜?몄슂.');
            }
        }, 2000);
    },

    // ?뱤 Google Analytics ?숆린??
    syncGoogleAnalytics() {
        if (!this.integrations.googleAnalytics.trackingId) {
            alert('癒쇱? Google Analytics瑜??ㅼ젙?댁＜?몄슂.');
            return;
        }

        this.showLoadingIndicator('Google Analytics ?곗씠???숆린??以?..');
        
        setTimeout(() => {
            this.hideLoadingIndicator();
            
            // ?쒕??덉씠?섎맂 ?곗씠??
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

            alert(`??Google Analytics ?숆린???꾨즺!\n\n?몄뀡: ${mockData.sessions}\n?섏씠吏酉? ${mockData.pageviews}\n?꾪솚?? ${mockData.conversion}`);
            
            console.log('?뱤 Google Analytics ?곗씠??', mockData);
        }, 3000);
    },
    // ?뮠 Slack ?곕룞 ?뚯뒪??
    testSlackIntegration() {
        const webhookUrl = document.getElementById('slack-webhook').value;
        const channel = document.getElementById('slack-channel').value;
        
        if (!webhookUrl) {
            alert('Slack Webhook URL???낅젰?댁＜?몄슂.');
            return;
        }

        this.showLoadingIndicator('Slack ?곌껐 ?뚯뒪??以?..');
        
        setTimeout(() => {
            this.hideLoadingIndicator();
            
            // ?쒕??덉씠?섎맂 ?뚯뒪??硫붿떆吏 諛쒖넚
            const testMessage = {
                text: "?쨼 CFC 梨꾩슜 ??쒕낫???뚯뒪??硫붿떆吏",
                channel: channel || '#general',
                username: 'CFC 梨꾩슜遊?,
                icon_emoji: ':robot_face:'
            };

            this.integrations.slack.webhookUrl = webhookUrl;
            this.integrations.slack.channels = [channel || '#general'];
            this.saveIntegrationSettings();

            alert('??Slack ?뚯뒪??硫붿떆吏 諛쒖넚 ?깃났!');
            console.log('?뮠 Slack ?뚯뒪??硫붿떆吏:', testMessage);
        }, 1500);
    },

    // ?뱾 Slack 由ы룷??怨듭쑀
    sendSlackReport() {
        if (!this.integrations.slack.webhookUrl) {
            alert('癒쇱? Slack???ㅼ젙?댁＜?몄슂.');
            return;
        }

        this.showLoadingIndicator('Slack?쇰줈 由ы룷???꾩넚 以?..');
        
        setTimeout(() => {
            this.hideLoadingIndicator();
            
            const stats = this.calculateBasicStats(this.getFilteredData());
            const slackMessage = this.formatSlackReportMessage(stats);
            
            this.integrations.slack.lastNotification = new Date().toISOString();
            this.saveIntegrationSettings();
            this.updateIntegrationStatus();

            alert('??Slack?쇰줈 由ы룷?멸? ?깃났?곸쑝濡??꾩넚?섏뿀?듬땲??');
            console.log('?뱾 Slack 由ы룷??硫붿떆吏:', slackMessage);
        }, 2000);
    },

    // ?뱷 Slack 由ы룷??硫붿떆吏 ?щ㎎
    formatSlackReportMessage(stats) {
        const today = new Date().toLocaleDateString('ko-KR');
        
        return {
            text: "?뱤 CFC 梨꾩슜 ??쒕낫???쇱씪 由ы룷??,
            attachments: [{
                color: "good",
                fields: [
                    {
                        title: "珥?吏?먯옄",
                        value: `${stats.total}紐?,
                        short: true
                    },
                    {
                        title: "?꾪솚??,
                        value: `${stats.conversionRate}%`,
                        short: true
                    },
                    {
                        title: "二쇱슂 梨꾩슜 寃쎈줈",
                        value: stats.topSource,
                        short: true
                    },
                    {
                        title: "由ы룷???앹꽦??,
                        value: today,
                        short: true
                    }
                ],
                footer: "CFC 梨꾩슜 ??쒕낫??,
                ts: Math.floor(Date.now() / 1000)
            }]
        };
    },

    // ?벁 ?대찓???ㅼ젙 ?뚯뒪??
    testEmailConfiguration() {
        const config = this.getEmailConfiguration();
        
        if (!config.smtpHost || !config.username || !config.password) {
            alert('?대찓???ㅼ젙??紐⑤몢 ?낅젰?댁＜?몄슂.');
            return;
        }

        this.showLoadingIndicator('?대찓???ㅼ젙 ?뚯뒪??以?..');
        
        setTimeout(() => {
            this.hideLoadingIndicator();
            
            // ?쒕??덉씠?섎맂 ?뚯뒪??
            const success = Math.random() > 0.2;
            
            if (success) {
                this.integrations.email.smtpConfig = config;
                this.saveIntegrationSettings();
                alert('???대찓???ㅼ젙 ?뚯뒪???깃났!\n?뚯뒪???대찓?쇱씠 諛쒖넚?섏뿀?듬땲??');
            } else {
                alert('???대찓???ㅼ젙 ?ㅻ쪟: SMTP ?ㅼ젙???뺤씤?댁＜?몄슂.');
            }
        }, 2500);
    },

    // ?뱟 ?대찓???먮룞 諛쒖넚 ?ㅼ젙
    scheduleEmailReports() {
        const config = this.getEmailConfiguration();
        const schedule = document.getElementById('email-schedule').value;
        const recipients = document.getElementById('email-recipients').value;
        
        if (!recipients) {
            alert('?섏떊?먮? ?낅젰?댁＜?몄슂.');
            return;
        }

        this.integrations.email.smtpConfig = config;
        this.integrations.email.schedule = schedule;
        this.integrations.email.recipients = recipients.split(',').map(email => email.trim());
        this.saveIntegrationSettings();

        alert(`??${schedule} 二쇨린濡??대찓???먮룞 諛쒖넚???ㅼ젙?섏뿀?듬땲??\n?섏떊?? ${recipients}`);
        
        // ?쒕??덉씠?섎맂 泥?踰덉㎏ 諛쒖넚
        setTimeout(() => {
            this.sendScheduledEmail();
        }, 5000);
    },

    // ?벉 ?덉빟???대찓??諛쒖넚
    sendScheduledEmail() {
        const stats = this.calculateBasicStats(this.getFilteredData());
        const emailContent = this.formatEmailReportContent(stats);
        
        this.integrations.email.lastSent = new Date().toISOString();
        this.saveIntegrationSettings();
        this.updateIntegrationStatus();

        console.log('?벉 ?대찓??由ы룷??諛쒖넚:', emailContent);
        
        // ?ъ슜?먯뿉寃??뚮┝ (?ㅼ젣濡쒕뒗 諛깃렇?쇱슫?쒖뿉??諛쒖넚??
        if (Notification.permission === 'granted') {
            new Notification('CFC 梨꾩슜 ??쒕낫??, {
                body: '?대찓??由ы룷?멸? ?깃났?곸쑝濡?諛쒖넚?섏뿀?듬땲??',
                icon: '/favicon.ico'
            });
        }
    },

    // ?벁 ?대찓???ㅼ젙 媛?몄삤湲?
    getEmailConfiguration() {
        return {
            smtpHost: document.getElementById('email-smtp-host')?.value || '',
            smtpPort: document.getElementById('email-smtp-port')?.value || '587',
            username: document.getElementById('email-username')?.value || '',
            password: document.getElementById('email-password')?.value || '',
            security: 'STARTTLS'
        };
    },

    // ?뱷 ?대찓??由ы룷??肄섑뀗痢??щ㎎
    formatEmailReportContent(stats) {
        const today = new Date().toLocaleDateString('ko-KR');
        
        return {
            subject: `CFC 梨꾩슜 ??쒕낫??由ы룷??- ${today}`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; color: white; text-align: center;">
                        <h1 style="margin: 0;">CFC 梨꾩슜 ??쒕낫??/h1>
                        <p style="margin: 10px 0 0 0;">?쇱씪 由ы룷??- ${today}</p>
                    </div>
                    
                    <div style="padding: 30px; background: #f8fafc;">
                        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 20px; margin-bottom: 30px;">
                            <div style="text-align: center; padding: 20px; background: white; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                                <div style="font-size: 2rem; font-weight: bold; color: #3b82f6;">${stats.total}</div>
                                <div style="color: #6b7280;">珥?吏?먯옄</div>
                            </div>
                            <div style="text-align: center; padding: 20px; background: white; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                                <div style="font-size: 2rem; font-weight: bold; color: #10b981;">${stats.conversionRate}%</div>
                                <div style="color: #6b7280;">?꾪솚??/div>
                            </div>
                            <div style="text-align: center; padding: 20px; background: white; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                                <div style="font-size: 1.2rem; font-weight: bold; color: #f59e0b;">${stats.topSource}</div>
                                <div style="color: #6b7280;">二쇱슂 梨꾩슜 寃쎈줈</div>
                            </div>
                        </div>
                        
                        <div style="background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                            <h3 style="margin-top: 0; color: #1f2937;">梨꾩슜 ?꾪솴 ?붿빟</h3>
                            <p>?ㅻ뒛 ${today} 湲곗??쇰줈 珥?${stats.total}紐낆쓽 吏?먯옄媛 ?덉쑝硫? ?꾩껜 ?꾪솚?⑥? ${stats.conversionRate}%?낅땲??</p>
                            <p>二쇱슂 梨꾩슜 寃쎈줈??"${stats.topSource}"?대ŉ, 吏?띿쟻??紐⑤땲?곕쭅???꾩슂?⑸땲??</p>
                        </div>
                    </div>
                    
                    <div style="background: #1f2937; padding: 20px; text-align: center; color: white;">
                        <p style="margin: 0;">CFC 梨꾩슜 ??쒕낫?쒖뿉???먮룞 ?앹꽦??由ы룷?몄엯?덈떎.</p>
                    </div>
                </div>
            `
        };
    },

    // ?뵕 API ?곌껐 ?뚯뒪??
    testAPIConnection() {
        const endpoints = this.getAPIEndpoints();
        
        if (endpoints.length === 0) {
            alert('API ?붾뱶?ъ씤?몃? ?ㅼ젙?댁＜?몄슂.');
            return;
        }

        this.showLoadingIndicator('API ?곌껐 ?뚯뒪??以?..');
        
        setTimeout(() => {
            this.hideLoadingIndicator();
            
            // ?쒕??덉씠?섎맂 ?곌껐 ?뚯뒪??
            const results = endpoints.map(endpoint => ({
                name: endpoint.name,
                url: endpoint.url,
                status: Math.random() > 0.3 ? 'success' : 'error',
                responseTime: Math.floor(Math.random() * 500) + 100
            }));

            const successCount = results.filter(r => r.status === 'success').length;
            const totalCount = results.length;

            alert(`API ?곌껐 ?뚯뒪???꾨즺!\n?깃났: ${successCount}/${totalCount} ?붾뱶?ъ씤??);
            console.log('?뵕 API ?뚯뒪??寃곌낵:', results);
        }, 2000);
    },

    // ?봽 API ?곗씠???숆린??
    syncAPIData() {
        const endpoints = this.getAPIEndpoints();
        
        if (endpoints.length === 0) {
            alert('API ?붾뱶?ъ씤?몃? ?ㅼ젙?댁＜?몄슂.');
            return;
        }

        this.showLoadingIndicator('API ?곗씠???숆린??以?..');
        
        setTimeout(() => {
            this.hideLoadingIndicator();
            
            // ?쒕??덉씠?섎맂 ?곗씠???숆린??
            const syncedData = {
                candidates: Math.floor(Math.random() * 100) + 50,
                positions: Math.floor(Math.random() * 20) + 10,
                interviews: Math.floor(Math.random() * 200) + 100,
                lastSync: new Date().toISOString()
            };

            this.integrations.api.lastFetch = syncedData.lastSync;
            this.saveIntegrationSettings();
            this.updateIntegrationStatus();

            alert(`??API ?곗씠???숆린???꾨즺!\n\n吏?먯옄: ${syncedData.candidates}紐?n?ъ??? ${syncedData.positions}媛?n硫댁젒: ${syncedData.interviews}嫄?);
            
            console.log('?봽 ?숆린?붾맂 API ?곗씠??', syncedData);
        }, 3000);
    },

    // ??API ?붾뱶?ъ씤??異붽?
    addAPIEndpoint() {
        const container = document.querySelector('.api-endpoints');
        const newEndpoint = document.createElement('div');
        newEndpoint.className = 'endpoint-item';
        newEndpoint.innerHTML = `
            <div class="form-row">
                <div class="form-group">
                    <label>?대쫫</label>
                    <input type="text" placeholder="?쒖뒪???대쫫">
                </div>
                <div class="form-group">
                    <label>URL</label>
                    <input type="url" placeholder="https://api.example.com/endpoint">
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>?몄쬆 ?좏겙</label>
                    <input type="password" placeholder="Bearer token">
                </div>
                <div class="form-group">
                    <label>?숆린??二쇨린</label>
                    <select>
                        <option>?ㅼ떆媛?/option>
                        <option>留ㅼ떆媛?/option>
                        <option>留ㅼ씪</option>
                    </select>
                </div>
            </div>
            <button class="btn btn-danger btn-sm remove-endpoint" style="margin-top: 10px;">
                <i class="fas fa-trash"></i> ?쒓굅
            </button>
        `;
        
        container.insertBefore(newEndpoint, container.querySelector('.add-endpoint-btn'));
        
        // ?쒓굅 踰꾪듉 ?대깽??
        newEndpoint.querySelector('.remove-endpoint').addEventListener('click', () => {
            newEndpoint.remove();
        });
    },

    // ?뱤 ?곕룞 ?곹깭 ?낅뜲?댄듃
    updateIntegrationStatus() {
        const activeCount = Object.values(this.integrations).filter(i => i.enabled).length;
        const lastSyncTimes = Object.values(this.integrations)
            .map(i => i.lastSync || i.lastNotification || i.lastSent || i.lastFetch)
            .filter(Boolean);
        
        const lastSync = lastSyncTimes.length > 0 ? 
            Math.max(...lastSyncTimes.map(t => new Date(t).getTime())) : null;
        
        // UI ?낅뜲?댄듃
        const activeEl = document.getElementById('active-integrations');
        const lastSyncEl = document.getElementById('last-sync');
        const statusEl = document.getElementById('integration-status');
        
        if (activeEl) activeEl.textContent = activeCount;
        if (lastSyncEl) {
            lastSyncEl.textContent = lastSync ? 
                new Date(lastSync).toLocaleString('ko-KR') : '?놁쓬';
        }
        if (statusEl) {
            const dot = statusEl.querySelector('.status-dot');
            const text = statusEl.childNodes[1];
            
            if (activeCount > 0) {
                dot.className = 'status-dot online';
                text.textContent = ' ?⑤씪??;
            } else {
                dot.className = 'status-dot offline';
                text.textContent = ' ?ㅽ봽?쇱씤';
            }
        }
    },

    // ?뵩 ?좏떥由ы떚 ?⑥닔??
    getAPIEndpoints() {
        const endpoints = [];
        document.querySelectorAll('.endpoint-item').forEach(item => {
            const name = item.querySelector('input[placeholder*="?대쫫"]')?.value;
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
            console.error('???곕룞 ?ㅼ젙 濡쒕뱶 ?ㅽ뙣:', error);
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

    // ?봽 ?곕룞 ?곹깭 ?쒖떆湲?異붽?
    addIntegrationStatusIndicator() {
        const header = document.querySelector('.live-preview-sidebar .preview-header');
        if (!header) return;

        const statusIndicator = document.createElement('div');
        statusIndicator.className = 'integration-status-mini';
        statusIndicator.innerHTML = `
            <div class="status-mini-dot offline" id="statusMiniDot"></div>
            <span id="statusMiniText">?곕룞 ?놁쓬</span>
        `;
        
        header.appendChild(statusIndicator);
        
        // 二쇨린?곸쑝濡??곹깭 ?낅뜲?댄듃
        setInterval(() => {
            this.updateMiniStatusIndicator();
        }, 30000); // 30珥덈쭏???낅뜲?댄듃
    },

    updateMiniStatusIndicator() {
        const activeCount = Object.values(this.integrations).filter(i => i.enabled).length;
        const dot = document.getElementById('statusMiniDot');
        const text = document.getElementById('statusMiniText');
        
        if (dot && text) {
            if (activeCount > 0) {
                dot.className = 'status-mini-dot online';
                text.textContent = `${activeCount}媛??곕룞`;
            } else {
                dot.className = 'status-mini-dot offline';
                text.textContent = '?곕룞 ?놁쓬';
            }
        }
    },
};

// ?? 紐⑤뱢 ?대낫?닿린
export { ReportModule };
