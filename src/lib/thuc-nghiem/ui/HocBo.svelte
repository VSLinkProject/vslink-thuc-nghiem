<!--
	Hoc mot bo 4 tu trong dung THOI_GIAN.hoc giay (het gio tu chuyen buoc).
	Hai dieu kien dung CHUNG trang nay, chi khac phan hoi:
	  co-phan-hoi    : cham Dung / Gan dung / Chua dung + bo phan khac mau + loi Meo soan san
	  khong-phan-hoi : van bat camera tu tap, mo hinh van chay ngam de GHI so lieu, nhung
	                   khong hien gi ve dung / sai.
	Loi Meo chi dung loi soan san (khong goi Gemini): moi nguoi nhan cung mot kieu phan hoi,
	khong phu thuoc mang.
-->
<script lang="ts">
	import { onMount, untrack } from 'svelte';
	import KhungCamera from '$lib/thanh-phan/KhungCamera.svelte';
	import VideoMau from '$lib/thanh-phan/VideoMau.svelte';
	import BoPhan from '$lib/thanh-phan/BoPhan.svelte';
	import BongMeo from '$lib/meo/BongMeo.svelte';
	import { PhienCamera } from '$lib/loi/camera.svelte';
	import type { KhungVao } from '$lib/loi/cat-doan';
	import { danhGia, doChatLuong, taoBatchCheBot, type DuKien } from '$lib/loi/danh-gia';
	import { LOI_BO, phanTram } from '$lib/loi/dinh-dang';
	import { chayMoHinh } from '$lib/loi/mo-hinh';
	import { noiSuy } from '$lib/loi/lay-mau';
	import { NHAN } from '$lib/loi/tu-vung';
	import type { VideoMau as TVideoMau } from '$lib/loi/video-mau';
	import { cauMeoMau, tamTrangTuMucDo } from '$lib/meo/loi-meo';
	import { kho } from '../kho.svelte';
	import type { LuotHoc } from '../logic';
	import { napVideoThucNghiem } from '../video';
	import DongHo from './DongHo.svelte';
	import Star from '@lucide/svelte/icons/star';
	import Sparkles from '@lucide/svelte/icons/sparkles';
	import Target from '@lucide/svelte/icons/target';

	let {
		luot,
		thoiGian,
		giaLap = false,
		onXong
	}: { luot: LuotHoc; thoiGian: number; giaLap?: boolean; onXong: () => void } = $props();

	const coPhanHoi = $derived(luot.dk === 'co-phan-hoi');
	const buoc = $derived(luot.lan === 1 ? 'hoc-1' : 'hoc-2');

	let video = $state<Record<number, TVideoMau | null>>({});
	let k = $state(0);
	const tu = $derived(luot.tu[k]);

	type KetQua = { id: number; duKien: DuKien; cau: string };
	let ketQua = $state<KetQua | null>(null);
	let thongBao = $state<string | null>(null);
	let loiCham = $state<string | null>(null);
	/** so lan ky / so lan dung theo tu (de ghi tong ket) */
	const dem = $state<Record<number, { ky: number; dung: number; mo: number }>>({});
	let soLanKyTuNay = $state(0);
	let id = 0;
	let daXong = false;

	onMount(() => {
		napVideoThucNghiem().then((v) => (video = v));
		if (!kho.phien!.hetGio) kho.datHetGio(Date.now() + thoiGian * 1000);
		for (const i of luot.tu) dem[i] ??= { ky: 0, dung: 0, mo: 0 };
	});

	const phien = new PhienCamera({
		onBatDau: () => (thongBao = null),
		onDoan: (khung, t) => cham(khung, t),
		onBo: (lyDo) => (thongBao = LOI_BO[lyDo])
	});

	function chonTu(j: number) {
		k = j;
	}

	$effect(() => {
		const i = tu;
		untrack(() => {
			id++;
			ketQua = null;
			thongBao = null;
			loiCham = null;
			soLanKyTuNay = 0;
			phien.datLai();
			dem[i] ??= { ky: 0, dung: 0, mo: 0 };
			dem[i].mo++;
			kho.ghi({ buoc, su_kien: 'mo-tu', lan: luot.lan, bo: luot.bo, dieu_kien: luot.dk, tu_i: i });
		});
	});

	async function cham(khung: KhungVao[], thoiLuong: number) {
		const myId = ++id;
		const muc = tu;
		const kp = khung.map((x) => x.kp);
		let probs: Float32Array;
		try {
			probs = await chayMoHinh(taoBatchCheBot(noiSuy(khung)));
		} catch (e) {
			console.error(e);
			loiCham = 'Chưa chạy được bộ nhận dạng. Báo người hướng dẫn nhé.';
			return;
		}
		if (myId !== id || muc !== tu || daXong) return;
		const d = danhGia(probs, muc, NHAN, doChatLuong(kp, thoiLuong));
		dem[muc].ky++;
		if (d.mucDo === 'dung') dem[muc].dung++;
		soLanKyTuNay++;
		kho.ghi({
			buoc,
			su_kien: 'ky',
			lan: luot.lan,
			bo: luot.bo,
			dieu_kien: luot.dk,
			tu_i: muc,
			hang: d.xepHang,
			p: Math.round(d.xacSuat * 1000) / 1000,
			top1: d.xepHang === 1,
			top5: d.xepHang <= 5,
			tu_doan: d.tuDoan,
			thoi_luong: Math.round(thoiLuong * 100) / 100,
			fps: Math.round(phien.fps),
			ghi_chu: coPhanHoi ? `bo_phan=${JSON.stringify(d.boPhan)};giai_doan=${d.giaiDoanLechNhat ?? ''}` : ''
		});
		ketQua = { id: myId, duKien: d, cau: cauMeoMau(d) };
		thongBao = null;
		loiCham = null;
	}

	function hetGio() {
		if (daXong) return;
		daXong = true;
		phien.dung();
		for (const i of luot.tu) {
			const x = dem[i] ?? { ky: 0, dung: 0, mo: 0 };
			kho.ghi({
				buoc,
				su_kien: 'tong-ket-tu',
				lan: luot.lan,
				bo: luot.bo,
				dieu_kien: luot.dk,
				tu_i: i,
				ghi_chu: `so_lan_ky=${x.ky};so_lan_dung=${x.dung};so_lan_mo=${x.mo}`
			});
		}
		onXong();
	}

	const d = $derived(ketQua?.duKien ?? null);
