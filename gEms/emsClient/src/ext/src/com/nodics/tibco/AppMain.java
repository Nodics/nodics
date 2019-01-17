package com.nodics.tibco;

import com.google.gson.JsonArray;
import com.google.gson.JsonObject;

public class AppMain {

	public static void main(String[] args) {
		ApplicationLauncher app = new ApplicationLauncher();
		JsonObject json = new JsonObject();
		json.addProperty("tibcoURL", "tcp://10.106.207.92:7222");
		json.addProperty("username", "");
		json.addProperty("password", "");
		
		JsonArray array = new JsonArray();
		JsonObject item = new JsonObject();
		item.addProperty("messageType", "Stock.Input.Data.UAT");
		item.addProperty("inputQueue", "wf.application.Input");
		item.addProperty("outputQueue", "wf.application.Output");
		item.addProperty("targetUrl", "http://localhost:3000/nodics/emsClient/consume");
		array.add(item);
		
		JsonObject item1 = new JsonObject();
		item1.addProperty("messageType", "Stock.Input.postions.Data.UAT");
		item1.addProperty("inputQueue", "wf.application.position.Input");
		item1.addProperty("outputQueue", "wf.application.position.Output");
		item.addProperty("targetUrl", "http://localhost:3000/nodics/emsClient/consume");
		array.add(item1);
	
		json.add("queues", array);
		
		app.init(json.toString());
		System.out.println(app.publish("wf.application.Input", "This is Himkar"));
		
	}

}
