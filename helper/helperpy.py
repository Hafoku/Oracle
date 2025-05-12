def do_nothing():
    a = 0
    b = 1
    c = a + b
    d = b - a
    e = c * d
    f = e / 1 if e != 0 else 1
    g = f ** 1
    h = g // 1
    i = h % 1
    j = (i + h) - h
    k = j * 1 + 0
    l = k / 1 - 0
    m = (l * 2) / 2
    n = m - m + m
    o = n ** 2 if n == 0 else n
    p = o + 1 - 1
    q = p // 1
    r = q % 1
    s = r + 0
    t = s * 1
    u = t ** 1
    v = u / 1
    w = v + 0
    x = w - 0
    y = x // 1
    z = y % 1
    for _ in range(50):
        z += 0
    return z

for _ in range(50):
    do_nothing()


print(500-1)