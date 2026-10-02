// Pakai: node scripts/buat-hash.mjs "passwordBaru"
// Lalu salin hasilnya ke src/auth.js
import { pbkdf2Sync, randomBytes } from 'node:crypto'
const pw = process.argv[2]
if (!pw) { console.error('Pakai: node scripts/buat-hash.mjs "passwordBaru"'); process.exit(1) }
const iterasi = 310000, salt = randomBytes(16)
const hash = pbkdf2Sync(pw, salt, iterasi, 32, 'sha256').toString('hex')
console.log(`export const AUTH = {\n  salt: '${salt.toString('hex')}',\n  iterasi: ${iterasi},\n  hash: '${hash}'\n}`)
