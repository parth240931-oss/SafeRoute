
export type TravelMode = 'walking' | 'transit' | 'driving' | 'metro';

export interface Location {
  lat: number;
  lng: number;
  address?: string;
}

export interface RouteOption {
  id: string;
  name: string;
  distance: string;
  duration: string;
  comfortScore: number;
  comfortBreakdown: {
    safety: number;
    lighting: number;
    crowd: number;
    accessibility: number;
  };
  tags: string[];
  landmarks: string[];
  type: 'Safest' | 'Balanced' | 'Fastest';
}

export interface UserProfile {
  name: string;
  gender: 'woman' | 'man' | 'other' | 'prefer-not-to-say';
  mobilityNeeds: boolean;
  sheNavEnabled: boolean;
  safetyPriority: number; // 0 to 100
  emergencyContacts: string[]; // Up to 4
}

export interface CommunityTip {
  id: string;
  user: string;
  text: string;
  category: 'safety' | 'accessibility' | 'navigation' | 'parking';
  upvotes: number;
  location: string;
  timestamp: string;
}

export interface SafetyAlert {
  id: string;
  type: 'harassment' | 'hazard' | 'police' | 'closure';
  message: string;
  timeAgo: string;
  distance: string;
}

export interface SheNavCompanion {
  id: string;
  name: string;
  status: 'walking' | 'driving';
  progress: number; // 0 to 100
  distance: string;
}
