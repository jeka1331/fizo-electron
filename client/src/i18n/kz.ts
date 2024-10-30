import { TranslationMessages } from "react-admin";

const kazakhMessages: TranslationMessages = {
  ra: {
    action: {
      add_filter: "Фильтр қосу",
      add: "Қосу",
      back: "Артқа",
      bulk_actions: "1 элемент таңдалды |||| %{smart_count} элемент таңдалды",
      cancel: "Болдырмау",
      clear_array_input: "Тізімді тазалау",
      clear_input_value: "Мәнді тазалау",
      clone: "Клондау",
      confirm: "Растау",
      create: "Жасау",
      create_item: '"%{item}" сущностьсын жасау',
      delete: "Жою",
      edit: "Өңдеу",
      export: "Экспорттау",
      list: "Тізім",
      refresh: "Жаңарту",
      remove_filter: "Бұл фильтрді алып тастау",
      remove_all_filters: "Барлық фильтрлерді алып тастау",
      remove: "Алып тастау",
      save: "Сақтау",
      search: "Іздеу",
      select_all: "Барлығын таңдау",
      select_row: "Бұл жолды таңдау",
      show: "Көрсету",
      sort: "Сұрыптау",
      undo: "Болдырмау",
      unselect: "Таңдауды алып тастау",
      expand: "Жаю",
      close: "Жабу",
      open_menu: "Мәзірді ашу",
      close_menu: "Мәзірді жабу",
      update: "Жаңарту",
      move_up: "Жоғары жылжыту",
      move_down: "Төменгі жылжыту",
      open: "Ашу",
      toggle_theme: "Кұрылты/қараңғы түрді өзгерту",
      select_columns: "Бағандар",
      update_application: "Қосымшаны қайта іске қосу",
    },
    boolean: {
      true: "Иә",
      false: "Жоқ",
      null: " ",
    },
    page: {
      create: "%{name} жасау",
      dashboard: "Бақылау тақтасы",
      edit: "%{recordRepresentation} %{name} өңдеу",
      error: "Қате кетті",
      list: "%{name}",
      loading: "Жүктеу",
      not_found: "Табылмады",
      show: "%{recordRepresentation} %{name} көрсету",
      empty: "%{name} әлі жоқ.",
      invite: "Қосу керек пе?",
    },
    input: {
      file: {
        upload_several:
          "Жүктеу үшін файлдарды ауыстыру немесе таңдау үшін басыңыз.",
        upload_single:
          "Жүктеу үшін файлды ауыстыру немесе таңдау үшін басыңыз.",
      },
      image: {
        upload_several:
          "Жүктеу үшін суреттерді ауыстыру немесе таңдау үшін басыңыз.",
        upload_single:
          "Жүктеу үшін суретті ауыстыру немесе таңдау үшін басыңыз.",
      },
      references: {
        all_missing: "Сілтемелердің мәліметтері табылмады.",
        many_missing: "Сілтемелердің кейбір мәліметтері қол жетімді емес.",
        single_missing: "Сілтеме табылмады.",
      },
      password: {
        toggle_visible: "Құпия сөзді жасыру",
        toggle_hidden: "Құпия сөзді көрсету",
      },
    },
    message: {
      about: "Қосымша туралы",
      are_you_sure: "Сіз сенімдісіз пе?",
      auth_error: "Аутентификация токенін тексеруде қате кетті.",
      bulk_delete_content:
        "Бұл %{name}ді жою керек пе? |||| Сіз %{smart_count} элементін жою керек пе?",
      bulk_delete_title: "%{name}ді жою |||| %{smart_count} %{name}ді жою",
      bulk_update_content:
        "Бұл %{name}ді жаңарту керек пе? |||| Сіз %{smart_count} элементті жаңарту керек пе?",
      bulk_update_title:
        "%{name}ді жаңарту |||| %{smart_count} %{name}ді жаңарту",
      clear_array_input: "Тізімді толық тазалау керек пе?",
      delete_content: "Бұл элементті жою керек пе?",
      delete_title: "%{name} #%{id}ді жою",
      details: "Егжей-тегжейліліктер",
      error: "Мұштари клиенттен қате кетті және сіздің сұрауыңыз орындалмайды.",
      invalid_form: "Форма жарамсыз. Қателерді тексеріңіз",
      loading: "Күте тұрыңыз",
      no: "Жоқ",
      not_found:
        "Сілтемені дұрыс енгізбегеніңіз немесе дұрыс сілтемеге өтініш жібербегеніңіз көріңіз.",
      yes: "Иә",
      unsaved_changes:
        "Сіздің өзгерістеріңізден кейінде кейінірек сақталмаған. Оларды жоққа көтеруге сенімдісіз пе?",
    },
    navigation: {
      no_results: "Нәтиже табылмады",
      no_more_results:
        "%{page} бет нөмірі шектеулердің сыртқы шектесінен тыс. Алдыңғы бетке қайтыңыз.",
      page_out_of_boundaries:
        "%{page} бет нөмірі шектеулердің сыртқы шектесінен тыс",
      page_out_from_end: "Соңғы бетке кіру мүмкін емес",
      page_out_from_begin: "1-ші бетке қайту мүмкін емес",
      page_range_info: "%{total} шегінен %{offsetBegin}-%{offsetEnd}",
      partial_page_range_info:
        "%{offsetEnd}-нан астам %{offsetBegin}-%{total} шегі",
      current_page: "Бет %{page}",
      page: "%{page} бетке өту",
      first: "Бірінші бетке өту",
      last: "Соңғы бетке өту",
      next: "Келесі бетке өту",
      previous: "Алдыңғы бетке өту",
      page_rows_per_page: "Беттегі жолдар:",
      skip_nav: "Мазмұнға өту",
    },
    sort: {
      sort_by: "%{field} бойынша %{order} сұрыптау",
      ASC: "артығу бойынша",
      DESC: "азайту бойынша",
    },
    auth: {
      auth_check_error: "Жалғастыру үшін кіруді қажет етіп жүрсіз",
      user_menu: "Профиль",
      username: "Пайдаланушы аты",
      password: "Құпия сөз",
      sign_in: "Кіру",
      sign_in_error: "Аутентификация қатесі, қайталап көріңіз",
      logout: "Шығу",
    },
    notification: {
      updated: "Элемент жаңартылды |||| %{smart_count} элементтер жаңартылды",
      created: "Элемент жасалды",
      deleted: "Элемент жойылды |||| %{smart_count} элементтер жойылды",
      bad_item: "Недеулі элемент",
      item_doesnt_exist: "Элемент жоқ",
      http_error: "Сервермен байланыс кезінде қате кетті",
      data_provider_error:
        "dataProvider қатесі. Егжей-тегжейліліктерді тексеру үшін консолге қараңыз.",
      i18n_error: "Анықталған тілдер үшін аудармаларды жүктеу мүмкін емес",
      canceled: "Әрекеттен бас тартылды",
      logged_out: "Сіздің сессияңыз аяқталды, қайта кіріңіз.",
      not_authorized: "Осы ресурсты қолдану үшін сізде рұқсат жоқ.",
      application_update_available: "Жаңарту үшін жаңа нұсқа қолжетімді.",
    },
    validation: {
      required: "Міндетті",
      minLength: "Кем мәні %{min} символ",
      maxLength: "Үлкен мәні %{max} символ",
      minValue: "Міндетті мән %{min} неғұрлым",
      maxValue: "Үлкен мән %{max} неғұрлым",
      number: "Санды болуы керек",
      email: "Жарамды электрондық пошта мекенжайы керек",
      oneOf: "Әрбірі: %{options} болуы керек",
      regex: "Белгілі пішімге сәйкес келуі керек: %{pattern}",
      unique: "Бірдей болуы керек",
    },
    saved_queries: {
      label: "Сақталған сұраулар",
      query_name: "Сұрау аты",
      new_label: "Ағымдағы сұрауды сақтау...",
      new_dialog_title: "Ағымдағы сұрауды сақтау",
      remove_label: "Сақталған сұрауды жою",
      remove_label_with_name: '"%{name}" сұрауын жою',
      remove_dialog_title: "Сақталған сұрауды жою?",
      remove_message:
        "Сіз сақталған сұраулар тізімінен бұл элементті жою керек пе?",
      help: "Тізімді фильтрлеу және осы сұрауды келесіге сақтау",
    },
    configurable: {
      customize: "Қалыптастыру",
      configureMode: "Бұл бетті қалыптастыру",
      inspector: {
        title: "Инспектор",
        content:
          "Қосымша интерфейс элементтерін қалыптастыру үшін қолданба элементтерін ашыңыз",
        reset: "Параметрлерді қалыптастыру",
        hideAll: "Барлығын жасыру",
        showAll: "Барлығын көрсету",
      },
      Datagrid: {
        title: "Деректер кестесі",
        unlabeled: "Белгісіз баған #%{column}",
      },
      SimpleForm: {
        title: "Пішім",
        unlabeled: "Белгісіз кіріс #%{input}",
      },
      SimpleList: {
        title: "Тізім",
        primaryText: "Негізгі мәтін",
        secondaryText: "Қосымша мәтін",
        tertiaryText: "Үшінші мәтін",
      },
    },
  },
};

