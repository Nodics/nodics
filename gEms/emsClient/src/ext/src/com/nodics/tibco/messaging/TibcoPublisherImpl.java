package com.nodics.tibco.messaging;


import javax.jms.Connection;
import javax.jms.JMSException;
import javax.jms.MessageProducer;
import javax.jms.Queue;
import javax.jms.Session;
import javax.jms.TextMessage;

import org.apache.log4j.LogManager;
import org.apache.log4j.Logger;

import com.nodics.tibco.connection.ConnectionFactory;
import com.nodics.tibco.interfaces.TibcoPublisher;

/**
 * @author Himkar Dwivedi
 *
 */
public class TibcoPublisherImpl implements TibcoPublisher {

	private static final Logger logger = LogManager.getLogger(TibcoPublisherImpl.class.getName());


	private ConnectionFactory connectionFactory;
	private String msgType;
	private String inputQueueName;
	
	private Connection connection;
	private Session session;
	private MessageProducer msgProducer;
		
	public TibcoPublisherImpl(ConnectionFactory connectionFactory,
			String msgType, 
			String inputQueueName) {
		this.connectionFactory = connectionFactory;
		this.msgType = msgType;
		this.inputQueueName = inputQueueName;
		
		logger.info("Tibco inputQueue: {} : " + inputQueueName);
		logger.info("Tibco msgType: {} : " + msgType);
	}

	public void init() throws Exception{
		try {
			connection = this.connectionFactory.createConnection();			
			session = this.connectionFactory.createSession(connection);
			if(inputQueueName != null && !inputQueueName.equals("")){
				Queue inputQueue = session.createQueue(inputQueueName);
				msgProducer = session.createProducer(inputQueue);
			}
			connection.start();
		} catch (Exception exp) {
			logger.error("Error creating connection to tibco: " + exp.getMessage());
			throw exp;
		}
	}
	
	public boolean stopPublisher(){
		try {
			this.msgProducer.close();
			return true;
		} catch (JMSException exp) {
			logger.error("Error while closing connection to tibco: " + exp.getMessage());
		}
		return false;
	}
	
	public void publish(String values) throws Exception  {
		try {
			TextMessage msg = session.createTextMessage(values);
			msg.setJMSType(this.msgType);

			logger.info("Sending Trade {} : " + values);
			msgProducer.send(msg);
		} catch (Exception ex) {
			throw ex;
		}
		
	}
}
