// ==UserScript==
// @name         Kinopoisk → kinokino.vip / fbfind.top / fbdomen.top
// @namespace    http://tampermonkey.net/
// @version      2026-07-26.2
// @description  Улучшения интерфейса, авто-ссылка на kinokino и очистка рекламы на зеркалах
// @author       amnesiaof
// @match        https://kinokino.vip/*
// @match        https://fbfind.top/*
// @match        https://fbdomen.top/*
// @match        https://www.kinopoisk.ru/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=kinopoisk.ru
// @grant        none
// @updateURL   https://raw.githubusercontent.com/amnesiaof/flcksbr-top-userscript/main/flcksbr-top.user.js
// @downloadURL https://raw.githubusercontent.com/amnesiaof/flcksbr-top-userscript/main/flcksbr-top.user.js
// ==/UserScript==

(function() {
    'use strict';

    // Зеркала, на которых нужно удалять рекламу и модалки
    const mirrorHosts = ['kinokino.vip', 'fbfind.top', 'fbdomen.top'];
    const isMirror = mirrorHosts.some(h => window.location.hostname.includes(h));
    const isKinopoisk = window.location.hostname.includes('kinopoisk.ru');

    // --- 1. Универсально убираем фиксированную высоту у .wrapper ---
    const style = document.createElement('style');
    style.textContent = `
        .wrapper {
            height: auto !important;
        }
    `;
    document.head.appendChild(style);

    // --- 2. Логика для зеркал: удаляем рекламу и модалки ---
    if (isMirror) {
        function removeAds() {
            // Селекторы, которые могут встречаться на зеркалах
            const selectorsToRemove = [
                '#instruction-modal',              // модалка "Новая инструкция"
                '#tgWrapper',                      // баннер Telegram
                '.topAdPad',                       // блок с movie_video
                '#TopAdMb',                        // верхний мобильный баннер
                '.adDown',                         // нижняя реклама
                '.brand'                           // бренд-реклама сверху
            ];

            selectorsToRemove.forEach(sel => {
                document.querySelectorAll(sel).forEach(el => el.remove());
            });

            // Подчищаем рекламные скрипты по домену
            document.querySelectorAll('script[src*="vak345.com"]').forEach(el => el.remove());
        }

        removeAds();

        // Следим за динамическими изменениями (SPA навигация может перерисовывать элементы)
        const observer = new MutationObserver(() => removeAds());
        observer.observe(document.body, { childList: true, subtree: true });
    }

    // --- 3. Логика для kinopoisk.ru: меняем ссылку у постера ---
    if (isKinopoisk) {
        function replacePosterLink() {
            const link = document.querySelector('a.styles_posterLink__JMbfE');
            if (link && !link.dataset.kinokinoPatched) {
                const match = window.location.pathname.match(/\/(\d+)/);
                if (match) {
                    const id = match[1];
                    link.href = `https://kinokino.vip/film/${id}`;
                    link.dataset.kinokinoPatched = '1'; // защита от зацикливания
                }
            }
        }

        replacePosterLink();

        const observer = new MutationObserver(() => replacePosterLink());
        observer.observe(document.body, { childList: true, subtree: true });
    }
})();
