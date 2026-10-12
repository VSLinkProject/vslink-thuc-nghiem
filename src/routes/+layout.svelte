<script lang="ts">
	import '@fontsource-variable/nunito';
	import '../app.css';
	import Logo from '$lib/thanh-phan/Logo.svelte';
	import { PHIEN_BAN } from '$lib/thuc-nghiem/cau-hinh';

	let { children } = $props();
</script>

<svelte:head>
	<title>VSLink · Thực nghiệm</title>
	<meta name="robots" content="noindex" />
</svelte:head>

<header class="dau-trang">
	<div class="khung-trang thanh">
		<span class="thuong-hieu"><Logo cao={26} /></span>
		<span class="nhan">Thực nghiệm học ký hiệu</span>
		<span class="ban" data-testid="phien-ban">{PHIEN_BAN}</span>
	</div>
</header>

<main id="noi-dung">
	{@render children()}
</main>

<style>
	.dau-trang {
		position: sticky;
		top: 0;
		z-index: 20;
		backdrop-filter: saturate(1.4) blur(14px);
		background: color-mix(in srgb, var(--nen) 78%, transparent);
		border-bottom: 1px solid color-mix(in srgb, var(--vien) 70%, transparent);
	}
	.thanh {
		display: flex;
		align-items: center;
		gap: 14px;
		height: 60px;
	}
	.thuong-hieu {
		display: flex;
		align-items: center;
	}
	.nhan {
		color: var(--chu-phu);
		font-weight: 800;
	}
	.ban {
		margin-left: auto;
		color: var(--chu-phu);
		font-size: 0.8rem;
	}
	main {
		padding-block: 24px 40px;
	}
</style>
