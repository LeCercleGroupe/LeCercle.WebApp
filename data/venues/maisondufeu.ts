import type { VenueShared, VenueLocaleText } from "@/components/VenuePage/types";
import { contact_link } from "./constants/links";
import { mergeVenueData } from "./utils/mergeVenueData";

const shared: VenueShared = {
  name: "Maison du Feu",
  logo: "/logos/MaisonDuFeu.svg",
  accentColor: "#EADA63",
  hero: {
    video: "/videos/maisondufeu-horizontal.mp4",
    videoMobile: "/videos/maisondufeu-vertical.mp4",
  },
  social: {
    instagram: "https://www.instagram.com/maisondufeu.lcg?igsh=MWFoYzg4ejRtaHRuNg==",
    facebook: "#",
  },
  sections: [
    {
      type: "video-scene",
      video: "/projectVideos/maisonDuFeu/scene-1.mp4",
      screens: [
        { textPosition: "right" },
        { textPosition: "left" },
        { textPosition: "right" },
        { textPosition: "center", cta: { href: contact_link } },
      ],
    },
    {
      type: "features",
      items: [
        { image: "/projectFeatures/maisonDuFeu/feature-1.png", imageAlt: "S'mores" },
        { image: "/projectFeatures/maisonDuFeu/feature-2.png", imageAlt: "Open-flame meringue" },
        { image: "/projectFeatures/maisonDuFeu/feature-3.png", imageAlt: "Chocolate fountain" },
      ],
    },
    {
      type: "video-scene",
      video: "/projectVideos/maisonDuFeu/scene-2.mp4",
      accentColor: "#DAA17F",
      screens: [
        { textPosition: "left" },
        { textPosition: "right" },
        { textPosition: "left" },
        { textPosition: "center", cta: { href: contact_link } },
      ],
    },
    {
      type: "packages",
      items: [
        { name: "Éclat",        price: "750 €",  accentColor: "#A30912", cta: { href: contact_link } },
        { name: "Réminiscence", price: "950 €",  accentColor: "#1B5A38", cta: { href: contact_link } },
        { name: "Moment",       price: "1 350 €", accentColor: "#16447D", cta: { href: contact_link } },
        { name: "Signature",    price: "1980 €", accentColor: "#522B73", cta: { href: contact_link } },
      ],
    },
    {
      type: "gallery",
      images: [
        { src: "/projectGallery/maisonDuFeu/image-1.jpg", alt: "Image 1" },
        { src: "/projectGallery/maisonDuFeu/image-2.jpg", alt: "Image 2" },
        { src: "/projectGallery/maisonDuFeu/image-3.jpg", alt: "Image 3" },
        { src: "/projectGallery/maisonDuFeu/image-4.jpg", alt: "Image 4" },
        { src: "/projectGallery/maisonDuFeu/image-5.jpg", alt: "Image 5" },
        { src: "/projectGallery/maisonDuFeu/image-6.jpg", alt: "Image 6" },
        { src: "/projectGallery/maisonDuFeu/image-7.jpg", alt: "Image 7" },
        { src: "/projectGallery/maisonDuFeu/image-8.jpg", alt: "Image 8" },
        { src: "/projectGallery/maisonDuFeu/image-9.jpg", alt: "Image 9" },
      ],
    },
    {
      type: "closing-cta",
      background: "light",
      showLogo: true,
      cta: { href: contact_link },
    },
  ],
};

