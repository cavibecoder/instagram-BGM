import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getTracks, markAsUsed, deleteTrack } from '../services/storage';
import type { Track } from '../types';

export default function TrackDetail() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [track, setTrack] = useState<Track | null>(null);

    useEffect(() => {
        if (id) {
            const tracks = getTracks();
            const found = tracks.find(t => t.id === id);
            if (found) setTrack(found);
            else navigate('/');
        }
    }, [id, navigate]);

    const handleMarkUsed = () => {
        if (track) {
            const updated = markAsUsed(track.id);
            setTrack(updated);
        }
    };

    const handleDelete = () => {
        if (track && confirm('Are you sure you want to delete this track?')) {
            deleteTrack(track.id);
            navigate('/');
        }
    };

    if (!track) return null;

    return (
        <div className="max-w-2xl mx-auto">
            <div className="flex items-center justify-between mb-6">
                <Link to="/" className="text-gray-400 hover:text-gray-600">
                    <span>←</span>
                </Link>
                <div className="flex gap-2">
                    <Link to={`/edit/${track.id}`} className="btn btn-secondary">
                        <span>✎</span>
                        Edit
                    </Link>
                    <button onClick={handleDelete} className="btn btn-secondary text-[var(--color-danger)] border-[var(--color-danger)] hover:bg-red-50">
                        <span>🗑️</span>
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="p-6 sm:p-8">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <h1 className="text-3xl font-bold mb-2">{track.title}</h1>
                            <p className="text-xl text-muted">{track.artist}</p>
                        </div>
                        {track.favorite && (
                            <span className="text-[var(--color-danger)] text-3xl">❤️</span>
                        )}
                    </div>

                    {track.platformUrl && (
                        <a
                            href={track.platformUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 text-[var(--color-primary)] hover:underline mb-6"
                        >
                            <span>🔗</span>
                            Open in Platform
                        </a>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mb-8">
                        <div>
                            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">Mood</h3>
                            <div className="flex flex-wrap gap-2">
                                {track.moodTags.map(tag => (
                                    <span key={tag} className="tag">{tag}</span>
                                ))}
                                {track.moodTags.length === 0 && <span className="text-gray-400 italic">No mood tags</span>}
                            </div>
                        </div>
                        <div>
                            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">Usage</h3>
                            <div className="flex flex-wrap gap-2">
                                {track.usageTags.map(tag => (
                                    <span key={tag} className="tag tag-usage">{tag}</span>
                                ))}
                                {track.usageTags.length === 0 && <span className="text-gray-400 italic">No usage tags</span>}
                            </div>
                        </div>
                    </div>

                    <div className="mb-8">
                        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">Notes</h3>
                        <div className="bg-gray-50 p-4 rounded-lg text-gray-700 whitespace-pre-wrap">
                            {track.notes || <span className="text-gray-400 italic">No notes added.</span>}
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-gray-100">
                        <div className="text-sm text-gray-500 flex items-center gap-4">
                            <span className="flex items-center gap-1">
                                <span>✓</span>
                                Used {track.usedCount} times
                            </span>
                            {track.lastUsedAt && (
                                <span className="flex items-center gap-1">
                                    <span>📅</span>
                                    Last used: {new Date(track.lastUsedAt).toLocaleDateString()}
                                </span>
                            )}
                        </div>

                        <button onClick={handleMarkUsed} className="btn btn-primary w-full sm:w-auto">
                            <span>✓</span>
                            Mark as Used Today
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
