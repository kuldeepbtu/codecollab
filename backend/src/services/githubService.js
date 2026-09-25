/**
 * GitHub Service — Test connection + Push file to GitHub
 * Ported from Project 1 TypeScript to MERN JavaScript
 */

import { GITHUB_API_BASE } from "../config/env.js";

function createGithubHeaders(token) {
  return {
    Accept: "application/vnd.github+json",
    Authorization: `Bearer ${token}`,
    "User-Agent": "codecollab-mern",
    "X-GitHub-Api-Version": "2022-11-28",
  };
}

function encodePath(filePath) {
  return filePath
    .split("/")
    .map((part) => encodeURIComponent(part))
    .join("/");
}

function formatGithubError(action, status, payload) {
  const rawMessage = payload?.message || "";
  const normalized = rawMessage.toLowerCase();

  if (status === 401) {
    return new Error(
      "GitHub rejected the token. Check that the token is valid and has not expired."
    );
  }

  if (
    status === 403 &&
    normalized.includes("resource not accessible by personal access token")
  ) {
    return new Error(
      "GitHub token cannot access this repository. Grant Contents: Read and write permission."
    );
  }

  if (status === 403) {
    return new Error(
      "GitHub refused the request. Check token repository access and permissions."
    );
  }

  if (status === 404) {
    return new Error(
      "GitHub repository, branch, or file path was not found. Check owner, repo, and branch."
    );
  }

  if (status === 409) {
    return new Error(
      "GitHub could not update the file because the branch changed. Refresh and try again."
    );
  }

  const detail = payload?.message ? ` ${payload.message}` : "";
  return new Error(`Could not ${action} on GitHub (${status}).${detail}`);
}

/**
 * Test GitHub connection — verifies token, repo, and branch access
 */
export async function testGithubConnection({ token, owner, repo, branch }) {
  const headers = createGithubHeaders(token);

  // Check repo
  const repoUrl = `${GITHUB_API_BASE}/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}`;
  const repoResponse = await fetch(repoUrl, { headers });
  const repoPayload = await repoResponse.json().catch(() => null);

  if (!repoResponse.ok) {
    throw formatGithubError("connect to repository", repoResponse.status, repoPayload);
  }

  // Check branch
  const branchUrl = `${repoUrl}/branches/${encodeURIComponent(branch)}`;
  const branchResponse = await fetch(branchUrl, { headers });
  const branchPayload = await branchResponse.json().catch(() => null);

  if (!branchResponse.ok) {
    throw formatGithubError("find branch", branchResponse.status, branchPayload);
  }

  return {
    owner: repoPayload.owner?.login || owner,
    repo: repoPayload.name || repo,
    branch,
    fullName: repoPayload.full_name || `${owner}/${repo}`,
    private: repoPayload.private || false,
    canPush: repoPayload.permissions?.push || false,
    defaultBranch: repoPayload.default_branch || branch,
  };
}

/**
 * Push a file to a GitHub repository
 */
export async function pushToGithub({
  token,
  owner,
  repo,
  branch,
  path: filePath,
  content,
  message: commitMessage,
}) {
  const headers = createGithubHeaders(token);
  const fileUrl = `${GITHUB_API_BASE}/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/contents/${encodePath(filePath)}`;

  // Check if file already exists (to get SHA for update)
  let existingSha;
  const checkResponse = await fetch(
    `${fileUrl}?ref=${encodeURIComponent(branch)}`,
    { headers }
  );

  if (checkResponse.ok) {
    const checkPayload = await checkResponse.json().catch(() => null);
    if (checkPayload?.type && checkPayload.type !== "file") {
      throw new Error("GitHub path must point to a file, not a directory.");
    }
    existingSha = checkPayload?.sha;
  } else if (checkResponse.status !== 404) {
    const errPayload = await checkResponse.json().catch(() => null);
    throw formatGithubError("check file", checkResponse.status, errPayload);
  }

  // Push file
  const pushBody = {
    message: commitMessage,
    content: Buffer.from(content, "utf8").toString("base64"),
    branch,
    ...(existingSha ? { sha: existingSha } : {}),
  };

  const pushResponse = await fetch(fileUrl, {
    method: "PUT",
    headers: { ...headers, "Content-Type": "application/json" },
    body: JSON.stringify(pushBody),
  });

  const pushPayload = await pushResponse.json().catch(() => null);

  if (!pushResponse.ok) {
    throw formatGithubError("push file", pushResponse.status, pushPayload);
  }

  return {
    path: pushPayload?.content?.path || filePath,
    branch,
    htmlUrl: pushPayload?.content?.html_url || "",
    commitSha: pushPayload?.commit?.sha || "",
  };
}
