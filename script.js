// Level map represented as a 2D array
const map = [
    [0, 0,  0, 0, 0, 0, 0, 0, 0, 0, 0,  0, 0, 0, 0, 0, 0, 0,  0, 0, 0, 0,  0, 0, 0, 0, 0, 0,  0, 0, 0, 0, 0, 0, 0, 0, 0,  0, 0, 0,  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,  0, 0, 0, 0,  0, 0, 0, 0, 0, 0,  0, 0,  0, 0, 0,  0, 0, 0, 0,  0, 0, 0, 0, 0, 0, 0, 0, 0, 0,  0,  0, 0, 0,  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,  0, 0,  0, 0, 0, 0, 0, 0, 0, 0, 0,  0, 0, 0,  0, 0, 0, 0, 0,  0, 0, 0, 0, 0, 0, 0, 0, 0,  0, 0, 0, 0,  0, 0, 0,  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,  0,  0, 0,  0, 0, 0, 0, 0, 0, 0, 0, 0,  0, 0, 0,  0, 0, 0, 0, 0,  0, 0, 0, 0, 0, 0, 0, 0, 0,  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,  0,  0, 0, 0,  0, 0, 0, 0, 0, 0, 0],
    [0, 0,  0, 0, 0, 0, 0, 0, 0, 0, 0,  0, 0, 0, 0, 0, 0, 0, 10, 0, 0, 0,  0, 0, 0, 0, 0, 0,  0, 0, 0, 0, 0, 0, 0, 0, 0,  0, 0, 0,  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,  0, 0, 0, 0,  0, 0, 0, 0, 0, 0, 10, 0,  0, 0, 0,  0, 0, 0, 0,  0, 0, 0, 0, 0, 0, 0, 0, 0, 0,  11, 0, 0, 0,  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,  0, 0,  0, 0, 0, 0, 0, 0, 0, 0, 0,  0, 0, 0,  0, 0, 0, 0, 0,  0, 0, 0, 0, 0, 0, 0, 0, 11, 0, 0, 0, 0,  0, 0, 0,  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,  0, 10, 0,  0, 0, 0, 0, 0, 0, 0, 0, 0, 10, 0, 0,  0, 0, 0, 0, 0,  0, 0, 0, 0, 0, 0, 0, 0, 0,  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,  0,  0, 0, 0,  0, 0, 0, 0, 0, 0, 0],
    [0, 0,  0, 0, 0, 0, 0, 0, 0, 0, 0,  0, 0, 0, 0, 0, 0, 0,  0, 0, 0, 0,  0, 0, 0, 0, 0, 0,  0, 0, 0, 0, 0, 0, 0, 0, 11, 0, 0, 0,  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 10, 0, 0, 0,  0, 0, 0, 0, 0, 0,  0, 0,  0, 0, 0,  0, 0, 0, 0, 12, 0, 0, 0, 0, 0, 0, 0, 0, 0,  0,  0, 0, 0,  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,  0, 0,  0, 0, 0, 0, 0, 0, 0, 0, 0, 10, 0, 0,  0, 0, 0, 0, 12, 0, 0, 0, 0, 0, 0, 0, 0, 0,  0, 0, 0, 0,  0, 0, 0,  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,  0,  0, 0,  0, 0, 0, 0, 0, 0, 0, 0, 0,  0, 0, 0,  0, 0, 0, 0, 12, 0, 0, 0, 0, 0, 0, 0, 0, 11, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 14, 0, 10, 0, 0,  0, 0, 0, 0, 0, 0, 0],
    [0, 0, 20, 0, 0, 0, 0, 0, 0, 0, 0,  0, 0, 0, 0, 0, 0, 0,  0, 0, 0, 0,  0, 0, 0, 0, 0, 12, 0, 0, 0, 0, 0, 0, 0, 0, 0,  0, 0, 0,  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,  0, 0, 0, 0,  0, 0, 0, 0, 0, 0,  0, 0,  0, 0, 0,  0, 0, 0, 0,  0, 0, 0, 0, 0, 0, 0, 0, 0, 0,  0,  0, 0, 0,  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 10, 0,  0, 0, 0, 0, 0, 0, 0, 0, 0,  0, 0, 0,  0, 0, 0, 0, 0,  0, 0, 0, 0, 0, 0, 0, 0, 0,  0, 0, 0, 0,  0, 0, 0,  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,  0,  0, 0,  0, 0, 0, 0, 0, 0, 0, 0, 0,  0, 0, 0,  0, 0, 0, 0, 0,  0, 0, 0, 0, 0, 0, 0, 0, 0,  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,  0,  0, 0, 0,  0, 0, 0, 0, 0, 0, 0],
    [0, 0,  0, 0, 0, 0, 0, 0, 0, 0, 0,  0, 0, 0, 0, 0, 0, 0,  0, 0, 0, 0,  0, 0, 0, 0, 0, 0,  0, 0, 0, 0, 0, 0, 0, 0, 0,  0, 0, 0,  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,  0, 0, 0, 0,  0, 0, 0, 0, 0, 0,  0, 0,  0, 0, 0,  0, 0, 0, 0,  0, 0, 0, 0, 0, 0, 0, 0, 0, 0,  0,  0, 0, 0,  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,  0, 0,  0, 0, 0, 0, 0, 0, 0, 0, 0,  0, 0, 0,  0, 0, 0, 0, 0,  0, 0, 0, 0, 0, 0, 0, 0, 0,  0, 0, 0, 0,  0, 0, 0,  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,  0,  0, 0,  0, 0, 0, 0, 0, 0, 0, 0, 0,  0, 0, 0,  0, 0, 0, 0, 0,  0, 0, 0, 0, 0, 0, 0, 0, 0,  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,  0,  0, 0, 0,  0, 0, 0, 0, 0, 0, 0],
    [0, 0,  0, 0, 0, 0, 0, 0, 0, 0, 0,  0, 0, 0, 0, 0, 0, 0,  0, 0, 0, 2,  0, 0, 0, 0, 0, 0,  0, 0, 0, 0, 0, 0, 0, 0, 0,  0, 0, 0,  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,  0, 0, 0, 0,  0, 0, 0, 0, 0, 0,  0, 0,  0, 0, 0,  0, 0, 0, 0,  0, 0, 0, 0, 0, 3, 3, 3, 3, 3,  3,  3, 3, 0,  0, 0, 3, 3, 3, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,  0, 0,  0, 0, 2, 0, 0, 0, 0, 0, 0,  0, 0, 0,  0, 0, 3, 3, 3,  0, 0, 0, 0, 3, 2, 2, 3, 0,  0, 0, 0, 0,  0, 0, 0,  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,  0,  0, 0,  0, 0, 0, 0, 0, 0, 0, 0, 0,  0, 0, 0,  0, 0, 0, 0, 0,  0, 0, 0, 0, 0, 0, 0, 0, 0,  0, 0, 0, 0, 0, 0, 0, 4, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0,  0,  0, 0, 0,  0, 0, 0, 0, 0, 0, 0],
    [0, 0,  0, 0, 0, 0, 0, 0, 0, 0, 0,  0, 0, 0, 0, 0, 0, 0,  0, 0, 0, 0,  0, 0, 0, 0, 0, 0,  0, 0, 0, 0, 0, 0, 0, 0, 0,  0, 0, 0,  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,  0, 0, 0, 0,  0, 0, 0, 0, 0, 0,  0, 0,  0, 0, 0,  0, 0, 0, 0,  0, 0, 0, 0, 0, 0, 0, 0, 0, 0,  0,  0, 0, 0,  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,  0, 0,  0, 0, 0, 0, 0, 0, 0, 0, 0,  0, 0, 0,  0, 0, 0, 0, 0,  0, 0, 0, 0, 0, 0, 0, 0, 0,  0, 0, 0, 0,  0, 0, 0,  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,  0,  0, 0,  0, 0, 0, 0, 0, 0, 0, 0, 0,  0, 0, 0,  0, 0, 0, 0, 0,  0, 0, 0, 0, 0, 0, 0, 0, 0,  0, 0, 0, 0, 0, 0, 4, 4, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0,  0,  0, 0, 0,  0, 0, 0, 0, 0, 0, 0],
    [0, 0,  0, 0, 0, 0, 0, 0, 0, 0, 0,  0, 0, 0, 0, 0, 0, 0,  0, 0, 0, 0,  0, 0, 0, 0, 0, 0,  0, 0, 0, 0, 0, 0, 0, 0, 0,  0, 0, 0,  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,  0, 0, 0, 0,  0, 0, 0, 0, 0, 0,  0, 0,  0, 0, 0,  0, 0, 0, 0,  0, 0, 0, 0, 0, 0, 0, 0, 0, 0,  0,  0, 0, 0,  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,  0, 0,  0, 0, 0, 0, 0, 0, 0, 0, 0,  0, 0, 0,  0, 0, 0, 0, 0,  0, 0, 0, 0, 0, 0, 0, 0, 0,  0, 0, 0, 0,  0, 0, 0,  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,  0,  0, 0,  0, 0, 0, 0, 0, 0, 0, 0, 0,  0, 0, 0,  0, 0, 0, 0, 0,  0, 0, 0, 0, 0, 0, 0, 0, 0,  0, 0, 0, 0, 0, 4, 4, 4, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0,  0,  0, 0, 0,  0, 0, 0, 0, 0, 0, 0],
    [0, 0,  0, 0, 0, 0, 0, 0, 0, 0, 0,  0, 0, 0, 0, 0, 0, 0,  0, 0, 0, 0,  0, 0, 0, 0, 0, 0,  0, 0, 0, 0, 0, 0, 0, 0, 0,  0, 0, 0,  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,  0, 0, 0, 0,  0, 0, 0, 0, 2, 0,  0, 0,  0, 0, 0,  0, 0, 0, 0,  0, 0, 0, 0, 0, 0, 0, 0, 0, 0,  0,  0, 0, 0,  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,  0, 0,  0, 0, 0, 0, 0, 0, 0, 0, 0,  0, 0, 0,  0, 0, 0, 0, 0,  0, 0, 0, 0, 0, 0, 0, 0, 0,  0, 0, 0, 0,  0, 0, 0,  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,  0,  0, 0,  0, 0, 0, 0, 0, 0, 0, 0, 0,  0, 0, 0,  0, 0, 0, 0, 0,  0, 0, 0, 0, 0, 0, 0, 0, 0,  0, 0, 0, 0, 4, 4, 4, 4, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0,  0,  0, 0, 13, 0, 0, 0, 0, 0, 0, 0],
    [0, 0,  0, 0, 0, 0, 0, 0, 0, 0, 0,  0, 0, 0, 0, 2, 0, 0,  0, 3, 2, 3,  2, 3, 0, 0, 0, 0,  0, 0, 0, 0, 0, 0, 0, 0, 0,  0, 0, 0,  0, 0, 0, 0, 7, 0, 0, 0, 0, 0, 0, 0, 0, 0,  0, 7, 0, 0,  0, 0, 0, 0, 0, 0,  0, 0,  0, 0, 0,  0, 0, 0, 0,  0, 0, 3, 2, 3, 0, 0, 0, 0, 0,  0,  0, 0, 0,  0, 0, 0, 0, 0, 3, 0, 0, 0, 0, 0, 3, 3, 0, 0, 0,  0, 2,  0, 0, 2, 0, 0, 2, 0, 0, 0,  0, 0, 3,  0, 0, 0, 0, 0,  0, 0, 0, 0, 0, 3, 3, 0, 0,  0, 0, 0, 0, 21, 0, 0, 21, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 21,  0, 0, 21, 0, 0, 0, 0, 0, 0, 0, 0,  0, 0, 0,  0, 3, 3, 2, 3,  0, 0, 0, 0, 0, 0, 0, 0, 0,  0, 0, 0, 4, 4, 4, 4, 4, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0,  0,  0, 0, 0,  0, 0, 0, 0, 0, 0, 0],
    [0, 0,  0, 0, 0, 0, 0, 0, 0, 0, 0,  0, 0, 0, 0, 0, 0, 0,  0, 0, 0, 0,  0, 0, 0, 0, 0, 0,  0, 0, 0, 0, 0, 0, 0, 0, 0,  6, 0, 0,  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,  0, 0, 0, 0,  0, 0, 0, 0, 0, 0,  0, 0,  0, 0, 0,  0, 0, 0, 0,  0, 0, 0, 0, 0, 0, 0, 0, 0, 0,  0,  0, 0, 0,  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,  0, 0,  0, 0, 0, 0, 0, 0, 0, 0, 0,  0, 0, 0,  0, 0, 0, 0, 0,  0, 0, 0, 0, 0, 0, 0, 0, 0,  0, 0, 0, 4,  0, 0, 0,  0, 4, 0, 0, 0, 0, 0, 0, 0, 0, 4, 4,  0,  0, 0,  0, 4, 0, 0, 0, 0, 0, 0, 0,  0, 0, 0,  0, 0, 0, 0, 0,  0, 0, 0, 0, 0, 0, 0, 0, 0,  0, 0, 4, 4, 4, 4, 4, 4, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0,  0,  0, 0, 0,  0, 0, 0, 0, 0, 0, 0],
    [9, 0,  0, 0, 0, 0, 0, 0, 0, 0, 0,  0, 0, 0, 0, 0, 0, 0,  0, 0, 0, 0,  0, 0, 0, 0, 0, 0,  5, 0, 0, 0, 0, 0, 0, 0, 0,  0, 0, 0,  0, 0, 0, 0, 0, 0, 9, 0, 0, 0, 0, 0, 0, 0,  0, 0, 0, 0,  0, 0, 0, 0, 0, 0,  0, 0,  0, 0, 0,  0, 0, 0, 0,  0, 0, 0, 0, 0, 0, 0, 0, 0, 0,  0,  0, 0, 0,  0, 0, 0, 0, 0, 0, 0, 9, 0, 0, 0, 0, 0, 0, 0, 0,  0, 0,  0, 0, 0, 0, 0, 0, 0, 0, 0,  0, 0, 0,  0, 0, 0, 0, 0,  0, 0, 0, 0, 0, 0, 0, 0, 0,  0, 0, 4, 4,  0, 0, 0,  0, 4, 4, 0, 9, 0, 0, 0, 0, 4, 4, 4,  0,  0, 0,  0, 4, 4, 0, 0, 0, 0, 5, 0,  0, 0, 0,  0, 0, 0, 0, 0,  0, 0, 0, 0, 0, 0, 0, 5, 0,  0, 4, 4, 4, 4, 4, 4, 4, 4, 0, 0, 9, 0, 0, 0, 0, 0, 0,  0,  0, 0, 0,  0, 0, 0, 0, 0, 0, 0],
    [0, 0,  0, 0, 0, 0, 0, 0, 0, 0, 0, 18, 0, 0, 0, 0, 9, 0,  0, 0, 0, 0, 17, 0, 0, 0, 0, 0,  0, 0, 0, 0, 0, 0, 0, 0, 0,  0, 0, 0, 17, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,  0, 0, 0, 0, 18, 0, 0, 9, 0, 0,  0, 0,  0, 0, 0, 16, 0, 0, 0,  0, 0, 0, 0, 0, 0, 0, 0, 0, 0,  0,  0, 0, 0, 17, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,  0, 0, 18, 0, 0, 0, 0, 9, 0, 0, 0,  0, 0, 0, 16, 0, 0, 0, 0,  0, 0, 0, 0, 0, 0, 0, 0, 0,  0, 4, 4, 4,  0, 0, 0,  0, 4, 4, 4, 0, 0, 0, 0, 4, 4, 4, 4,  0,  0, 0,  0, 4, 4, 4, 9, 0, 0, 0, 0,  0, 0, 0, 16, 0, 0, 0, 0,  0, 0, 0, 0, 0, 0, 0, 0, 0,  4, 4, 4, 4, 4, 4, 4, 4, 4, 0, 0, 0, 0, 0, 0, 0, 0, 4,  0,  0, 0, 0,  0, 0, 0, 0, 0, 0, 0],
    [1, 1,  1, 1, 1, 1, 1, 1, 1, 1, 1,  1, 1, 1, 1, 1, 1, 1,  1, 1, 1, 1,  1, 1, 1, 1, 1, 1,  1, 1, 1, 1, 1, 1, 1, 1, 1,  1, 1, 1,  1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,  1, 1, 1, 1,  1, 1, 1, 1, 1, 1,  1, 1, 19, 0, 0, 19, 1, 1, 1,  1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 19,  0, 0, 0, 19, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,  1, 1,  1, 1, 1, 1, 1, 1, 1, 1, 1,  1, 1, 1,  1, 1, 1, 1, 1,  1, 1, 1, 1, 1, 1, 1, 1, 1,  1, 1, 1, 1,  1, 1, 1,  1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 19,  0, 0, 19, 1, 1, 1, 1, 1, 1, 1, 1,  1, 1, 1,  1, 1, 1, 1, 1,  1, 1, 1, 1, 1, 1, 1, 1, 1,  1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,  1,  1, 1, 1,  1, 1, 1, 1, 1, 1, 1],
    [1, 1,  1, 1, 1, 1, 1, 1, 1, 1, 1,  1, 1, 1, 1, 1, 1, 1,  1, 1, 1, 1,  1, 1, 1, 1, 1, 1,  1, 1, 1, 1, 1, 1, 1, 1, 1,  1, 1, 1,  1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,  1, 1, 1, 1,  1, 1, 1, 1, 1, 1,  1, 1,  0, 0, 0,  0, 1, 1, 1,  1, 1, 1, 1, 1, 1, 1, 1, 1, 1,  0,  0, 0, 0,  0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,  1, 1,  1, 1, 1, 1, 1, 1, 1, 1, 1,  1, 1, 1,  1, 1, 1, 1, 1,  1, 1, 1, 1, 1, 1, 1, 1, 1,  1, 1, 1, 1,  1, 1, 1,  1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,  0,  0, 0,  0, 1, 1, 1, 1, 1, 1, 1, 1,  1, 1, 1,  1, 1, 1, 1, 1,  1, 1, 1, 1, 1, 1, 1, 1, 1,  1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,  1,  1, 1, 1,  1, 1, 1, 1, 1, 1, 1],
    [1, 1,  1, 1, 1, 1, 1, 1, 1, 1, 1,  1, 1, 1, 1, 1, 1, 1,  1, 1, 1, 1,  1, 1, 1, 1, 1, 1,  1, 1, 1, 1, 1, 1, 1, 1, 1,  1, 1, 1,  1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,  1, 1, 1, 1,  1, 1, 1, 1, 1, 1,  1, 1,  0, 0, 0,  0, 1, 1, 1,  1, 1, 1, 1, 1, 1, 1, 1, 1, 1,  0,  0, 0, 0,  0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,  1, 1,  1, 1, 1, 1, 1, 1, 1, 1, 1,  1, 1, 1,  1, 1, 1, 1, 1,  1, 1, 1, 1, 1, 1, 1, 1, 1,  1, 1, 1, 1,  1, 1, 1,  1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,  0,  0, 0,  0, 1, 1, 1, 1, 1, 1, 1, 1,  1, 1, 1,  1, 1, 1, 1, 1,  1, 1, 1, 1, 1, 1, 1, 1, 1,  1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,  1,  1, 1, 1,  1, 1, 1, 1, 1, 1, 1],
]; 

