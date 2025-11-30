export interface Track {
    id: string;
    title: string;
    artist: string;
    platformUrl?: string;
    moodTags: string[];
    usageTags: string[];
    notes: string;
    favorite: boolean;
    usedCount: number;
    lastUsedAt?: string; // ISO string
    createdAt: string; // ISO string
}

export type TrackFormData = Omit<Track, 'id' | 'usedCount' | 'lastUsedAt' | 'createdAt'>;
