# GIU CMS Fix
<img width="1115" height="527" alt="giucms-fix-v1 2" src="https://github.com/user-attachments/assets/7e3da39c-ecc9-4f51-8fd5-94d3fba56a33" />

A Tampermonkey userscript that enhances the GIU CMS platform with one-click downloading and PDF preview capabilities for course materials.

Give this Repo a **Star ⭐**

## Features

- 🚀 **Downloaded file names fix** that downloads the file with it's original name
- 📥 **Batch download** all course materials with progress counter
- 👁 **PDF preview** with full-screen viewer
- 📊 **File type detection** (PDF, DOCX, etc.)

## Installation / Update

1. Install the <a href="https://www.tampermonkey.net/" target="_blank" rel="noopener noreferrer">Tampermonkey</a> extension for your browser (if you don't have it already)
   - Install for <a href="https://addons.mozilla.org/en-US/firefox/addon/tampermonkey/" target="_blank" rel="noopener noreferrer">Firefox</a> 
   - Install for <a href="https://chromewebstore.google.com/detail/dhdgffkkebhmkfjojejmpbldmpobfkfo?utm_source=item-share-cb" target="_blank" rel="noopener noreferrer">Chrome</a>

2. **Install the script**:
   - <a href="https://github.com/omarmyousef/giucms-fix/raw/main/giucms-fix.user.js" target="_blank" rel="noopener noreferrer">Click here to install/update</a>
   - You should see a Tampermonkey installation screen like this:
   <img width="445" height="168" alt="image" src="https://github.com/user-attachments/assets/7c7e05f3-9ea4-4502-a1d5-198c48d4d602" />
   
- If the prompt doesn't appear, try:
     - Clicking the link again
     - Refreshing the page
     - Checking your browser's pop-up blocker

3. After installing the script, Navigate to your course materials page on <a href="https://cms.giu-uni.de/" target="_blank" rel="noopener noreferrer">GIU CMS</a>

> This script is open-source, so you can use it with confidence. Since the code is publicly available, you or others can review it to ensure there are no security risks.

## How to Use

- Click **Download** to download a single file
- Click **Preview** to preview PDF files (when available)
- Use **Download All** button to batch download all materials
- PDF previews can be closed with the **✕ Close** button

## 📜 License Terms and Disclaimer

This work is protected under a custom academic license:
- ✅ **Allowed**: Personal use, modifications, sharing
- ❌ **Prohibited**: Commercial use, removing credits, claiming authorship
- 🔐 **Required**: Clear attribution to original author

<a href="https://github.com/omarmyousef/giucms-fix/raw/main/license.md" target="_blank" rel="noopener noreferrer">View Full License and Disclaimer</a>

> "You may build upon this work, but not profit from it or claim it as your own."

# giucms-fix.user.js Changelog

## [v1.2.0] - 2024-08-06

### New Features
- **Week Card Formatting**  
  Updated week card titles from `"Week: YYYY-MM-DD"` to `"Week X - Started YYYY-MM-DD"` with proper chronological numbering
- **Improved Download Naming**  
  Enhanced download filenames to format:  
  `"Course Name - Trimmed Material Name (Week X)"` for better organization
- **Version Management**  
  Added version display with "Check for updates" button in footer

### Technical Improvements
- Implemented automatic week indexing (Week 1 = oldest date)
- Optimized filename trimming logic for special characters
