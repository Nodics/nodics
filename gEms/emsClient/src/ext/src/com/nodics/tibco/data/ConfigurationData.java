package com.nodics.tibco.data;

import java.util.ArrayList;

public class ConfigurationData {

	private String tibcoURL;

	public String getTibcoURL() {
		return this.tibcoURL;
	}

	public void setTibcoURL(String tibcoURL) {
		this.tibcoURL = tibcoURL;
	}

	private String username;

	public String getUsername() {
		return this.username;
	}

	public void setUsername(String username) {
		this.username = username;
	}

	private String password;

	public String getPassword() {
		return this.password;
	}

	public void setPassword(String password) {
		this.password = password;
	}

	private ArrayList<QueueData> queues;

	public ArrayList<QueueData> getQueues() {
		return this.queues;
	}

	public void setQueues(ArrayList<QueueData> queues) {
		this.queues = queues;
	}
}
