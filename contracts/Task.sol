pragma solidity ^0.4.23;

import "./EIP20.sol";

contract Task {
    EIP20 public token;

    address public owner;
    address public corrector;
    
    string public question;
    string public keyword;
    uint public maxScore;
    uint public endTimestamp;

    uint missingScores = 0;
    bool hasAnswers = false;

    mapping(address => string) public answers;
    mapping(address => uint) public scores;

    /// @param _corrector The indiviual allowed to give scores
    /// @param _question String representing the given task
    /// @param _keyword A more broad keyword to describe a group of tasks
    /// @param _maxScore The highest achievable score for this task
    /// @param _endTimestamp Timestamp (UTC). represents the last possible datetime to solve tasks
    /// @param _token Address containing the token to use for storing rewards
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

    modifier ownerOrCorrector {
        require(
            msg.sender == corrector ||
            msg.sender == owner
        );
        _;
    }

    /// @notice store the answer of a testee permanently
    /// @param answer The String which is supposed to represent the answer
    function solve(string answer) public{
        require(
            block.timestamp < endTimestamp && //cannot solve after time is up
            bytes(answer).length > 0 &&
            bytes(answers[msg.sender]).length == 0
            //it's not allowed to solve a task twice
        );

        hasAnswers = true; //only relevant for the 1st this is called
        answers[msg.sender] = answer;
        missingScores++; //one new uncorrected answer
    }

    /// @notice store the score to a specific answer. Can be overriden anytime.
    /// @param testee The address belonging to the regarding testee
    /// @param score Integer smaller or equals maxScore.
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

    /// @notice from https://gist.github.com/ottodevs/c43d0a8b4b891ac2da675f825b1d1dbf
    /// @param str String which is supposed to be converted to lower case
    /// @return Lowercase version of the original String
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

    /// @notice Get reward after marking all answers.
    function withdrawTokens() ownerOrCorrector public {
        require(
            block.timestamp >= endTimestamp &&
            missingScores == 0 &&
            (
                (msg.sender == corrector && hasAnswers == true) ||
                (msg.sender == owner && hasAnswers == false)
            )
        );

        if (msg.sender == corrector) {  // corrector receives his reward
            token.transfer(corrector, token.balanceOf(this));
        }
        else{ //if nobody solved the task, owner can get back his tokens
            token.transfer(owner, token.balanceOf(this));
        }
        //fallback for owner necessary bc otherwise funds could get locked forever
    }
}