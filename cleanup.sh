#!/usr/bin/env bash
# Lock Shield — Phase 8 cleanup script.
#
# NOT RUN AS PART OF THE MIGRATION. Produced for review only, per explicit
# instruction: "Do not delete anything; report only." Every entry below was
# independently verified (md5, grep, or by tracing an actual import/route
# caller) — see MIGRATION-PLAN.md's Phase 8 section for the full writeup,
# including two corrections found while re-verifying this script: the
# public/assets/images/service/ vs services/ pair, and project/ vs projects/,
# are BOTH byte-identical duplicate pairs, but which twin is the one actually
# referenced flips between them (service/ - singular - is live; projects/ -
# plural - is live). Read the file before running any part of it.
#
# Everything here uses `git rm` (or is already inside legacy/, itself already
# a non-destructive move performed in Phase 0/1), so every byte stays
# recoverable from git history even after this runs.
#
# Usage: review each section, comment out anything you're not sure about,
# then `bash cleanup.sh` from the repo root.

set -euo pipefail

echo "== 1. Legacy static site (moved out of the way in Phase 0/1, ~104MB) =="
echo "   Fully superseded by the Next.js app now live at every route it covered."
echo "   Includes: 21 root .html pages (8 *-old-backup), blog/ (55 articles,"
echo "   all imported into MongoDB in Phase 5), assets/, cart/, demo/, loose"
echo "   JPEGs, .htaccess-equivalents, robots.txt, sitemap.xml."
git rm -r legacy/

echo "== 2. True zero-reference duplicate image directories =="
echo "   public/assets/images/project/  -- dup of projects/ (projects/ is the"
echo "   one actually referenced, by (public)/projects/page.tsx and seed.ts)"
git rm -r public/assets/images/project/

echo "   public/assets/images/services/ -- dup of service/ (service/ is the"
echo "   one actually referenced, by seed.ts's Service.coverImage URLs)"
git rm -r public/assets/images/services/

echo "== 3. Purchased-theme leftovers never referenced by src/ =="
echo "   22 theme image directories + css/js/vendors (~109 files). Verified"
echo "   zero grep hits for each directory name under assets/images/ in src/."
git rm -r \
  public/assets/images/about/ \
  public/assets/images/award/ \
  public/assets/images/backgrounds/ \
  public/assets/images/bg/ \
  public/assets/images/blog/ \
  public/assets/images/brands/ \
  public/assets/images/choose/ \
  public/assets/images/cta/ \
  public/assets/images/faq/ \
  public/assets/images/footer/ \
  public/assets/images/funfact/ \
  public/assets/images/header/ \
  public/assets/images/hero/ \
  public/assets/images/icon/ \
  public/assets/images/icons/ \
  public/assets/images/logos/ \
  public/assets/images/marquee/ \
  public/assets/images/product/ \
  public/assets/images/shape/ \
  public/assets/images/shapes/ \
  public/assets/images/strategy/ \
  public/assets/images/team/ \
  public/assets/images/testimonial/ \
  public/assets/css/ \
  public/assets/js/ \
  public/assets/vendors/

echo "== 4. Publicly-served crash dump =="
git rm public/assets/images/bash.exe.stackdump

echo "== 5. Dead npm dependencies (zero imports across src/) =="
echo "   Keep despite looking unused: @tiptap/pm (Tiptap peer dep),"
echo "   sharp (dynamic import in src/lib/storage.ts), dotenv (side-effect"
echo "   import in the CLI scripts), react-dom (React peer dep)."
npm uninstall react-hook-form @hookform/resolvers next-themes slugify \
  @radix-ui/react-dropdown-menu @radix-ui/react-switch

echo "== NOT scripted — needs a manual code edit, not a file deletion: =="
echo "   - src/components/shared/states.tsx: remove DashboardSkeleton (~line 81)"
echo "     and FormSkeleton (~line 209) — both unused."
echo "   - src/lib/validation/common.ts:74: remove the unused"
echo "     'paginationQuerySchema' alias (listQuerySchema is used directly"
echo "     everywhere else)."
echo ""
echo "== Judgment call, not scripted — src/app/api/upload/sign/route.ts =="
echo "   Correct, working, but genuinely uncalled: both upload UI components"
echo "   (ImagePicker, MediaModal) already go through the simpler server-proxy"
echo "   /api/upload route, which also transparently supports the local-"
echo "   storage fallback this signed-upload route does not. Safe to remove"
echo "   if you don't plan a client-direct-to-Cloudinary upload path; keep if"
echo "   you do. Not deleted here either way."
echo ""
echo "== Before deleting any image, guard against production data pointing"
echo "   at it: the admin media picker reads the Media collection, not the"
echo "   filesystem, so nothing NEW can reference these — but pre-existing"
echo "   rows can. Check first, e.g.:"
echo "     db.services.find({\"coverImage.url\": /assets\\/images\\/services\\//})"
echo "     db.projects.find({\"coverImage.url\": /assets\\/images\\/project\\//})"

echo ""
echo "Done. Run 'npm run build' and re-screenshot the site at 375/768/1280"
echo "before committing — this script does not do that for you."
