<!--
	Bai sau · phan 2: hien TEN tu, nguoi tham gia ky lai KHONG xem mau, web KHONG cham ra
	man hinh. Moi tu tinh SO_LAN_KY_LAI lan ky hop le (lan bi bo vi qua ngan / khong thay
	tay thi duoc ky lai, khong tinh). Qua CHO_BO_QUA_GIAY giay -> hien nut bo qua.
-->
<script lang="ts">
	import { onMount, untrack } from 'svelte';
	import KhungCamera from '$lib/thanh-phan/KhungCamera.svelte';
	import { PhienCamera } from '$lib/loi/camera.svelte';
	import type { KhungVao } from '$lib/loi/cat-doan';
	import { topK, xepHang } from '$lib/loi/danh-gia';
	import { LOI_BO } from '$lib/loi/dinh-dang';
	import { chayMoHinh } from '$lib/loi/mo-hinh';
	import { noiSuy } from '$lib/loi/lay-mau';
	import { NHAN } from '$lib/loi/tu-vung';
	import { CHO_BO_QUA_GIAY, SO_LAN_KY_LAI } from '../cau-hinh';
	import { kho } from '../kho.svelte';
	import { boCuaTu, thuTuTu } from '../logic';
	import CircleCheck from '@lucide/svelte/icons/circle-check';

	let { giaLap = false, onXong }: { giaLap?: boolean; onXong: () => void } = $props();

	const ds = $derived(thuTuTu(kho.phien!.ma, 'ky-lai'));
	const k = $derived(Math.min(kho.phien!.viTri, ds.length - 1));
	const tu = $derived(ds[k]);

	let soLan = $state(0);
	let thongBao = $state<string | null>(null);
	let daGhi = $state(false);
	let choBoQua = $state(false);
	let henBoQua = 0;
	let id = 0;

	const phien = new PhienCamera({
		onBatDau: () => (thongBao = null),
		onDoan: (khung, t) => cham(khung, t),
		onBo: (lyDo) => (thongBao = LOI_BO[lyDo])
	});

	$effect(() => {
		void tu;
		untrack(() => {
			id++;
			soLan = 0;
			daGhi = false;
			thongBao = null;
			choBoQua = false;
			phien.datLai();
			phien.tamDung = false;
			clearTimeout(henBoQua);
			henBoQua = window.setTimeout(() => (choBoQua = true), CHO_BO_QUA_GIAY * 1000);
		});
	});
	onMount(() => () => clearTimeout(henBoQua));

	async function cham(khung: KhungVao[], thoiLuong: number) {
		const myId = id;
		const muc = tu;
		// chi lay du doan goc (batch 1), khong can phan tich che bot
		const probs = await chayMoHinh(noiSuy(khung)).catch((e) => {
			console.error(e);
			return null;
		});
		if (myId !== id || daGhi) return;
		soLan++;
		kho.ghi({
			buoc: 'ky-lai',
			su_kien: 'ky-lai',
			lan: soLan,
			bo: boCuaTu(muc),
			tu_i: muc,
			hang: probs ? xepHang(probs, muc) : null,
			p: probs ? Math.round(probs[muc] * 1000) / 1000 : null,
			top1: probs ? xepHang(probs, muc) === 1 : null,
			top5: probs ? xepHang(probs, muc) <= 5 : null,
			tu_doan: probs ? topK(probs, NHAN, 1)[0].tu : null,
			thoi_luong: Math.round(thoiLuong * 100) / 100,
			fps: Math.round(phien.fps),
			ghi_chu: probs ? '' : 'loi-mo-hinh'
		});
		if (soLan >= SO_LAN_KY_LAI) {
			daGhi = true;
			phien.tamDung = true;
			setTimeout(() => myId === id && tiep(), 1200);
		}
	}

	function boQua() {
		kho.ghi({ buoc: 'ky-lai', su_kien: 'bo-qua', bo: boCuaTu(tu), tu_i: tu, ghi_chu: `so_lan_da_ky=${soLan}` });
		tiep();
	}

	function tiep() {
		if (k + 1 >= ds.length) {
			phien.dung();
			onXong();
		} else kho.datViTri(k + 1);
	}
</script>

<section class="bai">
	<p class="nhan-nho">Bài sau khi học · phần 2 · Từ {k + 1}/{ds.length}</p>
	<h1>Hãy ký từ: <span class="tu" data-testid="tu-ky-lai">{NHAN[tu]}</span></h1>
	<p class="phu">Không có video mẫu. Ký một lần theo trí nhớ: giơ tay, ký, rồi hạ tay. Nếu quên, cứ ký những gì bạn nhớ.</p>

	<div class="the">
		<KhungCamera {phien} {giaLap} tuBat trungTinh goiY="Giơ tay lên và ký “{NHAN[tu]}”, xong thì hạ tay">
			{#if daGhi}
				<div class="da-ghi"><CircleCheck size={20} /> Đã ghi lại</div>
			{/if}
		</KhungCamera>
	</div>

	{#if thongBao && !daGhi}<p class="canh-bao">{thongBao} Ký lại nhé.</p>{/if}
	{#if choBoQua && !daGhi}
		<button class="nut vien nho" onclick={boQua} data-testid="bo-qua">Mình không nhớ từ này, bỏ qua</button>
	{/if}
</section>

<style>
	.bai {
		max-width: 860px;
		margin-inline: auto;
		display: grid;
		gap: 12px;
	}
	h1 {
		margin: 0;
	}
	.tu {
		color: var(--xanh-dam);
	}
	.phu {
		margin: 0;
		color: var(--chu-phu);
	}
	.da-ghi {
		display: inline-flex;
		gap: 8px;
		align-items: center;
		padding: 8px 18px;
		border-radius: 999px;
		background: color-mix(in srgb, #1d4ed8 85%, transparent);
		color: #fff;
		font-weight: 900;
	}
	.canh-bao {
		margin: 0;
		padding: 10px 14px;
		border-radius: var(--bo-nho);
		background: var(--vang-nhat);
		font-weight: 650;
	}
</style>
