import { createStore } from "redux";
import { CHANGE_QUIZ, SET_TOKEN, UNSET_TOKEN } from "./actionTypes";

var initialState = {};

function appStateUpdater(state = initialState, action) {
  switch (action.type) {
    case CHANGE_QUIZ:
      return {
        ...state, 'QUIZ_INSTANCE': action.quiz_instance
      }
    case SET_TOKEN:
      return {
        ...state, 'TOKEN': action.token
      }
    case UNSET_TOKEN:
      const {TOKEN, ...newState} = state;
      return newState;
    default:
      return state;
  }
}
const persistedState = localStorage.getItem("reduxStore") ? JSON.parse(localStorage.getItem("reduxStore")) : {}
const store = createStore(
  appStateUpdater,
  persistedState,
  window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__()
);

store.subscribe(() => localStorage.setItem("reduxStore", JSON.stringify(store.getState())))
export default store;
