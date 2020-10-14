import { writable } from 'svelte/store';

const summaryStore = writable({
  EVALUATION_TITLE: '',
  EVALUATION_COMMISSIONER: '',
  EVALUATION_CREATOR: '',
  EVALUATION_DATE: new Date(),
  EVALUATION_SUMMARY: '',
  EVALUATION_SPECIFICS: ''
});

export default summaryStore;
