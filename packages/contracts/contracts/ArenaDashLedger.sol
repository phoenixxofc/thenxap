// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/cryptography/MessageHashUtils.sol";
import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract ArenaDashLedger is ERC1155, Ownable, ReentrancyGuard {
    using ECDSA for bytes32;
    using MessageHashUtils for bytes32;
    address public validatorAddress;
    uint256 public currentSeason;
    struct ScoreEntry { uint256 score; uint256 timestamp; uint256 season; }
    mapping(address => mapping(uint256 => ScoreEntry)) public userScores;
    event ScoreSubmitted(address indexed player, uint256 score, uint256 season);
    constructor(address _initialValidator) ERC1155("https://api.arenadash.io/metadata/{id}.json") Ownable(msg.sender) {
        validatorAddress = _initialValidator;
        currentSeason = 1;
    }
    function submitScore(uint256 _score, uint256 _timestamp, bytes memory _signature) external nonReentrant {
        bytes32 messageHash = keccak256(abi.encodePacked(msg.sender, _score, _timestamp, currentSeason));
        bytes32 ethSignedMessageHash = messageHash.toEthSignedMessageHash();
        require(ethSignedMessageHash.recover(_signature) == validatorAddress, "Invalid Validator Signature");
        require(_timestamp > block.timestamp - 1 hours, "Signature expired");
        if (_score > userScores[msg.sender][currentSeason].score) {
            userScores[msg.sender][currentSeason] = ScoreEntry(_score, _timestamp, currentSeason);
            emit ScoreSubmitted(msg.sender, _score, currentSeason);
        }
    }
    function setValidatorAddress(address _newValidator) external onlyOwner { validatorAddress = _newValidator; }
    function startNewSeason() external onlyOwner { currentSeason++; }
}
