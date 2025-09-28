package jp.co.monocrea.resources;

import java.net.URI;
import java.util.List;

import jakarta.transaction.Transactional;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

import jp.co.monocrea.dto.UserDataDTO;
import jp.co.monocrea.dto.UserViewDTO;
import jp.co.monocrea.entity.UserAccount;
import jp.co.monocrea.mapper.UserMapper;

@Path("/users")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class UserResource {
    @GET
    public List<UserViewDTO> list() {
        return UserAccount.<UserAccount>listAll().stream().map(UserMapper::toView).toList();
    }

    @POST
    @Path("/{id}")
    public UserViewDTO getById(@PathParam("id") Long id) {
        UserAccount e = UserAccount.findById(id);
        if (e == null) {
            throw new NotFoundException();
        }
        return UserMapper.toView(e);
    }

    @GET
    @Path("/by-userid/{userId}")
    public UserViewDTO getByUserId(@PathParam("userId") String userId) {
        UserAccount e = UserAccount.findByUserId(userId)
            .orElseThrow(NotFoundException::new);
        return UserMapper.toView(e);
    }

    @POST
    @Transactional
    public Response create(UserDataDTO dto) {
        if (UserAccount.findByUserId(dto.getUserID()).isPresent()) {
            throw new ClientErrorException("userID already exists", 409);
        }
        UserAccount e = UserMapper.toEntity(dto);
        e.persist();
        return Response.created(URI.create("/users/" + e.id))
            .entity(UserMapper.toView(e))
            .build();
    }

    @PUT
    @Path("/{id}")
    @Transactional
    public UserViewDTO update(@PathParam("id") Long id, UserDataDTO dto) {
        UserAccount e = UserAccount.findById(id);
        if (e == null) {
            throw new NotFoundException();
        }

        if (dto.getUserID() != null && !dto.getUserID().equals(e.userId)) {
            if (UserAccount.findByUserId(dto.getUserID()).isPresent()) {
                throw new ClientErrorException("userID already exists", 409);
            }
            e.userId = dto.getUserID();
        }
        UserMapper.applyUpdate(e, dto);
        return UserMapper.toView(e);
    }

    @DELETE
    @Path("/{id}")
    @Transactional
    public void delete(@PathParam("id") Long id) {
        if (!UserAccount.deleteById(id)) {
            throw new NotFoundException();
        }
    }
}