const distance = document.getElementById('distance');
const canvas = document.getElementById('gameCanvas');
const vision = document.getElementById('vision');
const ctx = canvas.getContext('2d');
ctx.imageSmoothingEnabled = false;

const visionCtx = vision.getContext('2d');
visionCtx.imageSmoothingEnabled = true;

const SCALE = 2;

const tileHeight = 16 * SCALE;
const tileWidth = 16 * SCALE; 

const TILE_SIZE = tileWidth;

const TARGET_FPS = 240;
const FRAME_DURATION = 1000 / TARGET_FPS; 

const POPULATION = 10;

let drawHitBox = false;

let previousTime = 0;
let frameTimer; 


let generation = 0;

let players = Array.from({ length: POPULATION }, () => new Player(84, 350, 32, 32));
let enemies = [];
let died = [];

let currentFrame = 0;
let frameTime = 0;   

let animationSpeedMultiplier = 0;
let lastFpsUpdate = performance.now();
let lastFrameTime = performance.now();
let accumulator = 0;
let frameCount = 0;
let fps = 0;

let camera = {
    x: 0,
    speed: 20,
    update: function() {
        if (this.keys.left) {
            this.x -= this.speed;
        }
        if (this.keys.right) {
            this.x += this.speed;
        }
    },

    setPosition: function(x) {
        this.x = x;
    },

    keys: {
        left: false,
        right: false
    }
};

