<template>
  <div class="chero" :class="`chero--${theme}`">
    <div class="chero-head">
      <span class="chero-icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
      </span>
      <span class="chero-label">Visualization</span>
    </div>
    <div class="chero-tabs" v-if="tabs">
      <button
        v-for="(tab, i) in tabs"
        :key="i"
        class="chero-tab"
        :class="{ 'chero-tab--active': i === activeTab }"
        @click="activeTab = i"
      >{{ tab.label }}</button>
    </div>
    <svg class="chero-svg" viewBox="0 0 420 160" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <marker id="ch-arrow" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto">
          <path d="M0,0 L7,3.5 L0,7 Z" fill="var(--ch-c)"/>
        </marker>
        <marker id="ch-arrow-y" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto">
          <path d="M0,0 L7,3.5 L0,7 Z" fill="#f59e0b"/>
        </marker>
        <marker id="ch-arrow-g" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto">
          <path d="M0,0 L7,3.5 L0,7 Z" fill="#10b981"/>
        </marker>
      </defs>

      <!-- ══ moving-block ══ -->
      <g v-if="scene === 'moving-block'">
        <line x1="50" y1="112" x2="380" y2="112" stroke="var(--ch-c)" stroke-width="2" opacity="0.3"/>
        <line v-for="n in 7" :key="n" :x1="50+n*47" y1="112" :x2="50+n*47" y2="120"
          stroke="var(--ch-c)" stroke-width="1" opacity="0.2"/>
        <g class="block-slide">
          <rect x="0" y="84" width="44" height="28" rx="5" fill="var(--ch-c)" opacity="0.85"/>
          <line x1="44" y1="98" x2="72" y2="98" stroke="var(--ch-c)" stroke-width="2.5" marker-end="url(#ch-arrow)"/>
          <text x="76" y="102" font-size="12" fill="var(--ch-c)" font-weight="700" opacity="0.9">v</text>
        </g>
      </g>

      <!-- ══ vectors ══ -->
      <g v-else-if="scene === 'vectors'">
        <line x1="80" y1="110" x2="195" y2="58" stroke="var(--ch-c)" stroke-width="2.5" marker-end="url(#ch-arrow)"/>
        <text x="126" y="77" font-size="13" fill="var(--ch-c)" font-weight="700">A</text>
        <line x1="195" y1="58" x2="330" y2="110" stroke="#f59e0b" stroke-width="2.5" marker-end="url(#ch-arrow-y)"/>
        <text x="268" y="77" font-size="13" fill="#f59e0b" font-weight="700">B</text>
        <line x1="80" y1="110" x2="330" y2="110" stroke="#10b981" stroke-width="2.5" stroke-dasharray="7 4" marker-end="url(#ch-arrow-g)"/>
        <text x="200" y="130" font-size="12" fill="#10b981" font-weight="700" text-anchor="middle">A + B</text>
      </g>

      <!-- ══ projectile ══ -->
      <g v-else-if="scene === 'projectile'">
        <line x1="60" y1="130" x2="380" y2="130" stroke="var(--ch-c)" stroke-width="2" opacity="0.3"/>
        <path d="M80,130 Q215,18 355,130" fill="none" stroke="var(--ch-c)" stroke-width="1.5" stroke-dasharray="6 4" opacity="0.45"/>
        <line x1="80" y1="130" x2="110" y2="96" stroke="var(--ch-c)" stroke-width="2" marker-end="url(#ch-arrow)" opacity="0.8"/>
        <circle class="proj-ball" cx="0" cy="0" r="9" fill="var(--ch-c)" opacity="0.9">
          <animateMotion dur="2.8s" repeatCount="indefinite" calcMode="spline"
            keySplines="0.42 0 0.58 1"
            path="M80,130 Q215,18 355,130"/>
        </circle>
        <line x1="80" y1="142" x2="355" y2="142" stroke="var(--ch-c)" stroke-width="1" opacity="0.3"/>
        <text x="218" y="155" font-size="11" fill="var(--ch-c)" text-anchor="middle" opacity="0.7">Range R</text>
      </g>

      <!-- ══ circular / orbit ══ -->
      <g v-else-if="scene === 'circular'">
        <ellipse id="ch-orbit" cx="210" cy="88" rx="125" ry="60" fill="none" stroke="var(--ch-c)" stroke-width="1.5" opacity="0.35"/>
        <circle cx="210" cy="88" r="14" fill="var(--ch-c)" opacity="0.55"/>
        <text x="210" y="93" text-anchor="middle" font-size="10" fill="white" font-weight="700">M</text>
        <circle r="10" fill="var(--ch-c)" opacity="0.9">
          <animateMotion dur="4s" repeatCount="indefinite">
            <mpath href="#ch-orbit"/>
          </animateMotion>
        </circle>
        <line x1="210" y1="88" x2="335" y2="88" stroke="var(--ch-c)" stroke-width="1.5" stroke-dasharray="4 3" opacity="0.35"/>
        <text x="272" y="82" font-size="11" fill="var(--ch-c)" opacity="0.6" text-anchor="middle" font-style="italic">r</text>
      </g>

      <!-- ══ pendulum ══ -->
      <g v-else-if="scene === 'pendulum'">
        <line x1="70" y1="28" x2="360" y2="28" stroke="var(--ch-c)" stroke-width="3" opacity="0.2" stroke-linecap="round"/>
        <circle cx="210" cy="28" r="5" fill="var(--ch-c)" opacity="0.4"/>
        <path d="M160,105 Q210,148 260,105" fill="none" stroke="var(--ch-c)" stroke-width="1" stroke-dasharray="4 3" opacity="0.25"/>
        <g>
          <animateTransform attributeName="transform" type="rotate"
            values="-26 210 28; 26 210 28; -26 210 28"
            dur="2.2s" calcMode="spline"
            keySplines="0.45 0.05 0.55 0.95; 0.45 0.05 0.55 0.95"
            repeatCount="indefinite"/>
          <line x1="210" y1="28" x2="210" y2="128" stroke="var(--ch-c)" stroke-width="2" opacity="0.7"/>
          <circle cx="210" cy="128" r="16" fill="var(--ch-c)" opacity="0.85"/>
        </g>
        <text x="210" y="155" font-size="11" fill="var(--ch-c)" text-anchor="middle" opacity="0.6">T = 2π√(l/g)</text>
      </g>

      <!-- ══ spring ══ -->
      <g v-else-if="scene === 'spring'">
        <rect x="40" y="58" width="12" height="72" rx="3" fill="var(--ch-c)" opacity="0.3"/>
        <line x1="40" y1="25" x2="40" y2="145" stroke="var(--ch-c)" stroke-width="2" opacity="0.15"/>
        <g class="spring-oscillate">
          <path d="M52,94 L72,68 L92,120 L112,68 L132,120 L152,68 L172,120 L192,94"
            fill="none" stroke="var(--ch-c)" stroke-width="2.5" opacity="0.8" stroke-linecap="round" stroke-linejoin="round"/>
          <rect x="192" y="74" width="52" height="40" rx="6" fill="var(--ch-c)" opacity="0.85"/>
          <text x="218" y="99" text-anchor="middle" font-size="11" fill="white" font-weight="700">m</text>
        </g>
        <text x="220" y="148" font-size="11" fill="var(--ch-c)" text-anchor="middle" opacity="0.6">F = −kx</text>
      </g>

      <!-- ══ particles (kinetic theory) ══ -->
      <g v-else-if="scene === 'particles'">
        <rect x="60" y="28" width="300" height="108" rx="8" fill="none" stroke="var(--ch-c)" stroke-width="1.5" opacity="0.3"/>
        <circle class="pt1" cx="105" cy="70"  r="7" fill="var(--ch-c)" opacity="0.75"/>
        <circle class="pt2" cx="185" cy="118" r="7" fill="var(--ch-c)" opacity="0.75"/>
        <circle class="pt3" cx="265" cy="50"  r="7" fill="var(--ch-c)" opacity="0.75"/>
        <circle class="pt4" cx="320" cy="100" r="7" fill="var(--ch-c)" opacity="0.75"/>
        <circle class="pt5" cx="140" cy="88"  r="7" fill="var(--ch-c)" opacity="0.75"/>
        <circle class="pt6" cx="230" cy="66"  r="7" fill="var(--ch-c)" opacity="0.75"/>
        <text x="210" y="155" font-size="11" fill="var(--ch-c)" text-anchor="middle" opacity="0.6">KE ∝ Temperature</text>
      </g>

      <!-- ══ thermal ══ -->
      <g v-else-if="scene === 'thermal'">
        <rect x="52" y="48" width="68" height="82" rx="6" fill="#ef4444" opacity="0.55"/>
        <text x="86" y="88"  text-anchor="middle" font-size="22" fill="white">🔥</text>
        <text x="86" y="112" text-anchor="middle" font-size="10" fill="white" font-weight="700" opacity="0.9">T₁</text>
        <rect x="300" y="48" width="68" height="82" rx="6" fill="#3b82f6" opacity="0.55"/>
        <text x="334" y="85"  text-anchor="middle" font-size="22" fill="white">❄</text>
        <text x="334" y="112" text-anchor="middle" font-size="10" fill="white" font-weight="700" opacity="0.9">T₂</text>
        <g class="heat-arrows">
          <line x1="128" y1="78"  x2="292" y2="78"  stroke="#f59e0b" stroke-width="2" marker-end="url(#ch-arrow-y)" opacity="0.9"/>
          <line x1="128" y1="94"  x2="292" y2="94"  stroke="#f59e0b" stroke-width="2" marker-end="url(#ch-arrow-y)" opacity="0.65"/>
          <line x1="128" y1="110" x2="292" y2="110" stroke="#f59e0b" stroke-width="2" marker-end="url(#ch-arrow-y)" opacity="0.45"/>
        </g>
        <text x="210" y="148" text-anchor="middle" font-size="11" fill="var(--ch-c)" opacity="0.7">Heat Q</text>
      </g>

      <!-- ══ gravity ══ -->
      <g v-else-if="scene === 'gravity'">
        <line v-for="(a, i) in [0,45,90,135,180,225,270,315]" :key="i"
          :x1="210 + 24 * Math.cos(a * Math.PI/180)"
          :y1="88  + 24 * Math.sin(a * Math.PI/180)"
          :x2="210 + 85 * Math.cos(a * Math.PI/180)"
          :y2="88  + 85 * Math.sin(a * Math.PI/180)"
          stroke="var(--ch-c)" stroke-width="1.5" opacity="0.3" marker-end="url(#ch-arrow)"/>
        <circle cx="210" cy="88" r="22" fill="var(--ch-c)" opacity="0.7"/>
        <text x="210" y="93" text-anchor="middle" font-size="12" fill="white" font-weight="700">M</text>
        <circle class="grav-test" cx="330" cy="88" r="9" fill="var(--ch-c)" opacity="0.85"/>
        <text x="330" y="92" text-anchor="middle" font-size="9" fill="white" font-weight="700">m</text>
        <text x="210" y="148" text-anchor="middle" font-size="11" fill="var(--ch-c)" opacity="0.6">F = GM m / r²</text>
      </g>

      <!-- ══ units (SI) ══ -->
      <g v-else-if="scene === 'units'">
        <text x="54"  y="80"  font-size="20" font-weight="700" fill="var(--ch-c)" class="u1">m</text>
        <text x="108" y="58"  font-size="20" font-weight="700" fill="var(--ch-c)" class="u2">kg</text>
        <text x="174" y="92"  font-size="20" font-weight="700" fill="var(--ch-c)" class="u3">s</text>
        <text x="220" y="54"  font-size="20" font-weight="700" fill="var(--ch-c)" class="u4">A</text>
        <text x="264" y="90"  font-size="20" font-weight="700" fill="var(--ch-c)" class="u5">K</text>
        <text x="305" y="60"  font-size="18" font-weight="700" fill="var(--ch-c)" class="u6">mol</text>
        <text x="358" y="88"  font-size="16" font-weight="700" fill="var(--ch-c)" class="u7">cd</text>
        <text x="210" y="130" font-size="11" fill="var(--ch-c)" text-anchor="middle" opacity="0.55">7 SI Base Units</text>
      </g>

      <!-- ══ sprint (Physical Quantities & SI Units) ══ -->
      <g v-else-if="scene === 'sprint'">
        <!-- ── Left: Sprint Track ── -->
        <rect x="14" y="14" width="182" height="134" rx="7" fill="var(--ch-c)" opacity="0.05"/>
        <rect x="14" y="14" width="182" height="22"  rx="7" fill="var(--ch-c)" opacity="0.14"/>
        <text x="105" y="29" font-size="10" font-weight="700" fill="var(--ch-c)" text-anchor="middle" letter-spacing="1.5">100 m  SPRINT</text>
        <!-- lane lines -->
        <line x1="14" y1="40"  x2="196" y2="40"  stroke="var(--ch-c)" stroke-width="1.2" opacity="0.18"/>
        <line x1="14" y1="58"  x2="196" y2="58"  stroke="var(--ch-c)" stroke-width="0.8" opacity="0.13"/>
        <line x1="14" y1="76"  x2="196" y2="76"  stroke="var(--ch-c)" stroke-width="0.8" opacity="0.13"/>
        <line x1="14" y1="94"  x2="196" y2="94"  stroke="var(--ch-c)" stroke-width="0.8" opacity="0.13"/>
        <line x1="14" y1="112" x2="196" y2="112" stroke="var(--ch-c)" stroke-width="1.2" opacity="0.18"/>
        <!-- start / finish lines -->
        <line x1="26"  y1="40" x2="26"  y2="112" stroke="var(--ch-c)" stroke-width="2"   opacity="0.28"/>
        <line x1="188" y1="40" x2="188" y2="112" stroke="var(--ch-c)" stroke-width="3"   stroke-dasharray="6 5" opacity="0.52"/>
        <text x="26"  y="124" font-size="8" fill="var(--ch-c)" text-anchor="middle" opacity="0.42">START</text>
        <text x="188" y="124" font-size="8" fill="var(--ch-c)" text-anchor="middle" opacity="0.42">FINISH</text>
        <!-- measurement dimension line -->
        <line x1="26"  y1="138" x2="188" y2="138" stroke="var(--ch-c)" stroke-width="1" opacity="0.28"/>
        <line x1="26"  y1="133" x2="26"  y2="143" stroke="var(--ch-c)" stroke-width="1" opacity="0.28"/>
        <line x1="188" y1="133" x2="188" y2="143" stroke="var(--ch-c)" stroke-width="1" opacity="0.28"/>
        <text x="107" y="153" font-size="9" fill="var(--ch-c)" text-anchor="middle" opacity="0.65" font-weight="600">d = 100 m · t = 9.58 s · m = 94 kg</text>
        <!-- animated runner in lane 2 (center y = 67) -->
        <g class="runner-slide">
          <circle cx="0" cy="0" r="10" fill="var(--ch-c)" opacity="0.9"/>
          <line x1="-14" y1="-3" x2="-24" y2="-3" stroke="var(--ch-c)" stroke-width="1.5" opacity="0.42"/>
          <line x1="-12" y1="4"  x2="-20" y2="4"  stroke="var(--ch-c)" stroke-width="1"   opacity="0.28"/>
        </g>
        <!-- ── Divider ── -->
        <line x1="202" y1="10" x2="202" y2="154" stroke="var(--ch-c)" stroke-width="0.5" opacity="0.1"/>
        <!-- ── Right: 7 SI Unit Chips ── -->
        <!-- Row 1: m  kg  s  A  (y: 14–72, x: 204–407, chip w=47, gap=6) -->
        <g class="su1">
          <rect x="204" y="14" width="47" height="58" rx="5" fill="var(--ch-c)" opacity="0.1"/>
          <text x="227" y="49" font-size="23" font-weight="700" fill="var(--ch-c)" text-anchor="middle">m</text>
          <text x="227" y="63" font-size="8"  fill="var(--ch-c)" text-anchor="middle" opacity="0.65">length</text>
        </g>
        <g class="su2">
          <rect x="257" y="14" width="47" height="58" rx="5" fill="var(--ch-c)" opacity="0.1"/>
          <text x="280" y="48" font-size="19" font-weight="700" fill="var(--ch-c)" text-anchor="middle">kg</text>
          <text x="280" y="63" font-size="8"  fill="var(--ch-c)" text-anchor="middle" opacity="0.65">mass</text>
        </g>
        <g class="su3">
          <rect x="310" y="14" width="47" height="58" rx="5" fill="var(--ch-c)" opacity="0.1"/>
          <text x="333" y="49" font-size="23" font-weight="700" fill="var(--ch-c)" text-anchor="middle">s</text>
          <text x="333" y="63" font-size="8"  fill="var(--ch-c)" text-anchor="middle" opacity="0.65">time</text>
        </g>
        <g class="su4">
          <rect x="363" y="14" width="47" height="58" rx="5" fill="var(--ch-c)" opacity="0.1"/>
          <text x="386" y="49" font-size="23" font-weight="700" fill="var(--ch-c)" text-anchor="middle">A</text>
          <text x="386" y="63" font-size="8"  fill="var(--ch-c)" text-anchor="middle" opacity="0.65">current</text>
        </g>
        <!-- Row 2: K  mol  cd  (y: 80–138, centred in right panel) -->
        <g class="su5">
          <rect x="227" y="80" width="47" height="58" rx="5" fill="var(--ch-c)" opacity="0.1"/>
          <text x="250" y="115" font-size="23" font-weight="700" fill="var(--ch-c)" text-anchor="middle">K</text>
          <text x="250" y="130" font-size="8"  fill="var(--ch-c)" text-anchor="middle" opacity="0.65">temp.</text>
        </g>
        <g class="su6">
          <rect x="280" y="80" width="47" height="58" rx="5" fill="var(--ch-c)" opacity="0.1"/>
          <text x="303" y="113" font-size="17" font-weight="700" fill="var(--ch-c)" text-anchor="middle">mol</text>
          <text x="303" y="130" font-size="8"  fill="var(--ch-c)" text-anchor="middle" opacity="0.65">amount</text>
        </g>
        <g class="su7">
          <rect x="333" y="80" width="47" height="58" rx="5" fill="var(--ch-c)" opacity="0.1"/>
          <text x="356" y="115" font-size="21" font-weight="700" fill="var(--ch-c)" text-anchor="middle">cd</text>
          <text x="356" y="130" font-size="8"  fill="var(--ch-c)" text-anchor="middle" opacity="0.65">candela</text>
        </g>
      </g>

      <!-- ══ cricket (Physical Quantities & SI Units — cricket context) ══ -->
      <g v-else-if="scene === 'cricket'">
        <!-- ── Left: Cricket Pitch (side view) ── -->
        <rect x="14" y="14" width="182" height="134" rx="7" fill="var(--ch-c)" opacity="0.05"/>
        <rect x="14" y="14" width="182" height="22"  rx="7" fill="var(--ch-c)" opacity="0.14"/>
        <text x="105" y="29" font-size="10" font-weight="700" fill="var(--ch-c)" text-anchor="middle" letter-spacing="1">CRICKET · PITCH</text>
        <!-- ground line -->
        <line x1="14" y1="104" x2="196" y2="104" stroke="var(--ch-c)" stroke-width="1.5" opacity="0.18"/>
        <!-- pitch surface (lighter rectangle, wicket to wicket) -->
        <rect x="28" y="82" width="158" height="22" rx="2" fill="var(--ch-c)" opacity="0.1"/>
        <!-- LEFT stumps (batting end) -->
        <rect x="25" y="60" width="2.5" height="44" rx="1" fill="var(--ch-c)" opacity="0.8"/>
        <rect x="29" y="60" width="2.5" height="44" rx="1" fill="var(--ch-c)" opacity="0.8"/>
        <rect x="33" y="60" width="2.5" height="44" rx="1" fill="var(--ch-c)" opacity="0.8"/>
        <line x1="23" y1="60" x2="37" y2="60" stroke="var(--ch-c)" stroke-width="2.2" opacity="0.8"/>
        <!-- RIGHT stumps (bowling end) -->
        <rect x="181" y="60" width="2.5" height="44" rx="1" fill="var(--ch-c)" opacity="0.45"/>
        <rect x="185" y="60" width="2.5" height="44" rx="1" fill="var(--ch-c)" opacity="0.45"/>
        <rect x="189" y="60" width="2.5" height="44" rx="1" fill="var(--ch-c)" opacity="0.45"/>
        <line x1="179" y1="60" x2="193" y2="60" stroke="var(--ch-c)" stroke-width="2.2" opacity="0.45"/>
        <!-- crease lines -->
        <line x1="19" y1="82" x2="42" y2="82" stroke="var(--ch-c)" stroke-width="1.5" opacity="0.38"/>
        <line x1="172" y1="82" x2="195" y2="82" stroke="var(--ch-c)" stroke-width="1.5" opacity="0.38"/>
        <!-- ball flight path (dashed: bowl end → pitch → bat) -->
        <path d="M187,72 Q148,106 107,106 Q66,106 29,74"
          fill="none" stroke="var(--ch-c)" stroke-width="1" stroke-dasharray="4 3" opacity="0.28"/>
        <!-- animated ball -->
        <circle r="7" fill="var(--ch-c)" opacity="0.9">
          <animateMotion dur="2.2s" repeatCount="indefinite" calcMode="spline"
            keyTimes="0;0.5;1"
            keySplines="0.4 0 0.6 1; 0.4 0 0.6 1"
            path="M187,72 Q148,106 107,106 Q66,106 29,74"/>
        </circle>
        <!-- seam line on ball (static hint) -->
        <!-- BAT / BOWL labels -->
        <text x="29"  y="120" font-size="8" fill="var(--ch-c)" text-anchor="middle" opacity="0.42">BAT</text>
        <text x="186" y="120" font-size="8" fill="var(--ch-c)" text-anchor="middle" opacity="0.42">BOWL</text>
        <!-- dimension line -->
        <line x1="29" y1="134" x2="186" y2="134" stroke="var(--ch-c)" stroke-width="1" opacity="0.26"/>
        <line x1="29"  y1="129" x2="29"  y2="139" stroke="var(--ch-c)" stroke-width="1" opacity="0.26"/>
        <line x1="186" y1="129" x2="186" y2="139" stroke="var(--ch-c)" stroke-width="1" opacity="0.26"/>
        <text x="107" y="150" font-size="9" fill="var(--ch-c)" text-anchor="middle" opacity="0.65" font-weight="600">20.12 m · ball = 0.156 kg</text>
        <!-- ── Divider ── -->
        <line x1="202" y1="10" x2="202" y2="154" stroke="var(--ch-c)" stroke-width="0.5" opacity="0.1"/>
        <!-- ── Right: 7 SI chips with cricket values (value + unit + context) ── -->
        <!-- Row 1: m  kg  s  A -->
        <g class="su1">
          <rect x="204" y="14" width="47" height="58" rx="5" fill="var(--ch-c)" opacity="0.1"/>
          <text x="227" y="43" font-size="15" font-weight="700" fill="var(--ch-c)" text-anchor="middle">20.12</text>
          <text x="227" y="55" font-size="11" font-weight="700" fill="var(--ch-c)" text-anchor="middle" opacity="0.85">m</text>
          <text x="227" y="65" font-size="7.5" fill="var(--ch-c)" text-anchor="middle" opacity="0.55">pitch</text>
        </g>
        <g class="su2">
          <rect x="257" y="14" width="47" height="58" rx="5" fill="var(--ch-c)" opacity="0.1"/>
          <text x="280" y="43" font-size="15" font-weight="700" fill="var(--ch-c)" text-anchor="middle">0.156</text>
          <text x="280" y="55" font-size="11" font-weight="700" fill="var(--ch-c)" text-anchor="middle" opacity="0.85">kg</text>
          <text x="280" y="65" font-size="7.5" fill="var(--ch-c)" text-anchor="middle" opacity="0.55">ball</text>
        </g>
        <g class="su3">
          <rect x="310" y="14" width="47" height="58" rx="5" fill="var(--ch-c)" opacity="0.1"/>
          <text x="333" y="43" font-size="15" font-weight="700" fill="var(--ch-c)" text-anchor="middle">0.42</text>
          <text x="333" y="55" font-size="11" font-weight="700" fill="var(--ch-c)" text-anchor="middle" opacity="0.85">s</text>
          <text x="333" y="65" font-size="7.5" fill="var(--ch-c)" text-anchor="middle" opacity="0.55">delivery</text>
        </g>
        <g class="su4">
          <rect x="363" y="14" width="47" height="58" rx="5" fill="var(--ch-c)" opacity="0.1"/>
          <text x="386" y="43" font-size="15" font-weight="700" fill="var(--ch-c)" text-anchor="middle">800</text>
          <text x="386" y="55" font-size="11" font-weight="700" fill="var(--ch-c)" text-anchor="middle" opacity="0.85">A</text>
          <text x="386" y="65" font-size="7.5" fill="var(--ch-c)" text-anchor="middle" opacity="0.55">lights</text>
        </g>
        <!-- Row 2: K  mol  cd -->
        <g class="su5">
          <rect x="227" y="80" width="47" height="58" rx="5" fill="var(--ch-c)" opacity="0.1"/>
          <text x="250" y="109" font-size="15" font-weight="700" fill="var(--ch-c)" text-anchor="middle">305</text>
          <text x="250" y="121" font-size="11" font-weight="700" fill="var(--ch-c)" text-anchor="middle" opacity="0.85">K</text>
          <text x="250" y="131" font-size="7.5" fill="var(--ch-c)" text-anchor="middle" opacity="0.55">air (32°C)</text>
        </g>
        <g class="su6">
          <rect x="280" y="80" width="47" height="58" rx="5" fill="var(--ch-c)" opacity="0.1"/>
          <text x="303" y="109" font-size="15" font-weight="700" fill="var(--ch-c)" text-anchor="middle">~8</text>
          <text x="303" y="121" font-size="11" font-weight="700" fill="var(--ch-c)" text-anchor="middle" opacity="0.85">mol</text>
          <text x="303" y="131" font-size="7.5" fill="var(--ch-c)" text-anchor="middle" opacity="0.55">carbon</text>
        </g>
        <g class="su7">
          <rect x="333" y="80" width="47" height="58" rx="5" fill="var(--ch-c)" opacity="0.1"/>
          <text x="356" y="109" font-size="15" font-weight="700" fill="var(--ch-c)" text-anchor="middle">1M</text>
          <text x="356" y="121" font-size="11" font-weight="700" fill="var(--ch-c)" text-anchor="middle" opacity="0.85">cd</text>
          <text x="356" y="131" font-size="7.5" fill="var(--ch-c)" text-anchor="middle" opacity="0.55">floodlight</text>
        </g>
      </g>

      <!-- ══ sig-figs-f1 (F1 Race Timing — Significant Figures) ══ -->
      <g v-else-if="scene === 'sig-figs-f1'">
        <!-- card 1: stopwatch, 3 sig figs -->
        <g class="sf1">
          <rect x="14" y="14" width="121" height="96" rx="8" fill="var(--ch-c)" opacity="0.1"/>
          <rect x="18" y="20" width="113" height="58" rx="5" fill="var(--ch-c)" opacity="0.18"/>
          <text x="74" y="61" font-size="30" font-weight="700" fill="var(--ch-c)" text-anchor="middle" font-family="monospace">1:23</text>
          <rect x="32" y="84" width="84" height="14" rx="5" fill="var(--ch-c)" opacity="0.16"/>
          <text x="74" y="94" font-size="9" font-weight="700" fill="var(--ch-c)" text-anchor="middle">3 sig figs</text>
          <text x="74" y="107" font-size="7.5" fill="var(--ch-c)" text-anchor="middle" opacity="0.42">stopwatch</text>
        </g>
        <line x1="138" y1="61" x2="146" y2="61" stroke="var(--ch-c)" stroke-width="1.5" marker-end="url(#ch-arrow)" opacity="0.3"/>
        <!-- card 2: team timer, 4 sig figs -->
        <g class="sf2">
          <rect x="149" y="14" width="121" height="96" rx="8" fill="var(--ch-c)" opacity="0.1"/>
          <rect x="153" y="20" width="113" height="58" rx="5" fill="var(--ch-c)" opacity="0.18"/>
          <text x="209" y="61" font-size="24" font-weight="700" fill="var(--ch-c)" text-anchor="middle" font-family="monospace">1:23.4</text>
          <rect x="167" y="84" width="84" height="14" rx="5" fill="var(--ch-c)" opacity="0.16"/>
          <text x="209" y="94" font-size="9" font-weight="700" fill="var(--ch-c)" text-anchor="middle">4 sig figs</text>
          <text x="209" y="107" font-size="7.5" fill="var(--ch-c)" text-anchor="middle" opacity="0.42">team timer</text>
        </g>
        <line x1="273" y1="61" x2="281" y2="61" stroke="var(--ch-c)" stroke-width="1.5" marker-end="url(#ch-arrow)" opacity="0.3"/>
        <!-- card 3: official F1, 6 sig figs -->
        <g class="sf3">
          <rect x="284" y="14" width="121" height="96" rx="8" fill="var(--ch-c)" opacity="0.1"/>
          <rect x="288" y="20" width="113" height="58" rx="5" fill="var(--ch-c)" opacity="0.18"/>
          <text x="344" y="61" font-size="20" font-weight="700" fill="var(--ch-c)" text-anchor="middle" font-family="monospace">1:23.456</text>
          <rect x="302" y="84" width="84" height="14" rx="5" fill="var(--ch-c)" opacity="0.16"/>
          <text x="344" y="94" font-size="9" font-weight="700" fill="var(--ch-c)" text-anchor="middle">6 sig figs</text>
          <text x="344" y="107" font-size="7.5" fill="var(--ch-c)" text-anchor="middle" opacity="0.42">official F1 timing</text>
        </g>
        <!-- precision progression line -->
        <line x1="20" y1="122" x2="396" y2="122" stroke="var(--ch-c)" stroke-width="1" marker-end="url(#ch-arrow)" opacity="0.18"/>
        <text x="20"  y="136" font-size="8" fill="var(--ch-c)" opacity="0.38">less precise</text>
        <text x="396" y="136" font-size="8" fill="var(--ch-c)" text-anchor="end" opacity="0.38">more precise</text>
        <text x="210" y="152" font-size="9" fill="var(--ch-c)" text-anchor="middle" opacity="0.48" font-style="italic">More digits recorded = more significant figures</text>
      </g>

      <!-- ══ sig-figs-scale (Weighing Scales — Significant Figures) ══ -->
      <g v-else-if="scene === 'sig-figs-scale'">
        <!-- card 1: kitchen scale, "100 g" — ambiguous trailing zeros -->
        <g class="sf1">
          <rect x="14" y="14" width="121" height="100" rx="8" fill="var(--ch-c)" opacity="0.1"/>
          <rect x="18" y="20" width="113" height="64" rx="5" fill="var(--ch-c)" opacity="0.16"/>
          <text x="84" y="42" font-size="13" fill="var(--ch-c)" text-anchor="middle" opacity="0.62">??</text>
          <text font-size="24" font-weight="700" font-family="monospace" text-anchor="middle" x="74" y="65">
            <tspan fill="var(--ch-c)">1</tspan><tspan fill="var(--ch-c)" opacity="0.28">00</tspan><tspan fill="var(--ch-c)"> g</tspan>
          </text>
          <rect x="20" y="88" width="108" height="14" rx="5" fill="var(--ch-c)" opacity="0.14"/>
          <text x="74" y="98" font-size="8.5" font-weight="700" fill="var(--ch-c)" text-anchor="middle">1–3 sig figs?</text>
          <text x="74" y="110" font-size="7.5" fill="var(--ch-c)" text-anchor="middle" opacity="0.42">kitchen scale</text>
        </g>
        <line x1="138" y1="60" x2="146" y2="60" stroke="var(--ch-c)" stroke-width="1.5" marker-end="url(#ch-arrow)" opacity="0.3"/>
        <!-- card 2: pharmacy scale, "100.0 g" — 4 sig figs, .0 highlighted -->
        <g class="sf2">
          <rect x="149" y="14" width="121" height="100" rx="8" fill="var(--ch-c)" opacity="0.1"/>
          <rect x="153" y="20" width="113" height="64" rx="5" fill="var(--ch-c)" opacity="0.16"/>
          <text font-size="21" font-weight="700" font-family="monospace" text-anchor="middle" x="209" y="63">
            <tspan fill="var(--ch-c)">100</tspan><tspan fill="#10b981">.0</tspan><tspan fill="var(--ch-c)"> g</tspan>
          </text>
          <rect x="155" y="88" width="108" height="14" rx="5" fill="var(--ch-c)" opacity="0.14"/>
          <text x="209" y="98" font-size="9" font-weight="700" fill="var(--ch-c)" text-anchor="middle">4 sig figs</text>
          <text x="209" y="110" font-size="7.5" fill="var(--ch-c)" text-anchor="middle" opacity="0.42">pharmacy scale</text>
        </g>
        <line x1="273" y1="60" x2="281" y2="60" stroke="var(--ch-c)" stroke-width="1.5" marker-end="url(#ch-arrow)" opacity="0.3"/>
        <!-- card 3: lab balance, "100.00 g" — 5 sig figs, .00 highlighted -->
        <g class="sf3">
          <rect x="284" y="14" width="121" height="100" rx="8" fill="var(--ch-c)" opacity="0.1"/>
          <rect x="288" y="20" width="113" height="64" rx="5" fill="var(--ch-c)" opacity="0.16"/>
          <text font-size="20" font-weight="700" font-family="monospace" text-anchor="middle" x="344" y="63">
            <tspan fill="var(--ch-c)">100</tspan><tspan fill="#10b981">.00</tspan><tspan fill="var(--ch-c)"> g</tspan>
          </text>
          <rect x="290" y="88" width="108" height="14" rx="5" fill="var(--ch-c)" opacity="0.14"/>
          <text x="344" y="98" font-size="9" font-weight="700" fill="var(--ch-c)" text-anchor="middle">5 sig figs</text>
          <text x="344" y="110" font-size="7.5" fill="var(--ch-c)" text-anchor="middle" opacity="0.42">lab balance</text>
        </g>
        <!-- trailing zero rule -->
        <text x="210" y="130" font-size="9" fill="var(--ch-c)" text-anchor="middle" opacity="0.52" font-weight="600">Trailing zeros after a decimal point are always significant</text>
        <text x="210" y="147" font-size="8.5" fill="var(--ch-c)" text-anchor="middle" opacity="0.38" font-style="italic">100 g = ambiguous · 100.0 g = 4 sig figs · 100.00 g = 5 sig figs</text>
      </g>

      <!-- ══ energy bars ══ -->
      <g v-else-if="scene === 'energy'">
        <line x1="80" y1="30" x2="350" y2="30" stroke="var(--ch-c)" stroke-width="1" stroke-dasharray="5 3" opacity="0.3"/>
        <text x="210" y="26" font-size="10" fill="var(--ch-c)" text-anchor="middle" opacity="0.5">Total E = constant</text>
        <text x="145" y="148" font-size="11" fill="#06b6d4" text-anchor="middle" font-weight="700">KE</text>
        <rect class="ke-bar" x="110" y="130" width="70" height="2" rx="3" fill="#06b6d4" opacity="0.85"/>
        <text x="285" y="148" font-size="11" fill="#8b5cf6" text-anchor="middle" font-weight="700">PE</text>
        <rect class="pe-bar" x="250" y="130" width="70" height="2" rx="3" fill="#8b5cf6" opacity="0.85"/>
        <line x1="80" y1="130" x2="370" y2="130" stroke="var(--ch-c)" stroke-width="1.5" opacity="0.25"/>
      </g>

      <!-- ══ wave ══ -->
      <g v-else-if="scene === 'wave'">
        <line x1="40" y1="90" x2="400" y2="90" stroke="var(--ch-c)" stroke-width="1" opacity="0.2"/>
        <path class="wave-path"
          d="M40,90 C75,42 110,138 145,90 S215,42 250,90 S320,138 355,90 S390,42 410,90"
          fill="none" stroke="var(--ch-c)" stroke-width="2.5" opacity="0.85" stroke-linecap="round"/>
        <line x1="40" y1="142" x2="145" y2="142" stroke="var(--ch-c)" stroke-width="1" opacity="0.3"/>
        <text x="92" y="155" text-anchor="middle" font-size="11" fill="var(--ch-c)" opacity="0.65" font-style="italic">λ</text>
        <line x1="355" y1="56" x2="355" y2="90" stroke="var(--ch-c)" stroke-width="1" stroke-dasharray="3 2" opacity="0.3"/>
        <text x="370" y="76" font-size="10" fill="var(--ch-c)" opacity="0.55">A</text>
      </g>

      <!-- ══ fluid (Bernoulli / pressure) ══ -->
      <g v-else-if="scene === 'fluid'">
        <path d="M50,62 L148,62 L175,80 L255,80 L282,62 L390,62" fill="none" stroke="var(--ch-c)" stroke-width="2" opacity="0.4"/>
        <path d="M50,118 L148,118 L175,100 L255,100 L282,118 L390,118" fill="none" stroke="var(--ch-c)" stroke-width="2" opacity="0.4"/>
        <line x1="72"  y1="90" x2="118" y2="90" stroke="var(--ch-c)" stroke-width="2.5" marker-end="url(#ch-arrow)" opacity="0.7"/>
        <line x1="178" y1="90" x2="252" y2="90" stroke="var(--ch-c)" stroke-width="3.5" marker-end="url(#ch-arrow)" opacity="0.9"/>
        <line x1="298" y1="90" x2="358" y2="90" stroke="var(--ch-c)" stroke-width="2.5" marker-end="url(#ch-arrow)" opacity="0.7"/>
        <text x="215" y="75" font-size="10" fill="var(--ch-c)" text-anchor="middle" font-weight="700" opacity="0.8">v₂ ↑  P₂ ↓</text>
        <text x="210" y="148" font-size="11" fill="var(--ch-c)" text-anchor="middle" opacity="0.6">P + ½ρv² = const</text>
      </g>
    </svg>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{ type: string }>()

