📰 CHANGELOG :: @mail-core/cli
--------------------------------
<a name="start"></a>

### NEXT

- Поддержка `--yes` для отключения интерактивного режима
- `console.cli.require` для запроса опций

---

### <span title="2021-05-26 14:40:51">7.0.0</span> <sup><a href="https://gitlab.corp.mail.ru/mail-core/cli/-/compare/v5.0.0...v7.0.0" target="_blank">diff</a></sup>

- Bump version

---

### <span title="2021-05-14 09:36:46">5.0.0</span> <sup><a href="https://gitlab.corp.mail.ru/mail-core/cli/-/compare/v4.0.0...v5.0.0" target="_blank">diff</a></sup>

- `addProcessSummary` — для вывода финальной информации после выполенения всех команд/процессов

---

### <span title="2021-04-20 16:03:48">4.0.0</span> <sup><a href="https://gitlab.corp.mail.ru/mail-core/cli/-/compare/v3.0.1...v4.0.0" target="_blank">diff</a></sup>

- Добавлен `getModuleRootDir(path: string)`
- Вернул поддержку `string[]` в качестве `argv` для `execCommand`
- Добавлен реекспорт
  - [boxen](https://www.npmjs.com/package/boxen) для рисования рамок
  - [strip-ansi](https://www.npmjs.com/package/strip-ansi)
- Улучшен вывод ошибки при падении команды
- Константа `IS_SUDO_ENV`
- `shebang-fix` теперь работает и в CI

---

### <span title="2021-03-12 09:59:31">3.0.0</span> <sup><a href="https://gitlab.corp.mail.ru/mail-core/cli/-/compare/v2.7.0...v3.0.0" target="_blank">diff</a></sup>

- Bump `@mail-core/wisever`

---
### <span title="2021-03-11 10:41:42">2.7.0</span> <sup><a href="https://gitlab.corp.mail.ru/mail-core/cli/-/compare/v2.6.1...v2.7.0" target="_blank">diff</a></sup>

- Исправлена команда `local` (🐞 `Cannot find module '../{pkg-name}/cli.js`)
- Публикация через `@mail-core/wisever` 🧙🏻‍♂️

---

### <span title="2021-03-10 15:11:06">2.6.1</span> <sup><a href="https://gitlab.corp.mail.ru/mail-core/cli/-/compare/v2.6.0...v2.6.1" target="_blank">diff</a></sup>

- Конфигурация `@mail-core/wisever` 🧙🏻‍♂️ для отправки IM 💬 о публикации пакета 🚀

---

### <span title="2021.02.19 12:21:52">2.5</span>

- Улучшенный вывод ошибок при падении команды
- `getActiveConsole` для доступа к активной `console`

---

### <span title="2021.02.08 15:14:35">2.3.0</span>

Добавлена команда для интеграции CLI в любой проект:
→  `npx mail-core-cli init` 🔥

Так же не забывайте про создание
→  `npx mail-core-cli create` # Создание команд ☝🏻

---

### <span title="2021.01.20 18:16:54">2.2.1</span>

Новый метод для вывода списка `console.list`, кроме списка можно выводить и колонки, т.е. построить таблицу.


⌨️ `npx --save @mail-core/cli`

Новый метод для вывода списка `console.list`, кроме списка можно выводить и колонки, т.е. построить таблицу.

---

### <span title="2021.01.13 16:08:38">2.1.0</span>

Добавлена утилита, которая возвращает следующий «порт»

import {getNextPort} from '@mail-core/cli/util/port';

getNextPort(); // '20223'
getNextPort(); // '20323'

---

### <span title="2021.01.12 14:05:28">2.0.1</span>

Исправлен мелкий баг с пробросом `exit code` в родительский процесс.

https://gitlab.corp.mail.ru/mail-core/cli/-/issues/7

---

### <span title="2020.12.18 13:36:22">1.9.1</span>

⌨️ `npm i --save @mail-core/cli@1.9.1`

Исправлена комманда `npx mail-core-cli create` для создания `cli`-комманд, раньше она не правильно детектировала наличие команды.
