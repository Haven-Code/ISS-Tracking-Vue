<!-- @format -->

<template>
	<v-toolbar dense absolute class="toolbarFloat ml-5 mt-5" flat floating rounded>
		<v-btn icon @click.stop="moveToUserLocation()">
			<v-icon>fas fa-location-arrow</v-icon>
		</v-btn>
	</v-toolbar>
</template>

<script>
	import { mapState } from 'vuex'

	export default {
		name: 'ToolBar',
		computed: {
			...mapState(['user','map']),
		},
		methods: {
			moveToUserLocation() {
				this.map.instance.setCenter(this.user.coords)
			},
		},
	}
</script>

<style></style>
