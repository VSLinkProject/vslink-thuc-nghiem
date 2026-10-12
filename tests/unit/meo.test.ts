import { describe, expect, it } from 'vitest';
import { cauMeoMau, cacY, tamTrangTuMucDo } from '../../src/lib/meo/loi-meo';
import type { DuKien } from '../../src/lib/loi/danh-gia';

const duKien = (sua: Partial<DuKien> = {}): DuKien => ({
	tuMucTieu: 'Mẹ',
	mucDo: 'gan-dung',
	xepHang: 3,
	xacSuat: 0.12,
	tuDoan: 'Bố',
	xacSuatTuDoan: 0.41,
	top5: [{ tu: 'Bố', p: 0.41 }, { tu: 'Anh', p: 0.2 }, { tu: 'Mẹ', p: 0.12 }, { tu: 'Em', p: 0.05 }, { tu: 'Chị', p: 0.03 }],
	boPhan: { tayTrai: 'on', tayPhai: 'lech-nhieu', canhTay: 'hoi-lech' },
	giaiDoanLechNhat: 'cuoi',
	chatLuong: { soKhung: 40, thoiLuong: 1.6, fps: 25, tiLeTayTrai: 1, tiLeTayPhai: 1, tiLeNguoi: 1 },
	...sua
});

describe('Meo noi bang loi soan san', () => {
	it('gan dung: neu hang, tu bi nham, bo phan lech nhat truoc, giai doan', () => {
		const c = cauMeoMau(duKien(), () => 0);
		expect(c).toContain('“Mẹ”');
		expect(c).toContain('“Bố”');
		expect(c).toContain('bàn tay phải');
		expect(c).toContain('đoạn cuối');
		expect(c).not.toMatch(/undefined|NaN|\{/);
	});
	it('dung: khen, khong chi loi', () => {
		const d = duKien({ mucDo: 'dung', xepHang: 1, xacSuat: 0.83, tuDoan: 'Mẹ', boPhan: { tayTrai: 'on', tayPhai: 'khop', canhTay: 'on' }, giaiDoanLechNhat: null });
		const c = cauMeoMau(d, () => 0.5);
		expect(c).toContain('83%');
		expect(c).toContain('Bàn tay phải làm giống mẫu lắm');
		expect(tamTrangTuMucDo('dung')).toBe('vui');
	});
	it('phan lech nhieu duoc nhac truoc; it thay tay chi nhac nhe (tu mot tay la binh thuong)', () => {
		const y = cacY(duKien({ boPhan: { tayTrai: 'khong-thay', tayPhai: 'lech-nhieu', canhTay: 'on' } }));
		expect(y[0]).toContain('bàn tay phải');
		expect(y[1]).toContain('ít thấy bàn tay trái');
		expect(y[1]).toContain('Nếu từ này cần tay đó');
	});
	it('dung roi thi khong nhac tay it thay', () => {
		const d = duKien({ mucDo: 'dung', xepHang: 1, xacSuat: 0.7, tuDoan: 'Mẹ', boPhan: { tayTrai: 'khong-thay', tayPhai: 'on', canhTay: 'on' }, giaiDoanLechNhat: null });
		expect(cacY(d).join(' ')).not.toContain('ít thấy');
	});
});
