package com.nodics.tibco.data;

public class QueueData {
	private String messageType;

	public String getMessageType() {
		return this.messageType;
	}

	public void setMessageType(String messageType) {
		this.messageType = messageType;
	}

	private String inputQueue;

	public String getInputQueue() {
		return this.inputQueue;
	}

	public void setInputQueue(String inputQueue) {
		this.inputQueue = inputQueue;
	}

	private String outputQueue;

	public String getOutputQueue() {
		return this.outputQueue;
	}

	public void setOutputQueue(String outputQueue) {
		this.outputQueue = outputQueue;
	}
}
