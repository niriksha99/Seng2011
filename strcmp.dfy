function method min(a: int, b: int): int
{ if a <= b then a else b }

predicate PrecedeEqual(a: array<char>, b: array<char>, n: int)
requires 0 <= n <= min(a.Length, b.Length);
reads a, b;
{ forall i :: 0 <= i < n ==> a[i] == b[i] }

predicate StringLessThan(a: array<char>, b: array<char>)
requires a.Length > 0 && b.Length > 0;
reads a, b;
{ exists k :: 0 <= k < min(a.Length, b.Length) && a[k] < b[k] && PrecedeEqual(a, b, k) }

predicate StringMoreThan(a: array<char>, b: array<char>)
requires a.Length > 0 && b.Length > 0;
reads a, b;
{ exists k :: 0 <= k < min(a.Length, b.Length) && a[k] > b[k] && PrecedeEqual(a, b, k) }

method strcmp(a: array<char>, b: array<char>) returns (res: int)
requires a.Length > 0 && b.Length > 0;
ensures res == 0 || res == 1 || res == -1;
ensures res == 0  ==> a.Length == b.Length && PrecedeEqual(a, b, a.Length);
ensures res == -1 ==> StringLessThan(a, b) || (a.Length < b.Length && PrecedeEqual(a, b, a.Length));
ensures res == 1  ==> StringMoreThan(a, b) || (a.Length > b.Length && PrecedeEqual(a, b, b.Length));
{
    var i := 0;
    res := 0;
    var minLen := min(a.Length, b.Length);
    while (i < minLen)
    invariant 0 <= i <= min(a.Length, b.Length);
    invariant PrecedeEqual(a, b, i);
    {
        if (a[i] < b[i]) { return -1; }
        else if (a[i] > b[i]) { return 1; }
        i := i + 1;
    }
    
    if (a.Length < b.Length) { return -1; }
    else if (a.Length > b.Length) { return 1; }
    else if (a.Length == b.Length) { return 0; }
}

method Main() {
  var a :array<char> := new char[5];
  a[0], a[1], a[2], a[3], a[4] := 'h', 'e', 'l', 'l', 'o';
  var b :array<char> := new char[4];
  b[0], b[1], b[2], b[3] := 'h', 'e', 'l', 'l';
  var c :array<char> := new char[4];
  c[0], c[1], c[2], c[3] := 'w', 'h', 'a', 't';
  
  var cmp := strcmp(a, a);
  assert cmp == 0;
  
  cmp := strcmp(a, b);
  assert cmp == 1;
  
  cmp := strcmp(b, a);
  assert cmp == -1;
  
  assert a[0] == 'h'; assert a[1] == 'e'; assert a[2] == 'l'; assert a[3] == 'l'; assert a[4] == 'o';
  assert b[0] == 'h'; assert b[1] == 'e'; assert b[2] == 'l'; assert b[3] == 'l';
  assert c[0] == 'w'; assert c[1] == 'h'; assert c[2] == 'a'; assert c[3] == 't';
  cmp := strcmp(a, c);
  assert cmp == -1;
  
  cmp := strcmp(c, a);
  assert cmp == 1;
  
  cmp := strcmp(b, c);
  assert cmp == -1;
  
  cmp := strcmp(c, b);
  assert cmp == 1;
}

/* NOT VERIFY FOR STRING/SEQ<CHAR>
function method min(a: int, b: int): int
{ if a <= b then a else b }

predicate PrecedeEqual(a: string, b: string, n: int)
requires 0 <= n <= min(|a|, |b|);
{ forall i :: 0 <= i < n ==> a[i] == b[i] }

predicate StringLessThan(a: string, b: string)
requires |a| > 0 && |b| > 0;
{ exists k :: 0 <= k < min(|a|, |b|) && a[k] < b[k] && PrecedeEqual(a, b, k) }

predicate StringMoreThan(a: string, b: string)
requires |a| > 0 && |b| > 0;
{ exists k :: 0 <= k < min(|a|, |b|) && a[k] > b[k] && PrecedeEqual(a, b, k) }

method strcmp(a: string, b: string) returns (res: int)
requires |a| > 0 && |b| > 0;
ensures res == 0 || res == 1 || res == -1;
ensures res == 0  ==> |a| == |b| && PrecedeEqual(a, b, |a|);
ensures res == -1 ==> StringLessThan(a, b) || (|a| < |b| && PrecedeEqual(a, b, |a|));
ensures res == 1  ==> StringMoreThan(a, b) || (|a| > |b| && PrecedeEqual(a, b, |b|));
{
    var i := 0;
    res := 0;
    var minLen := min(|a|, |b|);
    while (i < minLen && res == 0)
    invariant 0 <= i <= min(|a|, |b|);
    invariant res == 0  ==> PrecedeEqual(a, b, i);
    invariant res == 1  ==> StringMoreThan(a, b);
    invariant res == -1 ==> StringLessThan(a, b);
    {
        if (a[i] < b[i]) { res := -1; }
        else if (a[i] > b[i]) { res := 1; }
        i := i + 1;
    }
    if (res != 0) { return res; }
    
    if (|a| < |b|) { return -1; }
    else if (|a| > |b|) { return 1; }
    else if (|a| == |b|) { return 0; }
}
*/
