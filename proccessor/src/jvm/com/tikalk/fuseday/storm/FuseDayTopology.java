package com.tikalk.fuseday.storm;
import com.mongodb.DBObject;
import com.mongodb.util.JSON;

import storm.mongo.MongoBolt;
import storm.redis.RedisPubSubSpout;
import backtype.storm.Config;
import backtype.storm.LocalCluster;
import backtype.storm.topology.OutputFieldsDeclarer;
import backtype.storm.topology.TopologyBuilder;
import backtype.storm.tuple.Fields;
import backtype.storm.tuple.Tuple;
import backtype.storm.utils.Utils;

public class FuseDayTopology {

	private static boolean run = true;
	
	public static void main(String[] args) {

		TopologyBuilder builder = new TopologyBuilder();

		builder.setSpout("read-tweets", new RedisPubSubSpout("localhost", 6379, "tweet-feed"));
		builder.setBolt("write-tweets", new MongoBolt("localhost", 27017, "test") {
			
			@Override
			public void declareOutputFields(OutputFieldsDeclarer declarer) {
				declarer.declare(new Fields("tweet"));
			}
			
			@Override
			public boolean shouldActOnInput(Tuple input) {
				return true;
			}
			
			@Override
			public String getMongoCollectionForInput(Tuple input) {
				return "tweets";
			}
			
			@Override
			public DBObject getDBObjectForInput(Tuple input) {
				String str = input.getString(0);
				System.out.println("str: " + str);
				DBObject dbobject = (DBObject)JSON.parse(str);
				System.out.println("dbobject: " + dbobject.toMap());
				return dbobject;
			}
		}).shuffleGrouping("read-tweets");
		

		Config conf = new Config();
		conf.setDebug(true);

		LocalCluster cluster = new LocalCluster();
		cluster.submitTopology("test", conf, builder.createTopology());
		while(run){}
		cluster.killTopology("test");
		cluster.shutdown();

	}
}
