import config from './configs/config.json';

const rules = {
  'no-explicit-type-exports': require('./rules/no-explicit-type-exports'),
};

export = {
  rules,
  configs: { config },
};
