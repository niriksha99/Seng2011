function method min(a: int, b: int): int
{ if a <= b then a else b }

predicate PrecedeEqual(a: string, b: string, n: int)
requires n <= min(|a|, |b|);
{ forall i :: 0 <= i < n ==> a[i] == b[i] }

//predicate StringEqual(a: string, b: string)
//{ |a| == |b| && PrecedeEqual(a, b, |a|) }

method strcmp(a: string, b: string) returns (res: int)
ensures res == 0  ==> a == b;
ensures res == -1 ==> (exists k :: 0 <= k < min(|a|, |b|) && a[k] < b[k] && PrecedeEqual(a, b, k)) || (|a| < |b| && PrecedeEqual(a, b, |a|));
ensures res == 1  ==> (exists k :: 0 <= k < min(|a|, |b|) && a[k] > b[k] && PrecedeEqual(a, b, k)) || (|a| > |b| && PrecedeEqual(a, b, |b|));
{
    var i := 0;
    var minLen := min(|a|, |b|);
    while (i < minLen)
    invariant 0 <= i <= minLen;
    invariant PrecedeEqual(a, b, i);
    {
        if (a[i] < b[i]) { return -1; }
        else if (a[i] > b[i]) {return 1; }
        i := i + 1;
    }
    assert PrecedeEqual(a, b, min(|a|, |b|));
    if (|a| < |b|) { return -1; }
    else if (|a| > |b|) { return 1; }
    else if (|a| == |b|) { return 0; }
}

////////////////////////////////////////////////////////////////////////////////
predicate SmallerEqual(a: string, b: string)
{ (exists k :: 0 <= k < min(|a|, |b|) && |a| < |b| && PrecedeEqual(a, b, k)) || (|a| < |b| && PrecedeEqual(a, b, |a|)) || a == b }

predicate Sorted(a: array<string>, lo: int, hi: int)
reads a;
requires 0 <= lo && hi <= a.Length;
{ forall i, j :: lo <= i <= j < hi ==> SmallerEqual(a[i], a[j]) }

method Sort(a: array<string>)
modifies a;
requires a.Length > 1;
ensures Sorted(a, 0, a.Length);
ensures multiset(a[..]) == multiset(old(a)[..])
{
    var i := 0;
    while (i < a.Length - 1)
    invariant 0 <= i < a.Length;
    invariant Sorted(a, 0, i);
    invariant multiset(a[..]) == multiset(old(a)[..]);
    {
        var j := i + 1;
        var min_index := i;
        while (j < a.Length)
        invariant i < j <= a.Length;
        invariant i <= min_index < a.Length;
        invariant forall k :: i <= k < j ==> SmallerEqual(a[min_index], a[k]);
        invariant forall k :: 0 <= k < i ==> SmallerEqual(a[k], a[min_index]);
        {
            var cmp := strcmp(a[min_index], a[j]);
            if (cmp > 0) { min_index := j; }
            j := j + 1;
        }
        a[i], a[min_index] := a[min_index], a[i];
        i := i + 1;
    }
}