const imageUrls = [
    'Sprites/GroundBlock.png',      // 1
    'Sprites/MysteryBlock1.png',    // 2
    'Sprites/Brick.png',            // 3
    'Sprites/HardBlock.png',        // 4
    'Sprites/Pipe1.png',            // 5
    'Sprites/Pipe2.png',            // 6
    'Sprites/Pipe3.png',            // 7
    'Sprites/Hill1.png',            // 8
    'Sprites/Hill2.png',            // 9
    'Sprites/Cloud1.png',           // 10
    'Sprites/Cloud2.png',           // 11
    'Sprites/Cloud3.png',           // 12
    'Sprites/Castle.png',           // 13
    'Sprites/FlagPole.png',         // 14
    'Sprites/Flag.png',             // 15
    'Sprites/Bush1.png',            // 16
    'Sprites/Bush2.png',            // 17
    'Sprites/Bush3.png',            // 18
    'Sprites/Edge.png',             // 19
    'Sprites/title.png',            // 20
    'Sprites/Edge2.png',            // 21
]

let loadedImages = {};
let imagesToLoad = imageUrls.length;

const preloadImages = () => {
    return Promise.all(imageUrls.map((url, index) => {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.src = url;
            img.onload = () => {
                loadedImages[index + 1] = img;
                resolve();
            };
            img.onerror = reject;
        });
    }));
};

