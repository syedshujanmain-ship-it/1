// Push source code to GitHub repo using Personal Access Token
// FIXED: Uses Git Trees API for bulk upload (fast & reliable)
// FIXED: Retry logic with exponential backoff
// FIXED: Better error messages for common token issues

import { getAllSourceFiles } from '@/utils/sourceFiles';
import { generateSourceFilesContent } from '@/utils/generateSourceFilesContent';
import { getCapacitorConfig } from '@/utils/androidExport';

const GITHUB_API = 'https://api.github.com';

interface PushResult {
  success: boolean;
  repoUrl?: string;
  message: string;
}

// Retry fetch with exponential backoff
async function fetchWithRetry(
  url: string,
  options: RequestInit,
  retries = 3,
  delay = 1000
): Promise<Response> {
  for (let i = 0; i < retries; i++) {
    const res = await fetch(url, options);
    // Retry on rate limit (403 with abuse rate limit) or server errors (5xx)
    if (res.status === 403 || res.status >= 500) {
      const errBody = await res.text();
      // Check if it's a rate limit
      if (errBody.includes('rate limit') || errBody.includes('abuse') || res.status >= 500) {
        if (i < retries - 1) {
          await new Promise(r => setTimeout(r, delay * Math.pow(2, i)));
          continue;
        }
      }
    }
    return res;
  }
  return new Response('', { status: 500 });
}

