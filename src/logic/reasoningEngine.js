import { jiraIssues, pullRequests, deployments, developers, bugReports } from "../data";

export function computeMetricsFromRaw(issues, prs, deps, bugs) {
  const issues_done = issues.length;
  const merged_prs  = prs.length;
  const prod_deps = deps.length;
  const escaped_bugs = bugs.length;

  const avg_cycle_time_days = issues_done > 0
    ? round(issues.reduce((s, d) => s + d.cycle_time_days, 0) / issues_done) : 0;

  const avg_lead_time_days = prod_deps > 0
    ? round(deps.reduce((s, d) => s + d.lead_time_days, 0) / prod_deps) : 0;

  const bug_rate_pct = issues_done > 0
    ? round((escaped_bugs / issues_done) * 100) : 0;

  const avg_review_wait_hours = merged_prs > 0
    ? round(prs.reduce((s, d) => s + d.review_wait_hours, 0) / merged_prs) : 0;

  const avg_lines_changed = merged_prs > 0
    ? round(prs.reduce((s, d) => s + d.lines_changed, 0) / merged_prs) : 0;

  const avg_review_rounds = merged_prs > 0
    ? round(prs.reduce((s, d) => s + d.review_rounds, 0) / merged_prs, 1) : 0;

  const hotfix_count = deps.filter(d => d.release_type === 'hotfix').length;
  const root_causes = bugs.map(b => b.root_cause_bucket);
  const high_severity_bugs = bugs.filter(b => b.severity === 'high').length;

  return {
    issues_done, merged_prs, prod_deps, escaped_bugs,
    avg_cycle_time_days, avg_lead_time_days, avg_lines_changed,
    avg_review_rounds, avg_review_wait_hours,
    bug_rate_pct, hotfix_count, root_causes, high_severity_bugs,
  };
}

export function computeMetrics(developerId, month) {
    const issues = jiraIssues.filter(
        d => d.developer_id === developerId && d.month_done === month
    );

    const prs = pullRequests.filter(
        d => d.developer_id === developerId && d.month_merged === month
    );

    const deps = deployments.filter(
        d => d.developer_id === developerId && d.month_deployed === month && d.status === 'success'
    );

    const bugs = bugReports.filter(
        d => d.developer_id === developerId && d.month_found === month
    );

    const issues_done = issues.length;
    const merged_prs = prs.length;
    const prod_deps = deps.length;
    const escaped_bugs = bugs.length;

    const avg_cycle_time_days = issues_done > 0
        ? round(issues.reduce((s,d) => s + d.cycle_time_days, 0) / issues_done) : 0 ;
    
   const avg_lead_time_days = prod_deps > 0
        ? round(deps.reduce((s, d) => s + d.lead_time_days, 0) / prod_deps) : 0;
    
    const bug_rate_pct = issues_done > 0
        ? round((escaped_bugs / issues_done) * 100) : 0;
    
    const avg_review_wait_hours = merged_prs > 0
        ? round(prs.reduce((s, d) => s + d.review_wait_hours, 0) / merged_prs) : 0;

    const avg_lines_changed = merged_prs > 0
        ? round(prs.reduce((s, d) => s + d.lines_changed, 0) / merged_prs) : 0;

    const avg_review_rounds = merged_prs > 0
        ? round(prs.reduce((s, d) => s + d.review_rounds, 0) / merged_prs, 1) : 0;

    const hotfix_count = deps.filter(d => d.release_type === 'hotfix').length;
    const root_causes = bugs.map(b => b.root_cause_bucket);
    const high_severity_bugs = bugs.filter(b => b.severity === 'high').length;

    return {
        issues_done, merged_prs, prod_deps, escaped_bugs, 
        avg_cycle_time_days, avg_lead_time_days, avg_lines_changed, 
        avg_review_rounds, avg_review_wait_hours, 
        bug_rate_pct, hotfix_count, root_causes, high_severity_bugs
    };
}

