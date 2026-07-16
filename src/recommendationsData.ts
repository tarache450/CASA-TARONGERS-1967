export interface Recommendation {
  id: string;
  title: {
    ca: string;
    es: string;
    en: string;
  };
  subtitle: {
    ca: string;
    es: string;
    en: string;
  };
  distance: {
    ca: string;
    es: string;
    en: string;
  };
  duration: {
    ca: string;
    es: string;
    en: string;
  };
  bestTime: {
    ca: string;
    es: string;
    en: string;
  };
  description: {
    ca: string;
    es: string;
    en: string;
  };
  extraInfo: {
    ca: string;
    es: string;
    en: string;
  };
  tips: {
    ca: string[];
    es: string[];
    en: string[];
  };
  category: {
    ca: string;
    es: string;
    en: string;
  };
  image: string;
}

export const RECOMMENDATIONS: Recommendation[] = [
  {
    id: 'gelida-castle',
    title: {
      ca: 'Castell de Gelida',
      es: 'Castillo de Gelida',
      en: 'Gelida Castle'
    },
    subtitle: {
      ca: 'Un viatge a l\'època medieval del Penedès',
      es: 'Un viaje a la época medieval del Penedès',
      en: 'A journey to the medieval era of Penedès'
    },
    distance: {
      ca: '5 min en cotxe o 25 min caminant',
      es: '5 min en coche o 25 min caminando',
      en: '5 min by car or 25 min walking'
    },
    duration: {
      ca: '1 - 2 hores',
      es: '1 - 2 horas',
      en: '1 - 2 hours'
    },
    bestTime: {
      ca: 'Capvespre (vistes daurades de la vall)',
      es: 'Atardecer (vistas doradas del valle)',
      en: 'Sunset (golden views of the valley)'
    },
    category: {
      ca: 'Història i Cultura',
      es: 'Historia y Cultura',
      en: 'History & Culture'
    },
    image: '/src/assets/images/activity_gelida_castle_1784213853819.jpg',
    description: {
      ca: 'El Castell de Gelida és un castell medieval documentat des de l\'any 945 que s\'alça majestuosament sobre un espadat rocós controlant el pas de la vall. Ofereix una de les vistes panoràmiques més espectaculars de l\'Alt Penedès i de la silueta retallada de la muntanya de Montserrat.',
      es: 'El Castillo de Gelida es un castillo medieval documentado desde el año 945 que se alza majestuosamente sobre un acantilado rocoso controlando el paso del valle. Ofrece una de las vistas panorámicas más espectaculares del Alt Penedès y de la silueta recortada de la montaña de Montserrat.',
      en: 'Gelida Castle is a medieval castle documented since 945 AD that stands majestically on a rocky cliff controlling the valley pass. It offers some of the most spectacular panoramic views of the Alt Penedès and the jagged silhouette of the Montserrat mountain.'
    },
    extraInfo: {
      ca: 'El recinte fortificat conté l\'Església de Sant Pere del Castell, d\'origen preromànic del segle X, modificada posteriorment amb elements gòtics. Al voltant del castell es poden apreciar tombes antropomorfes excavades directament a la roca sorrenca, testimoni dels primers enterraments de la zona.',
      es: 'El recinto fortificado alberga la Iglesia de San Pedro del Castillo, de origen prerrománico del siglo X, modificada posteriormente con elementos góticos. Alrededor del castillo se pueden apreciar tumbas antropomorfas excavadas directamente en la roca arenisca, testimonio de los primeros enterramientos de la zona.',
      en: 'The fortified complex contains the Church of Saint Peter of the Castle, of pre-Romanesque origin from the 10th century, later modified with Gothic elements. Around the castle ruins, you can appreciate anthropomorphic tombs carved directly into the sandstone rock, testimony to the first burials in the area.'
    },
    tips: {
      ca: [
        'S\'hi pot accedir a peu seguint un sender ben senyalitzat des de la mateixa casa.',
        'El Centre d\'Interpretació ofereix visites guiades molt recomanables els caps de setmana.',
        'Porta calçat còmode ja que el camí és de pedra i té forts desnivells.'
      ],
      es: [
        'Se puede acceder a pie siguiendo un sendero bien señalizado desde la propia casa.',
        'El Centro de Interpretación ofrece visitas guiadas muy recomendables los fines de semana.',
        'Lleva calzado cómodo ya que el camino es empedrado y tiene fuertes desnivellos.'
      ],
      en: [
        'It can be accessed on foot by following a well-signposted trail directly from the house.',
        'The Interpretation Center offers highly recommended guided tours on weekends.',
        'Wear comfortable footwear as the path is cobbled and has steep slopes.'
      ]
    }
  },
  {
    id: 'cava-wineries',
    title: {
      ca: 'Cellers de Cava i Vi',
      es: 'Bodegas de Cava y Vino',
      en: 'Cava & Wine Wineries'
    },
    subtitle: {
      ca: 'El bressol dels millors escumosos del món',
      es: 'La cuna de los mejores espumosos del mundo',
      en: 'The cradle of the best sparkling wines in the world'
    },
    distance: {
      ca: 'A pocs minuts (Sant Sadurní d\'Anoia a 10 min)',
      es: 'A pocos minutos (Sant Sadurní d\'Anoia a 10 min)',
      en: 'Just a few minutes away (Sant Sadurní d\'Anoia 10 min)'
    },
    duration: {
      ca: '2 - 4 hores (segons visita)',
      es: '2 - 4 horas (según visita)',
      en: '2 - 4 hours (depending on visit)'
    },
    bestTime: {
      ca: 'Matí (ideal per a tasts i visites guiades)',
      es: 'Mañana (ideal para catas y visitas guiadas)',
      en: 'Morning (ideal for tastings and guided tours)'
    },
    category: {
      ca: 'Enoturisme i Gastronomia',
      es: 'Enoturismo y Gastronomía',
      en: 'Enotourism & Gastronomy'
    },
    image: '/src/assets/images/activity_cava_wineries_1784213869706.jpg',
    description: {
      ca: 'Gelida i la veïna capital del cava Sant Sadurní d\'Anoia configuren el cor històric de la D.O. Cava. La comarca allotja cellers familiars de producció biodinàmica de primeríssim nivell, així com grans catedrals modernistes del vi dissenyades per arquitectes com Josep Puig i Cadafalch.',
      es: 'Gelida y la vecina capital del cava, Sant Sadurní d\'Anoia, configuran el corazón histórico de la D.O. Cava. La comarca alberga bodegas familiares de producción biodinámica de primerísimo nivel, así como grandes catedrales modernistas del vino diseñadas por arquitectos como Josep Puig i Cadafalch.',
      en: 'Gelida and the neighboring cava capital, Sant Sadurní d\'Anoia, form the historical heart of the D.O. Cava. The region houses world-class biodynamic family-owned wineries, as well as grand modernist "cathedrals of wine" designed by architects like Josep Puig i Cadafalch.'
    },
    extraInfo: {
      ca: 'Recomanem especialment visitar petits productors d\'alta gamma que elaboren caves de llarga criança sota el segell Corpinnat (com Recaredo o Gramona), on podràs caminar entre vinyes centenàries, aprendre sobre el degollament manual de les ampolles i fer un tast íntim d\'escumosos d\'autor excel·lents.',
      es: 'Recomendamos especialmente visitar pequeños productores de alta gama que elaboran cavas de larga crianza bajo el sello Corpinnat (como Recaredo o Gramona), donde podrás caminar entre viñedos centenarios, aprender sobre el degüelle manual de las botellas y realizar una cata íntima de espumosos de autor excelentes.',
      en: 'We especially recommend visiting small, high-end producers crafting long-aged sparkling wines under the Corpinnat guild (like Recaredo or Gramona), where you can walk through century-old vineyards, learn about manual disgorgement, and enjoy an intimate tasting of outstanding artisan wines.'
    },
    tips: {
      ca: [
        'Reserva la teva visita amb un mínim de 3-4 dies d\'antelació, especialment per als caps de setmana.',
        'Molts cellers ofereixen rutes en bicicleta elèctrica o pícnics privats entre les vinyes.',
        'No et perdis l\'oportunitat de provar el Cava Gran Reserva combinat amb la cuina local.'
      ],
      es: [
        'Reserva tu visita con un mínimo de 3-4 días de antelación, especialmente para los fines de semana.',
        'Muchas bodegas ofrecen rutas en bicicleta eléctrica o pícnics privados entre los viñedos.',
        'No te pierdas la oportunidad de probar el Cava Gran Reserva maridado con la cocina local.'
      ],
      en: [
        'Book your tour at least 3-4 days in advance, especially for weekend visits.',
        'Many wineries offer electric bicycle routes or private picnics in the middle of the vineyards.',
        'Do not miss the opportunity to try a Cava Gran Reserva paired with local gastronomy.'
      ]
    }
  },
  {
    id: 'montserrat',
    title: {
      ca: 'Montserrat',
      es: 'Montserrat',
      en: 'Montserrat'
    },
    subtitle: {
      ca: 'La muntanya màgica i espiritual de Catalunya',
      es: 'La montaña mágica y espiritual de Cataluña',
      en: 'The magic and spiritual mountain of Catalonia'
    },
    distance: {
      ca: '25 minuts en cotxe',
      es: '25 minutos en coche',
      en: '25 minutes by car'
    },
    duration: {
      ca: 'Mitja jornada o jornada completa',
      es: 'Media jornada o jornada completa',
      en: 'Half day or full day'
    },
    bestTime: {
      ca: 'Primera hora del matí (per evitar cues i aglomeracions)',
      es: 'Primera hora de la mañana (para evitar colas y aglomeraciones)',
      en: 'Early morning (to avoid lines and crowds)'
    },
    category: {
      ca: 'Natura i Espiritualitat',
      es: 'Naturaleza y Espiritualidad',
      en: 'Nature & Spirituality'
    },
    image: '/src/assets/images/activity_montserrat_1784213884983.jpg',
    description: {
      ca: 'Montserrat és un massís muntanyós únic al món per les seves formes arrodonides i capritxoses de conglomerat, esculpides pel vent i l\'aigua durant milions d\'anys. Allotja el Santuari de la Mare de Déu de Montserrat i el monestir benedictí homònim, lloc de pelegrinatge i símbol d\'identitat catalana.',
      es: 'Montserrat es un macizo montañoso único en el mundo por sus formas redondeadas y caprichosas de conglomerado, esculpidas por el viento y el agua durante millones de años. Alberga el Santuario de la Virgen de Montserrat y el monasterio benedictino homónimo, lugar de peregrinación y símbolo de identidad catalana.',
      en: 'Montserrat is a mountain range unique in the world due to its rounded and whimsical conglomerate rock shapes, sculpted by wind and water over millions of years. It houses the Shrine of the Virgin of Montserrat and the namesake Benedictine monastery, a historical pilgrimage site and symbol of Catalan identity.'
    },
    extraInfo: {
      ca: 'Dins el monestir podràs venerar "La Moreneta", una talla romànica de la Mare de Déu del segle XII de color fosc, i escoltar l\'Escolania de Montserrat, un dels cors de nens cantors més antics d\'Europa. Per als amants de l\'esport, el Parc Natural ofereix rutes de senderisme i vies d\'escalada excepcionals.',
      es: 'Dentro del monasterio podrás venerar a "La Moreneta", una talla románica de la Virgen del siglo XII de color oscuro, y escuchar a la Escolanía de Montserrat, uno de los coros de niños cantores más antiguos de Europa. Para los amantes del deporte, el Parque Natural ofrece rutas de senderismo y vías de escalada excepcionales.',
      en: 'Inside the monastery, you can venerate "La Moreneta" (The Black Madonna), a 12th-century Romanesque wooden statue, and listen to the Escolania de Montserrat, one of the oldest boys\' choirs in Europe. For outdoor enthusiasts, the Natural Park offers exceptional hiking trails and world-renowned climbing walls.'
    },
    tips: {
      ca: [
        'Pots agafar el cèlebre Cremallera o l\'Aeri de Montserrat per pujar a la muntanya gaudint de vistes de vertigen.',
        'Comprova els horaris de l\'Escolania abans de la teva visita si vols escoltar el cant del Virolai.',
        'La caminada cap a Sant Jeroni (el cim més alt) ofereix vistes increïbles que arriben fins als Pirineus.'
      ],
      es: [
        'Puedes tomar el célebre tren Cremallera o el Aéreo de Montserrat para subir a la montaña disfrutando de vistas de vértigo.',
        'Comprueba los horarios de la Escolanía antes de tu visita si deseas escuchar el canto del Virolai.',
        'La caminata hacia Sant Jeroni (el pico más alto) ofrece vistas increíbles que alcanzan hasta los Pirineos.'
      ],
      en: [
        'You can take the famous rack railway (Cremallera) or the cable car (Aeri) to ascend the mountain enjoying dizzying views.',
        'Check the Escolania performance schedules before your visit if you want to listen to the Virolai hymn.',
        'The hike up to Sant Jeroni (the highest peak) offers breathtaking views reaching all the way to the Pyrenees.'
      ]
    }
  },
  {
    id: 'sitges',
    title: {
      ca: 'Sitges i Platges',
      es: 'Sitges y Playas',
      en: 'Sitges & Beaches'
    },
    subtitle: {
      ca: 'L\'encant mariner, la llum mediterrània i la cultura',
      es: 'El encanto marinero, la luz mediterránea y la cultura',
      en: 'Maritime charm, Mediterranean light, and culture'
    },
    distance: {
      ca: '35 minuts en cotxe',
      es: '35 minutos en coche',
      en: '35 minutes by car'
    },
    duration: {
      ca: 'Mig dia o jornada completa',
      es: 'Medio día o jornada completa',
      en: 'Half day or full day'
    },
    bestTime: {
      ca: 'Tarda i vespre (passeig marítim i sopars de marisc)',
      es: 'Tarde y noche (paseo marítimo y cenas de marisco)',
      en: 'Afternoon and evening (seaside promenade and seafood dining)'
    },
    category: {
      ca: 'Mar i Estil de Vida',
      es: 'Mar y Estilo de Vida',
      en: 'Sea & Lifestyle'
    },
    image: '/src/assets/images/activity_sitges_1784213899770.jpg',
    description: {
      ca: 'Sitges és una bonica vila costanera famosa per la seva llum enlluernadora, els seus carrers estrets plens de flors, la seva herència artística de l\'època del Modernisme i les seves platges urbanes de sorra fina i aigües tranquil·les de la Costa del Garraf.',
      es: 'Sitges es una hermosa villa costera famosa por su luz deslumbrante, sus calles estrechas llenas de flores, su herencia artística de la época del Modernismo y sus playas urbanas de arena fina y aguas tranquilas de la Costa del Garraf.',
      en: 'Sitges is a beautiful coastal town famous for its dazzling light, narrow flower-lined streets, its artistic heritage from the Modernist era, and its urban fine sand beaches with calm waters along the Garraf Coast.'
    },
    extraInfo: {
      ca: 'A més de gaudir del mar, recomanem passejar fins a l\'icònica Església de Sant Bartomeu i Santa Tecla que s\'alça sobre l\'aigua, visitar el Palau Maricel amb la seva impressionant col·lecció d\'art i el Cau Ferrat (antiga llar-taller del pintor Santiago Rusiñol), autèntic temple del Modernisme català.',
      es: 'Además de disfrutar del mar, recomendamos pasear hasta la icónica Iglesia de San Bartolomé y Santa Tecla que se yergue sobre el agua, visitar el Palacio Maricel con su impresionante colección de arte y el Cau Ferrat (antiguo hogar-taller del pintor Santiago Rusiñol), auténtico templo del Modernismo catalán.',
      en: 'In addition to enjoying the sea, we recommend walking to the iconic Church of Sant Bartomeu i Santa Tecla standing directly over the water, visiting Maricel Palace with its outstanding art collection, and Cau Ferrat (the former home-studio of painter Santiago Rusiñol), an authentic temple of Catalan Modernism.'
    },
    tips: {
      ca: [
        'Dina un "Arròs a la Sitgetana" o peix fresc del dia a la zona del Port d\'Aiguadolç.',
        'La platja de Sant Sebastià és una de les platges urbanes amb més ambient i més boniques d\'Europa.',
        'Pots combinar la visita amb una copa de vi Malvasia de Sitges dolç tradicional en una terrassa davant del mar.'
      ],
      es: [
        'Prueba un "Arroz a la Sitgetana" o pescado fresco del día en la zona del Puerto de Aiguadolç.',
        'La playa de San Sebastián es una de las playas urbanas con más encanto y más bonitas de Europa.',
        'Puedes combinar la visita con una copa de vino dulce Malvasía de Sitges tradicional en una terraza frente al mar.'
      ],
      en: [
        'Try an "Arròs a la Sitgetana" (local rice dish) or fresh catch of the day at the Aiguadolç Marina area.',
        'San Sebastián beach is one of the most charming and scenic urban beaches in Europe.',
        'You can pair your visit with a glass of traditional sweet Malvasia de Sitges wine on a seaside terrace.'
      ]
    }
  }
];
