// SPDX-License-Identifier: MIT
pragma solidity ^0.8;

contract Twitter {
    address public owner;
    uint16 public MAX_TWEET_LENGTH = 280;

    struct Tweet {
        uint256 id;
        address author;
        string content;
        uint256 timestamp;
        uint256 likes;
    }

    mapping(address => Tweet[]) public tweets;

    event TweetCreated(uint256 id, address indexed _author, string _content);
    event TweetLiked(address liker, address tweetAuthor, uint256 tweetId, uint256 newLikeCount);
    event TweetUniked(address unliker, address tweetAuthor, uint256 tweetId, uint256 newLikeCount);

    constructor(){
        owner = msg.sender;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "You are not the owner");
        _;
    }

    function createTweet(string memory _tweet) public {
        require(bytes(_tweet).length <= MAX_TWEET_LENGTH, "Tweet needs to 280 characters or less");
        Tweet memory newTweet = Tweet({
            id: tweets[msg.sender].length,
            author: msg.sender,
            content: _tweet,
            timestamp: block.timestamp,
            likes: 0
        });

        tweets[msg.sender].push(newTweet);

        emit TweetCreated(newTweet.id, newTweet.author, newTweet.content);
    }

    function getTweet(address _owner, uint _i) public view returns(Tweet memory) {
        return tweets[_owner][_i];
    }

     function getAllTweets(address _owner) public view returns(Tweet[] memory) {
        return tweets[_owner];
     }

    function changeTweetLength(uint16 newTweetLength) public onlyOwner {
        MAX_TWEET_LENGTH = newTweetLength;
    }

    function likeTweet(address _author, uint256 _id) external {
        require(tweets[_author][_id].id == _id, "Tweet does not exist");
        tweets[_author][_id].likes++;

        emit TweetLiked(msg.sender, _author, _id, tweets[_author][_id].likes);
    }

    function unlikeTweet(address _author, uint256 _id) external {
        require(tweets[_author][_id].id == _id, "Tweet does not exist");
        require(tweets[_author][_id].likes > 0, "You cannot unlike a tweet that has not been liked");
        tweets[_author][_id].likes--;

        emit TweetUniked(msg.sender, _author, _id, tweets[_author][_id].likes);
    }

}
