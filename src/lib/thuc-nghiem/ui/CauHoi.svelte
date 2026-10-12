<!-- 3 cau thang 1–7 sau moi bo. Tra loi du ca 3 moi di tiep. -->
<script lang="ts">
	import { CAU_HOI, NHAN_THANG } from '../cau-hinh';
	import { kho } from '../kho.svelte';
	import type { LuotHoc } from '../logic';
	import ArrowRight from '@lucide/svelte/icons/arrow-right';

	let { luot, onXong }: { luot: LuotHoc; onXong: () => void } = $props();
	let diem = $state<(number | null)[]>(CAU_HOI.map(() => null));
	const du = $derived(diem.every((x) => x !== null));

	function gui() {
		if (!du) return;
		CAU_HOI.forEach((cau, j) =>
			kho.ghi({
				buoc: luot.lan === 1 ? 'hoi-1' : 'hoi-2',
				su_kien: 'cau-hoi',
				lan: luot.lan,
				bo: luot.bo,
				dieu_kien: luot.dk,
				cau: `Q${j + 1}: ${cau}`,
				diem: diem[j]
			})
		);
		onXong();
	}
</script>

<section class="the bai">
	<p class="nhan-nho">Sau phần học {luot.lan}/2</p>
	<h1>Bạn thấy phần học vừa rồi thế nào?</h1>
	<p class="phu">Chọn từ 1 (hoàn toàn không đồng ý) đến 7 (hoàn toàn đồng ý). Không có đáp án đúng sai.</p>

	{#each CAU_HOI as cau, j (cau)}
		<fieldset>
			<legend>{j + 1}. {cau}</legend>
			<div class="thang">
				{#each [1, 2, 3, 4, 5, 6, 7] as n (n)}
					<label class:chon={diem[j] === n}>
						<input type="radio" name="q{j}" value={n} bind:group={diem[j]} />
						<b>{n}</b>
						{#if n in NHAN_THANG}<small>{NHAN_THANG[n as 1 | 4 | 7]}</small>{/if}
					</label>
				{/each}
			</div>
		</fieldset>
	{/each}

	<div class="cuoi">
		<button class="nut" disabled={!du} onclick={gui}>Tiếp tục <ArrowRight size={18} /></button>
	</div>
</section>

<style>
	.bai {
		max-width: 760px;
		margin-inline: auto;
		display: grid;
		gap: 16px;
	}
	h1 {
		margin: 0;
	}
	.phu {
		margin: 0;
		color: var(--chu-phu);
	}
	fieldset {
		border: none;
		padding: 0;
		margin: 0;
	}
	legend {
		font-weight: 850;
		margin-bottom: 8px;
		font-size: 1.05rem;
	}
	.thang {
		display: grid;
		grid-template-columns: repeat(7, minmax(0, 1fr));
		gap: 6px;
	}
	label {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 2px;
		padding: 10px 2px;
		border-radius: var(--bo-nho);
		border: 2px solid var(--vien);
		background: var(--the);
		cursor: pointer;
		text-align: center;
	}
	label.chon {
		border-color: var(--xanh);
		background: var(--xanh-nhat);
		color: var(--xanh-dam);
	}
	input {
		position: absolute;
		opacity: 0;
		pointer-events: none;
	}
	label:has(input:focus-visible) {
		outline: 3px solid var(--xanh);
		outline-offset: 2px;
	}
	b {
		font-size: 1.15rem;
	}
	small {
		font-size: 0.68rem;
		line-height: 1.15;
		color: var(--chu-phu);
	}
	.cuoi {
		display: flex;
		justify-content: flex-end;
	}
</style>
