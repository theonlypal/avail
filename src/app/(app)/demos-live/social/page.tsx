'use client';

/**
 * Social Media Management Demo - Session 4
 *
 * Features:
 * - Content calendar view (month/week)
 * - Scheduled posts across platforms (Facebook, Instagram, LinkedIn, Twitter)
 * - Asset library for images/videos
 * - AI caption generator
 * - Performance metrics per post
 */

import { useState } from 'react';
import { Calendar, Image, Sparkles, Facebook, Instagram, Linkedin, Twitter, Plus, Upload, ArrowLeft, Zap } from 'lucide-react';
import Link from 'next/link';

interface SocialPost {
  id: string;
  platform: 'facebook' | 'instagram' | 'linkedin' | 'twitter';
  content: string;
  scheduled_for: string;
  status: 'draft' | 'scheduled' | 'published';
  image_url?: string;
  engagement?: {
    likes: number;
    comments: number;
    shares: number;
  };
}

interface Asset {
  id: string;
  type: 'image' | 'video';
  url: string;
  name: string;
  uploaded_at: string;
}

export default function SocialMediaDemo() {
  const [view, setView] = useState<'calendar' | 'posts' | 'assets' | 'generator'>('calendar');
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(['facebook', 'instagram']);
  const [aiPrompt, setAiPrompt] = useState('');
  const [generatedCaption, setGeneratedCaption] = useState('');
  const [generating, setGenerating] = useState(false);

  // Sample posts data
  const samplePosts: SocialPost[] = [
    {
      id: '1',
      platform: 'facebook',
      content: 'Spring special! Get 20% off all plumbing services this month. Book now and save! #Plumbing #HomeServices',
      scheduled_for: new Date(Date.now() + 86400000).toISOString(),
      status: 'scheduled',
      image_url: 'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=400',
    },
    {
      id: '2',
      platform: 'instagram',
      content: 'Behind the scenes: Our team fixing a complex pipe issue. We love what we do! 💪 #PlumberLife #Teamwork',
      scheduled_for: new Date(Date.now() + 2 * 86400000).toISOString(),
      status: 'scheduled',
      image_url: 'https://images.unsplash.com/photo-1621905251918-48416bd8575a?w=400',
    },
    {
      id: '3',
      platform: 'linkedin',
      content: 'Industry insight: The importance of regular plumbing maintenance. Read our latest article.',
      scheduled_for: new Date(Date.now() - 7 * 86400000).toISOString(),
      status: 'published',
      engagement: {
        likes: 42,
        comments: 8,
        shares: 12,
      },
    },
  ];

  const sampleAssets: Asset[] = [
    {
      id: '1',
      type: 'image',
      url: 'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=400',
      name: 'plumbing-tools.jpg',
      uploaded_at: new Date(Date.now() - 5 * 86400000).toISOString(),
    },
    {
      id: '2',
      type: 'image',
      url: 'https://images.unsplash.com/photo-1621905251918-48416bd8575a?w=400',
      name: 'team-work.jpg',
      uploaded_at: new Date(Date.now() - 3 * 86400000).toISOString(),
    },
    {
      id: '3',
      type: 'image',
      url: 'https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?w=400',
      name: 'bathroom-renovation.jpg',
      uploaded_at: new Date(Date.now() - 1 * 86400000).toISOString(),
    },
  ];

  const platformConfig = {
    facebook: { icon: Facebook, color: 'text-blue-400', bg: 'bg-blue-500/20', name: 'Facebook' },
    instagram: { icon: Instagram, color: 'text-pink-400', bg: 'bg-pink-500/20', name: 'Instagram' },
    linkedin: { icon: Linkedin, color: 'text-blue-400', bg: 'bg-blue-500/20', name: 'LinkedIn' },
    twitter: { icon: Twitter, color: 'text-sky-400', bg: 'bg-sky-500/20', name: 'Twitter' },
  };

  async function handleGenerateCaption() {
    if (!aiPrompt.trim()) return;

    setGenerating(true);
    try {
      // Simulate AI generation (in production this would call Claude API)
      await new Promise(resolve => setTimeout(resolve, 1500));

      const captions = [
        `✨ ${aiPrompt}\n\nWe're passionate about delivering exceptional service. Book your appointment today! #LocalBusiness #QualityService`,
        `🔧 ${aiPrompt}\n\nYour trusted local experts. Fast, reliable, professional. Call us now! #Experts #TrustedService`,
        `💙 ${aiPrompt}\n\nServing our community with pride for over 20 years. Let us help you today! #CommunityFirst #Experienced`,
      ];

      setGeneratedCaption(captions[Math.floor(Math.random() * captions.length)]);
    } catch (error) {
      console.error('Failed to generate caption:', error);
    } finally {
      setGenerating(false);
    }
  }

  const [posts] = useState<SocialPost[]>(samplePosts);
  const [assets] = useState<Asset[]>(sampleAssets);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Link
              href="/demos"
              className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Demos
            </Link>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-blue-500/20 text-blue-400 border border-blue-500/30">
              <Zap className="w-3 h-3" />
              Live Demo
            </span>
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">Social Media Manager</h1>
          <p className="text-slate-400">Schedule posts, manage assets, and generate engaging content</p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex gap-4 mb-8">
          <button
            onClick={() => setView('calendar')}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg transition-colors ${
              view === 'calendar'
                ? 'bg-cyan-500 text-white'
                : 'bg-slate-800/50 border border-white/10 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <Calendar className="w-5 h-5" />
            Calendar
          </button>
          <button
            onClick={() => setView('posts')}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg transition-colors ${
              view === 'posts'
                ? 'bg-cyan-500 text-white'
                : 'bg-slate-800/50 border border-white/10 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <Plus className="w-5 h-5" />
            Posts
          </button>
          <button
            onClick={() => setView('assets')}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg transition-colors ${
              view === 'assets'
                ? 'bg-cyan-500 text-white'
                : 'bg-slate-800/50 border border-white/10 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <Image className="w-5 h-5" />
            Assets
          </button>
          <button
            onClick={() => setView('generator')}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg transition-colors ${
              view === 'generator'
                ? 'bg-cyan-500 text-white'
                : 'bg-slate-800/50 border border-white/10 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <Sparkles className="w-5 h-5" />
            AI Generator
          </button>
        </div>

        {/* Calendar View */}
        {view === 'calendar' && (
          <div className="bg-slate-900/50 border border-white/10 rounded-lg p-6">
            <h2 className="text-2xl font-bold text-white mb-6">Content Calendar</h2>

            {/* Simple calendar grid */}
            <div className="grid grid-cols-7 gap-4">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="text-center font-semibold text-slate-400 p-2">
                  {day}
                </div>
              ))}

              {Array.from({ length: 35 }).map((_, i) => {
                const dayNum = i - 2; // Start from day -2 to fill the grid
                const hasPost = dayNum === 1 || dayNum === 3 || dayNum === 15;

                return (
                  <div
                    key={i}
                    className={`border border-white/10 rounded-lg p-4 min-h-[120px] ${
                      dayNum < 1 || dayNum > 30 ? 'bg-slate-800/30 text-slate-600' : 'bg-slate-800/50 hover:bg-slate-800/70 transition-colors'
                    }`}
                  >
                    <div className="text-sm font-medium mb-2 text-slate-300">
                      {dayNum > 0 && dayNum <= 30 ? dayNum : ''}
                    </div>

                    {hasPost && dayNum > 0 && dayNum <= 30 && (
                      <div className="space-y-1">
                        {dayNum === 1 && (
                          <div className="text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded">
                            <Facebook className="w-3 h-3 inline mr-1" />
                            Spring Special
                          </div>
                        )}
                        {dayNum === 3 && (
                          <div className="text-xs bg-pink-500/20 text-pink-400 px-2 py-1 rounded">
                            <Instagram className="w-3 h-3 inline mr-1" />
                            Behind the scenes
                          </div>
                        )}
                        {dayNum === 15 && (
                          <div className="text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded">
                            <Linkedin className="w-3 h-3 inline mr-1" />
                            Industry insight
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Posts View */}
        {view === 'posts' && (
          <div className="bg-slate-900/50 border border-white/10 rounded-lg p-6">
            <h2 className="text-2xl font-bold text-white mb-6">Scheduled Posts</h2>

            <div className="space-y-4">
              {posts.map(post => {
                const PlatformIcon = platformConfig[post.platform].icon;
                return (
                  <div key={post.id} className="border border-white/10 rounded-lg p-4 flex gap-4 bg-slate-800/30 hover:bg-slate-800/50 transition-colors">
                    {post.image_url && (
                      <img
                        src={post.image_url}
                        alt="Post preview"
                        className="w-24 h-24 object-cover rounded"
                      />
                    )}

                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-sm ${platformConfig[post.platform].bg} ${platformConfig[post.platform].color}`}>
                          <PlatformIcon className="w-4 h-4" />
                          {platformConfig[post.platform].name}
                        </span>
                        <span className={`px-2 py-1 rounded text-xs ${
                          post.status === 'published' ? 'bg-green-500/20 text-green-400' :
                          post.status === 'scheduled' ? 'bg-blue-500/20 text-blue-400' :
                          'bg-slate-500/20 text-slate-400'
                        }`}>
                          {post.status}
                        </span>
                      </div>

                      <p className="text-slate-300 mb-2">{post.content}</p>

                      <div className="flex items-center gap-4 text-sm text-slate-400">
                        <span>
                          {post.status === 'published' ? 'Published' : 'Scheduled for'}{' '}
                          {new Date(post.scheduled_for).toLocaleDateString()}
                        </span>

                        {post.engagement && (
                          <>
                            <span>👍 {post.engagement.likes}</span>
                            <span>💬 {post.engagement.comments}</span>
                            <span>🔄 {post.engagement.shares}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <button className="mt-6 flex items-center gap-2 px-6 py-3 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition-colors">
              <Plus className="w-5 h-5" />
              Create New Post
            </button>
          </div>
        )}

        {/* Assets View */}
        {view === 'assets' && (
          <div className="bg-slate-900/50 border border-white/10 rounded-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Asset Library</h2>
              <button className="flex items-center gap-2 px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition-colors">
                <Upload className="w-4 h-4" />
                Upload Asset
              </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {assets.map(asset => (
                <div key={asset.id} className="border border-white/10 rounded-lg p-2 bg-slate-800/30 hover:bg-slate-800/50 transition-all cursor-pointer hover:border-cyan-500/50">
                  <img
                    src={asset.url}
                    alt={asset.name}
                    className="w-full h-32 object-cover rounded mb-2"
                  />
                  <div className="text-sm font-medium text-white truncate">{asset.name}</div>
                  <div className="text-xs text-slate-400">
                    {new Date(asset.uploaded_at).toLocaleDateString()}
                  </div>
                </div>
              ))}

              {/* Placeholder cards */}
              <div className="border-2 border-dashed border-white/20 rounded-lg p-2 flex items-center justify-center h-40 cursor-pointer hover:border-cyan-500/50 hover:bg-cyan-500/10 transition-colors">
                <div className="text-center text-slate-400">
                  <Upload className="w-8 h-8 mx-auto mb-2" />
                  <div className="text-sm">Upload Image</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* AI Generator View */}
        {view === 'generator' && (
          <div className="bg-slate-900/50 border border-white/10 rounded-lg p-6">
            <h2 className="text-2xl font-bold text-white mb-6">AI Caption Generator</h2>

            <div className="space-y-6">
              {/* Platform Selection */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Select Platforms
                </label>
                <div className="flex gap-3 flex-wrap">
                  {Object.entries(platformConfig).map(([key, config]) => {
                    const PlatformIcon = config.icon;
                    const isSelected = selectedPlatforms.includes(key);
                    return (
                      <button
                        key={key}
                        onClick={() => {
                          setSelectedPlatforms(prev =>
                            isSelected
                              ? prev.filter(p => p !== key)
                              : [...prev, key]
                          );
                        }}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                          isSelected
                            ? `${config.bg} ${config.color} border-current`
                            : 'border-white/20 text-slate-400 hover:border-white/40 hover:text-white'
                        }`}
                      >
                        <PlatformIcon className="w-5 h-5" />
                        {config.name}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Prompt Input */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  What would you like to post about?
                </label>
                <textarea
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  placeholder="E.g., Announce our new emergency service available 24/7"
                  className="w-full px-4 py-3 bg-slate-800/50 border border-white/10 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-white placeholder:text-slate-500"
                  rows={4}
                />
              </div>

              {/* Generate Button */}
              <button
                onClick={handleGenerateCaption}
                disabled={generating || !aiPrompt.trim()}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-cyan-500 text-white rounded-lg hover:from-purple-600 hover:to-cyan-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                <Sparkles className={`w-5 h-5 ${generating ? 'animate-spin' : ''}`} />
                {generating ? 'Generating...' : 'Generate Caption with AI'}
              </button>

              {/* Generated Caption */}
              {generatedCaption && (
                <div className="border border-cyan-500/30 rounded-lg p-6 bg-cyan-500/10">
                  <div className="flex items-center gap-2 mb-4">
                    <Sparkles className="w-5 h-5 text-cyan-400" />
                    <span className="font-semibold text-white">AI Generated Caption</span>
                  </div>
                  <p className="text-slate-300 mb-4 whitespace-pre-wrap">{generatedCaption}</p>
                  <div className="flex gap-3">
                    <button className="px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition-colors">
                      Use This Caption
                    </button>
                    <button
                      onClick={handleGenerateCaption}
                      className="px-4 py-2 bg-slate-800/50 text-cyan-400 border border-cyan-500/30 rounded-lg hover:bg-slate-800 transition-colors"
                    >
                      Generate Another
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
