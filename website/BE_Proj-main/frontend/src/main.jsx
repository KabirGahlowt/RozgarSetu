import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import axios from "axios";
import "./index.css";
import "./i18n";

axios.defaults.withCredentials = true;
import "./styles/theme.css";
import App from "./App.jsx";
import { Toaster } from "./components/ui/sonner.jsx";
import { Provider } from "react-redux";
import store from "./redux/store.js";
import { persistStore } from "redux-persist";
import { PersistGate } from "redux-persist/integration/react";

const persistor = persistStore(store);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <App />
      </PersistGate>
    </Provider>
    <Toaster />
  </StrictMode>,
);
