<!-- @format -->

<template>
	<v-app>
		<Drawer />

		<v-main>
			<ToolBar class="toolbarFloat"/>
			<HereMap class="map"/>
		</v-main>
	</v-app>
</template>

<script>
	/* eslint-disable */
	export default {
		name: 'Home',
		components: {
			HereMap: () => import('../components/MapComponent'),
			ToolBar: () => import('../components/ToolBar'),
			Drawer: () => import('../components/Drawer')
		},
		data: () => ({
		}),
		methods: {},
	}
</script>

<style scoped>
	.toolbarFloat {
		z-index: 2;
	}
</style>