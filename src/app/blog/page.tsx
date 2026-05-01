'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useState } from 'react';
import { Search, Calendar, User, Eye, MessageSquare, Bookmark, Tag, ArrowRight } from 'lucide-react';

export default function BlogPage() {
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = [
    { id: 'all', label: 'All Posts' },
    { id: 'sustainability', label: 'Sustainability' },
    { id: 'tips', label: 'Selling Tips' },
    { id: 'success', label: 'Success Stories' },
    { id: 'tech', label: 'Technology' },
    { id: 'market', label: 'Market Trends' },
    { id: 'guides', label: 'Guides' },
  ];

  const blogPosts = [
    {
      id: 1,
      title: 'How to Make ₦50,000 Monthly Selling Single Items',
      excerpt: 'Discover proven strategies to turn your unwanted single items into a steady income stream.',
      category: 'tips',
      author: { name: 'Amina Bello', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop' },
      date: 'Jan 15, 2026',
      readTime: '5 min read',
      views: 1245,
      comments: 42,
      image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&h=400&fit=crop',
      featured: true,
    },
    {
      id: 2,
      title: 'The Environmental Impact of Remnant in Nigeria',
      excerpt: 'How our platform is helping reduce waste and promote circular economy in Nigerian households.',
      category: 'sustainability',
      author: { name: 'Chinedu Okoro', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop' },
      date: 'Jan 10, 2026',
      readTime: '8 min read',
      views: 892,
      comments: 31,
      image: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800&h=400&fit=crop',
      featured: true,
    },
    {
      id: 3,
      title: 'From Single AirPod to Complete Pair: A Success Story',
      excerpt: 'Meet Sarah who found her missing AirPod match and turned it into a business opportunity.',
      category: 'success',
      author: { name: 'Ude Fortune', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop' },
      date: 'Jan 5, 2026',
      readTime: '6 min read',
      views: 1567,
      comments: 67,
      image: 'https://images.unsplash.com/photo-1588423771077-8c31c5b2c0c3?w=800&h=400&fit=crop',
      featured: false,
    },
    {
      id: 4,
      title: 'Smart Matching Algorithm: How It Works',
      excerpt: 'A deep dive into the AI technology powering our matching system.',
      category: 'tech',
      author: { name: 'Funmilayo Ude', avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop' },
      date: 'Dec 28, 2025',
      readTime: '10 min read',
      views: 723,
      comments: 24,
      image: 'https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=800&h=400&fit=crop',
      featured: false,
    },
    {
      id: 5,
      title: 'Top 10 Most Sought-After Single Items in 2026',
      excerpt: 'Market analysis reveals which single items are in highest demand across Nigeria.',
      category: 'market',
      author: { name: 'Market Research Team', avatar: '' },
      date: 'Dec 20, 2025',
      readTime: '7 min read',
      views: 945,
      comments: 38,
      image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&h=400&fit=crop',
      featured: false,
    },
    {
      id: 6,
      title: 'Safety Guide: Meeting Buyers & Sellers Safely',
      excerpt: 'Essential safety tips for in-person transactions in the Nigerian context.',
      category: 'guides',
      author: { name: 'Security Team', avatar: '' },
      date: 'Dec 15, 2025',
      readTime: '4 min read',
      views: 1123,
      comments: 29,
      image: 'https://images.unsplash.com/photo-1553877522-43269d4ea984?w=800&h=400&fit=crop',
      featured: false,
    },
  ];

  const filteredPosts = selectedCategory === 'all' 
    ? blogPosts 
    : blogPosts.filter(post => post.category === selectedCategory);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">Remnant Blog</h1>
        <p className="text-xl text-neutral-600 dark:text-neutral-400 mb-8 max-w-3xl mx-auto">
          Insights, tips, and stories about circular economy, sustainability, and marketplace success
        </p>
        
        {/* Search */}
        <div className="max-w-2xl mx-auto mb-8">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-neutral-400" size={20} />
            <Input
              type="text"
              placeholder="Search blog posts..."
              className="pl-12 pr-4 py-6"
            />
            <Button className="absolute right-2 top-2">Search</Button>
          </div>
        </div>

        {/* Categories */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {categories.map((cat) => (
            <Button
              key={cat.id}
              variant={selectedCategory === cat.id ? "default" : "outline"}
              onClick={() => setSelectedCategory(cat.id)}
              size="sm"
            >
              {cat.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Featured Posts */}
      {selectedCategory === 'all' && (
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Featured Stories</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {blogPosts.filter(post => post.featured).map((post) => (
              <Card key={post.id} className="overflow-hidden hover:shadow-xl transition-shadow group">
                <div className="relative h-64 overflow-hidden">
                  <img
                    src={post.image}
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-4 left-4">
                    <Badge className="bg-white/90 text-black hover:bg-white">
                      Featured
                    </Badge>
                  </div>
                </div>
                <CardHeader>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline">{post.category}</Badge>
                    <span className="text-sm text-neutral-500">•</span>
                    <span className="text-sm text-neutral-500 flex items-center">
                      <Calendar size={14} className="mr-1" />
                      {post.date}
                    </span>
                  </div>
                  <CardTitle className="text-xl md:text-2xl">{post.title}</CardTitle>
                  <CardDescription className="text-lg">{post.excerpt}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={post.author.avatar} />
                        <AvatarFallback>{post.author.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{post.author.name}</p>
                        <p className="text-sm text-neutral-500">{post.readTime}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-neutral-500">
                      <span className="flex items-center">
                        <Eye size={14} className="mr-1" />
                        {post.views}
                      </span>
                      <span className="flex items-center">
                        <MessageSquare size={14} className="mr-1" />
                        {post.comments}
                      </span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button className="w-full group/btn">
                    Read Full Story
                    <ArrowRight className="ml-2 group-hover/btn:translate-x-1 transition-transform" size={16} />
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* All Posts */}
      <div>
        <h2 className="text-2xl font-bold mb-6">
          {selectedCategory === 'all' ? 'Latest Posts' : `${categories.find(c => c.id === selectedCategory)?.label}`}
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPosts.map((post) => (
            <Card key={post.id} className="hover:shadow-lg transition-shadow group">
              <div className="relative h-48 overflow-hidden">
                <img
                  src={post.image}
                  alt={post.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-3 left-3">
                  <Badge variant="outline" className="bg-white/90">
                    {post.category}
                  </Badge>
                </div>
              </div>
              <CardHeader>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm text-neutral-500 flex items-center">
                    <Calendar size={12} className="mr-1" />
                    {post.date}
                  </span>
                  <span className="text-sm text-neutral-500">•</span>
                  <span className="text-sm text-neutral-500">{post.readTime}</span>
                </div>
                <CardTitle className="line-clamp-2">{post.title}</CardTitle>
                <CardDescription className="line-clamp-2">{post.excerpt}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <User size={14} className="text-neutral-500" />
                    <span className="text-sm">{post.author.name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <button className="text-neutral-500 hover:text-neutral-700">
                      <Eye size={14} />
                    </button>
                    <button className="text-neutral-500 hover:text-neutral-700">
                      <MessageSquare size={14} />
                    </button>
                    <button className="text-neutral-500 hover:text-neutral-700">
                      <Bookmark size={14} />
                    </button>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full group/btn">
                  Read More
                  <ArrowRight className="ml-2 group-hover/btn:translate-x-1 transition-transform" size={14} />
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>

      {/* Popular Tags */}
      <div className="mt-12">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Tag size={20} />
              Popular Topics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {['Circular Economy', 'Make Money', 'Sustainability', 'AI Matching', 'Nigerian Market', 'Waste Reduction', 'Entrepreneurship', 'E-commerce'].map((tag) => (
                <Badge
                  key={tag}
                  variant="outline"
                  className="cursor-pointer hover:bg-green-50 hover:text-green-700 hover:border-green-300"
                  onClick={() => console.log('Search:', tag)}
                >
                  {tag}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Newsletter */}
      <Card className="mt-12 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30">
        <CardContent className="p-8">
          <div className="text-center max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold mb-4">Stay Updated</h3>
            <p className="text-neutral-600 dark:text-neutral-400 mb-6">
              Get the latest posts, tips, and success stories delivered to your inbox
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Input
                type="email"
                placeholder="Your email address"
                className="flex-1"
              />
              <Button>Subscribe</Button>
            </div>
            <p className="text-sm text-neutral-500 mt-3">
              No spam, unsubscribe anytime
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Pagination */}
      <div className="flex justify-center items-center gap-2 mt-12">
        <Button variant="outline" disabled>
          Previous
        </Button>
        <Button variant="default">1</Button>
        <Button variant="outline">2</Button>
        <Button variant="outline">3</Button>
        <Button variant="outline">Next</Button>
      </div>
    </div>
  );
}