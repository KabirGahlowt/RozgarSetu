import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import en from "./locales/en/common.json";
import hi from "./locales/hi/common.json";
import mr from "./locales/mr/common.json";
import ta from "./locales/ta/common.json";
import te from "./locales/te/common.json";
import kn from "./locales/kn/common.json";

const resources = {
  en: { translation: en },
  hi: { translation: hi },
  mr: { translation: mr },
  ta: { translation: ta },
  te: { translation: te },
  kn: { translation: kn },
};

const savedLanguage = localStorage.getItem("rs_lang") || "en";

i18n.use(initReactI18next).init({
  resources,
  lng: savedLanguage,
  // If selected language is still incomplete, fall back to Hindi first
  // so every visible key still renders translated text.
  fallbackLng: {
    mr: ["hi", "en"],
    ta: ["hi", "en"],
    te: ["hi", "en"],
    kn: ["hi", "en"],
    default: ["en"],
  },
  interpolation: {
    escapeValue: false,
  },
});

i18n.on("languageChanged", (lng) => {
  localStorage.setItem("rs_lang", lng);
});

export default i18n;
