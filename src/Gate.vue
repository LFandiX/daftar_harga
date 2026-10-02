<script setup>
import { ref } from 'vue'
import { AUTH } from './auth'
import { NAMA_TOKO } from './config'
const emit = defineEmits(['masuk'])

const pw = ref(''), ingat = ref(true), error = ref(''), cek = ref(false)
let gagal = 0, kunciSampai = 0

const hex2b = h => Uint8Array.from(h.match(/../g), x => parseInt(x, 16))
const b2hex = b => [...new Uint8Array(b)].map(x => x.toString(16).padStart(2, '0')).join('')
async function turunkan(teks) {
  const kunci = await crypto.subtle.importKey('raw', new TextEncoder().encode(teks), 'PBKDF2', false, ['deriveBits'])
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', hash: 'SHA-256', salt: hex2b(AUTH.salt), iterations: AUTH.iterasi }, kunci, 256)
  return b2hex(bits)
}
const sama = (a, b) => { let d = a.length ^ b.length; for (let i = 0; i < a.length; i++) d |= a.charCodeAt(i) ^ (b.charCodeAt(i) || 0); return d === 0 }

async function masuk() {
  if (!pw.value || cek.value) return
  const sisa = Math.ceil((kunciSampai - Date.now()) / 1000)
  if (sisa > 0) { error.value = `Terlalu banyak percobaan. Coba lagi ${sisa} detik lagi.`; return }
  if (!window.crypto?.subtle) { error.value = 'Halaman harus dibuka lewat HTTPS.'; return }
  cek.value = true; error.value = ''
  try {
    const h = await turunkan(pw.value)
    if (sama(h, AUTH.hash)) { emit('masuk', { ingat: ingat.value, token: h }); return }
    gagal++
    if (gagal >= 5) { kunciSampai = Date.now() + 30000; gagal = 0 }
    error.value = 'Kode akses salah.'; pw.value = ''
  } finally { cek.value = false }
}
</script>

<template>
  <main class="gate">
    <form @submit.prevent="masuk">
      <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="4" y="10" width="16" height="10" rx="2.5"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/></svg>
      <h1>{{ NAMA_TOKO }}</h1>
      <p>Masukkan kode akses untuk melihat daftar harga.</p>
      <input v-model="pw" type="password" autocomplete="current-password" placeholder="Kode akses" aria-label="Kode akses" autofocus />
      <label class="ingat"><input v-model="ingat" type="checkbox" /> Ingat di perangkat ini</label>
      <p v-if="error" class="salah" role="alert">{{ error }}</p>
      <button type="submit" :disabled="cek || !pw">{{ cek ? 'Memeriksa…' : 'Masuk' }}</button>
    </form>
  </main>
</template>

<style scoped>
.gate{min-height:100dvh;display:grid;place-items:center;padding:24px;background:#fff}
form{width:100%;max-width:340px;display:flex;flex-direction:column;gap:12px}
svg{color:var(--ink)}
h1{font-size:1.7rem;font-weight:800;letter-spacing:-.035em;line-height:1.1;margin:6px 0 0}
p{margin:0;color:var(--mute)}
input[type=password]{padding:13px 16px;border:1px solid var(--line);border-radius:12px;background:var(--soft);margin-top:8px;width:100%}
input[type=password]:focus{background:#fff;border-color:var(--ink);outline:0}
input[type=password]:focus-visible{outline:2px solid var(--acc);outline-offset:2px}
.ingat{display:flex;align-items:center;gap:8px;color:var(--mute);font-size:.9rem;cursor:pointer}
.salah{color:#b91c1c;font-size:.9rem}
button{padding:13px;border:0;border-radius:12px;background:var(--ink);color:#fff;font-weight:700;cursor:pointer}
button:disabled{opacity:.4;cursor:not-allowed}
button:focus-visible{outline:2px solid var(--acc);outline-offset:2px}
</style>
