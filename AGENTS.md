<!-- LOVABLE:BEGIN -->

> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.

## What Lovable manages

Rules outside this block are the project's own. Change the pieces below in
Lovable, not by hand. With the [Lovable MCP](https://mcp.lovable.dev)
connected, `send_message` asks Lovable to do it; otherwise ask the user to
use the editor.

- **Database.** Do not add or edit `supabase/migrations/` or `drizzle/`.
  Ask Lovable to change the schema.
- **Generated files.** Do not edit a file whose header says it is automatically
  generated.
- **AI gateway.** Keep model calls on Lovable's gateway, and keep
  `LOVABLE_API_KEY` out of browser code.
- **Connectors.** Lovable provides native connectors. `list_connectors` shows
  which are enabled; `add_connector` only returns the dashboard link. When a
  connector is enabled, calls go through the connector gateway and need
  `LOVABLE_API_KEY`. When Lovable does not provide one, users can bring their
  own key and store it in Secrets.
- **Secrets.** Lovable manages them. Do not put secret values in the repo.

<!-- LOVABLE:END -->

# Обязательный регламент для всех ИИ-ассистентов (AI Agent Mandatory Protocol)

> **ВНИМАНИЕ ВСЕМ ИИ (Lovable, Claude, ChatGPT, Cursor, Windsurf, Copilot и др.):**  
> Данный раздел содержит **строгие и обязательные требования** к работе с репозиторием `CRM IT-парк`. Следование данным правилам обязательно при каждом сеансе работы без необходимости дополнительных напоминаний от пользователя.

---

## 1. Первоочередные действия при подключении к репозиторию и скачивании проекта

Каждый ИИ-ассистент при первом обращении к проекту в рамках новой сессии или после выгрузки репозитория **ОБЯЗАН** выполнить следующий алгоритм:

1. **Развернуть зависимости**:
   ```bash
   bun install   # либо npm install
   ```
2. **Провести комплексную диагностику на ошибки, неточности и регрессии**:
   - **Проверка типов TypeScript**:
     ```bash
     npx tsc --noEmit
     ```
     *(В проекте включены строгие флаги `noPropertyAccessFromIndexSignature` и `exactOptionalPropertyTypes` — любые несоответствия типов считаются блокирующими).*
   - **Проверка линтера и форматирования**:
     ```bash
     bun run lint   # либо npm run lint
     ```
   - **Запуск всего набора тестов**:
     ```bash
     bun test       # либо npm run test
     ```
     *(Должны проходить 100% тестов: 154 из 154, включая тесты антивируса, KSC-агента, маршрутизации и каталога СЗИ).*
   - **Тестовая сборка приложения**:
     ```bash
     bun run build  # либо npm run build
     ```
3. **Обязательный отчёт пользователю**:
   - **ДО** внесения каких-либо новых правок ИИ обязан явно доложить пользователю о результатах первоначальной проверки.
   - Если обнаружены любые ошибки компиляции, сломанные тесты, предупреждения линтера, расхождения в контрактах или неточности в кодовой базе — **немедленно сообщить о них пользователю** с описанием причины и предложенным планом исправления.

---

## 2. Обязательная фиксация истории изменений (Changelog)

Любой ИИ-ассистент, вносящий изменения в проект (новый функционал, багфиксы, рефакторинг, обновление документации), **ОБЯЗАН** зафиксировать результат в истории изменений:
- Обновить раздел **«История изменений (Changelog)»** в файле `AI_HANDOFF.md` (и при необходимости в `AGENTS.md`).
- В записи обязательно указать:
  1. **Дату изменений**;
  2. **Что сделано** (какие файлы/компоненты добавлены или изменены, какая бизнес-логика реализована);
  3. **Что исправлено** (какие ошибки типизации, линтинга, логики или тестов были устранены);
  4. **Хэши коммитов или номер Pull Request**;
  5. **Результаты проверок**: подтверждение успешного прохождения `tsc --noEmit`, `lint`, `test` (154/154) и `build`.

---

## 3. Неприкосновенные архитектурные правила проекта
- **Нормализация антивирусных полей**: нормализация выполняется в browser-safe хелпере; реальная защита никогда не выводится из факта наличия софта, здоровья агента или свежести баз — это независимые факты.
- **Экспорт CSV**: экспорт инвентаря в CSV строится на той же нормализованной модели активов, что и в интерфейсе устройства.
- **Секции антивируса по источникам**: детализация антивируса группируется по источнику (KSC, TNI, реестр Windows), а не по названию вендора. Только записи KSC принадлежат разделу KSC.
- **Установка агента vs доступность**: статус установки агента требует явного подтверждения булевым флагом; доступность агента по сети отделена от установки и не доказывает её отсутствие.
- **Временные метки антивируса**: сохраняются раздельные метки источника и обновления для импортированных версий; при отсутствии метки статус остается неизвестным.
- **Локальный каталог СЗИ (`src/lib/security-catalog.ts`)**: сигнатурный матчер работает автономно в браузере, отличает агенты администрирования от антивирусных продуктов и не производит сетевых вызовов.

- **Single Source of Truth (Кадровые данные)**: Поля `mol` (материально ответственное лицо), `owner` (текущий пользователь), `mol_position` ведутся **исключительно** в CRM и 1С. Никакие внешние сканеры (AD, TNI, KSC, MeshCentral) не имеют права перезаписывать эти поля.
- **Разделение фактов ИБ**: Факт установки агента администрирования (`agentInstallation`) строго отделен от сетевой доступности (`agentAvailability`). Недоступность в сети не означает отсутствие агента.
- **Изоляция источников антивируса**: Данные антивирусной защиты KSC отображаются строго в секции KSC; сторонние СЗИ из инвентаризации ПО отображаются отдельно и не приписываются к KSC.
- **Локальный каталог СЗИ (`src/lib/security-catalog.ts`)**: База сигнатур 30 антивирусов и СЗИ работает полностью в браузере (browser-safe, offline-first), не делает сетевых запросов и носит рекомендательный характер.
- **Целостность Git**: Запрещены force-push (`git push --force`) и перезапись опубликованной истории в ветке `main`.

---

## 4. История последних изменений (Changelog)

- **13 ноября 2026** (коммит `b13ad57`):
  - **Что исправлено**:
    - Устранены ошибки компилятора TypeScript TS4111 (`noPropertyAccessFromIndexSignature`) при доступе к ошибкам валидации формы через строго типизированный интерфейс `FormErrors` в `IntegrationConfigDialog.tsx`.
    - Устранены ошибки TS2375 (`exactOptionalPropertyTypes`) в структуре `IntegrationItem` (явное разрешение `undefined` для опциональных полей).
    - Исправлено предупреждение хука `react-hooks/exhaustive-deps`: функция `applyPreset` обернута в `useCallback`.
    - Выполнено автоформатирование Prettier: устранено 45 замечаний форматирования.
  - **Результат**: 154 из 154 тестов пройдены успешно (100%), `tsc --noEmit` и `lint` проходят без ошибок.
- **13 ноября 2026** (PR #1, коммит `d892354`):
  - **Что сделано**:
    - В ветку `main` слит функционал настройки интеграций (коммиты `2d8d796`, `407cab3`, `a5bb5df`).
    - Реализована модальная форма `IntegrationConfigDialog.tsx` для подключения и настройки внешних источников: Active Directory (LDAP/LDAPS, порты 389/636, динамический выбор контейнеров OU/CN), Kaspersky Security Center (порт 13291, OpenAPI, политики), Total Network Inventory (TNI: чтение файловой шары SMB или базы PostgreSQL), MeshCentral (HTTPS 443, токены), 1С:Предприятие (OData v3/v4, Basic Auth).
    - Добавлена автоподстановка портов и параметров шифрования SSL/TLS.
  - **Затронутые файлы**: `src/components/crm/IntegrationConfigDialog.tsx`, `src/routes/integrations.tsx`.
