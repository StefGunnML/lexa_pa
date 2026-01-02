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
    <div className="space-y-16 pb-20 font-sans">
      <header className="space-y-6">
        <div className="flex items-center gap-3">
          <span className="system-label">CALIBRATION_NODE</span>
          <span className="system-label">ENCRYPTION: AES-256</span>
        </div>
        <h2 className="text-6xl font-extrabold tracking-tight text-slate-900">System Command</h2>
        <p className="text-slate-500 text-xl max-w-2xl font-medium leading-relaxed">
          Calibrate private reasoning nodes... authenticate <span className="text-blue-600 font-bold">communication_nodes</span>... define strategic guardrails.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        
        {/* Step 1: Reasoning Engine */}
        <Card className={`space-y-10 ${pulseStatus === 'active' ? 'border-blue-200 bg-blue-50/10' : ''}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                <Zap size={24} />
              </div>
              <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight">Reasoning Node</h3>
            </div>
            <Badge variant={pulseStatus === 'active' ? 'success' : pulseStatus === 'error' ? 'warning' : 'default'}>
              {pulseStatus.toUpperCase()}
            </Badge>
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">SCALEWAY_IP_ENDPOINT</label>
              <input 
                type="text" 
                value={config.DEEPSEEK_API_BASE || ''}
                onChange={(e) => setConfig({...config, DEEPSEEK_API_BASE: e.target.value})}
                onBlur={(e) => saveConfig('DEEPSEEK_API_BASE', e.target.value)}
                placeholder="0.0.0.0"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-5 py-4 text-sm text-slate-900 focus:outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-50 transition-all placeholder:text-slate-300 font-mono"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">ACCESS_KEY</label>
              <input 
                type="password" 
                value={config.DEEPSEEK_API_KEY || ''}
                onChange={(e) => setConfig({...config, DEEPSEEK_API_KEY: e.target.value})}
                onBlur={(e) => saveConfig('DEEPSEEK_API_KEY', e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-5 py-4 text-sm text-slate-900 focus:outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-50 transition-all placeholder:text-slate-300 font-mono"
              />
            </div>
          </div>

          <Button 
            onClick={testPulse} 
            disabled={pulseStatus === 'testing'}
            className="w-full py-8 text-sm"
            variant={pulseStatus === 'active' ? 'primary' : 'secondary'}
          >
            {pulseStatus === 'testing' ? <RefreshCw className="animate-spin" size={18} /> : <Play size={18} />}
            Initiate Pulse Check
          </Button>
        </Card>

        {/* Step 2: Communication Nodes */}
        <Card className="space-y-10">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
              <MessageSquare size={24} />
            </div>
            <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight">Comm Nodes</h3>
          </div>

          <div className="space-y-4">
            <div className="p-6 bg-slate-50/50 border border-slate-100 rounded-2xl flex items-center justify-between hover:bg-white hover:shadow-sm transition-all group">
              <div className="flex items-center gap-5">
                <div className="w-12 h-12 bg-white border border-slate-200 flex items-center justify-center text-sm font-black text-slate-400 rounded-xl shadow-sm">G</div>
                <div>
                  <p className="text-base font-bold text-slate-900 tracking-tight">Gmail_INTEL</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">SYNC_READY</p>
                </div>
              </div>
              <Button size="sm" variant="outline" onClick={() => connectService('google-gmail')} className="font-bold border-slate-200">Link</Button>
            </div>

            <div className="p-6 bg-slate-50/50 border border-slate-100 rounded-2xl flex items-center justify-between hover:bg-white hover:shadow-sm transition-all group">
              <div className="flex items-center gap-5">
                <div className="w-12 h-12 bg-white border border-slate-200 flex items-center justify-center text-sm font-black text-slate-400 rounded-xl shadow-sm">S</div>
                <div>
                  <p className="text-base font-bold text-slate-900 tracking-tight">Slack_INTEL</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">STREAM_READY</p>
                </div>
              </div>
              <Button size="sm" variant="outline" onClick={() => connectService('slack')} className="font-bold border-slate-200">Link</Button>
            </div>
          </div>

          <div className="p-6 bg-blue-50 border border-blue-100 rounded-2xl">
            <p className="text-[11px] text-blue-700 leading-relaxed font-medium">
              Note: Auth managed via <span className="font-bold underline">Nango Secure Vault</span>. Project Compass does not store raw API credentials.
            </p>
          </div>
        </Card>

        {/* Step 3: Strategic Playbook */}
        <Card className="lg:col-span-2 space-y-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
                <Shield size={24} />
              </div>
              <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight">Founder_Playbook</h3>
            </div>
            <Button 
              onClick={savePlaybook} 
              variant="primary" 
              className="px-10 py-4 shadow-lg shadow-blue-500/20"
              disabled={saving}
            >
              <Save size={18} />
              Commit Logic
            </Button>
          </div>

          <div className="relative">
            <textarea 
              value={playbook}
              onChange={(e) => setPlaybook(e.target.value)}
              className="w-full h-80 bg-slate-50 border border-slate-200 rounded-2xl p-10 text-xl text-slate-800 leading-relaxed font-sans focus:outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-50 transition-all placeholder:text-slate-300"
              placeholder="# Enter strategic principles here..."
            />
          </div>
        </Card>

      </div>
    </div>
  );
}

