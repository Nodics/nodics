function printData(rows, cols) {
    var data = '';
    var j = 1;
    for (i = 1; i <= rows; i++) {
        while (j <= cols) {
            data = data + ' ' + (i * j);
            j = j + 1;
        }
        data = data + '\n';
        j = 1;
    }
    console.log(data);
}
printData(4, 5);