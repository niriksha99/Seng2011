// Sort requests by deadline

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

class RowDataPacket {
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
}

// 2015-12-28 YYYY-MM-DD

/*
predicate equal_strings(a:string, b:string) 
  requires a != null && b != null && a.Length == b.Length
{
  forall i :: 0<=i<a.Length ==> a[i]==b[i]
}
*/

// numerical less than for strings of same length
predicate num_str_lt(a:string, b:string)
  requires |a| == |b|
{
  exists i :: 0<=i<|a| && a[i] < b[i] && (forall j :: 0<j<i ==> a[j]==b[j])
}

method num_string_less_than(a:string, b:string) returns (result: bool)
  requires |a| == |b|
  ensures result <==> num_str_lt(a,b)
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
    result:=false;
  }
  else {
    if (a[i] < b[i]) {
      result:=true;
    }
    else {
      result:=false;
    }
  }
}

/*
method sort_requests_by_deadline(list: array<RowDataPacket>) returns (sorted_list: array<RowDataPacket>)
  modifies list;
  ensures forall a, b :: 0<=a<b<list.Length 
     num_str_lt(a.deadline[0..4], b.deadline[0..4]) ||
    (a.deadline[0..4]==b.deadline[0..4] && num_str_lt(a.deadline[5..7],b.deadline[5..7])) ||
    (a.deadline[0..4]==b.deadline[0..4] && a.deadline[5..7]==b.deadline[5..7] && (num_str_lt(a.deadline[8..10], b.deadline[8..10]) || a.deadline[8..10]==b.deadline[8..10])))
{
}
*/