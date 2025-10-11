package jp.co.monocrea.resources;

import java.net.URI;
import java.util.List;

import jakarta.transaction.Transactional;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import jakarta.validation.Valid;

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
        UserAccount userAccount = UserAccount.findById(id);
        if (userAccount == null) {
            throw new NotFoundException();
        }
        return UserMapper.toView(userAccount);
    }

    @GET
    @Path("/by-userid/{userId}")
    public UserViewDTO getByUserId(@PathParam("userId") String userId) {
        UserAccount userAccount = UserAccount.findByUserId(userId)
            .orElseThrow(NotFoundException::new);
        return UserMapper.toView(userAccount);
    }

    @POST
    @Transactional
    public Response create(@Valid UserDataDTO userDataDTO) {
        if (UserAccount.findByUserId(userDataDTO.getUserID()).isPresent()) {
            throw new ClientErrorException("userID already exists", 409);
        }
        UserAccount userAccount = UserMapper.toEntity(userDataDTO);
        userAccount.persist();
        return Response.created(URI.create("/users/" + userAccount.id))
                .entity(UserMapper.toView(userAccount))
                .build();
    }

    @PUT
    @Path("/{id}")
    @Transactional
    public UserViewDTO update(@PathParam("id") Long id, UserDataDTO userDataDTO) {
        UserAccount userAccount = UserAccount.findById(id);
        if (userAccount == null) {
            throw new NotFoundException();
        }

        if (userDataDTO.getUserID() != null && !userDataDTO.getUserID().equals(userAccount.userId)) {
            if (UserAccount.findByUserId(userDataDTO.getUserID()).isPresent()) {
                throw new ClientErrorException("userID already exists", 409);
            }
            userAccount.userId = userDataDTO.getUserID();
        }
        UserMapper.applyUpdate(userAccount, userDataDTO);
        return UserMapper.toView(userAccount);
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
