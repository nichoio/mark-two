pragma solidity ^0.4.23;

contract Task {
    // Version without any tokenized payments

    address public owner;
    address public corrector;
    
    string public question;
    uint public maxScore;

    mapping(address => bytes32) answers;
    mapping(address => uint) scores;
    
    function Task(address _corrector, string _question, uint _maxScore){
        owner = msg.sender;
        corrector = _corrector;
        question = _question;
        maxScore = _maxScore;
    }

    function solve(bytes32 answer){
        //it's not allowed to solve a task twice
        require(answers[msg.sender] == 0);

        answers[msg.sender] = answer;
    }

    function correct(address testee, uint score){
        require(corrector == msg.sender);

        // overriding of existing scores is allowed
        scores[testee] = score;
    }

    // event Transfer(address indexed from, address indexed to, uint tokens);

    // event Approval(address indexed tokenOwner, address indexed spender, uint tokens);

}