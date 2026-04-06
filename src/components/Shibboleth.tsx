import React, { useState } from 'react';
import { Shield, Key, Github, Save, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { Octokit } from '@octokit/rest';
import sodium from 'libsodium-wrappers';

const SECRET_KEYS = [
  { id: 'TWITTER_API_KEY', label: 'Twitter API Key', icon: '🐦' },
  { id: 'TWITTER_API_SECRET', label: 'Twitter API Secret', icon: '🐦' },
  { id: 'TWITTER_ACCESS_TOKEN', label: 'Twitter Access Token', icon: '🐦' },
  { id: 'TWITTER_ACCESS_TOKEN_SECRET', label: 'Twitter Access Token Secret', icon: '🐦' },
  { id: 'ANTHROPIC_API_KEY', label: 'Anthropic API Key', icon: '🧠' },
  { id: 'GEMINI_API_KEY', label: 'Gemini API Key', icon: '✨' },
  { id: 'XAI_API_KEY', label: 'xAI (Grok) API Key', icon: '🌌' },
  { id: 'OPENAI_API_KEY', label: 'OpenAI API Key', icon: '💻' },
  { id: 'CLAWDBOT_API_KEY', label: 'Clawdbot API Key', icon: '🐾' },
  { id: 'PI_API_KEY', label: 'Pi Coding Agent API Key', icon: '🤖' },
];

export default function Shibboleth() {
  const [githubToken, setGithubToken] = useState('');
  const [repo, setRepo] = useState('JakeDot/jourwigo-android');
  const [secrets, setSecrets] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<'idle' | 'syncing' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSecretChange = (id: string, value: string) => {
    setSecrets(prev => ({ ...prev, [id]: value }));
  };

  const syncToGithub = async () => {
    if (!githubToken || !repo.includes('/')) {
      setStatus('error');
      setErrorMessage('Please provide a valid GitHub PAT and Repository (owner/repo).');
      return;
    }

    const secretsToSync = Object.entries(secrets).filter(([_, value]) => value.trim() !== '');
    if (secretsToSync.length === 0) {
      setStatus('error');
      setErrorMessage('No secrets provided to sync.');
      return;
    }

    setStatus('syncing');
    setErrorMessage('');

    try {
      const [owner, repoName] = repo.split('/');
      const octokit = new Octokit({ auth: githubToken });

      // 1. Get repository public key for Actions secrets
      const { data: publicKeyData } = await octokit.actions.getRepoPublicKey({
        owner,
        repo: repoName,
      });

      // 2. Wait for sodium to be ready
      await sodium.ready;

      // 3. Encrypt and upload each secret
      for (const [keyName, keyValue] of secretsToSync) {
        // Convert secret and key to Uint8Array
        const binkey = sodium.from_base64(publicKeyData.key, sodium.base64_variants.ORIGINAL);
        const binsec = sodium.from_string(keyValue);

        // Encrypt the secret using libsodium
        const encBytes = sodium.crypto_box_seal(binsec, binkey);

        // Convert encrypted bytes to base64
        const encryptedValue = sodium.to_base64(encBytes, sodium.base64_variants.ORIGINAL);

        // Upload to GitHub
        await octokit.actions.createOrUpdateRepoSecret({
          owner,
          repo: repoName,
          secret_name: keyName,
          encrypted_value: encryptedValue,
          key_id: publicKeyData.key_id,
        });
      }

      setStatus('success');
      // Clear secrets after successful sync for security
      setSecrets({});
    } catch (error: any) {
      console.error('Sync error:', error);
      setStatus('error');
      setErrorMessage(error.message || 'Failed to sync secrets to GitHub.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto h-full flex flex-col">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <Shield className="w-8 h-8 text-red-500" />
          <h3 className="text-2xl font-bold text-gray-100">
            Shibboleth Secrets Manager
          </h3>
        </div>
        <p className="text-gray-400 text-sm">
          Securely inject API keys directly into your GitHub Actions environment. 
          Keys are encrypted locally using libsodium before being transmitted to GitHub.
        </p>
      </div>

      <div className="bg-gray-900 rounded-xl border border-gray-800 shadow-2xl flex-1 overflow-hidden flex flex-col">
        <div className="p-6 border-b border-gray-800 bg-gray-800/30">
          <h4 className="text-lg font-medium text-gray-200 mb-4 flex items-center gap-2">
            <Github className="w-5 h-5" /> GitHub Configuration
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">Repository (owner/repo)</label>
              <input
                type="text"
                value={repo}
                onChange={(e) => setRepo(e.target.value)}
                className="w-full bg-gray-950 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                placeholder="JakeDot/jourwigo-android"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">Personal Access Token (repo scope)</label>
              <input
                type="password"
                value={githubToken}
                onChange={(e) => setGithubToken(e.target.value)}
                className="w-full bg-gray-950 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                placeholder="ghp_..."
              />
            </div>
          </div>
        </div>

        <div className="p-6 overflow-y-auto flex-1">
          <h4 className="text-lg font-medium text-gray-200 mb-4 flex items-center gap-2">
            <Key className="w-5 h-5" /> Environment Secrets
          </h4>
          <div className="space-y-4">
            {SECRET_KEYS.map((secret) => (
              <div key={secret.id} className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                <label className="sm:w-1/3 text-sm font-medium text-gray-300 flex items-center gap-2">
                  <span>{secret.icon}</span>
                  {secret.label}
                </label>
                <input
                  type="password"
                  value={secrets[secret.id] || ''}
                  onChange={(e) => handleSecretChange(secret.id, e.target.value)}
                  className="flex-1 bg-gray-950 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  placeholder={`Enter ${secret.id}...`}
                />
              </div>
            ))}
          </div>
        </div>

        <div className="p-6 border-t border-gray-800 bg-gray-800/30 flex items-center justify-between">
          <div className="flex-1 mr-4">
            {status === 'error' && (
              <div className="flex items-center gap-2 text-red-400 text-sm">
                <AlertCircle className="w-4 h-4" />
                <span>{errorMessage}</span>
              </div>
            )}
            {status === 'success' && (
              <div className="flex items-center gap-2 text-emerald-400 text-sm">
                <CheckCircle2 className="w-4 h-4" />
                <span>Secrets successfully synced to GitHub!</span>
              </div>
            )}
          </div>
          <button
            onClick={syncToGithub}
            disabled={status === 'syncing'}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-600/50 disabled:cursor-not-allowed text-white py-2.5 px-6 rounded-lg font-medium transition-colors"
          >
            {status === 'syncing' ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Save className="w-5 h-5" />
            )}
            {status === 'syncing' ? 'Syncing...' : 'Sync to GitHub'}
          </button>
        </div>
      </div>
    </div>
  );
}
