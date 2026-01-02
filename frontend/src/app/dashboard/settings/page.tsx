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
          <span className="text-[11px] font-bold text-[#FFB000]/40 uppercase tracking-[0.4em]">SYSTEM_CALIBRATION_NODE</span>
        </div>
        <h2 className="text-6xl font-bold tracking-tighter text-[#FFB000] uppercase animate-flicker">System Command</h2>
        <p className="text-[#FFB000]/60 text-lg max-w-2xl font-medium leading-relaxed uppercase">
          Configure private reasoning nodes... calibrate communication nodes... define <span className="text-[#FFB000] underline underline-offset-8">strategic_principles</span>.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        
        {/* Step 1: Reasoning Engine */}
        <Card className={`space-y-10 border-[#FFB000]/20 ${pulseStatus === 'active' ? 'animate-breathe' : ''}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 border border-[#FFB000]/20 text-[#FFB000]">
                <Zap size={24} />
              </div>
              <h3 className="text-2xl font-bold text-[#FFB000] tracking-tighter uppercase">Reasoning Engine</h3>
            </div>
            <Badge variant={pulseStatus === 'active' ? 'success' : pulseStatus === 'error' ? 'warning' : 'default'} className="font-bold border-[#FFB000]/40">
              {pulseStatus.toUpperCase()}
            </Badge>
          </div>

          <div className="space-y-6">
            <div className="space-y-3">
              <label className="text-[10px] font-bold text-[#FFB000]/40 uppercase tracking-[0.2em]">SCALEWAY_IP_ENDPOINT</label>
              <input 
                type="text" 
                value={config.DEEPSEEK_API_BASE || ''}
                onChange={(e) => setConfig({...config, DEEPSEEK_API_BASE: e.target.value})}
                onBlur={(e) => saveConfig('DEEPSEEK_API_BASE', e.target.value)}
                placeholder="http://51.159.141.13:8000/v1"
                className="w-full bg-black border border-[#FFB000]/20 rounded-none px-5 py-4 text-sm text-[#FFB000] focus:outline-none focus:border-[#FFB000]/60 transition-all placeholder:text-[#FFB000]/10"
              />
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-bold text-[#FFB000]/40 uppercase tracking-[0.2em]">SECRET_ACCESS_KEY</label>
              <input 
                type="password" 
                value={config.DEEPSEEK_API_KEY || ''}
                onChange={(e) => setConfig({...config, DEEPSEEK_API_KEY: e.target.value})}
                onBlur={(e) => saveConfig('DEEPSEEK_API_KEY', e.target.value)}
                placeholder="••••••••••••••••"
                className="w-full bg-black border border-[#FFB000]/20 rounded-none px-5 py-4 text-sm text-[#FFB000] focus:outline-none focus:border-[#FFB000]/60 transition-all placeholder:text-[#FFB000]/10"
              />
            </div>
          </div>

          <Button 
            onClick={testPulse} 
            disabled={pulseStatus === 'testing'}
            className="w-full py-8"
            variant={pulseStatus === 'active' ? 'primary' : 'secondary'}
          >
            {pulseStatus === 'testing' ? <RefreshCw className="animate-spin" size={18} /> : <Play size={18} />}
            INITIATE_PULSE_CHECK
          </Button>
        </Card>

        {/* Step 2: Communication Nodes */}
        <Card className="space-y-10 border-[#FFB000]/20">
          <div className="flex items-center gap-4">
            <div className="p-3 border border-[#FFB000]/20 text-[#FFB000]">
              <MessageSquare size={24} />
            </div>
            <h3 className="text-2xl font-bold text-[#FFB000] tracking-tighter uppercase">Communication Nodes</h3>
          </div>

          <div className="space-y-4">
            <div className="p-6 bg-black border border-[#FFB000]/10 flex items-center justify-between hover:bg-[#FFB000]/5 transition-all">
              <div className="flex items-center gap-5">
                <div className="w-12 h-12 border border-[#FFB000]/20 flex items-center justify-center text-sm font-bold text-[#FFB000]/40">G</div>
                <div>
                  <p className="text-base font-bold text-[#FFB000] tracking-tighter uppercase">Gmail Intelligence</p>
                  <p className="text-[10px] text-[#FFB000]/40 uppercase tracking-widest font-bold">gmail-sync</p>
                </div>
              </div>
              <Button size="sm" variant="outline" onClick={() => connectService('google-gmail')} className="font-bold border-[#FFB000]/20">LINK</Button>
            </div>

            <div className="p-6 bg-black border border-[#FFB000]/10 flex items-center justify-between hover:bg-[#FFB000]/5 transition-all">
              <div className="flex items-center gap-5">
                <div className="w-12 h-12 border border-[#FFB000]/20 flex items-center justify-center text-sm font-bold text-[#FFB000]/40">S</div>
                <div>
                  <p className="text-base font-bold text-[#FFB000] tracking-tighter uppercase">Slack Stream</p>
                  <p className="text-[10px] text-[#FFB000]/40 uppercase tracking-widest font-bold">slack-messages</p>
                </div>
              </div>
              <Button size="sm" variant="outline" onClick={() => connectService('slack')} className="font-bold border-[#FFB000]/20">LINK</Button>
            </div>
          </div>

          <div className="p-6 bg-[#FFB000]/5 border border-[#FFB000]/10">
            <p className="text-[11px] text-[#FFB000]/60 leading-relaxed font-bold uppercase tracking-tighter">
              Notice: Auth managed via <span className="text-[#FFB000] underline">Nango_Secure_Vault</span>. Project_Compass does not store raw credentials.
            </p>
          </div>
        </Card>

        {/* Step 3: Strategic Playbook */}
        <Card className="lg:col-span-2 space-y-8 border-[#FFB000]/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 border border-[#FFB000]/20 text-[#FFB000]">
                <Shield size={24} />
              </div>
              <h3 className="text-2xl font-bold text-[#FFB000] tracking-tighter uppercase">Founder Playbook</h3>
            </div>
            <Button 
              onClick={savePlaybook} 
              variant="primary" 
              className="px-10 py-4 shadow-xl"
              disabled={saving}
            >
              <Save size={18} />
              SAVE_PRINCIPLES
            </Button>
          </div>

          <div className="relative group">
            <textarea 
              value={playbook}
              onChange={(e) => setPlaybook(e.target.value)}
              className="relative w-full h-80 bg-black border border-[#FFB000]/20 p-10 text-xl text-[#FFB000]/80 leading-relaxed font-mono focus:outline-none focus:border-[#FFB000]/60 transition-all placeholder:text-[#FFB000]/10"
              placeholder="# ENTER_CORE_PRINCIPLES_HERE..."
            />
          </div>
        </Card>

      </div>
    </div>
  );
}

