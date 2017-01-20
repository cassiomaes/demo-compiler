package org.demoiselle.jee7.example.compiler.business;

import java.util.List;
import java.util.Set;

import javax.inject.Inject;
import javax.script.ScriptException;
import javax.script.SimpleBindings;

import org.demoiselle.jee.script.DynamicManager;
import org.demoiselle.jee7.example.compiler.service.Params;

public class CompilerBC {

	@Inject
	private DynamicManager dm;
	 
	public void compile(String engineName, String source) throws ScriptException {						                		    
    	dm.compile(engineName, source);		  	
	}
	
	public void load(String engineName, String scriptName, String source) throws ScriptException {			
		if(dm.getScript(engineName, scriptName)!= null){
			dm.updateScript(engineName, scriptName, source);
		}
    	dm.loadScript(engineName, scriptName, source);		    	
	}
	
	public List<String> engineList() throws ScriptException {		
		return dm.listEngines();		 	
	}

	public Object run(String engine, String source, List<Params> list) throws ScriptException {	
		SimpleBindings parametros = null;
		if(list != null)		
			if(list.size() > 0 ){
				parametros = new SimpleBindings();
				for (Params p : list ){
					
					if(p.getType().equals("Integer")){
						parametros.put(p.getName(),   Integer.valueOf(p.getValue()));
					}
					if(p.getType().equals("Float")){
						parametros.put(p.getName(),   Float.valueOf(p.getValue()));
					}
					if(p.getType().equals("Double")){
						parametros.put(p.getName(),   Double.valueOf(p.getValue()));
					}
					if(p.getType().equals("String")){
						parametros.put(p.getName(),p.getValue());
					}					
					if(p.getType().equals("Script")){											
						parametros.put(p.getName(), dm.evalSource(engine, p.getValue(), null));
					}					
					if(p.getType().equals("CachedScript")){											
						parametros.put(p.getName(), dm.eval(engine, p.getValue(), null));
					}
					
				}
			}
		return dm.evalSource(engine,  source , parametros);
		
	}

	public  Set<String> scriptList(String engineName) {
		return  dm.listScriptCache(engineName);
	}

	public Object runCache(String engine, String scriptName, List<Params> list) throws ScriptException {
		SimpleBindings parametros = null;
		
		if(list != null)
			if(list.size() > 0 ){
				parametros = new SimpleBindings();
				for (Params p : list ){
				    parametros.put(p.getName(),p.getValue());
				}
			}
		return dm.eval(engine,  scriptName , parametros);
	}

	public void removeScript(String engine, String scriptName) {
		 dm.removeScript(engine, scriptName);
	}
	
	
}