let blocks = [];
const createBlocksFromMap = () => {
    blocks = map.map((row, rowIndex) => 
        row.map((tile, colIndex) => {
            if (tile > 0) {
                const img = loadedImages[tile];
                const isMysteryBlock = tile === 2;
                return isMysteryBlock 
                    ? new MysteryBlock(colIndex * TILE_SIZE, rowIndex * TILE_SIZE, img.naturalWidth * SCALE, img.naturalHeight * SCALE, img, tile, true)
                    : new Block(colIndex * TILE_SIZE, rowIndex * TILE_SIZE, img.naturalWidth * SCALE, img.naturalHeight * SCALE, img, tile, [1, 2, 3, 4, 5, 6, 7, 19, 21].includes(tile));
            }
            return null;
        })
    );
};

const handleKeyChange = (e, state) => {
    players.forEach(player => {
        switch (e.code) {
            case 'ArrowLeft':
            case 'KeyA':
                player.keys.left = state;
                player.facing = 'left';
                break;
            case 'ArrowRight':
            case 'KeyD':
                player.keys.right = state;
                player.facing = 'right';
                break;
            case 'ArrowUp':
                player.keys.up = state;
                break;
            case 'KeyL':
                camera.keys.keft = state;
            case 'KeyK':
                camera.keys.right = state;
            case 'KeyR':
                newPopulation(died);
        }
    });
};

