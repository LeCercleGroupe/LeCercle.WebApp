import type { VenuePageData } from "@/components/VenuePage/types";
import { contact_link } from "./constants/links";

const ro: VenuePageData = {
  name: "Maison du Feu",
  logo: "/logos/MaisonDuFeu.svg",
  accentColor: "#EADA63",

  hero: {
    video: "/videos/maisondufeu-horizontal.mp4",
    tagline: "Desert franțuzesc servit ca experiență live. Un concept despre oameni, emoții și amintiri din tinerețe, unde momentul contează mai mult decât perfecțiunea.",
  },

  sections: [
    {
      type: "video-scene",
      video: "/projectVideos/maisonDuFeu/scene-1.mp4",
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
          textPosition: "right",
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
          textPosition: "left",
        },
        {
          body: [
            { t: "normal", text: "Vibe-ul Maison du Feu este unul cald, uman și ușor nostalgic. " },
            { t: "italic-accent", text: "Te duce cu gândul la perioada aceea a vieții în care totul se trăia mai direct," },
            { t: "normal", text: " mai simplu, mai intens. De aici și estetica mai liberă: mișcare, zâmbete, cadre imperfecte, dar sincere." },
          ],
          textPosition: "right",
        },
        {
          body: [
            { t: "normal", text: "Pentru evenimente " },
            { t: "italic-accent", text: "care vor să transmită energie," },
            { t: "normal", text: " apropiere și un sentiment real de prezență, Maison du Feu adaugă exact acel element care face diferența între un desert servit și" },
            { t: "italic-accent", text: " o experiență trăită." }
          ],
          textPosition: "center",
          cta: { label: "Primește o ofertă personalizată", href: contact_link },
        },
      ],
    },
    {
      type: "features",
      heading: "Cum Se Aprinde Maison du Feu?",
      subtitle: "Maison du Feu nu este doar despre deserturi, ci despre felul în care acestea prind viață în fața invitaților. Fiecare opțiune este gândită ca un moment în sine — simplu, cald și ușor de împărțit cu ceilalți.",
      items: [
        {
          image: "/projectFeatures/MaisonDuFeu/feature-1.png",
          imageAlt: "Feature 1",
          heading: "S’mores",
          body: "Biscuiți crocanți, ciocolată topită și marshmallow încălzit direct la foc — o combinație clasică, care aduce imediat un sentiment de familiar și apropiere. Este genul de desert care adună oamenii în jurul lui și creează momente naturale de interacțiune.",
        },
        {
          image: "/projectFeatures/MaisonDuFeu/feature-2.png",
          imageAlt: "Feature 2",
          heading: "Bezea la Foc Viu",
          body: "Bezeaua prinde o textură aurie la exterior și rămâne moale în interior, fiind pregătită chiar în fața invitaților. Este un moment simplu, dar captivant, care atrage priviri și creează acea senzație caldă și ușor nostalgică.",
        },
        {
          image: "/projectFeatures/MaisonDuFeu/feature-3.png",
          imageAlt: "Feature 3",
          heading: "Fântâna de Ciocolată",
          body: "Ciocolata curge continuu, devenind punctul central al experienței. Invitații pot combina gusturi, pot experimenta și pot reveni de mai multe ori — un detaliu care adaugă energie și un ritm relaxat întregului eveniment.",
        }
      ],
    },
    {
      type: "video-scene",
      video: "/projectVideos/maisonDuFeu/scene-2.mp4",
      heading: "Despre Emoție,",
      subheading: "Nu Despre Perfecțiune",
      accentColor: "#DAA17F",
      screens: [
        {
          body: [
            { t: "normal", text: "Maison du Feu pornește de la ideea că  " },
            { t: "italic-accent", text: "cele mai frumoase momente nu sunt întotdeauna cele perfecte." },
            { t: "normal", text: " Uneori, tocmai spontaneitatea, mișcarea și micile imperfecțiuni sunt cele care dau vieții autenticitate și farmec." },
          ],
          textPosition: "left",
        },
        {
          body: [
            { t: "normal", text: "Așa arată și conceptul nostru: " },
            { t: "italic-accent", text: "un cadru în care oamenii se simt liberi," },
            { t: "normal", text: " relaxați și prezenți, fără să simtă că trebuie să pozeze pentru moment. Pozele ies naturale, reacțiile sincere, iar atmosfera rămâne vie." },
          ],
          textPosition: "right",
        },
        {
          body: [
            { t: "normal", text: "Fiecare detaliu este gândit ca să susțină această senzație: de la modul în care este integrat focul, până la felul în care se adună oamenii în jurul experienței. " },
            { t: "italic-accent", text: "Totul capătă un aer apropiat, cald și foarte uman." },
          ],
          textPosition: "left",
        },
        {
          body: [
            { t: "normal", text: "Pentru momente care trebuie să lase o impresie caldă și umană, Maison du Feu " },
            { t: "italic-accent", text: "aduce exact echilibrul" },
            { t: "normal", text: " dintre spectacol discret și emoție reală." },
          ],
          textPosition: "center",
          cta: { label: "Primește o ofertă personalizată", href: contact_link },
        },
      ],
    },
    {
      type: "packages",
      heading: "Alege Ritmul Potrivit Evenimentului Tău",
      subtitle: "Fiecare eveniment are propria energie, iar Maison du Feu se adaptează firesc la ea. Am creat mai multe configurații, de la un moment discret la o prezență mai amplă, gândită să adune oamenii în jurul experienței.",
      items: [
        {
          name: "Éclat",
          subtitle: "până la 80 de persoane",
          bullets: ["dessert experience live", "foc și plating pe loc", "prezentare elegantă", "servire pentru invitați", "atmosferă caldă și relaxată"],
          price: "750 €",
          accentColor: "#A30912",
          cta: { label: "Solicită oferta", href: contact_link },
        },
        {
          name: "Réminiscence",
          subtitle: "până la 80 de persoane",
          bullets: ["dessert experience live", "foc și plating pe loc", "prezentare elegantă", "servire pentru invitați", "recuzită foto", "2 variante de topping / servire", "atmosferă caldă și relaxată"],
          price: "950 €",
          accentColor: "#1B5A38",
          cta: { label: "Solicită oferta", href: contact_link },
        },
        {
          name: "Moment",
          subtitle: "până la 80 de persoane",
          bullets: ["dessert experience live", "foc și plating pe loc", "prezentare elegantă", "servire pentru invitați", "recuzită foto", "3 variante de topping / servire", "set - up extins pentru eveniment", "atmosferă caldă și relaxată"],
          price: "1 350 €",
          accentColor: "#16447D",
          cta: { label: "Solicită oferta", href: contact_link },
        },
        {
          name: "Signature",
          subtitle: "până la 80 de persoane",
          bullets: ["dessert experience live", "foc și plating pe loc", "prezentare elegantă", "servire pentru invitați", "recuzită foto", "3 variante de topping / servire", "set - up extins pentru eveniment", "atmosferă caldă și relaxată", "personalizare specială", "elemente vizuale suplimentare"],
          price: "1980 €",
          accentColor: "#522B73",
          cta: { label: "Solicită oferta", href: contact_link },
        },
      ],
    },
    {
      type: "gallery",
      heading: "Evenimente Prezentate",
      images: [
        { src: "/projectGallery/maisonDuFeu/image-1.png", alt: "Image 1" },
        { src: "/projectGallery/maisonDuFeu/image-6.png", alt: "Image 6" },
        { src: "/projectGallery/maisonDuFeu/image-4.png", alt: "Image 4" },
        { src: "/projectGallery/maisonDuFeu/image-5.png", alt: "Image 5" },
        { src: "/projectGallery/maisonDuFeu/image-7.png", alt: "Image 7" },
        { src: "/projectGallery/maisonDuFeu/image-4.png", alt: "Image 4" },
        { src: "/projectGallery/maisonDuFeu/image-8.png", alt: "Image 8" },
        { src: "/projectGallery/maisonDuFeu/image-5.png", alt: "Image 5" },
      ],
    },
    {
      type: "closing-cta",
      background: "light",
      showLogo: true,
      body: [
        { t: "normal", text: "Fiecare eveniment lasă în urmă o atmosferă care nu se uită ușor. Următorul poate fi al tău." },
      ],
      cta: { label: "Primește o ofertă personalizată", href: contact_link },
    },
  ],
};



