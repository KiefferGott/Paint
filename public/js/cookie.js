/*function createCookie(name, value) {
    var date = new Date();
    date.setTime(date.getTime() + (604800000));
    var expires = "; expires=" + date.toGMTString();
    document.cookie = name + "=" + value + expires;
}

function readCookie(name) {
    var nameEQ = name + "=";
    var ca = document.cookie.split(';');
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) === ' ') {
            c = c.substring(1, c.length);
        }
        if (c.indexOf(nameEQ) === 0) {
            return c.substring(nameEQ.length, c.length);
        }
    }
    return false;
}
function token() {
    return Math.random().toString(36).substr(2);
}

var cookie = readCookie('token');
if (!cookie) {
    createCookie('token', token());
    socket.emit('incomer', readCookie('token'));
}
else {
    socket.emit('registered', cookie);
}*/