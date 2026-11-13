# Модуль настройки интеграций (feature/integration-config-form -> main)

- [x] Создан компонент `IntegrationConfigDialog.tsx` для добавления и настройки 5 источников (AD, KSC, TNI, MeshCentral, 1C).
- [x] Автоподстановка стандартных портов (389/636 LDAP, 13291 KSC, 443 MeshCentral, 80/443 1C) и SSL/TLS при выборе сервиса.
- [x] Выбор контейнеров Active Directory (CN/OU) после успешной проверки соединения («Проверить соединение»).
- [x] Выбор режима источников данных TNI (сетевой каталог SMB либо прямое подключение к PostgreSQL).
- [x] Подключение диалога к таблице сервисов и кнопкам действий на странице `/integrations`.
- [x] Оформлен Pull Request #1 и выполнено объединение ветки `feature/integration-config-form` с `main`.
- [x] Проведено сквозное тестирование (153 из 154 тестов успешно пройдены).

# Текущее обновление

- [x] Создать локальный справочник антивирусов и СЗИ, поиск по сигнатурам названий и проверку списка программ без интернета.
- [x] Проверить локальное сопоставление тестами и в предпросмотре.
- [x] Синхронизировать проект с последним коммитом Miha1109/CRM-ITpark (f0a1e1c).
- [x] Проверить антивирусный модуль и новые фильтры в предпросмотре.
- [x] Проверить дашборд, реестр, карточки устройств и интеграции; исправить найденные ошибки.
- [x] Запустить проверки проекта и сохранить изменения.

# Antivirus data

- [x] Add registry filters for antivirus and protection status.
- [x] Show source and last-updated date for each other-antivirus program name and version.
- [x] Removed paid cloud AI (AntivirusAi) and replaced with 100% offline local security catalog (LocalSecurityMatcher, 30 products, 140 tests, 0 cost).
- [ ] Save a clean source copy of the project to Google Drive.
- [x] Separate confirmed agent installation from agent availability in the device card.
- [x] Rename the device tab to Antivirus and separate KSC data from other antivirus data.
- [x] Add antivirus fields to the inventory model, registry, device summary and KSC tab.
- [x] Add CSV export with the four antivirus columns and verify mapping and the user flow.
- [ ] Update external inventory-hub scripts — blocked: scripts and source KSC files are not present in this project.
