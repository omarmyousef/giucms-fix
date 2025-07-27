// ==UserScript==
// @name         GIU CMS Fix
// @namespace    https://omarmyousef.vercel.app/
// @version      1.0
// @description  Enhanced downloader for GIU course materials with PDF preview and batch download
// @author       Omar M. Youssef
// @match        *://cms.giu-uni.de/apps/student/CourseViewStn.aspx?id=*&sid=*
// @grant        none
// @license https://github.com/omarmyousef/giucms-fix/raw/main/license.md
// @copyright Omar - https://omarmyousef.vercel.app
// @icon         https://www.giu-uni.de/favicon.ico
// @run-at       document-end
// ==/UserScript==

(function() {
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
        width: 300px;
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

        const buttonContainer = document.createElement('div');
        buttonContainer.style.cssText = 'display: flex; gap: 8px; margin: 10px 0; align-items: center; justify-content:center; width: 100%;';

        const fileName = card.querySelector('strong')?.textContent || 'file';
        const courseName = document.querySelector(".menu-header-title span").innerText;
        const downloadName = `${courseName} - ${fileName}`;

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
        viewBtn.title = `Preview ${downloadName} PDF`;
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
            display: none;
        `;

        // Check if file is PDF
        if (link.href.toLowerCase().endsWith('.pdf')) {
            viewBtn.style.display = 'block';
            
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

        downloadBtn.onclick = e => {
            e.preventDefault();
            const a = document.createElement('a');
            a.href = link.href;
            a.download = downloadName;
            a.click();
        };
        
        buttonContainer.appendChild(viewBtn);
        buttonContainer.appendChild(downloadBtn);
        link.replaceWith(buttonContainer);
    });

    // Create download controls
    const totalFiles = document.querySelectorAll('.card-body').length;
    let downloaded = 0;

    const dlAllBtn = document.createElement('button');
    dlAllBtn.textContent = `Download All (${downloaded}/${totalFiles})`;
    dlAllBtn.style.cssText = `
        width: 100%;
        padding: 10px;
        cursor: pointer;
        background: #34a853;
        color: white;
        border: none;
        border-radius: 4px;
        font-weight: 500;
        margin-top: 10px;
    `;

    dlAllBtn.onclick = () => {
        const downloadButtons = document.querySelectorAll('.download-btn');
        downloadButtons.forEach((btn, i) => {
            setTimeout(() => {
                btn.click();
                dlAllBtn.textContent = `Download All (${++downloaded}/${totalFiles})`;
            }, i * 1000);
        });
    };

    // Create files counter
    const counter = document.createElement('div');
    counter.textContent = `${totalFiles} course materials available`;
    counter.style.cssText = 'font-size: 12px; color: #666; margin: 5px 0;';

    // Create attribution
    const attribution = document.createElement('div');
    attribution.style.cssText = 'font-size: 12px; color: #999; text-align: right; margin-top: 10px;';
    attribution.innerHTML = 'Made by <a target="_blank" href="https://omarmyousef.vercel.app" style="color:#999;font-weight:bold;">Omar M. Youssef</a>';

    // Assemble container
    scriptContainer.appendChild(header);
    scriptContainer.appendChild(counter);
    document.querySelectorAll('.card-body').forEach(card => {
        if (card.querySelector('a#download')) {
            scriptContainer.appendChild(card.querySelector('a#download').nextSibling);
        }
    });
    scriptContainer.appendChild(dlAllBtn);
    scriptContainer.appendChild(attribution);
    document.body.appendChild(scriptContainer);

    console.log('GIU CMS Fix loaded successfully');
})();
