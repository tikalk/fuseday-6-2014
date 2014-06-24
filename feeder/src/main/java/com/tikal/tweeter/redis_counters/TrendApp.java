package com.tikal.tweeter.redis_counters;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileReader;
import java.io.IOException;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import redis.clients.jedis.Jedis;
import redis.clients.jedis.JedisPool;

import com.google.gson.Gson;
import com.google.gson.JsonSyntaxException;

/**
 * Hello world!
 *
 */
public class TrendApp {
	public static void main(String[] args) throws IOException {

		if (args.length < 3) {
			System.err.println("Please run this command with input-folder, redis host and whether to publish");
			System.exit(1);
		}

		final String inputFolder = args[0];
		final File folder = new File(inputFolder);

		final String redisHost = args[1];
		final JedisPool pool = new JedisPool(redisHost);
		final Jedis jedis = pool.getResource();
		jedis.flushAll();

		final boolean shouldPublish = Boolean.parseBoolean(args[2]);

		// subscribe to tweet feed
		final Thread feedListener = new Thread(new TweetFeedListener(jedis));
		feedListener.start();

		final long start = System.currentTimeMillis();
		final File[] files = folder.listFiles();
		for (final File file : files) {
			loadTweets(jedis, file, shouldPublish);
		}

		System.out.println("file finished in : " + (System.currentTimeMillis() - start) / 1000);
		pool.returnResource(jedis);
	}

	@SuppressWarnings("unchecked")
	private static void loadTweets(Jedis jedis, File file, boolean shouldPublish) throws JsonSyntaxException, IOException {
		final BufferedReader br = new BufferedReader(new FileReader(file));
		final Gson gson = new Gson();
		while (br.ready()) {
			final String line = br.readLine();
			if (shouldPublish) {
				jedis.publish("tweet-feed", line);
			}

			// parse json
			final Map<String, Object> rowJson = gson.fromJson(line, HashMap.class);
			final String tweetText = (String)rowJson.get("text");
			final String tweetDate = getTimestamp((String)rowJson.get("created_at"));

			final String tweetId = String.valueOf(((Double)rowJson.get("id")).longValue());
			final List<String> tweetHashtags = getHashtagList(rowJson);


			// redis
			jedis.set("tweet:"+tweetId+":text", tweetText);

			for (final String hashtag : tweetHashtags) {
				final String key = "hashtag:"+hashtag;
				jedis.sadd(key, tweetId);
				jedis.zincrby("trend:most-popular:"+tweetDate, 1, key);
			}
		}

		br.close();
	}

	//Mon Jun 23 20:21:57 +0000 2014
	private static String getTimestamp(String dateStr) {
		final SimpleDateFormat sdf = new SimpleDateFormat("EEE MMM dd HH:mm:ss +0000 yyyy");

		final Calendar c = Calendar.getInstance();
		try {
			c.setTime(sdf.parse(dateStr));
		} catch (final ParseException e) {
			e.printStackTrace();
		}

		return c.get(Calendar.YEAR) + "-" + (c.get(Calendar.MONTH)+1) + "-" + c.get(Calendar.DATE) + "-" + c.get(Calendar.HOUR_OF_DAY);
	}

	@SuppressWarnings("unchecked")
	private static List<String> getHashtagList(final Map<String, Object> rowJson) {

		final List<String> hashtagFriendlyList = new ArrayList<String>();

		final Map<String, Object> entitiesMap = (Map<String, Object>)rowJson.get("entities");
		final List<Object> hashtagsList = (List<Object>)entitiesMap.get("hashtags");

		for (final Object map : hashtagsList) {
			final Map<String, Object> hashtagMap = (Map<String, Object>)map;
			hashtagFriendlyList.add((String)hashtagMap.get("text"));
		}

		return hashtagFriendlyList;
	}
}
