<!--
	Video ky hieu cho bai nhan dien: lap lai, KHONG hien ten tu, khong co dieu khien
	nao lo dap an. Co nut xem cham 0,5x.
	Video QIPEDC in san TEN TU o goc tren ben phai -> phu mot mieng cung mau nen
	(#186e8f, lay mau tu video) len vung do. Khung giu dung ti le video nen mieng phu
	luon nam dung cho.
-->
<script lang="ts">
	import Turtle from '@lucide/svelte/icons/turtle';
	import VideoOff from '@lucide/svelte/icons/video-off';

	let { src }: { src: string | null } = $props();
	let video: HTMLVideoElement | undefined = $state();
	let cham = $state(false);
	let trangThai = $state<'tai' | 'chay' | 'loi'>('tai');
	let tiLe = $state('16 / 9');
	const laQipedc = $derived(!!src && (/qipedc/.test(src) || /\/video\/\d+\.mp4/.test(src)));

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
		{#if laQipedc}<div class="che-ten" aria-hidden="true" data-testid="che-ten"></div>{/if}
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
		background: #0f1c2e;
	}
	.che-ten {
		position: absolute;
		top: 0;
		right: 0;
		width: 40%;
		height: 18%;
		background: #186e8f;
		pointer-events: none;
	}
	video {
		width: 100%;
		height: 100%;
		object-fit: fill;
		display: block;
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
