<!--
	Trang cho nguoi huong dan (Nguoi 2). Khong co link tu trang chinh: go /quan-tri/.
	Kiem tra may truoc ca, xem du lieu da gui chua, tai CSV du phong, huy luot loi.
-->
<script lang="ts">
	import { onMount } from 'svelte';
	import { base } from '$app/paths';
	import { kho } from '$lib/thuc-nghiem/kho.svelte';
	import { keHoach } from '$lib/thuc-nghiem/logic';
	import { BO_TU } from '$lib/thuc-nghiem/cau-hinh';
	import { taiTruocVideo } from '$lib/thuc-nghiem/video';
	import { napMoHinh, chayMoHinh } from '$lib/loi/mo-hinh';
	import { napHolistic } from '$lib/loi/nhan-dang';
	import { NHAN } from '$lib/loi/tu-vung';
	import { SO_DIEM, SO_KHUNG } from '$lib/loi/hang-so';
	import Download from '@lucide/svelte/icons/download';
	import Send from '@lucide/svelte/icons/send';
	import CircleCheck from '@lucide/svelte/icons/circle-check';
	import CircleX from '@lucide/svelte/icons/circle-x';

	onMount(() => kho.nap());

	type Muc = { ten: string; ok: boolean | null; chi: string };
	let kiem = $state<Muc[]>([]);
	let dangKiem = $state(false);

	async function kiemTra() {
		dangKiem = true;
		kiem = [
			{ ten: 'Mô hình ký hiệu (14 MB)', ok: null, chi: '' },
			{ ten: 'Bộ nhận dáng người MediaPipe', ok: null, chi: '' },
			{ ten: '8 video mẫu', ok: null, chi: '' },
			{ ten: 'Gửi dữ liệu lên Google Sheet', ok: null, chi: '' }
		];
		const t0 = performance.now();
		try {
			await napMoHinh();
			await chayMoHinh(new Float32Array(SO_KHUNG * SO_DIEM * 2));
			kiem[0] = { ...kiem[0], ok: true, chi: `${Math.round(performance.now() - t0)} ms` };
		} catch (e) {
			kiem[0] = { ...kiem[0], ok: false, chi: String(e) };
		}
		try {
			await napHolistic();
			kiem[1] = { ...kiem[1], ok: true, chi: 'đã tải' };
		} catch (e) {
			kiem[1] = { ...kiem[1], ok: false, chi: String(e) };
		}
		const v = await taiTruocVideo();
		kiem[2] = { ...kiem[2], ok: v.ok === 8, chi: `${v.ok}/8 ${v.loi.join('; ')}` };
		if (!kho.api) kiem[3] = { ...kiem[3], ok: false, chi: 'Chưa có ghi_api trong cau-hinh.json — dữ liệu chỉ nằm trong máy, nhớ tải CSV.' };
		else {
			await kho.gui();
			kiem[3] = { ...kiem[3], ok: !kho.loiGui, chi: kho.loiGui ?? `còn ${kho.chuaGui} dòng chưa gửi` };
		}
		dangKiem = false;
	}

	function taiCsv() {
		const blob = new Blob([kho.csv()], { type: 'text/csv;charset=utf-8' });
		const a = document.createElement('a');
		a.href = URL.createObjectURL(blob);
		const d = new Date();
		a.download = `vslink-thuc-nghiem-${kho.may}-${d.getMonth() + 1}-${d.getDate()}-${d.getHours()}h${d.getMinutes()}.csv`;
		a.click();
		setTimeout(() => URL.revokeObjectURL(a.href), 1000);
	}

	const daXong = $derived(
		[...new Set(kho.duLieu.filter((m) => m.d.su_kien === 'ket-thuc' && m.d.loai_ma === 'F').map((m) => `${m.d.ma}|${m.d.nhom}`))].map(
			(x) => x.split('|')
		)
	);
	const theoNhom = $derived(
		['G1', 'G2', 'G3', 'G4'].map((g) => ({ g, n: daXong.filter(([, nhom]) => nhom === g).length }))
	);
	let may = $state('');
	$effect(() => {
		if (kho.daNap && !may) may = kho.may;
	});
</script>

<svelte:head><title>Quản trị · VSLink Thực nghiệm</title></svelte:head>

