/**
 * Nhan du lieu thuc nghiem VSLink va ghi vao Google Sheet.
 * Cach cai (lam MOT lan):
 *   1. Tao Google Sheet moi (rieng cho thuc nghiem, KHONG dung chung sheet gop y).
 *   2. Extensions -> Apps Script -> dan toan bo tep nay -> Save.
 *   3. Deploy -> New deployment -> Web app
 *        Execute as: Me   ·   Who has access: Anyone
 *   4. Chep "Web app URL" (https://script.google.com/macros/s/.../exec) vao
 *      static/cau-hinh.json -> "ghi_api" (hoac bien GHI_API cua repo tren GitHub).
 * Moi dong co cot id: gui lai (mat mang roi gui tiep) khong bi ghi trung.
 */
var TEN_TRANG = 'du_lieu';
var COT = ['id', 'luc', 'ma', 'loai_ma', 'nhom', 'may', 'phien', 'buoc', 'su_kien', 'lan', 'bo', 'dieu_kien', 'tu_i', 'tu',
  'chon_i', 'chon', 'dung', 'hang', 'p', 'top1', 'top5', 'tu_doan', 'cau', 'diem', 'ms', 'thoi_luong', 'fps', 'ghi_chu',
  'nhan_luc'];

function traVe(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

function doGet() {
  return traVe({ ok: true, ten: 'vslink-thuc-nghiem' });
}

function doPost(e) {
  var khoa = LockService.getScriptLock();
  khoa.waitLock(20000);
  try {
    var vao = JSON.parse(e.postData.contents || '{}');
    var ds = Array.isArray(vao.dong) ? vao.dong.slice(0, 500) : [];
    var trang = SpreadsheetApp.getActive().getSheetByName(TEN_TRANG) || SpreadsheetApp.getActive().insertSheet(TEN_TRANG);
    if (trang.getLastRow() === 0) trang.appendRow(COT);
    var n = trang.getLastRow();
    var daCo = {};
    if (n > 1) trang.getRange(2, 1, n - 1, 1).getValues().forEach(function (r) { daCo[r[0]] = true; });
    var bayGio = new Date();
    var moi = [];
    ds.forEach(function (d) {
      if (!d || typeof d.id !== 'string' || daCo[d.id]) return;
      daCo[d.id] = true;
      moi.push(COT.map(function (c) {
        if (c === 'nhan_luc') return bayGio;
        var v = d[c];
        if (v === null || v === undefined) return '';
        if (typeof v === 'boolean') return v ? 1 : 0;
        return typeof v === 'string' ? v.slice(0, 500) : v;
      }));
    });
    if (moi.length) trang.getRange(n + 1, 1, moi.length, COT.length).setValues(moi);
    return traVe({ ok: true, them: moi.length });
  } catch (err) {
    return traVe({ ok: false, loi: String(err) });
  } finally {
    khoa.releaseLock();
  }
}
