// =========================
// csvProcessor.js - CSV 자동 처리 시스템
// =========================

export const CSVProcessor = {
    // 처리 상태
    isProcessing: false,
    processedCount: 0,
    totalCount: 0,
    errors: [],
    duplicates: [],
    selectedFiles: null,
    
    // 메인 업로드 영역 생성
    createUploadZone() {
        const uploadContainer = document.createElement('div');
        uploadContainer.id = 'csv-auto-processor';
        uploadContainer.innerHTML = `
            <div class="csv-upload-card" style="
                background: linear-gradient(135deg, rgba(129, 140, 248, 0.1), rgba(129, 140, 248, 0.05));
                border: 3px dashed var(--sidebar-accent);
                border-radius: 16px;
                padding: 30px;
                margin: 20px 0;
                text-align: center;
                transition: all 0.3s ease;
                position: relative;
                overflow: hidden;
            " onmouseover="this.style.borderColor='var(--success)'; this.style.transform='translateY(-2px)'" 
               onmouseout="this.style.borderColor='var(--sidebar-accent)'; this.style.transform='translateY(0)'">
                
                <div class="upload-content">
                    <div style="display: flex; align-items: center; justify-content: center; gap: 15px; margin-bottom: 20px;">
                        <i class="fas fa-cloud-upload-alt" style="font-size: 3rem; color: var(--sidebar-accent);"></i>
                        <div>
                            <h3 style="margin: 0; color: var(--text-primary); font-size: 1.4rem;">📊 채용 CSV 자동 처리기</h3>
                            <p style="margin: 8px 0 0 0; color: var(--text-secondary); font-size: 1rem;">하루 20명 내외 처리에 최적화</p>
                        </div>
                    </div>
                    
                    <div style="background: rgba(255, 255, 255, 0.8); border-radius: 12px; padding: 20px; margin-bottom: 20px;">
                        <p style="color: var(--text-primary); margin-bottom: 15px; font-weight: 600;">지원하는 형식:</p>
                        <div style="display: flex; gap: 15px; justify-content: center; flex-wrap: wrap;">
                            <span style="background: var(--success); color: white; padding: 6px 12px; border-radius: 20px; font-size: 0.9rem; font-weight: 600;">
                                <i class="fas fa-check"></i> 사람인 CSV
                            </span>
                            <span style="background: var(--warning); color: white; padding: 6px 12px; border-radius: 20px; font-size: 0.9rem; font-weight: 600;">
                                <i class="fas fa-check"></i> 잡코리아 CSV
                            </span>
                            <span style="background: var(--accent-orange); color: white; padding: 6px 12px; border-radius: 20px; font-size: 0.9rem; font-weight: 600;">
                                <i class="fas fa-check"></i> Excel 파일
                            </span>
                        </div>
                    </div>
                    
                    <div class="upload-actions">
                        <input type="file" id="csv-file-input" accept=".csv,.xlsx,.xls" multiple style="display: none;">
                        <button class="upload-btn" onclick="document.getElementById('csv-file-input').click()" style="
                            background: linear-gradient(135deg, var(--sidebar-accent), #6366f1);
                            color: white;
                            border: none;
                            padding: 15px 30px;
                            border-radius: 12px;
                            font-size: 1.1rem;
                            font-weight: 700;
                            cursor: pointer;
                            transition: all 0.3s ease;
                            box-shadow: 0 4px 15px rgba(129, 140, 248, 0.3);
                            text-transform: uppercase;
                            letter-spacing: 0.5px;
                            margin-bottom: 15px;
                            display: flex;
                            align-items: center;
                            gap: 10px;
                            justify-content: center;
                            min-width: 200px;
                        " onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 6px 20px rgba(129, 140, 248, 0.4)'"
                           onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 15px rgba(129, 140, 248, 0.3)'">
                            <i class="fas fa-file-upload"></i>
                            파일 선택하기
                        </button>
                        
                        <p style="color: var(--text-secondary); font-size: 0.9rem; margin: 0;">
                            또는 파일을 이 영역에 드래그 앤 드롭하세요
                        </p>
                    </div>
                    
                    <div class="processing-options" style="margin-top: 20px; display: none;">
                        <div style="background: rgba(129, 140, 248, 0.1); padding: 15px; border-radius: 8px; margin-bottom: 15px;">
                            <label style="display: flex; align-items: center; gap: 10px; cursor: pointer;">
                                <input type="checkbox" id="skipDuplicates" checked style="width: 18px; height: 18px;">
                                <span style="font-weight: 600; color: var(--text-primary);">중복 지원자 자동 스킵</span>
                                <small style="color: var(--text-secondary);">(이름 + 연락처 기준)</small>
                            </label>
                        </div>
                        
                        <button class="process-btn" onclick="window.CSVProcessor.startProcessing()" style="
                            background: linear-gradient(135deg, var(--success), #059669);
                            color: white;
                            border: none;
                            padding: 12px 25px;
                            border-radius: 8px;
                            font-weight: 700;
                            cursor: pointer;
                            transition: all 0.3s ease;
                            font-size: 1rem;
                        " onmouseover="this.style.transform='translateY(-1px)'"
                           onmouseout="this.style.transform='translateY(0)'">
                            <i class="fas fa-play"></i> 자동 처리 시작
                        </button>
                    </div>
                </div>
                
                <!-- 처리 진행률 표시 -->
                <div class="processing-overlay" style="display: none; position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: rgba(255, 255, 255, 0.95); border-radius: 16px;">
                    <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; padding: 40px;">
                        <div class="processing-spinner" style="
                            width: 60px; 
                            height: 60px; 
                            border: 4px solid rgba(129, 140, 248, 0.3); 
                            border-top: 4px solid var(--sidebar-accent); 
                            border-radius: 50%; 
                            animation: spin 1s linear infinite;
                            margin-bottom: 20px;
                        "></div>
                        
                        <h3 style="margin: 0 0 15px 0; color: var(--text-primary);">실시간 처리 중...</h3>
                        
                        <div class="progress-info" style="width: 100%; max-width: 400px;">
                            <div class="progress-bar" style="
                                width: 100%; 
                                height: 12px; 
                                background: rgba(129, 140, 248, 0.2); 
                                border-radius: 10px; 
                                overflow: hidden;
                                margin-bottom: 15px;
                            ">
                                <div class="progress-fill" style="
                                    height: 100%; 
                                    background: linear-gradient(90deg, var(--sidebar-accent), var(--success)); 
                                    width: 0%; 
                                    transition: width 0.3s ease;
                                    border-radius: 10px;
                                "></div>
                            </div>
                            
                            <div class="progress-text" style="display: flex; justify-content: space-between; font-size: 0.9rem; color: var(--text-secondary);">
                                <span class="current-progress">0 / 0</span>
                                <span class="progress-percentage">0%</span>
                            </div>
                        </div>
                        
                        <div class="processing-log" style="
                            margin-top: 20px; 
                            max-height: 150px; 
                            overflow-y: auto; 
                            width: 100%; 
                            background: rgba(248, 250, 252, 0.8); 
                            border-radius: 8px; 
                            padding: 15px;
                            font-family: monospace;
                            font-size: 0.85rem;
                        ">
                            <div class="log-entry" style="color: var(--sidebar-accent); font-weight: 600;">처리 시작...</div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        this.addProcessorStyles();
        this.setupEventListeners(uploadContainer);
        return uploadContainer;
    },
    
    // CSS 스타일 추가
    addProcessorStyles() {
        if (!document.head.querySelector('#csv-processor-styles')) {
            const style = document.createElement('style');
            style.id = 'csv-processor-styles';
            style.textContent = `
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
                .log-entry {
                    margin-bottom: 5px;
                    padding: 3px 0;
                    border-bottom: 1px solid rgba(129, 140, 248, 0.1);
                }
            `;
            document.head.appendChild(style);
        }
    },
    
    // 이벤트 리스너 설정
    setupEventListeners(container) {
        const fileInput = container.querySelector('#csv-file-input');
        const uploadCard = container.querySelector('.csv-upload-card');
        
        // 파일 선택 이벤트
        fileInput.addEventListener('change', (e) => {
            this.handleFiles(Array.from(e.target.files));
        });
        
        // 드래그 앤 드롭 이벤트
        uploadCard.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadCard.style.borderColor = 'var(--success)';
            uploadCard.style.backgroundColor = 'rgba(16, 185, 129, 0.1)';
        });
        
        uploadCard.addEventListener('dragleave', (e) => {
            e.preventDefault();
            uploadCard.style.borderColor = 'var(--sidebar-accent)';
            uploadCard.style.backgroundColor = 'rgba(129, 140, 248, 0.05)';
        });
        
        uploadCard.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadCard.style.borderColor = 'var(--sidebar-accent)';
            uploadCard.style.backgroundColor = 'rgba(129, 140, 248, 0.05)';
            
            const files = Array.from(e.dataTransfer.files);
            this.handleFiles(files);
        });
    },
    
    // 파일 처리
    async handleFiles(files) {
        const csvFiles = files.filter(file => 
            file.name.toLowerCase().endsWith('.csv') || 
            file.name.toLowerCase().endsWith('.xlsx') || 
            file.name.toLowerCase().endsWith('.xls')
        );
        
        if (csvFiles.length === 0) {
            alert('CSV 또는 Excel 파일을 선택해주세요.');
            return;
        }
        
        this.showFilePreview(csvFiles);
    },
    
    // 파일 미리보기
    showFilePreview(files) {
        const container = document.getElementById('csv-auto-processor');
        const optionsDiv = container.querySelector('.processing-options');
        
        let fileListHtml = '<div style="margin-bottom: 15px;"><h4 style="margin-bottom: 10px; color: var(--text-primary);">선택된 파일:</h4>';
        
        files.forEach((file, index) => {
            const fileType = this.detectFileType(file.name);
            const typeColor = fileType === '사람인' ? 'var(--success)' : 
                             fileType === '잡코리아' ? 'var(--warning)' : 'var(--accent-orange)';
            
            fileListHtml += `
                <div style="display: flex; align-items: center; gap: 10px; padding: 8px; background: rgba(255,255,255,0.7); border-radius: 6px; margin-bottom: 5px;">
                    <i class="fas fa-file-csv" style="color: ${typeColor};"></i>
                    <span style="flex: 1; font-weight: 600;">${file.name}</span>
                    <span style="background: ${typeColor}; color: white; padding: 2px 8px; border-radius: 10px; font-size: 0.8rem;">${fileType}</span>
                    <span style="color: var(--text-secondary); font-size: 0.85rem;">${(file.size / 1024).toFixed(1)}KB</span>
                </div>
            `;
        });
        
        fileListHtml += '</div>';
        optionsDiv.innerHTML = fileListHtml + optionsDiv.innerHTML;
        optionsDiv.style.display = 'block';
        
        this.selectedFiles = files;
    },
    
    // 파일 타입 감지
    detectFileType(filename) {
        const name = filename.toLowerCase();
        if (name.includes('사람인') || name.includes('saramin')) return '사람인';
        if (name.includes('잡코리아') || name.includes('jobkorea')) return '잡코리아';
        return '일반';
    },
    
    // 처리 시작
    async startProcessing() {
        if (this.isProcessing) return;
        
        if (!this.selectedFiles || this.selectedFiles.length === 0) {
            alert('먼저 파일을 선택해주세요.');
            return;
        }
        
        this.isProcessing = true;
        this.processedCount = 0;
        this.totalCount = 0;
        this.errors = [];
        this.duplicates = [];
        
        this.showProcessingOverlay();
        
        try {
            let allData = [];
            
            for (const file of this.selectedFiles) {
                this.addLog(`📁 파일 읽는 중: ${file.name}`);
                const fileData = await this.parseFile(file);
                const cleanedData = this.cleanAndStandardizeData(fileData, file.name);
                allData = allData.concat(cleanedData);
            }
            
            const skipDuplicates = document.getElementById('skipDuplicates').checked;
            if (skipDuplicates) {
                const beforeCount = allData.length;
                allData = this.removeDuplicates(allData);
                const duplicateCount = beforeCount - allData.length;
                if (duplicateCount > 0) {
                    this.addLog(`🔄 중복 제거: ${duplicateCount}개 스킵`);
                }
            }
            
            this.totalCount = allData.length;
            this.addLog(`📊 총 ${this.totalCount}명 처리 시작`);
            
            // 실시간으로 하나씩 저장
            for (let i = 0; i < allData.length; i++) {
                const applicant = allData[i];
                
                try {
                    this.addLog(`💾 저장 중: ${applicant.이름 || `${i+1}번째 지원자`}`);
                    
                    await this.saveToDashboard(applicant);
                    
                    this.processedCount++;
                    this.addLog(`✅ 완료: ${applicant.이름} (${this.processedCount}/${this.totalCount})`);
                    
                    this.updateProgress();
                    
                    // 서버 부하 방지를 위한 지연
                    await new Promise(resolve => setTimeout(resolve, 300));
                    
                } catch (error) {
                    this.errors.push({ name: applicant.이름, error: error.message });
                    this.addLog(`❌ 오류: ${applicant.이름} - ${error.message}`, 'error');
                }
            }
            
            this.showCompletionResult();
            
        } catch (error) {
            this.addLog(`❌ 전체 처리 오류: ${error.message}`, 'error');
            alert(`처리 중 오류가 발생했습니다: ${error.message}`);
        } finally {
            this.isProcessing = false;
        }
    },
    
    // 대시보드 API로 저장 (간소화된 버전)
    async saveToDashboard(applicantData) {
    if (!window.App || !window.App.config) {
        throw new Error('대시보드 시스템에 연결할 수 없습니다.');
    }
    
    try {
        // 기존 Apps Script API URL 사용
        const APPS_SCRIPT_URL = window.App.config.APPS_SCRIPT_URL;
        
        if (!APPS_SCRIPT_URL) {
            throw new Error('Apps Script URL이 설정되지 않았습니다.');
        }
        
        // Apps Script에 직접 POST 요청
        const response = await fetch(APPS_SCRIPT_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                action: 'create',
                data: applicantData
            })
        });
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const result = await response.json();
        
        if (result.status !== 'success') {
            throw new Error(result.message || '저장에 실패했습니다.');
        }
        
        return result;
        
    } catch (error) {
        console.error('Apps Script 저장 오류:', error);
        throw new Error(`저장 실패: ${error.message}`);
    }
},

// 추가: 전체 데이터 동기화 함수 (csvProcessor.js에 추가)
async syncWithAppsScript() {
    try {
        console.log('🔄 Apps Script와 동기화 중...');
        
        if (!window.App || !window.App.config) {
            throw new Error('대시보드 설정을 찾을 수 없습니다.');
        }
        
        const APPS_SCRIPT_URL = window.App.config.APPS_SCRIPT_URL;
        
        // Apps Script에서 전체 데이터 다시 불러오기
        const response = await fetch(`${APPS_SCRIPT_URL}?action=read&t=${Date.now()}`, {
            method: 'GET',
            cache: 'no-cache' // 캐시 무시
        });
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }
        
        const result = await response.json();
        
        if (result.status !== 'success') {
            throw new Error(result.message || '데이터 불러오기 실패');
        }
        
        // 기존 데이터 업데이트
        if (window.App.state && window.App.state.data) {
            window.App.state.data.headers = result.data[0] || [];
            window.App.state.data.all = result.data.slice(1) || [];
            
            // UI 새로고침
            if (window.App.filter && window.App.filter.reset) {
                window.App.filter.reset();
            }
            
            console.log('✅ Apps Script 동기화 완료');
            return true;
        }
        
        return false;
        
    } catch (error) {
        console.error('❌ Apps Script 동기화 실패:', error);
        throw error;
    }
},
    
    // 파일 파싱
    async parseFile(file) {
        if (file.name.toLowerCase().endsWith('.csv')) {
            return await this.parseCSVFile(file);
        } else {
            return await this.parseExcelFile(file);
        }
    },
    
    // CSV 파싱
    async parseCSVFile(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const result = Papa.parse(e.target.result, {
                        header: true,
                        dynamicTyping: true,
                        skipEmptyLines: true,
                        encoding: 'UTF-8'
                    });
                    resolve(result.data);
                } catch (error) {
                    reject(error);
                }
            };
            reader.onerror = () => reject(new Error('파일 읽기 실패'));
            reader.readAsText(file, 'UTF-8');
        });
    },
    
    // Excel 파싱
    async parseExcelFile(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const workbook = XLSX.read(e.target.result, { type: 'array' });
                    const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
                    const data = XLSX.utils.sheet_to_json(firstSheet);
                    resolve(data);
                } catch (error) {
                    reject(error);
                }
            };
            reader.onerror = () => reject(new Error('Excel 파일 읽기 실패'));
            reader.readAsArrayBuffer(file);
        });
    },
    
    // 데이터 정리 및 표준화
    cleanAndStandardizeData(rawData, filename) {
        return rawData.map(row => {
            const cleaned = {};
            
            // 사람인 형식 감지 및 변환
            if (this.isSaraminFormat(row)) {
                cleaned.이름 = row['지원자명'] || row['이름'] || '';
                cleaned.연락처 = this.cleanPhoneNumber(row['연락처'] || row['전화번호'] || '');
                cleaned.지원루트 = '사람인';
                cleaned.모집분야 = row['지원분야'] || row['직무'] || '';
                cleaned.지원일 = this.parseDate(row['지원일시'] || row['지원일'] || '');
                cleaned.경력 = row['경력'] || '';
                cleaned.학력 = row['학력'] || '';
                cleaned.나이 = this.calculateAge(row['생년월일'] || '') || row['나이'] || '';
                cleaned.성별 = row['성별'] || '';
                cleaned.지역 = row['거주지역'] || row['주소'] || '';
            }
            // 잡코리아 형식
            else if (this.isJobkoreaFormat(row)) {
                cleaned.이름 = row['성명'] || row['이름'] || '';
                cleaned.연락처 = this.cleanPhoneNumber(row['휴대폰'] || row['연락처'] || '');
                cleaned.지원루트 = '잡코리아';
                cleaned.모집분야 = row['지원직무'] || row['희망직종'] || '';
                cleaned.지원일 = this.parseDate(row['접수일'] || row['지원일'] || '');
                cleaned.경력 = row['총경력'] || '';
                cleaned.학력 = row['최종학력'] || '';
                cleaned.나이 = row['나이'] || this.calculateAge(row['생년월일'] || '');
                cleaned.성별 = row['성별'] || '';
                cleaned.지역 = row['희망근무지'] || row['주소'] || '';
            }
            // 기본 매핑
            else {
                Object.keys(row).forEach(key => {
                    const standardKey = this.mapToStandardField(key);
                    if (standardKey) {
                        cleaned[standardKey] = row[key];
                    }
                });
                
                if (!cleaned.지원루트) {
                    cleaned.지원루트 = this.detectFileType(filename) || '기타';
                }
            }
            
            // 기본 필드 추가
            cleaned.구분 = '';
            cleaned['1차 컨택 결과'] = '';
            cleaned.비고 = `${filename}에서 자동 입력 (${new Date().toLocaleString()})`;
            
            return cleaned;
        }).filter(item => item.이름 && item.이름.trim() !== '');
    },
    
    // 헬퍼 함수들
    isSaraminFormat(row) {
        const saraminFields = ['지원자명', '지원일시', '지원분야'];
        return saraminFields.some(field => row.hasOwnProperty(field));
    },
    
    isJobkoreaFormat(row) {
        const jobkoreaFields = ['성명', '접수일', '지원직무'];
        return jobkoreaFields.some(field => row.hasOwnProperty(field));
    },
    
    mapToStandardField(fieldName) {
        const mapping = {
            '성명': '이름', '지원자명': '이름', '휴대폰': '연락처', '전화번호': '연락처',
            '접수일': '지원일', '지원일시': '지원일', '지원분야': '모집분야', '지원직무': '모집분야',
            '희망직종': '모집분야', '총경력': '경력', '최종학력': '학력', '거주지역': '지역',
            '희망근무지': '지역'
        };
        return mapping[fieldName] || null;
    },
    
    cleanPhoneNumber(phone) {
        if (!phone) return '';
        return phone.toString().replace(/[^\d]/g, '').replace(/(\d{3})(\d{4})(\d{4})/, '$1-$2-$3');
    },
    
    parseDate(dateStr) {
        if (!dateStr) return '';
        try {
            const date = new Date(dateStr);
            return date.toISOString().split('T')[0];
        } catch {
            return dateStr;
        }
    },
    
    calculateAge(birthDate) {
        if (!birthDate) return '';
        try {
            const birth = new Date(birthDate);
            const today = new Date();
            let age = today.getFullYear() - birth.getFullYear();
            const monthDiff = today.getMonth() - birth.getMonth();
            if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
                age--;
            }
            return age.toString();
        } catch {
            return '';
        }
    },
    
    removeDuplicates(data) {
        const seen = new Set();
        return data.filter(item => {
            const key = `${item.이름}_${item.연락처}`;
            if (seen.has(key)) {
                this.duplicates.push(item.이름);
                return false;
            }
            seen.add(key);
            return true;
        });
    },
    
    // UI 업데이트 함수들
    showProcessingOverlay() {
        const overlay = document.querySelector('.processing-overlay');
        overlay.style.display = 'block';
    },
    
    addLog(message, type = 'info') {
        const logContainer = document.querySelector('.processing-log');
        const logEntry = document.createElement('div');
        logEntry.className = 'log-entry';
        
        const colors = {
            info: 'var(--text-primary)',
            error: 'var(--danger)',
            success: 'var(--success)',
            warning: 'var(--warning)'
        };
        
        logEntry.style.color = colors[type] || colors.info;
        logEntry.textContent = `${new Date().toLocaleTimeString()} - ${message}`;
        
        logContainer.appendChild(logEntry);
        logContainer.scrollTop = logContainer.scrollHeight;
    },
    
    updateProgress() {
        const progressFill = document.querySelector('.progress-fill');
        const currentProgress = document.querySelector('.current-progress');
        const progressPercentage = document.querySelector('.progress-percentage');
        
        const percentage = Math.round((this.processedCount / this.totalCount) * 100);
        
        progressFill.style.width = `${percentage}%`;
        currentProgress.textContent = `${this.processedCount} / ${this.totalCount}`;
        progressPercentage.textContent = `${percentage}%`;
    },
    
    showCompletionResult() {
    const overlay = document.querySelector('.processing-overlay');
    
    const successCount = this.processedCount;
    const errorCount = this.errors.length;
    const duplicateCount = this.duplicates.length;
    
    overlay.innerHTML = `
        <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; padding: 40px;">
            <div style="background: var(--success); border-radius: 50%; width: 80px; height: 80px; display: flex; align-items: center; justify-content: center; margin-bottom: 20px;">
                <i class="fas fa-check" style="color: white; font-size: 2rem;"></i>
            </div>
            
            <h3 style="margin: 0 0 20px 0; color: var(--text-primary);">🎉 처리 완료!</h3>
            
            <div style="background: white; border-radius: 12px; padding: 20px; width: 100%; max-width: 400px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 20px;">
                    <div style="text-align: center; padding: 15px; background: var(--success); color: white; border-radius: 8px;">
                        <div style="font-size: 1.5rem; font-weight: 700;">${successCount}</div>
                        <div style="font-size: 0.9rem;">성공</div>
                    </div>
                    ${errorCount > 0 ? `
                    <div style="text-align: center; padding: 15px; background: var(--danger); color: white; border-radius: 8px;">
                        <div style="font-size: 1.5rem; font-weight: 700;">${errorCount}</div>
                        <div style="font-size: 0.9rem;">오류</div>
                    </div>
                    ` : `
                    <div style="text-align: center; padding: 15px; background: var(--warning); color: white; border-radius: 8px;">
                        <div style="font-size: 1.5rem; font-weight: 700;">${duplicateCount}</div>
                        <div style="font-size: 0.9rem;">중복 스킵</div>
                    </div>
                    `}
                </div>
                
                ${errorCount > 0 ? `
                <div style="margin-bottom: 15px;">
                    <h4 style="color: var(--danger); margin-bottom: 10px;">오류 발생 항목:</h4>
                    <div style="max-height: 100px; overflow-y: auto; background: var(--main-bg); padding: 10px; border-radius: 6px; font-size: 0.85rem;">
                        ${this.errors.map(err => `<div>• ${err.name}: ${err.error}</div>`).join('')}
                    </div>
                </div>
                ` : ''}
                
                <!-- Apps Script 동기화 진행 -->
                <div id="sync-status" style="background: rgba(129, 140, 248, 0.1); padding: 15px; border-radius: 8px; margin-bottom: 15px; text-align: center;">
                    <div style="color: var(--sidebar-accent); font-weight: 600; margin-bottom: 5px;">
                        <i class="fas fa-sync-alt fa-spin"></i> 화면 동기화 중...
                    </div>
                    <div style="font-size: 0.85rem; color: var(--text-secondary);">
                        잠시만 기다려주세요
                    </div>
                </div>
                
                <div style="display: flex; gap: 10px;">
                    <button onclick="window.CSVProcessor.reset()" style="
                        flex: 1;
                        background: var(--border-color);
                        color: var(--text-primary);
                        border: none;
                        padding: 12px;
                        border-radius: 8px;
                        font-weight: 700;
                        cursor: pointer;
                    ">
                        계속 작업
                    </button>
                    <button onclick="location.reload()" style="
                        flex: 1;
                        background: var(--sidebar-accent);
                        color: white;
                        border: none;
                        padding: 12px;
                        border-radius: 8px;
                        font-weight: 700;
                        cursor: pointer;
                    ">
                        <i class="fas fa-sync-alt"></i> 새로고침
                    </button>
                </div>
            </div>
        </div>
    `;
    
    // Apps Script와 자동 동기화 시작
    this.performAutoSync();
},

    // 자동 동기화 수행 (csvProcessor.js에 추가)
async performAutoSync() {
    const syncStatus = document.getElementById('sync-status');
    
    try {
        // 2초 후 동기화 시작 (저장 완료를 위한 여유시간)
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Apps Script 동기화 실행
        await this.syncWithAppsScript();
        
        // 성공 상태 표시
        if (syncStatus) {
            syncStatus.innerHTML = `
                <div style="color: var(--success); font-weight: 600; margin-bottom: 5px;">
                    <i class="fas fa-check-circle"></i> 동기화 완료!
                </div>
                <div style="font-size: 0.85rem; color: var(--text-secondary);">
                    새 데이터가 화면에 반영되었습니다
                </div>
            `;
            syncStatus.style.background = 'rgba(16, 185, 129, 0.1)';
        }
        
        // 성공 알림
        this.showSuccessNotification('✅ 새 지원자들이 화면에 나타났습니다!');
        
    } catch (error) {
        console.error('❌ 자동 동기화 실패:', error);
        
        // 실패 상태 표시
        if (syncStatus) {
            syncStatus.innerHTML = `
                <div style="color: var(--danger); font-weight: 600; margin-bottom: 5px;">
                    <i class="fas fa-exclamation-triangle"></i> 동기화 실패
                </div>
                <div style="font-size: 0.85rem; color: var(--text-secondary);">
                    수동으로 새로고침해주세요
                </div>
            `;
            syncStatus.style.background = 'rgba(239, 68, 68, 0.1)';
        }
    }
}
    
    // 리셋
    reset() {
        const container = document.getElementById('csv-auto-processor');
        if (container) {
            container.remove();
        }
        
        this.selectedFiles = null;
        this.isProcessing = false;
        this.processedCount = 0;
        this.totalCount = 0;
        this.errors = [];
        this.duplicates = [];
        
        this.addToPage();
    },
    
    // 페이지에 추가
    addToPage() {
        const uploadZone = this.createUploadZone();
        const contentArea = document.querySelector('.content-area');
        if (contentArea && contentArea.firstChild) {
            contentArea.insertBefore(uploadZone, contentArea.firstChild);
        }
    }
};
