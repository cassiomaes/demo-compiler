package org.demoiselle.jee7.example.compiler.service;

import java.util.List;

import javax.enterprise.context.RequestScoped;
import javax.inject.Inject;
import javax.script.ScriptException;
import javax.transaction.Transactional;
import javax.validation.Valid;
import javax.ws.rs.Consumes;
import javax.ws.rs.DELETE;
import javax.ws.rs.GET;
import javax.ws.rs.POST;
import javax.ws.rs.PUT;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
import javax.ws.rs.core.UriInfo;

import org.demoiselle.jee.core.api.crud.Result;
import org.demoiselle.jee.persistence.crud.AbstractBusiness;
import org.demoiselle.jee.persistence.crud.AbstractREST;
import org.demoiselle.jee.rest.annotation.ValidatePayload;
import org.demoiselle.jee.security.annotation.RequiredRole;
import org.demoiselle.jee7.example.compiler.business.CompilerBC;

import io.swagger.annotations.Api;

@Api("Compiler")
@Path("compiler")
@Consumes({ MediaType.APPLICATION_JSON })
@Produces({ MediaType.APPLICATION_JSON })
@RequestScoped
public class CompilerREST {

	@Inject CompilerBC bc;
		
	@POST
	@Path("compile")
	public Response compile(  @Valid  Code source) throws ScriptException {			
		
		//java.lang.System.exit(1);
		bc.compile(source.getEngine(),source.getCode());				
		return Response.ok().entity("{ \"msg\": \"Compilation success!\" }").build();
	}
	
	@POST
	@Path("load")
	public Response load(Code source) throws ScriptException {	
		bc.load(source.getEngine(), source.getScriptName(), source.getCode() );				
		return Response.ok().entity("{ \"msg\": \"Script " + source.getScriptName() + " added to " +  source.getEngine() + " engine ScriptCache.\"}").build();
	}
	
	@POST
	@Path("run")
	public Response run(Code source) throws ScriptException {
		Object re =null;
		
		
		List<Params> teste = source.getParams();
		
		if(source.getScriptName()!=null)
			re = bc.runCache(source.getEngine(),source.getScriptName(),source.getParams());
		else
		    re = bc.run(source.getEngine(),source.getCode(),source.getParams());
		
		return Response.ok().entity("{ \"msg\": \"result:" + re.toString() + "\"}").build();
	}
	
	@GET
	@Path("engineList")
	public Response engineList() throws ScriptException {							
		return Response.ok().entity(bc.engineList()).build();
	}
	
	@GET
	@Path("/scriptList/{id}")
	public Response scriptList(@PathParam(value = "id") String id) throws ScriptException {
		return Response.ok().entity(bc.scriptList(id)).build();
	}
	
	@POST
	@Path("/removeScript")
	public Response removeScript(Code source) throws ScriptException {
		bc.removeScript(source.getEngine(), source.getScriptName());	
		return Response.ok().entity("{ \"msg\": \"Script " + source.getScriptName() + " removed from " +  source.getEngine() + " engine ScriptCache.\"}").build();

	}
}