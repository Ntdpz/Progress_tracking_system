// store/index.js
export const state = () => ({
  user_id: undefined,
  drawer: false, // สถานะสำหรับ v-navigation-drawer
  isLoading: false,
});

export const mutations = {
  setState(state, payload) {
    Object.assign(state, payload);
  },
  // Mutation สำหรับการจัดการสถานะของ drawer
  SET_DRAWER(state, status) {
    state.drawer = status;
  },
  SET_LOADING(state, status) {
    state.isLoading = status;
  },
};

export const actions = {
  // Action สำหรับการตั้งค่าสถานะของ drawer
  setDrawer({ commit }, status) {
    commit('SET_DRAWER', status);
  },
  setLoading({ commit }, status) {
    commit('SET_LOADING', status);
  },
};

export const getters = {
  isLoading: (state) => state.isLoading
};