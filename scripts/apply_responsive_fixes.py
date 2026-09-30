import os
import re

def patch_files():
    base_dir = r'C:\Users\aminj\Downloads\SAAS 7'

    # 1. Patch app/globals.css
    globals_css_path = os.path.join(base_dir, 'app', 'globals.css')
    with open(globals_css_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Add overflow-x: hidden to html, body
    old_body_rule = re.search(r'html,\s*body\s*\{[^}]*\}', content)
    if old_body_rule:
        matched = old_body_rule.group(0)
        if 'overflow-x: hidden' not in matched:
            new_rule = matched[:-1].rstrip() + "\n  overflow-x: hidden;\n  max-width: 100vw;\n  width: 100%;\n}"
            content = content.replace(matched, new_rule)
            with open(globals_css_path, 'w', encoding='utf-8') as f:
                f.write(content)
            print("Patched app/globals.css (added overflow-x: hidden)")
        else:
            print("app/globals.css already has overflow-x: hidden")

    # 2. Patch components/marketing/AwwwardsHero.tsx
    hero_path = os.path.join(base_dir, 'components', 'marketing', 'AwwwardsHero.tsx')
    with open(hero_path, 'r', encoding='utf-8') as f:
        hero_content = f.read()
    
    # Ensure hero section and containers prevent overflow
    hero_content = hero_content.replace(
        'max-w-7xl mx-auto px-6 relative z-10',
        'max-w-7xl mx-auto px-4 sm:px-6 relative z-10 w-full overflow-hidden'
    )
    with open(hero_path, 'w', encoding='utf-8') as f:
        f.write(hero_content)
    print("Patched components/marketing/AwwwardsHero.tsx")

    # 3. Patch components/marketing/InspectionStage.tsx
    stage_path = os.path.join(base_dir, 'components', 'marketing', 'InspectionStage.tsx')
    with open(stage_path, 'r', encoding='utf-8') as f:
        stage_content = f.read()
    
    # Make toolbar responsive on small screens
    stage_content = stage_content.replace(
        'flex flex-wrap items-center justify-between gap-3 px-5 py-3.5',
        'flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 px-3 sm:px-5 py-3'
    )
    stage_content = stage_content.replace(
        'relative p-5 bg-neutral-100/50',
        'relative p-3 sm:p-5 bg-neutral-100/50'
    )
    with open(stage_path, 'w', encoding='utf-8') as f:
        f.write(stage_content)
    print("Patched components/marketing/InspectionStage.tsx")

    # 4. Patch app/tracker/[id]/TrackerClient.tsx
    tracker_path = os.path.join(base_dir, 'app', 'tracker', '[id]', 'TrackerClient.tsx')
    with open(tracker_path, 'r', encoding='utf-8') as f:
        tracker_content = f.read()

    # Shorten live telemetry text on mobile in header
    tracker_content = tracker_content.replace(
        '<span className="uppercase tracking-wider">',
        '<span className="hidden sm:inline uppercase tracking-wider">'
    )
    # Ensure main container prevents overflow
    tracker_content = tracker_content.replace(
        'main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 space-y-8"',
        'main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 space-y-8 overflow-hidden"'
    )
    with open(tracker_path, 'w', encoding='utf-8') as f:
        f.write(tracker_content)
    print("Patched app/tracker/[id]/TrackerClient.tsx")

    # 5. Patch app/order/[id]/OrderTrackingClient.tsx
    order_path = os.path.join(base_dir, 'app', 'order', '[id]', 'OrderTrackingClient.tsx')
    with open(order_path, 'r', encoding='utf-8') as f:
        order_content = f.read()

    # Make simulator buttons wrap on mobile
    order_content = order_content.replace(
        'className="inline-flex p-1 rounded-xl bg-sand border border-border/80 gap-1 self-start sm:self-auto"',
        'className="flex flex-wrap sm:inline-flex p-1 rounded-xl bg-sand border border-border/80 gap-1 self-start sm:self-auto"'
    )
    with open(order_path, 'w', encoding='utf-8') as f:
        f.write(order_content)
    print("Patched app/order/[id]/OrderTrackingClient.tsx")

    # 6. Patch app/verify/page.tsx
    verify_path = os.path.join(base_dir, 'app', 'verify', 'page.tsx')
    with open(verify_path, 'r', encoding='utf-8') as f:
        verify_content = f.read()

    verify_content = verify_content.replace(
        'main className="flex-1 py-16 md:py-24 px-6"',
        'main className="flex-1 py-12 md:py-24 px-4 sm:px-6 overflow-hidden"'
    )
    verify_content = verify_content.replace(
        'Card className="p-8 md:p-10',
        'Card className="p-5 sm:p-8 md:p-10'
    )
    with open(verify_path, 'w', encoding='utf-8') as f:
        f.write(verify_content)
    print("Patched app/verify/page.tsx")

    # 7. Patch app/verify/[code]/VerifyCodeClient.tsx
    verify_code_path = os.path.join(base_dir, 'app', 'verify', '[code]', 'VerifyCodeClient.tsx')
    with open(verify_code_path, 'r', encoding='utf-8') as f:
        verify_code_content = f.read()

    verify_code_content = verify_code_content.replace(
        'main className="flex-1 py-12 md:py-16 px-6"',
        'main className="flex-1 py-12 md:py-16 px-4 sm:px-6 overflow-hidden"'
    )
    verify_code_content = verify_code_content.replace(
        'Card className="p-8 md:p-10',
        'Card className="p-5 sm:p-8 md:p-10'
    )
    with open(verify_code_path, 'w', encoding='utf-8') as f:
        f.write(verify_code_content)
    print("Patched app/verify/[code]/VerifyCodeClient.tsx")

    # 8. Patch components/marketing/ComparisonTable.tsx
    comp_path = os.path.join(base_dir, 'components', 'marketing', 'ComparisonTable.tsx')
    with open(comp_path, 'r', encoding='utf-8') as f:
        comp_content = f.read()

    comp_content = comp_content.replace(
        'section className="py-20 md:py-32 bg-canvas border-b border-border/60"',
        'section className="py-20 md:py-32 bg-canvas border-b border-border/60 overflow-hidden"'
    )
    comp_content = comp_content.replace(
        'div className="max-w-7xl mx-auto px-6 space-y-16"',
        'div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-16 w-full overflow-hidden"'
    )
    with open(comp_path, 'w', encoding='utf-8') as f:
        f.write(comp_content)
    print("Patched components/marketing/ComparisonTable.tsx")

    # 9. Patch app/pricing/page.tsx
    pricing_path = os.path.join(base_dir, 'app', 'pricing', 'page.tsx')
    with open(pricing_path, 'r', encoding='utf-8') as f:
        pricing_content = f.read()

    pricing_content = pricing_content.replace(
        'main className="flex-1"',
        'main className="flex-1 overflow-hidden w-full"'
    )
    pricing_content = pricing_content.replace(
        'section className="pt-16 pb-12 md:pt-24 md:pb-16 bg-gradient-hero border-b border-border/60 text-center px-6"',
        'section className="pt-16 pb-12 md:pt-24 md:pb-16 bg-gradient-hero border-b border-border/60 text-center px-4 sm:px-6 overflow-hidden"'
    )
    pricing_content = pricing_content.replace(
        'section className="py-16 md:py-24 bg-surface border-b border-border/60 px-6"',
        'section className="py-16 md:py-24 bg-surface border-b border-border/60 px-4 sm:px-6 overflow-hidden"'
    )
    with open(pricing_path, 'w', encoding='utf-8') as f:
        f.write(pricing_content)
    print("Patched app/pricing/page.tsx")

    print("\nALL RESPONSIVE PATCHES APPLIED SUCCESSFULLY!")

if __name__ == '__main__':
    patch_files()
