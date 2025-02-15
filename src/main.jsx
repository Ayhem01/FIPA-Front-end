import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { store } from "./features/store";
import { Provider } from "react-redux";

const root = document.getElementById('root');

const rootInstance = createRoot(root); // Créez une racine React

rootInstance.render(<Provider store={store}><App /></Provider>);