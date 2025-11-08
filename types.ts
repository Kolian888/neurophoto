export type ShotType = "portrait" | "half" | "full";
export type CameraAngle = 'front' | 'three_quarters' | 'profile' | 'top' | 'low';
export type StyleLevel = 'realistic' | 'cinematic' | 'magazine';

export interface Preset {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
}

export type StudioSource = "preset" | "generate" | "reference";
export type LookSource = "preset" | "generate" | "reference";

export interface StudioSelection {
  source: StudioSource;
  value: string; // preset id, prompt, or reference URL
  details: {
    light: "мягкий" | "жёсткий";
    lens: 35 | 50 | 85;
    palette: "тёплая" | "нейтральная" | "холодная";
  };
  generatedImageUrl?: string;
}

export interface LookSelection {
  source: LookSource;
  value: string; // preset id, prompt, or reference URL
}

export interface FinalImage {
  id: number;
  url: string;
  metadata: {
    lens: number;
    shot_type: string;
    light_setup: string;
    camera_angle: CameraAngle;
    pose: string;
    style_level: StyleLevel;
  };
}

export interface FinalOutput {
  images: FinalImage[];
  session_metadata: {
    user_photo_url: string;
    studio: StudioSelection;
    looks: LookSelection[];
    diversity: {
      lenses: number[];
      shot_types: string[];
      light: string[];
    };
  };
  publishing_kit: {
    post_ideas: string[];
    hashtags: string[];
  };
}

export interface Scenario {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  studioSelection: Omit<StudioSelection, 'generatedImageUrl'>;
  lookSelections: LookSelection[];
}

export interface StudioHistoryItem {
  source: StudioSource;
  value: string; // preset id, prompt, or reference URL
  imageUrl: string; // The image to display in the history view
  name: string; // A display name for the history item
  generatedImageUrl?: string; // Only for 'generate' source
}