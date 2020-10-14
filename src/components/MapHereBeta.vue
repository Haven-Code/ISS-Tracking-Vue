<!-- @format -->

<template>
	<div id="mapContainer" ref="hereMap"></div>
</template>

<script>
	import axios from 'axios'
	import { getSatelliteInfo } from 'tle.js'
	import moment from 'moment'

	export default {
		name: 'MapHereBeta',
		data: () => ({
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
			calcDistance: {
				line: null,
				firstTime: true,
			},
		}),
		methods: {
			init() {
				const mapContainer = this.$refs.hereMap
				const H = window.H
				var maptypes = this.map.platform.createDefaultLayers()

				var map = new H.Map(mapContainer, maptypes.vector.normal.map, {
					pixelRatio: window.devicePixelRatio || 1,
					zoom: 1,
				})

				this.map.instance = map

				addEventListener('resize', () => map.getViewPort().resize())
				new H.mapevents.Behavior(new H.mapevents.MapEvents(map))
				H.ui.UI.createDefault(map, maptypes)
			},
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
			async getISSData() {
				const tleArr = [this.iss.tle.line1, this.iss.tle.line2]
				const sttInfo = await getSatelliteInfo(tleArr)
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
					},
				}
				this.map.instance.addObject(new H.map.Polyline(lineString, option))
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
							this.user.coords = pos
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
			calculateDistanceUserVsISS() {
				if (this.calcDistance.line != null) this.map.instance.removeObject(this.calcDistance.line)

				const H = window.H

				const straightLineString = new H.geo.LineString()
				straightLineString.pushPoint(this.user.coords)
				const tleArr = [this.iss.tle.line1, this.iss.tle.line2]
				const sttInfo = getSatelliteInfo(tleArr)
				let pos = {
					lat: sttInfo.lat,
					lng: sttInfo.lng,
				}
				straightLineString.pushPoint(pos)
				let option = {
					style: {
						lineWidth: 2,
						strokeColor: '#FFEA00',
					},
				}
				const straightPolyline = new H.map.Polyline(straightLineString, option)
				this.map.instance.addObject(straightPolyline)
				this.calcDistance.line = straightPolyline

				const userMarker = new H.map.Marker(this.user.coords)
				const distance = userMarker.getGeometry().distance(pos)
				this.$store.commit('SET_ISS_DISTANCE_FROM_USER', distance)
			},
		},
		async mounted() {
			const platform = new window.H.service.Platform({
				apikey: this.map.apikey,
			})
			this.map.platform = platform

			await this.getTLEData()

			this.init()
			this.initUserLocation()

			setInterval(() => {
				this.getISSData()
				this.calculateDistanceUserVsISS()
			}, 5000)

			this.drawOrbitLine()

			this.$store.commit("SET_CARD_STATUS", true)
		},
	}
</script>

<style lang="scss" scoped>
	#mapContainer {
		// position: relative;
		width: 100vw;
		height: 100vh;
		background: grey;
		left: 0;
		top: 0;
		position: absolute;
	}
</style>