const en: VenuePageData = {
  name: "Maison du Feu",
  logo: "/logos/MaisonDuFeu.svg",
  accentColor: "#EADA63",

  hero: {
    video: "/videos/maisondufeu-horizontal.mp4",
    tagline: "French dessert served as a live experience. A concept about people, emotions, and youthful memories, where the moment matters more than perfection.",
  },

  sections: [
    {
      type: "video-scene",
      video: "/projectVideos/maisonDuFeu/scene-1.mp4",
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
          textPosition: "right",
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
          textPosition: "left",
        },
        {
          body: [
            { t: "normal", text: "The Maison du Feu vibe is warm, human, and gently nostalgic. " },
            { t: "italic-accent", text: "It takes you back to that time in life when everything was experienced more directly," },
            { t: "normal", text: " more simply, more intensely. Hence the freer aesthetic: movement, smiles, imperfect but sincere frames." },
          ],
          textPosition: "right",
        },
        {
          body: [
            { t: "normal", text: "For events " },
            { t: "italic-accent", text: "that want to convey energy," },
            { t: "normal", text: " closeness, and a genuine sense of presence, Maison du Feu adds exactly that element that makes the difference between a dessert served and" },
            { t: "italic-accent", text: " an experience truly lived." },
          ],
          textPosition: "center",
          cta: { label: "Get a personalised offer", href: contact_link },
        },
      ],
    },
    {
      type: "features",
      heading: "How Does Maison du Feu Come Alive?",
      subtitle: "Maison du Feu is not just about desserts, but about the way they come to life in front of guests. Each option is designed as a moment in itself — simple, warm, and easy to share with others.",
      items: [
        {
          image: "/projectFeatures/MaisonDuFeu/feature-1.png",
          imageAlt: "Feature 1",
          heading: "S'mores",
          body: "Crispy biscuits, melted chocolate, and marshmallow warmed directly over the flame — a classic combination that instantly evokes a sense of familiarity and closeness. It's the kind of dessert that gathers people around it and creates natural moments of interaction.",
        },
        {
          image: "/projectFeatures/MaisonDuFeu/feature-2.png",
          imageAlt: "Feature 2",
          heading: "Open-Flame Meringue",
          body: "The meringue develops a golden crust on the outside while staying soft inside, prepared right in front of guests. It's a simple but captivating moment that draws eyes and creates that warm, subtly nostalgic sensation.",
        },
        {
          image: "/projectFeatures/MaisonDuFeu/feature-3.png",
          imageAlt: "Feature 3",
          heading: "Chocolate Fountain",
          body: "The chocolate flows continuously, becoming the centrepiece of the experience. Guests can mix flavours, experiment, and come back again — a detail that adds energy and a relaxed rhythm to the whole event.",
        },
      ],
    },
    {
      type: "video-scene",
      video: "/projectVideos/maisonDuFeu/scene-2.mp4",
      heading: "About Emotion,",
      subheading: "Not Perfection",
      accentColor: "#DAA17F",
      screens: [
        {
          body: [
            { t: "normal", text: "Maison du Feu starts from the idea that " },
            { t: "italic-accent", text: "the most beautiful moments are not always the perfect ones." },
            { t: "normal", text: " Sometimes it's precisely the spontaneity, the movement, and the small imperfections that give life its authenticity and charm." },
          ],
          textPosition: "left",
        },
        {
          body: [
            { t: "normal", text: "That's what our concept looks like: " },
            { t: "italic-accent", text: "a setting where people feel free," },
            { t: "normal", text: " relaxed, and present, without feeling like they need to pose for the moment. Photos come out naturally, reactions are sincere, and the atmosphere stays alive." },
          ],
          textPosition: "right",
        },
        {
          body: [
            { t: "normal", text: "Every detail is designed to support this feeling: from the way the fire is integrated, to how people gather around the experience. " },
            { t: "italic-accent", text: "Everything takes on a close, warm, and very human quality." },
          ],
          textPosition: "left",
        },
        {
          body: [
            { t: "normal", text: "For moments that need to leave a warm, human impression, Maison du Feu " },
            { t: "italic-accent", text: "brings exactly the balance" },
            { t: "normal", text: " between understated spectacle and genuine emotion." },
          ],
          textPosition: "center",
          cta: { label: "Get a personalised offer", href: contact_link },
        },
      ],
    },
    {
      type: "packages",
      heading: "Choose the Rhythm That Fits Your Event",
      subtitle: "Every event has its own energy, and Maison du Feu naturally adapts to it. We've created several configurations, from a discreet moment to a fuller presence designed to bring people together around the experience.",
      items: [
        {
          name: "Éclat",
          subtitle: "up to 80 guests",
          bullets: ["live dessert experience", "fire and on-site plating", "elegant presentation", "guest service", "warm and relaxed atmosphere"],
          price: "750 €",
          accentColor: "#A30912",
          cta: { label: "Request a quote", href: contact_link },
        },
        {
          name: "Réminiscence",
          subtitle: "up to 80 guests",
          bullets: ["live dessert experience", "fire and on-site plating", "elegant presentation", "guest service", "photo props", "2 topping / serving options", "warm and relaxed atmosphere"],
          price: "950 €",
          accentColor: "#1B5A38",
          cta: { label: "Request a quote", href: contact_link },
        },
        {
          name: "Moment",
          subtitle: "up to 80 guests",
          bullets: ["live dessert experience", "fire and on-site plating", "elegant presentation", "guest service", "photo props", "3 topping / serving options", "extended event setup", "warm and relaxed atmosphere"],
          price: "1 350 €",
          accentColor: "#16447D",
          cta: { label: "Request a quote", href: contact_link },
        },
        {
          name: "Signature",
          subtitle: "up to 80 guests",
          bullets: ["live dessert experience", "fire and on-site plating", "elegant presentation", "guest service", "photo props", "3 topping / serving options", "extended event setup", "warm and relaxed atmosphere", "special personalisation", "additional visual elements"],
          price: "1980 €",
          accentColor: "#522B73",
          cta: { label: "Request a quote", href: contact_link },
        },
      ],
    },
    {
      type: "gallery",
      heading: "Past Events",
      images: [
        { src: "/projectGallery/maisonDuFeu/image-1.png", alt: "Image 1" },
        { src: "/projectGallery/maisonDuFeu/image-6.png", alt: "Image 6" },
        { src: "/projectGallery/maisonDuFeu/image-4.png", alt: "Image 4" },
        { src: "/projectGallery/maisonDuFeu/image-5.png", alt: "Image 5" },
        { src: "/projectGallery/maisonDuFeu/image-7.png", alt: "Image 7" },
        { src: "/projectGallery/maisonDuFeu/image-4.png", alt: "Image 4" },
        { src: "/projectGallery/maisonDuFeu/image-8.png", alt: "Image 8" },
        { src: "/projectGallery/maisonDuFeu/image-5.png", alt: "Image 5" },
      ],
    },
    {
      type: "closing-cta",
      background: "light",
      showLogo: true,
      body: [
        { t: "normal", text: "Every event leaves behind an atmosphere that's not easily forgotten. The next one can be yours." },
      ],
      cta: { label: "Get a personalised offer", href: contact_link },
    },
  ],
};

