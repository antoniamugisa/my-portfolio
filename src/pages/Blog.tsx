import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Search, Calendar, Clock, ArrowRight, Filter } from 'lucide-react';
import { blogPosts, blogCategories } from '@/data/blogPosts';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const Blog = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Filter and search logic
  const filteredPosts = useMemo(() => {
    return blogPosts.filter(post => {
      const matchesSearch = 
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesCategory = selectedCategory === 'All' || post.category === selectedCategory;
      
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, selectedCategory]);

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-background pt-24">
      {/* Hero Section */}
      <section className="py-16 bg-gradient-secondary">
        <div className="container mx-auto px-6 max-w-4xl text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-8 bg-gradient-primary bg-clip-text text-transparent">
            Antonia's Blog
          </h1>
          <p className="text-xl text-foreground/70 max-w-2xl mx-auto leading-relaxed">
            My thoughts on my journey as a developer, lessons learned, and stories from my own life in tech and beyond.
          </p>
        </div>
      </section>

      {/* Search and Filter Section */}
      <section className="py-8 bg-background border-b border-border">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* Search Bar */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search posts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-card border-border focus:border-primary/50"
              />
            </div>

            {/* Category Filter */}
            <div className="flex items-center gap-3">
              <Filter className="w-4 h-4 text-muted-foreground" />
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-[200px] bg-card border-border">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {blogCategories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Results count */}
          <div className="mt-4 text-sm text-muted-foreground">
            {filteredPosts.length} {filteredPosts.length === 1 ? 'post' : 'posts'} found
          </div>
        </div>
      </section>

      {/* Blog Posts Grid */}
      <section className="py-16">
        <div className="container mx-auto px-6 max-w-6xl">
          {filteredPosts.length === 0 ? (
            <div className="text-center py-16">
              <h3 className="text-2xl font-semibold mb-4">No posts found</h3>
              <p className="text-muted-foreground mb-6">
                Try adjusting your search terms or category filter
              </p>
              <Button 
                variant="outline" 
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('All');
                }}
              >
                Clear Filters
              </Button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredPosts.map((post, index) => (
                <Card 
                  key={post.id}
                  className="group bg-card hover:bg-card/80 border-border hover:border-primary/50 transition-all duration-300 hover:shadow-card animate-fade-in overflow-hidden"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  {/* Post Image */}
                  <div className="aspect-video overflow-hidden">
                    <img 
                      src={post.image} 
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>

                  <CardHeader className="pb-3">
                    {/* Category Badge */}
                    <Badge 
                      variant="secondary" 
                      className="w-fit mb-3 bg-primary/10 text-primary border-primary/20"
                    >
                      {post.category}
                    </Badge>

                    {/* Post Title */}
                    <h3 className="text-xl font-semibold leading-tight group-hover:text-primary transition-colors duration-300">
                      {post.title}
                    </h3>
                  </CardHeader>

                  <CardContent className="pb-3">
                    {/* Post Description */}
                    <p className="text-foreground/70 text-sm leading-relaxed mb-4 line-clamp-3">
                      {post.description}
                    </p>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-2">
                      {post.tags.slice(0, 3).map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                      {post.tags.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{post.tags.length - 3}
                        </Badge>
                      )}
                    </div>
                  </CardContent>

                  <CardFooter className="pt-0 flex items-center justify-between">
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatDate(post.date)}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {post.readTime} min read
                      </div>
                    </div>

                    {/* Read More Link */}
                    <Link to={`/blog/${post.id}`}>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="group-hover:text-primary group-hover:bg-primary/10 transition-colors duration-300"
                      >
                        Read More
                        <ArrowRight className="w-3 h-3 ml-1 group-hover:translate-x-1 transition-transform duration-300" />
                      </Button>
                    </Link>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Blog;