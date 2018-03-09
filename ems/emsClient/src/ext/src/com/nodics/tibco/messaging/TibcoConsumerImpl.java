package com.nodics.tibco.messaging;


import javax.jms.Connection;
import javax.jms.JMSException;
import javax.jms.Message;
import javax.jms.MessageConsumer;
import javax.jms.MessageListener;
import javax.jms.Queue;
import javax.jms.Session;
import javax.jms.TextMessage;

import org.apache.log4j.LogManager;
import org.apache.log4j.Logger;

import com.google.gson.JsonArray;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;
import com.nodics.tibco.client.PushMessageToNodics;
import com.nodics.tibco.connection.ConnectionFactory;
import com.nodics.tibco.interfaces.TibcoConsumer;

/**
 * @author Himkar Dwivedi
 *
 */
public class TibcoConsumerImpl implements TibcoConsumer, MessageListener {

	private static final Logger logger = LogManager.getLogger(TibcoConsumerImpl.class.getName());


	private ConnectionFactory connectionFactory;
	private String outputQueueName;
	private String evantUrl;
	private String targetModule;
	
	private Connection connection;
	private Session session;
	private Queue outputQueue;

	private MessageConsumer msgConsumer;
		
	public TibcoConsumerImpl(ConnectionFactory connectionFactory,
			String outputQueueName,
			String targetModule,
			String evantUrl) {
		this.connectionFactory = connectionFactory;
		this.outputQueueName = outputQueueName;
		this.evantUrl = evantUrl;
		this.targetModule = targetModule;
		logger.info("Tibco outputQueue: {} : " + outputQueueName);
	}
	
	public void init() throws Exception{
		try {
			connection = this.connectionFactory.createConnection();			
			session = this.connectionFactory.createSession(connection);
			
			if(outputQueueName != null && !outputQueueName.equals("")){
				outputQueue = this.session.createQueue(outputQueueName);			
				msgConsumer = this.session.createConsumer(outputQueue);
				msgConsumer.setMessageListener(this);
			}
			connection.start();
		} catch (Exception exp) {
			logger.error("Error creating connection to tibco: " + exp.getMessage());
			throw exp;
		}
	}
	
	public boolean stopConsumer(){
		try {
			this.msgConsumer.close();
			return true;
		} catch (JMSException exp) {
			logger.error("Error creating closing connection to tibco: " + exp.getMessage());
		}
		return false;
	}
	
	public void onMessage(Message msg) {
		try {
			if (msg instanceof TextMessage) {
				TextMessage txtMsg = (TextMessage) msg;
				logger.info("Received response {} : " + msg);
				Object msgTextObj = txtMsg.getText();
				logger.info("Received response {}" + msgTextObj.toString());
				JsonParser parser = new JsonParser();
				JsonObject response = parser.parse(txtMsg.getText()).getAsJsonObject();
				
				String enterpriseCode = response.get("enterpriseCode").getAsString();
				if(enterpriseCode == null || enterpriseCode.equals("")){
					enterpriseCode = "default";
				}
				JsonObject json = new JsonObject();
				json.addProperty("enterpriseCode", enterpriseCode);
				json.addProperty("event", this.outputQueueName);
				json.addProperty("source", "tibcoMessageConsumed");
				json.addProperty("target", this.targetModule);
				json.addProperty("state", "NEW");
				json.addProperty("type", "ASYNC");
				
				JsonArray array = new JsonArray();
				JsonObject item = new JsonObject();
				item.addProperty("key", "message");
				item.addProperty("value", msgTextObj.toString());
				array.add(item);
				
				json.add("params", array);
				
				PushMessageToNodics.push(this.evantUrl, json);
			}

		} catch (Exception exp) {
			logger.error("Failed to read response" + exp.getMessage());
		}

	}
}
