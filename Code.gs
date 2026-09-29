/**
 * Rekap Skor & Peringkat — Latihan Soal Mandiri (Pekan 3: Clustering, PCA & MCA)
 * -------------------------------------------------------------------------------
 * - Menerima nama & skor dari index.html (GitHub Pages) lalu menyimpannya
 *   ke sheet "Rekap Skor" pada spreadsheet ini.
 * - Mengembalikan PERINGKAT peserta secara anonim: hanya angka skor peserta
 *   lain yang dikirim ke browser, nama mereka TIDAK pernah dikirim.
 *
 * Peringkat memakai skor terbaik tiap peserta (berdasarkan nama) per latihan,
 * dibandingkan dengan skor kiriman peserta saat ini.
 *
 * Cara pasang: lihat README.md.
 */

const SHEET_NAME = 'Rekap Skor';
const HEADERS = [
  'Waktu Kirim', 'Nama', 'Unit Kerja', 'Latihan', 'Skor',
  'Benar', 'Salah', 'Kosong', 'Total Soal', 'Durasi', 'Jawaban', 'ID Kiriman'
];
// Indeks kolom (0-based) sesuai HEADERS
const COL = { nama: 1, latihan: 3, skor: 4, id: 11 };

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(15000);
  try {
    const d = JSON.parse(e.postData.contents);
    if (!d || !String(d.nama || '').trim()) {
      return json_({ ok: false, error: 'Nama kosong' });
    }
    const sheet = getSheet_();
    const id = clean_(d.id, 40);
    const latihan = clean_(d.latihan, 20);
    const nama = clean_(d.nama, 80);
    const skor = num_(d.skor);

    // Cegah baris ganda bila peserta menekan "Kirim Ulang"
    const rows = readRows_(sheet);
    const already = id && rows.some(function (r) { return String(r[COL.id]) === id; });

    if (!already) {
      sheet.appendRow([
        new Date(), nama, clean_(d.unit, 80), latihan, skor,
        num_(d.benar), num_(d.salah), num_(d.kosong), num_(d.total),
        clean_(d.durasi, 30), clean_(d.jawaban, 300), id
      ]);
      rows.push([null, nama, '', latihan, skor, '', '', '', '', '', '', id]);
    }
    return json_(Object.assign({ ok: true, duplicate: !!already }, ranking_(rows, latihan, nama, skor)));
  } catch (err) {
    return json_({ ok: false, error: String(err) });
  } finally {
    lock.releaseLock();
  }
}

/**
 * GET tanpa parameter  -> cek status script.
 * GET ?id=<ID Kiriman> -> peringkat terbaru untuk kiriman tersebut (anonim).
 */
function doGet(e) {
  const id = e && e.parameter && e.parameter.id ? String(e.parameter.id).slice(0, 40) : '';
  if (!id) return json_({ ok: true, status: 'Rekap skor aktif' });
  const rows = readRows_(getSheet_());
  const me = rows.filter(function (r) { return String(r[COL.id]) === id; })[0];
  if (!me) return json_({ ok: false, error: 'Kiriman tidak ditemukan' });
  return json_(Object.assign({ ok: true },
    ranking_(rows, String(me[COL.latihan]), String(me[COL.nama]), Number(me[COL.skor]))));
}

/** Hitung peringkat anonim. Nama peserta lain tidak pernah dikembalikan. */
function ranking_(rows, latihan, nama, skor) {
  const self = norm_(nama);
  const best = {};                       // skor terbaik per peserta lain
  rows.forEach(function (r) {
    if (String(r[COL.latihan]) !== latihan) return;
    const key = norm_(r[COL.nama]);
    const s = Number(r[COL.skor]);
    if (!key || key === self || !isFinite(s)) return;
    if (!(key in best) || s > best[key]) best[key] = s;
  });
  const others = Object.keys(best).map(function (k) { return best[k]; });
  const all = others.concat([skor]);
  const rank = 1 + others.filter(function (s) { return s > skor; }).length;
  const total = all.length;
  const avg = all.reduce(function (a, b) { return a + b; }, 0) / total;
  const board = others.map(function (s) { return { s: s, you: false }; })
    .concat([{ s: skor, you: true }])
    .sort(function (a, b) { return b.s - a.s || (a.you ? -1 : b.you ? 1 : 0); });
  return {
    rank: rank,
    total: total,
    avg: Math.round(avg * 10) / 10,
    max: Math.max.apply(null, all),
    min: Math.min.apply(null, all),
    board: board.slice(0, 200)          // hanya skor, tanpa nama
  };
}

function readRows_(sheet) {
  const last = sheet.getLastRow();
  if (last < 2) return [];
  return sheet.getRange(2, 1, last - 1, HEADERS.length).getValues();
}

function getSheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName(SHEET_NAME);
  if (!sh) sh = ss.insertSheet(SHEET_NAME);
  if (sh.getLastRow() === 0) {
    sh.appendRow(HEADERS);
    sh.setFrozenRows(1);
    sh.getRange(1, 1, 1, HEADERS.length)
      .setFontWeight('bold').setBackground('#0B1F4B').setFontColor('#FFFFFF');
    sh.getRange('A:A').setNumberFormat('dd/MM/yyyy HH:mm:ss');
  }
  return sh;
}

function norm_(v) {
  return String(v == null ? '' : v).replace(/^'/, '').trim().toLowerCase().replace(/\s+/g, ' ');
}

/** Potong panjang teks & cegah formula injection di spreadsheet. */
function clean_(v, max) {
  let s = String(v == null ? '' : v).trim().slice(0, max);
  if (/^[=+\-@]/.test(s)) s = "'" + s;
  return s;
}

function num_(v) {
  const n = Number(v);
  return isFinite(n) ? n : '';
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