document.addEventListener('keydown', e => handleKeyChange(e, true));
document.addEventListener('keyup', e => handleKeyChange(e, false));

const loadBlocksAndEntities = () => {
    createBlocksFromMap();
    [704, 1248, 1568, 1616, 2496, 2560, 3040, 3088, 3616, 3664, 3904, 3952, 4032, 4080, 5504, 5552].forEach(x => {
        enemies.push(new Goomba(x, 384, 32, 32));
    });
};

let previousDiversity = 0;
let previousAverageDistance = 0;
const DISTANCE_CHANGE_THRESHOLD = 1;

function gameLoop() {
    const currentTime = performance.now();
    const deltaTime = currentTime - lastFrameTime;

    // Ensure only runs on the target frame duration interval
    if (deltaTime >= FRAME_DURATION) {
        const TICK = deltaTime / 1500; // Adjust based on delta time
        lastFrameTime = currentTime - (deltaTime % FRAME_DURATION); // Correct drift

        renderGame(deltaTime);

        // Update enemies
        for (let i = enemies.length - 1; i >= 0; i--) {
            if (enemies[i].isDead) {
                enemies.splice(i, 1);
            } else {
                enemies[i].update(deltaTime, TICK, players);
                enemies[i].draw(ctx, camera);
            }
        }

        // Update players
        for (let i = players.length - 1; i >= 0; i--) {
            if (players[i].distance >= 100) {
                newPopulation(players.concat(died));
            }

            if (players[i].isDead) {
                died.push(players[i]);
                players.splice(i, 1);
            } else {
                players[i].update(deltaTime, TICK);
                players[i].draw(ctx, camera);
            }
        }

        const currentAverageDistance = players.reduce((sum, player) => sum + player.distance, 0) / players.length;

        const populationPercentage = (players.length * 100) / POPULATION;
        if (populationPercentage <= 2) {
            if (Math.abs(currentAverageDistance - previousAverageDistance) < DISTANCE_CHANGE_THRESHOLD) {
                newPopulation(died);
            } else {
                previousAverageDistance = currentAverageDistance;
            }
        } else {
            const distanceChange = Math.abs(previousAverageDistance - currentAverageDistance).toFixed(4);
            console.log(parseFloat(distanceChange));
            if (parseFloat(distanceChange) === 0) {
                newPopulation(players.concat(died));
            }
        }

        previousAverageDistance = currentAverageDistance;

        // Render the furthest player's vision and update the camera if players are alive
        if (players.length > 0) {
            const furthest = players.reduce((prev, current) => (prev.x > current.x ? prev : current));
            furthest.drawVision(visionCtx, furthest.playerVision(visionCtx, enemies));
            displayInfo(furthest);

            const cameraX = Math.max(
                0,
                Math.min(furthest.x - canvas.width / 3, tileWidth * map[0].length - canvas.width)
            );
            camera.setPosition(cameraX);
        }

        // Update FPS counter
        frameCount++;
        if (currentTime - lastFpsUpdate >= 1000) {
            fps = frameCount;
            frameCount = 0;
            lastFpsUpdate = currentTime;
        }
    }
}