const ro: VenueLocaleText = {
  hero: {
    tagline: "Desert franțuzesc servit ca experiență live. Un concept despre oameni, emoții și amintiri din tinerețe, unde momentul contează mai mult decât perfecțiunea.",
  },
  sections: [
    {
      heading: "Maison du Feu:",
      subheading: "Gustul unui Moment Trăit pe Loc",
      screens: [
        {
          body: [
            { t: "normal", text: "Maison du Feu aduce la evenimentul tău un " },
            { t: "italic-accent", text: "desert tradițional franțuzesc" },
            { t: "normal", text: " Nu vorbim despre un desert perfect aranjat pentru fotografie, ci despre acele " },
            { t: "italic-accent", text: "într-o formă care prinde viață în fața invitaților. Focul, textura, mirosul dulce și gestul de a-l pregăti pe loc transformă desertul într-un" },
            { t: "normal", text: " moment care se observă." },
          ],
        },
        {
          body: [
            { t: "normal", text: "Conceptul este construit în " },
            { t: "italic-accent", text: "jurul emoției." },
            { t: "normal", text: " Nu vorbim despre un desert perfect aranjat pentru fotografie, ci despre acele" },
            { t: "italic-accent", text: "momente imperfecte" },
            { t: "normal", text: " care, mai târziu, devin " },
            { t: "italic-accent", text: "cele mai dragi amintiri." },
          ],
        },
        {
          body: [
            { t: "normal", text: "Vibe-ul Maison du Feu este unul cald, uman și ușor nostalgic. " },
            { t: "italic-accent", text: "Te duce cu gândul la perioada aceea a vieții în care totul se trăia mai direct," },
            { t: "normal", text: " mai simplu, mai intens. De aici și estetica mai liberă: mișcare, zâmbete, cadre imperfecte, dar sincere." },
          ],
        },
        {
          body: [
            { t: "normal", text: "Pentru evenimente " },
            { t: "italic-accent", text: "care vor să transmită energie," },
            { t: "normal", text: " apropiere și un sentiment real de prezență, Maison du Feu adaugă exact acel element care face diferența între un desert servit și" },
            { t: "italic-accent", text: " o experiență trăită." },
          ],
          cta: { label: "Primește o ofertă personalizată" },
        },
      ],
    },
    {
      heading: "Cum Se Aprinde Maison du Feu?",
      subtitle: "Maison du Feu nu este doar despre deserturi, ci despre felul în care acestea prind viață în fața invitaților. Fiecare opțiune este gândită ca un moment în sine — simplu, cald și ușor de împărțit cu ceilalți.",
      items: [
        {
          heading: "S'mores",
          body: "Biscuiți crocanți, ciocolată topită și marshmallow încălzit direct la foc — o combinație clasică, care aduce imediat un sentiment de familiar și apropiere. Este genul de desert care adună oamenii în jurul lui și creează momente naturale de interacțiune.",
        },
        {
          heading: "Bezea la Foc Viu",
          body: "Bezeaua prinde o textură aurie la exterior și rămâne moale în interior, fiind pregătită chiar în fața invitaților. Este un moment simplu, dar captivant, care atrage priviri și creează acea senzație caldă și ușor nostalgică.",
        },
        {
          heading: "Fântâna de Ciocolată",
          body: "Ciocolata curge continuu, devenind punctul central al experienței. Invitații pot combina gusturi, pot experimenta și pot reveni de mai multe ori — un detaliu care adaugă energie și un ritm relaxat întregului eveniment.",
        },
      ],
    },
    {
      heading: "Despre Emoție,",
      subheading: "Nu Despre Perfecțiune",
      screens: [
        {
          body: [
            { t: "normal", text: "Maison du Feu pornește de la ideea că  " },
            { t: "italic-accent", text: "cele mai frumoase momente nu sunt întotdeauna cele perfecte." },
            { t: "normal", text: " Uneori, tocmai spontaneitatea, mișcarea și micile imperfecțiuni sunt cele care dau vieții autenticitate și farmec." },
          ],
        },
        {
          body: [
            { t: "normal", text: "Așa arată și conceptul nostru: " },
            { t: "italic-accent", text: "un cadru în care oamenii se simt liberi," },
            { t: "normal", text: " relaxați și prezenți, fără să simtă că trebuie să pozeze pentru moment. Pozele ies naturale, reacțiile sincere, iar atmosfera rămâne vie." },
          ],
        },
        {
          body: [
            { t: "normal", text: "Fiecare detaliu este gândit ca să susțină această senzație: de la modul în care este integrat focul, până la felul în care se adună oamenii în jurul experienței. " },
            { t: "italic-accent", text: "Totul capătă un aer apropiat, cald și foarte uman." },
          ],
        },
        {
          body: [
            { t: "normal", text: "Pentru momente care trebuie să lase o impresie caldă și umană, Maison du Feu " },
            { t: "italic-accent", text: "aduce exact echilibrul" },
            { t: "normal", text: " dintre spectacol discret și emoție reală." },
          ],
          cta: { label: "Primește o ofertă personalizată" },
        },
      ],
    },
    {
      heading: "Alege Ritmul Potrivit Evenimentului Tău",
      subtitle: "Fiecare eveniment are propria energie, iar Maison du Feu se adaptează firesc la ea. Am creat mai multe configurații, de la un moment discret la o prezență mai amplă, gândită să adune oamenii în jurul experienței.",
      items: [
        {
          subtitle: "până la 80 de persoane",
          bullets: ["dessert experience live", "foc și plating pe loc", "prezentare elegantă", "servire pentru invitați", "atmosferă caldă și relaxată"],
          cta: { label: "Solicită oferta" },
        },
        {
          subtitle: "până la 80 de persoane",
          bullets: ["dessert experience live", "foc și plating pe loc", "prezentare elegantă", "servire pentru invitați", "recuzită foto", "2 variante de topping / servire", "atmosferă caldă și relaxată"],
          cta: { label: "Solicită oferta" },
        },
        {
          subtitle: "până la 80 de persoane",
          bullets: ["dessert experience live", "foc și plating pe loc", "prezentare elegantă", "servire pentru invitați", "recuzită foto", "3 variante de topping / servire", "set - up extins pentru eveniment", "atmosferă caldă și relaxată"],
          cta: { label: "Solicită oferta" },
        },
        {
          subtitle: "până la 80 de persoane",
          bullets: ["dessert experience live", "foc și plating pe loc", "prezentare elegantă", "servire pentru invitați", "recuzită foto", "3 variante de topping / servire", "set - up extins pentru eveniment", "atmosferă caldă și relaxată", "personalizare specială", "elemente vizuale suplimentare"],
          cta: { label: "Solicită oferta" },
        },
      ],
    },
    { heading: "Evenimente Prezentate" },
    {
      body: [{ t: "normal", text: "Fiecare eveniment lasă în urmă o atmosferă care nu se uită ușor. Următorul poate fi al tău." }],
      cta: { label: "Primește o ofertă personalizată" },
    },
  ],
};

