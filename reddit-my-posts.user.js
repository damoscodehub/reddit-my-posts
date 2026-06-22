// ==UserScript==
// @name         Reddit - My Posts in Subreddit
// @namespace    https://github.com/damoscodehub/reddit-my-posts.git
// @version      1.0.0
// @description  Adds a button to the Reddit header to view your own posts in the current subreddit via Arctic Shift
// @author       damoscodehub
// @updateURL    https://raw.githubusercontent.com/damoscodehub/submine/main/reddit-my-posts.user.js
// @downloadURL  https://raw.githubusercontent.com/damoscodehub/submine/main/reddit-my-posts.user.js
// @match        https://www.reddit.com/r/*
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    const ARCTIC_SHIFT_URL = 'https://arctic-shift.photon-reddit.com';
    let cachedUsername = null;

    function getCurrentSubreddit() {
        const match = window.location.pathname.match(/^\/r\/([^/]+)/);
        return match ? match[1] : null;
    }

    // Fetches the logged-in username using the fastest available source.
    async function fetchLoggedInUser() {
        if (cachedUsername) return cachedUsername;

        // Fastest: shreddit web components expose username as a DOM attribute
        const domEl = document.querySelector('after-login-toast-dispatcher, achievements-entrypoint, faceplate-tracker[noun="community_menu"]');
        const domUser = domEl?.getAttribute('username');
        if (domUser) { cachedUsername = domUser; return cachedUsername; }

        // Reliable fallback: old Reddit JSON endpoint works with cookie auth
        try {
            const res = await fetch('/api/me.json', { credentials: 'include' });
            if (res.ok) {
                const data = await res.json();
                cachedUsername = data?.data?.name || null;
            }
        } catch { /* ignore */ }

        return cachedUsername;
    }

    function buildArcticShiftUrl(subreddit, username) {
        const params = new URLSearchParams({
            fun: 'posts_search',
            subreddit: subreddit,
            author: username,
            sort: 'desc',
            limit: '25',
            over_18: 'true',
        });
        return `${ARCTIC_SHIFT_URL}/search?${params.toString()}`;
    }

    function addButton() {
        const subreddit = getCurrentSubreddit();
        if (!subreddit) return;
        if (document.getElementById('my-subreddit-posts-btn')) return;

        const btn = document.createElement('button');
        btn.id = 'my-subreddit-posts-btn';
        btn.textContent = 'My Posts Here';
        btn.title = `View your posts in r/${subreddit}`;
        btn.style.cssText = [
            'display:inline-flex', 'align-items:center', 'justify-content:center',
            'height:40px', 'padding:0 12px',
            'background:none', 'border:none', 'border-radius:4px',
            'cursor:pointer', 'font-size:11px', 'font-weight:700',
            'letter-spacing:0.02em', 'color:#ff4500',
            'transition:background 0.15s', 'user-select:none', 'white-space:nowrap',
        ].join(';');

        btn.addEventListener('mouseenter', () => {
            btn.style.background = 'var(--rpl-color-secondary-background, rgba(0,0,0,.08))';
        });
        btn.addEventListener('mouseleave', () => {
            btn.style.background = 'none';
        });

        btn.addEventListener('click', async () => {
            btn.disabled = true;
            btn.style.opacity = '0.5';
            try {
                const username = await fetchLoggedInUser();
                if (!username) {
                    alert('Could not detect your Reddit username. Are you logged in?');
                    return;
                }
                const url = buildArcticShiftUrl(subreddit, username);
                window.open(url, '_blank');
            } finally {
                btn.disabled = false;
                btn.style.opacity = '1';
            }
        });

        // Insert before the inbox button — same stable anchor used by the NSFW toggle script
        const inbox = document.querySelector('span[data-part="inbox"]');
        if (inbox) {
            const wrapper = document.createElement('span');
            wrapper.setAttribute('data-part', 'my-subreddit-posts');
            inbox.parentNode.insertBefore(wrapper, inbox);
            wrapper.appendChild(btn);
            return;
        }

        // Fallback: floating fixed button
        btn.style.cssText += ';position:fixed;top:60px;right:16px;z-index:9999;box-shadow:0 2px 8px rgba(0,0,0,0.3);background:#ff4500;color:white;border-radius:9999px;';
        document.body.appendChild(btn);
    }

    function onUrlChange() {
        const existing = document.getElementById('my-subreddit-posts-btn');
        if (existing) existing.closest('[data-part="my-subreddit-posts"]')?.remove() || existing.remove();
        addButton();
    }

    const observer = new MutationObserver(() => {
        if (!document.getElementById('my-subreddit-posts-btn')) addButton();
    });
    observer.observe(document.documentElement, { childList: true, subtree: true });

    let lastUrl = location.href;
    setInterval(() => {
        if (location.href !== lastUrl) { lastUrl = location.href; onUrlChange(); }
    }, 500);

    // Pre-fetch the username as soon as the script loads so the click is instant
    fetchLoggedInUser();
    addButton();
})();
