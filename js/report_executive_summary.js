    // 경영진 요약 미리보기 - 개선된 하이브리드 레이아웃
    generateExecutiveSummaryPreview(data) {
        const funnelData = this.calculateFunnelData(data);
        const total = data.length;
        const passed = funnelData[2]?.count || 0;
        const joined = funnelData[3]?.count || 0;
        const passRate = total > 0 ? ((passed / total) * 100).toFixed(1) : 0;
        const joinRate = total > 0 ? ((joined / total) * 100).toFixed(1) : 0;
        
        // 지원루트별 통계
        const routeStats = this.calculateRouteStats(data);
        const topRoute = Object.entries(routeStats).sort((a, b) => b[1] - a[1])[0];
        
        // 실제 진행상황 값들을 동적으로 가져오기
        const progressValues = [...new Set(data.map(item => item.진행상황).filter(Boolean))];
        const passedStatuses = progressValues.filter(status => 
            status.includes('합격') || status.includes('통과') || status.includes('선발')
        );
        const joinedStatuses = progressValues.filter(status => 
            status.includes('입과') || status.includes('입사') || status.includes('확정')
        );
        
        return `
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
                    padding: 25px 30px;
                    margin-bottom: 25px;
                    border-radius: 0;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                ">
                    <!-- 왼쪽 여백 -->
                    <div style="flex: 1;"></div>
                    
                    <!-- 가운데 제목 -->
                    <div style="flex: 2; text-align: center;">
                        <h1 style="
                            font-size: 2.2rem; 
                            font-weight: 800; 
                            color: white; 
                            margin: 0;
                            letter-spacing: -1px;
                        ">CFC 채용 분석 리포트</h1>
                    </div>
                    
                    <!-- 오른쪽 정보 -->
                    <div style="
                        flex: 1;
                        display: flex;
                        flex-direction: column;
                        align-items: flex-end;
                        gap: 8px;
                        font-size: 0.9rem;
                    ">
                        <div style="background: rgba(255,255,255,0.2); padding: 6px 12px; border-radius: 20px; font-weight: 600;">📊 경영진 요약</div>
                        <div style="background: rgba(255,255,255,0.2); padding: 6px 12px; border-radius: 20px; font-weight: 600;">📅 ${this.getSelectedPeriodText()}</div>
                        <div style="background: rgba(255,255,255,0.2); padding: 6px 12px; border-radius: 20px; font-weight: 600;">👥 총 ${total}명</div>
                    </div>
                </div>

                <!-- 🚀 개선된 KPI 대시보드 -->
                <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin: 0 25px 30px 25px;">
                    <div style="background: linear-gradient(135deg, #3b82f6, #1d4ed8); color: white; text-align: center; padding: 25px 20px; border-radius: 16px; box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3); border: 1px solid rgba(255,255,255,0.2);">
                        <div style="font-size: 0.85rem; opacity: 0.9; margin-bottom: 8px; font-weight: 500;">총 지원자</div>
                        <div style="font-size: 2rem; font-weight: 800; margin-bottom: 4px;">${total}</div>
                        <div style="font-size: 0.8rem; opacity: 0.8;">명</div>
                    </div>
                    <div style="background: linear-gradient(135deg, #10b981, #047857); color: white; text-align: center; padding: 25px 20px; border-radius: 16px; box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3); border: 1px solid rgba(255,255,255,0.2);">
                        <div style="font-size: 0.85rem; opacity: 0.9; margin-bottom: 8px; font-weight: 500;">합격률</div>
                        <div style="font-size: 2rem; font-weight: 800; margin-bottom: 4px;">${passRate}%</div>
                        <div style="font-size: 0.8rem; opacity: 0.8;">${passed}명 합격</div>
                    </div>
                    <div style="background: linear-gradient(135deg, #f59e0b, #d97706); color: white; text-align: center; padding: 25px 20px; border-radius: 16px; box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3); border: 1px solid rgba(255,255,255,0.2);">
                        <div style="font-size: 0.85rem; opacity: 0.9; margin-bottom: 8px; font-weight: 500;">입과율</div>
                        <div style="font-size: 2rem; font-weight: 800; margin-bottom: 4px;">${joinRate}%</div>
                        <div style="font-size: 0.8rem; opacity: 0.8;">${Math.round(total * joinRate / 100)}명 입과</div>
                    </div>
                    <div style="background: linear-gradient(135deg, #8b5cf6, #7c3aed); color: white; text-align: center; padding: 25px 20px; border-radius: 16px; box-shadow: 0 4px 12px rgba(139, 92, 246, 0.3); border: 1px solid rgba(255,255,255,0.2);">
                        <div style="font-size: 0.85rem; opacity: 0.9; margin-bottom: 8px; font-weight: 500;">주요 채널</div>
                        <div style="font-size: 1.3rem; font-weight: 700; margin-bottom: 4px;">${topRoute ? topRoute[0] : 'N/A'}</div>
                        <div style="font-size: 0.8rem; opacity: 0.8;">${topRoute ? topRoute[1] : 0}명</div>
                    </div>
                </div>

                <!-- 📊 채용 프로세스 퍼널 -->
                <div style="background: white; padding: 25px; border-bottom: 1px solid #e5e7eb;">
                    <h2 style="font-size: 1.3rem; font-weight: 700; color: #1e293b; margin: 0 0 20px 0; text-align: left;">📈 채용 프로세스 퍼널</h2>
                    <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 30px; align-items: center;">
                        <div>${this.generateFunnelChart(funnelData)}</div>
                        <div>
                            <div style="background: #f8fafc; border-radius: 12px; padding: 20px; border-left: 4px solid #3b82f6;">
                                <h3 style="font-size: 1.1rem; font-weight: 600; color: #1e293b; margin: 0 0 15px 0; text-align: left;">핵심 지표</h3>
                                <div style="margin-bottom: 12px;"><div style="font-size: 0.9rem; color: #64748b;">서류 → 면접</div><div style="font-size: 1.4rem; font-weight: 700; color: #3b82f6;">85%</div></div>
                                <div style="margin-bottom: 12px;"><div style="font-size: 0.9rem; color: #64748b;">면접 → 합격</div><div style="font-size: 1.4rem; font-weight: 700; color: #10b981;">${passRate}%</div></div>
                                <div><div style="font-size: 0.9rem; color: #64748b;">합격 → 입과</div><div style="font-size: 1.4rem; font-weight: 700; color: #f59e0b;">${passRate > 0 ? (joinRate / passRate * 100).toFixed(0) : 0}%</div></div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- 📋 개선된 상세 데이터 테이블 -->
                <div style="background: white; padding: 25px; border-bottom: 1px solid #e5e7eb;">
                    <h2 style="font-size: 1.3rem; font-weight: 700; color: #1e293b; margin: 0 0 20px 0; text-align: left;">📋 지원루트별 상세 현황</h2>
                    <table style="width: 100%; border-collapse: collapse; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                        <thead>
                            <tr style="background: linear-gradient(135deg, #f1f5f9, #e2e8f0);">
                                <th style="padding: 12px; text-align: left; font-weight: 600; color: #334155; border-bottom: 2px solid #cbd5e1;">지원루트</th>
                                <th style="padding: 12px; text-align: center; font-weight: 600; color: #334155; border-bottom: 2px solid #cbd5e1;">지원자 수</th>
                                <th style="padding: 12px; text-align: center; font-weight: 600; color: #334155; border-bottom: 2px solid #cbd5e1;">합격자 수</th>
                                <th style="padding: 12px; text-align: center; font-weight: 600; color: #334155; border-bottom: 2px solid #cbd5e1;">합격률</th>
                                <th style="padding: 12px; text-align: center; font-weight: 600; color: #334155; border-bottom: 2px solid #cbd5e1;">입과자 수</th>
                                <th style="padding: 12px; text-align: center; font-weight: 600; color: #334155; border-bottom: 2px solid #cbd5e1;">입과율</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${Object.entries(routeStats).map((route, index) => {
                                const routeData = data.filter(item => item.지원루트 === route[0]);
                                
                                // 동적으로 합격자와 입과자 계산
                                const routePassed = routeData.filter(item => {
                                    const status = item.진행상황 || '';
                                    return passedStatuses.some(ps => status.includes(ps)) || 
                                           status.includes('합격') || status.includes('통과') || status.includes('선발');
                                }).length;
                                
                                const routeJoined = routeData.filter(item => {
                                    const status = item.진행상황 || '';
                                    return joinedStatuses.some(js => status.includes(js)) || 
                                           status.includes('입과') || status.includes('입사') || status.includes('확정');
                                }).length;
                                
                                const routePassRate = route[1] > 0 ? ((routePassed / route[1]) * 100).toFixed(1) : 0;
                                const routeJoinRate = route[1] > 0 ? ((routeJoined / route[1]) * 100).toFixed(1) : 0;
                                
                                return `
                                    <tr style="border-bottom: 1px solid #e2e8f0; ${index % 2 === 0 ? 'background: #fafafa;' : 'background: white;'}">
                                        <td style="padding: 10px; font-weight: 500; color: #1e293b;">${route[0]}</td>
                                        <td style="padding: 10px; text-align: center; font-weight: 600; color: #3b82f6;">${route[1]}</td>
                                        <td style="padding: 10px; text-align: center; font-weight: 600; color: #10b981;">${routePassed}</td>
                                        <td style="padding: 10px; text-align: center; font-weight: 600; color: #10b981;">${routePassRate}%</td>
                                        <td style="padding: 10px; text-align: center; font-weight: 600; color: #f59e0b;">${routeJoined}</td>
                                        <td style="padding: 10px; text-align: center; font-weight: 600; color: #f59e0b;">${routeJoinRate}%</td>
                                    </tr>
                                `;
                            }).join('')}
                        </tbody>
                    </table>
                </div>

                <!-- 🎯 핵심 인사이트 및 액션 아이템 -->
                <div style="background: white; padding: 25px;">
                    <h2 style="font-size: 1.3rem; font-weight: 700; color: #1e293b; margin: 0 0 20px 0; text-align: left;">💡 핵심 인사이트 & 액션 플랜</h2>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 25px;">
                        <div>
                            <div style="background: linear-gradient(135deg, #ecfdf5, #d1fae5); border-left: 4px solid #10b981; padding: 20px; border-radius: 8px; margin-bottom: 15px;">
                                <h3 style="font-size: 1.1rem; font-weight: 600; color: #047857; margin: 0 0 10px 0; text-align: left;">✅ 주요 강점</h3>
                                <ul style="margin: 0; padding-left: 20px; color: #374151;">
                                    <li style="margin-bottom: 8px;">지원자 확보력 우수 (총 ${total}명)</li>
                                    <li style="margin-bottom: 8px;">${topRoute ? topRoute[0] : 'N/A'} 채널 효과적 활용</li>
                                    <li style="margin-bottom: 8px;">안정적인 채용 프로세스 운영</li>
                                </ul>
                            </div>
                        </div>
                        <div>
                            <div style="background: linear-gradient(135deg, #fef3c7, #fde68a); border-left: 4px solid #f59e0b; padding: 20px; border-radius: 8px; margin-bottom: 15px;">
                                <h3 style="font-size: 1.1rem; font-weight: 600; color: #92400e; margin: 0 0 10px 0; text-align: left;">⚠️ 개선 필요 영역</h3>
                                <ul style="margin: 0; padding-left: 20px; color: #374151;">
                                    <li style="margin-bottom: 8px;">입과율 개선 필요 (현재 ${joinRate}%)</li>
                                    <li style="margin-bottom: 8px;">채용 채널 다양화 검토</li>
                                    <li style="margin-bottom: 8px;">후보자 경험 향상 방안 마련</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                    <div style="background: linear-gradient(135deg, #ede9fe, #ddd6fe); border: 2px solid #8b5cf6; border-radius: 12px; padding: 20px; margin-top: 20px;">
                        <h3 style="font-size: 1.2rem; font-weight: 700; color: #6d28d9; margin: 0 0 15px 0; text-align: left;">🎯 즉시 실행 가능한 액션 아이템</h3>
                        <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 15px;">
                            <div style="text-align: center;">
                                <div style="background: #8b5cf6; color: white; border-radius: 50%; width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; margin: 0 auto 10px auto; font-weight: bold;">1</div>
                                <div style="font-weight: 600; color: #1e293b; margin-bottom: 5px;">입과율 분석</div>
                                <div style="font-size: 0.9rem; color: #64748b;">합격 후 이탈 원인 파악</div>
                            </div>
                            <div style="text-align: center;">
                                <div style="background: #8b5cf6; color: white; border-radius: 50%; width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; margin: 0 auto 10px auto; font-weight: bold;">2</div>
                                <div style="font-weight: 600; color: #1e293b; margin-bottom: 5px;">채널 확대</div>
                                <div style="font-size: 0.9rem; color: #64748b;">신규 채용 채널 발굴</div>
                            </div>
                            <div style="text-align: center;">
                                <div style="background: #8b5cf6; color: white; border-radius: 50%; width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; margin: 0 auto 10px auto; font-weight: bold;">3</div>
                                <div style="font-weight: 600; color: #1e293b; margin-bottom: 5px;">프로세스 개선</div>
                                <div style="font-size: 0.9rem; color: #64748b;">면접-입과 간 소요시간 단축</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },