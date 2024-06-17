import {
  time,
  loadFixture,
} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { expect } from "chai";
import hre from "hardhat";

describe("Twitter", function () {
  async function deployTwitterFixture() {
    const [owner, otherAccount, anotherAccount] = await hre.ethers.getSigners();

    const Twitter = await hre.ethers.getContractFactory("Twitter");
    const twitter = await Twitter.deploy();

    return { twitter, owner, otherAccount, anotherAccount };
  }

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      const { twitter, owner } = await loadFixture(deployTwitterFixture);

      expect(await twitter.owner()).to.equal(owner.address);
    });
  });

  describe("Tweeting", function () {
    it("Should allow a user to create a tweet", async function () {
      const { twitter, owner } = await loadFixture(deployTwitterFixture);
      const tweetContent = "Hello, Twitter!";

      await expect(twitter.createTweet(tweetContent))
        .to.emit(twitter, "TweetCreated")
        .withArgs(0, owner.address, tweetContent);

      const tweet = await twitter.getTweet(owner.address, 0);
      expect(tweet.content).to.equal(tweetContent);
      expect(tweet.author).to.equal(owner.address);
    });

    it("Should not allow a tweet longer than the maximum length", async function () {
      const { twitter } = await loadFixture(deployTwitterFixture);
      const longTweet = "a".repeat(281);

      await expect(twitter.createTweet(longTweet)).to.be.revertedWith(
        "Tweet needs to be 280 characters or less"
      );
    });

    it("Should store multiple tweets correctly", async function () {
      const { twitter, owner } = await loadFixture(deployTwitterFixture);

      await twitter.createTweet("First tweet");
      await twitter.createTweet("Second tweet");

      const tweet1 = await twitter.getTweet(owner.address, 0);
      const tweet2 = await twitter.getTweet(owner.address, 1);

      expect(tweet1.content).to.equal("First tweet");
      expect(tweet2.content).to.equal("Second tweet");
    });
  });

  describe("Liking and Unliking Tweets", function () {
    it("Should allow a user to like a tweet", async function () {
      const { twitter, owner, otherAccount } = await loadFixture(
        deployTwitterFixture
      );
      const tweetContent = "Hello, Twitter!";
      await twitter.createTweet(tweetContent);

      await expect(twitter.connect(otherAccount).likeTweet(owner.address, 0))
        .to.emit(twitter, "TweetLiked")
        .withArgs(otherAccount.address, owner.address, 0, 1);

      const tweet = await twitter.getTweet(owner.address, 0);
      expect(tweet.likes).to.equal(1);
    });

    it("Should allow a user to unlike a tweet", async function () {
      const { twitter, owner, otherAccount } = await loadFixture(
        deployTwitterFixture
      );
      const tweetContent = "Hello, Twitter!";
      await twitter.createTweet(tweetContent);

      await twitter.connect(otherAccount).likeTweet(owner.address, 0);

      await expect(twitter.connect(otherAccount).unlikeTweet(owner.address, 0))
        .to.emit(twitter, "TweetUnliked")
        .withArgs(otherAccount.address, owner.address, 0, 0);

      const tweet = await twitter.getTweet(owner.address, 0);
      expect(tweet.likes).to.equal(0);
    });

    it("Should not allow a user to unlike a tweet that has not been liked", async function () {
      const { twitter, owner, otherAccount } = await loadFixture(
        deployTwitterFixture
      );
      const tweetContent = "Hello, Twitter!";
      await twitter.createTweet(tweetContent);

      await expect(
        twitter.connect(otherAccount).unlikeTweet(owner.address, 0)
      ).to.be.revertedWith("You cannot unlike a tweet that has not been liked");
    });

    it("Should not allow liking a non-existent tweet", async function () {
      const { twitter, otherAccount } = await loadFixture(deployTwitterFixture);

      await expect(
        twitter.connect(otherAccount).likeTweet(otherAccount.address, 0)
      ).to.be.revertedWith("Tweet does not exist");
    });
  });

  describe("Changing Maximum Tweet Length", function () {
    it("Should allow the owner to change the maximum tweet length", async function () {
      const { twitter, owner } = await loadFixture(deployTwitterFixture);
      const newMaxLength = 300;

      await twitter.changeTweetLength(newMaxLength);

      expect(await twitter.MAX_TWEET_LENGTH()).to.equal(newMaxLength);
    });

    it("Should not allow non-owner to change the maximum tweet length", async function () {
      const { twitter, otherAccount } = await loadFixture(deployTwitterFixture);
      const newMaxLength = 300;

      await expect(
        twitter.connect(otherAccount).changeTweetLength(newMaxLength)
      ).to.be.revertedWith("You are not the owner");
    });
  });
});
