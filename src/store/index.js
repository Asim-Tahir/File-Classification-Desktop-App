import Vue from 'vue'
import Vuex from 'vuex'

const {state} = require('./state');
const {mutations} = require('./mutations');
const {actions} = require('./actions');
const {modules} = require('./modules');

Vue.use(Vuex)

export default new Vuex.Store({
  state,
	mutations,	
  actions,
  modules
})
