/**
 * ULTIMI AGGIORNAMENTI — nastro scorrevole sotto il menu.
 *
 * Un oggetto per lingua (stessa forma di nav.js): `label` + `items`.
 * `items` in ordine dal più recente al più vecchio. Tutti gli item scorrono in
 * un nastro continuo: aggiungerne uno allunga il nastro, non accelera lo
 * scorrimento (la velocità è fissa, ~60 px/s, calcolata in updates-banner.liquid).
 *
 * Campi di un item:
 *   date      → data già formattata nella lingua (cifre occidentali, come il
 *               resto dei contenuti tradotti)
 *   text      → la novità, in una riga
 *   cta       → etichetta del link
 *   href      → destinazione
 *   external  → apre in una nuova scheda
 *   linkLang  → lingua del contenuto di destinazione (sospatto.it e /normativa.html
 *               sono solo in italiano): finisce in hreflang sul link
 *
 * Per aggiungere una novità: nuovo item in cima all'array di OGNI lingua.
 */

// Entrata in vigore del Patto → sospatto.it. Modifiche alle norme italiane →
// i testi coordinati in-house: il link va sul testo, non sulla pagina indice
// (/normativa.html resta il punto d'ingresso dal menu).
const PATTO_HREF = 'https://www.sospatto.it';
const NORMATIVA_HREF = '/patto-interattivo/dlgs-286-1998/';

