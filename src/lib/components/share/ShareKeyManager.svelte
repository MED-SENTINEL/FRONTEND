<script>
  let keys = [
    { id: 'SK-782-AF', recipient: 'DR. SARAH CHEN (CENTRAL)', expires: '2026-04-15', status: 'Active' },
    { id: 'SK-112-BX', recipient: 'EMERGENCY RESPONDER UNIT 4', expires: '2026-03-25', status: 'Expiring Soon' },
  ];

  function revokeKey(id) {
    keys = keys.filter(k => k.id !== id);
  }
</script>

<div class="space-y-6">
  <div class="hud-panel p-6 space-y-6">
    <div class="flex justify-between items-center border-b border-sentinel-optimal/20 pb-4">
      <div>
        <div class="text-[10px] text-sentinel-muted tracking-[0.4em] mb-1 uppercase">SECURE DATA SHARING</div>
        <h2 class="text-xl font-bold hud-text-optimal tracking-widest">AES-256 KEY MANAGER</h2>
      </div>
      <button class="hud-button hud-text-optimal">GENERATE NEW KEY</button>
    </div>

    <div class="space-y-4">
      {#each keys as key}
        <div class="p-4 border border-sentinel-optimal/10 bg-sentinel-optimal/5 flex justify-between items-center group">
          <div class="flex gap-6">
            <div class="flex flex-col">
              <span class="text-[8px] text-sentinel-muted uppercase">KEY ID</span>
              <span class="text-xs font-mono hud-text-optimal">{key.id}</span>
            </div>
            <div class="flex flex-col">
              <span class="text-[8px] text-sentinel-muted uppercase">RECIPIENT</span>
              <span class="text-xs font-bold uppercase tracking-tighter">{key.recipient}</span>
            </div>
            <div class="flex flex-col">
              <span class="text-[8px] text-sentinel-muted uppercase">EXPIRES</span>
              <span class="text-xs font-bold uppercase tracking-tighter">{key.expires}</span>
            </div>
          </div>

          <div class="flex items-center gap-4">
             <span class="text-[10px] {key.status === 'Active' ? 'hud-text-optimal' : 'hud-text-warning'} font-bold uppercase tracking-widest">{key.status}</span>
             <button 
              on:click={() => revokeKey(key.id)}
              class="hud-button border-sentinel-critical/30 hud-text-critical opacity-0 group-hover:opacity-100"
            >
              REVOKE
            </button>
          </div>
        </div>
      {/each}
    </div>
  </div>

  <div class="hud-panel p-4 bg-sentinel-critical/5 border-sentinel-critical/20">
    <div class="flex gap-4 items-center">
      <div class="w-8 h-8 border border-sentinel-critical/30 flex items-center justify-center shrink-0">
        <span class="hud-text-critical font-bold">!</span>
      </div>
      <p class="text-[10px] hud-text-critical uppercase tracking-tighter leading-relaxed">
        WARNING: REVOKING A KEY IMMEDIATELY TERMINATES ALL ACTIVE DATA STREAMS TO THE RECIPIENT. THIS ACTION CANNOT BE UNDONE.
      </p>
    </div>
  </div>
</div>
