# OrderPath v3

## Обновление от 09.07.2025 - Улучшения в логике маршрутов

### Основные изменения

1. **Логика переходов при сборке заказов:**
   - Реализована строгая последовательность сборки по настроенному ручному маршруту
   - Добавлена функция навигации по категориям
   - При отметке товара собранным происходит автоматический переход к следующей несобранной позиции
   
2. **Поведение внутри категорий:**
   - При наличии 1-2 несобранных позиций в категории, система фокусируется на них
   - Только после полного сбора категории происходит переход к следующей по маршруту
   - При отмене сборки позиции, система возвращается к первой несобранной в этой категории
   
3. **Сохранение маршрутов для конкретных заказов:**
   - Каждый заказ имеет свой уникальный маршрут, сохраняемый по ID заказа
   - При переключении между заказами автоматически загружается соответствующий маршрут
   - Маршруты можно удалять и сбрасывать для каждого заказа отдельно

4. **Улучшения интерфейса:**
   - Увеличена высота окна ручного маршрута (90vh, max-height: 800px)
   - Кнопки в модальном окне маршрута стали одинакового размера
   - Кнопки расположены по центру для улучшения эргономики
   - Более короткие и информативные уведомления
   - Удалён автоскролл к категории после применения маршрута

### Особенности логики маршрута

- Категории, не включенные в маршрут, не участвуют в автоматической сборке
- Маршрут является специфичным для каждого заказа
- При отсутствии маршрута, сборка идёт в стандартном порядке сверху вниз

### Технические детали

- Добавлена функция `navigateToCategory()` для перехода между категориями
- Обновлена функция `findNextUncollectedItem()` для работы с маршрутом
- Добавлена функция `loadRouteForCurrentOrder()` для загрузки маршрута конкретного заказа
- Маршруты хранятся в localStorage с ключами `manualRoute_[orderID]` 