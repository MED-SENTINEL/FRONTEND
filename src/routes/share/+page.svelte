<script>
  import { currentUser } from "$lib/stores/auth";
  import { apiFetch } from "$lib/api/client";
  import { onMount } from "svelte";
  import { fade, fly } from "svelte/transition";

  let keys = [];
  let loading = false;
  let generatingKey = false;
  let showGenerateForm = false;

  // Generate key form fields
  let passcode = "";
  let permissions = "full";
  let doctorName = "";
  let expiresInHours = 24;
  let label = "";

  async function fetchKeys() {
    if (!$currentUser) return;
    loading = true;
    try {
      keys = await apiFetch(`/api/share/list/${$currentUser.id}`);
    } catch (err) {
      console.error(err);
      keys = [];
    } finally {
      loading = false;
    }
  }

  async function generateNewKey() {
    if (!$currentUser) return;
    if (!passcode || passcode.length < 4 || passcode.length > 6) {
      alert("Passcode must be 4-6 digits");
      return;
    }
    generatingKey = true;
    try {
      const newKey = await apiFetch("/api/share/generate", {
        method: "POST",
        body: JSON.stringify({
          patient_id: $currentUser.id,
          passcode: passcode,
          permissions: permissions,
          expires_in_hours: expiresInHours,
          doctor_name: doctorName || null,
          label: label || null,
        }),
      });
      keys = [newKey, ...keys];
      showGenerateForm = false;
      passcode = "";
      doctorName = "";
      label = "";
    } catch (err) {
      console.error(err);
      alert(err.message || "Failed to generate key");
    } finally {
      generatingKey = false;
    }
  }

  async function revokeKey(keyId) {
    try {
      await apiFetch(`/api/share/revoke/${keyId}`, { method: "POST" });
      keys = keys.map((k) => (k.id === keyId ? { ...k, is_revoked: true } : k));
    } catch (err) {
      console.error(err);
    }
  }

  function copyKey(shareKey) {
    navigator.clipboard.writeText(shareKey);
  }

  onMount(fetchKeys);
</script>

