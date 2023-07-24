module.exports = {
  '*.{js,jsx,ts,tsx}': ['eslint --fix', 'prettier --write'],
  '*.vue': ['prettier --write', 'eslint --fix']
}
