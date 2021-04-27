import Svelecte, { config } from 'svelecte';

Object.assign(config, {
  placeholder: '',
  i18n: {
    empty: 'No options remaining',
    nomatch: 'No matching options',
    max: num => `Maximum items ${num} selected`,
    fetchBefore: 'Type to search',
    fetchEmpty: 'No data related to your search',
    collapsedSelection: count => `${count} selected`
  },  
});

export default Svelecte;