import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { getTracks, saveTrack } from '../services/storage';
import type { TrackFormData } from '../types';

const MOOD_SUGGESTIONS = ['Calm', 'Deep', 'Soft Morning', 'Night', 'Forest', 'Sea', 'Energetic', 'Melancholy'];
const USAGE_SUGGESTIONS = ['Awareness', 'Healing', 'Quiet Repost', 'Story', 'Vlog', 'Travel', 'Work'];

export default function EditTrack() {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();

    const [formData, setFormData] = useState<TrackFormData>({
        title: '',
        artist: '',
        platformUrl: '',
        moodTags: [],
        usageTags: [],
        notes: '',
        favorite: false,
    });

    const [moodInput, setMoodInput] = useState('');
    const [usageInput, setUsageInput] = useState('');

    useEffect(() => {
        if (id) {
            const tracks = getTracks();
            const track = tracks.find(t => t.id === id);
            if (track) {
                const { id: _, usedCount, lastUsedAt, createdAt, ...data } = track;
                setFormData(data);
            }
        }
    }, [id]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        saveTrack(formData, id);
        navigate('/');
    };

    const toggleTag = (type: 'mood' | 'usage', tag: string) => {
        const key = type === 'mood' ? 'moodTags' : 'usageTags';
        const currentTags = formData[key];
        const newTags = currentTags.includes(tag)
            ? currentTags.filter(t => t !== tag)
            : [...currentTags, tag];

        setFormData({ ...formData, [key]: newTags });
    };

    const addCustomTag = (type: 'mood' | 'usage') => {
        const input = type === 'mood' ? moodInput : usageInput;
        const setInput = type === 'mood' ? setMoodInput : setUsageInput;
        const key = type === 'mood' ? 'moodTags' : 'usageTags';

        if (input.trim()) {
            if (!formData[key].includes(input.trim())) {
                setFormData({ ...formData, [key]: [...formData[key], input.trim()] });
            }
            setInput('');
        }
    };

    return (
        <div className="max-w-2xl mx-auto">
            <div className="flex items-center gap-4 mb-6">
                <Link to="/" className="text-gray-400 hover:text-gray-600">
                    <span>←</span>
                </Link>
                <h1 className="text-2xl font-bold">{id ? 'Edit Track' : 'Add New Track'}</h1>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-xl shadow-sm">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                        <input
                            required
                            type="text"
                            value={formData.title}
                            onChange={e => setFormData({ ...formData, title: e.target.value })}
                            placeholder="Track Title"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Artist</label>
                        <input
                            required
                            type="text"
                            value={formData.artist}
                            onChange={e => setFormData({ ...formData, artist: e.target.value })}
                            placeholder="Artist Name"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Platform URL (Optional)</label>
                    <input
                        type="url"
                        value={formData.platformUrl || ''}
                        onChange={e => setFormData({ ...formData, platformUrl: e.target.value })}
                        placeholder="https://spotify.com/..."
                    />
                </div>

                {/* Mood Tags */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Mood Tags</label>
                    <div className="flex flex-wrap gap-2 mb-3">
                        {MOOD_SUGGESTIONS.map(tag => (
                            <button
                                key={tag}
                                type="button"
                                onClick={() => toggleTag('mood', tag)}
                                className={`tag cursor-pointer border ${formData.moodTags.includes(tag)
                                        ? 'bg-blue-100 text-blue-800 border-blue-200'
                                        : 'bg-gray-50 text-gray-600 border-gray-200'
                                    }`}
                            >
                                {tag}
                            </button>
                        ))}
                    </div>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={moodInput}
                            onChange={e => setMoodInput(e.target.value)}
                            placeholder="Add custom mood..."
                            onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addCustomTag('mood'))}
                        />
                        <button type="button" onClick={() => addCustomTag('mood')} className="btn btn-secondary">Add</button>
                    </div>
                    {formData.moodTags.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-2">
                            <span className="text-xs text-gray-500 py-1">Selected:</span>
                            {formData.moodTags.map(tag => (
                                <span key={tag} className="tag flex items-center gap-1">
                                    {tag}
                                    <span className="cursor-pointer" onClick={() => toggleTag('mood', tag)}>✕</span>
                                </span>
                            ))}
                        </div>
                    )}
                </div>

                {/* Usage Tags */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Usage Tags</label>
                    <div className="flex flex-wrap gap-2 mb-3">
                        {USAGE_SUGGESTIONS.map(tag => (
                            <button
                                key={tag}
                                type="button"
                                onClick={() => toggleTag('usage', tag)}
                                className={`tag tag-usage cursor-pointer border ${formData.usageTags.includes(tag)
                                        ? 'bg-green-100 text-green-800 border-green-200'
                                        : 'bg-gray-50 text-gray-600 border-gray-200'
                                    }`}
                            >
                                {tag}
                            </button>
                        ))}
                    </div>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={usageInput}
                            onChange={e => setUsageInput(e.target.value)}
                            placeholder="Add custom usage..."
                            onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addCustomTag('usage'))}
                        />
                        <button type="button" onClick={() => addCustomTag('usage')} className="btn btn-secondary">Add</button>
                    </div>
                    {formData.usageTags.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-2">
                            <span className="text-xs text-gray-500 py-1">Selected:</span>
                            {formData.usageTags.map(tag => (
                                <span key={tag} className="tag tag-usage flex items-center gap-1">
                                    {tag}
                                    <span className="cursor-pointer" onClick={() => toggleTag('usage', tag)}>✕</span>
                                </span>
                            ))}
                        </div>
                    )}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                    <textarea
                        rows={4}
                        value={formData.notes}
                        onChange={e => setFormData({ ...formData, notes: e.target.value })}
                        placeholder="Memo about the intro, vibe, etc."
                    />
                </div>

                <div className="flex items-center gap-2">
                    <input
                        type="checkbox"
                        id="favorite"
                        checked={formData.favorite}
                        onChange={e => setFormData({ ...formData, favorite: e.target.checked })}
                        className="w-auto"
                    />
                    <label htmlFor="favorite" className="cursor-pointer select-none">Mark as Favorite</label>
                </div>

                <div className="flex gap-4 pt-4 border-t border-gray-100">
                    <button type="button" onClick={() => navigate('/')} className="btn btn-secondary flex-1">
                        Cancel
                    </button>
                    <button type="submit" className="btn btn-primary flex-1">
                        <span>💾</span>
                        Save Track
                    </button>
                </div>
            </form>
        </div>
    );
}
