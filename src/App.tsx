import React, { useState } from 'react';
import { Download, FileCode2, Shield, Brain, Zap, GitPullRequest, Search, Bot, Cpu, AlertTriangle, CheckCircle, Database, Key } from 'lucide-react';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import workflowsData from './data/workflows.json';
import memoryData from './data/memory.json';
import Shibboleth from './components/Shibboleth';

type WorkflowKey = keyof typeof workflowsData;
type MemoryKey = keyof typeof memoryData;

const iconMap: Record<string, React.ReactNode> = {
  'claude-orchestrate.yml': <Brain className="w-5 h-5 text-purple-400" />,
  'claude-oracle.yml': <Search className="w-5 h-5 text-blue-400" />,
  'claude-release.yml': <Zap className="w-5 h-5 text-yellow-400" />,
  '🚨-Secret-Sentinel.yml': <Shield className="w-5 h-5 text-red-400" />,
  'claude-self-heal.yml': <CheckCircle className="w-5 h-5 text-green-400" />,
  'claude-triage.yml': <AlertTriangle className="w-5 h-5 text-orange-400" />,
  'copilot-setup-steps.yml': <GitPullRequest className="w-5 h-5 text-gray-400" />,
  'gradle-publish.yml': <FileCode2 className="w-5 h-5 text-teal-400" />,
  'shibboleth-security.yml': <Shield className="w-5 h-5 text-red-500" />,
  'codex-oracle.yml': <Cpu className="w-5 h-5 text-blue-500" />,
  'grok-oracle.yml': <Bot className="w-5 h-5 text-indigo-400" />,
  'clawdbot-oracle.yml': <Bot className="w-5 h-5 text-purple-500" />,
  'pi-oracle.yml': <Bot className="w-5 h-5 text-green-500" />,
  'orchestra-oracle.yml': <Brain className="w-5 h-5 text-pink-400" />,
};

const memoryIcon = <Database className="w-5 h-5 text-emerald-400" />;
const defaultIcon = <FileCode2 className="w-5 h-5 text-gray-400" />;