const en: VenueLocaleText = {
  hero: {
    tagline: "French dessert served as a live experience. A concept about people, emotions, and youthful memories, where the moment matters more than perfection.",
  },
  sections: [
    {
      heading: "Maison du Feu:",
      subheading: "The Taste of a Moment Lived on the Spot",
      screens: [
        {
          body: [
            { t: "normal", text: "Maison du Feu brings to your event a " },
            { t: "italic-accent", text: "traditional French dessert" },
            { t: "normal", text: " in a form that comes alive in front of your guests. The fire, the texture, the sweet aroma, and the act of preparing it on the spot transform the dessert into" },
            { t: "italic-accent", text: " a moment that turns heads." },
          ],
        },
        {
          body: [
            { t: "normal", text: "The concept is built " },
            { t: "italic-accent", text: "around emotion." },
            { t: "normal", text: " We're not talking about a perfectly styled dessert for photos, but about those" },
            { t: "italic-accent", text: " imperfect moments" },
            { t: "normal", text: " that later become " },
            { t: "italic-accent", text: "the most cherished memories." },
          ],
        },
        {
          body: [
            { t: "normal", text: "The Maison du Feu vibe is warm, human, and gently nostalgic. " },
            { t: "italic-accent", text: "It takes you back to that time in life when everything was experienced more directly," },
            { t: "normal", text: " more simply, more intensely. Hence the freer aesthetic: movement, smiles, imperfect but sincere frames." },
          ],
        },
        {
          body: [
            { t: "normal", text: "For events " },
            { t: "italic-accent", text: "that want to convey energy," },
            { t: "normal", text: " closeness, and a genuine sense of presence, Maison du Feu adds exactly that element that makes the difference between a dessert served and" },
            { t: "italic-accent", text: " an experience truly lived." },
          ],
          cta: { label: "Get a personalised offer" },
        },
      ],
    },
    {
      heading: "How Does Maison du Feu Come Alive?",
      subtitle: "Maison du Feu is not just about desserts, but about the way they come to life in front of guests. Each option is designed as a moment in itself — simple, warm, and easy to share with others.",
      items: [
        {
          heading: "S'mores",
          body: "Crispy biscuits, melted chocolate, and marshmallow warmed directly over the flame — a classic combination that instantly evokes a sense of familiarity and closeness. It's the kind of dessert that gathers people around it and creates natural moments of interaction.",
        },
        {
          heading: "Open-Flame Meringue",
          body: "The meringue develops a golden crust on the outside while staying soft inside, prepared right in front of guests. It's a simple but captivating moment that draws eyes and creates that warm, subtly nostalgic sensation.",
        },
        {
          heading: "Chocolate Fountain",
          body: "The chocolate flows continuously, becoming the centrepiece of the experience. Guests can mix flavours, experiment, and come back again — a detail that adds energy and a relaxed rhythm to the whole event.",
        },
      ],
    },
    {
      heading: "About Emotion,",
      subheading: "Not Perfection",
      screens: [
        {
          body: [
            { t: "normal", text: "Maison du Feu starts from the idea that " },
            { t: "italic-accent", text: "the most beautiful moments are not always the perfect ones." },
            { t: "normal", text: " Sometimes it's precisely the spontaneity, the movement, and the small imperfections that give life its authenticity and charm." },
          ],
        },
        {
          body: [
            { t: "normal", text: "That's what our concept looks like: " },
            { t: "italic-accent", text: "a setting where people feel free," },
            { t: "normal", text: " relaxed, and present, without feeling like they need to pose for the moment. Photos come out naturally, reactions are sincere, and the atmosphere stays alive." },
          ],
        },
        {
          body: [
            { t: "normal", text: "Every detail is designed to support this feeling: from the way the fire is integrated, to how people gather around the experience. " },
            { t: "italic-accent", text: "Everything takes on a close, warm, and very human quality." },
          ],
        },
        {
          body: [
            { t: "normal", text: "For moments that need to leave a warm, human impression, Maison du Feu " },
            { t: "italic-accent", text: "brings exactly the balance" },
            { t: "normal", text: " between understated spectacle and genuine emotion." },
          ],
          cta: { label: "Get a personalised offer" },
        },
      ],
    },
    {
      heading: "Choose the Rhythm That Fits Your Event",
      subtitle: "Every event has its own energy, and Maison du Feu naturally adapts to it. We've created several configurations, from a discreet moment to a fuller presence designed to bring people together around the experience.",
      items: [
        {
          subtitle: "up to 80 guests",
          bullets: ["live dessert experience", "fire and on-site plating", "elegant presentation", "guest service", "warm and relaxed atmosphere"],
          cta: { label: "Request a quote" },
        },
        {
          subtitle: "up to 80 guests",
          bullets: ["live dessert experience", "fire and on-site plating", "elegant presentation", "guest service", "photo props", "2 topping / serving options", "warm and relaxed atmosphere"],
          cta: { label: "Request a quote" },
        },
        {
          subtitle: "up to 80 guests",
          bullets: ["live dessert experience", "fire and on-site plating", "elegant presentation", "guest service", "photo props", "3 topping / serving options", "extended event setup", "warm and relaxed atmosphere"],
          cta: { label: "Request a quote" },
        },
        {
          subtitle: "up to 80 guests",
          bullets: ["live dessert experience", "fire and on-site plating", "elegant presentation", "guest service", "photo props", "3 topping / serving options", "extended event setup", "warm and relaxed atmosphere", "special personalisation", "additional visual elements"],
          cta: { label: "Request a quote" },
        },
      ],
    },
    { heading: "Past Events" },
    {
      body: [{ t: "normal", text: "Every event leaves behind an atmosphere that's not easily forgotten. The next one can be yours." }],
      cta: { label: "Get a personalised offer" },
    },
  ],
};

