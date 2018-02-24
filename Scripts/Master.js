function require(File){
    var script = document.createElement('script');
    script.src = File;
    script.type = 'text/javascript';
    script.defer = true;

    document.getElementsByTagName('head').item(0).appendChild(script);
}

require("scripts/Renderer-Base.js");