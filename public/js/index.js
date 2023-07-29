(function () {
  // https://css-tricks.com/styling-based-on-scroll-position/
  const debounce = (fn) => {
    // This holds the requestAnimationFrame reference, so we can cancel it if we wish
    let frame;

    // The debounce function returns a new function that can receive a variable number of arguments
    return (...params) => {
      // If the frame variable has been defined, clear it now, and queue for next frame
      if (frame) {
        cancelAnimationFrame(frame);
      }

      // Queue our function call for the next frame
      frame = requestAnimationFrame(() => {
        // Call our function and pass any params we received
        fn(...params);
      });
    };
  };

  // Reads out the scroll position and stores it in the data attribute
  // so we can use it in our stylesheets
  const storeScroll = () => {
    document.documentElement.dataset.scroll = window.scrollY;
  };

  // Listen for new scroll events, here we debounce our `storeScroll` function
  document.addEventListener('scroll', debounce(storeScroll), { passive: true });

  // Update scroll position for first time
  storeScroll();

  function diffInDays(from, to) {
    const diff = Math.abs(from - to);
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  }

  const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Noc', 'Dec'];
  function formatDate(dateInString) {
    const date = new Date(dateInString);
    const diff = diffInDays(new Date(), date);
    if (diff < 30) {
      return `${diff} days ago`;
    }
    return `${MONTHS[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
  }

  function setTagActive(tags) {
    const tagEls = document.querySelectorAll('[data-tag]:not([data-tag="all"])');
    if (!tags || tags.length === 0) {
      document.querySelector('[data-tag="all"]').classList.add('active');
    } else {
      document.querySelector('[data-tag="all"]').classList.remove('active');
    }
    tagEls.forEach((el) => {
      if (tags.includes(el.dataset.tag)) {
        el.classList.add('active');
      } else {
        el.classList.remove('active');
      }
    });
  }

  function filterByTags(tags) {
    const articles = document.querySelectorAll('section.excerpt');
    articles.forEach((article) => {
      const articleTags = article.dataset.tags.split(',');
      if (!tags || tags.length === 0 || tags.some((tag) => articleTags.includes(tag))) {
        article.classList.remove('hidden');
      } else {
        article.classList.add('hidden');
      }
    });
  }

  window.onload = () => {
    document.querySelectorAll('span[data-date]').forEach((el) => {
      el.innerText = formatDate(el.dataset.date);
    });

    document.querySelectorAll('[data-tag="all"]').forEach((el) => {
      el.onclick = (e) => {
        e.preventDefault();
        window.filteringTags = [];
      };
    });
    document.querySelectorAll('[data-tag]:not([data-tag="all"])').forEach((el) => {
      el.onclick = (e) => {
        e.preventDefault();
        const tag = el.dataset.tag;
        if (window.filteringTags.includes(tag)) {
          window.filteringTags = window.filteringTags.filter((t) => t !== tag);
        } else {
          window.filteringTags = window.filteringTags.concat([tag]);
        }
      };
    });

    Object.defineProperty(window, 'filteringTags', {
      get() {
        return this.value;
      },
      set(value) {
        this.value = value;
        setTagActive(value);
        filterByTags(value);
      },
    });
    window.filteringTags = [];
  };
})();
