import React, { useEffect, useState, useRef } from 'react';
import useSnackStore from '../stores/snackStore';
import useClaimStore from '../stores/claimStore';
import useMemberStore from '../stores/memberStore';
import useSettingsStore from '../stores/settingsStore';
import './Statistics.css';

const CHART_TYPES = {
  table: '表格',
  bar: '柱式',
  funnel: '锥形',
  donut: '圆圈',
};

function Statistics() {
  const { snacks, fetchSnacks } = useSnackStore();
  const { records, fetchRecords } = useClaimStore();
  const { members, fetchMembers } = useMemberStore();
  const { alertConfig, setAlertConfig } = useSettingsStore();
  const [chartType, setChartType] = useState('table');
  const [animated, setAnimated] = useState(false);
  const animRef = useRef(null);

  useEffect(() => {
    fetchSnacks();
    fetchRecords();
    fetchMembers();
  }, []);

  // 切换图表时触发动画
  useEffect(() => {
    setAnimated(false);
    if (animRef.current) clearTimeout(animRef.current);
    animRef.current = setTimeout(() => setAnimated(true), 50);
    return () => { if (animRef.current) clearTimeout(animRef.current); };
  }, [chartType, snacks, records]);

  // 圆圈图起始角度（度数，0=顶部，90=右侧，180=底部，270=左侧）
  const donutStartAngle = alertConfig?.donutStartAngle ?? 0;

  // 按零食名称统计
  const snackStats = {};
  snacks.forEach(snack => {
    if (!snackStats[snack.name]) snackStats[snack.name] = { stock: 0, claims: 0, price: snack.price || 0 };
    snackStats[snack.name].stock += snack.stock || 0;
  });
  records.forEach(record => {
    const snack = snacks.find(s => s.id === record.snack_id);
    if (snack && snackStats[snack.name]) {
      snackStats[snack.name].claims += record.quantity;
    }
  });

  // 按成员统计领取次数
  const memberStats = {};
  records.forEach(record => {
    if (!memberStats[record.member_name]) memberStats[record.member_name] = 0;
    memberStats[record.member_name] += record.quantity;
  });

  // 最受欢迎零食排名（从 Ranking 搬过来）
  const snackRankings = snacks.map(snack => {
    const claimCount = records.filter(r => r.snack_id === snack.id).reduce((sum, r) => sum + r.quantity, 0);
    return { ...snack, claimCount };
  }).sort((a, b) => b.claimCount - a.claimCount);

  // 成员领取排行榜（从 Ranking 搬过来）
  const memberRankingStats = {};
  records.forEach(record => {
    if (!memberRankingStats[record.member_id]) {
      memberRankingStats[record.member_id] = { name: record.member_name, count: 0, quotaUsed: 0 };
    }
    memberRankingStats[record.member_id].count += record.quantity;
    memberRankingStats[record.member_id].quotaUsed += record.quota_cost;
  });
  const memberRankings = Object.values(memberRankingStats).sort((a, b) => b.count - a.count);

  // 过期损耗统计
  const expiredCount = snacks.filter(s => {
    if (s.expiry_batches && s.expiry_batches.length > 0) {
      return s.expiry_batches.some(b => b.expiry_days <= 0);
    }
    return s.expiry_days <= 0;
  }).length;

  const snackEntries = Object.entries(snackStats).sort(([, a], [, b]) => b.stock - a.stock);
  const memberEntries = Object.entries(memberStats).sort(([, a], [, b]) => b - a);
  const maxStock = Math.max(...snackEntries.map(([, s]) => s.stock), 1);
  const totalStock = snackEntries.reduce((sum, [, s]) => sum + s.stock, 0);
  const totalClaims = records.reduce((sum, r) => sum + r.quantity, 0);
  const totalQuotaUsed = records.reduce((sum, r) => sum + r.quota_cost, 0);

  const COLORS = ['#FF6B6B', '#FFA500', '#FFD93D', '#667eea', '#00B894', '#E91E63', '#9C27B0', '#00BCD4', '#FF5722', '#8BC34A'];

  // 渐变色生成：从底色到亮色
  const getGradient = (baseColor, idx) => {
    return `linear-gradient(to top, ${baseColor}, ${COLORS[(idx + 1) % COLORS.length]}88)`;
  };

  return (
    <div className="statistics-page">
      <h1>📈 数据统计</h1>

      <div className="stats-overview">
        <div className="stat-card">
          <div className="stat-value">{snacks.length}</div>
          <div className="stat-label">零食种类</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{totalClaims}</div>
          <div className="stat-label">总领取次数</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{totalQuotaUsed}</div>
          <div className="stat-label">总配额消耗</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{members.length}</div>
          <div className="stat-label">家庭成员</div>
        </div>
        <div className="stat-card warning-card">
          <div className="stat-value">{expiredCount}</div>
          <div className="stat-label">已过期零食</div>
        </div>
      </div>

      <div className="stats-details">
        {/* 零食统计 */}
        <div className="stats-section">
          <div className="section-header">
            <h2>📊 零食统计</h2>
            <div className="chart-type-switcher">
              {Object.entries(CHART_TYPES).map(([key, label]) => (
                <button
                  key={key}
                  className={`chart-type-btn ${chartType === key ? 'active' : ''}`}
                  onClick={() => setChartType(key)}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
          {snackEntries.length === 0 ? (
            <p className="empty-message">暂无数据</p>
          ) : (
            <>
              {/* 表格模式 */}
              {chartType === 'table' && (
                <table className="stats-table">
                  <thead>
                    <tr>
                      <th>零食名称</th>
                      <th>库存</th>
                      <th>领取次数</th>
                      <th>单价</th>
                    </tr>
                  </thead>
                  <tbody>
                    {snackEntries.map(([name, stats]) => (
                      <tr key={name}>
                        <td>{name}</td>
                        <td>{stats.stock}份</td>
                        <td>{stats.claims}次</td>
                        <td>¥{stats.price}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {/* 竖向柱式图模式 - 底到顶渐变 */}
              {chartType === 'bar' && (
                <div className="chart-vbar-container">
                  {snackEntries.map(([name, stats], idx) => {
                    const heightPercent = (stats.stock / maxStock) * 100;
                    return (
                      <div key={name} className="chart-vbar-item">
                        <div className="chart-vbar-value">{stats.stock}</div>
                        <div className="chart-vbar-track">
                          <div
                            className="chart-vbar-fill"
                            style={{
                              height: animated ? `${heightPercent}%` : '0%',
                              background: getGradient(COLORS[idx % COLORS.length], idx),
                              transition: `height 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) ${idx * 0.06}s`,
                            }}
                          />
                        </div>
                        <div className="chart-vbar-label">{name}</div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* 锥形图模式 - 带趋势线的柱状图（仿成员配额） */}
              {chartType === 'funnel' && (
                <div className="chart-trend-container">
                  {snackEntries.map(([name, stats], idx) => {
                    const trendPercent = (stats.stock / maxStock) * 100;
                    return (
                      <div
                        key={name}
                        className="trend-item"
                        style={{
                          opacity: animated ? 1 : 0,
                          transform: animated ? 'translateY(0)' : 'translateY(10px)',
                          transition: `all 0.5s cubic-bezier(0.22, 1, 0.36, 1) ${idx * 0.1}s`,
                        }}
                      >
                        <div className="trend-header">
                          <span className="trend-name">{name}</span>
                          <span className="trend-value">{stats.stock}份</span>
                        </div>
                        <div className="trend-bar-wrap">
                          <div className="trend-bar-track">
                            <div
                              className="trend-bar-fill"
                              style={{
                                width: animated ? `${trendPercent}%` : '0%',
                                background: COLORS[idx % COLORS.length],
                                transition: `width 1s cubic-bezier(0.22, 1, 0.36, 1) ${idx * 0.1 + 0.2}s`,
                              }}
                            />
                          </div>
                          <div className="trend-claims">{stats.claims}次领取</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* 圆圈图模式 - 大圆环，仿千问天气24小时预报风格 */}
              {chartType === 'donut' && (
                <>
                  <div className="donut-start-setting">
                    <label>起始位置：</label>
                    <div className="donut-start-btns">
                      {[
                        { label: '⬆️ 顶部', value: 0 },
                        { label: '➡️ 右侧', value: 90 },
                        { label: '⬇️ 底部', value: 180 },
                        { label: '⬅️ 左侧', value: 270 },
                      ].map(opt => (
                        <button
                          key={opt.value}
                          className={`donut-start-btn ${donutStartAngle === opt.value ? 'active' : ''}`}
                          onClick={() => setAlertConfig('donutStartAngle', opt.value)}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="chart-donut-container">
                    <div className="donut-chart-large">
                      <svg viewBox="0 0 280 280" className="donut-svg-large">
                        {/* 背景圆环 */}
                        <circle
                          cx="140" cy="140" r="100"
                          fill="none"
                          stroke="#f0f0f0"
                          strokeWidth="28"
                        />
                        {(() => {
                          let offset = 0;
                          return snackEntries.map(([name, stats], idx) => {
                            const percent = stats.stock / totalStock;
                            const circumference = 2 * Math.PI * 100;
                            const dashLength = animated ? percent * circumference : 0;
                            const dashGap = circumference;
                            const dashOffset = animated ? -offset * circumference - circumference * 0.25 : circumference;
                            offset += percent;
                            return (
                              <g key={name}>
                                <circle
                                  cx="140" cy="140" r="100"
                                  fill="none"
                                  stroke={COLORS[idx % COLORS.length]}
                                  strokeWidth="28"
                                  strokeDasharray={`${dashLength} ${dashGap}`}
                                  strokeDashoffset={dashOffset}
                                  strokeLinecap="round"
                                  transform={`rotate(${donutStartAngle - 90} 140 140)`}
                                  style={{
                                    transition: `stroke-dasharray 1.2s cubic-bezier(0.22, 1, 0.36, 1) ${idx * 0.15}s, stroke-dashoffset 1.2s cubic-bezier(0.22, 1, 0.36, 1) ${idx * 0.15}s`,
                                    filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))',
                                  }}
                                />
                              </g>
                            );
                          });
                        })()}
                      </svg>
                      <div className="donut-center-large">
                        <div className="donut-center-label">零食种类</div>
                        <div className="donut-center-total">{snackEntries.length}</div>
                        <div className="donut-center-sub">总库存 <strong>{totalStock}</strong> 份</div>
                      </div>
                    </div>
                    <div className="donut-legend-large">
                      {snackEntries.map(([name, stats], idx) => {
                        const percent = totalStock > 0 ? Math.round((stats.stock / totalStock) * 100) : 0;
                        return (
                          <div
                            key={name}
                            className="donut-legend-card"
                            style={{
                              opacity: animated ? 1 : 0,
                              transform: animated ? 'translateY(0)' : 'translateY(15px)',
                              transition: `all 0.5s cubic-bezier(0.22, 1, 0.36, 1) ${idx * 0.08 + 0.4}s`,
                            }}
                          >
                            <div className="legend-card-color" style={{ background: COLORS[idx % COLORS.length] }} />
                            <div className="legend-card-info">
                              <div className="legend-card-name">{name}</div>
                              <div className="legend-card-bar-wrap">
                                <div className="legend-card-bar">
                                  <div
                                    className="legend-card-bar-fill"
                                    style={{
                                      width: animated ? `${percent}%` : '0%',
                                      background: COLORS[idx % COLORS.length],
                                      transition: `width 0.8s cubic-bezier(0.22, 1, 0.36, 1) ${idx * 0.08 + 0.6}s`,
                                    }}
                                  />
                                </div>
                                <span className="legend-card-percent">{percent}%</span>
                              </div>
                              <div className="legend-card-detail">
                                <span>库存 {stats.stock} 份</span>
                                <span>领取 {stats.claims} 次</span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}
            </>
          )}
        </div>

        {/* 成员领取排行 */}
        <div className="stats-section">
          <h2>👥 成员领取排行</h2>
          {memberEntries.length === 0 ? (
            <p className="empty-message">暂无领取记录</p>
          ) : (
            <div className="chart-vbar-container">
              {memberEntries.map(([name, count]) => {
                const maxCount = Math.max(...memberEntries.map(([, c]) => c), 1);
                return (
                  <div key={name} className="chart-vbar-item">
                    <div className="chart-vbar-value">{count}</div>
                    <div className="chart-vbar-track">
                      <div
                        className="chart-vbar-fill member-bar-v"
                        style={{ height: `${(count / maxCount) * 100}%` }}
                      />
                    </div>
                    <div className="chart-vbar-label">{name}</div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* 成员配额信息 */}
        <div className="stats-section">
          <h2>📋 成员配额</h2>
          {members.length === 0 ? (
            <p className="empty-message">暂无成员</p>
          ) : (
            <table className="stats-table">
              <thead>
                <tr>
                  <th>成员</th>
                  <th>角色</th>
                  <th>日配额</th>
                  <th>周配额</th>
                </tr>
              </thead>
              <tbody>
                {members.map(member => (
                  <tr key={member.id}>
                    <td>{member.name}</td>
                    <td>{member.role}</td>
                    <td>{member.daily_quota}</td>
                    <td>{member.weekly_quota}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* 最受欢迎零食（从 Ranking 搬过来） */}
        <div className="stats-section">
          <h2>🏆 最受欢迎零食</h2>
          {snackRankings.length === 0 ? (
            <p className="empty-message">暂无数据</p>
          ) : (
            <ol className="ranking-list">
              {snackRankings.slice(0, 10).map((snack, index) => (
                <li key={snack.id} className={`ranking-item rank-${index + 1}`}>
                  <span className="rank-number">{index + 1}</span>
                  <span className="item-name">{snack.name}</span>
                  <span className="item-count">{snack.claimCount} 次</span>
                </li>
              ))}
            </ol>
          )}
        </div>

        {/* 领取排行榜（从 Ranking 搬过来） */}
        <div className="stats-section">
          <h2>👑 领取排行榜</h2>
          {memberRankings.length === 0 ? (
            <p className="empty-message">暂无数据</p>
          ) : (
            <ol className="ranking-list">
              {memberRankings.map((member, index) => (
                <li key={index} className={`ranking-item rank-${index + 1}`}>
                  <span className="rank-number">{index + 1}</span>
                  <span className="item-name">{member.name}</span>
                  <span className="item-count">{member.count} 份</span>
                </li>
              ))}
            </ol>
          )}
        </div>
      </div>
    </div>
  );
}

export default Statistics;
