const positions = [];

function findScreenCoords(array) {
    return (mouseEvent) => {
        if (mouseEvent) {
            x = mouseEvent.screenX;
            y = mouseEvent.screenY;
            array.push({ x, y });
            console.log(array);
        }
    };
}

document.addEventListener('mousemove', findScreenCoords(positions));



const mouseMovements = [
    {
        "x": 1461,
        "y": 708
    },
    {
        "x": 1461,
        "y": 708
    },
    {
        "x": 1461,
        "y": 702
    },
    {
        "x": 1460,
        "y": 696
    },
    {
        "x": 1460,
        "y": 689
    },
    {
        "x": 1460,
        "y": 683
    },
    {
        "x": 1460,
        "y": 677
    },
    {
        "x": 1460,
        "y": 671
    },
    {
        "x": 1459,
        "y": 666
    },
    {
        "x": 1459,
        "y": 664
    },
    {
        "x": 1458,
        "y": 661
    },
    {
        "x": 1457,
        "y": 658
    },
    {
        "x": 1457,
        "y": 656
    },
    {
        "x": 1456,
        "y": 655
    },
    {
        "x": 1456,
        "y": 654
    },
    {
        "x": 1456,
        "y": 654
    },
    {
        "x": 1456,
        "y": 653
    },
    {
        "x": 1456,
        "y": 653
    },
    {
        "x": 1456,
        "y": 653
    },
    {
        "x": 1456,
        "y": 653
    },
    {
        "x": 1456,
        "y": 652
    },
    {
        "x": 1456,
        "y": 652
    },
    {
        "x": 1456,
        "y": 652
    },
    {
        "x": 1456,
        "y": 650
    },
    {
        "x": 1456,
        "y": 649
    },
    {
        "x": 1456,
        "y": 645
    },
    {
        "x": 1455,
        "y": 642
    },
    {
        "x": 1454,
        "y": 639
    },
    {
        "x": 1452,
        "y": 631
    },
    {
        "x": 1450,
        "y": 624
    },
    {
        "x": 1448,
        "y": 616
    },
    {
        "x": 1445,
        "y": 607
    },
    {
        "x": 1438,
        "y": 586
    },
    {
        "x": 1434,
        "y": 570
    },
    {
        "x": 1430,
        "y": 560
    },
    {
        "x": 1421,
        "y": 529
    },
    {
        "x": 1413,
        "y": 507
    },
    {
        "x": 1406,
        "y": 485
    },
    {
        "x": 1398,
        "y": 461
    },
    {
        "x": 1390,
        "y": 435
    },
    {
        "x": 1387,
        "y": 424
    },
    {
        "x": 1375,
        "y": 383
    },
    {
        "x": 1368,
        "y": 360
    },
    {
        "x": 1364,
        "y": 336
    },
    {
        "x": 1359,
        "y": 313
    },
    {
        "x": 1356,
        "y": 288
    },
    {
        "x": 1355,
        "y": 277
    },
    {
        "x": 1354,
        "y": 254
    },
    {
        "x": 1353,
        "y": 233
    },
    {
        "x": 1353,
        "y": 211
    },
    {
        "x": 1353,
        "y": 191
    },
    {
        "x": 1353,
        "y": 172
    },
    {
        "x": 1353,
        "y": 156
    },
    {
        "x": 1353,
        "y": 150
    },
    {
        "x": 1353,
        "y": 138
    },
    {
        "x": 1355,
        "y": 128
    },
    {
        "x": 1356,
        "y": 119
    },
    {
        "x": 1358,
        "y": 113
    },
    {
        "x": 1360,
        "y": 109
    },
    {
        "x": 1362,
        "y": 105
    },
    {
        "x": 1365,
        "y": 102
    },
    {
        "x": 1367,
        "y": 99
    },
    {
        "x": 1369,
        "y": 97
    },
    {
        "x": 1372,
        "y": 95
    },
    {
        "x": 1373,
        "y": 94
    },
    {
        "x": 1376,
        "y": 92
    },
    {
        "x": 1379,
        "y": 90
    },
    {
        "x": 1380,
        "y": 89
    },
    {
        "x": 1382,
        "y": 89
    },
    {
        "x": 1385,
        "y": 89
    },
    {
        "x": 1387,
        "y": 89
    },
    {
        "x": 1388,
        "y": 89
    },
    {
        "x": 1389,
        "y": 90
    },
    {
        "x": 1390,
        "y": 92
    },
    {
        "x": 1391,
        "y": 93
    },
    {
        "x": 1392,
        "y": 95
    },
    {
        "x": 1392,
        "y": 97
    },
    {
        "x": 1393,
        "y": 98
    },
    {
        "x": 1393,
        "y": 100
    },
    {
        "x": 1394,
        "y": 102
    },
    {
        "x": 1394,
        "y": 103
    },
    {
        "x": 1394,
        "y": 106
    },
    {
        "x": 1394,
        "y": 108
    },
    {
        "x": 1394,
        "y": 110
    },
    {
        "x": 1394,
        "y": 112
    },
    {
        "x": 1394,
        "y": 113
    },
    {
        "x": 1393,
        "y": 117
    },
    {
        "x": 1392,
        "y": 118
    },
    {
        "x": 1392,
        "y": 120
    },
    {
        "x": 1391,
        "y": 122
    },
    {
        "x": 1390,
        "y": 124
    },
    {
        "x": 1389,
        "y": 126
    },
    {
        "x": 1389,
        "y": 127
    },
    {
        "x": 1388,
        "y": 129
    },
    {
        "x": 1388,
        "y": 130
    },
    {
        "x": 1387,
        "y": 132
    },
    {
        "x": 1386,
        "y": 133
    },
    {
        "x": 1386,
        "y": 134
    },
    {
        "x": 1385,
        "y": 135
    },
    {
        "x": 1385,
        "y": 136
    },
    {
        "x": 1384,
        "y": 137
    },
    {
        "x": 1384,
        "y": 138
    },
    {
        "x": 1383,
        "y": 138
    },
    {
        "x": 1383,
        "y": 139
    },
    {
        "x": 1383,
        "y": 140
    },
    {
        "x": 1382,
        "y": 140
    },
    {
        "x": 1381,
        "y": 141
    },
    {
        "x": 1381,
        "y": 142
    },
    {
        "x": 1380,
        "y": 143
    },
    {
        "x": 1380,
        "y": 144
    },
    {
        "x": 1379,
        "y": 145
    },
    {
        "x": 1379,
        "y": 147
    },
    {
        "x": 1378,
        "y": 147
    },
    {
        "x": 1378,
        "y": 148
    },
    {
        "x": 1377,
        "y": 149
    },
    {
        "x": 1377,
        "y": 150
    },
    {
        "x": 1377,
        "y": 150
    },
    {
        "x": 1377,
        "y": 151
    },
    {
        "x": 1377,
        "y": 151
    },
    {
        "x": 1376,
        "y": 152
    },
    {
        "x": 1376,
        "y": 152
    },
    {
        "x": 1376,
        "y": 152
    },
    {
        "x": 1376,
        "y": 153
    },
    {
        "x": 1376,
        "y": 154
    },
    {
        "x": 1375,
        "y": 154
    },
    {
        "x": 1375,
        "y": 155
    },
    {
        "x": 1375,
        "y": 156
    },
    {
        "x": 1374,
        "y": 157
    },
    {
        "x": 1374,
        "y": 157
    },
    {
        "x": 1374,
        "y": 158
    },
    {
        "x": 1374,
        "y": 158
    },
    {
        "x": 1373,
        "y": 159
    },
    {
        "x": 1373,
        "y": 159
    },
    {
        "x": 1373,
        "y": 159
    },
    {
        "x": 1373,
        "y": 159
    },
    {
        "x": 1373,
        "y": 159
    },
    {
        "x": 1373,
        "y": 159
    }

];