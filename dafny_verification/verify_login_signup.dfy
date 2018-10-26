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

method Login(UserDB: array<UserTable>, username: string, password: string) returns (userID: int)
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

method TestLoginSignup()
{
    var Users: array<UserTable> := new UserTable[0];
    
    var tmpUser := new UserTable("temp", "temp", "temp");
    
    /*
      Testing success case: sign up new user and login
    */
    var admin := new UserTable("admin", "pass", "admin@admin.com");
    assert admin.username == "admin" && admin.password == "pass" && admin.email == "admin@admin.com";
    
    var err_signup := SignUp(Users, admin);
    assert !err_signup;
    admin.SetID(Users.Length);
    assert admin.username == "admin" && admin.password == "pass" && admin.email == "admin@admin.com" && admin.id == Users.Length;
    
    var tempUsers: array<UserTable> := new UserTable[Users.Length + 1][tmpUser];
    Users := InsertUser(Users, admin, tempUsers);
    assert Users.Length == 1 && Users[0] == admin;
    
    assert admin.username == "admin" && admin.password == "pass";
    assert Users.Length == 1 && Users[0] == admin && Users[0].username == admin.username && Users[0].password == admin.password;
    var err_login := Login(Users, "admin", "pass");
    assert err_login == admin.id;
    
    /*
      Testing error case: log in non-registered account
    */
    assert Users.Length == 1 && Users[0].username != "hacker";
    err_login := Login(Users, "hacker", "hello, world");
    assert err_login == -1;
    
    /*
      Testing error case: sign up with used username
    */
    var bug := new UserTable("admin", "not_admin", "hello@world.com");
    assert bug.username == "admin" && bug.password == "not_admin" && bug.email == "hello@world.com";
    assert bug.username == admin.username && Users.Length == 1 && Users[0] == admin;
    err_signup := SignUp(Users, bug);
    assert err_signup;
    err_signup := SignUp(Users, admin);
    assert err_signup;
}
