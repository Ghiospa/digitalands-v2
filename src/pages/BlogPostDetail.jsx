import { useParams, useNavigate } from 'react-router-dom';
import { BLOG_POSTS } from '../data/blogPosts';
import { useEffect } from 'react';

export default function BlogPostDetail() {
    const { slug } = useParams();
    const navigate = useNavigate();
    const post = BLOG_POSTS.find(p => p.slug === slug);

    useEffect(() => {
        window.scrollTo(0, 0);
        if (post) {
            document.title = `${post.title} — Digitalands Blog`;
        }
    }, [post]);

    if (!post) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)' }}>
                <div style={{ textAlign: 'center' }}>
                    <h1 className="text-4xl font-serif text-accent mb-4">Post non trovato</h1>
                    <button onClick={() => navigate('/blog')} className="btn-gold">Torna al blog</button>
                </div>
            </div>
        );
    }

    return (
        <article style={{ background: 'var(--bg)', minHeight: '100vh', paddingTop: '120px', paddingBottom: '100px' }}>
            <div className="max-w-[800px] mx-auto px-6">

                {/* Back Link */}
                <button
                    onClick={() => navigate('/blog')}
                    style={{ background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '32px', fontSize: '14px', fontWeight: 600 }}
                >
                    ← Torna agli approfondimenti
                </button>

                {/* Header */}
                <header style={{ marginBottom: '40px' }}>
                    <div className="flex items-center gap-4 mb-4">
                        <span style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-muted)', padding: '4px 12px', borderRadius: '4px', fontSize: '10px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            {post.category}
                        </span>
                        <span className="text-xs text-textMuted font-mono uppercase">{post.date}</span>
                    </div>
                    <h1 style={{
                        fontFamily: "'Unbounded', sans-serif", fontSize: 'clamp(1.8rem, 5vw, 3rem)',
                        fontWeight: 700, color: 'var(--text-primary)', lineHeight: '1.2', marginBottom: '24px'
                    }}>
                        {post.title}
                    </h1>
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center text-[10px] font-bold text-black">
                            {post.author[0]}
                        </div>
                        <span className="text-sm font-medium text-textPrimary">Scritto da {post.author}</span>
                    </div>
                </header>

                {/* Featured Image */}
                <div style={{ width: '100%', height: '400px', borderRadius: '16px', overflow: 'hidden', marginBottom: '48px', border: '1px solid var(--border)' }}>
                    <img src={post.image} alt={post.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>

                {/* Content */}
                <div
                    className="blog-content"
                    style={{
                        color: 'var(--text-primary)',
                        opacity: 0.9,
                        lineHeight: '1.8',
                        fontSize: '1.1rem',
                        whiteSpace: 'pre-line'
                    }}
                >
                    {post.content}
                </div>

                {/* Footer / CTA */}
                <div style={{ marginTop: '80px', padding: '48px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '16px', textAlign: 'center' }}>
                    <h3 className="section-title mb-4">Pronto a lavorare dalla Sicilia?</h3>
                    <p className="text-textMuted mb-8">Scopri le nostre strutture verificate con fibra ottica garantita.</p>
                    <button onClick={() => navigate('/strutture')} className="btn-gold">Vedi le strutture →</button>
                </div>

            </div>
        </article>
    );
}
