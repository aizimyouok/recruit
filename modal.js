// =========================
// modal.js - 모달 관련 모듈 (즉시 반영 버전)
// =========================

export const ModalModule = {
    get element() {
        return document.getElementById('applicantModal');
    },

    openNew(appInstance) {
        document.querySelector('#applicantModal .modal-title').textContent = '신규 지원자 등록';
        ModalModule.buildForm(appInstance);
        document.querySelector('#applicantModal .modal-footer').innerHTML = `<button class="primary-btn" onclick="globalThis.App.modal.saveNew()">저장하기</button>`;
        ModalModule.element.style.display = 'flex';
    },

    openDetail(appInstance, rowData) {
        document.querySelector('#applicantModal .modal-title').textContent = '지원자 상세 정보';
        ModalModule.buildForm(appInstance, rowData, true);

        document.querySelector('#applicantModal .modal-footer').innerHTML = `
            <div style="display: flex; gap: 10px; justify-content: flex-end;">
                <button class="modal-close-btn" onclick="globalThis.App.modal.close()">
                    <i class="fas fa-times"></i> 닫기
                </button>
                <button class="modal-edit-btn" onclick="globalThis.App.modal.openEdit()">
                    <i class="fas fa-edit"></i> 수정
                </button>
                <button class="modal-delete-btn" onclick="globalThis.App.modal.delete()">
                    <i class="fas fa-trash"></i> 삭제
                </button>
            </div>
        `;

        appInstance.state.ui.currentEditingData = [...rowData];
        ModalModule.element.style.display = 'flex';
    },

    openEdit(appInstance) {
        if (!appInstance.state.ui.currentEditingData) {
            alert('편집할 데이터가 없습니다.');
            return;
        }

        document.querySelector('#applicantModal .modal-title').textContent = '지원자 정보 수정';
        ModalModule.buildForm(appInstance, appInstance.state.ui.currentEditingData, false);

        document.querySelector('#applicantModal .modal-footer').innerHTML = `
            <div style="display: flex; gap: 10px; justify-content: flex-end;">
                <button class="modal-close-btn" onclick="globalThis.App.modal.close()">
                    <i class="fas fa-times"></i> 취소
                </button>
                <button class="modal-edit-btn" onclick="globalThis.App.modal.saveEdit()">
                    <i class="fas fa-save"></i> 저장
                </button>
            </div>
        `;
    },

    close(appInstance) {
        ModalModule.element.style.display = 'none';
        document.getElementById('applicantForm').innerHTML = '';
        if (appInstance) {
            appInstance.state.ui.currentEditingData = null;
        }
    },

    buildForm(appInstance, data = null, isReadOnly = false) {
        const form = document.getElementById('applicantForm');
        form.innerHTML = '';

        appInstance.state.data.headers.forEach((header, index) => {
            const formGroup = document.createElement('div');
            formGroup.className = `form-group ${header === '비고' || header === '면접리뷰' ? 'full-width' : ''}`;

            const isRequired = appInstance.config.REQUIRED_FIELDS.includes(header) && !isReadOnly;

            let value = '';
            if (data) {
                value = String(data[index] || '');
            } else {
                if (header === '구분') value = appInstance.state.ui.nextSequenceNumber;
                else if (header === '지원일') {
                    const now = new Date();
                    const year = now.getFullYear();
                    const month = String(now.getMonth() + 1).padStart(2, '0');
                    const day = String(now.getDate()).padStart(2, '0');
                    value = `${year}-${month}-${day}`;
                }
            }

            if ((appInstance.config.DATE_FIELDS.includes(header) || header === '지원일') && value && value !== '-') {
                value = appInstance.utils.formatDateForInput(value);
            }

            const inputHtml = ModalModule.createInput(appInstance, header, value, isRequired, isReadOnly);
            formGroup.innerHTML = `<label for="modal-form-${header}">${header}${isRequired ? ' *' : ''}</label>${inputHtml}`;
            form.appendChild(formGroup);
        });
    },

    createInput(appInstance, header, value, isRequired, isDisabled) {
        const isDisabledOrReadOnly = isDisabled || header === '구분';

        if (header === '연락처') {
            return `<input type="tel" id="modal-form-${header}" value="${value}" oninput="globalThis.App.utils.formatPhoneNumber(this)" ${isRequired ? 'required' : ''} ${isDisabledOrReadOnly ? 'disabled' : ''}>`;
        } else if (appInstance.config.DATE_FIELDS.includes(header) || header === '지원일') {
            return `<input type="date" id="modal-form-${header}" value="${value}" ${isRequired ? 'required' : ''} ${isDisabledOrReadOnly ? 'disabled' : ''}>`;
        } else if (appInstance.config.TIME_FIELDS.includes(header)) {
            return `<input type="text" id="modal-form-${header}" value="${value}" placeholder="예: 14시 30분" ${isRequired ? 'required' : ''} ${isDisabledOrReadOnly ? 'disabled' : ''}>`;
        } else if (appInstance.config.DROPDOWN_OPTIONS[header]) {
            return ModalModule.createDropdownInput(appInstance, header, value, isRequired, isDisabledOrReadOnly);
        } else if (header === '비고' || header === '면접리뷰') {
            return `<textarea id="modal-form-${header}" rows="3" ${isDisabledOrReadOnly ? 'disabled' : ''}>${value}</textarea>`;
        } else {
            return `<input type="text" id="modal-form-${header}" value="${value}" ${isRequired ? 'required' : ''} ${isDisabledOrReadOnly ? 'disabled' : ''} ${header === '구분' ? 'style="background-color: #f1f5f9;"' : ''}>`;
        }
    },

    createDropdownInput(appInstance, header, value, isRequired, isDisabled) {
        const options = appInstance.config.DROPDOWN_OPTIONS[header];
        const hasDirectInput = options.includes('직접입력');
        let customValue = '';
        let selectValue = value;

        if (hasDirectInput && !options.includes(value) && value) {
            selectValue = '직접입력';
            customValue = value;
        }

        let html = `<select id="modal-form-${header}" ${hasDirectInput ? `onchange="globalThis.App.modal.handleDropdownChange(this, '${header}')"` : ''} ${isRequired ? 'required' : ''} ${isDisabled ? 'disabled' : ''}>
                        <option value="">선택해주세요</option>
                        ${options.map(option => `<option value="${option}" ${selectValue === option ? 'selected' : ''}>${option}</option>`).join('')}
                    </select>`;

        if(hasDirectInput) {
            html += `<input type="text" id="modal-form-${header}-custom" value="${customValue}" placeholder="직접 입력하세요" style="display:${selectValue === '직접입력' ? 'block' : 'none'}; margin-top:5px;" ${isDisabled ? 'disabled' : ''}>`;
        }

        return html;
    },

    handleDropdownChange(selectElement, fieldName) {
        const customInput = document.getElementById(`modal-form-${fieldName}-custom`);
        const isDirectInput = selectElement.value === '직접입력';

        if (customInput) {
            customInput.style.display = isDirectInput ? 'block' : 'none';
            if(isDirectInput) customInput.focus();
        }

        const isRequired = document.querySelector(`label[for="modal-form-${fieldName}"]`).textContent.includes('*');
        if(isRequired){
            if(isDirectInput){
                selectElement.removeAttribute('required');
                if (customInput) customInput.setAttribute('required', '');
            } else {
                if (customInput) customInput.removeAttribute('required');
                selectElement.setAttribute('required', '');
            }
        }
    },

    async saveNew(appInstance) {
        const saveBtn = document.querySelector('#applicantModal .modal-footer .primary-btn');
        const originalText = saveBtn.innerHTML;

        try {
            const applicantData = ModalModule.collectFormData(appInstance);

            if (!ModalModule.validateFormData(appInstance, applicantData)) {
                alert('필수 항목을 모두 입력해주세요.');
                return;
            }

            if (appInstance.state.data.headers.includes('구분')) {
                applicantData['구분'] = appInstance.state.ui.nextSequenceNumber.toString();
            }
            if (appInstance.state.data.headers.includes('지원일')) {
                applicantData['지원일'] = new Date().toISOString().split('T')[0];
            }

            ModalModule.prepareTimeData(applicantData);

            saveBtn.disabled = true;
            saveBtn.innerHTML = '<div class="advanced-loading-spinner" style="width: 20px; height: 20px; margin: 0;"></div> 저장 중...';

            // 서버에 저장
            await appInstance.data.save(applicantData);

            // 🔥 즉시 반영을 위한 캐시 완전 초기화 및 데이터 새로고침
            await ModalModule.refreshDataImmediate(appInstance);

            ModalModule.close(appInstance);
            
            // 성공 알림
            ModalModule.showSuccessNotification('새 지원자가 성공적으로 등록되었습니다! 🎉');

        } catch (error) {
            console.error("데이터 저장 실패:", error);
            alert("데이터 저장 중 오류 발생: " + error.message);
        } finally {
            saveBtn.disabled = false;
            saveBtn.innerHTML = originalText;
        }
    },

    async saveEdit(appInstance) {
        const saveBtn = document.querySelector('#applicantModal .modal-footer .modal-edit-btn');
        const originalText = saveBtn.innerHTML;

        try {
            const updatedData = ModalModule.collectFormData(appInstance);

            if (!ModalModule.validateFormData(appInstance, updatedData)) {
                alert('필수 항목을 모두 입력해주세요.');
                return;
            }

            ModalModule.prepareTimeData(updatedData);

            const gubunIndex = appInstance.state.data.headers.indexOf('구분');
            if (gubunIndex === -1 || !appInstance.state.ui.currentEditingData) {
                alert('편집 정보를 찾을 수 없습니다.');
                return;
            }

            const gubunValue = appInstance.state.ui.currentEditingData[gubunIndex];
            if (!gubunValue) {
                alert('구분값을 찾을 수 없습니다.');
                return;
            }

            saveBtn.disabled = true;
            saveBtn.innerHTML = '<div class="advanced-loading-spinner" style="width: 20px; height: 20px; margin: 0;"></div> 저장 중...';

            // 서버에 수정 저장
            await appInstance.data.save(updatedData, true, gubunValue);

            // 🔥 즉시 반영을 위한 캐시 완전 초기화 및 데이터 새로고침
            await ModalModule.refreshDataImmediate(appInstance);

            alert('정보가 성공적으로 수정되었습니다.');
            ModalModule.close(appInstance);
            
            // 성공 알림
            ModalModule.showSuccessNotification('지원자 정보가 성공적으로 수정되었습니다! ✏️');

        } catch (error) {
            console.error("데이터 수정 실패:", error);
            alert("데이터 수정 중 오류 발생: " + error.message);
        } finally {
            saveBtn.disabled = false;
            saveBtn.innerHTML = originalText;
        }
    },

    async delete(appInstance) {
        if (!appInstance.state.ui.currentEditingData) {
            alert('삭제할 데이터가 없습니다.');
            return;
        }

        const gubunIndex = appInstance.state.data.headers.indexOf('구분');
        const nameIndex = appInstance.state.data.headers.indexOf('이름');

        if (gubunIndex === -1) {
            alert('삭제를 위한 고유 식별자(구분)를 찾을 수 없습니다.');
            return;
        }

        const gubunValue = appInstance.state.ui.currentEditingData[gubunIndex];
        const applicantName = appInstance.state.ui.currentEditingData[nameIndex] || '해당 지원자';

        if (!confirm(`정말로 '${applicantName}' 님의 정보를 삭제하시겠습니까?\n이 작업은 되돌릴 수 없습니다.`)) {
            return;
        }

        const deleteBtn = document.querySelector('.modal-delete-btn');
        const originalText = deleteBtn.innerHTML;

        try {
            deleteBtn.disabled = true;
            deleteBtn.innerHTML = '<div class="advanced-loading-spinner" style="width: 20px; height: 20px; margin: 0;"></div> 삭제 중...';

            // 서버에서 삭제
            await appInstance.data.delete(gubunValue);

            // 🔥 즉시 반영을 위한 캐시 완전 초기화 및 데이터 새로고침
            await ModalModule.refreshDataImmediate(appInstance);

            alert(`'${applicantName}' 님의 정보가 성공적으로 삭제되었습니다.`);
            ModalModule.close(appInstance);
            
            // 성공 알림
            ModalModule.showSuccessNotification('지원자 정보가 성공적으로 삭제되었습니다! 🗑️');

        } catch (error) {
            console.error("데이터 삭제 실패:", error);
            alert("데이터 삭제 중 오류가 발생했습니다: " + error.message);
            deleteBtn.disabled = false;
            deleteBtn.innerHTML = originalText;
        }
    },

    // 🔥 새로운 함수: 즉시 데이터 새로고침
    async refreshDataImmediate(appInstance) {
        console.log('🔄 즉시 데이터 새로고침 시작...');
        
        try {
            // 1. 모든 캐시 완전 초기화
            if (appInstance.cache) {
                appInstance.cache.invalidate();
                console.log('✅ CacheModule 초기화 완료');
            }
            
            if (appInstance.dataCache) {
                appInstance.dataCache.clearCache();
                console.log('✅ DataCacheModule 초기화 완료');
            }
            
            // 2. 강제로 서버에서 새 데이터 가져오기
            console.log('🌐 서버에서 최신 데이터 가져오는 중...');
            
            // 기존 데이터 임시 백업 (에러 발생 시 복구용)
            const backupData = {
                headers: [...appInstance.state.data.headers],
                all: [...appInstance.state.data.all]
            };
            
            // 강제로 fetch (캐시 무시)
            const response = await fetch(`${appInstance.config.APPS_SCRIPT_URL}?action=read&_t=${Date.now()}`, {
                method: 'GET',
                cache: 'no-cache',
                headers: {
                    'Cache-Control': 'no-cache, no-store, must-revalidate',
                    'Pragma': 'no-cache',
                    'Expires': '0'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const result = await response.json();

            if (result.status !== 'success' || !result.data || !Array.isArray(result.data) || result.data.length === 0) {
                throw new Error('서버에서 올바른 데이터를 받지 못했습니다.');
            }

            // 3. 새 데이터로 상태 업데이트
            appInstance.state.data.headers = (result.data[0] || []).map(h => String(h || '').trim());
            appInstance.state.data.all = result.data.slice(1)
                .filter(row => row && Array.isArray(row) && row.some(cell => cell != null && String(cell).trim() !== ''))
                .map(row => row.map(cell => cell == null ? '' : String(cell)));

            console.log(`✅ 새 데이터 로드 완료: ${appInstance.state.data.all.length}개 항목`);

            // 4. UI 업데이트
            appInstance.data.updateSequenceNumber();
            appInstance.state.ui.visibleColumns = appInstance.utils.generateVisibleColumns(appInstance.state.data.headers);
            
            if (appInstance.filter && appInstance.filter.populateDropdowns) {
                appInstance.filter.populateDropdowns();
            }
            
            if (appInstance.sidebar && appInstance.sidebar.updateWidgets) {
                appInstance.sidebar.updateWidgets();
            }
            
            appInstance.data.updateInterviewSchedule();
            
            // 5. 현재 필터 다시 적용
            if (appInstance.filter && appInstance.filter.apply) {
                appInstance.filter.apply();
            }

            console.log('✅ 즉시 데이터 새로고침 완료!');

        } catch (error) {
            console.error('❌ 즉시 데이터 새로고침 실패:', error);
            
            // 에러 발생 시 기존 방식으로 fallback
            console.log('🔄 기존 방식으로 데이터 새로고침 시도...');
            try {
                await appInstance.data.fetch();
                console.log('✅ 기존 방식으로 새로고침 성공');
            } catch (fallbackError) {
                console.error('❌ 기존 방식 새로고침도 실패:', fallbackError);
                alert('데이터 새로고침에 실패했습니다. 페이지를 새로고침해주세요.');
            }
        }
    },

    // 🔥 새로운 함수: 성공 알림 표시
    showSuccessNotification(message) {
        // 기존 알림이 있으면 제거
        const existingNotifications = document.querySelectorAll('.success-notification');
        existingNotifications.forEach(notification => notification.remove());

        const notification = document.createElement('div');
        notification.className = 'success-notification';
        
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(135deg, #10b981, #059669);
            color: white;
            padding: 15px 25px;
            border-radius: 12px;
            box-shadow: 0 4px 20px rgba(16, 185, 129, 0.3);
            z-index: 3000;
            font-weight: 600;
            font-size: 0.95rem;
            transform: translateX(400px);
            opacity: 0;
            transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
            border-left: 4px solid rgba(255, 255, 255, 0.8);
            min-width: 300px;
            text-align: center;
        `;
        
        notification.innerHTML = `
            <div style="display: flex; align-items: center; gap: 10px; justify-content: center;">
                <i class="fas fa-check-circle" style="font-size: 1.2rem;"></i>
                <span>${message}</span>
            </div>
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
    },

    collectFormData(appInstance) {
        const applicantData = {};
        appInstance.state.data.headers.forEach(header => {
            const input = document.getElementById(`modal-form-${header}`);
            const customInput = document.getElementById(`modal-form-${header}-custom`);
            if (input) {
                let value = (customInput && customInput.style.display !== 'none') ? customInput.value : input.value;
                applicantData[header] = value;
            }
        });
        return applicantData;
    },

    validateFormData(appInstance, data) {
        return appInstance.config.REQUIRED_FIELDS.every(field => data[field] && data[field].trim() !== '');
    },

    prepareTimeData(data) {
        const timeHeader = '면접 시간';
        if (data[timeHeader]) {
            data[timeHeader] = "'" + data[timeHeader];
        }
    }
};
