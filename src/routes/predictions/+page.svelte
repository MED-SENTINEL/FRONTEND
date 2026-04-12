<script>
  import { onMount } from 'svelte';
  import { currentUser } from '$lib/stores/auth';
  import { aiApi } from '$lib/api/client';
  import PredictionsHUD from '$lib/components/dashboard/PredictionsHUD.svelte';
  import { fade, fly, slide } from 'svelte/transition';

  let insights = null;
  let alerts = [];
  let loading = false;
  let errorMsg = '';
  let reportsAnalyzed = 0;

  // ─── LISA Chat State ───
  let chatMessages = [];
  let chatInput = '';
  let chatLoading = false;
  let chatOpen = true;

  async function runInsights() {
    if (!$currentUser) return;
    loading = true;
    errorMsg = '';
    try {
      const result = await aiApi.insights($currentUser.id);
      insights = result.insights;
      alerts = result.alerts || [];
      reportsAnalyzed = result.reports_analyzed || 0;
    } catch (err) {
      errorMsg = err.message;
    } finally {
      loading = false;
    }
  }

  async function sendChat() {
    if (!chatInput.trim() || chatLoading) return;
    
    const userMsg = chatInput.trim();
    chatMessages = [...chatMessages, { role: 'user', text: userMsg }];
    chatInput = '';
    chatLoading = true;

    try {
      const result = await aiApi.chat(userMsg);
      chatMessages = [...chatMessages, { 
        role: 'assistant', 
        text: result.reply,
        context: result.context_used
      }];
    } catch (err) {
      chatMessages = [...chatMessages, { 
        role: 'assistant', 
        text: '⚠️ Sorry, I encountered an error. Please try again.',
        error: true
      }];
    } finally {
      chatLoading = false;
      // Scroll chat to bottom
      setTimeout(() => {
        const chatEl = document.getElementById('lisa-chat-scroll');
        if (chatEl) chatEl.scrollTop = chatEl.scrollHeight;
      }, 50);
    }
  }

  function handleKeydown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendChat();
    }
  }

  // Quick question shortcuts
  const quickQuestions = [
    "Evaluate my vulnerabilities",
    "How is my liver?",
    "Prepare notes for my doctor",
    "Explain my abnormal values"
  ];

  // Simple markdown to HTML converter
  function renderMarkdown(text) {
    if (!text) return '';
    return text
      // Escape HTML first
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      // Headers (### before ## before #)
      .replace(/^### (.+)$/gm, '<h4 class="text-xs font-black text-sentinel-text mt-3 mb-1 uppercase tracking-wider">$1</h4>')
      .replace(/^## (.+)$/gm, '<h3 class="text-sm font-bold text-sentinel-text mt-3 mb-1">$1</h3>')
      .replace(/^# (.+)$/gm, '<h2 class="text-base font-bold text-sentinel-text mt-3 mb-1">$1</h2>')
      // Bold
      .replace(/\*\*(.+?)\*\*/g, '<strong class="font-bold">$1</strong>')
      // Italic
      .replace(/\*(.+?)\*/g, '<em class="italic opacity-80">$1</em>')
      // Horizontal rules
      .replace(/^---$/gm, '<hr class="my-2 border-slate-200"/>')
      // Bullet points
      .replace(/^[•] (.+)$/gm, '<div class="flex items-start gap-1.5 ml-1"><span class="text-sentinel-optimal mt-0.5">•</span><span>$1</span></div>')
      .replace(/^- (.+)$/gm, '<div class="flex items-start gap-1.5 ml-1"><span class="text-sentinel-optimal mt-0.5">•</span><span>$1</span></div>')
      // Arrow points
      .replace(/^→ (.+)$/gm, '<div class="flex items-start gap-1.5 ml-1"><span class="text-sentinel-accent">→</span><span>$1</span></div>')
      // Numbered lists
      .replace(/^(\d+)\. (.+)$/gm, '<div class="flex items-start gap-1.5 ml-1"><span class="text-sentinel-dim font-bold">$1.</span><span>$2</span></div>')
      // Newlines
      .replace(/\n/g, '<br/>');
  }

  onMount(runInsights);
</script>

<div class="space-y-8">
  <!-- ═══ HEADER ═══ -->
  <div class="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-slate-200 pb-8" in:fade>
    <div class="space-y-2">
      <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-sentinel-accent/10 to-purple-500/10 border border-sentinel-accent/20 mb-2">
        <div class="w-2 h-2 rounded-full bg-sentinel-optimal animate-pulse"></div>
        <span class="text-xs font-semibold text-sentinel-accent">AI Agents Online</span>
      </div>
      <h1 class="text-4xl font-bold tracking-tight text-sentinel-text leading-tight">
        Health <span class="text-sentinel-accent italic font-bold">Intelligence</span>
      </h1>
      <div class="text-sm text-sentinel-dim font-medium">
        AI-powered analysis of your medical records • {reportsAnalyzed} report{reportsAnalyzed !== 1 ? 's' : ''} analyzed
      </div>
    </div>

    <button
      on:click={runInsights}
      disabled={loading}
      class="hud-button hud-button-accent min-w-[200px]"
    >
      {#if loading}
        <div class="w-4 h-4 border-2 border-white/20 border-t-sentinel-optimal rounded-full animate-spin"></div>
        Agents analyzing...
      {:else}
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
        Run AI Analysis
      {/if}
    </button>
  </div>

  <!-- ═══ ERROR ═══ -->
  {#if errorMsg}
    <div class="hud-panel border-sentinel-critical/30 p-6 flex items-center gap-4 bg-sentinel-critical/5" in:fly={{ y: 10 }}>
      <svg class="w-6 h-6 hud-text-critical shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
      <div class="text-sm text-sentinel-text">{errorMsg}</div>
    </div>
  {/if}

  <!-- ═══ ANOMALY ALERTS ═══ -->
  {#if alerts.length > 0}
    <div class="space-y-3" in:fly={{ y: 15, delay: 100 }}>
      <div class="text-xs font-bold text-sentinel-dim uppercase tracking-widest flex items-center gap-2">
        <svg class="w-4 h-4 text-sentinel-warning" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        Active Alerts ({alerts.length})
      </div>
      {#each alerts as alert, i}
        <div 
          class="hud-panel p-4 flex items-start gap-4 {
            alert.severity === 'critical' ? 'border-sentinel-critical/40 bg-sentinel-critical/5' : 
            alert.severity === 'warning' ? 'border-sentinel-warning/40 bg-sentinel-warning/5' : 
            'border-sentinel-accent/20 bg-sentinel-accent/5'
          }"
          in:fly={{ y: 10, delay: i * 50 }}
        >
          <div class="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 {
            alert.severity === 'critical' ? 'bg-sentinel-critical/10' : 
            alert.severity === 'warning' ? 'bg-sentinel-warning/10' : 
            'bg-sentinel-accent/10'
          }">
            <span class="text-sm">{alert.severity === 'critical' ? '🚨' : alert.severity === 'warning' ? '⚠️' : 'ℹ️'}</span>
          </div>
          <div class="flex-1 space-y-1">
            <div class="text-sm font-bold text-sentinel-text">{alert.title}</div>
            <div class="text-xs text-sentinel-dim leading-relaxed">{alert.body}</div>
            {#if alert.organ_system}
              <div class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100 mt-1">
                <span class="text-[9px] font-bold text-sentinel-dim uppercase">{alert.organ_system}</span>
              </div>
            {/if}
          </div>
        </div>
      {/each}
    </div>
  {/if}

  <!-- ═══ HEALTH INSIGHTS HUD ═══ -->
  {#if insights}
    <PredictionsHUD prediction={{
      risk_level: insights.risk_level,
      confidence: insights.confidence,
      recommendation: insights.summary,
      details: {},
      organ_risks: insights.organ_risks,
      trends: insights.trends,
      recommendations: insights.recommendations,
      key_findings: insights.key_findings
    }} />
  {:else if !loading}
    <div class="hud-panel p-12 text-center border-dashed border-slate-200 bg-white opacity-60">
      <div class="text-sm text-sentinel-dim font-medium animate-pulse">
        Click "Run AI Analysis" to activate health intelligence agents.
      </div>
    </div>
  {/if}

  <!-- ═══ LISA CHAT ═══ -->
  <div class="hud-panel overflow-hidden" in:fade={{ delay: 300 }}>
    <!-- Chat Header -->
    <button 
      class="w-full flex items-center justify-between p-5 bg-gradient-to-r from-sentinel-accent/5 to-purple-500/5 border-b border-slate-200 hover:from-sentinel-accent/10 hover:to-purple-500/10 transition-colors"
      on:click={() => chatOpen = !chatOpen}
    >
      <div class="flex items-center gap-3">
        <div class="w-9 h-9 rounded-xl bg-gradient-to-br from-sentinel-accent to-purple-500 flex items-center justify-center shadow-lg shadow-sentinel-accent/20">
          <span class="text-white text-sm font-black">L</span>
        </div>
        <div class="text-left">
          <div class="text-sm font-bold text-sentinel-text">LISA — AI Health Assistant</div>
          <div class="text-[10px] text-sentinel-dim">Ask questions about your medical history</div>
        </div>
      </div>
      <svg class="w-4 h-4 text-sentinel-dim transition-transform {chatOpen ? 'rotate-180' : ''}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
      </svg>
    </button>

    {#if chatOpen}
      <div transition:slide>
        <!-- Chat Messages -->
        <div id="lisa-chat-scroll" class="h-[500px] overflow-y-auto p-4 space-y-3 bg-slate-50/50">
          {#if chatMessages.length === 0}
            <div class="flex flex-col items-center justify-center h-full text-center space-y-4 py-6">
              <div class="w-14 h-14 rounded-2xl bg-gradient-to-br from-sentinel-accent/10 to-purple-500/10 flex items-center justify-center border border-sentinel-accent/20">
                <span class="text-2xl">🤖</span>
              </div>
              <div class="space-y-1">
                <div class="text-sm font-bold text-sentinel-text">Hi! I'm LISA</div>
                <div class="text-xs text-sentinel-dim max-w-sm">I can answer questions about your medical records. Try one of these:</div>
              </div>
              <div class="flex flex-wrap gap-2 justify-center">
                {#each quickQuestions as q}
                  <button 
                    class="text-[11px] px-3 py-1.5 rounded-full border border-sentinel-accent/20 text-sentinel-accent bg-white hover:bg-sentinel-accent/5 transition-colors font-medium"
                    on:click={() => { chatInput = q; sendChat(); }}
                  >
                    {q}
                  </button>
                {/each}
              </div>
            </div>
          {:else}
            {#each chatMessages as msg, i}
              <div class="flex {msg.role === 'user' ? 'justify-end' : 'justify-start'}" in:fly={{ y: 10 }}>
                <div class="max-w-[80%] {msg.role === 'user' 
                  ? 'bg-sentinel-accent text-white rounded-2xl rounded-br-md' 
                  : 'bg-white border border-slate-200 text-sentinel-text rounded-2xl rounded-bl-md'} px-4 py-3 shadow-sm">
                  {#if msg.role === 'assistant'}
                    <div class="text-[13px] leading-relaxed lisa-response">{@html renderMarkdown(msg.text)}</div>
                  {:else}
                    <div class="text-[13px] leading-relaxed whitespace-pre-wrap">{msg.text}</div>
                  {/if}
                  {#if msg.context}
                    <div class="text-[9px] mt-2 {msg.role === 'user' ? 'text-white/50' : 'text-sentinel-dim'}">
                      Based on {msg.context} medical records
                    </div>
                  {/if}
                </div>
              </div>
            {/each}
            {#if chatLoading}
              <div class="flex justify-start" in:fade>
                <div class="bg-white border border-slate-200 rounded-2xl rounded-bl-md px-4 py-3 shadow-sm">
                  <div class="flex items-center gap-1.5">
                    <div class="w-2 h-2 bg-sentinel-accent/40 rounded-full animate-bounce" style="animation-delay: 0ms"></div>
                    <div class="w-2 h-2 bg-sentinel-accent/40 rounded-full animate-bounce" style="animation-delay: 150ms"></div>
                    <div class="w-2 h-2 bg-sentinel-accent/40 rounded-full animate-bounce" style="animation-delay: 300ms"></div>
                  </div>
                </div>
              </div>
            {/if}
          {/if}
        </div>

        <!-- Chat Input -->
        <div class="p-4 border-t border-slate-200 bg-white">
          <div class="flex gap-2">
            <input
              type="text"
              bind:value={chatInput}
              on:keydown={handleKeydown}
              placeholder="Ask LISA about your health..."
              disabled={chatLoading}
              class="flex-1 px-4 py-2.5 text-sm border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-sentinel-accent/20 focus:border-sentinel-accent/40 outline-none transition-all"
            />
            <button
              on:click={sendChat}
              disabled={chatLoading || !chatInput.trim()}
              aria-label="Send message"
              class="px-4 py-2.5 bg-sentinel-accent text-white rounded-xl hover:bg-sentinel-accent/90 disabled:opacity-40 transition-all shadow-sm"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    {/if}
  </div>

  <!-- ═══ INFO FOOTER ═══ -->
  <div class="hud-panel p-5 bg-slate-50 border-slate-200" in:fade={{ delay: 400 }}>
    <div class="flex gap-4 items-start">
      <div class="w-8 h-8 rounded-lg border border-slate-200 bg-white flex items-center justify-center shrink-0">
        <span class="text-sentinel-accent font-black text-sm">AI</span>
      </div>
      <div class="space-y-1">
        <div class="text-xs font-bold text-sentinel-text">About SENTINEL AI Agents</div>
        <p class="text-[11px] text-sentinel-dim leading-relaxed">
          Three AI agents work together: <span class="font-semibold">Report Analyzer</span> (OCR extraction), <span class="font-semibold">Anomaly Sentinel</span> (risk detection), and <span class="font-semibold">Health Insight Engine</span> (trend analysis). LISA uses your medical data to answer questions. All insights are AI-generated and should be verified by a healthcare professional.
        </p>
      </div>
    </div>
  </div>
</div>
