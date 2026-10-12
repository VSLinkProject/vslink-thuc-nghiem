// Tai 8 video mau cua thuc nghiem ve static/video/<i>.mp4 de web chay khong can QIPEDC.
// Chay: npm run tai-video  (GitHub Actions cung tu chay truoc khi dung web).
// Video thuoc Tu dien NNKH — du an QIPEDC (Bo GD&DT): KHONG dua len git (.gitignore).
import { mkdirSync, readFileSync, writeFileSync, existsSync, statSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const goc = join(dirname(fileURLToPath(import.meta.url)), '..');
const cauHinh = readFileSync(join(goc, 'src/lib/thuc-nghiem/cau-hinh.ts'), 'utf8');
const m = /export const BO_TU[^=]*=\s*\{\s*A:\s*\[([^\]]+)\],\s*B:\s*\[([^\]]+)\]/.exec(cauHinh);
if (!m) {
	console.error('[tai-video] khong doc duoc BO_TU trong cau-hinh.ts');
	process.exit(1);
}
const tu = [...m[1].split(','), ...m[2].split(',')].map((x) => Number(x.trim()));
const videoMau = JSON.parse(readFileSync(join(goc, 'static/du-lieu/video-mau.json'), 'utf8'));
const thuMuc = join(goc, 'static/video');
mkdirSync(thuMuc, { recursive: true });

let loi = 0;
for (const i of tu) {
	const den = join(thuMuc, `${i}.mp4`);
	if (existsSync(den) && statSync(den).size > 10_000) continue;
	const url = videoMau.tu[String(i)]?.chinh?.url;
	if (!url) {
		console.error(`[tai-video] tu #${i} chua co video da duyet`);
		loi++;
		continue;
	}
	try {
		const r = await fetch(url);
		if (!r.ok) throw new Error(`HTTP ${r.status}`);
		writeFileSync(den, Buffer.from(await r.arrayBuffer()));
		console.log(`[tai-video] #${i} <- ${url}`);
	} catch (e) {
		console.error(`[tai-video] #${i} loi: ${e.message} (web se dung link QIPEDC)`);
		loi++;
	}
}
console.log(`[tai-video] xong, ${tu.length - loi}/${tu.length} video co san`);
