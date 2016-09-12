module.exports = function (isTree) {
    if (isTree) {
        return generateRing('color:#427142;transform:scale3d(1.4, 1.4, 1)', true)
             + generateRing('color:#4FA24F;transform:scale3d(1.3, 1.3, 1)')
             + generateRing('color:#59B559');
    }

    return generateRing('color:#888;transform:scale3d(1.1, 1.1, 1)')
         + generateRing('color:#ddd');
};

function generateRing(customStyle, isOuter) {
    return '<div style="position:absolute;width:55px;height:54px;' + customStyle + '">'
         + '  <div style="width:30px;height:30px;background:currentColor;border-radius:50%;position:absolute;left:14px;' + (isOuter ? 'box-shadow:5px 15px 15px 10px rgba(0,0,0,0.6);' : '') + '"></div>'
         + '  <div style="width:30px;height:30px;background:currentColor;border-radius:50%;position:absolute;left:2px;top:6px;"></div>'
         + '  <div style="width:25px;height:25px;background:currentColor;border-radius:50%;position:absolute;left:0px;top:20px;"></div>'
         + '  <div style="width:20px;height:20px;background:currentColor;border-radius:50%;position:absolute;left:12px;top:33px;"></div>'
         + '  <div style="width:32px;height:32px;background:currentColor;border-radius:50%;position:absolute;left:18px;top:18px;"></div>'
         + '  <div style="width:25px;height:25px;background:currentColor;border-radius:50%;position:absolute;left:29px;top:6px;"></div>'
         + '</div>';
}
