import OptionsSync from 'webext-options-sync';

export default new OptionsSync({
	defaults: {
		turnedOn: true,
	},
	migrations: [
		OptionsSync.migrations.removeUnused
	],
	logging: true
});
