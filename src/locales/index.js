import i18n from 'i18next';
import * as F from '../library/Helper';
// import LanguageDetector from 'i18next-browser-languagedetector';
import en from './en.js';
import fa from './fa.js';

i18n
    // .use(LanguageDetector)
    .init({
        lng: F.getQuery('lang') || 'fa', // 'en' | 'es'
        resources: {
            en: {
                translations: en
            },
            fa: {
                translations: fa
            }
        },
        fallbackLng: 'fa',
        debug: true,

        // have a common namespace used around the full app
        ns: ['translations'],
        defaultNS: 'translations',

        keySeparator: false, // we use content as keys

        interpolation: {
            escapeValue: false, // not needed for react!!
            formatSeparator: ','
        },

        react: {
            wait: true
        }
    });

export default i18n;
export const t = (key, opt) => i18n.t(key, opt)