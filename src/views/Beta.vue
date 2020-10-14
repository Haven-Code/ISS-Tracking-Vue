<!-- @format -->

<template>
	<v-app>
		<v-main>
			<v-overlay :value="!load.card" opacity="0.95">
				<div class="loader">Loading...</div>
			</v-overlay>

			<HereMap />

			<v-card v-if="load.card" color="grey lighten-4" rounded elevation="5" class="info-card float-right mr-5 mt-5 pa-1" min-height="30vh" width="25vw">
				<v-card-title class="text-center">
					International Space Station
				</v-card-title>

				<v-card-subtitle class="text-center">
					ISS (ZARYA)
				</v-card-subtitle>

				<v-divider></v-divider>

				<div class="infoCard mx-1 ma-1">
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
						<strong>{{ iss.data.height.toFixed(7) }} Km</strong>
					</p>
					<p class="mb-1">
						Velocity:
						<strong>{{ iss.data.velocity.toFixed(5) }} Km/s</strong>
					</p>
					<p class="mb-1">
						Direction:
						<strong>{{ getAngle }}</strong>
					</p>
					<p class="mb-1">
						Mean Motion:
						<strong>{{ getMM }} Round/day</strong>
					</p>
					<p class="mb-1">
						Distance To User:
						<strong>{{ getDistance }} Km</strong>
					</p>
					<p>
						ISS Time:
						<strong>{{ time }}</strong>
					</p>
				</div>
			</v-card>
		</v-main>
	</v-app>
</template>

<script>
	import { mapState } from 'vuex'
	import { getMeanMotion } from 'tle.js'
	import moment from 'moment'

	export default {
		name: 'Beta',
		components: {
			HereMap: () => import('../components/MapHereBeta'),
		},
		computed: {
			...mapState(['map', 'user', 'iss', 'load']),
			getMM() {
				return getMeanMotion([this.iss.tle.line1, this.iss.tle.line2]).toFixed(4)
			},
			getAngle() {
				return this.getCardinalDirection(this.iss.data.azimuth)
			},
			getDistance() {
				return (this.iss.distanceFromUser / 1000).toFixed(3)
			},
		},
		data: () => ({
			overlay: false,
			time: 0,
		}),
		methods: {
			getCardinalDirection(angle) {
				const directions = ['↑ North', '↗ North East', '→ East', '↘ South East', '↓ South', '↙ South West', '← West', '↖ North West']
				return directions[Math.round(angle / 45) % 8]
			},
			getTime() {
				setInterval(() => {
					this.time = moment()
						.utc()
						.format()
				}, 1000)
			},
		},
		mounted() {
			this.getTime()
		},
	}
</script>

<style lang="scss" scoped>
	.info-card {
		position: relative;
		z-index: 2;
		left: 0;
		top: 0;
	}

	.loader {
		color: #ffffff;
		font-size: 90px;
		text-indent: -9999em;
		overflow: hidden;
		width: 1em;
		height: 1em;
		border-radius: 50%;
		margin: 72px auto;
		position: relative;
		-webkit-transform: translateZ(0);
		-ms-transform: translateZ(0);
		transform: translateZ(0);
		-webkit-animation: load6 1.7s infinite ease, round 1.7s infinite ease;
		animation: load6 1.7s infinite ease, round 1.7s infinite ease;
	}
	@-webkit-keyframes load6 {
		0% {
			box-shadow: 0 -0.83em 0 -0.4em, 0 -0.83em 0 -0.42em, 0 -0.83em 0 -0.44em, 0 -0.83em 0 -0.46em, 0 -0.83em 0 -0.477em;
		}
		5%,
		95% {
			box-shadow: 0 -0.83em 0 -0.4em, 0 -0.83em 0 -0.42em, 0 -0.83em 0 -0.44em, 0 -0.83em 0 -0.46em, 0 -0.83em 0 -0.477em;
		}
		10%,
		59% {
			box-shadow: 0 -0.83em 0 -0.4em, -0.087em -0.825em 0 -0.42em, -0.173em -0.812em 0 -0.44em, -0.256em -0.789em 0 -0.46em, -0.297em -0.775em 0 -0.477em;
		}
		20% {
			box-shadow: 0 -0.83em 0 -0.4em, -0.338em -0.758em 0 -0.42em, -0.555em -0.617em 0 -0.44em, -0.671em -0.488em 0 -0.46em, -0.749em -0.34em 0 -0.477em;
		}
		38% {
			box-shadow: 0 -0.83em 0 -0.4em, -0.377em -0.74em 0 -0.42em, -0.645em -0.522em 0 -0.44em, -0.775em -0.297em 0 -0.46em, -0.82em -0.09em 0 -0.477em;
		}
		100% {
			box-shadow: 0 -0.83em 0 -0.4em, 0 -0.83em 0 -0.42em, 0 -0.83em 0 -0.44em, 0 -0.83em 0 -0.46em, 0 -0.83em 0 -0.477em;
		}
	}
	@keyframes load6 {
		0% {
			box-shadow: 0 -0.83em 0 -0.4em, 0 -0.83em 0 -0.42em, 0 -0.83em 0 -0.44em, 0 -0.83em 0 -0.46em, 0 -0.83em 0 -0.477em;
		}
		5%,
		95% {
			box-shadow: 0 -0.83em 0 -0.4em, 0 -0.83em 0 -0.42em, 0 -0.83em 0 -0.44em, 0 -0.83em 0 -0.46em, 0 -0.83em 0 -0.477em;
		}
		10%,
		59% {
			box-shadow: 0 -0.83em 0 -0.4em, -0.087em -0.825em 0 -0.42em, -0.173em -0.812em 0 -0.44em, -0.256em -0.789em 0 -0.46em, -0.297em -0.775em 0 -0.477em;
		}
		20% {
			box-shadow: 0 -0.83em 0 -0.4em, -0.338em -0.758em 0 -0.42em, -0.555em -0.617em 0 -0.44em, -0.671em -0.488em 0 -0.46em, -0.749em -0.34em 0 -0.477em;
		}
		38% {
			box-shadow: 0 -0.83em 0 -0.4em, -0.377em -0.74em 0 -0.42em, -0.645em -0.522em 0 -0.44em, -0.775em -0.297em 0 -0.46em, -0.82em -0.09em 0 -0.477em;
		}
		100% {
			box-shadow: 0 -0.83em 0 -0.4em, 0 -0.83em 0 -0.42em, 0 -0.83em 0 -0.44em, 0 -0.83em 0 -0.46em, 0 -0.83em 0 -0.477em;
		}
	}
	@-webkit-keyframes round {
		0% {
			-webkit-transform: rotate(0deg);
			transform: rotate(0deg);
		}
		100% {
			-webkit-transform: rotate(360deg);
			transform: rotate(360deg);
		}
	}
	@keyframes round {
		0% {
			-webkit-transform: rotate(0deg);
			transform: rotate(0deg);
		}
		100% {
			-webkit-transform: rotate(360deg);
			transform: rotate(360deg);
		}
	}
</style>
