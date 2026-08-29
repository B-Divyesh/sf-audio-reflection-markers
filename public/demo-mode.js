document.documentElement.classList.toggle('demo-mode', /^\/demo\/?$/.test(location.pathname) || new URLSearchParams(location.search).get('demo') === '1');
