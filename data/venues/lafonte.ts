import type { VenueLocaleText, VenueShared } from "@/components/VenuePage/types";
import { contact_link } from "./constants/links";
import { mergeVenueData } from "./utils/mergeVenueData";

const shared: VenueShared = {
  name: "La Fonte",
  logo: "/logos/LaFonte.svg",
  accentColor: "#C4973F",
  hero: {
    video: "/videos/lafonte-horizontal.mp4",
    videoMobile: "/videos/lafonte-vertical.mp4",
  },
  sections: [
    {
      type: "video-scene",
      video: "/projectVideos/laFonte/scene-1.mp4",
      videoMobile: "/projectVideos/laFonte/scene-1.mp4",
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
        { image: "/projectFeatures/laFonte/733039d6-1495-429e-a3b1-81d07d03cb88.JPG", imageAlt: "Weddings & elegant receptions" },
        { image: "/projectFeatures/laFonte/d8a7fdfb-aa33-447b-94df-2060202cc188.JPG", imageAlt: "Private events & parties" },
        { image: "/projectFeatures/laFonte/ee46fb08-38cd-47eb-88fb-cc6a2058b778.JPG", imageAlt: "Corporate events & activations" },
      ],
    },
    {
      type: "video-scene",
      video: "/projectVideos/laFonte/scene-2.mp4",
      videoMobile: "/projectVideos/laFonte/scene-2.mp4",
      accentColor: "#9B6B2E",
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
        { name: "Goccia", price: "750€", accentColor: "#6B4226", cta: { href: contact_link } },
        { name: "Velours", price: "950€", accentColor: "#A30912", cta: { href: contact_link } },
        { name: "Cascade", price: "1350€", accentColor: "#1B5A38", cta: { href: contact_link } },
        { name: "Prestige", price: "2000€", accentColor: "#16447D", cta: { href: contact_link } },
      ],
    },
    {
      type: "gallery",
      images: [
        { src: "/projectGallery/laFonte/5808589b-3cb7-4e13-bd5f-6b871b2529a6.JPG", alt: "La Fonte event 1" },
        { src: "/projectGallery/laFonte/730432be-0da4-4fee-8532-4d2b6c9d4953.png", alt: "La Fonte event 2" },
        { src: "/projectGallery/laFonte/733039d6-1495-429e-a3b1-81d07d03cb88.JPG", alt: "La Fonte event 3" },
        { src: "/projectGallery/laFonte/d8a7fdfb-aa33-447b-94df-2060202cc188.JPG", alt: "La Fonte event 4" },
        { src: "/projectGallery/laFonte/e98fc798-1ddf-49a6-9800-583a7a0d2da0.JPG", alt: "La Fonte event 5" },
        { src: "/projectGallery/laFonte/ee46fb08-38cd-47eb-88fb-cc6a2058b778.JPG", alt: "La Fonte event 6" },
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
    tagline:
      "Fântână de ciocolată belgiană, fructe proaspete și topping-uri atent alese, într-un concept creat să transforme orice eveniment într-o experiență dulce, elegantă și memorabilă.",
  },
  sections: [
    {
      heading: "La Fonte:",
      subheading: "Dulcele Care Adună Oamenii Împreună",
      screens: [
        {
          body: [
            { t: "normal", text: "La Fonte aduce la evenimentul tău mai mult decât o simplă fântână de ciocolată. Creează un moment care atrage oamenii natural, îi apropie și transformă atmosfera într-una mai caldă și mai relaxată." },
            { t: "italic-accent", text: "Totul este construit în jurul unei experiențe elegante și autentice." },
          ],
        },
        {
          body: [
            { t: "normal", text: "Ciocolata belgiană curge continuu, iar combinația dintre fructele proaspete, marshmallow-urile și topping-urile atent alese transformă fiecare servire într-un mic ritual dulce." },
            { t: "italic-accent", text: "Este acel tip de experiență care îi face pe invitați să zâmbească și să se bucure sincer de moment." },
          ],
        },
        {
          body: [
            { t: "normal", text: "La Fonte devine rapid unul dintre cele mai apreciate colțuri ale evenimentului." },
            { t: "italic-accent", text: "În jurul lui se creează conversații, interacțiuni și o atmosferă care face evenimentul să pară mai viu și mai memorabil." },
          ],
        },
        {
          body: [
            { t: "normal", text: "Pentru evenimente care au nevoie de un accent dulce, rafinat și spectaculos, La Fonte aduce o experiență care rămâne în mintea invitaților mult timp după finalul serii." },
          ],
          cta: { label: "Primește o ofertă personalizată" },
        },
      ],
    },
    {
      heading: "Unde Se Potrivește La Fonte?",
      subtitle:
        "Conceptul nostru completează perfect evenimentele care își doresc un moment elegant, interactiv și memorabil. La Fonte aduce un plus de atmosferă și transformă desertul într-o experiență în sine.",
      items: [
        {
          heading: "Nunți & Recepții Elegante",
          body: "La Fonte adaugă un moment spectaculos și rafinat care completează perfect atmosfera unei nunți. Este acel detaliu dulce care atrage invitații natural și creează amintiri frumoase în jurul experienței.",
        },
        {
          heading: "Evenimente Private & Petreceri",
          body: "Fie că este vorba despre aniversări, petreceri private sau seri speciale între prieteni, La Fonte aduce un vibe relaxat și elegant, în jurul căruia oamenii se adună firesc.",
        },
        {
          heading: "Evenimente Corporate & Activări",
          body: "Pentru branduri și evenimente corporate, La Fonte funcționează excelent ca punct de atracție vizuală și experiențială. Este elegant, ușor de remarcat și creează instant interacțiune cu invitații.",
        },
      ],
    },
    {
      heading: "O Experiență Care Se Simte",
      subheading: "Din Prima Clipă",
      screens: [
        {
          body: [
            { t: "normal", text: "La Fonte are acel tip de prezență care schimbă imediat energia spațiului." },
            { t: "italic-accent", text: "Fântâna de ciocolată atrage privirile instant, iar aroma dulce și prezentarea elegantă creează o atmosferă caldă și primitoare." },
          ],
        },
        {
          body: [
            { t: "normal", text: "Totul este gândit pentru experiență — de la felul în care curge ciocolata, până la selecția de fructe și topping-uri." },
            { t: "italic-accent", text: "Împreună creează un moment simplu, dar cu o impresie puternică." },
          ],
        },
        {
          body: [
            { t: "normal", text: "La Fonte funcționează perfect atât în evenimente mari, cât și în contexte mai intime." },
            { t: "italic-accent", text: "Nu depinde de dimensiunea locației, ci de emoția pe care o creează în jurul experienței." },
          ],
        },
        {
          body: [
            { t: "normal", text: "Este acel tip de detaliu care nu doar completează evenimentul, ci îl face mai elegant, mai cald și mult mai memorabil pentru toți cei prezenți." },
          ],
          cta: { label: "Primește o ofertă personalizată" },
        },
      ],
    },
    {
      heading: "Alege Experiența Potrivită Evenimentului Tău",
      subtitle:
        "Fiecare eveniment are propria atmosferă, iar La Fonte se adaptează natural fiecărui context. Am creat mai multe configurații, de la setup-uri elegante și discrete până la experiențe complete, gândite să impresioneze invitații.",
      items: [
        {
          subtitle: "până la 50 de persoane",
          bullets: [
            "fântână de ciocolată belgiană",
            "fructe proaspete",
            "topping-uri clasice",
            "setup elegant",
            "prezentare minimalistă și rafinată",
          ],
          cta: { label: "Solicită ofertă" },
        },
        {
          subtitle: "până la 80 de persoane",
          bullets: [
            "fântână de ciocolată belgiană",
            "selecție variată de fructe",
            "marshmallow & biscuiți",
            "topping-uri premium",
            "servire elegantă pentru invitați",
            "decor modern și prietenos",
          ],
          cta: { label: "Solicită ofertă" },
        },
        {
          subtitle: "până la 120 de persoane",
          bullets: [
            "fântână de ciocolată belgiană",
            "selecție completă de topping-uri",
            "fructe premium",
            "elemente decorative",
            "servire pentru invitați",
            "atmosferă spectaculoasă",
            "experiență interactivă completă",
          ],
          cta: { label: "Solicită ofertă" },
        },
        {
          subtitle: "până la 120 de persoane",
          bullets: [
            "fântână premium de ciocolată",
            "personalizare pentru eveniment",
            "setup extins și elegant",
            "fructe & topping-uri premium",
            "servire dedicată",
            "decor adaptat conceptului evenimentului",
            "atmosferă memorabilă",
            "experiență completă La Fonte",
          ],
          cta: { label: "Solicită ofertă" },
        },
      ],
    },
    {
      heading: "Evenimente Precedente",
    },
    {
      body: [
        { t: "normal", text: "Fiecare eveniment lasă în urmă momente dulci care nu se uită ușor. Următorul poate fi al tău." },
      ],
      cta: { label: "Primește o ofertă personalizată" },
    },
  ],
};

