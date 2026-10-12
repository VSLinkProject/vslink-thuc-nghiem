<!-- Dong ho dem nguoc theo moc tuyet doi (Date.now) -> tai lai trang van dung gio. -->
<script lang="ts">
	import { onMount } from 'svelte';
	import Timer from '@lucide/svelte/icons/timer';

	let { hetGio, thoiGian, onHet }: { hetGio: number; thoiGian: number; onHet: () => void } = $props();
	let conLai = $state(0);
	let daBao = false;

	onMount(() => {
		const buoc = () => {
			conLai = Math.max(0, Math.ceil((hetGio - Date.now()) / 1000));
			if (conLai <= 0 && !daBao) {
				daBao = true;
				onHet();
			}
		};
		buoc();
		const h = setInterval(buoc, 250);
		return () => clearInterval(h);
	});
	const chu = $derived(`${Math.floor(conLai / 60)}:${String(conLai % 60).padStart(2, '0')}`);
</script>

<div class="dong-ho" class:sap-het={conLai <= 30} role="timer" aria-label="Còn {chu}" data-testid="dong-ho">
	<Timer size={20} />
	<b>{chu}</b>
	<i style:width="{Math.min(100, (conLai / thoiGian) * 100)}%"></i>
</div>

<style>
	.dong-ho {
		position: relative;
		display: inline-flex;
		align-items: center;
		gap: 8px;
		padding: 10px 18px;
		border-radius: 999px;
		background: var(--the);
		border: 2px solid var(--vien);
		font-size: 1.3rem;
		overflow: hidden;
		min-width: 130px;
	}
	.dong-ho b {
		font-variant-numeric: tabular-nums;
	}
	.dong-ho i {
		position: absolute;
		left: 0;
		bottom: 0;
		height: 4px;
		background: var(--xanh);
		transition: width 0.25s linear;
	}
	.sap-het {
		border-color: var(--vang-chu);
		color: var(--vang-chu);
	}
	.sap-het i {
		background: var(--vang-chu);
	}
</style>