const SCENE_MAP: Record<string, string> = {
  // units / measurement
  'si-units': 'sprint', 'dimensions': 'units', 'significant-figures': 'units', 'dimensional-analysis': 'units',
  // kinematics 1-D
  'displacement': 'moving-block', 'velocity-speed': 'moving-block', 'acceleration': 'moving-block',
  'equations-of-motion': 'moving-block', 'relative-velocity': 'moving-block',
  // vectors
  'scalars-and-vectors': 'vectors', 'vector-addition': 'vectors',
  'vector-components': 'vectors', 'unit-vectors': 'vectors', 'relative-velocity-2d': 'vectors',
  // projectile
  'projectile-motion': 'projectile',
  // circular / orbital
  'uniform-circular-motion': 'circular', 'circular-motion': 'circular',
  'keplers-laws': 'circular', 'satellites': 'circular', 'escape-velocity': 'circular',
  'angular-momentum': 'circular', 'rolling-motion': 'circular', 'torque': 'circular',
  'moment-of-inertia': 'circular',
  // Newton's laws / forces
  'inertia-first-law': 'moving-block', 'momentum-second-law': 'moving-block',
  'impulse': 'moving-block', 'third-law': 'moving-block',
  'conservation-of-momentum': 'moving-block', 'collisions': 'moving-block',
  'equilibrium': 'vectors', 'friction': 'moving-block',
  // centre of mass
  'centre-of-mass': 'vectors',
  // gravity
  'universal-law': 'gravity', 'gravitational-field': 'gravity',
  // elasticity / solids
  'stress-and-strain': 'spring', 'hookes-law': 'spring',
  'elastic-moduli': 'spring', 'stress-strain-curve': 'spring', 'applications-elasticity': 'spring',
  // fluids
  'pressure': 'fluid', 'archimedes': 'fluid', 'viscosity': 'fluid',
  'surface-tension': 'fluid', 'bernoulli': 'fluid',
  // thermal
  'temperature-and-heat': 'thermal', 'thermal-expansion': 'thermal',
  'calorimetry': 'thermal', 'heat-transfer': 'thermal', 'newtons-cooling': 'thermal',
  // thermodynamics
  'first-law': 'thermal', 'thermodynamic-processes': 'thermal',
  'second-law': 'thermal', 'heat-engine': 'thermal', 'carnot-theorem': 'thermal',
  // kinetic theory
  'kinetic-theory': 'particles', 'speed-of-molecules': 'particles',
  'equipartition': 'particles', 'mean-free-path': 'particles',
  // energy
  'work': 'energy', 'kinetic-energy': 'energy', 'potential-energy': 'energy',
  'conservation-of-energy': 'energy', 'power': 'energy', 'energy-shm': 'energy',
  // oscillations
  'shm': 'pendulum', 'simple-pendulum': 'pendulum',
  'damped-oscillations': 'wave', 'resonance': 'wave',
  // waves
  'wave-motion': 'wave', 'speed-of-waves': 'wave', 'standing-waves': 'wave',
  'beats': 'wave', 'doppler': 'wave',
}

