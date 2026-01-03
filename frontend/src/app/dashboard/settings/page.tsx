"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { Card, Button, Badge } from '@/components/ui/core';
import { Shield, Zap, MessageSquare, Save, Play, RefreshCw, CheckCircle } from 'lucide-react';
import { useSearchParams } from 'next/navigation';

function SettingsContent() {
  const searchParams = useSearchParams();
  const [config, setConfig] = useState<any>({
    DEEPSEEK_API_BASE: '',
    DEEPSEEK_API_KEY: '',
    GOOGLE_CLIENT_ID: '',
    GOOGLE_CLIENT_SECRET: '',
  });

  const [playbook, setPlaybook] = useState('');
  const [pulseStatus, setPulseStatus] = useState<'idle' | 'testing' | 'active' | 'error'>('idle');
  const [saving, setSaving] = useState(false);
  const [gmailStatus, setGmailStatus] = useState<'disconnected' | 'connected' | 'checking'>('checking');

  useEffect(() => {
    fetchConfig();
    fetchPlaybook();
    checkGmailStatus();
    
    // Check for OAuth callback success
    const gmailParam = searchParams.get('gmail');
    if (gmailParam === 'connected') {
      alert('✅ Gmail connected successfully! Your emails will start syncing now.');
      checkGmailStatus();
    } else if (gmailParam === 'error') {
      alert('❌ Gmail connection failed. Please try again.');
    }
  }, [searchParams]);

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

  const checkGmailStatus = async () => {
    setGmailStatus('checking');
    try {
      const res = await fetch('/api/gmail/status');
      const data = await res.json();
      setGmailStatus(data.status === 'connected' ? 'connected' : 'disconnected');
    } catch (err) {
      console.error("Failed to check Gmail status", err);
      setGmailStatus('disconnected');
    }
  };

  const connectGmail = () => {
    // Redirect to backend OAuth flow
    window.location.href = '/api/auth/gmail/start';
  };

  const syncGmail = async () => {
    try {
      const res = await fetch('/api/gmail/sync', { method: 'POST' });
      const data = await res.json();
      alert(`✅ Synced ${data.processed} new emails!`);
    } catch (err: any) {
      alert(`❌ Sync failed: ${err.message}`);
    }
  };

  return (
    <div className="space-y-16 pb-20 font-sans">
      <header className="space-y-6">
        <div className="flex items-center gap-3">
          <span className="system-label">CALIBRATION: NODE_01</span>
          <span className="system-label">ENCRYPTION: AES-256</span>
          <span className="system-label bg-emerald-100 text-emerald-600 font-bold border-emerald-200 uppercase animate-pulse">DEPLOY_FORCE_V3</span>
        </div>
        <h2 className="text-5xl font-bold tracking-tighter text-foreground">System Command</h2>
        <p className="text-muted-foreground text-xl max-w-2xl font-medium leading-relaxed">
          Calibrate private reasoning nodes, authenticate communication streams, and define <span className="text-foreground font-bold underline decoration-border decoration-2 underline-offset-4">strategic guardrails</span>.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Step 1: Reasoning Engine */}
        <Card className="space-y-10">
          <form className="space-y-10" onSubmit={(e) => e.preventDefault()}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-muted text-foreground">
                  <Zap size={20} />
                </div>
                <h3 className="text-xl font-bold text-foreground tracking-tight">REASONING_NODE</h3>
              </div>
              <Badge variant={pulseStatus === 'active' ? 'success' : pulseStatus === 'error' ? 'warning' : 'default'}>
                {pulseStatus.toUpperCase()}
              </Badge>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[9px] font-medium text-muted-foreground uppercase tracking-[0.2em]">SCALEWAY_IP_ENDPOINT</label>
                <input 
                  type="text" 
                  value={config.DEEPSEEK_API_BASE || ''}
                  onChange={(e) => setConfig({...config, DEEPSEEK_API_BASE: e.target.value})}
                  onBlur={(e) => saveConfig('DEEPSEEK_API_BASE', e.target.value)}
                  placeholder="0.0.0.0"
                  autoComplete="url"
                  className="w-full bg-muted border border-border px-5 py-3 text-sm text-foreground focus:outline-none focus:border-foreground/20 transition-all placeholder:text-muted-foreground/30 font-mono"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[9px] font-medium text-muted-foreground uppercase tracking-[0.2em]">ACCESS_KEY</label>
                <input 
                  type="password" 
                  value={config.DEEPSEEK_API_KEY || ''}
                  onChange={(e) => setConfig({...config, DEEPSEEK_API_KEY: e.target.value})}
                  onBlur={(e) => saveConfig('DEEPSEEK_API_KEY', e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className="w-full bg-muted border border-border px-5 py-3 text-sm text-foreground focus:outline-none focus:border-foreground/20 transition-all placeholder:text-muted-foreground/30 font-mono"
                />
              </div>
            </div>

            <Button 
              onClick={testPulse} 
              disabled={pulseStatus === 'testing'}
              className="w-full"
              variant="primary"
            >
              {pulseStatus === 'testing' ? <RefreshCw className="animate-spin" size={16} /> : <Play size={16} className="mr-2" />}
              INITIATE_PULSE_CHECK
            </Button>
          </form>
        </Card>

        {/* Step 2: Communication Nodes */}
        <Card className="space-y-10">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-muted text-foreground">
              <MessageSquare size={20} />
            </div>
            <h3 className="text-xl font-bold text-foreground tracking-tight">COMM_NODES</h3>
          </div>

          <div className="space-y-6">
            <div className="space-y-3">
              <div className="p-5 bg-muted border border-border flex items-center justify-between hover:border-foreground/20 transition-all group">
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 bg-white border border-border flex items-center justify-center text-[10px] font-bold text-muted-foreground">G</div>
                  <div>
                    <p className="text-sm font-bold text-foreground tracking-tight">GMAIL_INTEL</p>
                    <p className="text-[9px] font-medium text-muted-foreground uppercase tracking-widest">
                      {gmailStatus === 'checking' && 'CHECKING...'}
                      {gmailStatus === 'connected' && 'ACTIVE'}
                      {gmailStatus === 'disconnected' && 'READY_TO_LINK'}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  {gmailStatus === 'connected' ? (
                    <>
                      <CheckCircle size={18} className="text-emerald-600" />
                      <Button size="sm" variant="outline" onClick={syncGmail}>Sync Now</Button>
                    </>
                  ) : (
                    <Button size="sm" variant="primary" onClick={connectGmail}>
                      Connect Gmail
                    </Button>
                  )}
                </div>
              </div>

              <div className="p-5 bg-muted border border-border flex items-center justify-between hover:border-foreground/20 transition-all group opacity-50">
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 bg-white border border-border flex items-center justify-center text-[10px] font-bold text-muted-foreground">S</div>
                  <div>
                    <p className="text-sm font-bold text-foreground tracking-tight">SLACK_INTEL</p>
                    <p className="text-[9px] font-medium text-muted-foreground uppercase tracking-widest">COMING_SOON</p>
                  </div>
                </div>
                <Button size="sm" variant="outline" disabled>Coming Soon</Button>
              </div>
            </div>
          </div>

          <div className="p-5 bg-emerald-50 border border-emerald-200">
            <p className="text-[10px] text-emerald-700 leading-relaxed font-medium">
              ✓ Direct Google OAuth — No third-party dependencies. Your data flows directly from Google to your database.
            </p>
          </div>
        </Card>

        {/* Step 3: Strategic Playbook */}
        <Card className="lg:col-span-2 space-y-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-muted text-foreground">
                <Shield size={20} />
              </div>
              <h3 className="text-xl font-bold text-foreground tracking-tight">FOUNDER_PLAYBOOK</h3>
            </div>
            <Button 
              onClick={savePlaybook} 
              variant="primary" 
              className="px-8"
              disabled={saving}
            >
              <Save size={16} className="mr-2" />
              COMMIT_LOGIC
            </Button>
          </div>

          <textarea 
            value={playbook}
            onChange={(e) => setPlaybook(e.target.value)}
            className="w-full h-80 bg-muted border border-border p-10 text-lg text-foreground/80 leading-relaxed font-sans focus:outline-none focus:border-foreground/20 transition-all placeholder:text-muted-foreground/30"
            placeholder="# Enter strategic principles here..."
          />
        </Card>

      </div>
    </div>
  );
}

export default function SettingsPage() {
  return (
    <Suspense fallback={<div>Loading Settings...</div>}>
      <SettingsContent />
    </Suspense>
  );
}

