// ==UserScript==
// @name         Kinopoisk → kinokino.vip
// @namespace    http://tampermonkey.net/
// @version      2026-07-26
// @description  Улучшения интерфейса и автоматическая ссылка на страницу фильма на kinokino.vip
// @author       amnesiaof
// @match        https://kinokino.vip/*
// @match        https://www.kinopoisk.ru/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=kinopoisk.ru
// @grant        none
// @updateURL   https://raw.githubusercontent.com/amnesiaof/flcksbr-top-userscript/main/flcksbr-top.user.js
// @downloadURL https://raw.githubusercontent.com/amnesiaof/flcksbr-top-userscript/main/flcksbr-top.user.js
// ==/UserScript==

(function() {
    'use strict';

    const isKinokino = window.location.hostname.includes('kinokino.vip');
    const isKinopoisk = window.location.hostname.includes('kinopoisk.ru');

    // --- 1. Универсально убираем фиксированную высоту у .wrapper ---
    const style = document.createElement('style');
    style.textContent = `
        .wrapper {
            height: auto !important;
        }
    `;
    document.head.appendChild(style);

    // --- 2. Логика для kinokino.vip: удаляем рекламу и модалки ---
    if (isKinokino) {
        function removeAds() {
            // Модалка с "новой инструкцией"
            const modal = document.querySelector('#instruction-modal');
            if (modal) modal.remove();

            // Баннер с telegram
            const tgWrapper = document.querySelector('#tgWrapper');
            if (tgWrapper) tgWrapper.remove();

            // Рекламный блок topAdPad
            const topAdPad = document.querySelector('.topAdPad');
            if (topAdPad) topAdPad.remove();

            // Дополнительно: верхний мобильный баннер и нижняя реклама
            const topAdMb = document.querySelector('#TopAdMb');
            if (topAdMb) topAdMb.remove();

            const adDown = document.querySelector('.adDown');
            if (adDown) adDown.remove();

            // Скрипт vak345.com тоже можно подчистить, если остался
            const adScript = document.querySelector('script[src*="vak345.com"]');
            if (adScript) adScript.remove();
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