<div class="space-y-12">
  <div
    class="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-slate-200 pb-10"
    in:fade
  >
    <div class="space-y-2">
      <div
        class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sentinel-optimal/5 border border-sentinel-optimal/20 mb-2"
      >
        <svg
          class="w-3 h-3 text-sentinel-optimal"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
          />
        </svg>
        <span class="text-xs font-semibold text-sentinel-optimal">Secure Sharing Active</span>
      </div>
      <h1 class="text-4xl font-bold tracking-tight text-sentinel-text leading-tight">
        Share <span class="text-sentinel-optimal italic font-bold">Records</span>
      </h1>
      <div class="text-sm text-sentinel-dim font-medium">Manage secure access tokens for your healthcare providers.</div>
    </div>

    <button
      on:click={() => (showGenerateForm = !showGenerateForm)}
      class="hud-button min-w-[200px]"
    >
      <svg
        class="w-4 h-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M12 6v6m0 0v6m0-6h6m-6 0H6"
        />
      </svg>
      {showGenerateForm ? "Cancel" : "Create Access Token"}
    </button>
  </div>

  <!-- Generate Key Form -->
  {#if showGenerateForm}
    <div
      class="hud-panel p-8 bg-white border-sentinel-optimal/20 space-y-6"
      in:fly={{ y: -10 }}
    >
      <div class="text-sm font-bold text-sentinel-text border-b border-slate-200 pb-4 flex items-center gap-2">
        <div class="w-2 h-2 rounded-full bg-sentinel-optimal"></div>
        New Access Token Setup
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div class="space-y-2">
          <label class="text-[11px] text-sentinel-dim font-bold px-1">Security Passcode (4-6 digits)*</label>
          <input
            type="text"
            bind:value={passcode}
            maxlength="6"
            placeholder="e.g. 1234"
            class="hud-input font-mono"
            pattern="[0-9]*"
          />
        </div>

        <div class="space-y-2">
          <label class="text-[11px] text-sentinel-dim font-bold px-1">Access Level</label>
          <select bind:value={permissions} class="hud-input">
            <option value="full">Full Access</option>
            <option value="labs_only">Lab Reports Only</option>
          </select>
        </div>

        <div class="space-y-2">
          <label class="text-[11px] text-sentinel-dim font-bold px-1">Doctor Name</label>
          <input
            type="text"
            bind:value={doctorName}
            placeholder="Dr. Smith"
            class="hud-input"
          />
        </div>

        <div class="space-y-2">
          <label class="text-[11px] text-sentinel-dim font-bold px-1">Expires In (Hours)</label>
          <input
            type="number"
            bind:value={expiresInHours}
            min="1"
            max="720"
            class="hud-input font-mono"
          />
        </div>

        <div class="space-y-2 md:col-span-2">
          <label class="text-[11px] text-sentinel-dim font-bold px-1">Label (Optional)</label>
          <input
            type="text"
            bind:value={label}
            placeholder="Annual checkup, Cardiology review..."
            class="hud-input"
          />
        </div>
      </div>

      <button
        on:click={generateNewKey}
        disabled={generatingKey || !passcode}
        class="hud-button w-full py-3"
      >
        {#if generatingKey}
          <div class="w-4 h-4 border-2 border-white/20 border-t-sentinel-optimal rounded-full animate-spin"></div>
          Creating secure token...
        {:else}
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          Create Secure Token
        {/if}
      </button>
    </div>
  {/if}

  <div
    class="hud-panel p-8 bg-white border-slate-200 space-y-8"
    in:fade={{ delay: 200 }}
  >
    <div
      class="flex items-center justify-between border-b border-slate-200 pb-4"
    >
      <div class="text-sm font-bold text-sentinel-text flex items-center gap-2">
        <div class="w-2 h-2 rounded-full bg-sentinel-optimal"></div>
        Active Access Tokens
      </div>
      <div class="text-[10px] font-semibold text-sentinel-dim">
        Total Tokens: {keys.length.toString().padStart(2, "0")}
      </div>
    </div>

    {#if loading}
      <div class="py-20 text-center space-y-4">
        <div
          class="w-8 h-8 rounded-full border-2 border-sentinel-optimal/20 border-t-sentinel-optimal animate-spin mx-auto"
        ></div>
        <div class="text-xs text-sentinel-dim animate-pulse font-medium">Fetching active tokens...</div>
      </div>
    {:else if keys.length === 0}
      <div
        class="py-20 text-center space-y-4 opacity-50 border border-dashed border-slate-200 rounded-2xl bg-slate-50/50"
      >
        <div class="text-sm text-sentinel-dim font-bold">No active tokens found</div>
        <p class="text-xs text-sentinel-dim/60 max-w-xs mx-auto">
          Create an access token to allow your healthcare providers secure access to your clinical records.
        </p>
      </div>
    {:else}
      <div class="grid grid-cols-1 gap-4">
        {#each keys as key, i}
          <div
            class="p-6 rounded-2xl border transition-all group flex flex-col gap-4
              {key.is_revoked
              ? 'bg-slate-50 border-slate-200 opacity-50'
              : 'bg-white border-slate-200 hover:border-sentinel-optimal/20'}"
            in:fly={{ y: 10, delay: i * 100 }}
          >
            <div
              class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
            >
              <div class="flex flex-wrap gap-8">
                <div class="space-y-1">
                  <span class="text-[10px] text-sentinel-dim font-bold block">Access Token</span>
                  <div class="flex items-center gap-2">
                    <span
                      class="text-xs font-mono text-sentinel-optimal font-bold"
                      >{key.share_key}</span
                    >
                    {#if !key.is_revoked}
                      <button
                        on:click={() => copyKey(key.share_key)}
                        class="text-[8px] text-sentinel-dim hover:text-sentinel-optimal transition-colors uppercase tracking-widest"
                        title="Copy key"
                      >
                        📋
                      </button>
                    {/if}
                  </div>
                </div>
                <div class="space-y-1">
                  <span class="text-[10px] text-sentinel-dim font-bold block">Doctor</span>
                  <span class="text-xs font-bold text-sentinel-text">{key.doctor_name || "Not Specified"}</span>
                </div>
                <div class="space-y-1">
                  <span class="text-[10px] text-sentinel-dim font-bold block">Access Level</span>
                  <span class="text-xs font-semibold text-sentinel-text">{key.permissions}</span>
                </div>
                <div class="space-y-1">
                  <span class="text-[10px] text-sentinel-dim font-bold block">Expires</span>
                  <span class="text-xs text-sentinel-muted font-semibold">{new Date(key.expires_at).toLocaleDateString()}</span>
                </div>
                <div class="space-y-1">
                  <span class="text-[10px] text-sentinel-dim font-bold block">Uses</span>
                  <span class="text-xs font-semibold text-sentinel-text">{key.usage_count}/{key.max_uses}</span>
                </div>
              </div>

              {#if key.is_revoked}
                <span
                  class="px-4 py-2 rounded-lg border border-sentinel-critical/30 bg-sentinel-critical/5 text-[9px] font-bold hud-text-critical uppercase tracking-widest"
                >
                  REVOKED
                </span>
              {:else}
                <button
                  on:click={() => revokeKey(key.id)}
                  class="px-4 py-2 rounded-lg border border-sentinel-critical/30 bg-sentinel-critical/5 text-[9px] font-bold hud-text-critical hover:bg-sentinel-critical/10 hover:border-sentinel-critical transition-all uppercase opacity-0 group-hover:opacity-100"
                >
                  Revoke Access
                </button>
              {/if}
            </div>
            {#if key.label}
              <div
                class="text-[9px] text-sentinel-dim uppercase tracking-wider font-mono border-t border-slate-100 pt-3"
              >
                LABEL: {key.label}
              </div>
            {/if}
          </div>
        {/each}
      </div>
    {/if}
  </div>

  <div
    class="hud-panel p-6 bg-sentinel-optimal/5 border-sentinel-optimal/10"
    in:fade={{ delay: 400 }}
  >
    <div class="flex gap-6 items-start">
      <div
        class="w-10 h-10 rounded-xl border border-sentinel-optimal/30 flex items-center justify-center shrink-0 mt-1"
      >
        <svg
          class="w-5 h-5 text-sentinel-optimal"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
          />
        </svg>
      </div>
      <div class="space-y-1">
        <div class="text-xs font-bold text-sentinel-text">Security Information</div>
        <p class="text-xs text-sentinel-dim leading-relaxed">
          Each token provides temporary read-only access to your records. Share the key and passcode with your provider. Access can be revoked at any time.
        </p>
      </div>
    </div>
  </div>
</div>
