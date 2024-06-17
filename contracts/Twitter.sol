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
    event TweetLiked(address indexed liker, address indexed tweetAuthor, uint256 tweetId, uint256 newLikeCount);
    event TweetUnliked(address indexed unliker, address indexed tweetAuthor, uint256 tweetId, uint256 newLikeCount);

    constructor() {
        owner = msg.sender;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "You are not the owner");
        _;
    }

    function createTweet(string memory _tweet) public {
        require(bytes(_tweet).length <= MAX_TWEET_LENGTH, "Tweet needs to be 280 characters or less");
        
        uint256 tweetId = tweets[msg.sender].length;
        Tweet memory newTweet = Tweet({
            id: tweetId,
            author: msg.sender,
            content: _tweet,
            timestamp: block.timestamp,
            likes: 0
        });

        tweets[msg.sender].push(newTweet);

        emit TweetCreated(tweetId, msg.sender, _tweet);
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
        require(_id < tweets[_author].length, "Tweet does not exist");
        Tweet storage tweet = tweets[_author][_id];
        tweet.likes++;

        emit TweetLiked(msg.sender, _author, _id, tweet.likes);
    }

    function unlikeTweet(address _author, uint256 _id) external {
        require(_id < tweets[_author].length, "Tweet does not exist");
        Tweet storage tweet = tweets[_author][_id];
        require(tweet.likes > 0, "You cannot unlike a tweet that has not been liked");
        tweet.likes--;

        emit TweetUnliked(msg.sender, _author, _id, tweet.likes);
    }
}
