
export function getOffset(el) {
    const rect = el.getBoundingClientRect();
    return {
        left: rect.left + window.scrollX,
        top: rect.top + window.scrollY
    };
}

export function getQuery(variable) {
    var query = window.location.search.substring(1);
    var vars = query.split('&');
    for (var i = 0; i < vars.length; i++) {
        var pair = vars[i].split('=');
        if (decodeURIComponent(pair[0]) == variable) {
            return decodeURIComponent(pair[1]);
        }
    }
    return false;
}
export function clone(arr) {
    let newObj = (arr instanceof Array) ? [] : {};
    for (let i in arr) {
        if (i == 'clone')
            continue;
        if (arr[i] && typeof arr[i] == "object") {
            newObj[i] = arr[i].clone();
        }
        else
            newObj[i] = arr[i]
    } return newObj;
};
export function sum(arr, prop) {
    let total = 0, i;
    for (i in arr) {
        total = add(total, arr[i][prop]);
    }
    return total
}
export function add(a, b) {
    let p = 1000000;
    if (a < 1 || b < 1) {
        a = (a + "").substr(0, 8);
        b = (b + "").substr(0, 8);
        a = Number(a) * p;
        b = Number(b) * p;
        return (a + b) / p;
    }
    return (a + b);
}
export function isFloat(amount) {
    return (amount < 1 && amount > 0)
}
export function amountLen(amount) {
    if (isFloat(amount)) {
        return 6;
    }

    return 0;
}
export function toMoney(amount) {
    if (isFloat(amount)) {
        return add(amount, 0);
    }
    if (typeof amount == 'undefined' || amount == 'null')
        return 0;

    if (amount.length < 2)
        return amount + '';
    amount = Math.floor(amount);
    return ("" + amount).replace(/,/g, '').replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,")
}
export function numFa(num, dontTrim) {
    if (num == 'undefined' || typeof num == 'undefined')
        return '';
    dontTrim = dontTrim || false
    num = dontTrim ? num + "" : (num + "").trim();
    let i = 0,
        len = num.length,
        res = '',
        pos,
        persianNumbers = typeof persianNumber == 'undefined' ?
            ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'] :
            persianNumbers;

    for (; i < len; i++)
        if ((pos = persianNumbers[num.charAt(i)]))
            res += pos;
        else
            res += num.charAt(i);

    return res;
}
export function num(txt) {
    let ret = 0;
    if (typeof txt == 'string')
        ret = txt.replace(/[^\d\.]*/g, '')
    else
        ret = txt;
    return parseInt(ret)
}