package jp.co.monocrea;

import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;

/**
 * <h1>GreetingResource</h1>
 * 
 * <h2>作成日</h2>
 * 2025年9月27日
 * 
 */
@Path("/mono")
public class GreetingResource {

    @GET
    @Produces(MediaType.TEXT_PLAIN)
    public String hello() {
        return "Hello from Quarkus REST";
    }
}
