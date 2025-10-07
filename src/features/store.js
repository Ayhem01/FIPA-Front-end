import { configureStore } from '@reduxjs/toolkit';
import userReducer from "./userSlice";
import marketingReducer from './marketingSlice';
import taskReducer from './taskSlice';
import projectReducer from './projectSlice';
import inviteReducer from './inviteSlice';
import prospectReducer from './prospectSlice';
import investisseurReducer from './investisseurSlice'; // Importer le reducer pour les investisseurs
import blockagesReducer from './blockageSlice';
import dashboardReducer from './dashboardSlice';
import companiesReducer from './companiesSlice';


export const store = configureStore({
    reducer: {
        user: userReducer,
        marketing: marketingReducer,
        tasks: taskReducer,
        projects: projectReducer,
        invites: inviteReducer,
        prospects: prospectReducer,
        investisseurs: investisseurReducer, 
        blockages:blockagesReducer,
        dashboard: dashboardReducer,
        companies:companiesReducer,

            },
});

