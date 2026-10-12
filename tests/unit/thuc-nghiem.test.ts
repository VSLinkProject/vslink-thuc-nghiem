import { describe, expect, it } from 'vitest';
import { BO_TU, KE_HOACH } from '../../src/lib/thuc-nghiem/cau-hinh';
import { boCuaTu, COT, csv, dapAn, docMa, keHoach, ngauNhien, thuTuTu } from '../../src/lib/thuc-nghiem/logic';
import { NHAN } from '../../src/lib/loi/tu-vung';
import videoMau from '../../static/du-lieu/video-mau.json';

describe('ma va nhom', () => {
	it('doc ma linh hoat, chuan hoa F07; sai dang -> null', () => {
		expect(docMa(' f7 ')).toMatchObject({ ma: 'F07', loai: 'F', so: 7, nhom: 3 });
		expect(docMa('F007')?.ma).toBe('F07');
		expect(docMa('T01')).toMatchObject({ loai: 'T', nhom: 1 });
		expect(docMa('F123')?.ma).toBe('F123');
		for (const sai of ['', 'F', 'F0', 'X01', 'F1a', '01', 'F1000']) expect(docMa(sai)).toBeNull();
	});

	it('phat ma theo thu tu -> 4 nhom deu nhau', () => {
		const dem = [0, 0, 0, 0];
		for (let so = 1; so <= 36; so++) dem[docMa(`F${so}`)!.nhom - 1]++;
		expect(dem).toEqual([9, 9, 9, 9]);
	});

	it('can bang: moi bo co phan hoi o dung 2 nhom, moi dieu kien hoc truoc o dung 2 nhom', () => {
		const ds = ([1, 2, 3, 4] as const).map((g) => keHoach(g));
		for (const bo of ['A', 'B'] as const) {
			expect(ds.filter((k) => k.some((l) => l.bo === bo && l.dk === 'co-phan-hoi'))).toHaveLength(2);
		}
		expect(ds.filter((k) => k[0].dk === 'co-phan-hoi')).toHaveLength(2);
		expect(ds.filter((k) => k[0].bo === 'A')).toHaveLength(2);
		// moi nguoi hoc ca hai bo va ca hai dieu kien
		for (const k of ds) {
			expect(new Set(k.map((l) => l.bo)).size).toBe(2);
			expect(new Set(k.map((l) => l.dk)).size).toBe(2);
		}
		expect(Object.keys(KE_HOACH)).toHaveLength(4);
	});
});

describe('hai bo tu', () => {
	it('8 tu khac nhau, co video da duyet (Khop tot), khong trung tu phan online', () => {
		const tat = [...BO_TU.A, ...BO_TU.B];
		expect(new Set(tat).size).toBe(8);
		const tep = videoMau as { tu: Record<string, { trang_thai: string; chinh?: { url: string } }> };
		for (const i of tat) {
			expect(tep.tu[String(i)]?.trang_thai, NHAN[i]).toBe('tot');
			expect(tep.tu[String(i)]?.chinh?.url).toMatch(/^https:/);
		}
		for (const tu of ['Mẹ', 'Sách', 'Đọc']) expect(tat.map((i) => NHAN[i])).not.toContain(tu);
		expect(boCuaTu(BO_TU.A[0])).toBe('A');
		expect(boCuaTu(BO_TU.B[3])).toBe('B');
		expect(boCuaTu(0)).toBeNull();
	});
});

describe('tron co hat giong', () => {
	it('cung ma -> cung thu tu; bai truoc va bai sau khac thu tu', () => {
		expect(thuTuTu('F01', 'truoc')).toEqual(thuTuTu('F01', 'truoc'));
		expect(thuTuTu('F01', 'truoc')).not.toEqual(thuTuTu('F01', 'sau'));
		expect([...thuTuTu('F05', 'sau')].sort()).toEqual([...BO_TU.A, ...BO_TU.B].sort());
		const r = ngauNhien('x');
		const a = Array.from({ length: 1000 }, r);
		expect(Math.min(...a)).toBeGreaterThanOrEqual(0);
		expect(Math.max(...a)).toBeLessThan(1);
	});

	it('4 dap an: co tu dung, khong trung, deu trong 8 tu; vi tri dap an dung thay doi', () => {
		const tat = [...BO_TU.A, ...BO_TU.B];
		const viTri = new Set<number>();
		for (const ma of ['F01', 'F02', 'F03', 'F04', 'F05', 'F06']) {
			for (const tu of tat) {
				const d = dapAn(ma, 'truoc', tu);
				expect(d).toHaveLength(4);
				expect(new Set(d).size).toBe(4);
				expect(d).toContain(tu);
				expect(d.every((x) => tat.includes(x))).toBe(true);
				viTri.add(d.indexOf(tu));
			}
		}
		expect(viTri.size).toBe(4);
	});
});

describe('CSV', () => {
	it('co BOM, dau dong la ten cot, thoat dau phay / ngoac kep', () => {
		const s = csv([{ id: 'a', ma: 'F01', ghi_chu: 'x, "y"', dung: true }]);
		expect(s.startsWith('﻿id,')).toBe(true);
		const [dau, dong] = s.slice(1).trim().split('\r\n');
		expect(dau.split(',')).toEqual(['id', ...COT]);
		expect(dong).toContain('"x, ""y"""');
		expect(dong.split(',')[COT.indexOf('dung') + 1]).toBe('1');
	});
});
