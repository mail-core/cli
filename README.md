@mail-core/cli ⌨️
----------------
Инструментарий для написания cli-скриптов:

- Интеграция в любой проект одной командой: `npx mail-core-cli init` 🔥
- Расширенный логгер для взаимодействия с консолью из команды (цвета, спиннер и т.п.)
- Интерактивное взаимодействие через [Inquirer](https://github.com/SBoudrias/Inquirer.js#readme)
- Взаимодействие с `package.json` (чтение, запись)
- Хелперы для выполнения shell-команд и запуска `npm`/`npx`
- Под капотом [yargs](https://github.com/yargs/yargs#readme)
- typescript-first (строгая типизация)


```sh
# Интеграция в любой проект
npx @mail-core/cli init

# Создаём свою команду 👍🏻
npx mail-core-cli create

# Другие полезности
npx mail-core-cli --help
```

---

### API

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
		},
	},

	async handler(argv, env) {
		// argv — распаршенные аргументы
		//
		// env — «окружение»:
		//  - name — название команды
		//  - describe — её описание
		//  - options — описание опций, кроме этого уже содержит значения из `argv`
		//  - console — консоль с расширенными возможностями
		//    - console.cli — для взаимодействия с юзером
		//    - console.spinner — работа со спиннером (через Ora)
		//    - console.nl — вывод пустой строки
		//    - console.hr — разделитель
		//    - console.raw — ссылка на Native Console
		//    - {log, error, warn, ...rest}
		//  - style — стилизация текста (через Chalk)
	},
});
```

### API

#### Константы

- **ROOT_DIR**: `string` — корень проекта, в котором запускается команда
- **IS_NPX_ENV**: `boolean` - запущена ли команда через `npx`?


---

#### Работа с package.json

- **readPackageJson** — первым аргументом передаётся путь, относительно которого нужно искать `package.json`, по умолчанию это будет `ROOT_DIR`
- **updatePackageJson** — изменить package.json, первым аргументом путь, вторым обновленный `PackageJson`
- **registerRunCommand** — добавляем команду в [`npm.scripts`](https://docs.npmjs.com/cli/v7/commands/npm-run-script)
- **runCommandByScriptHook** — по факту тот же `registerRunCommand`, но для `npm` хуков
- **hasPackageJsonDependency** / **hasPackageJsonDevDependency** / **hasPackageJsonPeerDependency** - проверка на наличие зависимости
- **removePackageJsonDependency** — удалить зависимость из `PackageJson`
- **getPackageInstallType** — может вернуть:
  - `true` — пакет установлен как основная зависимость (в `dependencies`)
  - `dev` — установлен в `devDependencies`
  - `self` — метод был вызван в самом разрабатываемом пакете
  - `false` — ничего из вышеперечисленного


---

### Shell / Exec

- **spawn** — обвязка над нативным `spawn`, возвращает Promise, умеет показывать спиннер во время выполнения команды (не идеально конечно, но удобно)

---

### npm / npx

- **npxRun** — запуск `npx` команды, опять же спиннер, Promise и т.п.
- **npmRun** — запуск `npm scripts`
- **npmInstall** — установка всех зависмостей
- **npmInstallPackage** — установка конкретного пакета
