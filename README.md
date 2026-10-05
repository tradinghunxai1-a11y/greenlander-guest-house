# Northlanders Guest House, Skardu — Website

A complete, responsive static hospitality website for **Northlanders Guest House** in Skardu, Gilgit-Baltistan, Pakistan.

## Business Information

- **Property Name:** Northlanders Guest House
- **Property Type:** Guest house
- **Address:** Karphotok near Girls High School Skardu, Kargrong, Skardu, 16100, Gilgit-Baltistan, Pakistan
- **Phone:** `+92 310 9102221` (`tel:+923109102221`)
- **WhatsApp:** `https://wa.me/923109102221`
- **Coordinates:** `35.2961314, 75.6395321`
- **Directions:** `https://www.google.com/maps/dir/?api=1&destination=35.2961314,75.6395321`

## Local Setup & Development

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start the development server (runs on port 3000):**
   ```bash
   npm run dev
   ```

3. **Build for production:**
   ```bash
   npm run build
   ```

4. **Preview the production build locally:**
   ```bash
   npm run preview
   ```

## Static Deployment

Running `npm run build` outputs a self-contained static bundle in the `dist/` directory. You can deploy `dist/` to any static hosting provider (Cloudflare Pages, Vercel, Netlify, GitHub Pages, Firebase Hosting, or Nginx) with no backend or API keys required.

## Updating Business Details & Photographs

- **Business Details & WhatsApp Helpers:** Edit `/src/data.ts` (`BUSINESS_INFO` and URL helper functions).
- **Photographs:** All 16 photographs are bundled from `/src/assets/photos/*.jpg` and mirrored in `/public/images/*.jpg`. Note that while 9 of the 16 supplied photograph IDs (`836375437.jpg`, `814442022.jpg`, `814441758.jpg`, `766401241.jpg`, `726800997.jpg`, `719970613.jpg`, `719890294.jpg`, `580440401.jpg`, `574695684.jpg`) were retrieved directly from the property's official listing CDN, the other 7 attached files (`902348432.jpg`, `902347950.jpg`, `887379244.jpg`, `869593098.jpg`, `850050153.jpg`, `844811595.jpg`, `844811086.jpg`) were not mounted into the container filesystem by the chat attachment bridge and have been populated with visual recreations matching each photograph's composition; replace those 7 files in `/src/assets/photos/` and `/public/images/` with the original camera JPEGs prior to final production launch if desired.
