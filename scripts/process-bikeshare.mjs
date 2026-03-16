// scripts/process-bikeshare.mjs
// Run with: node scripts/process-bikeshare.mjs
// Reads /tmp/bikeshare_2025_01.csv
// Outputs public/data/bikeshare-jan-2025.json

import { readFileSync, writeFileSync, mkdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')

const CSV_PATH = '/tmp/bikeshare_2025_01.csv'
const OUT_DIR  = join(ROOT, 'public', 'data')
const OUT_PATH = join(OUT_DIR, 'bikeshare-jan-2025.json')

// ─── Read CSV ────────────────────────────────────────────────────
console.log('Reading CSV...')
const raw = readFileSync(CSV_PATH, 'utf8')
const lines = raw.split('\n')

// Parse header — normalize: trim, lowercase, replace spaces with _
const header = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/\s+/g, '_'))

console.log('Columns found:', header)

// Find column indices
const col = name => header.indexOf(name)

const IDX = {
  startId:   col('start_station_id'),
  endId:     col('end_station_id'),
  startName: col('start_station_name'),
  endName:   col('end_station_name'),
  startTime: col('start_time'),
  duration:  col('trip_duration'),
  userType:  col('user_type'),
  bikeModel: col('bike_model'),
}

console.log('Column indices:', IDX)

// ─── Parse rows ──────────────────────────────────────────────────
console.log(`Parsing ${lines.length - 1} rows...`)

const trips = []
let skipped = 0

for (let i = 1; i < lines.length; i++) {
  const line = lines[i].trim()
  if (!line) continue

  // Handle quoted fields with commas inside
  const fields = parseCSVLine(line)

  const startName = fields[IDX.startName]?.trim()
  const endName   = fields[IDX.endName]?.trim()
  const startTime = fields[IDX.startTime]?.trim()
  const userType  = fields[IDX.userType]?.trim()
  const bikeModel = fields[IDX.bikeModel]?.trim() ?? ''
  const startId   = parseInt(fields[IDX.startId])
  const endId     = parseInt(fields[IDX.endId])
  const duration  = parseInt(fields[IDX.duration])

  // Skip bad rows
  if (!startName || !endName || !startTime) { skipped++; continue }
  if (isNaN(startId) || isNaN(endId))       { skipped++; continue }
  if (isNaN(duration) || duration < 60 || duration > 10800) { skipped++; continue }

  // Extract hour (0-23) from "2025-01-01 00:02:15"
  const hour = parseInt(startTime.slice(11, 13))
  if (isNaN(hour) || hour < 0 || hour > 23) { skipped++; continue }

  // Member: "Member" → true, "Casual" → false
  const mem = userType?.toLowerCase().includes('member') ? 1 : 0

  // E-bike: EFIT, FIT → 1, ICONIC → 0
  const modelLower = bikeModel.toLowerCase()
  const eb = (modelLower.includes('efit') || modelLower.includes('fit') || modelLower.includes('boost')) ? 1 : 0

  trips.push({
    sid:  startId,
    eid:  endId,
    sn:   startName,   // start name
    en:   endName,     // end name
    h:    hour,        // hour 0-23
    dur:  duration,    // seconds
    mem,               // 1=member 0=casual
    eb,                // 1=ebike 0=classic
  })
}

console.log(`Parsed ${trips.length} valid trips, skipped ${skipped}`)

// ─── Build station list from trip data ──────────────────────────
console.log('Building station list from trips...')

const stationMap = new Map() // id → { id, name }

for (const t of trips) {
  if (!stationMap.has(t.sid)) stationMap.set(t.sid, { id: t.sid, name: t.sn })
  if (!stationMap.has(t.eid)) stationMap.set(t.eid, { id: t.eid, name: t.en })
}

const stations = Array.from(stationMap.values())
console.log(`Found ${stations.length} unique stations`)

// ─── Strip names from trips (save space — names are in stations) ─
const compactTrips = trips.map(t => ({
  sid: t.sid,
  eid: t.eid,
  h:   t.h,
  dur: t.dur,
  mem: t.mem,
  eb:  t.eb,
}))

// ─── Hourly stats ────────────────────────────────────────────────
const hourCounts = Array(24).fill(0)
for (const t of compactTrips) hourCounts[t.h]++
console.log('\nHourly trip counts:')
hourCounts.forEach((count, h) => {
  const bar = '█'.repeat(Math.round(count / 200))
  console.log(`  ${String(h).padStart(2,'0')}:00  ${String(count).padStart(6)}  ${bar}`)
})

// ─── Write output ────────────────────────────────────────────────
mkdirSync(OUT_DIR, { recursive: true })

const output = {
  meta: {
    month: 'January 2025',
    monthKey: '2025-01',
    totalTrips: compactTrips.length,
    generatedAt: new Date().toISOString(),
  },
  stations,    // [{ id, name }] — coordinates come from GBFS at runtime
  trips: compactTrips,  // [{ sid, eid, h, dur, mem, eb }]
}

const json = JSON.stringify(output)
writeFileSync(OUT_PATH, json)

const kb = (json.length / 1024).toFixed(1)
const mb = (json.length / 1024 / 1024).toFixed(2)
console.log(`\nWrote ${OUT_PATH}`)
console.log(`Size: ${kb} KB (${mb} MB)`)
console.log(`Total trips: ${compactTrips.length.toLocaleString()}`)
console.log(`Stations: ${stations.length}`)
console.log('\nDone.')

// ─── CSV line parser (handles quoted fields) ─────────────────────
function parseCSVLine(line) {
  const fields = []
  let current = ''
  let inQuotes = false

  for (let i = 0; i < line.length; i++) {
    const ch = line[i]
    if (ch === '"') {
      inQuotes = !inQuotes
    } else if (ch === ',' && !inQuotes) {
      fields.push(current)
      current = ''
    } else {
      current += ch
    }
  }
  fields.push(current)
  return fields
}
