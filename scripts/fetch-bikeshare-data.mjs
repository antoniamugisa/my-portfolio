import https from 'https';
import { writeFileSync, mkdirSync, readdirSync, readFileSync, existsSync } from 'fs';
import { join } from 'path';
import AdmZip from 'adm-zip';

const LOCAL_CSV_DIR = 'public/data/bikeshare-ridership-2025';

const PACKAGE_ID = '7e876c24-177c-4605-9cef-e50dd74c617f';

function httpsGet(url, asBuffer = false) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        httpsGet(res.headers.location, asBuffer).then(resolve).catch(reject);
        return;
      }
      const chunks = [];
      res.on('data', (c) => chunks.push(c));
      res.on('end', () => {
        const buf = Buffer.concat(chunks);
        resolve(asBuffer ? buf : buf.toString());
      });
      res.on('error', reject);
    });
    req.on('error', reject);
  });
}

/**
 * Parse CSV row handling quoted fields
 */
function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === '"') {
      inQuotes = !inQuotes;
    } else if ((c === ',' && !inQuotes) || c === '\n' || c === '\r') {
      result.push(current.trim());
      current = '';
      if (c !== ',') break;
    } else {
      current += c;
    }
  }
  result.push(current.trim());
  return result;
}

/**
 * Process raw CSV into hourly buckets. Returns { totalTrips, dataMonth, hourlyBuckets }.
 * We don't have station map at build time so we keep all station IDs; client filters by station map.
 */
function processTrips(csvText) {
  const lines = csvText.split(/\r?\n/).filter((l) => l.trim());
  if (lines.length < 2) return { totalTrips: 0, dataMonth: '', hourlyBuckets: [] };

  const headerLine = lines[0];
  const headers = headerLine.split(',').map((h) => h.trim().replace(/\s+/g, ' '));
  const rows = lines.slice(1);

  const hourlyBuckets = Array.from({ length: 24 }, (_, hour) => ({ hour, trips: [], count: 0 }));

  let totalTrips = 0;
  let dataMonth = '';

  for (const line of rows) {
    if (!line.trim()) continue;
    const values = parseCSVLine(line);
    const row = {};
    headers.forEach((h, i) => {
      row[h] = values[i] ?? '';
    });

    const durationStr = row['Trip  Duration'] ?? row['Trip Duration'] ?? row['Trip_Duration'] ?? '';
    const startIdStr = row['Start Station Id'] ?? row['Start_Station_Id'] ?? '';
    const stopIdStr = row['Stop Station Id'] ?? row['End_Station_Id'] ?? '';
    const startTimeStr = row['Start Time'] ?? row['Start_Time'] ?? '';
    const userType = (row['User Type'] ?? row['User_Type'] ?? '').toLowerCase();
    const model = (row['model'] ?? row['Model'] ?? row['Bike_Model'] ?? '').toUpperCase();

    const startId = parseInt(startIdStr, 10);
    const stopId = parseInt(stopIdStr, 10);
    const duration = parseInt(durationStr, 10);

    if (Number.isNaN(startId) || Number.isNaN(stopId) || startId <= 0 || stopId <= 0) continue;
    if (Number.isNaN(duration) || duration < 60 || duration > 3 * 3600) continue;

    const startDate = new Date(startTimeStr);
    if (Number.isNaN(startDate.getTime())) continue;
    const startHour = startDate.getHours();
    const startMinute = startDate.getMinutes();

    if (!dataMonth && startTimeStr) {
      dataMonth = startDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    }

    const isMember = userType.includes('annual') || userType === 'member';
    const isEbike = model === 'BOOST' || model.includes('EFIT') || (model !== 'ICONIC' && model.length > 0);

    const trip = {
      startStationId: startId,
      endStationId: stopId,
      startHour,
      startMinute,
      durationSeconds: duration,
      isMember,
      isEbike,
    };

    hourlyBuckets[startHour].trips.push(trip);
    hourlyBuckets[startHour].count += 1;
    totalTrips += 1;
  }

  return { totalTrips, dataMonth, hourlyBuckets };
}

const MAX_TRIPS_PER_HOUR = 300;

function sample(arr, max) {
  if (arr.length <= max) return arr;
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, max);
}

