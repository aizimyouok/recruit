// modal.js - 개선된 빠른 처리 버전 (시간 표시 버그 수정 및 나이 계산 기능 추가)

const ModalModule = {
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

        // ▼▼▼▼▼ [수정된 코드] 나이 계산 로직 ▼▼▼▼▼
        const birthYearInput = document.getElementById('modal-form-출생년도');
        const ageInput = document.getElementById('modal-form-나이');

        if (birthYearInput && ageInput) {
            // 나이 필드는 항상 비활성화하고, 읽기 전용처럼 보이게 스타일링
            ageInput.readOnly = true;
            ageInput.style.backgroundColor = '#f1f5f9';
            ageInput.style.cursor = 'not-allowed';


            const calculateAge = () => {
                const birthYearValue = birthYearInput.value.trim();
                if (birthYearValue && (birthYearValue.length === 2 || birthYearValue.length === 4)) {
                    let year = parseInt(birthYearValue, 10);
                    if (!isNaN(year)) {
                        if (birthYearValue.length === 2) {
                            // 2자리 입력 시 19xx 또는 20xx으로 변환
                            // 현재 연도의 뒷 2자리보다 크면 19xx, 작거나 같으면 20xx
                            const currentYearLastTwoDigits = new Date().getFullYear() % 100;
                            year += (year > currentYearLastTwoDigits) ? 1900 : 2000;
                        }
                        const currentYear = new Date().getFullYear();
                        const age = currentYear - year + 1;
                        ageInput.value = age > 0 ? age : '';
                    } else {
                         ageInput.value = '';
                    }
                } else {
                    ageInput.value = '';
                }
            };

            // 출생년도 입력 시 나이 계산 (input 이벤트 사용)
            birthYearInput.addEventListener('input', calculateAge);
            
            // 모달이 열릴 때 기존 값으로 나이 계산
            if (birthYearInput.value) {
                calculateAge();
            }
        }
        // ▲▲▲▲▲ [수정된 코드] 나이 계산 로직 ▲▲▲▲▲
    },

    // modal.js

    createInput(appInstance, header, value, isRequired, isDisabled) {
        // '나이' 필드는 항상 비활성화되도록 수정
        const isAgeField = header === '나이';
        const isDisabledOrReadOnly = isDisabled || header === '구분' || isAgeField;

        if (header === '연락처') {
            return `<input type="tel" id="modal-form-${header}" value="${value}" oninput="globalThis.App.utils.formatPhoneNumber(this)" ${isRequired ? 'required' : ''} ${isDisabledOrReadOnly ? 'disabled' : ''}>`;
        } else if (appInstance.config.DATE_FIELDS.includes(header) || header === '지원일') {
            return `<input type="date" id="modal-form-${header}" value="${value}" ${isRequired ? 'required' : ''} ${isDisabledOrReadOnly ? 'disabled' : ''}>`;
        } else if (appInstance.config.TIME_FIELDS.includes(header)) {
            return `<input type="text" id="modal-form-${header}" value="${value}" placeholder="예: 14시 30분" ${isRequired ? 'required' : ''} ${isDisabledOrReadOnly ? 'disabled' : ''}>`;
        
        // ▼▼▼▼▼ [추가된 코드] 출생년도 placeholder 추가 ▼▼▼▼▼
        } else if (header === '출생년도') {
            return `<input type="text" id="modal-form-${header}" value="${value}" placeholder="출생년도 뒷 2자리만 입력" ${isRequired ? 'required' : ''} ${isDisabledOrReadOnly ? 'disabled' : ''}>`;
        // ▲▲▲▲▲ [추가된 코드] 출생년도 placeholder 추가 ▲▲▲▲▲
            
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

    // 🔥 개선된 신규 저장 - 시간 표시 버그 수정
    async saveNew(appInstance) {
        const saveBtn = document.querySelector('#applicantModal .modal-footer .primary-btn');
        const originalText = saveBtn.innerHTML;

        try {
            const applicantData = ModalModule.collectFormData(appInstance);

            if (!ModalModule.validateFormData(appInstance, applicantData)) {
                alert('필수 항목을 모두 입력해주세요.');
                return;
            }

            // 구분 번호 자동 설정
            if (appInstance.state.data.headers.includes('구분')) {
                applicantData['구분'] = appInstance.state.ui.nextSequenceNumber.toString();
            }
            
            // 지원일이 비어있을 때만 오늘 날짜 설정
            if (appInstance.state.data.headers.includes('지원일')) {
                if (!applicantData['지원일'] || applicantData['지원일'].trim() === '') {
                    applicantData['지원일'] = new Date().toISOString().split('T')[0];
                }
            }

            saveBtn.disabled = true;
            saveBtn.innerHTML = '<div class="advanced-loading-spinner" style="width: 20px; height: 20px; margin: 0;"></div> 저장 중...';

            // 🔥 수정: 서버 전송용과 로컬 업데이트용 데이터 분리
            const serverData = { ...applicantData };
            const localData = { ...applicantData };
            
            // 🔥 서버 전송용에만 '를 붙임
            ModalModule.prepareTimeData(serverData);

            // 🔥 1단계: 낙관적 업데이트 - 원본 데이터로 UI 반영
            ModalModule.performOptimisticUpdate(appInstance, localData, 'create');

            // 🔥 2단계: 서버에 저장 - '가 붙은 데이터로 전송
            const serverSavePromise = appInstance.data.save(serverData);

            // 🔥 3단계: 사용자에게 즉시 피드백
            ModalModule.close(appInstance);
            ModalModule.showSuccessNotification('새 지원자가 등록되었습니다! 🎉');

            // 🔥 4단계: 서버 응답 처리 (백그라운드에서)
            try {
                await serverSavePromise;
                console.log('✅ 서버 저장 완료');
                
                // 🔥 5단계: 빠른 검증 (1초 후)
                setTimeout(async () => {
                    await ModalModule.quickValidateAndSync(appInstance);
                }, 1000);
                
            } catch (error) {
                console.error('❌ 서버 저장 실패:', error);
                // 낙관적 업데이트 롤백
                ModalModule.rollbackOptimisticUpdate(appInstance);
                alert('저장에 실패했습니다: ' + error.message);
            }

        } catch (error) {
            console.error("데이터 저장 실패:", error);
            alert("데이터 저장 중 오류 발생: " + error.message);
        } finally {
            saveBtn.disabled = false;
            saveBtn.innerHTML = originalText;
        }
    },

    // 🔥 개선된 수정 저장 - 시간 표시 버그 수정
    async saveEdit(appInstance) {
        const saveBtn = document.querySelector('#applicantModal .modal-footer .modal-edit-btn');
        const originalText = saveBtn.innerHTML;

        try {
            const updatedData = ModalModule.collectFormData(appInstance);

            if (!ModalModule.validateFormData(appInstance, updatedData)) {
                alert('필수 항목을 모두 입력해주세요.');
                return;
            }

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

            // 🔥 수정: 서버 전송용과 로컬 업데이트용 데이터 분리
            const serverData = { ...updatedData };
            const localData = { ...updatedData };
            
            // 🔥 서버 전송용에만 '를 붙임
            ModalModule.prepareTimeData(serverData);

            // 🔥 낙관적 업데이트 - 원본 데이터로 UI 반영
            ModalModule.performOptimisticUpdate(appInstance, localData, 'update', gubunValue);

            // 🔥 서버에 저장 - '가 붙은 데이터로 전송
            const serverSavePromise = appInstance.data.save(serverData, true, gubunValue);

            // 🔥 즉시 피드백
            ModalModule.close(appInstance);
            ModalModule.showSuccessNotification('지원자 정보가 수정되었습니다! ✏️');

            // 🔥 서버 응답 처리
            try {
                await serverSavePromise;
                console.log('✅ 서버 수정 완료');
                
                // 빠른 검증
                setTimeout(async () => {
                    await ModalModule.quickValidateAndSync(appInstance);
                }, 1000);
                
            } catch (error) {
                console.error('❌ 서버 수정 실패:', error);
                ModalModule.rollbackOptimisticUpdate(appInstance);
                alert('수정에 실패했습니다: ' + error.message);
            }

        } catch (error) {
            console.error("데이터 수정 실패:", error);
            alert("데이터 수정 중 오류 발생: " + error.message);
        } finally {
            saveBtn.disabled = false;
            saveBtn.innerHTML = originalText;
        }
    },

    // 🔥 개선된 삭제
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

            // 🔥 낙관적 업데이트
            ModalModule.performOptimisticUpdate(appInstance, null, 'delete', gubunValue);

            // 🔥 서버에서 삭제 (백그라운드)
            const serverDeletePromise = appInstance.data.delete(gubunValue);

            // 🔥 즉시 피드백
            ModalModule.close(appInstance);
            ModalModule.showSuccessNotification('지원자 정보가 삭제되었습니다! 🗑️');

            // 🔥 서버 응답 처리
            try {
                await serverDeletePromise;
                console.log('✅ 서버 삭제 완료');
                
                // 빠른 검증
                setTimeout(async () => {
                    await ModalModule.quickValidateAndSync(appInstance);
                }, 1000);
                
            } catch (error) {
                console.error('❌ 서버 삭제 실패:', error);
                ModalModule.rollbackOptimisticUpdate(appInstance);
                alert('삭제에 실패했습니다: ' + error.message);
            }

        } catch (error) {
            console.error("데이터 삭제 실패:", error);
            alert("데이터 삭제 중 오류가 발생했습니다: " + error.message);
            deleteBtn.disabled = false;
            deleteBtn.innerHTML = originalText;
        }
    },

    // 🔥 새로운 함수: 낙관적 업데이트
    performOptimisticUpdate(appInstance, data, operation, gubun = null) {
        console.log('⚡ 낙관적 업데이트 실행:', operation);
        
        if (operation === 'create') {
            // 새 데이터를 로컬 상태에 즉시 추가
            const newRow = appInstance.state.data.headers.map(header => data[header] || '');
            appInstance.state.data.all.push(newRow);
            appInstance.data.updateSequenceNumber();
            
        } else if (operation === 'update') {
            // 기존 데이터를 로컬 상태에서 즉시 수정
            const gubunIndex = appInstance.state.data.headers.indexOf('구분');
            const targetIndex = appInstance.state.data.all.findIndex(row => row[gubunIndex] === gubun);
            
            if (targetIndex !== -1) {
                const updatedRow = appInstance.state.data.headers.map(header => data[header] || '');
                appInstance.state.data.all[targetIndex] = updatedRow;
            }
            
        } else if (operation === 'delete') {
            // 로컬 상태에서 즉시 삭제
            const gubunIndex = appInstance.state.data.headers.indexOf('구분');
            appInstance.state.data.all = appInstance.state.data.all.filter(row => row[gubunIndex] !== gubun);
        }
        
        // UI 즉시 업데이트
        if (appInstance.filter && appInstance.filter.apply) {
            appInstance.filter.apply();
        }
        
        if (appInstance.sidebar && appInstance.sidebar.updateWidgets) {
            appInstance.sidebar.updateWidgets();
        }
        
        appInstance.data.updateInterviewSchedule();
    },

    // 🔥 새로운 함수: 롤백
    rollbackOptimisticUpdate(appInstance) {
        console.log('🔄 낙관적 업데이트 롤백 - 서버에서 최신 데이터 가져옴');
        appInstance.data.forceRefresh();
    },

    // 🔥 새로운 함수: 빠른 검증 및 동기화
    async quickValidateAndSync(appInstance) {
        try {
            console.log('🔍 빠른 검증 시작...');
            
            // 서버에서 최신 해시값 확인
            const response = await fetch(`${appInstance.config.APPS_SCRIPT_URL}?action=hash&_t=${Date.now()}`, {
                method: 'GET',
                cache: 'no-cache'
            });
            
            if (response.ok) {
                const result = await response.json();
                
                // 스마트 동기화 시스템에 새 해시 전달
                if (appInstance.smartSync && result.hash) {
                    appInstance.smartSync.currentHash = result.hash;
                    console.log('✅ 빠른 검증 완료 - 동기화 상태 업데이트됨');
                }
            }
            
        } catch (error) {
            console.warn('⚠️ 빠른 검증 실패:', error);
        }
    },

    // 🔥 개선된 성공 알림 (더 빠른 피드백)
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
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
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
        
        // 슬라이드 인 애니메이션 (더 빠르게)
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
            notification.style.opacity = '1';
        }, 10);
        
        // 2초 후 슬라이드 아웃 (더 빠르게)
        setTimeout(() => {
            notification.style.transform = 'translateX(400px)';
            notification.style.opacity = '0';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 2000);
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
