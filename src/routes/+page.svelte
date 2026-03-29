<script>
  import { onMount } from "svelte";
  import { currentUser } from "$lib/stores/auth";
  import {
    reports,
    traumaPins,
    loading,
    error,
    fetchMyData,
  } from "$lib/stores/data";
  import { apiFetch } from "$lib/api/client";
  import { fade, fly } from "svelte/transition";

  let showAddForm = false;
  let adding = false;
  let newRecord = {
    title: "",
    notes: "",
    body_region: "",
    severity: "medium",
    trauma_type: "condition",
    occurred_at: "",
  };

  const bodyRegions = [
    "head",
    "neck",
    "chest",
    "abdomen",
    "upper_back",
    "lower_back",
    "left_arm",
    "right_arm",
    "left_leg",
    "right_leg",
    "left_hand",
    "right_hand",
    "left_foot",
    "right_foot",
    "general",
  ];

  async function addMedicalRecord() {
    if (!$currentUser || !newRecord.title) return;
    adding = true;
    try {
      await apiFetch("/api/trauma/", {
        method: "POST",
        body: JSON.stringify({
          patient_id: $currentUser.id,
          position_x: 0,
          position_y: 0,
          position_z: 0,
          title: newRecord.title,
          trauma_type: newRecord.trauma_type,
          severity: newRecord.severity,
          body_region: newRecord.body_region || null,
          notes: newRecord.notes || null,
          occurred_at: newRecord.occurred_at || null,
        }),
      });
      newRecord = {
        title: "",
        notes: "",
        body_region: "",
        severity: "medium",
        trauma_type: "condition",
        occurred_at: "",
      };
      showAddForm = false;
      await fetchMyData();
    } catch (err) {
      console.error(err);
    } finally {
      adding = false;
    }
  }

  onMount(() => {
    fetchMyData();
  });

  const quickLinks = [
    {
      label: "LAB REPORTS",
      href: "/reports",
      icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",
    },
    { label: "BIO-TWIN", href: "/twin", icon: "M13 10V3L4 14h7v7l9-11h-7z" },
    {
      label: "SHARE DATA",
      href: "/share",
      icon: "M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z",
    },
    {
      label: "PREDICTIONS",
      href: "/predictions",
      icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z",
    },
  ];

  function getSeverityColor(s) {
    switch (s) {
      case "critical":
        return "hud-text-critical bg-sentinel-critical/10 border-sentinel-critical/30";
      case "high":
        return "hud-text-critical bg-sentinel-critical/5 border-sentinel-critical/20";
      case "medium":
        return "text-sentinel-warning bg-sentinel-warning/5 border-sentinel-warning/20";
      default:
        return "text-sentinel-optimal bg-sentinel-optimal/5 border-sentinel-optimal/20";
    }
  }
</script>

