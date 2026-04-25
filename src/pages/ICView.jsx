import { useState } from 'react';
import { developers } from '../data';
import { computeMetrics, computeDelta, classifyPattern, generateInterpretation, generateNextSteps, computeTeamBenchmark, detectContradictions, computeConfidence } from '../logic/reasoningEngine';
import DeveloperSelector from '../components/DeveloperSelector';
import MetricCard from '../components/MetricCard';
import PatternBanner from '../components/PatternBanner';
import InterpretationPanel from '../components/InterpretationPanel';
import NextSteps from '../components/NextSteps';
import DrillDown from '../components/DrillDown';

function getStatus(value, thresholds) {
  if (value <= thresholds.good) return 'good';
  if (value <= thresholds.warn) return 'warn';
  return 'bad';
}

export default function ICView({lockedDeveloperId}) {
  const [developerId, setDeveloperId] = useState(lockedDeveloperId || '');
  const [month, setMonth] = useState('2026-04');

  const dev = developers.find(d => d.developer_id === developerId);
  const metrics = developerId ? computeMetrics(developerId, month) : null;
  const deltas  = developerId ? computeDelta(developerId, month) : null;
  const pattern = metrics ? classifyPattern(metrics, deltas) : null;
  const benchmark = developerId ? computeTeamBenchmark(developerId, month) : null;
  const contradictions = metrics ? detectContradictions(metrics) : [];
  const confidence = metrics ? computeConfidence(metrics) : null;
  const interpretation = metrics && pattern ? generateInterpretation(metrics, pattern, benchmark) : null;
  const nextSteps = metrics && pattern ? generateNextSteps(metrics, pattern) : null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

      <div>
        <h1 style={{ fontSize: '22px', fontWeight: 700, marginBottom: '4px' }}>
          Developer View
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
          Select a developer and month to see metrics, diagnosis, and next steps.
        </p>
      </div>

      <DeveloperSelector
        developerId={developerId} month={month}
        onDevChange={lockedDeveloperId ? undefined : setDeveloperId} 
        onMonthChange={setMonth}
        locked = {!!lockedDeveloperId}
      />

      {!developerId && (
        <div style={{
          background: 'var(--surface)', border: '1px solid var(--border)',
          borderRadius: 'var(--radius)', padding: '48px',
          textAlign: 'center', color: 'var(--text-muted)',
        }}>
          <p style={{ fontSize: '15px' }}>Select a developer above to load their metrics.</p>
        </div>
      )}

      {developerId && metrics && metrics.issues_done === 0 && (
        <div style={{
          background: 'var(--surface)', border: '1px solid var(--border)',
          borderRadius: 'var(--radius)', padding: '48px',
          textAlign: 'center', color: 'var(--text-muted)',
        }}>
          <div style={{ fontSize: '32px', marginBottom: '12px' }}>📭</div>
          <p>No completed issues found for this developer in the selected month.</p>
        </div>
      )}

      {metrics && metrics.issues_done > 0 && (
        <>
          <div style={{
            display: 'flex', gap: '16px', flexWrap: 'wrap',
            fontSize: '13px', color: 'var(--text-muted)',
            padding: '12px 16px', background: 'var(--surface)',
            borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)',
          }}>
            <span>👤 <strong style={{ color: 'var(--text)' }}>{dev?.developer_name}</strong></span>
            <span>🏷️ {dev?.level}</span>
            <span>🏢 {dev?.team_name}</span>
            <span>⚙️ {dev?.service_type}</span>
            <span>👔 {dev?.manager_name}</span>
          </div>

          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <MetricCard
                label="Lead Time"
                value={metrics.avg_lead_time_days} unit="days"
                delta={deltas?.lead_time_delta} lowerIsBetter={true}
                status={getStatus(metrics.avg_lead_time_days, { good: 3, warn: 4.5 })}
                subtext={benchmark ? `Team avg: ${benchmark.team_avg_lead_time_days}d` : 'PR open → prod deploy'}
            />
            <MetricCard
                label="Cycle Time"
                value={metrics.avg_cycle_time_days} unit="days"
                delta={deltas?.cycle_time_delta} lowerIsBetter={true}
                status={getStatus(metrics.avg_cycle_time_days, { good: 4, warn: 5.5 })}
                subtext={benchmark ? `Team avg: ${benchmark.team_avg_cycle_time_days}d` : 'In Progress → Done'}
            />
            <MetricCard
                label="Bug Rate"
                value={metrics.bug_rate_pct} unit="%"
                delta={deltas?.bug_rate_delta} lowerIsBetter={true}
                status={getStatus(metrics.bug_rate_pct, { good: 0, warn: 25 })}
                subtext={benchmark ? `Team avg: ${benchmark.team_avg_bug_rate_pct}%` : 'escaped to production'}
            />
            <MetricCard
                label="Deployments"
                value={metrics.prod_deps} unit=""
                delta={deltas?.deploy_delta} lowerIsBetter={false}
                status="neutral"
                subtext="successful prod deploys"
            />
            <MetricCard
                label="PR Throughput"
                value={metrics.merged_prs} unit=""
                delta={deltas?.pr_delta} lowerIsBetter={false}
                status="neutral"
                subtext="merged pull requests"
            />
          </div>

          <PatternBanner pattern={pattern} />

          {confidence && confidence.level !== 'high' && (
            <div style={{
                display: 'flex', alignItems: 'flex-start', gap: '12px',
                background: 'var(--surface)', border: '1px solid var(--border)',
                borderLeft: `4px solid ${confidence.level === 'medium' ? 'var(--amber)' : 'var(--text-muted)'}`,
                borderRadius: 'var(--radius)', padding: '14px 18px',
            }}>
                <span style={{ fontSize: '16px', marginTop: '1px' }}>
                {confidence.level === 'medium' ? '⚠️' : 'ℹ️'}
                </span>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: '1.6' }}>
                <strong style={{ color: 'var(--text)' }}>Low sample size: </strong>
                {confidence.note}
                </p>
            </div>
           )}

          <InterpretationPanel text={interpretation} />

          {contradictions.length > 0 && (
                <div style={{
                    display: 'flex', flexDirection: 'column', gap: '10px',
                }}>
                    <div style={{
                    fontSize: '11px', color: 'var(--text-muted)',
                    textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600,
                    }}>
                    Signal Contradictions
                    </div>
                    {contradictions.map((c, i) => (
                    <div key={i} style={{
                        background: 'var(--surface)', border: '1px solid var(--amber)',
                        borderLeft: '4px solid var(--amber)',
                        borderRadius: 'var(--radius)', padding: '16px 20px',
                        display: 'flex', flexDirection: 'column', gap: '6px',
                    }}>
                        <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--amber)' }}>
                        ⚡ {c.label}
                        </div>
                        <p style={{ fontSize: '14px', lineHeight: '1.65', color: 'var(--text)' }}>
                        {c.message}
                        </p>
                    </div>
                    ))}
                </div>
            )}

          <NextSteps steps={nextSteps} />

          <DrillDown metrics={metrics} />
        </>
      )}
    </div>
  );
}