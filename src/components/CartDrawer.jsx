import { useBookings } from '../context/BookingContext';
import { useI18n } from '../context/I18nContext';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

export default function CartDrawer() {
    const {
        cart,
        removeFromCart,
        isCartOpen,
        setIsCartOpen,
        cartTotals,
        processCheckout,
        paymentLoading
    } = useBookings();
    const { t } = useI18n();
    const { user } = useAuth();

    if (!isCartOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex justify-end">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
                onClick={() => setIsCartOpen(false)}
            />

            {/* Drawer */}
            <div className="relative w-full max-w-md bg-bg h-full shadow-2xl flex flex-col animate-slide-in-right">
                {/* Header */}
                <div className="p-6 border-b border-border flex items-center justify-between">
                    <div>
                        <h2 className="font-serif text-xl text-textPrimary">Il tuo Carrello</h2>
                        <p className="text-[10px] font-mono text-textMuted uppercase tracking-widest mt-1">
                            {cart.length} {cart.length === 1 ? 'Elemento' : 'Elementi'}
                        </p>
                    </div>
                    <button
                        onClick={() => setIsCartOpen(false)}
                        className="p-2 hover:bg-surface-2 rounded-full transition-colors"
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M18 6L6 18M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Items List */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {cart.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-center">
                            <div className="text-4xl mb-4 opacity-20">🛒</div>
                            <p className="text-textMuted font-mono text-sm max-w-[200px]">
                                Il tuo carrello è vuoto. Inizia ad aggiungere attività o strutture.
                            </p>
                            <button
                                onClick={() => setIsCartOpen(false)}
                                className="mt-6 text-accent text-xs font-mono uppercase tracking-widest hover:underline"
                            >
                                Continua ad esplorare
                            </button>
                        </div>
                    ) : (
                        cart.map((item) => (
                            <div key={item.cartId} className="group relative flex gap-4 p-4 rounded-xl bg-surface border border-border-light hover:border-accent/30 transition-all">
                                <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 bg-surface-2">
                                    <img
                                        src={item.propertyId ? item.propertyImage : item.activityImage}
                                        alt={item.propertyName || item.activityName}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-start gap-2">
                                        <h3 className="font-serif text-textPrimary text-sm leading-tight truncate">
                                            {item.propertyName || item.activityName}
                                        </h3>
                                        <button
                                            onClick={() => removeFromCart(item.cartId)}
                                            className="text-textMuted hover:text-accent transition-colors"
                                        >
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <path d="M18 6L6 18M6 6l12 12" />
                                            </svg>
                                        </button>
                                    </div>
                                    <p className="text-[10px] font-mono text-textMuted uppercase mt-1">
                                        {item.propertyId ? 'Pernottamento' : 'Attività'}
                                    </p>
                                    <div className="mt-2 flex items-center justify-between">
                                        <div className="text-[10px] font-mono text-accent">
                                            {item.checkIn && new Date(item.checkIn).toLocaleDateString('it-IT', { day: '2-digit', month: 'short' })}
                                            {item.checkOut && ` → ${new Date(item.checkOut).toLocaleDateString('it-IT', { day: '2-digit', month: 'short' })}`}
                                        </div>
                                        <span className="text-sm font-medium text-textPrimary">
                                            €{item.totalPrice}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Footer / Summary */}
                {cart.length > 0 && (
                    <div className="p-6 bg-surface border-t border-border">
                        <div className="space-y-3 mb-6">
                            <div className="flex justify-between text-sm">
                                <span className="text-textMuted">Subtotale</span>
                                <span className="text-textPrimary font-medium">€{cartTotals.itemsTotal.toFixed(2)}</span>
                            </div>

                            <div className="flex justify-between text-sm group">
                                <span className="text-textMuted flex items-center gap-1.5">
                                    Costi di servizio (10%)
                                    <span className="text-[10px] text-accent/60">ⓘ</span>
                                </span>
                                <span className="text-textPrimary font-medium">€{cartTotals.platformFee.toFixed(2)}</span>
                            </div>

                            {cartTotals.membershipFee > 0 && (
                                <div className="flex justify-between text-sm p-3 rounded-lg bg-accent/5 border border-accent/20 animate-fade-in">
                                    <div className="flex items-start gap-3">
                                        <span className="text-xl">💳</span>
                                        <div>
                                            <div className="font-medium text-textPrimary text-xs">Digital Membership Card</div>
                                            <div className="text-[10px] text-textMuted">Obbligatoria per i vantaggi Digitalands</div>
                                        </div>
                                    </div>
                                    <span className="text-accent font-medium">€9.90</span>
                                </div>
                            )}

                            <div className="pt-3 border-t border-border flex justify-between items-end">
                                <span className="text-sm font-serif text-textPrimary">Totale</span>
                                <span className="text-2xl font-serif text-accent">€{cartTotals.total.toFixed(2)}</span>
                            </div>
                        </div>

                        <button
                            onClick={processCheckout}
                            disabled={paymentLoading}
                            className="btn-gold w-full py-4 rounded-xl flex items-center justify-center gap-2 group overflow-hidden relative"
                        >
                            {paymentLoading ? (
                                <div className="animate-spin h-5 w-5 border-2 border-t-black rounded-full" />
                            ) : (
                                <>
                                    <span>Procedi al checkout</span>
                                    <svg
                                        className="group-hover:translate-x-1 transition-transform"
                                        width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
                                    >
                                        <path d="M5 12h14m-7-7l7 7-7 7" />
                                    </svg>
                                </>
                            )}
                        </button>

                        <p className="text-[9px] text-center text-textMuted font-mono mt-4 uppercase tracking-[0.2em]">
                            Checkout sicuro gestito da Stripe
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
