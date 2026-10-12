// Trang thai mot luot tham gia + hang doi du lieu. Moi thu luu ngay vao localStorage:
// tai lai trang / mat dien giua chung -> lam tiep dung buoc cu, khong mat dong nao.
// Du lieu gui len Google Sheet (Apps Script) khi co mang; khong co thi nam cho trong may,
// trang /quan-tri/ tai CSV ra duoc bat cu luc nao.
import { base } from '$app/paths';
import { NHAN } from '$lib/loi/tu-vung';
import { csv, dinhDangGio, docMa, type Dong, type Ma } from './logic';

export const BUOC = ['bat-dau', 'huong-dan', 'truoc', 'hoc-1', 'hoi-1', 'hoc-2', 'hoi-2', 'sau', 'ky-lai', 'xong'] as const;
export type Buoc = (typeof BUOC)[number];

export type Phien = Ma & {
	id: string;
	may: string;
	buoc: Buoc;
	/** vi tri trong buoc (cau thu may) — de lam tiep sau khi tai lai */
	viTri: number;
	/** het gio cua buoc hoc dang chay (ms, Date.now) */
	hetGio: number | null;
	batDau: number;
};

const KHOA_PHIEN = 'vslink-tn-phien';
const KHOA_DU_LIEU = 'vslink-tn-du-lieu';
const KHOA_MAY = 'vslink-tn-may';

type MucDuLieu = { d: Dong; gui: boolean };

function doc<T>(khoa: string, macDinh: T): T {
	try {
		const s = localStorage.getItem(khoa);
		return s ? (JSON.parse(s) as T) : macDinh;
	} catch {
		return macDinh;
	}
}
function viet(khoa: string, gt: unknown) {
	try {
		if (gt === null) localStorage.removeItem(khoa);
		else localStorage.setItem(khoa, JSON.stringify(gt));
	} catch (e) {
		console.error('[thuc-nghiem] khong luu duoc vao may:', e);
	}
}

const idNgauNhien = () =>
	typeof crypto !== 'undefined' && 'randomUUID' in crypto
		? crypto.randomUUID().slice(0, 8)
		: Math.random().toString(36).slice(2, 10);

class Kho {
	phien = $state<Phien | null>(null);
	duLieu = $state<MucDuLieu[]>([]);
	may = $state('M1');
	api = $state('');
	dangGui = $state(false);
	loiGui = $state<string | null>(null);
	daNap = $state(false);
	private hen = 0;

	get chuaGui() {
		return this.duLieu.filter((m) => !m.gui).length;
	}

	nap() {
		if (this.daNap) return;
		this.phien = doc<Phien | null>(KHOA_PHIEN, null);
		this.duLieu = doc<MucDuLieu[]>(KHOA_DU_LIEU, []);
		this.may = doc<string>(KHOA_MAY, 'M1');
		this.daNap = true;
		fetch(`${base}/cau-hinh.json`, { cache: 'no-cache' })
			.then((r) => (r.ok ? r.json() : {}))
			.then((c: { ghi_api?: string }) => {
				this.api = (import.meta.env.VITE_GHI_API as string | undefined) || c.ghi_api || '';
				this.gui();
			})
			.catch(() => {});
		window.addEventListener('online', () => this.gui());
		this.hen = window.setInterval(() => this.chuaGui && this.gui(), 20_000);
	}

	datMay(may: string) {
		this.may = may.trim().toUpperCase() || 'M1';
		viet(KHOA_MAY, this.may);
	}

	/** Bat dau mot nguoi moi. Ma sai -> tra ve loi. */
	batDau(maVao: string): string | null {
		const m = docMa(maVao);
		if (!m) return 'Mã chưa đúng dạng. Ví dụ: F01, F12 (chạy thử dùng T01).';
		const daCo = this.duLieu.some((x) => x.d.ma === m.ma && x.d.su_kien === 'bat-dau');
		if (daCo && m.loai === 'F') return `Mã ${m.ma} đã làm trên máy này rồi. Kiểm tra lại mã, hoặc vào trang Quản trị nếu cần làm lại.`;
		this.phien = { ...m, id: idNgauNhien(), may: this.may, buoc: 'huong-dan', viTri: 0, hetGio: null, batDau: Date.now() };
		viet(KHOA_PHIEN, this.phien);
		this.ghi({ buoc: 'bat-dau', su_kien: 'bat-dau', ghi_chu: navigator.userAgent.slice(0, 160) });
		return null;
	}

