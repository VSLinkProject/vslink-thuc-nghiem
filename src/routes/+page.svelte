<!--
	Luong mot nguoi tham gia (mot chieu, khong quay lai):
	bat-dau -> huong-dan -> truoc -> hoc-1 -> hoi-1 -> hoc-2 -> hoi-2 -> sau -> ky-lai -> xong
	Trang thai luu trong may (kho.svelte.ts): tai lai trang thi lam tiep dung buoc.
	?gia-lap=1 : "nguoi que" ky thay camera (chay thu khong can webcam)
	?nhanh=1   : buoc hoc chi vai giay (nhom chay thu luong)
-->
<script lang="ts">
	import { onMount } from 'svelte';
	import { kho, BUOC } from '$lib/thuc-nghiem/kho.svelte';
	import { keHoach } from '$lib/thuc-nghiem/logic';
	import { THOI_GIAN, THOI_GIAN_NHANH } from '$lib/thuc-nghiem/cau-hinh';
	import BatDau from '$lib/thuc-nghiem/ui/BatDau.svelte';
	import HuongDan from '$lib/thuc-nghiem/ui/HuongDan.svelte';
	import NhanDien from '$lib/thuc-nghiem/ui/NhanDien.svelte';
	import HocBo from '$lib/thuc-nghiem/ui/HocBo.svelte';
	import CauHoi from '$lib/thuc-nghiem/ui/CauHoi.svelte';
	import KyLai from '$lib/thuc-nghiem/ui/KyLai.svelte';
	import Meo from '$lib/meo/Meo.svelte';
	import UserRoundPlus from '@lucide/svelte/icons/user-round-plus';

	let giaLap = $state(false);
	let nhanh = $state(false);
	onMount(() => {
		kho.nap();
		const q = new URLSearchParams(location.search);
		giaLap = q.has('gia-lap');
		nhanh = q.has('nhanh');
	});

	const p = $derived(kho.phien);
	const luot = $derived(p ? keHoach(p.nhom) : null);
	const thoiGianHoc = $derived(nhanh ? THOI_GIAN_NHANH.hoc : THOI_GIAN.hoc);
	const soBuoc = BUOC.length - 2; // bo bat-dau va xong
	const thuTu = $derived(p ? BUOC.indexOf(p.buoc) : 0);

	function xong() {
		kho.ghi({ buoc: 'xong', su_kien: 'ket-thuc', ms: p ? Date.now() - p.batDau : null });
		kho.sangBuoc('xong');
	}

	function dungGiuaChung() {
		const lyDo = prompt('Dừng lượt này giữa chừng? Ghi lý do ngắn (ví dụ: bạn xin dừng, camera hỏng):');
		if (lyDo !== null) kho.ketThuc(lyDo || 'không ghi lý do');
	}
</script>

<svelte:head>
	<title>VSLink · Thực nghiệm</title>
</svelte:head>

<div class="khung-trang">
	{#if !kho.daNap}
		<p class="cho">Đang tải…</p>
	{:else if !p}
		<BatDau />
	{:else}
		{#if p.buoc !== 'xong'}
			<div class="tien-trinh" aria-label="Bước {thuTu}/{soBuoc}">
				{#each { length: soBuoc } as _, j (j)}<i class:xong={j < thuTu - 1} class:dang={j === thuTu - 1}></i>{/each}
			</div>
		{/if}

		{#key p.buoc}
			{#if p.buoc === 'huong-dan'}
				<HuongDan {giaLap} onXong={() => kho.sangBuoc('truoc')} />
			{:else if p.buoc === 'truoc'}
				<NhanDien phan="truoc" onXong={() => kho.sangBuoc('hoc-1')} />
			{:else if p.buoc === 'hoc-1' && luot}
				<HocBo luot={luot[0]} thoiGian={thoiGianHoc} {giaLap} onXong={() => kho.sangBuoc('hoi-1')} />
			{:else if p.buoc === 'hoi-1' && luot}
				<CauHoi luot={luot[0]} onXong={() => kho.sangBuoc('hoc-2')} />
			{:else if p.buoc === 'hoc-2' && luot}
				<HocBo luot={luot[1]} thoiGian={thoiGianHoc} {giaLap} onXong={() => kho.sangBuoc('hoi-2')} />
			{:else if p.buoc === 'hoi-2' && luot}
				<CauHoi luot={luot[1]} onXong={() => kho.sangBuoc('sau')} />
			{:else if p.buoc === 'sau'}
				<NhanDien phan="sau" onXong={() => kho.sangBuoc('ky-lai')} />
			{:else if p.buoc === 'ky-lai'}
				<KyLai {giaLap} onXong={xong} />
			{:else if p.buoc === 'xong'}
				<section class="the xong" data-testid="man-xong">
					<Meo tamTrang="vui" kichThuoc={120} />
					<h1>Xong rồi, cảm ơn bạn nhiều!</h1>
					<p>Bạn đã giúp nhóm VSLink rất nhiều. Gọi người hướng dẫn nhé.</p>
					<p class="nho">
						Mã {p.ma} · {kho.chuaGui ? `còn ${kho.chuaGui} dòng chưa gửi, web sẽ tự gửi khi có mạng` : 'đã gửi đủ dữ liệu'}
					</p>
					<button class="nut" onclick={() => kho.ketThuc()} data-testid="nguoi-tiep">
						<UserRoundPlus size={18} /> Người tiếp theo
					</button>
				</section>
			{/if}
		{/key}

		{#if p.buoc !== 'xong'}
			<p class="chan">
				<span>Mã {p.ma}{p.loai === 'T' ? ' · chạy thử' : ''} · Máy {p.may}</span>
				<button class="nut-chu" onclick={dungGiuaChung}>Dừng lượt này (người hướng dẫn)</button>
			</p>
		{/if}
	{/if}
</div>

<style>
	.cho {
		text-align: center;
		color: var(--chu-phu);
	}
	.tien-trinh {
		display: flex;
		gap: 6px;
		margin-bottom: 18px;
	}
	.tien-trinh i {
		flex: 1;
		height: 6px;
		border-radius: 3px;
		background: var(--vien);
	}
	.tien-trinh i.xong {
		background: var(--xanh);
	}
	.tien-trinh i.dang {
		background: color-mix(in srgb, var(--xanh) 45%, var(--vien));
	}
	.xong {
		max-width: 560px;
		margin-inline: auto;
		display: grid;
		justify-items: center;
		gap: 12px;
		text-align: center;
	}
	.xong h1,
	.xong p {
		margin: 0;
	}
	.nho {
		color: var(--chu-phu);
		font-size: 0.9rem;
	}
	.chan {
		margin: 28px 0 0;
		display: flex;
		justify-content: space-between;
		flex-wrap: wrap;
		gap: 8px;
		color: var(--chu-phu);
		font-size: 0.85rem;
	}
	.nut-chu {
		border: none;
		background: none;
		color: var(--chu-phu);
		text-decoration: underline;
		font: inherit;
		cursor: pointer;
	}
</style>
