exports.a = function () {
    var element = document.createElement('div');

    element.style.width = '60%';
    element.style.height = '60%';
    element.style.position = 'absolute';
    element.style.left = '20%';
    element.style.top = '20%';
    element.style.background = 'white';
    element.style.zIndex = '100';
    element.style.borderRadius = '20px';
    element.style.border = '3px solid darkblue';
    element.style.opacity = '0.9';
    element.style.boxSizing = 'border-box';

    return element;
};

exports.b = function (element, body, headline, footerData, closeFunction) {
    var footer = !footerData ? '' : '<a onclick="' + footerData.action + '" class="clickable" style="border: 1px solid gray;border-radius: 5px;padding: 10px;font-family: sans-serif;font-weight: bold;margin: 5px 0;cursor: pointer;">' + footerData.label + '</a>';

    var outerStyle = 'margin: 20px;width: calc(100% - 40px);height: calc(100% - 40px);display: flex;flex-direction: column';
    element.innerHTML = '<div style="' + outerStyle + '">' + (closeFunction ? '<a onClick="' + closeFunction + '" style="cursor: pointer;position: absolute;right: 11px;top: 5px;">✖</a>' : '') + '<h1 style="flex-grow: 0; margin-top: 0">' + headline + '</h1><div style="flex-grow: 0; overflow: auto;">' + body + '</div><div style="flex-grow: 1;padding: 30px 0 0;box-sizing: border-box;display: flex;justify-content: flex-end;align-items: flex-end;">' + footer + '</div></div>';
};