const en: VenueLocaleText = {
  hero: {
    tagline:
      "Belgian chocolate fountain, fresh fruit and carefully chosen toppings — a concept created to transform any event into a sweet, elegant, and memorable experience.",
  },
  sections: [
    {
      heading: "La Fonte:",
      subheading: "The Sweetness That Brings People Together",
      screens: [
        {
          body: [
            { t: "normal", text: "La Fonte brings more than just a chocolate fountain to your event. It creates a moment that naturally draws people in, brings them closer, and transforms the atmosphere into something warmer and more relaxed." },
            { t: "italic-accent", text: "Everything is built around an elegant and authentic experience." },
          ],
        },
        {
          body: [
            { t: "normal", text: "Belgian chocolate flows continuously, and the combination of fresh fruit, marshmallows, and carefully chosen toppings transforms every serving into a small sweet ritual." },
            { t: "italic-accent", text: "It's the kind of experience that makes guests smile and genuinely enjoy the moment." },
          ],
        },
        {
          body: [
            { t: "normal", text: "La Fonte quickly becomes one of the most appreciated corners of the event." },
            { t: "italic-accent", text: "Around it, conversations form, interactions happen, and an atmosphere emerges that makes the event feel more alive and more memorable." },
          ],
        },
        {
          body: [
            { t: "normal", text: "For events that need a sweet, refined, and spectacular accent, La Fonte brings an experience that stays in guests' minds long after the evening ends." },
          ],
          cta: { label: "Get a personalised offer" },
        },
      ],
    },
    {
      heading: "Where Does La Fonte Fit?",
      subtitle:
        "Our concept perfectly complements events that desire an elegant, interactive, and memorable moment. La Fonte adds atmosphere and transforms dessert into an experience in itself.",
      items: [
        {
          heading: "Weddings & Elegant Receptions",
          body: "La Fonte adds a spectacular and refined moment that perfectly complements the atmosphere of a wedding. It's that sweet detail that naturally draws guests in and creates beautiful memories around the experience.",
        },
        {
          heading: "Private Events & Parties",
          body: "Whether it's anniversaries, private parties, or special evenings with friends, La Fonte brings a relaxed and elegant vibe that people naturally gather around.",
        },
        {
          heading: "Corporate Events & Activations",
          body: "For brands and corporate events, La Fonte works excellently as a visual and experiential attraction point. It's elegant, easy to notice, and instantly creates interaction with guests.",
        },
      ],
    },
    {
      heading: "An Experience You Can Feel",
      subheading: "From the Very First Moment",
      screens: [
        {
          body: [
            { t: "normal", text: "La Fonte has the kind of presence that immediately shifts the energy of a space." },
            { t: "italic-accent", text: "The chocolate fountain draws eyes instantly, and the sweet aroma and elegant presentation create a warm and welcoming atmosphere." },
          ],
        },
        {
          body: [
            { t: "normal", text: "Everything is designed for experience — from the way the chocolate flows, to the selection of fruits and toppings." },
            { t: "italic-accent", text: "Together they create a simple moment, but with a powerful impression." },
          ],
        },
        {
          body: [
            { t: "normal", text: "La Fonte works perfectly both at large events and in more intimate contexts." },
            { t: "italic-accent", text: "It doesn't depend on the size of the venue, but on the emotion it creates around the experience." },
          ],
        },
        {
          body: [
            { t: "normal", text: "It's the kind of detail that not only completes the event, but makes it more elegant, warmer and far more memorable for everyone present." },
          ],
          cta: { label: "Get a personalised offer" },
        },
      ],
    },
    {
      heading: "Choose the Experience That Fits Your Event",
      subtitle:
        "Every event has its own atmosphere, and La Fonte naturally adapts to every context. We've created several configurations, from elegant and discreet setups to complete experiences designed to impress guests.",
      items: [
        {
          subtitle: "up to 50 guests",
          bullets: [
            "Belgian chocolate fountain",
            "fresh fruit",
            "classic toppings",
            "elegant setup",
            "minimalist and refined presentation",
          ],
          cta: { label: "Request a quote" },
        },
        {
          subtitle: "up to 80 guests",
          bullets: [
            "Belgian chocolate fountain",
            "varied fruit selection",
            "marshmallows & biscuits",
            "premium toppings",
            "elegant guest service",
            "modern and welcoming decor",
          ],
          cta: { label: "Request a quote" },
        },
        {
          subtitle: "up to 120 guests",
          bullets: [
            "Belgian chocolate fountain",
            "complete topping selection",
            "premium fruit",
            "decorative elements",
            "guest service",
            "spectacular atmosphere",
            "complete interactive experience",
          ],
          cta: { label: "Request a quote" },
        },
        {
          subtitle: "up to 120 guests",
          bullets: [
            "premium chocolate fountain",
            "event personalisation",
            "extended and elegant setup",
            "premium fruit & toppings",
            "dedicated service",
            "decor adapted to the event concept",
            "memorable atmosphere",
            "complete La Fonte experience",
          ],
          cta: { label: "Request a quote" },
        },
      ],
    },
    {
      heading: "Past Events",
    },
    {
      body: [
        { t: "normal", text: "Every event leaves behind sweet moments that aren't easily forgotten. The next one can be yours." },
      ],
      cta: { label: "Get a personalised offer" },
    },
  ],
};

