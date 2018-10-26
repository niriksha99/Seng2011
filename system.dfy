class {:autocontracts} UserTable
{
    var id: int;
    var username: string;
    var password: string;
    var first_name: string;
    var last_name: string
    var phone_no: string
    var email: string;
    
//    constructor()
//    {
//        this.id := 0;
//        this.username := new string[0];
//        this.password := new string[0];
//        this.first_name := new string[0];
//        this.last_name := new string[0];
//        this.phone_no := new string[0];
//        this.email := new string[0];
//    }

      constructor(user: string, pass: string, first: string, last: string, phone: string, email: string)
      {
          this.id := 0;
          this.username := user;
          this.password := pass;
          this.first_name := first;
          this.last_name := last;
          this.phone_no := phone;
          this.email := email;
      }
      
      method setID(id: int)
      requires id >= 0;
      { this.id := id; }
}

class {:autocontracts} System<UserTable(0)>
{
    var userID: int;
    var username: string;
    var businessID: int;
    
    ghost var error: int;
    
    var Users: array<UserTable>;
//    var Requests: array<RequestTable>;
//    var Businesses: array<BusinessTable>;
//    var Bids: array<BidTable>;
//    var RateSum: array<RateSumTable>;
//    var Ratings: array<RatingTable>;
    
    predicate Valid()
    { -1 <= this.userID < this.Users.Length }
    
//    predicate unique_username()
//    reads this.Users;
//    reads set m | 0 <= m < this.Users.Length :: this.Users[m];
//    { forall i, j:: 0 <= i < j < this.Users.Length ==> this.Users[i].username != this.Users[j].username }
//    
//    predicate unique_email()
//    reads this.Users;
//    reads set m | 0 <= m < this.Users.Length :: this.Users[m];
//    { forall i, j:: 0 <= i < j < this.Users.Length ==> this.Users[i].email != this.Users[j].email }
    
    predicate login_required()
    { |this.username| > 0 }
    
    
//    predicate bidder_required()
//    {  }
    
//    method Init()
//    ensures this.userID == -1 && this.username == "" && this.businessID == -1 && this.error == 0;
//    {
//        this.userID := -1; // null
//        this.username := ""; // null
//        this.businessID := -1; // null
//        this.error := 0; // no error
//        
//        this.Users := new UserTable[0];        
//    }

    constructor()
    //requires size >=0;
    ensures this.userID == -1 && this.username == "" && this.businessID == -1 && this.error == 0;
    {
        this.userID := -1; // null
        this.username := ""; // null
        this.businessID := -1; // null
        this.error := 0; // no error
        
        this.Users := new UserTable[0];        
    }
    
    method Login(username: string, password: string) returns (userID: int)
    requires |username| > 0 && |password| > 0;
    {
        var i := 0;
        this.error := 1;
        while (i < this.Users.Length)
        invariant 0 <= i <= this.Users.Length;
        {
            if (this.Users[i].username == username && this.Users[i].password == password)
            {
                this.userID := i;
                this.username := username;
                this.error := 0;
                return i;
            }
            i := i + 1;
        }
        return -1;
    }
    
    method SignUp(first: string, last: string, username: string, pass: string, repass: string, phone: string, email: string) returns (err: int)
    ensures err == 0 || err == 1;
    ensures this.error == 0 ==> err == 0;
    ensures this.error != 0 ==> err == 1;
    //ensures forall i:: 0 <= i < old(this.Users.Length) ==> this.Users[i] == old(this.Users[i]);
    ensures err == 0 ==> this.Users.Length == old(this.Users.Length) + 1 && this.Users[old(this.Users.Length)].username == username &&
            this.Users[old(this.Users.Length)].password == pass && this.Users[old(this.Users.Length)].email == email;
    {
        this.error := 0;
        err := 0;
        var i := 0;
        while (i < this.Users.Length && err == 0)
        invariant 0 <= i <= this.Users.Length;
        invariant this.error == 0 ==> err == 0;
        invariant this.error != 0 ==> err == 1;
        {
            if (pass != repass)
            {
                this.error := 3;
                err := 1;
            }
            if (this.Users[i].username == username)
            {
                this.error := 1;
                err := 1;
            }
            if (this.Users[i].email == email)
            {
                this.error := 2;
                err := 1;
            }
            i := i + 1;
        }
        if (err == 0)
        {
            //add in
            var newUser := new UserTable(username, pass, first, last, phone, email);
            newUser.setID(this.Users.Length);
            //var size := this.Users.Length + 1;
            var updateUsers: array<UserTable> := new UserTable[this.Users.Length + 1];
            forall i | 0 <= i < this.Users.Length { updateUsers[i] := this.Users[i]; }
            updateUsers[this.Users.Length] := newUser;
            this.Users := updateUsers;
        }
        //return err;
    }
    
//    method Search()
//    {
//    }
//    
//    method NewRequest()
//    {
//    }
//    
//    method LinkBusiness()
//    {
//    }
//    
//    method EditBusiness()
//    {
//    }
//    
//    method NewBid()
//    {
//    }
//    
//    method EditBid()
//    {
//    }
//    
//    method RemoveBid()
//    {
//    }
//    
//    method DeleteBid()
//    {
//    }
//    
//    method AcceptBid()
//    {
//    }
//    
//    method DeleteRequest()
//    {
//    }
//    
//    method EditRequest()
//    {
//    }
//    
//    method Search()
//    {
//    }
}

method Main()
{
    var PartyWhip := new System();
    //PartyWhip.init();
    assert PartyWhip.username == "" && PartyWhip.userID == -1 && PartyWhip.businessID == -1 && PartyWhip.error == 0;
}
