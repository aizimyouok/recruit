// =========================
// ui.js - UI 관련 모듈
// =========================

export const UIModule = {
    toggleMobileMenu() {
        const sidebar = document.getElementById('sidebar');
        const overlay = document.querySelector('.mobile-overlay');
        sidebar.classList.toggle('mobile-open');
        overlay.classList.toggle('show');
    },

    toggleColumnDropdown() {
        const dropdown = document.getElementById('columnToggleDropdown');
        dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';
    },

    handleColumnToggle(appInstance, event, columnName) {
        appInstance.state.ui.visibleColumns[columnName] = event.target.checked;
        appInstance.filter.apply();
    },

    setupColumnToggles(appInstance) {
        const dropdown = document.getElementById('columnToggleDropdown');
        dropdown.innerHTML = '';
        appInstance.state.data.headers.forEach(header => {
            const item = document.createElement('div');
            item.className = 'column-toggle-item';
            item.innerHTML = `<input type="checkbox" id="toggle-${header}" ${appInstance.state.ui.visibleColumns[header] ? 'checked' : ''} onchange="globalThis.App.ui.handleColumnToggle(event, '${header}')"><label for="toggle-${header}">${header}</label>`;
            dropdown.appendChild(item);
        });
    },

    showLoadingState(container, appInstance) {
        container.innerHTML = `
            <div class="smooth-loading-container">
                <div class="advanced-loading-spinner"></div>
                <div class="loading-text">
                    데이터를 불러오는 중입니다
                    <div class="loading-dots">
                        <div class="loading-dot"></div>
                        <div class="loading-dot"></div>
                        <div class="loading-dot"></div>
                    </div>
                </div>
                <div class="loading-subtext">잠시만 기다려 주세요...</div>
                ${appInstance ? appInstance.utils.createProgressBar(25, '연결중...') : UIModule.createProgressBar(25, '연결중...')}
            </div>`;
    },

    updateProgress(container, percentage, text) {
        setTimeout(() => {
            const progressFill = container.querySelector('.progress-fill');
            const progressPercentage = container.querySelector('.progress-percentage');
            const loadingSubtext = container.querySelector('.loading-subtext');

            if (progressFill && progressPercentage) {
                progressFill.style.width = percentage + '%';
                progressPercentage.textContent = percentage + '%';
            }

            if (loadingSubtext && text) {
                loadingSubtext.textContent = text;
            }
        }, 200);
    },

    showErrorState(container, error, appInstance) {
        const isNetworkError = error.name === 'TypeError' && error.message.includes('fetch');
        const canRetry = isNetworkError || error.message.includes('서버에 일시적인');

        container.innerHTML = `
            <div class="error-container">
                <i class="fas fa-exclamation-triangle error-icon"></i>
                <h3 class="error-title">데이터 로드 실패</h3>
                <p class="error-message">
                    ${isNetworkError ? '🌐 인터넷 연결을 확인해주세요.' : error.message}
                </p>
                <div class="error-actions">
                    ${canRetry ? `
                        <button class="primary-btn" onclick="globalThis.App.data.fetch()">
                            <i class="fas fa-sync-alt"></i> 다시 시도
                        </button>
                    ` : ''}
                    <button class="secondary-btn" onclick="location.reload()">
                        <i class="fas fa-redo"></i> 페이지 새로고침
                    </button>
                </div>
            </div>`;
    },

    // 독립적인 유틸리티 함수들
    createProgressBar(percentage = 0, text = '로딩 중...') {
        return `
            <div class="progress-container">
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${percentage}%"></div>
                </div>
                <div class="progress-text">
                    <span class="progress-percentage">${percentage}%</span> ${text}
                </div>
            </div>
        `;
    },

    createSkeletonTable() {
        const skeletonRows = Array.from({length: 8}, (_, i) => `
            <tr class="skeleton-row">
                <td><div class="skeleton-cell short"></div></td>
                <td><div class="skeleton-cell medium"></div></td>
                <td><div class="skeleton-cell long"></div></td>
                <td><div class="skeleton-cell short"></div></td>
                <td><div class="skeleton-cell medium"></div></td>
                <td><div class="skeleton-cell long"></div></td>
                <td><div class="skeleton-cell medium"></div></td>
            </tr>
        `).join('');

        return `
            <div class="skeleton-container">
                <table class="skeleton-table">
                    <thead>
                        <tr>
                            <th>구분</th><th>이름</th><th>연락처</th><th>지원루트</th><th>모집분야</th><th>지원일</th><th>상태</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${skeletonRows}
                    </tbody>
                </table>
            </div>
        `;
    }
};