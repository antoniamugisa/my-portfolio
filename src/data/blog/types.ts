// Blog post type definition
export interface BlogPost {
  id: string;
  title: string;
  date: string;
  category: string;
  description: string;
  content: string;
  image: string;
  readTime: number;
  author: string;
  tags: string[];
}
