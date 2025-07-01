// js/index.js

// Unique Feature: Scroll-to-Top Button (appears after scrolling, smooth animation)
class ScrollToTop {
    constructor(offset = 300) {
        this.offset = offset;
        this.button = this._createButton();
        this._bindEvents();
    }

    _createButton() {
        const btn = document.createElement('button');
        btn.id = 'scrollToTopBtn';
        btn.innerHTML = '↑';
        btn.classList.add('scroll-to-top');
        document.body.appendChild(btn);
        return btn;
    }

    _bindEvents() {
        window.addEventListener('scroll', () => this._toggleVisibility());
        this.button.addEventListener('click', () => this._scrollToTop());
    }

    _toggleVisibility() {
        if (window.scrollY > this.offset) {
            this.button.classList.add('visible');
        } else {
            this.button.classList.remove('visible');
        }
    }

    _scrollToTop() {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    // Initialize AOS
    AOS.init();

    // 3D Model → Specs Glow Animation
    const trxModel = document.querySelector('#trxModel');
    const specCards = document.querySelectorAll('.spec-card');
    if (trxModel) {
        trxModel.addEventListener('camera-change', () => {
            specCards.forEach((card) => {
                card.classList.add('glow-spec');
                setTimeout(() => card.classList.remove('glow-spec'), 600);
            });
        });
    }

    // Initialize Scroll-to-Top button
    new ScrollToTop();
});

