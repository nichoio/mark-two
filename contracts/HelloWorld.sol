pragma solidity ^0.4.23;

contract HelloWorld {
    // ERC20 compatible implementation
    
    uint public constant _totalSupply = 1000000;
    
    string public constant symbol = "HWC";
    string public constant name = "Hello-World Coin";
    uint public constant decimals = 3;
    
    mapping(address => uint) balances;
    mapping(address => mapping(address => uint)) allowed;
    
    function HelloWorld(){
        balances[msg.sender] = _totalSupply;
    }
    
    function totalSupply() public constant returns (uint){
        return _totalSupply;
    }

    function balanceOf(address tokenOwner) public constant returns (uint balance){
        return balances[tokenOwner];
    }

    function allowance(address tokenOwner, address spender) public constant returns (uint remaining){
        return allowed[tokenOwner][spender];
    }

    function transfer(address to, uint tokens) public returns (bool success){
        require(
            balances[msg.sender] >= tokens
            && tokens > 0
        );
        
        balances[msg.sender] -= tokens;
        balances[to] += tokens;
        Transfer(msg.sender, to, tokens);
        return true;
    }

    function approve(address spender, uint tokens) public returns (bool success){
        allowed[msg.sender][spender] = tokens;
        Approval(msg.sender, spender, tokens);
        return true;
    }

    function transferFrom(address from, address to, uint tokens) public returns (bool success){
        require(
            allowed[from][msg.sender] >= tokens
            && balances[from] >= tokens
            && tokens > 0
        );
        
        balances[from] -= tokens;
        balances[to] += tokens;
        allowed[from][msg.sender] -= tokens;
        Transfer(from, to, tokens);
        return true;
    }


    event Transfer(address indexed from, address indexed to, uint tokens);

    event Approval(address indexed tokenOwner, address indexed spender, uint tokens);

}