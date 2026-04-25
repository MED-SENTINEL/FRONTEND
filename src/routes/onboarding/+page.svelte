<script>
  import { profileApi } from '$lib/api/client';
  import { refreshUser, currentUser } from '$lib/stores/auth';
  import { goto } from '$app/navigation';
  import { fade, fly } from 'svelte/transition';
  import { toast } from '$lib/stores/toast';
  import { validatePhone, validateNumericRange, validateDate } from '$lib/utils/validation';

  let step = 0; // 0 = role selection
  let submitting = false;
  let errorMsg = '';
  let selectedRole = ''; // 'patient' or 'doctor'
  let fieldErrors = {};

  // Patient fields
  let gender = '';
  let date_of_birth = '';
  let blood_type = '';
  let height_cm = '';
  let weight_kg = '';
  let phone = '';
  let address = '';
  let emergency_contact_name = '';
  let emergency_contact_phone = '';
  let emergency_contact_relation = '';
  let allergies = '';
  let chronic_conditions = '';
  let current_medications = '';
  let past_surgeries = '';

  // Doctor fields
  let specialty = '';
  let license_number = '';
  let hospital = '';
  let department = '';
  let years_of_experience = '';
  let bio = '';
  let doc_phone = '';

  $: totalSteps = selectedRole === 'doctor' ? 3 : 4;

  $: stepLabels = selectedRole === 'doctor'
    ? ['Professional Info', 'Workplace Details', 'Bio & Contact']
    : ['Basic Information', 'Physical Stats', 'Contact Details', 'Medical History'];

  function selectRole(role) {
    selectedRole = role;
    step = 1;
  }

  function validateCurrentStep() {
    const errors = {};
    if (selectedRole === 'patient') {
      if (step === 1) {
        const dobResult = validateDate(date_of_birth, { noFuture: true, minYear: 1900 });
        if (!dobResult.valid) errors.date_of_birth = dobResult.error;
      }
      if (step === 2) {
        const heightResult = validateNumericRange(height_cm, 30, 300, 'Height');
        if (!heightResult.valid) errors.height_cm = heightResult.error;
        const weightResult = validateNumericRange(weight_kg, 1, 500, 'Weight');
        if (!weightResult.valid) errors.weight_kg = weightResult.error;
      }
      if (step === 3) {
        const phoneResult = validatePhone(phone);
        if (!phoneResult.valid) errors.phone = phoneResult.error;
        const emPhoneResult = validatePhone(emergency_contact_phone);
        if (!emPhoneResult.valid) errors.emergency_contact_phone = emPhoneResult.error;
      }
    }
    if (selectedRole === 'doctor' && step === 2) {
      const docPhoneResult = validatePhone(doc_phone);
      if (!docPhoneResult.valid) errors.doc_phone = docPhoneResult.error;
    }
    fieldErrors = errors;
    return Object.keys(errors).length === 0;
  }

  function nextStep() {
    if (!validateCurrentStep()) return;
    if (step < totalSteps) step++;
  }
  function prevStep() {
    fieldErrors = {};
    if (step > 1) step--;
    else { step = 0; selectedRole = ''; }
  }

  async function handleSubmit() {
    errorMsg = '';
    if (!validateCurrentStep()) return;
    submitting = true;
    try {
      let data;
      if (selectedRole === 'doctor') {
        data = {
          role: 'doctor',
          specialty: specialty || null,
          license_number: license_number || null,
          hospital: hospital || null,
          department: department || null,
          years_of_experience: years_of_experience ? parseInt(years_of_experience) : null,
          phone: doc_phone || null,
          bio: bio || null,
        };
      } else {
        data = {
          role: 'patient',
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
      }

      await profileApi.onboard(data);
      await refreshUser();
      toast.success('Profile Created', `Welcome to Sentinel, ${selectedRole === 'doctor' ? 'Doctor' : 'Patient'}!`);
      goto(selectedRole === 'doctor' ? '/doctor' : '/');
    } catch (err) {
      errorMsg = err.message;
    } finally {
      submitting = false;
    }
  }
</script>

<div class="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-sentinel-dark-bg relative overflow-hidden p-6">
  <!-- Background -->
  <div class="absolute inset-0 opacity-30 pointer-events-none"
       style="background-image: radial-gradient(circle at 2px 2px, rgba(100,116,139,0.08) 1px, transparent 0); background-size: 40px 40px;"></div>

  <div class="w-full max-w-lg relative z-10" in:fly={{ y: 20, duration: 800 }}>
    <!-- Header -->
    <div class="text-center mb-8 space-y-4">
      <div class="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-200 shadow-sm mb-2">
        <svg class="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          {#if selectedRole === 'doctor'}
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          {:else}
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" />
          {/if}
        </svg>
      </div>
      <h1 class="text-3xl font-bold tracking-tight text-slate-800 dark:text-white">
        {step === 0 ? 'Welcome to Sentinel' : selectedRole === 'doctor' ? 'Doctor Setup' : 'Patient Setup'}
      </h1>
      {#if step > 0}
        <div class="text-xs text-slate-400 dark:text-slate-500 dark:text-slate-400 dark:text-slate-500 font-medium">Step {step} of {totalSteps} — {stepLabels[step - 1]}</div>
      {:else}
        <div class="text-xs text-slate-400 dark:text-slate-500 dark:text-slate-400 dark:text-slate-500 font-medium">Choose your role to get started</div>
      {/if}
    </div>

    <!-- Progress Bar -->
    {#if step > 0}
      <div class="mb-6 flex gap-2">
        {#each Array(totalSteps) as _, i}
          <div class="flex-1 h-1.5 rounded-full transition-all duration-500 {i < step ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-slate-700'}"></div>
        {/each}
      </div>
    {/if}

    <!-- Card -->
    <div class="p-8 rounded-2xl bg-white dark:bg-sentinel-dark-surface-0 border border-slate-200 dark:border-slate-700 shadow-sm space-y-6">
      {#if errorMsg}
        <div class="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700" in:fade>
          <span class="font-bold">Error:</span> {errorMsg}
        </div>
      {/if}

      <!-- Step 0: Role Selection -->
      {#if step === 0}
        <div class="space-y-4" in:fly={{ x: 30, duration: 400 }}>
          <div class="text-sm font-bold text-slate-700 dark:text-slate-200 text-center mb-6">I am a...</div>
          
          <button
            on:click={() => selectRole('patient')}
            class="w-full p-6 rounded-2xl border-2 border-slate-200 dark:border-slate-700 hover:border-cyan-400 hover:bg-cyan-50/50 transition-all text-left group"
          >
            <div class="flex items-center gap-4">
              <div class="w-14 h-14 rounded-xl bg-cyan-50 border border-cyan-200 flex items-center justify-center group-hover:scale-110 transition-transform">
                <svg class="w-7 h-7 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div>
                <div class="text-base font-bold text-slate-800 dark:text-white">Patient</div>
                <div class="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Manage your health records, upload reports, and track conditions</div>
              </div>
            </div>
          </button>

          <button
            on:click={() => selectRole('doctor')}
            class="w-full p-6 rounded-2xl border-2 border-slate-200 dark:border-slate-700 hover:border-emerald-400 hover:bg-emerald-50/50 transition-all text-left group"
          >
            <div class="flex items-center gap-4">
              <div class="w-14 h-14 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center group-hover:scale-110 transition-transform">
                <svg class="w-7 h-7 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <div>
                <div class="text-base font-bold text-slate-800 dark:text-white">Doctor</div>
                <div class="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Access patient records, review diagnostics, and write clinical notes</div>
              </div>
            </div>
          </button>
        </div>
      {/if}

      <!-- PATIENT STEPS -->
      {#if selectedRole === 'patient'}
        {#if step === 1}
          <div class="space-y-4" in:fly={{ x: 30, duration: 400 }}>
            <div class="text-sm font-bold text-slate-700 dark:text-slate-200 border-b border-slate-100 dark:border-slate-700/50 pb-3">Basic Information</div>
            <div class="space-y-1.5">
              <label for="gender" class="text-[11px] text-slate-500 dark:text-slate-400 dark:text-slate-500 font-bold px-1">Gender</label>
              <select id="gender" bind:value={gender} class="w-full bg-white dark:bg-sentinel-dark-surface-0 border border-slate-200 dark:border-slate-700 rounded-xl px-4 h-11 text-xs text-slate-700 dark:text-slate-200 focus:outline-none focus:border-emerald-300 transition-all">
                <option value="">— Select —</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
                <option value="prefer_not_to_say">Prefer not to say</option>
              </select>
            </div>
            <div class="space-y-1.5">
              <label for="dob" class="text-[11px] text-slate-500 dark:text-slate-400 dark:text-slate-500 font-bold px-1">Date of Birth</label>
              <input id="dob" type="date" bind:value={date_of_birth} max={new Date().toISOString().split('T')[0]} class="w-full bg-white dark:bg-sentinel-dark-surface-1 border border-slate-200 dark:border-slate-600 rounded-xl px-4 h-11 text-xs text-slate-700 dark:text-slate-200 focus:outline-none focus:border-emerald-300 transition-all" />
              {#if fieldErrors.date_of_birth}<div class="text-[10px] text-red-500 px-1" in:fade>{fieldErrors.date_of_birth}</div>{/if}
            </div>
            <div class="space-y-1.5">
              <label for="blood" class="text-[11px] text-slate-500 dark:text-slate-400 dark:text-slate-500 font-bold px-1">Blood Type</label>
              <select id="blood" bind:value={blood_type} class="w-full bg-white dark:bg-sentinel-dark-surface-0 border border-slate-200 dark:border-slate-700 rounded-xl px-4 h-11 text-xs text-slate-700 dark:text-slate-200 focus:outline-none focus:border-emerald-300 transition-all">
                <option value="">— Unknown —</option>
                {#each ['A+','A-','B+','B-','AB+','AB-','O+','O-'] as bt}<option value={bt}>{bt}</option>{/each}
              </select>
            </div>
          </div>
        {:else if step === 2}
          <div class="space-y-4" in:fly={{ x: 30, duration: 400 }}>
            <div class="text-sm font-bold text-slate-700 dark:text-slate-200 border-b border-slate-100 dark:border-slate-700/50 pb-3">Physical Stats</div>
            <div class="space-y-1.5">
              <label for="height" class="text-[11px] text-slate-500 dark:text-slate-400 dark:text-slate-500 font-bold px-1">Height (cm)</label>
              <input id="height" type="number" step="0.1" min="30" max="300" bind:value={height_cm} class="w-full bg-white dark:bg-sentinel-dark-surface-1 border border-slate-200 dark:border-slate-600 rounded-xl px-4 h-11 text-xs text-slate-700 dark:text-slate-200 focus:outline-none focus:border-emerald-300 transition-all" placeholder="175.0" />
              {#if fieldErrors.height_cm}<div class="text-[10px] text-red-500 px-1" in:fade>{fieldErrors.height_cm}</div>{/if}
            </div>
            <div class="space-y-1.5">
              <label for="weight" class="text-[11px] text-slate-500 dark:text-slate-400 dark:text-slate-500 font-bold px-1">Weight (kg)</label>
              <input id="weight" type="number" step="0.1" min="1" max="500" bind:value={weight_kg} class="w-full bg-white dark:bg-sentinel-dark-surface-1 border border-slate-200 dark:border-slate-600 rounded-xl px-4 h-11 text-xs text-slate-700 dark:text-slate-200 focus:outline-none focus:border-emerald-300 transition-all" placeholder="72.0" />
              {#if fieldErrors.weight_kg}<div class="text-[10px] text-red-500 px-1" in:fade>{fieldErrors.weight_kg}</div>{/if}
            </div>
          </div>
        {:else if step === 3}
          <div class="space-y-4" in:fly={{ x: 30, duration: 400 }}>
            <div class="text-sm font-bold text-slate-700 dark:text-slate-200 border-b border-slate-100 dark:border-slate-700/50 pb-3">Contact Details</div>
            <div class="space-y-1.5">
              <label for="phone" class="text-[11px] text-slate-500 dark:text-slate-400 dark:text-slate-500 font-bold px-1">Phone</label>
              <input id="phone" type="tel" bind:value={phone} on:input={(e) => { phone = e.target.value.replace(/[^\d\+\-\s\(\)]/g, ''); }} class="w-full bg-white dark:bg-sentinel-dark-surface-1 border border-slate-200 dark:border-slate-600 rounded-xl px-4 h-11 text-xs text-slate-700 dark:text-slate-200 focus:outline-none focus:border-emerald-300 transition-all" placeholder="+91-9876543210" />
              {#if fieldErrors.phone}<div class="text-[10px] text-red-500 px-1" in:fade>{fieldErrors.phone}</div>{/if}
            </div>
            <div class="space-y-1.5">
              <label for="address" class="text-[11px] text-slate-500 dark:text-slate-400 dark:text-slate-500 font-bold px-1">Address</label>
              <input id="address" type="text" bind:value={address} class="w-full bg-white dark:bg-sentinel-dark-surface-0 border border-slate-200 dark:border-slate-700 rounded-xl px-4 h-11 text-xs focus:outline-none focus:border-emerald-300 transition-all" placeholder="City, State" />
            </div>
            <div class="text-[11px] text-slate-500 dark:text-slate-400 dark:text-slate-500 font-bold px-1 mt-2">Emergency Contact</div>
            <div class="grid grid-cols-2 gap-3">
              <input type="text" bind:value={emergency_contact_name} class="bg-white dark:bg-sentinel-dark-surface-0 border border-slate-200 dark:border-slate-700 rounded-xl px-4 h-10 text-[11px] focus:outline-none focus:border-emerald-300 transition-all" placeholder="Name" />
              <input type="tel" bind:value={emergency_contact_phone} on:input={(e) => { emergency_contact_phone = e.target.value.replace(/[^\d\+\-\s\(\)]/g, ''); }} class="bg-white dark:bg-sentinel-dark-surface-1 border border-slate-200 dark:border-slate-600 rounded-xl px-4 h-10 text-[11px] text-slate-700 dark:text-slate-200 focus:outline-none focus:border-emerald-300 transition-all" placeholder="Phone" />
            </div>
            {#if fieldErrors.emergency_contact_phone}<div class="text-[10px] text-red-500 px-1" in:fade>{fieldErrors.emergency_contact_phone}</div>{/if}
            <select bind:value={emergency_contact_relation} class="w-full bg-white dark:bg-sentinel-dark-surface-0 border border-slate-200 dark:border-slate-700 rounded-xl px-4 h-10 text-[11px] text-slate-700 dark:text-slate-200 focus:outline-none focus:border-emerald-300 transition-all">
              <option value="">— Relation —</option>
              {#each ['parent','spouse','sibling','child','friend','other'] as rel}<option value={rel}>{rel}</option>{/each}
            </select>
          </div>
        {:else if step === 4}
          <div class="space-y-4" in:fly={{ x: 30, duration: 400 }}>
            <div class="text-sm font-bold text-slate-700 dark:text-slate-200 border-b border-slate-100 dark:border-slate-700/50 pb-3">Medical History</div>
            <div class="space-y-1.5">
              <label class="text-[11px] text-slate-500 dark:text-slate-400 dark:text-slate-500 font-bold px-1">Known Allergies</label>
              <textarea bind:value={allergies} rows="2" class="w-full bg-white dark:bg-sentinel-dark-surface-0 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 text-xs focus:outline-none focus:border-emerald-300 transition-all resize-none" placeholder="e.g., Penicillin, Peanuts"></textarea>
            </div>
            <div class="space-y-1.5">
              <label class="text-[11px] text-slate-500 dark:text-slate-400 dark:text-slate-500 font-bold px-1">Chronic Conditions</label>
              <textarea bind:value={chronic_conditions} rows="2" class="w-full bg-white dark:bg-sentinel-dark-surface-0 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 text-xs focus:outline-none focus:border-emerald-300 transition-all resize-none" placeholder="e.g., Diabetes, Hypertension"></textarea>
            </div>
            <div class="space-y-1.5">
              <label class="text-[11px] text-slate-500 dark:text-slate-400 dark:text-slate-500 font-bold px-1">Current Medications</label>
              <textarea bind:value={current_medications} rows="2" class="w-full bg-white dark:bg-sentinel-dark-surface-0 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 text-xs focus:outline-none focus:border-emerald-300 transition-all resize-none" placeholder="e.g., Metformin 500mg"></textarea>
            </div>
            <div class="space-y-1.5">
              <label class="text-[11px] text-slate-500 dark:text-slate-400 dark:text-slate-500 font-bold px-1">Past Surgeries</label>
              <textarea bind:value={past_surgeries} rows="2" class="w-full bg-white dark:bg-sentinel-dark-surface-0 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 text-xs focus:outline-none focus:border-emerald-300 transition-all resize-none" placeholder="e.g., Appendectomy (2015)"></textarea>
            </div>
          </div>
        {/if}
      {/if}

      <!-- DOCTOR STEPS -->
      {#if selectedRole === 'doctor'}
        {#if step === 1}
          <div class="space-y-4" in:fly={{ x: 30, duration: 400 }}>
            <div class="text-sm font-bold text-slate-700 dark:text-slate-200 border-b border-slate-100 dark:border-slate-700/50 pb-3">Professional Information</div>
            <div class="space-y-1.5">
              <label class="text-[11px] text-slate-500 dark:text-slate-400 dark:text-slate-500 font-bold px-1">Specialty</label>
              <select bind:value={specialty} class="w-full bg-white dark:bg-sentinel-dark-surface-0 border border-slate-200 dark:border-slate-700 rounded-xl px-4 h-11 text-xs text-slate-700 dark:text-slate-200 focus:outline-none focus:border-emerald-300 transition-all">
                <option value="">— Select Specialty —</option>
                {#each ['General Medicine','Cardiology','Dermatology','Endocrinology','Gastroenterology','Nephrology','Neurology','Oncology','Orthopedics','Pediatrics','Psychiatry','Pulmonology','Radiology','Surgery','Urology','Other'] as spec}
                  <option value={spec}>{spec}</option>
                {/each}
              </select>
            </div>
            <div class="space-y-1.5">
              <label class="text-[11px] text-slate-500 dark:text-slate-400 dark:text-slate-500 font-bold px-1">Medical License Number</label>
              <input type="text" bind:value={license_number} class="w-full bg-white dark:bg-sentinel-dark-surface-0 border border-slate-200 dark:border-slate-700 rounded-xl px-4 h-11 text-xs focus:outline-none focus:border-emerald-300 transition-all" placeholder="e.g. MCI-12345" />
            </div>
            <div class="space-y-1.5">
              <label class="text-[11px] text-slate-500 dark:text-slate-400 dark:text-slate-500 font-bold px-1">Years of Experience</label>
              <input type="number" bind:value={years_of_experience} class="w-full bg-white dark:bg-sentinel-dark-surface-0 border border-slate-200 dark:border-slate-700 rounded-xl px-4 h-11 text-xs focus:outline-none focus:border-emerald-300 transition-all" placeholder="e.g. 12" />
            </div>
          </div>
        {:else if step === 2}
          <div class="space-y-4" in:fly={{ x: 30, duration: 400 }}>
            <div class="text-sm font-bold text-slate-700 dark:text-slate-200 border-b border-slate-100 dark:border-slate-700/50 pb-3">Workplace Details</div>
            <div class="space-y-1.5">
              <label class="text-[11px] text-slate-500 dark:text-slate-400 dark:text-slate-500 font-bold px-1">Hospital / Clinic</label>
              <input type="text" bind:value={hospital} class="w-full bg-white dark:bg-sentinel-dark-surface-0 border border-slate-200 dark:border-slate-700 rounded-xl px-4 h-11 text-xs focus:outline-none focus:border-emerald-300 transition-all" placeholder="e.g. AIIMS New Delhi" />
            </div>
            <div class="space-y-1.5">
              <label class="text-[11px] text-slate-500 dark:text-slate-400 dark:text-slate-500 font-bold px-1">Department</label>
              <input type="text" bind:value={department} class="w-full bg-white dark:bg-sentinel-dark-surface-0 border border-slate-200 dark:border-slate-700 rounded-xl px-4 h-11 text-xs focus:outline-none focus:border-emerald-300 transition-all" placeholder="e.g. Internal Medicine" />
            </div>
            <div class="space-y-1.5">
              <label class="text-[11px] text-slate-500 dark:text-slate-400 dark:text-slate-500 font-bold px-1">Contact Number</label>
              <input type="tel" bind:value={doc_phone} class="w-full bg-white dark:bg-sentinel-dark-surface-0 border border-slate-200 dark:border-slate-700 rounded-xl px-4 h-11 text-xs focus:outline-none focus:border-emerald-300 transition-all" placeholder="+91-9876543210" />
            </div>
          </div>
        {:else if step === 3}
          <div class="space-y-4" in:fly={{ x: 30, duration: 400 }}>
            <div class="text-sm font-bold text-slate-700 dark:text-slate-200 border-b border-slate-100 dark:border-slate-700/50 pb-3">Bio & Summary</div>
            <div class="space-y-1.5">
              <label class="text-[11px] text-slate-500 dark:text-slate-400 dark:text-slate-500 font-bold px-1">Professional Bio</label>
              <textarea bind:value={bio} rows="4"
                class="w-full bg-white dark:bg-sentinel-dark-surface-0 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 text-xs focus:outline-none focus:border-emerald-300 transition-all resize-none"
                placeholder="Brief professional summary..."
              ></textarea>
            </div>
          </div>
        {/if}
      {/if}

      <!-- Navigation -->
      {#if step > 0}
        <div class="flex gap-3 pt-4">
          <button
            on:click={prevStep}
            class="flex-1 py-3 text-xs font-bold border border-slate-200 dark:border-slate-700 rounded-xl text-slate-500 dark:text-slate-400 dark:text-slate-500 hover:bg-slate-50 dark:bg-sentinel-dark-surface-1 transition-all"
          >
            ← Back
          </button>
          {#if step < totalSteps}
            <button on:click={nextStep} class="flex-1 py-3 text-xs font-bold rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 transition-all">
              Continue →
            </button>
          {:else}
            <button
              on:click={handleSubmit}
              disabled={submitting}
              class="flex-1 py-3 text-xs font-bold rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-40 transition-all"
            >
              {submitting ? 'Saving...' : 'Complete Setup'}
            </button>
          {/if}
        </div>

        <div class="text-center pt-2">
          <button
            on:click={handleSubmit}
            class="text-[9px] text-slate-400 dark:text-slate-500 tracking-widest uppercase hover:text-emerald-600 transition-colors"
          >
            Skip for now →
          </button>
        </div>
      {/if}
    </div>

    <div class="mt-8 text-center text-[10px] text-slate-300 font-medium tracking-widest">
      Sentinel Health Network
    </div>
  </div>
</div>
