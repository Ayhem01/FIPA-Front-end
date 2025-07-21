import { configureStore } from '@reduxjs/toolkit';
import userReducer from "./userSlice";
import marketingReducer from './marketingSlice';
import taskReducer from './taskSlice';
import projectReducer from './projectSlice';
import inviteReducer from './inviteSlice';



export const store = configureStore({
    reducer: {
        user: userReducer,
        marketing: marketingReducer,
        tasks: taskReducer,
        projects: projectReducer,
        invites: inviteReducer,
            },
});

