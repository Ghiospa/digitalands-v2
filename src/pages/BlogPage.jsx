import { useNavigate } from 'react-router-dom';
import { BLOG_POSTS } from '../data/blogPosts';

export default function BlogPage() {
    const navigate = useNavigate();

    return (
        <div style={{ minHeight: '100vh', paddingTop: '100px', paddingBottom: '100px', background: 'var(--bg)' }}>
            <div className="max-w-content mx-auto px-6">

                {/* Header */}
                <div style={{ textAlign: 'center', marginBottom: '64px' }}>
                    <div className="section-chip mx-auto mb-4" style={{ display: 'inline-flex' }}>INSIGHTS</div>
                    <h1 style={{
                        fontFamily: "'Unbounded', sans-serif", fontSize: 'clamp(2rem, 5vw, 3.5rem)',
                        fontWeight: 700, color: 'var(--text-primary)', marginBottom: '16px'
                    }}>
                        Il nostro Blog
                    </h1>
                    <p style={{ color: 'var(--text-muted)', maxWidth: '600px', margin: '0 auto', fontSize: '1.1rem' }}>
                        Storie di nomadi digitali, guide territoriali e consigli tecnici per vivere al meglio la Sicilia.
                    </p>
                </div>

                {/* Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {BLOG_POSTS.map((post) => (
                        <article
                            key={post.id}
                            className="card-hover flex flex-col bg-surface overflow-hidden group cursor-pointer"
                            style={{ borderRadius: '16px', border: '1px solid var(--border)' }}
                            onClick={() => navigate(`/blog/${post.slug}`)}
                        >
                            {/* Image Wrapper */}
                            <div style={{ height: '240px', overflow: 'hidden', position: 'relative' }}>
                                <img
                                    src={post.image}
                                    alt={post.title}
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                    className="group-hover:scale-105 transition-transform duration-500"
                                />
                                <div className="absolute top-4 left-4">
                                    <span style={{
                                        background: 'var(--accent)', color: 'black', padding: '4px 12px',
                                        borderRadius: '20px', fontSize: '10px', fontWeight: 700,
                                        textTransform: 'uppercase', letterSpacing: '0.05em'
                                    }}>
                                        {post.category}
                                    </span>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="p-7 flex flex-col flex-1">
                                <div className="flex items-center gap-3 mb-3 text-[10px] font-mono text-textMuted uppercase tracking-widest">
                                    <span>{post.date}</span>
                                    <span>·</span>
                                    <span>{post.readTime}</span>
                                </div>
                                <h2 className="text-xl font-semibold text-textPrimary leading-tight mb-4 group-hover:text-accent transition-colors">
                                    {post.title}
                                </h2>
                                <p className="text-textMuted text-sm leading-relaxed mb-6 line-clamp-3">
                                    {post.excerpt}
                                </p>
                                <div className="mt-auto pt-5 border-t border-border flex items-center justify-between">
                                    <span className="text-xs font-medium text-textPrimary">di {post.author}</span>
                                    <span className="text-accent text-sm font-semibold">Leggi →</span>
                                </div>
                            </div>
                        </article>
                    ))}
                </div>
            </div>
        </div>
    );
}
