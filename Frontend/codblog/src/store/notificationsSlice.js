import { createSlice } from "@reduxjs/toolkit";

const notificationSlice = createSlice({
    name : 'notifcations',
    initialState : {
        unread_count : 0
    },
    reducers : {
        setUnreadCount : (state,action) => {
            state.unread_count = action.payload;
        },
        resetCount : (state) => {
            state.unread_count = 0
        }
    }
})

export const { setUnreadCount } = notificationSlice.actions;
export default notificationSlice.reducer