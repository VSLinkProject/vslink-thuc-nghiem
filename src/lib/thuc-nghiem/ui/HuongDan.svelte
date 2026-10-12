<!--
	Huong dan + tap thao tac camera (2 phut): giơ tay -> ky -> hạ tay. Khong cham, khong
	dung tu nao trong 2 bo. Phai co 1 lan web bat duoc dong tac moi di tiep.
-->
<script lang="ts">
	import KhungCamera from '$lib/thanh-phan/KhungCamera.svelte';
	import { PhienCamera } from '$lib/loi/camera.svelte';
	import { LOI_BO } from '$lib/loi/dinh-dang';
	import { kho } from '../kho.svelte';
	import CircleCheck from '@lucide/svelte/icons/circle-check';
	import ArrowRight from '@lucide/svelte/icons/arrow-right';

	let { giaLap = false, onXong }: { giaLap?: boolean; onXong: () => void } = $props();
	let soLan = $state(0);
	let thongBao = $state<string | null>(null);

	const phien = new PhienCamera({
		onBatDau: () => (thongBao = null),
		onDoan: (_k, t) => {
			soLan++;
			kho.ghi({ buoc: 'huong-dan', su_kien: 'tap-camera', lan: soLan, thoi_luong: Math.round(t * 100) / 100, fps: Math.round(phien.fps) });
		},
		onBo: (lyDo) => (thongBao = LOI_BO[lyDo])
	});

	function tiep() {
		phien.dung();
		onXong();
	}
</script>

<div class="luoi">
	<section class="the huong-dan">
		<p class="nhan-nho">Trước khi bắt đầu</p>
		<h1>Cách ký trước camera</h1>
		<ol>
			<li><b>Ngồi sao cho camera thấy</b> từ đầu đến bụng, cả hai vai và hai khuỷu tay.</li>
			<li><b>Giơ tay lên</b> trước ngực là web bắt đầu ghi.</li>
			<li><b>Ký</b> một động tác, không cần quá nhanh.</li>
			<li><b>Hạ hai tay xuống</b> là web hiểu bạn đã ký xong.</li>
		</ol>
		<p>Thử ngay: giơ tay, vẫy chào camera, rồi hạ tay xuống.</p>
		<p class="phu">
			Hôm nay bạn sẽ làm một bài nhỏ, học 2 phần, mỗi phần 4 từ trong 5 phút, rồi làm bài cuối. Hình ảnh camera chỉ xử lý
			trên máy này, không lưu và không gửi đi đâu.
		</p>
		<div class="ket" aria-live="polite">
			{#if soLan > 0}
				<p class="ok" data-testid="tap-ok"><CircleCheck size={20} /> Tốt lắm! Web đã thấy bạn ký {soLan} lần.</p>
			{:else if thongBao}
				<p class="canh-bao">{thongBao}</p>
			{/if}
		</div>
		<button class="nut" disabled={soLan === 0} onclick={tiep} data-testid="xong-huong-dan">
			Mình hiểu rồi, bắt đầu <ArrowRight size={18} />
		</button>
		{#if soLan === 0}<p class="nho">Nút sẽ mở sau khi web thấy bạn giơ tay, ký và hạ tay một lần.</p>{/if}
	</section>
	<section class="the">
		<KhungCamera {phien} {giaLap} tuBat trungTinh goiY="Giơ tay lên, vẫy chào, rồi hạ tay" />
	</section>
</div>

<style>
	.luoi {
		display: grid;
		gap: 18px;
	}
	@media (min-width: 980px) {
		.luoi {
			grid-template-columns: minmax(0, 1fr) minmax(0, 1.2fr);
			align-items: start;
		}
	}
	.huong-dan {
		display: grid;
		gap: 10px;
		align-content: start;
	}
	h1,
	p,
	ol {
		margin: 0;
	}
	ol {
		display: grid;
		gap: 6px;
		padding-left: 1.3em;
		font-size: 1.05rem;
	}
	.phu,
	.nho {
		color: var(--chu-phu);
	}
	.nho {
		font-size: 0.88rem;
	}
	.ok {
		display: flex;
		gap: 8px;
		align-items: center;
		padding: 10px 14px;
		border-radius: var(--bo-nho);
		background: var(--xanh-la-nhat);
		color: var(--xanh-la-chu);
		font-weight: 800;
	}
	.canh-bao {
		padding: 10px 14px;
		border-radius: var(--bo-nho);
		background: var(--vang-nhat);
		font-weight: 650;
	}
</style>
