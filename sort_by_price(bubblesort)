class RowDataPacket {
  var id: int;
  var budget: int;
  var other_info: string

  method Init(x: int, y: int, z: string)
  modifies this;
  requires x>0;
  requires y>0;
  {
    id := x;
    budget := y;
    other_info := z;
  }

}

predicate sorted_by_price(arr: array<RowDataPacket>, start: int, end: int)
requires 0 <= start <= end <= arr.Length;
reads arr;
reads set m | 0<= m < arr.Length :: arr[m];
{
  forall i, j :: start <= i < j < end ==> arr[i].budget <= arr[j].budget
}

method bubblesort(arr: array<RowDataPacket>)
requires 1 < arr.Length;
modifies arr;
ensures sorted_by_price(arr, 0, arr.Length)
{
  var i:=0;
  while i<arr.Length-1
  invariant 0 <= i <= arr.Length-1
  invariant forall p, q :: 0 <= p < i <= q < arr.Length ==> arr[p].budget <= arr[q].budget;
  invariant sorted_by_price(arr, 0, i);
  {
    var j := arr.Length - 1;
    while j > i
    invariant i <= j < arr.Length;
    invariant forall u, v :: 0 <= u < i <= v < arr.Length ==> arr[u].budget <= arr[v].budget;
    invariant forall t :: j <= t < arr.Length ==> arr[j].budget <= arr[t].budget;
    invariant sorted_by_price(arr, 0, i);
    {
      if (arr[j].budget <= arr[j-1].budget)
      {
        arr[j - 1], arr[j] := arr[j], arr[j-1];
      }
      j := j - 1;
    }
    i := i + 1;
  }
}
