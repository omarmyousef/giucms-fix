

// ==UserScript==
// @name         GIU CMS Fix
// @namespace    https://omarmyousef.vercel.app/
// @version      1.2
// @description  Enhanced downloader for GIU course materials with PDF preview and batch download
// @author       Omar M. Youssef
// @match        *://cms.giu-uni.de/apps/student/*
// @grant        none
// @license      https://github.com/omarmyousef/giucms-fix/raw/main/license.md
// @updateURL    https://github.com/omarmyousef/giucms-fix/raw/refs/heads/main/giucms-fix.user.js
// @downloadURL  https://github.com/omarmyousef/giucms-fix/raw/refs/heads/main/giucms-fix.user.js
// @copyright    Omar - https://omarmyousef.vercel.app
// @icon         https://www.giu-uni.de/favicon.ico
// @run-at       document-end
// ==/UserScript==

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

// Update
sortedHeaders.forEach(({ element, date, index }) => {
    const formattedDate = date ?
        `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}` :
        'Unknown Date';
    element.setAttribute("weekindex", index);
    element.innerHTML = `Week ${index} <span style="font-size: 12px;"> (Started ${formattedDate}) </span>`;
});

(function () {
    'use strict';

    // Create a container for all script controls
    const scriptContainer = document.createElement('div');
    scriptContainer.id = 'giu-downloader-container';
    scriptContainer.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: white;
        padding: 15px;
        border-radius: 10px;
        box-shadow: 0 4px 15px rgba(0,0,0,0.15);
        z-index: 9999;
        width: 340px;
        font-family: 'Segoe UI', Roboto, sans-serif;
    `;

    // Create header for the container
    const header = document.createElement('div');
    header.style.cssText = `
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 12px;
        padding-bottom: 8px;
        border-bottom: 1px solid #eee;
    `;
    const title = document.createElement('h3');
    title.textContent = 'GIU CMS Fix';
    title.style.cssText = 'margin: 0; font-size: 16px; color: #333;';
    header.appendChild(title);

    // Process all course material cards
    document.querySelectorAll('.card-body').forEach(card => {
        const link = card.querySelector('a#download');
        if (!link) return;

        const wrapper = document.createElement('div');
        wrapper.style.cssText = 'margin: 10px 0; width: 100%;';

        const buttonContainer = document.createElement('div');
        buttonContainer.style.cssText = 'display: flex; gap: 8px; align-items: center; justify-content: center; width: 100%;';

        const fileName = card.querySelector('strong')?.textContent?.split("-").slice(1)?.join("-")?.trim() || ""; card.querySelector('strong')?.textContent || 'file';
        const courseName = document.querySelector(".menu-header-title span").innerText;
        const courseWeek = card.parentElement.parentElement.parentElement.parentElement.querySelector("h2[weekindex]").getAttribute("weekindex");
        const downloadName = `${courseName} - ${fileName} ${courseWeek ? `(Week ${courseWeek})` : ""}`;

        // Get file extension
        const fileExt = link.href.split('.').pop().toLowerCase();
        const fileTypeDisplay = document.createElement('div');
        fileTypeDisplay.textContent = `.${fileExt}`;
        fileTypeDisplay.style.cssText = `
            text-align: center;
            font-size: 11px;
            color: #666;
            margin-top: 4px;
            font-family: monospace;
        `;

        // Download button
        const downloadBtn = document.createElement('button');
        downloadBtn.textContent = `Download`;
        downloadBtn.title = `Download ${downloadName}`;
        downloadBtn.className = 'download-btn';
        downloadBtn.style.cssText = `
            height: 36px;
            padding: 0 12px;
            cursor: pointer;
            background: #bd2639;
            color: white;
            border: none;
            border-radius: 4px;
            font-size: 14px;
            transition: all 0.2s;
        `;

        // View button (only for PDFs)
        const viewBtn = document.createElement('button');
        viewBtn.textContent = `Preview`;
        viewBtn.title = `Preview ${downloadName}`;
        viewBtn.className = 'view-btn';
        viewBtn.style.cssText = `
            height: 36px;
            padding: 0 12px;
            cursor: pointer;
            background: #4285f4;
            color: white;
            border: none;
            border-radius: 4px;
            font-size: 14px;
            transition: all 0.2s;
            display: ${fileExt === 'pdf' ? 'block' : 'none'};
        `;

        // Set up click handlers
        downloadBtn.onclick = e => {
            e.preventDefault();
            const a = document.createElement('a');
            a.href = link.href;
            a.download = downloadName;
            a.click();
        };

        if (fileExt === 'pdf') {
            viewBtn.onclick = e => {
                e.preventDefault();

                // Create PDF viewer popup
                const popup = document.createElement('div');
                popup.style.cssText = `
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: rgba(0,0,0,0.9);
                    z-index: 10000;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                `;

                const iframe = document.createElement('iframe');
                iframe.src = link.href;
                iframe.style.cssText = `
                    width: 90%;
                    height: 90%;
                    border: none;
                    border-radius: 8px;
                    box-shadow: 0 0 30px rgba(0,0,0,0.7);
                `;

                const closeBtn = document.createElement('button');
                closeBtn.textContent = '✕ Close';
                closeBtn.style.cssText = `
                    margin-top: 15px;
                    padding: 8px 20px;
                    background: #bd2639;
                    color: white;
                    border: none;
                    border-radius: 4px;
                    cursor: pointer;
                    font-size: 14px;
                `;

                closeBtn.onclick = () => popup.remove();

                popup.appendChild(iframe);
                popup.appendChild(closeBtn);
                document.body.appendChild(popup);
            };
        }

        buttonContainer.appendChild(viewBtn);
        buttonContainer.appendChild(downloadBtn);

        wrapper.appendChild(buttonContainer);
        wrapper.appendChild(fileTypeDisplay);
        link.replaceWith(wrapper);
    });

    // Create download controls (only for files that exist)
    const downloadButtons = document.querySelectorAll('.download-btn');
    const totalFiles = downloadButtons.length;
    let downloaded = 0;

    const dlAllBtn = document.createElement('button');
    dlAllBtn.textContent = totalFiles > 0 ? `Download All (${downloaded}/${totalFiles})` : 'No downloadable files';
    dlAllBtn.style.cssText = `
        width: 100%;
        padding: 10px;
        cursor: ${totalFiles > 0 ? 'pointer' : 'not-allowed'};
        background: ${totalFiles > 0 ? '#34a853' : '#cccccc'};
        color: white;
        border: none;
        border-radius: 4px;
        font-weight: 500;
        margin-top: 10px;
    `;

    if (totalFiles > 0) {
        dlAllBtn.onclick = () => {
            downloadButtons.forEach((btn, i) => {
                setTimeout(() => {
                    btn.click();
                    dlAllBtn.textContent = `Download All (${++downloaded}/${totalFiles})`;
                }, i * 1000);
            });
        };
    }

    // Create files counter
    const counter = document.createElement('div');
    counter.textContent = `${totalFiles} course materials available`;
    counter.style.cssText = 'font-size: 12px; color: #666;';

    // Create version info
    const versionInfo = document.createElement('div');
    versionInfo.innerHTML = `v1.2 • <a href="https://github.com/omarmyousef/giucms-fix/raw/main/giucms-fix.user.js" style="color:#999;text-decoration:underline;">Check for updates</a>`;
    versionInfo.style.cssText = 'font-size: 12px; color: #999;';

    // Create attribution
    const attribution = document.createElement('div');
    attribution.innerHTML = 'Made by <a target="_blank" href="https://omarmyousef.vercel.app" style="color:#999;font-weight:bold;">Omar M. Youssef</a>';
    attribution.style.cssText = 'font-size: 12px; color: #999;';

    // Create footer container
    const footerContainer = document.createElement('div');
    footerContainer.style.cssText = `
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    margin-top: 10px;
    padding: 8px 0;
    border-top: 1px solid #eee;
`;

    // Append elements to footer
    footerContainer.appendChild(versionInfo);
    footerContainer.appendChild(counter);
    footerContainer.appendChild(attribution);

    // Assemble container
    scriptContainer.appendChild(header);
    scriptContainer.appendChild(counter);
    document.querySelectorAll('.card-body').forEach(card => {
        if (card.querySelector('a#download')) {
            scriptContainer.appendChild(card.querySelector('a#download').nextSibling);
        }
    });
    scriptContainer.appendChild(dlAllBtn);
    scriptContainer.appendChild(footerContainer);  // Add the footer instead of just attribution
    document.body.appendChild(scriptContainer);

    console.log('GIU CMS Fix loaded successfully');
})();
