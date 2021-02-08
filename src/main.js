import { internationalize } from '@app/scripts/i18n.js';

import languages from '@app/locales/index.json';
import App from '@app/components/App.svelte';

const locales = languages.map((language) => language.lang);

internationalize(locales).then(() => {
  /**
   * See for options:
   * https://svelte.dev/docs#Creating_a_component
   */
  new App({
    target: document.getElementById('wai-wcag-em-report-tool'),
    props: {
      // Replaced string, see rollup.config.json replace plugin.
      basepath: '__BASEPATH__'
    }
  });
});
