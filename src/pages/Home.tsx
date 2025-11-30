import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Heart, Music, Filter, X } from 'lucide-react';
import { getTracks, getRecommendation } from '../services/storage';
import type { Track } from '../types';

export default function Home() {
    const navigate = useNavigate();
    const [tracks, setTracks] = useState<Track[]>([]);
    const [search, setSearch] = useState('');
    const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
    const [selectedMood, setSelectedMood] = useState<string | null>(null);
    const [selectedUsage, setSelectedUsage] = useState<string | null>(null);
    const [recommendation, setRecommendation] = useState<Track | null>(null);
    const [showRecommendation, setShowRecommendation] = useState(false);

    useEffect(() => {
        setTracks(getTracks());
    }, []);

    const allMoods = Array.from(new Set(tracks.flatMap(t => t.moodTags)));
    const allUsages = Array.from(new Set(tracks.flatMap(t => t.usageTags)));

    const filteredTracks = tracks.filter(track => {
        const matchesSearch = (
            track.title.toLowerCase().includes(search.toLowerCase()) ||
            track.artist.toLowerCase().includes(search.toLowerCase()) ||
            track.moodTags.some(t => t.toLowerCase().includes(search.toLowerCase())) ||
            track.usageTags.some(t => t.toLowerCase().includes(search.toLowerCase()))
        );
        const matchesFav = showFavoritesOnly ? track.favorite : true;
        const matchesMood = selectedMood ? track.moodTags.includes(selectedMood) : true;
        const matchesUsage = selectedUsage ? track.usageTags.includes(selectedUsage) : true;

        return matchesSearch && matchesFav && matchesMood && matchesUsage;
    });

    const handleRecommendation = () => {
        const rec = getRecommendation();
        setRecommendation(rec);
        setShowRecommendation(true);
    };

    return (
        <div>
            {/* Controls */}
            <div className="mb-8 space-y-4">
                <div className="flex gap-2">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="Search title, artist, tags..."
                            className="pl-10"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <button
                        onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
                        className={`btn ${showFavoritesOnly ? 'btn-primary' : 'btn-secondary'}`}
                    >
                        <Heart size={18} fill={showFavoritesOnly ? "currentColor" : "none"} />
                        <span className="hidden sm:inline">Favorites</span>
                    </button>
                </div>

                <div className="flex flex-wrap gap-2 items-center">
                    <Filter size={18} className="text-gray-400" />
                    <select
                        value={selectedMood || ''}
                        onChange={(e) => setSelectedMood(e.target.value || null)}
                        className="w-auto"
                    >
                        <option value="">All Moods</option>
                        {allMoods.map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                    <select
                        value={selectedUsage || ''}
                        onChange={(e) => setSelectedUsage(e.target.value || null)}
                        className="w-auto"
                    >
                        <option value="">All Usages</option>
                        {allUsages.map(u => <option key={u} value={u}>{u}</option>)}
                    </select>

                    {(selectedMood || selectedUsage) && (
                        <button
                            onClick={() => { setSelectedMood(null); setSelectedUsage(null); }}
                            className="btn btn-ghost text-sm"
                        >
                            Clear filters
                        </button>
                    )}
                </div>

                <div className="flex justify-between items-center pt-4 border-t border-[var(--color-border)]">
                    <button onClick={handleRecommendation} className="btn btn-secondary text-[var(--color-primary)]">
                        <Music size={18} />
                        Today's recommended BGM
                    </button>
                    <button onClick={() => navigate('/new')} className="btn btn-primary">
                        <Plus size={18} />
                        Add new track
                    </button>
                </div>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {filteredTracks.map(track => (
                    <div
                        key={track.id}
                        onClick={() => navigate(`/track/${track.id}`)}
                        className="block no-underline text-inherit cursor-pointer"
                    >
                        <div className="card h-full flex flex-col justify-between">
                            <div>
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="font-bold text-lg">{track.title}</h3>
                                    {track.favorite && <Heart size={16} fill="var(--color-danger)" className="text-[var(--color-danger)]" />}
                                </div>
                                <p className="text-muted mb-3">{track.artist}</p>
                                <div className="flex flex-wrap gap-1 mb-3">
                                    {track.moodTags.slice(0, 3).map(tag => (
                                        <span key={tag} className="tag">{tag}</span>
                                    ))}
                                    {track.moodTags.length > 3 && <span className="text-xs text-gray-400">+{track.moodTags.length - 3}</span>}
                                </div>
                            </div>
                            <div className="text-xs text-gray-400 text-right">
                                Used {track.usedCount} times
                            </div>
                        </div>
                    </div>
                ))}

                {filteredTracks.length === 0 && (
                    <div className="col-span-full text-center py-12 text-gray-400">
                        No tracks found. Add some music!
                    </div>
                )}
            </div>

            {/* Recommendation Modal */}
            {showRecommendation && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-xl relative">
                        <button
                            onClick={() => setShowRecommendation(false)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                        >
                            <X size={24} />
                        </button>

                        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                            <Music className="text-[var(--color-accent)]" />
                            Today's Recommendation
                        </h2>

                        {recommendation ? (
                            <div className="text-center py-4">
                                <h3 className="text-2xl font-bold mb-2">{recommendation.title}</h3>
                                <p className="text-lg text-muted mb-6">{recommendation.artist}</p>
                                <div className="flex flex-wrap justify-center gap-2 mb-8">
                                    {recommendation.moodTags.map(t => <span key={t} className="tag">{t}</span>)}
                                    {recommendation.usageTags.map(t => <span key={t} className="tag tag-usage">{t}</span>)}
                                </div>
                                <button
                                    onClick={() => navigate(`/track/${recommendation.id}`)}
                                    className="btn btn-primary w-full"
                                >
                                    View Details
                                </button>
                            </div>
                        ) : (
                            <p className="text-center py-8 text-muted">
                                No tracks available for recommendation. Add some tracks first!
                            </p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
