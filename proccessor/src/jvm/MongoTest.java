import com.mongodb.BasicDBObject;
import com.mongodb.DBCursor;
import com.mongodb.Mongo;
import com.mongodb.MongoClient;


public class MongoTest {

	public static void main(String[] args) throws Exception {

		Mongo mongo = new MongoClient("localhost", 27017);
		
		mongo.getDB("test").getCollection("tweets").insert(new BasicDBObject().append("timestamp", System.currentTimeMillis()));
		
		DBCursor cursor = mongo.getDB("test").getCollection("tweets").find();
		while(cursor.hasNext()) {
			System.out.println(cursor.next().toMap());
		}
		
		System.exit(0);
	}

}
