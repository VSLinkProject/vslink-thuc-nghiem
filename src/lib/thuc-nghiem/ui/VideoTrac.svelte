<!--
	Video ky hieu cho bai nhan dien: lap lai, KHONG hien ten tu, khong co dieu khien
	nao lo dap an. Co nut xem cham 0,5x.
	Video QIPEDC in san TEN TU o goc tren ben phai. Che 2 lop cho chac:
	  1. clip-path CAT HAN goc do khoi video -> lo ra nen khung cung mau (#186e8f, lay
	     mau tu video). Khong phu thuoc thu tu ve (Chrome co the dua video len lop
	     phan cung rieng, ve de len moi thu).
	  2. them mot o cung mau phu len tren (z-index).
-->
<script lang="ts">
	import Turtle from '@lucide/svelte/icons/turtle';
	import VideoOff from '@lucide/svelte/icons/video-off';

	let { src }: { src: string | null } = $props();
	let video: HTMLVideoElement | undefined = $state();
	let cham = $state(false);
	let trangThai = $state<'tai' | 'chay' | 'loi'>('tai');
	let tiLe = $state('16 / 9');

	$effect(() => {
		void src;
		trangThai = 'tai';
		cham = false;
	});
	$effect(() => {
		if (video) video.playbackRate = cham ? 0.5 : 1;
	});
</script>

<div class="khung" data-trang-thai={trangThai} style:aspect-ratio={tiLe}>
	{#if src}
		{#key src}
			<video
				bind:this={video}
				{src}
				autoplay
				loop
				muted
				playsinline
				preload="auto"
				disablepictureinpicture
				data-testid="video-nhan-dien"
				onloadedmetadata={() => {
					if (video?.videoWidth && video.videoHeight) tiLe = `${video.videoWidth} / ${video.videoHeight}`;
				}}
				onplaying={() => (trangThai = 'chay')}
				onerror={() => (trangThai = 'loi')}
			></video>
		{/key}
		<div class="che-ten" aria-hidden="true" data-testid="che-ten"></div>
		{#if trangThai === 'tai'}<p class="phu">Đang tải video…</p>{/if}
		{#if trangThai === 'loi'}<p class="phu"><VideoOff size={22} /> Không tải được video. Báo người hướng dẫn nhé.</p>{/if}
	{:else}
		<p class="phu"><VideoOff size={22} /> Chưa có video cho câu này. Báo người hướng dẫn nhé.</p>
	{/if}
</div>
<button class="nut vien nho cham" aria-pressed={cham} onclick={() => (cham = !cham)}>
	<Turtle size={16} />
	{cham ? 'Đang xem chậm 0,5×' : 'Xem chậm 0,5×'}
</button>

<style>
	.khung {
		position: relative;
		border-radius: var(--bo);
		overflow: hidden;
		background: #186e8f;
		isolation: isolate;
	}
	.che-ten {
		position: absolute;
		top: 0;
		right: 0;
		width: 30%;
		height: 17%;
		background: #186e8f;
		pointer-events: none;
		z-index: 2;
	}
	video {
		width: 100%;
		height: 100%;
		object-fit: fill;
		display: block;
		/* bo goc tren phai (30% ngang x 17% doc) khoi video */
		clip-path: polygon(0 0, 70% 0, 70% 17%, 100% 17%, 100% 100%, 0 100%);
	}
	.phu {
		position: absolute;
		inset: 0;
		margin: 0;
		display: flex;
		gap: 8px;
		align-items: center;
		justify-content: center;
		color: #fff;
		font-weight: 750;
		text-align: center;
		padding: 16px;
	}
	.cham {
		margin-top: 10px;
	}
</style>