module.exports = {
  it: {
    label: 'Ultimi aggiornamenti',
    pauseLabel: 'Metti in pausa gli aggiornamenti',
    items: [
      {
        date: '12 giugno 2026',
        text: 'Approvato il d.l. 100/2026 di adeguamento al Patto UE',
        cta: 'Vedi le modifiche al Testo unico immigrazione',
        href: NORMATIVA_HREF,
      },
      {
        date: '12 giugno 2026',
        text: 'Entra in vigore il Patto UE su migrazione e asilo',
        cta: 'Consulta i testi aggiornati',
        href: PATTO_HREF,
        external: true,
      },
    ],
  },

  en: {
    label: 'Latest updates',
    pauseLabel: 'Pause the updates',
    items: [
      {
        date: '12 June 2026',
        text: 'Decree-law 100/2026 aligning Italian law with the EU Pact has been adopted',
        cta: 'See the changes to the Testo unico immigrazione (in Italian)',
        href: NORMATIVA_HREF,
        linkLang: 'it',
      },
      {
        date: '12 June 2026',
        text: 'The EU Pact on Migration and Asylum enters into force',
        cta: 'Read the updated texts',
        href: PATTO_HREF,
        external: true,
        linkLang: 'it',
      },
    ],
  },

  fr: {
    label: 'Dernières mises à jour',
    pauseLabel: 'Mettre les mises à jour en pause',
    items: [
      {
        date: '12 juin 2026',
        text: "Le décret-loi 100/2026 d'adaptation au Pacte UE a été adopté",
        cta: 'Voyez les modifications du Testo unico immigrazione (en italien)',
        href: NORMATIVA_HREF,
        linkLang: 'it',
      },
      {
        date: '12 juin 2026',
        text: "Le Pacte européen sur la migration et l'asile entre en vigueur",
        cta: 'Consultez les textes à jour',
        href: PATTO_HREF,
        external: true,
        linkLang: 'it',
      },
    ],
  },

  es: {
    label: 'Últimas novedades',
    pauseLabel: 'Pausar las novedades',
    items: [
      {
        date: '12 de junio de 2026',
        text: 'Aprobado el decreto-ley 100/2026 de adaptación al Pacto de la UE',
        cta: 'Consulta los cambios en el Testo unico immigrazione (en italiano)',
        href: NORMATIVA_HREF,
        linkLang: 'it',
      },
      {
        date: '12 de junio de 2026',
        text: 'Entra en vigor el Pacto de la UE sobre Migración y Asilo',
        cta: 'Consulta los textos actualizados',
        href: PATTO_HREF,
        external: true,
        linkLang: 'it',
      },
    ],
  },

  tr: {
    label: 'Son güncellemeler',
    pauseLabel: 'Güncellemeleri duraklat',
    items: [
      {
        date: '12 Haziran 2026',
        text: "AB Paktı'na uyum için 100/2026 sayılı kanun hükmünde kararname kabul edildi",
        cta: "Testo unico immigrazione'daki değişiklikleri inceleyin (İtalyanca)",
        href: NORMATIVA_HREF,
        linkLang: 'it',
      },
      {
        date: '12 Haziran 2026',
        text: 'AB Göç ve İltica Paktı yürürlüğe giriyor',
        cta: 'Güncel metinleri inceleyin',
        href: PATTO_HREF,
        external: true,
        linkLang: 'it',
      },
    ],
  },

  bn: {
    label: 'সর্বশেষ আপডেট',
    pauseLabel: 'আপডেট থামান',
    items: [
      {
        date: '12 জুন 2026',
        text: 'ইইউ প্যাক্টের সঙ্গে সামঞ্জস্য আনতে ডিক্রি-আইন 100/2026 অনুমোদিত হয়েছে',
        cta: 'Testo unico immigrazione-এ পরিবর্তনগুলো দেখুন (ইতালীয় ভাষায়)',
        href: NORMATIVA_HREF,
        linkLang: 'it',
      },
      {
        date: '12 জুন 2026',
        text: 'অভিবাসন ও আশ্রয় বিষয়ক ইইউ প্যাক্ট কার্যকর হচ্ছে',
        cta: 'হালনাগাদ আইনি পাঠগুলো দেখুন',
        href: PATTO_HREF,
        external: true,
        linkLang: 'it',
      },
    ],
  },

  ru: {
    label: 'Последние обновления',
    pauseLabel: 'Приостановить обновления',
    items: [
      {
        date: '12 июня 2026',
        text: 'Принят декрет-закон 100/2026 о приведении законодательства в соответствие с Пактом ЕС',
        cta: 'Смотрите изменения в Testo unico immigrazione (на итальянском)',
        href: NORMATIVA_HREF,
        linkLang: 'it',
      },
      {
        date: '12 июня 2026',
        text: 'Вступает в силу Пакт ЕС о миграции и убежище',
        cta: 'Смотрите обновлённые тексты',
        href: PATTO_HREF,
        external: true,
        linkLang: 'it',
      },
    ],
  },

  ar: {
    label: 'آخر التحديثات',
    pauseLabel: 'إيقاف التحديثات مؤقتًا',
    items: [
      {
        date: '12 يونيو 2026',
        text: 'إقرار المرسوم بقانون 100/2026 لمواءمة التشريع الإيطالي مع ميثاق الاتحاد الأوروبي',
        cta: 'اطّلع على تعديلات قانون الهجرة الموحّد (بالإيطالية)',
        href: NORMATIVA_HREF,
        linkLang: 'it',
      },
      {
        date: '12 يونيو 2026',
        text: 'بدء نفاذ ميثاق الاتحاد الأوروبي للهجرة واللجوء',
        cta: 'اطّلع على النصوص المحدَّثة',
        href: PATTO_HREF,
        external: true,
        linkLang: 'it',
      },
    ],
  },

  ur: {
    label: 'تازہ ترین اپ ڈیٹس',
    pauseLabel: 'اپ ڈیٹس روکیں',
    items: [
      {
        date: '12 جون 2026',
        text: 'یورپی یونین کے معاہدے سے ہم آہنگی کے لیے فرمانِ قانون 100/2026 منظور',
        cta: 'اطالوی قانونِ ہجرت میں تبدیلیاں دیکھیں (اطالوی میں)',
        href: NORMATIVA_HREF,
        linkLang: 'it',
      },
      {
        date: '12 جون 2026',
        text: 'یورپی یونین کا ہجرت اور پناہ کا معاہدہ نافذ ہو رہا ہے',
        cta: 'تازہ ترین متون دیکھیں',
        href: PATTO_HREF,
        external: true,
        linkLang: 'it',
      },
    ],
  },

  fa: {
    label: 'آخرین به‌روزرسانی‌ها',
    pauseLabel: 'توقف به‌روزرسانی‌ها',
    items: [
      {
        date: '12 ژوئن 2026',
        text: 'تصویب فرمان‌قانون 100/2026 برای هماهنگی با پیمان اتحادیه اروپا',
        cta: 'تغییرات قانون واحد مهاجرت را ببینید (به ایتالیایی)',
        href: NORMATIVA_HREF,
        linkLang: 'it',
      },
      {
        date: '12 ژوئن 2026',
        text: 'پیمان اتحادیه اروپا در زمینه مهاجرت و پناهجویی اجرایی می‌شود',
        cta: 'متن‌های به‌روزشده را ببینید',
        href: PATTO_HREF,
        external: true,
        linkLang: 'it',
      },
    ],
  },

  zh: {
    label: '最新动态',
    pauseLabel: '暂停滚动',
    items: [
      {
        date: '2026年6月12日',
        text: '第100/2026号法令通过，使意大利法律与欧盟协议衔接',
        cta: '查看《移民统一法》的修改（意大利语）',
        href: NORMATIVA_HREF,
        linkLang: 'it',
      },
      {
        date: '2026年6月12日',
        text: '欧盟移民与庇护协议正式生效',
        cta: '查看最新法律文本',
        href: PATTO_HREF,
        external: true,
        linkLang: 'it',
      },
    ],
  },
};
