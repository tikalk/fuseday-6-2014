package com.tikal.tweeter.redis_counters;

import redis.clients.jedis.Jedis;
import redis.clients.jedis.JedisPubSub;

public class TweetFeedListener extends JedisPubSub implements Runnable {

	Jedis jedis;

	public TweetFeedListener(Jedis jedis) {
		this.jedis = jedis;
	}

	@Override
	public void onMessage(String channel, String message) {
		System.out.println("Tweet feed lister got tweet: " + message);
	}

	@Override
	public void onPMessage(String pattern, String channel, String message) {
	}

	@Override
	public void onSubscribe(String channel, int subscribedChannels) {
		System.out.println("Tweet feed lister subscribed successfuly to channel: " + channel);
	}

	@Override
	public void onUnsubscribe(String channel, int subscribedChannels) {
		System.out.println("Tweet feed lister unsubscribed successfuly from channel: " + channel);
	}

	@Override
	public void onPUnsubscribe(String pattern, int subscribedChannels) {
	}

	@Override
	public void onPSubscribe(String pattern, int subscribedChannels) {
	}

	@Override
	public void run() {
	}

}