</script>

<div class="dau">
	<div>
		<p class="nhan-nho">Phần học {luot.lan}/2 · {coPhanHoi ? 'Có Mèo chấm' : 'Tự tập theo video'}</p>
		<h1>Học 4 từ</h1>
	</div>
	<DongHo hetGio={kho.phien?.hetGio ?? Date.now() + thoiGian * 1000} {thoiGian} onHet={hetGio} />
</div>

<div class="tab-tu" role="tablist" aria-label="4 từ cần học">
	{#each luot.tu as i, j (i)}
		<button role="tab" aria-selected={k === j} onclick={() => chonTu(j)} data-testid="tab-tu">
			{NHAN[i]}
			{#if coPhanHoi && dem[i]?.dung}<Star size={14} />{/if}
		</button>
	{/each}
</div>

<div class="luoi">
	<section class="the o-cam" aria-label="Camera">
		<h2 class="tieu-de-nho">Ký “{NHAN[tu]}” trước camera</h2>
		<KhungCamera {phien} {giaLap} tuBat trungTinh={!coPhanHoi} goiY="Giơ tay lên và ký “{NHAN[tu]}”, xong thì hạ tay">
			{#if coPhanHoi && ketQua && phien.pha !== 'dang-ky'}
				<div class="phu-de-cam" data-muc={ketQua.duKien.mucDo}>
					{#if ketQua.duKien.mucDo === 'dung'}Đúng rồi!
					{:else if ketQua.duKien.mucDo === 'gan-dung'}Gần đúng
					{:else}Chưa đúng{/if}
				</div>
			{/if}
		</KhungCamera>
	</section>

	<section class="the o-mau" aria-label="Video mẫu">
		<h2 class="tieu-de-nho">Video mẫu “{NHAN[tu]}”</h2>
		<VideoMau ds={video[tu] ? [video[tu]!] : []} tu={NHAN[tu]} />
	</section>

	<section class="the o-kq" aria-live="polite" data-testid="o-phan-hoi" data-dieu-kien={luot.dk}>
		{#if loiCham}
			<p class="canh-bao">{loiCham}</p>
		{:else if coPhanHoi}
			{#if ketQua && d}
				<div class="ket-luan" data-muc={d.mucDo} data-testid="ket-luan">
					{#if d.mucDo === 'dung'}<Star size={22} /> Đúng rồi! <small>Mèo chắc {phanTram(d.xacSuat)}</small>
					{:else if d.mucDo === 'gan-dung'}<Sparkles size={22} /> Gần đúng <small>“{d.tuMucTieu}” nằm trong 5 từ Mèo nghĩ tới</small>
					{:else}<Target size={22} /> Chưa đúng <small>Mèo thấy giống “{d.tuDoan}” hơn</small>{/if}
				</div>
				<BongMeo tamTrang={tamTrangTuMucDo(d.mucDo)} cau={ketQua.cau} nguon="mau" />
				{#if thongBao}<p class="canh-bao">{thongBao}</p>{/if}
				<div>
					<h3>Phần nào khác mẫu?</h3>
					<BoPhan duKien={d} />
				</div>
			{:else}
				<BongMeo tamTrang={thongBao ? 'boi-roi' : phien.pha === 'dang-ky' ? 'nghe' : 'cho'}>
					<p>{thongBao ?? 'Xem video mẫu, rồi ký trước camera cho Mèo chấm nhé! Ký xong nhớ hạ tay xuống.'}</p>
				</BongMeo>
			{/if}
		{:else}
			<p class="tu-tap" data-testid="tu-tap">
				{#if thongBao}{thongBao}
				{:else if soLanKyTuNay > 0}Đã tập {soLanKyTuNay} lần. Tự so với video mẫu rồi tập tiếp nhé.
				{:else}Xem video mẫu, rồi tự ký theo trước camera. Ở phần này web không chấm.{/if}
			</p>
		{/if}
		<p class="meo-nho">Bấm tên từ ở trên để chuyển từ. Học cả 4 từ trước khi hết giờ nhé.</p>
	</section>
</div>

<style>
	.dau {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 16px;
		flex-wrap: wrap;
		margin-bottom: 12px;
	}
	h1 {
		margin: 0;
	}
	.tab-tu {
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
		margin-bottom: 16px;
	}
	.tab-tu button {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		padding: 10px 18px;
		border-radius: 999px;
		border: 2px solid var(--vien);
		background: var(--the);
		color: var(--chu);
		font: inherit;
		font-weight: 850;
		font-size: 1.05rem;
		cursor: pointer;
	}
	.tab-tu button[aria-selected='true'] {
		background: var(--nut);
		border-color: var(--nut);
		color: #fff;
	}
	.luoi {
		display: grid;
		gap: 18px;
		grid-template-areas: 'mau' 'cam' 'kq';
	}
	@media (min-width: 980px) {
		.luoi {
			grid-template-columns: minmax(0, 1.25fr) minmax(0, 1fr);
			grid-template-areas: 'cam mau' 'cam kq';
			align-items: start;
		}
	}
	.o-cam {
		grid-area: cam;
	}
	.o-mau {
		grid-area: mau;
	}
	.o-kq {
		grid-area: kq;
		display: grid;
		gap: 12px;
		align-content: start;
	}
	.tieu-de-nho {
		font-size: 0.95rem;
		margin: 0 0 10px;
		color: var(--chu-phu);
		font-weight: 850;
	}
	h3 {
		font-size: 0.95rem;
		color: var(--chu-phu);
		margin: 0 0 8px;
	}
	.phu-de-cam {
		padding: 8px 18px;
		border-radius: 999px;
		color: #fff;
		font-size: clamp(1.05rem, 2.6vw, 1.4rem);
		font-weight: 900;
		background: color-mix(in srgb, #b3261e 85%, transparent);
	}
	.phu-de-cam[data-muc='dung'] {
		background: color-mix(in srgb, #1b8a5a 90%, transparent);
	}
	.phu-de-cam[data-muc='gan-dung'] {
		background: color-mix(in srgb, #b7791f 90%, transparent);
	}
	.ket-luan {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 8px;
		padding: 12px 16px;
		border-radius: var(--bo-vua);
		font-size: 1.3rem;
		font-weight: 900;
	}
	.ket-luan small {
		font-size: 0.9rem;
		font-weight: 750;
		color: var(--chu-phu);
	}
	.ket-luan[data-muc='dung'] {
		background: var(--xanh-la-nhat);
		color: var(--xanh-la-chu);
	}
	.ket-luan[data-muc='gan-dung'] {
		background: var(--vang-nhat);
		color: var(--vang-chu);
	}
	.ket-luan[data-muc='chua-dung'] {
		background: var(--do-nhat);
		color: var(--do-chu);
	}
	.canh-bao {
		margin: 0;
		padding: 10px 14px;
		border-radius: var(--bo-nho);
		background: var(--vang-nhat);
		font-weight: 650;
	}
	.tu-tap {
		margin: 0;
		padding: 14px 16px;
		border-radius: var(--bo-vua);
		background: var(--xanh-nhat);
		font-weight: 750;
	}
	.meo-nho {
		margin: 0;
		color: var(--chu-phu);
		font-size: 0.9rem;
	}
</style>
