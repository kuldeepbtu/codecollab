/**
 * GitHub Service (Frontend) — Connect + Push to GitHub
 */

import api from "../api/axios";

/**
 * Test GitHub connection
 * @param {{ token: string, owner: string, repo: string, branch: string }}
 */
export const testGithubConnection = async ({ token, owner, repo, branch }) => {
  const res = await api.post("/api/github/test", {
    token,
    owner,
    repo,
    branch,
  });
  return res.data;
};

/**
 * Push code to GitHub
 * @param {{ token: string, owner: string, repo: string, branch: string, path: string, content: string, message?: string }}
 */
export const pushToGithub = async ({
  token,
  owner,
  repo,
  branch,
  path,
  content,
  message,
}) => {
  const res = await api.post("/api/github/push", {
    token,
    owner,
    repo,
    branch,
    path,
    content,
    message,
  });
  return res.data;
};
