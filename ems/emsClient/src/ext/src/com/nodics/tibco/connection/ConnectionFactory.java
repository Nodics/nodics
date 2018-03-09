package com.nodics.tibco.connection;

import javax.jms.Connection;
import javax.jms.JMSException;
import javax.jms.Session;

import org.apache.log4j.LogManager;
import org.apache.log4j.Logger;

import com.tibco.tibjms.TibjmsConnectionFactory;

/**
 * @author Java Honk
 *
 */
public class ConnectionFactory {

	private static final Logger logger = LogManager.getLogger(ConnectionFactory.class.getName());

	private String userName;
	private String userPassword;
	private TibjmsConnectionFactory factory;

	public ConnectionFactory(String userName, String userPassword, TibjmsConnectionFactory factory) {
		this.userName = userName;
		this.userPassword = userPassword;
		this.factory = factory;

	}

	public Connection createConnection() throws Exception {

		Connection connection = null;

		try {
			connection = factory.createConnection(this.userName, this.userPassword);
		} catch (Exception exp) {
			logger.error("Failed to create connection" + exp.getMessage());
			throw exp;
		}

		return connection;
	}

	public Session createSession(Connection connection) throws Exception {
		Session session = null;

		try {
			session = connection.createSession(false, javax.jms.Session.AUTO_ACKNOWLEDGE);
		} catch (Exception exp) {
			logger.error("Failed to create session", exp);
			throw exp;
		}

		return session;

	}
}
