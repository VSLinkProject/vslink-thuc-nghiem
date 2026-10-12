// Chay tron mot luot thuc nghiem bang "nguoi que" gia lap (?gia-lap=1) va buoc hoc rut gon
// (?nhanh=1): nhap ma -> huong dan -> bai truoc -> hoc co / khong phan hoi -> cau hoi ->
// bai sau -> ky lai -> xong; kiem tra du lieu ghi lai va CSV o trang quan tri.
import { readFile } from 'node:fs/promises';
import { expect, test, type Page } from '@playwright/test';
import { anh, chuanBi } from './chung';

type Dong = Record<string, unknown>;
const duLieu = (page: Page) =>
	page.evaluate(() => (JSON.parse(localStorage.getItem('vslink-tn-du-lieu') ?? '[]') as { d: Dong }[]).map((m) => m.d));

async function lamBaiNhanDien(page: Page, tu: number) {
	for (let k = tu; k <= 8; k++) {
		await expect(page.getByTestId('dem-cau')).toHaveText(`Câu ${k}/8`);
		await expect(page.getByTestId('video-nhan-dien')).toHaveAttribute('src', /\.(mp4|webm)/);
		await page.locator('.dap-an').first().click();
		await page.getByRole('button', { name: k === 8 ? 'Xong phần này' : 'Câu tiếp' }).click();
	}
}

async function traLoiCauHoi(page: Page) {
	await expect(page.getByRole('heading', { name: 'Bạn thấy phần học vừa rồi thế nào?' })).toBeVisible();
	for (const fs of await page.locator('fieldset').all()) await fs.locator('label').nth(4).click();
	await page.getByRole('button', { name: 'Tiếp tục' }).click();
}

test('mot luot day du (G1: bo A co phan hoi truoc, bo B khong phan hoi sau)', async ({ page }, info) => {
	test.skip(info.project.name === 'dien-thoai', 'thuc nghiem chay tren laptop');
	test.setTimeout(300_000);
	const loi = await chuanBi(page);
	await page.goto('?gia-lap=1&nhanh=1');

	// ma sai -> bao loi; ma dung -> vao huong dan
	await page.getByTestId('o-ma').fill('X9');
	await page.getByTestId('dong-y').check();
	await page.getByTestId('bat-dau').click();
	await expect(page.getByRole('alert')).toContainText('Mã chưa đúng dạng');
	await page.getByTestId('o-ma').fill('t1');
	await page.getByTestId('o-may').fill('m3');
	await anh(page, info, 'tn-bat-dau');
	await page.getByTestId('bat-dau').click();

	await expect(page.getByTestId('tap-ok')).toBeVisible({ timeout: 30_000 });
	await anh(page, info, 'tn-huong-dan');
	await page.getByTestId('xong-huong-dan').click();

	await lamBaiNhanDien(page, 1);
	await expect(page.getByText('Phần học 1/2 · Có Mèo chấm')).toBeVisible();
	const o = page.getByTestId('o-phan-hoi');
	await expect(o).toHaveAttribute('data-dieu-kien', 'co-phan-hoi');
	await expect(page.getByTestId('tab-tu')).toHaveText(['Quả cam', 'Giám đốc', 'Siêu thị', 'Con rùa']);
	await expect(page.getByTestId('ket-luan')).toBeVisible({ timeout: 30_000 });
	await anh(page, info, 'tn-hoc-co-phan-hoi');
	await traLoiCauHoi(page);

	await expect(page.getByText('Phần học 2/2 · Tự tập theo video')).toBeVisible();
	await expect(o).toHaveAttribute('data-dieu-kien', 'khong-phan-hoi');
	await expect(page.getByTestId('tab-tu')).toHaveText(['Trứng', 'Mũ', 'Ngân hàng', 'Con bò']);
	await expect(page.getByTestId('tu-tap')).toContainText('Đã tập', { timeout: 30_000 });
	await expect(page.getByTestId('ket-luan')).toHaveCount(0);
	await expect(page.getByText('Mèo')).toHaveCount(0);
	await anh(page, info, 'tn-hoc-khong-phan-hoi');
	await traLoiCauHoi(page);

	// bai sau: lam 2 cau, tai lai -> van o cau 3
	for (let k = 1; k <= 2; k++) {
		await expect(page.getByTestId('dem-cau')).toHaveText(`Câu ${k}/8`);
		await page.locator('.dap-an').last().click(); // "Minh khong biet"
		await page.getByRole('button', { name: 'Câu tiếp' }).click();
	}
	await page.reload();
	await lamBaiNhanDien(page, 3);

	// ky lai 8 tu, khong xem mau, khong cham ra man hinh
	await expect(page.getByTestId('tu-ky-lai')).toBeVisible();
	await anh(page, info, 'tn-ky-lai');
	await expect(page.getByTestId('man-xong')).toBeVisible({ timeout: 200_000 });
	await anh(page, info, 'tn-xong');

	const ds = await duLieu(page);
	const dem = (sk: string) => ds.filter((d) => d.su_kien === sk).length;
	expect(ds.every((d) => d.ma === 'T01' && d.nhom === 'G1' && d.may === 'M3' && d.loai_ma === 'T')).toBe(true);
	expect(dem('nhan-dien')).toBe(16);
	expect(ds.filter((d) => d.su_kien === 'nhan-dien' && d.buoc === 'sau' && d.chon === 'Không biết')).toHaveLength(2);
	expect(dem('cau-hoi')).toBe(6);
	expect(dem('ky-lai') + dem('bo-qua')).toBe(8);
	expect(dem('tong-ket-tu')).toBe(8);
	expect(dem('ket-thuc')).toBe(1);
	const ky = ds.filter((d) => d.su_kien === 'ky');
	expect(ky.some((d) => d.dieu_kien === 'co-phan-hoi' && d.bo === 'A')).toBe(true);
	expect(ky.some((d) => d.dieu_kien === 'khong-phan-hoi' && d.bo === 'B')).toBe(true);
	expect(ky.every((d) => typeof d.hang === 'number' && typeof d.p === 'number')).toBe(true);
	const kyLai = ds.filter((d) => d.su_kien === 'ky-lai');
	expect(new Set(kyLai.map((d) => d.tu_i)).size).toBe(kyLai.length); // moi tu 1 lan

	// nguoi tiep theo -> ve man hinh nhap ma; ma T dung lai duoc
	await page.getByTestId('nguoi-tiep').click();
	await expect(page.getByTestId('o-ma')).toBeVisible();

	// quan tri: tai CSV co du so dong
	await page.goto('quan-tri/');
	await expect(page.getByTestId('chua-gui')).toHaveText(String(ds.length)); // chua cau hinh Sheet
	const [tai] = await Promise.all([page.waitForEvent('download'), page.getByTestId('tai-csv').click()]);
	const noiDung = await readFile((await tai.path())!, 'utf8');
	expect(noiDung.trim().split('\r\n')).toHaveLength(ds.length + 1);
	await anh(page, info, 'tn-quan-tri');
	expect(loi).toEqual([]);
});