const ru: VenueLocaleText = {
  hero: {
    tagline:
      "Бельгийский шоколадный фонтан, свежие фрукты и тщательно подобранные топпинги — концепция, созданная, чтобы превратить любое мероприятие в сладкий, элегантный и незабываемый опыт.",
  },
  sections: [
    {
      heading: "La Fonte:",
      subheading: "Сладость, Которая Объединяет Людей",
      screens: [
        {
          body: [
            { t: "normal", text: "La Fonte привносит на ваше мероприятие нечто большее, чем просто шоколадный фонтан. Это момент, который естественно притягивает людей, сближает их и превращает атмосферу в более тёплую и расслабленную." },
            { t: "italic-accent", text: "Всё построено вокруг элегантного и аутентичного опыта." },
          ],
        },
        {
          body: [
            { t: "normal", text: "Бельгийский шоколад течёт непрерывно, а сочетание свежих фруктов, маршмеллоу и тщательно подобранных топпингов превращает каждую порцию в маленький сладкий ритуал." },
            { t: "italic-accent", text: "Это тот вид опыта, который заставляет гостей улыбаться и искренне наслаждаться моментом." },
          ],
        },
        {
          body: [
            { t: "normal", text: "La Fonte быстро становится одним из самых ценимых уголков мероприятия." },
            { t: "italic-accent", text: "Вокруг него возникают разговоры, взаимодействия и атмосфера, которая делает мероприятие более живым и запоминающимся." },
          ],
        },
        {
          body: [
            { t: "normal", text: "Для мероприятий, которым нужен сладкий, утончённый и эффектный акцент, La Fonte создаёт опыт, который остаётся в памяти гостей ещё долго после окончания вечера." },
          ],
          cta: { label: "Получить персональное предложение" },
        },
      ],
    },
    {
      heading: "Где Подходит La Fonte?",
      subtitle:
        "Наша концепция идеально дополняет мероприятия, которые хотят элегантного, интерактивного и запоминающегося момента. La Fonte добавляет атмосферу и превращает десерт в самостоятельный опыт.",
      items: [
        {
          heading: "Свадьбы и Элегантные Приёмы",
          body: "La Fonte добавляет эффектный и утончённый момент, который идеально дополняет атмосферу свадьбы. Это та сладкая деталь, которая естественно привлекает гостей и создаёт красивые воспоминания вокруг опыта.",
        },
        {
          heading: "Приватные Мероприятия и Вечеринки",
          body: "Будь то юбилеи, приватные вечеринки или особые вечера с друзьями, La Fonte создаёт расслабленную и элегантную атмосферу, вокруг которой люди собираются естественным образом.",
        },
        {
          heading: "Корпоративные Мероприятия и Активации",
          body: "Для брендов и корпоративных мероприятий La Fonte отлично работает как точка визуального и опытного притяжения. Она элегантна, легко заметна и мгновенно создаёт взаимодействие с гостями.",
        },
      ],
    },
    {
      heading: "Опыт, Который Ощущается",
      subheading: "С Первого Момента",
      screens: [
        {
          body: [
            { t: "normal", text: "La Fonte обладает тем видом присутствия, который немедленно меняет энергию пространства." },
            { t: "italic-accent", text: "Шоколадный фонтан мгновенно привлекает взгляды, а сладкий аромат и элегантная подача создают тёплую и гостеприимную атмосферу." },
          ],
        },
        {
          body: [
            { t: "normal", text: "Всё продумано ради опыта — от того, как течёт шоколад, до подбора фруктов и топпингов." },
            { t: "italic-accent", text: "Вместе они создают простой момент, но с сильным впечатлением." },
          ],
        },
        {
          body: [
            { t: "normal", text: "La Fonte прекрасно работает как на больших мероприятиях, так и в более интимных контекстах." },
            { t: "italic-accent", text: "Всё зависит не от размера площадки, а от эмоции, которую она создаёт вокруг опыта." },
          ],
        },
        {
          body: [
            { t: "normal", text: "Это та деталь, которая не просто дополняет мероприятие, но делает его более элегантным, тёплым и гораздо более запоминающимся для всех присутствующих." },
          ],
          cta: { label: "Получить персональное предложение" },
        },
      ],
    },
    {
      heading: "Выберите Опыт, Подходящий Вашему Мероприятию",
      subtitle:
        "У каждого мероприятия своя атмосфера, и La Fonte естественно адаптируется к любому контексту. Мы создали несколько конфигураций — от элегантных и ненавязчивых до полноценных опытов, призванных произвести впечатление на гостей.",
      items: [
        {
          subtitle: "до 50 гостей",
          bullets: [
            "бельгийский шоколадный фонтан",
            "свежие фрукты",
            "классические топпинги",
            "элегантная установка",
            "минималистичная и утончённая подача",
          ],
          cta: { label: "Запросить предложение" },
        },
        {
          subtitle: "до 80 гостей",
          bullets: [
            "бельгийский шоколадный фонтан",
            "разнообразный выбор фруктов",
            "маршмеллоу и печенье",
            "премиальные топпинги",
            "элегантное обслуживание гостей",
            "современный и уютный декор",
          ],
          cta: { label: "Запросить предложение" },
        },
        {
          subtitle: "до 120 гостей",
          bullets: [
            "бельгийский шоколадный фонтан",
            "полный выбор топпингов",
            "премиальные фрукты",
            "декоративные элементы",
            "обслуживание гостей",
            "эффектная атмосфера",
            "полный интерактивный опыт",
          ],
          cta: { label: "Запросить предложение" },
        },
        {
          subtitle: "до 120 гостей",
          bullets: [
            "премиальный шоколадный фонтан",
            "персонализация для мероприятия",
            "расширенная и элегантная установка",
            "премиальные фрукты и топпинги",
            "специализированное обслуживание",
            "декор, адаптированный к концепции мероприятия",
            "незабываемая атмосфера",
            "полный опыт La Fonte",
          ],
          cta: { label: "Запросить предложение" },
        },
      ],
    },
    {
      heading: "Предыдущие Мероприятия",
    },
    {
      body: [
        { t: "normal", text: "Каждое мероприятие оставляет после себя сладкие моменты, которые нелегко забыть. Следующим может стать ваше." },
      ],
      cta: { label: "Получить персональное предложение" },
    },
  ],
};

const lafonte: Record<string, ReturnType<typeof mergeVenueData>> = {
  ro: mergeVenueData(shared, ro),
  en: mergeVenueData(shared, en),
  ru: mergeVenueData(shared, ru),
};

export default lafonte;
