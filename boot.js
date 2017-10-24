define(['https://interactive.guim.co.uk/2016/02/tax-cuts/js/main.js'], function(app) {
    var css = document.createElement('link');
    css.type = 'text/css';
    css.rel = 'stylesheet';
    css.href = 'https://interactive.guim.co.uk/2016/02/tax-cuts/css/main.css';
    var head = document.head || document.getElementsByTagName('head')[0];
    head.appendChild(css);
    
    return app;
});