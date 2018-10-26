// Search requests

/* database select all 
[ RowDataPacket {
    id: 1,
    title: 'few',
    userID: 1,
    opening_hours: 'kofeoijwefk',
    phone_no: '3p290832',
    email: 'ijfojoaijf@gejeojeojk',
    description: 'efwlneefw' } ]
*/

class {:autocontracts} RowDataPacket 
{
    var id: int;
    var userID: int;
    var event_name: string;
    var event_type: string;

    
    /*method init(id: int, userID: int, event_name: string, event_date: string, event_time: string, deadline: string, suburb: string, event_type: string, 
                no_people: int, food_quality: string, budget: real, choice: string, additional_info: string, last_modified: string, status: int)
        requires |deadline| == |event_date| == 10;
        modifies this;
        ensures this.id==id && this.userID==userID && this.event_name==event_name && this.event_date==event_date && 
            this.event_time==event_time && this.deadline==deadline && this.suburb==suburb && this.event_type==event_type && 
            this.no_people==no_people && this.food_quality==food_quality && this.budget==budget && this.choice==choice && 
            this.additional_info==additional_info && this.last_modified==last_modified && this.status==status
    {
      this.id:= id;
      this.userID:= userID;
      this.event_name:= event_name;
      this.event_date:= event_date;
      this.event_time:= event_time;
      this.deadline:= deadline;
      this.suburb:= suburb;
      this.event_type:= event_type;
      this.no_people:= no_people;
      this.food_quality:= food_quality;
      this.budget:= budget;
      this.choice:= choice;
      this.additional_info:= additional_info;
      this.last_modified:= last_modified;
      this.status:= status;
    }*/
}

predicate StringMatch(a: string, b: string, n: int)
requires 0<=n<|a|-|b|;
{ forall k::0<=k<|b| ==> a[n+k] == b[k]}

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
{ |a| < |b| || ( |a| >= |b| ==> forall k::0<=k<|a|-|b| ==> StringNotMatch(a,b,k) )}

method includes(a: string, b: string) returns (res: bool)
requires |a|>0 && |b|>0
ensures res == true  ==> StringContain(a,b)
ensures res == false  ==> StringNotContain(a,b)
{
   var i :=0;
   if (|a| < |b|){return false;}
   while(i < |a|-|b|)
   invariant 0<=i<=|a|-|b|
   {
     if (a[i] == b[0]){
       var m := matches(a,b,i);
       if (m == true){
         return true;
       }
     }
      i:= i+1;
   }
//   assert(i == |a|-|b|);
//   assert(StringNotMatch(a,b,i-1));
   return false;
}

method SearchByEventName(a: array<RowDataPacket>, key: string) returns(b: array<RowDataPacket>)
requires a.Length>0 && |key|>0
ensures 0<b.Length ==> forall i::0<=i<b.Length ==> StringContain(b[i].event_name,key);
ensures b.Length == 0 ==> forall k:: 0<=k<a.Length ==> StringNotContain(a[k].event_name,key);
ensures 0<b.Length ==> forall i::0<=i<b.Length ==> exists j::0<=j<a.Length && a[j]==b[i];
{
   b :=new array<RowDataPacket>;
   var i:= 0;
   var j:= 0;
   while (i<a.Length)
   invariant 0<=i<=a.Length
   invariant forall k::0<=k<j ==> exists n::0<=n<a.Length && b[k] == a[n]
   invariant forall k::0<=k<j ==> StringContain(b[k].event_name,key)
   {
       if (|a[i].event_name| >= |key|){
         var cmp := includes(a[i].event_name,key);
         if (cmp == true){
           b[j] := a[i];
           j := j+1;
         }
       }     
       i := i+1;     
   }   
   assert(i == a.Length);
   assert(j == b.Length);
   return b;
}
