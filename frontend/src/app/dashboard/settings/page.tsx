"use client";

import React, { useState, useEffect } from 'react';
import { Card, Button, Badge } from '@/components/ui/core';
import { Shield, Zap, MessageSquare, Save, Play, RefreshCw } from 'lucide-react';
import Nango from '@nangohq/frontend';

export default function SettingsPage() {
  const [config, setConfig] = useState<any>({
    DEEPSEEK_API_BASE: '',
    DEEPSEEK_API_KEY: '',
    NANGO_SECRET_KEY: '',
  });

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
    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/b4de5701-9876-47ce-aad5-7d358d247a66',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'settings.tsx:86',message:'connectService called',data:{provider},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
    // #endregion
    try {
      console.log(`[Compass] Initiating connect for ${provider}...`);
      
      // 1. Get a session token from our backend (specify which provider we want)
      // #region agent log
      fetch('http://127.0.0.1:7243/ingest/b4de5701-9876-47ce-aad5-7d358d247a66',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'settings.tsx:91',message:'Requesting session token',data:{provider},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
      // #endregion
      const sessionRes = await fetch('/api/nango/session', { 
        method: 'POST',
        headers: { 
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ provider })
      });
      
      const sessionData = await sessionRes.json();
      // #region agent log
      fetch('http://127.0.0.1:7243/ingest/b4de5701-9876-47ce-aad5-7d358d247a66',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'settings.tsx:100',message:'Backend response received',data:{hasToken:!!sessionData.token,hasError:!!sessionData.error,error:sessionData.error,tokenLength:sessionData.token?.length},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
      // #endregion
      console.log(`[Compass] Backend Response:`, sessionData);

      if (sessionData.error) {
        // #region agent log
        fetch('http://127.0.0.1:7243/ingest/b4de5701-9876-47ce-aad5-7d358d247a66',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'settings.tsx:103',message:'Backend returned error',data:{error:sessionData.error,detail:sessionData.detail},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
        // #endregion
        alert(`Integration Error: ${sessionData.error}\nDetail: ${JSON.stringify(sessionData.detail)}`);
        return;
      }

      if (!sessionData.token) {
        // #region agent log
        fetch('http://127.0.0.1:7243/ingest/b4de5701-9876-47ce-aad5-7d358d247a66',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'settings.tsx:108',message:'No token in response',data:{sessionData},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
        // #endregion
        alert("Critical Error: No session token received from backend. Check browser console.");
        console.error("[Compass] Missing token in payload:", sessionData);
        return;
      }

      console.log(`[Compass] Token received (length: ${sessionData.token.length})`);

      // 2. Initialize Nango
      // #region agent log
      fetch('http://127.0.0.1:7243/ingest/b4de5701-9876-47ce-aad5-7d358d247a66',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'settings.tsx:115',message:'Initializing Nango SDK',data:{tokenLength:sessionData.token.length},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'F'})}).catch(()=>{});
      // #endregion
      const nango = new Nango();
      
      // 3. Open the Connect UI (provider is already scoped in the session token)
      // #region agent log
      fetch('http://127.0.0.1:7243/ingest/b4de5701-9876-47ce-aad5-7d358d247a66',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'settings.tsx:120',message:'Opening Connect UI',data:{provider},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'G'})}).catch(()=>{});
      // #endregion
      console.log(`[Compass] Opening Connect UI...`);
      const connect = nango.openConnectUI({
        onEvent: (event) => {
          // #region agent log
          fetch('http://127.0.0.1:7243/ingest/b4de5701-9876-47ce-aad5-7d358d247a66',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'settings.tsx:123',message:'Nango event received',data:{eventType:event.type,eventData:event.data},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'H'})}).catch(()=>{});
          // #endregion
          console.log(`[Compass] Nango Event:`, event.type, event.data);
          if (event.type === 'connect') {
            alert(`Successfully connected to ${provider}!`);
          } else if (event.type === 'error') {
            alert(`Nango Error: ${JSON.stringify(event.data)}`);
          } else if (event.type === 'close') {
            console.log(`[Compass] Modal closed by user`);
          }
        },
      });

      // 4. Provide the token (this tells Nango which provider to show based on allowed_integrations)
      // #region agent log
      fetch('http://127.0.0.1:7243/ingest/b4de5701-9876-47ce-aad5-7d358d247a66',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'settings.tsx:135',message:'Setting session token',data:{provider,tokenPrefix:sessionData.token.substring(0,10)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'I'})}).catch(()=>{});
      // #endregion
      console.log(`[Compass] Setting session token (provider: ${provider})...`);
      connect.setSessionToken(sessionData.token);
      
      // 5. Timeout check - if modal stays grey for 10 seconds, something is wrong
      setTimeout(() => {
        const modal = document.querySelector('[data-nango-modal]') || document.querySelector('.nango-modal') || document.querySelector('iframe');
        // #region agent log
        fetch('http://127.0.0.1:7243/ingest/b4de5701-9876-47ce-aad5-7d358d247a66',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'settings.tsx:142',message:'Timeout check - modal state',data:{modalFound:!!modal,modalTag:modal?.tagName},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'J'})}).catch(()=>{});
        // #endregion
        if (modal) {
          console.log(`[Compass] Modal detected after 10s, checking if loaded...`);
        } else {
          console.warn(`[Compass] No modal detected after 10s - Nango might not have initialized`);
          alert(`Modal timeout: The authorization window may not be loading. Check console for details.`);
        }
      }, 10000);
      
    } catch (err: any) {
      // #region agent log
      fetch('http://127.0.0.1:7243/ingest/b4de5701-9876-47ce-aad5-7d358d247a66',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'settings.tsx:150',message:'Exception caught',data:{error:err?.message,stack:err?.stack},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'K'})}).catch(()=>{});
      // #endregion
      console.error(`[Compass] Frontend Crash:`, err);
      alert(`Frontend Error: ${String(err)}`);
    }
  };

  return (
    <div className="space-y-16 pb-20 font-sans">
      <header className="space-y-6">
        <div className="flex items-center gap-3">
          <span className="system-label">CALIBRATION: NODE_01</span>
          <span className="system-label">ENCRYPTION: AES-256</span>
          <span className="system-label bg-red-100 text-red-600 font-bold border-red-200 uppercase">BUILD: DEBUG_V4</span>
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
              type="button"
            >
              {pulseStatus === 'testing' ? <RefreshCw className="animate-spin" size={16} /> : <Play size={16} className="mr-2" />}
              INITIATE_PULSE_CHECK
            </Button>
          </form>
        </Card>

        {/* Step 2: Communication Nodes */}
        <Card className="space-y-10">
          <form className="space-y-10" onSubmit={(e) => e.preventDefault()}>
            <div className="flex items-center gap-4">
              <div className="p-3 bg-muted text-foreground">
                <MessageSquare size={20} />
              </div>
              <h3 className="text-xl font-bold text-foreground tracking-tight">COMM_NODES</h3>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[9px] font-medium text-muted-foreground uppercase tracking-[0.2em]">NANGO_SECRET_KEY</label>
                <input 
                  type="password" 
                  value={config.NANGO_SECRET_KEY || ''}
                  onChange={(e) => setConfig({...config, NANGO_SECRET_KEY: e.target.value})}
                  onBlur={(e) => saveConfig('NANGO_SECRET_KEY', e.target.value)}
                  placeholder="nango_sk_..."
                  autoComplete="current-password"
                  className="w-full bg-muted border border-border px-5 py-3 text-sm text-foreground focus:outline-none focus:border-foreground/20 transition-all placeholder:text-muted-foreground/30 font-mono"
                />
              </div>

              <div className="space-y-3">
                <div className="p-5 bg-muted border border-border flex items-center justify-between hover:border-foreground/20 transition-all group">
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 bg-white border border-border flex items-center justify-center text-[10px] font-bold text-muted-foreground">G</div>
                    <div>
                      <p className="text-sm font-bold text-foreground tracking-tight">GMAIL_INTEL</p>
                      <p className="text-[9px] font-medium text-muted-foreground uppercase tracking-widest">SYNC_READY</p>
                    </div>
                  </div>
                  <Button size="sm" variant="outline" type="button" onClick={() => connectService('google')}>Link</Button>
                </div>

                <div className="p-5 bg-muted border border-border flex items-center justify-between hover:border-foreground/20 transition-all group">
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 bg-white border border-border flex items-center justify-center text-[10px] font-bold text-muted-foreground">S</div>
                    <div>
                      <p className="text-sm font-bold text-foreground tracking-tight">SLACK_INTEL</p>
                      <p className="text-[9px] font-medium text-muted-foreground uppercase tracking-widest">STREAM_READY</p>
                    </div>
                  </div>
                  <Button size="sm" variant="outline" type="button" onClick={() => connectService('slack')}>Link</Button>
                </div>
              </div>
            </div>

            <div className="p-5 bg-muted/50 border border-border">
              <p className="text-[10px] text-muted-foreground leading-relaxed font-medium italic">
                Note: Using <span className="font-bold">Connect Sessions</span>. Authorization is handled via secure temporary tokens.
              </p>
            </div>
          </form>
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

