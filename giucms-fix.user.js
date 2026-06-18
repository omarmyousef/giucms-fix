// ==UserScript==
// @name         GIU/GUC CMS Fix
// @namespace    https://omarmyousef.bennuvate.com/
// @version      2.3
// @description  Enhanced downloader for GIU/GUC course materials with PDF preview, batch download, filters by week/content type
// @author       Omar M. Youssef
// @match        *://cms.giu-uni.de/apps/student/*
// @match        *://cms.guc.edu.eg/apps/student/*
// @grant        none
// @license      https://github.com/omarmyousef/giucms-fix/raw/main/license.md
// @updateURL    https://github.com/omarmyousef/giucms-fix/raw/refs/heads/main/giucms-fix.user.js
// @downloadURL  https://github.com/omarmyousef/giucms-fix/raw/refs/heads/main/giucms-fix.user.js
// @copyright    Omar - https://omarmyousef.bennuvate.com
// @icon         https://www.giu-uni.de/favicon.ico
// @run-at       document-end
// ==/UserScript==

(function () {
    "use strict";

    // Week group title
    const weekHeaders = Array.from(document.querySelectorAll("div.col-lg-6 h2.text-big"));

    const sortedHeaders = weekHeaders
        .map(h2 => {
            const dateMatch = h2.textContent.match(/\d{4}-\d{1,2}-\d{1,2}/);
            const dateString = dateMatch ? dateMatch[0] : null;

            return {
                element: h2,
                date: dateString ? new Date(dateString) : null
            };
        })
        .sort((a, b) => a.date - b.date)
        .map((item, index) => ({
            ...item,
            index: index + 1
        }));

    // Update week headers
    sortedHeaders.forEach(({ element, date, index }) => {
        const formattedDate = date ?
            `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}` :
            'Unknown Date';
        element.setAttribute("weekindex", index);
        element.innerHTML = `Week ${index} <span style="font-size: 12px;"> (Started ${formattedDate}) </span>`;
    });

    function normalizeCourseName(str) {
        // Match any text within parentheses that has at least one letter and one number
        const regex = /\(\|?([A-Za-z]+\d[A-Za-z\d]*)\|?\)/;
        const match = str.match(regex);

        if (!match) return str;

        const code = match[1];
        const cleaned = str
            .replace(/\(\|?([A-Za-z]+\d[A-Za-z\d]*)\|?\)/, "")
            .replace(/\(\d+\)/, "")
            .trim();

        const courseName = cleaned ? `${cleaned} (${code.toUpperCase()})` : code.toUpperCase();
        document.title = courseName;

        return courseName;
    }

    const courseNameRaw =
        document.querySelector(".menu-header-title span")?.innerText;

    const courseName = courseNameRaw ? normalizeCourseName(courseNameRaw) : "Unknown Course";

    const materials = [];

    document.querySelectorAll(".card-body").forEach((card) => {
        const link = card.querySelector("a#download");
        if (!link) return;

        const rawName = card.querySelector("strong")?.textContent || "file";
        const fileName = rawName.split("-").slice(1).join("-").trim() || rawName;

        // Safe lookup for week
        const parentRow = card.parentElement.parentElement.parentElement.parentElement.querySelector(".card-header");
        const weekHeader = parentRow ? parentRow.querySelector("[weekindex]") : null;
        const courseWeek = weekHeader ? weekHeader.getAttribute("weekindex") : parentRow.textContent;
        const contentType = card.querySelector("strong")?.parentElement.textContent.split("(")[1]?.split(")")[0] || "";
        const subtitle = card.querySelectorAll("div")?.[1].textContent || "";
        const legacyInputs = card.querySelectorAll("input");

        const fileExt = link.href.split(".").pop().toLowerCase();

        materials.push({
            title: fileName,
            week: courseWeek,
            url: link.href,
            type: fileExt,
            contentType: contentType,
            subtitle: subtitle,
            downloadName: `${fileName} (${courseName})${courseWeek ? ` (Week ${courseWeek})` : ""}`,
            legacyInputs
        });
    });

    console.log("Collected Materials:", materials);

    // Group by week
    const grouped = {};
    materials.forEach((mat) => {
        if (!grouped[mat.week]) grouped[mat.week] = [];
        grouped[mat.week].push(mat);
    });

    // Add CSS to disable scrolling
    const style = document.createElement('style');
    style.textContent = `
    .no-scroll {
        overflow: hidden !important;
        position: fixed !important;
        width: 100% !important;
    }
`;
    document.head.appendChild(style);

    /// Helper Functions
    function buttonStyle(color) {
        return `
        background: ${color};
        border: none;
        padding: 8px 14px;
        border-radius: 6px;
        font-size: 13px;
        font-weight: 500;
        color: #fff;
        cursor: pointer;
        transition: background 0.2s ease;
    `;
    }

    function openPDFPreview(mat) {
        // Save current scroll position
        const scrollX = window.scrollX;
        const scrollY = window.scrollY;

        // Disable body scrolling
        document.body.classList.add('no-scroll');

        // Create PDF viewer popup with title
        const popup = document.createElement('div');
        popup.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.95);
            z-index: 10000;
            display: flex;
            flex-direction: column;
            align-items: center;
            padding: 20px 10px;
        `;

        // Header with title and close button
        const header = document.createElement('div');
        header.style.cssText = `
            width: 98%;
            max-width: 98%;
            background: #1a1a1a;
            color: white;
            padding: 15px 25px;
            border-radius: 10px 10px 0 0;
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-family: 'Segoe UI', Roboto, sans-serif;
            margin-bottom: 0;
            box-shadow: 0 4px 20px rgba(0,0,0,0.5);
        `;

        const titleDiv = document.createElement('div');
        titleDiv.style.cssText = 'flex: 1;';

        const courseTitle = document.createElement('div');
        courseTitle.textContent = `${mat.title}`;
        courseTitle.style.cssText = `
            font-size: 16px;
            font-weight: 600;
            color: #fff;
            margin-bottom: 4px;
        `;

        const fileInfo = document.createElement('div');
        fileInfo.style.cssText = `
            font-size: 14px;
            color: #ccc;
            display: flex;
            gap: 15px;
            flex-wrap: wrap;
        `;

        const fileNameSpan = document.createElement('span');
        fileNameSpan.textContent = `${courseName}`;

        // const weekSpan = document.createElement('span');
        // weekSpan.textContent = `📅 Week ${mat.week}`;

        // const typeSpan = document.createElement('span');
        // typeSpan.textContent = `🏷️ ${mat.contentType}`;

        fileInfo.appendChild(fileNameSpan);
        // fileInfo.appendChild(weekSpan);
        // fileInfo.appendChild(typeSpan);

        titleDiv.appendChild(courseTitle);
        titleDiv.appendChild(fileInfo);

        const closeBtn = document.createElement('button');
        closeBtn.innerHTML = '✕';
        closeBtn.title = 'Close Preview';
        closeBtn.style.cssText = `
            background: #bd2639;
            color: white;
            border: none;
            width: 40px;
            height: 40px;
            border-radius: 50%;
            cursor: pointer;
            font-size: 18px;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.2s ease;
        `;

        // Function to close the popup
        function closePopup() {
            document.body.classList.remove('no-scroll');
            document.removeEventListener('keydown', escHandler);
            popup.remove();
            // Restore scroll position using requestAnimationFrame to ensure DOM update
            requestAnimationFrame(() => {
                window.scrollTo(scrollX, scrollY);
            });
        }

        closeBtn.onmouseenter = () => {
            closeBtn.style.background = '#d9374a';
        };
        closeBtn.onmouseleave = () => {
            closeBtn.style.background = '#bd2639';
        };
        closeBtn.onclick = closePopup;

        header.appendChild(titleDiv);
        header.appendChild(closeBtn);

        // PDF viewer - now takes almost full window width
        const viewer = document.createElement('iframe');
        viewer.src = mat.url;
        viewer.style.cssText = `
            width: 98%;
            max-width: 98%;
            height: calc(100vh - 140px);
            background: white;
            border: none;
            border-radius: 0 0 10px 10px;
            box-shadow: 0 10px 40px rgba(0,0,0,0.7);
        `;

        // Close on ESC key
        function escHandler(e) {
            if (e.key === 'Escape') closePopup();
        }
        document.addEventListener('keydown', escHandler);

        // Close when clicking outside (on the background)
        popup.addEventListener('click', (e) => {
            if (e.target === popup) closePopup();
        });

        // Assemble popup
        popup.appendChild(header);
        popup.appendChild(viewer);
        document.body.appendChild(popup);
    }

    function getFiltered(selectedType, week) {
        return materials.filter(mat => {
            const typeMatch = selectedType === "All Types" || mat.contentType === selectedType;
            const weekMatch = week === "All Weeks" || mat.week === week;
            return typeMatch && weekMatch;
        });
    }

    const scriptContainer = document.createElement("div");
    scriptContainer.id = "giu-downloader-container";
    scriptContainer.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    padding: 12px 14px;
    border-radius: 12px;
    background: rgba(255, 255, 255, 0.88);
    backdrop-filter: blur(6px);
    -webkit-backdrop-filter: blur(6px);
    border: 1px solid rgba(255, 255, 255, 0.4);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
    z-index: 9999;
    width: 290px; /* Reduced from 380px for a much slimmer footprint */
    box-sizing: border-box;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    max-height: 75vh;
    display: flex;
    flex-direction: column;
`;

    // Header
    const header = document.createElement("div");
    header.style.cssText = `
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;
    padding-bottom: 6px;
    border-bottom: 1px solid rgba(0, 0, 0, 0.05);
`;

    const title = document.createElement("h3");
    title.textContent = "GIU/GUC CMS Fix";
    title.style.cssText = `
    margin: 0; 
    font-size: 13px; /* Slightly scaled down */
    font-weight: 700; 
    color: #1a1a1a;
    letter-spacing: -0.2px;
`;
    header.appendChild(title);

    // Filters Layout Container
    const filtersContainer = document.createElement("div");
    filtersContainer.style.cssText = `
    display: flex;
    justify-content: space-between;
    width: 100%;
    gap: 8px; /* Tighter gap */
    margin-bottom: 10px;
`;

    // Shared styling helper for compact select dropdowns
    const applySelectStyles = (el) => {
        el.style.cssText = `
        padding: 5px 8px; /* Slimmer vertical padding */
        border-radius: 6px;
        border: 1px solid rgba(0, 0, 0, 0.12);
        background: #ffffff;
        font-size: 11px; /* Highly compact, readable typography */
        font-weight: 500;
        color: #444;
        outline: none;
        cursor: pointer;
        transition: all 0.2s ease;
    `;
        el.onfocus = () => {
            el.style.borderColor = "#e4a016";
            el.style.boxShadow = "0 0 0 2px rgba(228, 160, 22, 0.15)";
        };
        el.onblur = () => {
            el.style.borderColor = "rgba(0, 0, 0, 0.12)";
            el.style.boxShadow = "none";
        };
    };

    // Content Type filter
    const typeFilter = document.createElement("select");
    applySelectStyles(typeFilter);
    typeFilter.style.width = "58%";

    const uniqueTypes = ["All Types", ...new Set(materials.map(m => m.contentType).filter(Boolean))];
    uniqueTypes.forEach(type => {
        const opt = document.createElement("option");
        opt.value = type;
        opt.textContent = type;
        typeFilter.appendChild(opt);
    });

    // Week filter
    const weekFilter = document.createElement("select");
    applySelectStyles(weekFilter);
    weekFilter.style.width = "42%";

    const uniqueWeeks = ["All Weeks", ...Object.keys(grouped).sort((a, b) => a - b)];
    uniqueWeeks.forEach(week => {
        const opt = document.createElement("option");
        opt.value = week;
        opt.textContent = week === "All Weeks" ? "All Weeks" : `Week ${week}`;
        weekFilter.appendChild(opt);
    });

    filtersContainer.appendChild(typeFilter);
    filtersContainer.appendChild(weekFilter);

    // Materials list scrollable engine housing
    const listContainer = document.createElement("div");
    listContainer.style.cssText = `
    display: flex;
    flex-direction: column;
    gap: 8px; /* Tighter structural spacing between list items */
    overflow-y: auto;
    flex-grow: 1;
    padding-right: 2px;
    padding-bottom: 220px;
`;

    // Custom sleek, minimal scrollbar styles
    const styleSheet = document.createElement("style");
    styleSheet.textContent = `
    #giu-downloader-container div::-webkit-scrollbar {
        width: 4px; /* Narrower scroll track */
    }
    #giu-downloader-container div::-webkit-scrollbar-track {
        background: transparent;
    }
    #giu-downloader-container div::-webkit-scrollbar-thumb {
        background: rgba(0, 0, 0, 0.12);
        border-radius: 10px;
    }
    #giu-downloader-container div::-webkit-scrollbar-thumb:hover {
        background: rgba(0, 0, 0, 0.2);
    }
`;
    document.head.appendChild(styleSheet);

    // Render function with filters
    function renderList() {
        listContainer.innerHTML = "";
        const selectedType = typeFilter.value;
        const selectedWeek = weekFilter.value;

        Object.keys(grouped)
            .sort((a, b) => a - b).reverse()
            .forEach((week) => {
                if (selectedWeek !== "All Weeks" && selectedWeek !== week) return;

                const weekMats = grouped[week].filter(mat => {
                    return selectedType === "All Types" || mat.contentType === selectedType;
                });

                if (weekMats.length === 0) return;

                const sectionWrapper = document.createElement("div");
                sectionWrapper.style.cssText = `
                font-size: 20px;
                font-weight: 700;
                margin: 20px 0 10px;
                color: #222;
            `;

                const contentGroup = document.createElement("div");
                contentGroup.style.cssText = `
                display: flex;
                flex-direction: column;
                align-items: flex-start; /* Keeps the title aligned with the left edge of the grid cards */
                max-width: 100%;
            `;

                const weekTitle = document.createElement("h2");
                weekTitle.textContent = `📚 Week ${week}`;
                weekTitle.style.cssText = `
                font-size: 20px;
                font-weight: 700;
                margin: 0 0 16px 0;
                color: #222;
            `;

                const grid = document.createElement("div");
                grid.style.cssText = `
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
                gap: 16px;
                width: 100%;
            `;
                weekMats.forEach(mat => {
                    const card = document.createElement("div");
                    card.style.cssText = `
                    border: 1px solid #e0e0e0;
                    border-radius: 10px;
                    padding: 16px;
                    background: #fff;
                    display: flex;
                    flex-direction: column;
                    justify-content: space-between;
                    gap: 8px;
                    box-shadow: 0 2px 6px rgba(0,0,0,0.05);
                `;
                    const nameEl = document.createElement("div");
                    nameEl.textContent = mat.title;
                    nameEl.style.cssText = "font-size: 16px; font-weight: 600; color: #333;";

                    const subtitleEl = document.createElement("div");
                    subtitleEl.textContent = mat.subtitle;
                    subtitleEl.style.cssText = "font-size: 12px; font-weight: 600; color: #555;";

                    const typeEl = document.createElement("div");
                    typeEl.textContent = `${mat.contentType} - ${mat.type}`;
                    typeEl.style.cssText = "font-size: 13px; color: #666; font-family: monospace;";

                    const btns = document.createElement("div");
                    btns.style.cssText = "display: flex; gap: 10px; margin-top: 10px; flex-wrap: wrap;";

                    if (mat.legacyInputs && mat.legacyInputs.length > 0 && mat.legacyInputs[0].classList.contains("vodbutton")) {
                        let vodbtn = btns.appendChild(mat.legacyInputs[0]);
                        vodbtn.style.cssText += buttonStyle("#2955c8");
                    }

                    const openBtn = document.createElement("button"); // Keep button element typing
                    openBtn.textContent = "Open";
                    openBtn.style.cssText = buttonStyle("#e4a016");

                    openBtn.onclick = (e) => {
                        e.preventDefault();

                        const customTabTitle = `${mat.title} | ${courseName}`;

                        // 1. Open a blank new tab
                        const newTab = window.open("about:blank", "_blank");

                        if (newTab) {
                            // 2. Inject custom layout with sticky header, full-height frame, and bottom-right floating footer badge
                            newTab.document.write(`
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>${customTabTitle}</title>
                <style>
                    body, html {
                        margin: 0;
                        padding: 0;
                        height: 100%;
                        overflow: hidden;
                        background-color: #1a1a1a;
                        font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
                    }
                    
                    /* Header bar tracking configuration */
                    .preview-header {
                        background: #1a1a1a;
                        color: white;
                        padding: 10px 16px;
                        box-sizing: border-box;
                        display: flex;
                        flex-direction: column;
                        gap: 2px;
                        border-bottom: 1px solid #2a2a2a;
                        box-shadow: 0 4px 20px rgba(0,0,0,0.3);
                        height: 64px;
                    }
                    
                    .file-title {
                        font-size: 16px;
                        font-weight: 600;
                        color: #fff;
                        white-space: nowrap;
                        overflow: hidden;
                        text-overflow: ellipsis;
                        height: 32px;
                    }
                    
                    .course-info {
                        font-size: 13px;
                        color: #ccc;
                    }
                    
                    /* Viewer container updated to take full remaining space minus only the header height */
                    .viewer-container {
                        height: calc(100% - 64px); 
                        width: 100%;
                        background: #323639;
                    }
                    
                    iframe {
                        width: 100%;
                        height: 100%;
                        border: none;
                    }

                    /* Updated floating badge footer configuration pinned to bottom right */
                    .preview-footer {
                        position: fixed;
                        bottom: 16px;
                        right: 16px;
                        padding: 6px 14px;
                        background: rgba(26, 26, 26, 0.85); /* Slightly translucent for a clean look over PDFs */
                        backdrop-filter: blur(4px);
                        border: 1px solid #2a2a2a;
                        border-radius: 20px; /* Rounded pill shape */
                        padding: 6px 14px;
                        box-sizing: border-box;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        font-size: 12px;
                        color: #888;
                        box-shadow: 0 4px 12px rgba(0,0,0,0.25);
                        z-index: 9999; /* Ensures it stays layered cleanly over native frames */
                    }

                    .preview-footer a {
                        color: #aaa;
                        text-decoration: none;
                        font-weight: bold;
                        margin-left: 4px;
                        transition: color 0.2s ease;
                    }

                    .preview-footer a:hover {
                        color: #fff;
                        text-decoration: underline;
                    }
                </style>
            </head>
            <body>
                <div class="preview-header">
                    <div class="file-title">${mat.title}</div>
                    <div class="course-info">${courseName}</div>
                </div>
                
                <div class="viewer-container">
                    <iframe src="${mat.url}"></iframe>
                </div>

                <div class="preview-footer">
                    CMS Fix • By <a target="_blank" href="https://omarmyousef.bennuvate.com">Omar</a>
                </div>
            </body>
            </html>
        `);
                            newTab.document.close(); // Conclude compilation stream
                        } else {
                            // Adaptive backup logic bypass for popup security boundaries
                            window.open(mat.url, "_blank");
                        }
                    };

                    btns.appendChild(openBtn);

                    const downloadBtn = document.createElement("button");
                    downloadBtn.textContent = "Download";
                    downloadBtn.style.cssText = buttonStyle("#bd2639");
                    downloadBtn.onclick = () => {
                        const a = document.createElement("a");
                        a.href = mat.url;
                        a.download = mat.downloadName;
                        a.click();
                    };
                    btns.appendChild(downloadBtn);

                    if (mat.type === "pdf") {
                        const viewBtn = document.createElement("button");
                        viewBtn.textContent = "Preview";
                        viewBtn.style.cssText = buttonStyle("#2955c8");
                        viewBtn.onclick = e => {
                            e.preventDefault();
                            openPDFPreview(mat);
                        };
                        btns.appendChild(viewBtn);
                    }

                    card.appendChild(nameEl);
                    card.appendChild(subtitleEl);
                    card.appendChild(btns);
                    card.appendChild(typeEl);
                    grid.appendChild(card);
                });

                // Assemble everything in order
                contentGroup.appendChild(weekTitle);
                contentGroup.appendChild(grid);
                sectionWrapper.appendChild(contentGroup);

                listContainer.appendChild(sectionWrapper);
            });
    }

    typeFilter.onchange = renderList;
    weekFilter.onchange = renderList;
    renderList();

    // Download All button
    const dlAllBtn = document.createElement("button");
    dlAllBtn.textContent =
        materials.length > 0
            ? `Download All (0/${getFiltered(typeFilter.value, weekFilter.value).length})`
            : "No files available";
    dlAllBtn.style.cssText = `
        width: 100%;
        padding: 10px;
        cursor: ${materials.length > 0 ? "pointer" : "not-allowed"};
        background: ${materials.length > 0 ? "#34a853" : "#cccccc"};
        color: white;
        border: none;
        border-radius: 4px;
        font-weight: 500;
        margin-top: 10px;
    `;

    if (getFiltered(typeFilter.value, weekFilter.value).length > 0) {
        let downloaded = 0;
        dlAllBtn.onclick = () => {
            const filtered = getFiltered(typeFilter.value, weekFilter.value);
            filtered.forEach((mat, i) => {
                setTimeout(() => {
                    const a = document.createElement("a");
                    a.href = mat.url;
                    a.download = mat.downloadName;
                    a.click();
                    dlAllBtn.textContent = `Download All (${++downloaded}/${filtered.length})`;
                }, i * 1000);
            });
        };

        // Update Download All button when filters change
        function updateDlAllBtn() {
            const filtered = getFiltered(typeFilter.value, weekFilter.value);
            dlAllBtn.textContent =
                filtered.length > 0
                    ? `Download ${filtered.length} files`
                    : "No files available";

            dlAllBtn.onclick = async () => {
                if (filtered.length === 0) return;
                dlAllBtn.disabled = true;
                dlAllBtn.textContent = "Preparing ZIP...";

                // Load JSZip from CDN if not present
                if (!window.JSZip) {
                    const script = document.createElement("script");
                    script.src = "https://cdn.jsdelivr.net/npm/jszip@3.10.1/dist/jszip.min.js";
                    document.head.appendChild(script);
                    await new Promise(res => script.onload = res);
                }
                const zip = new window.JSZip();

                let completed = 0;
                for (const mat of filtered) {
                    dlAllBtn.textContent = `Downloading (${++completed}/${filtered.length})...`;
                    try {
                        const resp = await fetch(mat.url);
                        const blob = await resp.blob();
                        zip.file(mat.downloadName + '.' + mat.type, blob);
                    } catch (e) {
                        zip.file(mat.downloadName + ".error.txt", "Failed to download: " + mat.url);
                    }
                }
                dlAllBtn.textContent = "Zipping files...";
                const zipBlob = await zip.generateAsync({ type: "blob" });
                const a = document.createElement("a");
                a.href = URL.createObjectURL(zipBlob);
                // Build ZIP filename based on filters
                let zipName = `${courseName}`;
                if (weekFilter.value !== "All Weeks") {
                    zipName += ` Week ${weekFilter.value}`;
                }
                if (typeFilter.value !== "All Types") {
                    zipName += ` ${typeFilter.value}`;
                } else {
                    zipName += ` Materials`;
                }
                zipName += ".zip";
                a.download = zipName;
                a.click();
                dlAllBtn.textContent = `Download ${filtered.length} files`;
                dlAllBtn.disabled = false;
            };
            dlAllBtn.style.cursor = filtered.length > 0 ? "pointer" : "not-allowed";
            dlAllBtn.style.background = filtered.length > 0 ? "#34a853" : "#cccccc";
        }

        updateDlAllBtn();
        typeFilter.addEventListener("change", updateDlAllBtn);
        weekFilter.addEventListener("change", updateDlAllBtn);
    }

    // Footer
    const footer = document.createElement("div");
    footer.style.cssText = `
        margin-top: 12px;
        font-size: 12px;
        color: #999;
        text-align: center;
    `;
    footer.innerHTML = `
        v2.3 • <a href="https://github.com/omarmyousef/giucms-fix/raw/main/giucms-fix.user.js" style="color:#999;">Check for Updates</a> •
        Made by <a target="_blank" href="https://omarmyousef.bennuvate.com" style="color:#999;font-weight:bold;">Omar</a>
    `;

    // Course name display
    const courseNameSpan = document.createElement("span");
    courseNameSpan.textContent = courseName + " ";
    courseNameSpan.style.cssText = `
        display: block;
        font-size: 14px;
        color: #666;
        font-weight: 600;
        margin-bottom: 8px;
        text-align: center;
    `;

    // Assemble container
    scriptContainer.appendChild(header);
    scriptContainer.appendChild(courseNameSpan);
    scriptContainer.appendChild(filtersContainer);
    document.querySelector(".card.mb-5.weeksdata").before(listContainer);
    scriptContainer.appendChild(dlAllBtn);
    scriptContainer.appendChild(footer);
    document.body.appendChild(scriptContainer);

    document.querySelectorAll(".card.mb-5.weeksdata").forEach(card => {
        card.remove();
    });

    console.log("CMS Fix v2.3 loaded");
})();