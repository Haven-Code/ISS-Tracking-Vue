import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
	state: {
		iss: {
			data: null,
			tle: null
		},
		user: {
			coords: null
		},
		map: {
			instance: null
		}
	},
	mutations: {
		SET_ISS_DATA: (state, payload) => {
			state.iss.data = payload
		},
		SET_ISS_TLE: (state, payload) => {
			state.iss.tle = payload
		},
		SET_USER_COORDS: (state, payload) => {
			state.user.coords = payload
		},
		SET_MAP_INSTACE: (state, payload) => {
			state.map.instance = payload
		}
	},
	actions: {
	},
	modules: {
	}
})
