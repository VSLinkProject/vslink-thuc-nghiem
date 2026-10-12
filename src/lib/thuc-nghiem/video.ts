// Video mau cua 8 tu thuc nghiem. Uu tien tep dat san trong static/video/<i>.mp4
// (npm run tai-video) de khong phu thuoc wifi truong; chua co thi dung link QIPEDC
// trong static/du-lieu/video-mau.json.
import { base } from '$app/paths';
import { napVideoMau, type VideoMau } from '$lib/loi/video-mau';
import { BO_TU } from './cau-hinh';

export const TAT_CA_TU = [...BO_TU.A, ...BO_TU.B];
export const duongDanTaiCho = (i: number) => `${base}/video/${i}.mp4`;

async function coTep(url: string): Promise<boolean> {
	try {
		const r = await fetch(url, { method: 'HEAD', cache: 'no-cache' });
		return r.ok && (r.headers.get('content-type') ?? '').startsWith('video/');
	} catch {
		return false;
	}
}

let hua: Promise<Record<number, VideoMau | null>> | null = null;

/** Mot video duy nhat cho moi tu (cach ky mo hinh cham), khong hien cac mien khac. */
export function napVideoThucNghiem(): Promise<Record<number, VideoMau | null>> {
	hua ??= (async () => {
		const tep = await napVideoMau();
		const ra: Record<number, VideoMau | null> = {};
		await Promise.all(
			TAT_CA_TU.map(async (i) => {
				const chinh = tep.tu[String(i)]?.chinh ?? null;
				ra[i] = (await coTep(duongDanTaiCho(i))) ? { ...(chinh ?? {}), url: duongDanTaiCho(i) } : chinh;
			})
		);
		return ra;
	})();
	return hua;
}

/** Tai truoc ca 8 video vao bo nho dem trinh duyet. Tra ve so video tai duoc. */
export async function taiTruocVideo(): Promise<{ ok: number; loi: string[] }> {
	const ds = await napVideoThucNghiem();
	const loi: string[] = [];
	let ok = 0;
	await Promise.all(
		TAT_CA_TU.map(async (i) => {
			const v = ds[i];
			if (!v) return loi.push(`#${i}: chưa có video`);
			try {
				const taiCho = v.url.startsWith(base + '/') || v.url.startsWith('/');
				// link QIPEDC khong mo CORS: tai kieu no-cors van vao bo nho dem cua trinh duyet
				const r = await fetch(v.url, taiCho ? {} : { mode: 'no-cors' });
				if (!r.ok && r.type !== 'opaque') throw new Error(`HTTP ${r.status}`);
				await r.blob();
				ok++;
			} catch (e) {
				loi.push(`#${i}: ${(e as Error).message}`);
			}
		})
	);
	return { ok, loi };
}
