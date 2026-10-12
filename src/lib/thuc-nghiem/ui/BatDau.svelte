<!-- Man hinh dau: nguoi huong dan nhap ma + so may; ban tham gia doc va dong y. -->
<script lang="ts">
	import { kho } from '../kho.svelte';
	import ArrowRight from '@lucide/svelte/icons/arrow-right';

	let ma = $state('');
	let may = $state(kho.may);
	let dongY = $state(false);
	let loi = $state<string | null>(null);

	function batDau(e: SubmitEvent) {
		e.preventDefault();
		if (!dongY) return;
		kho.datMay(may);
		loi = kho.batDau(ma);
	}
</script>

<form class="the bat-dau" onsubmit={batDau}>
	<p class="nhan-nho">VSLink · Thực nghiệm học ký hiệu</p>
	<h1>Chào bạn!</h1>

	<div class="hai-o">
		<label>
			<span>Mã người tham gia</span>
			<input bind:value={ma} placeholder="F01" autocomplete="off" autocapitalize="characters" required data-testid="o-ma" />
		</label>
		<label>
			<span>Máy</span>
			<input bind:value={may} placeholder="M1" autocomplete="off" required data-testid="o-may" />
		</label>
	</div>
	<p class="nho">Người hướng dẫn nhập mã. Chạy thử dùng mã T01, T02… (dữ liệu được đánh dấu để loại ra).</p>

	<div class="dong-y">
		<h2>Thông tin cho bạn</h2>
		<ul>
			<li>Nhóm VSLink (Trường Phổ thông Năng khiếu) đang tìm hiểu cách giúp người nghe học ngôn ngữ ký hiệu Việt Nam.</li>
			<li>Bạn sẽ học 8 từ ký hiệu và làm vài câu hỏi ngắn, khoảng 20 phút.</li>
			<li>Web chỉ ghi mã, câu trả lời và kết quả nhận dạng. Không ghi tên, không lưu hình ảnh hay video.</li>
			<li>Bạn có thể dừng bất cứ lúc nào, chỉ cần báo người hướng dẫn.</li>
		</ul>
		<label class="tick">
			<input type="checkbox" bind:checked={dongY} data-testid="dong-y" />
			Mình đã đọc và đồng ý tham gia.
		</label>
	</div>

	{#if loi}<p class="loi" role="alert">{loi}</p>{/if}
	<button class="nut" type="submit" disabled={!dongY || !ma.trim()} data-testid="bat-dau">
		Bắt đầu <ArrowRight size={18} />
	</button>
</form>

<style>
	.bat-dau {
		max-width: 640px;
		margin-inline: auto;
		display: grid;
		gap: 14px;
	}
	h1,
	h2,
	p {
		margin: 0;
	}
	h2 {
		font-size: 1.05rem;
		margin-bottom: 6px;
	}
	.hai-o {
		display: grid;
		grid-template-columns: 2fr 1fr;
		gap: 12px;
	}
	label span {
		display: block;
		font-weight: 800;
		margin-bottom: 4px;
	}
	input:not([type='checkbox']) {
		width: 100%;
		padding: 12px 14px;
		border-radius: var(--bo-nho);
		border: 2px solid var(--vien);
		background: var(--the);
		color: var(--chu);
		font: inherit;
		font-size: 1.2rem;
		font-weight: 800;
		box-sizing: border-box;
	}
	.nho {
		color: var(--chu-phu);
		font-size: 0.88rem;
	}
	.dong-y {
		padding: 14px 16px;
		border-radius: var(--bo-vua);
		background: var(--xanh-nhat);
	}
	ul {
		margin: 0 0 10px;
		padding-left: 1.2em;
		display: grid;
		gap: 4px;
	}
	.tick {
		display: flex;
		gap: 10px;
		align-items: center;
		font-weight: 800;
		cursor: pointer;
	}
	.tick input {
		width: 22px;
		height: 22px;
	}
	.loi {
		padding: 10px 14px;
		border-radius: var(--bo-nho);
		background: var(--do-nhat);
		color: var(--do-chu);
		font-weight: 750;
	}
</style>
