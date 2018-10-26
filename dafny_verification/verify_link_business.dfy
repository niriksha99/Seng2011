class {:autocontracts} UserTable
{
    var id: int;
    var username: string;
    var password: string;
    var email: string;

      constructor(user: string, pass: string, email: string)
      requires |user| > 0 && |pass| > 0 && |email| > 0;
      ensures this.id == -1 && this.username == user && this.password == pass && this.email == email;
      {
          this.id := -1;
          this.username := user;
          this.password := pass;
          this.email := email;
      }
      
      method SetID(id: int)
      requires id >= 0 && this.id == -1;
      ensures this.id == id;
      ensures this.username == old(this.username) && this.password == old(this.password) && this.email == old(this.email);
      { this.id := id; }
}

class {:autocontracts} BusinessTable
{
    var id: int;
    var userID: int;
    var title: string;
    var email: string;
    
    constructor(user: int, business_name: string, email: string)
    requires user >= 0 && |business_name| > 0 && |email| > 0;
    ensures this.id == -1 && this.userID == user && this.title == business_name && this.email == email;
    {
        this.id := -1;
        this.userID := user;
        this.title := business_name;
        this.email := email;
    }
    
    method SetID(id: int)
    requires id >= 0 && this.id == -1;
    ensures this.id == id;
    ensures this.userID == old(this.userID) && this.title == old(this.title) && this.email == old(this.email);
    {
        this.id := id;
    }
}

predicate BidderRequired(id: int, BusinessDB: array<BusinessTable>)
reads BusinessDB;
reads set i | 0 <= i < BusinessDB.Length :: BusinessDB[i];
{
    exists k:: 0 <= k < BusinessDB.Length && BusinessDB[k].userID == id
}

class {:autocontracts} Session
{
    var userID: int;
    var username: string;
    var businessID: int;
    var bidder: bool;
    
    predicate LoginRequired()
    { |this.username| > 0 && this.userID >= 0 }

    constructor()
    ensures this.userID == -1 && this.username == "" && this.businessID == -1 && !this.bidder;
    {
        this.userID := -1; // null
        this.username := ""; // null
        this.businessID := -1; // null
        this.bidder := false; //null
    }
    
    method Login(user: int, username: string, BusinessDB: array<BusinessTable>)
    requires user >= 0 && |username| > 0;
    requires this.userID == -1 && this.username == "" && !this.bidder && this.businessID == -1;
    ensures BusinessDB[..] == old(BusinessDB[..]);
    ensures this.userID == user && this.username == username;
    ensures this.businessID == old(this.businessID);
    ensures LoginRequired();
    ensures this.bidder ==> exists i:: 0 <= i < BusinessDB.Length && BusinessDB[i].userID == user;
    ensures !this.bidder ==> forall i:: 0 <= i < BusinessDB.Length ==> BusinessDB[i].userID != user;
    {
        this.userID := user;
        this.username := username;
        this.bidder := exists i:: 0 <= i < BusinessDB.Length && BusinessDB[i].userID == user;
    }
    
    method AccessBusiness(BusinessDB: array<BusinessTable>, business_name: string) returns (err: bool)
    requires this.bidder;
    ensures BusinessDB[..] == old(BusinessDB[..])
    ensures this.userID == old(this.userID) && this.username == old(this.username) && this.bidder == old(this.bidder);
    ensures err ==> this.businessID == -1 && forall i:: 0 <= i < BusinessDB.Length ==> (BusinessDB[i].userID != this.userID || BusinessDB[i].title != business_name);
    ensures !err ==> 0 <= this.businessID < BusinessDB.Length && BusinessDB[this.businessID].title == business_name && BusinessDB[this.businessID].userID == this.userID;
    {
        this.businessID := -1;
        err := true;
        var i := 0;
        while (i < BusinessDB.Length && err)
        invariant 0 <= i <= BusinessDB.Length;
        invariant this.userID == old(this.userID) && this.username == old(this.username) && this.bidder == old(this.bidder);
        invariant BusinessDB[..] == old(BusinessDB[..]);
        invariant err ==> this.businessID == -1 && forall j:: 0 <= j < i ==> (BusinessDB[j].userID != this.userID || BusinessDB[j].title != business_name);
        invariant !err ==> 0 <= this.businessID < BusinessDB.Length && BusinessDB[this.businessID].userID == this.userID && BusinessDB[this.businessID].title == business_name;
        {
            if (BusinessDB[i].userID == this.userID && BusinessDB[i].title == business_name)
            {
                //this.businessID := BusinessDB[i].id;
                this.businessID := i;
                return false;
            }
            i := i + 1;
        }
    }
    
    method Logout()
    requires this.userID >= 0 && |this.username| > 0;
    requires LoginRequired();
    ensures this.userID == -1 && this.username == "" && this.businessID == -1 && !this.bidder;
    {
        this.userID := -1;
        this.username := "";
        this.businessID := -1;
        this.bidder := false;
    }
}

method Login(UserDB: array<UserTable>, username: string, password: string) returns (userID: int)
//requires |username| > 0 && |password| > 0;
ensures UserDB[..] == old(UserDB[..]);
ensures -1 <= userID < UserDB.Length;
ensures userID == -1 ==> forall i:: 0 <= i < UserDB.Length ==> (UserDB[i].username != username || UserDB[i].password != password);
ensures userID > -1 ==> UserDB[userID].username == username && UserDB[userID].password == password;
{
    var i := 0;
    userID := -1;
    while (i < UserDB.Length)
    invariant 0 <= i <= UserDB.Length;
    invariant userID == -1 ==> forall j:: 0 <= j < i ==> (UserDB[j].username != username || UserDB[j].password != password);
    invariant userID > -1 ==> UserDB[userID].username == username && UserDB[userID].password == password;
    {
        if (UserDB[i].username == username && UserDB[i].password == password)
        {
            return i;
        }
        i := i + 1;
    }
}

