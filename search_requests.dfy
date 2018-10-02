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
    
    predicate Valid() {
      |deadline| == |event_date| == 10
    }
    
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

method strcmp(a:string, b:string) returns (result: bool)
requires |a| == |b|
ensures result == 1 || result == -1
ensures result == 1 ==> forall j :: 0<=j<|a| ==> a[j]==b[j]
ensures result == -1 ==> exists i :: 0<=i<|a| && (a[i] != b[i] && (forall j :: 0<=j<i ==> a[j]==b[j]))
{
    var i:int;
    i:=0;
    while (i < |a| && a[i] == b[i])
        invariant 0<=i<=|a|
        invariant forall k::0<=k<i ==> a[k]==b[k]
    {
        i:=i+1;  
    }
    if (i == |a|) {
        result:=1;
    }
    else {
        if (a[i] != b[i]) {
        result:=-1;
        }
    }
}

predicate str_match(a: string, b: string)
    requires |a| == |b|
{   strcmp(a,b) == 1     }

predicate str_not_match(a: string, b: string)
{   strcmp(a,b) == -1   }


method Search(a: array<RowDataPacket>, key: string) returns(b: array<RowDataPacket>)
modifies b
requires a.Length > 1
ensuires 
ensures forall k:: 0<=k<b.Length ==> b[k].event_type = key
{
    var i, j, cmp: int
    i:=0;
    j:=0;
    while i<a.Length
        invariant 0<=i<=a.Length
        invariant forall k:: j<k<i ==> a[k]!=key
    {
        cmp:=strcmp(a[i],key)
        if (cmp == 1){ 
            b[j]:= a[i];
            j:=j+1; 
        }
        i:=i+1;
    }
    return b;
}    