export default function App() {
  const [selectedFile, setSelectedFile] = useState<string>('claude-orchestrate.yml');
  const [fileType, setFileType] = useState<'workflow' | 'memory' | 'shibboleth'>('workflow');

  const handleDownload = async () => {
    const zip = new JSZip();
    const githubFolder = zip.folder('.github');
    const workflowsFolder = githubFolder?.folder('workflows');
    const agentsFolder = githubFolder?.folder('agents');
    const memoryFolder = agentsFolder?.folder('memory');
    
    if (workflowsFolder) {
      Object.entries(workflowsData).forEach(([filename, content]) => {
        workflowsFolder.file(filename, content as string);
      });
    }
    
    if (memoryFolder) {
      Object.entries(memoryData).forEach(([filename, content]) => {
        memoryFolder.file(filename, content as string);
      });
    }
    
    const content = await zip.generateAsync({ type: 'blob' });
    saveAs(content, 'ai-hypervisor-github-actions.zip');
  };

  const currentContent = fileType === 'workflow' 
    ? workflowsData[selectedFile as WorkflowKey] 
    : memoryData[selectedFile as MemoryKey];

  return (
    <div className="flex h-screen bg-gray-950 text-gray-100 font-sans">
      {/* Sidebar */}
      <div className="w-80 bg-gray-900 border-r border-gray-800 flex flex-col">
        <div className="p-6 border-b border-gray-800">
          <div className="flex items-center gap-3 mb-2">
            <Brain className="w-8 h-8 text-indigo-500" />
            <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
              AI Hypervisor
            </h1>
          </div>
          <p className="text-sm text-gray-400">GitHub Actions Suite</p>
        </div>
        
        <div className="flex-1 overflow-y-auto py-4">
          <div className="px-4 mb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Agents & Workflows
          </div>
          <ul className="space-y-1 px-2 mb-6">
            {(Object.keys(workflowsData) as WorkflowKey[]).map((filename) => (
              <li key={filename}>
                <button
                  onClick={() => { setSelectedFile(filename); setFileType('workflow'); }}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
                    selectedFile === filename && fileType === 'workflow'
                      ? 'bg-indigo-500/10 text-indigo-300'
                      : 'text-gray-300 hover:bg-gray-800 hover:text-gray-100'
                  }`}
                >
                  {iconMap[filename] || defaultIcon}
                  <span className="truncate">{filename}</span>
                </button>
              </li>
            ))}
          </ul>
          
          <div className="px-4 mb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Agent Memory
          </div>
          <ul className="space-y-1 px-2">
            {(Object.keys(memoryData) as MemoryKey[]).map((filename) => (
              <li key={filename}>
                <button
                  onClick={() => { setSelectedFile(filename); setFileType('memory'); }}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
                    selectedFile === filename && fileType === 'memory'
                      ? 'bg-indigo-500/10 text-indigo-300'
                      : 'text-gray-300 hover:bg-gray-800 hover:text-gray-100'
                  }`}
                >
                  {memoryIcon}
                  <span className="truncate">{filename}</span>
                </button>
              </li>
            ))}
          </ul>
          <div className="px-4 mb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Security
          </div>
          <ul className="space-y-1 px-2 mb-6">
            <li>
              <button
                onClick={() => { setSelectedFile('shibboleth'); setFileType('shibboleth'); }}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
                  fileType === 'shibboleth'
                    ? 'bg-red-500/10 text-red-400'
                    : 'text-gray-300 hover:bg-gray-800 hover:text-gray-100'
                }`}
              >
                <Key className="w-5 h-5 text-red-500" />
                <span className="truncate">Shibboleth Secrets</span>
              </button>
            </li>
          </ul>
        </div>
        
        <div className="p-4 border-t border-gray-800">
          <button
            onClick={handleDownload}
            className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 px-4 rounded-lg font-medium transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4" />
            Download .github
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 bg-gray-950">
        {fileType === 'shibboleth' ? (
          <div className="flex-1 overflow-auto p-6">
            <Shibboleth />
          </div>
        ) : (
          <>
            <div className="h-16 border-b border-gray-800 flex items-center justify-between px-6 bg-gray-900/50">
              <div className="flex items-center gap-3">
                {fileType === 'workflow' ? (iconMap[selectedFile] || defaultIcon) : memoryIcon}
                <h2 className="text-lg font-medium text-gray-200">{selectedFile}</h2>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-full bg-indigo-500/10 text-indigo-400 text-xs font-medium border border-indigo-500/20">
                  {fileType === 'workflow' ? 'Active Agent' : 'Agent Memory'}
                </span>
              </div>
            </div>
            
            <div className="flex-1 overflow-auto p-6">
              <div className="max-w-5xl mx-auto h-full flex flex-col">
                <div className="mb-6">
                  <h3 className="text-xl font-semibold text-gray-100 mb-2">
                    {selectedFile.replace('.yml', '').replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </h3>
                  <p className="text-gray-400 text-sm">
                    {fileType === 'workflow' 
                      ? `This workflow defines the behavior and triggers for the ${selectedFile.split('-')[0]} agent. It runs as a GitHub Action to automate repository tasks.`
                      : `This memory file provides persistent context and instructions for the AI agents regarding ${selectedFile.replace('.yml', '').replace(/-/g, ' ')}.`}
                  </p>
                </div>
                
                <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden shadow-2xl flex-1 flex flex-col">
                  <div className="flex items-center px-4 py-3 bg-gray-800/50 border-b border-gray-800 text-xs text-gray-400 font-mono shrink-0">
                    .github/{fileType === 'workflow' ? 'workflows' : 'agents/memory'}/{selectedFile}
                  </div>
                  <div className="flex-1 overflow-auto p-6">
                    <pre className="text-sm font-mono text-gray-300 leading-relaxed">
                      <code>{currentContent}</code>
                    </pre>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
