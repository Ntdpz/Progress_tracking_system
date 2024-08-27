// store/index.js
export const state = () => ({
  user_id: undefined,
  drawer: false, // เพิ่มสถานะใหม่สำหรับ v-navigation-drawer
});

export const mutations = {
  setState(state, payload) {
    this.replaceState(Object.assign(state, payload));
  },
  // Mutation ใหม่สำหรับการจัดการสถานะของ drawer
  SET_DRAWER(state, status) {
    state.drawer = status;
  }
};

export const actions = {
  // Action ใหม่สำหรับการตั้งค่าสถานะของ drawer
  setDrawer({ commit }, status) {
    commit('SET_DRAWER', status);
  }
};