export async function pushToGitHub(
  token: string,
  repoName: string,
  isPrivate: boolean,
  onProgress?: (msg: string, current: number, total: number) => void,
  fileOverrides?: Record<string, string>,
  includeAndroid = false
): Promise<PushResult> {
  try {
    // 1. Verify token
    onProgress?.('Verifying GitHub token...', 0, 100);
    const userRes = await fetchWithRetry(`${GITHUB_API}/user`, {
      headers: { Authorization: `token ${token}`, Accept: 'application/vnd.github.v3+json' }
    });
    if (!userRes.ok) {
      const err = await userRes.json().catch(() => ({}));
      const msg = err.message || userRes.statusText;
      if (msg.includes('Bad credentials') || userRes.status === 401) {
        return { success: false, message: 'Invalid token. Please check your GitHub Personal Access Token and try again.' };
      }
      return { success: false, message: `Token error: ${msg}` };
    }
    const user = await userRes.json();
    const owner = user.login;

    // 2. Check/create repo
    onProgress?.('Checking repository...', 3, 100);
    const repoRes = await fetchWithRetry(`${GITHUB_API}/repos/${owner}/${repoName}`, {
      headers: { Authorization: `token ${token}`, Accept: 'application/vnd.github.v3+json' }
    });

    if (repoRes.status === 404) {
      onProgress?.('Creating repository...', 5, 100);
      const createRes = await fetchWithRetry(`${GITHUB_API}/user/repos`, {
        method: 'POST',
        headers: {
          Authorization: `token ${token}`,
          Accept: 'application/vnd.github.v3+json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: repoName,
          description: 'Red Whale V1 - Super Ultra Pro Max Unrestricted AI',
          private: isPrivate,
          auto_init: true
        })
      });
      if (!createRes.ok) {
        const err = await createRes.json().catch(() => ({}));
        let msg = err.message || createRes.statusText;
        if (createRes.status === 403 || createRes.status === 404 || msg.includes('Resource not accessible')) {
          msg = 'Your token cannot create repositories.\n\nSOLUTION:\n1. Go to github.com → Settings → Developer settings → Personal access tokens → Tokens (classic)\n2. Generate a NEW Classic Token (NOT Fine-Grained)\n3. Select the "repo" scope checkbox\n4. Copy the new token and paste it here.\n\nFine-grained tokens do NOT support repo creation via API.';
        }
        return { success: false, message: msg };
      }
      await new Promise(r => setTimeout(r, 3000));
    } else if (!repoRes.ok) {
      return { success: false, message: `Failed to check repo: ${repoRes.statusText}` };
    }

    // 3. Get all source files
    const files = getAllSourceFiles();
    const mergedFiles: Record<string, string> = {};
    for (const [path, content] of Object.entries(files)) {
      mergedFiles[path] = fileOverrides?.[path] ?? content;
    }
    if (fileOverrides) {
      for (const [path, content] of Object.entries(fileOverrides)) {
        if (!mergedFiles[path]) mergedFiles[path] = content;
      }
    }

    // Generate sourceFiles.ts dynamically (avoids self-reference escaping issues)
    mergedFiles['src/utils/sourceFiles.ts'] = generateSourceFilesContent(mergedFiles);

    // Include Android project files if requested
    if (includeAndroid) {
      onProgress?.('Adding Android project files...', 12, 100);
      const androidFiles = getCapacitorConfig('Red Whale', 'com.redwhale.app');
      for (const [path, content] of Object.entries(androidFiles)) {
        mergedFiles[`android/${path}`] = content;
      }
    }

    const fileEntries = Object.entries(mergedFiles);
    const totalFiles = fileEntries.length;

    // 4. Get the current commit SHA
    onProgress?.('Getting repository info...', 8, 100);
    const branchRes = await fetchWithRetry(`${GITHUB_API}/repos/${owner}/${repoName}/git/ref/heads/main`, {
      headers: { Authorization: `token ${token}`, Accept: 'application/vnd.github.v3+json' }
    });
    let baseSha: string;
    if (branchRes.ok) {
      const branchData = await branchRes.json();
      baseSha = branchData.object.sha;
    } else {
      // Try master branch
      const masterRes = await fetchWithRetry(`${GITHUB_API}/repos/${owner}/${repoName}/git/ref/heads/master`, {
        headers: { Authorization: `token ${token}`, Accept: 'application/vnd.github.v3+json' }
      });
      if (masterRes.ok) {
        const masterData = await masterRes.json();
        baseSha = masterData.object.sha;
      } else {
        return { success: false, message: 'Could not find main or master branch. Make sure the repository has at least one commit.' };
      }
    }

    // 5. Get the base tree
    onProgress?.('Preparing files...', 10, 100);
    const commitRes = await fetchWithRetry(`${GITHUB_API}/repos/${owner}/${repoName}/git/commits/${baseSha}`, {
      headers: { Authorization: `token ${token}`, Accept: 'application/vnd.github.v3+json' }
    });
    if (!commitRes.ok) {
      return { success: false, message: 'Failed to get base commit.' };
    }
    const commitData = await commitRes.json();
    const baseTreeSha = commitData.tree.sha;

    // 6. Build tree entries (batch all files)
    const treeEntries: Array<{ path: string; mode: string; type: string; content: string }> = [];
    for (const [filePath, content] of fileEntries) {
      treeEntries.push({
        path: filePath,
        mode: '100644',
        type: 'blob',
        content: content
      });
    }

    // 7. Create tree
    onProgress?.('Uploading files via Git Trees API...', 15, 100);
    const treeRes = await fetchWithRetry(`${GITHUB_API}/repos/${owner}/${repoName}/git/trees`, {
      method: 'POST',
      headers: {
        Authorization: `token ${token}`,
        Accept: 'application/vnd.github.v3+json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        base_tree: baseTreeSha,
        tree: treeEntries
      })
    });

    if (!treeRes.ok) {
      const err = await treeRes.json().catch(() => ({}));
      return { success: false, message: `Failed to create file tree: ${err.message || treeRes.statusText}` };
    }
    const treeData = await treeRes.json();

    // 8. Create commit
    onProgress?.('Creating commit...', 90, 100);
    const newCommitRes = await fetchWithRetry(`${GITHUB_API}/repos/${owner}/${repoName}/git/commits`, {
      method: 'POST',
      headers: {
        Authorization: `token ${token}`,
        Accept: 'application/vnd.github.v3+json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message: 'Update from Red Whale V1',
        tree: treeData.sha,
        parents: [baseSha]
      })
    });

    if (!newCommitRes.ok) {
      return { success: false, message: 'Failed to create commit.' };
    }
    const newCommitData = await newCommitRes.json();

    // 9. Update branch reference
    onProgress?.('Updating branch...', 95, 100);
    const updateRes = await fetchWithRetry(`${GITHUB_API}/repos/${owner}/${repoName}/git/refs/heads/main`, {
      method: 'PATCH',
      headers: {
        Authorization: `token ${token}`,
        Accept: 'application/vnd.github.v3+json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ sha: newCommitData.sha })
    });

    if (!updateRes.ok) {
      // Try master
      const masterUpdateRes = await fetchWithRetry(`${GITHUB_API}/repos/${owner}/${repoName}/git/refs/heads/master`, {
        method: 'PATCH',
        headers: {
          Authorization: `token ${token}`,
          Accept: 'application/vnd.github.v3+json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ sha: newCommitData.sha })
      });
      if (!masterUpdateRes.ok) {
        return { success: false, message: 'Failed to update branch reference.' };
      }
    }

    onProgress?.('Complete!', 100, 100);

    const repoUrl = `https://github.com/${owner}/${repoName}`;
    return {
      success: true,
      repoUrl,
      message: `Successfully pushed all ${totalFiles} files to ${repoUrl}\n\nNow go to vercel.com/new and import your repository to deploy!`
    };
  } catch (error: any) {
    return { success: false, message: `Error: ${error.message || 'Unknown error'}` };
  }
}
