import { Preset } from './types';

export const STUDIO_PRESETS: Preset[] = [
  { id: "studio:white_cyclorama_soft", name: "Белая циклорама", description: "Мягкий свет, чистый фон", imageUrl: "https://images.unsplash.com/photo-1619891823426-90f73f277a28?w=400&h=300&fit=crop" },
  { id: "studio:moody_rembrandt", name: "Moody Rembrandt", description: "Тёмный фон, рембрандтовский свет", imageUrl: "https://images.unsplash.com/photo-1579952516518-6c21a4fa8f6b?w=400&h=300&fit=crop" },
  { id: "studio:beige_editorial", name: "Бежевый editorial", description: "Журнальная эстетика", imageUrl: "https://images.unsplash.com/photo-1594013589154-0aa8a7c2936a?w=400&h=300&fit=crop" },
  { id: "studio:loft_concrete", name: "Лофт бетон", description: "Дневной рассеянный свет", imageUrl: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400&h=300&fit=crop" },
  { id: "studio:neon_purple_blue", name: "Неон", description: "Фиолетово-синий неон, дым", imageUrl: "https://images.unsplash.com/photo-1581333100699-9a07a163d01a?w=400&h=300&fit=crop" },
  { id: "studio:fashion_color_paper", name: "Цветной фон", description: "Яркий бумажный фон", imageUrl: "https://images.unsplash.com/photo-1612015842845-fafb39c00b21?w=400&h=300&fit=crop" },
];

export const LOOK_PRESETS: Preset[] = [
  { id: "look:classic_suit_black", name: "Чёрный костюм", description: "Оверсайз, белая рубашка, лоферы", imageUrl: "https://images.unsplash.com/photo-1617137968427-85924c800a22?w=400&h=300&fit=crop" },
  { id: "look:smart_casual_beige", name: "Smart-casual", description: "Бежевый кардиган, светлые брюки", imageUrl: "https://images.unsplash.com/photo-1552504462-0e6e4a83313e?w=400&h=300&fit=crop" },
  { id: "look:streetwear_monochrome", name: "Streetwear", description: "Монохром, худи, карго", imageUrl: "https://images.unsplash.com/photo-1576995853123-5a1d3b4d4b1b?w=400&h=300&fit=crop" },
  { id: "look:editorial_all_white", name: "Total white", description: "Объёмные формы, всё белое", imageUrl: "https://images.unsplash.com/photo-1543725528-2d0a02a0a24c?w=400&h=300&fit=crop" },
  { id: "look:turtleneck_dark", name: "Тёмная водолазка", description: "Минимализм, пиджак", imageUrl: "https://images.unsplash.com/photo-1614031633594-58079a2b53f6?w=400&h=300&fit=crop" },
  { id: "look:festive_black_tie", name: "Black tie", description: "Смокинг, бабочка", imageUrl: "https://images.unsplash.com/photo-1508341591423-4347094e13ab?w=400&h=300&fit=crop" },
];

export const PROFESSIONAL_POSES: string[] = [
  // --- Позы стоя ---
  "уверенно стоит, скрестив руки на груди, смотрит в камеру",
  "непринужденно прислонился к нейтральной стене, легкая улыбка",
  "стоит, засунув руки в карманы, выглядит расслабленным и доступным",
  "одна рука в кармане, другая расслаблена сбоку, уверенный вид",
  "слегка наклонился вперед над столом или перилами, руки сцеплены",
  "стоит с планшетом или блокнотом, выглядит вовлеченным",
  "кадр в полный рост, стоит прямо, выглядит сильным и прямым",

  // --- Позы сидя ---
  "сидит в современном кресле, в три четверти к камере",
  "задумчивая поза с рукой, опирающейся на подбородок",
  "сидит на стуле, слегка наклонившись вперед, вовлечен и слушает",
  "сидит за столом, в середине фразы, жестикулирует одной рукой",
  "расслабленно сидит в удобном кресле, скрестив ноги, задумчивый вид",
  "откинулся на спинку стула с руками за головой, выглядит креативным и расслабленным",

  // --- Динамичные позы ---
  "идет к камере с ощущением динамики",
  "смотрит через плечо на камеру",
  "поправляет запонку или часы, поза, ориентированная на детали",
  "в шаге, запечатлен во время ходьбы по современному коридору",
  "надевает или поправляет пиджак, классический кадр 'сборов'",
  "взаимодействует с объектом в окружении, например, берет книгу",

  // --- Портретные позы ---
  "классический хедшот, смотрит прямо в камеру с дружелюбным выражением",
  "искренний смех, смотрит немного в сторону от камеры",
  "естественно держит реквизит, такой как планшет или чашка кофе",
  "классический портрет с легким наклоном головы, создающий ощущение любопытства",
  "смотрит в сторону от камеры с задумчивым или визионерским выражением",
  "искренняя, теплая улыбка, смотрит прямо в объектив",
  "более серьезное, напряженное выражение для драматического хедшота",
];