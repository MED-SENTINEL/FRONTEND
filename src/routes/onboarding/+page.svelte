<script>
  import { profileApi } from '$lib/api/client';
  import { refreshUser, currentUser } from '$lib/stores/auth';
  import { goto } from '$app/navigation';
  import { fade, fly } from 'svelte/transition';

  let step = 1;
  let submitting = false;
  let errorMsg = '';

  // Step 1: Demographics
  let gender = '';
  let date_of_birth = '';
  let blood_type = '';

  // Step 2: Physical
  let height_cm = '';
  let weight_kg = '';

  // Step 3: Contact & Emergency
  let phone = '';
  let address = '';
  let emergency_contact_name = '';
  let emergency_contact_phone = '';
  let emergency_contact_relation = '';

  // Step 4: Medical History
  let allergies = '';
  let chronic_conditions = '';
  let current_medications = '';
  let past_surgeries = '';

  const totalSteps = 4;

  function nextStep() {
    if (step < totalSteps) step++;
  }

  function prevStep() {
    if (step > 1) step--;
  }

  async function handleSubmit() {
    errorMsg = '';
    submitting = true;
    try {
      const data = {
        gender: gender || null,
        date_of_birth: date_of_birth || null,
        blood_type: blood_type || null,
        height_cm: height_cm ? parseFloat(height_cm) : null,
        weight_kg: weight_kg ? parseFloat(weight_kg) : null,
        phone: phone || null,
        address: address || null,
        emergency_contact_name: emergency_contact_name || null,
        emergency_contact_phone: emergency_contact_phone || null,
        emergency_contact_relation: emergency_contact_relation || null,
        allergies: allergies || null,
        chronic_conditions: chronic_conditions || null,
        current_medications: current_medications || null,
        past_surgeries: past_surgeries || null,
      };

      await profileApi.onboard(data);
      await refreshUser();
      goto('/');
    } catch (err) {
      errorMsg = err.message;
    } finally {
      submitting = false;
    }
  }

  const stepLabels = [
    'Basic Information',
    'Physical Stats',
    'Contact Details',
    'Medical History',
  ];
</script>