const ru: VenuePageData = {
  name: "Maison du Feu",
  logo: "/logos/MaisonDuFeu.svg",
  accentColor: "#EADA63",

  hero: {
    video: "/videos/maisondufeu-horizontal.mp4",
    tagline: "Французский десерт, поданный как живой опыт. Концепция о людях, эмоциях и воспоминаниях юности, где момент важнее совершенства.",
  },

  sections: [
    {
      type: "video-scene",
      video: "/projectVideos/maisonDuFeu/scene-1.mp4",
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
          textPosition: "right",
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
          textPosition: "left",
        },
        {
          body: [
            { t: "normal", text: "Атмосфера Maison du Feu тёплая, человечная и слегка ностальгическая. " },
            { t: "italic-accent", text: "Она возвращает в то время жизни, когда всё переживалось непосредственнее," },
            { t: "normal", text: " проще, интенсивнее. Отсюда и более свободная эстетика: движение, улыбки, несовершенные, но искренние кадры." },
          ],
          textPosition: "right",
        },
        {
          body: [
            { t: "normal", text: "Для мероприятий, " },
            { t: "italic-accent", text: "которые хотят передать энергию," },
            { t: "normal", text: " близость и ощущение настоящего присутствия, Maison du Feu добавляет именно тот элемент, который делает разницу между поданным десертом и" },
            { t: "italic-accent", text: " по-настоящему прожитым опытом." },
          ],
          textPosition: "center",
          cta: { label: "Получить персональное предложение", href: contact_link },
        },
      ],
    },
    {
      type: "features",
      heading: "Как Оживает Maison du Feu?",
      subtitle: "Maison du Feu — это не просто десерты, а то, как они оживают перед гостями. Каждый вариант задуман как самостоятельный момент — простой, тёплый и легко разделяемый с окружающими.",
      items: [
        {
          image: "/projectFeatures/MaisonDuFeu/feature-1.png",
          imageAlt: "Feature 1",
          heading: "S'mores",
          body: "Хрустящее печенье, растопленный шоколад и маршмэллоу, нагретый прямо на огне — классическое сочетание, мгновенно вызывающее чувство уюта и близости. Это тот вид десерта, который собирает людей вокруг себя и создаёт естественные моменты общения.",
        },
        {
          image: "/projectFeatures/MaisonDuFeu/feature-2.png",
          imageAlt: "Feature 2",
          heading: "Меренга на Живом Огне",
          body: "Меренга приобретает золотистую корочку снаружи, оставаясь мягкой внутри — её готовят прямо на глазах у гостей. Это простой, но захватывающий момент, притягивающий взгляды и создающий то тёплое, слегка ностальгическое ощущение.",
        },
        {
          image: "/projectFeatures/MaisonDuFeu/feature-3.png",
          imageAlt: "Feature 3",
          heading: "Шоколадный Фонтан",
          body: "Шоколад течёт непрерывно, становясь центральным элементом опыта. Гости могут сочетать вкусы, экспериментировать и возвращаться снова — деталь, которая добавляет энергию и расслабленный ритм всему мероприятию.",
        },
      ],
    },
    {
      type: "video-scene",
      video: "/projectVideos/maisonDuFeu/scene-2.mp4",
      heading: "Об Эмоции,",
      subheading: "Не о Совершенстве",
      accentColor: "#DAA17F",
      screens: [
        {
          body: [
            { t: "normal", text: "Maison du Feu исходит из идеи, что " },
            { t: "italic-accent", text: "самые красивые моменты — не всегда самые совершенные." },
            { t: "normal", text: " Иногда именно спонтанность, движение и маленькие несовершенства наделяют жизнь подлинностью и обаянием." },
          ],
          textPosition: "left",
        },
        {
          body: [
            { t: "normal", text: "Именно так выглядит наша концепция: " },
            { t: "italic-accent", text: "обстановка, где люди чувствуют себя свободными," },
            { t: "normal", text: " расслабленными и присутствующими, не ощущая необходимости позировать для момента. Фотографии выходят естественными, реакции — искренними, а атмосфера остаётся живой." },
          ],
          textPosition: "right",
        },
        {
          body: [
            { t: "normal", text: "Каждая деталь продумана для поддержания этого ощущения: от того, как интегрирован огонь, до того, как люди собираются вокруг опыта. " },
            { t: "italic-accent", text: "Всё приобретает близкий, тёплый и очень человечный характер." },
          ],
          textPosition: "left",
        },
        {
          body: [
            { t: "normal", text: "Для моментов, которые должны оставить тёплое и человечное впечатление, Maison du Feu " },
            { t: "italic-accent", text: "привносит именно тот баланс" },
            { t: "normal", text: " между ненавязчивым зрелищем и настоящей эмоцией." },
          ],
          textPosition: "center",
          cta: { label: "Получить персональное предложение", href: contact_link },
        },
      ],
    },
    {
      type: "packages",
      heading: "Выберите Ритм, Подходящий Вашему Мероприятию",
      subtitle: "У каждого мероприятия своя энергия, и Maison du Feu естественно к ней адаптируется. Мы создали несколько конфигураций — от сдержанного момента до более широкого присутствия, призванного собрать людей вокруг опыта.",
      items: [
        {
          name: "Éclat",
          subtitle: "до 80 гостей",
          bullets: ["живой опыт с десертом", "огонь и сервировка на месте", "элегантная подача", "обслуживание гостей", "тёплая и расслабленная атмосфера"],
          price: "750 €",
          accentColor: "#A30912",
          cta: { label: "Запросить предложение", href: contact_link },
        },
        {
          name: "Réminiscence",
          subtitle: "до 80 гостей",
          bullets: ["живой опыт с десертом", "огонь и сервировка на месте", "элегантная подача", "обслуживание гостей", "фото-реквизит", "2 варианта топпинга / подачи", "тёплая и расслабленная атмосфера"],
          price: "950 €",
          accentColor: "#1B5A38",
          cta: { label: "Запросить предложение", href: contact_link },
        },
        {
          name: "Moment",
          subtitle: "до 80 гостей",
          bullets: ["живой опыт с десертом", "огонь и сервировка на месте", "элегантная подача", "обслуживание гостей", "фото-реквизит", "3 варианта топпинга / подачи", "расширенная установка для мероприятия", "тёплая и расслабленная атмосфера"],
          price: "1 350 €",
          accentColor: "#16447D",
          cta: { label: "Запросить предложение", href: contact_link },
        },
        {
          name: "Signature",
          subtitle: "до 80 гостей",
          bullets: ["живой опыт с десертом", "огонь и сервировка на месте", "элегантная подача", "обслуживание гостей", "фото-реквизит", "3 варианта топпинга / подачи", "расширенная установка для мероприятия", "тёплая и расслабленная атмосфера", "специальная персонализация", "дополнительные визуальные элементы"],
          price: "1980 €",
          accentColor: "#522B73",
          cta: { label: "Запросить предложение", href: contact_link },
        },
      ],
    },
    {
      type: "gallery",
      heading: "Предыдущие Мероприятия",
      images: [
        { src: "/projectGallery/maisonDuFeu/image-1.png", alt: "Image 1" },
        { src: "/projectGallery/maisonDuFeu/image-6.png", alt: "Image 6" },
        { src: "/projectGallery/maisonDuFeu/image-4.png", alt: "Image 4" },
        { src: "/projectGallery/maisonDuFeu/image-5.png", alt: "Image 5" },
        { src: "/projectGallery/maisonDuFeu/image-7.png", alt: "Image 7" },
        { src: "/projectGallery/maisonDuFeu/image-4.png", alt: "Image 4" },
        { src: "/projectGallery/maisonDuFeu/image-8.png", alt: "Image 8" },
        { src: "/projectGallery/maisonDuFeu/image-5.png", alt: "Image 5" },
      ],
    },
    {
      type: "closing-cta",
      background: "light",
      showLogo: true,
      body: [
        { t: "normal", text: "Каждое мероприятие оставляет после себя атмосферу, которую нелегко забыть. Следующей может стать ваша." },
      ],
      cta: { label: "Получить персональное предложение", href: contact_link },
    },
  ],
};

const maisondufeu: Record<string, VenuePageData> = { ro, en, ru };

export default maisondufeu;
