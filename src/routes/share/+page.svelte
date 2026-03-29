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
        <span
          class="text-[9px] font-bold text-sentinel-optimal tracking-widest uppercase italic"
          >ENCRYPTED_SHARE_ACTIVE</span
        >
      </div>
      <h1
        class="text-4xl font-bold tracking-tight text-sentinel-text uppercase leading-tight"
      >
        EXTERNAL <span class="text-sentinel-optimal italic font-black"
          >ACCESS</span
        >
      </h1>
      <div
        class="text-[10px] text-sentinel-dim tracking-[0.3em] uppercase font-mono"
      >
        ENCRYPTION_LAYER_v2 // TEMPORARY_GATEWAYS
      </div>
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
      {showGenerateForm ? "CANCEL" : "GENERATE_ACCESS_TOKEN"}
    </button>
  </div>

  <!-- Generate Key Form -->
  {#if showGenerateForm}
    <div
      class="hud-panel p-8 bg-white border-sentinel-optimal/20 space-y-6"
      in:fly={{ y: -10 }}
    >
      <div
        class="text-xs font-bold text-sentinel-text uppercase tracking-[0.2em] border-b border-slate-200 pb-4 flex items-center gap-2"
      >
        <div
          class="w-2 h-2 rounded-full bg-sentinel-optimal animate-pulse"
        ></div>
        NEW_ACCESS_TOKEN_CONFIGURATION
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div class="space-y-2">
          <label
            class="text-[9px] text-sentinel-dim tracking-[0.2em] uppercase font-bold px-1"
            >PASSCODE (4-6 DIGITS)*</label
          >
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
          <label
            class="text-[9px] text-sentinel-dim tracking-[0.2em] uppercase font-bold px-1"
            >PERMISSIONS</label
          >
          <select bind:value={permissions} class="hud-input font-mono">
            <option value="full">FULL ACCESS</option>
            <option value="labs_only">LABS ONLY</option>
          </select>
        </div>

        <div class="space-y-2">
          <label
            class="text-[9px] text-sentinel-dim tracking-[0.2em] uppercase font-bold px-1"
            >DOCTOR NAME</label
          >
          <input
            type="text"
            bind:value={doctorName}
            placeholder="Dr. Smith"
            class="hud-input"
          />
        </div>

        <div class="space-y-2">
          <label
            class="text-[9px] text-sentinel-dim tracking-[0.2em] uppercase font-bold px-1"
            >EXPIRES IN (HOURS)</label
          >
          <input
            type="number"
            bind:value={expiresInHours}
            min="1"
            max="720"
            class="hud-input font-mono"
          />
        </div>

        <div class="space-y-2 md:col-span-2">
          <label
            class="text-[9px] text-sentinel-dim tracking-[0.2em] uppercase font-bold px-1"
            >LABEL (OPTIONAL)</label
          >
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
          <div
            class="w-4 h-4 border-2 border-white/20 border-t-sentinel-optimal rounded-full animate-spin"
          ></div>
          GENERATING_SECURE_KEY...
        {:else}
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
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
            />
          </svg>
          ENCRYPT_AND_GENERATE
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
      <div
        class="text-[11px] font-bold text-sentinel-text uppercase tracking-[0.2em] flex items-center gap-2"
      >
        <div
          class="w-2 h-2 rounded-full bg-sentinel-optimal animate-pulse"
        ></div>
        ACTIVE_RECIPIENT_LIST
      </div>
      <div class="text-[8px] font-mono text-sentinel-dim uppercase">
        TOTAL_KEYS: {keys.length.toString().padStart(2, "0")}
      </div>
    </div>

    {#if loading}
      <div class="py-20 text-center space-y-4">
        <div
          class="w-8 h-8 rounded-full border-2 border-sentinel-optimal/20 border-t-sentinel-optimal animate-spin mx-auto"
        ></div>
        <div
          class="text-[10px] text-sentinel-dim animate-pulse uppercase tracking-widest"
        >
          QUERYING_VAULT...
        </div>
      </div>
    {:else if keys.length === 0}
      <div
        class="py-20 text-center space-y-4 opacity-50 border border-dashed border-slate-200 rounded-2xl bg-slate-50/50"
      >
        <div class="text-[10px] text-sentinel-dim uppercase tracking-[0.4em]">
          NO_RECORDS_FOUND
        </div>
        <p
          class="text-[10px] text-sentinel-dim/60 uppercase tracking-tighter max-w-xs mx-auto"
        >
          GENERATE A RECIPIENT KEY TO ALLOW YOUR MEDICAL PROVIDER SECURE ACCESS
          TO YOUR BIO-TWIN DATA.
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
                  <span
                    class="text-[8px] text-sentinel-dim uppercase font-bold tracking-widest block"
                    >TOKEN_ID</span
                  >
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
                  <span
                    class="text-[8px] text-sentinel-dim uppercase font-bold tracking-widest block"
                    >DOCTOR</span
                  >
                  <span
                    class="text-xs font-bold text-sentinel-text uppercase tracking-wider"
                    >{key.doctor_name || "NOT SPECIFIED"}</span
                  >
                </div>
                <div class="space-y-1">
                  <span
                    class="text-[8px] text-sentinel-dim uppercase font-bold tracking-widest block"
                    >PERMISSIONS</span
                  >
                  <span class="text-xs font-mono text-sentinel-text uppercase"
                    >{key.permissions}</span
                  >
                </div>
                <div class="space-y-1">
                  <span
                    class="text-[8px] text-sentinel-dim uppercase font-bold tracking-widest block"
                    >EXPIRES</span
                  >
                  <span class="text-xs text-sentinel-muted font-mono"
                    >{new Date(key.expires_at).toLocaleDateString()}</span
                  >
                </div>
                <div class="space-y-1">
                  <span
                    class="text-[8px] text-sentinel-dim uppercase font-bold tracking-widest block"
                    >USES</span
                  >
                  <span class="text-xs font-mono text-sentinel-text"
                    >{key.usage_count}/{key.max_uses}</span
                  >
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
                  REVOKE_ACCESS
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
        <div
          class="text-[10px] font-bold text-sentinel-text uppercase tracking-widest"
        >
          SECURITY PROTOCOL
        </div>
        <p
          class="text-[10px] text-sentinel-dim uppercase tracking-tighter leading-relaxed"
        >
          EACH TOKEN PROVIDES A TEMPORARY READ-ONLY GATEWAY TO YOUR BIO-TWIN
          PROFILE. SHARE THE KEY AND PASSCODE WITH YOUR DOCTOR. YOU CAN REVOKE
          ACCESS INSTANTLY AT ANY TIME.
        </p>
      </div>
    </div>
  </div>
</div>
