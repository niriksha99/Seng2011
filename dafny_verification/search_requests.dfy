class {:autocontracts} RowDataPacket 
{
    var id: int;
    var userID: int;
    var event_name: string;
    
    predicate Valid() {
        id > 0 && userID > 0 && |event_name| > 0
    }

    method init(id: int, userID: int, event_name: string)
        requires id > 0 && userID > 0 && |event_name| > 0
        modifies this;
        ensures this.id==id && this.userID==userID && this.event_name==event_name
    {
      this.id:= id;
      this.userID:= userID;
      this.event_name:= event_name;
    }

}

predicate StringMatch(a: string, b: string, n: int)
requires 0<=n<|a|-|b|;
{ forall k::0<=k<|b| ==> a[n+k] == b[k] }

predicate StringNotMatch(a: string, b: string, n: int)
requires 0<=n<|a|-|b|;
{ exists k::0<=k<|b| && a[n+k] != b[k]}

method matches(a: string, b: string, n: int) returns (res: bool)
requires 0<=n<|a|-|b|
ensures res ==true ==> StringMatch(a,b,n)
ensures res ==false ==> StringNotMatch(a,b,n)
{
    var i:=0;
    while (i < |b|)
    invariant 0<=i<=|b|
    invariant forall k::0<=k<i ==>a[n+k] == b[k]
    {
      if(a[n+i] != b[i]){
        return false;
      }
      i := i+1;
    }
    return true;
}


predicate StringContain(a: string, b: string)
{ |a| >= |b| ==> exists i::0<=i< |a|-|b| && StringMatch(a,b,i) }

predicate StringNotContain(a: string, b: string)
{ |a| >= |b| ==> forall k::0<=k<|a|-|b| ==> StringNotMatch(a,b,k) }

method includes(a: string, b: string) returns (res: bool)
requires |a|>0 && |b|>0
ensures res == true  ==> |a| >= |b| && StringContain(a,b)
ensures res == false  ==> |a| < |b| || (|a| >= |b| && StringNotContain(a,b))
{
   var i :=0;
   if (|a| < |b|){return false;}
   while(i < |a|-|b|)
   invariant 0<=i<=|a|-|b|
   invariant forall k :: 0 <= k < i ==> (a[k] != b[0] || StringNotMatch(a,b,k))
   {
     if (a[i] == b[0]){
       var m := matches(a,b,i);
       if (m == true){
         return true;
       }
     }
      i:= i+1;
   }
   return false;
}

/*
The following search method does not verify, however the above methods do.

This method takes in all requests as a sequence of RowDataPacket, and a search string.
It retuns the search result, a sequence of RowDataPacket event_names containing the search string.

My postcondition is that the elements of result are all the elements from the 
original array which contain the search_string in the event_name.
Note that each element of the original array is unique, so the elements of the result 
sequence should be the same as the elements of the result set.

In the loop invariant, the sequence result contains every element of the original array up to a[i] 
that contains the search string in the event_name.

*/
/*
method SearchByEventName(a: seq<RowDataPacket>, key: string) returns(result: seq<RowDataPacket>)
requires |a|>0 && |key|>0
requires forall k,l :: 0<=k<l<|a| ==> a[k] != a[l] // ids are unique
ensures (set y | y in result) == (set x | x in a[..] && |x.event_name| >= |key| && StringContain(x.event_name, key))

{
   result := [];
   var i:= 0;
   while i<|a|
   invariant 0<=i<=|a|
   invariant forall k,l :: 0<=k<l<|a| ==> a[k] != a[l] // ids are unique
   invariant (set y | y in result) == (set x | x in a[..i] && |x.event_name| >= |key| && StringContain(x.event_name, key))
   {
       if (|a[i].event_name| >= |key|) {
         var cmp := includes(a[i].event_name,key);
         if (cmp == true) {
           result := result + [a[i]];
         }
       }
       i := i+1;     
   }
   return result;
}
*/