@mail-core/cli ⌨️
----------------
Инструментарий для написания cli-скриптов:

- Интеграция в любой проект одной командой: `npx mail-core-cli init` 🔥
- Расширенный логер для взаимодействия с консолью из команды (цвета, спинер и т.п.)
- Интерактивное взаимодействие через [Inquirer](https://github.com/SBoudrias/Inquirer.js#readme)
- Взаимодействие с `package.json` (чтение, запись)
- Хелперы для выполнения shell-команд и запуска `npm`/`npx`
- Под капотом [yargs](https://github.com/yargs/yargs#readme)


```sh
# Устновка
npm --save @mail-core/cli

# Интеграция в любой проект
npx mail-core-cli init

# Полезные команды
npx mail-core-cli --help
```

---

### CLI

Основная цель — это написания cli-комманд и возможность их использования из других пакетов.

##### `cli/install/index.ts`

```ts
import { createCommand } from '@mail-core/cli';

// Описываем команду
export const install = createCommand({
	name: 'install',
	describe: 'Install config',
	options: {
		autoMerge: {
			type: 'boolean',
			description: 'Use auto merge',
			interactive: true,
		},
	},
	handler(argv, {console}) {
		console.log('handler:', argv);
	},
});
```

##### `cli/index.ts`

```ts
import { initCLI } from '@mail-core/cli';
import { gitHookInstall } from '@mail-core/git/cli/hook/install';
import { install } from './install';

// Инициализируем комманды
initCLI(
	// CLI Env
	{__dirname},
	
	// Command List
	install,
	{ 'git-hook': gitHookInstall }, // "git-hook-install" and etc
);
```

---

### API

### `@mail-core/cli/color`

Terminal string styling done right, основано на [chalk](https://github.com/chalk/chalk#readme)

---

### `@mail-core/cli/prompt

A collection of common interactive command line user interfaces, другими словами [Inquirer.js](https://github.com/SBoudrias/Inquirer.js#readme)

---

### `@mail-core/cli`

#### readPackageJson

Получить содержимое `package.json`

---

#### updatePackageJson

Обновить содержимое `package.json`
