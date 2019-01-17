package com.nodics.tibco.interfaces;

/**
 * @author Himkar Dwivedi
 *
 */
public interface TibcoPublisher {
	public void publish(String values) throws Exception;
	public void init() throws Exception;
}
