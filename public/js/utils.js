function removePrompt() {
    $('#blackwall').remove();
    $('#promptOverlay').remove();
}
function promptUtils(string) {
    var blackWall = document.createElement('div');
    blackWall.id = 'blackwall';
    blackWall.setAttribute("style", "background-color: #000; opacity: 0.8; z-index: 10; position: absolute; top: 0px; left: 0px; height: 100%; width: 100%; display: block;");
    document.body.appendChild(blackWall);
    var prompt = document.createElement('div');
    prompt.id = 'promptOverlay';
    prompt.setAttribute("style", "background-color: #fff; height: 200px; width: 400px; z-index: 20; margin: auto; position: fixed; transform: translate(-50%, -50%); top: 50%; left: 50%; opacity: 1;");
    document.body.appendChild(prompt);
    prompt.innerHTML = string;
    blackWall.onclick = function () {
        blackWall.remove();
        prompt.remove();
    };
}
function displayDeleteButton() {
    if (imageHere) {
        $('#deleteImage').show();
    }
    else {
        $('#deleteImage').hide();
    }
}
function download() {
    var toDownload = document.createElement('canvas');
    toDownload.height = 800;
    toDownload.width = 1500;
    var downloadContext = toDownload.getContext('2d');
    downloadContext.drawImage(document.getElementById('imageLayer'), 0, 0);
    downloadContext.drawImage(document.getElementById('canvas'), 0, 0);
    link = document.getElementById('download');
    link.href = toDownload.toDataURL();
    link.download = 'paint.png';
}