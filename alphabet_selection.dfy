predicate StringEqual(a: String, b: String)
requires a.Length == b.Length;
{ forall i :: 0 <= i < a.Length ==> a[i] == b[i] }

predicate Sorted(a: array<String>, lo: int, hi: int)
reads a;
{ forall i, j :: lo <= i <= j < hi ==> strcmp(a[i], a[j]) <= 0 }

method strcmp(a: String, b: String) returns (res: int)
requires a.Length <= b.Length;
ensures res == 0 ==> StringEqual(a, b)
ensures res < 0 ==> (a.Length <= b.Length && exists k :: 0 <= k < a.Length && a[k] < b[k] && forall i :: 0 <= i <= k ==> a[i] == b[i])
ensures res > 0 ==> (a.Length <= b.Length && exists k :: 0 <= k < a.Length && a[k] > b[k] && forall i :: 0 <= i <= k ==> a[i] == b[i])
{
    var i := 0;
    while (i < a.Length)
    invariant 0 <= i <= a.Length;
    invariant forall k :: 0 <= k < i ==> a[k] == b[k];
    {
        if (a[k] < b[k]) { return -1; }
        else if (a[k] > b[k]) {return 1; }
        i := i + 1;
    }
    return 0;
}

method Sort(a: array<String>)
modifies a;
requires a.Length > 1;
ensures Sorted(a, 0, a.Length);
ensures multiset(a[..]) == multiset(old(a)[..])
{
    var b: array<String> := new String[a.Length];
    var min := a[0];
    var i := 0;
    while (i < a.Length)
    invariant 0 <= i <= a.Length;
    invariant Sorted(b, 0, i);
    {
        var j := 0;
        while (j < a.Length)
        invariant 0 <= j <= a.Length;
        {
            if (strcmp(min, a[j]) > 0) { min := a[j]; }
            j := j + 1;
        }
        b[i] := min;
        i := i + 1;
    }
}


method Main()
{

}
