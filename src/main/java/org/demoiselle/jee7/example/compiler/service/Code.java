package org.demoiselle.jee7.example.compiler.service;

import java.util.List;


public class Code {
 
 private String code;
 private String engine;
 
 private String scriptName;
 private List<Params> params;
 
public String getCode() {
	return code;
}

public void setCode(String code) {
	this.code = code;
}

public String getEngine() {
	return engine;
}

public void setEngine(String engine) {
	this.engine = engine;
}

public String getScriptName() {
	return scriptName;
}

public void setScriptName(String scriptName) {
	this.scriptName = scriptName;
}

public List<Params> getParams() {
	return params;
}

public void setParamns(List<Params> params) {
	this.params = params;
}


}
