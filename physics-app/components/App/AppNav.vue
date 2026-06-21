<template>
  <header class="nav">
    <div class="nav-inner">
      <!-- Sidebar toggle — visible on all sizes except home page -->
      <button
        v-if="!isHome"
        class="sidebar-toggle"
        :aria-label="t('sidebar.toggleSidebar')"
        @click="toggle"
      >
        <svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <rect :fill="open ? 'var(--c-brand)' : 'var(--c-text-3)'" x="2" y="3" width="3.5" height="14" rx="1"
            style="transition: fill 0.2s" />
          <line x1="8.5" y1="6.5" x2="18" y2="6.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
          <line x1="8.5" y1="10" x2="18" y2="10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
          <line x1="8.5" y1="13.5" x2="18" y2="13.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
        </svg>
      </button>

      <NuxtLink to="/" class="logo">
        <span class="logo-icon">⚛</span>
        <span class="logo-text">Physics Companion</span>
      </NuxtLink>

      <nav class="links">
        <NuxtLink to="/chapters" class="nav-link">{{ t('nav.chapters') }}</NuxtLink>
      </nav>

      <!-- Dark / Light toggle -->
      <button
        class="color-toggle"
        :aria-label="isDark ? 'Switch to light mode' : 'Switch to dark mode'"
        @click="toggleColor"
      >
        <svg v-if="isDark" viewBox="0 0 24 24" fill="none" stroke="currentColor"
          stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <circle cx="12" cy="12" r="4"/>
          <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41
                   M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/>
        </svg>
        <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor"
          stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
        </svg>
      </button>
    </div>
  </header>
</template>

<script setup lang="ts">
const { open, toggle } = useSidebar()
const { t } = useAppI18n()
const colorMode = useColorMode()
const route = useRoute()

const isHome = computed(() => route.path === '/')
const isDark = computed(() => colorMode.value === 'dark')

function toggleColor() {
  colorMode.preference = isDark.value ? 'light' : 'dark'
}
</script>

<style scoped>
.nav {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  height: var(--nav-height);
  background: color-mix(in srgb, var(--c-bg) 88%, transparent);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid var(--c-divider);
}
.nav-inner {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 16px;
  height: 100%;
  display: flex;
  align-items: center;
  gap: 10px;
}

/* Sidebar toggle — always visible on non-home pages */
.sidebar-toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  border-radius: 7px;
  border: 1px solid var(--c-divider);
  background: var(--c-bg-soft);
  color: var(--c-text-2);
  cursor: pointer;
  flex-shrink: 0;
  transition: background 0.15s, border-color 0.15s;
}
.sidebar-toggle:hover {
  background: var(--c-bg-elv);
  border-color: var(--c-brand);
}
.sidebar-toggle svg { width: 17px; height: 17px; }

/* Logo */
.logo {
  display: flex;
  align-items: center;
  gap: 8px;
  text-decoration: none;
  flex-shrink: 0;
}
.logo-icon { font-size: 1.3rem; }
.logo-text {
  font-weight: 800;
  font-size: 0.95rem;
  color: var(--c-text-1);
  letter-spacing: -0.01em;
}
.logo:hover { text-decoration: none; }

/* Nav links */
.links {
  display: flex;
  gap: 16px;
  margin-left: auto;
}
.nav-link {
  font-size: 0.85rem;
  color: var(--c-text-2);
  text-decoration: none;
  font-weight: 500;
  transition: color 0.15s;
}
.nav-link:hover,
.nav-link.router-link-active { color: var(--c-brand); }

/* Dark / light mode toggle */
.color-toggle {
  width: 34px;
  height: 34px;
  border-radius: 8px;
  border: 1px solid var(--c-divider);
  background: var(--c-bg-soft);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--c-text-2);
  transition: background 0.15s, border-color 0.15s, color 0.15s;
  flex-shrink: 0;
}
.color-toggle:hover {
  background: var(--c-bg-elv);
  border-color: var(--c-brand);
  color: var(--c-brand);
}
.color-toggle svg { width: 16px; height: 16px; }

/* Hide logo text on very small screens to save space */
@media (max-width: 360px) {
  .logo-text { display: none; }
}
</style>
