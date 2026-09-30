import os

def patch_headers():
    base_dir = r'C:\Users\aminj\Downloads\SAAS 7'

    # 1. Patch components/layout/Header.tsx
    header_path = os.path.join(base_dir, 'components', 'layout', 'Header.tsx')
    with open(header_path, 'r', encoding='utf-8') as f:
        c = f.read()

    # Container padding: px-4 sm:px-6
    c = c.replace(
        'max-w-7xl mx-auto flex h-16 items-center justify-between px-6',
        'max-w-7xl mx-auto flex h-16 items-center justify-between px-4 sm:px-6'
    )
    # Compact logo subtitle on mobile
    c = c.replace(
        'className="text-[10px] uppercase font-bold tracking-widest text-text-muted"',
        'className="hidden sm:inline-block text-[10px] uppercase font-bold tracking-widest text-text-muted"'
    )
    # Nav links: show on lg (>=1024px) instead of md (>=768px) to avoid tablet collision
    c = c.replace(
        'nav className="hidden md:flex items-center gap-7"',
        'nav className="hidden lg:flex items-center gap-6"'
    )
    # Hide desktop dashboard on md so it uses mobile dashboard button
    c = c.replace(
        'className="hidden sm:inline-flex items-center gap-1.5 rounded-xl h-10 px-3.5 text-xs font-bold border-border bg-surface hover:bg-surface-raised text-brand-ink shadow-sm"',
        'className="hidden lg:inline-flex items-center gap-1.5 rounded-xl h-10 px-3.5 text-xs font-bold border-border bg-surface hover:bg-surface-raised text-brand-ink shadow-sm"'
    )
    # Hide language selector on md
    c = c.replace(
        'className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5',
        'className="hidden xl:flex items-center gap-1.5 px-2.5 py-1.5'
    )
    # Compact start translation button on md
    c = c.replace(
        'className="hidden sm:inline-flex gap-2 rounded-full h-10 px-5 text-xs sm:text-sm font-bold bg-brand-ink',
        'className="hidden sm:inline-flex gap-1.5 rounded-full h-9 sm:h-10 px-3 sm:px-5 text-xs sm:text-sm font-bold bg-brand-ink'
    )
    with open(header_path, 'w', encoding='utf-8') as f:
        f.write(c)
    print("Patched components/layout/Header.tsx")

    # 2. Patch components/layout/Footer.tsx
    footer_path = os.path.join(base_dir, 'components', 'layout', 'Footer.tsx')
    with open(footer_path, 'r', encoding='utf-8') as f:
        fc = f.read()

    fc = fc.replace(
        'footer className="bg-brand-ink text-white border-t border-white/10 pt-16 pb-12 px-6"',
        'footer className="bg-brand-ink text-white border-t border-white/10 pt-16 pb-12 px-4 sm:px-6 w-full overflow-hidden"'
    )
    with open(footer_path, 'w', encoding='utf-8') as f:
        f.write(fc)
    print("Patched components/layout/Footer.tsx")

    # 3. Patch app/order/layout.tsx
    order_layout_path = os.path.join(base_dir, 'app', 'order', 'layout.tsx')
    with open(order_layout_path, 'r', encoding='utf-8') as f:
        oc = f.read()

    oc = oc.replace(
        'header className="sticky top-0 z-50 border-b border-slate-200 bg-white/80 backdrop-blur-md px-6 py-4"',
        'header className="sticky top-0 z-50 border-b border-slate-200 bg-white/80 backdrop-blur-md px-4 sm:px-6 py-3 sm:py-4 w-full overflow-hidden"'
    )
    oc = oc.replace(
        '<span>256-Bit SSL Encrypted</span>',
        '<span className="hidden sm:inline">256-Bit SSL Encrypted</span><span className="sm:hidden">SSL</span>'
    )
    with open(order_layout_path, 'w', encoding='utf-8') as f:
        f.write(oc)
    print("Patched app/order/layout.tsx")

    # 4. Patch app/order/[id]/OrderTrackingClient.tsx
    ot_path = os.path.join(base_dir, 'app', 'order', '[id]', 'OrderTrackingClient.tsx')
    with open(ot_path, 'r', encoding='utf-8') as f:
        otc = f.read()

    otc = otc.replace(
        'className={cn(\n        "space-y-8 transition-colors duration-500 rounded-3xl p-2 sm:p-4",',
        'className={cn(\n        "space-y-6 sm:space-y-8 transition-colors duration-500 rounded-3xl p-2 sm:p-4 w-full max-w-full overflow-hidden",'
    )
    otc = otc.replace(
        '<div className="p-6 md:p-8 rounded-[28px] bg-surface-raised border border-border/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">',
        '<div className="p-4 sm:p-6 md:p-8 rounded-2xl sm:rounded-[28px] bg-surface-raised border border-border/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-6 w-full overflow-hidden">'
    )
    otc = otc.replace(
        '<div className="p-6 md:p-8 rounded-[28px] bg-surface-raised border border-border/80 space-y-4 shadow-sm">',
        '<div className="p-4 sm:p-6 md:p-8 rounded-2xl sm:rounded-[28px] bg-surface-raised border border-border/80 space-y-4 shadow-sm w-full overflow-hidden">'
    )
    otc = otc.replace(
        'p-8 sm:p-12 md:p-16 rounded-[32px]',
        'p-5 sm:p-10 md:p-16 rounded-2xl sm:rounded-[32px]'
    )
    with open(ot_path, 'w', encoding='utf-8') as f:
        f.write(otc)
    print("Patched app/order/[id]/OrderTrackingClient.tsx")

    print("\nALL HEADER AND OVERFLOW PATCHES APPLIED!")

if __name__ == '__main__':
    patch_headers()
