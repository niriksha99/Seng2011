class {:autocontracts} System
{
    ghost var userID : int;
    ghost var businessID : int;
    ghost var error : int;
    
    predicate Valid()
    {
    }
    
    constructor()
    {
    }
    
    method Login(username: array<char>, password: array<char>) returns (userID: int)
    requires username.Length > 0 && password.Length > 0;
    {
    }
    
    method SignUp()
    {
    }
    
    method Search()
    {
    }
    
    method NewRequest()
    {
    }
    
    method LinkBusiness()
    {
    }
    
    method EditBusiness()
    {
    }
    
    method NewBid()
    {
    }
    
    method EditBid()
    {
    }
    
    method RemoveBid()
    {
    }
    
    method DeleteBid()
    {
    }
    
    method AcceptBid()
    {
    }
    
    method DeleteRequest()
    {
    }
    
    method EditRequest()
    {
    }
    
    method Search()
    {
    }
}

