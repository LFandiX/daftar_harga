<script setup>
import { ref, computed, onMounted } from 'vue'
import Papa from 'papaparse'
import { SHEET_CSV_URL, NAMA_TOKO, NOMOR_WA } from './config'

const produk = ref([]), loading = ref(true), error = ref('')
const q = ref(''), kat = ref(''), merek = ref(''), urut = ref('nama'), per = ref('merek')

const rupiah = n => 'Rp ' + Number(n).toLocaleString('id-ID')
const angka = v => Number(String(v ?? '').replace(/[^\d]/g, '')) || 0
const AKRONIM = /\b(ai|tv|uhd|4k|led|qned|oled|ac|usb|uv|lg|dvd)\b/gi
// "TIPE BARU, ALUMINIUM" -> "Tipe baru, aluminium" (akronim tetap kapital)
const rapikan = s => {
  const t = s.toLowerCase().replace(AKRONIM, m => m.toUpperCase())
  return t.charAt(0).toUpperCase() + t.slice(1)
}

async function muat() {
  loading.value = true; error.value = ''
  try {
    const url = SHEET_CSV_URL || import.meta.env.BASE_URL + 'data.csv'
    const res = await fetch(url, { cache: 'no-cache' })
    if (!res.ok) throw new Error('HTTP ' + res.status)
    const { data } = Papa.parse(await res.text(), {
      header: true, skipEmptyLines: true, transformHeader: h => h.trim().toLowerCase()
    })
    produk.value = data.map(r => {
      const nama = (r.nama || '').trim()
      return { nama, merek: (r.merek || '').trim() || nama.split('-')[0] || 'Lainnya',
        kategori: (r.kategori || '').trim() || 'Lainnya',
        deskripsi: rapikan((r.deskripsi || '').trim()), harga: angka(r.harga) }
    }).filter(r => r.nama && r.harga > 0)
  } catch (e) {
    error.value = 'Gagal memuat data harga (' + e.message + '). Cek link Google Sheets di src/config.js.'
  } finally { loading.value = false }
}
onMounted(muat)

const uniq = k => computed(() => [...new Set(produk.value.map(p => p[k]))].sort((a, b) => a.localeCompare(b, 'id')))
const kategoriList = uniq('kategori'), merekList = uniq('merek')

const grup = computed(() => {
  const k = q.value.toLowerCase().trim()
  const cmp = { nama: (a, b) => a.nama.localeCompare(b.nama, 'id', { numeric: true }),
    murah: (a, b) => a.harga - b.harga, mahal: (a, b) => b.harga - a.harga }[urut.value]
  const m = new Map()
  produk.value
    .filter(p => (!kat.value || p.kategori === kat.value) && (!merek.value || p.merek === merek.value) &&
      (!k || (p.nama + ' ' + p.kategori + ' ' + p.deskripsi).toLowerCase().includes(k)))
    .sort(cmp)
    .forEach(p => { const j = p[per.value]; (m.get(j) || m.set(j, []).get(j)).push(p) })
  return [...m].sort((a, b) => a[0].localeCompare(b[0], 'id')).map(([judul, baris]) => ({ judul, baris }))
})
const total = computed(() => grup.value.reduce((n, g) => n + g.baris.length, 0))
const kunci = () => { try { localStorage.removeItem('dh_akses'); sessionStorage.removeItem('dh_akses') } catch {} location.reload() }
const wa = p => `https://wa.me/${NOMOR_WA}?text=${encodeURIComponent('Halo, saya tanya produk ' + p.nama + ' (' + rupiah(p.harga) + ')')}`
</script>

<template>
  <header class="hero">
    <div class="wrap">
      <h1>{{ NAMA_TOKO }}</h1>
      <p class="sub">{{ total }} produk elektronik &middot; harga terbaru</p>
      <div class="search">
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>
        <input v-model="q" type="search" placeholder="Cari tipe atau jenis produk" aria-label="Cari produk" />
      </div>
      <div class="bar">
        <div class="seg" role="group" aria-label="Kelompokkan">
          <button :class="{ on: per === 'merek' }" @click="per = 'merek'">Per merek</button>
          <button :class="{ on: per === 'kategori' }" @click="per = 'kategori'">Per kategori</button>
        </div>
        <select v-model="kat" aria-label="Kategori"><option value="">Semua kategori</option><option v-for="k in kategoriList" :key="k">{{ k }}</option></select>
        <select v-model="merek" aria-label="Merek"><option value="">Semua merek</option><option v-for="m in merekList" :key="m">{{ m }}</option></select>
        <select v-model="urut" aria-label="Urutkan"><option value="nama">Urut nama</option><option value="murah">Termurah</option><option value="mahal">Termahal</option></select>
      </div>
    </div>
  </header>

  <main class="wrap">
    <p v-if="loading" class="info">Memuat harga…</p>
    <p v-else-if="error" class="info err">{{ error }} <button @click="muat">Coba lagi</button></p>
    <p v-else-if="!total" class="info">Tidak ada produk yang cocok.</p>

    <div v-if="total" class="head row" aria-hidden="true">
      <span>Nama</span><span>Kategori</span><span class="r">Harga</span><span>Deskripsi</span>
    </div>

    <section v-for="g in grup" :key="g.judul" class="grp">
      <h2>{{ g.judul }} <small>{{ g.baris.length }}</small></h2>
      <div v-for="p in g.baris" :key="p.nama" class="row item">
        <strong class="nm">{{ p.nama }}</strong>
        <span class="kt">{{ p.kategori }}</span>
        <span class="hg">{{ rupiah(p.harga) }}</span>
        <span class="ds">{{ p.deskripsi }}</span>
        <a v-if="NOMOR_WA" class="wa" :href="wa(p)" target="_blank" rel="noopener">Tanya</a>
      </div>
    </section>
    <footer>Harga dapat berubah sewaktu-waktu. Hubungi toko untuk konfirmasi stok. <button class="kunci" @click="kunci">Kunci halaman</button></footer>
  </main>
</template>