function newPopulation(population) {
    // Calculate fitness scores with distance and survival time
    population.forEach(player => {
        const distanceScore = player.distance * 50;
        const survivalScore = player.lifespan * 2;
        const mysteryBlock = player.mysteryBlock * 100;
        
        player.score += (distanceScore + survivalScore + mysteryBlock);
    });

    // Calculate total fitness and normalize
    const maxScore = Math.max(...population.map(player => player.score));
    
    population.forEach(player => {
        player.fitness = player.score / maxScore;  // Normalize to [0,1]
    });

    // Sort population by fitness
    population.sort((a, b) => b.fitness - a.fitness);

    const newGeneration = [];
    
    // Elitism: Keep the best performers
    const eliteCount = Math.max(1, Math.floor(POPULATION * 0.1));  // Keep top 10%
    for (let i = 0; i < eliteCount; i++) {
        const elite = new Player(84, 350, 32, 32);
        elite.neuralNetwork = population[i].neuralNetwork.clone();
        newGeneration.push(elite);
    }

    // Fill rest of population
    while (newGeneration.length < POPULATION) {
        if (Math.random() < 0.9) { 
                const parent1 = tournamentSelection(population);
                const parent2 = tournamentSelection(population);

                const child = new Player(Math.floor(Math.random() * (250 - 84 + 1)) + 84, 350, 32, 32);
                child.neuralNetwork = parent1.neuralNetwork.crossover(parent2.neuralNetwork);
                
                const diversity = calculateDiversity(players.concat(died));
                
                const baseMutationRate = 0.1;
                const mutationStrength = 0.5;

                const minMutationRate = 0.05;
                const maxMutationRate = 0.5; 

                const mutationRate = Math.min(
                    maxMutationRate,
                    Math.max(baseMutationRate + (1 - diversity) * (maxMutationRate - baseMutationRate), minMutationRate)
                );
                
                child.neuralNetwork.mutation(mutationRate, mutationStrength);
                newGeneration.push(child);
        } else {  // 20% chance of cloning with mutation
            const parent = tournamentSelection(population);
            const child = new Player(Math.floor(Math.random() * (250 - 84 + 1)) + 84, 350, 32, 32);
            child.neuralNetwork = parent.neuralNetwork.clone();
            child.neuralNetwork.mutation(0.2, 0.5);
            newGeneration.push(child);
        }
    }

    // evaluateProgress(died);

    // Reset game state
    players = newGeneration;
    enemies = [];
    blocks = [];
    died = [];

    loadBlocksAndEntities();
    generation++;
}