export function computeDelta(developerId, month) {
    const priorMonth = getPriorMonth(month);
    const current = computeMetrics(developerId, month);
    const prior = computeMetrics(developerId, priorMonth);

    return {
        cycle_time_delta : round(current.avg_cycle_time_days - prior.avg_cycle_time_days),
        lead_time_delta : round(current.avg_lead_time_days - prior.avg_lead_time_days),
        bug_rate_delta : round(current.bug_rate_pct - prior.bug_rate_pct),
        deploy_delta : current.prod_deps - prior.prod_deps,
        pr_delta : current.merged_prs - prior.merged_prs
    };
}

export function classifyPattern(metrics, deltas) {
    const {
        bug_rate_pct, avg_cycle_time_days, avg_lead_time_days, avg_lines_changed,
        avg_review_wait_hours, hotfix_count, high_severity_bugs
    } = metrics;

    if (bug_rate_pct >= 50 || high_severity_bugs > 0) {
        const improving = deltas && deltas.bug_rate_delta < 0;
        return improving ? 'Quality Watch : Improving' : 'Quality Watch';
    }

    if ( avg_cycle_time_days > 5.5 || avg_lead_time_days > 4.5 || avg_review_wait_hours > 20) {
        return 'Watch Bottlenecks';
    }

    if (hotfix_count >= 2 || avg_lines_changed > 600) {
        return 'Needs Review'
    }
    return 'Healthy Flow';
}

