const {defaults} = require('jest-config');

module.exports = {
	preset: 'ts-jest',
	testEnvironment: 'node',
	testMatch: defaults.testMatch.concat('**/?(*.)+(spec|tests).[tj]s?(x)'),
};
