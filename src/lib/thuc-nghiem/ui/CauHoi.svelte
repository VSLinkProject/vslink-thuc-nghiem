<!--
	3 cau thang 1–7 sau moi bo. Thang to mau do (1) -> vang (4) -> xanh (7) cho de hieu;
	moi cau co dong giai thich nho. Tra loi du ca 3 moi di tiep.
-->
<script lang="ts">
	import { CAU_HOI } from '../cau-hinh';
	import { kho } from '../kho.svelte';
	import type { LuotHoc } from '../logic';
	import { NHAN } from '$lib/loi/tu-vung';
	import ArrowRight from '@lucide/svelte/icons/arrow-right';

	let { luot, onXong }: { luot: LuotHoc; onXong: () => void } = $props();
	let diem = $state<(number | null)[]>(CAU_HOI.map(() => null));
	const du = $derived(diem.every((x) => x !== null));
	const conLai = $derived(diem.filter((x) => x === null).length);

	/** mau cua tung muc: do -> cam -> vang -> xanh la */
	const MAU: Record<number, string> = {
		1: '#d64545',
		2: '#e8743b',
		3: '#efa53a',
		4: '#c9b53a',
		5: '#8fbf47',
		6: '#4caf62',
		7: '#1f8f55'
	};
	const NHAN_MUC: Record<number, string> = {
		1: 'Hoàn toàn không',
		2: 'Không',
		3: 'Hơi không',
		4: 'Phân vân',
		5: 'Hơi đồng ý',
		6: 'Đồng ý',
		7: 'Hoàn toàn đồng ý'
	};

	function gui() {
		if (!du) return;
		CAU_HOI.forEach((c, j) =>
			kho.ghi({
				buoc: luot.lan === 1 ? 'hoi-1' : 'hoi-2',
				su_kien: 'cau-hoi',
				lan: luot.lan,
				bo: luot.bo,
				dieu_kien: luot.dk,
				cau: `Q${j + 1}: ${c.cau}`,
				diem: diem[j]
			})
		);
		onXong();
	}
</script>

<section class="the bai">
	<p class="nhan-nho">Sau phần học {luot.lan}/2</p>
	<h1>Bạn thấy phần học vừa rồi thế nào?</h1>
	<p class="phu">
		Phần học vừa rồi gồm 4 từ: <b>{luot.tu.map((i) => NHAN[i]).join(', ')}</b>. Với mỗi câu, chọn một ô theo cảm nhận
		thật của bạn. Không có đáp án đúng sai, và câu trả lời không ảnh hưởng gì tới bạn.
	</p>

	<div class="chu-giai" aria-hidden="true">
		<span>1 · Hoàn toàn không đồng ý</span>
		<i></i>
		<span>7 · Hoàn toàn đồng ý</span>
	</div>

	{#each CAU_HOI as c, j (c.cau)}
		<fieldset class:da-chon={diem[j] !== null}>
			<legend>
				<span class="so">{j + 1}</span>
				<span>
					<b>{c.cau}</b>
					<small>{c.giai_thich}</small>
				</span>
			</legend>
			<div class="thang">
				{#each [1, 2, 3, 4, 5, 6, 7] as n (n)}
					<label class:chon={diem[j] === n} style:--mau={MAU[n]} title={NHAN_MUC[n]}>
						<input type="radio" name="q{j}" value={n} bind:group={diem[j]} />
						<b>{n}</b>
						<small>{NHAN_MUC[n]}</small>
					</label>
				{/each}
			</div>
		</fieldset>
	{/each}

	<div class="cuoi">
		{#if !du}<span class="con-lai">Còn {conLai} câu chưa chọn</span>{/if}
		<button class="nut" disabled={!du} onclick={gui}>Tiếp tục <ArrowRight size={18} /></button>
	</div>
</section>

<style>
	.bai {
		max-width: 820px;
		margin-inline: auto;
		display: grid;
		gap: 16px;
	}
	h1,
	p {
		margin: 0;
	}
	.phu {
		color: var(--chu-phu);
	}
	.phu b {
		color: var(--chu);
	}
	.chu-giai {
		display: grid;
		grid-template-columns: auto 1fr auto;
		gap: 10px;
		align-items: center;
		font-size: 0.82rem;
		font-weight: 800;
		color: var(--chu-phu);
	}
	.chu-giai i {
		height: 8px;
		border-radius: 4px;
		background: linear-gradient(90deg, #d64545, #efa53a, #c9b53a, #8fbf47, #1f8f55);
	}
	fieldset {
		border: 2px solid var(--vien);
		border-radius: var(--bo-vua);
		padding: 14px;
		margin: 0;
		transition: border-color 0.15s ease;
	}
	fieldset.da-chon {
		border-color: color-mix(in srgb, var(--xanh-la) 50%, var(--vien));
	}
	legend {
		display: flex;
		gap: 10px;
		align-items: flex-start;
		padding: 0 6px;
		margin-bottom: 10px;
	}
	legend .so {
		flex: none;
		display: grid;
		place-items: center;
		width: 28px;
		height: 28px;
		border-radius: 50%;
		background: var(--nut);
		color: #fff;
		font-weight: 900;
	}
	legend b {
		display: block;
		font-size: 1.08rem;
	}
	legend small {
		display: block;
		color: var(--chu-phu);
		font-size: 0.88rem;
		margin-top: 2px;
	}
	.thang {
		display: grid;
		grid-template-columns: repeat(7, minmax(0, 1fr));
		gap: 6px;
	}
	label {
		position: relative;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 2px;
		min-height: 74px;
		padding: 8px 2px;
		border-radius: var(--bo-nho);
		border: 2px solid color-mix(in srgb, var(--mau) 45%, transparent);
		background: color-mix(in srgb, var(--mau) 10%, var(--the));
		cursor: pointer;
		text-align: center;
		transition:
			transform 0.1s ease,
			background 0.15s ease;
	}
	label:hover {
		transform: translateY(-2px);
		background: color-mix(in srgb, var(--mau) 22%, var(--the));
	}
	label.chon {
		background: var(--mau);
		border-color: var(--mau);
		color: #fff;
		box-shadow: 0 6px 16px -8px var(--mau);
	}
	label.chon small {
		color: #fff;
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
	label b {
		font-size: 1.3rem;
		color: inherit;
	}
	label:not(.chon) b {
		color: var(--mau);
	}
	label small {
		font-size: 0.68rem;
		line-height: 1.15;
		color: var(--chu-phu);
		font-weight: 700;
	}
	.cuoi {
		display: flex;
		justify-content: flex-end;
		align-items: center;
		gap: 14px;
	}
	.con-lai {
		color: var(--chu-phu);
		font-weight: 700;
	}
	@media (max-width: 560px) {
		label small {
			display: none;
		}
	}
</style>