<div class="space-y-12 pb-20">
  {#if $loading}
    <div
      class="hud-panel h-64 flex flex-col items-center justify-center space-y-4 shadow-[0_0_50px_rgba(6,182,212,0.1)] border-sentinel-optimal/20"
    >
      <div class="relative w-16 h-16">
        <div
          class="absolute inset-0 rounded-full border-2 border-sentinel-optimal/10 animate-pulse"
        ></div>
        <div
          class="absolute inset-0 rounded-full border-t-2 border-sentinel-optimal animate-spin"
        ></div>
      </div>
      <div
        class="text-[10px] hud-text-optimal tracking-[0.5em] animate-pulse uppercase font-black"
      >
        ACCESSING_DATA_VAULT...
      </div>
    </div>
  {:else if $error}
    <div
      class="hud-panel border-sentinel-critical/30 p-10 text-center space-y-4 bg-gradient-to-b from-sentinel-critical/5 to-transparent"
    >
      <div
        class="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-sentinel-critical/10 mb-2 border border-sentinel-critical/20"
      >
        <svg
          class="w-6 h-6 hud-text-critical"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
      </div>
      <div
        class="text-sm font-bold hud-text-critical uppercase tracking-[0.3em]"
      >
        ENCRYPTED_ACCESS_FAILED
      </div>
      <div class="text-[11px] text-sentinel-dim max-w-sm mx-auto font-mono">
        {$error}
      </div>
      <button on:click={fetchMyData} class="hud-button mx-auto mt-4 px-8"
        >RETRY_HANDSHAKE</button
      >
    </div>
  {:else}
    <!-- Welcome Hero -->
    <section class="relative" in:fade>
      <div
        class="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-8 border-b border-slate-200 pb-10"
      >
        <div class="space-y-3">
          <div
            class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sentinel-optimal/5 border border-sentinel-optimal/20 mb-2"
          >
            <span class="relative flex h-2 w-2">
              <span
                class="animate-ping absolute inline-flex h-full w-full rounded-full bg-sentinel-optimal opacity-75"
              ></span>
              <span
                class="relative inline-flex rounded-full h-2 w-2 bg-sentinel-optimal"
              ></span>
            </span>
            <span
              class="text-[9px] font-bold hud-text-optimal tracking-widest uppercase italic"
              >DATA_REPOSITORIES_STABLE</span
            >
          </div>
          <h1
            class="text-5xl font-black tracking-tight text-sentinel-text uppercase leading-tight"
          >
            DASHBOARD
          </h1>
          <div
            class="text-[10px] text-sentinel-dim tracking-[0.4em] uppercase font-mono flex items-center gap-3"
          >
            <span>ARCHIVE_VAULT</span>
            <span class="w-1 h-1 rounded-full bg-slate-200"></span>
            <span>SUBJECT_{$currentUser?.id?.substring(0, 8)}</span>
          </div>
        </div>

        <div class="flex gap-4">
          <a href="/twin" class="hud-button whitespace-nowrap group">
            <svg
              class="w-4 h-4 group-hover:scale-110 transition-transform"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
            SYNC BIO-TWIN
          </a>
          <a
            href="/reports"
            class="hud-button !border-slate-200 !bg-slate-50 !text-sentinel-dim hover:!border-sentinel-optimal/50 whitespace-nowrap group"
          >
            <svg
              class="w-4 h-4 group-hover:rotate-12 transition-transform"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            UPLOAD RECORDS
          </a>
        </div>
      </div>
    </section>

    <!-- Quick Stats Grid -->
    <section
      class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      in:fade={{ delay: 200 }}
    >
      <div
        class="hud-panel p-6 bg-gradient-to-br from-white to-slate-50/50 border-slate-200 group hover:border-sentinel-optimal/30 transition-all duration-500"
      >
        <div class="flex justify-between items-start mb-4">
          <div
            class="text-[9px] text-sentinel-dim uppercase tracking-[0.3em] font-bold"
          >
            BIO_ARCHIVES
          </div>
          <svg
            class="w-4 h-4 text-sentinel-optimal/40"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
        </div>
        <div class="text-4xl font-black text-sentinel-text mb-1">
          {$reports.length}
        </div>
        <div
          class="text-[9px] text-sentinel-dim uppercase tracking-widest font-mono"
        >
          LAB_REPORTS_LOADED
        </div>
      </div>

      <div
        class="hud-panel p-6 bg-gradient-to-br from-white to-slate-50/50 border-slate-200 group hover:border-sentinel-warning/30 transition-all duration-500"
      >
        <div class="flex justify-between items-start mb-4">
          <div
            class="text-[9px] text-sentinel-dim uppercase tracking-[0.3em] font-bold"
          >
            MEDICAL_RECORDS
          </div>
          <svg
            class="w-4 h-4 text-sentinel-warning/40"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
            />
          </svg>
        </div>
        <div class="text-4xl font-black text-sentinel-text mb-1">
          {$traumaPins.length}
        </div>
        <div
          class="text-[9px] text-sentinel-dim uppercase tracking-widest font-mono"
        >
          CONDITIONS_LOGGED
        </div>
      </div>

      <div
        class="hud-panel p-6 bg-gradient-to-br from-white to-slate-50/50 border-slate-200 group hover:border-sentinel-optimal/30 transition-all duration-500"
      >
        <div class="flex justify-between items-start mb-4">
          <div
            class="text-[9px] text-sentinel-dim uppercase tracking-[0.3em] font-bold"
          >
            BLOOD_TYPE
          </div>
          <svg
            class="w-4 h-4 text-sentinel-critical/40"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
            />
          </svg>
        </div>
        <div class="text-4xl font-black text-sentinel-text mb-1">
          {$currentUser?.blood_type || "N/A"}
        </div>
        <div
          class="text-[9px] text-sentinel-dim uppercase tracking-widest font-mono"
        >
          GENOTYPE_REF
        </div>
      </div>

      <div
        class="hud-panel p-6 bg-gradient-to-br from-white to-slate-50/50 border-slate-200 group hover:border-sentinel-optimal/30 transition-all duration-500"
      >
        <div class="flex justify-between items-start mb-4">
          <div
            class="text-[9px] text-sentinel-dim uppercase tracking-[0.3em] font-bold"
          >
            SYSTEM_STATUS
          </div>
          <div
            class="w-2 h-2 rounded-full bg-sentinel-optimal shadow-[0_0_10px_#06B6D4] animate-pulse"
          ></div>
        </div>
        <div
          class="text-xl font-bold text-sentinel-text mb-1 uppercase tracking-tighter"
        >
          NOMINAL
        </div>
        <div
          class="text-[9px] text-sentinel-dim uppercase tracking-widest font-mono"
        >
          ALL_NODES_STABLE
        </div>
      </div>
    </section>

    <!-- Medical Records -->
    <section
      class="hud-panel p-8 bg-white border-slate-200 space-y-6"
      in:fade={{ delay: 300 }}
    >
      <div class="flex items-center justify-between">
        <h2
          class="text-xs font-black text-sentinel-text tracking-[0.5em] uppercase flex items-center gap-3"
        >
          <div class="w-2 h-2 bg-sentinel-warning rotate-45"></div>
          MEDICAL_HISTORY
        </h2>
        <button
          on:click={() => (showAddForm = !showAddForm)}
          class="hud-button text-[9px]"
        >
          {#if showAddForm}
            CANCEL
          {:else}
            <svg
              class="w-3 h-3"
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
            ADD RECORD
          {/if}
        </button>
      </div>

      <!-- Add Record Form -->
      {#if showAddForm}
        <div
          class="p-6 rounded-2xl bg-slate-50 border border-sentinel-optimal/20 space-y-5"
          in:fly={{ y: -10 }}
        >
          <div
            class="text-[10px] font-bold text-sentinel-text uppercase tracking-[0.2em] border-b border-slate-200 pb-3 flex items-center gap-2"
          >
            <div
              class="w-1.5 h-1.5 rounded-full bg-sentinel-optimal animate-pulse"
            ></div>
            NEW_MEDICAL_ENTRY
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="space-y-1.5 md:col-span-2">
              <label
                class="text-[8px] text-sentinel-dim tracking-[0.2em] uppercase font-bold px-1"
                >CONDITION / EVENT *</label
              >
              <input
                bind:value={newRecord.title}
                placeholder="e.g. Fever, Knee Pain, Surgery..."
                class="hud-input"
              />
            </div>
            <div class="space-y-1.5">
              <label
                class="text-[8px] text-sentinel-dim tracking-[0.2em] uppercase font-bold px-1"
                >DATE OCCURRED</label
              >
              <input
                type="date"
                bind:value={newRecord.occurred_at}
                class="hud-input font-mono"
              />
            </div>
            <div class="space-y-1.5">
              <label
                class="text-[8px] text-sentinel-dim tracking-[0.2em] uppercase font-bold px-1"
                >BODY REGION</label
              >
              <select
                bind:value={newRecord.body_region}
                class="hud-input font-mono"
              >
                <option value="">-- SELECT --</option>
                {#each bodyRegions as region}
                  <option value={region}
                    >{region.replace(/_/g, " ").toUpperCase()}</option
                  >
                {/each}
              </select>
            </div>
            <div class="space-y-1.5">
              <label
                class="text-[8px] text-sentinel-dim tracking-[0.2em] uppercase font-bold px-1"
                >TYPE</label
              >
              <select
                bind:value={newRecord.trauma_type}
                class="hud-input font-mono"
              >
                <option value="condition">CONDITION</option>
                <option value="injury">INJURY</option>
                <option value="surgery">SURGERY</option>
                <option value="chronic_pain">CHRONIC PAIN</option>
                <option value="psychological">PSYCHOLOGICAL</option>
              </select>
            </div>
            <div class="space-y-1.5">
              <label
                class="text-[8px] text-sentinel-dim tracking-[0.2em] uppercase font-bold px-1"
                >SEVERITY</label
              >
              <select
                bind:value={newRecord.severity}
                class="hud-input font-mono"
              >
                <option value="low">LOW</option>
                <option value="medium">MEDIUM</option>
                <option value="high">HIGH</option>
                <option value="critical">CRITICAL</option>
              </select>
            </div>
            <div class="space-y-1.5 md:col-span-2">
              <label
                class="text-[8px] text-sentinel-dim tracking-[0.2em] uppercase font-bold px-1"
                >NOTES</label
              >
              <textarea
                bind:value={newRecord.notes}
                rows="2"
                placeholder="Additional details..."
                class="hud-input resize-none"
              ></textarea>
            </div>
          </div>
          <button
            on:click={addMedicalRecord}
            disabled={adding || !newRecord.title}
            class="hud-button w-full py-2.5"
          >
            {#if adding}
              <div
                class="w-3 h-3 border-2 border-white/20 border-t-sentinel-optimal rounded-full animate-spin"
              ></div>
              RECORDING...
            {:else}
              LOG_MEDICAL_ENTRY
            {/if}
          </button>
        </div>
      {/if}

      <!-- Records List -->
      {#if $traumaPins.length === 0}
        <div
          class="py-12 text-center opacity-40 border border-dashed border-slate-200 rounded-2xl"
        >
          <div class="text-[10px] text-sentinel-dim uppercase tracking-[0.4em]">
            NO_MEDICAL_RECORDS_FOUND
          </div>
          <p
            class="text-[9px] text-sentinel-dim/60 mt-2 uppercase tracking-wider"
          >
            CLICK "ADD RECORD" TO LOG YOUR FIRST MEDICAL ENTRY
          </p>
        </div>
      {:else}
        <div class="space-y-3 max-h-[400px] overflow-y-auto custom-scrollbar">
          {#each $traumaPins as record, i}
            <div
              class="p-5 rounded-xl bg-slate-50 border border-slate-200 hover:border-sentinel-optimal/20 transition-all group"
              in:fly={{ x: -10, delay: i * 50 }}
            >
              <div
                class="flex flex-col sm:flex-row justify-between items-start gap-3"
              >
                <div class="flex items-start gap-4">
                  <div
                    class="w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 mt-0.5 {getSeverityColor(
                      record.severity,
                    )}"
                  >
                    <svg
                      class="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="1.5"
                        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                      />
                    </svg>
                  </div>
                  <div class="space-y-1">
                    <div
                      class="text-sm font-bold text-sentinel-text uppercase tracking-wider"
                    >
                      {record.title || "MEDICAL EVENT"}
                    </div>
                    <div
                      class="flex flex-wrap gap-3 text-[9px] text-sentinel-dim uppercase tracking-wider"
                    >
                      {#if record.trauma_type}
                        <span
                          class="px-2 py-0.5 rounded bg-slate-100 border border-slate-200"
                          >{record.trauma_type.replace(/_/g, " ")}</span
                        >
                      {/if}
                      {#if record.body_region}
                        <span
                          class="px-2 py-0.5 rounded bg-slate-100 border border-slate-200"
                          >📍 {record.body_region.replace(/_/g, " ")}</span
                        >
                      {/if}
                      {#if record.severity}
                        <span
                          class="px-2 py-0.5 rounded border font-bold {getSeverityColor(
                            record.severity,
                          )}">{record.severity}</span
                        >
                      {/if}
                    </div>
                    {#if record.notes}
                      <div class="text-[10px] text-sentinel-dim mt-1">
                        {record.notes}
                      </div>
                    {/if}
                  </div>
                </div>
                <div class="text-right shrink-0">
                  <div
                    class="text-[8px] text-sentinel-dim uppercase tracking-widest font-bold"
                  >
                    DATE
                  </div>
                  <div class="text-xs font-mono text-sentinel-text">
                    {record.occurred_at
                      ? new Date(record.occurred_at).toLocaleDateString()
                      : record.created_at
                        ? new Date(record.created_at).toLocaleDateString()
                        : "N/A"}
                  </div>
                </div>
              </div>
            </div>
          {/each}
        </div>
      {/if}
    </section>

    <!-- Quick Access Links -->
    <section
      class="grid grid-cols-1 lg:grid-cols-2 gap-10"
      in:fade={{ delay: 400 }}
    >
      <div class="space-y-6">
        <h2
          class="text-xs font-black text-sentinel-text tracking-[0.5em] uppercase flex items-center gap-3"
        >
          <div class="w-2 h-2 bg-sentinel-optimal rotate-45"></div>
          QUICK_ACCESS_LAYERS
        </h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {#each quickLinks as link}
            <a
              href={link.href}
              class="hud-panel p-5 bg-white border-slate-200 hover:border-sentinel-optimal/30 hover:bg-slate-50 transition-all group flex items-center gap-4"
            >
              <div
                class="w-10 h-10 rounded-lg bg-sentinel-surface-2 flex items-center justify-center text-sentinel-optimal group-hover:scale-110 transition-transform"
              >
                <svg
                  class="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d={link.icon}
                  />
                </svg>
              </div>
              <div
                class="text-[11px] font-bold text-sentinel-text tracking-[0.2em] group-hover:translate-x-1 transition-transform"
              >
                {link.label}
              </div>
            </a>
          {/each}
        </div>
      </div>

      <div
        class="hud-panel p-8 relative overflow-hidden bg-gradient-to-br from-sentinel-optimal/5 via-transparent to-transparent"
      >
        <div class="relative z-10 space-y-6">
          <div
            class="text-[10px] text-sentinel-optimal uppercase tracking-[0.4em] font-black"
          >
            BIO-DIGITAL_TWIN
          </div>
          <h3
            class="text-2xl font-bold text-sentinel-text leading-tight uppercase"
          >
            PROJECTION_MODALITY<br /><span class="text-sentinel-dim italic"
              >ACTIVE_ENCODING</span
            >
          </h3>
          <p
            class="text-[10px] text-sentinel-dim leading-relaxed tracking-wider max-w-sm uppercase font-mono"
          >
            YOUR DIGITAL TWIN IS SYNCHRONIZED WITH THE LATEST ARCHIVAL DATA.
            REVIEWS CLINICAL PHENOTYPES AND ANATOMICAL MAPS IN THE BIO-TWIN
            INTERFACE.
          </p>
          <a
            href="/twin"
            class="inline-flex items-center gap-3 text-[10px] font-black text-sentinel-optimal uppercase tracking-[0.3em] hover:gap-5 transition-all"
          >
            INITIALIZE_3D_RENDER
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
                d="M17 8l4 4m0 0l-4 4m4-4H3"
              />
            </svg>
          </a>
        </div>

        <div
          class="absolute -right-10 -bottom-10 w-48 h-48 border border-sentinel-optimal/10 rounded-full animate-[spin_20s_linear_infinite]"
        ></div>
        <div
          class="absolute -right-5 -bottom-5 w-32 h-32 border border-sentinel-optimal/5 rounded-full animate-[spin_15s_linear_infinite_reverse]"
        ></div>
      </div>
    </section>

    <!-- Emergency Contact Section -->
    <section in:fade={{ delay: 600 }}>
      <div
        class="hud-panel p-8 border-slate-200 bg-white hover:border-sentinel-optimal/20 transition-colors"
      >
        <div
          class="flex flex-col md:flex-row justify-between items-center gap-8"
        >
          <div class="flex items-center gap-6">
            <div
              class="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center border border-slate-200"
            >
              <svg
                class="w-8 h-8 text-sentinel-dim"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="1.5"
                  d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                />
              </svg>
            </div>
            <div>
              <div
                class="text-[9px] text-sentinel-dim uppercase tracking-[0.4em] font-bold mb-1"
              >
                EMERGENCY_LOCATOR
              </div>
              <div
                class="text-xl font-black text-sentinel-text uppercase tracking-widest italic group-hover:tracking-[0.2em] transition-all"
              >
                {$currentUser?.emergency_contact_name || "NOT_DECLARED"}
              </div>
            </div>
          </div>
          <div class="text-right">
            <div
              class="text-[9px] text-sentinel-dim uppercase tracking-widest font-mono mb-2 opacity-50"
            >
              ENCRYPTED_COMMS_CHANNELS_OPEN
            </div>
            <div class="flex gap-2 justify-end">
              <div
                class="w-1.5 h-1.5 rounded-full bg-sentinel-optimal/40"
              ></div>
              <div
                class="w-1.5 h-1.5 rounded-full bg-sentinel-optimal/40"
              ></div>
              <div class="w-1.5 h-1.5 rounded-full bg-sentinel-optimal"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  {/if}
</div>