test('ma F da lam tren may nay thi khong cho lam lai; nhom theo ma', async ({ page }, info) => {
	test.skip(info.project.name === 'dien-thoai', 'thuc nghiem chay tren laptop');
	const loi = await chuanBi(page);
	await page.goto('?gia-lap=1');
	await page.evaluate(() =>
		localStorage.setItem(
			'vslink-tn-du-lieu',
			JSON.stringify([{ d: { id: 'x', ma: 'F02', su_kien: 'bat-dau' }, gui: false }])
		)
	);
	await page.reload();
	await page.getByTestId('o-ma').fill('F2');
	await page.getByTestId('dong-y').check();
	await page.getByTestId('bat-dau').click();
	await expect(page.getByRole('alert')).toContainText('đã làm trên máy này');
	await page.getByTestId('o-ma').fill('F06');
	await page.getByTestId('bat-dau').click();
	await expect(page.getByTestId('xong-huong-dan')).toBeVisible();
	await expect(page.getByTestId('tap-ok')).toBeVisible({ timeout: 30_000 }); // cho tai xong roi moi roi trang
	await page.goto('quan-tri/');
	await expect(page.getByText('Mã F06 · Nhóm G2')).toBeVisible();
	await expect(page.getByText('Học trước: bộ A (khong-phan-hoi) · Học sau: bộ B (co-phan-hoi)')).toBeVisible();
	expect(loi).toEqual([]);
});

test('gui Google Sheet: loi thi giu lai, lan sau gui tiep, khong mat dong', async ({ page }, info) => {
	test.skip(info.project.name === 'dien-thoai', 'thuc nghiem chay tren laptop');
	const loi = await chuanBi(page);
	const API = 'https://script.google.com/macros/s/gia-lap/exec';
	await page.route('**/cau-hinh.json', (r) => r.fulfill({ json: { meo_api: '', ghi_api: API } }));
	let hong = true;
	const nhan: { id: string; ma: string }[] = [];
	await page.route(API, async (r) => {
		if (hong) return r.fulfill({ status: 500, json: { ok: false, loi: 'Sheet tam loi' } });
		const body = JSON.parse(r.request().postData() ?? '{}') as { dong: { id: string; ma: string }[] };
		nhan.push(...body.dong);
		return r.fulfill({ json: { ok: true, them: body.dong.length } });
	});
	await page.goto('?gia-lap=1');
	await page.getByTestId('o-ma').fill('T05');
	await page.getByTestId('dong-y').check();
	await page.getByTestId('bat-dau').click();
	await expect(page.getByTestId('tap-ok')).toBeVisible({ timeout: 30_000 });
	await page.goto('quan-tri/');
	await expect(page.getByText('Lỗi gửi gần nhất: Sheet tam loi')).toBeVisible();
	const conLai = Number(await page.getByTestId('chua-gui').textContent());
	expect(conLai).toBeGreaterThanOrEqual(2); // bat-dau, tap-camera
	hong = false;
	await page.getByRole('button', { name: 'Gửi ngay' }).click();
	await expect(page.getByTestId('chua-gui')).toHaveText('0');
	expect(nhan).toHaveLength(conLai);
	expect(new Set(nhan.map((d) => d.id)).size).toBe(conLai);
	expect(nhan.every((d) => d.ma === 'T05')).toBe(true);
	expect(loi.filter((x) => !/500/.test(x))).toEqual([]);
});
