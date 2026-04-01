CloudWatch Agent Configuration Builder - Protozoa Package V11
==============================================================

Upload Instructions:
1. Upload all files in this folder to Protozoa
2. Set "index.html" as the Root File
3. Ensure assets folder is uploaded with the same structure

Files included:
- index.html (ROOT FILE - set this as entry point)
- assets/index-*.js (JavaScript bundle)
- assets/index-*.css (Styles)
- assets/*.png, *.jpg, *.svg (Integration logos and icons)

The app will automatically load when you open the prototype.

Version: V11
Features:
- Nvidia GPU metrics with badge logic (show count when >7 metrics)
- Consistent badge display across all integrations
- Metrics: show individual badges when ≤7, count badge when >7
- Dimensions: show individual badges when ≤5, count badge when >5
- Logs: show individual badges when ≤3, count badge when >3
- Consistent 14px font sizing for metric headers
- Optimized spacing (xxs for collapsed/expanded, m for search states)