const passingInMonth =  {
  name: "Айдың нәтижесі |||| Айдың нәтижелері",
  fields:{
    id: "№",
    PodrazdelenieId: "Бөлімше",
    PersonId: "Тапсырушы",
    CategoryId: "Санат",
    UprazhnenieId: "Жаттығу",
    UprazhnenieResultDate: "Нәтиже күні",
    UprazhnenieResultResult: "Нәтиже"
  }
}
const fixedupr =  {
  name: "Нәтижені өзгеруі |||| Нәтижелерді өзгеруі",
  fields: {
    id: "№",
    UprazhnenieId: "Жаттығу",
    CategoryId: "Санат",
    date: "Күні"
  }
}

export const kz = {
  ...kazakhMessages,
  resources: {
    passingInMonth: passingInMonth,
    fixedUpr: fixedupr,
    persons: {
      name: "Қызметкер |||| Қызметкерлер",
      fields: {
        id: "№",
        uprajnenia: "Құқықтар",
        uprajneniaDate: "Тағайындалған күні",
        fName: "Аты",
        lName: "Тегі",
        sName: "Әке тегі",
        dob: "Туған күні",
        ZvanieId: "Санат",
        CategoryId: "Жаңғырушы категориясы",
        PodrazdelenieId: "Бөлім",
        comment: "Пікір",
        isMale: "Ер адам",
        isV: "Жаңғырушы статусы",
        rating: "Рейтинг",
        isFree: "Бос болуы",
        otpuskFrom: "Бастап",
        otpuskTo: "Соңғы күні",
      },
    },
    zvaniya: {
      name: "Санат |||| Санаттар",
      fields: {
        id: "№",
        name: "Атауы",
      },
    },
    uprazhnenieRealValuesTypes: {
      name: "Өлшем бірлігі |||| Өлшем бірліктері",
      fields: {
        id: "№",
        name: "Атауы",
        shortName: "Қысқаша атауы",
      },
    },
    podrazdeleniya: {
      name: "Бөлім |||| Бөлімдер",
      fields: {
        id: "№",
        name: "Атауы",
      },
      export: {
        vedomost: "Ведомосы",
      },
    },
    categories: {
      name: "Жаңғырушы категориясы |||| Жаңғырушы категориялары",
      fields: {
        id: "№",
        name: "Атауы",
        shortName: "Қысқаша атауы",
      },
    },
    uprazhneniya: {
      name: "Құқық |||| Құқықтар",
      fields: {
        id: "№",
        name: "Атауы",
        shortName: "Қысқаша атауы",
        dob: "Туған күні",
        UprazhnenieRealValuesTypeId: "Өлшем бірлігі",
        step: "Макс. нәтижеден кейінгі қадам",
        valueToAddAfterMaxResult: "Макс. нәтижеден кейінгі баллдар",
      },
    },
    uprazhnenieStandards: {
      name: "Стандарт |||| Стандарттар",
      fields: {
        id: "№",
        UprazhnenieId: "Құқық",
        CategoryId: "Жаңғырушы категориясы",
        value: "Тасымалды",
        result: "Баллдар саны",
      },
    },
    uprazhnenieResults: {
      name: "Нәтиже |||| Нәтижелер",
      fields: {
        id: "№",
        UprazhnenieId: "Құқық",
        PersonId: "Тапсырушы",
        CategoryId: "Категория",
        date: "Күні",
        result: "Нәтиже",
      },
    },
    Documents: {
      name: "Құжатт |||| Құжаттар",
    }
  },
  dialogs: {
    exportPodrazdelenie: {
      title: "Тізім өңдеу",
      year: "Жыл",
      month: "Ай",
    },
  },
  documents: {
    name: "Құжатт |||| Құжаттар",
    allVedomost: {
      print: "Басып шығару",
      name: "Жалпы тізім",
      type: "тізім",
      comment:
        "Барлық әскерлерді категориялар бойынша және жалпы салынған жалпы тізім",
    },
  },
  passingInMonth: {
    name: "айдың нәтижелері |||| Құжаттар"
  }
};

export default kazakhMessages;