export function generateInterpretation(metrics, pattern, benchmark) {
    const {
        avg_cycle_time_days, avg_lead_time_days, avg_lines_changed,
        avg_review_wait_hours, bug_rate_pct, hotfix_count, root_causes,
        escaped_bugs, high_severity_bugs, prod_deps
    } = metrics;

    const leadVsTeam = benchmark
    ? avg_lead_time_days > benchmark.team_avg_lead_time_days
      ? ` This is ${round(avg_lead_time_days - benchmark.team_avg_lead_time_days)}d above your team average of ${benchmark.team_avg_lead_time_days}d.`
      : ` This is ${round(benchmark.team_avg_lead_time_days - avg_lead_time_days)}d below your team average of ${benchmark.team_avg_lead_time_days}d.`
    : '';

    const cycleVsTeam = benchmark
        ? avg_cycle_time_days > benchmark.team_avg_cycle_time_days
        ? ` Cycle time is also ${round(avg_cycle_time_days - benchmark.team_avg_cycle_time_days)}d above the team average of ${benchmark.team_avg_cycle_time_days}d.`
        : ''
        : '';

    const bugVsTeam = benchmark
        ? bug_rate_pct > benchmark.team_avg_bug_rate_pct
        ? ` Team average bug rate is ${benchmark.team_avg_bug_rate_pct}%. You are ${round(bug_rate_pct - benchmark.team_avg_bug_rate_pct)}% above it.`
        : bug_rate_pct === 0 && benchmark.team_avg_bug_rate_pct > 0
        ? ` Your team average is ${benchmark.team_avg_bug_rate_pct}%. You are below it.`
        : ''
        : '';

    if (pattern === 'Quality Watch' || pattern === 'Quality Watch : Improving') {
        const rootSummary = summarizeRootCauses(root_causes);
        const severityNote = high_severity_bugs > 0
        ? ` including ${high_severity_bugs} high-severity issue${high_severity_bugs > 1 ? 's' : ''}` : '';
        const trendNote = pattern === 'Quality Watch : Improving'
        ? ` Bug rate is trending down from last month. The direction is right, but the level still needs attention.` : '';
        const baseMsg = `${escaped_bugs} bug${escaped_bugs > 1 ? 's' : ''} escaped to production this month${severityNote}, pushing the bug rate to ${bug_rate_pct}%.${bugVsTeam}${trendNote} `;
        const rootMsg = rootSummary ? `Root cause trace: ${rootSummary}. ` : '';
        const speedMsg = `Development speed looks fine. Cycle time is ${avg_cycle_time_days}d${cycleVsTeam}, but quality safeguards are not keeping pace with the release cadence.`;
        return baseMsg + rootMsg + speedMsg;
    }

  if (pattern === 'Watch Bottlenecks') {
    const issues = [];
    const details = [];

    if (avg_review_wait_hours > 20) {
      issues.push('review wait');
      details.push(`PRs wait an average of ${avg_review_wait_hours}h for first review`);
    }
    if (avg_cycle_time_days > 5.5) {
      issues.push('slow cycle time');
      details.push(`active development takes ${avg_cycle_time_days}d per ticket`);
    }
    const leadTimeElevated = avg_lead_time_days > 4.5;

    if (issues.length === 0) {
      return `Both cycle time (${avg_cycle_time_days}d) and lead time (${avg_lead_time_days}d) are elevated. 
      The delay appears distributed, partly in development and partly in the review-to-deploy pipeline. 
      Isolating which stage dominates would be the right next step before making changes.`;
    }

    let message = '';
    if (issues.length === 1) {
      if (avg_review_wait_hours > 20) {
        message = `${details[0]}, which is the primary driver of the ${avg_lead_time_days}d lead time. Code is completing in ${avg_cycle_time_days}d, so development speed is not the issue.The bottleneck sits in the review queue. ${leadVsTeam}`;
      } else {
        message = `Cycle time is ${avg_cycle_time_days}d, suggesting tickets stay in active development longer than expected. This may point to large scope, unclear requirements, or context switching. Lead time of ${avg_lead_time_days}d compounds the delay.${leadVsTeam} `;
      }
    } else {
      message = `Multiple bottlenecks are slowing delivery: ${details.join(' and ')}. `;
      message += `The combination means work spends extra time in development *and* then waits in review. Lead time is ${avg_lead_time_days}d. `;
      message += `Address the review queue first (usually the faster win), then investigate why tickets spend ${avg_cycle_time_days}d in active development.`;
    }

    if (leadTimeElevated && issues.length > 0) {
      message += ` Overall lead time of ${avg_lead_time_days}d is well above the 4.5d threshold.`;
    }

    return message;
  }

  if (pattern === 'Needs Review') {
    const concerns = [];
    if (hotfix_count >= 2) {
      concerns.push(`${hotfix_count} of ${prod_deps} deployments were hotfixes; a reactive pattern`);
    }
    if (avg_lines_changed > 600) {
      concerns.push(`average PR size is ${avg_lines_changed} lines (large)`);
    }

    if (concerns.length === 0) {
      return `PR discipline needs attention. Cycle time (${avg_cycle_time_days}d) and lead time (${avg_lead_time_days}d) are within range, but review practices may be slipping.`;
    }

    let message = '';
    if (concerns.length === 1) {
      if (hotfix_count >= 2) {
        message = `${concerns[0]}, which signals issues slipping past review or insufficient pre-release testing. Average PR size of ${avg_lines_changed} lines may be a contributing factor.`;
      } else {
        message = `${concerns[0]}, which makes thorough review harder and increases the chance of subtle issues slipping through. Cycle time (${avg_cycle_time_days}d) and lead time (${avg_lead_time_days}d) are within range, but PR discipline is worth addressing before it affects quality.`;
      }
    } else {
      message = `Both ${concerns[0]} and ${concerns[1]}. `;
      message += `Large PRs are harder to review thoroughly, which may contribute to the need for hotfixes. Cycle time is ${avg_cycle_time_days}d, lead time ${avg_lead_time_days}d — speed isn't the problem, but quality and review depth are.`;
    }
    return message;
  }

  return `Metrics are well-balanced this month. Cycle time is ${avg_cycle_time_days}d, lead time is ${avg_lead_time_days}d${leadVsTeam}, and no bugs escaped to production. 
          Review wait of ${avg_review_wait_hours}h is reasonable. This cadence is worth maintaining; consistency here is itself a signal of a healthy delivery loop.`;
}

