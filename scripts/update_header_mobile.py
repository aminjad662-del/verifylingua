import os

def update_header():
    header_path = r'C:\Users\aminj\Downloads\SAAS 7\components\layout\Header.tsx'
    with open(header_path, 'r', encoding='utf-8') as f:
        c = f.read()

    # Make header container max-w-full and px-3 sm:px-6
    c = c.replace(
        'max-w-7xl mx-auto flex h-16 items-center justify-between px-4 sm:px-6',
        'max-w-7xl mx-auto flex h-16 items-center justify-between px-3.5 sm:px-6 w-full overflow-hidden'
    )

    # Make logo slightly more compact on < sm
    c = c.replace(
        'w-10 h-10 rounded-xl bg-brand-500 text-white shadow-sm transition-transform group-hover:scale-105',
        'w-8 sm:w-10 h-8 sm:h-10 rounded-xl bg-brand-500 text-white shadow-sm transition-transform group-hover:scale-105'
    )
    c = c.replace(
        '<ShieldCheck className="w-6 h-6" />',
        '<ShieldCheck className="w-5 sm:w-6 h-5 sm:h-6" />'
    )
    c = c.replace(
        'text-xl font-extrabold tracking-tight text-brand-ink font-display',
        'text-lg sm:text-xl font-extrabold tracking-tight text-brand-ink font-display'
    )

    # Make right-side button gap tighter on mobile: gap-2 sm:gap-3
    c = c.replace(
        '<div className="flex items-center gap-3">',
        '<div className="flex items-center gap-2 sm:gap-3 shrink-0">'
    )

    # In mobile dashboard button, make it icon-only on mobile
    old_mobile_dash = '''          {/* Quick Mobile Dashboard Button */}
          <Button
            asChild
            variant="outline"
            size="sm"
            className="md:hidden h-9 px-2.5 rounded-lg text-xs font-bold border-border bg-surface text-brand-ink flex items-center gap-1.5"
          >
            <Link href="/dashboard">
              <LayoutDashboard className="w-3.5 h-3.5 text-brand-500" />
              <span>Dashboard</span>
            </Link>
          </Button>'''

    new_mobile_dash = '''          {/* Quick Mobile Dashboard Button */}
          <Button
            asChild
            variant="outline"
            size="sm"
            className="md:hidden h-9 w-9 sm:w-auto px-2 sm:px-2.5 rounded-lg text-xs font-bold border-border bg-surface text-brand-ink flex items-center justify-center gap-1.5"
            aria-label="Dashboard"
          >
            <Link href="/dashboard">
              <LayoutDashboard className="w-4 h-4 text-brand-500" />
              <span className="hidden sm:inline">Dashboard</span>
            </Link>
          </Button>'''

    if old_mobile_dash in c:
        c = c.replace(old_mobile_dash, new_mobile_dash)
        print("Replaced old mobile dashboard button with responsive icon-only version")
    else:
        print("Warning: old_mobile_dash pattern not found verbatim, searching by regex...")
        import re
        c = re.sub(
            r'<Button\s+asChild\s+variant="outline"\s+size="sm"\s+className="md:hidden[^"]*"[^>]*>[\s\S]*?<span>Dashboard</span>[\s\S]*?</Button>',
            new_mobile_dash,
            c
        )

    # Also compact the mobile menu hamburger button
    c = c.replace(
        'className="md:hidden p-2 rounded-xl border border-border text-brand-ink hover:bg-surface focus:outline-none focus:ring-2 focus:ring-brand-500"',
        'className="md:hidden h-9 w-9 flex items-center justify-center rounded-xl border border-border text-brand-ink hover:bg-surface focus:outline-none focus:ring-2 focus:ring-brand-500"'
    )
    c = c.replace(
        '{mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}',
        '{mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}'
    )

    with open(header_path, 'w', encoding='utf-8') as f:
        f.write(c)
    print("Header successfully updated with clean mobile compact layout!")

if __name__ == '__main__':
    update_header()
