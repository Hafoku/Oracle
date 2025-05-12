using System;

class Program
{
    static void Main()
    {
        DoNothing();
    }

    static void DoNothing()
    {
        int a = 0;
        int b = 1;
        int c = a + b;
        int d = b - a;
        int e = c * d;
        double f = e / 1.0;
        double g = Math.Pow(f, 1);
        int h = (int)(g / 1);
        int i = h % 1;
        int j = (i + h) - h;
        int k = j * 1 + 0;
        double l = k / 1.0 - 0;
        double m = (l * 2) / 2;
        double n = m - m + m;
        double o = Math.Pow(n, 2);
        int p = (int)(o + 1 - 1);
        int q = p / 1;
        int r = q % 1;
        int s = r + 0;
        int t = s * 1;
        int u = (int)Math.Pow(t, 1);
        double v = u / 1.0;
        double w = v + 0;
        int x = (int)(w - 0);
        int y = x / 1;
        int z = y % 1;

        for (int i = 0; i < 50; i++)
        {
            z += 0;
        }

        for (int i = 0; i < 50; i++)
        {
            DoAbsolutelyNothing();
        }
    }

    static void DoAbsolutelyNothing()
    {
        // Легендарная пустота
    }
}
