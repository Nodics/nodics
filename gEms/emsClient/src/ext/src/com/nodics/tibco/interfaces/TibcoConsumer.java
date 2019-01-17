package com.nodics.tibco.interfaces;

import javax.jms.Message;

/**
 * @author Himkar Dwivedi
 *
 */
public interface TibcoConsumer {
	public void onMessage(Message msg);
	public void init() throws Exception;
}
