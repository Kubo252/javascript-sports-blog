/* čas */

function refresh() {
    var refresh = 1000; // refreshuje v millisekundách
    setTimeout("time()", refresh);
}
function time() {
    var d = new Date();
    var out = d.getHours() + ":";
    if (d.getMinutes() < 10) {
        out += "0" + d.getMinutes() + ":";
    } else {
        out += d.getMinutes() + ":";
    }
    if (d.getSeconds() < 10) {
        out += "0" + d.getSeconds();
    } else {
        out += d.getSeconds();
    }
    document.getElementById("date").innerHTML = out;
    refresh();
}