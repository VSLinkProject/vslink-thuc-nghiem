<!--
	Bai nhan dien: xem 8 video ky hieu (2 bo tu, tron theo ma), chon nghia trong 4 dap an
	hoac "Mình không biết". Chon xong khong doi duoc, khong bao dung / sai.
-->
<script lang="ts">
	import { onMount } from 'svelte';
	import { NHAN } from '$lib/loi/tu-vung';
	import type { VideoMau } from '$lib/loi/video-mau';
	import { kho } from '../kho.svelte';
	import { boCuaTu, dapAn, thuTuTu } from '../logic';
	import { napVideoThucNghiem } from '../video';
	import VideoTrac from './VideoTrac.svelte';
	import ArrowRight from '@lucide/svelte/icons/arrow-right';

	let { phan, onXong }: { phan: 'truoc' | 'sau'; onXong: () => void } = $props();

	const ma = $derived(kho.phien!.ma);
	const ds = $derived(thuTuTu(ma, phan));
	const k = $derived(Math.min(kho.phien!.viTri, ds.length - 1));
	const tu = $derived(ds[k]);
	const luaChon = $derived(dapAn(ma, phan, tu));

	let video = $state<Record<number, VideoMau | null>>({});
	onMount(() => {
		napVideoThucNghiem().then((v) => (video = v));
	});

	let chon = $state<number | null>(null);
	let batDauCau = $state(performance.now());
	$effect(() => {
		void tu;
		chon = null;
		batDauCau = performance.now();
	});

	function traLoi(i: number) {
		if (chon !== null) return;
		chon = i;
		kho.ghi({
			buoc: phan === 'truoc' ? 'truoc' : 'sau',
			su_kien: 'nhan-dien',
			lan: k + 1,
			bo: boCuaTu(tu),
			tu_i: tu,
			chon_i: i,
			dung: i === tu,
			ms: Math.round(performance.now() - batDauCau)
		});
	}

	function tiep() {
		if (chon === null) return;
		if (k + 1 >= ds.length) onXong();
		else kho.datViTri(k + 1);
	}
</script>

<section class="the bai" aria-labelledby="tieu-de-bai">
	<p class="nhan-nho">{phan === 'truoc' ? 'Bài trước khi học' : 'Bài sau khi học · phần 1'}</p>
	<h1 id="tieu-de-bai">Ký hiệu này nghĩa là gì?</h1>
	<p class="dem" data-testid="dem-cau">Câu {k + 1}/{ds.length}</p>

	<VideoTrac src={video[tu]?.url ?? null} />

	<div class="lua" role="group" aria-label="Chọn nghĩa">
		{#each luaChon as i (i)}
			<button class="dap-an" aria-pressed={chon === i} disabled={chon !== null && chon !== i} onclick={() => traLoi(i)}>
				{NHAN[i]}
			</button>
		{/each}
		<button class="dap-an khong-biet" aria-pressed={chon === -1} disabled={chon !== null && chon !== -1} onclick={() => traLoi(-1)}>
			Mình không biết
		</button>
	</div>

	<div class="cuoi">
		<p class="goi-y">{phan === 'truoc' ? 'Chưa học thì cứ chọn “Mình không biết”, không sao cả.' : 'Không chắc thì chọn “Mình không biết”.'}</p>
		<button class="nut" disabled={chon === null} onclick={tiep}>
			{k + 1 >= ds.length ? 'Xong phần này' : 'Câu tiếp'}
			<ArrowRight size={18} />
		</button>
	</div>
</section>

<style>
	.bai {
		max-width: 760px;
		margin-inline: auto;
		display: grid;
		gap: 14px;
	}
	h1 {
		margin: 0;
	}
	.dem {
		margin: 0;
		color: var(--chu-phu);
		font-weight: 800;
	}
	.lua {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: 10px;
	}
	.dap-an {
		padding: 14px 12px;
		border-radius: var(--bo-vua);
		border: 2px solid var(--vien);
		background: var(--the);
		color: var(--chu);
		font: inherit;
		font-size: 1.1rem;
		font-weight: 800;
		cursor: pointer;
	}
	.dap-an:hover:not(:disabled) {
		border-color: var(--xanh);
	}
	.dap-an[aria-pressed='true'] {
		border-color: var(--xanh);
		background: var(--xanh-nhat);
		color: var(--xanh-dam);
	}
	.dap-an:disabled {
		opacity: 0.45;
		cursor: default;
	}
	.khong-biet {
		grid-column: 1 / -1;
		font-weight: 700;
		color: var(--chu-phu);
	}
	.cuoi {
		display: flex;
		flex-wrap: wrap;
		gap: 12px;
		align-items: center;
		justify-content: space-between;
	}
	.goi-y {
		margin: 0;
		color: var(--chu-phu);
		font-size: 0.92rem;
	}
</style>
