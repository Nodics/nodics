package com.nodics.tibco;

import java.util.HashMap;
import java.util.Map;

import org.apache.log4j.LogManager;
import org.apache.log4j.Logger;

import com.google.gson.Gson;
import com.nodics.tibco.connection.ConnectionFactory;
import com.nodics.tibco.data.ConfigurationData;
import com.nodics.tibco.data.QueueData;
import com.nodics.tibco.interfaces.TibcoConsumer;
import com.nodics.tibco.interfaces.TibcoPublisher;
import com.nodics.tibco.messaging.TibcoConsumerImpl;
import com.nodics.tibco.messaging.TibcoPublisherImpl;
import com.tibco.tibjms.TibjmsConnectionFactory;

public class ApplicationLauncher {

	private static final Logger logger = LogManager.getLogger(TibcoConsumerImpl.class.getName());
	
	Map<String, TibcoPublisher> publisherPool;
	Map<String, TibcoConsumer> consumerPool;

	public Map<String, TibcoPublisher> getPublisherPool() {
		return publisherPool;
	}

	public void setPublisherPool(Map<String, TibcoPublisher> publisherPool) {
		this.publisherPool = publisherPool;
	}

	public Map<String, TibcoConsumer> getConsumerPool() {
		return consumerPool;
	}

	public void setConsumerPool(Map<String, TibcoConsumer> consumerPool) {
		this.consumerPool = consumerPool;
	}

	public ApplicationLauncher() {
		publisherPool = new HashMap<String, TibcoPublisher>();
		consumerPool = new HashMap<String, TibcoConsumer>();
	}

	public void init(String jsonStr) {
		Gson gson = new Gson();
		ConfigurationData configurationData = gson.fromJson(jsonStr, ConfigurationData.class);
		TibjmsConnectionFactory tibjmsConnectionFactory = new TibjmsConnectionFactory(configurationData.getTibcoURL());
		ConnectionFactory connectionFactory = new ConnectionFactory(configurationData.getUsername(),
				configurationData.getPassword(), tibjmsConnectionFactory);
		
		for (QueueData queueData : configurationData.getQueues()) {
			if(queueData.getInputQueue() != null && !queueData.getInputQueue().equals("")){
				TibcoPublisher publisher = new TibcoPublisherImpl(connectionFactory, queueData.getMessageType(), queueData.getInputQueue());
				try {
					publisher.init();
				} catch (Exception e) {
					// TODO Auto-generated catch block
					e.printStackTrace();
				}
				this.publisherPool.put(queueData.getInputQueue(), publisher);
			}
			
			if(queueData.getOutputQueue() != null && !queueData.getOutputQueue().equals("")){
				TibcoConsumer tibcoConsumer = new TibcoConsumerImpl(connectionFactory, 
						queueData.getOutputQueue(), 
						"http://localhost:3000/nodics/emsClient/consume", null);
				try {
					tibcoConsumer.init();
				} catch (Exception e) {
					// TODO Auto-generated catch block
					e.printStackTrace();
				}
				this.consumerPool.put(queueData.getOutputQueue(), tibcoConsumer);
			}
		}
	}
	
	public String publish(String queueName, String message){
		if(this.publisherPool != null){
			TibcoPublisher publisher = this.publisherPool.get(queueName);
			if(publisher != null){
				try{
					publisher.publish(message);
					return "success";
				}catch(Exception exp){
					logger.error("Exception while publishing in queue : "+queueName, exp);
					return exp.toString();
				}
			}
		}
		return "Something went wrong";
	}
}