function tournamentSelection(population, tournamentSize = 3) {
    // Weight selection by fitness rank
    const tournament = [];
    const populationSize = population.length;
    
    for (let i = 0; i < tournamentSize; i++) {
        // Bias towards higher-ranked individuals
        const rank = Math.floor(Math.random() ** 2 * populationSize);
        tournament.push(population[rank]);
    }
    
    return tournament.reduce((best, player) => 
        (player.fitness > best.fitness ? player : best), tournament[0]);
}


function calculateDiversity(population) {
    const meanFitness = population.reduce((sum, player) => sum + player.fitness, 0) / population.length;

    // Calculate variance in distances
    const fitnessVariance = population.reduce((sum, player) => {
        const deviation = player.fitness - meanFitness;
        return sum + Math.pow(deviation, 2);
    }, 0) / population.length;

    // Standard deviation is the square root of variance, representing diversity
    return Math.sqrt(fitnessVariance);
}
  

function displayInfo(furthest) {
    ctx.fillStyle = 'white';
    ctx.font = '14px "Press Start 2P", monospace';
    
    ctx.fillText(`GENERATION:${generation}`, 10, 25);
    ctx.fillText(`POPULATION:${players.length}`, 250, 25);
    // ctx.fillText(`SCORE:${furthest.score.toString().padStart(4, '0')}`, 140, 25);
    // ctx.fillText(`${Math.max(0, Math.min((furthest.x / (tileWidth * map[0].length - (12 * tileWidth)) * 100).toFixed(1), 100))}%`, 297, 25);

    ctx.fillText(`FPS: ${fps.toFixed(0)}`, canvas.width - 120, 25);
}

