import type { VenueShared, VenueLocaleText } from "@/components/VenuePage/types";
import { contact_link } from "./constants/links";
import { mergeVenueData } from "./utils/mergeVenueData";

const shared: VenueShared = {
  name: "Le Bureau",
  logo: "/logos/LeBureau.svg",
  accentColor: "#B87333",
  hero: {
    video: "/videos/lebureau-horizontal.mp4",
    videoMobile: "/videos/lebureau-vertical.mp4",
  },
  social: {
    instagram: "https://www.instagram.com/lebureau.lcg?igsh=cjYyeG1oc2duMnVt",
    facebook: "#",
  },
  sections: [
    {
      type: "video-scene",
      video: "/projectVideos/leBureau/scene-whiskey.mp4",
      accentColor: "#B87333",
      screens: [
        { textPosition: "left" },
        { textPosition: "right" },
        { textPosition: "left" },
        { textPosition: "center", cta: { href: contact_link } },
      ],
    },
    {
      type: "features",
      items: [
        { image: "/projectFeatures/leBureau/leBureau-feature-2.png", imageAlt: "Elegant private event" },
        { image: "/projectFeatures/leBureau/leBureau-feature-1.png", imageAlt: "Luxury wedding" },
        { image: "/projectFeatures/leBureau/leBureau-feature-3.png", imageAlt: "Corporate event" },
      ],
    },
    {
      type: "video-scene",
      video: "/projectVideos/leBureau/scene-wine.mp4",
      accentColor: "#FC5053",
      screens: [
        { textPosition: "left" },
        { textPosition: "right" },
        { textPosition: "center", cta: { href: contact_link } },
      ],
    },
    {
      type: "packages",
      items: [
        { name: "Invité",    price: "€750",  accentColor: "#A30912", cta: { href: contact_link } },
        { name: "Associé",   price: "€950",  accentColor: "#1B5A38", cta: { href: contact_link } },
        { name: "Directeur", price: "€1350", accentColor: "#16447D", cta: { href: contact_link } },
        { name: "Président", price: "€1950", accentColor: "#522B73", cta: { href: contact_link } },
      ],
    },
    {
      type: "video-scene",
      video: "/projectVideos/leBureau/cigar.mp4",
      accentColor: "#659BF5",
      screens: [
        { textPosition: "left" },
        { textPosition: "right" },
        { textPosition: "left" },
      ],
    },
    {
      type: "gallery",
      images: [
        { src: "/projectGallery/leBureau/photo1.png",  alt: "Le Bureau whiskey detail" },
        { src: "/projectGallery/leBureau/photo2.jpg",  alt: "Gala guests" },
        { src: "/projectGallery/leBureau/photo3.jpg",  alt: "Retro atmosphere" },
        { src: "/projectGallery/leBureau/photo4.jpg",  alt: "Glass detail" },
        { src: "/projectGallery/leBureau/photo5.jpg",  alt: "Private evening" },
        { src: "/projectGallery/leBureau/photo6.jpg",  alt: "Le Bureau lounge" },
        { src: "/projectGallery/leBureau/photo7.png",  alt: "Premium cigars" },
        { src: "/projectGallery/leBureau/photo8.jpg",  alt: "Vintage decor" },
        { src: "/projectGallery/leBureau/photo9.jpg",  alt: "Gramophone" },
        { src: "/projectGallery/leBureau/photo10.png", alt: "Whiskey experience" },
        { src: "/projectGallery/leBureau/photo11.png", alt: "Wedding with Le Bureau" },
        { src: "/projectGallery/leBureau/photo12.png", alt: "Bottle detail" },
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
    tagline: "Cigar lounge cu aer retro și clasic. Un spațiu matur, elegant și discret, inspirat de ritualuri clasice și de rafinamentul vremurilor trecute.",
  },
  sections: [
    {
      heading: "Conceptul Le Bureau:",
      subheading: "Arta de a Opri Timpul în Loc",
      screens: [
        {
          body: [
            { t: "normal", text: "Le Bureau aduce atmosfera unui " },
            { t: "italic-accent", text: "club privat la evenimentul tău." },
            { t: "normal", text: " Trabucuri premium, whiskey special, muzică de pe gramofon, mașină de scris, ruletă vintage: fiecare detaliu este ales pentru a crea o experiență autentică și memorabilă." },
          ],
        },
        {
          body: [
            { t: "normal", text: "În spatele unei uși fără număr, Le Bureau așteaptă. " },
            { t: "italic-accent", text: "Nu e pentru oricine." },
            { t: "normal", text: " Nici pentru oricând. Doar pentru cei care știu să caute experiența dincolo de convențional." },
          ],
        },
        {
          body: [
            { t: "normal", text: "Creăm un spațiu viu, unde sunetul vinilului și aroma trabucurilor premium stabilesc un ritm aparte. Fiecare obiect din decorul nostru este ales special pentru a stimula interacțiunea umană, " },
            { t: "italic-accent", text: "oferind invitaților șansa de a trăi momente reale, " },
            { t: "normal", text: " departe de agomot și agitația cotidiană." },
          ],
        },
        {
          body: [
            { t: "normal", text: "Contactează-ne astăzi pentru a rezerva experiența Le Bureau și " },
            { t: "italic-accent", text: "oferă-le invitaților tăi cheia către un refugiu atemporal, " },
            { t: "normal", text: "unde luxul se simte în fiecare gest. Suntem gata să deschidem ușa pentru tine și să transformăm viziunea ta într-o poveste." },
          ],
          cta: { label: "Primește o ofertă personalizată" },
        },
      ],
    },
    {
      heading: "Unde Se Deschid Ușile Le Bureau?",
      subtitle: "Conceptul nostru este gândit să se integreze impecabil în orice scenariu care cere un plus de rafinament, mister și exclusivitate. Transformăm o zonă a locației tale într-un veritabil lounge de lux.",
      items: [
        {
          heading: "Evenimente Oficiale & Lansări de Produs",
          body: "Impresionează-ți partenerii de afaceri, clienții VIP sau echipa de management. Le Bureau oferă cadrul ideal pentru un networking de cel mai înalt nivel, unde discuțiile importante se poartă discret, în jurul unei mese de ruletă și la un pahar de colecție.",
        },
        {
          heading: "Nunți & Recepții Elegante",
          body: "Oferă-le invitaților un „cigar & whiskey bar” memorabil, un colț de respiro absolut, departe de zgomotul ringului de dans, unde invitații se pot retrage pentru o conversație așezată, muzică de gramofon și o experiență clasică.",
        },
        {
          heading: "Petreceri Private & Aniversări",
          body: "Fie că visezi la o noapte tematică în stilul efervescent al anilor '20, o seară Prohibition sau pur și simplu o petrecere elitistă pentru apropiați, noi aducem recuzita, băuturile și atitudinea necesare pentru o noapte legendară.",
        },
      ],
    },
    {
      heading: "Ritualuri Care Dau Tonul",
      screens: [
        {
          body: [
            { t: "normal", text: "Le Bureau nu este gândit pentru toate tipurile de evenimente și nici pentru orice context. Funcționează cel mai bine acolo unde există intenție, unde gazda " },
            { t: "italic-accent", text: "vrea să ofere invitaților ceva diferit," },
            { t: "normal", text: " nu doar să completeze un spațiu." },
          ],
        },
        {
          body: [
            { t: "normal", text: "De aceea, fiecare setup este tratat selectiv. " },
            { t: "italic-accent", text: "Nu multiplicăm aceeași formulă de la un eveniment la altul," },
            { t: "normal", text: " ci alegem unde și cum apare Le Bureau, astfel încât să își păstreze caracterul și impactul." },
          ],
        },
        {
          body: [
            { t: "normal", text: "Dacă vrei un element care să nu fie accesibil oricui și care " },
            { t: "italic-accent", text: "să ridice percepția întregului eveniment," },
            { t: "normal", text: " Le Bureau funcționează exact în acel registru." },
          ],
          cta: { label: "Primește o ofertă personalizată" },
        },
      ],
    },
    {
      heading: "Alege Experiența Potrivită Evenimentului Tău",
      subtitle: "Fiecare eveniment are propriul ritm și o poveste unică de spus. Am creat câteva configurații diferite pentru a ne asigura că atmosfera Le Bureau se adaptează perfect dimensiunii și dorințelor tale.",
      items: [
        {
          subtitle: "până la 80 de persoane",
          bullets: [
            "Smoked Whiskey Experience",
            "Muzică de epocă la gramofon",
            "Ambianță vintage curated",
            "Setup complet inclus",
            "2 sticle whiskey premium & 4 sticle vin selecționat",
            "20 trabucuri premium",
            "Corner foto tematic",
            "Chelner dedicat: 6 ore de serviciu",
          ],
          cta: { label: "Solicită ofertă" },
        },
        {
          subtitle: "până la 80 de persoane",
          bullets: [
            "Smoked Whiskey Experience",
            "Muzică de epocă la gramofon",
            "Ambianță vintage curated",
            "3 sticle whiskey premium & 5 sticle vin selecționat",
            "30 trabucuri premium",
            "Corner foto tematic",
            "10 fotografii Polaroid",
            "Chelner dedicat",
            "Setup & demontare incluse",
          ],
          cta: { label: "Solicită ofertă" },
        },
        {
          subtitle: "până la 80 de persoane",
          bullets: [
            "Smoked Whiskey Experience",
            "Muzică de epocă la gramofon",
            "Ambianță vintage curated",
            "4 sticle whiskey premium & 7 sticle vin selecționat",
            "35 trabucuri premium",
            "Corner foto tematic",
            "15 fotografii Polaroid",
            "Cocktail bar cu snacks selecționate",
            "Chelner dedicat + barman",
            "Setup & demontare incluse",
          ],
          cta: { label: "Solicită ofertă" },
        },
        {
          subtitle: "până la 80 de persoane",
          bullets: [
            "Smoked Whiskey Experience",
            "Muzică de epocă la gramofon",
            "Ambianță vintage curated",
            "5 sticle whiskey premium & 9 sticle vin selecționat",
            "40 trabucuri premium",
            "Corner foto tematic",
            "20 fotografii Polaroid",
            "Cocktail bar cu snacks selecționate",
            "Mașină de scris vintage — experiență live",
            "Chelner dedicat + barman",
            "Setup & demontare incluse",
          ],
          cta: { label: "Solicită ofertă" },
        },
      ],
    },
    {
      heading: "De la Idee",
      subheading: "la Prezență Reală",
      screens: [
        {
          body: [
            { t: "normal", text: "Totul începe cu " },
            { t: "italic-accent", text: "spațiul și contextul evenimentului tău." },
            { t: "normal", text: " Analizăm locația, fluxul invitaților și tipul de energie pe care vrei să o creezi, pentru a decide cum și unde se integrează Le Bureau." },
          ],
        },
        {
          body: [
            { t: "normal", text: "Apoi " },
            { t: "italic-accent", text: "construim experiența în detaliu: " },
            { t: "normal", text: " selecția de băuturi, tipul de recuzită, modul în care este poziționat spațiul și felul în care invitații ajung să-l descopere. Nimic nu este lăsat la întâmplare." },
          ],
        },
        {
          body: [
            { t: "normal", text: "În ziua evenimentului, totul este deja pregătit pentru a funcționa natural." },
            { t: "italic-accent", text: "Nu este nevoie de explicații sau ghidaj forțat," },
            { t: "normal", text: " invitații intră în atmosferă intuitiv, atrași de detalii și de energia locului." },
          ],
        },
      ],
    },
    { heading: "Evenimente Precedente" },
    {
      body: [{ t: "normal", text: "Fiecare eveniment lasă în urmă o atmosferă care nu se uită ușor. Următorul poate fi al tău." }],
      cta: { label: "Primește o ofertă personalizată" },
    },
  ],
};

const en: VenueLocaleText = {
  hero: {
    tagline: "Retro cigar lounge with an elegant, timeless atmosphere. A mature, discreet space inspired by classic rituals and the refinement of bygone eras.",
  },
  sections: [
    {
      heading: "The Le Bureau Concept:",
      subheading: "The Art of Stopping Time",
      screens: [
        {
          body: [
            { t: "normal", text: "Le Bureau brings the atmosphere of a " },
            { t: "italic-accent", text: "private club to your event." },
            { t: "normal", text: " Premium cigars, special whiskey, gramophone music, a typewriter, vintage roulette: every detail is chosen to create an authentic and memorable experience." },
          ],
        },
        {
          body: [
            { t: "normal", text: "Behind a door with no number, Le Bureau awaits. " },
            { t: "italic-accent", text: "It's not for everyone." },
            { t: "normal", text: " Nor for every occasion. Only for those who know how to seek the experience beyond the conventional." },
          ],
        },
        {
          body: [
            { t: "normal", text: "We create a living space where the sound of vinyl and the aroma of premium cigars set a distinct rhythm. Every object in our decor is carefully chosen to stimulate human interaction, " },
            { t: "italic-accent", text: "giving guests the chance to experience real moments, " },
            { t: "normal", text: "away from noise and daily commotion." },
          ],
        },
        {
          body: [
            { t: "normal", text: "Contact us today to book the Le Bureau experience and " },
            { t: "italic-accent", text: "give your guests the key to a timeless retreat, " },
            { t: "normal", text: "where luxury is felt in every gesture. We're ready to open the door for you and turn your vision into a story." },
          ],
          cta: { label: "Get a personalised offer" },
        },
      ],
    },
    {
      heading: "Where Does Le Bureau Open Its Doors?",
      subtitle: "Our concept is designed to integrate seamlessly into any scenario that calls for an extra touch of refinement, mystery, and exclusivity. We transform a corner of your venue into a true luxury lounge.",
      items: [
        {
          heading: "Corporate Events & Product Launches",
          body: "Impress your business partners, VIP clients, or management team. Le Bureau provides the ideal setting for top-level networking, where important conversations happen discreetly, around a roulette table and over a collector's glass.",
        },
        {
          heading: "Weddings & Elegant Receptions",
          body: "Give your guests a memorable cigar & whiskey bar — an absolute retreat, away from the noise of the dance floor, where guests can step away for a relaxed conversation, gramophone music, and a classic experience.",
        },
        {
          heading: "Private Parties & Anniversaries",
          body: "Whether you dream of a themed night in the effervescent style of the 1920s, a Prohibition evening, or simply an elite gathering for close friends, we bring the props, drinks, and attitude needed for a legendary night.",
        },
      ],
    },
    {
      heading: "Rituals That Set the Tone",
      screens: [
        {
          body: [
            { t: "normal", text: "Le Bureau is not designed for all types of events or every context. It works best where there is intention, where the host " },
            { t: "italic-accent", text: "wants to offer guests something different," },
            { t: "normal", text: " not just fill a space." },
          ],
        },
        {
          body: [
            { t: "normal", text: "That's why every setup is treated selectively. " },
            { t: "italic-accent", text: "We don't replicate the same formula from one event to another," },
            { t: "normal", text: " but choose where and how Le Bureau appears, so it preserves its character and impact." },
          ],
        },
        {
          body: [
            { t: "normal", text: "If you want an element that's not accessible to everyone and that " },
            { t: "italic-accent", text: "elevates the perception of the entire event," },
            { t: "normal", text: " Le Bureau operates exactly in that register." },
          ],
          cta: { label: "Get a personalised offer" },
        },
      ],
    },
    {
      heading: "Choose the Experience for Your Event",
      subtitle: "Every event has its own rhythm and a unique story to tell. We've created several configurations to ensure that the Le Bureau atmosphere adapts perfectly to your scale and desires.",
      items: [
        {
          subtitle: "up to 80 guests",
          bullets: [
            "Smoked Whiskey Experience",
            "Vintage gramophone music",
            "Curated vintage ambiance",
            "Full setup included",
            "2 premium whiskey bottles & 4 selected wine bottles",
            "20 premium cigars",
            "Themed photo corner",
            "Dedicated waiter: 6 hours of service",
          ],
          cta: { label: "Request a quote" },
        },
        {
          subtitle: "up to 80 guests",
          bullets: [
            "Smoked Whiskey Experience",
            "Vintage gramophone music",
            "Curated vintage ambiance",
            "3 premium whiskey bottles & 5 selected wine bottles",
            "30 premium cigars",
            "Themed photo corner",
            "10 Polaroid photos",
            "Dedicated waiter",
            "Setup & takedown included",
          ],
          cta: { label: "Request a quote" },
        },
        {
          subtitle: "up to 80 guests",
          bullets: [
            "Smoked Whiskey Experience",
            "Vintage gramophone music",
            "Curated vintage ambiance",
            "4 premium whiskey bottles & 7 selected wine bottles",
            "35 premium cigars",
            "Themed photo corner",
            "15 Polaroid photos",
            "Cocktail bar with selected snacks",
            "Dedicated waiter + bartender",
            "Setup & takedown included",
          ],
          cta: { label: "Request a quote" },
        },
        {
          subtitle: "up to 80 guests",
          bullets: [
            "Smoked Whiskey Experience",
            "Vintage gramophone music",
            "Curated vintage ambiance",
            "5 premium whiskey bottles & 9 selected wine bottles",
            "40 premium cigars",
            "Themed photo corner",
            "20 Polaroid photos",
            "Cocktail bar with selected snacks",
            "Vintage typewriter — live experience",
            "Dedicated waiter + bartender",
            "Setup & takedown included",
          ],
          cta: { label: "Request a quote" },
        },
      ],
    },
    {
      heading: "From Idea",
      subheading: "to Real Presence",
      screens: [
        {
          body: [
            { t: "normal", text: "Everything begins with " },
            { t: "italic-accent", text: "the space and context of your event." },
            { t: "normal", text: " We analyze the venue, the guest flow, and the type of energy you want to create, to decide how and where Le Bureau integrates." },
          ],
        },
        {
          body: [
            { t: "normal", text: "Then " },
            { t: "italic-accent", text: "we build the experience in detail: " },
            { t: "normal", text: "the drink selection, the props, how the space is positioned, and how guests come to discover it. Nothing is left to chance." },
          ],
        },
        {
          body: [
            { t: "normal", text: "On the day of the event, everything is already set to work naturally." },
            { t: "italic-accent", text: " No explanations or forced guidance needed —" },
            { t: "normal", text: " guests enter the atmosphere intuitively, drawn in by the details and energy of the space." },
          ],
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
    tagline: "Сигарный лаундж в ретро-стиле с элегантной, вневременной атмосферой. Зрелое, сдержанное пространство, вдохновлённое классическими ритуалами и изысканностью ушедших эпох.",
  },
  sections: [
    {
      heading: "Концепция Le Bureau:",
      subheading: "Искусство Остановить Время",
      screens: [
        {
          body: [
            { t: "normal", text: "Le Bureau привносит атмосферу " },
            { t: "italic-accent", text: "частного клуба на ваше мероприятие." },
            { t: "normal", text: " Премиальные сигары, отборный виски, музыка с граммофона, печатная машинка, винтажная рулетка: каждая деталь подобрана для создания подлинного и незабываемого опыта." },
          ],
        },
        {
          body: [
            { t: "normal", text: "За дверью без номера ждёт Le Bureau. " },
            { t: "italic-accent", text: "Это не для всех." },
            { t: "normal", text: " И не для любого случая. Только для тех, кто умеет искать опыт за пределами привычного." },
          ],
        },
        {
          body: [
            { t: "normal", text: "Мы создаём живое пространство, где звук винила и аромат премиальных сигар задают особый ритм. Каждый предмет в нашем декоре подобран специально для стимулирования человеческого взаимодействия, " },
            { t: "italic-accent", text: "давая гостям возможность переживать настоящие моменты, " },
            { t: "normal", text: "вдали от шума и суеты повседневности." },
          ],
        },
        {
          body: [
            { t: "normal", text: "Свяжитесь с нами сегодня, чтобы забронировать опыт Le Bureau и " },
            { t: "italic-accent", text: "подарить вашим гостям ключ к вневременному убежищу, " },
            { t: "normal", text: "где роскошь ощущается в каждом жесте. Мы готовы открыть для вас дверь и превратить вашу идею в историю." },
          ],
          cta: { label: "Получить персональное предложение" },
        },
      ],
    },
    {
      heading: "Где Открываются Двери Le Bureau?",
      subtitle: "Наша концепция разработана так, чтобы органично вписываться в любой сценарий, требующий дополнительной изысканности, тайны и эксклюзивности. Мы превращаем уголок вашей площадки в настоящий роскошный лаундж.",
      items: [
        {
          heading: "Корпоративные Мероприятия и Запуски Продуктов",
          body: "Произведите впечатление на деловых партнёров, VIP-клиентов или управленческую команду. Le Bureau создаёт идеальную обстановку для нетворкинга высшего уровня, где важные переговоры ведутся сдержанно, за столом рулетки и бокалом коллекционного напитка.",
        },
        {
          heading: "Свадьбы и Элегантные Приёмы",
          body: "Подарите гостям незабываемый cigar & whiskey bar — уголок абсолютного уединения, вдали от шума танцевального зала, где можно отдохнуть в неспешной беседе под музыку граммофона и насладиться классическим опытом.",
        },
        {
          heading: "Приватные Вечеринки и Юбилеи",
          body: "Мечтаете о тематическом вечере в духе бурных 20-х, вечере эпохи сухого закона или просто об элитном собрании для близких? Мы привезём реквизит, напитки и атмосферу для легендарной ночи.",
        },
      ],
    },
    {
      heading: "Ритуалы, Задающие Тон",
      screens: [
        {
          body: [
            { t: "normal", text: "Le Bureau создан не для всех типов мероприятий и не для любого контекста. Он лучше всего раскрывается там, где есть намерение, где хозяин " },
            { t: "italic-accent", text: "хочет предложить гостям нечто особенное," },
            { t: "normal", text: " а не просто заполнить пространство." },
          ],
        },
        {
          body: [
            { t: "normal", text: "Именно поэтому каждый сетап рассматривается индивидуально. " },
            { t: "italic-accent", text: "Мы не копируем одну и ту же формулу от события к событию," },
            { t: "normal", text: " а выбираем, где и как появляется Le Bureau, чтобы сохранить его характер и воздействие." },
          ],
        },
        {
          body: [
            { t: "normal", text: "Если вы хотите элемент, недоступный всем, который " },
            { t: "italic-accent", text: "поднимет восприятие всего мероприятия," },
            { t: "normal", text: " Le Bureau работает именно в этом регистре." },
          ],
          cta: { label: "Получить персональное предложение" },
        },
      ],
    },
    {
      heading: "Выберите Опыт для Вашего Мероприятия",
      subtitle: "У каждого мероприятия свой ритм и уникальная история. Мы создали несколько конфигураций, чтобы атмосфера Le Bureau идеально адаптировалась к вашим масштабам и желаниям.",
      items: [
        {
          subtitle: "до 80 гостей",
          bullets: [
            "Smoked Whiskey Experience",
            "Музыка эпохи на граммофоне",
            "Кюрированная винтажная атмосфера",
            "Полная установка включена",
            "2 бутылки премиум виски & 4 бутылки отборного вина",
            "20 премиальных сигар",
            "Тематический фотоуголок",
            "Выделенный официант: 6 часов обслуживания",
          ],
          cta: { label: "Запросить предложение" },
        },
        {
          subtitle: "до 80 гостей",
          bullets: [
            "Smoked Whiskey Experience",
            "Музыка эпохи на граммофоне",
            "Кюрированная винтажная атмосфера",
            "3 бутылки премиум виски & 5 бутылок отборного вина",
            "30 премиальных сигар",
            "Тематический фотоуголок",
            "10 фотографий Polaroid",
            "Выделенный официант",
            "Установка и демонтаж включены",
          ],
          cta: { label: "Запросить предложение" },
        },
        {
          subtitle: "до 80 гостей",
          bullets: [
            "Smoked Whiskey Experience",
            "Музыка эпохи на граммофоне",
            "Кюрированная винтажная атмосфера",
            "4 бутылки премиум виски & 7 бутылок отборного вина",
            "35 премиальных сигар",
            "Тематический фотоуголок",
            "15 фотографий Polaroid",
            "Коктейльный бар с отборными закусками",
            "Выделенный официант + бармен",
            "Установка и демонтаж включены",
          ],
          cta: { label: "Запросить предложение" },
        },
        {
          subtitle: "до 80 гостей",
          bullets: [
            "Smoked Whiskey Experience",
            "Музыка эпохи на граммофоне",
            "Кюрированная винтажная атмосфера",
            "5 бутылок премиум виски & 9 бутылок отборного вина",
            "40 премиальных сигар",
            "Тематический фотоуголок",
            "20 фотографий Polaroid",
            "Коктейльный бар с отборными закусками",
            "Винтажная печатная машинка — живой опыт",
            "Выделенный официант + бармен",
            "Установка и демонтаж включены",
          ],
          cta: { label: "Запросить предложение" },
        },
      ],
    },
    {
      heading: "От Идеи",
      subheading: "к Реальному Присутствию",
      screens: [
        {
          body: [
            { t: "normal", text: "Всё начинается с " },
            { t: "italic-accent", text: "пространства и контекста вашего мероприятия." },
            { t: "normal", text: " Мы анализируем площадку, поток гостей и тип энергии, которую вы хотите создать, чтобы решить, как и где интегрируется Le Bureau." },
          ],
        },
        {
          body: [
            { t: "normal", text: "Затем " },
            { t: "italic-accent", text: "мы выстраиваем опыт в деталях: " },
            { t: "normal", text: "подбор напитков, тип реквизита, расположение пространства и то, как гости его обнаруживают. Ничего не оставляется на волю случая." },
          ],
        },
        {
          body: [
            { t: "normal", text: "В день мероприятия всё уже готово к естественной работе." },
            { t: "italic-accent", text: " Никаких объяснений или принудительного руководства —" },
            { t: "normal", text: " гости интуитивно входят в атмосферу, привлечённые деталями и энергией места." },
          ],
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

const lebureau: Record<string, ReturnType<typeof mergeVenueData>> = {
  ro: mergeVenueData(shared, ro),
  en: mergeVenueData(shared, en),
  ru: mergeVenueData(shared, ru),
};

export default lebureau;
