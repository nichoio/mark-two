pragma solidity ^0.4.23;

contract Task {
    // Version without any tokenized payments

    address public owner;
    address public corrector;
    
    string public question;
    string public keyword;
    uint public maxScore;

    mapping(address => string) public answers;
    mapping(address => uint) public scores;
    
    constructor(address _corrector, string _question, string _keyword, uint _maxScore) public{
        require(
            bytes(_question).length > 0 &&
            bytes(_keyword).length > 0 &&
            _maxScore > 0
        );

        owner = msg.sender;
        corrector = _corrector;
        question = _question;
        maxScore = _maxScore;
        keyword = _toLower(_keyword);
    }

    function solve(string answer) public{
        require(
            bytes(answer).length > 0 &&
            bytes(answers[msg.sender]).length == 0
            //it's not allowed to solve a task twice
        );

        answers[msg.sender] = answer;
    }

    function correct(address testee, uint score) public{
        require(
            corrector == msg.sender &&
            score <= maxScore &&
            bytes(answers[testee]).length > 0 //testee must have answered before
        );

        // overriding of existing scores is allowed
        scores[testee] = score;
    }

    //from https://gist.github.com/ottodevs/c43d0a8b4b891ac2da675f825b1d1dbf
    function _toLower(string str) internal pure returns (string) {
        bytes memory bStr = bytes(str);
        bytes memory bLower = new bytes(bStr.length);
        for (uint i = 0; i < bStr.length; i++) {
            // Uppercase character...
            if ((bStr[i] >= 65) && (bStr[i] <= 90)) {
                // So we add 32 to make it lowercase
                bLower[i] = bytes1(int(bStr[i]) + 32);
            } else {
                bLower[i] = bStr[i];
            }
        }
        return string(bLower);
    }
}