const THEME_MAP: Record<string, string> = {
  'sprint': 'brand', 'cricket': 'green', 'sig-figs-f1': 'red', 'sig-figs-scale': 'violet',
  'units': 'blue', 'moving-block': 'brand', 'vectors': 'amber',
  'projectile': 'brand', 'circular': 'violet', 'pendulum': 'cyan',
  'spring': 'green', 'particles': 'orange', 'thermal': 'red',
  'gravity': 'indigo', 'energy': 'emerald', 'wave': 'cyan', 'fluid': 'sky',
}

const TABS_MAP: Record<string, Array<{ label: string; scene: string }>> = {
  'si-units': [
    { label: 'Sprint', scene: 'sprint' },
    { label: 'Cricket', scene: 'cricket' },
  ],
  'significant-figures': [
    { label: 'F1 Racing', scene: 'sig-figs-f1' },
    { label: 'Lab Scale', scene: 'sig-figs-scale' },
  ],
}

const tabs = computed(() => TABS_MAP[props.type] ?? null)
const activeTab = ref(0)
const scene = computed(() => {
  if (tabs.value) return tabs.value[activeTab.value].scene
  return SCENE_MAP[props.type] ?? 'moving-block'
})
const theme = computed(() => THEME_MAP[scene.value] ?? 'brand')
</script>

