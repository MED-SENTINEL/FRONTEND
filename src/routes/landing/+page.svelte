<script>
  import { goto } from '$app/navigation';
  import { isAuthenticated } from '$lib/stores/auth';
  import { onMount } from 'svelte';

  // If already logged in, skip landing
  onMount(() => {
    if ($isAuthenticated) goto('/');
  });

  let mobileMenuOpen = false;
</script>

<svelte:head>
  <title>SENTINEL | Your Health. Mapped in 3D.</title>
  <meta name="description" content="SENTINEL creates a real-time Bio-Digital Twin of your body — track injuries, analyze lab reports with AI, and share securely with your doctor." />
  <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
</svelte:head>

<!-- TopNavBar -->
<nav class="fixed top-0 w-full z-50 bg-white/70 backdrop-blur-md font-sans antialiased font-medium text-sm shadow-sm">
  <div class="flex justify-between items-center w-full px-6 md:px-12 h-20 max-w-screen-2xl mx-auto">
    <div class="flex items-center gap-2">
      <div class="w-8 h-8 bg-cyan-500 rounded flex items-center justify-center">
        <span class="material-symbols-outlined text-white text-xl" style="font-variation-settings: 'FILL' 1;">shield_with_heart</span>
      </div>
      <span class="text-2xl font-extrabold tracking-tighter text-cyan-800 uppercase">SENTINEL</span>
    </div>
    <div class="hidden md:flex items-center gap-8">
      <a class="text-cyan-700 font-bold border-b-2 border-cyan-500 pb-1 hover:text-cyan-500 transition-all duration-300" href="#features">Features</a>
      <a class="text-slate-600 hover:text-cyan-500 transition-all duration-300" href="#how-it-works">How It Works</a>
      <a class="text-slate-600 hover:text-cyan-500 transition-all duration-300" href="#trust">About</a>
      <a class="text-slate-600 hover:text-cyan-500 transition-all duration-300" href="#cta">Pricing</a>
    </div>
    <div class="flex items-center gap-4">
      <button on:click={() => goto('/login')} class="text-slate-600 hover:text-cyan-600 font-semibold px-4 py-2 transition-all active:scale-95">Sign In</button>
      <button on:click={() => goto('/register')} class="bg-cyan-500 text-white px-6 py-2.5 rounded-full font-bold hover:brightness-110 shadow-lg shadow-cyan-500/20 active:scale-95 transition-all">Get Started</button>
    </div>
    <!-- Mobile menu button -->
    <button class="md:hidden text-slate-600" on:click={() => mobileMenuOpen = !mobileMenuOpen}>
      <span class="material-symbols-outlined text-2xl">{mobileMenuOpen ? 'close' : 'menu'}</span>
    </button>
  </div>
  {#if mobileMenuOpen}
    <div class="md:hidden bg-white border-t border-slate-100 px-6 py-4 space-y-3">
      <a class="block text-slate-600 hover:text-cyan-500 font-medium" href="#features">Features</a>
      <a class="block text-slate-600 hover:text-cyan-500 font-medium" href="#how-it-works">How It Works</a>
      <a class="block text-slate-600 hover:text-cyan-500 font-medium" href="#trust">About</a>
      <button on:click={() => goto('/login')} class="block text-slate-600 font-semibold">Sign In</button>
      <button on:click={() => goto('/register')} class="block w-full bg-cyan-500 text-white py-2.5 rounded-full font-bold">Get Started</button>
    </div>
  {/if}
</nav>

<!-- Hero Section -->
<section class="pt-32 pb-20 md:pt-48 md:pb-40 bg-[#0f172a] overflow-hidden relative">
  <div class="absolute top-0 right-0 w-1/2 h-full bg-cyan-500/10 blur-[120px] rounded-full -mr-24 -mt-24 pointer-events-none"></div>
  <div class="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
    <div class="z-10">
      <span class="inline-block px-4 py-1.5 rounded-full bg-cyan-900/40 border border-cyan-700/30 text-cyan-300 text-xs font-bold tracking-widest uppercase mb-6">Introducing the Medical Vault</span>
      <h1 class="text-5xl md:text-7xl font-extrabold text-white leading-tight mb-6 tracking-tight">
        Your Health. <br />
        <span class="text-cyan-400 cyan-glow">Mapped in 3D.</span>
      </h1>
      <p class="text-slate-400 text-lg md:text-xl leading-relaxed mb-10 max-w-xl">
        Experience the future of precision medicine. Sentinel creates an interactive real-time Bio-Digital Twin, analyzing your lab reports with AI to provide actionable health insights.
      </p>
      <div class="flex flex-wrap gap-4">
        <button on:click={() => goto('/register')} class="bg-cyan-500 text-white px-8 py-4 rounded-xl font-bold text-lg hover:brightness-110 shadow-xl shadow-cyan-500/20 active:scale-95 transition-all">Start Free</button>
        <button on:click={() => goto('/login')} class="border-2 border-slate-700 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-slate-800 active:scale-95 transition-all flex items-center gap-2">
          <span class="material-symbols-outlined">login</span> Sign In
        </button>
      </div>
      <div class="mt-16 flex flex-wrap gap-6">
        <div class="flex items-center gap-3">
          <span class="material-symbols-outlined text-cyan-400">psychology</span>
          <span class="text-slate-300 text-sm font-medium tracking-wide">AI-Powered Analysis</span>
        </div>
        <div class="flex items-center gap-3">
          <span class="material-symbols-outlined text-cyan-400">lock</span>
          <span class="text-slate-300 text-sm font-medium tracking-wide">256-bit Encryption</span>
        </div>
        <div class="flex items-center gap-3">
          <span class="material-symbols-outlined text-cyan-400">verified_user</span>
          <span class="text-slate-300 text-sm font-medium tracking-wide">HIPAA Ready</span>
        </div>
      </div>
    </div>
    <div class="relative lg:h-[600px] flex items-center justify-center">
      <div class="relative w-full aspect-square max-w-[500px]">
        <div class="absolute inset-0 bg-gradient-to-tr from-cyan-500/20 to-transparent rounded-full animate-pulse blur-3xl"></div>
        <img class="w-full h-full object-contain relative z-10 mix-blend-lighten" alt="Futuristic 3D wireframe render of a human torso with glowing cyan data points" src="https://lh3.googleusercontent.com/aida-public/AB6AXuB2XIhyOvI4qSg9NrdM9IcvI-fG55N8erI3lImacqf26Wxy5Y8BZcqfYY0rAWEU5b3VCpw11SUYQ-nLoTTawoU_HZDLh4ae6_VF9gm8HpGe_d3FOt_NacPmUNYUzwX5GmMWVhEAy1Cfd0e44xgE2odxzeuUXjiHZWQA0tq5zsUKUes92B4ElwFZaEKNxJwQeFhT9vZJd-keUs2frgRZKP64-A5ZQqfWQ5FvOReLs3e7WNdESHgbdUx8EKv8nBl2pkuz9_dip4lrMvc" />
        <!-- HUD Elements -->
        <div class="absolute top-10 left-0 bg-slate-900/80 backdrop-blur-md border border-slate-700 p-4 rounded-lg z-20 shadow-2xl">
          <p class="text-[10px] text-cyan-400 font-bold uppercase mb-1">Heart Rhythm</p>
          <div class="flex items-end gap-1 h-8">
            <div class="w-1 bg-cyan-400 h-1/2"></div>
            <div class="w-1 bg-cyan-400 h-2/3"></div>
            <div class="w-1 bg-cyan-400 h-full"></div>
            <div class="w-1 bg-cyan-400 h-3/4"></div>
            <div class="w-1 bg-cyan-400 h-1/2"></div>
          </div>
        </div>
        <div class="absolute bottom-20 right-0 bg-slate-900/80 backdrop-blur-md border border-slate-700 p-4 rounded-lg z-20 shadow-2xl">
          <p class="text-[10px] text-cyan-400 font-bold uppercase mb-1">Neurological Sync</p>
          <div class="text-white font-mono text-xl">98.4%</div>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- Features Section -->
<section id="features" class="py-24 bg-white">
  <div class="max-w-7xl mx-auto px-6">
    <div class="text-center mb-20">
      <h2 class="text-xs font-extrabold tracking-[0.2em] text-cyan-700 uppercase mb-4">The Platform</h2>
      <h3 class="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">Why Choose SENTINEL?</h3>
    </div>
    <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
      <!-- Feature 1 -->
      <div class="group p-8 rounded-2xl bg-white hover:bg-slate-50 transition-all duration-500 border border-transparent hover:border-slate-200/50">
        <div class="w-14 h-14 bg-cyan-50 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
          <span class="material-symbols-outlined text-cyan-700 text-3xl">accessibility_new</span>
        </div>
        <h4 class="text-xl font-bold mb-4 text-slate-900">3D Trauma Mapping</h4>
        <p class="text-slate-500 leading-relaxed mb-6">
          Real-time visualization of internal injuries and chronic conditions with sub-millimeter precision across every organ system.
        </p>
        <div class="h-1 w-12 bg-cyan-500 rounded-full group-hover:w-24 transition-all"></div>
      </div>
      <!-- Feature 2 -->
      <div class="group p-8 rounded-2xl bg-white hover:bg-slate-50 transition-all duration-500 border border-transparent hover:border-slate-200/50">
        <div class="w-14 h-14 bg-cyan-50 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
          <span class="material-symbols-outlined text-cyan-700 text-3xl">biotech</span>
        </div>
        <h4 class="text-xl font-bold mb-4 text-slate-900">AI Lab Analysis</h4>
        <p class="text-slate-500 leading-relaxed mb-6">
          Our specialized LISA engine (Laboratory Intelligence &amp; Semantic Analysis) identifies markers 4 months before traditional panels.
        </p>
        <div class="h-1 w-12 bg-cyan-500 rounded-full group-hover:w-24 transition-all"></div>
      </div>
      <!-- Feature 3 -->
      <div class="group p-8 rounded-2xl bg-white hover:bg-slate-50 transition-all duration-500 border border-transparent hover:border-slate-200/50">
        <div class="w-14 h-14 bg-cyan-50 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
          <span class="material-symbols-outlined text-cyan-700 text-3xl">share_reviews</span>
        </div>
        <h4 class="text-xl font-bold mb-4 text-slate-900">Secure Sharing</h4>
        <p class="text-slate-500 leading-relaxed mb-6">
          Securely share your health records and 3D mapping with doctors through robust JWT-based authentication and secure APIs.
        </p>
        <div class="h-1 w-12 bg-cyan-500 rounded-full group-hover:w-24 transition-all"></div>
      </div>
    </div>
  </div>
</section>

<!-- How It Works Section -->
<section id="how-it-works" class="py-24 bg-slate-50 relative">
  <div class="max-w-7xl mx-auto px-6">
    <div class="text-center mb-20">
      <h2 class="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">How It Works</h2>
    </div>
    <div class="relative">
      <!-- Connecting Line (Desktop) -->
      <div class="hidden md:block absolute top-1/2 left-10 right-10 h-0.5 bg-slate-200 -translate-y-1/2 -z-0"></div>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-12 relative z-10">
        <!-- Step 1 -->
        <div class="text-center">
          <div class="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-8 shadow-xl shadow-slate-200 border-4 border-slate-50">
            <span class="text-2xl font-black text-cyan-700">01</span>
          </div>
          <h4 class="text-xl font-bold mb-3 text-slate-900">Create Your Account</h4>
          <p class="text-slate-500 max-w-[250px] mx-auto">Verify your identity and link your existing biometric devices in minutes.</p>
        </div>
        <!-- Step 2 -->
        <div class="text-center">
          <div class="w-20 h-20 bg-cyan-500 rounded-full flex items-center justify-center mx-auto mb-8 shadow-xl shadow-cyan-500/30 border-4 border-slate-50">
            <span class="text-2xl font-black text-white">02</span>
          </div>
          <h4 class="text-xl font-bold mb-3 text-slate-900">Build Your Twin</h4>
          <p class="text-slate-500 max-w-[250px] mx-auto">Our sensors capture a high-resolution snapshot of your unique molecular profile.</p>
        </div>
        <!-- Step 3 -->
        <div class="text-center">
          <div class="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-8 shadow-xl shadow-slate-200 border-4 border-slate-50">
            <span class="text-2xl font-black text-cyan-700">03</span>
          </div>
          <h4 class="text-xl font-bold mb-3 text-slate-900">Get AI Insights</h4>
          <p class="text-slate-500 max-w-[250px] mx-auto">Access real-time reports and predictive warnings through your personal dashboard.</p>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- Trust Section -->
<section id="trust" class="py-24 bg-white">
  <div class="max-w-7xl mx-auto px-6">
    <p class="text-center text-sm font-bold tracking-widest text-slate-500 uppercase mb-12">Powered By Modern Web Technologies</p>
    <div class="flex flex-wrap justify-center items-center gap-12 md:gap-24 opacity-50 grayscale hover:grayscale-0 transition-all mb-24">
      <span class="text-2xl font-bold text-slate-900">SVELTEKIT</span>
      <span class="text-2xl font-bold text-slate-900">THRELTE</span>
      <span class="text-2xl font-bold text-slate-900">FASTAPI</span>
      <span class="text-2xl font-bold text-slate-900">PYTHON</span>
      <span class="text-2xl font-bold text-slate-900">TAILWIND</span>
    </div>
    <!-- Testimonial -->
    <div class="max-w-4xl mx-auto">
      <div class="bg-white p-12 rounded-3xl relative overflow-hidden shadow-sm border border-slate-100">
        <div class="absolute top-0 right-0 w-32 h-32 bg-cyan-50 rounded-full -mr-16 -mt-16"></div>
        <span class="material-symbols-outlined text-cyan-400 text-6xl opacity-20 absolute top-8 left-8">api</span>
        <div class="relative z-10">
          <p class="text-2xl md:text-3xl font-medium text-slate-900 leading-snug mb-8">
            "SENTINEL bridges the gap between complex medical data and human understanding. By combining real-time 3D rendering with AI-driven insights, we provide an intuitive platform for both doctors and patients."
          </p>
          <div class="flex items-center gap-4">
            <div class="w-14 h-14 rounded-full bg-cyan-100 flex items-center justify-center border-2 border-cyan-400">
              <span class="material-symbols-outlined text-cyan-700">code</span>
            </div>
            <div>
              <p class="font-bold text-slate-900">SENTINEL Engineering</p>
              <p class="text-slate-500 text-sm">Building the Bio-Twin Platform</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- CTA Section -->
<section id="cta" class="py-24">
  <div class="max-w-7xl mx-auto px-6">
    <div class="bg-[#0f172a] rounded-[2rem] overflow-hidden relative p-12 md:p-24 text-center">
      <div class="absolute inset-0 bg-gradient-to-br from-cyan-500/20 via-transparent to-cyan-900/10 pointer-events-none"></div>
      <div class="relative z-10">
        <h2 class="text-4xl md:text-6xl font-black text-white mb-8 tracking-tight">Ready to Explore <br />Your Bio-Twin?</h2>
        <p class="text-slate-400 text-lg mb-12 max-w-2xl mx-auto">Experience the next generation of patient-doctor interaction with our comprehensive health tracking and 3D visualization platform.</p>
        <button on:click={() => goto('/register')} class="bg-cyan-500 text-white px-12 py-5 rounded-xl font-black text-xl hover:scale-105 transition-transform shadow-2xl shadow-cyan-500/40">Enter the Vault</button>
        <p class="mt-8 text-slate-500 text-sm">Create a free patient or doctor account.</p>
      </div>
    </div>
  </div>
</section>

<!-- Footer -->
<footer class="bg-slate-50 border-t border-slate-200">
  <div class="max-w-7xl mx-auto px-8 py-20">
    <div class="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
      <div>
        <div class="flex items-center gap-2 mb-6">
          <div class="w-6 h-6 bg-cyan-500 rounded flex items-center justify-center">
            <span class="material-symbols-outlined text-white text-sm" style="font-variation-settings: 'FILL' 1;">shield_with_heart</span>
          </div>
          <span class="text-lg font-black text-slate-900 uppercase">SENTINEL</span>
        </div>
        <p class="text-slate-500 text-sm leading-relaxed">
          Leading the transition to proactive, precision-based medicine through clinical-grade bio-digital twins.
        </p>
      </div>
      <div>
        <h5 class="font-bold text-slate-900 mb-6 text-sm uppercase tracking-wider">Product</h5>
        <ul class="space-y-4">
          <li><a class="text-slate-500 text-sm hover:text-cyan-600 transition-colors" href="#features">3D Mapping</a></li>
          <li><a class="text-slate-500 text-sm hover:text-cyan-600 transition-colors" href="#features">AI Analysis</a></li>
          <li><a class="text-slate-500 text-sm hover:text-cyan-600 transition-colors" href="#features">Health Wallet</a></li>
          <li><a class="text-slate-500 text-sm hover:text-cyan-600 transition-colors" href="#features">Enterprise API</a></li>
        </ul>
      </div>
      <div>
        <h5 class="font-bold text-slate-900 mb-6 text-sm uppercase tracking-wider">Company</h5>
        <ul class="space-y-4">
          <li><a class="text-slate-500 text-sm hover:text-cyan-600 transition-colors" href="#trust">About Us</a></li>
          <li><a class="text-slate-500 text-sm hover:text-cyan-600 transition-colors" href="#trust">Research Labs</a></li>
          <li><a class="text-slate-500 text-sm hover:text-cyan-600 transition-colors" href="#">Careers</a></li>
          <li><a class="text-slate-500 text-sm hover:text-cyan-600 transition-colors" href="#">Press Kit</a></li>
        </ul>
      </div>
      <div>
        <h5 class="font-bold text-slate-900 mb-6 text-sm uppercase tracking-wider">Resources</h5>
        <ul class="space-y-4">
          <li><a class="text-slate-500 text-sm hover:text-cyan-600 transition-colors" href="#">Clinical Studies</a></li>
          <li><a class="text-slate-500 text-sm hover:text-cyan-600 transition-colors" href="#">Privacy Protocol</a></li>
          <li><a class="text-slate-500 text-sm hover:text-cyan-600 transition-colors" href="#">Security Docs</a></li>
          <li><a class="text-slate-500 text-sm hover:text-cyan-600 transition-colors" href="#">Support Portal</a></li>
        </ul>
      </div>
    </div>
    <div class="bg-slate-200 h-px w-full mb-8"></div>
    <div class="flex flex-col md:flex-row justify-between items-center gap-6">
      <p class="text-xs tracking-wide uppercase text-slate-500">
        © 2026 SENTINEL Health-Tech. Precision Engineering for Clinical Excellence.
      </p>
      <div class="flex gap-6">
        <a class="text-xs font-bold text-slate-500 uppercase tracking-widest hover:text-cyan-700 transition-colors" href="#">Terms of Service</a>
        <a class="text-xs font-bold text-slate-500 uppercase tracking-widest hover:text-cyan-700 transition-colors" href="#">Privacy Policy</a>
        <a class="text-xs font-bold text-slate-500 uppercase tracking-widest hover:text-cyan-700 transition-colors" href="#">Global Ethics</a>
      </div>
    </div>
  </div>
</footer>

<style>
  .cyan-glow {
    text-shadow: 0 0 15px rgba(6, 182, 212, 0.5);
  }
  .material-symbols-outlined {
    font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
  }
</style>
