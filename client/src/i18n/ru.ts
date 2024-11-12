import { TranslationMessages } from "react-admin";

const russianMessages: TranslationMessages = {
  ra: {
    action: {
      add_filter: "Добавить фильтр",
      add: "Добавить",
      back: "Назад",
      bulk_actions: "Выбран 1 элемент |||| Выбрано %{smart_count} элементов",
      cancel: "Отменить",
      clear_array_input: "Очистить список",
      clear_input_value: "Очистить значение",
      clone: "Клонировать",
      confirm: "Подтвердить",
      create: "Создать",
      create_item: 'Создать сущность "%{item}"',
      delete: "Удалить",
      edit: "Редактировать",
      export: "Экспортировать",
      list: "Список",
      refresh: "Обновить",
      remove_filter: "Удалить этот фильтр",
      remove_all_filters: "Удалить все фильтры",
      remove: "Удалить",
      save: "Сохранить",
      search: "Поиск",
      select_all: "Выбрать все",
      select_row: "Выбрать эту строку",
      show: "Показать",
      sort: "Сортировать",
      undo: "Отменить",
      unselect: "Снять выделение",
      expand: "Развернуть",
      close: "Закрыть",
      open_menu: "Открыть меню",
      close_menu: "Закрыть меню",
      update: "Обновить",
      move_up: "Переместить вверх",
      move_down: "Переместить вниз",
      open: "Открыть",
      toggle_theme: "Переключить светлый/темный режим",
      select_columns: "Колонки",
      update_application: "Перезагрузить приложение",
    },
    boolean: {
      true: "Да",
      false: "Нет",
      null: " ",
    },
    page: {
      create: "Создать %{name}",
      dashboard: "Панель управления",
      edit: "%{name} %{recordRepresentation}",
      error: "Что-то пошло не так",
      list: "%{name}",
      loading: "Загрузка",
      not_found: "Не найдено",
      show: "%{name} %{recordRepresentation}",
      empty: "Пока нет %{name}.",
      invite: "Хотите добавить?",
    },
    input: {
      file: {
        upload_several:
          "Перетащите файлы для загрузки или кликните для выбора.",
        upload_single: "Перетащите файл для загрузки или кликните для выбора.",
      },
      image: {
        upload_several:
          "Перетащите изображения для загрузки или кликните для выбора.",
        upload_single:
          "Перетащите изображение для загрузки или кликните для выбора.",
      },
      references: {
        all_missing: "Невозможно найти данные ссылок.",
        many_missing:
          "По крайней мере одна из связанных ссылок больше не доступна.",
        single_missing: "Связанная ссылка больше не доступна.",
      },
      password: {
        toggle_visible: "Скрыть пароль",
        toggle_hidden: "Показать пароль",
      },
    },
    message: {
      about: "О приложении",
      are_you_sure: "Вы уверены?",
      auth_error: "Произошла ошибка при проверке токена аутентификации.",
      bulk_delete_content:
        "Вы уверены, что хотите удалить этот %{name}? |||| Вы уверены, что хотите удалить эти %{smart_count} элементов?",
      bulk_delete_title: "Удалить %{name} |||| Удалить %{smart_count} %{name}",
      bulk_update_content:
        "Вы уверены, что хотите обновить этот %{name}? |||| Вы уверены, что хотите обновить эти %{smart_count} элементов?",
      bulk_update_title:
        "Обновить %{name} |||| Обновить %{smart_count} %{name}",
      clear_array_input: "Вы уверены, что хотите очистить весь список?",
      delete_content: "Вы уверены, что хотите удалить этот элемент?",
      delete_title: "Удалить %{name} #%{id}",
      details: "Детали",
      error:
        "Произошла ошибка на стороне клиента, и ваш запрос не может быть выполнен.",
      invalid_form: "Форма невалидна. Пожалуйста, проверьте на ошибки",
      loading: "Пожалуйста, подождите",
      no: "Нет",
      not_found:
        "Либо вы набрали неправильный URL, либо перешли по неправильной ссылке.",
      yes: "Да",
      unsaved_changes:
        "Некоторые из ваших изменений не сохранены. Вы уверены, что хотите их игнорировать?",
    },
    navigation: {
      no_results: "Результаты не найдены",
      no_more_results:
        "Номер страницы %{page} вне границ. Попробуйте предыдущую страницу.",
      page_out_of_boundaries: "Номер страницы %{page} вне границ",
      page_out_from_end: "Нельзя перейти за последнюю страницу",
      page_out_from_begin: "Нельзя перейти до страницы 1",
      page_range_info: "%{offsetBegin}-%{offsetEnd} из %{total}",
      partial_page_range_info:
        "%{offsetBegin}-%{offsetEnd} из более чем %{offsetEnd}",
      current_page: "Страница %{page}",
      page: "Перейти на страницу %{page}",
      first: "Перейти на первую страницу",
      last: "Перейти на последнюю страницу",
      next: "Перейти на следующую страницу",
      previous: "Перейти на предыдущую страницу",
      page_rows_per_page: "Строк на странице:",
      skip_nav: "Перейти к содержимому",
    },
    sort: {
      sort_by: "Сортировать по %{field} %{order}",
      ASC: "по возрастанию",
      DESC: "по убыванию",
    },
    auth: {
      auth_check_error: "Пожалуйста, войдите для продолжения",
      user_menu: "Профиль",
      username: "Имя пользователя",
      password: "Пароль",
      sign_in: "Войти",
      sign_in_error: "Ошибка аутентификации, попробуйте снова",
      logout: "Выйти",
    },
    notification: {
      updated: "Элемент обновлен |||| %{smart_count} элементов обновлено",
      created: "Элемент создан",
      deleted: "Элемент удален |||| %{smart_count} элементов удалено",
      bad_item: "Некорректный элемент",
      item_doesnt_exist: "Элемент не существует",
      http_error: "Ошибка связи с сервером",
      data_provider_error:
        "Ошибка dataProvider. Проверьте консоль для деталей.",
      i18n_error: "Невозможно загрузить переводы для указанного языка",
      canceled: "Действие отменено",
      logged_out: "Ваша сессия завершилась, пожалуйста, войдите снова.",
      not_authorized: "У вас нет доступа к этому ресурсу.",
      application_update_available: "Доступна новая версия.",
    },
    validation: {
      required: "Обязательно",
      minLength: "Должно быть не менее %{min} символов",
      maxLength: "Должно быть не более %{max} символов",
      minValue: "Должно быть не менее %{min}",
      maxValue: "Должно быть не более %{max}",
      number: "Должно быть числом",
      email: "Должно быть действительным электронным адресом",
      oneOf: "Должно быть одним из: %{options}",
      regex:
        "Должно соответствовать определенному формату (regexp): %{pattern}",
      unique: "Должно быть уникальным",
    },
    saved_queries: {
      label: "Сохраненные запросы",
      query_name: "Имя запроса",
      new_label: "Сохранить текущий запрос...",
      new_dialog_title: "Сохранить текущий запрос как",
      remove_label: "Удалить сохраненный запрос",
      remove_label_with_name: 'Удалить запрос "%{name}"',
      remove_dialog_title: "Удалить сохраненный запрос?",
      remove_message:
        "Вы уверены, что хотите удалить этот элемент из списка сохраненных запросов?",
      help: "Отфильтруйте список и сохраните этот запрос на будущее",
    },
    configurable: {
      customize: "Настроить",
      configureMode: "Настроить эту страницу",
      inspector: {
        title: "Инспектор",
        content:
          "Наведите на элементы пользовательского интерфейса приложения, чтобы настроить их",
        reset: "Сбросить настройки",
        hideAll: "Скрыть все",
        showAll: "Показать все",
      },
      Datagrid: {
        title: "Таблица данных",
        unlabeled: "Неразмеченная колонка #%{column}",
      },
      SimpleForm: {
        title: "Форма",
        unlabeled: "Неразмеченный ввод #%{input}",
      },
      SimpleList: {
        title: "Список",
        primaryText: "Основной текст",
        secondaryText: "Дополнительный текст",
        tertiaryText: "Третичный текст",
      },
    },
  },
};

