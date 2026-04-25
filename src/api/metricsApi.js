/* So this is a mock API layer that simulates what real backend endpoints would return.
/ In production each function will be replaced with a fetch() call to the server. */

import { jiraIssues, pullRequests, deployments, bugReports, developers } from '../data';

const delay = (ms = 300) => new Promise(res => setTimeout(res, ms));

export async function fetchDeveloper(developerId) {
  await delay();
  const dev = developers.find(d => d.developer_id === developerId);
  if (!dev) throw new Error(`Developer ${developerId} not found`);
  return dev;
}

export async function fetchIssues(developerId, month) {
  await delay();
  return jiraIssues.filter(
    d => d.developer_id === developerId && d.month_done === month
  );
}

export async function fetchPullRequests(developerId, month) {
  await delay();
  return pullRequests.filter(
    d => d.developer_id === developerId && d.month_merged === month
  );
}

export async function fetchDeployments(developerId, month) {
  await delay();
  return deployments.filter(
    d => d.developer_id === developerId &&
         d.month_deployed === month &&
         d.status === 'success'
  );
}

export async function fetchBugReports(developerId, month) {
  await delay();
  return bugReports.filter(
    d => d.developer_id === developerId && d.month_found === month
  );
}

export async function fetchTeamRoster(managerId) {
  await delay();
  return developers.filter(d => d.manager_id === managerId);
}