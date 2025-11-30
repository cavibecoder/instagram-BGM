import type { Track, TrackFormData } from '../types';

const STORAGE_KEY = 'instagram_bgm_tracks';

export const getTracks = (): Track[] => {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
};

export const saveTrack = (trackData: TrackFormData, id?: string): Track => {
    const tracks = getTracks();
    let newTrack: Track;

    if (id) {
        // Update existing
        const index = tracks.findIndex((t) => t.id === id);
        if (index === -1) throw new Error('Track not found');

        newTrack = {
            ...tracks[index],
            ...trackData,
        };
        tracks[index] = newTrack;
    } else {
        // Create new
        newTrack = {
            ...trackData,
            id: Math.random().toString(36).substring(2) + Date.now().toString(36),
            usedCount: 0,
            createdAt: new Date().toISOString(),
        };
        tracks.push(newTrack);
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(tracks));
    return newTrack;
};

export const deleteTrack = (id: string): void => {
    const tracks = getTracks();
    const filtered = tracks.filter((t) => t.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
};

export const markAsUsed = (id: string): Track => {
    const tracks = getTracks();
    const index = tracks.findIndex((t) => t.id === id);
    if (index === -1) throw new Error('Track not found');

    const track = tracks[index];
    const updatedTrack = {
        ...track,
        usedCount: track.usedCount + 1,
        lastUsedAt: new Date().toISOString(),
    };
    tracks[index] = updatedTrack;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tracks));
    return updatedTrack;
};

export const getRecommendation = (): Track | null => {
    const tracks = getTracks();
    if (tracks.length === 0) return null;

    // 1. Filter out tracks used in the last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const candidates = tracks.filter(t => {
        if (!t.lastUsedAt) return true;
        return new Date(t.lastUsedAt) < sevenDaysAgo;
    });

    if (candidates.length === 0) {
        // Fallback to all tracks if everything was used recently
        // Or maybe just return random from all? Let's return random from all.
        const randomIndex = Math.floor(Math.random() * tracks.length);
        return tracks[randomIndex];
    }

    // 2. Simple logic: Pick random from candidates for now.
    // The prompt asked for "match recent usage patterns", but that's complex for a simple app.
    // "Prefer tracks that fit the most common tags the user uses"

    // Let's try to implement a simple weight based on tags of recently used tracks.
    // Get tags from tracks used in last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentlyUsed = tracks.filter(t => t.lastUsedAt && new Date(t.lastUsedAt) > thirtyDaysAgo);

    const tagCounts: Record<string, number> = {};
    recentlyUsed.forEach(t => {
        [...t.moodTags, ...t.usageTags].forEach(tag => {
            tagCounts[tag] = (tagCounts[tag] || 0) + 1;
        });
    });

    // Score candidates
    const scoredCandidates = candidates.map(t => {
        let score = 0;
        [...t.moodTags, ...t.usageTags].forEach(tag => {
            score += (tagCounts[tag] || 0);
        });
        return { track: t, score };
    });

    // Sort by score desc
    scoredCandidates.sort((a, b) => b.score - a.score);

    // Pick one of the top 3 to add some variety
    const topN = Math.min(3, scoredCandidates.length);
    const randomIndex = Math.floor(Math.random() * topN);

    return scoredCandidates[randomIndex].track;
};