export function generateNextSteps(metrics, pattern) {
  const {
    avg_review_wait_hours,
    avg_lines_changed,
    avg_cycle_time_days,
    bug_rate_pct,
    hotfix_count,
    root_causes,
    escaped_bugs,
    high_severity_bugs,
  } = metrics;

  const steps = new Set();

  if (pattern === 'Quality Watch') {
    const hasTestGap = root_causes.includes('test gap');
    const hasEdgeCase = root_causes.includes('edge case');
    const hasReleaseConfig = root_causes.includes('release config');

    if (high_severity_bugs > 0) {
      steps.add('Run a quick root-cause analysis on high-severity bugs and share findings with the team.');
    }
    if (hasTestGap) {
      steps.add('Add at least one unit test per story before marking code complete. Test gaps are the identified root cause this month.');
    }
    if (hasEdgeCase) {
      steps.add('Document edge cases explicitly in the ticket definition of done. Edge cases are the identified root cause this month.');
    }
    if (hasReleaseConfig || (!hasTestGap && !hasEdgeCase)) {
      steps.add('Review the release checklist before each deployment. A release config issue caused this month\'s escape.');
    }
    steps.add('Separate speed from quality in the next sprint: hold cycle time targets but add one explicit quality gate before PR open.');
  }

  if (pattern === 'Watch Bottlenecks') {
    if (avg_review_wait_hours > 20) {
      steps.add(`Set a team SLA for first review: target response within 4-6 hours of PR open to reduce the current ${avg_review_wait_hours}h average wait.`);
      steps.add('Consider pairing on large PRs or breaking them into stacked smaller PRs so reviewers can engage sooner.');
    }
    if (avg_cycle_time_days > 5.5) {
      steps.add('Timebox tickets to a 3-day development target. Escalate blockers by day 2 rather than absorbing the delay silently.');
      steps.add('Break stories with high point estimates into smaller shippable sub-tasks before sprint start.');
    }
    if (steps.size === 0) {
      steps.add('Map where time is actually being spent: use PR timestamps to separate review delay from deploy delay before prescribing a fix.');
      steps.add('Identify the single longest step in the pipeline this month and address that one bottleneck before the next sprint.');
    }
  }

  if (pattern === 'Needs Review') {
    if (hotfix_count >= 2) {
      steps.add('Run a lightweight post-mortem on each hotfix to identify whether it was a review gap or a testing gap and rack findings in the team wiki.');
      steps.add('Introduce a staging environment smoke test as a mandatory step before any production deploy.');
    }
    if (avg_lines_changed > 600) {
      steps.add(`Target PRs under 300 lines by splitting large changes into logical layers; current average is ${avg_lines_changed} lines.`);
      steps.add('Add a PR size check to your team\'s review checklist so reviewers flag oversized PRs before they are approved.');
    }
    if (steps.size === 0) {
      // Fallback
      steps.add('Review PR size distribution, even if average is fine, a few outliers can cause friction.');
      steps.add('Encourage earlier draft PRs to get feedback before code is complete.');
    }
  }

  if (pattern === 'Healthy Flow') {
    steps.add('Document what is working. Write a brief team note on the practices that kept this month\'s metrics balanced.');
    steps.add('Use this as a baseline: set explicit targets for next month and track whether the healthy pattern holds under increased load.');
  }

  let stepsArray = Array.from(steps);
  if (stepsArray.length > 2) {
    stepsArray = stepsArray.slice(0, 2);
  } else if (stepsArray.length < 2) {
    while (stepsArray.length < 2) {
      stepsArray.push('Review the full metric breakdown to spot any hidden friction.');
    }
  }
  return stepsArray;
}

export function computeManagerSummary(managerId, month, devList) {
  const teamDevs = devList.filter(d => d.manager_id === managerId);

  const teamMetrics = teamDevs.map(dev => ({
    dev,
    metrics: computeMetrics(dev.developer_id, month),
  }));

  const withData = teamMetrics.filter(t => t.metrics.issues_done > 0);
  const n = withData.length;

  if (n === 0) return null;

  const avg = key => round(withData.reduce((s, t) => s + t.metrics[key], 0) / n);

  const avg_lead_time_days  = avg('avg_lead_time_days');
  const avg_cycle_time_days = avg('avg_cycle_time_days');
  const avg_bug_rate_pct    = avg('bug_rate_pct');

  const signal =
    avg_bug_rate_pct >= 40 ? 'Quality Watch' :
    avg_cycle_time_days > 5 || avg_lead_time_days > 4.5 ? 'Watch Bottlenecks' :
    'Healthy Flow';

  return {
    manager_id: managerId,
    manager_name: teamDevs[0]?.manager_name,
    month,
    team_size: teamDevs.length,
    avg_lead_time_days,
    avg_cycle_time_days,
    avg_bug_rate_pct,
    signal,
    team_breakdown: teamMetrics,
  };
}

