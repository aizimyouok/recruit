import { config } from './state.js';

export async function fetchData() {
    const response = await fetch(`${config.APPS_SCRIPT_URL}?action=read`);
    if (!response.ok) throw new Error(`서버 오류 (${response.status})`);
    const result = await response.json();
    if (result.status !== 'success') throw new Error(result.message || '데이터 처리 실패');
    if (!result.data || result.data.length < 2) throw new Error('표시할 지원자 데이터가 없습니다.');
    return result.data;
}

export async function saveApplicant(action, data, gubun = null) {
    const body = { action, data };
    if (action === 'update') {
        body.gubun = gubun;
    }
    const response = await fetch(config.APPS_SCRIPT_URL, {
        method: 'POST',
        body: JSON.stringify(body)
    });
    const result = await response.json();
    if (result.status !== 'success') throw new Error(result.message || '저장에 실패했습니다.');
    return result;
}

export async function deleteApplicant(gubun) {
    const response = await fetch(config.APPS_SCRIPT_URL, {
        method: 'POST',
        body: JSON.stringify({ action: 'delete', gubun })
    });
    const result = await response.json();
    if (result.status !== 'success') throw new Error(result.message || '삭제에 실패했습니다.');
    return result;
}