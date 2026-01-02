"use client";

import React, { useState, useEffect } from 'react';
import { Card, Button, Badge } from '@/components/ui/core';
import { Shield, Zap, MessageSquare, Save, Play, RefreshCw } from 'lucide-react';
import Nango from '@nangohq/frontend';

export default function SettingsPage() {
  const [config, setConfig] = useState<any>({
    DEEPSEEK_API_BASE: '',
    DEEPSEEK_API_KEY: '',
  });

  // #region agent log
  useEffect(() => {
    fetch('http://127.0.0.1:7243/ingest/b4de5701-9876-47ce-aad5-7d358d247a66', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        location: 'settings/page.tsx:useEffect',
        message: 'SettingsPage mounted',
        data: { nangoKeySet: !!process.env.NEXT_PUBLIC_NANGO_PUBLIC_KEY },
        timestamp: Date.now(),
        sessionId: 'debug-session',
        hypothesisId: '5'
      })
    }).catch(() => {});
  }, []);
  // #endregion

  const [playbook, setPlaybook] = useState('');
  const [pulseStatus, setPulseStatus] = useState<'idle' | 'testing' | 'active' | 'error'>('idle');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchConfig();
    fetchPlaybook();
  }, []);

  const fetchConfig = async () => {
    try {
      const res = await fetch('/api/config');
      const data = await res.json();
      setConfig(data);
    } catch (err) {
      console.error("Failed to fetch config", err);
    }
  };

  const fetchPlaybook = async () => {
    try {
      const res = await fetch('/api/playbook');
      const data = await res.json();
      setPlaybook(data.content);
    } catch (err) {
      console.error("Failed to fetch playbook", err);
    }
  };

  const saveConfig = async (key: string, value: string) => {
    setSaving(true);
    try {
      await fetch('/api/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, value })
      });
      setConfig({ ...config, [key]: value });
    } catch (err) {
      console.error("Failed to save config", err);
    } finally {
      setSaving(false);
    }
  };

  const testPulse = async () => {
    setPulseStatus('testing');
    try {
      const res = await fetch('/api/config/pulse-check', { method: 'POST' });
      const data = await res.json();
      setPulseStatus(data.status === 'active' ? 'active' : 'error');
    } catch (err) {
      setPulseStatus('error');
    }
  };

  const savePlaybook = async () => {
    setSaving(true);
    try {
      await fetch('/api/playbook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: playbook })
      });
    } catch (err) {
      console.error("Failed to save playbook", err);
    } finally {
      setSaving(false);
    }
  };

  const connectService = async (provider: string) => {
    const publicKey = process.env.NEXT_PUBLIC_NANGO_PUBLIC_KEY;
    if (!publicKey) {
      console.error("Nango Public Key not set in environment variables.");
      return;
    }
    const nango = new Nango({ publicKey });
    try {
      const result = await nango.auth(provider, 'stefan-primary');
      console.log(`Connected to ${provider}`, result);
      // Trigger backend sync here
    } catch (err) {
      console.error(`Failed to connect to ${provider}`, err);
    }
  };

  return (
    <div className="space-y-12">
      <header className="space-y-4">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">System Command</span>
        </div>
        <h2 className="text-4xl font-light tracking-tight text-slate-100">Setup & Onboarding</h2>
        <p className="text-slate-400 text-base max-w-2xl font-light leading-relaxed">
          Configure your private reasoning nodes, authenticate communication channels, and define the <span className="text-slate-200">strategic guardrails</span> for your AI Chief of Staff.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Step 1: Reasoning Engine */}
        <Card className="space-y-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400">
                <Zap size={20} />
              </div>
              <h3 className="text-xl font-medium text-white italic-mercury">Reasoning Engine</h3>
            </div>
            <Badge variant={pulseStatus === 'active' ? 'success' : pulseStatus === 'error' ? 'warning' : 'default'}>
              {pulseStatus.toUpperCase()}
            </Badge>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Scaleway IP / Endpoint</label>
              <input 
                type="text" 
                value={config.DEEPSEEK_API_BASE || ''}
                onChange={(e) => setConfig({...config, DEEPSEEK_API_BASE: e.target.value})}
                onBlur={(e) => saveConfig('DEEPSEEK_API_BASE', e.target.value)}
                placeholder="http://51.159.141.13:8000/v1"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-sm text-slate-200 focus:outline-none focus:border-slate-600 transition-colors"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Secret Key</label>
              <input 
                type="password" 
                value={config.DEEPSEEK_API_KEY || ''}
                onChange={(e) => setConfig({...config, DEEPSEEK_API_KEY: e.target.value})}
                onBlur={(e) => saveConfig('DEEPSEEK_API_KEY', e.target.value)}
                placeholder="••••••••••••••••"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-sm text-slate-200 focus:outline-none focus:border-slate-600 transition-colors"
              />
            </div>
          </div>

          <Button 
            onClick={testPulse} 
            disabled={pulseStatus === 'testing'}
            className="w-full py-6 flex items-center justify-center gap-2 font-bold"
          >
            {pulseStatus === 'testing' ? <RefreshCw className="animate-spin" size={16} /> : <Play size={16} />}
            Pulse Check (H100 Node)
          </Button>
        </Card>

        {/* Step 2: Communication Nodes */}
        <Card className="space-y-8">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400">
              <MessageSquare size={20} />
            </div>
            <h3 className="text-xl font-medium text-white italic-mercury">Communication Nodes</h3>
          </div>

          <div className="space-y-4">
            <div className="p-4 bg-slate-950/50 border border-slate-800 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded bg-white/5 flex items-center justify-center text-xs font-bold text-slate-400">G</div>
                <div>
                  <p className="text-sm font-medium text-slate-200">Gmail Intelligence</p>
                  <p className="text-[10px] text-slate-500 uppercase tracking-tighter">gmail-sync</p>
                </div>
              </div>
              <Button size="sm" variant="outline" onClick={() => connectService('google-gmail')}>Authorize</Button>
            </div>

            <div className="p-4 bg-slate-950/50 border border-slate-800 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded bg-white/5 flex items-center justify-center text-xs font-bold text-slate-400">S</div>
                <div>
                  <p className="text-sm font-medium text-slate-200">Slack Stream</p>
                  <p className="text-[10px] text-slate-500 uppercase tracking-tighter">slack-messages</p>
                </div>
              </div>
              <Button size="sm" variant="outline" onClick={() => connectService('slack')}>Authorize</Button>
            </div>
          </div>

          <div className="p-4 bg-amber-900/10 border border-amber-900/20 rounded-lg">
            <p className="text-[10px] text-amber-500 leading-relaxed italic-mercury">
              Note: One-click auth uses the Nango secure vault. Project Compass never stores your direct OAuth credentials.
            </p>
          </div>
        </Card>

        {/* Step 3: Strategic Playbook */}
        <Card className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-500/10 rounded-lg text-purple-400">
                <Shield size={20} />
              </div>
              <h3 className="text-xl font-medium text-white italic-mercury">Founder Playbook</h3>
            </div>
            <Button 
              onClick={savePlaybook} 
              variant="primary" 
              className="px-8 flex items-center gap-2"
              disabled={saving}
            >
              <Save size={16} />
              Save Principles
            </Button>
          </div>

          <textarea 
            value={playbook}
            onChange={(e) => setPlaybook(e.target.value)}
            className="w-full h-64 bg-slate-950 border border-slate-800 rounded-xl p-6 text-sm text-slate-300 leading-relaxed font-mono focus:outline-none focus:border-slate-600 transition-colors"
            placeholder="# Core Principles..."
          />
        </Card>

      </div>
    </div>
  );
}

