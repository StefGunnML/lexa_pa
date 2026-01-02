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
    <div className="space-y-16 pb-20 font-mono">
      <header className="space-y-6">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-black text-white bg-black px-2 py-0.5 uppercase tracking-[0.4em]">SYSTEM_CALIBRATION_NODE</span>
        </div>
        <h2 className="text-7xl font-black tracking-tighter text-black uppercase">System Command</h2>
        <p className="text-black/60 text-2xl max-w-2xl font-bold leading-relaxed uppercase tracking-tighter">
          Calibrate private reasoning nodes... authenticate <span className="text-black underline underline-offset-8 decoration-4">COMM_CHANNELS</span>.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        
        {/* Step 1: Reasoning Engine */}
        <Card className={`space-y-10 border-4 border-black ${pulseStatus === 'active' ? 'animate-breathe' : ''}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 border-4 border-black bg-black text-white">
                <Zap size={28} />
              </div>
              <h3 className="text-3xl font-black text-black tracking-tighter uppercase">Reasoning Node</h3>
            </div>
            <Badge variant={pulseStatus === 'active' ? 'success' : pulseStatus === 'error' ? 'warning' : 'default'} className="font-black border-4">
              {pulseStatus.toUpperCase()}
            </Badge>
          </div>

          <div className="space-y-8">
            <div className="space-y-3">
              <label className="text-xs font-black text-black uppercase tracking-[0.2em]">SCALEWAY_IP_ADDRESS</label>
              <input 
                type="text" 
                value={config.DEEPSEEK_API_BASE || ''}
                onChange={(e) => setConfig({...config, DEEPSEEK_API_BASE: e.target.value})}
                onBlur={(e) => saveConfig('DEEPSEEK_API_BASE', e.target.value)}
                placeholder="0.0.0.0"
                className="w-full bg-white border-4 border-black px-6 py-5 text-lg font-black text-black focus:outline-none focus:bg-black focus:text-white transition-all placeholder:text-black/10"
              />
            </div>
            <div className="space-y-3">
              <label className="text-xs font-black text-black uppercase tracking-[0.2em]">SECURE_ACCESS_KEY</label>
              <input 
                type="password" 
                value={config.DEEPSEEK_API_KEY || ''}
                onChange={(e) => setConfig({...config, DEEPSEEK_API_KEY: e.target.value})}
                onBlur={(e) => saveConfig('DEEPSEEK_API_KEY', e.target.value)}
                placeholder="••••••••"
                className="w-full bg-white border-4 border-black px-6 py-5 text-lg font-black text-black focus:outline-none focus:bg-black focus:text-white transition-all placeholder:text-black/10"
              />
            </div>
          </div>

          <Button 
            onClick={testPulse} 
            disabled={pulseStatus === 'testing'}
            className="w-full py-10 text-xl"
            variant={pulseStatus === 'active' ? 'primary' : 'secondary'}
          >
            {pulseStatus === 'testing' ? <RefreshCw className="animate-spin" size={24} /> : <Play size={24} />}
            INIT_PULSE_CHECK
          </Button>
        </Card>

        {/* Step 2: Communication Nodes */}
        <Card className="space-y-10 border-4 border-black">
          <div className="flex items-center gap-4">
            <div className="p-3 border-4 border-black bg-black text-white">
              <MessageSquare size={28} />
            </div>
            <h3 className="text-3xl font-black text-black tracking-tighter uppercase">Comm Nodes</h3>
          </div>

          <div className="space-y-6">
            <div className="p-8 border-4 border-black bg-white flex items-center justify-between hover:bg-black hover:text-white transition-all group">
              <div className="flex items-center gap-6">
                <div className="w-14 h-14 border-4 border-black flex items-center justify-center text-xl font-black bg-black text-white group-hover:bg-white group-hover:text-black transition-all">G</div>
                <div>
                  <p className="text-lg font-black tracking-tighter uppercase">Gmail_INTEL</p>
                  <p className="text-xs font-bold uppercase opacity-40 group-hover:opacity-100">SYNC_ACTIVE</p>
                </div>
              </div>
              <Button size="sm" variant="outline" onClick={() => connectService('google-gmail')} className="font-black border-4 group-hover:border-white">LINK</Button>
            </div>

            <div className="p-8 border-4 border-black bg-white flex items-center justify-between hover:bg-black hover:text-white transition-all group">
              <div className="flex items-center gap-6">
                <div className="w-14 h-14 border-4 border-black flex items-center justify-center text-xl font-black bg-black text-white group-hover:bg-white group-hover:text-black transition-all">S</div>
                <div>
                  <p className="text-lg font-black tracking-tighter uppercase">Slack_INTEL</p>
                  <p className="text-xs font-bold uppercase opacity-40 group-hover:opacity-100">STREAM_ACTIVE</p>
                </div>
              </div>
              <Button size="sm" variant="outline" onClick={() => connectService('slack')} className="font-black border-4 group-hover:border-white">LINK</Button>
            </div>
          </div>

          <div className="p-6 bg-black text-white border-4 border-black">
            <p className="text-xs leading-relaxed font-black uppercase tracking-widest">
              NOTICE: CRYPTO_VAULT MANAGED BY NANGO. NO RAW KEYS STORED.
            </p>
          </div>
        </Card>

        {/* Step 3: Strategic Playbook */}
        <Card className="lg:col-span-2 space-y-10 border-4 border-black">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 border-4 border-black bg-black text-white">
                <Shield size={28} />
              </div>
              <h3 className="text-3xl font-black text-black tracking-tighter uppercase">Founder_Playbook</h3>
            </div>
            <Button 
              onClick={savePlaybook} 
              variant="primary" 
              className="px-12 py-6 text-lg"
              disabled={saving}
            >
              <Save size={20} />
              COMMIT_LOGIC
            </Button>
          </div>

          <div className="relative group">
            <textarea 
              value={playbook}
              onChange={(e) => setPlaybook(e.target.value)}
              className="relative w-full h-96 bg-white border-4 border-black p-12 text-2xl text-black font-black leading-relaxed font-mono focus:outline-none focus:bg-black focus:text-white transition-all placeholder:text-black/10 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]"
              placeholder="# INPUT_STRATEGIC_PRINCIPLES..."
            />
          </div>
        </Card>

      </div>
    </div>
  );
}

