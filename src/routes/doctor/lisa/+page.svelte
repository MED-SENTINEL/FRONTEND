<script>
  import { activePatient } from '$lib/stores/doctor';
  import { doctorApi } from '$lib/api/client';
  import { fade, fly, slide } from 'svelte/transition';

  let chatMessages = [];
  let chatInput = '';
  let chatLoading = false;

  const quickQuestions = [
    "Provide a differential diagnosis",
    "Summarize abnormal lab values",
    "Check for drug interactions",
    "Suggest follow-up tests",
    "Draft a referral note",
  ];

  async function sendChat() {
    if (!chatInput.trim() || chatLoading) return;
    
    const userMsg = chatInput.trim();
    chatMessages = [...chatMessages, { role: 'user', text: userMsg }];
    chatInput = '';
    chatLoading = true;

    try {
      const patientId = $activePatient?.patient_profile?.id || '';
      const result = await doctorApi.clinicalChat(userMsg, patientId);
      chatMessages = [...chatMessages, { 
        role: 'assistant', 
        text: result.reply,
        context: result.context_used
      }];
    } catch (err) {
      chatMessages = [...chatMessages, { 
        role: 'assistant', 
        text: '⚠ Connection error. Please try again.',
        error: true
      }];
    } finally {
      chatLoading = false;
      setTimeout(() => {
        const el = document.getElementById('clinical-chat-scroll');
        if (el) el.scrollTop = el.scrollHeight;
      }, 50);
    }
  }

  function handleKeydown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendChat();
    }
  }

  function renderMarkdown(text) {
    if (!text) return '';
    return text
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/^### (.+)$/gm, '<h4 class="text-xs font-bold text-slate-700 dark:text-slate-200 mt-3 mb-1 uppercase tracking-wider">$1</h4>')
      .replace(/^## (.+)$/gm, '<h3 class="text-sm font-bold text-slate-700 dark:text-slate-200 mt-3 mb-1">$1</h3>')
      .replace(/\*\*(.+?)\*\*/g, '<strong class="font-bold">$1</strong>')
      .replace(/\*(.+?)\*/g, '<em class="italic opacity-80">$1</em>')
      .replace(/^- (.+)$/gm, '<div class="flex items-start gap-1.5 ml-1"><span class="text-emerald-600 mt-0.5">•</span><span>$1</span></div>')
      .replace(/^(\d+)\. (.+)$/gm, '<div class="flex items-start gap-1.5 ml-1"><span class="text-slate-500 dark:text-slate-400 dark:text-slate-500 font-bold">$1.</span><span>$2</span></div>')
      .replace(/\n/g, '<br/>');
  }
</script>

<div class="space-y-6">
  <!-- Header -->
  <div class="border-b border-slate-200 dark:border-slate-700 pb-6" in:fade>
    <div class="flex items-center gap-4 mb-3">
      <div class="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center">
        <svg class="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
        </svg>
      </div>
      <div>
        <h1 class="text-xl font-bold text-slate-800 dark:text-white">Clinical LISA</h1>
        <div class="text-xs text-slate-400 dark:text-slate-500">
          AI assistant with clinical context
          {#if $activePatient}
            · Reviewing <span class="font-semibold text-emerald-600">{$activePatient.patient_profile?.full_name}</span>
          {/if}
        </div>
      </div>
    </div>
  </div>

  {#if !$activePatient}
    <div class="p-12 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700 text-center bg-white dark:bg-sentinel-dark-surface-0">
      <div class="text-sm text-slate-500 dark:text-slate-400 dark:text-slate-500 font-semibold mb-1">No patient context loaded</div>
      <a href="/doctor/access" class="text-xs text-emerald-600 font-bold hover:underline">Access a patient first →</a>
    </div>
  {:else}
    <!-- Chat Container -->
    <div class="rounded-2xl bg-white dark:bg-sentinel-dark-surface-0 border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
      <!-- Messages -->
      <div id="clinical-chat-scroll" class="h-[520px] overflow-y-auto p-5 space-y-3 bg-slate-50/30">
        {#if chatMessages.length === 0}
          <div class="flex flex-col items-center justify-center h-full text-center space-y-4 py-6">
            <div class="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center">
              <svg class="w-7 h-7 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
            </div>
            <div class="space-y-1">
              <div class="text-sm font-bold text-slate-700 dark:text-slate-200">Clinical Assistant</div>
              <div class="text-xs text-slate-400 dark:text-slate-500 max-w-sm">
                LISA is loaded with {$activePatient.patient_profile?.full_name}'s records. Ask clinical questions:
              </div>
            </div>
            <div class="flex flex-wrap gap-2 justify-center max-w-md">
              {#each quickQuestions as q}
                <button 
                  class="text-[11px] px-3 py-1.5 rounded-full border border-emerald-200 text-emerald-700 bg-white dark:bg-sentinel-dark-surface-0 hover:bg-emerald-50 transition-colors font-medium"
                  on:click={() => { chatInput = q; sendChat(); }}
                >
                  {q}
                </button>
              {/each}
            </div>
          </div>
        {:else}
          {#each chatMessages as msg}
            <div class="flex {msg.role === 'user' ? 'justify-end' : 'justify-start'}" in:fly={{ y: 10 }}>
              <div class="max-w-[80%] {msg.role === 'user' 
                ? 'bg-emerald-600 text-white rounded-2xl rounded-br-md' 
                : 'bg-white dark:bg-sentinel-dark-surface-0 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-2xl rounded-bl-md'} px-4 py-3 shadow-sm">
                {#if msg.role === 'assistant'}
                  <div class="text-[13px] leading-relaxed">{@html renderMarkdown(msg.text)}</div>
                {:else}
                  <div class="text-[13px] leading-relaxed">{msg.text}</div>
                {/if}
                {#if msg.context}
                  <div class="text-[9px] mt-2 {msg.role === 'user' ? 'text-white/50' : 'text-slate-400 dark:text-slate-500'}">
                    Based on {msg.context} medical records
                  </div>
                {/if}
              </div>
            </div>
          {/each}
          {#if chatLoading}
            <div class="flex justify-start" in:fade>
              <div class="bg-white dark:bg-sentinel-dark-surface-0 border border-slate-200 dark:border-slate-700 rounded-2xl rounded-bl-md px-4 py-3 shadow-sm">
                <div class="flex items-center gap-1.5">
                  <div class="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style="animation-delay: 0ms"></div>
                  <div class="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style="animation-delay: 150ms"></div>
                  <div class="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style="animation-delay: 300ms"></div>
                </div>
              </div>
            </div>
          {/if}
        {/if}
      </div>

      <!-- Input -->
      <div class="p-4 border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-sentinel-dark-surface-0">
        <div class="flex gap-2">
          <input
            type="text"
            bind:value={chatInput}
            on:keydown={handleKeydown}
            placeholder="Ask a clinical question..."
            disabled={chatLoading}
            class="flex-1 px-4 py-2.5 text-sm border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-sentinel-dark-surface-1 focus:bg-white dark:bg-sentinel-dark-surface-0 focus:ring-2 focus:ring-emerald-100 focus:border-emerald-300 outline-none transition-all"
          />
          <button
            on:click={sendChat}
            disabled={chatLoading || !chatInput.trim()}
            aria-label="Send"
            class="px-4 py-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 disabled:opacity-40 transition-all"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
      </div>
    </div>

    <div class="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-700">
      <strong>Clinical Disclaimer:</strong> LISA provides AI-based analysis for decision support only. All clinical decisions must be verified by a qualified healthcare professional.
    </div>
  {/if}
</div>
