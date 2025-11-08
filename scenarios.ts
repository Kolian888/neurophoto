import type { Scenario } from './types';

export const SCENARIOS: Scenario[] = [
  {
    id: 'business-headshot',
    name: 'Деловой портрет',
    description: 'Классические студийные фото для резюме, LinkedIn или корпоративного сайта.',
    imageUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&h=300&fit=crop',
    studioSelection: {
      source: 'preset',
      value: 'studio:moody_rembrandt',
      details: {
        light: 'мягкий',
        lens: 85,
        palette: 'нейтральная',
      },
    },
    lookSelections: [
      { source: 'preset', value: 'look:classic_suit_black' },
      { source: 'preset', value: 'look:turtleneck_dark' },
    ],
  },
  {
    id: 'social-media-content',
    name: 'Контент для соцсетей',
    description: 'Яркие и стильные образы, которые привлекут внимание в вашей ленте.',
    imageUrl: 'https://images.unsplash.com/photo-1512310604669-443f26c35f52?w=400&h=300&fit=crop',
    studioSelection: {
      source: 'preset',
      value: 'studio:neon_purple_blue',
      details: {
        light: 'жёсткий',
        lens: 35,
        palette: 'холодная',
      },
    },
    lookSelections: [
      { source: 'preset', value: 'look:streetwear_monochrome' },
      { source: 'preset', value: 'look:editorial_all_white' },
    ],
  },
  {
    id: 'creative-editorial',
    name: 'Креативный editorial',
    description: 'Журнальная эстетика для смелых экспериментов со стилем и самовыражением.',
    imageUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=300&fit=crop',
    studioSelection: {
      source: 'preset',
      value: 'studio:beige_editorial',
      details: {
        light: 'мягкий',
        lens: 50,
        palette: 'тёплая',
      },
    },
    lookSelections: [
        { source: 'preset', value: 'look:editorial_all_white' },
        { source: 'generate', value: 'avant-garde clothing with unusual shapes and textures' },
    ],
  },
];