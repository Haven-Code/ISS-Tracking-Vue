<!-- @format -->

<template>
	<div id="map">
		<!--In the following div the HERE Map will render-->
		<div id="mapContainer" ref="hereMap"></div>
	</div>
</template>

<script>
	/* eslint-disable */
	import axios from 'axios'
	import { getSatelliteInfo } from 'tle.js'
	import moment from 'moment'

	export default {
		name: 'HereMap',
		data() {
			return {
				map: {
					instance: null,
					platform: null,
					apikey: process.env.VUE_APP_HERE_API_KEY,
				},
				iss: {
					tle: null,
					marker: null,
					markerFirstTime: true,
					status: null,
				},
				user: {
					coords: null,
				},
			}
		},
		mounted() {
			// Initialize the platform object:
			const platform = new window.H.service.Platform({
				apikey: this.map.apikey,
			})
			this.map.platform = platform

			this.getTLEData()
			this.initializeHereMap()

			setInterval(() => {
				this.getISSData()
			}, 8000)

			setTimeout(() => {
				this.drawOrbitLine()
			}, 2000)

			this.initUserLocation()
		},
		methods: {
			initializeHereMap() {
				// rendering map

				const mapContainer = this.$refs.hereMap
				const H = window.H
				// Obtain the default map types from the platform object
				var maptypes = this.map.platform.createDefaultLayers()

				// Instantiate (and display) a map object:
				var map = new H.Map(mapContainer, maptypes.vector.normal.map, {
					pixelRatio: window.devicePixelRatio || 1,
					zoom: 4,
					// center object { lat: 40.730610, lng: -73.935242 }
				})

				this.map.instance = map
				this.$store.commit('SET_MAP_INSTACE', map)

				addEventListener('resize', () => map.getViewPort().resize())

				new H.mapevents.Behavior(new H.mapevents.MapEvents(map))

				H.ui.UI.createDefault(map, maptypes)

				// Add the marker to the map and center the map at the location of the marker:
			},
			initUserLocation() {
				let pos = {}
				const H = window.H

				if (navigator.geolocation) {
					navigator.geolocation.getCurrentPosition(
						(position) => {
							pos = {
								lat: position.coords.latitude,
								lng: position.coords.longitude,
							}

							let marker = new H.map.Marker(pos)

							this.map.instance.addObject(marker)
							//this.map.instance.setCenter(pos)
							this.$store.commit('SET_USER_COORDS', pos)
						},
						() => {
							pos = this.getUserLocationByIP()
						}
					)
				} else {
					pos = this.getUserLocationByIP()
				}
			},
			getUserLocationByIP() {},
			async getTLEData() {
				let url = 'https://api.wheretheiss.at/v1/satellites/25544/tles'

				try {
					let res = await axios.get(url)
					let tle = {
						header: res.data.header,
						line1: res.data.line1,
						line2: res.data.line2,
					}

					this.iss.tle = tle
					this.$store.commit('SET_ISS_TLE', tle)
				} catch (err) {
					throw new Error(err)
				}
			},
			getISSData() {
				const tleArr = [this.iss.tle.line1, this.iss.tle.line2]
				const sttInfo = getSatelliteInfo(tleArr)
				// console.log(sttInfo)

				let pos = {
					lat: sttInfo.lat,
					lng: sttInfo.lng,
					alt: sttInfo.height,
				}

				const H = window.H

				if (this.iss.markerFirstTime) {
					let option = {
						size: new H.math.Size(70, 70),
						stickHeight: 100,
					}
					let icon = new H.map.Icon('/assets/svg/iss.svg', option)
					let marker = new H.map.Marker(pos, { icon: icon })
					this.iss.marker = marker
					this.iss.markerFirstTime = false
					this.map.instance.addObject(marker)
					this.map.instance.setZoom(1)
					this.map.instance.setCenter(pos)
				} else {
					this.iss.marker.setGeometry(pos)
				}

				this.iss.status = sttInfo
				this.$store.commit('SET_ISS_DATA', sttInfo)
			},
			drawOrbitLine() {
				const tleArr = [this.iss.tle.line1, this.iss.tle.line2]
				const delay = 250000

				const H = window.H
				let lineString = new H.geo.LineString()

				const nowTimeStamp = moment().valueOf()
				let newTimeStamp = nowTimeStamp - delay / 2
				const sttInfo = getSatelliteInfo(tleArr, newTimeStamp)

				lineString.pushPoint({ lat: sttInfo.lat, lng: sttInfo.lng })

				for (let i = 1; i <= 15; i++) {
					const nowTimeStamp = moment().valueOf()
					let newTimeStamp = nowTimeStamp + delay * i
					const sttInfo = getSatelliteInfo(tleArr, newTimeStamp)

					lineString.pushPoint({ lat: sttInfo.lat, lng: sttInfo.lng })
				}

				let option = {
					style: {
						lineWidth: 4,
						fillColor: '#ffff00',
					}
				}
				this.map.instance.addObject(new H.map.Polyline(lineString, option))
			},
		},
	}
</script>

<style scoped>
	#map {
		/* width: 100vw !important;
		height: 100vh !important; */
		min-width: 800px;
		min-height: 600px;
		text-align: center;
		background-color: #ccc;
	}

	#mapContainer {
		width: 100%;
		height: 100%;
		left: 0;
		top: 0;
		position: absolute;
	}
</style>

<style>
	body {
		padding: 0 !important;
		margin: 0 !important;
	}
</style>