method SignUp(UserDB: array<UserTable>, newUser: UserTable) returns (err: bool)
ensures UserDB[..] == old(UserDB[..]);
ensures err ==> exists i:: 0 <= i < UserDB.Length && (UserDB[i].username == newUser.username || UserDB[i].email == newUser.email);
ensures !err ==> forall i:: 0 <= i < UserDB.Length ==> (UserDB[i].username != newUser.username && UserDB[i].email != newUser.email);
{
    err := false;
    var i := 0;
    while (i < UserDB.Length && !err)
    invariant 0 <= i <= UserDB.Length;
    invariant err ==> exists j:: 0 <= j < i && (UserDB[j].username == newUser.username || UserDB[j].email == newUser.email);
    invariant !err ==> forall j:: 0 <= j < i ==> (UserDB[j].username != newUser.username && UserDB[j].email != newUser.email);
    {
        if (UserDB[i].username == newUser.username)
        {
            err := true;
        }
        if (UserDB[i].email == newUser.email)
        {
            err := true;
        }
        i := i + 1;
    }
}

method LinkBusiness(BusinessDB: array<BusinessTable>, newBusiness: BusinessTable) returns (err: bool)
ensures BusinessDB[..] == old(BusinessDB[..]);
ensures err ==> exists i:: 0 <= i < BusinessDB.Length && BusinessDB[i].title == newBusiness.title;
ensures !err ==> forall i:: 0 <= i < BusinessDB.Length ==> BusinessDB[i].title != newBusiness.title;
{
    err := false;
    var i := 0;
    while (i < BusinessDB.Length && !err)
    invariant 0 <= i <= BusinessDB.Length;
    invariant err ==> exists j:: 0 <= j < i && BusinessDB[j].title == newBusiness.title;
    invariant !err ==> forall j:: 0 <= j < i ==> BusinessDB[j].title != newBusiness.title;
    {
        if (BusinessDB[i].title == newBusiness.title)
        {
            err := true;
        }
        i := i + 1;
    }
}

method InsertUser(UserDB: array<UserTable>, newUser: UserTable, tempUsers: array<UserTable>) returns (newUserDB: array<UserTable>)
modifies tempUsers;
requires tempUsers.Length == UserDB.Length + 1;
ensures newUserDB.Length == UserDB.Length + 1;
ensures forall i:: 0 <= i < old(UserDB.Length) ==> newUserDB[i] == old(UserDB[i]);
ensures newUserDB[old(UserDB.Length)] == newUser;
{
    forall i | 0 <= i < UserDB.Length { tempUsers[i] := UserDB[i]; }
    tempUsers[UserDB.Length] := newUser;
    return tempUsers;
}

method InsertBusiness(BusinessDB: array<BusinessTable>, newBusiness: BusinessTable, tempBusinesses: array<BusinessTable>) returns (newBusinessDB: array<BusinessTable>)
modifies tempBusinesses;
requires tempBusinesses.Length == BusinessDB.Length + 1;
ensures newBusinessDB.Length == BusinessDB.Length + 1;
ensures forall i:: 0 <= i < old(BusinessDB.Length) ==> newBusinessDB[i] == old(BusinessDB[i]);
ensures newBusinessDB[old(BusinessDB.Length)] == newBusiness;
{
    forall i | 0 <= i < BusinessDB.Length { tempBusinesses[i] := BusinessDB[i]; }
    tempBusinesses[BusinessDB.Length] := newBusiness;
    return tempBusinesses;
}

method TestBusiness()
{
    var session := new Session();
    var Businesses: array<BusinessTable> := new BusinessTable[0];
    
    var tempBusiness := new BusinessTable(0, "tmp", "tmp");
    
    var admin := new UserTable("admin", "pass", "admin@admin.com");
    assert admin.username == "admin" && admin.password == "pass" && admin.email == "admin@admin.com";
    admin.SetID(0);
    assert admin.username == "admin" && admin.password == "pass" && admin.email == "admin@admin.com" && admin.id == 0;
    var Users: array<UserTable> := new UserTable[1][admin];
    
//    assert Users.Length == 1 && Users[0] == admin && Users[0].username == admin.username && Users[0].password == admin.password;
//    var err_login := Login(Users, "admin", "pass");
//    assert err_login == admin.id;
    session.Login(admin.id, admin.username, Businesses);
    assert session.username == admin.username && session.userID == admin.id && !session.bidder;
    
    var b1 := new BusinessTable(session.userID, "Flourist", "flou@rist.com");
    var err_linkb := LinkBusiness(Businesses, b1);
    assert !err_linkb;
    var tempBusinessDB: array<BusinessTable> := new BusinessTable[Businesses.Length + 1][tempBusiness];
    b1.SetID(Businesses.Length);
    Businesses := InsertBusiness(Businesses, b1, tempBusinessDB);
    assert Businesses.Length == 1 && Businesses[0] == b1;
    
    assert BidderRequired(session.userID, Businesses);
    session.Logout();
    assert session.userID == -1 && session.username == "" && session.businessID == -1 && !session.bidder;
    
//    err_login := Login(Users, "admin", "pass");
//    assert err_login == admin.id;
    session.Login(admin.id, admin.username, Businesses);
    assert session.username == admin.username && session.userID == admin.id && session.bidder;
    
    var err_session_business := session.AccessBusiness(Businesses, "Doofenshmirtz");
    assert err_session_business;
    
    err_session_business := session.AccessBusiness(Businesses, "Flourist");
    assert !err_session_business && session.businessID == b1.id;
}
