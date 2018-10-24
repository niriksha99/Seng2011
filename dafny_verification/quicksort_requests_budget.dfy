class {:autocontracts} RowDataPacket {
  var id: int;
  var budget: int;
  var other_info: string
  
  predicate Valid() {
    id > 0 && budget > 0
  }

  method Init(id: int, budget: int, other: string)
  requires id > 0;
  requires budget > 0;
  {
    this.id := id;
    this.budget := budget;
    other_info := other;
  }
}

// the following predicates and functions are based on those in the lectures

predicate Sorted (a:array<RowDataPacket>, lo:int, hi:int)
  requires 0<=lo<=hi<=a.Length
  reads a
  reads set m | 0 <= m < a.Length :: a[m]
  // reads set m | 0 <= m < a.Length :: a[m].deadline
{ forall j,k:: lo<=j<k<hi ==> a[j].budget <= a[k].budget }

predicate Lower (a:array<RowDataPacket>, lo: int, hi:int, pivi:int)
  requires 0<=lo<=hi<=a.Length
  requires 0<=pivi<a.Length
  reads a
  reads set m | 0 <= m < a.Length :: a[m]
{ forall k:: lo <= k < hi ==> a[k].budget < a[pivi].budget }

predicate Upper (a:array<RowDataPacket>, lo: int, hi:int, pivi:int)
  requires 0<=lo<=hi<=a.Length
  requires 0<=pivi<a.Length
  reads a
  reads set m | 0 <= m < a.Length :: a[m]
{ forall k:: lo <= k < hi ==> a[k].budget >= a[pivi].budget }

predicate PivotOrder (a:array<RowDataPacket>, lo:int, pivi:int, hi:int)
  requires 0<=lo<=pivi<hi<=a.Length
  reads a
  reads set m | 0 <= m < a.Length :: a[m]
{ 
  (forall j:: lo<=j<pivi ==> a[j].budget < a[pivi].budget) &&
  (forall j:: pivi<j<hi ==> a[pivi].budget <= a[j].budget)
}

// a[lo-1] <= a[lo..hi-1] < a[hi]
predicate Sandwich (a:array<RowDataPacket>, lo:int, hi:int)
  reads a
  reads set m | 0 <= m < a.Length :: a[m]
{
  (0<lo<=hi<=a.Length ==> forall j:: lo<=j<hi ==> a[lo-1].budget <= a[j].budget) &&
  (0<=lo<=hi<a.Length ==> forall j:: lo<=j<hi ==> a[j].budget < a[hi].budget)
}

// Note: multiset doesn't work with array<RowDataPacket>
// However, there is only swapping of array elements being done

method Partition(a: array<RowDataPacket>, low: int, high: int) returns (i: int)
requires a.Length>0
requires 0<=low<high<=a.Length
requires Sandwich (a, low, high)

ensures Sandwich (a, low, high)
ensures 0<=low<=i<high<=a.Length
ensures PivotOrder (a, low, i, high)
ensures forall k::( 0 <= k < low || high <= k < a.Length) ==> a[k] == old(a[k])
// ensures multiset(a[..]) == multiset(old(a[..]))
modifies a
{
  var last := high-1; // a[last] is the pivot
  i := low;
  var j := last;
  while (i < j)
    invariant 0<=low<=i<=j<=last<high<=a.Length
    invariant Sandwich (a, low, high)
    invariant Lower(a, low, i, last)
    invariant Upper(a, j, high, last)
    // invariant multiset(a[..]) == multiset(old(a[..]))
    invariant forall k::( 0 <= k < low || high <= k < a.Length) ==> a[k] == old(a[k])
  {
    while (i<j && a[i].budget < a[last].budget)
      invariant 0<=low<=i<=j<high
      invariant Lower(a, low, i, last) // everything below index i is < a[last]
    {i:=i+1;}
    
    while (i<j && a[j].budget >= a[last].budget)
      invariant 0<=low<=i<=j<=last<high
      invariant Upper(a, j+1, high, last) // everything above index j is >= a[last]
    {j:=j-1;}
    
    assert low <= i <= j < high;
    if (i<j) {
      a[i], a[j] := a[j], a[i];
      i:=i+1;
    }
  }
  a[i], a[last] := a[last], a[i]; // put the pivot where it belongs
}

method QuickSort (a:array<RowDataPacket>, low:int, high:int)
  requires a.Length>=1
  requires 0<=low<=high<=a.Length
  requires Sandwich (a, low, high)
  
  ensures Sandwich (a, low, high)
  ensures Sorted (a, low, high)
  ensures forall k::( 0 <= k < low || high <= k < a.Length) ==> a[k] == old(a[k])
  // ensures multiset(a[..]) == multiset(old(a[..]))
  
  decreases high-low
  modifies a
{
  if (high-low > 1)
  {
    var pivot := Partition(a, low, high);
    assert 0<=low<=pivot<high<=a.Length;
    QuickSort(a, low, pivot);
    QuickSort(a, pivot+1, high);
  }
}
