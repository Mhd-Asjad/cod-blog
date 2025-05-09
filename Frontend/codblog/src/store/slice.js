import { createSlice } from '@reduxjs/toolkit'

const initialState = {
    access_token: null,
    refresh_token: null,
    user: null,
    is_login: false
}

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        saveLogin: (state, action) => {
            state.access_token = action.payload.access_token;
            state.refresh_token = action.payload.refresh_token;
            state.user = action.payload.user;
            state.is_login = true
        },
        removeLogin: (state) => {
            state.access_token = null;
            state.refresh_token = null;
            state.user = null;
            state.is_login = false;
        }
    }
})

export const { saveLogin, removeLogin } = authSlice.actions
export default authSlice.reducer;