import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
	state: {
		iss: {
			data: null,
			tle: null
		}
	},
	mutations: {
		SET_ISS_DATA: (state, payload) => {
			state.iss.data = payload
		},
		SET_ISS_TLE: (state, payload) => {
			state.iss.tle = payload
		}
	},
	actions: {
	},
	modules: {
	}
})
