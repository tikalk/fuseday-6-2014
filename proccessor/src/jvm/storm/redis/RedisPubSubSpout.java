package storm.redis;
import java.util.Map;
import java.util.concurrent.LinkedBlockingQueue;

import org.apache.log4j.Logger;

import redis.clients.jedis.Jedis;
import redis.clients.jedis.JedisPool;
import redis.clients.jedis.JedisPoolConfig;
import redis.clients.jedis.JedisPubSub;
import backtype.storm.spout.SpoutOutputCollector;
import backtype.storm.task.TopologyContext;
import backtype.storm.topology.OutputFieldsDeclarer;
import backtype.storm.topology.base.BaseRichSpout;
import backtype.storm.tuple.Fields;
import backtype.storm.tuple.Values;
import backtype.storm.utils.Utils;

public class RedisPubSubSpout extends BaseRichSpout {
	
	static final long serialVersionUID = 737015318988609460L;
	static Logger LOG = Logger.getLogger(RedisPubSubSpout.class);
	
	SpoutOutputCollector _collector;
	final String host;
	final int port;
	LinkedBlockingQueue<String> queue;
	JedisPool pool;
	String channel;
	
	public RedisPubSubSpout(String host, int port, String channel) {
		this.host = host;
		this.port = port;
		this.channel = channel;
	}
	
	class ListenerThread extends Thread {
		LinkedBlockingQueue<String> queue;
		JedisPool pool;
		
		public ListenerThread(LinkedBlockingQueue<String> queue, JedisPool pool) {
			this.queue = queue;
			this.pool = pool;
			
		}
		
		public void run() {
			
			JedisPubSub listener = new JedisPubSub() {

				@Override
				public void onMessage(String channel, String message) {
					queue.offer(message);
				}

				@Override
				public void onPMessage(String pattern, String channel, String message) {
					queue.offer(message);
				}

				@Override
				public void onPSubscribe(String channel, int subscribedChannels) {
					// TODO Auto-generated method stub
					
				}

				@Override
				public void onPUnsubscribe(String channel, int subscribedChannels) {
					// TODO Auto-generated method stub
					
				}

				@Override
				public void onSubscribe(String channel, int subscribedChannels) {
					// TODO Auto-generated method stub
					
				}

				@Override
				public void onUnsubscribe(String channel, int subscribedChannels) {
					// TODO Auto-generated method stub
					
				}
			};
			
			Jedis jedis = pool.getResource();
			try {
				jedis.subscribe(listener, channel);
			} finally {
				pool.returnResource(jedis);
			}
		}
	};
	
	public void open(Map conf, TopologyContext context, SpoutOutputCollector collector) {
		_collector = collector;
		queue = new LinkedBlockingQueue<String>(1000);
		pool = new JedisPool(new JedisPoolConfig(),host,port);
		
		ListenerThread listener = new ListenerThread(queue, pool);
		listener.start();
		
	}

	public void close() {
		pool.destroy();
	}

	public void nextTuple() {
		String ret = queue.poll();
        if(ret==null) {
            Utils.sleep(50);
        } else {
            _collector.emit(new Values(ret));            
        }
	}

	public void ack(Object msgId) {
		// TODO Auto-generated method stub

	}

	public void fail(Object msgId) {
		// TODO Auto-generated method stub

	}

	public void declareOutputFields(OutputFieldsDeclarer declarer) {
		declarer.declare(new Fields("message"));
	}

	public boolean isDistributed() {
		return false;
	}
}