const ru: VenueLocaleText = {
  hero: {
    tagline: "Французский десерт, поданный как живой опыт. Концепция о людях, эмоциях и воспоминаниях юности, где момент важнее совершенства.",
  },
  sections: [
    {
      heading: "Maison du Feu:",
      subheading: "Вкус Момента, Прожитого Здесь и Сейчас",
      screens: [
        {
          body: [
            { t: "normal", text: "Maison du Feu привозит на ваше мероприятие " },
            { t: "italic-accent", text: "традиционный французский десерт" },
            { t: "normal", text: " в форме, которая оживает прямо перед гостями. Огонь, текстура, сладкий аромат и сам процесс приготовления на месте превращают десерт в" },
            { t: "italic-accent", text: " момент, на который невозможно не обратить внимание." },
          ],
        },
        {
          body: [
            { t: "normal", text: "Концепция построена " },
            { t: "italic-accent", text: "вокруг эмоции." },
            { t: "normal", text: " Речь идёт не об идеально сервированном десерте для фотографий, а о тех" },
            { t: "italic-accent", text: " несовершенных моментах," },
            { t: "normal", text: " которые потом становятся " },
            { t: "italic-accent", text: "самыми дорогими воспоминаниями." },
          ],
        },
        {
          body: [
            { t: "normal", text: "Атмосфера Maison du Feu тёплая, человечная и слегка ностальгическая. " },
            { t: "italic-accent", text: "Она возвращает в то время жизни, когда всё переживалось непосредственнее," },
            { t: "normal", text: " проще, интенсивнее. Отсюда и более свободная эстетика: движение, улыбки, несовершенные, но искренние кадры." },
          ],
        },
        {
          body: [
            { t: "normal", text: "Для мероприятий, " },
            { t: "italic-accent", text: "которые хотят передать энергию," },
            { t: "normal", text: " близость и ощущение настоящего присутствия, Maison du Feu добавляет именно тот элемент, который делает разницу между поданным десертом и" },
            { t: "italic-accent", text: " по-настоящему прожитым опытом." },
          ],
          cta: { label: "Получить персональное предложение" },
        },
      ],
    },
    {
      heading: "Как Оживает Maison du Feu?",
      subtitle: "Maison du Feu — это не просто десерты, а то, как они оживают перед гостями. Каждый вариант задуман как самостоятельный момент — простой, тёплый и легко разделяемый с окружающими.",
      items: [
        {
          heading: "S'mores",
          body: "Хрустящее печенье, растопленный шоколад и маршмэллоу, нагретый прямо на огне — классическое сочетание, мгновенно вызывающее чувство уюта и близости. Это тот вид десерта, который собирает людей вокруг себя и создаёт естественные моменты общения.",
        },
        {
          heading: "Меренга на Живом Огне",
          body: "Меренга приобретает золотистую корочку снаружи, оставаясь мягкой внутри — её готовят прямо на глазах у гостей. Это простой, но захватывающий момент, притягивающий взгляды и создающий то тёплое, слегка ностальгическое ощущение.",
        },
        {
          heading: "Шоколадный Фонтан",
          body: "Шоколад течёт непрерывно, становясь центральным элементом опыта. Гости могут сочетать вкусы, экспериментировать и возвращаться снова — деталь, которая добавляет энергию и расслабленный ритм всему мероприятию.",
        },
      ],
    },
    {
      heading: "Об Эмоции,",
      subheading: "Не о Совершенстве",
      screens: [
        {
          body: [
            { t: "normal", text: "Maison du Feu исходит из идеи, что " },
            { t: "italic-accent", text: "самые красивые моменты — не всегда самые совершенные." },
            { t: "normal", text: " Иногда именно спонтанность, движение и маленькие несовершенства наделяют жизнь подлинностью и обаянием." },
          ],
        },
        {
          body: [
            { t: "normal", text: "Именно так выглядит наша концепция: " },
            { t: "italic-accent", text: "обстановка, где люди чувствуют себя свободными," },
            { t: "normal", text: " расслабленными и присутствующими, не ощущая необходимости позировать для момента. Фотографии выходят естественными, реакции — искренними, а атмосфера остаётся живой." },
          ],
        },
        {
          body: [
            { t: "normal", text: "Каждая деталь продумана для поддержания этого ощущения: от того, как интегрирован огонь, до того, как люди собираются вокруг опыта. " },
            { t: "italic-accent", text: "Всё приобретает близкий, тёплый и очень человечный характер." },
          ],
        },
        {
          body: [
            { t: "normal", text: "Для моментов, которые должны оставить тёплое и человечное впечатление, Maison du Feu " },
            { t: "italic-accent", text: "привносит именно тот баланс" },
            { t: "normal", text: " между ненавязчивым зрелищем и настоящей эмоцией." },
          ],
          cta: { label: "Получить персональное предложение" },
        },
      ],
    },
    {
      heading: "Выберите Ритм, Подходящий Вашему Мероприятию",
      subtitle: "У каждого мероприятия своя энергия, и Maison du Feu естественно к ней адаптируется. Мы создали несколько конфигураций — от сдержанного момента до более широкого присутствия, призванного собрать людей вокруг опыта.",
      items: [
        {
          subtitle: "до 80 гостей",
          bullets: ["живой опыт с десертом", "огонь и сервировка на месте", "элегантная подача", "обслуживание гостей", "тёплая и расслабленная атмосфера"],
          cta: { label: "Запросить предложение" },
        },
        {
          subtitle: "до 80 гостей",
          bullets: ["живой опыт с десертом", "огонь и сервировка на месте", "элегантная подача", "обслуживание гостей", "фото-реквизит", "2 варианта топпинга / подачи", "тёплая и расслабленная атмосфера"],
          cta: { label: "Запросить предложение" },
        },
        {
          subtitle: "до 80 гостей",
          bullets: ["живой опыт с десертом", "огонь и сервировка на месте", "элегантная подача", "обслуживание гостей", "фото-реквизит", "3 варианта топпинга / подачи", "расширенная установка для мероприятия", "тёплая и расслабленная атмосфера"],
          cta: { label: "Запросить предложение" },
        },
        {
          subtitle: "до 80 гостей",
          bullets: ["живой опыт с десертом", "огонь и сервировка на месте", "элегантная подача", "обслуживание гостей", "фото-реквизит", "3 варианта топпинга / подачи", "расширенная установка для мероприятия", "тёплая и расслабленная атмосфера", "специальная персонализация", "дополнительные визуальные элементы"],
          cta: { label: "Запросить предложение" },
        },
      ],
    },
    { heading: "Предыдущие Мероприятия" },
    {
      body: [{ t: "normal", text: "Каждое мероприятие оставляет после себя атмосферу, которую нелегко забыть. Следующей может стать ваша." }],
      cta: { label: "Получить персональное предложение" },
    },
  ],
};

const maisondufeu: Record<string, ReturnType<typeof mergeVenueData>> = {
  ro: mergeVenueData(shared, ro),
  en: mergeVenueData(shared, en),
  ru: mergeVenueData(shared, ru),
};

export default maisondufeu;
