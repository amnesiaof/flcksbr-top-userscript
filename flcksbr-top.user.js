// ==UserScript==
// @name         Kinopoisk → kinokino.vip / fbfind.top / fbdomen.top
// @namespace    http://tampermonkey.net/
// @version      2026-10-22
// @description  Улучшения интерфейса, авто-ссылка на kinokino и очистка рекламы на зеркалах
// @author       amnesiaof
// @match        https://kinokino.vip/*
// @match        https://fbfind.top/*
// @match        https://fbdomen.top/*
// @match        https://brogiro.cfd/*
// @match        https://www.kinopoisk.ru/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=kinopoisk.ru
// @grant        none
// @updateURL   https://raw.githubusercontent.com/amnesiaof/flcksbr-top-userscript/main/flcksbr-top.user.js
// @downloadURL https://raw.githubusercontent.com/amnesiaof/flcksbr-top-userscript/main/flcksbr-top.user.js
// ==/UserScript==

(function() {
    'use strict';

    // Зеркала, на которых нужно удалять рекламу и растягивать плеер
    const mirrorHosts = ['kinokino.vip', 'fbfind.top', 'fbdomen.top', 'brogiro.cfd'];
    const isMirror = mirrorHosts.some(h => window.location.hostname.includes(h));
    const isKinopoisk = window.location.hostname.includes('kinopoisk.ru');

    // --- 1. Логика для зеркал: растягиваем плеер на весь экран и удаляем рекламу ---
    if (isMirror) {
        // Стили для корректного полноэкранного плеера без рекламы
        const style = document.createElement('style');
        style.textContent = `
            html, body {
                height: 100% !important;
                margin: 0 !important;
                padding: 0 !important;
                overflow: hidden !important; /* Убираем полосы прокрутки */
            }
            .wrapper {
                height: 100vh !important;
                display: flex !important;
                flex-direction: column !important;
                margin: 0 !important;
                padding: 0 !important;
            }
            .mainContainer, .content, .kinobox {
                height: 100% !important;
                flex: 1 1 auto !important;
                display: flex !important;
                flex-direction: column !important;
                min-height: 0 !important;
            }
            .kinobox_section {
                height: 100% !important;
                display: flex !important;
                flex-direction: column !important;
                min-height: 0 !important;
            }
            .kinobox_container {
                flex: 1 1 auto !important; /* Плеер занимает всю оставшуюся высоту */
                height: 100% !important;
                min-height: 0 !important;
                position: relative !important;
            }
            .kinobox_menu {
                flex: 0 0 auto !important; /* Меню озвучек снизу не сжимается */
            }
        `;
        document.head.appendChild(style);

        function removeAds() {
            // Селекторы рекламы и модалок
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

            // Подчищаем рекламные скрипты
            document.querySelectorAll('script[src*="vak345.com"], script[src*="deltarockme.com"]').forEach(el => el.remove());
        }

        removeAds();

        // Следим за динамическими изменениями (SPA)
        const observer = new MutationObserver(() => removeAds());
        observer.observe(document.body, { childList: true, subtree: true });
    }

    // --- 2. Логика для kinopoisk.ru: меняем ссылку у постера ---
    if (isKinopoisk) {
        function replacePosterLink() {
            const link = document.querySelector('a[class*="posterLink"]')
                      || document.querySelector('img.film-poster')?.closest('a');

            if (link && !link.dataset.kinokinoPatched) {
                const match = window.location.pathname.match(/\/(?:film|series)\/(\d+)/)
                           || link.getAttribute('href')?.match(/\/film\/(\d+)/);

                if (match) {
                    const id = match[1];
                    link.href = `https://kinokino.vip/film/${id}`;
                    link.dataset.kinokinoPatched = '1';
                }
            }
        }

        replacePosterLink();

        const observer = new MutationObserver(() => replacePosterLink());
        observer.observe(document.body, { childList: true, subtree: true });
    }
})();
