import type { VenuePageData } from "@/components/VenuePage/types";
import { contact_link } from "./constants/links";


const ro: VenuePageData = {
  name: "La Perle",
  logo: "/logos/LaPerle.svg",
  accentColor: "#64C8EA",

  hero: {
    video: "/videos/laperle-horizontal.mp4",
    tagline: "Gelato italian livrat cu stil",
  },

  sections: [
    {
      type: "video-scene",
      video: "/projectVideos/laPerle/scene-1.mp4",
      heading: "La Perle:",
      subheading: "O Bucurie Mică, Dar Memorabilă",
      screens: [
        {
          body: [
            { t: "normal", text: "La Perle aduce la evenimentul tău un tuktuk cu gelato italian, într-o formă care atrage imediat atenția și creează bună dispoziție. Este un concept simplu în aparență, dar foarte expresiv," },
            { t: "italic-accent", text: "construit să aducă zâmbete" },
            { t: "normal", text: " și să dea spațiului o energie caldă și prietenoasă." },
          ],
          textPosition: "left",
        },
        {
          body: [
            { t: "normal", text: "Vibe-ul este mai relaxat și mai luminos, cu o " },
            { t: "italic-accent", text: "estetică pastelată care trimite subtil la copilărie când totul părea mai ușor și mai plăcut. " },
            { t: "normal", text: " Nu încearcă să impresioneze prin solemnitate, ci prin farmec, naturalețe și o formă foarte curată de bucurie." },
          ],
          textPosition: "right",
        },
        {
          body: [
            { t: "normal", text: "Tuktuk-ul devine rapid un punct de interes, dar și un " },
            { t: "italic-accent", text: "pretext bun pentru interacțiune." },
            { t: "normal", text: " Oamenii se apropie, se opresc, aleg, zâmbesc, povestesc. În jurul lui se creează exact tipul de atmosferă care" },
            { t: "italic-accent", text: "face un eveniment să pară mai viu și mai prietenos." },
          ],
          textPosition: "left",
        },
        {
          body: [
            { t: "normal", text: "Pentru  " },
            { t: "italic-accent", text: "momente care au nevoie de o notă lejeră," },
            { t: "normal", text: " caldă și memorabilă, La Perle aduce un accent vizual și emoțional care rămâne în minte mult după ce evenimentul s-a terminat." },
          ],
          textPosition: "center",
          cta: { label: "Primește o ofertă personalizată", href: contact_link },
        },
      ],
    },
    {
      type: "features",
      heading: "Unde Ajunge La Perle?",
      subtitle: "Conceptul nostru se potrivește în contexte în care evenimentul are nevoie de un accent relaxat, luminos și prietenos. La Perle aduce energie bună, creează apropiere și completează atmosfera cu un detaliu care se simte imediat.",
      items: [
        {
          image: "/projectFeatures/laPerle/feature-1.png",
          imageAlt: "Feature 1 La Perle",
          heading: "Nunți & Recepții de Zi",
          body: "Pentru evenimentele în aer liber sau pentru recepțiile care vor să păstreze o notă caldă și veselă, La Perle aduce un moment ușor, elegant și foarte plăcut pentru invitați.",
        },
        {
          image: "/projectFeatures/laPerle/feature-2.png",
          imageAlt: "Feature 2 La Perle",
          heading: "Evenimente Private & Petreceri de Vară",
          body: "În contextul unor întâlniri mai relaxate, La Perle aduce exact acel detaliu care face atmosfera mai prietenoasă și mai liberă. Este genul de prezență care se potrivește firesc cu o seară bună, oameni buni și un ritm fără grabă.",
        },
        {
          image: "/projectFeatures/laPerle/feature-3.png",
          imageAlt: "Feature 3 La Perle",
          heading: "Evenimente de Brand & Activări",
          body: "Când vrei ca un public să își amintească un moment prin emoție și atmosferă, La Perle funcționează foarte bine ca punct de atracție vizuală și experiențială. Este ușor de integrat și foarte ușor de remarcat.",
        },
      ],
    },
    {
      type: "video-scene",
      video: "/projectVideos/laPerle/scene-2.mp4",
      heading: "Un Vibe Care Se Simte",
      subheading: "Din Prima Clipă",
      accentColor: "#FFAA61",
      screens: [
        {
          body: [
            { t: "normal", text: "La Perle are această calitate rară de a " },
            { t: "italic-accent", text: "schimba instant energia din jur. " },
            { t: "normal", text: "Nu are nevoie de introducere lungă și nici de un context complicat. Apare, și oamenii simt imediat că se întâmplă ceva bun, calm și plăcut." },
          ],
          textPosition: "left",
        },
        {
          body: [
            { t: "normal", text: "Culorile, forma tuktuk-ului, felul în care e integrat în spațiu și asocierea cu " },
            { t: "italic-accent", text: "gelato-ul italian creează împreună un cadru care pare desprins dintr-o amintire frumoasă. " },
            { t: "normal", text: "Totul este prietenos și ușor de iubit." },
          ],
          textPosition: "right",
        },
        {
          body: [
            { t: "normal", text: "Asta face ca La Perle să funcționeze foarte bine atât în evenimente mari, cât și în contexte mai intime. Nu depinde de dimensiune, ci de atmosferă. Oriunde apare, " },
            { t: "italic-accent", text: "aduce un plus de căldură și un ritm mai senin." }
          ],
          textPosition: "left",
        },
        {
          body: [
            { t: "normal", text: "Este acel tip de detaliu care nu domină evenimentul, dar îl face mai bun,  " },
            { t: "italic-accent", text: "mai viu și mult mai memorabil " },
            { t: "normal", text: "pentru toți ce sunt prezenți." },
          ],
          textPosition: "center",
          cta: { label: "Primește o ofertă personalizată", href: contact_link },
        },
      ],
    },
    {
      type: "packages",
      heading: "Alege Ritmul Potrivit Evenimentului Tău",
      subtitle: "Fiecare eveniment are propria energie, iar La Perle se adaptează firesc la ea. Am creat mai multe configurații, de la un moment discret la o prezență mai amplă, gândită să adune oamenii în jurul experienței.",
      items: [
        {
          name: "Piccola",
          subtitle: "până la 80 de persoane",
          bullets: ["gelato italian", "tuktuk setup", "prezentare simplă și elegantă", "2 arome", "vibe pastelat și relaxant"],
          price: "750 €",
          accentColor: "#A30912",
          cta: { label: "Solicită ofertă", href: contact_link },
        },
        {
          name: "Dolce",
          subtitle: "până la 80 de persoane",
          bullets: ["gelato italian", "tuktuk setup", "prezentare elegantă", "3 arome", "servire pentru invitați", "decor delicat, cu aer jucăuș"],
          price: "950 €",
          accentColor: "#1B5A38",
          cta: { label: "Solicită ofertă", href: contact_link },
        },
        {
          name: "La Sera",
          subtitle: "până la 80 de persoane",
          bullets: ["gelato italian", "tuktuk setup", "prezentare elegantă", "4 arome", "servire pentru invitați", "decor delicat, cu aer jucăuș", "elemente vizuale", "atmosferă mai amplă"],
          price: "1 350 €",
          accentColor: "#16447D",
          cta: { label: "Solicită ofertă", href: contact_link },
        },
        {
          name: "Perla",
          subtitle: "până la 80 de persoane",
          bullets: ["gelato italian", "tuktuk setup", "prezentare elegantă", "5 arome", "servire pentru invitați", "decor delicat, cu aer jucăuș", "elemente vizuale", "personalizare pentru eveniment", "experiență completă"],
          price: "1 980 €",
          accentColor: "#522B73",
          cta: { label: "Solicită ofertă", href: contact_link },
        },
      ],
    },
    {
      type: "gallery",
      heading: "Evenimente Precedente",
      images: [
        { src: "/projectGallery/laPerle/image-1.png", alt: "Image Gallery 1" },
        { src: "/projectGallery/laPerle/image-2.png", alt: "Image Gallery 2" },
        { src: "/projectGallery/laPerle/image-3.png", alt: "Image Gallery 3" },
        { src: "/projectGallery/laPerle/image-4.png", alt: "Image Gallery 4" },
        { src: "/projectGallery/laPerle/image-5.png", alt: "Image Gallery 5" },
        { src: "/projectGallery/laPerle/image-6.png", alt: "Image Gallery 6" },
        { src: "/projectGallery/laPerle/image-7.png", alt: "Image Gallery 7" },
        { src: "/projectGallery/laPerle/image-8.png", alt: "Image Gallery 8" },
        { src: "/projectGallery/laPerle/image-9.png", alt: "Image Gallery 9" },
        { src: "/projectGallery/laPerle/image-10.png", alt: "Image Gallery 10" },
        { src: "/projectGallery/laPerle/image-11.png", alt: "Image Gallery 11" },
        { src: "/projectGallery/laPerle/image-12.png", alt: "Image Gallery 12" },
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
  name: "La Perle",
  logo: "/logos/LaPerle.svg",
  accentColor: "#64C8EA",

  hero: {
    video: "/videos/laperle-horizontal.mp4",
    tagline: "Italian gelato delivered with style",
  },

  sections: [
    {
      type: "video-scene",
      video: "/projectVideos/laPerle/scene-1.mp4",
      heading: "La Perle:",
      subheading: "A Small Joy, But a Memorable One",
      screens: [
        {
          body: [
            { t: "normal", text: "La Perle brings a tuktuk with Italian gelato to your event — in a form that immediately catches the eye and creates a great mood. It's a concept that appears simple, but is deeply expressive," },
            { t: "italic-accent", text: " built to bring smiles" },
            { t: "normal", text: " and give the space a warm, friendly energy." },
          ],
          textPosition: "left",
        },
        {
          body: [
            { t: "normal", text: "The vibe is relaxed and bright, with a " },
            { t: "italic-accent", text: "pastel aesthetic that subtly recalls childhood — when everything felt lighter and more enjoyable. " },
            { t: "normal", text: "It doesn't try to impress through solemnity, but through charm, naturalness, and a very pure form of joy." },
          ],
          textPosition: "right",
        },
        {
          body: [
            { t: "normal", text: "The tuktuk quickly becomes a point of interest and a " },
            { t: "italic-accent", text: "great excuse for interaction." },
            { t: "normal", text: " People approach, pause, choose, smile, and chat. Around it forms exactly the kind of atmosphere that" },
            { t: "italic-accent", text: " makes an event feel more alive and friendly." },
          ],
          textPosition: "left",
        },
        {
          body: [
            { t: "normal", text: "For " },
            { t: "italic-accent", text: "moments that need a light touch," },
            { t: "normal", text: " warm and memorable, La Perle brings a visual and emotional accent that stays in the mind long after the event is over." },
          ],
          textPosition: "center",
          cta: { label: "Get a personalised offer", href: contact_link },
        },
      ],
    },
    {
      type: "features",
      heading: "Where Does La Perle Go?",
      subtitle: "Our concept fits contexts where the event needs a relaxed, bright, and friendly accent. La Perle brings good energy, creates connection, and completes the atmosphere with a detail that's felt immediately.",
      items: [
        {
          image: "/projectFeatures/laPerle/feature-1.png",
          imageAlt: "Feature 1 La Perle",
          heading: "Weddings & Daytime Receptions",
          body: "For outdoor events or receptions that want to keep a warm and cheerful note, La Perle brings a light, elegant, and very enjoyable moment for guests.",
        },
        {
          image: "/projectFeatures/laPerle/feature-2.png",
          imageAlt: "Feature 2 La Perle",
          heading: "Private Events & Summer Parties",
          body: "In more relaxed gatherings, La Perle brings exactly that detail that makes the atmosphere friendlier and freer. It's the kind of presence that naturally fits a good evening, good people, and an unhurried pace.",
        },
        {
          image: "/projectFeatures/laPerle/feature-3.png",
          imageAlt: "Feature 3 La Perle",
          heading: "Brand Events & Activations",
          body: "When you want an audience to remember a moment through emotion and atmosphere, La Perle works very well as a visual and experiential attraction point. It's easy to integrate and very easy to notice.",
        },
      ],
    },
    {
      type: "video-scene",
      video: "/projectVideos/laPerle/scene-2.mp4",
      heading: "A Vibe You Can Feel",
      subheading: "From the Very First Moment",
      accentColor: "#FFAA61",
      screens: [
        {
          body: [
            { t: "normal", text: "La Perle has this rare quality of " },
            { t: "italic-accent", text: "instantly shifting the energy around it. " },
            { t: "normal", text: "It needs no long introduction or complicated context. It arrives, and people immediately sense that something good, calm, and pleasant is happening." },
          ],
          textPosition: "left",
        },
        {
          body: [
            { t: "normal", text: "The colours, the shape of the tuktuk, the way it's integrated into the space, and the association with " },
            { t: "italic-accent", text: "Italian gelato together create a setting that feels lifted from a beautiful memory. " },
            { t: "normal", text: "Everything is friendly and easy to love." },
          ],
          textPosition: "right",
        },
        {
          body: [
            { t: "normal", text: "This is what makes La Perle work equally well at large events and in more intimate contexts. It doesn't depend on scale, but on atmosphere. Wherever it appears, " },
            { t: "italic-accent", text: "it brings extra warmth and a calmer rhythm." },
          ],
          textPosition: "left",
        },
        {
          body: [
            { t: "normal", text: "It's the kind of detail that doesn't dominate the event, but makes it better — " },
            { t: "italic-accent", text: "more alive and far more memorable " },
            { t: "normal", text: "for everyone present." },
          ],
          textPosition: "center",
          cta: { label: "Get a personalised offer", href: contact_link },
        },
      ],
    },
    {
      type: "packages",
      heading: "Choose the Rhythm That Fits Your Event",
      subtitle: "Every event has its own energy, and La Perle naturally adapts to it. We've created several configurations, from a discreet moment to a fuller presence designed to bring people together around the experience.",
      items: [
        {
          name: "Piccola",
          subtitle: "up to 80 guests",
          bullets: ["Italian gelato", "tuktuk setup", "simple and elegant presentation", "2 flavours", "pastel and relaxing vibe"],
          price: "750 €",
          accentColor: "#A30912",
          cta: { label: "Request a quote", href: contact_link },
        },
        {
          name: "Dolce",
          subtitle: "up to 80 guests",
          bullets: ["Italian gelato", "tuktuk setup", "elegant presentation", "3 flavours", "guest service", "delicate decor with a playful feel"],
          price: "950 €",
          accentColor: "#1B5A38",
          cta: { label: "Request a quote", href: contact_link },
        },
        {
          name: "La Sera",
          subtitle: "up to 80 guests",
          bullets: ["Italian gelato", "tuktuk setup", "elegant presentation", "4 flavours", "guest service", "delicate decor with a playful feel", "visual elements", "fuller atmosphere"],
          price: "1 350 €",
          accentColor: "#16447D",
          cta: { label: "Request a quote", href: contact_link },
        },
        {
          name: "Perla",
          subtitle: "up to 80 guests",
          bullets: ["Italian gelato", "tuktuk setup", "elegant presentation", "5 flavours", "guest service", "delicate decor with a playful feel", "visual elements", "event personalisation", "complete experience"],
          price: "1 980 €",
          accentColor: "#522B73",
          cta: { label: "Request a quote", href: contact_link },
        },
      ],
    },
    {
      type: "gallery",
      heading: "Past Events",
      images: [
        { src: "/projectGallery/laPerle/image-1.png", alt: "Image Gallery 1" },
        { src: "/projectGallery/laPerle/image-2.png", alt: "Image Gallery 2" },
        { src: "/projectGallery/laPerle/image-3.png", alt: "Image Gallery 3" },
        { src: "/projectGallery/laPerle/image-4.png", alt: "Image Gallery 4" },
        { src: "/projectGallery/laPerle/image-5.png", alt: "Image Gallery 5" },
        { src: "/projectGallery/laPerle/image-6.png", alt: "Image Gallery 6" },
        { src: "/projectGallery/laPerle/image-7.png", alt: "Image Gallery 7" },
        { src: "/projectGallery/laPerle/image-8.png", alt: "Image Gallery 8" },
        { src: "/projectGallery/laPerle/image-9.png", alt: "Image Gallery 9" },
        { src: "/projectGallery/laPerle/image-10.png", alt: "Image Gallery 10" },
        { src: "/projectGallery/laPerle/image-11.png", alt: "Image Gallery 11" },
        { src: "/projectGallery/laPerle/image-12.png", alt: "Image Gallery 12" },
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
  name: "La Perle",
  logo: "/logos/LaPerle.svg",
  accentColor: "#64C8EA",

  hero: {
    video: "/videos/laperle-horizontal.mp4",
    tagline: "Итальянское джелато, доставленное со стилем",
  },

  sections: [
    {
      type: "video-scene",
      video: "/projectVideos/laPerle/scene-1.mp4",
      heading: "La Perle:",
      subheading: "Маленькая Радость, Но Незабываемая",
      screens: [
        {
          body: [
            { t: "normal", text: "La Perle привозит на ваше мероприятие тук-тук с итальянским джелато — в форме, которая мгновенно привлекает внимание и создаёт прекрасное настроение. Концепция выглядит простой, но очень выразительна —" },
            { t: "italic-accent", text: " она создана, чтобы дарить улыбки" },
            { t: "normal", text: " и наполнять пространство тёплой, дружелюбной энергией." },
          ],
          textPosition: "left",
        },
        {
          body: [
            { t: "normal", text: "Атмосфера расслабленная и светлая, с " },
            { t: "italic-accent", text: "пастельной эстетикой, которая тонко напоминает детство — когда всё казалось легче и приятнее. " },
            { t: "normal", text: "Она не стремится впечатлить торжественностью, а берёт обаянием, естественностью и очень чистой формой радости." },
          ],
          textPosition: "right",
        },
        {
          body: [
            { t: "normal", text: "Тук-тук быстро становится точкой притяжения и " },
            { t: "italic-accent", text: "отличным поводом для общения." },
            { t: "normal", text: " Люди подходят, останавливаются, выбирают, улыбаются, разговаривают. Вокруг него складывается именно та атмосфера, которая" },
            { t: "italic-accent", text: " делает мероприятие более живым и дружелюбным." },
          ],
          textPosition: "left",
        },
        {
          body: [
            { t: "normal", text: "Для " },
            { t: "italic-accent", text: "моментов, которым нужна лёгкая нота," },
            { t: "normal", text: " тёплая и запоминающаяся, La Perle привносит визуальный и эмоциональный акцент, который остаётся в памяти ещё долго после окончания мероприятия." },
          ],
          textPosition: "center",
          cta: { label: "Получить персональное предложение", href: contact_link },
        },
      ],
    },
    {
      type: "features",
      heading: "Куда Приезжает La Perle?",
      subtitle: "Наша концепция подходит для контекстов, где мероприятию нужен расслабленный, светлый и дружелюбный акцент. La Perle несёт хорошую энергию, создаёт близость и дополняет атмосферу деталью, которая ощущается сразу.",
      items: [
        {
          image: "/projectFeatures/laPerle/feature-1.png",
          imageAlt: "Feature 1 La Perle",
          heading: "Свадьбы и Дневные Приёмы",
          body: "Для мероприятий на открытом воздухе или приёмов, желающих сохранить тёплую и весёлую ноту, La Perle привносит лёгкий, элегантный и очень приятный для гостей момент.",
        },
        {
          image: "/projectFeatures/laPerle/feature-2.png",
          imageAlt: "Feature 2 La Perle",
          heading: "Приватные Мероприятия и Летние Вечеринки",
          body: "На более непринуждённых встречах La Perle привносит именно ту деталь, которая делает атмосферу дружелюбнее и свободнее. Это присутствие, которое естественно вписывается в хороший вечер, хороших людей и неспешный ритм.",
        },
        {
          image: "/projectFeatures/laPerle/feature-3.png",
          imageAlt: "Feature 3 La Perle",
          heading: "Брендовые Мероприятия и Активации",
          body: "Когда вы хотите, чтобы аудитория запомнила момент через эмоции и атмосферу, La Perle отлично работает как точка визуального и опытного притяжения. Легко интегрируется и очень легко замечается.",
        },
      ],
    },
    {
      type: "video-scene",
      video: "/projectVideos/laPerle/scene-2.mp4",
      heading: "Атмосфера, Которую Ощущаешь",
      subheading: "С Первого Момента",
      accentColor: "#FFAA61",
      screens: [
        {
          body: [
            { t: "normal", text: "У La Perle есть это редкое качество — " },
            { t: "italic-accent", text: "мгновенно менять энергию вокруг. " },
            { t: "normal", text: "Ей не нужно долгое вступление или сложный контекст. Она появляется, и люди сразу чувствуют: происходит что-то хорошее, спокойное и приятное." },
          ],
          textPosition: "left",
        },
        {
          body: [
            { t: "normal", text: "Цвета, форма тук-тука, способ интеграции в пространство и ассоциация с " },
            { t: "italic-accent", text: "итальянским джелато вместе создают атмосферу, словно пришедшую из красивого воспоминания. " },
            { t: "normal", text: "Всё дружелюбно и легко полюбить." },
          ],
          textPosition: "right",
        },
        {
          body: [
            { t: "normal", text: "Именно поэтому La Perle одинаково хорошо работает как на больших мероприятиях, так и в более камерных контекстах. Всё зависит не от масштаба, а от атмосферы. Где бы она ни появилась, " },
            { t: "italic-accent", text: "она привносит дополнительное тепло и более спокойный ритм." },
          ],
          textPosition: "left",
        },
        {
          body: [
            { t: "normal", text: "Это та деталь, которая не доминирует на мероприятии, но делает его лучше — " },
            { t: "italic-accent", text: "более живым и гораздо более запоминающимся " },
            { t: "normal", text: "для всех присутствующих." },
          ],
          textPosition: "center",
          cta: { label: "Получить персональное предложение", href: contact_link },
        },
      ],
    },
    {
      type: "packages",
      heading: "Выберите Ритм, Подходящий Вашему Мероприятию",
      subtitle: "У каждого мероприятия своя энергия, и La Perle естественно к ней адаптируется. Мы создали несколько конфигураций — от сдержанного момента до более широкого присутствия, призванного собрать людей вокруг опыта.",
      items: [
        {
          name: "Piccola",
          subtitle: "до 80 гостей",
          bullets: ["итальянское джелато", "установка тук-тука", "простая и элегантная подача", "2 вкуса", "пастельная и расслабляющая атмосфера"],
          price: "750 €",
          accentColor: "#A30912",
          cta: { label: "Запросить предложение", href: contact_link },
        },
        {
          name: "Dolce",
          subtitle: "до 80 гостей",
          bullets: ["итальянское джелато", "установка тук-тука", "элегантная подача", "3 вкуса", "обслуживание гостей", "деликатный декор с игривым настроением"],
          price: "950 €",
          accentColor: "#1B5A38",
          cta: { label: "Запросить предложение", href: contact_link },
        },
        {
          name: "La Sera",
          subtitle: "до 80 гостей",
          bullets: ["итальянское джелато", "установка тук-тука", "элегантная подача", "4 вкуса", "обслуживание гостей", "деликатный декор с игривым настроением", "визуальные элементы", "расширенная атмосфера"],
          price: "1 350 €",
          accentColor: "#16447D",
          cta: { label: "Запросить предложение", href: contact_link },
        },
        {
          name: "Perla",
          subtitle: "до 80 гостей",
          bullets: ["итальянское джелато", "установка тук-тука", "элегантная подача", "5 вкусов", "обслуживание гостей", "деликатный декор с игривым настроением", "визуальные элементы", "персонализация мероприятия", "полный опыт"],
          price: "1 980 €",
          accentColor: "#522B73",
          cta: { label: "Запросить предложение", href: contact_link },
        },
      ],
    },
    {
      type: "gallery",
      heading: "Предыдущие Мероприятия",
      images: [
        { src: "/projectGallery/laPerle/image-1.png", alt: "Image Gallery 1" },
        { src: "/projectGallery/laPerle/image-2.png", alt: "Image Gallery 2" },
        { src: "/projectGallery/laPerle/image-3.png", alt: "Image Gallery 3" },
        { src: "/projectGallery/laPerle/image-4.png", alt: "Image Gallery 4" },
        { src: "/projectGallery/laPerle/image-5.png", alt: "Image Gallery 5" },
        { src: "/projectGallery/laPerle/image-6.png", alt: "Image Gallery 6" },
        { src: "/projectGallery/laPerle/image-7.png", alt: "Image Gallery 7" },
        { src: "/projectGallery/laPerle/image-8.png", alt: "Image Gallery 8" },
        { src: "/projectGallery/laPerle/image-9.png", alt: "Image Gallery 9" },
        { src: "/projectGallery/laPerle/image-10.png", alt: "Image Gallery 10" },
        { src: "/projectGallery/laPerle/image-11.png", alt: "Image Gallery 11" },
        { src: "/projectGallery/laPerle/image-12.png", alt: "Image Gallery 12" },
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

const laperle: Record<string, VenuePageData> = { ro, en, ru };

export default laperle;
