<script setup lang="ts">
import Header from '../components/Header.vue'
import Footer from '../components/Footer.vue'
import ToastList from '../components/ToastList.vue'
</script>

<template>
  <div class="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors">
    <!-- Header -->
    <Header />

    <!-- Main Content -->
    <main class="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <slot />
    </main>

    <!-- Footer -->
    <Footer />

    <!-- Toast Notification Engine -->
    <ToastList />
  </div>
</template>
