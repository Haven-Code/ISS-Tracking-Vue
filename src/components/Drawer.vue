<!-- @format -->

<template>
	<v-navigation-drawer app absolute permanent right class="elevation-1">
		<v-list-item>
			<v-list-item-content>
				<v-list-item-title class="title text-center">
					International Space
					<br />
					Station
				</v-list-item-title>

				<v-list-item-subtitle class="text-center">
					ISS (ZARYA)
				</v-list-item-subtitle>
			</v-list-item-content>
		</v-list-item>

		<v-divider></v-divider>

		<div class="text px-2 mt-2 tbText">
			<v-list-item-title class="title text-center mb-1">
				ISS Data
			</v-list-item-title>

			<p class="mb-1">
				Latitude:
				<strong>{{ iss.data.lat.toFixed(12) }}</strong>
			</p>
			<p class="mb-1">
				Longitude:
				<strong>{{ iss.data.lng.toFixed(12) }}</strong>
			</p>
			<p class="mb-1">
				Altitude:
				<strong>{{ iss.data.height.toFixed(5) }} Km</strong>
			</p>
			<p class="mb-1">
				Velocity:
				<strong>{{ iss.data.velocity.toFixed(5) }} Km/s</strong>
			</p>
			<p class="mb-1">
				Direction:
				<strong>{{ getAngle }}</strong>
			</p>
			<p>
				Mean Motion:
				<strong>{{ getMM }} Round/day</strong>
			</p>
		</div>

		<v-divider></v-divider>

		<div class="text px-2 mt-1" v-if="user.location != null">
			<v-list-item-title class="title text-center">
				List Astronauts
			</v-list-item-title>

			<!-- <v-row>
				<v-col cols="4" v-for="(item, index) in astronaut" :key="index">
					<v-img :src="getAstronautImage(item.name)"></v-img>
					{{ item.name }}
				</v-col>
			</v-row> -->
			<p v-for="(item, index) in astronaut" :key="index" class="mb-1">{{ item.name }}</p>
		</div>

		<v-footer absolute>
			<v-col class="text-center pa-0 ma-0" cols="12">
				<p class="text-subtitle-2 text-center mb-0 mt-2">
					Update every 8 seconds
				</p>
				<p class="text-subtitle-2 text-center mb-0 mt-2">
					Copyright &copy; {{ getYear }}
					<a target="_blank" href="https://havencode.net" class="">Haven Code</a>
				</p>
				<p class="text-subtitle-2 text-center mb-2">
					Powered By
					<a href="https://danghoangphuc.com" target="_blank">Phuc Dang</a>
				</p>
			</v-col>
		</v-footer>
	</v-navigation-drawer>
</template>

<script>
	import { mapState } from 'vuex'
	import moment from 'moment'
	import { getMeanMotion } from 'tle.js'
	import axios from 'axios'

	export default {
		name: 'Drawer',
		computed: {
			...mapState(['iss']),
			getYear() {
				return moment().format('YYYY')
			},
			getAngle() {
				return this.getCardinalDirection(this.iss.data.azimuth)
			},
			getMM() {
				return getMeanMotion([this.iss.tle.line1, this.iss.tle.line2]).toFixed(2)
			},
		},
		data: () => ({
			user: {
				location: null,
			},
			astronaut: null,
		}),
		methods: {
			getCardinalDirection(angle) {
				const directions = ['↑ North', '↗ North East', '→ East', '↘ South East', '↓ South', '↙ South West', '← West', '↖ North West']
				return directions[Math.round(angle / 45) % 8]
			},
			getUserLocation() {
				let pos = {}

				if (navigator.geolocation) {
					navigator.geolocation.getCurrentPosition(
						(position) => {
							pos = {
								lat: position.coords.latitude,
								lng: position.coords.longitude,
							}
							this.user.location = pos
						},
						() => {
							pos = null
							this.user.location = pos
						}
					)
				} else {
					pos = null
					this.user.location = pos
				}
			},
			getListAstronaut() {
				const url = 'http://api.open-notify.org/astros.json'

				axios
					.get(url)
					.then((res) => {
						if (res.data.message == 'success') {
							this.astronaut = res.data.people
						}
					})
					.catch((err) => {
						throw new Error(err)
					})
			},
			async getAstronautImage(name) {
				let url = `https://en.wikipedia.org/w/api.php?action=query&list=search&srwhat=text&srsearch=${name.replace(' ', '+')}&format=json`

				let res = await axios.get(url)

				let astroPageName = res.data.query.search[0].title
				let a = `https://en.wikipedia.org/w/api.php?action=query&titles=${astroPageName.replace(' ', '%20')}&prop=pageimages&format=json`

				let b = await axios.get(a)
				let obj = b.data.query.pages
				let data = obj[Object.keys(obj)[0]]

				return data.thumbnail.source
			},
		},
		mounted() {
			this.getUserLocation()
			this.getListAstronaut()
		},
	}
</script>