<div class="khung-trang quan-tri">
	<h1>Quản trị máy {kho.may}</h1>
	<p><a href="{base}/">← Về màn hình người tham gia</a> · <a href="{base}/kiem-tra/">Kiểm tra hệ thống chi tiết</a></p>

	<section class="the">
		<h2>1. Trước mỗi buổi</h2>
		<label class="hang">
			Tên máy này
			<input bind:value={may} />
			<button class="nut vien nho" onclick={() => kho.datMay(may)}>Lưu</button>
		</label>
		<button class="nut" onclick={kiemTra} disabled={dangKiem} data-testid="kiem-tra-san-sang">
			{dangKiem ? 'Đang kiểm tra…' : 'Kiểm tra sẵn sàng'}
		</button>
		{#if kiem.length}
			<ul class="kiem">
				{#each kiem as m (m.ten)}
					<li data-ok={m.ok}>
						{#if m.ok === true}<CircleCheck size={18} />{:else if m.ok === false}<CircleX size={18} />{:else}…{/if}
						<b>{m.ten}</b> <span>{m.chi}</span>
					</li>
				{/each}
			</ul>
		{/if}
	</section>

	<section class="the">
		<h2>2. Dữ liệu trên máy này</h2>
		<p>
			{kho.duLieu.length} dòng · <b data-testid="chua-gui">{kho.chuaGui}</b> dòng chưa gửi ·
			{kho.api ? 'đã cấu hình Google Sheet' : 'CHƯA cấu hình Google Sheet'}
			{#if kho.loiGui}<br /><span class="loi">Lỗi gửi gần nhất: {kho.loiGui}</span>{/if}
		</p>
		<div class="nut-ds">
			<button class="nut" onclick={taiCsv} data-testid="tai-csv"><Download size={18} /> Tải CSV</button>
			<button class="nut vien" onclick={() => kho.gui()} disabled={!kho.api || !kho.chuaGui}><Send size={18} /> Gửi ngay</button>
			<button
				class="nut vien"
				disabled={!kho.duLieu.some((m) => m.gui)}
				onclick={() => confirm('Xoá khỏi máy các dòng ĐÃ gửi lên Sheet? (dòng chưa gửi vẫn giữ)') && kho.donDaGui()}
			>
				Dọn dòng đã gửi
			</button>
		</div>
		<p>Người làm xong (mã F) trên máy này: <b>{daXong.length}</b> — {theoNhom.map((x) => `${x.g}: ${x.n}`).join(' · ')}</p>
	</section>

	<section class="the">
		<h2>3. Lượt đang chạy</h2>
		{#if kho.phien}
			{@const kh = keHoach(kho.phien.nhom)}
			<p>
				Mã <b>{kho.phien.ma}</b> · Nhóm <b>G{kho.phien.nhom}</b> · Bước <b>{kho.phien.buoc}</b> (câu {kho.phien.viTri + 1})<br />
				Học trước: bộ {kh[0].bo} ({kh[0].dk}) · Học sau: bộ {kh[1].bo} ({kh[1].dk})
			</p>
			<button
				class="nut vien"
				onclick={() => {
					const l = prompt('Huỷ lượt này? Ghi lý do:');
					if (l !== null) kho.ketThuc(l || 'huỷ từ trang quản trị');
				}}>Huỷ lượt này</button
			>
		{:else}
			<p>Không có lượt nào đang chạy.</p>
		{/if}
	</section>

	<section class="the">
		<h2>Hai bộ từ</h2>
		<p>Bộ A: {BO_TU.A.map((i) => NHAN[i]).join(', ')}<br />Bộ B: {BO_TU.B.map((i) => NHAN[i]).join(', ')}</p>
	</section>
</div>

<style>
	.quan-tri {
		display: grid;
		gap: 16px;
		max-width: 820px;
	}
	h1,
	h2,
	p {
		margin: 0;
	}
	section {
		display: grid;
		gap: 10px;
	}
	.hang {
		display: flex;
		gap: 8px;
		align-items: center;
		font-weight: 800;
	}
	.hang input {
		width: 90px;
		padding: 8px 10px;
		border-radius: var(--bo-nho);
		border: 2px solid var(--vien);
		font: inherit;
	}
	.kiem {
		margin: 0;
		padding: 0;
		list-style: none;
		display: grid;
		gap: 6px;
	}
	.kiem li {
		display: flex;
		gap: 8px;
		align-items: center;
		flex-wrap: wrap;
	}
	.kiem li[data-ok='true'] {
		color: var(--xanh-la-chu);
	}
	.kiem li[data-ok='false'] {
		color: var(--do-chu);
	}
	.kiem span {
		color: var(--chu-phu);
		font-size: 0.9rem;
	}
	.nut-ds {
		display: flex;
		gap: 10px;
		flex-wrap: wrap;
	}
	.loi {
		color: var(--do-chu);
	}
</style>
