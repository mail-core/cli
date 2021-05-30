@mail-core/cli ⌨️
----------------
Инструментарий для написания cli-скриптов:

- Интеграция в любой проект одной командой: `npx @mail-core/cli init` 🔥
- Расширенный логер для взаимодействия с консолью из команды (цвета, спинер и т.п.)
- Интерактивное взаимодействие через [Inquirer](https://github.com/SBoudrias/Inquirer.js#readme)
- Взаимодействие с `package.json` (чтение, запись)
- Хелперы для выполнения shell-команд и запуска `npm`/`npx`
- Под капотом [yargs](https://github.com/yargs/yargs#readme)


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
		//  - name — названте команды
		//  - describe — её описание
		//  - options — описание опций, кроме этого уже содержит значения из `argv`
		//  - console — консоль с расширенными возможностями
		//    - console.cli — для взаимодействия с юзером
		//    - console.spinner — обертка над Ora
		//    - console.nl — вывод пустой строки
		//    - console.hr — разделитель
		//    - console.raw — ссылка на Native Console
		//    - {log, error, warn, ...rest}
		//  - style — просто Chalk
	},
});
```

### API

#### Константы

- **ROOT_DIR**:`string` — Точное определения корня проекта.
- **IS_NPX_ENV**:`boolean`


---

#### Работа с package.json

- **readPackageJson** — первым аргументом передаётся путь, относительно которого нужно искать `package.json`, по умолчанию это будет `ROOT_DIR`
- **updatePackageJson** — обновить, первым аргументом путь, вторым обновленный `PackageJson`
- **registerRunCommand** — регистрация `npm.scripts`
- **runCommandByScriptHook** — по факту тот же `registerRunCommand`, но для `npm` хуков
- **hasPackageJsonDependency** / **hasPackageJsonDevDependency** / **hasPackageJsonPeerDependency**
- **removePackageJsonDependency** — удалить зависимость из `PackageJson`
- **getPackageInstallType** — может вернуть:
  - `true` — пакет установлен как основная зависимость
  - `dev` — установлен как `DevDep`
  - `self` — значит метод был вызван в разрабатываем пакете
  - `false` — ничего из выше перечисленного


---

### Shell / Exec

- **spawn** — обмязка над нативным `spawn`, возвращает Promise, умеет спинер показывать (не идеально конечно, но удобно)

---

### npm / npx

- **npxRun** — запуск `npx` команды, опять же спинер, Promise и т.п.
- **npmRun** — запуск `npm scripts`
- **npmInstall** — установка всех зависмостей
- **npmInstallPackage** — установка конретного пакета
