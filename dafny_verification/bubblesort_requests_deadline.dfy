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
    var event_name: array<char>;
    var event_date: string; // ??? date
    var event_time: string; // ??? time
    var deadline: string; // ??? date
    var suburb: string;
    var event_type: string;
    var no_people: int;
    var food_quality: string;
    var budget: real;
    var choice: string;
    var additional_info: string;
    var last_modified: string; // ??? datetime
    var status: int;
    
    method init(id: int, userID: int, event_name: array<char>, event_date: string, event_time: string, deadline: string, suburb: string, event_type: string, 
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
    }
}

method matches(a: array<char>, b: array<char>, n: int) returns (res: bool)
requires 0<=n<a.Length-b.Length
ensures res ==true ==> forall i::0<=i<b.Length ==> a[n+i] == b[i]
ensures res ==false ==> exists i::0<=i<b.Length && a[n+i] != b[i]
{
    var i:=0;
    while (i < b.Length)
    invariant 0<=i<=b.Length
    invariant forall k::0<=k<i ==>a[n+k] == b[k]
    {
      if(a[n+i] != b[i]){
        return false;
      }
      i := i+1;
    }
    return true;
}


predicate StringContain(a: array<char>, b: array<char>)
requires a.Length >= b.Length
{ exists i::0<=i< a.Length-b.Length && forall j::0 <= j < b.Length ==> a[i+j] == b[j] }

method includes(a: array<char>, b: array<char>) returns (res: bool)
ensures res == true  ==> a.Length >= b.Length && StringContain(a,b)
ensures res == false  ==> a.Length < b.Length || !StringContain(a,b)
{
   var i :=0;
   if (a.Length < b.Length){return false;}
   while(i < a.Length-b.Length)
   invariant 0<=i<=a.Length-b.Length
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

method SearchByEventName(a: array<RowDataPacket>, key: array<char>) returns(b: array<RowDataPacket>)
requires a.Length>0
ensures 0<b.Length ==> b.Length<=a.Length && forall i::0<=i<b.Length ==> StringContain(b[i].event_name,key);
ensures b.Length == 0 ==> forall k:: 0<=k<a.Length ==> !StringContain(a[k].event_name,key);
{
   b :=new array<RowDataPacket>;
   var i:= 0;
   var j:= 0;
   while i<a.Length
   invariant 0<=i<=a.Length
//   invariant 0<=j<=b.Length
   //invariant forall k:: 0<=k<i ==> a[k]!=key
   {
     var cmp := includes(a[i].event_name,key);
     if (cmp == true){
       b[j] := a[i];
       j := j+1;
     }
     i := i+1;
   }
   return b;
}
