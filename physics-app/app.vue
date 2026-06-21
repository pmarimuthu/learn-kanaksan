<template>
  <div class="app-root" :class="[colorMode.value, { 'sidebar-open': !isHome && open }]">
    <AppNav />
    <div class="app-layout">
      <AppSidebar v-if="!isHome" />
      <main class="app-main">
        <NuxtPage />
      </main>
    </div>
    <AppFooter />
  </div>
</template>

<script setup lang="ts">
const colorMode = useColorMode()
const { open } = useSidebar()
const route = useRoute()
const isHome = computed(() => route.path === '/')
</script>

<style>
/* ── Global resets & CSS variables ── */
*, *::before, *::after { box-sizing: border-box; }

:root {
  --c-bg: #ffffff;
  --c-bg-soft: #f6f8fa;
  --c-bg-elv: #eff1f4;
  --c-text-1: #1a1a2e;
  --c-text-2: #4a5568;
  --c-text-3: #9ca3af;
  --c-divider: #e5e7eb;
  --c-brand: #2f6fd0;
  --c-brand-light: #5a92e0;
  --nav-height: 56px;
  --sidebar-width: 260px;
}

.dark {
  --c-bg: #0d1117;
  --c-bg-soft: #161b22;
  --c-bg-elv: #21262d;
  --c-text-1: #e6edf3;
  --c-text-2: #8b949e;
  --c-text-3: #6e7681;
  --c-divider: #30363d;
  --c-brand: #5a92e0;
  --c-brand-light: #79aaed;
}

html, body {
  margin: 0;
  padding: 0;
  font-family: system-ui, -apple-system, sans-serif;
  background: var(--c-bg);
  color: var(--c-text-1);
  line-height: 1.6;
}

.app-root {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.app-layout {
  display: flex;
  flex: 1;
  padding-top: var(--nav-height);
}

.app-main {
  flex: 1;
  min-width: 0;
  transition: margin-left 0.25s ease;
}

/* Sidebar open: push main content on desktop */
@media (min-width: 960px) {
  .sidebar-open .app-main {
    margin-left: var(--sidebar-width);
  }
}

/* ── Prose / Content styles ── */
h1, h2, h3, h4 {
  color: var(--c-text-1);
  line-height: 1.2;
  letter-spacing: -0.02em;
  margin: 0;
}

a { color: var(--c-brand); text-decoration: none; }
a:hover { text-decoration: underline; }

p { margin: 0 0 1em; }

code {
  font-family: 'JetBrains Mono', 'Fira Code', monospace;
  font-size: 0.875em;
  background: var(--c-bg-soft);
  padding: 2px 6px;
  border-radius: 4px;
  border: 1px solid var(--c-divider);
}
</style>