<style scoped>
.chero {
  border-radius: 12px;
  border: 1px solid var(--c-divider);
  overflow: hidden;
  margin-bottom: 28px;
}

/* Tab bar */
.chero-tabs {
  display: flex;
  gap: 6px;
  padding: 8px 14px;
  background: var(--c-bg);
  border-bottom: 1px solid var(--c-divider);
}
.chero-tab {
  padding: 4px 14px;
  font-size: 0.78rem;
  font-weight: 600;
  border-radius: 6px;
  border: 1px solid var(--c-divider);
  background: transparent;
  color: var(--c-text-2);
  cursor: pointer;
  transition: background 0.12s, border-color 0.12s, color 0.12s;
}
.chero-tab:hover {
  background: var(--c-bg-elv);
  color: var(--c-text-1);
}
.chero-tab--active {
  background: color-mix(in srgb, var(--ch-c) 11%, transparent);
  border-color: var(--ch-c);
  color: var(--ch-c);
}

/* Header — matches ConceptBlock .block-head style */
.chero-head {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  background: color-mix(in srgb, var(--ch-c) 8%, var(--c-bg));
  border-bottom: 1px solid var(--c-divider);
}
.chero-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  color: var(--ch-c);
  flex-shrink: 0;
}
.chero-icon svg { width: 18px; height: 18px; }
.chero-label {
  font-size: 0.82rem;
  font-weight: 700;
  color: var(--ch-c);
  letter-spacing: 0.01em;
}