export function computeTeamBenchmark(developerId, month) {
  const dev = developers.find(d => d.developer_id === developerId);
  if (!dev) return null;

  const teammates = developers.filter(d =>
    d.manager_id === dev.manager_id && d.developer_id !== developerId
  );

  const teammateMetrics = teammates
    .map(t => computeMetrics(t.developer_id, month))
    .filter(m => m.issues_done > 0);

  if (teammateMetrics.length === 0) return null;

  const n = teammateMetrics.length;
  const avg = key => round(teammateMetrics.reduce((s, m) => s + m[key], 0) / n);

  return {
    team_avg_lead_time_days:  avg('avg_lead_time_days'),
    team_avg_cycle_time_days: avg('avg_cycle_time_days'),
    team_avg_bug_rate_pct:    avg('bug_rate_pct'),
    team_avg_review_wait_hours: avg('avg_review_wait_hours'),
    sample_size: n,
  };
}

export function detectContradictions(metrics) {
  const {
    avg_cycle_time_days, avg_lead_time_days, avg_review_wait_hours,
    bug_rate_pct, merged_prs, prod_deps, hotfix_count,
  } = metrics;

  const signals = [];

  if (avg_cycle_time_days < 4 && avg_lead_time_days > 4.5) {
    signals.push({
      type: 'pipeline_lag',
      label: 'Pipeline Lag Detected',
      message: `Code completes fast (${avg_cycle_time_days}d cycle time) but takes ${avg_lead_time_days}d to reach production. The bottleneck is after the code is written, likely in the review queue or deployment pipeline, not in development itself.`,
    });
  }

  if (avg_review_wait_hours < 10 && avg_lead_time_days > 4) {
    signals.push({
      type: 'deploy_lag',
      label: 'Deploy Pipeline Lag',
      message: `Reviews are arriving quickly (${avg_review_wait_hours}h avg wait) but lead time is still ${avg_lead_time_days}d. The delay is sitting in the deployment pipeline itself, not in the review process.`,
    });
  }

  if (merged_prs >= 3 && bug_rate_pct >= 50) {
    signals.push({
      type: 'speed_quality_tradeoff',
      label: 'Speed vs Quality Tension',
      message: `${merged_prs} PRs merged this month alongside a ${bug_rate_pct}% bug rate. High throughput is valuable, but the escape rate suggests reviews may be too shallow when volume is high.`,
    });
  }

  if (hotfix_count >= 2 && bug_rate_pct === 0) {
    signals.push({
      type: 'silent_hotfixes',
      label: 'Unlogged Hotfix Pattern',
      message: `${hotfix_count} hotfix deployments occurred this month but no bugs are logged against this developer. Hotfixes without corresponding bug reports may indicate issues being fixed without formal tracking.`,
    });
  }

  if (avg_cycle_time_days < 3.5 && avg_review_wait_hours > 18) {
    signals.push({
      type: 'reviewer_bottleneck',
      label: 'Reviewer Availability Gap',
      message: `Development is completing in ${avg_cycle_time_days}d but PRs wait ${avg_review_wait_hours}h for first review. The bottleneck is not the developer, but rather the team's review bandwidth.`,
    });
  }

  return signals;
}

export function computeConfidence(metrics) {
  const { issues_done, merged_prs } = metrics;

  if (issues_done >= 5) {
    return { level: 'high', note: null };
  }
  if (issues_done >= 3) {
    return {
      level: 'medium',
      note: `Based on ${issues_done} completed issues this month. Metrics are directionally useful but interpret with care.`,
    };
  }
  return {
    level: 'low',
    note: `Only ${issues_done} issue${issues_done !== 1 ? 's' : ''} completed this month. Metrics may not be representative of overall performance.`,
  };
}

function round(val, decimals = 1) {
  return Math.round(val * 10 ** decimals) / 10 ** decimals;
}

function getPriorMonth(month) {
  const [year, mon] = month.split('-').map(Number);
  if (mon === 1) return `${year - 1}-12`;
  return `${year}-${String(mon - 1).padStart(2, '0')}`;
}

function summarizeRootCauses(causes) {
  if (!causes || causes.length === 0) return '';
  const counts = causes.reduce((acc, c) => {
    acc[c] = (acc[c] || 0) + 1;
    return acc;
  }, {});
  return Object.entries(counts)
    .map(([cause, count]) => `${cause} (×${count})`)
    .join(', ');
}