<script setup>
import { ref } from 'vue'
import { AUTH } from './auth'
import Gate from './Gate.vue'
import App from './App.vue'
const KEY = 'dh_akses'
const baca = () => { try { return localStorage.getItem(KEY) === AUTH.hash || sessionStorage.getItem(KEY) === AUTH.hash } catch { return false } }
const buka = ref(baca())
function masuk({ ingat, token }) {
  try { (ingat ? localStorage : sessionStorage).setItem(KEY, token) } catch {}
  buka.value = true
}
</script>
<template><App v-if="buka" /><Gate v-else @masuk="masuk" /></template>
