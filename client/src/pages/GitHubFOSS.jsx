import React, { useState, useEffect } from 'react';
import { 
  GitBranch, 
  GitPullRequest, 
  GitCommit, 
  Star, 
  GitFork, 
  ExternalLink, 
  CheckCircle, 
  ShieldCheck, 
  Sparkles,
  Calendar,
  FolderGit2,
  AlertCircle,
  User
} from 'lucide-react';
import { MetricCard } from '../components/common/MetricCard';
import { Badge } from '../components/common/Badge';
import { useLocalCache } from '../hooks/useLocalCache';
import { saveUserToRegistry } from '../utils/accountManager';
import { GitHubContributionHeatmap } from '../components/github/GitHubContributionHeatmap';

export function GitHubFOSS() {
  const [currentUser] = useLocalCache('prep_auth_user', null);
  const [handles, setHandles] = useLocalCache('prep_user_handles', {
    codeforces: '',
    leetcode: '',
    github: ''
  });

  const effectiveGithub = handles.github || currentUser?.handles?.github || '';
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('foss'); // 'foss' | 'repos'
  const [customGhUser, setCustomGhUser] = useState(effectiveGithub);

  const loadGitHub = async (username) => {
    setLoading(true);
    try {
      const user = username !== undefined ? username : (handles.github || currentUser?.handles?.github || '');
      const endpoint = user ? `/api/github/${encodeURIComponent(user)}` : '/api/github/unlinked';
      const res = await fetch(endpoint);
      if (res.ok) {
        const json = await res.json();
        if (json.success) setData(json.data);
      }
    } catch (e) {
      console.warn('Failed to load GitHub data:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const userToLoad = handles.github || currentUser?.handles?.github || '';
    if (userToLoad && !customGhUser) {
      setCustomGhUser(userToLoad);
    }
    loadGitHub(userToLoad);
  }, [handles.github, currentUser?.handles?.github]);

  if (loading || !data) {
    return (
      <div className="space-y-6">
        <div className="h-32 bg-white rounded-3xl animate-pulse border-2 border-black/10" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="h-48 bg-white rounded-3xl animate-pulse border-2 border-black/10" />
          <div className="h-48 bg-white rounded-3xl animate-pulse border-2 border-black/10" />
        </div>
      </div>
    );
  }

  const { profile = {}, fossContributions = [], repositories = [] } = data;
  const isLinked = Boolean(profile.username);



  return (
    <div className="space-y-6 animate-fadeIn font-sans">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-black font-display tracking-tight">
              GitHub & Open Source (FOSS) Evidence
            </h1>
            <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-black text-white font-bold">
              Section 29–33
            </span>
          </div>
          <p className="text-xs text-black/60 font-medium">
            Real-world developer contributions, merged pull requests, and classified open-source participation.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="text"
            value={customGhUser}
            onChange={(e) => setCustomGhUser(e.target.value)}
            placeholder="GitHub username..."
            className="px-3 py-2 rounded-xl bg-[#F4F4F0] border border-black/15 text-xs text-black font-mono focus:outline-none focus:border-black w-36 sm:w-48 font-medium"
          />
          <button
            onClick={() => {
              const cleanGh = customGhUser.trim();
              setHandles({ ...handles, github: cleanGh });
              if (currentUser?.email) {
                saveUserToRegistry({
                  ...currentUser,
                  handles: {
                    ...(currentUser.handles || {}),
                    github: cleanGh
                  }
                }, true);
                fetch('/api/auth/profile', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    email: currentUser.email,
                    handles: { ...(currentUser.handles || {}), github: cleanGh }
                  })
                }).catch(() => {});
              }
              loadGitHub(cleanGh);
            }}
            className="px-4 py-2 rounded-xl bg-black hover:bg-neutral-800 text-xs font-bold text-white font-mono shadow-[2px_2px_0px_rgba(0,0,0,1)] transition-all cursor-pointer"
          >
            Fetch Live
          </button>
        </div>
      </div>

      {/* Profile Overview Card */}
      <div className="p-6 rounded-3xl bg-white border-2 border-black flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-[4px_4px_0px_rgba(0,0,0,1)]">
        <div className="flex items-center gap-4">
          {profile.avatarUrl ? (
            <img
              src={profile.avatarUrl}
              alt={profile.name}
              className="w-16 h-16 rounded-2xl border-2 border-black object-cover shadow-[2px_2px_0px_rgba(0,0,0,1)]"
            />
          ) : (
            <div className="w-16 h-16 rounded-2xl border-2 border-black bg-[#F4F4F0] flex items-center justify-center text-black/40 shadow-[2px_2px_0px_rgba(0,0,0,1)]">
              <User className="w-8 h-8" />
            </div>
          )}
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-extrabold text-black font-display">{profile.name || 'Student'}</h2>
              <span className="text-xs font-mono font-bold text-blue-600">
                {isLinked ? `@${profile.username}` : 'Not Linked'}
              </span>
            </div>
            <p className="text-xs text-black/60 mt-1 max-w-md">{profile.bio}</p>
            <div className="flex items-center gap-4 mt-2 text-xs font-mono text-black/50 font-medium">
              <span>{profile.location}</span>
              <span>•</span>
              <span>Active since {profile.joinedYear}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full md:w-auto text-center text-xs font-mono">
          <div className="p-3 rounded-2xl bg-[#F4F4F0] border border-black/10">
            <span className="text-[10px] text-black/50 block font-bold">Public Repos</span>
            <span className="text-lg font-extrabold text-black">{profile.publicRepos}</span>
          </div>
          <div className="p-3 rounded-2xl bg-[#F4F4F0] border border-black/10">
            <span className="text-[10px] text-black/50 block font-bold">Commits (1y)</span>
            <span className="text-lg font-extrabold text-blue-600">{profile.totalCommitsLastYear}</span>
          </div>
          <div className="p-3 rounded-2xl bg-[#F4F4F0] border border-black/10">
            <span className="text-[10px] text-black/50 block font-bold">Merged PRs</span>
            <span className="text-lg font-extrabold text-emerald-700">{profile.mergedPullRequests}</span>
          </div>
          <div className="p-3 rounded-2xl bg-[#F4F4F0] border border-black/10">
            <span className="text-[10px] text-black/50 block font-bold">Total Stars</span>
            <span className="text-lg font-extrabold text-amber-700">{profile.totalStars}</span>
          </div>
        </div>
      </div>

      {/* Section 31 Signal Quality Notice */}
      <div className="p-4 rounded-2xl bg-blue-50 border-2 border-blue-200 text-xs text-blue-950 flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <div className="space-y-1">
          <span className="font-bold text-blue-900 font-mono">
            Section 31 Evaluation Principle: Do Not Equate Popularity With Skill
          </span>
          <p className="text-blue-900/80 leading-relaxed font-medium">
            The platform weights <strong className="text-black">merged pull requests</strong>,{' '}
            <strong className="text-black">code reviews</strong>, and{' '}
            <strong className="text-black">issue participation</strong> significantly higher than
            vanity follower counts or repo star counts.
          </p>
        </div>
      </div>

      {/* Real GitHub Contribution Calendar Heatmap */}
      <GitHubContributionHeatmap
        username={profile.username || handles.github || customGhUser}
        calendar={data.calendar}
        totalContributions={profile.totalCommitsLastYear}
        loading={loading}
      />

      {/* Tab Controls */}
      <div className="flex border-b-2 border-black/10 gap-6 text-xs font-mono">
        <button
          onClick={() => setActiveTab('foss')}
          className={`pb-3 border-b-2 font-bold transition-colors ${
            activeTab === 'foss'
              ? 'border-black text-black'
              : 'border-transparent text-black/40 hover:text-black'
          }`}
        >
          FOSS & Open Source ({fossContributions.length})
        </button>
        <button
          onClick={() => setActiveTab('repos')}
          className={`pb-3 border-b-2 font-bold transition-colors ${
            activeTab === 'repos'
              ? 'border-black text-black'
              : 'border-transparent text-black/40 hover:text-black'
          }`}
        >
          Public Repositories ({repositories.length})
        </button>
      </div>

      {/* TAB 1: FOSS Contributions */}
      {activeTab === 'foss' && (
        <div>
          {fossContributions.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {fossContributions.map((foss) => (
                <div
                  key={foss.id}
                  className="p-6 rounded-3xl bg-white border-2 border-black flex flex-col justify-between space-y-3 shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:translate-y-[-2px] transition-all"
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between">
                      <span className="text-xs font-mono font-bold text-blue-600 flex items-center gap-1.5">
                        <FolderGit2 className="w-3.5 h-3.5" />
                        {foss.repo}
                      </span>
                      <Badge variant={foss.classification?.includes('Tier 1') ? 'emerald' : 'blue'} size="sm">
                        {foss.classification}
                      </Badge>
                    </div>

                    <p className="text-xs font-bold text-black">{foss.title}</p>
                    <div className="flex items-center gap-3 text-[11px] font-mono text-black/50 font-medium">
                      <span>Type: {foss.type}</span>
                      <span>•</span>
                      <span>Date: {foss.date}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-black/10 text-xs font-mono">
                    <div className="flex items-center gap-1.5 text-emerald-700 font-bold">
                      <CheckCircle className="w-4 h-4" />
                      <span>{foss.status}</span>
                    </div>

                    <a
                      href={foss.repoUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1 text-black/60 hover:text-black font-bold"
                    >
                      <span>View upstream</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-12 px-4 text-center rounded-3xl bg-white border-2 border-dashed border-black/15 space-y-2">
              <FolderGit2 className="w-8 h-8 text-black/30 mx-auto" />
              <p className="text-xs font-bold text-black font-display">No open-source contributions recorded</p>
              <p className="text-[11px] text-black/50 max-w-sm mx-auto">
                Link your GitHub account above to sync open-source pull requests, issues, and contributions.
              </p>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: Repositories */}
      {activeTab === 'repos' && (
        <div>
          {repositories.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {repositories.map((repo, idx) => (
                <div
                  key={idx}
                  className="p-6 rounded-3xl bg-white border-2 border-black flex flex-col justify-between space-y-3 shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:translate-y-[-2px] transition-all"
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between">
                      <a
                        href={repo.url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-sm font-extrabold text-black hover:text-blue-600 flex items-center gap-1.5 font-display"
                      >
                        <span>{repo.name}</span>
                        <ExternalLink className="w-3 h-3 text-black/40" />
                      </a>
                      {repo.isFoss && <Badge variant="emerald" size="sm">FOSS</Badge>}
                    </div>

                    <p className="text-xs text-black/60 leading-relaxed">{repo.description}</p>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-black/10 text-xs font-mono text-black/60 font-medium">
                    <span className="text-blue-600 font-bold">{repo.language}</span>
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1 text-black font-semibold">
                        <Star className="w-3.5 h-3.5 text-amber-500" /> {repo.stars}
                      </span>
                      <span className="flex items-center gap-1">
                        <GitFork className="w-3.5 h-3.5 text-black/40" /> {repo.forks}
                      </span>
                      <span className="px-2 py-0.5 rounded-lg bg-[#F4F4F0] border border-black/10 text-[10px] text-black font-bold">
                        {repo.license}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-12 px-4 text-center rounded-3xl bg-white border-2 border-dashed border-black/15 space-y-2">
              <FolderGit2 className="w-8 h-8 text-black/30 mx-auto" />
              <p className="text-xs font-bold text-black font-display">No repositories to display</p>
              <p className="text-[11px] text-black/50 max-w-sm mx-auto">
                Link your GitHub account above to fetch your public projects and evidence.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
