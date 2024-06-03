import * as core from '@actions/core';
import * as github from '@actions/github';

const actionName = 'PR Information';

const handleDebug = (str: string) => {
  core.debug(`[${actionName}]::${str}`);
};

const run = async (): Promise<void> => {
  const ghToken = core.getInput('github_token');
  const findInBodyBy = core.getInput('find_in_body_by');

  const pull = await getMergedPullRequest(
    ghToken,
    github.context.repo.owner,
    github.context.repo.repo,
    github.context.sha
  );

  if (!pull) {
    throw new Error('Pull request not found');
  }

  handleDebug(JSON.stringify(pull));

  const body = getBody(findInBodyBy, pull.body);
  const labels = pull.labels?.map((l) => l.name);

  core.setOutput('title', pull.title);
  core.setOutput('body', body);
  core.setOutput('labels', labels);
  core.setOutput('url', pull.html_url);
};

const getBody = (findInBodyBy: string | undefined, body: string | null) => {
  if (!findInBodyBy) return body;

  const regex = new RegExp(findInBodyBy, 'g');

  return body?.match(regex)?.map((v) => v) ?? [];
};

const getMergedPullRequest = async (
  githubToken: string,
  owner: string,
  repo: string,
  sha: string
) => {
  const octokit = github.getOctokit(githubToken);

  handleDebug(
    `Searching PR ( owner = ${owner}, repo = ${repo}, sha = ${sha}, direction = desc, sort = updated, state = closed, per_page = 50 )`
  );

  const resp = await octokit.rest.pulls.list({
    owner,
    repo,
    direction: 'desc',
    sort: 'updated',
    state: 'closed',
    per_page: 50,
  });

  return resp?.data?.find((p) => p.merge_commit_sha === sha);
};

run().catch((err) => core.setFailed(err.message));