function renderGame(deltaTime) {
    // const startRow = 0;
    // const endRow   = blocks.length;
    // const startCol = Math.max(0, Math.floor(camera.x / tileWidth));
    // const endCol   = Math.min(blocks[0].length, Math.ceil((camera.x + canvas.width) / tileWidth) + 1);

    // for (let row = startRow; row < endRow; row++) {
    //     for (let col = startCol; col < endCol; col++) {
    //         const block = blocks[row][col];
    //         if (block && inViewport(block, camera)) {
    //             block.draw(ctx, camera);
    //             block.update();
                
    //             if (block instanceof MysteryBlock) {
    //                 block.animate(deltaTime);
    //             }
    //         }
    //     }
    // }
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    blocks.forEach(row => {
        row.forEach(block => {
            if (block) {
                block.draw(ctx, camera);
                block.update();
                
                if (block instanceof MysteryBlock) {
                    block.animate(deltaTime);
                }
            }
        });
    })
}

// Helper function to ensure proper block visibility checking
function inViewport(block, camera) {
    const buffer = tileWidth;
    const viewportLeft = camera.x - buffer;
    const viewportRight = camera.x + canvas.width + buffer;

    return block.x + (block.width || tileWidth) > viewportLeft &&
        block.x < viewportRight;
}

function drawGridLines() {
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.lineWidth = 2;

    for (let col = 0; col <= blocks[0].length; col++) { 
        ctx.beginPath();
        ctx.moveTo(col * tileWidth - camera.x, 0);
        ctx.lineTo(col * tileWidth - camera.x, ctx.canvas.height);
        ctx.stroke();
    }

    for (let row = 0; row <= blocks.length; row++) { 
        ctx.beginPath();
        ctx.moveTo(0, row * tileHeight);
        ctx.lineTo(ctx.canvas.width, row * tileHeight);
        ctx.stroke();
    }
}

async function startGame() {
    await preloadImages();
    loadBlocksAndEntities();

    // Set the game loop to run at 144 FPS
    setInterval(gameLoop, FRAME_DURATION);
}

startGame();