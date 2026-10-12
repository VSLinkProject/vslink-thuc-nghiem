<!--
	Video ky hieu cho bai nhan dien: lap lai, KHONG hien ten tu, khong co dieu khien
	nao lo dap an. Co nut xem cham 0,5x.
-->
<script lang="ts">
	import Turtle from '@lucide/svelte/icons/turtle';
	import VideoOff from '@lucide/svelte/icons/video-off';

	let { src }: { src: string | null } = $props();
	let video: HTMLVideoElement | undefined = $state();
	let cham = $state(false);
	let trangThai = $state<'tai' | 'chay' | 'loi'>('tai');

	$effect(() => {
		void src;
		trangThai = 'tai';
		cham = false;
	});
	$effect(() => {
		if (video) video.playbackRate = cham ? 0.5 : 1;
	});
</script>

<div class="khung" data-trang-thai={trangThai}>
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
				onplaying={() => (trangThai = 'chay')}
				onerror={() => (trangThai = 'loi')}
			></video>
		{/key}
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
		aspect-ratio: 16 / 9;
		border-radius: var(--bo);
		overflow: hidden;
		background: #0f1c2e;
	}
	video {
		width: 100%;
		height: 100%;
		object-fit: contain;
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
