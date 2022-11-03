export const namespaced = true

export const state = () => ({
  pageNo: 1
})

export const mutations = {
  SET_PAGENO (state, newPageNo) {
    state.pageNo = newPageNo
    console.log('set state.pageNo ' + state.pageNo) // eslint-disable-line no-console
  }
}

export const actions = {
  setPageNo (vuexContext, newPageNo) {
    vuexContext.commit('SET_PAGENO', newPageNo)
  }
}