const passingInMonth = {
  name: "Сдающий |||| Сдающие",
  fields: {
    id: "№",
    PodrazdelenieId: "Подразделение",
    PersonId: "Сдающий",
    CategoryId: "Категория",
    UprazhnenieId: "Упражнения",
    UprazhnenieResultDate: "Дата сдачи",
    UprazhnenieResultResult: "Результат",
    UprazhnenieResultBallClassic: "Баллы",
    UprazhnenieResultBallBolon: "Баллы (болонская система)",
    UprazhnenieResultBallBolon_UprazhnenieResultBallBolonRating :  "Баллы (болонская система)",
    UprazhnenieResultBallBolonRatingLetter :  "Оценка",
  }
}
const fixedupr = {
  name: "Изменение результата |||| Изменение результатов",
  fields: {
    id: "№",
    UprazhnenieId: "Упражнения",
    CategoryId: "Категория",
    date: "Дата"
  }
}

export const ru = {
  ...russianMessages,
  resources: {
    passingInMonth: passingInMonth,
    fixedUpr: fixedupr,
    persons: {
      name: "Сотрудник |||| Сотрудники",
      fields: {
        id: "№",
        uprajnenia: "Упражнения",
        uprajneniaDate: "Дата приема",
        fName: "Имя",
        lName: "Фамилия",
        sName: "Отчество",
        dob: "Дата рождения",
        ZvanieId: "Звание",
        CategoryId: "Категория военнослужащего",
        PodrazdelenieId: "Подразделение",
        comment: "Комментарий",
        isMale: "Мужчина",
        isV: "Срочная служба",
        rating: "Рейтинг",
        isFree: "Освобожден",
        otpuskFrom: "Отпуск с",
        otpuskTo: "Отпуск по",
      },
    },
    zvaniya: {
      name: "Звание |||| Звания",
      fields: {
        id: "№",
        name: "Наименование",
      },
    },
    uprazhnenieRealValuesTypes: {
      name: "Единица измерения |||| Единицы измерений",
      fields: {
        id: "№",
        name: "Наименование",
        shortName: "Краткое наименование",
      },
    },
    podrazdeleniya: {
      name: "Подразделение |||| Подразделения",
      fields: {
        id: "№",
        name: "Наименование",
      },
      export: {
        vedomost: "Ведомость",
      },
    },
    categories: {
      name: "Категория военнослужащего |||| Категории военнослужащих",
      fields: {
        id: "№",
        name: "Наименование",
        shortName: "Краткое наименование",
      },
    },
    uprazhneniya: {
      name: "Упражнение |||| Упражнения",
      fields: {
        id: "№",
        name: "Наименование",
        shortName: "Краткое наименование",
        dob: "Date of birth",
        UprazhnenieRealValuesTypeId: "Единица измерения",
        step: "Шаг после макс. результата",
        valueToAddAfterMaxResult: "Баллы после макс. результата",
      },
    },
    uprazhnenieStandards: {
      name: "Норматив |||| Нормативы",
      fields: {
        id: "№",
        UprazhnenieId: "Упражнение",
        CategoryId: "Категория военнослужащего",
        value: "Уложился в",
        result: "Количество баллов",
      },
    },
    uprazhnenieResults: {
      name: "Результат |||| Результаты",
      fields: {
        id: "№",
        UprazhnenieId: "Упражнение",
        PersonId: "Сдающий",
        CategoryId: "Категория",
        date: "Дата",
        result: "Результат",
      },
    },
    Documents: {
      name: "Результат |||| Результаты",
    }
    ,
    efficiencyPreferences: {
      name: " |||| ",
    }
  },
  dialogs: {
    exportPodrazdelenie: {
      title: "Генерация ведомости",
      year: "Год",
      month: "Месяц",
    },
  },
  documents: {
    name: "Результат |||| Результаты",
    allVedomost: {
      print: "Печать",
      name: "Сводная ведомость",
      type: "ведомость",
      comment:
        "Общая ведомость для представления всех военнослужащих по категориям и в целом",
    },
  },
};

export default russianMessages;