function mergeProcessed(a, b) {
  const hourlyBuckets = Array.from({ length: 24 }, (_, hour) => ({
    hour,
    trips: [...(a.hourlyBuckets[hour]?.trips ?? []), ...(b.hourlyBuckets[hour]?.trips ?? [])],
    count: (a.hourlyBuckets[hour]?.count ?? 0) + (b.hourlyBuckets[hour]?.count ?? 0),
  }));
  return {
    totalTrips: a.totalTrips + b.totalTrips,
    dataMonth: a.dataMonth || b.dataMonth,
    hourlyBuckets,
  };
}

const GBFS_URL = 'https://tor.publicbikesystem.net/ube/gbfs/v1/en/station_information';

async function main() {
  mkdirSync('public/data', { recursive: true });

  console.log('Fetching station data (GBFS)...');
  const stationsJson = await httpsGet(GBFS_URL);
  const gbfs = JSON.parse(stationsJson);
  const rawStations = gbfs?.data?.stations ?? [];
  const stations = rawStations.map((s) => ({
    id: parseInt(s.station_id, 10),
    name: s.name,
    lat: s.lat,
    lng: s.lon,
    capacity: s.capacity ?? 10,
  }));
  writeFileSync('public/data/bikeshare-stations.json', JSON.stringify({ stations }), 'utf8');
  console.log('Stations:', stations.length);

  let processed = { totalTrips: 0, dataMonth: '', hourlyBuckets: Array.from({ length: 24 }, (_, h) => ({ hour: h, trips: [], count: 0 })) };
  let csvCount = 0;

  if (existsSync(LOCAL_CSV_DIR)) {
    const files = readdirSync(LOCAL_CSV_DIR)
      .filter((f) => f.toLowerCase().endsWith('.csv'))
      .sort();
    if (files.length > 0) {
      console.log('Using local CSVs from', LOCAL_CSV_DIR + '/', '(' + files.length, 'files)...');
      for (const file of files) {
        const csvPath = join(LOCAL_CSV_DIR, file);
        const csvText = readFileSync(csvPath, 'utf8');
        const next = processTrips(csvText);
        processed = mergeProcessed(processed, next);
        csvCount++;
      }
    }
  }

  if (csvCount === 0) {
    console.log('No local CSVs found. Fetching ZIP from Open Data...');
    const pkgJson = await httpsGet(
      `https://ckan0.cf.opendata.inter.prod-toronto.ca/api/3/action/package_show?id=${PACKAGE_ID}`
    );
    const pkg = JSON.parse(pkgJson).result;
    if (!pkg || !pkg.resources) {
      throw new Error('Invalid package response');
    }
    const zipResources = pkg.resources
      .filter((r) => (r.format || '').toUpperCase() === 'ZIP')
      .sort((a, b) => new Date(b.last_modified || 0) - new Date(a.last_modified || 0));
    if (zipResources.length === 0) {
      throw new Error('No ZIP resource found. Place CSVs in ' + LOCAL_CSV_DIR + ' or check package.');
    }
    const useYear = process.env.BIKESHARE_YEAR;
    const latest = useYear
      ? zipResources.find((r) => (r.name || '').includes(useYear)) || zipResources[0]
      : zipResources[0];
    console.log('Fetching:', latest.name, '(ZIP, may take a minute)...');
    const zipBuffer = await httpsGet(latest.url, true);
    const zip = new AdmZip(zipBuffer);
    const entries = zip.getEntries();
    for (const entry of entries) {
      const name = (entry.entryName || '').toLowerCase();
      if (!name.endsWith('.csv')) continue;
      csvCount++;
      const csvText = entry.getData().toString('utf8');
      const next = processTrips(csvText);
      processed = mergeProcessed(processed, next);
    }
    if (csvCount === 0) {
      throw new Error('No CSV files found inside the ZIP.');
    }
  }

  processed.hourlyBuckets = processed.hourlyBuckets.map((b) => ({
    hour: b.hour,
    count: b.count,
    trips: sample(b.trips, MAX_TRIPS_PER_HOUR),
  }));

  writeFileSync('public/data/bikeshare-processed.json', JSON.stringify(processed), 'utf8');
  console.log('Done —', processed.totalTrips.toLocaleString(), 'trips from', csvCount, 'CSV(s). Month:', processed.dataMonth || 'N/A');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
