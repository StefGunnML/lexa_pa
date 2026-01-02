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
    <div className="space-y-16 pb-20">
      <header className="space-y-6">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-black text-slate-400 uppercase tracking-[0.4em]">System Calibration</span>
        </div>
        <h2 className="text-6xl font-bold tracking-tight text-slate-900">System Command</h2>
        <p className="text-slate-500 text-lg max-w-2xl font-normal leading-relaxed">
          Configure your private reasoning nodes, calibrate communication streams, and define the <span className="text-slate-900 font-semibold">strategic principles</span> that govern your AI Chief of Staff.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        
        {/* Step 1: Reasoning Engine */}
        <Card className={`space-y-10 border-slate-200/60 ${pulseStatus === 'active' ? 'animate-breathe' : ''}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-slate-100 rounded-xl text-slate-900">
                <Zap size={24} />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 tracking-tight">Reasoning Engine</h3>
            </div>
            <Badge variant={pulseStatus === 'active' ? 'success' : pulseStatus === 'error' ? 'warning' : 'default'} className="px-4 py-1.5 font-bold">
              {pulseStatus.toUpperCase()}
            </Badge>
          </div>

          <div className="space-y-6">
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Scaleway IP / Endpoint</label>
              <input 
                type="text" 
                value={config.DEEPSEEK_API_BASE || ''}
                onChange={(e) => setConfig({...config, DEEPSEEK_API_BASE: e.target.value})}
                onBlur={(e) => saveConfig('DEEPSEEK_API_BASE', e.target.value)}
                placeholder="http://51.159.141.13:8000/v1"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-5 py-4 text-sm text-slate-900 focus:outline-none focus:border-slate-400 transition-all placeholder:text-slate-300"
              />
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Secret Key</label>
              <input 
                type="password" 
                value={config.DEEPSEEK_API_KEY || ''}
                onChange={(e) => setConfig({...config, DEEPSEEK_API_KEY: e.target.value})}
                onBlur={(e) => saveConfig('DEEPSEEK_API_KEY', e.target.value)}
                placeholder="••••••••••••••••"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-5 py-4 text-sm text-slate-900 focus:outline-none focus:border-slate-400 transition-all placeholder:text-slate-300"
              />
            </div>
          </div>

          <Button 
            onClick={testPulse} 
            disabled={pulseStatus === 'testing'}
            className="w-full py-8 flex items-center justify-center gap-3 shadow-xl"
            variant={pulseStatus === 'active' ? 'primary' : 'secondary'}
          >
            {pulseStatus === 'testing' ? <RefreshCw className="animate-spin" size={18} /> : <Play size={18} />}
            PULSE CHECK (H100)
          </Button>
        </Card>

        {/* Step 2: Communication Nodes */}
        <Card className="space-y-10 border-slate-200/60">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-slate-100 rounded-xl text-slate-900">
              <MessageSquare size={24} />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 tracking-tight">Communication Nodes</h3>
          </div>

          <div className="space-y-4">
            <div className="p-6 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between hover:bg-slate-100 transition-all">
              <div className="flex items-center gap-5">
                <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center text-sm font-black text-slate-400 border border-slate-200 shadow-sm">G</div>
                <div>
                  <p className="text-base font-bold text-slate-900 tracking-tight">Gmail Intelligence</p>
                  <p className="text-[10px] text-slate-400 uppercase tracking-widest font-black">gmail-sync</p>
                </div>
              </div>
              <Button size="sm" variant="outline" onClick={() => connectService('google-gmail')} className="px-6 font-bold">Authorize</Button>
            </div>

            <div className="p-6 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between hover:bg-slate-100 transition-all">
              <div className="flex items-center gap-5">
                <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center text-sm font-black text-slate-400 border border-slate-200 shadow-sm">S</div>
                <div>
                  <p className="text-base font-bold text-slate-900 tracking-tight">Slack Stream</p>
                  <p className="text-[10px] text-slate-400 uppercase tracking-widest font-black">slack-messages</p>
                </div>
              </div>
              <Button size="sm" variant="outline" onClick={() => connectService('slack')} className="px-6 font-bold">Authorize</Button>
            </div>
          </div>

          <div className="p-6 bg-slate-50 border border-slate-200 rounded-2xl">
            <p className="text-[11px] text-slate-500 leading-relaxed font-medium">
              Note: One-click auth uses the <span className="text-slate-900 font-bold">Nango secure vault</span>. Project Compass never stores your direct OAuth credentials.
            </p>
          </div>
        </Card>

        {/* Step 3: Strategic Playbook */}
        <Card className="lg:col-span-2 space-y-8 border-slate-200/60">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-slate-100 rounded-xl text-slate-900">
                <Shield size={24} />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 tracking-tight">Founder Playbook</h3>
            </div>
            <Button 
              onClick={savePlaybook} 
              variant="primary" 
              className="px-10 py-4 flex items-center gap-3 shadow-xl"
              disabled={saving}
            >
              <Save size={18} />
              COMMIT PRINCIPLES
            </Button>
          </div>

          <div className="relative group">
            <textarea 
              value={playbook}
              onChange={(e) => setPlaybook(e.target.value)}
              className="relative w-full h-80 bg-slate-50 border border-slate-200 rounded-2xl p-10 text-xl text-slate-800 leading-relaxed font-serif focus:outline-none focus:border-slate-400 transition-all placeholder:text-slate-300 shadow-inner"
              placeholder="# Core Principles..."
            />
          </div>
        </Card>

      </div>
    </div>
  );
}

