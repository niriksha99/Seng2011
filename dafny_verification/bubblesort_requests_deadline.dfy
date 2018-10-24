
class {:autocontracts} RowDataPacket
{
    var id: int;
    var userID: int;
    // other fields omitted
    var deadline: string;

    predicate Valid() {
      |deadline| == 10
    }

    // d is deadline of the event
    method Init (id: int, userID: int, d: string)
      requires |d| == 10
      ensures this.id == id && this.userID == userID
      ensures deadline[..] == d[..]

    {
      this.id := id;
      this.userID := userID;
      this.deadline := d;
      /*
      this.deadline := new char[10];
      deadline[0], deadline[1], deadline[2], deadline[3], deadline[4], deadline[5], deadline[6], deadline[7], deadline[8], deadline[9]
          := d[0], d[1], d[2], d[3], d[4], d[5], d[6], d[7], d[8], d[9];
      */
    }
}


function method min(a: int, b: int): int
{ if a <= b then a else b }

// all chars are equal, up to index n
predicate PrecedeEqual(a: string, b: string, n: int)
requires 0 <= n <= min(|a|, |b|);
{ forall i :: 0 <= i < n ==> a[i] == b[i] }

// a is less than b
predicate StringLessThan(a: string, b: string)
requires |a| > 0 && |b| > 0;
{ exists k :: 0 <= k < min(|a|, |b|) && a[k] < b[k] && PrecedeEqual(a, b, k) }

predicate StringLessThanOrEqual(a: string, b: string)
requires |a| > 0 && |b| > 0;
{
  // (|a| == |b| && forall i :: 0<=i<|a| ==> a[i] == b[i]) ||
  // (exists k :: 0 <= k < min(|a|, |b|) && a[k] < b[k] && PrecedeEqual(a, b, k))
  StringEqual(a,b) || StringLessThan(a,b)
}

predicate StringMoreThan(a: string, b: string)
requires |a| > 0 && |b| > 0;
{ exists k :: 0 <= k < min(|a|, |b|) && a[k] > b[k] && PrecedeEqual(a, b, k) }

predicate StringMoreThanOrEqual(a: string, b: string)
requires |a| > 0 && |b| > 0;
{ StringEqual(a,b) || StringMoreThan(a,b) }

predicate StringEqual(a: string, b: string)
requires |a| > 0 && |b| > 0;
{ |a| == |b| && forall i :: 0<=i<|a| ==> a[i] == b[i] }

method strcmp(a: string, b: string) returns (res: int)
requires |a| > 0 && |b| > 0;
ensures res == 0 || res == 1 || res == -1;
ensures res == 0  ==> |a| == |b| && PrecedeEqual(a, b, |a|);
ensures res == -1 ==> StringLessThan(a, b) || (|a| < |b| && PrecedeEqual(a, b, |a|));
ensures res == 1  ==> StringMoreThan(a, b) || (|a| > |b| && PrecedeEqual(a, b, |b|));
ensures a[..] == old(a[..]) && b[..] == old(b[..])
{
    var i := 0;
    res := 0;
    var minLen := min(|a|, |b|);
    while (i < minLen)
    invariant 0 <= i <= min(|a|, |b|);
    invariant PrecedeEqual(a, b, i);
    {
        if (a[i] < b[i]) { return -1; }
        else if (a[i] > b[i]) { return 1; }
        i := i + 1;
    }

    if (|a| < |b|) { return -1; }
    else if (|a| > |b|) { return 1; }
    else if (|a| == |b|) { return 0; }
}

predicate Sorted (a:array<RowDataPacket>, lo:int, hi:int)
  requires forall i :: 0<=i<a.Length ==> |a[i].deadline|==10
  requires 0<=lo<=hi<=a.Length
  reads a
  reads set m | 0 <= m < a.Length :: a[m]
  // reads set m | 0 <= m < a.Length :: a[m].deadline
{ forall j,k:: lo<=j<k<hi ==> StringLessThanOrEqual(a[j].deadline, a[k].deadline) }

// Note: multiset doesn't work with array<RowDataPacket>
// However, there is only swapping of array elements being done

method bubblesort(arr: array<RowDataPacket>)
requires 1 < arr.Length;
requires forall m :: 0<=m<arr.Length ==> |arr[m].deadline|==10
modifies arr;
ensures forall m :: 0<=m<arr.Length ==> |arr[m].deadline|==10
ensures Sorted(arr, 0, arr.Length)
{
  var i:=0;
  while (i < arr.Length-1)
  invariant 0 <= i <= arr.Length-1
  invariant forall m :: 0<=m<arr.Length ==> |arr[m].deadline|==10
  invariant forall p, q :: 0 <= p < i <= q < arr.Length ==> StringLessThanOrEqual(arr[p].deadline, arr[q].deadline);
  invariant Sorted(arr, 0, i);
  {
    var j := arr.Length - 1;
    while j > i
    invariant 0 <= i <= j < arr.Length;
    invariant forall m :: 0<=m<arr.Length ==> |arr[m].deadline|==10
    invariant forall u, v :: 0 <= u < i <= v < arr.Length ==> StringLessThanOrEqual(arr[u].deadline, arr[v].deadline);
    invariant forall t :: j <= t < arr.Length ==> StringLessThanOrEqual(arr[j].deadline, arr[t].deadline);
    invariant Sorted(arr, 0, i);
    // invariant multiset(arr[..]) == multiset(old(arr[..]))
    {
      var cmp: int;
      cmp := strcmp(arr[j].deadline, arr[j-1].deadline);
      if (cmp == -1 || cmp == 0)
      {
        arr[j - 1], arr[j] := arr[j], arr[j-1];
      }
      j := j - 1;
    }
    i := i + 1;
  }
  assert forall m :: 0<=m<arr.Length ==> |arr[m].deadline|==10;
}
