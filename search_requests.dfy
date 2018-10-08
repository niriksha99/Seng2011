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
    
    method init(id: int, userID: int, event_name: string, event_date: string, event_time: string, deadline: string, suburb: string, event_type: string, 
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

predicate StringEqual(a: string, b: string)
{ |a| == |b| && forall i :: 0 <= i < |a| ==> a[i] == b[i] }

method strcmp(a: string, b: string) returns (res: int)
ensures res == 0  ==> StringEqual(a,b)
ensures res == 1  ==> (|a| != |b| || (|a| == |b| && exists k :: 0 <= k < |a| && a[k] != b[k]) )
{
    if (|a| != |b|) {return 1;}
    var i := 0;
    while (i < |a|)
    invariant 0 <= i <= |a|;
    invariant forall k :: 0 <= k < i ==> a[k] == b[k]
    {
        if (a[i] != b[i]) { return 1; }
        i := i + 1;
    }
    assert StringEqual(a, b);
    return 0; 
}

method Search(a: array<RowDataPacket>, key: string) returns(b: array<int>)
requires a.Length > 1
ensures b.Length <= a.Length
ensures forall k::0<=k<b.Length ==> 0<=b[k]<a.Length;
ensures forall k::0<=k<b.Length ==> StringEqual(a[b[k]].event_type,key)
{
    var i, j, cmp: int;
    b:= new array<int>;
    i:=0;
    j:=0;
    while i<a.Length
        invariant 0<=i<=a.Length
        invariant 0<=j<=i
       // invariant forall k:: 1<=k<j ==> 0<=b[k]<i
        invariant forall k:: 1<=k<j ==> StringEqual(a[b[k]].event_type,key)
    {
        cmp:=strcmp(a[i].event_type,key);
        if (cmp == 0){      
            b[j]:= i;  
            j:=j+1;
        }
        i:=i+1;
    }
    assert(i == a.Length);
    return b;
}   