/* colour themes */
.chero--brand   { --ch-c: #2f6fd0; --ch-bg: color-mix(in srgb, #2f6fd0 6%, var(--c-bg)); }
.chero--blue    { --ch-c: #3b82f6; --ch-bg: color-mix(in srgb, #3b82f6 6%, var(--c-bg)); }
.chero--indigo  { --ch-c: #6366f1; --ch-bg: color-mix(in srgb, #6366f1 6%, var(--c-bg)); }
.chero--violet  { --ch-c: #8b5cf6; --ch-bg: color-mix(in srgb, #8b5cf6 6%, var(--c-bg)); }
.chero--cyan    { --ch-c: #06b6d4; --ch-bg: color-mix(in srgb, #06b6d4 6%, var(--c-bg)); }
.chero--green   { --ch-c: #10b981; --ch-bg: color-mix(in srgb, #10b981 6%, var(--c-bg)); }
.chero--emerald { --ch-c: #10b981; --ch-bg: color-mix(in srgb, #10b981 6%, var(--c-bg)); }
.chero--amber   { --ch-c: #f59e0b; --ch-bg: color-mix(in srgb, #f59e0b 6%, var(--c-bg)); }
.chero--orange  { --ch-c: #f97316; --ch-bg: color-mix(in srgb, #f97316 6%, var(--c-bg)); }
.chero--red     { --ch-c: #ef4444; --ch-bg: color-mix(in srgb, #ef4444 6%, var(--c-bg)); }
.chero--sky     { --ch-c: #0ea5e9; --ch-bg: color-mix(in srgb, #0ea5e9 6%, var(--c-bg)); }

.chero-svg {
  display: block;
  width: 100%;
  height: 160px;
  background: var(--ch-bg);
}

/* ── moving block ── */
@keyframes block-slide {
  0%   { transform: translateX(60px); }
  70%  { transform: translateX(230px); }
  85%  { transform: translateX(230px); }
  100% { transform: translateX(60px); }
}
.block-slide { animation: block-slide 3.2s ease-in-out infinite; }

/* ── spring oscillation ── */
@keyframes spring-osc {
  0%, 100% { transform: translateX(0); }
  50%       { transform: translateX(36px); }
}
.spring-oscillate { animation: spring-osc 1.6s ease-in-out infinite; }

/* ── particles ── */
@keyframes p1 { 0%,100%{transform:translate(0,0)}  33%{transform:translate(52px,-28px)}  66%{transform:translate(-30px,22px)} }
@keyframes p2 { 0%,100%{transform:translate(0,0)}  33%{transform:translate(-44px,18px)}  66%{transform:translate(34px,-32px)} }
@keyframes p3 { 0%,100%{transform:translate(0,0)}  33%{transform:translate(28px,36px)}   66%{transform:translate(-48px,-12px)} }
@keyframes p4 { 0%,100%{transform:translate(0,0)}  33%{transform:translate(-32px,-22px)} 66%{transform:translate(40px,28px)} }
@keyframes p5 { 0%,100%{transform:translate(0,0)}  33%{transform:translate(44px,26px)}   66%{transform:translate(-26px,-34px)} }
@keyframes p6 { 0%,100%{transform:translate(0,0)}  33%{transform:translate(-36px,-30px)} 66%{transform:translate(30px,20px)} }
.pt1 { animation: p1 2.1s ease-in-out infinite; }
.pt2 { animation: p2 2.5s ease-in-out infinite; }
.pt3 { animation: p3 1.9s ease-in-out infinite; }
.pt4 { animation: p4 2.8s ease-in-out infinite; }
.pt5 { animation: p5 2.3s ease-in-out infinite; }
.pt6 { animation: p6 2.0s ease-in-out infinite; }

/* ── heat arrows pulse ── */
@keyframes heat-pulse { 0%,100%{opacity:0.85} 50%{opacity:0.3} }
.heat-arrows { animation: heat-pulse 1.6s ease-in-out infinite; }

/* ── gravity test mass ── */
@keyframes grav-pull { 0%,100%{transform:translateX(0)} 60%{transform:translateX(-18px)} }
.grav-test { animation: grav-pull 2.4s ease-in-out infinite; }

/* ── SI units fade-in stagger ── */
@keyframes u-pop { 0%,80%{opacity:0.15;transform:scale(0.8)} 100%{opacity:1;transform:scale(1)} }
.u1 { animation: u-pop 0.6s 0.0s both; }
.u2 { animation: u-pop 0.6s 0.2s both; }
.u3 { animation: u-pop 0.6s 0.4s both; }
.u4 { animation: u-pop 0.6s 0.6s both; }
.u5 { animation: u-pop 0.6s 0.8s both; }
.u6 { animation: u-pop 0.6s 1.0s both; }
.u7 { animation: u-pop 0.6s 1.2s both; }

/* ── energy bars ── */
@keyframes ke-grow { 0%{height:2px;y:130px} 50%{height:92px;y:38px} 100%{height:2px;y:130px} }
@keyframes pe-grow { 0%{height:92px;y:38px} 50%{height:2px;y:130px} 100%{height:92px;y:38px} }
.ke-bar { animation: ke-grow 2.4s ease-in-out infinite; }
.pe-bar { animation: pe-grow 2.4s ease-in-out infinite; }

/* ── wave translate ── */
@keyframes wave-move { from{transform:translateX(0)} to{transform:translateX(-105px)} }
.wave-path { animation: wave-move 2s linear infinite; }

/* ── sprint runner (moves from start to finish, loops) ── */
@keyframes runner-run {
  0%   { transform: translate(26px, 67px); }
  68%  { transform: translate(188px, 67px); }
  84%  { transform: translate(188px, 67px); }
  100% { transform: translate(26px, 67px); }
}
.runner-slide { animation: runner-run 2.6s ease-in-out infinite; }

/* ── sprint SI unit chips (staggered fade-in on mount) ── */
@keyframes chip-in { from { opacity: 0; } to { opacity: 1; } }
.su1 { animation: chip-in 0.4s 0.00s both; }
.su2 { animation: chip-in 0.4s 0.15s both; }
.su3 { animation: chip-in 0.4s 0.30s both; }
.su4 { animation: chip-in 0.4s 0.45s both; }
.su5 { animation: chip-in 0.4s 0.60s both; }
.su6 { animation: chip-in 0.4s 0.75s both; }
.su7 { animation: chip-in 0.4s 0.90s both; }

/* ── sig-figs card stagger ── */
.sf1 { animation: chip-in 0.4s 0.00s both; }
.sf2 { animation: chip-in 0.4s 0.22s both; }
.sf3 { animation: chip-in 0.4s 0.44s both; }
</style>
