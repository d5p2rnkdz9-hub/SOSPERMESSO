module.exports = {
  it: {
    dropdowns: [
      {
        label: "Info",
        href: "/#informazioni",
        items: [
          { label: "Tutti i permessi", href: "/database.html" },
          { label: "Che documenti porto?", href: "/documenti-questura.html" },
          { label: "Circolari e prassi amministrativa", href: "/circolari.html" },
          { label: "Protezione internazionale", href: "/protezione-internazionale.html" },
          { label: "Ricongiungimento familiare", href: "/ricongiungimento-familiare.html" },
          { label: "Lavorare in Italia", href: "/lavorare-in-italia.html" },
          { label: "Aiuto legale", href: "/aiuto-legale.html" },
          { label: "Dizionario", href: "/dizionario.html" }
        ]
      },
      {
        // Testi coordinati interattivi (bundle in public/patto-interattivo).
        // Solo IT: sono testi di legge italiani, non tradotti.
        // Nessun badge sull'etichetta: con "SOS Patto NUOVO" accanto la barra si
        // affollava e le voci andavano a capo. Il badge sta sulla voce nuova.
        label: "Normativa",
        href: "/normativa.html",
        items: [
          { label: "Testo unico immigrazione (D.Lgs. 286/98)", href: "/normativa.html#dlgs-286-1998", badge: "NUOVO" },
          { label: "Procedure di protezione internazionale (D.Lgs. 25/2008)", href: "/normativa.html#dlgs-25-2008" },
          { label: "Accoglienza (D.Lgs. 142/2015)", href: "/normativa.html#dlgs-142-2015" },
          { label: "Qualifiche (D.Lgs. 251/2007)", href: "/normativa.html#dlgs-251-2007" }
        ]
      },
      {
        label: "Fai il test",
        href: "/#test",
        cta: "yellow",
        items: []
      },
      {
        label: "Contattaci",
        href: "https://app.sospermesso.it/it/contattaci",
        external: true,
        cta: "outline",
        items: []
      }
    ]
  },
  en: {
    dropdowns: [
      {
        label: "Info",
        href: "/en/#informazioni",
        items: [
          { label: "All permits", href: "/en/database.html" },
          { label: "International protection", href: "/en/protezione-internazionale.html" },
          { label: "Family reunification", href: "/en/ricongiungimento-familiare.html" },
          { label: "Legal aid", href: "/en/aiuto-legale.html" },
          { label: "Dictionary", href: "/en/dizionario.html" }
        ]
      },
      {
        label: "Take the test",
        href: "/en/#test",
        cta: "yellow",
        items: []
      },
      {
        label: "Contact us",
        href: "https://app.sospermesso.it/it/contattaci",
        external: true,
        cta: "outline",
        items: []
      }
    ]
  },
  fr: {
    dropdowns: [
      {
        label: "Info",
        href: "/fr/#informazioni",
        items: [
          { label: "Tous les permis", href: "/fr/database.html" },
          { label: "Protection internationale", href: "/fr/protezione-internazionale.html" },
          { label: "Regroupement familial", href: "/fr/ricongiungimento-familiare.html" },
          { label: "Aide juridique", href: "/fr/aiuto-legale.html" },
          { label: "Dictionnaire", href: "/fr/dizionario.html" }
        ]
      },
      {
        label: "Faire le test",
        href: "/fr/#test",
        cta: "yellow",
        items: []
      },
      {
        label: "Nous contacter",
        href: "https://app.sospermesso.it/it/contattaci",
        external: true,
        cta: "outline",
        items: []
      }
    ]
  },
  es: {
    dropdowns: [
      {
        label: "Info",
        href: "/es/#informazioni",
        items: [
          { label: "Todos los permisos", href: "/es/database.html" },
          { label: "Protección internacional", href: "/es/protezione-internazionale.html" },
          { label: "Reunificación familiar", href: "/es/ricongiungimento-familiare.html" },
          { label: "Ayuda legal", href: "/es/aiuto-legale.html" },
          { label: "Diccionario", href: "/es/dizionario.html" }
        ]
      },
      {
        label: "Haz el test",
        href: "/es/#test",
        cta: "yellow",
        items: []
      },
      {
        label: "Contáctanos",
        href: "https://app.sospermesso.it/it/contattaci",
        external: true,
        cta: "outline",
        items: []
      }
    ]
  },
  tr: {
    dropdowns: [
      {
        label: "Bilgi",
        href: "/tr/#informazioni",
        items: [
          { label: "Tüm izinler", href: "/tr/database.html" },
          { label: "Uluslararası koruma", href: "/tr/protezione-internazionale.html" },
          { label: "Aile birleşimi", href: "/tr/ricongiungimento-familiare.html" },
          { label: "Hukuki yardım", href: "/tr/aiuto-legale.html" },
          { label: "Sözlük", href: "/tr/dizionario.html" }
        ]
      },
      {
        label: "Testi yap",
        href: "/tr/#test",
        cta: "yellow",
        items: []
      },
      {
        label: "Bize ulaşın",
        href: "https://app.sospermesso.it/it/contattaci",
        external: true,
        cta: "outline",
        items: []
      }
    ]
  },
  ru: {
    dropdowns: [
      {
        label: "Инфо",
        href: "/ru/#informazioni",
        items: [
          { label: "Все разрешения", href: "/ru/database.html" },
          { label: "Международная защита", href: "/ru/protezione-internazionale.html" },
          { label: "Воссоединение семьи", href: "/ru/ricongiungimento-familiare.html" },
          { label: "Юридическая помощь", href: "/ru/aiuto-legale.html" },
          { label: "Словарь", href: "/ru/dizionario.html" }
        ]
      },
      {
        label: "Пройти тест",
        href: "/ru/#test",
        cta: "yellow",
        items: []
      },
      {
        label: "Связаться с нами",
        href: "https://app.sospermesso.it/it/contattaci",
        external: true,
        cta: "outline",
        items: []
      }
    ]
  },
  bn: {
    dropdowns: [
      {
        label: "তথ্য",
        href: "/bn/#informazioni",
        items: [
          { label: "সব অনুমতি", href: "/bn/database.html" },
          { label: "আন্তর্জাতিক সুরক্ষা", href: "/bn/protezione-internazionale.html" },
          { label: "পারিবারিক পুনর্মিলন", href: "/bn/ricongiungimento-familiare.html" },
          { label: "আইনি সহায়তা", href: "/bn/aiuto-legale.html" },
          { label: "অভিধান", href: "/bn/dizionario.html" }
        ]
      },
      {
        label: "পরীক্ষা দিন",
        href: "/bn/#test",
        cta: "yellow",
        items: []
      },
      {
        label: "যোগাযোগ করুন",
        href: "https://app.sospermesso.it/it/contattaci",
        external: true,
        cta: "outline",
        items: []
      }
    ]
  },
  ar: {
    dropdowns: [
      {
        label: "معلومات",
        href: "/ar/#informazioni",
        items: [
          { label: "جميع التصاريح", href: "/ar/database.html" },
          { label: "الحماية الدولية", href: "/ar/protezione-internazionale.html" },
          { label: "لم شمل الأسرة", href: "/ar/ricongiungimento-familiare.html" },
          { label: "المساعدة القانونية", href: "/ar/aiuto-legale.html" },
          { label: "القاموس", href: "/ar/dizionario.html" }
        ]
      },
      {
        label: "قم بالاختبار",
        href: "/ar/#test",
        cta: "yellow",
        items: []
      },
      {
        label: "اتصل بنا",
        href: "https://app.sospermesso.it/it/contattaci",
        external: true,
        cta: "outline",
        items: []
      }
    ]
  },
  ur: {
    dropdowns: [
      {
        label: "معلومات",
        href: "/ur/#informazioni",
        items: [
          { label: "تمام اجازت نامے", href: "/ur/database.html" },
          { label: "بین الاقوامی تحفظ", href: "/ur/protezione-internazionale.html" },
          { label: "خاندانی اتحاد", href: "/ur/ricongiungimento-familiare.html" },
          { label: "قانونی مدد", href: "/ur/aiuto-legale.html" },
          { label: "لغت", href: "/ur/dizionario.html" }
        ]
      },
      {
        label: "ٹیسٹ دیں",
        href: "/ur/#test",
        cta: "yellow",
        items: []
      },
      {
        label: "ہم سے رابطہ کریں",
        href: "https://app.sospermesso.it/it/contattaci",
        external: true,
        cta: "outline",
        items: []
      }
    ]
  },
  fa: {
    dropdowns: [
      {
        label: "اطلاعات",
        href: "/fa/#informazioni",
        items: [
          { label: "همه مجوزها", href: "/fa/database.html" },
          { label: "حمایت بین‌المللی", href: "/fa/protezione-internazionale.html" },
          { label: "پیوند خانوادگی", href: "/fa/ricongiungimento-familiare.html" },
          { label: "کمک حقوقی", href: "/fa/aiuto-legale.html" },
          { label: "واژه‌نامه", href: "/fa/dizionario.html" }
        ]
      },
      {
        label: "آزمون را انجام دهید",
        href: "/fa/#test",
        cta: "yellow",
        items: []
      },
      {
        label: "تماس با ما",
        href: "https://app.sospermesso.it/it/contattaci",
        external: true,
        cta: "outline",
        items: []
      }
    ]
  },
  zh: {
    dropdowns: [
      {
        label: "信息",
        href: "/zh/#informazioni",
        items: [
          { label: "所有居留许可", href: "/zh/database.html" },
          { label: "国际保护", href: "/zh/protezione-internazionale.html" },
          { label: "家庭团聚", href: "/zh/ricongiungimento-familiare.html" },
          { label: "法律援助", href: "/zh/aiuto-legale.html" },
          { label: "词典", href: "/zh/dizionario.html" }
        ]
      },
      {
        label: "参加测试",
        href: "/zh/#test",
        cta: "yellow",
        items: []
      },
      {
        label: "联系我们",
        href: "https://app.sospermesso.it/it/contattaci",
        external: true,
        cta: "outline",
        items: []
      }
    ]
  }
};
