📰 CHANGELOG :: @mail-core/cli
--------------------------------
<a name="start"></a>

### 7.1.0

- Улучшенный `npx @mail-core/cli init`, новая демо команда и вывод через `addProcessSummary`
- `style` в качестве аргумента `handler`
- `options` внутри `handler` теперь имеют `name` и `value`
- Поддержка `--yes` для отключения интерактивного режима
- `console.cli.require` для запроса опций
- Небольшой fix `run` укогда в проекте нет typescript

---

### 7.0.0

- `addProcessSummary` — для вывода финальной информации после выполенения всех команд/процессов

---

### 4.0.0

- Добавлен `getModuleRootDir(path: string)`
- Вернул поддержку `string[]` в качестве `argv` для `execCommand`
- Добавлен реекспорт
  - [boxen](https://www.npmjs.com/package/boxen) для рисования рамок
  - [strip-ansi](https://www.npmjs.com/package/strip-ansi)
- Улучшен вывод ошибки при падении команды
- Константа `IS_SUDO_ENV`
- `shebang-fix` теперь работает и в CI

---

### 3.0.0

- Bump `@mail-core/wisever`

---

### 2.7.0

- Исправлена команда `local` (🐞 `Cannot find module '../{pkg-name}/cli.js`)
- Публикация через `@mail-core/wisever` 🧙🏻‍♂️

---

### 2.6.1

- Конфигурация `@mail-core/wisever` 🧙🏻‍♂️ для отправки IM 💬 о публикации пакета 🚀

---

### 2.5

- Улучшенный вывод ошибок при падении команды
- `getActiveConsole` для доступа к активной `console`

---

### 2.3.0

Добавлена команда для интеграции CLI в любой проект:
→  `npx mail-core-cli init` 🔥

Так же не забывайте про создание
→  `npx mail-core-cli create` # Создание команд ☝🏻

---

### 2.2.1

Новый метод для вывода списка `console.list`, кроме списка можно выводить и колонки, т.е. построить таблицу.

---

### 2.1.0

Добавлена утилита, которая возвращает следующий «порт»

import {getNextPort} from '@mail-core/cli/util/port';

getNextPort(); // '20223'
getNextPort(); // '20323'

---

### 2.0.1

Исправлен мелкий баг с пробросом `exit code` в родительский процесс.

https://gitlab.corp.mail.ru/mail-core/cli/-/issues/7

---

### 1.9.1

Исправлена комманда `npx mail-core-cli create` для создания `cli`-комманд, раньше она не правильно детектировала наличие команды.
