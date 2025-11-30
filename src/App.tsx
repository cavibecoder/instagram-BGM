
import { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, useNavigate, useParams, Link } from 'react-router-dom';
import { Plus, Search, Heart, Music, Filter, X } from 'lucide-react';
import { getTracks, getRecommendation, saveTrack, markAsUsed, deleteTrack } from './services/storage';
import type { Track, TrackFormData } from './types';

// Constants
const MOOD_SUGGESTIONS = ['Calm', 'Deep', 'Soft Morning', 'Night', 'Forest', 'Sea', 'Energetic', 'Melancholy'];
const USAGE_SUGGESTIONS = ['Awareness', 'Healing', 'Quiet Repost', 'Story', 'Vlog', 'Travel', 'Work'];

// Home Component
function HomeInternal() {
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

// EditTrack Component
function EditTrackInternal() {
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
        <button onClick={() => navigate('/')} className="text-gray-400 hover:text-gray-600">
          <span>←</span>
        </button>
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

// TrackDetail Component
function TrackDetailInternal() {
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
        <button onClick={() => navigate('/')} className="text-gray-400 hover:text-gray-600">
          <span>←</span>
        </button>
        <div className="flex gap-2">
          <button onClick={() => navigate(`/edit/${track.id}`)} className="btn btn-secondary">
            <span>✎</span>
            Edit
          </button>
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

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)]">
        <header className="bg-white shadow-sm sticky top-0 z-10">
          <div className="container flex items-center justify-between py-4">
            <a href="/" className="text-xl font-bold text-[var(--color-primary)] no-underline">
              Instagram BGM
            </a>
          </div>
        </header>
        <main className="container py-6">
          <Routes>
            <Route path="/" element={<HomeInternal />} />
            <Route path="/new" element={<EditTrackInternal />} />
            <Route path="/edit/:id" element={<EditTrackInternal />} />
            <Route path="/track/:id" element={<TrackDetailInternal />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
