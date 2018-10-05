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

method Main() {
  var a := "hello";
  var b := "what";
  var c := "hello";
  
  assert a == c;
  var cmp := strcmp(a, c);
  assert cmp == 0;
  
  assert a == "hello" && b == "what";
  cmp := strcmp(a, b);
  print "strcmp(", a, ",", b, ")=", cmp, '\n';
  assert cmp == -1;
  
  assert a == "hello" && b == "what";
  cmp := strcmp(b, a);
  print "strcmp(", b, ",", a, ")=", cmp, '\n';
  assert cmp == 1;
}