	sangBuoc(buoc: Buoc, { hetGio = null }: { hetGio?: number | null } = {}) {
		if (!this.phien) return;
		this.phien.buoc = buoc;
		this.phien.viTri = 0;
		this.phien.hetGio = hetGio;
		viet(KHOA_PHIEN, this.phien);
		this.ghi({ buoc, su_kien: 'vao-buoc' });
	}

	datViTri(k: number) {
		if (!this.phien) return;
		this.phien.viTri = k;
		viet(KHOA_PHIEN, this.phien);
	}

	datHetGio(ms: number) {
		if (!this.phien) return;
		this.phien.hetGio = ms;
		viet(KHOA_PHIEN, this.phien);
	}

	/** Ket thuc luot (nguoi tiep theo). lyDo != null -> ghi them dong "dung giua chung". */
	ketThuc(lyDo: string | null = null) {
		if (this.phien && lyDo) this.ghi({ buoc: this.phien.buoc, su_kien: 'dung-giua-chung', ghi_chu: lyDo });
		this.phien = null;
		viet(KHOA_PHIEN, null);
		this.gui();
	}

	/** Them mot dong; tu dien ma / nhom / may / phien / luc. */
	ghi(d: Omit<Dong, 'id'>) {
		const p = this.phien;
		const dong: Dong = {
			id: `${p?.id ?? 'x'}-${this.duLieu.length}-${idNgauNhien().slice(0, 4)}`,
			luc: dinhDangGio(Date.now()),
			ma: p?.ma ?? '',
			loai_ma: p?.loai ?? '',
			nhom: p ? `G${p.nhom}` : '',
			may: p?.may ?? this.may,
			phien: p?.id ?? '',
			...d
		};
		if (typeof dong.tu_i === 'number' && dong.tu === undefined) dong.tu = NHAN[dong.tu_i];
		if (typeof dong.chon_i === 'number' && dong.chon === undefined) dong.chon = dong.chon_i >= 0 ? NHAN[dong.chon_i] : 'Không biết';
		this.duLieu.push({ d: dong, gui: false });
		viet(KHOA_DU_LIEU, $state.snapshot(this.duLieu));
		clearTimeout(this.henGui);
		this.henGui = window.setTimeout(() => this.gui(), 1500);
	}
	private henGui = 0;

	/** Gui cac dong chua gui (toi da 200 dong / lan). Loi thi giu lai, lan sau gui tiep. */
	async gui() {
		if (!this.api || this.dangGui || !this.chuaGui || (typeof navigator !== 'undefined' && navigator.onLine === false)) return;
		this.dangGui = true;
		const lo = this.duLieu.filter((m) => !m.gui).slice(0, 200);
		try {
			// text/plain: "simple request", Apps Script khong can preflight CORS
			const r = await fetch(this.api, { method: 'POST', body: JSON.stringify({ dong: lo.map((m) => m.d) }) });
			const j = (await r.json().catch(() => ({}))) as { ok?: boolean; loi?: string };
			if (!r.ok || !j.ok) throw new Error(j.loi || `HTTP ${r.status}`);
			const da = new Set(lo.map((m) => m.d.id));
			for (const m of this.duLieu) if (da.has(m.d.id)) m.gui = true;
			viet(KHOA_DU_LIEU, $state.snapshot(this.duLieu));
			this.loiGui = null;
		} catch (e) {
			this.loiGui = String((e as Error)?.message ?? e);
		} finally {
			this.dangGui = false;
		}
		if (this.chuaGui && !this.loiGui) this.gui();
	}

	csv(): string {
		return csv(this.duLieu.map((m) => m.d));
	}

	/** Xoa du lieu da GUI XONG khoi may (giu dong chua gui). */
	donDaGui() {
		this.duLieu = this.duLieu.filter((m) => !m.gui);
		viet(KHOA_DU_LIEU, $state.snapshot(this.duLieu));
	}

	huy() {
		clearInterval(this.hen);
	}
}

export const kho = new Kho();
