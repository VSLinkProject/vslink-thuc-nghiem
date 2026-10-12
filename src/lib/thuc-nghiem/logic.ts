// Phan thuan (khong phu thuoc trinh duyet / SvelteKit): doc ma, chia nhom, tron co hat
// giong, tao dap an, dong du lieu, CSV. Unit test o tests/unit/thuc-nghiem.test.ts.
import { BO_TU, KE_HOACH, type DieuKien, type MaBo, type Nhom } from './cau-hinh';

export type Ma = {
	ma: string;
	/** F = chinh thuc, T = chay thu (du lieu van ghi nhung danh dau de loai khi phan tich) */
	loai: 'F' | 'T';
	so: number;
	nhom: Nhom;
};

/** "f7", "F07", " F007 " -> F07. Sai dinh dang -> null. */
export function docMa(vao: string): Ma | null {
	const m = /^\s*([FfTt])\s*0*(\d{1,3})\s*$/.exec(vao);
	if (!m) return null;
	const so = Number(m[2]);
	if (so < 1 || so > 999) return null;
	const loai = m[1].toUpperCase() as 'F' | 'T';
	return { ma: `${loai}${String(so).padStart(2, '0')}`, loai, so, nhom: (((so - 1) % 4) + 1) as Nhom };
}

export type LuotHoc = { lan: 1 | 2; bo: MaBo; dk: DieuKien; tu: number[] };

export function keHoach(nhom: Nhom): [LuotHoc, LuotHoc] {
	const [a, b] = KE_HOACH[nhom];
	return [
		{ lan: 1, bo: a.bo, dk: a.dk, tu: BO_TU[a.bo] },
		{ lan: 2, bo: b.bo, dk: b.dk, tu: BO_TU[b.bo] }
	];
}

export function boCuaTu(i: number): MaBo | null {
	return BO_TU.A.includes(i) ? 'A' : BO_TU.B.includes(i) ? 'B' : null;
}

/** So ngau nhien co hat giong (mulberry32 tren bam FNV-1a) — cung chuoi luon ra cung day. */
export function ngauNhien(hat: string): () => number {
	let h = 2166136261;
	for (let k = 0; k < hat.length; k++) {
		h ^= hat.charCodeAt(k);
		h = Math.imul(h, 16777619);
	}
	let a = h >>> 0;
	return () => {
		a = (a + 0x6d2b79f5) >>> 0;
		let t = a;
		t = Math.imul(t ^ (t >>> 15), t | 1);
		t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
		return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
	};
}

export function tron<T>(ds: T[], r: () => number): T[] {
	const a = ds.slice();
	for (let k = a.length - 1; k > 0; k--) {
		const j = Math.floor(r() * (k + 1));
		[a[k], a[j]] = [a[j], a[k]];
	}
	return a;
}

export type PhanBai = 'truoc' | 'sau' | 'ky-lai';

/** 8 tu cua hai bo, thu tu tron theo ma + phan bai (bai truoc va bai sau khac thu tu). */
export function thuTuTu(ma: string, phan: PhanBai): number[] {
	return tron([...BO_TU.A, ...BO_TU.B], ngauNhien(`${ma}|${phan}`));
}

/** 4 dap an: tu dung + 3 tu khac trong 8 tu (de khong doan duoc nho la tu chua gap). */
export function dapAn(ma: string, phan: PhanBai, tu: number): number[] {
	const r = ngauNhien(`${ma}|${phan}|${tu}`);
	const khac = tron([...BO_TU.A, ...BO_TU.B].filter((x) => x !== tu), r).slice(0, 3);
	return tron([tu, ...khac], r);
}

// ---- Dong du lieu (moi su kien mot dong, cot co dinh de Google Sheet / CSV giu thu tu) ----

export const COT = [
	'luc',
	'ma',
	'loai_ma',
	'nhom',
	'may',
	'phien',
	'buoc',
	'su_kien',
	'lan',
	'bo',
	'dieu_kien',
	'tu_i',
	'tu',
	'chon_i',
	'chon',
	'dung',
	'hang',
	'p',
	'top1',
	'top5',
	'tu_doan',
	'cau',
	'diem',
	'ms',
	'thoi_luong',
	'fps',
	'ghi_chu'
] as const;
export type Cot = (typeof COT)[number];
export type Dong = Partial<Record<Cot, string | number | boolean | null>> & { id: string };

function oCsv(v: unknown): string {
	if (v === null || v === undefined) return '';
	const s = typeof v === 'boolean' ? (v ? '1' : '0') : String(v);
	return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

/** CSV co BOM de Excel mo dung tieng Viet. */
export function csv(ds: Dong[]): string {
	const dong = [['id', ...COT].join(','), ...ds.map((d) => [d.id, ...COT.map((c) => d[c])].map(oCsv).join(','))];
	return '﻿' + dong.join('\r\n') + '\r\n';
}

export function dinhDangGio(ms: number): string {
	const d = new Date(ms);
	const h = (n: number) => String(n).padStart(2, '0');
	return `${d.getFullYear()}-${h(d.getMonth() + 1)}-${h(d.getDate())} ${h(d.getHours())}:${h(d.getMinutes())}:${h(d.getSeconds())}`;
}
