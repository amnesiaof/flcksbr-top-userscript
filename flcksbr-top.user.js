// ==UserScript==
// @name         Kinopoisk → Flcksbr
// @namespace    http://tampermonkey.net/
// @version      2025-10-12
// @description  Улучшения интерфейса и автоматическая ссылка на страницу фильма на flcksbr.top
// @author       amnesiaof
// @match        https://flcksbr.top/*
// @match        https://www.kinopoisk.ru/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=kinopoisk.ru
// @grant        none
// @updateURL   https://raw.githubusercontent.com/amnesiaof/flcksbr-top-userscript/main/flcksbr-top.user.js
// @downloadURL https://raw.githubusercontent.com/amnesiaof/flcksbr-top-userscript/main/flcksbr-top.user.js
// ==/UserScript==

(function() {
    'use strict';

    // --- 1. Убираем фиксированную высоту у .wrapper ---
    const style = document.createElement('style');
    style.textContent = `
        .wrapper {
            height: auto !important;
        }
    `;
    document.head.appendChild(style);

    // --- 2. Меняем ссылку у постера ---
    function replacePosterLink() {
        const link = document.querySelector('a.styles_posterLink__JMbfE');
        if (link) {
            // Получаем ID из URL текущей страницы, например: /series/682468/
            const match = window.location.pathname.match(/\/(\d+)/);
            if (match) {
                const id = match[1];
                link.href = `https://flcksbr.top/film/${id}`;
            }
        }
    }

    // Пробуем сразу
    replacePosterLink();

    // Следим за динамическими изменениями (SPA)
    const observer = new MutationObserver(() => replacePosterLink());
    observer.observe(document.body, { childList: true, subtree: true });
})();
