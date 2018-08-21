pragma solidity ^0.4.23;

import "./EIP20.sol";

contract Task {
    EIP20 public token;

    address public owner;
    address public corrector;
    
    string public question;
    string public keyword;
    uint public maxScore;
    uint public missingScores;
    uint public endTimestamp;

    mapping(address => string) public answers;
    mapping(address => uint) public scores;
    
    constructor(
        address _corrector,
        string _question,
        string _keyword,
        uint _maxScore,
        uint _endTimestamp,
        address _token) public{
        require(
            bytes(_question).length > 0 &&
            bytes(_keyword).length > 0 &&
            _maxScore > 0 &&
            block.timestamp < _endTimestamp
        );

        owner = msg.sender;
        corrector = _corrector;
        question = _question;
        maxScore = _maxScore;
        keyword = _toLower(_keyword);
        endTimestamp = _endTimestamp;
        token = EIP20(_token);
    }

    modifier onlyCorrector {
        require(msg.sender == corrector);
        _;
    }

    function solve(string answer) public{
        require(
            block.timestamp < endTimestamp && //cannot solve after time is up
            bytes(answer).length > 0 &&
            bytes(answers[msg.sender]).length == 0
            //it's not allowed to solve a task twice
        );

        answers[msg.sender] = answer;
        missingScores++; //one new uncorrected answer
    }

    function correct(address testee, uint score) onlyCorrector public {
        require(
            score > 0 &&  //giving zero points not allowed since 0 is default val in mapping
            score <= maxScore &&
            bytes(answers[testee]).length > 0 //testee must have answered before
        );

        if (scores[testee] == 0) { //if no score was given before
            missingScores--; //one less uncorrected answer
        }

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

    function withdrawTokens() onlyCorrector public {
        require(
            block.timestamp >= endTimestamp &&
            missingScores == 0
        );

        token.transfer(corrector, token.balanceOf(this));
    }
}