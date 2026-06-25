

<script setup lang="ts">
defineProps<{ size?: number }>()

// Cell centres in the 40×40 viewBox
// TL(10,10)  TR(30,10)
// BL(10,30)  BR(30,30)
// Each symbol starts at a different corner and rotates clockwise
</script>

<template>
  <svg
    :width="size ?? 24"
    :height="size ?? 24"
    viewBox="0 0 40 40"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <defs></defs>

    
    <rect x="2"  y="2"  width="16" height="16" rx="3.5" fill="#dbeafe" opacity="0.5"/>
    <rect x="22" y="2"  width="16" height="16" rx="3.5" fill="#fee2e2" opacity="0.5"/>
    <rect x="2"  y="22" width="16" height="16" rx="3.5" fill="#d1fae5" opacity="0.5"/>
    <rect x="22" y="22" width="16" height="16" rx="3.5" fill="#fef3c7" opacity="0.5"/>

    

    
    <g>
      <animateTransform attributeName="transform" type="translate"
        values="10,10; 30,10; 30,30; 10,30; 10,10"
        keyTimes="0; 0.25; 0.5; 0.75; 1"
        calcMode="discrete"
        dur="4s" begin="0s" repeatCount="indefinite"/>
      <rect x="-8" y="-8" width="16" height="16" rx="3" fill="#3b82f6"/>
      <text x="0" y="0.5"
        text-anchor="middle" dominant-baseline="middle"
        font-size="10" font-weight="800" font-family="system-ui" fill="white">+</text>
    </g>

    
    <g>
      <animateTransform attributeName="transform" type="translate"
        values="30,10; 30,30; 10,30; 10,10; 30,10"
        keyTimes="0; 0.25; 0.5; 0.75; 1"
        calcMode="discrete"
        dur="4s" begin="0s" repeatCount="indefinite"/>
      <rect x="-8" y="-8" width="16" height="16" rx="3" fill="#ef4444"/>
      <text x="0" y="0.5"
        text-anchor="middle" dominant-baseline="middle"
        font-size="12" font-weight="800" font-family="system-ui" fill="white">−</text>
    </g>

    
    <g>
      <animateTransform attributeName="transform" type="translate"
        values="30,30; 10,30; 10,10; 30,10; 30,30"
        keyTimes="0; 0.25; 0.5; 0.75; 1"
        calcMode="discrete"
        dur="4s" begin="0s" repeatCount="indefinite"/>
      <rect x="-8" y="-8" width="16" height="16" rx="3" fill="#10b981"/>
      <text x="0" y="0.5"
        text-anchor="middle" dominant-baseline="middle"
        font-size="9" font-weight="800" font-family="system-ui" fill="white">×</text>
    </g>

    
    <g>
      <animateTransform attributeName="transform" type="translate"
        values="10,30; 10,10; 30,10; 30,30; 10,30"
        keyTimes="0; 0.25; 0.5; 0.75; 1"
        calcMode="discrete"
        dur="4s" begin="0s" repeatCount="indefinite"/>
      <rect x="-8" y="-8" width="16" height="16" rx="3" fill="#f59e0b"/>
      <text x="0" y="0.5"
        text-anchor="middle" dominant-baseline="middle"
        font-size="9" font-weight="800" font-family="system-ui" fill="white">÷</text>
    </g>

  </svg>
</template>
