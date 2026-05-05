import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { issueService } from '../services/issueService';
import Alert from '../components/Alert';
import { CATEGORIES } from '../utils/constants';

export default function ReportIssue() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    location: '',
    imageUrl: '',
    isAnonymous: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { title, description, category, location } = formData;

    if (!title || !description || !category || !location) {
      setError('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      await issueService.createIssue(formData);
      setSuccess(
        '🎉 Issue submitted successfully! It will appear publicly after admin approval.'
      );
      setTimeout(() => navigate('/dashboard'), 2500);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit issue. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-slate-800">
          📝 Report a Civic Issue
        </h1>
        <p className="text-slate-500 mt-1">
          Your report will be reviewed by an admin before going live.
        </p>
      </div>

      {success && (
        <div className="mb-6">
          <Alert message={success} type="success" />
        </div>
      )}

      <div className="card">
        {error && (
          <div className="mb-5">
            <Alert message={error} type="error" />
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Title */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              Issue Title <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g., Overflowing garbage bin near Main Chowk"
              className="form-input"
              maxLength={100}
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              Category <span className="text-red-400">*</span>
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="form-input"
            >
              <option value="">Select a category…</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              Location <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="e.g., Sector 14, Gurugram"
              className="form-input"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              Description <span className="text-red-400">*</span>
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe the issue in detail…"
              rows={4}
              className="form-input resize-none"
              maxLength={1000}
            />
            <p className="text-xs text-slate-400 mt-1 text-right">
              {formData.description.length}/1000
            </p>
          </div>

          {/* Image URL (optional) */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              Image URL{' '}
              <span className="font-normal text-slate-400">(optional)</span>
            </label>
            <input
              type="url"
              name="imageUrl"
              value={formData.imageUrl}
              onChange={handleChange}
              placeholder="https://example.com/photo.jpg"
              className="form-input"
            />
          </div>

          {/* Anonymous toggle */}
          <div className="flex items-start gap-3 bg-slate-50 rounded-xl p-4 border border-slate-100">
            <input
              type="checkbox"
              name="isAnonymous"
              id="isAnonymous"
              checked={formData.isAnonymous}
              onChange={handleChange}
              className="mt-0.5 w-4 h-4 accent-civic-600 cursor-pointer"
            />
            <label htmlFor="isAnonymous" className="cursor-pointer">
              <p className="text-sm font-semibold text-slate-700">
                Report Anonymously
              </p>
              <p className="text-xs text-slate-500 mt-0.5">
                Your name will be hidden from the public. Your account is still
                linked privately so you can track this in your dashboard.
              </p>
            </label>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="btn-secondary flex-1"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !!success}
              className="btn-primary flex-1"
            >
              {loading ? 'Submitting…' : 'Submit Issue'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