<div class="min-h-screen flex items-center justify-center bg-sentinel-bg relative overflow-hidden p-6 selection:bg-sentinel-optimal/10">
  <!-- Background -->
  <div class="absolute inset-0 opacity-40 pointer-events-none"
       style="background-image: radial-gradient(circle at 2px 2px, rgba(8, 145, 178, 0.1) 1px, transparent 0); background-size: 40px 40px;"></div>
  <div class="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(8,145,178,0.03)_0%,transparent_70%)] pointer-events-none"></div>

  <div class="w-full max-w-lg relative z-10" in:fly={{ y: 20, duration: 800 }}>
    <!-- Header -->
    <div class="text-center mb-8 space-y-4">
      <div class="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-sentinel-optimal to-sentinel-optimal/20 shadow-lg shadow-sentinel-optimal/20 mb-2">
        <svg class="w-8 h-8 text-sentinel-bg" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" />
        </svg>
      </div>
      <h1 class="text-3xl font-bold tracking-tight text-sentinel-text">Profile Setup</h1>
      <div class="text-xs text-sentinel-muted font-medium">Step {step} of {totalSteps} — {stepLabels[step - 1]}</div>
    </div>

    <!-- Progress Bar -->
    <div class="mb-6 flex gap-2">
      {#each Array(totalSteps) as _, i}
        <div class="flex-1 h-1.5 rounded-full transition-all duration-500 {i < step ? 'bg-sentinel-optimal' : 'bg-slate-200'}"></div>
      {/each}
    </div>

    <!-- Card -->
    <div class="hud-panel p-8 bg-white/50 border-slate-200 shadow-2xl space-y-6">
      <div class="text-sm font-bold text-sentinel-text border-b border-slate-200 pb-4">
        {stepLabels[step - 1]}
      </div>

      {#if errorMsg}
        <div class="p-3 rounded-lg bg-sentinel-critical/10 border border-sentinel-critical/20 text-[9px] hud-text-critical uppercase tracking-widest leading-relaxed" in:fade>
          <span class="font-bold">ERROR:</span> {errorMsg}
        </div>
      {/if}

      <!-- Step 1: Demographics -->
      {#if step === 1}
        <div class="space-y-4" in:fly={{ x: 30, duration: 400 }}>
          <div class="space-y-1.5">
            <label for="gender" class="text-[11px] text-sentinel-dim font-bold px-1">Gender</label>
            <select id="gender" bind:value={gender}
              class="w-full bg-white border border-slate-200 rounded-lg px-4 h-11 text-xs text-sentinel-text focus:outline-none focus:border-sentinel-optimal/50 transition-all">
              <option value="">— Select —</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
              <option value="prefer_not_to_say">Prefer not to say</option>
            </select>
          </div>

          <div class="space-y-1.5">
            <label for="dob" class="text-[11px] text-sentinel-dim font-bold px-1">Date of Birth</label>
            <input id="dob" type="date" bind:value={date_of_birth}
              class="hud-input h-11" />
          </div>

          <div class="space-y-1.5">
            <label for="blood" class="text-[11px] text-sentinel-dim font-bold px-1">Blood Type</label>
            <select id="blood" bind:value={blood_type}
              class="w-full bg-white border border-slate-200 rounded-lg px-4 h-11 text-xs text-sentinel-text focus:outline-none focus:border-sentinel-optimal/50 transition-all">
              <option value="">— Unknown —</option>
              <option value="A+">A+</option>
              <option value="A-">A-</option>
              <option value="B+">B+</option>
              <option value="B-">B-</option>
              <option value="AB+">AB+</option>
              <option value="AB-">AB-</option>
              <option value="O+">O+</option>
              <option value="O-">O-</option>
            </select>
          </div>
        </div>
      {/if}

      <!-- Step 2: Physical -->
      {#if step === 2}
        <div class="space-y-4" in:fly={{ x: 30, duration: 400 }}>
          <div class="space-y-1.5">
            <label for="height" class="text-[11px] text-sentinel-dim font-bold px-1">Height (cm)</label>
            <input id="height" type="number" step="0.1" bind:value={height_cm}
              class="hud-input h-11" placeholder="175.0" />
          </div>
          <div class="space-y-1.5">
            <label for="weight" class="text-[11px] text-sentinel-dim font-bold px-1">Weight (kg)</label>
            <input id="weight" type="number" step="0.1" bind:value={weight_kg}
              class="hud-input h-11" placeholder="72.0" />
          </div>
          <div class="mt-4 p-3 rounded-lg bg-slate-50 border border-slate-200">
            <div class="text-xs text-sentinel-dim font-bold text-center">
              {#if height_cm && weight_kg}
                BMI: {(weight_kg / ((height_cm / 100) ** 2)).toFixed(1)} kg/m²
              {:else}
                Enter height & weight for BMI calculation
              {/if}
            </div>
          </div>
        </div>
      {/if}

      <!-- Step 3: Contact & Emergency -->
      {#if step === 3}
        <div class="space-y-4" in:fly={{ x: 30, duration: 400 }}>
          <div class="space-y-1.5">
            <label for="phone" class="text-[11px] text-sentinel-dim font-bold px-1">Phone Number</label>
            <input id="phone" type="tel" bind:value={phone}
              class="hud-input h-11" placeholder="+91-9876543210" />
          </div>
          <div class="space-y-1.5">
            <label for="address" class="text-[11px] text-sentinel-dim font-bold px-1">Address</label>
            <input id="address" type="text" bind:value={address}
              class="hud-input h-11" placeholder="City, State" />
          </div>

          <div class="h-px bg-slate-200 my-2"></div>
          <div class="text-[11px] text-sentinel-dim font-bold px-1">Emergency Contact</div>

          <div class="grid grid-cols-2 gap-3">
            <div class="space-y-1.5">
              <label for="ec-name" class="text-[10px] text-sentinel-dim font-bold px-1">Name</label>
              <input id="ec-name" type="text" bind:value={emergency_contact_name}
                class="hud-input h-10 text-[11px]" placeholder="Full Name" />
            </div>
            <div class="space-y-1.5">
              <label for="ec-phone" class="text-[10px] text-sentinel-dim font-bold px-1">Phone</label>
              <input id="ec-phone" type="tel" bind:value={emergency_contact_phone}
                class="hud-input h-10 text-[11px]" placeholder="+91-..." />
            </div>
          </div>
          <div class="space-y-1.5">
            <label for="ec-relation" class="text-[10px] text-sentinel-dim font-bold px-1">Relation</label>
            <select id="ec-relation" bind:value={emergency_contact_relation}
              class="w-full bg-white border border-slate-200 rounded-lg px-4 h-10 text-[11px] text-sentinel-text focus:outline-none focus:border-sentinel-optimal/50 transition-all">
              <option value="">— Select —</option>
              <option value="parent">Parent</option>
              <option value="spouse">Spouse</option>
              <option value="sibling">Sibling</option>
              <option value="child">Child</option>
              <option value="friend">Friend</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>
      {/if}

      <!-- Step 4: Medical History -->
      {#if step === 4}
        <div class="space-y-4" in:fly={{ x: 30, duration: 400 }}>
          <div class="space-y-1.5">
            <label for="allergies" class="text-[11px] text-sentinel-dim font-bold px-1">Known Allergies</label>
            <textarea id="allergies" bind:value={allergies} rows="2"
              class="hud-input py-2 resize-none" placeholder="e.g., Penicillin, Peanuts, None"></textarea>
          </div>
          <div class="space-y-1.5">
            <label for="conditions" class="text-[11px] text-sentinel-dim font-bold px-1">Chronic Conditions</label>
            <textarea id="conditions" bind:value={chronic_conditions} rows="2"
              class="hud-input py-2 resize-none" placeholder="e.g., Diabetes Type 2, Hypertension, None"></textarea>
          </div>
          <div class="space-y-1.5">
            <label for="medications" class="text-[11px] text-sentinel-dim font-bold px-1">Current Medications</label>
            <textarea id="medications" bind:value={current_medications} rows="2"
              class="hud-input py-2 resize-none" placeholder="e.g., Metformin 500mg, None"></textarea>
          </div>
          <div class="space-y-1.5">
            <label for="surgeries" class="text-[11px] text-sentinel-dim font-bold px-1">Past Surgeries</label>
            <textarea id="surgeries" bind:value={past_surgeries} rows="2"
              class="hud-input py-2 resize-none" placeholder="e.g., Appendectomy (2015), None"></textarea>
          </div>
        </div>
      {/if}

      <!-- Navigation -->
      <div class="flex gap-3 pt-4">
        {#if step > 1}
          <button
            on:click={prevStep}
            class="flex-1 py-3 text-xs font-bold border border-slate-200 rounded-lg text-sentinel-dim hover:bg-slate-50 transition-all"
          >
            ← Back
          </button>
        {/if}

        {#if step < totalSteps}
          <button
            on:click={nextStep}
            class="flex-1 hud-button py-3 text-xs font-bold"
          >
            Continue →
          </button>
        {:else}
          <button
            on:click={handleSubmit}
            disabled={submitting}
            class="flex-1 hud-button hud-button-accent py-3 text-xs font-bold"
          >
            {submitting ? 'Saving...' : 'Complete Setup'}
          </button>
        {/if}
      </div>

      <!-- Skip Option -->
      <div class="text-center pt-2">
        <button
          on:click={handleSubmit}
          class="text-[9px] text-sentinel-dim tracking-widest uppercase hover:text-sentinel-optimal transition-colors"
        >
          Skip for now →
        </button>
      </div>
    </div>

    <!-- Footer -->
    <div class="mt-8 text-center text-[10px] text-sentinel-dim/40 font-medium tracking-widest">
      Professional Medical Environment
    </div>
  </div>
</div>
